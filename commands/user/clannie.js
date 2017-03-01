/* REQUIRED DEPENDENCIES */
var reload     = require('require-reload');
var moment     = require('moment');
var fs         = require('fs');
var readline   = require('readline');

/* REQUIRED FILES */
var config = reload('../../config.json');

/* LOCAL VARIABLES */
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);
var TOP_RANKS = ['general', 'admin', 'organiser', 'coordinator', 'overseer', 'deputy owner', 'owner']; // these people cant rank up
var EMBED_COLOR = 0xff6666;

module.exports = {
	desc: 'Displays some clan-related information about a player.',
	usage: '<username> (or set one with the setrsn command)',
	cooldown: 10,
	aliases: ['player'],
	task(bot, msg, suffix) {
		if (!suffix) {
			fs.readFile('./links.json', (err, data) => {
				if (err) {
					return 'wrong usage';
				} else {
					let links = JSON.parse(data);
					if (links[msg.author.id]) {
						suffix = links[msg.author.id];
						clannie(suffix);
					} else {
						return 'wrong usage';
					}
				}
			});
		} else {
			clannie(suffix);
		}

		function clannie(suffix) {
	        fs.readFile('./clannies.json', (err, data) => {
	            if (err) {
	                console.log(err);
					bot.createMessage(msg.channel.id, 'Error reading the database, try again later.');
	                return;
	            }

	            let lowerSuffix = suffix.toLowerCase().replace(/[-\s]+/g, '_');
	            let json = JSON.parse(data);
	            var data = json[lowerSuffix];

	            if (typeof data !== 'undefined') {
	                // Create an embed message
	                let embed = {
	                    embed: {
	                        color: EMBED_COLOR,
	                        url: `https://apps.runescape.com/runemetrics/app/overview/player/${lowerSuffix}`,
	                        thumbnail: {
	                            url: `https://secure.runescape.com/m=avatar-rs/${lowerSuffix}/chat.png`,
	                        },
	                        author: {
	                            name: data.name,
	                            icon_url: `https://secure.runescape.com/m=avatar-rs/${lowerSuffix}/chat.png`
	                        },
	                        fields: [
	                            { name: 'Rank', value: (data.rank), inline: true },
	                            { name: 'Clan Points', value: (data.cp), inline: true }
	                        ],
	                        footer: {
	                            text: `${moment(msg.timestamp).format('ddd MMM do, YYYY [at] h:mm A')} / might take a while to update.`
	                        }
	                    }
	                }

	                // Check if the person can still rank up - if so, show them how
	                if (TOP_RANKS.indexOf(data.rank.toLowerCase()) < 0) {
	                    embed.embed.fields.push(
	                        { name: 'Rank up (caps)', value: (data.rankCaps), inline: true },
	                        { name: 'Rank up (xp)', value: (data.rankXp), inline: true }
	                    );
	                }

	                // Add cap status at the end
	                embed.embed.fields.push(
	                    { name: 'Capped this week', value: (data.cap), inline: false }
	                );

	                bot.createMessage(msg.channel.id, embed);
	            } else {
	                bot.createMessage(msg.channel.id, 'Clannie not found! Check your spelling?');
	            }
	        });
		}
	}
}
