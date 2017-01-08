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
	translate(width/2-this.x*this.zoom,height/2-this.y*this.zoom);
	scale(this.zoom);
};
Camera.prototype.move = function (x, y) {
	this.x -= x/this.zoom;
	this.y -= y/this.zoom;
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
	this.entities = [];
	this.is_loading = true;
	this.is_error = false;
	this.target_obj = null;
	this.target_hist = [];

	this.place_target = null;
	this.clickMode = 'default';
};

// -=- Terrain Functions -=- //
Terrain.prototype.toggleDebug = function () {
	this._debug = !this._debug;
};
Terrain.prototype.update = function () {
	if(this.target_hist.length) {
		var obj = this.target_hist[this.target_hist.length-1];
		var msg = '';
		msg += 'Obj-pos: ('+obj.x+','+obj.y+')<br>';
		for(var key in obj){
			msg += 'Obj-'+key+': '+JSON.stringify(obj[key])+'<br>';
		}
		debug_htm.html(msg,true);
	}
};
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
		ellipseMode(CENTER);
		// for (i=0;i<this.npcs.length;i++){
		// 	var npc = this.npcs[i];
		// 	rect(npc.x,npc.y-20,20,40);
		// 	ellipse(npc.x,npc.y,5,5);
		// }
		for (i=0;i<this.entities.length;i++){
			var ent = this.entities[i];
			fill(255,50,50);
			if(ent.type == 'NPC'){
				fill(100,100,200);
				rect(ent.x,ent.y-20,20,40);
			}
			ellipse(ent.x,ent.y,5,5);
		}
		pop();
	}else if(this.is_error){
		text('Error loading map.',0,0);
	}else {

	}
	// calibration points
	// ellipse(0,0,20,20);
	// ellipse(20,20,20,20);
	// ellipse(40,40,20,20);
	// ellipse(60,60,20,20);
};
Terrain.prototype.draw_debug = function () {
};
Terrain.prototype.keyPressed = function () {
	if(key==' ')this.clickMode='default';
	if(key=='Z')this.clickMode='delete';
	if(key=='X')this.clickMode='cut';
	if(key=='C')this.clickMode='copy';
	if(key=='V')this.clickMode='place';
	if([' ','Z','X','C'].indexOf(key)!=-1)this.target_obj=null;
};
Terrain.prototype.mousePressed = function () {
	if(!this.target_obj){
		var results = [];
		if(!this.is_loading){
			for(i=0;i<this.entities.length;i++){
				var ent = this.entities[i];
				if(dist(ent.x,ent.y,amouseX,amouseY)<=5)results.push(ent);
			}
			// do polys too
		}
		if(results.length){
			console.log(results);
			this.target_obj = results[0];
			this.target_hist.push(results[0]);
			if(this.clickMode=='cut'||this.clickMode=='delete'){
				i = this.entities.indexOf(this.target_obj);
				if(i>=0)this.entities.splice(i,1);
			}
			if(this.clickMode=='cut'||this.clickMode=='copy')this.clickMode = 'place';
		}
	}else {
		if(this.clickMode=='place'){
			var e = JSON.parse(JSON.stringify(this.target_obj));
			e.x = amouseX;
			e.y = amouseY;
			this.entities.push(e);
		}
	}
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
			var npc = json.npcs[i];
			npc.type='NPC';
			self.entities.push(npc);
		}
		for (var i = json.entities.length -1;i>=0;i--) {
			var ent = json.entities[i];
			ent.x = ent.pos[0];
			ent.y = ent.pos[1];
			self.entities.push(ent);
		}
		self.is_loading=false;
	}, function () {
		// error callback
		self.is_error = true;
	});
};


// -=- Load Map Function -=- //
Terrain.prototype.savemap = function () {
	console.log('saving map');
	console.log('done');
};