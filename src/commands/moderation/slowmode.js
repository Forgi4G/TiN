const messenger = require('../../local-frameworks/messenger.js');

module.exports = {
    name: "slowmode",
    category: "moderation",
    aliases: ["setslowmode", "slow", "slow-mode"],
    description: "Sets a channel on slow-mode given the specified time.",
    usage: `[command] (seconds / minutes / hours)`,
    example: `slowmode 20 minutes`,
    run: async (client, message, args) => {
        const msgFrame = new messenger({ client: client, listener: message });
        if (message.deletable) message.delete;

        if (!message.member.hasPermission("MANAGE_CHANNELS")) {
            return msgFrame.sendTempDefaultReplyConstr("You are missing permissions to use this because you do not have the Manage Channels permission.");
        }

        if (message.member.hasPermission("MANAGE_CHANNELS")) {
            if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) {
                return msgFrame.sendTempDefaultReplyConstr("I do not have the Manage Channels permission so I am unable to execute this.");
            }

            if (!args[0]) {
                return msgFrame.sendTempDefaultReplyConstr("Please specify a time between 1 second to 6 hours.");
            }

            if (args[0] === 'off' || args[0] === '0') {
                if (message.channel.rateLimitPerUser === 0) {
                    msgFrame.sendTempMessageConstr(`\`${message.channel.name}\` already has slow-mode turned off.`);
                } else {
                    await message.channel.setRateLimitPerUser(0);
                    msgFrame.sendTempMessageConstr(`\`${message.channel.name}\` has turned off slow-mode.`);
                }
            }

            if ((isNaN(args[0]) || parseInt(args[0]) < 0) && args[0] !== 'off') {
                return msgFrame.sendTempDefaultReplyConstr("That is not a valid number for the slow-mode time: decimals, fractions, or negative numbers cannot be used.");
            }

            if (args[0] !== 'off') {
                let parsedTime = (args[1] === "s" || args[1] === "seconds") ? args[0] : (args[1] === "m" || args[1] === "minutes") ? args[0] * 60 : (args[1] === "h" || args[1] === "hours") ? args[0] * 60 * 60 : args[0];
                await message.channel.setRateLimitPerUser(parsedTime).catch(error => {
                    if (error.code === 50013) {
                        return msgFrame.sendTempDefaultReplyConstr("I was unable to set the slow-mode to your specified time. This is likely because I cannot manage this channel or I was revoked permissions.");
                    } if (error.code === 50035) {
                        return msgFrame.sendTempDefaultReplyConstr("You can only have up to 6 hours (21600 seconds / 360 minutes) of slow-mode time maximum.");
                    }
                });
            }
        }
    }
}