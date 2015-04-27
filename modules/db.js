"use strict";

var config = require('../config.json');
var Datastore = require('nedb');
var db = new Datastore({ filename: './data.json', autoload: true});

db.insert([{ a: 5 }, { a: 42 }, { a: 5 }], function (err) {
	if(err) console.error("Error inserting data", err);
  // err is a 'uniqueViolated' error
  // The database was not modified
});

module.exports = {

	getCharacter: function (id, callback) {
        db.find({characterId: id}, callback);
	},

	getMyCharacters: function(googleId, callback) {
		db.find({googleId: googleId}, callback);
	},

	getAllCharacters: function(callback) {
	    db.find({}, callback);
	}

};
