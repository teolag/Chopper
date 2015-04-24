var Game = (function() {
	"use strict";

	var canvas, context;
	var activeCharacter, characters = [];
	var camera;
	var pressedKeys = {};
	var trees = [];

	var run = false;

	var init = function() {
		canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");

		camera = new Camera();

		addEventListener("keydown", keyHandler, false)
		addEventListener("keyup", keyHandler, false)
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
		//console.log(id, x, y);
		for(var i=0; i<characters.length; i++) {
			var character = characters[i];
			if(character.id===id) {
				character.setPosition(x,y);
			}
		}
	};

	var setTrees = function(treeArray) {
		trees = treeArray;
	};

	var setPosition = function(x, y) {
		if(activeCharacter) {
			activeCharacter.posX=x;
			activeCharacter.posY=y;
		} else {
			console.warn("no charcter selected");
		}

	}

	var gameLoop = function() {
		update();
		draw();
		if(run) requestAnimationFrame(gameLoop);
	};

	var update = function() {
		if(activeCharacter) {

			activeCharacter.update(pressedKeys);
			if(activeCharacter.moved) {
				camera.setFocus(activeCharacter.posX, activeCharacter.posY);
				//console.log("Pos:", activeCharacter.posX, activeCharacter.posY);
				Connection.sendMessage({
					type: 'characterPos',
					characterId: activeCharacter.id,
					x: activeCharacter.posX,
					y: activeCharacter.posY
				});
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

		drawGrid(context, view);

		for(var i=0; i<characters.length; i++) {
			var character = characters[i];
			var active = character===activeCharacter;
			character.draw(context, active);
		}

		drawTrees();

		context.restore();
	};


	var drawGrid = function(context, view) {
		context.fillStyle = "rgba(0,0,0,0.3)";
		context.strokeStyle = "rgba(0,0,0,0.1)";

		// Horizontal lines
		for(var y=Math.round(view.top/100)*100; y<view.bottom; y+=100) {
			context.beginPath();
			context.moveTo(view.left, y);
			context.lineTo(view.right, y);
			context.stroke();
			context.fillText(y, view.left+5, y+10);
		}

		// Vertical lines
		for(var x=Math.round(view.left/100)*100; x<view.right; x+=100) {
			context.beginPath();
			context.moveTo(x, view.top);
			context.lineTo(x, view.bottom);
			context.stroke();
			context.fillText(x, x+5, view.top+10);
		}
	};


	var drawTrees = function() {
		for(var i=0; i<trees.length; i++) {

			context.fillStyle = "rgba(150, 100, 75, 1)";
			context.beginPath();
			context.arc(trees[i].x, trees[i].y, trees[i].r/4, 0, Math.PI*2);
			context.fill();

			context.fillStyle = "rgba(52, 95, 35, .6)";
			context.beginPath();
			context.arc(trees[i].x, trees[i].y, trees[i].r, 0, Math.PI*2);
			context.fill();
		}
	};

	var keyHandler = function(e) {
		if(e.type==="keydown") {
			pressedKeys[e.keyCode] = true;
		} else if(e.type==="keyup") {
			pressedKeys[e.keyCode] = false;
		}
	};

	//TODO: call this to only render visible items
	var isVisible = function(view, x, y) {
		return true;
	};

	var start = function() {
		run=true;
		gameLoop();
	};

	var stop = function() {
		run=false;
	}



	return {
		init: init,
		setActiveCharacterId: setActiveCharacterId,
		setCharacters: setCharacters,
		updateCharacterPos: updateCharacterPos,
		setTrees: setTrees,
		start: start,
		stop: stop,
		setPosition: setPosition
	}
}());