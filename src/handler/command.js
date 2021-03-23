const { readdirSync } = require('fs');
const Ascii = require("../util/ascii.js");
const table = new Ascii().setHeading("Command", "Load Status");

module.exports = (client) => {
    readdirSync(`src/commands`).forEach(dir => {
        const commands = readdirSync(`src/commands/${dir}/`).filter(f => f.endsWith(".js"));

        for (let file of commands) {
            let pull = require(`../commands/${dir}/${file}`);

            pull.on = pull.on === undefined;

            if (pull.name && pull.on === true) {
                client.commands.set(pull.name, pull);
                table.addRow(file, 'Approved');
            } else {
                table.addRow(file, 'Denied / Missing');
                continue;
            }

            if (pull.aliases && Array.isArray(pull.aliases)) {
                pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
            }
        }
    });

    console.log(table.toString());
}