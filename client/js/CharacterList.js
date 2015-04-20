var CharacterList = (function() {

	var characters = [];
	var list;

	var init = function() {
		list = document.querySelector("ul.characters");
		list.addEventListener("click", clickHandler, false);
	};

	var setItems = function(items) {
		characters = items;
		updateList();
	};

	var updateList = function() {
		console.log("Recieved a list of characters", characters);
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