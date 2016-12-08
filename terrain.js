var TerrainEntity = function (entity_data) {
	GameEntity.call(this, entity_data);
};
TerrainEntity.prototype = Object.create(GameEntity.prototype);

var Fog = function () {
	this.depth = 10;
	this.tri = [
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
		[203, 443, 578, 85, 627, 365],
		[88, 380, 498, 77, 544, 421],
		[229, 453, 431, 208, 638, 483],
		[235, 415, 445, 198, 553, 402],
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
		[522, 408, 144, 392, 423, 116]
	];
	this.tris = [];
};
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
		this.tris.pop(Math.floor(Math.random()*this.tris.length));
	}
	while (this.tris.length <= this.depth) {
		this.tris.push(Math.floor(Math.random()*this.tri.length));
	}
};

var Terrain = function () {
	this.map_data = [];
	this.fog = new Fog();
};
Terrain.prototype.draw = function (xoff, yoff) {
	push();
	translate(-xoff, -yoff);
	translate(width/2, height/2);

	fill(30);
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
Terrain.prototype.collide = function (px, py, pr, vx, vy) {
	for (var i = this.poly.length - 1; i >= 0; i--) {
		var poly = this.poly[i];
		if (collideCirclePoly(px,py,pr,poly) === true) {
			var next = 0;
			// for (var cur = 0; cur<poly.length;cur++) {
				// next = cur+1;
				// if (next == poly.length) next = 0;
				// var vc = poly[cur];    // c for "current"
				// var vn = poly[next];       // n for "next"
				// var col = collideLineCircle(vc.x,vc.y, vn.x,vn.y, px,py,pr);
				// if (col) {
				// 	var vr = vc.copy();
				// 	vr.sub(vn);
				// 	vr.rotate(radians(-90));
				// 	vr.normalize();
				// 	vr.mult(pr);
				// 	var vc2 = vc.copy();
				// 	vc2.sub(vr);
				// 	var vn2 = vn.copy();
				// 	vn2.sub(vr);
				// 	var k = ((vn2.y-vc2.y)*(px+vx-vc2.x)-(vn2.x-vc2.x)*(py+vy-vc2.y))/(Math.pow(vn2.y-vc2.y,2)+Math.pow(vn2.x-vc2.x,2));
				// 	var x = px-k*(vn2.y-vc2.y);
				// 	var y = py-k*(vn2.x-vc2.x);
				// 	return createVector(x,y);
				// 	// console.log(vc,vc2);
				// }
			// }
			return true;
		}
	}
	// for (var i = entities.length - 1; i >= 0; i--) {
	// 	if (entities[i].collide(px,py,pr*2)) {
	// 		return true;
	// 	}
	// }
	return false;
};
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
			self.poly.push(new_poly);
		}
		for (var i = json.npcs.length - 1; i >= 0; i--) {
			pushNPC(new NPC(json.npcs[i]));
		}
		for (var i = json.entities.length -1;i>=0;i--) {
			var ent = json.entities[i];
			if (ent.type == 'Tree') {
				entities.push(new Tree(createVector(ent.pos[0],ent.pos[1])));
			}else if (ent.type == 'Grass') {
				entities.push(new Grass(createVector(ent.pos[0],ent.pos[1]),ent.size));
			}
		}
	});
};
Terrain.prototype.setFog_depth = function (depth) {
	this.fog.depth = depth;
};