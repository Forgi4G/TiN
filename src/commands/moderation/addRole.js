const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "addrole",
    category: "moderation",
    aliases: ["roleadd", "giverole"],
    description: "Adds a role to a guild/server member.",
    usage: "[command] | [userID / userMention] [roleName]",
    example: `addrole @Username#0001 Moderator`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ listener: message });
        // Gets the guild
        const guild = client.guilds.cache.get(message.guild.id);
        // Gets the member
        let memberTarget = message.mentions.members.first() ||
            await message.guild.members.fetch(args[0])
                .catch(error => {
                    return msgFrame.sendTempDefaultReplyConstr("That member is invalid or is not on the server.");
                });
        let role = args.slice(1).join(" ");
        let getRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === role.toLowerCase());

        message.deletable ? message.delete() : false;

        // Permission check
        // MANAGE_ROLES and ADMINISTRATOR don't mix for some reason
        if (!message.member.hasPermission('MANAGE_ROLES') ||
            message.member.id !== message.guild.member(guild.owner).id ||
            !message.member.hasPermission("ADMINISTRATOR")) {
                return msgFrame.sendTempDefaultReplyConstr("You lack permissions to use this command.");
        }

        if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
            return msgFrame.sendTempDefaultReplyConstr("I don't have permission to assign/manage roles.");
        }

        if (message.member.hasPermission('MANAGE_ROLES') ||
            message.member.id === message.guild.member(guild.owner).id ||
            message.member.hasPermission("ADMINISTRATOR")) {
            if (!args[0]) {
                return msgFrame.sendTempDefaultReplyConstr("Please mention a user or ID.");
            }

            if (!args[1]) {
                return msgFrame.sendTempDefaultReplyConstr("Please specify a role for me to assign.");
            }

            if (!memberTarget) {
                return msgFrame.sendTempDefaultReplyConstr("Could not find that user.");
            }

            if (!getRole) {
                return msgFrame.sendTempDefaultReplyConstr("Could not find that role.");
            }

            if (memberTarget.roles.cache.has(getRole.id)) {
                return msgFrame.sendTempDefaultReplyConstr("That member already has the role.");
            }

            await memberTarget.roles.add(getRole)
                .then(async afterRole => {
                    msgFrame.sendTempMessageConstr(`\`${getRole.name}\` has been successfully given to \`${((await client.users.fetch(memberTarget.id)).username)}#${(await client.users.fetch(memberTarget.id)).discriminator}\` (\`${memberTarget.id}\`)`, 15000);
                })
                .catch(() => {
                    return msgFrame.sendTempDefaultReplyConstr("I cannot give roles higher than the role I currently have or something else went wrong.");
                });
        }
    }
}