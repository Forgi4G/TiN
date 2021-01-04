const { MessageEmbed } = require('discord.js');
const messenger = require('../../local-frameworks/messenger.js');
const APP_NAME = JSON.parse(JSON.stringify((require("../../configuration.json"))))['APP_NAME'];

module.exports = {
    name: "vote",
    category: "info",
    aliases: ["v"],
    description: "Returns the vote link, so users can invite the bot.",
    usage: "[command]",
    example: `vote`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message });
        const voteEmbed = new MessageEmbed()
            .setColor("#7289DA")
            .setDescription(`You can vote for ${APP_NAME} at:\n[Vote 1](https://top.gg/bot/483768001024491521/vote)\n[Vote 2](https://discordbotlist.com/bots/tin/upvote)`);
        return msgFrame.sendMessageConstr(voteEmbed);
    }
}