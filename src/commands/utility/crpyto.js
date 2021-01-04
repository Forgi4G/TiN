const { MessageEmbed } = require('discord.js');
const request = require('request');

const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "crypto",
    category: "utility",
    aliases: ["cryptoprice", "getcrypto", "cryptocurrency"],
    description: "Returns the price of a cryptocurrency, can also return the price for other currencies in ISO 3.",
    usage: "[command] [cryptoInISO3] (currencyInISOFormat)",
    example: `bitcoin USD`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ listener: message, client: client });

        let currencyInput, crypto;
        /*
        If someone inputs a currency acronym for example:
            'jpy' => 'JPY';
            'JPY' => 'JPY';
            'jPy' => 'JPY';
        Happens below */
        // Making sure it's upper case only, not like it's a big deal or anything
        if (args[0]) {
            crypto = args[0].toUpperCase();
        }

        if (args[1]) {
            currencyInput = args[1].toUpperCase();
        }

        // Date and time formatting
        const date = new Date();
        const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'numeric', day: '2-digit' });
        const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat .formatToParts(date);
        const timestamp = new Date().toISOString().replace(/^[^:]*([0-2]\d:[0-5]\d).*$/, '$1');

        if (!currencyInput) {
            // Changes to default currency
            currencyInput = 'USD';
        }
        const cryptoURL = `https://min-api.cryptocompare.com/data/price?fsym=${crypto}&tsyms=` + currencyInput;
        request.get(cryptoURL, (error, response, body) => {
            // Parsed BTC data for min-api
            const cryptoData = JSON.parse(body);
            // Final verdict if it's really not found
            if (cryptoData[currencyInput] === undefined || !cryptoData[currencyInput]) {
                return msgFrame.sendTempDefaultMessageConstr("That is not a valid currency or there is no data provided for it.");
            }
            // Embed containing all the good info
            const cryptoEmbed = new MessageEmbed()
                .setTitle(`${crypto} ${currencyInput} Price - ${month}/${day}/${year} at ${timestamp} UTC`)
                .setColor('RANDOM')
                .addField(`Price:`, `${cryptoData[currencyInput].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`)
                .setFooter(`${crypto}`)
                .setTimestamp();
            return msgFrame.sendMessageConstr(cryptoEmbed);
        });
    }
}