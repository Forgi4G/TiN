const messenger = require('../../local-frameworks/messenger.js');
const { getUserID } = require('../../util/functions.js');
const https = require('https');

module.exports = {
    name: "purge",
    aliases: ["clear", "clearchat", "massdelete", "p", "bulkdelete"],
    category: "moderation",
    description: "Clears/Purges the chat, can only bulk delete messages under 14 days old.",
    cooldown: 5,
    usage: "[command] [messageCount], [command] [user] [user mention / id] [messageCount]",
    example: `purge 100`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message, channel: message.channel });
        message.deletable ? message.delete() : false;
        let channel = message.channel;

        if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) {
            msgFrame.sendTempDefaultMessageChannelConstr("I don't have the MANAGE_MESSAGES permission so I can't delete messages.");
        }

        // Checks perms and evaluates after that
        if (message.member.hasPermission("MANAGE_MESSAGES")) {
            if (!args[0]) return msgFrame.sendTempDefaultMessageChannelConstr("Please specify whether it's a user or an amount of messages");

            if (args[0].toLowerCase() === "user") {
                if (args[1]) {
                    let userID = getUserID(args[1]);
                    let fetchedUser = await client.users.fetch(userID).catch(error => { if (String(error.code) === "10013") { msgFrame.sendTempDefaultMessageChannelConstr("That user does not exist.") } });
                    if (fetchedUser) {
                        if (args[2]) {
                            let msgAmount;

                            if (isNaN(args[2]) || parseInt(args[2]) <= 0) {
                                console.log(isNaN(args[2]) || parseInt(args[2]) <= 0);
                                return msgFrame.sendTempDefaultMessageChannelConstr("That is not a number or nothing was provided (or I cannot delete 0 messages).");
                            }

                            if (parseInt(args[2]) > 100) {
                                msgAmount = 100;
                            } else {
                                msgAmount = parseInt(args[2]);
                            }

                            channel.messages.fetch({
                                limit: 100,
                            }).then(messages => {
                                if (fetchedUser) {
                                    const filterBy = fetchedUser ? fetchedUser.id : false;
                                    if (filterBy) {
                                        let msgToPurge = messages.filter(m => m.author.id === filterBy).array().slice(0, msgAmount);
                                        return channel.bulkDelete(msgToPurge, true)
                                            .then(async afterDeletion => {
                                                return msgFrame.sendTempDefaultMessageChannelConstr(`\`${afterDeletion.size}\` messages have been deleted.`);
                                            })
                                            .catch(error => {
                                                if (String(error.code) === "10008") return {};
                                                else msgFrame.sendTempDefaultMessageChannelConstr(`Something went wrong: \`${error.code}\``);
                                            });
                                    }
                                }
                            });
                        }
                    }
                } else if (!args[1]) {
                    return msgFrame.sendTempDefaultMessageChannelConstr("Please provide an ID or mention of the user you want to purge.");
                }
            }
            else if (typeof parseInt(args[0]) === 'number') {
                let numMessages;

                if (parseInt(args[0]) > 100) {
                    numMessages = 100;
                } else {
                    numMessages = parseInt(args[0]);
                }

                if (isNaN(args[0]) || parseInt(args[0]) <= 0) {
                    return msgFrame.sendTempDefaultMessageChannelConstr("That is not a number or nothing was provided (or I cannot delete 0 messages).");
                }

                return channel.bulkDelete(numMessages, true).catch(() => {})
                    .then(async afterDeletion => {
                        if (afterDeletion)
                            if (!(await getMessage(message.channel.id, message.id)).code && (await getMessage(message.channel.id, message.id)).code !== 10008) {
                                return msgFrame.sendTempMessageDefaultInst(message, `\`${afterDeletion.size}\` messages have been deleted.`);
                            }
                    })
                    .catch(error => {
                        if (error && error.code === "10008") return {};
                        else msgFrame.sendTempDefaultMessageChannelConstr(`Something went wrong: \`${error.code}\``);
                    });
            }
        }

        if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return msgFrame.sendTempDefaultMessageChannelConstr("You have insufficient permissions (You don't have the MANAGE_MESSAGES permission).");
        }
    }
}

async function getMessage(channelID, messageID) {
    let reqOpts = {
        hostname: "canary.discord.com",
        path: `/api/v8/channels/${channelID}/messages/${messageID}`,
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`
        },
        method: "GET"
    }

    return new Promise((resolve, reject) => {
        https.get(reqOpts, callback => {
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
//