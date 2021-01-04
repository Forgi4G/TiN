const { MessageEmbed } = require('discord.js');
const math = require('mathjs');

const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "calculate",
    category: "utility",
    aliases: ["calc"],
    description: "Returns a calculated result based on user input, can calculate almost anything.",
    usage: "[command] [expression]",
    run: async (client, message, args) => {
        const msgFrame = new messenger({ listener: message, client: client } );
        if (!args[0]) {
            return msgFrame.sendTempDefaultMessageConstr('Please provide an or calculation / expression.');
        }

        let response;
        try {
            response = math.evaluate(args.join(' '));
        } catch (error) {
            return msgFrame.sendTempDefaultMessageConstr("Please input a valid calculation/expression.");
        }

        const mathEmbed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle('Calculation Results')
            .addField('Input:', `\`\`\`${args.join('')}\`\`\``)
            .addField('Result:', `\`\`\`${response}\`\`\``);
        await msgFrame.sendMessageConstr(mathEmbed);
    }
}