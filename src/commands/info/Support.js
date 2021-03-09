const { MessageEmbed } = require('discord.js');
const messenger = require('../../local-frameworks/messenger.js');
const APP_NAME = JSON.parse(JSON.stringify((require("../../configuration.json"))))['APP_NAME'];

module.exports = {
    name: "support",
    category: "info",
    aliases: ["supportserver", "morehelp", "supporthelp"],
    description: "Sends the support server link upon request.",
    usage: "[command]",
    example: `support`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message, throwaway: args } );
        const voteEmbed = new MessageEmbed()
            .setColor("#7289DA")
            .setDescription(`For questions, comments, concerns, feedback, help, additional inquiries, bug reports for ${APP_NAME}, consider joining our support server [here](https://discord.gg/nJTCzzF).`);
        return msgFrame.sendMessageConstr(voteEmbed);
    }
}