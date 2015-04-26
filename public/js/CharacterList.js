var CharacterList = (function() {
	"use strict";

	var characters = [];
	var list;

	var init = function() {
		list = document.querySelector("ul.characters");
		list.addEventListener("click", clickHandler, false);
	};

	var setItems = function(items) {
		console.log("Recieved a list of characters", items);
		characters = items;
		updateList();
	};

	var updateList = function() {
		list.innerHTML = "";
		for(var i=0, l=characters.length; i<l; i++) {
			var c = characters[i];
			list.innerHTML += "<li data-id='" + c.characterId + "'>" + c.name + "</li>";
		}
	};

	var clickHandler = function(e) {
		var id = parseInt(e.target.dataset.id);
		if(id) {
			console.log("clicked on character", id);
			Game.setActiveCharacterId(id);
		}
	};


	return {
		setItems: setItems,
		init: init
	}
}());