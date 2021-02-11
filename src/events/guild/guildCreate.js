const { MessageEmbed } = require('discord.js');
const configuration = require("../../configuration.json");

module.exports = {
    name: "guildCreate",
    on: true,
    run: client => {
        client.on("guildCreate", guild => {
            const embed = new MessageEmbed()
                .setColor("#00ccff")
                .setThumbnail(client.user.avatarURL())
                .setTitle(`Thanks for adding ${client.user.username}.`)
                .addField("Introduction", `\`${client.user.username}\`'s bot's default prefix is ${configuration['PREFIX']} \nThe directory of commands can be found using 'help' (with the default prefix). To get help for a specific command, you can do \`help commandName\`\nThis bot's main perks are moderation, cryptocurrency data (Bitcoin, Litecoin, etc.), Discord Version Information, and much more.\nEnjoy using the bot.`)
                .addField("Questions/Support", `Join our [Support Server](https://discord.gg/nJTCzzF)`)
                .addField("Other", `[Invite Me](https://discord.com/api/oauth2/authorize?client_id=483768001024491521&permissions=2147483639&scope=bot)`)
                .setTimestamp();
            try {
                guild.channels.cache.filter(channel => channel.type === 'text').find(channel => channel.name === "general").send(embed).catch(error => {
                    if (error) guild.channels.cache.filter(channel => channel.type === "text").random().send(embed).catch(() => {});
                });
            } catch (e) {
                guild.channels.cache.filter(channel => channel.type === "text").random().send(embed).catch(() => {});
            }
        });
}
}

// module.exports = async (guild) => {
// }
