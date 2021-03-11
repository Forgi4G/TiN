const messenger = require('../../local-frameworks/messenger.js');
const { getBody } = require('../../local-frameworks/request.js');
const { capitalizeFirstChar } = require('../../util/parseStrings.js');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const months = require('../../data/dates.json').months;

module.exports = {
    name: "incident",
    category: "discord status",
    aliases: ["latestincident", "newincident", "linci"],
    description: "Gets the latest incident on Discord's status.",
    usage: "[incident]",
    example: `incident`,
    run: async(client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message, throwaway: args } );
        let status_data = String(await getBody("https://discordstatus.com/index.json", { protocol: "https" }));
        let latest = (JSON.parse(status_data))['incidents'][0];

        // Dates and timestamps
        let incident_dates = {
            "Created At": latest['created_at'],
            "Updated At": latest['updated_at'],
            "Monitoring At": latest['monitoring_at'],
            "Resolved At": latest['resolved_at']
        }

        // Images and assets
        let attachmentFile = 'img/stable_ptb_icon1.png';
        let attachmentName = 'stable_ptb_icon1.png';
        let attachmentCD = 'attachment://' + attachmentName;
        let icon = new MessageAttachment(attachmentFile, attachmentName);

        const incidentEmbed = new MessageEmbed()
            .setTitle(`${latest.name}`)
            .setDescription(`Status: **${capitalizeFirstChar(latest.status)}** — ${latest['incident_updates'][0].body}`)
            .attachFiles([icon])
            .setAuthor('Discord Status', attachmentCD, `${JSON.parse(status_data)['page'].url}`)
            .setColor(statusColor(latest.status))
            .addField(`Short-link`, `${latest['shortlink']}`, false)
            .setFooter(JSON.parse(status_data).status.description)
            .setTimestamp()
            for (let i in incident_dates) {
                let creation_data = new Date(incident_dates[i]);
                let AM_or_PM;
                if (creation_data.getHours() >= 12 && creation_data.getHours() < 24) {
                    AM_or_PM = "PM"
                } else if (creation_data.getHours() < 12 && creation_data.getHours() > 0) {
                    AM_or_PM = "AM"
                }
                let minutes;
                if (Math.abs(creation_data.getMinutes()) < 10) {
                    minutes = "0" + String(creation_data.getMinutes());
                } else {
                    minutes = Math.abs(creation_data.getMinutes());
                }

                let parsed_date = `${Math.abs(creation_data.getHours() % 12)}:${minutes} ${AM_or_PM} on ${months[creation_data.getUTCMonth() + 1]} ${creation_data.getDate()}, ${creation_data.getUTCFullYear()}`;
                incidentEmbed.addField(i, parsed_date, true);
            }
        return msgFrame.sendMessageConstr(incidentEmbed);
    }
}

const statusColor = function(status) {
    return status === "resolved" ? "#43b581" : status === "unresolved" ? "#f26522" : "#99aab5";
}