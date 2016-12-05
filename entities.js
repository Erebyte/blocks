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
NPC.prototype.talk_to = function () {
	if (this.flags['talking'] !== true) {
		var strs = this.get_text();
		var win = windows.newWindow(strs, width/2, height*0.8, width*0.9, height/2*0.60);
		var kp_id = windows.kp.length;
		windows.kp.push(function (key) {
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


var Tree = function (pos) {
	TerrainEntity.call(this, {
		x:pos.x,
		y:pos.y
	});
	this.anm = function () {
		console.log("anm Tree");
	};
};
Tree.prototype.draw = function () {
	// console.log('tree',this.x,this.y);
	var p1x = this.x - 20;
	var p1y = this.y;
	var p2x = this.x;
	var p2y = this.y - 70;
	var p3x = this.x + 20;
	var p3y = this.y;
	push();
	// noStroke();
	stroke(255);
	fill(10);
	triangle(p1x,p1y,p2x,p2y,p3x,p3y);
	triangle(p1x,p1y,p2x,this.y+10,p3x,p3y);
	pop();
};
Tree.prototype.generate = function () {

};