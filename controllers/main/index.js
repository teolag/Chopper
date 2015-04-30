var google = require('../../modules/google.js');
var users = require('../../modules/users');
var config = require('../../config.json');


exports.before = function(req, res, next){
    console.log("main controller");
    next();
};

exports.index = function(req, res){
    console.log("ROOT: req.session.token" , req.session.token? req.session.token.access_token : "---");
    if(req.session.token) {
        if(req.session.authType === 'google') {
            google.getUserInfo(renderIndex, res);
        }
    } else {
        if (req.session.authType === 'fake') {
            var user = config.fakeLogin;
            console.log("login as fake user", user);
            renderIndex(user, res);
            return;
        }
        res.render('login', {
            url: google.getAuthURL()
        });
    }
};

function renderIndex(data, res) {
    console.log("google userinfo callback", data);
            var identifier = users.login(data);
            res.render('index', {
                user: data,
                identifier: identifier,
                webSocketConfig: JSON.stringify(config.webSocket)
            });
}