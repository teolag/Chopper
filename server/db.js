var mysql = require('mysql');
var config = require('../config.json');


var myCon = mysql.createConnection(config.db);


module.exports = {

	connect: function() {
		myCon.connect(function(err) {
		  if(err) {
			  console.error(err);
		  } else {
			  console.log("Connected to database '" + config.db.database + "'");
		  }
		});
	},


	getCharacter: function(id, callback) {
		var query = myCon.query('SELECT character_id AS characterId, name, created, pos_x AS posX, pos_y AS posY, team FROM characters WHERE character_id=?', id, callback);
	},

	getMyCharacters: function(userId, callback) {
		var query = myCon.query('SELECT character_id AS characterId, name, created, pos_x AS posX, pos_y AS posY, team FROM characters WHERE user_id=?', userId, callback);
	},

	getAllCharacters: function(callback) {
		var query = myCon.query('SELECT character_id AS characterId, name, created, pos_x AS posX, pos_y AS posY, team FROM characters ORDER BY name', callback);
	}

};