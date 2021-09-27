import * as l from "/pektin-compose/scripts/common/lib.js";
import { config } from "dotenv";
config({ path: "/pektin-compose/pektin-compose/.env" });

await l.unsealVault(process.env.V_KEY);
