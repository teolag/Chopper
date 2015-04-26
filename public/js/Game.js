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
				return;
			}
		}
	};

	var updateCharacterPos = function(id, pos) {
		//console.log(id, x, y);
		for(var i=0; i<characters.length; i++) {
			var character = characters[i];
			if(character.id===id) {
				character.setPosition(pos);
				return;
			}
		}
	};

	var setTrees = function(treeArray) {
		trees = treeArray;
	};

	var setPosition = function(pos) {
		if(activeCharacter) {
			activeCharacter.setPosition(pos);
		} else {
			console.warn("no charcter selected");
		}

	}

	var lastTs;
	var gameLoop = function(ts) {
		if(ts && lastTs) {
			var dt = (ts-lastTs)/1000;
			update(dt);
			draw();
		}
		lastTs = ts;
		if(run) requestAnimationFrame(gameLoop);
	};

	var update = function(dt) {
		if(activeCharacter) {

			activeCharacter.update(dt, pressedKeys);
			if(activeCharacter.moved) {
				camera.setFocus(activeCharacter.pos.x, activeCharacter.pos.y);
				//console.log("Pos:", activeCharacter.posX, activeCharacter.posY);
				Connection.sendMessage({
					type: 'characterPos',
					characterId: activeCharacter.id,
					x: activeCharacter.pos.x,
					y: activeCharacter.pos.y
				});
			}
		}
	};

	var draw = function() {
		context.save();
		context.fillStyle = "#9ABD86";
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.translate(canvas.width/2, canvas.height/2);
		context.scale(1, 0.5);
		context.rotate(Math.PI/4);
		context.translate(-camera.focusX, -camera.focusY);


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
			var r = trees[i].r;
			var color = trees[i].color;
			var height = r*2;

			context.save();

			context.translate(trees[i].x, trees[i].y);
			context.rotate(-Math.PI/4);
			context.scale(1, 2);


			context.fillStyle = "rgba(150, 100, 75, 1)";
			context.fillRect(-r/4, -height, r/2, height);

			context.fillStyle = color;
			context.beginPath();
			context.arc(0, -height, r, 0, Math.PI*2);
			context.fill();

			context.restore();
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