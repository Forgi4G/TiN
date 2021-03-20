const { Collection } = require('discord.js');
const prefix = JSON.parse(JSON.stringify((require("../../configuration.json"))))['TEST_PREFIX'];

module.exports = {
    name: "message",
    on: true,
    run: client => {
        client.on("message", message => {

            // Checks types
            if (message.author.bot) return;
            if (!message.guild) return;

            // Checks for the prefix
            if (!message.content.startsWith(prefix)) return;

            // If message.member is uncached, cache it.
            if (!message.member) message.member = message.guild.member(message);

            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();

            if (cmd.length === 0) return;

            // Gets the command
            let command = client.commands.get(cmd);
            // Finds by alias
            if (!command) command = client.commands.get(client.aliases.get(cmd));

            // Runs if commands exists
            if (command) {
                const { cooldowns } = client;
                !cooldowns.has(command.name) ? cooldowns.set(command.name, new Collection()) : {};

                const now = Date.now();
                const timestamps = cooldowns.get(command.name);
                //tim.set(message.author.id, now);
                const cooldown_amount = (command.cooldown || 3) * 1000;

                if (timestamps.has(message.author.id)) {
                    const exp = timestamps.get(message.author.id) + cooldown_amount;

                    if (now < exp) {
                        const time_left = (exp - now) / 1000;
                        return message.channel.send(`Please wait ${time_left.toFixed(1)} more seconds before using \`${command.name}\` again.`)
                            .catch(() => {})
                            .then(m => { if (m) m.delete({ timeout: 2000 }) });
                    }
                } else {
                    command.run(client, message, args);
                }
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldown_amount);

            }
        });
    }
}