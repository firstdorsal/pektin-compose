import { checkConfig } from "@pektin/config";

await checkConfig("/pektin-compose/pektin-config.json", "node_modules/@pektin/config/schema.yml");
