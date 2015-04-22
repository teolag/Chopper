var Connection = (function() {
	var section, btnConnect, statusText;

	var url = "chopper.xio.se:8055";
	var connected = false;
	var callbacks = {};


	var init = function() {
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
		statusText.textContent = "Connecting to " + url;
		btnConnect.textContent = "Connecting...";
		socket = new WebSocket("ws://" + url + "/", "chopper");
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
	}



	return {
		init: init,
		on: setEventCallback
	}
}());