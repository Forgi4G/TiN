const { MessageEmbed } = require("discord.js");
const { getMember, formatDate, getUserID } = require("../../util/functions.js");
const { stripES } = require('../../util/parseStrings.js');

const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "userinfo",
    category: "info",
    aliases: ["who", "user", "info", "whois", "ui"],
    description: "Returns user info for a user inside the server",
    usage: "[command] [userID / userMention]",
    example: `userinfo @Username#0001`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ listener: message });
        let member = getMember(message, args.join(' '));

        client.users.fetch(member ? member.user.id : args[0]).catch(error => {
            if (error) return msgFrame.sendMessageConstr(`That is not a valid user.`);
        });

        let userInfoEmbed = new MessageEmbed()
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL())
            .setTimestamp();

        if (member) {
            // Member roles and join dates
            const joined = formatDate(member.joinedAt);
            const roles = member.roles.cache
                .filter(r => r.id !== message.guild.id)
                .map(r => r).join(", ") || 'none';

            let getJoinDate = getDate(member.joinedAt);
            let joinTime = `${Math.abs(getJoinDate.hours % 12)}:${getJoinDate.minutes} ${getJoinDate.AM_or_PM}`;

            const created = formatDate(member.user.createdAt);

            let getCreatedDate = getDate(member.user.createdAt);
            let createdTime = `${Math.abs(getCreatedDate.hours % 12)}:${getCreatedDate.minutes} ${getCreatedDate.AM_or_PM}`;
            userInfoEmbed
                .setThumbnail(member.user.displayAvatarURL())
                .addField(`Username`, stripES.call(`${member.user.username}#${member.user.discriminator}`), true)
                .addField(`ID`, stripES.call(`${member.user.id}`), true)
                .addField(`Mention`, `<@${member.user.id}>`, true)
                .setColor(member.user.displayHexColor === '#000000' ? '#ffffff' : member.user.displayHexColor)
                .addField(`Account Creation Date`, `${created}\nat ${createdTime}`, true)
                .addField(`Join Date`, `${joined}\nat ${joinTime}`, true)
                .addField(`Nickname`, stripES.call(`${member.displayName === member.user.username ? "None" : member.displayName}`), true)
                .addField(`Roles`, `${roles}`, true)
                .addField(`Bot Account`, `${member.user.bot ? "True" : "False"}`)
            if (member.presence.activities[0]) userInfoEmbed.addField(`Currently playing`, stripES.call(`${member.presence.activities[0].name}`));
            return msgFrame.sendMessageConstr(userInfoEmbed);
        } else if (!member && (await client.users.fetch(getUserID(args[0]))).id) {
            // Get dates and user
            let user = client.users.fetch(getUserID(args[0]));

            let creationDate = formatDate(user.createdAt);
            let createdDate = getDate((await user).createdAt);
            let createdTime = `${Math.abs(createdDate.hours % 12)}:${createdDate.minutes} ${createdDate.AM_or_PM}`;

            userInfoEmbed
                .setThumbnail((await user).displayAvatarURL())
                .addField(`Username`, stripES.call(`${(await user).username}#${(await user).discriminator}`), true)
                .addField(`ID`, stripES.call(`${(await user).id}`), true)
                .addField(`Mention`, `<@${(await user).id}>`, true)
                .setColor('#000000')
                .addField(`Account Creation Date`, `${creationDate}\nat ${createdTime}`, true)
                .addField(`Nickname`, `None`, true)
                .addField(`Note`, `User is not in this server`, true)
                .addField(`Bot Account`, `${(await user).bot ? "True" : "False"}`);
            if ((await user).presence.activities[0]) userInfoEmbed.addField(`Currently playing`, stripES.call(`${(await user).presence.activities[0].name}`));
            return msgFrame.sendMessageConstr(userInfoEmbed);
        } else {
            return msgFrame.sendMessageConstr(`That user does not exist.`);
        }
    }
}

function getDate(arg) {
    let date = new Date(arg);
    let AM_or_PM;
    if (date.getHours() >= 12 && date.getHours() < 24) {
        AM_or_PM = "PM"
    } else if (date.getHours() < 12 && date.getHours() > 0) {
        AM_or_PM = "AM"
    }

    let minutes;
    if (Math.abs(date.getMinutes()) < 10) {
        minutes = "0" + String(date.getMinutes());
    } else {
        minutes = Math.abs(date.getMinutes());
    }

    return {
        hours: date.getHours(),
        minutes,
        AM_or_PM
    }
}