/* REQUIRED DEPENDENCIES */
var reload     = require('require-reload');
var moment     = require('moment');
var fs         = require('fs');

/* REQUIRED FILES */
var config = reload('../../config.json');

/* LOCAL VARIABLES */
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);

module.exports = {
	desc: 'Links the given username to a Discord account.',
	usage: '<username>',
	cooldown: 10,
	aliases: ['rsn'],
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';

		let id = msg.author.id;
        let name = suffix;

        function readLinks(callback) {
            let links = new Object();

            fs.readFile('./links.json', (err, data) => {
                if (err) {
                    console.log('Reading links file went wrong...');
                    // double check if the file exists, don't overwrite it
                    if (err.code === "ENOENT") {
                        console.error('Links file did not exist yet.');
                        links[id] = name;
                        callback(links);
                    } else {
                        // File does exist?
                        console.error('And the links file did exist.');
                        bot.createMessage(msg.channel.id, 'Error reading the database, try again later.');
                        return;
                    }
                } else {
                    links = JSON.parse(data);
                    links[id] = name;
                    callback(links);
                }
            });
        }

        function writeLinks(links) {
            fs.writeFile('./links.json', JSON.stringify(links), (err) => {
                if (err) {
                    bot.createMessage(msg.channel.id, 'Error writing to database, try again later.');
                } else {
                    bot.createMessage(msg.channel.id, 'Your name ' + name + ' has been linked to your Discord account.');
                }
            });
        }

        readLinks(writeLinks);
	}
}
