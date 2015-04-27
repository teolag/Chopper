"use strict";

var WebSocketServer = require('websocket').server;
var http = require('http');
var seed = require('seed-random');
var express = require('express');
var session = require('express-session');

var Player = require('./modules/player');
var requestLogger = require('./modules/request-logger');
var WorldGenerator = require('./modules/world-generator');
var db = require('./modules/db');
var google = require('./modules/google.js');
var googleLogin = require('./modules/google-login.js');
var config = require('./config.json');


console.log('---------------------------------------------------');
console.log('Starting Chopper server...');


var port = 8055;
var allowedOrigin = 'http://chopper.xio.se:8055';
var allowedProtocol = 'chopper';
var loggedIn = false;

var app = express();
app.set('view engine', 'ejs');
app.use(session({
  secret: 'h)&H#%&J46K#¤6',
  resave: false,
  saveUninitialized: true
}));
app.use(requestLogger);

app.use(googleLogin);

app.use("/js", express.static('public/js'));
app.use("/css", express.static(__dirname + '/public/css'));
app.use("/img", express.static(__dirname + '/public/img'));
app.use(express.static(__dirname + '/public'));

var connectionId = 1;
var players = [];
var users = {};


app.get('/', function (req, res) {
	console.log("ROOT: req.session.token" , req.session.token? req.session.token.access_token : "---");
	if(req.session.token) {


		google.getUserInfo(function(data){
			console.log("google userinfo callback", data);
			var identifier = Math.floor(Math.random()*10000000);
			users[identifier] = data;
			res.render(__dirname + '/pages/index', {user:data, identifier:identifier});
		});


	} else {
		res.render(__dirname + '/pages/login', {
			url: google.getAuthURL()
		});
	}
});



var server = app.listen(port, function () {
  var port = server.address().port;
  console.log('Listening on port %s', port);
});


var loginAccepted = function(data) {
	console.log("Login accepted", data);
};





var wsServer = new WebSocketServer({httpServer: server, autoAcceptConnections: false});
wsServer.on('request', incomingRequest);


var chunk = WorldGenerator.generateChunk(0,0);



function incomingRequest(request) {
	console.log("Incoming connection from ", request.remoteAddress, "with origin", request.origin);

    if (request.origin !== allowedOrigin) {
		console.log("origin", request.origin);
		request.reject();
		return;
    }
    if (request.requestedProtocols.indexOf(allowedProtocol) === -1) {
		console.log("requestedProtocols", request.requestedProtocols);
        request.reject();
        return;
    }

    var connection = request.accept(allowedProtocol, request.origin);
	connection.on('message', incomingMessage);
	connection.on('close', connectionClosed);
    connection.id = connectionId++;

	var player = new Player(connection, db);
	players.push(player);

	sendToOthers({type:"userEnter", id: connection.id});
	connection.sendUTF(JSON.stringify({type:'trees', trees:chunk.trees}));

	console.log("Connection " + connection.id + " successfully connected");
	console.log("Active players: ", players.length);



	function incomingMessage(message) {
		if(message.type !== 'utf8') {
			console.warn("Invalid message", message);
			return;
		}
		try {
			var data = JSON.parse(message.utf8Data);
		} catch(e) {
			console.error("Error parsing message", e, message);
			return;
		}

		switch(data.type) {

			case "characterPos":
			forwardToOthers(message);
			break;

			case "introduce":
			player.setUser(users[data.identifier]);
			break;

			default:
			player.incomingMessage(data);
		}
	}

	function connectionClosed(reasonCode, description) {
		for (var i=0; i<players.length; i++) {
			if(players[i]===player) {
				players.splice(i, 1);
				break;
			}
		}

		sendToOthers({type:"userLeave", id: connection.id});
		console.log("Connection " + connection.id + ' disconnected.', reasonCode, description);
		console.log("Active players: ", players.length);

		player=null;
		connection=null;
	}


	function sendToAll(message) {
		for (var i=0; i<players.length; i++) {
			players[i].connection.sendUTF(JSON.stringify(message));
		}
	}


	function sendToOthers(message) {
		for (var i=0; i<players.length; i++) {
			if(players[i]!==player) {
				players[i].connection.sendUTF(JSON.stringify(message));
			}
		}
	}

	function forwardToOthers(message) {
		for (var i=0; i<players.length; i++) {
			if(players[i]!==player) {
				players[i].connection.sendUTF(message.utf8Data);
			}
		}
	}

}

