const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "purge",
    aliases: ["clear", "clearchat", "massdelete", "p", "bulkdelete"],
    category: "moderation",
    description: "Clears/Purges the chat, can only bulk delete messages under 7 days old.",
    usage: "[command] [messageCount]",
    example: `purge 100`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message });
        message.deletable ? message.delete() : false;

        // Checks perms and evaluates after that
        if (message.member.hasPermission("MANAGE_MESSAGES")) {
            if (isNaN(args[0]) || parseInt(args[0]) <= 0) {
                return msgFrame.sendTempDefaultMessageConstr("That isn't a number or nothing was provided; I can't delete 0 messages.");
            }

            if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) {
                msgFrame.sendTempDefaultMessageConstr("I don't have the MANAGE_MESSAGES permission so I can't delete messages.");
            }

            let numMessages;

            if (parseInt(args[0]) > 100) {
                numMessages = 100;
            } else {
                numMessages = parseInt(args[0]);
            }

            try {
                message.channel.bulkDelete(numMessages, true)
                    .then(async afterDeletion => {
                        msgFrame.sendTempDefaultMessageConstr(`\`${afterDeletion.size}\` messages have been deleted.`);
                    })
                    .catch(error => msgFrame.sendTempDefaultMessageConstr(`Something went wrong: ${error}`));
            } catch (error) {
                // console.log(error);
                return msgFrame.sendTempDefaultMessageConstr(`Something went wrong... (This was most likely triggered due to an Unknown Message).`);
            }
        }

        if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return msgFrame.sendTempDefaultReplyConstr("You have insufficient permissions (You don't have the MANAGE_MESSAGES permission).");
        }
    }
}