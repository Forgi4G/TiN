// Use async for new event handler
const { insertCommaIntoNum } = require('../../functions.js');
const configuration = JSON.parse(JSON.stringify((require("../../configuration.json"))));

module.exports = {
        name: "ready",
        on: true,
        run: (client) => {
                client.on('ready', () => {
                        let totalUserCount = 0;
                        /** Guild listing */
                        // client.guilds.cache.forEach(guild => {
                        //         console.log(guild.name + " - " + guild.id + " - " + guild.memberCount);
                        // });
                        client.guilds.cache.forEach(guild => {
                           if (typeof guild.memberCount !== "undefined") {
                                   totalUserCount += guild.memberCount;
                           }
                        });

                        console.log('Cached users: ' + client.users.cache.size);
                        /** Fetching change-logs from the support server */
                        // client.channels.cache.get('####').messages.fetch({ limit: 1}).then(message => {
                        //         console.log(message.first().content);
                        //         client.channels.cache.get('####').send(message.first().content);
                        // });

                        const activities = [
                                `over ${client.guilds.cache.size} servers`,
                                `over ${insertCommaIntoNum(totalUserCount)} users`,
                                `${configuration['PREFIX']}help for commands`
                        ]
                        console.log(`Logged in as ${client.user.tag}`);
                        console.log(`Server count: ${client.guilds.cache.size}`);
                        setInterval(() => {
                                const i = Math.round((Math.random() * (activities.length - 1)) /* + 0 */);
                                client.user.setActivity(activities[i], {type: 'WATCHING'}).catch(error => console.log(error));
                        }, 1000 * 60 * 5);
                });
        }
}
