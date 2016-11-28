var ord = 0;

function Windows() {
	this.windows = [];
	this.kp = [];
	this.anm = [];
	this.open_window = false;

	this.update = function () {
		this.animate();
	};

	this.draw = function () {
		this.open_window = false;
		for (var i = this.windows.length - 1; i >= 0; i--) {
			var win = this.windows[i];
			if (win !== null && win.flags['draw']===true) {
				this.open_window = true;
				push();
				noStroke();
				rectMode(CENTER);
				translate(win.x, win.y);
				rotate(radians(win.fr));
				fill(0, 0, 0, 70);
				rect(0, 0, win.w, win.h);
				rotate(radians(-win.fr));
				rotate(radians(win.br));
				fill(0, 0, 0, 150);
				rect(0, 0, win.w*0.85, win.h*0.8);
				rotate(radians(-win.br));
				//draw text
				fill(255);
				textAlign(LEFT);
				textFont("Georgia");
				textSize(24);
				text(win.str, 0, 0, win.w*0.8, win.h*0.7);
				pop();
			}
		}
	};

	this.newWindow = function (strs, x, y, w, h) {
		var id = ord++;
		var wnds = this;
		var fl = 0.5;
		var bl = 1;
		var fd = 0.01;
		var bd = 0.005;
		var win = {
			x:x,
			y:y,
			w:w,
			h:h,
			fr:0,
			br:0,
			strs:strs,
			str:strs[0],
			str_i:0,
			id:id,
			flags:{
				'draw':true
			},
			next:function(){
				if (this.strs.length > this.str_i+1) {
					this.str = this.strs[++this.str_i];
					if (typeof this.str == 'function') {
						this.str();
						this.next();
					}
				}else {
					this.close();
				}
			},
			close:function(){
				wnds.removeWindow(win.id);
			},
			unload:function(){},
			anm:function(){
				this.fr += fd;
				this.br += bd;
				if (this.fr > 0) {
					fd -= 0.00005;
				}else {
					fd += 0.00005;
				}
				if (this.br > 0) {
					bd -= 0.0001;
				}else {
					bd += 0.0001;
				}
			}
		};
		this.addWindow(win);
		return id;
	};

	this.keyPressed = function (key) {
		for (var i = this.kp.length - 1; i >= 0; i--) {
			if (this.kp[i] !== null) {
				this.kp[i](key);
			}
		}
	};

	this.addWindow = function (win) {
		this.windows[win.id] = win;
	};

	this.removeWindow = function (id) {
		this.windows[id].unload();
		this.windows[id] = null;
	};

	this.animate = function () {
		for (var i = this.windows.length - 1; i >= 0; i--) {
			if (this.windows[i]) {
				this.windows[i].anm();
			}
		}
	};

	this.flagFunctions = {
		setflag : function (obj, args) {
			for (var flag in args) {
				var value = args[flag];
				console.log(flag, value);
				obj.flags[flag] = value;
			}
		}
	};
}