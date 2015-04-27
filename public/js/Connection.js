var Connection = (function() {
	"use strict";

	var section, btnConnect, statusText;

	var connected = false;
	var callbacks = {};
	var socket;

	var config;


	var init = function(url, port, protocol) {
		config = {
			url: url,
			port: port,
			protocol: protocol
		};

		section = document.querySelector("section.connection");
		statusText = section.querySelector(".status");
		btnConnect = section.querySelector("button.connect");
		btnConnect.addEventListener("click", connectClick, false);

		requestConnection();
	};

	var setEventCallback = function(event, callback) {
		callbacks[event] = callback;
	};

	var connectClick = function(e) {
		if(connected) {
			socket.close();
		} else {
			requestConnection();
		}
	};


	function requestConnection() {
		statusText.textContent = "Connecting to " + config.url + " using port " + config.port;
		btnConnect.textContent = "Connecting...";
		socket = new WebSocket("ws://" + config.url + ":" + config.port + "/", config.protocol);
		socket.addEventListener("open", connectionEstablished);
		socket.addEventListener("error", connectionFailed);
	}

	function connectionEstablished(e) {
		connected=true;
		btnConnect.textContent = "Disconnect";
		statusText.textContent = "Connected to " + e.target.url;
		socket.addEventListener("message", messageReceived);
		socket.addEventListener("close", connectionClosed);

		if(callbacks.hasOwnProperty("connected")) {
			callbacks["connected"]();
		}

		console.log("Connection established!", e.target.url, e.target.protocol);
	}


	function connectionClosed(e) {
		btnConnect.textContent = "Connect";
		statusText.textContent = "Connection closed";
		connected = false;
		console.log("Connection was closed", e);
		if(callbacks.hasOwnProperty("disconnected")) {
			callbacks["disconnected"](e);
		}
	}


	function connectionFailed(e) {
		btnConnect.textContent = "Retry";
		statusText.textContent = "Cannot connect";

		connected = false;
		console.log("Can not connect to websocket", e);
	}

	var messageReceived = function(e) {
		if(callbacks.hasOwnProperty("message")) {
			callbacks["message"](e);
		}
	};

	var sendMessage = function(message) {
		socket.send(JSON.stringify(message));
	};



	return {
		init: init,
		on: setEventCallback,
		sendMessage: sendMessage
	}
}());