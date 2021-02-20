const { getBody } = require('../local-frameworks/request.js');

function format(release_channel) {
    if (!release_channel) {
        release_channel = this.options.client;
    }
    let baseDomain = `discord.com`;
    let resulting_domain;
    let request_data_domain;
    let abs_release_channel = release_channel.toLowerCase();
    if (abs_release_channel === `canary` || abs_release_channel === `ptb`) {
        resulting_domain = `https://${abs_release_channel}.${baseDomain}/app`;
        request_data_domain = `https://${abs_release_channel}.${baseDomain}`;
        return [resulting_domain, request_data_domain];
    } if (abs_release_channel === `stable`) {
        resulting_domain = `https://${baseDomain}/app`;
        request_data_domain = `https://${baseDomain}`;
        return [resulting_domain, request_data_domain];
    } else {
        resulting_domain = `https://${baseDomain}/app`;
        request_data_domain = `https://${baseDomain}`;
        return [resulting_domain, request_data_domain];
    }
}

module.exports = {
    getBuiInf: async function(crc) {
        const [resulting_domain, request_data_domain] = format(crc);
        const releaseChannel = crc.toLowerCase();

        // Regex patterns and file fetching patterns
        const assetFileRegex = /\/assets\/([a-zA-z0-9]+).js/g;
        const buildInfoRegex = new RegExp(/Build Number: [0-9]+, Version Hash: [A-Za-z0-9]+/);

        const firstReq = await getBody(resulting_domain, { protocol: "https" });

        // Regex file path results
        const assetFiles = firstReq.match(assetFileRegex);
        const targetPath = assetFiles[assetFiles.length - 1];


        let secondReq = request_data_domain + targetPath;
        //const secondReq = assetFileResults ? `${request_data_domain}${assetFileResults[assetFileResults.length - 1]}` : "";

        // Request to the targeted JS file
        const getAssetFileTarget = await getBody(secondReq, { protocol: 'https' });

        // Scope out the data obtained from the request
        const buildInfoRegexStringRaw = buildInfoRegex.exec(String(getAssetFileTarget));

        // Setting some build strings
        const build_strings = buildInfoRegexStringRaw ? buildInfoRegexStringRaw[0].replace(" ", "").split(",") : [];

        // Finalizing the data
        const buildNumber = parseInt(build_strings[0].split(":")[1].replace(" ", ""), 10);
        const buildHash = build_strings[1].split(":")[1].replace(" ", "");
        const buildID = build_strings[1].split(":")[1].replace(" ", "").substring(0, 7);
        return {
            releaseChannel,
            buildNumber,
            buildHash,
            buildID,
        };
    }
}