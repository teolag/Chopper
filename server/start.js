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

var connection;
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

    connection = request.accept(allowedProtocol, request.origin);
    connection.id = connectionId++;

	var player = new Player(connection, db);
	players.push(player);
}


function sendToAll(message) {


	for (var i in connections) {
		connections[i].sendUTF(JSON.stringify(message));
	}
}


function sendToOthers(message) {

	for (var i in connections) {
		if(connections[i]!==connection) {
			connections[i].sendUTF(JSON.stringify(message));
		}
	}
}

