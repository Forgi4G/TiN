const { MessageEmbed } = require("discord.js");
const { getMember, formatDate, getUserID } = require("../../util/functions.js");
const { stripES } = require('../../util/parseStrings.js');

const { FLAGS } = require('../../data/user_flags.json');

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
        if (args[0] && args[1]) {
            message.deletable ? message.delete() : null;
            if (args[0].toLowerCase() === "delete" && args[1]) {
                let regArray;

                try {
                    regArray = (String(args[1]).match(/\d+/g));
                } catch (e) {
                    return msgFrame.sendTempDefaultMessageConstr(`Please enter a valid message ID or link.`);
                }
                if (regArray.length > 1) {
                    let messageData = await getMessage({ channelID: regArray[1], messageID: regArray[2] });
                    if (messageData.code !== 10008 && messageData.code !== 10003) {
                        if ((await message.channel.messages.fetch(messageData.id)).embeds[0].fields[1].value === message.author.id) {
                            (message.channel.messages.fetch(messageData.id)).then(m => m.delete());
                        }
                    } else {
                        return msgFrame.sendTempDefaultMessageConstr(`You cannot delete other users' info messages or the link / ID you provided was invalid.`);
                    }
                } else if (regArray.length === 1) {
                    let messageData = await getMessage( { channelID: message.channel.id, messageID: regArray[regArray.length - 1] });
                    if (messageData.code !== 10008 && messageData.code !== 10003) {
                        if ((await message.channel.messages.fetch(regArray[regArray.length - 1])).embeds[0].fields[1].value === message.author.id) {
                            (message.channel.messages.fetch(regArray[regArray.length - 1])).then(m => m.delete());
                        }
                    } else {
                        return msgFrame.sendTempDefaultMessageConstr(`You cannot delete other users' info messages or the link / ID you provided was invalid.`);
                    }
                }
            }
        }

        if ((await getUser(getUserID(args[0] || member.user.id))).code && !args.slice(1)) {
            return msgFrame.sendTempDefaultMessageConstr(`That is not a valid user.`);
        }

        let userID;
        if (!member && (await getUser(getUserID(args[0] || member.user.id))).code !== 10013) userID = getUserID(args[0]);
        else if (!member && (await getUser(getUserID(args[0]))).code === 10013) {
            return msgFrame.sendTempDefaultMessageConstr(`That is not a valid user.`);
        }

        let userInfoEmbed = new MessageEmbed()
            //.setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL())
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
                .setThumbnail(`${member.user.displayAvatarURL()}?size=1024`)
                .setColor(member.roles.member.guild.roles.cache.map(i => i.color)[1] ? member.roles.member.guild.roles.cache.map(i => i.color)[1] : member.roles.member.guild.roles.cache.map(i => i.color)[0])
                .addField(`Username`, stripES.call(`${member.user.username}#${member.user.discriminator}`), true)
                .addField(`ID`, stripES.call(`${member.user.id}`), true)
                .addField(`Mention`, `<@${member.user.id}>`, true)
                .addField(`Account Creation Date`, `${created}\nat ${createdTime}`, true)
                .addField(`Join Date`, `${joined}\nat ${joinTime}`, true)
                .addField(`Nickname`, stripES.call(`${member.displayName === member.user.username ? "None" : member.displayName}`), true)
                .addField(`Roles`, `${roles}`, true)
                .addField(`Bot Account`, `${member.user.bot ? "True" : "False"}`)
            if ((await member.user).flags.toArray() && (await member.user).flags.toArray().length > 0) {
                let flags = (await member.user).flags.toArray();
                let flagsStr = "";
                for (let i in flags) {
                    if (!FLAGS[flags[i]]) flagsStr += "";
                    else flagsStr += FLAGS[flags[i]] + " ";
                }
                if (flagsStr)
                    userInfoEmbed
                        .addField(`Flags`, `${flagsStr}`)
            }
            if (member.presence.activities[0]) userInfoEmbed.addField(`Currently playing`, stripES.call(`${member.presence.activities[0].name}`));
            return msgFrame.sendMessageConstr(userInfoEmbed);
        } else if (!member && userID) {
            // Get dates and user
            let user = client.users.fetch(userID);

            let creationDate = formatDate((await user).createdAt);
            let createdDate = getDate((await user).createdAt);
            let createdTime = `${Math.abs(createdDate.hours % 12)}:${createdDate.minutes} ${createdDate.AM_or_PM}`;

            userInfoEmbed
                .setThumbnail(`${(await user).displayAvatarURL()}?size=1024`)
                .setColor((await user).id.substring(0, 6))
                .addField(`Username`, stripES.call(`${(await user).username}#${(await user).discriminator}`), true)
                .addField(`ID`, stripES.call(`${(await user).id}`), true)
                .addField(`Mention`, `<@${(await user).id}>`, true)
                .addField(`Account Creation Date`, `${creationDate}\nat ${createdTime}`, true)
                .addField(`Nickname`, `None`, true)
                .addField(`Note`, `User is not in this server`, true)
                .addField(`Bot Account`, `${(await user).bot ? "True" : "False"}`);
            if ((await user).flags.toArray() && (await user).flags.toArray().length > 0) {
                let flags = (await user).flags.toArray();
                let flagsStr = "";
                for (let i in flags) {
                    if (!FLAGS[flags[i]]) flagsStr += "";
                    else flagsStr += FLAGS[flags[i]] + " ";
                }
                if (flagsStr)
                    userInfoEmbed
                        .addField(`Flags`, `${flagsStr}`)
            }
            if ((await user).presence.activities[0]) userInfoEmbed.addField(`Currently playing`, stripES.call(`${(await user).presence.activities[0].name}`));
            return msgFrame.sendMessageConstr(userInfoEmbed);
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

async function getUser(id) {
    let options = {
        hostname: "canary.discord.com",
        path: `/api/v8/users/${id}`,
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`
        },
        method: "GET"
    };
    return new Promise((resolve, reject) => {
        (require('https')).get(options, callback => {
            let body = "";
            callback.on("data", chunk => body += chunk);

            callback.on("end", () => {
                try {
                    let endpointData = JSON.parse(body);
                    resolve(endpointData);
                } catch (e) {
                    let error = {
                        error: e
                    }
                    reject(error);
                }
            });
        });
    });
}

async function getMessage(options = {}) {
    let reqOpts = {
        hostname: "canary.discord.com",
        path: `/api/v8/channels/${options.channelID}/messages/${options.messageID}`,
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`
        },
        method: "GET"
    }

    return new Promise((resolve, reject) => {
        (require('https')).get(reqOpts, callback => {
            let body = "";
            callback.on("data", chunk => body += chunk);
            callback.on("end", () => {
                try {
                    let endpointData = JSON.parse(body);
                    resolve(endpointData);
                } catch (e) {
                    let error = {
                        error: e
                    }
                    reject(error);
                }
            });
        });
    });
}
