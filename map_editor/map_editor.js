/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
//				-=- Camera -=-				//
//											//
// custom camera class cause i dont need	//
// p5's camera class.						//
//											//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=	//
*/


// -=-=-=-=- Camera -=-=-=- //
var Camera = function () {
	this.x = 20;
	this.y = 20;
	this.zoom = 1;
};
Camera.prototype.apply_transition = function () {
	translate(width/2-this.x,height/2-this.y);
	scale(this.zoom);
};
Camera.prototype.move = function (x, y) {
	this.x -= x;
	this.y -= y;
};


/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Terrain -=-			   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/



// -=-=-=-=- Terrain -=-=-=- //
//
// Handles loading and drawing terrain, 
//     and handles terrain collision.
//
var Terrain = function () {
	this._debug = false;
	this._debug_dat = [];
	this.map_data = [];
	this.npcs = [];
	this.entities = [];
	this.is_loading = true;
	this.is_error = false;
};

// -=- Terrain Functions -=- //
// Terrain.prototype.toggleDebug = function () {
// 	this._debug = !this._debug;
// };
Terrain.prototype.draw = function (xoff, yoff) {
	if(!this.is_loading){
		// background(100);
		push();
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
		rectMode(CENTER);
		fill(100,100,200);
		for (i=0;i<this.npcs.length;i++){
			var npc = this.npcs[i];
			rect(npc.x,npc.y-20,20,40);
			ellipse(npc.x,npc.y,5,5);
		}
		fill(255,50,50);
		for (i=0;i<this.entities.length;i++){
			var ent = this.entities[i];
			ellipse(ent.pos[0],ent.pos[1],5,5);
		}
		pop();
	}else if(this.is_error){
		text('Error loading map.',0,0);
	}else {

	}
	// ellipse(0,0,20,20);
};
Terrain.prototype.draw_debug = function () {
	// push();
	// translate(width/2-camera.x, height/2-camera.y);
	// noFill();
	// stroke(0,255,0);
	// ellipse(player.x,player.y,1,1);
	// ellipse(player.x,player.y,player.w,player.w);
	// for (var i = this._debug_dat.length - 1; i >= 0; i--) {
	// 	var ln = this._debug_dat[i];
	// 	if (ln.length===3) {
	// 		stroke(ln[2].x,ln[2].y,ln[2].z);
	// 		line(ln[0].x,ln[0].y,ln[1].x,ln[1].y);
	// 	}else if (ln.length===2) {
	// 		stroke(ln[1].x,ln[1].y,ln[1].z);
	// 		ellipse(ln[0].x,ln[0].y,ln[0].z,ln[0].z);
	// 	}
	// }
	// pop();
};

// -=- Load Map Function -=- //
Terrain.prototype.loadmap = function (url) {
	this.is_loading = true;
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
			self.npcs.push(json.npcs[i]);
		}
		for (var i = json.entities.length -1;i>=0;i--) {
			self.entities.push(json.entities[i]);
		}
		self.is_loading=false;
	}, function () {
		// error callback
		self.is_error = true;
	});
};