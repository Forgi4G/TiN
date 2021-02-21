const { MessageEmbed } = require('discord.js');
const messenger = require('../../local-frameworks/messenger.js');
const [months, days] = [require('../../data/dates.json').months, require('../../data/dates.json').days];

module.exports = {
    name: "serverinfo",
    category: "info",
    aliases: ["serverinformation", "server", "guild", "guildinfo", "si"],
    description: "Returns information about the server you are in.",
    usage: "[command]",
    example: `serverinfo`,
    run: async (client, message, args) => {
        let millisecondDate = new Date(message.guild.createdTimestamp);
        let AM_or_PM;
        if (millisecondDate.getHours() >= 12 && millisecondDate.getHours() < 24) {
            AM_or_PM = "PM"
        } else if (millisecondDate.getHours() < 12 && millisecondDate.getHours() > 0) {
            AM_or_PM = "AM"
        }

        let minutes;
        if (Math.abs(millisecondDate.getMinutes()) < 10) {
            minutes = "0" + String(millisecondDate.getMinutes());
        } else {
            minutes = Math.abs(millisecondDate.getMinutes());
        }

        const msgFrame = new messenger({ client: client, listener: message, throwaway: args } );
        const filterLevels = {
            DISABLED: 'Off',
            MEMBERS_WITHOUT_ROLES: 'Members with no role',
            ALL_MEMBERS: 'Everyone'
        };

        const verificationLevels = {
            NONE: 'None',
            LOW: 'Low',
            MEDIUM: 'Medium',
            HIGH: 'High',
            VERY_HIGH: 'Very High'
        }
        const regions = {
            brazil: 'Brazil',
            europe: 'Europe',
            hongkong: 'Hong Kong',
            india: 'India',
            japan: 'Japan',
            russia: 'Russia',
            singapore: 'Singapore',
            southafrica: 'South Africa',
            sydney: 'Sydney',
            'us-central': 'US Central',
            'us-east': 'US East',
            'us-west': 'US West',
            'us-south': 'US South'
        };

        const roles = message.guild.roles.cache.sort((x, y) => y.position - x.position).map(role => role.toString());
        const members = message.guild.members.cache;
        const channels = message.guild.channels.cache;
        const emojis = message.guild.emojis.cache;
        const guildOwner = (await client.users.fetch(message.guild.ownerID));

        const serverEmbed = new MessageEmbed()
            .setTitle(`Info and Statistics for ${message.guild.name}`)
            .setColor('#03befc')
            .setThumbnail(message.guild.iconURL({dynamic: true}))
            .addField(`General:`, [
                `**Name:** ${message.guild.name}`,
                `**ID:** ${message.guild.id}`,
                `**Owner:** ${guildOwner.username}#${guildOwner.discriminator} (${message.guild.ownerID})`,
                `**Region:** ${regions[message.guild.region]}`,
                `**Boost Tier:** ${message.guild.premiumTier ? `Tier: ${message.guild.premiumTier}`: 'None'}`,
                `**Filter Status:** ${filterLevels[message.guild.explicitContentFilter]}`,
                `**Verification Status:** ${verificationLevels[message.guild.verificationLevel]}`,
                `**Date Created:** ${Math.abs(millisecondDate.getHours() % 12)}:${minutes} ${AM_or_PM} on ${months[millisecondDate.getUTCMonth() + 1]} ${millisecondDate.getDate()} (${days[millisecondDate.getDay()]}), ${millisecondDate.getUTCFullYear()}, ${new Date().getUTCFullYear() - millisecondDate.getUTCFullYear()} years ago`,
                '\u200b'
            ])
            .addField(`Statistics:`, [
                `**Role Count:** ${roles.length}`,
                `**Emoji Count:** ${emojis.size}`,
                `**Regular Emoji Count:** ${emojis.filter(emoji => !emoji.animated).size}`,
                `**Animated Emoji Count:** ${emojis.filter(emoji => emoji.animated).size}`,
                `**Member Count:** ${message.guild.memberCount}`,
                `**Regular Users:** ${members.filter(member => !member.user.bot).size}`,
                `**Bot-Users:** ${members.filter(member => member.user.bot).size}`,
                `**Text Channel Count:** ${channels.filter(channel => channel.type === 'text').size}`,
                `**Voice Channel Count:** ${channels.filter(channel => channel.type === 'voice').size}`,
                `**Boost Count:** ${message.guild.premiumSubscriptionCount || '0'}`,
                '\u200b'
            ])
            .addField(`General User Presence:`, [
                `**Online:** ${members.filter(member => member.presence.status === 'online').size}`,
                `**Idle:** ${members.filter(member => member.presence.status === 'idle').size}`,
                `**Do Not Disturb:** ${members.filter(member => member.presence.status === 'dnd').size}`,
                `**Offline:** ${members.filter(member => member.presence.status === 'offline').size}`
            ])
            .setFooter(`Guild Statistics`)
            .setTimestamp();
        await msgFrame.sendMessageConstr(serverEmbed);
    }
}