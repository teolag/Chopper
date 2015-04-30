var users = require('../../modules/users');
var config = require('../../config.json');


exports.prefix = '/fake';

exports.index = function(req, res) {
	req.session.authType = 'fake';
	res.redirect('/');
};