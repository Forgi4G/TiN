module.exports = {
    getMember: function(message, toFind= '') {
        toFind = toFind.toLowerCase();
        try {
            let target = message.guild.members.cache.get(toFind);

            if (!target && message.mentions.members) {
                target = message.mentions.members.first();
            }

            if (!target && toFind) {
                target = message.guild.members.find(member => {
                    return member.displayName.toLowerCase().includes(toFind) ||
                        member.user.tag.toLowerCase().includes(toFind)
                }).catch(error => {
                    return null;
                });
            }

            if (!target) {
                target = message.member;
            }
            return target;
        } catch (e) {
            return undefined;
        }
    },

    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-US').format(date);
    },

    promptMessage: async function(message, author, time, validReactions) {
        time *= 1000;
        let errorCode = 0;
        for (const reaction of validReactions) await message.react(reaction).catch(error => { errorCode = error.code } );
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

        if (errorCode === 50013) { return errorCode; }

        return message
            .awaitReactions(filter, { max: 1, time: time })
            .then(collected => {
                if (collected.first()) {
                    if (collected.first().emoji.name === validReactions[0] || collected.first().emoji.name === validReactions[1]) {
                        return collected.first() && collected.first().emoji.name;
                    }
                } else {
                    return 404;
                }
            });
    },

    standardTimeout: function() {
        return 5000;
    },

    isolateUserID: function(args) {
        let finalUserID;
        if (args.substring(0, 2) === "<@" && args.substring(args.length - 1, args.length) === ">") {
            finalUserID = args.substring(2, args.length - 1);
        }
        if (args.match(/^[-+]?[0-9]+$/) && args.length === 18) {
            finalUserID = args;
        }
        if (args.substring(2, args.length - 1).match(/^[-+]?[0-9]+$/) && args.substring(2, args.length - 1).length === 18) {
            finalUserID = args.substring(2, args.length - 1);
        }
        if (args.substring(0, 3) === "<@!" && args.substring(args.length - 1, args.length) === ">") {
            finalUserID = args.substring(3, args.length - 1);
        }

        return finalUserID;
    },

    getUserID(args) {
        return args.match(/\d+/g).join('');
    },

    sendMessagePermCheck: function(client, message) {
        return message.guild.me.hasPermission("SEND_MESSAGES");
    },

    insertCommaIntoNum: function(args) {
    return args.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    capitalize1stChar: function(str) {
        return str.replace(/\w\S*/g, function(text) {
            return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        });
    }
}