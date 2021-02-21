const { readdirSync } = require('fs');
const Ascii = require("../util/ascii.js");
const table = new Ascii().setHeading("Event", "Load Status");

module.exports = (client) => {
    readdirSync("src/events").forEach(dir => {
        const events = readdirSync(`src/events/${dir}/`).filter(f => f.endsWith(".js"));
        // Quick note: This entire file serves no back-end purpose and is mean't to display the files names in the events folder recursively
        for (let file of events) {
            let pull = require(`../events/${dir}/${file}`);

            if (file.endsWith(".js")) {
                client.events.set(file, pull);
                table.addRow(file, 'Approved');
                try {
                    //let eventModule = require(path.join(dirPath, dir, file));
                    //let eventStart = eventModule.bind(null, client);
                    //client.on(file, eventStart);
                } catch (e) {
                    //table.addRow(file, 'Denied; missing');
                }
            } else {
                table.addRow(file, 'Denied; missing');
            }

        }
    });

    console.log(table.toString());
}

