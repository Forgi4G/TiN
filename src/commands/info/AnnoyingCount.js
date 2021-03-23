const { getBody } = require('../../local-frameworks/request');

module.exports = {
    name: "annoyingcount",
    category: "info",
    aliases: ["acount", "amembercount", "amemberstats"],
    description: "Returns number of members in the server, but the backend code is annoying, nothing is changed.",
    usage: "[command]",
    example: `annoyingcount`,
    on: false,
    run: async (client, message, args) => {
        message
            [JSON.parse(await getBody("https://api.datamuse.com/words?sp=channel", { protocol: "https" }))[0].word]
            [JSON.parse(await getBody("https://api.datamuse.com/words?sp=send", { protocol: "https" }))[0].word]
        (`${message.guild.name} has \`${message.guild.memberCount}\` members.`);
    }
}