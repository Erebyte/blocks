/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Player -=-			   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/

var Grapple = function (parent) {
	this.parent = parent;
	this.is_out = false;
	this.pos=createVector();
	this.maxLen = 200;
	this.curLen=0;
	this.state=false;

	this.state_functions = {
		throw:function(g){
			var grapple_ud = true;
			var gr_h = 3;
			var vec = p5.Vector.sub(g._dest,g._start);
			var gravity = createVector(0,0,-0.3);
			var friction = vec.copy();
			friction.setMag(-2);

			vec.setMag(10);
			vec.z = gr_h+(g.pos.z*-0.3);
			g._ud_function = function () {
				g.is_sliding = false;
				if(grapple_ud) {
					if(p5.Vector.angleBetween(vec,friction)<=1 && g.pos.z<=0) grapple_ud=false;
					var g_vec = p5.Vector.sub(g.pos,createVector(g.parent.x,g.parent.y));
					var g_len = g_vec.mag();
					g_vec.normalize();
					if(g_len>g.maxLen && g.cooldown<=0){
						var s = vec.mag()*0.25;
						vec.x=-g_vec.x*s;
						vec.y=-g_vec.y*s;
					}
					g.pos.add(vec);
					vec.add(gravity);

					if(g.pos.z<=0 ) {
						g.pos.z=0;
						vec.add(friction);
						g.is_sliding = true;
					}
				}
			};
		},
		retract:function(g){
			var pos;
			var gr_h = 10;
			var c = 0;
			g._ud_function = function () {
				pos = g.pos;
				vec = createVector(g.parent.x-pos.x,g.parent.y-pos.y,0);
				// vec = createVector(0,0,0);
				vec.limit(20);
				vec.z = gr_h-(c*(c/3));
				c++;
				g.pos.add(vec);
				if(g.pos.z<=0){
					g.pos.z=0;
				}
				if(dist(g.parent.x,g.parent.y,pos.x,pos.y)<=10){
					g.is_out = false;
				}
			};
		},
		lock:function(g, obj){
			g.state = true;
			g.target_obj = this;
			var self = this;
			var pos = g.pos;
			var vec = p5.Vector.sub(pos, createVector(player.x,player.y));
			vec.limit(10);
			g._ud_function = function () {
				pos = g.pos;
				if(dist(pos.x,pos.y,obj.x,obj.y)>0.5){
					var d = p5.Vector.sub(createVector(obj.x,obj.y),pos);
					d.limit(7);
					vec.mult(0.6);
					vec.add(d);
					g.pos.add(vec);
				}else {
					g._ud_function=null;
				}
			};
		}
	};
};
Grapple.prototype.draw_debug = function () {
	if(this.is_out) {
		push();
		translate(width/2-camera.x, height/2-camera.y);
		var start = this._start;
		var dest = this._dest;
		var pos = this.pos;
		noFill();
		stroke(255,0,0);
		ellipse(this.parent.x,this.parent.y,this.maxLen*2,this.maxLen*2);
		line(start.x,start.y,dest.x,dest.y);
		line(pos.x,pos.y,pos.x,pos.y-pos.z);
		stroke(0,0,255);
		line(this.parent.x,this.parent.y,pos.x,pos.y-pos.z);
		pop();
	}
};
Grapple.prototype.grapple = function (mx,my) {
	if (this.is_out) {
		this._start = createVector(this.pos.x,this.pos.y);
		this.pos = createVector(this.pos.x,this.pos.y,this.pos.z);
	}else {
		this.is_out = true;
		this._start = createVector(this.parent.x,this.parent.y);
		this.pos = createVector(this.parent.x,this.parent.y,0);
	}
	this._dest = createVector(mx,my);
	this.state_functions.throw(this);
	this.state = false;
	this.target_obj = null;
	this.cooldown = 3;
};
Grapple.prototype.retract = function (delta) {
	console.log(delta);
	if (this.is_out) {
		if (delta >= 300 && this.cooldown<=0) {
			if (!this.state) {
				this.state_functions.retract(this);
			}else {
				this.state_functions.retract(this);
				// console.log('pull?');
				// var self = this;
				// var pos;
				// var plr_h = 10;
				// this.flags['grapple_state']=false;
				// this.flags['grapple_cooldown'] = 5;
				// this.flags['grapple_update']=function () {
				// 	pos = self.flags['grapple_pos'];
				// 	vec = createVector(pos.x-self.x,pos.y-self.y,0);
				// 	vec.setMag(10);
				// 	if (plr_h>0)vec.z = plr_h--;

				// 	if(dist(self.x,self.y,pos.x,pos.y)<=10){
				// 		self.flags['do_grapple']=false;
				// 	}else if(dist(self.x,self.y,pos.x,pos.y)<=50){
				// 		self.flags['grapple_state'] = false;
				// 		self.flags['grapple_obj'] = null;
				// 		self.flags['grapple_cooldown'] = 5;
				// 		var v = createVector(self.x-pos.x,self.y-pos.y,self.z-pos.z);
				// 		v.limit(10);
				// 		self.flags['grapple_pos'].add(v);
				// 	}else {
				// 		self.x += vec.x;
				// 		self.y += vec.y;
				// 		self.z += vec.z;
				// 		if(self.z<0)self.z=0;
				// 	}
				// };
			}

		}
	}
};
Grapple.prototype.update = function () {
	if(this.is_out) {
		if(this._ud_function)this._ud_function();
		this.cooldown--;

		var pos;
		var gvec;
		if(!this.state) {

			var self = this;
			pos = this.pos;
			var hits = [];
			var do_hit = function (e) {
				var hit_type;
				if(pos.z>0) {
					hit_type='air';
				}else if (pos.z === 0 && self.is_sliding) {
					hit_type = 'slide';
				}else if (pos.z === 0) {
					hit_type='ground';
				}
				if(e.grapple)e.grapple(hit_type);
				console.log('hit: '+hit_type,e.x,e.y);

			};
			for (var i = entities.length - 1; i >= 0; i--) {
				var e = entities[i];
				if(dist(e.x,e.y,pos.x,pos.y)<10+(e.w||10))hits.push(e);
			}
			for (i = hits.length - 1; i >= 0; i--) {
				do_hit(hits[i]);
				if(this.state===true)break;
			}

			gvec = createVector(pos.x-this.parent.x,pos.y-this.parent.y);
			if(gvec.mag()>this.maxLen) {
				gvec.limit(this.maxLen);
				this.pos = p5.Vector.add(createVector(this.parent.x,this.parent.y),gvec);
			}
		}else{
			pos = this.pos;
			gvec = createVector(this.parent.x-pos.x,this.parent.y-pos.y);
			if(gvec.mag()>this.maxLen) {
				gvec.limit(this.maxLen);
				var vec = p5.Vector.add(pos,gvec);
				this.parent.x = vec.x;
				this.parent.y = vec.y;
			}
		}
	}
};



// -=-=-=-=- Player -=-=-=- //
//
var Player = function () {
	this.player_name = "tommosfool";

	this.x = 100;
	this.y = 100;
	this.z = 0;
	this.w = 20;
	this.h = 40;
	this.gender = 'male';
	this.color_h = 70;
	this.color_s = 10;
	this.color_b = 100;

	this.party_members = [];
	this.grapple = new Grapple(this);

	this.flags = {
		'noclip' : false
	};
	this.attribs = {
		"health" : 20,
		"speed" : 3
	};
	this.path = [];

	this._debug = false;
};

// -=-  Player Functions -=- //
Player.prototype.draw = function () {
	colorMode(HSB, 360, 100, 100);
	fill(this.color_h, this.color_s, this.color_b);
	rect(this.x-this.w/2, this.y-this.h-this.z, this.w, this.h);
	colorMode(RGB, 255);
	if (this.flags['check'] === true) {
		fill(255);
		ellipse(this.x-this.w/2, this.y-this.h-this.z, this.w, this.w);
	}
	if (this.grapple.is_out) {
		var pos = this.grapple.pos;
		fill(200);
		line(pos.x,pos.y-pos.z,this.x,this.y-10-this.z);
		ellipse(pos.x,pos.y-pos.z,5,5);
	}
};
Player.prototype.keyPressed = function (key) {
	if (key == 'T' && this.flags['check']) {
		this.flags['checking'].check();
	}
};
Player.prototype.mouseWheel = function (delta) {
	this.grapple.retract(delta);
};
Player.prototype.mousePressed = function (mx,my) {
	this.grapple.grapple(mx,my);
};
Player.prototype.draw_debug = function () {
	this.grapple.draw_debug();
};
Player.prototype.toggleDebug = function () {
	this._debug = !this._debug;
};
Player.prototype.update = function () {
	if(!windows.open_window) {
		this.grapple.update();

		if(this.z>0){
			this.z -= 5;
			if (this.z <= 0)this.z=0;
		}

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