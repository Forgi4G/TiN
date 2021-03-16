// Requiring some modules
const { Client, Collection } = require('discord.js');
const client = new Client({disableMentions: "all"});
const fs = require('fs');
require('dotenv').config()

// Using the Collection from the library
client.commands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Collection();
client.categories = fs.readdirSync(`./src/commands`);
client.events = new Collection();

// Command handler
["command"].forEach(handler => {
    require(`./src/handler/${handler}`)(client);
});

// Event listing
["eventListDisplay"].forEach(handler => {
    require(`./src/handler/${handler}`)(client);
});

// Event handler
require('./src/handler/event.js')(client);

// Custom logger for the terminal
const Logger = require('./src/util/Logger');
Logger.toString();

// Memory Usage checks every 12 hours
function memoryUsagePrint() {
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Memory Usage: ${Math.round(memoryUsage * 100) / 100} MB`);
}
memoryUsagePrint();
setInterval(memoryUsagePrint, 1000 * 60 * 60 * 12, {});

// CPU Usage checks every 12 hours
function CPUUsagePrint() {
    const CPUUsage = process.cpuUsage();
    console.log(`CPU User Usage: ${CPUUsage.user} ------------- CPU System Usage: ${CPUUsage.system}`);
}
CPUUsagePrint();
setInterval(CPUUsagePrint, 1000 * 60 * 60 * 12, {});

client.login(process.env.TOKEN).catch(error => console.log(error));