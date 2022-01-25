import { checkConfig } from "@pektin/config";

await checkConfig(
    "/pektin-compose/pektin-config.json",
    "node_modules/@pektin/config/pektin-config.schema.yml"
);
