

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

/* // -=-=- Main Game Object -=-=- // */
var Game = function () {
	this.gamestate = 'logo';
	this._logos = new Logos();
	
	this.flags = {
		"flag" : true
	};
};
Game.prototype.setGamestate = function (state) {
	//animation
	this.gamestate = state;
};