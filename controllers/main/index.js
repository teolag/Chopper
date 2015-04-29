var google = require('../../modules/google.js');

exports.index = function(req, res){
  	console.log("ROOT: req.session.token" , req.session.token? req.session.token.access_token : "---");
	if(req.session.token) {


		google.getUserInfo(function(data){
			console.log("google userinfo callback", data);
			var identifier = Math.floor(Math.random()*10000000);
			users[identifier] = data;
			res.render(__dirname + '/pages/index', {
				user: data,
				identifier: identifier,
				webSocketConfig: JSON.stringify(config.webSocket)
			});
		});


	} else {
		res.render(__dirname + '/pages/login', {
			url: google.getAuthURL()
		});
	}
};