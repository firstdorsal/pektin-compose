import * as l from "/pektin-compose/scripts/common/lib.js";
import { config } from "dotenv";
config({ path: "/pektin-compose/secrets/.env" });

await l.unsealVault(process.env.V_KEY);
