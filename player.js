/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Player -=-			   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/


// -=-=-=-=- Player -=-=-=- //
//
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

	this.party_members = [];

	this.flags = {
		'noclip' : false
	};
	this.attribs = {
		"health" : 20,
		"speed" : 3,
		"grapple_len" : 200
	};
	this.path = [];

	this._debug = false;
};

// -=-  Player Functions -=- //
Player.prototype.draw = function () {
	colorMode(HSB, 360, 100, 100);
	fill(this.color_h, this.color_s, this.color_b);
	rect(this.x-this.w/2, this.y-this.h, this.w, this.h);
	colorMode(RGB, 255);
	if (this.flags['check'] === true) {
		fill(255);
		ellipse(this.x-this.w/2, this.y-this.h, this.w, this.w);
	}
	if (this.flags['do_grapple']) {
		var pos = this.flags['grapple_pos'];
		fill(200);
		line(pos.x,pos.y-pos.z,this.x,this.y-10);
		ellipse(pos.x,pos.y-pos.z,5,5);
	}
};
Player.prototype.keyPressed = function (key) {
	if (key == 'T' && this.flags['check']) {
		this.flags['checking'].check();
	}
};
Player.prototype.mouseWheel = function (delta) {
	console.log(delta);
	if (this.flags['do_grapple']) {
		if (delta >= 300) {
			var self = this;
			var pos;
			var gr_h = 10;
			var c = 0;
			this.flags['grapple_update'] = function () {
				pos = self.flags['grapple_pos'];
				vec = createVector(self.x-pos.x,self.y-pos.y,0);
				// vec = createVector(0,0,0);
				vec.limit(20);
				vec.z = gr_h-(c*(c/3));
				c++;
				self.flags['grapple_pos'].add(vec);
				if(self.flags['grapple_pos'].z<=0){
					self.flags['grapple_pos'].z=0;
				}
				if(dist(self.x,self.y,pos.x,pos.y)<=10){
					self.flags['do_grapple'] = false;
				}
			};

		}else {

		}
	}
};
Player.prototype.mousePressed = function (mx,my) {
	var zoff = 0;
	if (this.flags['do_grapple']===true) {
		var p = this.flags['grapple_pos'];
		zoff = p.z*-0.3;
		this.flags['grapple_click_start'] = createVector(p.x,p.y);
		this.flags['grapple_pos'] = createVector(p.x,p.y,p.z);
	}else {
		this.flags['do_grapple'] = true;
		this.flags['grapple_click_start'] = createVector(this.x,this.y);
		this.flags['grapple_pos'] = createVector(this.x,this.y,0);
	}
	this.flags['grapple_click_dest'] = createVector(mx,my);
	var self = this;
	var grapple_ud = true;
	var gr_h = 3;
	var vec = p5.Vector.sub(this.flags['grapple_click_dest'],this.flags['grapple_click_start']);
	var gravity = createVector(0,0,-0.3);
	var friction = vec.copy();
	friction.setMag(-2);
	vec.setMag(10);
	vec.z = gr_h+zoff;
	this.flags['grapple_update'] = function () {
		self.flags['grapple_slide'] = false;
		if(grapple_ud) {
			if(p5.Vector.angleBetween(vec,friction)<=1 && self.flags['grapple_pos'].z<=0) grapple_ud=false;
			var g_vec = p5.Vector.sub(self.flags['grapple_pos'],createVector(self.x,self.y));
			var g_len = g_vec.mag();
			g_vec.normalize();
			if(g_len>self.attribs['grapple_len']){
				var s = vec.mag()*0.25;
				vec.x=-g_vec.x*s;
				vec.y=-g_vec.y*s;
			}
			self.flags['grapple_pos'].add(vec);
			vec.add(gravity);

			if(self.flags['grapple_pos'].z<=0 ) {
				self.flags['grapple_pos'].z=0;
				vec.add(friction);
				self.flags['grapple_slide'] = true;
			}
		}
	};
};
Player.prototype.draw_debug = function () {
	if(this.flags['do_grapple']) {
		push();
		translate(width/2-camera.x, height/2-camera.y);
		var start = this.flags['grapple_click_start'];
		var dest = this.flags['grapple_click_dest'];
		var pos = this.flags['grapple_pos'];
		noFill();
		stroke(255,0,0);
		ellipse(this.x,this.y,this.attribs['grapple_len']*2,this.attribs['grapple_len']*2);
		line(start.x,start.y,dest.x,dest.y);
		line(pos.x,pos.y,pos.x,pos.y-pos.z);
		stroke(0,0,255);
		line(this.x,this.y,pos.x,pos.y-pos.z);
		pop();
	}
};
Player.prototype.toggleDebug = function () {
	this._debug = !this._debug;
};
Player.prototype.update = function () {
	if(!windows.open_window) {
		this.update_grapple();

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
	for (var i = this.party_members.length - 1; i >= 0; i--) {
		var mem = this.party_members[i];
		var dis = dist(this.x,this.y,mem.x,mem.y);
		var fd = mem.flags['follow_dist'];
		if(dis > fd+random(50,150)) { // outside fd
			if (mem.flags['move_path']) {
				var dest = mem.flags['move_path'][mem.flags['move_path'].length-1];
				dis = dist(this.x,this.y,dest[0],dest[1]);
				if(dis > fd) {
					mem.flags['move_path'].push([this.x,this.y]);
				}
			}else {
				mem.flags['do_move'] = true;
				mem.flags['move_cur'] = 0;
				mem.flags['move_path'] = [[this.x,this.y]];
				mem.flags['move_cb'] = function () {};
			}
		}else if(dis < fd) { // inside fd
			mem.flags['do_move'] = false;
			mem.flags['move_path'] = null;
			mem.flags['move_cb'] = null;
		}
	}
};
Player.prototype.update_grapple = function () {
	if(this.flags['do_grapple']) {
		if(this.flags['grapple_update'])this.flags['grapple_update']();

		var self = this;
		var pos = this.flags['grapple_pos'];
		var hits = [];
		var do_hit = function (e) {
			var hit_type;
			if(pos.z>0) {
				hit_type='air';
			}else if (pos.z === 0 && self.flags['grapple_slide']) {
				hit_type = 'slide';
			}else if (pos.z === 0) {
				hit_type='ground';
			}
			console.log('hit: '+hit_type,e.x,e.y);

		};
		for (var i = entities.length - 1; i >= 0; i--) {
			var e = entities[i];
			if(dist(e.x,e.y,pos.x,pos.y)<10+(e.w||10))hits.push(e);
		}
		for (i = hits.length - 1; i >= 0; i--) {
			do_hit(hits[i]);
		}
	}
};
Player.prototype.collide = function (vec) {
	var ret = false;
	var mv;
	var result;
	result = terrain.collide(this.x,this.y,this.w,vec.x,vec.y);
	if(result){
		if(result !== true) {
			vec = result;
			mv = true;
		}
		ret = true;
	}

	for (var i = entities.length - 1; i >= 0; i--) {
		if (collidePointPoint(this.x,this.y,entities[i].x,entities[i].y,200)) {
			result = entities[i].collide(this.x+vec.x,this.y+vec.y,this.w);
			if(result){
				ret = true;
				mv = false;
			}
		}
	}
	if(mv)this.move(vec.x,vec.y,1);
	return ret;
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
	this.path.push([x, y, spd]);
	if (this.path.length>maxPath) {
		this.path = this.path.slice(1);
	}
};
Player.prototype.unmove = function () {
	var path = this.path[this.path.length-1];
	this.move(-path[0], -path[1], path[2]);
};
Player.prototype.colide_circle = function (x, y, r) {
	return dist(this.x, this.y, x, y) < (r + this.w/2);
};