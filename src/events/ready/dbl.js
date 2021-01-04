const DBL = require('dblapi.js');

module.exports = {
    name: "dbl",
    on: false,
    run: (client) => {
        // DBL integration
        const dbl = new DBL(process.env.DBL_TOKEN, [client]);
        client.on("ready", () => {
            function dblPostStats() {
                dbl.postStats(client.guilds.cache.size).then(() => console.log('Stats posted to DBL.'));
            }
            dblPostStats();
            // Posts stats every 30 minutes
            setInterval(dblPostStats, 1800000)
        });
}
}