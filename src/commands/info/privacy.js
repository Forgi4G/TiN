const { MessageEmbed } = require("discord.js");
const APP_NAME = JSON.parse(JSON.stringify((require("../../configuration.json"))))['APP_NAME'];
const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "privacy",
    category: "info",
    aliases: ["privacypolicy"],
    description: `Information about how this bot collects and handles data. Users have the right to know what data ${APP_NAME} collects and uses.`,
    usage: "[command]",
    example: `privacy`,
    run: (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message } );
        const embed = new MessageEmbed()
            .setColor('#8800ff')
            .setTitle(`${APP_NAME}'s Privacy Policy`)
            //.setThumbnail(client.user.displayAvatarURL())
            .setDescription(`Our privacy policy is located [here](https://github.com/Forgi4G/TiN/blob/master/POLICY.md)`)
            .addField('Other', `[Invite Me](https://discord.com/api/oauth2/authorize?client_id=483768001024491521&permissions=2147483639&scope=bot) \n[Support Server](https://discord.gg/nJTCzzF)`);

        msgFrame.sendMessageConstr(embed);
    }
}
