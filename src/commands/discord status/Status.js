const messenger = require('../../local-frameworks/messenger.js');
const { getBody } = require('../../local-frameworks/request.js');
const { capitalizeFirstChar } = require('../../util/parseStrings.js');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
    name: "status",
    category: "discord status",
    aliases: ["dstatus"],
    description: "Gets the latest data on Discord's status.",
    usage: "[status]",
    example: `status`,
    run: async(client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message, throwaway: args } );
        let status_data = String(await getBody("https://discordstatus.com/index.json", { protocol: "https" }));
        let latest = (JSON.parse(status_data));
        let components = latest['components'];

        // Images and assets
        let attachmentFile = 'img/stable_ptb_icon1.png';
        let attachmentName = 'stable_ptb_icon1.png';
        let attachmentCD = 'attachment://' + attachmentName;
        let icon = new MessageAttachment(attachmentFile, attachmentName);

        const statusEmbed = new MessageEmbed()
            .setTitle(`Status Overview`)
            .attachFiles([icon])
            .setAuthor(`${latest['page'].name} Status`, attachmentCD, `${JSON.parse(status_data)['page'].url}`)
            .setColor(statusColor(latest.status))
            .setFooter(JSON.parse(status_data).status.description)
            .setTimestamp();
        for (let i in components) {
            if (components.hasOwnProperty(i))
                statusEmbed.addField(`${capitalizeFirstChar(components[i].name)}`, `${capitalizeFirstChar(components[i].status)}`, true);
        }
        return msgFrame.sendMessageConstr(statusEmbed);
    }
}

const statusColor = function(status) {
    return status === "resolved" ? "#43b581" : status === "unresolved" ? "#f26522" : "#99aab5";
}