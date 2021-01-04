const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const fs = require('fs');

const { promptMessage, getUserID } = require("../../functions");

const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "kick",
    category: "moderation",
    aliases: ["boot", "punt"],
    description: "Kicks a member based on request.",
    usage: "[command] [userID / userMention] [reason]",
    example: `kick @Username#0001 Breaking a rule`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message });

        let reason = "";
        if (message.deletable) { message.delete(); }

        if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
            return msgFrame.sendTempDefaultReplyConstr(`I do not have permissions to ban members because I lack the \`Kick Members\` permission.`);
        }

        if (message.member.hasPermission("KICK_MEMBERS")) {

            // If no mentions
            if (!args[0]) {
                return msgFrame.sendTempDefaultReplyConstr("Please provide a user to kick.");
            }

            // If there is no reason
            if (!args[1]) {
                reason = "None";
            }

            // If there is a reason
            if (args[1]) { reason = args.slice(1).join(" "); }

            // Prevents the invalid form body error
            if (args[1] && args[1].length > 1500) {
                return msgFrame.sendTempDefaultReplyConstr("Reasons can only be up to 1500 characters long.");
            }

            if (args[0]) {
                // Defining the time and prompt emojis
                let [time, validReactions] = [30, ["✅", "❌"]];

                // Parses UserID
                let toKick = getUserID(args[0]);
                if ((await client.users.fetch(toKick)).id.length === 18) {
                    if (toKick === message.author.id) {
                        return msgFrame.sendTempDefaultReplyConstr("You cannot kick yourself.");
                    }

                    const kickEmbed = new MessageEmbed()
                        .setColor("#ff0000")
                        .setThumbnail((await client.users.fetch(toKick)).displayAvatarURL())
                        .setFooter(message.member.displayName, message.author.displayAvatarURL())
                        .setTimestamp()
                        .setDescription(stripIndents`**User Kicked:** ${((await client.users.fetch(toKick)).username)}#${(await client.users.fetch(toKick)).discriminator} (${toKick})
                    **Kicked by:** ${message.member} (${message.member.id})
                    **Reason:** ${reason}`);

                    const promptEmbed = new MessageEmbed()
                        .setTitle("Confirmation:")
                        .setColor("GREEN")
                        .addField(`Notice:`, `This verification becomes invalid after ${time}s.`)
                        .setDescription(`Please confirm that you want to kick \`${((await client.users.fetch(toKick)).username)}#${(await client.users.fetch(toKick)).discriminator}\` (\`${toKick}\`).`)
                        .setTimestamp();

                    let canceledKickMessage = `The kick for \`${((await client.users.fetch(toKick)).username)}#${(await client.users.fetch(toKick)).discriminator}\` (\`${toKick}\`) was canceled`;

                    await msgFrame.sendMessageConstr(promptEmbed).then(async messageOne => {
                        // Gets the resulting reaction
                        const reaction = await promptMessage(messageOne, message.author, time, validReactions);

                        // Defining the user to kick
                        let userToKick = await client.users.fetch(toKick);

                        // If the kick was approved
                        if (reaction === "✅") {
                            if (messageOne.deletable) { messageOne.delete(); }
                            let guildMember = await message.guild.members.fetch(toKick)
                                .catch(error => {
                                    if (error.code === (require('discord.js').Constants.APIErrors.UNKNOWN_MEMBER)) {
                                        return msgFrame.sendTempDefaultReplyConstr("This member is not in this server.");
                                    }
                                });
                            if (guildMember) {
                                guildMember.kick(reason)
                                    .then(result => {
                                        return msgFrame.sendMessageConstr(kickEmbed);
                                    })
                                    .catch(error => {
                                        if (error.code === 50013) {
                                            return msgFrame.sendTempDefaultReplyConstr("I do not have permission to kick this user either because they have a role higher than me or I lack permissions to do so.");
                                        } else if (error.code === (require('discord.js').Constants.APIErrors.UNKNOWN_MEMBER)) {
                                            return msgFrame.sendTempDefaultReplyConstr("This member is not in this server.");
                                        } else { return msgFrame.sendTempDefaultReplyConstr("Something went wrong..."); }
                                    });
                            }
                        }

                        // If it was canceled
                        else if (reaction === "❌") {
                            if (messageOne.deletable) { messageOne.delete(); }
                            return msgFrame.sendTempDefaultReplyConstr(canceledKickMessage + ".");
                        } else if (messageOne.reactions.cache.size === 2 && reaction === undefined) {
                            if (messageOne.deletable) { messageOne.delete(); }
                            return msgFrame.sendTempDefaultReplyConstr(`${canceledKickMessage} due to a ${time} second timeout.`);
                        }

                        else if (reaction === (require('discord.js')).Constants.APIErrors.MISSING_PERMISSIONS) {
                            const yOrN = {
                                "resp": ["yes", "no"]
                            }
                            const filter = response => {
                                return yOrN['resp'].some(res => res.toLowerCase() === response.content.toLowerCase());
                            };
                            const alternateKickEmbed = new MessageEmbed()
                                .setDescription(`I could not the add reactions to the prompt, please state \`Yes\` or \`No\` if you would like to proceed with the kick.`);
                            msgFrame.sendMessageConstr(alternateKickEmbed)
                                .then(kickEmbedMSG => { messageOne.channel.awaitMessages(filter, { max: 1, time: time * 1000 })
                                    .then(async collected => {
                                        let contentYorN = collected;
                                        if (collected.first()) {
                                            contentYorN = collected.first().content.toLowerCase();
                                            switch (contentYorN) {
                                                case 'yes':
                                                    let theGuildMember = await message.guild.members.fetch(toKick)
                                                        .catch(error => {
                                                            if (error.code === (require('discord.js').Constants.APIErrors.UNKNOWN_MEMBER)) {
                                                                return msgFrame.sendTempDefaultReplyConstr("This member is not in this server.");
                                                            }
                                                        });
                                                    if (theGuildMember) {
                                                        theGuildMember.kick(reason)
                                                            .then(result => {
                                                                return msgFrame.sendMessageConstr(kickEmbed);
                                                            })
                                                            .catch(error => {
                                                                if (error.code === 50013) {
                                                                    return msgFrame.sendTempDefaultReplyConstr("I do not have permission to kick this user either because they have a role higher than me or I lack permissions to do so.");
                                                                } else if (error.code === (require('discord.js').Constants.APIErrors.UNKNOWN_MEMBER)) {
                                                                    return msgFrame.sendTempDefaultReplyConstr("This member is not in this server.");
                                                                } else {
                                                                    return msgFrame.sendTempDefaultReplyConstr("Something went wrong...");
                                                                }
                                                            });
                                                    }
                                                    break;
                                                case 'no':
                                                    if (messageOne.deletable) { messageOne.delete(); }
                                                    if (kickEmbedMSG.deletable) { kickEmbedMSG.delete(); }
                                                    if (collected.first().deletable) { await collected.first().delete(); }
                                                    return msgFrame.sendTempDefaultReplyConstr(canceledKickMessage + ".");
                                                case undefined:
                                                    if (messageOne.deletable) { messageOne.delete(); }
                                                    if (kickEmbedMSG.deletable) { kickEmbedMSG.delete(); }
                                                    return msgFrame.sendTempDefaultReplyConstr(`${canceledKickMessage} due to a ${time} second timeout.`);
                                            }
                                        }
                                    })
                                    .catch(collected => {
                                        if (messageOne) { if (messageOne.deletable) { return messageOne.delete({ timeout: time * 1000 }); } }
                                        if (kickEmbedMSG) { if (kickEmbedMSG.deletable) { return kickEmbedMSG.delete({ timeout: time * 1000 }); } }
                                        if (collected) { if (collected.deletable) { return collected.delete({ timeout: time * 1000 }); } }
                                        return msgFrame.sendTempDefaultReplyConstr(`${canceledKickMessage} due to something that went wrong.`);
                                    });

                                    if (kickEmbedMSG) { if (kickEmbedMSG.deletable) { return kickEmbedMSG.delete({ timeout: time * 1000 }); } }
                                });
                        }
                        if (messageOne) { if (messageOne.deletable) { return messageOne.delete({ timeout: time * 1000 }).then(() => msgFrame.sendTempDefaultReplyConstr(`${canceledKickMessage} due to a ${time} second timeout.`)); } }
                    });
                }
            }
        } else if (!message.member.hasPermission("KICK_MEMBERS")) {
            return msgFrame.sendTempDefaultReplyConstr(`You do not have permissions to kick members because you lack the \`Kick Members\` permission.`);
        }
    }
}
