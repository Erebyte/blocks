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
	this.map_data = {};
	this.entities = [];
	this.is_loading = true;
	this.is_saving = false;
	this.is_error = false;
	this.is_popup = false;
	this.selected_obj = null;
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
			try{
				msg += 'Obj-'+key+': '+JSON.stringify(obj[key])+'<br>';
			}
			catch(err){}
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
		var v = [];
		for (pi=0;pi<this.poly.length;pi++){
			var poly = this.poly[pi];
			beginShape();
			for(i=0; i < poly.length; i++){
				vertex(poly[i].x,poly[i].y);
				v.push(poly[i]);
			}
			endShape(CLOSE);
		}
		for(i=0;i<v.length;i++){
			ellipse(v[i].x,v[i].y,5,5);
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
			stroke(0);
			if(this.selected_obj==ent)fill(70,70,200);
			if(ent.type == 'NPC'){
				fill(100,100,200);
				if(this.selected_obj==ent)fill(70,70,200);
				rect(ent.x,ent.y-20,20,40);
			}else if(ent.type=='event'){
				noFill();
				stroke(50,200,50);
				if(this.selected_obj==ent)stroke(50,50,200);
				beginShape();
				for(pi=0;pi<ent.poly.length;pi++){
					vertex(ent.x+ent.poly[pi][0],ent.y+ent.poly[pi][1]);
				}
				endShape(CLOSE);
				if(this.selected_obj==ent){
					fill(50,200,50);
					stroke(0);
					for(pi=0;pi<ent.poly.length;pi++){
						ellipse(ent.x+ent.poly[pi][0],ent.y+ent.poly[pi][1],5,5);
					}
				}
				stroke(0);
				fill(200,50,50);
			}
			ellipse(ent.x,ent.y,5,5);
			textSize(7);
			fill(255);
			text(ent.type,ent.x+10,ent.y);
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
Terrain.prototype.new_poly = function () {
	terrain.target_obj = {type:'poly',new:true};
	terrain.clickMode = 'place';
};
Terrain.prototype.new_obj = function () {
	terrain.target_obj = {type:'none'};
	terrain.clickMode = 'place';
};
Terrain.prototype.new_event = function () {
	terrain.target_obj = {
		type:'event',
		poly:[
			[-60,-40],
			[60,-40],
			[60,40],
			[-60,40]
		],
		flags:{},
		text:{}
	};
	terrain.target_hist.push(terrain.target_obj);
	terrain.clickMode = 'place';
};
Terrain.prototype.edit_mapData = function () {
	terrain.target_hist.push(terrain.map_data);
	terrain.edit_obj();
};
Terrain.prototype.edit_obj = function() {
	var obj = terrain.target_hist[terrain.target_hist.length-1];
	if(obj && obj.type!='poly'){
		// console.log('editing obj');
		var close_window = function () {
			dimmer.remove();
			edit_win.remove();
			terrain.is_popup = false;
		};
		terrain.is_popup = true;

		var dimmer = createDiv('');
		dimmer.position(0,0);
		dimmer.style('width',window.innerWidth+'px');
		dimmer.style('height',window.innerHeight+'px');
		dimmer.elt.className = 'dimmer';

		var edit_win = createDiv('');
		var w = 300, h = 400;
		edit_win.position(window.innerWidth/2-w/2, window.innerHeight/2-h/2);
		edit_win.style('width',w+'px');
		edit_win.style('height',h+'px');
		edit_win.elt.className = 'hover-window';

		dimmer.mousePressed(close_window);

		//fill edit_win
		var obj_func = function(obj){
			return function () {
				console.log('clicked', JSON.stringify(obj,true), this);
			};
		};

		var data = [];

		for(var key in obj){
			var div = createDiv('');
			div.attribute('value-type',typeof obj[key]);
			div.child(createP('Obj-'+key));
			if(typeof obj[key] != 'object'){
				div.attribute('value-initial',obj[key]);
				div.child(createInput(obj[key]));
			}else {
				div.attribute('value-initial',JSON.stringify(obj[key]));
				var c = createP(obj[key]);
				c.addClass('input');
				c.mousePressed(obj_func(obj[key]));
				div.child(c);
			}
			data.push([key,div]);
			div.parent(edit_win);
		}

		var new_item = createButton('new item');
		new_item.style('margin',2);
		new_item.mousePressed(function(){
			console.log('new item');
			var div = createDiv('');
			div.attribute('value-type','');
			div.attribute('value-initial','');
			var inp = createInput();
			inp.addClass('key-input');
			// inp.elt.onblur = function(){
			// 	console.log(inp.value());
			// };
			div.child(inp);
			div.child(createInput());
			data.push(['new',div]);
			div.parent(edit_win);
			this.parent(edit_win);
		});
		new_item.parent(edit_win);

		var submit = createDiv('');
		submit.addClass('submit');
		submit.parent(edit_win);

		var save = createButton('Save');
		save.mousePressed(function(){
			console.log('saving');
			for(i=0;i<data.length;i++){
				var d = data[i];
				if(d[0]!='new'){
					if(d[1].attribute('value-type')!='object'){
						var v = d[1].elt.getElementsByTagName('input')[0].value;
						if(v==''){
							delete obj[d[0]];
						}else if(d[1].attribute('value-type')=='string'){
							obj[d[0]] = v;
						}else if(typeof JSON.parse(v)==d[1].attribute('value-type')){
							obj[d[0]] = JSON.parse(v);
						}
						else{
							console.log('error: key-'+d[0]);
						}
						// console.log(v);
					}
				}else{
					var tags = d[1].elt.getElementsByTagName('input');
					try{
						obj[tags[0].value]=JSON.parse(tags[1].value);
					}catch(err){
						obj[tags[0].value]=tags[1].value;
					}
				}
			}
			close_window();
		});
		submit.child(save);

		var reset = createButton('Reset');
		reset.mousePressed(function(){
			console.log('reseting');
		});
		submit.child(reset);
	}
};
Terrain.prototype.keyPressed = function () {
	if(!this.is_popup){
		if(key==' ')this.clickMode='default';
		if(key=='Z')this.clickMode='delete';
		if(key=='X')this.clickMode='cut';
		if(key=='C')this.clickMode='copy';
		if(key=='V')this.clickMode='place';
		if([' ','Z','X','C'].indexOf(key)!=-1)this.target_obj=null;
	}
};
Terrain.prototype.mousePressed = function () {
	if(!this.target_obj){
		var results = [];
		if(!this.is_loading){
			for(i=0;i<this.entities.length;i++){
				var ent = this.entities[i];
				if(dist(ent.x,ent.y,amouseX,amouseY)<=5)results.push(ent);
			}
			for (pi=0;pi<this.poly.length;pi++){
				var poly = this.poly[pi];
				for(i=0; i < poly.length; i++){
					// vertex(poly[i].x,poly[i].y);
					if(dist(poly[i].x,poly[i].y,amouseX,amouseY)<=5)results.push({
						type:'poly',
						poly:poly,
						vertex:poly[i],
						x:poly[i].x,
						y:poly[i].y,
						index:i
					});
				}
			}
			if(this.selected_obj && this.selected_obj.type=='event'){
				var o = this.selected_obj;
				for (i=0;i<o.poly.length;i++){
					var p = o.poly[i];
					if(dist(o.x+p[0],o.y+p[1],amouseX,amouseY)<=5)results.push({
						type:'event_poly',
						poly:o.poly,
						vertex:p,
						x:p[0],
						y:p[1],
						index:i
					});
				}
			}
		}
		if(results.length){
			console.log(results);
			this.target_obj = results[0];
			this.target_hist.push(results[0]);
			if(this.clickMode=='cut'||this.clickMode=='delete'){
				if(['poly','event_poly'].indexOf(this.target_obj.type)==-1){
					i = this.entities.indexOf(this.target_obj);
					if(i>=0)this.entities.splice(i,1);
				}else if(this.clickMode=='delete'){
					this.target_obj.poly.splice(this.target_obj.index,1);
				}
			}
			if(this.clickMode=='cut'||this.clickMode=='copy')this.clickMode = 'place';
		}
	}else if(this.clickMode=='place' && hmouseCanvas){
		if(this.target_obj.type!='poly') {
			var e = JSON.parse(JSON.stringify(this.target_obj));
			e.x = amouseX;
			e.y = amouseY;
			this.entities.push(e);
		}else if(this.target_obj.new){
			var p = [
				createVector(amouseX+20,amouseY-20),
				createVector(amouseX-20,amouseY-20),
				createVector(amouseX,amouseY+20)
			];
			this.poly.push(p);
			this.clickMode='default';
		}
	}
};
Terrain.prototype.mouseDoublePressed = function () {
	if(this.selected_obj && this.selected_obj.type=='event'){
		var poly = this.selected_obj.poly;
		for(i=0; i < poly.length; i++){
			var c = createVector(poly[i][0],poly[i][1]);
			var n;
			if(i+1<poly.length){
				n = createVector(poly[i+1][0],poly[i+1][1]);
			}else {
				n=createVector(poly[0][0],poly[0][1]);
			}
			c.add(this.selected_obj.x,this.selected_obj.y);
			n.add(this.selected_obj.x,this.selected_obj.y);
			if(collideLineCircle(c.x,c.y,n.x,n.y,amouseX,amouseY,10)){
				if(dist(c.x,c.y,amouseX,amouseY)<=10)return;
				if(dist(n.x,n.y,amouseX,amouseY)<=10)return;
				// console.log('new point');
				poly.splice(i+1,0,[amouseX-this.selected_obj.x,amouseY-this.selected_obj.y]);
			}
		}
	}
	this.selected_obj = null;
	for (i=0;i<this.entities.length;i++){
		var e = this.entities[i];
		if(dist(e.x,e.y,amouseX,amouseY)<=5){
			this.selected_obj = e;
			this.target_hist.push(e);
			return;
		}
	}
	for (pi=0;pi<this.poly.length;pi++){
		var poly = this.poly[pi];
		for(i=0; i < poly.length; i++){
			var c = poly[i];
			var n = poly[i+1];
			if(i+1==poly.length)n=poly[0];
			if(collideLineCircle(c.x,c.y,n.x,n.y,amouseX,amouseY,10)){
				if(dist(c.x,c.y,amouseX,amouseY)<=10)return;
				if(dist(n.x,n.y,amouseX,amouseY)<=10)return;
				// console.log('new point');
				poly.splice(i+1,0,createVector(amouseX,amouseY));
			}
		}
	}
};

// -=- Load Map Function -=- //
Terrain.prototype.loadmap = function (url) {
	this.is_loading = true;
	var self = this;
	loadJSON(url, function (json) {
		// console.log(json);
		self.map_data = json.map_data || {};
		json.entities = json.entities || [];
		json.npcs = json.npcs || [];
		json.events = json.events || [];
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
		for (i = json.npcs.length - 1; i >= 0; i--) {
			var npc = json.npcs[i];
			npc.type='NPC';
			self.entities.push(npc);
		}
		for (i = json.entities.length -1;i>=0;i--) {
			var ent = json.entities[i];
			ent.x = ent.pos[0];
			ent.y = ent.pos[1];
			self.entities.push(ent);
		}
		for (i=0;i<json.events.length;i++){
			var evt = json.events[i];
			evt.type = 'event';
			self.entities.push(evt);
		}
		self.is_loading=false;
	}, function () {
		// error callback
		self.is_error = true;
	});
};


// -=- Save Map Function -=- //
Terrain.prototype.savemap = function () {
	self = terrain;
	console.log('saving map');
	self.is_saving = true;
	var json = {
		map_data:Object.assign({},self.map_data,{vertex:[]}),
		entities:[],
		npcs:[],
		events:[]
	};
	for(pi=0;pi<self.poly.length;pi++){
		var poly = self.poly[pi];
		var p = [];
		for(i=0;i<poly.length;i++){
			p.push([poly[i].x,poly[i].y]);
		}
		json.map_data.vertex.push(p);
	}
	for(i=0;i<self.entities.length;i++){
		var e = JSON.parse(JSON.stringify(self.entities[i]));
		if(e.type=='NPC'){
			e.type=undefined;
			json.npcs.push(e);
		}else if(e.type=='event'){
			e.type=undefined;
			json.events.push(e);
		}else{
			e.pos = [e.x,e.y];
			e.x=undefined;
			e.y=undefined;
			json.entities.push(e);
		}
	}
	saveJSON(json,map_input.value()+'.json');
	console.log('done');
};