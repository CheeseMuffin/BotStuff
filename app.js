/**
 * App
 * Cassius - https://github.com/CheeseMuff/BotStuff
 *
 * This is the main file that starts Cassius.
 *
 * @license MIT license
 */

'use strict';

const fs = require('fs');
const path = require('path');

global.Tools = require('./tools.js');

try {
	require.resolve('./config.js');
} catch (e) {
	if (e.code !== 'MODULE_NOT_FOUND') throw e;
	console.log("Creating a default config file");
	fs.writeFileSync(path.resolve(__dirname, 'config.js'),
		fs.readFileSync(path.resolve(__dirname, 'config-example.js'))
	);
} finally {
	global.Config = require('./config.js');
}
if (!Config.username) throw new Error("Please specify a username in config.js");

let commands = require('./commands.js');
let plugins;
try {
	plugins = fs.readdirSync('./plugins');
} catch (e) {}

if (plugins) {
	for (let i = 0, len = plugins.length; i < len; i++) {
		let file = plugins[i];
		if (!file.endsWith('.js')) continue;
		file = require('./plugins/' + file);
		if (file.name) {
			global[file.name] = file;
			if (typeof global[file.name].onLoad === 'function') global[file.name].onLoad();
		}
		if (file.commands) Object.assign(commands, file.commands);
	}
}

global.Commands = commands;

global.CommandParser = require('./command-parser.js');

global.Rooms = require('./rooms.js');

global.Users = require('./users.js');

global.Client = require('./client.js');

global.Tournaments = require('./tournaments.js');

global.Battles = require('./Battles.js');

if (require.main === module) {
	Client.connect();
}
