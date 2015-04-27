"use strict";

var gameSection = document.querySelector("section.game");


CharacterList.init();
Game.init();

Connection.init(webSocket.url, webSocket.port, webSocket.protocol);


Connection.on("connected", function() {
	Connection.sendMessage({
		type:'introduce',
		identifier: identifier
	});
	show(gameSection);
	Game.start();
});

Connection.on("disconnected", function() {
	hide(gameSection);
	Game.stop();
});


Connection.on("message", function(e) {
	try {
		var data = JSON.parse(e.data);
	} catch(e) {
		console.error("Error parsing message", e);
		return;
	}

	switch(data.type) {

		case "welcome":
		console.log("Connected with connectionId:", data.connectionId);
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
		Game.updateCharacterPos(data.characterId, new V2(data.x, data.y));
		break;

		case "trees":
		Game.setTrees(data.trees);
		console.log("trees", data.trees);
		break;

		default:
		console.log("Message received:", data);
	}

});




// Helpers

function hide(elem) {
	elem.style.display = "none";
}
function show(elem) {
	elem.style.removeProperty('display');
}







// Cheats

function jumpTo(x,y) {
	if(typeof x == "string") {
		var word = x;
		if(word=="home"||word=="origin") {
			Game.setPosition(new V2(0,0));
		}
	} else {
		Game.setPosition(new V2(x,y));
	}
}
