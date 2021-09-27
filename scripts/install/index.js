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

await l.enableSecretEngine(vaultTokens.rootToken, "pektin-kv", { type: "kv", options: { version: 2 } });
await l.enableSecretEngine(vaultTokens.rootToken, "pektin-transit", { type: "transit" });

const { role_id, secret_id } = await l.createAppRole(vaultTokens.rootToken, "v-pektin-api", "v-pektin-api");

if (pektinConfig.enableUi) {
    // create ui account and access config for it
    const vaultEndpoint = pektinConfig.dev
        ? `http://127.0.0.1:8200`
        : `https://${pektinConfig.vaultSubDomain}.${pektinConfig.domain}`;

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
    await fs.writeFile(path.join(dir, "secrets", "ui-access.json"), JSON.stringify(pektinUiConnectionConfig));
}
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
await l.envSetValues({
    vaultTokens,
    R_PEKTIN_API_PASSWORD,
    R_PEKTIN_SERVER_PASSWORD,
    role_id,
    secret_id,
    pektinConfig
});

if (pektinConfig.buildFromSource) await l.buildFromSource(pektinConfig);

await l.createStartScript(pektinConfig);
await l.createStopScript(pektinConfig);
