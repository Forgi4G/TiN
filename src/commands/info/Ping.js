const messenger = require('../../local-frameworks/messenger.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "ping",
    category: "info",
    aliases: ["pingpong"],
    description: "Latency & API ping",
    usage: "[command]",
    example: `ping`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message, throwaway: args } );
        let pingEmbed = new MessageEmbed()
            .setColor("BLURPLE")
            .addField(`Latency`, `${Math.abs(Date.now() - message.createdTimestamp)}ms`, true)
            .addField(`API Latency`, `${Math.round(client.ws.ping)}ms`, true);
        return msgFrame.sendMessageConstr(pingEmbed);
    }
}