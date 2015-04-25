(function() {
	var lastPos;


	var
	KEY_UP = 38,
	KEY_DOWN = 40,
	KEY_LEFT = 37,
	KEY_RIGHT = 39;


	var _ = self.Character = function(data) {
		this.id = data.characterId;
		this.name = data.name;
		this.pos = new V2(data.posX, data.posY);
		this.team = data.team;
	};

	_.prototype = {

		setPosition: function(pos) {
			this.pos=pos;
			this.moved = true;
		},

		update: function(dt, pressedKeys) {
			var speed = 100; // pixels per second

			var delta = new V2(0,0);

			if(pressedKeys[KEY_UP]) {
				delta = delta.add(new V2(-1,-1));
			}
			if(pressedKeys[KEY_DOWN]) {
				delta = delta.add(new V2(1,1));
			}
			if(pressedKeys[KEY_LEFT]) {
				delta = delta.add(new V2(-1,1));
			}
			if(pressedKeys[KEY_RIGHT]) {
				delta = delta.add(new V2(1,-1));
			}

			delta = delta.norm().scale(speed*dt);
			this.pos = this.pos.add(delta);


			if(lastPos && lastPos.equals(this.pos)) {
				this.moved = false;
			} else {
				this.moved = true;
				lastPos=this.pos.clone();
			}

		},

		draw: function(ctx, active) {
			ctx.save();

			ctx.translate(this.pos.x, this.pos.y);

			if(active) {
				var color = "#AD4545";
			} else {
				var color = "#badaad";
			}

			// Shadow
			ctx.fillStyle = "rgba(0,0,0,0.1)";
			ctx.beginPath();
			ctx.arc(0, 0, 10, 0, Math.PI*2);
			ctx.fill();

			// Draw character strait
			ctx.rotate(-Math.PI/4);
			ctx.scale(1, 2);

			// Character
			ctx.fillStyle = color;
			ctx.fillRect(-3, -20, 6, 20);

			// Name tag
			if(!active) {
				var txt = this.name;
				var width = ctx.measureText(txt).width;
				ctx.textAlign = 'center';

				ctx.fillStyle = "rgba(0,0,0,0.2)";
				ctx.fillRect(-width/2-5, 10, width+10, 15);

				ctx.fillStyle = "#cccccc";
				ctx.fillText(txt, 0, 21);
			}

			ctx.restore();

		}



	};

}());