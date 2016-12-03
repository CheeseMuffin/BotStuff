'use strict';

const name = "Chansey\'s Money Toss";
const description = "Players try to steal the money before it is taken away! **Command:** ``" + Config.commandCharacter + "steal [username]``";
const id = Tools.toId(name);
class Chansey extends Games.Game {
	constructor(room) {
		super(room);
		this.name = name;
		this.points = new Map();
		this.id = Tools.toId(name);
		this.egg = "";
		this.curRound = 0;
		this.numRounds = 10;
		//this.hasLatejoins = true;
		this.description = description;
	}

	onStart() {
		if (this.playerCount < 2) {
			this.room.say("The game needs at least two players to play!");
			this.end();
			return;
		}
		this.nextRound();
	}

	sayEgg() {
		this.room.say("The money has been handed to " + this.egg.name + "! Try to steal it by the end of the timer!");
		this.tryToSteal(Math.floor(Math.random() * 5) + 8);
	}

	tryToSteal(numLeft) {
		if (numLeft === 0) {
			this.nextRound();
		} else {
			if (this.egg && Math.random() <= 0.07) {
				this.room.say("**" + Config.username + " has stolen the money!**");
				this.egg = null;
			}
			this.timeout = setTimeout(() => this.tryToSteal(numLeft - 1), 1000);
		}
	}
	nextRound() {
		if (this.egg !== "") {
			if (!this.egg) {
				this.room.say("**" + Config.username + "** has stolen the money!");
			} else {
				let points = this.points.get(this.egg) || 0;
				points++;
				this.points.set(this.egg, points);
				this.room.say(this.egg.name + " has stolen the money!");
			}
		}
		if (this.curRound === this.numRounds) {
			let curMax = 0;
			let bestID = null;
			for (let userID in this.players) {
				let points = this.points.get(this.players[userID]);
				if (points && points > curMax) {
					curMax = points;
					bestID = userID;
				}
			}
			this.room.say("The end! The winner was " + this.players[bestID].name + " with " + curMax + " points!");
			Storage.addPoints(500, this.players[bestID], this.room.id);
			this.end();
			return;
		}
		this.curRound++;
		let players = [];
		for (let userID in this.players) {
			let player = this.players[userID];
			if (this.points.get(player)) {
				players.push(player.name + "(" + this.points.get(player) + ")");
			} else {
				players.push(player.name);
			}
		}
		this.egg = this.players[Object.keys(this.players)[Math.floor(Math.random() * Object.keys(this.players).length)]];
		this.room.say("**Players (" + this.playerCount + ")**: " + players.join(", "));
		this.timeout = setTimeout(() => this.sayEgg(), 5 * 1000);
	}
	steal(target, user) {
		if (!(user.id in this.players)) {
			return;
		}
		if (this.egg) {
			let otherPlayer = this.players[Tools.toId(target)];
			if (!otherPlayer || this.egg !== otherPlayer) {
				return;
			}
		} else {
			if (Tools.toId(target) !== Tools.toId(Config.username)) {
				return;
			}
		}
		this.egg = this.players[user.id];
	}
}

exports.name = name;
exports.id = id;
exports.description = description;
exports.game = Chansey;
exports.aliases = ["moneytoss", "cmt"];