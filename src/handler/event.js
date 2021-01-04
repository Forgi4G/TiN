const fs = require('fs');

module.exports = (client) => {
    // Really simple way to do event handling, it can only do events inside of a sub-directory
    fs.readdirSync('src/events').forEach(directory => {
        const events = fs.readdirSync(`src/events/${directory}/`).filter(eventFile => eventFile.endsWith(".js"));
        for (let file of events) {
             if (client.events.get(file).on === true) {
                //require(`../events/${directory}/${file}`)(client);
                let event = client.events.get(file);
                event.run(client);
             }
        }
    });
}
