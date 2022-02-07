import { unsealVault } from "@pektin/client/dist/js/vault/vault.js";
import { config } from "dotenv";
config({ path: "/pektin-compose/secrets/.env" });

await unsealVault("http://pektin-vault", process.env.V_KEY);
