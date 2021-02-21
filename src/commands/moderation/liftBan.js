const { MessageEmbed } = require("discord.js");
const { stripES } = require('../../util/parseStrings.js');

const { promptMessage, getUserID } = require("../../util/functions");

const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "liftban",
    category: "moderation",
    aliases: ["unban", "pardonban"],
    description: "Lifts a ban for a banned user (or un-bans them) based on request.",
    usage: "[command] [userID / userMention] [reason]",
    example: `liftban 12345678912345678 Ban is no longer active`,
    run: async(client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message });

        let guild = client.guilds.cache.get(message.guild.id);

        let reason = "";
        message.deletable ? message.delete() : false;

        if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
            return msgFrame.sendTempDefaultReplyConstr(`I do not have permissions to un-ban members because I lack the \`Ban Members\` permission.`);
        }

        if (message.member.hasPermission("BAN_MEMBERS") || message.member.id === message.guild.member(guild.owner).id) {
            // If no mentions
            if (!args[0]) {
                return msgFrame.sendTempDefaultReplyConstr("Please provide a user to un-ban.");
            }

            // If there is no reason
            if (!args[1]) { reason = "None"; }

            // If there is a reason
            if (args[1]) { reason = args.slice(1).join(" "); }

            // Prevents the invalid form body error
            if (args[1] && args[1].length > 1500) {
                return msgFrame.sendTempDefaultReplyConstr("Reasons can only be up to 1500 characters long.");
            }

            if (args[0]) {
                // Defining the time and prompt emojis
                let [time, validReactions] = [30, ["✅", "❌"]];

                // Parses UserID and verifies if it is valid
                let toLiftBan = getUserID(args[0]);
                if ((await client.users.fetch(toLiftBan)).id.length === 18) {
                    if (toLiftBan === message.author.id) {
                        return msgFrame.sendTempDefaultReplyConstr("You cannot un-ban yourself.");
                    }

                    const banEmbed = new MessageEmbed()
                        .setColor("#ff0000")
                        .setThumbnail((await client.users.fetch(toLiftBan)).displayAvatarURL())
                        .setFooter(message.member.displayName, message.author.displayAvatarURL())
                        .setTimestamp()
                        .setDescription(stripES.call(`**Lifted Ban for User:** ${((await client.users.fetch(toLiftBan)).username)}#${(await client.users.fetch(toLiftBan)).discriminator} (${toLiftBan})
                    **Lifted by:** ${message.member} (${message.member.id})
                    **Reason:** ${reason}`));

                    const promptEmbed = new MessageEmbed()
                        .setTitle("Confirmation:")
                        .setColor("GREEN")
                        .addField(`Notice:`, `This verification becomes invalid after ${time}s.`)
                        .setDescription(`Please confirm that you want to lift the ban for \`${((await client.users.fetch(toLiftBan)).username)}#${(await client.users.fetch(toLiftBan)).discriminator}\` (\`${toLiftBan}\`).`)
                        .setTimestamp();

                    let canceledLiftMessage = `The ban lift for \`${((await client.users.fetch(toLiftBan)).username)}#${(await client.users.fetch(toLiftBan)).discriminator}\` (\`${toLiftBan}\`) was canceled`;

                    await msgFrame.sendMessageConstr(promptEmbed).then(async messageOne => {
                        // Gets the resulting reaction
                        const reaction = await promptMessage(messageOne, message.author, time, validReactions);

                        // If the ban was approved
                        if (reaction === "✅") {
                            if (messageOne.deletable) { messageOne.delete(); }
                            await message.guild.members.unban(await client.users.fetch(toLiftBan), reason).then(() => {
                                return msgFrame.sendTempMessageConstr(banEmbed, 10 * 1000);
                            }).catch(error => {
                                if (error.code === 50013) {
                                    return msgFrame.sendTempDefaultReplyConstr("I do not have permission to un-ban this user because I lack permissions to do so.");
                                }
                            });
                        }
                        // If it was canceled
                        else if (reaction === "❌") {
                            if (messageOne.deletable) { messageOne.delete(); }
                            return msgFrame.sendTempDefaultReplyConstr(canceledLiftMessage + ".");
                        } else if (messageOne.reactions.cache.size === 2 && reaction === undefined) {
                            if (messageOne.deletable) { messageOne.delete(); }
                            return msgFrame.sendTempDefaultReplyConstr(`${canceledLiftMessage} due to a ${time} second timeout.`);
                        }

                        else if (reaction === (require('discord.js')).Constants.APIErrors.MISSING_PERMISSIONS) {
                            const yOrN = {
                                "resp": ["yes", "no"]
                            }
                            const filter = response => {
                                return yOrN['resp'].some(res => res.toLowerCase() === response.content.toLowerCase());
                            };
                            const alternateBanEmbed = new MessageEmbed()
                                .setDescription(`I could not the add reactions to the prompt, please state \`Yes\` or \`No\` if you would like to proceed with the ban lift.`);
                            msgFrame.sendMessageConstr(alternateBanEmbed)
                                .then(liftEmbedMSG => { messageOne.channel.awaitMessages(filter, { max: 1, time: time * 1000 })
                                    .then(async collected => {
                                        let contentYorN = collected;
                                        if (collected.first()) {
                                            contentYorN = collected.first().content.toLowerCase();
                                            switch (contentYorN) {
                                                case 'yes':
                                                    if (messageOne.deletable) { messageOne.delete(); }
                                                    let userToLiftBan = await client.users.fetch(toLiftBan);
                                                    (message.guild.members.unban(userToLiftBan, reason)).then(() => {
                                                        return msgFrame.sendTempMessageConstr(banEmbed, 10 * 1000);
                                                    }).catch(error => {
                                                        if (error.code === 50013) {
                                                            return msgFrame.sendTempDefaultReplyConstr("I do not have permission to un-ban this user because I lack permissions to do so.");
                                                        } else {
                                                            return msgFrame.sendTempDefaultReplyConstr("Something went wrong...");
                                                        }
                                                    });
                                                    break;
                                                case 'no':
                                                    if (messageOne.deletable) { messageOne.delete(); }
                                                    if (liftEmbedMSG.deletable) { liftEmbedMSG.delete(); }
                                                    if (collected.first().deletable) { await collected.first().delete(); }
                                                    return msgFrame.sendTempDefaultReplyConstr(canceledLiftMessage + ".");
                                                case undefined:
                                                    if (messageOne.deletable) { messageOne.delete(); }
                                                    if (liftEmbedMSG.deletable) { liftEmbedMSG.delete(); }
                                                    return msgFrame.sendTempDefaultReplyConstr(`${canceledLiftMessage} due to a ${time} second timeout.`);
                                            }
                                        }
                                    })
                                    .catch(collected => {
                                        if (messageOne) { if (messageOne.deletable) { return messageOne.delete({ timeout: time * 1000 }); } }
                                        if (liftEmbedMSG) { if (liftEmbedMSG.deletable) { return liftEmbedMSG.delete({ timeout: time * 1000 }); } }
                                        if (collected) { if (collected.deletable) { return collected.delete({ timeout: time * 1000 }); } }
                                        return msgFrame.sendTempDefaultReplyConstr(`${canceledLiftMessage} due to something that went wrong.`);
                                    });

                                    if (liftEmbedMSG) { if (liftEmbedMSG.deletable) { return liftEmbedMSG.delete({ timeout: time * 1000 }); } }
                                });
                        }

                        if (messageOne) { if (messageOne.deletable) { return messageOne.delete({ timeout: time * 1000 }).catch(() => 0); } }
                    })
                }
            }
        } else if (!message.member.hasPermission("BAN_MEMBERS") || message.member.id !== message.guild.member(guild.owner).id) {
            return msgFrame.sendTempDefaultReplyConstr(`You do not have permissions to un-ban members because you lack the \`Ban Members\` permission.`);
        }
    }
}