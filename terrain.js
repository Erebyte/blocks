/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Terrain -=-			   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/


// -=-=-=-=- TerrainEntity -=-=-=- //
//
// Args:
// ----
// 
// entity_data:(see GameEntity)
//
var TerrainEntity = function (entity_data) {
	GameEntity.call(this, entity_data);
};
TerrainEntity.prototype = Object.create(GameEntity.prototype);


// -=-=-=-=- Fog -=-=-=- //
//
// The ambient light around the player
//
// NOTE: lights need to go in here too
//
var Fog = function () {
	this.depth = 10;
	this.tri = [
		//clock wise
		[658, 265, 229, 536, 160, 114],
		[347, 81, 664, 448, 71, 401],
		[308, 41, 675, 222, 361, 535],
		[65, 277, 583, 126, 539, 443],
		[179, 105, 676, 254, 251, 554],
		[64, 192, 643, 130, 421, 522],
		[64, 259, 469, 76, 538, 483],
		[165, 441, 249, 57, 644, 368],
		[246, 460, 182, 134, 632, 271],
		[378, 541, 113, 283, 462, 90],
		[515, 501, 167, 444, 361, 122],
		[587, 309, 187, 491, 173, 145],
		[614, 265, 251, 500, 166, 138],
		[639, 258, 247, 513, 164, 124],
		[564, 157, 508, 491, 112, 345],
		[317, 113, 516, 476, 101, 432],
		[506, 155, 431, 488, 130, 394],
		[494, 151, 482, 417, 126, 389],
		[396, 130, 530, 456, 84, 383],
		[404, 91, 571, 497, 129, 325],
		[478, 95, 619, 390, 188, 393],
		[289, 126, 671, 435, 229, 483],
		[190, 213, 535, 217, 247, 497],
		[22, 155, 531, 170, 544, 408],
		[66, 349, 500, 15, 611, 382],
		[111, 360, 512, 19, 627, 479],
		[88, 380, 498, 77, 544, 421],
		[24, 355, 498, 93, 761, 452],
		[161, 429, 444, 110, 618, 479],
		[241, 406, 498, 136, 504, 483],
		[184, 354, 312, 68, 580, 512],
		[299, 384, 415, 184, 558, 348],
		[429, 524, 245, 288, 458, 127],
		[575, 519, 220, 385, 340, 151],
		[679, 541, 211, 408, 379, 148],
		[553, 458, 209, 371, 383, 103],
		[507, 337, 194, 395, 378, 138],
		[632, 424, 141, 411, 359, 147],
		[548, 418, 177, 405, 388, 126],
		[566, 403, 159, 375, 385, 121],
		[522, 408, 144, 392, 423, 116],
		[388, 74, 501, 328, 235, 315],
		[455, 67, 544, 384, 254, 317],
		[369, 121, 543, 404, 207, 370],
		[353, 112, 544, 346, 173, 357],
		[247, 135, 547, 336, 188, 377],
		[339, 108, 554, 332, 164, 432],
		[457, 121, 586, 377, 148, 391],
		[482, 73, 619, 390, 114, 378],
		[386, 49, 593, 394, 17, 399],
		[215, 86, 591, 387, 388, 427],
		[284, 153, 604, 212, 402, 420],
		[123, 166, 583, 143, 478, 430],
		[205, 199, 633, 177, 441, 409],
		[229, 289, 557, 112, 591, 401],
		[243, 309, 444, 88, 590, 492],
		[316, 395, 353, 136, 589, 377],
		[324, 399, 357, 114, 613, 327],
		[343, 419, 314, 131, 626, 216],
		[195, 419, 274, 125, 608, 404],
		[263, 420, 257, 135, 619, 248],
		[290, 478, 220, 173, 655, 143],
		[429, 396, 231, 201, 537, 165],
		[404, 441, 183, 209, 515, 59],
		[539, 430, 150, 326, 469, 24],
		[563, 322, 233, 371, 353, 139],
		[548, 313, 265, 362, 288, 94],
		[474, 128, 468, 387, 249, 319]
		// No-good triangles //
		// [519, 173, 569, 537, 210, 396], //
		// [203, 443, 578, 85, 627, 365], //
		// [229, 453, 431, 208, 638, 483], //
		// [235, 415, 445, 198, 553, 402], //
		// [302, 132,471, 421,263, 350], //
		// [394, 176,549, 256,400, 385], //
		// [268, 268,578, 71,424, 322], //
		// [621, 441,225, 470,444, 210], //
		// [556, 235,471, 372,255, 260], //
	];
	this.tris = [];
};

// -=- Fog Function -=- //
Fog.prototype.draw = function (plr,cmr) {
	var xoff = plr.x-cmr.x+20;
	var yoff = plr.y-cmr.y-20;
	this.update();
	push();
	fill(0,0,0,20);
	noStroke();
	for (var i = this.tris.length - 1; i >= 0; i--) {
		var p = this.tri[this.tris[i]];
		beginShape();
		vertex(0,0);
		vertex(0,height);
		vertex(width,height);
		vertex(width,0);
		beginContour();
		push();
		vertex(p[0]+xoff,p[1]+yoff);
		vertex(p[2]+xoff,p[3]+yoff);
		vertex(p[4]+xoff,p[5]+yoff);
		pop();
		endContour();
		endShape();
	}
	pop();
};
Fog.prototype.update = function () {
	if (Math.random()<=0.001) {
		this.tris.splice(Math.floor(random(0, this.tris.length)), 1);
	}
	while (this.tris.length <= this.depth) {
		this.tris.push(Math.floor(random(0, this.tri.length)));
	}
};


// -=-=-=-=- Terrain -=-=-=- //
//
// Handles loading and drawing terrain, 
//     and handles terrain collision.
//
var Terrain = function () {
	this._debug = false;
	this._debug_dat = [];
	this.map_data = [];
	this.fog = new Fog();

};

// -=- Terrain Functions -=- //
Terrain.prototype.setFog_depth = function (depth) {
	this.fog.depth = depth;
};
Terrain.prototype.toggleDebug = function () {
	this._debug = !this._debug;
};
Terrain.prototype.draw = function (xoff, yoff) {
	push();
	translate(width/2-camera.x, height/2-camera.y);
	if(!this.map_data.inverted){
		background(90);
		fill(30);
	}else{
		background(30);
		fill(90);
	}
	for (pi=0;pi<this.poly.length;pi++){
		var poly = this.poly[pi];
		beginShape();
		for(i=0; i < poly.length; i++){
			vertex(poly[i].x,poly[i].y);
		}
		endShape(CLOSE);
	}
	pop();
};
Terrain.prototype.draw_debug = function () {
	push();
	translate(width/2-camera.x, height/2-camera.y);
	noFill();
	stroke(0,255,0);
	ellipse(player.x,player.y,1,1);
	ellipse(player.x,player.y,player.w,player.w);
	for (var i = this._debug_dat.length - 1; i >= 0; i--) {
		var ln = this._debug_dat[i];
		if (ln.length===3) {
			stroke(ln[2].x,ln[2].y,ln[2].z);
			line(ln[0].x,ln[0].y,ln[1].x,ln[1].y);
		}else if (ln.length===2) {
			stroke(ln[1].x,ln[1].y,ln[1].z);
			ellipse(ln[0].x,ln[0].y,ln[0].z,ln[0].z);
		}
	}
	pop();
};
Terrain.prototype.collide = function (px, py, pr, vx, vy) {
	// BUG: hug accute convex corner (zig zag)
	var get_radius_vector = function (c,n,r) {
		// return normal vector to line at length r
		var v = p5.Vector.sub(c,n);
		v.rotate(radians(-90));
		v.normalize();
		v.mult(r);
		return v;
	};
	if(this._debug)this._debug_dat = [];
	for (var i = this.poly.length - 1; i >= 0; i--) {
		// for each poly
		var poly = this.poly[i];
		if (collideCirclePoly(px+vx,py+vy,pr,poly) === true) {
			var last_mv;
			var next = 0;
			for (var cur = 0; cur<poly.length;cur++) {
				// for each line
				// v:vector p:point r:radius
				next = cur+1;
				if (next == poly.length) next = 0;
				var vc = poly[cur];    // c for "current"
				var vn = poly[next];   // n for "next"
				var col;
				col = collidePointCircle(vc.x,vc.y,px+vx,py+vy,pr);
				if (col) { // if collide corner
					var prev = cur-1;
					if(cur===0)prev=poly.length-1;
					var vp = poly[prev]; // p for "previous"
					var nrv = get_radius_vector(vc,vn,pr/2);
					var prv = get_radius_vector(vp,vc,pr/2);
					
					var p1 = createVector(px,py);
					var pd = p5.Vector.add(p1,createVector(vx,vy));
					var vp2 = p5.Vector.sub(pd,vc);
					vp2.normalize();
					vp2.mult(pr/2);
					var p2 = p5.Vector.add(vp2,vc);
					
					if(this._debug){
						var v = vc.copy();
						v.z = pr;
						this._debug_dat.push([v,createVector(0,0,255)]);
						this._debug_dat.push([v,p2,createVector(0,255,0)]);
						this._debug_dat.push([v,p5.Vector.add(v,nrv),createVector(255,0,0)]);
						this._debug_dat.push([v,p5.Vector.add(v,prv),createVector(255,0,0)]);
					}
					// end case
					var an = degrees(nrv.heading()+2*PI);
					var ap = degrees(prv.heading()+2*PI);
					var ad = degrees(vp2.heading()+2*PI);
					if(an<360)an+=360;
					if(ap<360)ap+=360;
					if(ad<360)ad+=360;

					if(an>ap)ap+=360; // if bounding angles cross
					if(ap>=ad+360&&ad+360>=an)ad+=360; //if d angle is cross
					
					if(this._debug) {
						console.log(an,ap,ad);
						console.log(ap-an);
						if(ap>=ad&&ad>=an&&ap-an<180)console.log('hit');
					}
					// ap>ad>an && angle between an,ap < 180w
					if(ap>=ad&&ad>=an&&ap-an<180)return p5.Vector.sub(p2,p1);
				}

				col = collideLineCircle(vc.x,vc.y, vn.x,vn.y, px+vx,py+vy,pr);
				if (col) { // if collide line
					// calculations
					var d = last_mv || createVector(vx,vy);
					var vr = get_radius_vector(vc,vn,pr/2);
					var l1 = p5.Vector.add(vc,vr);
					var l2 = p5.Vector.add(vn,vr);

					var p2 = collideLineLine(px,py,px+d.x,py+d.y,l1.x,l1.y,l2.x,l2.y,true);
					if(!p2.x)p2=createVector(px,py);
					p2 = createVector(p2.x,p2.y);
					
					var vd2 = createVector(p2.x-px, p2.y-py);
					var vl = p5.Vector.sub(l2,p2);
					var vd = createVector(vx-vd2.x, vy-vd2.y);
					var t = vl.heading()-vd.heading();
					var s = vd.mag()*Math.cos(t);
					vl.normalize();
					var vd3 = p5.Vector.mult(vl, s);
					// debug
					if(this._debug) {
						this._debug_dat.push([p5.Vector.add(vd3,createVector(px,py)),l2,createVector(0,255,0)]);
						this._debug_dat.push([l1,l2,createVector(0,0,255)]);
						this._debug_dat.push([vc,vn,createVector(255,0,0)]);
					}
					// end case
					var np = p5.Vector.add(createVector(px,py),p5.Vector.add(vd2,vd3));
					if(collidePointLine(np.x,np.y,l1.x,l1.y,l2.x,l2.y)) {
						if (last_mv)last_mv = p5.Vector.sub(createVector(px,py),p2);
						if (!last_mv)last_mv = p5.Vector.add(vd2,vd3);
					}
					// console.log('last move_'+cur, last_mv);
					// console.log(np,p2,vd2,vd3);
					// console.log(p5.Vector.add(vd2,vd3));
					// console.log(collidePointLine(np.x,np.y,l1.x,l1.y,l2.x,l2.y));
				}
			}
			if(this._debug)console.log('last move', last_mv);
			return last_mv || true;
		}
	}
	return false;
};
// -=- Load Map Function -=- //
Terrain.prototype.loadmap = function (url) {

	var self = this;
	loadJSON(url, function (json) {
		// console.log(json);
		self.map_data = json.map_data;
		self.poly = [];
		for (var i = 0;i<json.map_data.vertex.length;i++) {
			var poly = json.map_data.vertex[i];
			var new_poly = [];
			for(var j = 0;j<poly.length;j++){
				var p = poly[j];
				new_poly.push(createVector(p[0],p[1]));
			}
			if(json.map_data.inverted)new_poly.reverse();
			self.poly.push(new_poly);
		}
		for (var i = json.npcs.length - 1; i >= 0; i--) {
			pushNPC(new NPC(json.npcs[i]));
		}
		for (var i = json.entities.length -1;i>=0;i--) {
			var ent = json.entities[i];
			// FIX: use lookup not if; else if
			if (ent.type == 'Tree') {
				entities.push(new Tree(createVector(ent.pos[0],ent.pos[1]),null,ent.size));
			}else if (ent.type == 'Grass') {
				entities.push(new Grass(createVector(ent.pos[0],ent.pos[1]),ent.size));
			}else if (ent.type == 'House') {
				entities.push(new House(createVector(ent.pos[0],ent.pos[1])));
			}else if (ent.type == 'Tombstone') {
				entities.push(new Tombstone(createVector(ent.pos[0],ent.pos[1]),ent.typ));
			}
		}
	});
};