var WebSocketServer = require('websocket').server;
var http = require('http');
var Player = require('./player');
var db = require('./db');
db.connect();


var server = http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	console.log(req);
	res.end('Hello World\n');
});

var port = 8055;
var allowedOrigin = 'http://xio.se';
var allowedProtocol = 'chopper';

var connectionId = 1;

var players = [];

server.listen(port, function() {
    console.log(new Date() + ' Chopper game server started, listening on port ' + port);
});

var wsServer = new WebSocketServer({httpServer: server, autoAcceptConnections: false});
wsServer.on('request', incomingRequest);



function incomingRequest(request) {
	console.log("Incoming connection from ", request.remoteAddress, "with origin", request.origin);

    if (request.origin !== allowedOrigin) {
		request.reject();
		return;
    }
    if (request.requestedProtocols.indexOf(allowedProtocol) === -1) {
        request.reject();
        return false;
    }

    var connection = request.accept(allowedProtocol, request.origin);
	connection.on('message', incomingMessage);
	connection.on('close', connectionClosed);

    connection.id = connectionId++;

	var player = new Player(connection, db);
	players.push(player);

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


			default:
			player.incomingMessage(data);
		}

	}

	function connectionClosed(reasonCode, description) {
		//var userExit = {type:"userExit", id: connection.id};
		//sendToOthers(userExit);
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.', reasonCode, description);
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
				console.log("forward to", players[i].connection.id);
			}
		}
	}

}

