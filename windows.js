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
		setflag : function (obj, win, args) {
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
		yesNo:function (obj, win, args) {
			var def = args.default || -1;
			var case_ = args.case;
			// console.log(win.strs[win.str_i-1], win.kp_id);
			win.strs.push(win.strs[win.str_i-1]);
			windows.kp[win.kp_id] = null;
			
			windows.newYesNo(width/2, height/2, function (i,k) {
				win.close();
				if (k === true || i==-1) i = def; // continue
				if (case_[i]) {
					var ret = case_[i];
					// console.log(ret);
					var objCallback = function (obj_) {
						return function (w) {
							for (var func in obj_) {
								if (typeof windows.flagFunctions[func] == 'function') {
									windows.flagFunctions[func](obj, w, obj_[func]);
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
			});
		},
		movepath:function(obj, win, args) {
			obj.flags['do_move'] = true;
			obj.flags['move_path'] = args.path;
			if(!obj.flags['spd_buf']) obj.flags['spd_buf']=0;
			if(args.spd) obj.flags['spd_buf'] += args.spd;
			obj.flags['move_cb'] = function () {
				if(args.cb) {
					for (var func in args.cb) {
						if (typeof windows.flagFunctions[func] == 'function') {
							windows.flagFunctions[func](obj, win, args.cb[func]);
						}
					}
				}
				if (args.spd) obj.flags['spd_buf'] -= args.spd;
			};
		},
		joinparty:function (obj, win, args) {
			player.party_members.push(obj);
			obj.flags['follow_dist'] = random(50,70);
			windows.newSimple([obj.npc_name+' has joined your party']);
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
		if(win!== null && win.flags.draw_func)win.flags.draw_func(win);
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
		w:w||1,
		h:h||1,
		fr:0,
		br:0,
		strs:strs,
		str:strs[0],
		str_i:0,
		id:id,
		flags:{
			'draw':true,
			'draw_func':null,
			'selection':-1,
			'is_focused':true,
		},
		next:function(i){
			this.str_i += i || 1;
			if (this.strs.length > this.str_i) {
				this.str = this.strs[this.str_i];
				if (typeof this.str == 'function') {
					this.str(this);
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
	if(!this.windows[id])return;
	return this.windows[id].flags[flag];
};
Windows.prototype.setFlag = function (id, flag, value) {
	if(!this.windows[id])return;
	this.windows[id].flags[flag] = value;
};
Windows.prototype.focus = function (id, value) {
	if(!this.windows[id])return;
	if(value!==false)value=true;
	this.setFlag(id,'is_focused',value);
};
Windows.prototype.newKeyPress = function (f, w) {
	var id = this.kp.length;
	this.kp.push(f);
	if(w)this.windows[w].kp_id = id;
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
			if(this.windows[i].ud)this.windows[i].ud();
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
		if (key == 'Mouse') windows.windows[win].next();
	}, win);
	windows.windows[win].unload = function () {
		if(cb)cb(this);
		windows.kp[kp_id] = null;
	};
	return win;
};
Windows.prototype.newYesNo = function (x, y, cb) {
	return this.newSelector(x, y, ['Yes', 'No'], cb);
};
Windows.prototype.newSelector = function (x, y, opts, cb, do_close) {
	if(do_close!==false)do_close=true;
	// create window
	var win_id = windows.newWindow(opts, x, y);
	windows.windows[win_id].sel_point = createVector();

	// override draw
	windows.setFlag(win_id,'draw',false);
	windows.setFlag(win_id,'draw_func',function(win){
		push();
		for (var i = opts.length - 1; i >= 0; i--) {
			var v = p5.Vector.fromAngle(i*(2*PI/opts.length)+PI+(2*PI/opts.length)/2);
			v.mult(30);
			stroke(255);
			line(win.x,win.y,win.x+v.x,win.y+v.y);
		}

		// debug
		stroke(255,0,0);
		line(win.x-10,win.y,win.x+10,win.y);
		line(win.x,win.y-10,win.x,win.y+10);
		stroke(0,0,255);
		line(win.x,win.y,win.x+win.sel_point.x,win.y+win.sel_point.y);

		fill(200);
		text(win.flags.selection,win.x,win.y);
		text(win.strs[win.flags.selection] || 'default',win.x+20,win.y);
		//
		pop();
	});
	
	// update
	windows.windows[win_id].ud = function () {
		// pointer
		var dx = mouseX - pmouseX;
		var dy = mouseY - pmouseY;
		var vec = this.sel_point.copy();
		vec.limit(1);
		if(this.flags.is_focused)this.sel_point.add(dx,dy);
		this.sel_point.sub(vec);
		this.sel_point.limit(100);

		//selection
		for (var i = 0; i < opts.length; i++) {
			var c = i*(2*PI/opts.length)+(2*PI/opts.length)/2;
			var n = (i+1)*(2*PI/opts.length)+(2*PI/opts.length)/2;
			var a = (this.sel_point.heading()+(3*PI)+(2*PI/opts.length))%(2*PI);
			if(c<=a && a<=n || a<=(2*PI/opts.length)/2 )this.flags['selection']=i;
		}

		if(this.sel_point.x === 0 && this.sel_point.y === 0 && this.flags.selection != -1)this.flags.selection = -1;
		// console.log('win',this);
	};
	
	// cleanup
	var kp_id = windows.newKeyPress(function (key) {
		if (key == 'Mouse')	windows.windows[win_id].close();
	}, win_id);
	windows.windows[win_id].close = function (k) {
		if(cb)cb(this.flags['selection'],k);
		if(do_close)this.close_();
	};
	windows.windows[win_id].close_ = function () {
		windows.kp[kp_id] = null;
		windows.removeWindow(this.id);
	};
	return win_id;
};


// -=-=-=-=- GameMenu -=-=-=-=- //
//
//
var GameMenu = function () {

};
GameMenu.prototype.open = function () {
	//functions
	function do_focus (id, kp) {
		windows.newKeyPress(kp,id);
		windows.focus(sel);
	}
	// console.log('open menu');
	var strs = ['This is the menu,\nit is currently empty.'];
	var win = windows.newWindow(strs, width/2, height*0.15, width*0.9, height*0.2);

	var opts = ['Party','Items','Options','Other','Exit'];
	var sel = windows.newSelector(width*0.15,height/2,opts,function (i,k) {
		if(k || i==-1)i=opts.length-1;
		var sel_kp = windows.windows[sel].kp_id;
		var kp = windows.kp[sel_kp];
		windows.kp[sel_kp] = null;
		windows.focus(sel,false);
		switch (i) {
			case 0: //party
				windows.newSimple(['temp party win'],width*0.6,height*0.6, width*0.7, height*0.6, function(){
						do_focus(sel,kp);
				});
				break;
			case 1: //items
				windows.newSimple(['temp items win'],width*0.6,height*0.6, width*0.7, height*0.6, function(){
						do_focus(sel,kp);
				});
				break;
			case 2: //options
				var opt_opts = ["Debug","Credits","Exit"];
				windows.newSelector(width*0.4,height/2,opt_opts,function(oi,ok){
					if(ok || oi==-1)oi=opt_opts.length-1;
					switch (oi) {
						case 0: //debug options
							var str = 'To toggle debug press:\n  "1" for general\n  "2" for terrain\n  "3" for player';
							windows.newSimple([str],width*0.6,height*0.6, width*0.7, height*0.6, function(){
									do_focus(sel,kp);
							});
							break;
						case 1: //credits
							windows.newSimple(['tmp credits win'],width*0.6,height*0.6, width*0.7, height*0.6, function(){
									do_focus(sel,kp);
							});
							break;
						case 2: //exit
							do_focus(sel,kp);
							break;
					}
				});
				break;
			case 3: //Other
				do_focus(sel,kp);
				break;
			case 4: //exit
				windows.windows[win].close();
				windows.windows[sel].close_();
				break;
		}
		// console.log(opts[i]);
	}, false); //pass false to keep selector open
};
