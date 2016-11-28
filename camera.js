

function Camera() {
	this.x = 20;
	this.y = 20;
	this.bound_width = 200;
	this.bound_height = 120;

	this.update = function (p) {
		if (this.x-this.bound_width/2 > p.x) {
			this.move(this.x-this.bound_width/2 - p.x, 0);
		}else if (p.x > this.x+this.bound_width/2) {
			this.move(this.x+this.bound_width/2 - p.x, 0);
		}
		if (this.y-this.bound_height/2 > p.y) {
			this.move(0, this.y-this.bound_height/2 - p.y, 0);
		}else if (p.y > this.y+this.bound_height/2) {
			this.move(0, this.y+this.bound_height/2 - p.y, 0);
		}
	};

	this.draw = function () {
		push();
		fill(20,20,20,20);
		rectMode(CENTER);
		rect(this.x, this.y, this.bound_width, this.bound_height);
		fill(20,20,20,255);
		pop();
	};

	this.move = function (x, y) {
		this.x -= x;
		this.y -= y;
	};
}