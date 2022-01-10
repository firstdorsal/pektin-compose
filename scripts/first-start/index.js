import fs from "fs/promises";
import path from "path";
import { ExtendedPektinApiClient } from "@pektin/client";
import recursive from "recursive-readdir";

const dir = "/pektin-compose/";

const pektinConfig = JSON.parse(await fs.readFile(path.join(dir, "pektin-config.json")));

const uiCreds = JSON.parse(await fs.readFile(path.join(dir, "secrets", "admin-access.json")));

const createSingleScript = async (sourceFolder, scriptDestination, nsConfig) => {
    const dirs = await recursive(sourceFolder);
    const out = [];
    let content = ``;

    if (nsConfig?.createSingleScript?.cloneRepo) {
        content += `git clone https://github.com/pektin-dns/pektin-compose ; cd pektin-compose; `;
    }

    for (let i = 0; i < dirs.length; i++) {
        const basePath = dirs[i];
        const contents = await fs.readFile(basePath, "utf-8");
        const filePath = basePath.replace(sourceFolder, "");

        out.push({
            basePath,
            filePath,
            contents
        });
        content += `mkdir -p ${path.join(".", path.dirname(filePath))};`;

        content += `echo -ne '${contents.replaceAll("\n", "\\n")}' > ${path.join(".", filePath)};`;
    }

    if (nsConfig?.createSingleScript?.root?.installDocker) {
        content += `sudo sh scripts/systems/${nsConfig.createSingleScript.system}/install-docker.sh; `;
    }
    if (nsConfig?.createSingleScript?.root?.disableSystemdResolved) {
        content += `sudo sh scripts/systems/${nsConfig.createSingleScript.system}/disable-systemd-resolved.sh; `;
    }
    if (nsConfig?.createSingleScript?.setup) {
        content += `bash setup.sh; `;
    }
    if (nsConfig?.createSingleScript?.start) {
        content += `bash start.sh; `;
    }
    await fs.writeFile(scriptDestination, content + "history -d $(history 1)");
    return out;
};

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
pektinConfig.nameServers.forEach(async (ns, i) => {
    if (i === 0) return;
    if (ns.createSingleScript && ns.createSingleScript.system) {
        await createSingleScript(
            path.join(dir, "arbeiter", ns.subDomain),
            path.join(dir, "arbeiter", `${ns.subDomain}.sh`),
            ns
        );
    }
});
