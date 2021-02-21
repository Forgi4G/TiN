const { MessageEmbed } = require("discord.js");
const { getMember, formatDate } = require("../../util/functions.js");
const { stripES } = require('../../util/parseStrings.js');

const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "userinfo",
    category: "info",
    aliases: ["who", "user", "info", "whois"],
    description: "Returns user info for a user inside the server",
    usage: "[command] [userID / userMention]",
    example: `userinfo @Username#0001`,
    run: (client, message, args) => {
        const msgFrame = new messenger({ listener: message });
        const member = getMember(message, args.join(" "));

        if (member === undefined) {
            msgFrame.sendTempDefaultReplyConstr("The user you mentioned is either not in the server or doesn't exist.");
        }

        if (member !== undefined) {
            // Member variables
            const joined = formatDate(member.joinedAt);
            const roles = member.roles.cache
                .filter(r => r.id !== message.guild.id)
                .map(r => r).join(", ") || 'none';

            // User variables
            const created = formatDate(member.user.createdAt);

            const embed = new MessageEmbed()
                .setFooter(member.displayName, member.user.displayAvatarURL())
                .setThumbnail(member.user.displayAvatarURL())
                .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)

                .addField('Member information:', stripES.call(`**Display name:** ${member.displayName}
                **Joined at:** ${joined}
                **Roles:** ${roles}`), true)

                .addField('User information:', stripES.call(`**ID:** ${member.user.id}
                **Username**: ${member.user.username}
                **Tag**: ${member.user.tag}
                **Created at**: ${created}`), true)
                .setTimestamp()

            if (member.presence.activity)
              embed.addField('Currently playing', stripES.call(`**> Name:** ${member.presence.activity.name}`));
            msgFrame.sendMessageConstr(embed);
        }
    }
}