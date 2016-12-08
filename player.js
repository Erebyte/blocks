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
	if (this.flags['talk_to'] === true) {
		fill(255);
		ellipse(this.x-this.w/2, this.y-this.h, this.w, this.w);
	}
};
Player.prototype.keyPressed = function (key) {
	if (key == 'T' && this.flags['talk_to']) {
		this.flags['talk_to_npc'].talk_to();
	}
};
Player.prototype.update = function () {
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
	this.move(mx, my);
	if (this.collide(mx,my)) {
		this.unmove();
		// this.move(mx,my);
	}
	
	// this.flags['talk_to'] = false;
	// this.flags['talk_to_npc'] = null;
	// var unmoved = false;
	// for (var i = npcs.length - 1; i >= 0; i--) {
	// 	var x = npcs[i].x;
	// 	var y = npcs[i].y;
	// 	if (this.colide_circle(x, y, npcs[i].w/2)) { // move to begining 
	// 		this.unmove();
	// 		unmoved = true;
	// 	}
	// 	if (this.colide_circle(x, y, npcs[i].w/2+20)) {
	// 		if (this.flags['talk_to'] && (this.flags['talk_to_npc'] != npcs[i])) {
	// 			var old = this.flags['talk_to_npc'];
	// 			var cur = npcs[i];
	// 			var old_dist = dist(this.x, this.y, old.x, old.y);
	// 			var cur_dist = dist(this.x, this.y, cur.x, cur.y);
	// 			if (cur_dist < old_dist) {
	// 				this.flags['talk_to_npc'] = cur;
	// 			}
	// 		}else {
	// 			this.flags['talk_to'] = true;
	// 			this.flags['talk_to_npc'] = npcs[i];
	// 		}
	// 	}
	// }
	// if (unmoved === false && terrain.colide(this.x, this.y, this.w/2) && !this.flags['noclip']) {
	// 	console.log('collllllllide');
	// 	this.unmove();
	// 	unmoved = true;
	// }
	// if (unmoved === false && windows.open_window) {
	// 	this.unmove();
	// 	unmoved = true;
	// }
};
Player.prototype.collide = function (vx,vy) {
	var res;
	res = terrain.collide(this.x,this.y,this.w,vx,vy);
	if(res)return true;

	for (var i = entities.length - 1; i >= 0; i--) {
		if (collidePointPoint(this.x,this.y,entities[i].x,entities[i].y,200)) {
			res = entities[i].collide(this.x,this.y,this.w);
			if(res)return true;
		}
	}
	return false;
};
Player.prototype.move = function (x, y, spd) {
	spd = spd || this.attribs['speed'] + (this.flags['spd_buf'] || 0);
	this.x += x*spd;
	this.y += y*spd;
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