

var Player = function(connection, db) {
	this.db = db;
	this.connection = connection;

	this.sendToClient({
		type: 'welcome',
		connectionId: connection.id
	});
}

Player.prototype = {


	incomingMessage: function(data) {

		switch(data.type) {

			case "introduce":
			this.userId = data.userId;
			this.db.getMyCharacters(this.userId, this.myCharactersResponse.bind(this));
			this.db.getAllCharacters(this.allCharactersResponse.bind(this));
			break;

			default:
			console.log("Incoming message from id:", this.connection.id, data);
		}
	},

	myCharactersResponse: function(err, data) {
		//console.log("My character response", data, err);

		this.sendToClient({
			type: 'myCharacters',
			characters: data
		});
	},

	allCharactersResponse: function(err, data) {
		//console.log("All characters response", data, err);

		this.sendToClient({
			type: 'allCharacters',
			characters: data
		});
	},

	getCharacterResponse: function(err, data) {
		if(err) {
			console.error(err);
		}
		this.character = data[0];
		this.sendToClient({type:"returnSelectedCharacter", character: this.character});
		console.log("character", this.character);
	},

	sendToClient: function(message) {
		this.connection.sendUTF(JSON.stringify(message));
	}


};



module.exports = Player;