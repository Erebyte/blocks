var ord = 0;
var TILE_SIZE = 32;

function Terrain() {
	this.map_data = [];
	this.map_row_len = 1;


	this.draw = function (xoff, yoff) {
		push();
		noStroke();
		xoff -= width/2 + TILE_SIZE;
		yoff -= height/2 + TILE_SIZE;
		var dxoff = (xoff % TILE_SIZE + TILE_SIZE) % TILE_SIZE;
		var dyoff = (yoff % TILE_SIZE + TILE_SIZE) % TILE_SIZE;
		var colums = ceil(height/TILE_SIZE)+2;
		var rows = ceil(width/TILE_SIZE)+2;
		translate(-TILE_SIZE, -TILE_SIZE);
		translate(-dxoff, -dyoff);
		for (var col_int=0; col_int < colums; col_int++) {
			for (var row_int=0; row_int < rows; row_int++) {
				var tile_data = this.getTileData(row_int+floor(xoff/TILE_SIZE), col_int+floor(yoff/TILE_SIZE));
				switch (tile_data) {
					case 0:
						fill(0,0,0,0);
						break;
					case 1:
						fill(10,15,20,255);
						break;
					case 2:
						fill(200, 200, 200, 255);
						break;
				}
				// rect(-dxoff,-dyoff,TILE_SIZE,TILE_SIZE);
				rect(0,0,TILE_SIZE,TILE_SIZE);
				translate(TILE_SIZE,0);
			}
			translate(-TILE_SIZE*rows,TILE_SIZE);
		}
		pop();
	};

	this.colide = function (px, py, pr) {
		var tr = floor(px/TILE_SIZE);
		var tc = floor(py/TILE_SIZE);
		var ts = TILE_SIZE;
		var tx = tr*ts+ts/2;
		var ty = tc*ts+ts/2;
		var itrs = [
			[-1,-1],
			[0,-1],
			[1,-1],
			[-1,0],
			[0,0],
			[1,0],
			[-1,1],
			[0,1],
			[1,1]
		];
		var cld = false;
		for (var i=0;i<itrs.length;i++) {
			if (this.getTileData(tr+itrs[i][0], tc+itrs[i][1]) === 1) {
				var xoff = itrs[i][0]*ts;
				var yoff = itrs[i][1]*ts;
				if (this.intersectCircle(tx+xoff, ty+yoff, ts, ts, px, py, pr)) {
					cld = true;
				}
			}
		}
		return cld;
	};

	this.getTileData = function (x, y) {
		if (x >= this.map_row_len || y >= this.map_data.length/this.map_row_len) {
			return 1;
		}else if (x < 0 || y < 0) {
			return 1;
		}else {
			var ret = this.map_data[x+this.map_row_len*y];
			if (ret !== undefined) {
				return ret;
			}else{
				console.log(x, y, this.map_data[48]);
				return 2;
			}
		}
	};

	this.intersectCircle = function (rx, ry, rw, rh, cx, cy, cr) {
		var dx = abs(cx - rx);
		var dy = abs(cy - ry);

		if (dx > (rw/2 + cr)) {return false;}
		if (dy > (rh/2 + cr)) {return false;}

		if (dx <= (rw/2)) {return true;}
		if (dy <= (rh/2)) {return true;}

		var cnrx = rx+rw/2;
		var cnry = ry+rh/2;
		var cdist = dist(cnrx, cnry, cx, cy);

		return cdist < cr;
	};

	this.loadmap = function (url) {
		var self = this;
		loadJSON(url, function (json) {
			// console.log(json);
			self.map_data = json.map_data;
			self.map_row_len = json.map_row_len;
			for (var i = json.npcs.length - 1; i >= 0; i--) {
				pushNPC(new NPC(json.npcs[i]));
			}
		});
	};
}