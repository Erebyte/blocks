/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
//				-=- Windows -=-				//
//											//
// Handles all gui Windows					//
//											//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=	//
*/

// -=- Globals -=- //
var ord = 0;


// -=-=-=-=- Windows -=-=-=- 
//
var Windows = function () {
	this.windows = [];
	this.kp = [];
	this.anm = [];
	this.open_window = false;
	this.menu = new GameMenu();

	this.flagFunctions = {
		setflag : function (obj, args) {
			for (var flag in args) {
				var value = args[flag];
				console.log(flag, value);
				if(flag.slice(0,1)=='#') {
					// console.log('game flag');
					game.flags[flag.slice(1)] = value;
				}else {
					obj.flags[flag] = value;
				}
			}
		},
		yesNo:function (obj, args) {
			var def = args.default || -1;
			var case_ = args.case;
			
			var win = windows.newYesNo(width/2, height/2, function (i,k) {
				if (k === true) i = def; // continue
				if (case_[i]) {
					var ret = case_[i];
					console.log(ret);
					var objCallback = function (obj_) {
						return function () {
							for (var func in obj_) {
								if (typeof windows.flagFunctions[func] == 'function') {
									windows.flagFunctions[func](obj, obj_[func]);
								}
							}
						};
					};
					for (var j=0;j<ret.length;j++) {
						if (typeof ret[j] == 'object' && ret[j] !== null) {
							var obj_ = ret[j];
							ret[j] = objCallback(obj_);
						}
					}
					windows.newSimple(ret);
				}else {
					console.log('else case');
					// windows.newSimple(case_[i]);
				}
				// console.log(k, i);
				// console.log(def, case_);
			});
		}
	};
};
// -=- Windows Functions -=- //
Windows.prototype.update = function () {
	this.animate();
};
Windows.prototype.draw = function () {
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
			if (win.flags['line_select']<0) {
				text(win.str, 0, 0, win.w*0.8, win.h*0.7);
			}else {
				text(win.str, 0, 0, win.w*0.8, win.h*0.7);
				ellipse(-win.w/2,-win.h*0.35+win.flags['line_select']*30+15, 10, 10);
			}
			pop();
		}
	}
};
Windows.prototype.newWindow = function (strs, x, y, w, h) {
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
			'draw':true,
			'line_select':-1
		},
		next:function(i){
			this.str_i += i || 1;
			if (this.strs.length > this.str_i) {
				this.str = this.strs[this.str_i];
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
Windows.prototype.getFlag = function (id, flag) {
	return this.windows[id].flags[flag];
};
Windows.prototype.setFlag = function (id, flag, value) {
	this.windows[id].flags[flag] = value;
};
Windows.prototype.newKeyPress = function (f) {
	var id = this.kp.length;
	this.kp.push(f);
	return id;
};
Windows.prototype.keyPressed = function (key) {
	for (var i = this.kp.length - 1; i >= 0; i--) {
		if (this.kp[i] !== null) {
			this.kp[i](key);
		}
	}
};
Windows.prototype.addWindow = function (win) {
	this.windows[win.id] = win;
};
Windows.prototype.removeWindow = function (id) {
	this.windows[id].unload();
	this.windows[id] = null;
};
Windows.prototype.animate = function () {
	for (var i = this.windows.length - 1; i >= 0; i--) {
		if (this.windows[i]) {
			this.windows[i].anm();
		}
	}
};
// -=-/-=- Windows -=-/-=- //

Windows.prototype.newSimple = function (str, x, y, w, h, cb) {
	x = x || width/2;
	y = y || height*0.8;
	w = w || width*0.9;
	h = h || height/2*0.60;
	var win = windows.newWindow(str, x, y, w, h);
	var kp_id = windows.newKeyPress(function (key) {
		if (key == 'T' || key == 'E') windows.windows[win].next();
	});
	windows.windows[win].unload = function () {
		if(cb)cb(this);
		windows.kp[kp_id] = null;
	};
	return win;
};
Windows.prototype.newYesNo = function (x, y, cb) {
	return this.newSelector(x, y, ['Yes', 'No'], cb);
};
Windows.prototype.newSelector = function (x, y, opts, cb) {
	var opt_l = opts.length;
	var strs = [opts.join('\n')];
	var win = windows.newWindow(strs, x, y, 70, opt_l*30+20);
	windows.setFlag(win,'line_select',0);
	var kp_id = windows.newKeyPress(function (key) {
		if (key == 'T')	windows.windows[win].close();
		if (key == 'E')	windows.windows[win].close(true);
		if (key == 'W') {
			var val = (windows.getFlag(win,'line_select') + opt_l -1) % opt_l;
			windows.setFlag(win,'line_select',val);
		}
		if (key == 'S') {
			var val = (windows.getFlag(win,'line_select') + opt_l +1) % opt_l;
			windows.setFlag(win,'line_select',val);
		}

	});
	windows.windows[win].close = function (p) {
		if(cb)cb(this.flags['line_select'],p);
		windows.kp[kp_id] = null;
		windows.removeWindow(this.id);
	};
	return win;
};


// -=-=-=-=- GameMenu -=-=-=-=- //
//
//
var GameMenu = function () {

};
GameMenu.prototype.open = function () {
	console.log('open menu');
	var strs = ['This is the menu\nIt is currently empty\n\n"1","2" for debug'];
	var win = windows.newWindow(strs, width/2, height*0.2, width*0.9, height/2*0.60);
	var kp_id = windows.newKeyPress(function (key) {
		if (key == 'E') {
			windows.windows[win].close();
		}
	});
	windows.windows[win].unload = function () {
		windows.kp[kp_id] = null;
	};

	windows.newYesNo(width/2, height/2, function (i,k) {
		console.log(k, i);
	});
};

// if (this.flags['talking'] !== true) {
// 		var strs = ['This is a tombstone...','It reads:\nRest In Peace\nHere lies Mike "the longest" hawk'];
// 		var win = windows.newWindow(strs, width/2, height*0.2, width*0.9, height/2*0.60);
// 		var kp_id = windows.newKeyPress(function (key) {
// 			if (key == 'T') {
// 				windows.windows[win].next();
// 			}
// 		});
// 		var self = this;
// 		windows.windows[win].unload = function () {
// 			self.flags['talking'] = false;
// 			windows.kp[kp_id] = null;
// 		};
// 		this.flags['talking'] = true;
// 	}

