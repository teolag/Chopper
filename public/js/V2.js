var V2 = function(x,y) {
	this.x = x;
	this.y = y;
}

V2.prototype = {
	toString: function() {
		return "[" + this.x + ", " + this.y + "]";
	},

	angleTo: function(other) {
		return Math.atan2((other.y - this.y),(other.x - this.x));
	},

	sub: function(other) {
		return new V2(this.x-other.x,this.y-other.y);
	},

	add: function(other) {
		return new V2(this.x+other.x,this.y+other.y);
	},

	scale: function(scale) {
		return new V2(this.x*scale,this.y*scale);
	},

	div: function(scale) {
		return new V2(this.x/scale,this.y/scale);
	},

	distance: function(other) {
		return Math.sqrt((this.x-other.x)*(this.x-other.x)+(this.y-other.y)*(this.y-other.y));
	},

	length: function() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	},

	dot: function(other) {
		return this.x*other.x + this.y*other.y;
	},

	norm: function() {
		if(this.length()>0) {
			return this.div(this.length());
		} else {
			return this.clone();
		}
	},

	rotate: function(rad) {
		out = new V2(0,0);
		out.x =  this.x*Math.cos(rad) + this.y*Math.sin(rad);
		out.y = -this.x*Math.sin(rad) + this.y*Math.cos(rad);
		return out;
	},

	clone: function() {
		return new V2(this.x, this.y);
	},

	step: function(dir) {
		switch(dir) {
			case "up":
				return new V2(this.x, this.y-1);
			case "down":
				return new V2(this.x, this.y+1);
			case "left":
				return new V2(this.x-1, this.y);
			case "right":
				return new V2(this.x+1, this.y);
			default: console.error("Unknown direction");
		}
	},

	interpolate: function(to, percent) {
		return to.sub(this).scale(percent).add(this);
	},

	equals: function(other) {
		return this.x===other.x && this.y===other.y;
	}

}