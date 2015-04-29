var google = require('../../modules/google.js');
var users = require('../../modules/users');
var config = require('../../config.json');

exports.index = function(req, res){
	console.log("ROOT: req.session.token" , req.session.token? req.session.token.access_token : "---");
	if(req.session.token) {
		google.getUserInfo(function(data){
			console.log("google userinfo callback", data);
			var identifier = users.login(data);
			res.render('index', {
				user: data,
				identifier: identifier,
				webSocketConfig: JSON.stringify(config.webSocket)
			});
		});


	} else {
		res.render('login', {
			url: google.getAuthURL()
		});
	}
};