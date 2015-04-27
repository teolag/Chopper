var CharacterList = (function() {
	"use strict";

	var characters = [];
	var list, btnNewCharacter, dialogNewCharacter, btnSaveCharacter, btnCancelCharacter, inputName, inputTeam;

	var init = function() {
		list = document.querySelector("ul.myCharacters");
		list.addEventListener("click", listClickHandler, false);


		dialogNewCharacter = document.querySelector("dialog.newCharacter");

		btnNewCharacter = document.getElementById("btnNewCharacter");
		btnNewCharacter.addEventListener("click", addNewCharacter, false);

		btnSaveCharacter = document.getElementById("btnSaveCharacter");
		btnSaveCharacter.addEventListener("click", saveNewCharacter, false);

		btnCancelCharacter = document.getElementById("btnCancelCharacter");
		btnCancelCharacter.addEventListener("click", cancelNewCharacter, false);

		inputName = dialogNewCharacter.querySelector("input.name");
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
			list.innerHTML += "<li data-id='" + c._id + "'>" + c.name + "("+c.team+")</li>";
		}
	};

	var listClickHandler = function(e) {
		var id = e.target.dataset.id;
		if(id) {
			console.log("clicked on character", id);
			Game.setActiveCharacterId(id);
		}
	};

	var addNewCharacter = function(e) {
		dialogNewCharacter.showModal();
	};

	var cancelNewCharacter = function(e) {
		inputName.value = "";
		dialogNewCharacter.close();
	};

	var saveNewCharacter = function(e) {
		inputTeam = dialogNewCharacter.querySelector("input.team:checked");
		var character = {
			name: inputName.value,
			team: inputTeam.value
		};
		Connection.sendMessage({type:"newCharacter", character:character});
		inputName.value = "";
		dialogNewCharacter.close();
	};




	return {
		setItems: setItems,
		init: init
	}
}());