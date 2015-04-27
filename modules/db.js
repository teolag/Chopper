"use strict";

var config = require('../config.json');
var Datastore = require('nedb');
var db = new Datastore({ filename: './data.json', autoload: true});



module.exports = {

	getCharacter: function (id, callback) {
        db.find({_id: id}, callback);
	},

	getMyCharacters: function(googleId, callback) {
		db.find({googleId: googleId}, callback);
	},

	getAllCharacters: function(callback) {
	    db.find({}, callback);
	},

	insertCharacter: function(character, callback) {
		db.insert(character, function (err, newCharacter) {
			if(err) console.error("Error inserting data", err);
			else callback(newCharacter);
		});
	}

};
