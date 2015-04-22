var config = require('../config.json');
var Datastore = require('nedb');
var db = new Datastore({ filename: './data.json', autoload: true});
 

module.exports = {

	getCharacter: function (id, callback) {
        db.characters.find({characterId: id}, callback);
	},

	getMyCharacters: function(userId, callback) {
		db.characters.find({userId: userid}, callback);
	},

	getAllCharacters: function(callback) {
	    db.characters.find({}, callback);
	}

};
