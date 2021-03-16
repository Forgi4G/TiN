const { MessageEmbed } = require("discord.js");
const { stripES } = require("../../util/parseStrings.js");
const messenger = require('../../local-frameworks/messenger.js');
const prefix = JSON.parse(JSON.stringify((require("../../configuration.json"))))['PREFIX'];

module.exports = {
    name: "help",
    aliases: ["h"],
    category: "info",
    description: "Returns all commands, or info for one specific command.",
    cooldown: 3,
    usage: "[command] (commandName)",
    example: `help`,
    run: async (client, message, args) => {
        if (args[0]) {
            return getCMD(client, message, args[0]);
        } else {
            return getAll(client, message);
        }
    }
}

    function getAll(client, message) {
        const msgFrame = new messenger({ client: client, listener: message } );
        const embed = new MessageEmbed().setColor("#3bc7e3")

        const commands = (category) => {
            return client.commands
                .filter(cmd => cmd.category === category)
                .map(cmd => `- \`${cmd.name}\``)
                .join("\n");
        }

        // Capitalizes categories
        for (let i = 0; i < client.categories.length; i++) {
            let category = client.categories[i];
            let categorySTR = category.split(" ");
            for (let j = 0; j < categorySTR.length; j++) {
                categorySTR[j] = categorySTR[j][0].toUpperCase() + categorySTR[j].substr(1);
                categorySTR.join(" ");
            }
            //client.categories[i] = categorySTR;
            if (client.categories[i].length > 1) {
                client.categories[i] = categorySTR.join(" ");
            }
        }

        const info = client.categories
            .map(category => stripES.call(`**${category}** \n${commands(category.toLowerCase())}`))
            //.map(category => stripES.call(`**${category[0].toUpperCase() + category.slice(1)}** \n${commands(category)}`))
            .reduce((string, category) => string + "\n" + category);


        embed.setTitle(`Command List:`)
            .addField(`Need More Help?`, '[Invite Me](https://discord.com/api/oauth2/authorize?client_id=483768001024491521&permissions=2147483639&scope=bot) \n[Support Server](https://discord.gg/nJTCzzF)')
        return msgFrame.sendMessageConstr(embed.setDescription(info));
    }

    function getCMD(client, message, input) {
        const msgFrame = new messenger({ client: client, listener: message } );
        const embed = new MessageEmbed()

        const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));

        let info = `No information found for command **${input.toLowerCase()}**, or it does not exist.`;

        if (!cmd) {
            return msgFrame.sendMessageConstr(embed.setColor("RED").setDescription(info));
        }

        if (cmd.name) info = `**Command name**: ${cmd.name}`;
        if (cmd.aliases) info += `\n**Aliases**: ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`;
        if (cmd.description) info += `\n**Description**: ${cmd.description}`;
        if (cmd.usage) {
            info += `\n**Usage**: ${cmd.usage}`;
            embed.setFooter(`Syntax: [] = required, () = optional`);
        }
        if (cmd.example) {
            info += `\n**Example(s)**: ${prefix}${cmd.example}`
        }

        return msgFrame.sendMessageConstr(embed.setColor("GREEN").setDescription(info));
    }
