import { pektinComposeFirstStart } from "@pektin/client/dist/js/compose/first-start.js";
import recursive from "recursive-readdir";

await pektinComposeFirstStart(recursive);
