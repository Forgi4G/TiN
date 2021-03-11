const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "removerole",
    category: "moderation",
    aliases: ["roleremove", "revokerole"],
    description: "Removes a role from a guild/server member.",
    usage: "[command] [userID / userMention] [roleName]",
    example: `removerole @Username#0001 Moderator`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message });

        const guild = client.guilds.cache.get(message.guild.id);
        // Gets the member
        let memberTarget = message.mentions.members.first() ||
            await message.guild.members.fetch(args[0])
                .catch(() => {
                    return msgFrame.sendTempDefaultReplyConstr("That member is invalid or is not on the server.");
                });
        let role = args.slice(1).join(" ");
        let getRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === role.toLowerCase());
        message.deletable ? message.delete() : false;


        // Permission check
        if (!message.member.hasPermission('MANAGE_ROLES') ||
            message.member.id !== message.guild.member(guild.owner).id ||
            !message.member.hasPermission("ADMINISTRATOR")) {
            return msgFrame.sendTempDefaultReplyConstr("You lack permissions to use this command.");
        }

        if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
            return msgFrame.sendTempDefaultReplyConstr("I don't have permission to assign/remove roles.");
        }

        if (message.member.hasPermission('MANAGE_ROLES') ||
            message.member.id === message.guild.member(guild.owner).id ||
            message.member.hasPermission("ADMINISTRATOR")) {
            if (!args[0]) {
                return msgFrame.sendTempDefaultReplyConstr("Please mention a user or ID.");
            }

            if (!args[1]) {
                return msgFrame.sendTempDefaultReplyConstr("Please specify a role for me to remove.");
            }

            if (!memberTarget) {
                return msgFrame.sendTempDefaultReplyConstr("Could not find that user.");
            }

            if (!getRole) {
                return msgFrame.sendTempDefaultReplyConstr("Could not find that role.");
            }

            if (!memberTarget.roles.cache.has(getRole.id)) {
                return msgFrame.sendTempDefaultReplyConstr("That member doesn't have the role you were looking for.");
            }

            await memberTarget.roles.remove(getRole)
                .then(async () => {
                    msgFrame.sendTempMessageConstr(`\`${getRole.name}\` has been successfully removed from \`${((await client.users.fetch(memberTarget.id)).username)}#${(await client.users.fetch(memberTarget.id)).discriminator}\` (\`${memberTarget.id}\`)`, 1000 * 15);
                })
                .catch(() => {
                    return msgFrame.sendTempDefaultReplyConstr("I cannot removes roles higher than the role I currently have or something else went wrong.");
                });
        }
    }
}