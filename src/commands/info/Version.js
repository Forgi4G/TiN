const { MessageEmbed } = require('discord.js');
const messenger = require('../../local-frameworks/messenger.js');
const configuration = JSON.parse(JSON.stringify((require("../../configuration.json"))));

module.exports = {
    name: "version",
    category: "info",
    aliases: ["v", "versioninfo"],
    description: `Info about \`${configuration['APP_NAME']}\`'s version and build.`,
    usage: "[command]",
    example: `version`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message, throwaway: args });
        const versionEmbed = new MessageEmbed()
            .setThumbnail(client.user.displayAvatarURL())
            .setTitle(`Version Info - ${configuration['VERSION']}`)
            .setColor("#00c3ff")
            .addField("Build Info:", `${configuration['BUILD_TYPE']}`)
            .setFooter(`Written in JavaScript`)
        await msgFrame.sendMessageConstr(versionEmbed);
    }
}