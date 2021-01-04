const { MessageEmbed } = require('discord.js');
const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "about",
    category: "info",
    aliases: ["botinfo"],
    description: "Info about the bot and developer(s)",
    usage: '[command]',
    example: `about`,
    run: (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message } );
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(process.env.APP_NAME + " - " + "General")
            .setAuthor(`About the bot:`)
            .setDescription('A simple bot for moderation and information.')
            .setThumbnail(client.user.displayAvatarURL())
            .addField('Learn More:', `Use the \`help\` command for the command list \nView our policy [here](https://github.com/Forgi4G/TiN/blob/master/POLICY.md) \nGet our version information with the \`version\` command`, true)
            .addField('TiN', '[Invite Me](https://discord.com/api/oauth2/authorize?client_id=483768001024491521&permissions=2147483639&scope=bot) \n[Support Server](https://discord.gg/nJTCzzF) \n[Policy](https://github.com/Forgi4G/TiN/blob/master/POLICY.md)')
            .setTimestamp()
            .setFooter('Written in JavaScript');
        msgFrame.sendMessageConstr(embed);
    }
}
