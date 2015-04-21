(function() {
	var lastX, lastY;


	var _ = self.Character = function(data) {
		this.id = data.characterId;
		this.name = data.name;
		this.posX = data.posX;
		this.posY = data.posY;
		this.team = data.team;
	};

	_.prototype = {

		setPosition: function(x,y) {
			this.posX=x;
			this.posY=y;
			this.moved = true;
		},

		update: function(pressedKeys) {

			if(pressedKeys[38]) {
				this.posY--;
			}
			if(pressedKeys[40]) {
				this.posY++;
			}
			if(pressedKeys[37]) {
				this.posX--;
			}
			if(pressedKeys[39]) {
				this.posX++;
			}

			if(lastX===this.posX && lastY===this.posY) {
				this.moved = false;
			} else {
				this.moved = true;
				lastX=this.posX;
				lastY=this.posY;
			}

		},

		draw: function(ctx, active) {
			if(active) {
				var color = "#bada55";
			} else {
				var color = "#badaad";
			}

			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(this.posX, this.posY, 10, 0, Math.PI*2);
			ctx.fill();


			if(!active) {
				var txt = this.name;
				var width = ctx.measureText(txt).width;
				ctx.textAlign = 'center';

				ctx.fillStyle = "rgba(0,0,0,0.3)";
				ctx.fillRect(this.posX-width/2-5, this.posY+15, width+10, 15);

				ctx.fillStyle = "#cccccc";
				ctx.fillText(txt, this.posX, this.posY+25);
			}
		}



	};

}());