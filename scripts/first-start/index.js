import fs from "fs/promises";
import path from "path";
//import * as l from "/pektin-compose/scripts/common/lib.js";
import { ExtendedPektinApiClient } from "pektin";

import { config } from "dotenv";
config();
const dir = "/pektin-compose/";

const pektinConfig = JSON.parse(await fs.readFile(path.join(dir, "pektin-config.json")));

const uiCreds = JSON.parse(await fs.readFile(path.join(dir, "secrets", "ui-access.json")));

if (pektinConfig.autoConfigureMainDomain) {
    const pc = new ExtendedPektinApiClient({
        password: uiCreds.password,
        vaultEndpoint: "http://pektin-vault:8200",
        username: uiCreds.username,
        override: {
            pektinApiEndpoint: "http://pektin-api:80"
        }
    });

    await pc.setupMainDomain();
}