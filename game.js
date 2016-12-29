/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
//				-=- Buildings -=-			//
//											//
// all buildings must be a subclass of		//
// BuildingEntity							//
//											//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=	//
*/


// -=-=- Logos -=-=- //
// 
// Handles drawing the logos.
//
var Logos = function () {
	this.logos = [
		{
			title:"Erebyte",
			frame:0,
			anm:function () {
				if (this.frame > 50) {
					return true;
				}
				this.frame++;
			},
			draw:function () {
				push();
				noStroke();
				fill(100);
				textFont("Georgia");
				textSize(20);
				text(this.title+"_frame_"+this.frame, 20, 20);
				pop();
			}
		},
		{
			title:"Title",
			frame:0,
			anm:function () {
				if (this.frame > 50) {
					return true;
				}
				this.frame++;
			},
			draw:function () {
				push();
				noStroke();
				fill(100);
				textFont("Georgia");
				textSize(20);
				text(this.title+"_frame_"+this.frame, 20, 20);
				pop();
			}
		}
	];
	this.current = 0;

};
// Logo Functions //
Logos.prototype.update = function () {
	if (this.current < this.logos.length) {
		this.animate();
	}else {
		game.setGamestate("startmenu");
	}
};
Logos.prototype.draw = function () {
	if (this.current < this.logos.length) {
		this.logos[this.current].draw();
	}
};
Logos.prototype.animate = function () {
	if (this.logos[this.current].anm() === true) {
		this.current++;
	}
};


// -=-=- Game Object -=-=- //
// 
// Args:
// ----
// 
// entity_data:{
//		[flags:<obj(dict)>]
// }
//
var GameObject = function (entity_data) {
	this.flags = entity_data.flags || {};
};
// -=- Game Object Functions -=- //
GameObject.prototype.remove = function () {
	// remove sudo function //
};
GameObject.prototype.getFlag = function (flag) {
	return this.flags[flag];
};
GameObject.prototype.setFlag = function (flag, value) {
	this.flags[flag] = value;
};


// -=-=- Game Entity -=-=- //
// 
// Args:
// ----
// 
// entity_data:{
//		...(see 'GameObject')
//		[data:<obj(dict)>]
//		[x:<int>] (default:0)
//		[y:<int>] (default:0)
//		[attribs:<obj(dict)>]
// }
//
var GameEntity = function (entity_data) {
	GameObject.call(this, entity_data);

	this.AI = new AI(this);
	
	this.data = entity_data || {};
	this.x = entity_data.x || 0;
	this.y = entity_data.y || 0;
	this.z = entity_data.z || 0;

	this.attribs = entity_data.attribs || {};
};
GameEntity.prototype = Object.create(GameObject.prototype);

// -=- Game Entity Functions -=- //
GameEntity.prototype.setAttribute = function (attr, value) {
	this.attribs[attr] = value;
};
GameEntity.prototype.setAttr = GameEntity.setAttribute;
GameEntity.prototype.getAttribute = function (attr) {
	return this.attribs[attr];
};
GameEntity.prototype.getAttr = GameEntity.getAttribute;
GameEntity.prototype.animate = function () {
	if (this.anm) {
		this.anm();
	}
};
GameEntity.prototype.collide = function () {return false;};
GameEntity.prototype.update = function () {
	if(this.flags._move_vector){
		var v = this.flags._move_vector;
		this.x+=v.x;
		this.y+=v.y;
		this.z+=v.z;
		if(this.z<0)this.z=0;
		if(this.flags.gravity){
			this.flags._move_vector.add(createVector(0,0,-0.5));
		}
		if(this.z===0 && this.flags.friction){
			var vec = this.flags._move_vector.copy();
			vec.z = 0;
			vec.mult(-1);
			vec.limit(2);
			this.flags._move_vector.add(vec);
		}
	}
};


// -=- AI -=- //
//
//
var AI = function (parent) {
	this.parent = parent;
};
AI.prototype.getPathDestination = function () {
	if (this.parent.flags['do_move']) {
		return this.parent.flags['move_path'][this.parent.flags['move_path'].length-1];
	}else {
		return [this.parent.x,this.parent.y];
	}
};
AI.prototype.pathPush = function (value, cb) {
	if (this.parent.flags['move_path']) {
		this.parent.flags['move_path'].push(value);
	}else {
		this.parent.flags['do_move'] = true;
		this.parent.flags['move_cur'] = 0;
		this.parent.flags['move_path'] = [value];
		this.parent.flags['move_cb'] = cb || function () {};
	}
};
AI.prototype.clearPath = function () {
	this.parent.flags['do_move'] = false;
	this.parent.flags['move_path'] = null;
	this.parent.flags['move_cur'] = null;
	this.parent.flags['move_cb'] = null;
};
AI.prototype.movePathVector = function () {
	if(this.parent.flags['do_move'] && this.parent.flags['move_path']) {
		if(!this.parent.flags['move_cur'])this.parent.flags['move_cur'] = 0;
		var path = this.parent.flags['move_path'];
		var next = path[this.parent.flags['move_cur']];
		var min_dist = this.parent.attribs['speed'] || 1 + (this.parent.flags['spd_buf'] || 0);
		if(dist(this.parent.x, this.parent.y, next[0], next[1]) < min_dist) next = path[++this.parent.flags['move_cur']];

		if (next) {
			var vec = createVector(next[0]-this.parent.x, next[1]-this.parent.y);
			vec.normalize();

			// debug code
			var self = this;
			game.debug_cb.push({draw_debug:function () {
				if(!self.parent.flags['do_move']) return;
				push();
				translate(width/2-camera.x, height/2-camera.y);
				noFill();
				stroke(0,0,255);
				beginShape();
				vertex(self.parent.x, self.parent.y);
				// console.log(self.parent);
				for (var i = self.parent.flags['move_cur']; i < self.parent.flags['move_path'].length; i++) {
					v = self.parent.flags['move_path'][i];
					vertex(v[0],v[1]);
				}
				endShape();
				pop();
			}});

			return vec;
		}else {
			this.parent.flags['do_move'] = false;
			this.parent.flags['move_path'] = null;
			this.parent.flags['move_cur'] = null;
			this.parent.flags['move_cb']();
			this.parent.flags['move_cb'] = null;
		}
	}
};



/* // -=-=- Main Game Object -=-=- // */
// 
// Main Game Object...
//
var Game = function () {
	this.gamestate = 'logo';
	this.debug_mode = false;
	this.debug_cb = [];
	this._logos = new Logos();
	this._fps_hystory = [];
	
	this.flags = {
		"flag" : true
	};
};
// -=- Game Functions -=- //
Game.prototype.update = function () {
	if(this.debug_mode) {
		this._fps_hystory.push(frameRate());
		if (this._fps_hystory.length>200) {
			this._fps_hystory = this._fps_hystory.slice(1);
		}
	}
};
Game.prototype.draw_debug = function () {
	push();
	translate(0,10);
	textFont("Georgia");
	textSize(10);
	fill(200);
	text("Debug Mode",10,20);
	text("e:"+draw_q.length+'/'+entities.length,10,40);
	text("p:("+Math.floor(player.x)+','+Math.floor(player.y)+','+Math.floor(player.z)+")",10,50);
	
	// FPS 
	text("FPS:"+Math.floor(frameRate()), width-400, 20);
	noFill();
	stroke(150,0,0);
	line(width-400,40,width,40); //100-60fps=40
	var t = game._fps_hystory.length*2;
	line(width-t,30,width-t,50); //100-60fps=40
	stroke(200);
	beginShape();
	for (var i = game._fps_hystory.length - 1; i >= 0; i--) {
		var fps = game._fps_hystory[i];
		fps = map(fps,0,100,100,0);
		vertex(width-i*2,fps);
	}
	endShape();
	//
	pop();

	for (var i = this.debug_cb.length - 1; i >= 0; i--) {
		this.debug_cb[i].draw_debug();
	}
	this.debug_cb = [];
};
Game.prototype.setGamestate = function (state) {
	//animation
	this.gamestate = state;
};
Game.prototype.toggleDebug = function () {
	this.debug_mode = !this.debug_mode;
};