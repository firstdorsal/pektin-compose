import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import f from "node-fetch";
import { exit } from "process";

const dir = "/pektin-compose/";
const vaultUrl = "http://pektin-vault:8200";

const error = error => {
    console.error(error);
    exit(1);
};

const createAppRole = async (vaultToken, name, policies) => {
    // create role
    await f(path.join(vaultUrl, "/v1/auth/approle/role/", name), {
        method: "POST",
        headers: {
            "X-Vault-Token": vaultToken
        },
        body: JSON.stringify({ policies })
    });
    // get role id
    const roleIdRes = await await f(path.join(vaultUrl, "/v1/auth/approle/role/", name, "role-id"), {
        headers: {
            "X-Vault-Token": vaultToken
        }
    });
    const roleIdParsed = await roleIdRes.json();
    // get secret
    const secretIdRes = await f(path.join(vaultUrl, "/v1/auth/approle/role/", name, "secret-id"), {
        method: "POST",
        headers: {
            "X-Vault-Token": vaultToken
        }
    });
    const secretIdParsed = await secretIdRes.json();

    return { role_id: roleIdParsed.data.role_id, secret_id: secretIdParsed.data.secret_id };
};

const enableAuthMethod = async (vaultToken, type) => {
    const vaultRes = await f(path.join(vaultUrl, "/v1/sys/auth", type), {
        method: "POST",
        headers: {
            "X-Vault-Token": vaultToken
        },
        body: JSON.stringify({ type })
    });
    return vaultRes.status === 204;
};

const createVaultPolicies = async vaultToken => {
    return await Promise.all(
        ["v-pektin-api", "v-pektin-low-privilege-client", "v-pektin-high-privilege-client", "v-pektin-rotate-client"].map(async policyName => {
            const policy = await fs.readFile(path.join(dir, "install/policies", policyName + ".hcl"), { encoding: "UTF-8" });
            return createVaultPolicy(vaultToken, policyName, policy);
        })
    );
};

const createVaultPolicy = async (vaultToken, policyName, policy) => {
    const vaultRes = await f(path.join(vaultUrl, "v1/sys/policies/acl", policyName), {
        method: "PUT",
        headers: {
            "X-Vault-Token": vaultToken
        },
        body: JSON.stringify({ policy, name: policyName })
    });

    return vaultRes.status === 204;
};

const unsealVault = async key => {
    const vaultRes = await f(path.join(vaultUrl, "/v1/sys/unseal"), {
        method: "PUT",
        body: JSON.stringify({ key })
    });
    return await vaultRes.json();
};

const getVaultTokens = async () => {
    const vaultRes = await f(path.join(vaultUrl, "/v1/sys/init"), {
        method: "PUT",
        body: JSON.stringify({ secret_shares: 1, secret_threshold: 1 })
    });
    const vaultTokens = await vaultRes.json();
    if (!vaultTokens || !vaultTokens.keys) error("Error: Vault has already been initialized");
    return { key: vaultTokens.keys[0], rootToken: vaultTokens.root_token };
};

const randomString = () => crypto.randomBytes(100).toString("base64url").replaceAll("=", "");

const envSetValues = async v => {
    let file = await fs.readFile(path.join(dir, "template.env"), { encoding: "UTF-8" });
    const repls = [
        ["V_PEKTIN_API_ROLE_ID", v.role_id],
        ["V_PEKTIN_API_SECRET_ID", v.secret_id],
        ["R_PEKTIN_API_PASSWORD", v.R_PEKTIN_API_PASSWORD],
        ["R_PEKTIN_SERVER_PASSWORD", v.R_PEKTIN_SERVER_PASSWORD],
        ["V_KEY", v.vaultTokens.key],
        ["V_ROOT_TOKEN", v.vaultTokens.rootToken]
    ];
    repls.forEach(repl => {
        file = file.replaceAll(RegExp(`(${repl[0]}=).*$`, "gm"), `$1"${repl[1]}"`);
    });
    await fs.writeFile(path.join(dir, ".env"), file);
};
const setRedisPasswordHashes = async repls => {
    let file = await fs.readFile(path.join(dir, "config", "redis", "users.template.acl"), { encoding: "UTF-8" });

    const hash = a => crypto.createHash("sha256").update(a, "utf8").digest().toString("hex");

    repls.forEach(repl => {
        file = file.replaceAll(RegExp(`${repl[0]}_SHA256$`, "gm"), `${hash(repl[1])}`);
    });
    await fs.writeFile(path.join(dir, "config", "redis", "users.acl"), file);
    crypto.create;
};

const vaultTokens = await getVaultTokens();
await unsealVault(vaultTokens.key);
await createVaultPolicies(vaultTokens.rootToken);
await enableAuthMethod(vaultTokens.rootToken, "approle");
await enableAuthMethod(vaultTokens.rootToken, "userpass");
const { role_id, secret_id } = await createAppRole(vaultTokens.rootToken, "v-pektin-api", "v-pektin-api");

const R_PEKTIN_API_PASSWORD = randomString();
const R_PEKTIN_SERVER_PASSWORD = randomString();
await setRedisPasswordHashes([
    ["R_PEKTIN_API_PASSWORD", R_PEKTIN_API_PASSWORD],
    ["R_PEKTIN_SERVER_PASSWORD", R_PEKTIN_SERVER_PASSWORD]
]);
await envSetValues({ vaultTokens, R_PEKTIN_API_PASSWORD, R_PEKTIN_SERVER_PASSWORD, role_id, secret_id });
