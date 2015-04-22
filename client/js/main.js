
var socket;
var connected;


CharacterList.init();
Game.init();

requestConnection();

function requestConnection() {
	socket = new WebSocket("ws://chopper.xio.se:8055/", "chopper");
	socket.addEventListener("open", connectionEstablished);
	socket.addEventListener("error", connectionFailed);
	socket.addEventListener("close", connectionClosed);
}

function connectionEstablished(e) {
	socket.addEventListener("message", messageReceived);
	console.log("Connection established!", e.target.url, e.target.protocol);
	connected = true;
}


function connectionClosed(e) {
	connected = false;
	console.log("Connection was closed", e);
}


function connectionFailed(e) {
	connected = false;
	console.log("Can not connect to websocket", e);
}


function messageReceived(e) {
	try {
		var data = JSON.parse(e.data);
	} catch(e) {
		console.error("Error parsing message", e);
		return;
	}

	switch(data.type) {

		case "welcome":
		console.log("Connected with connectionId:", data.connectionId);
		socket.send(JSON.stringify({
			type:'introduce',
			userId:userId
		}));
		break;

		case "myCharacters":
		CharacterList.setItems(data.characters);
		break;

		case "allCharacters":
		Game.setCharacters(data.characters);
		break;

		case "returnSelectedCharacter":
		console.log("du valde", data.character);
		Game.setActiveCharacter(data.character);
		break;

		case "characterPos":
		Game.updateCharacterPos(data.characterId, data.x, data.y);
		break;

		default:
		console.log("Message received:", data);
	}

}