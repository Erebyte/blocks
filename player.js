var Player = function () {
	this.player_name = "tommosfool";

	this.x = 100;
	this.y = 100;
	this.w = 20;
	this.h = 40;
	this.gender = 'male';
	this.color_h = 70;
	this.color_s = 10;
	this.color_b = 100;

	this.flags = {
		'noclip' : false
	};
	this.attribs = {
		"health" : 20,
		"speed" : 3
	};
	this.path = [];
};
Player.prototype.draw = function () {
	colorMode(HSB, 360, 100, 100);
	fill(this.color_h, this.color_s, this.color_b);
	rect(this.x-this.w/2, this.y-this.h, this.w, this.h);
	colorMode(RGB, 255);
	if (this.flags['check'] === true) {
		fill(255);
		ellipse(this.x-this.w/2, this.y-this.h, this.w, this.w);
	}
};
Player.prototype.keyPressed = function (key) {
	if (key == 'T' && this.flags['check']) {
		this.flags['checking'].check();
	}
};
Player.prototype.update = function () {
	if(!windows.open_window) {
		var mx = 0;
		var my = 0;
		if (keyIsDown(87)) {//w
			my -= 1;
		}
		if (keyIsDown(83)){//s
			my += 1;
		}
		if (keyIsDown(65)){//a
			mx -= 1;
		}
		if (keyIsDown(68)){//d
			mx += 1;
		}
		// this.move(mx, my);
		if (mx!==0 || my!==0){
			if (!this.collide(this.get_move(mx,my))) {
				// this.unmove();
				this.move(mx,my);
			}
		}

		this.flags['check'] = false;
		this.flags['checking'] = null;
		for (var i = entities.length - 1; i >= 0; i--) {
			var e = entities[i];
			if (e.check) {
				e.do_check(this);
			}
		}
	}
};
Player.prototype.collide = function (vec) {
	var res;
	res = terrain.collide(this.x,this.y,this.w,vec.x,vec.y);
	if(res){
		if(res !== true) {
			this.move(res.x,res.y,1);
		}
		return true;
	}

	for (var i = entities.length - 1; i >= 0; i--) {
		if (collidePointPoint(this.x,this.y,entities[i].x,entities[i].y,200)) {
			res = entities[i].collide(this.x+vec.x,this.y+vec.y,this.w);
			if(res)return true;
		}
	}
	return false;
};
Player.prototype.get_move = function (x, y, spd) {
	spd = spd || this.attribs['speed'] + (this.flags['spd_buf'] || 0);
	return createVector(x*spd, y*spd);
};
Player.prototype.move = function (x, y, spd) {
	var vec = this.get_move(x,y,spd);
	this.x += vec.x;
	this.y += vec.y;
	var maxPath = 10;
	for (var i = 1; i < maxPath; i++) {
		this.path[i-1] = this.path[i];
	}
	this.path.push([x, y, spd]);
};
Player.prototype.unmove = function () {
	var path = this.path[this.path.length-1];
	this.move(-path[0], -path[1], path[2]);
};
Player.prototype.colide_circle = function (x, y, r) {
	return dist(this.x, this.y, x, y) < (r + this.w/2);
};