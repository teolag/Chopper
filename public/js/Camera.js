(function() {

	var _ = self.Camera = function() {
		this.focusX = 0;
		this.focusY = 0;
		this.zoom = 1;
	};

	_.prototype = {


		setFocus: function(x, y) {
			this.focusX = x;
			this.focusY = y;
		}


	};

}());