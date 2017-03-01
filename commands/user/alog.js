/* REQUIRED DEPENDENCIES */
var reload     = require('require-reload');
var entities   = require('html-entities').AllHtmlEntities;
var truncate   = require('truncate');
var superagent = require('superagent');
var asciiTable = require('ascii-table');
var fs 		   = require('fs');

/* REQUIRED FILES */
var config = reload('../../config.json');
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);

module.exports = {
	desc: 'Gets the last 5 entries of a user\'s adventurer\'s log.',
	cooldown: 10,
	usage: '<username> (or set one with the setrsn command)',
	aliases: ['log'],
	task(bot, msg, suffix) {
		if (!suffix) {
			fs.readFile('./links.json', (err, data) => {
				if (err) {
					bot.createMessage(msg.channel.id, 'Error opening links file.');
				} else {
					let links = JSON.parse(data);
					if (links[msg.author.id]) {
						suffix = links[msg.author.id];
						alog(suffix);
					} else {
						bot.createMessage(msg.channel.id, 'Use this command with <username> (or set one with the setrsn command)');
					}
				}
			})
		} else {
			alog(suffix);
		}

		function alog(suffix) {
			superagent.get(`http://services.runescape.com/m=adventurers-log/a=13/rssfeed?searchName=${suffix}`).end((error, response) => {
				if (error) {
					logger.warn('Error getting stats for a user: ' + (error.status || error.response));
					bot.createMessage(msg.channel.id, 'There was an error while grabbing the adventurer\'s log for \'' + suffix + '\'. Please try again later.');
				} else {
					let alogBody = response.text;
					let alogText = alogBody.slice(alogBody.indexOf('<item>'), alogBody.indexOf('</channel>'));
					let alogData = alogText.split('</item>');
					let table = new asciiTable();

					table.setTitle(`VIEWING ADVENTURER'S LOG FOR ${suffix.toUpperCase()}`).setHeading('Achievement', 'Date');

					for (let i = 0; i < 15; i++) {
						if (alogData[i] == null) break; // Break out of loop if it doesn't have 15 entires.
						table.addRow(truncate(entities.decode(alogData[i].slice(alogData[i].indexOf('<title>') + 7, alogData[i].indexOf('</title>'))), 40), alogData[i].slice(alogData[i].indexOf('<pubDate>') + 9, alogData[i].indexOf('00:00:00') - 1));
					}

					bot.createMessage(msg.channel.id, '```' + table.toString() + '```');
				}
			});
		}
	}
}
