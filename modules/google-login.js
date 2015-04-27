"use strict";


var google = require('./google.js');


function accessCheck(req, res, next) {

	if(req.query.code) {
		var code = req.query.code;
		console.log("Vi har fått en kod från farbror google: ", code);

		google.getToken(code, function(token) {
			console.log("google token callback", token.access_token);
			req.session.token = token;
			console.log("redirect back to root");
			res.redirect('/');
			res.end();
		});
	} else {
		next();
	}
}




module.exports = accessCheck;