// Globals //
var entities;
//

// Entity stuffs //
//
var Entities = function () {
	// entity manager //
	this.ord = 1;
	this._entities = [];
};
Entities.prototype.add = function (e) {
	//
	var id = this.ord++;
	this._entities[id] = e;
	return id;
};
Entities.prototype.remove = function (e) {
	//
	var id = this._entities.indexOf(e);
	if(id == -1)return;
	this._entities[id] = null;
};
Entities.prototype.update = function () {
	for(var i = this._entities.length-1;i >= 0; i--){
		if(this._entities[i])this._entities[i].update();
	}
};
Entities.prototype.draw = function () {
	for(var i = this._entities.length-1;i >= 0; i--){
		if(this._entities[i])this._entities[i].draw();
	}
};
Entities.prototype.getEntities = function () {
	return this._entities.slice();
};

//
var GameEntity = function () {
	// entity class //
	this.id = entities.add(this);
};
GameEntity.prototype._update = function () {};
GameEntity.prototype.update = function () {};
GameEntity.prototype.draw = function () {};
GameEntity.prototype.remove = function () {
	Entities.remove(this);
};



var CircleObject = function (pos, size) {
	GameEntity.call(this);
	CollideEntity.call(this);
	//
	this.pos = pos || createVector(width/2, height/2);
	this.size = size || 20;
	this.collideType = 'circle';
	//
};
CircleObject.prototype = Object.create(Object.assign(
	GameEntity.prototype, CollideEntity.prototype));
//
CircleObject.prototype.update = function () {
	//
	this.applyForce(createVector(0,0.1)); // add gravity
	if(this.pos.y>height)entities.remove(this); //remove if below screen
};
CircleObject.prototype.draw = function () {
	//
	fill(200);
	ellipse(this.pos.x,this.pos.y,this.size,this.size);
};



var WallObject = function (polyData) {
	GameEntity.call(this);
	CollideEntity.call(this);
	//
	this.poly = polyData;
	this.collideType = 'poly';
};
WallObject.prototype = Object.assign(
	Object.create(GameEntity.prototype),
	Object.create(CollideEntity.prototype));
//
WallObject.prototype.draw = function () {
	beginShape();
	for(var i = this.poly.length-1;i >= 0; i--){
		vertex(this.poly[i].x, this.poly[i].y);
	}
	endShape(CLOSE);
};






// Game Stuffs //
//
var Game = function () {
	//
};
Game.prototype.init = function () {
	entities = new Entities();
	//
	_collideBuildDOM();
	//
	// add stuff here //
	setInterval(function(){
		new CircleObject(createVector(random(width),random(height/2)),random(10,50));
	},2000);

	new CircleObject(createVector(390,100),50);
	new CircleObject(createVector(120,100));
	new CircleObject(createVector(270,200));

	new WallObject([
		createVector(100,200),
		createVector(100,500),
		createVector(300,500),
		createVector(600,500),
		createVector(600,200),
		createVector(450,250),
		createVector(500,450),
		createVector(300,400),
		createVector(150,450)
	]);

	new WallObject([
		createVector(250,350),
		createVector(300,300),
		createVector(250,250),
		createVector(200,300),
	]);

	// end //
};
Game.prototype.update = function () {
	entities.update();
	//collide
	var collideData = collideDetect(entities.getEntities());
	collideResolve(collideData);
	//
};
Game.prototype.draw = function () {
	background(100);
	//
	entities.draw();
	collideDebugDraw();
	//
	text('FPS:'+floor(frameRate()),50,50);
};

