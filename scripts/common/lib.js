import f from "node-fetch";
import { exit } from "process";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
const vaultUrl = "http://pektin-vault:8200";
const dir = "/pektin-compose/";

export const error = error => {
    console.error(error);
    exit(1);
};

export const updatePektinConfig = async (vaultToken, config) => {
    await f(`${vaultUrl}/v1/pektin-kv/metadata/pektin-config`, {
        method: "DELETE",
        headers: {
            "X-Vault-Token": vaultToken
        }
    });
    await f(`${vaultUrl}/v1/pektin-kv/data/pektin-config`, {
        method: "POST",
        headers: {
            "X-Vault-Token": vaultToken
        },
        body: JSON.stringify({
            data: config
        })
    });
};

export const enableCors = async vaultToken => {
    await f(`${vaultUrl}/v1/sys/config/cors`, {
        method: "PUT",
        headers: {
            "X-Vault-Token": vaultToken
        },
        body: JSON.stringify({
            allowed_origins: "*",
            allowed_headers: ["X-Vault-Token"]
        })
    });
};

export const createUserPassAccount = async (vaultToken, name, policies, password) => {
    await f(path.join(vaultUrl, "/v1/auth/userpass/users/", name), {
        method: "POST",
        headers: {
            "X-Vault-Token": vaultToken
        },
        body: JSON.stringify({ policies, password })
    });
};

export const createAppRole = async (vaultToken, name, policies) => {
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

export const enableSecretEngine = async (vaultToken, enginePath, engineOptions) => {
    const vaultRes = await f(path.join(vaultUrl, "/v1/sys/mounts", enginePath), {
        method: "POST",
        headers: {
            "X-Vault-Token": vaultToken
        },
        body: JSON.stringify(engineOptions)
    });
    return vaultRes.status === 204;
};

export const enableAuthMethod = async (vaultToken, type) => {
    const vaultRes = await f(path.join(vaultUrl, "/v1/sys/auth", type), {
        method: "POST",
        headers: {
            "X-Vault-Token": vaultToken
        },
        body: JSON.stringify({ type })
    });
    return vaultRes.status === 204;
};

export const createVaultPolicies = async vaultToken => {
    return await Promise.all(
        ["v-pektin-api", "v-pektin-low-privilege-client", "v-pektin-high-privilege-client", "v-pektin-rotate-client"].map(async policyName => {
            const policy = await fs.readFile(path.join(dir, "scripts/install/policies", policyName + ".hcl"), { encoding: "UTF-8" });
            return createVaultPolicy(vaultToken, policyName, policy);
        })
    );
};

export const createVaultPolicy = async (vaultToken, policyName, policy) => {
    const vaultRes = await f(path.join(vaultUrl, "v1/sys/policies/acl", policyName), {
        method: "PUT",
        headers: {
            "X-Vault-Token": vaultToken
        },
        body: JSON.stringify({ policy, name: policyName })
    });

    return vaultRes.status === 204;
};

export const unsealVault = async key => {
    const vaultRes = await f(path.join(vaultUrl, "/v1/sys/unseal"), {
        method: "PUT",
        body: JSON.stringify({ key })
    });
    return await vaultRes.json();
};

export const getVaultTokens = async () => {
    const vaultRes = await f(path.join(vaultUrl, "/v1/sys/init"), {
        method: "PUT",
        body: JSON.stringify({ secret_shares: 1, secret_threshold: 1 })
    });
    const vaultTokens = await vaultRes.json();
    if (!vaultTokens || !vaultTokens.keys) error("Error: Vault has already been initialized");
    return { key: vaultTokens.keys[0], rootToken: vaultTokens.root_token };
};

export const randomString = (length = 100) => crypto.randomBytes(length).toString("base64url").replaceAll("=", "");

export const envSetValues = async v => {
    const repls = [
        ["V_PEKTIN_API_ROLE_ID", v.role_id],
        ["V_PEKTIN_API_SECRET_ID", v.secret_id],
        ["R_PEKTIN_API_PASSWORD", v.R_PEKTIN_API_PASSWORD],
        ["R_PEKTIN_SERVER_PASSWORD", v.R_PEKTIN_SERVER_PASSWORD],
        ["V_KEY", v.vaultTokens.key],
        ["V_ROOT_TOKEN", v.vaultTokens.rootToken],
        ["DOMAIN", v.pektinConfig.domain],
        ["UI_SUBDOMAIN", v.pektinConfig.uiSubDomain],
        ["API_SUBDOMAIN", v.pektinConfig.apiSubDomain],
        ["VAULT_SUBDOMAIN", v.pektinConfig.vaultSubDomain]
    ];
    let file = "# DO NOT EDIT THESE MANUALLY \n";
    repls.forEach(repl => {
        file = file += `${repl[0]}="${repl[1]}"\n`;
    });
    await fs.writeFile(path.join(dir, ".env"), file);
};
export const setRedisPasswordHashes = async repls => {
    let file = await fs.readFile(path.join(dir, "config", "redis", "users.template.acl"), { encoding: "UTF-8" });

    const hash = a => crypto.createHash("sha256").update(a, "utf8").digest().toString("hex");

    repls.forEach(repl => {
        file = file.replaceAll(RegExp(`${repl[0]}_SHA256$`, "gm"), `${hash(repl[1])}`);
    });
    await fs.writeFile(path.join(dir, "config", "redis", "users.acl"), file);
    crypto.create;
};
