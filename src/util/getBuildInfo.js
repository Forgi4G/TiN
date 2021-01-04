const axios = require('axios');

function format(release_channel) {
    if (!release_channel) {
        release_channel = this.options.client;
    }
    let baseDomain = `discord.com`;
    let resulting_domain = baseDomain;
    let request_data_domain = baseDomain;
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
    fetchBI: async function(crc) {
        const [resulting_domain, request_data_domain] = format(crc);
        const releaseChannel = crc.toLowerCase();

        // Regex patterns and file fetching patterns
        const assetFileRegex = /\/assets\/([a-zA-z0-9]+).js/g;
        const buildInfoRegex = new RegExp(/Build Number: [0-9]+, Version Hash: [A-Za-z0-9]+/);

        const getURL = await axios.get(resulting_domain);

        // Regex file path results
        const assetFileResults = getURL.data.match(assetFileRegex);
        const targetPath = assetFileResults[assetFileResults.length - 1];


        let newURL = request_data_domain + targetPath;
        //const newURL = assetFileResults ? `${request_data_domain}${assetFileResults[assetFileResults.length - 1]}` : "";

        // Request to the targeted JS file
        const getAssetFileTarget = await axios.get(newURL);

        // Scope out the data obtained from the request
        const buildInfoRegexStringRaw = buildInfoRegex.exec(getAssetFileTarget.data);

        // Setting some build strings
        const build_strings = buildInfoRegexStringRaw ? buildInfoRegexStringRaw[0].replace(" ", "").split(",") : [];

        // Finalizing the data
        const buildNumber = parseInt(build_strings[0].split(":")[1].replace(" ", ""), 10);
        const buildHash = build_strings[1].split(":")[1].replace(" ", "");
        const buildID = getURL.headers["x-build-id"];
        const buildID2 = build_strings[1].split(":")[1].replace(" ", "").substring(0, 7);
        let final_build_data = {
            releaseChannel,
            buildNumber,
            buildHash,
            buildID,
        };
        return final_build_data;
    }
}