/* REQUIRED DEPENDENCIES */
var reload     = require('require-reload');
var superagent = require('superagent');
var moment     = require('moment');
var fs 		   = require('fs');

/* REQUIRED FILES */
var config = reload('../../config.json');

/* LOCAL VARIABLES */
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);

module.exports = {
	desc: 'Displays some useful information about a player.',
	usage: '<username> (or set one with the setrsn command)',
	cooldown: 10,
	aliases: ['meminfo'],
	task(bot, msg, suffix) {
		if (!suffix) {
			fs.readFile('./links.json', (err, data) => {
				if (err) {
					return 'wrong usage';
				} else {
					let links = JSON.parse(data);
					if (links[msg.author.id]) {
						suffix = links[msg.author.id];
						info(suffix);
					} else {
						return 'wrong usage';
					}
				}
			});
		} else {
			info(suffix);
		}

		function info(suffix) {
			superagent.get(`http://services.runescape.com/m=website-data/playerDetails.ws?names=%5B%22${suffix}%22%5D&callback=jQuery000000000000000_0000000000&_=0`)
				.end((error, response) => {
					if (error) {
						logger.warn('Error getting information for a user: ' + (error.status || error.response));
						bot.createMessage(msg.channel.id, 'There was an error while grabbing the information for \'' + suffix + '\'. Please try again later.');
					} else {
						let memberInfo = response.text;
						let startPos = memberInfo.indexOf('[{');
						let endPos = memberInfo.indexOf('}]');
						let jsonString = memberInfo.substring(startPos + 1, endPos + 1);

						memberInfo = JSON.parse(jsonString);

						bot.createMessage(msg.channel.id, {
							embed: {
								url: `https://apps.runescape.com/runemetrics/app/overview/player/${memberInfo.name}`,
								thumbnail: {
									url: `https://secure.runescape.com/m=avatar-rs/${memberInfo.name}/chat.png`,
								},
								author: {
									name: memberInfo.name,
									icon_url: `https://secure.runescape.com/m=avatar-rs/${memberInfo.name}/chat.png`
								},
								fields: [
									{ name: 'Clan', value: (memberInfo.clan ? `${memberInfo.clan}` : 'No Clan'), inline: true },
									{ name: 'Title', value: (memberInfo.title ? `${memberInfo.title}` : 'No Title'), inline: true }
								],
								footer: {
									text: `${moment(msg.timestamp).format('ddd MMM do, YYYY [at] h:mm A')}`
								}
							}
						});
					}
				});
		}
	}
}
