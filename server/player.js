

var Player = function(connection, db) {
	this.db = db;
	this.connection = connection;
	this.connection.on('message', this.onIncommingMessage.bind(this));
    this.connection.on('close', this.onConnectionClose.bind(this));

	this.sendToClient({
		type: 'welcome',
		connectionId: connection.id
	});
}

Player.prototype = {

	onConnectionClose: function(reasonCode, description) {
		//var userExit = {type:"userExit", id: this.connection.id};
		//sendToAll(userExit);
		console.log((new Date()) + ' Peer ' + this.connection.remoteAddress + ' disconnected.', reasonCode, description);
	},



	onIncommingMessage: function(message) {
		if(message.type !== 'utf8') {
			console.warn("Invalid message", message);
			return;
		}
		try {
			var data = JSON.parse(message.utf8Data);
		} catch(e) {
			console.error("Error parsing message", e);
			return;
		}

		switch(data.type) {

			case "getCharacters":
			this.db.getCharacters(this.characterListResponse.bind(this));
			break;

			case "selectCharacter":
			this.db.getCharacter(data.characterId, this.getCharacterResponse.bind(this));
			break;

			default:
			console.log("Incoming message from id:", this.connection.id, data);
		}
	},

	characterListResponse: function(err, data) {
		console.log("Character list response", data, err);

		this.sendToClient({
			type: 'characterList',
			characters: data
		});
	},

	getCharacterResponse: function(err, data) {
		if(err) {
			console.error(err);
		}
		this.character = data;
		console.log("character", this.character);
	},

	sendToClient: function(message) {
		this.connection.sendUTF(JSON.stringify(message));
	}


};



module.exports = Player;