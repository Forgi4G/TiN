const { MessageEmbed } = require('discord.js');

const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "rename",
    category: "guild",
    aliases: ["relabel"],
    description: "Command that consists of subcommands that lets you rename the server and/or the channel you executed the command in.",
    usage: "[command] [type] [args]",
    example: `rename server New Name`,
    run: async (client, message, args) => {
        if (message.deletable) { message.delete(); }

        const msgFrame = new messenger({ client: client, listener: message });

        const guild = client.guilds.cache.get(message.guild.id);
        if (message.member.hasPermission("MANAGE_CHANNELS") || message.member.id === message.guild.member(guild.owner).id) {
            if (!args[0]) {
                return msgFrame.sendTempDefaultMessageConstr(`Please provide a type to rename, the available types are \`server\` (also can be \`guild\`), \`channel\`.`);
            }

            if (args[0]) {
                if (!args[1]) {
                    return msgFrame.sendTempDefaultMessageConstr(`Please provide a new name.`);
                } if (args[1]) {
                    let newType = (args[0] === 'channel') ? 'channel' : (args[0] === 'server' || args[0] === 'guild') ? 'guild' : 501;
                    if (newType === 501) {
                        return msgFrame.sendTempDefaultMessageConstr(`Please provide a valid type, the available types are \`server\` (also can be \`guild\`), \`channel\`.`);
                    } else if (newType === 'channel') {
                        let channel = client.guilds.cache.get(message.guild.id).channels.cache.find(channel => channel.id === message.channel.id);
                        let newName = args.slice(1).join(" ");
                        await channel.setName(newName).catch(error => {
                            if (error.code === 50013) {
                                msgFrame.sendTempDefaultMessageConstr("I unable to manage this channel because I lack permissions to do so. Please reconfigure the server's permissions or channel's overrides.");
                            } else {
                                msgFrame.sendTempDefaultMessageConstr("I was unable to complete the action because something went wrong.");
                            }
                        }).then(() => {
                            msgFrame.sendTempDefaultMessageConstr(`The channel has been renamed to \`${newName}\`.`);
                        });

                    } else if (newType === 'guild') {
                        if (message.member.hasPermission("MANAGE_GUILD")) {
                            let newName = args.slice(1).join(" ");
                            let guild = client.guilds.cache.get(message.guild.id);
                            await guild.setName(newName).catch(error => {
                                if (error.code === 50013) {
                                    msgFrame.sendTempDefaultMessageConstr("I unable to manage this server because I lack permissions to do so. Please reconfigure the server's permissions for me to rename the server.");
                                } else {
                                    msgFrame.sendTempDefaultMessageConstr("I was unable to complete the action because something went wrong.");
                                }
                            }).then(() => {
                                msgFrame.sendTempDefaultMessageConstr(`The server / guild was renamed to \`${newName}\`.`);
                            });
                        }
                    }

                }
            }
        } else if (!message.member.hasPermission("MANAGE_CHANNELS") || message.member.id !== message.guild.member(guild.owner).id || !message.member.hasPermission("MANAGE_GUILD")) {
            return msgFrame.sendTempDefaultMessageConstr(`Users who have the sufficient permissions on the guild / server can only use this command to rename their corresponding objects.`);
        }
    }
}