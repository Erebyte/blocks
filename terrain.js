var ord = 0;
var TILE_SIZE = 32;

function Terrain() {
	this.map_data = [];


	this.draw = function (xoff, yoff) {
		push();
		translate(-xoff, -yoff);
		translate(width/2, height/2);

		fill(30);
		beginShape();
		for(i=0; i < this.poly.length; i++){
			vertex(this.poly[i].x,this.poly[i].y);
		}
		endShape(CLOSE);
		pop();
	};

	this.colide = function (px, py, pr) {
		return collideCirclePoly(px,py,pr*2,this.poly);
	};

	this.loadmap = function (url) {
		var self = this;
		loadJSON(url, function (json) {
			// console.log(json);
			self.map_data = json.map_data;
			self.poly = [];
			for (var i = 0;i<json.map_data.vertex.length;i++) {
				var p = json.map_data.vertex[i];
				self.poly[i] = createVector(p[0],p[1]);
			}
			for (var i = json.npcs.length - 1; i >= 0; i--) {
				pushNPC(new NPC(json.npcs[i]));
			}
		});
	};
}