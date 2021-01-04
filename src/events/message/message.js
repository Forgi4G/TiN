const prefix = JSON.parse(JSON.stringify((require("../../configuration.json"))))['PREFIX'];

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
                command.run(client, message, args);
            }
        });
    }
}