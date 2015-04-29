"use strict";

var WebSocketServer = require('websocket').server;
var http = require('http');
var seed = require('seed-random');
var express = require('express');
var session = require('express-session');

var Player = require('./modules/player');
var requestLogger = require('./modules/request-logger');
var WorldGenerator = require('./modules/world-generator');
var users = require('./modules/users');
var db = require('./modules/db');
var google = require('./modules/google.js');
var googleLogin = require('./modules/google-login.js');
var config = require('./config.json');


console.log('---------------------------------------------------');
console.log('Starting Chopper server...');

var app = express();
app.set('view engine', 'ejs');
app.use(session({secret: 'h)&H#%&J46K#¤6', resave: false, saveUninitialized: true}));
app.use(requestLogger);
app.use(googleLogin);
app.use("/js", express.static('public/js'));
app.use("/css", express.static(__dirname + '/public/css'));
app.use("/img", express.static(__dirname + '/public/img'));
app.use(express.static(__dirname + '/public'));

var connectionId = 1;
var players = [];

require('./lib/boot')(app, { verbose: !module.parent });

app.get('/fake', function (req, res) {
	var user = config.fakeLogin;
	console.log("login as fake user", user);
	var identifier = users.login(user);
	res.render(__dirname + '/pages/index', {
		user: user,
		identifier: identifier,
		webSocketConfig: JSON.stringify(config.webSocket)
	});
});


var server = app.listen(config.webServer.port, function () {
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

	var acceptedOrigin = "http://" + config.webSocket.url +":"+config.webSocket.port;
    if (request.origin !== acceptedOrigin) {
		console.log("origin rejected", request.origin, "!=", acceptedOrigin);
		request.reject();
		return;
    }
    if (request.requestedProtocols.indexOf(config.webSocket.protocol) === -1) {
		console.log("requestedProtocols", request.requestedProtocols);
        request.reject();
        return;
    }

    var connection = request.accept(config.webSocket.protocol, request.origin);
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
			player.setUser(users.get(data.identifier));
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

