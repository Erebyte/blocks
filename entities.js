/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
//				-=- Entities -=-			//
//											//
// all entities must be a subclass of		//
// GameEntiy or TerrainEntity				//
//											//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=	//
*/

// -=-=-=-=- NPC -=-=-=- 
//
// Args:
// -----
//
// data:{
//		x:pos.x
//		y:pos.y
//		gender:'male'||'female'||'boy'||'girl'
//		name:<string>
//		surname:<string>
//		[w:width]
//		[h:height]
//		[flags:<obj(dict)>]
// }
//
var NPC = function (data) {
	GameEntity.call(this, data);

	this.gender = data.gender;
	this.npc_name = data.name + ' ' + data.surname;
	this.w = data.w || floor(random(20, 25));
	this.h = data.h || floor(random(35, 40));

	this.txt_ord = 0;

	this.flags = Object.assign({}, data.flags);
	this.attribs = Object.assign({
			'speed':2
		}, this.attribs);

	var h = data.hue || random(360);
	var s = 0;
	var b = 0;
	if (this.gender == 'male') {
		s = random(20, 50);
		b = random(15, 50);
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

	this.debug_data = [];
};
NPC.prototype = Object.create(GameEntity.prototype);

// -=- Functions -=- //
NPC.prototype.draw = function () {
	colorMode(HSB, 360, 100, 100);
	fill(this.color_h, this.color_s, this.color_b);
	rect(this.x-this.w/2, this.y-this.h, this.w, this.h);
	colorMode(RGB, 255);
};
NPC.prototype.update = function () {
	var vec = this.AI.movePathVector();
	if(vec && !this.flags['talking']) this.move(vec.x,vec.y);
};
NPC.prototype.move = function (x, y) {
	var spd = this.attribs['speed'] + (this.flags['spd_buf'] || 0);
	this.x += x*spd;
	this.y += y*spd;
};
NPC.prototype.check = function () {
	if (this.flags['talking'] !== true) {
		var strs = this.get_text();
		var self = this;
		var win = windows.newSimple(strs, width/2, height*0.8, width*0.9, height/2*0.60, function (){self.flags['talking'] = false;});
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
	var index = this.txt_ord;
	var ret_text;
	var ret_prop;
	var self = this;
	if (this.flags['override_text']) return [this.flags['override_text']];
	try {
		for (var prop in this.data.text) {
			if (prop == 'default' || this.flags['text_state'] === prop) {
				ret_text = this.data.text[prop][index];
				ret_prop = prop;
			}
			if (prop.slice(0,1)=='#' && game.flags[prop.slice(1)] === true) {
				ret_text = this.data.text[prop][index];
				ret_prop = prop;
			}
		}
		if(index >= this.data.text[ret_prop].length) {
			this.txt_ord = 0;
			return this.get_text();
		}
		var objCallback = function (obj) {
			return function (w) {
				for (var func in obj) {
					if (typeof windows.flagFunctions[func] == 'function') {
						windows.flagFunctions[func](self, w, obj[func]);
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
		if(this.flags['repeatln']!==true) {
			this.txt_ord++;
			if(index >= this.data.text[ret_prop].length-1)this.txt_ord = 0;
		}
		return ret_text || ['Default text.'];
	}catch (err) {
		console.log(err);
		return ['Default text.'];
	}
};



// -=-=-=-=- Rat -=-=-=- 
//
//
var Rat = function (pos, size) {
	GameEntity.call(this, {
		x:pos.x,
		y:pos.y
	});

	this.size = size || random(0.75,1.5);
	this.tail_len = floor(random(5,15)*this.size);

	this.attribs = Object.assign({
			'speed':random(4,6)*(1/this.size)
		}, this.attribs);

	this.path_history = [];
	this.facing_dir = createVector(1,0);

	this.rotation_direction = 1; //-1 || 1
	this.circleing_radius = random(100,200);

};
Rat.prototype = Object.create(GameEntity.prototype);

// -=- functions -=- //
Rat.prototype.move = function (x, y) {
	var spd = this.attribs['speed'] + (this.flags['spd_buf'] || 0);
	this.x += x*spd;
	this.y += y*spd;

	//draw stuff
	this.path_history.push([this.x,this.y]);
	this.facing_dir = createVector(x,y);
	this.facing_dir.normalize();
	if(this.path_history.length > this.tail_len) {
		this.path_history = this.path_history.slice(1);
	}// end
};
Rat.prototype.draw = function () {
	var w = this.size * 5;
	var h = this.size * 15;
	var s = this.size * 7;
	push();
	push();
	translate(this.x,this.y);
	rotate(this.facing_dir.heading()+PI/2);
	noStroke();
	fill(41, 17, 66);
	ellipse(-w/2,-h*0.9,s,s);
	ellipse(w/2,-h*0.9,s,s);
	stroke(0);
	fill(103, 25, 103);
	triangle(-w,0,0,-h,w,0);
	pop();
	noFill();
	beginShape();
	for (var i = this.path_history.length - 1; i >= 0; i-=5) {
		var v = this.path_history[i];
		vertex(v[0],v[1]);
	}
	endShape();
	pop();
};
Rat.prototype.update = function () {
	var dest = this.AI.getPathDestination();
	if(dist(dest[0],dest[1],player.x,player.y) > 100) {
		this.AI.pathPush([player.x, player.y]);
	}else if (dist(this.x,this.y,player.x,player.y) < this.circleing_radius+random(-20,20)){
		var vec = this.AI.movePathVector();
		if (vec && dist(this.x,this.y,player.x,player.y) < 30){
			this.AI.clearPath();
			if(random()<0.25)this.rotation_direction*=-1;
		}
		if (vec) {
			this.move(vec.x, vec.y);
		}else {
			var d = createVector(player.x-this.x,player.y-this.y);
			d.rotate(radians(95*this.rotation_direction));
			d.normalize();
			this.move(d.x,d.y);
		}
	}else {
		var vec = this.AI.movePathVector();
		if(vec)this.move(vec.x, vec.y);
	}
};
Rat.prototype.grapple = function (state) {
	if(state=='air' || state == 'slide') {
		entities.splice(entities.indexOf(this),1);
	}
};


// -=-=-=-=- POST -=-=-=- //
//
// Args:
// ----
// 
// pos:<vector2>
// w:<int(width)> (default:range 30,50)
// size:<int> (default:1)
//
var Post = function (pos) {
	TerrainEntity.call(this, {
		x:pos.x,
		y:pos.y
	});
	this.sway = random(-5,5);
	// this.sway = -5;
	this.h = random(20,30);
};
Post.prototype = Object.create(TerrainEntity.prototype);

// -=- Functions -=- //
Post.prototype.draw = function () {
	push();
	var ps = [
		createVector(this.x-10,this.y+6),
		createVector(this.x-10-this.sway,this.y-6),
		createVector(this.x+10-this.sway,this.y-6),
		createVector(this.x+10,this.y+6)
	];
	fill(120);
	quad(ps[0].x,ps[0].y,ps[1].x,ps[1].y,ps[2].x,ps[2].y,ps[3].x,ps[3].y);
	
	ps = [
		createVector(this.x-5,this.y),
		createVector(this.x-5-this.sway,this.y-this.h-this.sway),
		createVector(this.x+5-this.sway,this.y-this.h),
		createVector(this.x+5,this.y)
	];
	fill(86, 63, 41);
	quad(ps[0].x,ps[0].y,ps[1].x,ps[1].y,ps[2].x,ps[2].y,ps[3].x,ps[3].y);
	pop();
};
Post.prototype.grapple = function (state) {
	if(player.grapple.target_obj != this && player.grapple.cooldown<=0) {
		player.grapple.state_functions.lock(player.grapple,this);
	}
	// 	player.flags['grapple_state'] = true;
	// 	player.flags['grapple_obj'] = this;
	// 	var self = this;
	// 	var pos = player.flags['grapple_pos'];
	// 	var vec = p5.Vector.sub(pos, createVector(player.x,player.y));
	// 	vec.limit(10);
	// 	player.flags['grapple_update'] = function () {
	// 		pos = player.flags['grapple_pos'];
	// 		if(dist(pos.x,pos.y,self.x,self.y)>0.5){
	// 			var d = p5.Vector.sub(createVector(self.x,self.y),pos);
	// 			d.limit(7);
	// 			vec.mult(0.6);
	// 			vec.add(d);
	// 			player.flags['grapple_pos'].add(vec);
	// 		}else {
	// 			player.flags['grapple_update']=null;
	// 		}

	// 	};
	// 	console.log('grapple to post');
	// }
};




// -=-=-=-=- TREE -=-=-=- //
//
// Args:
// ----
// 
// pos:<vector2>
// w:<int(width)> (default:range 30,50)
// size:<int> (default:1)
//
var Tree = function (pos, w, size) {
	TerrainEntity.call(this, {
		x:pos.x,
		y:pos.y
	});
	this.size = size = size || random(1,1.5);
	this.w = w || random(30,50);
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

// -=- Functions -=- //
Tree.prototype.draw = function () {
	push();
	noStroke();
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
	if (this.flags['checking'] !== true) {
		var self = this;
		var strs = ['This is a tree...'];
		var win = windows.newSimple(strs, width/2, height*0.2, width*0.9, height/2*0.60, function () {self.flags['checking'] = false;});
		this.flags['checking'] = true;
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
		this.points.push([tri[2]+p1x,tri[3]-p1y,Math.random()*10+5,45,Math.random()*40+60,Math.random()*40+30]); // x,y,s, h,s,b
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

	this._gen_branch([p1x,p1y,p2x,p2y,p3x,p3y], Math.random()*60+20, this.size*20);
	this._gen_branch([p1x,p1y,p2x,p2y,p3x,p3y], -1*(Math.random()*60+20), this.size*20);
	// console.log(this.vertices);
};


// -=-=-=-=- GRASS -=-=-=- //
//
// Args:
// ----
// 
// pos:<vector2>
// size:<int>
//
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

	// functions //
	var gen_point = function(angle, l) {
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

	// generation //
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

// -=- Functions -=- //
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



// -=-=-=-=- Tombstone -=-=-=- //
//
// Args:
// ----
// 
// pos:<vector2>
// typ:<int:0,3>
//
var Tombstone = function (pos, typ) {
	TerrainEntity.call(this, {
		x:pos.x,
		y:pos.y
	});
	console.log(typ);
	if(typ !== null){ // cause or picks greater?
		this.typ = typ;
	}else{
		this.typ = random([0,1,2,3]);
	}
	this.col = Math.floor(random(50,120));
	this.w = random(20,25);
	this.h = random(30,40);
	this.sway = random(-this.w/4,this.w/4);
};
Tombstone.prototype = Object.create(TerrainEntity.prototype);

// -=- Functions -=- //
Tombstone.prototype.draw = function () {
	var p1 = createVector(this.x-this.w/2,this.y);
	var p2 = createVector(this.x-this.w/2+this.sway-5,this.y-this.h-this.sway);
	var p3 = createVector(this.x+this.w/2+this.sway+5,this.y-this.h+this.sway);
	var p4 = createVector(this.x+this.w/2,this.y);
	push();
	fill(this.col);
	switch (this.typ) {
		case 0:
			quad(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y,p4.x,p4.y);
			break;
		case 1:
			beginShape();
			vertex(p1.x,p1.y);
			vertex(p2.x,p2.y);
			vertex(this.x+this.sway/2,this.y-this.h-10);
			vertex(p3.x,p3.y);
			vertex(p4.x,p4.y);
			endShape(CLOSE);
			break;
		case 2:
			var v1 = p5.Vector.sub(p2,p1);
			var v2 = p5.Vector.sub(p3,p4);
			v1.mult(0.6);
			v2.mult(0.6);
			var p5_ = p5.Vector.add(p2,v1);
			var p6 = p5.Vector.add(p3,v2);
			beginShape();
			vertex(p1.x,p1.y);
			vertex(p2.x,p2.y);
			bezierVertex(p5_.x,p5_.y,p6.x,p6.y,p3.x,p3.y);
			vertex(p4.x,p4.y);
			endShape(CLOSE);
			break;
		case 3:
			beginShape();
			vertex(p1.x,p1.y);
			vertex(p2.x,p2.y);
			vertex(this.x+this.sway/2,this.y-this.h-20);
			vertex(p3.x,p3.y);
			vertex(p4.x,p4.y);
			endShape(CLOSE);
			ellipse(this.x+this.sway/2, this.y-this.h-20, this.w, this.w);
			break;
	}
	pop();
};
Tombstone.prototype.check = function () {
	if (this.flags['checking'] !== true) {
		var self = this;
		var strs = ['This is a tombstone...','It reads:\nRest In Peace\nHere lies Mike "the longest" hawk'];
		var win = windows.newSimple(strs, width/2, height*0.2, width*0.9, height/2*0.60, function () {self.flags['checking'] = false;});
		this.flags['checking'] = true;
	}
};
Tombstone.prototype.do_check = function (p) {
	if (collidePointCircle(this.x,this.y,p.x,p.y,50)) {
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
