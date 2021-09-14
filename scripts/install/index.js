import fs from "fs/promises";
import path from "path";
import * as l from "/pektin-compose/scripts/common/lib.js";
const dir = "/pektin-compose/";

const pektinConfig = JSON.parse(await fs.readFile(path.join(dir, "pektin-config.json")));

// init vault
const vaultTokens = await l.getVaultTokens();
await l.unsealVault(vaultTokens.key);

// create resources on vault
await l.createVaultPolicies(vaultTokens.rootToken);

await l.enableAuthMethod(vaultTokens.rootToken, "approle");
await l.enableAuthMethod(vaultTokens.rootToken, "userpass");

await l.enableSecretEngine(vaultTokens.rootToken, "pektin-kv", { type: "kv", options: { version: 2 } });
await l.enableSecretEngine(vaultTokens.rootToken, "pektin-transit", { type: "transit" });

const { role_id, secret_id } = await l.createAppRole(vaultTokens.rootToken, "v-pektin-api", "v-pektin-api");

// set the pektin config on vault for easy service discovery
await l.updatePektinConfig(vaultTokens.rootToken, pektinConfig);

// init redis access control
const R_PEKTIN_API_PASSWORD = l.randomString();
const R_PEKTIN_SERVER_PASSWORD = l.randomString();
await l.setRedisPasswordHashes([
    ["R_PEKTIN_API_PASSWORD", R_PEKTIN_API_PASSWORD],
    ["R_PEKTIN_SERVER_PASSWORD", R_PEKTIN_SERVER_PASSWORD]
]);

// set the values in the .env file for provisioning them to the containers
await l.envSetValues({ vaultTokens, R_PEKTIN_API_PASSWORD, R_PEKTIN_SERVER_PASSWORD, role_id, secret_id, pektinConfig });
