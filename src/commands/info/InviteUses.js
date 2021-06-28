const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "inviteuses",
    category: "info",
    aliases: ["invu", "invuses"],
    description: "Gets number of uses of the first invite",
    usage: "[command]",
    example: `inviteuses`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message, throwaway: args } );
        message.guild.fetchInvites().then(invites => {
            const uses = invites.array().map(i => i.uses)[0];
            return msgFrame.sendMessageConstr(`The most used invite has \`${uses}\` uses.`);
        });
    }
};
