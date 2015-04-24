var config = require('../config.json');
var http = require('http');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(config.oauth2.client_id, config.oauth2.client_secret, config.oauth2.redirect_uri);

var scopes = ['profile','email'];




function getAuthURL()  {
	var url = oauth2Client.generateAuthUrl({
		access_type: 'online', // 'online' (default) or 'offline' (gets refresh_token)
		scope: scopes // If you only need one scope you can pass it as string
	});
	return url;
}

function getToken(code, callback) {
	oauth2Client.getToken(code, function(err, tokens) {
		if(err) console.error("Error getting token:", err);
		oauth2Client.setCredentials(tokens);
		callback();
	});

}


function getUserInfo(callback) {
	var oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
	oauth2.userinfo.get({}, function(err, data) {
		if(err) console.error("Error getting user data:", err);
		callback(data);
	});
}



module.exports.getToken = getToken;
module.exports.getAuthURL = getAuthURL;
module.exports.getUserInfo = getUserInfo;