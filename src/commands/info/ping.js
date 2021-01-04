const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "ping",
    category: "info",
    aliases: ["pingpong"],
    description: "Latency & API ping",
    usage: "[command]",
    example: `ping`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message } );
        const m = await msgFrame.sendMessageConstr("Getting ping.");
        await m.edit(`Latency: ${Math.floor(m.createdAt - message.createdAt)}ms\nAPI Latency: ${Math.round(client.ws.ping)}ms`);
    }
}