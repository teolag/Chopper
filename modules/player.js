"use strict";

var Player = function(connection, db) {
	this.db = db;
	this.connection = connection;
	this.user = null;
	this.characters=[];

	this.db.getAllCharacters(this.allCharactersResponse.bind(this));
}

Player.prototype = {
	setUser: function(user) {
		this.user = user;
		this.db.getMyCharacters(this.user.id, this.myCharactersResponse.bind(this));
	},

	incomingMessage: function(data) {

		switch(data.type) {
			case "newCharacter":
			var character = data.character;
			character.googleId = this.user.id;
			character.posX = Math.floor(Math.random()*1000)-500;
			character.posY = Math.floor(Math.random()*1000)-500;
			this.db.insertCharacter(character, function(character) {
				console.log("Character saved to database", character);
			});
			break;


			default:
			console.log("Incoming message from id:", this.connection.id, data);
		}
	},

	myCharactersResponse: function(err, data) {
		if(err) console.error("Error geting my characters: ", err);

		//console.log("My character response", data, err);
		this.characters = data;

		this.sendToClient({
			type: 'myCharacters',
			characters: data
		});
	},

	allCharactersResponse: function(err, data) {
		if(err) console.error("Error geting all characters: ", err);

		this.sendToClient({
			type: 'allCharacters',
			characters: data
		});
	},

	getCharacterResponse: function(err, data) {
		if(err) console.error("Error geting character: ", err);

		this.character = data[0];
		this.sendToClient({type:"returnSelectedCharacter", character: this.character});
		console.log("character", this.character);
	},

	sendToClient: function(message) {
		this.connection.sendUTF(JSON.stringify(message));
	}
};


module.exports = Player;