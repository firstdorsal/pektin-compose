import fs from "fs/promises";
import path from "path";
import * as l from "/pektin-compose/scripts/common/lib.js";

const dir = "/pektin-compose/";

const pektinConfig = JSON.parse(await fs.readFile(path.join(dir, "pektin-config.json")));

// creates secrets directory
await fs.mkdir(path.join(dir, "secrets")).catch(() => {});

// init vault
const vaultTokens = await l.getVaultTokens();
await l.unsealVault(vaultTokens.key);

// create resources on vault
await l.createVaultPolicies(vaultTokens.rootToken);

await l.enableAuthMethod(vaultTokens.rootToken, "approle");
await l.enableAuthMethod(vaultTokens.rootToken, "userpass");

await l.enableSecretEngine(vaultTokens.rootToken, "pektin-kv", {
    type: "kv",
    options: { version: 2 }
});
await l.enableSecretEngine(vaultTokens.rootToken, "pektin-transit", { type: "transit" });

const { role_id, secret_id } = await l.createAppRole(
    vaultTokens.rootToken,
    "v-pektin-api",
    "v-pektin-api"
);

if (pektinConfig.enableUi) {
    // create ui account and access config for it
    let vaultEndpoint = "";
    if (pektinConfig.dev === "local") {
        vaultEndpoint = `http://127.0.0.1:8200`;
    } else if (pektinConfig.dev === "insecure-online") {
        vaultEndpoint = `http://${pektinConfig.insecureDevIp}:8200`;
    } else {
        vaultEndpoint = `https://${pektinConfig.vaultSubDomain}.${pektinConfig.domain}`;
    }

    const pektinUiConnectionConfig = {
        username: `ui-${l.randomString(10)}`,
        password: l.randomString(),
        vaultEndpoint
    };

    await l.enableCors(vaultTokens.rootToken);

    await l.createUserPassAccount(
        vaultTokens.rootToken,
        pektinUiConnectionConfig.username,
        "v-pektin-high-privilege-client",
        pektinUiConnectionConfig.password
    );
    await fs.writeFile(
        path.join(dir, "secrets", "ui-access.json"),
        JSON.stringify(pektinUiConnectionConfig)
    );
}

// create basic auth for recursor
const RECURSOR_USER = l.randomString(20);
const RECURSOR_PASSWORD = l.randomString();
const recursorBasicAuthHashed = l.genBasicAuthHashed(RECURSOR_USER, RECURSOR_PASSWORD);
// set recursor basic auth string on vault
await l.updatePektinKvValue(vaultTokens.rootToken, "recursor-auth", {
    basicAuth: l.genBasicAuthString(RECURSOR_USER, RECURSOR_PASSWORD)
});

// set the pektin config on vault for easy service discovery
await l.updatePektinKvValue(vaultTokens.rootToken, "pektin-config", pektinConfig);

// init redis access control
const R_PEKTIN_API_PASSWORD = l.randomString();
const R_PEKTIN_SERVER_PASSWORD = l.randomString();
const R_PEKTIN_GEWERKSCHAFT_PASSWORD = l.randomString();

const redisPasswords = [
    ["R_PEKTIN_API_PASSWORD", R_PEKTIN_API_PASSWORD],
    ["R_PEKTIN_SERVER_PASSWORD", R_PEKTIN_SERVER_PASSWORD]
];

if (pektinConfig.multiNode) {
    redisPasswords.push(["R_PEKTIN_GEWERKSCHAFT_PASSWORD", R_PEKTIN_GEWERKSCHAFT_PASSWORD]);

    await l.createArbeiterConfig({ R_PEKTIN_GEWERKSCHAFT_PASSWORD, pektinConfig });
    await l.createSwarmScript(pektinConfig);

    await l.chownRecursive(path.join(dir, `arbeiter`), process.env.UID, process.env.GID);
    await l.chown(path.join(dir, `swarm.sh`), process.env.UID, process.env.GID);
}

await l.setRedisPasswordHashes(redisPasswords, pektinConfig);

// set the values in the .env file for provisioning them to the containers
await l.envSetValues({
    vaultTokens,
    R_PEKTIN_API_PASSWORD,
    R_PEKTIN_SERVER_PASSWORD,
    role_id,
    secret_id,
    pektinConfig,
    recursorBasicAuthHashed
});

await l.createStartScript(pektinConfig);
await l.createStopScript(pektinConfig);
await l.createUpdateScript(pektinConfig);

// change ownership of all created files to host user
// also chmod 700 all secrets except for redis ACL
await l.chown(path.join(dir, `start.sh`), process.env.UID, process.env.GID);
await l.chown(path.join(dir, `stop.sh`), process.env.UID, process.env.GID);
await l.chown(path.join(dir, `update.sh`), process.env.UID, process.env.GID);
await l.chownRecursive(path.join(dir, `secrets`), process.env.UID, process.env.GID);
await l.chmod(path.join(dir, `secrets`), `700`);
await l.chmod(path.join(dir, `secrets`, `.env`), `700`);
await l.chmod(path.join(dir, `secrets`, `ui-access.json`), `700`);
