const { fetchBI } = require('../../util/getBuildInfo.js');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "client",
    category: "discord version info",
    aliases: ['build', 'buildinformation', 'getbuildinformation', 'discordversion'],
    description: `Returns the build number for the provided release channel / client, uses the Stable client by default.`,
    usage: `[client] (client / release channel)`,
    example: `client stable`,
    run: async (client, message, args) => {
        const msgFrame = new messenger( { listener: message } );
        let releaseC = "";
        if(!args[0]) {
            releaseC = 'stable';
        } else if (args[0]) {
            releaseC = args[0].toLowerCase();
        }
        function nameAttachments(releaseC) {
            let attachmentFile = '', attachmentName = '';
            let buildClient = '';
            if (releaseC === 'canary') {
                attachmentFile = 'img/discord_canary_icon1.png';
                attachmentName = 'discord_canary_icon1.png';
                buildClient = releaseC.charAt(0).toUpperCase() + releaseC.substr(1);
                return [buildClient, attachmentFile, attachmentName];
            } if (releaseC === 'stable' || releaseC === 'ptb') {
                attachmentFile = 'img/stable_ptb_icon1.png';
                attachmentName = 'stable_ptb_icon1.png';
                if (releaseC === 'stable') {
                    buildClient = releaseC.charAt(0).toUpperCase() + releaseC.substr(1);
                } else if (releaseC === 'ptb') {
                    buildClient = releaseC.toUpperCase();
                }
                return [buildClient, attachmentFile, attachmentName];
            } else {
                attachmentFile = 'img/stable_ptb_icon1.png';
                attachmentName = 'stable_ptb_icon1.png';
                buildClient = 'Stable';
                return [buildClient, attachmentFile, attachmentName];
            }
        }
        let [buildClient, attachmentFile, attachmentName] = nameAttachments(releaseC);
        let attachmentDir = 'attachment://' + attachmentName;
        let attachment = initializeAttachment(attachmentFile, attachmentName);

        await fetchBI(buildClient).then(data => {
            let cli = JSON.parse(JSON.stringify(data));
            msgFrame.sendMessageConstr(getVersionEmbed(client, buildClient, cli.buildNumber, cli.buildHash, cli.buildID, attachment, attachmentDir));
        });
    }
}

function initializeAttachment(attachment, name) {
    return new MessageAttachment(attachment, name);
}

function getVersionEmbed(client, buildClient, buildNumber, buildHash, buildID, attachment, attachmentDir) {
    const versionEmbed = new MessageEmbed()
        .setTitle(`Discord ${buildClient} Client - Version and Build Info:`)
        .setColor('#ffee00')
        .attachFiles(attachment)
        .setThumbnail(attachmentDir)
        .addField(`Build Number:`, `\`${buildNumber}\``)
        .addField(`Build Hash:`, `\`${buildHash}\``)
        .addField(`Build ID:`, `\`${buildID}\``)
        .setFooter(`${buildClient} Build Info`, client.user.displayAvatarURL())
        .setTimestamp();
    return versionEmbed;
}