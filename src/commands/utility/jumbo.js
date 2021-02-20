const { MessageEmbed /*, MessageAttachment*/ } = require('discord.js');

const messenger = require('../../local-frameworks/messenger.js');

const { getCallback } = require('../../local-frameworks/request.js');

module.exports = {
    name: "jumbo",
    category: "utility",
    aliases: ["enlargeemoji", "ee", "biggeremoji", "emojilarge", "bigemoji"],
    description: "Returns an enlarged version of a custom emoji upon request.",
    usage: "[command] [target]",
    example: `jumbo <:TiN:749131092866367528>`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ listener: message, client: client });

        if (!args[0]) {
            message.deletable ? message.delete() : false;
            return msgFrame.sendTempDefaultMessageConstr(`Please provide a custom emoji or ID of one.`);
        }

        try {
            if (/<:.+:(\d+)>/.exec(message.content)[1].match(/^\d+$/)) {
                let emojiContent = /<:.+:(\d+)>/.exec(message.content);
                let emojiID = emojiContent[1];
                // const emojiAttachment = new MessageAttachment(`https://cdn.discordapp.com/emojis/`+emojiID+`.png?v=1`, `${emojiID}.png`);
                const emojiEmbed = new MessageEmbed()
                    .setColor("RANDOM")
                    .setImage(`https://cdn.discordapp.com/emojis/`+emojiID+`.png?v=1`)
                    .setFooter(`Requested by ${message.author.username}#${message.author.discriminator}`);
                return msgFrame.sendMessageConstr(emojiEmbed);
                // await message.channel.send({ files: [{
                //         attachment: `https://cdn.discordapp.com/emojis/`+emojiID[1]+`.png?v=1`,
                //     }]
                // });
            }
        } catch (error) {
            if (error.message.match === "Discord APIError") {
                return msgFrame.sendTempDefaultMessageConstr(`This feature only works on custom emojis.`);
            }
        }
        try {
            if(/<:a.+:(\d+)>/.exec(message.content)[1].match(/^\d+$/)) {
                let emojiContent = /<:.+:(\d+)>/.exec(message.content);
                let emojiID = emojiContent[1];
                // const attachment = new MessageAttachment(`https://cdn.discordapp.com/emojis/`+emojiID+`.gif?v=1`);
                const emoji_A_Embed = new MessageEmbed()
                    .setColor("RANDOM")
                    .setImage(`https://cdn.discordapp.com/emojis/`+emojiID+`.gif?v=1`)
                    .setFooter(`Requested by ${message.author.username}#${message.author.discriminator}`);
                return await msgFrame.sendMessageConstr(emoji_A_Embed);
            }
        } catch (error) {
            if (error.message.match === "Discord APIError") {
                return msgFrame.sendTempDefaultMessageConstr(`Something went wrong...`);
            }
        }

        // Regex to check if the emoji was request by ID
        if (args[0].match(/^\d+$/)) {
            let emojiID = args[0];
            // Base embed
            const emojiIDEmbed = new MessageEmbed()
                .setColor("RANDOM")
                .setFooter(`Requested by ${message.author.username}#${message.author.discriminator}`)
            // Gets the status so it can accurately determine if it is a gif or png
            getCallback(`https://cdn.discordapp.com/emojis/${emojiID}.gif`, { protocol: 'https' }).then(callback => {
                if (callback.statusCode === 200) {
                    emojiIDEmbed.setImage(`https://cdn.discordapp.com/emojis/${emojiID}.gif?v=1`);
                    return msgFrame.sendMessageConstr(emojiIDEmbed);
                }
                // 415 means it's an unsupported media type and technically doesn't exist so it will change the extension to png
                if (callback.statusCode === 415) {
                    emojiIDEmbed.setImage(`https://cdn.discordapp.com/emojis/${emojiID}.png?v=1`);
                    return msgFrame.sendMessageConstr(emojiIDEmbed);
                }
            });
                /* garbage */
                //.setImage(`https://cdn.discordapp.com/emojis/${emojiID}.${client.emojis.cache.get(emojiID).animated ? "gif" : "png"}?v=1`)
                //.setImage(`https://cdn.discordapp.com/emojis/${emojiID}.${ ? "gif" : "png"}?v=1`)
        }

    }
}