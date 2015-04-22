var WebSocketServer = require('websocket').server;
var http = require('http');
var seed = require('seed-random');

var Player = require('./player');
var WorldGenerator = require('./world-generator');

var db = require('./db');
db.connect();


var server = http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	console.log(req);
	res.end('Hello World\n');
});

var port = 8055;
var allowedOrigin = 'http://chopper.xio.se';
var allowedProtocol = 'chopper';

var connectionId = 1;

var players = [];

server.listen(port, function() {
    console.log(new Date() + ' Chopper game server started, listening on port ' + port);
});

var wsServer = new WebSocketServer({httpServer: server, autoAcceptConnections: false});
wsServer.on('request', incomingRequest);


var chunk = WorldGenerator.generateChunk(0,0);



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

