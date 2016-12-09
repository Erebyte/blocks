var NPC = function (data) {
	GameEntity.call(this, data);

	this.gender = data.gender;
	this.npc_name = data.name + ' ' + data.surname;
	this.w = data.w || floor(random(20, 25));
	this.h = data.h || floor(random(35, 40));

	this.txt_ord = 0;

	this.flags = data.flags || {}; // should 'merge' not 'or'

	var h = data.hue || random(360);
	var s = 0;
	var b = 0;
	if (this.gender == 'male') {
		b = random(15, 50);
		s = random(20, 50);
		this.h+=floor(random(4));
	}else if (this.gender == 'female') {
		s = random(20, 50);
		b = random(50, 85);
		this.w-=floor(random(5));
		this.h+=floor(random(3));
	}else if (this.gender == 'boy') {
		s = random(50, 80);
		b = random(15, 50);
		b+=15;
		this.h-=floor(random(5))+5;
	}else if (this.gender == 'girl') {
		s = random(50, 80);
		b = random(50, 85);
		b+=15;
		this.h-=floor(random(5))+5;
	}
	this.color_h = h;
	this.color_s = s;
	this.color_b = b;
	
	// var names = [
	// 	'paul',
	// 	'larry',
	// 	'joe',
	// 	'merch',
	// 	'king',
	// 	'herold',
	// 	'bumbersnatch',
	// 	'your mum',
	// 	'mike hawk',
	// 	'bob',
	// 	'elisia woooooooooooooood'
	// ];
	// this.npc_name = names[round(random(names.length-1))];
};
NPC.prototype = Object.create(GameEntity.prototype);
NPC.prototype.draw = function () {
	colorMode(HSB, 360, 100, 100);
	fill(this.color_h, this.color_s, this.color_b);
	rect(this.x-this.w/2, this.y-this.h, this.w, this.h);
	colorMode(RGB, 255);
};
NPC.prototype.update = function () {
	if (keyIsDown(87)) {//w
		this.move(0, -1);
	}
	if (keyIsDown(83)){//s
		this.move(0, 1);
	}
	if (keyIsDown(65)){//a
		this.move(-1, 0);
	}
	if (keyIsDown(68)){//d
		this.move(1, 0);
	}
};
NPC.prototype.move = function (x, y) {
	var spd = this.attribs['speed'] + (this.flags['spd_buf'] || 0);
	this.x += x*spd;
	this.y += y*spd;
};
NPC.prototype.check = function () {
	if (this.flags['talking'] !== true) {
		var strs = this.get_text();
		var win = windows.newWindow(strs, width/2, height*0.8, width*0.9, height/2*0.60);
		var kp_id = windows.newKeyPress(function (key) {
			if (key == 'T') {
				windows.windows[win].next();
			}
		});
		var self = this;
		windows.windows[win].unload = function () {
			self.flags['talking'] = false;
			windows.kp[kp_id] = null;
		};
		this.flags['talking'] = true;
	}
};
NPC.prototype.do_check = function (p) {
	if (collidePointCircle(this.x,this.y,p.x,p.y,this.w/2+40)) {
		if (p.flags['check'] && p.flags['checking'] != this) {
			var old = p.flags['checking'];
			var old_dist = dist(p.x, p.y, old.x, old.y);
			var cur_dist = dist(p.x, p.y, this.x, this.y);
			if (cur_dist < old_dist) {
				p.flags['checking'] = this;
			}
		}else {
			p.flags['check'] = true;
			p.flags['checking'] = this;
		}
	}
};
NPC.prototype.get_text = function () {
	var index = this.txt_ord++ % this.data.text.default.length;
	var ret_text;
	var self = this;
	try {
		for (var prop in this.data.text) {
			if (prop == 'default' || this.flags['text_state'] === prop) {
				ret_text = this.data.text[prop][index];
			}
		}
		var objCallback = function (obj) {
			return function () {
				for (var func in obj) {
					if (typeof windows.flagFunctions[func] == 'function') {
						windows.flagFunctions[func](self, obj[func]);
					}
				}
			};
		};
		for (var i=0;i<ret_text.length;i++) {
			if (typeof ret_text[i] == 'object' && ret_text[i] !== null) {
				var obj = ret_text[i];
				ret_text[i] = objCallback(obj);
				// ret_text[i] = "function";

			}
		}
		return ret_text || ['Default text.'];
	}catch (err) {
		return ['Default text.'];
	}
};


var Tree = function (pos, w, size) {
	TerrainEntity.call(this, {
		x:pos.x,
		y:pos.y
	});
	size = size || 1;
	this.w = w || map(Math.random(),0,1,30,50);
	this.w = this.w*size;
	this.h = 60*size;
	this.sway = (Math.random()*2-1)*15;
	this.vertices = [];
	this.points = [];
	this.anm = function () {
		console.log("anm Tree");
	};
	this.generate();
};
Tree.prototype = Object.create(TerrainEntity.prototype);
Tree.prototype.draw = function () {
	// console.log('tree',this.x,this.y);
	push();
	// stroke(255);
	noStroke();
	// fill(204,153,0);
	colorMode(HSB, 360, 100, 100);
	for (var i = this.points.length - 1; i >= 0; i--) {
		var p = this.points[i];
		var s = p[2];
		fill(p[3],p[4],p[5]);
		ellipse(p[0],p[1],s,s);
	}
	colorMode(RGB, 255);

	stroke(10);
	fill(10);
	for (var i = this.vertices.length - 1;i >= 0; i--) {
		var p = this.vertices[i];
		triangle(p[0],p[1],p[2],p[3],p[4],p[5]);
	}
	pop();
};
Tree.prototype.check = function () {
	if (this.flags['talking'] !== true) {
		var strs = ['This is a tree...'];
		var win = windows.newWindow(strs, width/2, height*0.2, width*0.9, height/2*0.60);
		var kp_id = windows.newKeyPress(function (key) {
			if (key == 'T') {
				windows.windows[win].next();
			}
		});
		var self = this;
		windows.windows[win].unload = function () {
			self.flags['talking'] = false;
			windows.kp[kp_id] = null;
		};
		this.flags['talking'] = true;
	}
};
Tree.prototype.do_check = function (p) {
	if (collidePointCircle(this.x,this.y,p.x,p.y,this.w/2+40)) {
		if (p.flags['check'] && p.flags['checking'] != this) {
			var old = p.flags['checking'];
			var old_dist = dist(p.x, p.y, old.x, old.y);
			var cur_dist = dist(p.x, p.y, this.x, this.y);
			if (cur_dist < old_dist) {
				p.flags['checking'] = this;
			}
		}else {
			p.flags['check'] = true;
			p.flags['checking'] = this;
		}
	}
};
Tree.prototype.collide = function (px,py,pr) {
	var poly = [
		createVector(this.x - this.w/2, this.y),
		createVector(this.x, this.y+10),
		createVector(this.x + this.w/2, this.y),
		createVector(this.x, this.y-10)
	];
	return collideCirclePoly(px,py,pr,poly);
};
Tree.prototype._gen_branch = function (tri, angle, size) {
	size = size*0.7 || 20;
	var theta = angle * (Math.PI/180);
	var p1x = -1 * size * Math.sin(theta);
	var p1y = size * Math.cos(theta);
	var n = Math.random()/4 + 0.25;
	var p2x,p2y;
	if (theta*(180/Math.PI)<0) {
		p2x = tri[2] + (tri[4]-tri[2])*n;
		p2y = tri[3] + (tri[5]-tri[3])*n;
	}else {
		p2x = tri[2] + (tri[0]-tri[2])*n;
		p2y = tri[3] + (tri[1]-tri[3])*n;
	}
	var new_tri = [tri[2],tri[3],tri[2]+p1x,tri[3]-p1y,p2x,p2y];
	this.vertices.push(new_tri);
	if (size > 5) {
		this._gen_branch(new_tri, angle+Math.random()*40+20, size);
		this._gen_branch(new_tri, angle+-1*(Math.random()*40+20), size);
	}
	if (size < 15) {
		this.points.push([tri[2]+p1x,tri[3]-p1y,Math.random()*10+5,45,Math.random()*40+60,Math.random()*40+30]);
	}
};
Tree.prototype.generate = function () {
	var p1x = this.x - this.w/2;
	var p1y = this.y;
	var p2x = this.x + this.sway;
	var p2y = this.y - this.h;
	var p3x = this.x + this.w/2;
	var p3y = this.y;
	// triangle(p1x,p1y,p2x,p2y,p3x,p3y);
	// triangle(p1x,p1y,p2x,this.y+10,p3x,p3y);
	this.vertices.push([p1x,p1y,p2x,p2y,p3x,p3y]);
	this.vertices.push([p1x,p1y,this.x,this.y+10,p3x,p3y]);

	this._gen_branch([p1x,p1y,p2x,p2y,p3x,p3y], Math.random()*60+20);
	this._gen_branch([p1x,p1y,p2x,p2y,p3x,p3y], -1*(Math.random()*60+20));
	// console.log(this.vertices);
};


var Grass = function (pos, size) {
	TerrainEntity.call(this, {
		x:pos.x,
		y:pos.y
	});
	this.w = map(Math.random(),0,1,5,15);
	this.sway = map(Math.random(),0,1,-this.w/4,this.w/4);
	this.bush_size = size;
	this.points = [];
	this.leaves = [];

	var gen_point = function(angle, l) {
		// var t = angle * (PI/180);
		// return createVector(l*Math.sin(t),l*Math.cos(t));
		var p  = p5.Vector.fromAngle(radians(angle+90));
		p.mult(l);
		return p;
	};
	var gen_leaf = function(point, angle) {
		var size = Math.floor(map(Math.random(),0,1,10,20));
		var v = p5.Vector.fromAngle(radians(angle+90));
		v.mult(size);
		var p;
		if (Math.random()>0.5) {
			p = p5.Vector.fromAngle(radians(angle+90+30));
		}else {
			p = p5.Vector.fromAngle(radians(angle+90-30));
		}
		p.mult(size/2);
		v.add(point.x,point.y);
		p.add(point.x,point.y);
		return [point.x,point.y,v.x,v.y,p.x,p.y];
	};
	for (var i=0;i<=this.bush_size;i++) {
		var a = map(Math.random(),0,1,-15,15);
		var l = map(Math.random(),0,1,15,40);
		var p = gen_point(a,l);
		this.points.push(p);
		if(Math.random()<0.5 && l > 30) {
			this.leaves.push(gen_leaf(p, a));
		}
	}
	if (Math.random()<0.75) {
		var p = createVector(this.sway,10);
		var a = map(Math.random(),0,1,-50,50);
		this.leaves.push(gen_leaf(p, a));
	}
};
Grass.prototype = Object.create(TerrainEntity.prototype);
Grass.prototype.draw = function () {
	push();
	// draw lines
	for (var i = this.points.length - 1; i >= 0; i--) {
		var p = this.points[i];
		line(this.x, this.y, p.x+this.x, this.y-p.y);
	}
	// draw leaves
	fill(143, 143, 86);
	for (var i = this.leaves.length - 1; i >= 0; i--) {
		var l = this.leaves[i];
		triangle(this.x+l[0],this.y-l[1],this.x+l[2],this.y-l[3],this.x+l[4],this.y-l[5]);
	}
	// draw base
	stroke(32, 32, 19);
	fill(32, 32, 19);
	quad(this.x-this.w/2,this.y,this.x+this.sway,this.y-10,this.x+this.w/2,this.y,this.x,this.y+3);
	pop();
};