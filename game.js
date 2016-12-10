

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


var GameObject = function () {
	this.flags = {};
};
GameObject.prototype.remove = function () {
	// remove sudo function //
};
GameObject.prototype.getFlag = function (flag) {
	return this.flags[flag];
};
GameObject.prototype.setFlag = function (flag, value) {
	this.flags[flag] = value;
};


var GameEntity = function (entity_data) {
	GameObject.call(this);
	
	this.data = entity_data || {};
	this.x = entity_data.x || 0;
	this.y = entity_data.y || 0;

	this.attribs = entity_data.attribs || {};
};
GameEntity.prototype = Object.create(GameObject.prototype);
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

/* // -=-=- Main Game Object -=-=- // */
var Game = function () {
	this.gamestate = 'logo';
	this.debug_mode = false;
	this._logos = new Logos();
	this._fps_hystory = [];
	
	this.flags = {
		"flag" : true
	};
};
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
	text("p:("+Math.floor(player.x)+','+Math.floor(player.y)+")",10,50);
	
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
};
Game.prototype.setGamestate = function (state) {
	//animation
	this.gamestate = state;
};
Game.prototype.toggleDebug = function () {
	this.debug_mode = !this.debug_mode;
};