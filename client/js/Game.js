var Game = (function() {
	var canvas, context;
	var activeCharacter, characters=[];
	var camera;
	var pressedKeys = {};

	var init = function() {
		canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");

		camera = new Camera();

		addEventListener("keydown", keyHandler, false)
		addEventListener("keyup", keyHandler, false)


		gameLoop();
	};

	var setCharacters = function(list) {
		characters.length=0;
		for(var i=0; i<list.length; i++) {
			characters.push(new Character(list[i]));
		}
	};

	var setActiveCharacterId = function(characterId) {
		for(var i=0; i<characters.length; i++) {
			var character = characters[i];
			if(character.id===characterId) {
				activeCharacter = character;
			}
		}
	};

	var updateCharacterPos = function(id, x, y) {
		console.log(id, x, y);
		for(var i=0; i<characters.length; i++) {
			var character = characters[i];
			if(character.id===id) {
				character.setPosition(x,y);
			}
		}
	}

	var gameLoop = function() {

		update();
		draw();
		requestAnimationFrame(gameLoop);
	};

	var update = function() {
		if(activeCharacter) {

			activeCharacter.update(pressedKeys);
			if(activeCharacter.moved) {
				camera.setFocus(activeCharacter.posX, activeCharacter.posY);
				console.log("Pos:", activeCharacter.posX, activeCharacter.posY);
				socket.send(JSON.stringify({
					type:'characterPos',
					characterId:activeCharacter.id,
					x: activeCharacter.posX,
					y: activeCharacter.posY
				}));
			}
		}
	};

	var draw = function() {
		context.save();
		context.fillStyle = "#9ABD86";
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.translate(-camera.focusX+canvas.width/2, -camera.focusY+canvas.height/2);

		var view = {
			left: camera.focusX-canvas.width/2,
			right: camera.focusX+canvas.width/2,
			top: camera.focusY-canvas.height/2,
			bottom: camera.focusY+canvas.height/2
		};

		// Horizontal lines
		context.fillStyle = "rgba(0,0,0,0.3)";
		for(var y=Math.round(view.top/100)*100; y<view.bottom; y+=100) {
			context.beginPath();
			context.moveTo(view.left, y);
			context.lineTo(view.right, y);
			context.stroke();
			context.fillText(y, view.left+10, y+10);
		}

		// Vertical lines
		context.fillStyle = "rgba(0,0,0,0.3)";
		for(var x=Math.round(view.left/100)*100; x<view.right; x+=100) {
			context.beginPath();
			context.moveTo(x, view.top);
			context.lineTo(x, view.bottom);
			context.stroke();
			context.fillText(x, x+5, view.top+10);
		}

		for(var i=0; i<characters.length; i++) {
			var character = characters[i];
			var active = character===activeCharacter;
			character.draw(context, active);
		}


		context.restore();
	};

	var keyHandler = function(e) {
		if(e.type==="keydown") {
			pressedKeys[e.keyCode] = true;
		} else if(e.type==="keyup") {
			pressedKeys[e.keyCode] = false;
		}
		console.log(pressedKeys);
	};


	var isVisible = function(view, x, y) {
		return true;
	};


	return {
		init: init,
		setActiveCharacterId: setActiveCharacterId,
		setCharacters: setCharacters,
		updateCharacterPos: updateCharacterPos
	}
}());