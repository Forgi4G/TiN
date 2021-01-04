const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "count",
    category: "info",
    aliases: ["membercount", "members", "memberstats"],
    description: "Returns number of members in the server.",
    usage: "[command]",
    example: `count`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ listener: message });
        msgFrame.sendMessageConstr(`${message.guild.name} has \`${message.guild.memberCount}\` members.`);
    }
}