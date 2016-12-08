var BuildingEntity = function (entity_data) {
	TerrainEntity.call(this, entity_data);
	this.w = entity_data.w;
	this.h = entity_data.h;
};
BuildingEntity.prototype = Object.create(TerrainEntity.prototype);


var House = function (pos, door_offset, width) {
	BuildingEntity.call(this, {
		x:pos.x,
		y:pos.y,
		w:width||200,
		h:60
	});
	this.sway = map(Math.random(),0,1,-30,30);
	this.rsway = map(Math.random(),0,1,-40,40);

	this.door_offset = door_offset || 0;
};
House.prototype = Object.create(BuildingEntity.prototype);
House.prototype.collide = function (px,py,pr) {
	return collideRectCircle(this.x-this.w/2,this.y-40,this.w,40, px,py,pr);
};
House.prototype.draw = function () {
	push();
	fill(10);
	// draw wall
	quad(this.x-this.w/2,this.y,this.x-this.w/3+this.sway,this.y-this.h,this.x+this.w/3+this.sway,this.y-this.h,this.x+this.w/2,this.y);
	// draw roof
	triangle(this.x-this.w/2+this.sway,this.y-this.h,this.x+this.sway+this.rsway,this.y-this.h-40,this.x+this.w/2+this.sway,this.y-this.h);
	// draw door
	fill(143, 143, 36);
	quad(this.x+this.door_offset-10,this.y,this.x-this.sway/4+this.door_offset-15,this.y-40,this.x-this.sway/4+this.door_offset+15,this.y-40,this.x+this.door_offset+10,this.y);
	pop();
};