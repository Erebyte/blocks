
// all general engine things
/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
//				-=- Game -=-				//
//											//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=	//
*/

// Globals and Constants //
var VERSION = 'v0.0.0'; // version.release.patch
//
var amouseX;
var amouseY;
var hmouseCanvas;
var mouseLastClicked;
var doublePressedSpeed = 30;
var mouseDoublePressed = null;
//
var base_url = base_url || '.';
var game_url;
//
var camera;
var sound;
var player;
var windows;
var terrain;
var ambience;
var entities;
//

// -=-=-=-=- P5 Crap -=-=-=-=- //

function keyPressed() {}
// function mouseDoublePressed() {}
function mousePressed() {
	// doublepressed //
	if(mouseDoublePressed&&frameCount-mouseLastClicked<=doublePressedSpeed){
		mouseDoublePressed();
		mouseLastClicked = -Infinity;
		return;
	}
	mouseLastClicked = frameCount;
	// end //
	var state = game.getGamestate();
	var keyData = {type:'Mouse',key:null,pos:createVector(mouseX,mouseY)};
	if(state.data.KeyPressed)state.data.KeyPressed(state, keyData);
	//
	// For debug use !?!?! //
	// console.log(amouseX,amouseY);
}
function mouseReleased() {}
function mouseWheel(e){
	var state = game.getGamestate();
	var keyData = {type:'MouseWheel',key:null,delta:e.delta};
	if(state.data.KeyPressed)state.data.KeyPressed(state, keyData);
}
function keyPressed () {
	var state = game.getGamestate();
	var keyData = {type:'Key',key:key};
	if(state.data.KeyPressed)state.data.KeyPressed(state, keyData);
	
}
// -=-=-=-=- Game -=-=-=- //
var Game = function (params) {
	this.params = params;
	this.FSM = new SimpleFSM(this);
	// this.AI = new AI();
	this.flags = {
		'_fps_hystory':[]
	};
	if(params.quickload)this._quickload();
};
//
Game.prototype._states = {};
Game.prototype._quickload = function(){};
//
Game.prototype.init = function () {
	camera = new Camera();
	sound = new SoundEngine();
	windows = new Windows();
	terrain = new Terrain();
	ambience = new Ambience();
	entities = new Entities();
	player = new Player();
};
Game.prototype.update = function () {
	amouseX = floor(mouseX/camera.zoom) + camera.x - (width/2)/camera.zoom;
	amouseY = floor(mouseY/camera.zoom) + camera.y - (height/2)/camera.zoom;
	hmouseCanvas = 0<=mouseX && mouseX<=width && 0<=mouseY && mouseY<=height;
	//
};
Game.prototype.draw = function () {
	this.FSM.Execute();
};
Game.prototype.debug = function () {
	if(this.flags.debug){
		var hystMax = 200;
		this.flags._fps_hystory.push(frameRate());
		this.flags._fps = this.flags._fps_hystory.reduce(function(a,b){return a+b;},0)/this.flags._fps_hystory.length;
		if (this.flags._fps_hystory.length>200) {
			this.flags._fps_hystory = this.flags._fps_hystory.slice(1);
		}
		push();
		translate(0,10);
		textFont("Georgia");
		textSize(10);
		fill(200);
		text("Debug Mode",10,20);
		text("e:"+entities._draw.length+'/'+entities._active.length+'/'+entities._entities.length,10,40);
		text("p:["+Math.floor(player.pos.x)+','+Math.floor(player.pos.y)+','+Math.floor(player.pos.z)+"]",10,50);
		text("l:"+ambience._lastDraw+"/"+ambience.activeLights.length+"/"+ambience.lights.length,10,60);
		
		// FPS 
		text("FPS:"+Math.round(this.flags._fps), width-400, 20);
		fill(0,100,200,100);
		stroke(150,0,0);
		line(width-400,40,width,40); //100-60fps=40
		var t = game.flags._fps_hystory.length;
		line(width-t*2,30,width-t*2,50); //100-60fps=40(+/-10)
		stroke(200);
		beginShape();
		vertex(width-(t*2-1),40);
		for (i = t-1; i >= 0; i--) {
			var fps = game.flags._fps_hystory[i];
			fps = map(fps,0,100,100,0);
			vertex(width-i*2,fps);
		}
		vertex(width,40);
		endShape();
		//
		//
		if(sound&&sound._debug)sound.drawDebug();
		//
		pop();

	}
};
Game.prototype.toggleDebug = function () {
	this.flags.debug = !this.flags.debug;
};
Game.prototype.getGamestate = function () {
	return this.FSM.current_state;
};


// =-= Entities =-= //
var Entities = function(){
	this._refresh = true;
	this._refresh_last = null;
	this._entity_data = [];
	this._entity_ord = 1;
	this._entities = [];
	this._draw = [];
	this._active = [];
};
Entities.prototype.refresh = function () {
	this._refresh = true;
};
Entities.prototype.getActive = function () {
	var a = [];
	for(var i=this._active.length-1;i>=0;i--){
		a.push(this._entity_data[this._active[i]]);
	}
	return a;
};
Entities.prototype.draw = function () {
	if(this._draw.length){
		var _sort = function (a,b) {
			return entities._get(b).getWeight() - entities._get(a).getWeight();
		};
		this._draw = this._draw.sort(_sort);
		for (i=this._draw.length-1;i>=0;i--) {
			//if on screen(range)//
			this._get(this._draw[i]).draw();
		}
	}
};
Entities.prototype.update = function () {
	//
	var i;
	// refresh
	if(this._refresh){
		this._active = [];
		console.log('refreshing entities');
		//
		var plrdst, cmrdst;
		var rangeSq = width;
		rangeSq *= rangeSq;
		var id, ent;
		var cmrpos = camera.get_transition();
		cmrpos.z = 0;
		for(i=this._entities.length-1;i>=0;i--){
			id = this._entities[i];
			ent = this._get(id);
			plrdst = p5.Vector.sub(ent.pos,player.pos);
			cmrdst = p5.Vector.sub(ent.pos,cmrpos);
			plrdst.z = 0;
			cmrdst.z = 0;
			plrdst = plrdst.magSq();
			cmrdst = cmrdst.magSq();
			if((plrdst<=rangeSq)||(cmrdst<=rangeSq))this._active.push(id);
			// console.log(id,rangeSq,plrdst,cmrdst);
		}
		this._refresh = false;
		this._refresh_last = player.pos.copy();
	}
	// do refresh?
	var plrdstSq = p5.Vector.sub(player.pos,this._refresh_last).magSq();
	var rangeSq = width*width*0.3;
	if(plrdstSq>rangeSq)this.refresh();
	// draw
	this._draw = [];
	var e;
	var isVisable;
	for(i=this._active.length-1;i>=0;i--){
		e = this._get(this._active[i]);
		isVisable = camera.collide(e.pos,(e.w||0)+(e.h||0));
		if(isVisable)this._draw.push(this._active[i]);
		e.update(isVisable);
	}
	this._draw.push(player._entity_id);
	player.update();
};
//
Entities.prototype._buildVector = function(arr){
	var vec = arr;
	if(vec&&vec.length){
		vec = createVector(vec[0],vec[1],vec[2],vec[3]);
	}
	return vec;
};
Entities.prototype._buildData = function(data){
	
	return Object.assign(data,{
		pos:this._buildVector(data.pos)||createVector(),
		col:this._buildVector(data.col)
	});
};
Entities.prototype._add = function(ent){
	var id = this._entity_ord++;
	ent._entity_id = id;
	this._entity_data[id]=ent;
	this._refresh = true;
	return id;
};
Entities.prototype._get = function(id){
	return this._entity_data[id];
};
Entities.prototype._rm = function(id){
	this._entity_data[id]=null;
};


// -=-=-=-=- GameEntity -=-=-=- //
var GameEntity = function (entity_data) {
	entity_data = entities._buildData(entity_data);
	this.pos = entity_data.pos;
	this.col = entity_data.col;
	this.flags = Object.assign({},entity_data.flags);
	this.entity_data = entity_data;
	entities._add(this);
};
GameEntity.prototype.update = function(){};
GameEntity.prototype.getWeight = function(){
	return this.pos.y;
};
GameEntity.prototype.draw = function(){};
GameEntity.prototype._draw = function(){
	if(!this.img_buffer)return;
	//
	var ofs = this.pos.copy().sub(this.buf_offset||createVector());
	image(this.img_buffer,ofs.x,ofs.y);
	if(this.flags.buffer_debug){
		noFill();
		rect(ofs.x,ofs.y,this.img_buffer.width,this.img_buffer.height);
		fill(200);
		ellipse(this.pos.x,this.pos.y,3,3);
	}
};
GameEntity.prototype._check = function(data){
	if (this.flags.checking !== true) {
		var agent = this;
		data = Object.assign({
			agent:agent,
			strs:'Warning: missing `_check` <str>'
		},data,{
			_cb:data.callback,
			callback:function(){
				if(this._cb)this._cb();
				this.agent.flags.checking = false;
			}
		});
		var win = windows.newWindow(data);
		this.flags.checking = true;
	}
};



/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
//				-=- GameMath -=-			//
//											//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=	//
*/

// -=-=-=-=- GameMath -=-=-=- //
var  GameMath = {
	gravity:function(agent){
		if(!agent.flags.gravity)return;
		if(agent.pos.z>0)agent.vec.add(0,0,-0.3);//gravity
		if(agent.pos.z<=0){
			agent.pos.z=0;
			agent.vec.z=0;
			agent.flags.is_sliding = true;
			if(agent.flags.friction)agent.vec.mult(0.7);//friction
		}
	},
	lerp:function(x,y,mu){
		return (x*(1-mu)+y*mu);
	},
	sLerp:function(x,y,mu){
		//linear sin interpolation (triangle wave intrp.)
		if(mu>0.5)mu=1-mu;
		mu*=2;
		return this.lerp(x,y,mu);
	},
	cerp:function(x,y,mu,r){
		var mu2 = (1-cos(mu*PI))/2;
		if(r&r>0)return this.cerp(x,y,mu2,r-1);
		return (x*(1-mu2)+y*mu2);
	},
	serp:function(x,y,mu,r){
		var mu2 = sin(mu*PI);
		if(r&r>0)return this.serp(x,y,mu2,r-1);
		return (x*(1-mu2)+y*mu2);
	}
};

// -=-=-=-=- Finite State Machine -=-=-=-=- //
var SimpleFSM = function (agent) {
	this.agent = agent;
	this.states = {};
	this.current_state = {
		Execute:function(){console.log('FiniteStateMachine still initializing');},
		Exit:function(){}
	};
	this.current_isComplete = false;
	this.current_transition = null;
	//
	if(agent&&agent._states){
		var val;
		for (var key in agent._states) {
			val = agent._states[key];
			if(key=='init'){this.setState(val);}
			else{this.new_State(key,val);}
		}
	}
};
SimpleFSM.prototype.Complete = function () {
	this.current_isComplete = true;
};
SimpleFSM.prototype.isComplete = function () {
	return this.current_isComplete;
};
SimpleFSM.prototype.getStates = function () {
	return Object.keys(this.states);
};
SimpleFSM.prototype.Execute = function () {
	if(this.current_transition){
		this.current_state.Exit();
		this.current_state = this.states[this.current_transition];
		this.current_isComplete = false;
		this.current_state.Enter(this.transition_args);
		this.current_transition = null;
		this.transition_args = null;
	}
	this.current_state.Execute();
};
SimpleFSM.prototype.setState = function (state, args) {
	this.current_transition = state;
	this.transition_args = args;
};
SimpleFSM.prototype.new_State = function (state, data) {
	function noExecuteWarning () {
		console.log('noExecuteWarning\n\tState: `'+state+'` has no execute function.');
		this.Execute = function(){};
	}
	var o = {
		FSM:this,
		agent:this.agent,
		state:state,
		Enter:data.Enter||function(){},
		Execute:data.Execute||noExecuteWarning,
		Exit:data.Exit||function(){},
		data:data
	};
	this.states[state]=o;
	return o;
};

/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= //
//				-=- Camera -=-				//
//											//
// custom camera class cause i dont need	//
// p5's camera class.						//
//											//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=	//
*/


// -=-=-=-=- Camera -=-=-=- //
//
var Camera = function () {
	this.x = 20;
	this.y = 20;
	this.zoom = 1;
	this.vec = createVector();
	this.offset = createVector(0,0,1);
	//
	this.focus_points = [null];
	this.active_points = [];
};
//
Camera.prototype.flags = {
	noise_offset:0,
	update_spd:0.005
};
Camera.prototype.update = function () {
	// - Noise Stuff - //
	this.flags.noise_offset+=this.flags.update_spd;
	var ofs = this.flags.noise_offset;
	var dx = map(noise(ofs*0.1),0,1,-50,50);
	var dy = map(noise(ofs*0.1+1000),0,1,-50,50);
	var dz = map(noise(ofs*0.1+2000),0,1,0.85,1.15);
	var ds = map(noise(ofs*0.1+3000),0,1,0.001,0.01);
	this.flags.update_spd = ds;
	this.offset.x = dx;
	this.offset.y = dy;
	this.offset.z = dz;
	//
	// - Follow - //
	this.x+=this.vec.x;
	this.y+=this.vec.y;
	var limit = 150;
	var cmrSpd = 5;
	var cmr = createVector(this.x,this.y);
	var dlt = p5.Vector.sub(player.pos, cmr);
	for(var i=this.active_points.length-1;i>=0;i--){
		var v = this.focus_points[this.active_points[i]].agent.pos.copy();
		var w = this.focus_points[this.active_points[i]].w;
		v.sub(cmr);
		v.mult(w);
		dlt.add(v);
	}
	var dlen = dlt.magSq();
	dlt.limit(0.07);
	if(dlen>limit*limit){
		this.vec.add(dlt);
		var udlt = dlt.copy();
		var uvec = this.vec.copy();
		udlt.normalize();
		uvec.normalize();
		this.vec.limit(constrain((udlt.dot(uvec)+0.22)*1.15, 0,1)*cmrSpd);
	}else{
		this.vec.mult(0.98);
	}
};
Camera.prototype.apply_transition = function () {
	var d = this.get_transition();
	translate(d.x,d.y);
	scale(d.z);
};
Camera.prototype.get_transition = function () {
	var dz = this.zoom * this.offset.z;
	var dx = (width/2-this.x+this.offset.x)*dz;
	var dy = (height/2-this.y+this.offset.y)*dz;
	return createVector(dx,dy,dz);
};
Camera.prototype.move = function (x, y) {
	this.x -= x/this.zoom;
	this.y -= y/this.zoom;
};
Camera.prototype.set_pos = function (pos) {
	this.x = pos.x;
	this.y = pos.y;
	this.zoom = pos.z||this.zoom;
};
Camera.prototype.collide = function (pos, w) {
	var x = (pos.x/this.zoom-this.x)+width/2;
	var y = (pos.y/this.zoom-this.y)+height/2;
	return collideRectCircle(0,0,width,height,x,y,500+(w||0));
};
Camera.prototype.addFocus = function(agent,weight,inactive){
	var id = this.focus_points.length;
	this.focus_points.push({
		agent:agent,
		w:weight//0-1
	});
	if(!inactive)this.activeFocus(id);
	return id;
};
Camera.prototype.activeFocus = function(id){
	if(this.focus_points[id])this.active_points.push(id);
};
Camera.prototype.removeFocus = function(id, del){
	if(this.active_points.indexOf(id)>=0){
		this.active_points.splice(this.active_points.indexOf(id),1);
	}
	if(del)this.focus_points[id] = null;
};



// -=-=- Sound Engine -=-=- //
//
//
//

var SoundEngine = function () {
	this.loadedSounds = {};
	this.sounds = [];
	this.active = [];
	this.ord = 0;
	//
	this.current_music = null;
	this.musicVolume = 0;
	this.SFXVolume = 0;
	//
	masterVolume(0.7);
	this.setMusicVolume(0.7);
	this.setSFXVolume(0.7);
	//
	this._debug = false;
	this._fft = new p5.FFT();
	this._amp = new p5.Amplitude();
	this._amp.smooth(0.5);
	this._amp.toggleNormalize(true);
	this._amp_hyst = [];
	//
};
SoundEngine.prototype.update = function () {
	var i;
	for(i=this.active.length-1;i>=0;i--){
		if(this.sounds[this.active[i]])this.sounds[this.active[i]].update();
	}
};
SoundEngine.prototype.setMusicVolume = function (vol) {
	vol = round(vol*100)/100;
	this.musicVolume = vol;
	if(this.current_music)this.sounds[this.current_music].setVolume(vol);
};
SoundEngine.prototype.setSFXVolume = function (vol) {
	vol = round(vol*100)/100;
	this.SFXVolume = vol;
};
SoundEngine.prototype.activeSound = function (id, bool) {
	if(bool!==false){
		if(this.active.indexOf(id)==-1)this.active.push(id);
	}else {
		if(this.active.indexOf(id)!=-1)this.active.splice(this.active.indexOf(id),1);
	}
};
SoundEngine.prototype.drawDebug = function () {
	//
	var spec = this._fft.analyze();
	var wave = this._fft.waveform();
	var amps = this._amp_hyst;
	var spec_len = floor(spec.length*0.5);
	var wave_len = wave.length;
	var amps_len = amps.length;
	var curAmps = this._amp.getLevel();
	var pos = createVector(215,40);
	var dim = createVector(225,50);
	var ofs = pos.copy().sub(dim.copy().mult(0.5));
	var i;
	var x,y;
	//
	var txtpos = pos.copy().add(dim.x*0.5+10,0);
	noStroke();
	fill(200);
	text('MstVol: '+floor(getMasterVolume()*100),txtpos.x,txtpos.y);
	text('MscVol: '+floor(this.musicVolume*100),txtpos.x,txtpos.y+10);
	text('SfxVol: '+floor(this.SFXVolume*100),txtpos.x,txtpos.y+20);
	text('Amp: '+floor(curAmps*100),txtpos.x,txtpos.y+30);
	text('Snd: '+this.active.length+'/'+this.sounds.length,txtpos.x,txtpos.y+40);
	//
	if(this._debug_fft){
		this._amp_hyst.push(curAmps);
		if(this._amp_hyst.length>100)this._amp_hyst.splice(0,1);
		//
		push();
		noFill();
		stroke(255,0,0);
		rect(ofs.x,ofs.y,dim.x,dim.y);
		stroke(255,255,255,100);
		fill(0,200,100,50);
		// Spec
		beginShape();
		vertex(ofs.x+dim.x,ofs.y+dim.y);
		for(i=spec_len-1;i>=0;i--){
			x = map(i, 0,spec_len, ofs.x,ofs.x+dim.x);
			y = map(255-spec[i], 0,255, ofs.y,ofs.y+dim.y);
			vertex(x,y);
		}
		vertex(ofs.x,ofs.y+dim.y);
		endShape();
		fill(0,100,200,50);
		// Amps
		beginShape();
		vertex(ofs.x,ofs.y+dim.y);
		for(i=amps_len-1;i>=0;i--){
			x = map(i, 0,amps_len, ofs.x+dim.x,ofs.x);
			y = map(amps[i], 0,1, ofs.y+dim.y,ofs.y);
			vertex(x,y);
		}
		vertex(ofs.x+dim.x,ofs.y+dim.y);
		endShape();
		noFill();
		// Wave
		beginShape();
		for(i=wave_len-1;i>=0;i--){
			x = map(i, 0,wave_len, ofs.x,ofs.x+dim.x);
			y = map(wave[i], -1,1, ofs.y,ofs.y+dim.y);
			vertex(x,y);
		}
		endShape();
		pop();
	}
};
SoundEngine.prototype.toggleDebug = function () {
	if(!this._debug){
		this._debug = true;
		this._debug_fft = true;
	}else if(this._debug_fft){
		this._debug_fft = false;
	}else{
		this._debug = false;
	}
};
//
SoundEngine.prototype.loadSound = function (data) {
	data = Object.assign({
		track:null,
		loop:false,
		//
		vol:1.0,
		//
		play:function(){
			// console.log('playing: '+this.id);
			var vol = map(this.vol, 0,1, 0,sound.SFXVolume);
			if(!vol)return;
			this.track.setVolume(vol);
			if(this.loop){
				this.track.loop();
			}else{
				this.track.play();
			}
		},
		stop:function(){
			this.track.stop();
		},
		pause:function(){
			//
		}
	},data,{
		id:this.ord++,
		//
		isPlaying:function(){
			if(typeof this.track != 'string'){
				return this.track.isPlaying();
			}
			return false;
		},
		isLoaded:function(){
			if(typeof this.track != 'string'){
				return this.track.isLoaded();
			}
			return false;
		},
		setVolume:function(vol){
			this.vol = vol;
			if(typeof this.track == 'string')return;
			this.track.setVolume(vol);
		}
	});
	this.sounds[data.id]=data;
	//
	//load tracks
	var loadSuccess = function (url,data) {
		return function () {
			// console.log(url, id);
			if(data.isLoaded()&&data.onLoad)data.onLoad();
		};
	};
	var loadError = function (url,data){
		return function () {
			console.log('Warning: failed to load sound at url '+url);
		};
	};
	var track_url = data.track;
	if(this.loadedSounds[track_url]){
		data.track = this.loadedSounds[track_url];
	}else{
		console.log('loading: '+track_url);
		data.track = loadSound(
			track_url,
			loadSuccess(track_url,data),
			loadError(track_url,data)
		);
	}
	//
	return data.id;
};
SoundEngine.prototype.playSound = function (id) {
	if(this.sounds[id])this.sounds[id].play();
};
SoundEngine.prototype.playMusic = function () {
	if(!this.sounds[this.current_music]){
		this.stopMusic();
		return;
	}
	if(!this.sounds[this.current_music].isLoaded()){
		this.sounds[this.current_music].onLoad = function(){
			this.play();
		};
		return;
	}
	if(this.last_music&&!this.sounds[this.last_music].isPlaying()){
		this.sounds[this.last_music].stop();
	}
	if(!this.sounds[this.current_music].isPlaying()){
		this.sounds[this.current_music].play();
		this.sounds[this.current_music].setVolume(this.musicVolume);
	}

	//
};
SoundEngine.prototype.stopMusic = function () {
	if(this.last_music)this.sounds[this.last_music].stop();
	if(this.current_music)this.sounds[this.current_music].stop();
};
SoundEngine.prototype.setMusic = function (id) {
	if(!this.sounds[id]){
		this.last_music = this.current_music;
		this.current_music = null;
	}else{
		this.current_music = id;
		this.sounds[id].loop = true;
	}
};
//
SoundEngine.prototype.addPoint = function (data) {
	//
};




var win_ordnal = 0;
// -=-=-=-=- Windows -=-=-=- 
//
var Windows = function () {
	this.windows = [];
	this.active = [];
	this.inactive = [];
	this.kp = [];
	this.kpActive = [];
	//
	this.open_menu = false;
	this.open_window = false;
	//
	for(var idStr in this._soundData){
		this._soundData[idStr] = sound.loadSound(this._soundData[idStr]);
	}
};
//
Windows.prototype.update = function () {
	this.open_window = this.active.length > 0;
	//
	for (var i = this.active.length-1; i>=0; i--){
		this.windows[this.active[i]].update();
	}
};
Windows.prototype.draw = function () {
	for (var i = this.active.length-1; i>=0; i--){
		this.windows[this.active[i]].draw();
	}
};
Windows.prototype.keyPressed = function (data) {
	for (var i = this.kp.length-1; i>=0; i--){
		if(this.windows[this.kp[i]])this.windows[this.kp[i]].keyPressed(data);
	}
};
//
Windows.prototype._functions = {
	setflag:function(win,args){
		for (var flag in args) {
			var value = args[flag];
			// console.log(flag, value);
			if(flag.slice(0,1)=='#') {//game flag
				game.flags[flag.slice(1)] = value;
			}else {
				win.agent.flags[flag] = value;
			}
		}
	},
	yesno:function(win,args){
		var def = args.default || -1;
		var agent = win.agent;
		win._insertStr(-1);
		win.textitrdef=-1;
		windows._rmKeyPressed(win.id);
		windows.newYesNo({
			callback:function(i){
				// win.close();
				windows._addKeyPressed(win.id);
				win.textitrdef=0;
				if(i==-1)i=def;
				if(args.case[i]){
					win._insertStr(args.case[i]);
				}
				win.next();
			}
		});
	},
	move:function(win,args){
		console.log('Windows._functions.move');
	},
	joinparty:function(win,args){
		if(!win.agent)return;
		var obj = win.agent;
		player.party_members.push(obj);
		obj.flags['follow_dist'] = random(50,70);
		var str = obj.entity_data.name+' '+obj.entity_data.surname+' has joined your party';
		win._insertStr(str);
	}
};
Windows.prototype._soundData = {
	menu:{track:base_url+'/res/sound/click.mp3'}
};
Windows.prototype._playSound = function(idStr){
	if(this._soundData[idStr]!=null){
		sound.playSound(this._soundData[idStr]);
	}
};
Windows.prototype._addWindow = function(win){
	this.windows[win.id] = win;
};
Windows.prototype._removeWindow = function(id){
	this.windows[id].unload();
	this._setInactive(id);
	this._rmKeyPressed(id);
	this.windows[id] = null;
};
Windows.prototype._setActive = function(id){
	if(this.active.indexOf(id)==-1)this.active.push(id);
};
Windows.prototype._setInactive = function(id){
	if(this.active.indexOf(id)==-1)return;
	this.active.splice(this.active.indexOf(id), 1);
};
Windows.prototype._addKeyPressed = function(id){
	if(this.kp.indexOf(id)==-1)this.kp.push(id);
};
Windows.prototype._rmKeyPressed = function(id){
	if(this.kp.indexOf(id)==-1)return;
	this.kp.splice(this.kp.indexOf(id), 1);
};
//
Windows.prototype._objCallback = function (obj) {
	return function (w) {
		for (var func in obj) {
			if (typeof windows._functions[func] == 'function') {
				windows._functions[func](w, obj[func]);
			}
		}
	};
};
//
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
Windows.prototype.close = function (id) {
	if(!this.windows[id])return;
	this.windows[id].close();
};
//
Windows.prototype.newMenu = function () {
	console.log('Warning: No Menu function defined\nMake `Windows.prototype.newMenu` function');
	this.newMenu = function(){};
};
Windows.prototype.newBaseWindow = function (data) {
	var win = Object.assign({
		id:win_ordnal++,
		x:width*0.5,
		y:height*0.5,
		w:10,
		h:10,
		//
		doClose:true,
		//
		update:function(){
			console.log('Warning: window #'+this.id+' has missing update function');
			this.update = function(){};
		},
		draw:function(){
			console.log('Warning: window #'+this.id+' has missing draw function');
			this.draw = function(){};
		},
		keyPressed:function(){
			console.log('Warning: window #'+this.id+' has called missing keyPressed function');
		},
		unload:function(){},
		close:function(){
			if(!this.doClose)return;
			windows._removeWindow(this.id);
		},
		//
		_draw:function(){
			push();
			noStroke();
			rectMode(CENTER);
			translate(this.x, this.y);
			rotate(radians(this.rotation||0));
			//draw window box
			push();
			rotate(radians(this.fr));
			fill(0, 0, 0, 70);
			rect(0, 0, this.w, this.h);
			// rotate(radians(-this.data.fr));
			pop();
			push();
			rotate(radians(this.br));
			fill(0, 0, 0, 150);
			rect(0, 0, this.w*0.85, this.h*0.8);
			// rotate(radians(-this.data.br));
			pop();
			pop();
		},
		fd:0.01,
		bd:0.005,
		fr:0,
		br:0,
		_anm:function(){
			this.fr += this.fd;
			this.br += this.bd;
			if (this.fr > 0) {
				this.fd -= 0.00005;
			}else {
				this.fd += 0.00005;
			}
			if (this.br > 0) {
				this.bd -= 0.0001;
			}else {
				this.bd += 0.0001;
			}
		}
	},data);
	win.flags = Object.assign({
		'draw':true,
		'is_focused':true,
	},data.flags||{});
	//
	this._addWindow(win);
	this._setActive(win.id);
	if(data.keyPressed)this._addKeyPressed(win.id, data.keyPressed);
	//
	return win.id;
};
Windows.prototype.newWindow = function (data) {
	for (var i=0;i<data.strs.length;i++) {
		if (typeof data.strs[i] == 'object' && data.strs[i] !== null) {
			data.strs[i] = this._objCallback(data.strs[i]);
		}
	}
	//
	data = Object.assign({
		x:width/2,
		y:height*0.8,
		w:width*0.9,
		h:height/2*0.60,
		update:function(){
			this.anm();
		},
		draw:function(){
			if(this.flags.draw){
				push();
				this._draw();
				//draw text
				// noStroke();
				rectMode(CENTER);
				translate(this.x, this.y);
				fill(255);
				textAlign(LEFT);
				textFont("Georgia");
				textSize(24);
				text(this.text, 0, 0, this.w*0.8, this.h*0.7);
				pop();
			}
		},
		keyPressed:function(data){
			if(data.type=='Mouse'){
				this.next();
			}
		},
		unload:function(){
			if(this.callback)this.callback(this);
		},
		//
		strs:['Default text (this should not appear)\nConsult someone...'],
		str:'Default text (this should not appear)\nConsult someone...',
		text:'',
		str_i:0,
		textitrdef:0,
		textitr:0,
		next:function(i){
			if(this.textitr != -1 && i !== 0){
				this.text = this.str;
				this.textitr = -1;
				return;
			}
			if(i === null || i === undefined)i = 1;
			this.str_i += i;
			if (this.strs.length > this.str_i) {
				this.str = this.strs[this.str_i];
				this.textitr = this.textitrdef;
				if (typeof this.str == 'function') {
					this.str(this);
					this.textitr=-1;
					this.next();
				}else if(this.textitr >= 0){
					this.text = this.str.slice(0,this.textitr);
				}else{
					this.text = this.str;
				}
			}else {
				this.close();
			}
			if(i>0)windows._playSound('menu');
		},
		//
		anm:function(){
			if(this.textitr >= 0){
				this.text = this.str.slice(0,this.textitr);
				this.textitr++;
				if(this.textitr > this.str.length) this.textitr = -1;
			}
			this._anm();
		},
		//
		_insertStr:function(str, i){
			var list = false;
			if(i === undefined)i = this.str_i+1;
			if(typeof str === 'number')str = this.strs[this.str_i+str];
			if(typeof str === 'object')list = 0;
			if(list === false){
				this.strs.splice(i,0,str);
			}else{
				for(list;list<str.length;list++){
					var s = str[list];
					if(typeof s === 'object')s = windows._objCallback(s);
					this.strs.splice(i+list,0,s);
				}
			}
			// console.log(this.strs);
		}
	},data);
	data.strs = data.strs.slice();
	data.next(0);
	return this.newBaseWindow(data);
};
Windows.prototype.newSelector = function (data) {
	var offset = 0;
	data = Object.assign({
		x:width*0.5,
		y:height*0.4,
		update:function(){
			// pointer
			var dx = (mouseX - pmouseX)*0.5;
			var dy = (mouseY - pmouseY)*0.5;
			var vec = this.sel_point.copy();
			vec.limit(0.2);
			if(this.flags.is_focused)this.sel_point.add(dx,dy);
			this.sel_point.sub(vec);
			this.sel_point.limit(100);

			//selection
			for (var i = 0; i < this.strs.length; i++) {
				var c = i*(2*PI/this.strs.length)+(2*PI/this.strs.length)/2;
				var n = (i+1)*(2*PI/this.strs.length)+(2*PI/this.strs.length)/2;
				var a = (this.sel_point.heading()+(3*PI)+(2*PI/this.strs.length))%(2*PI);
				if(c<=a && a<=n || a<=(2*PI/this.strs.length)/2 )this.flags['selection']=i;
			}
			if(this.sel_point.x === 0 && this.sel_point.y === 0 && this.flags.selection != -1)this.flags.selection = -1;
		},
		draw:function(){
			var opts = this.strs;
			push();
			offset+=0.02;
			for (var i = opts.length - 1; i >= 0; i--) {
				var v = p5.Vector.fromAngle((i*(2*PI/opts.length)+PI+(2*PI/opts.length)/2)+map(noise(offset*0.1+1000+i*1000),0,1,-0.5,0.5));
				v.mult(map(noise(offset+i*10000),0,1,5,40));
				stroke(200,200,200,map(noise(offset+(i+10)*10000),0,1,5,200));
				line(this.x,this.y,this.x+v.x,this.y+v.y);
			}
			stroke(0,0,255,100);
			line(this.x,this.y,this.x+this.sel_point.x,this.y+this.sel_point.y);

			fill(200);
			text(this.flags.selection,this.x,this.y);
			text(this.strs[this.flags.selection] || 'default',this.x+20,this.y);
			//
			pop();
		},
		keyPressed:function(data){
			if(data.type == 'Mouse'){
				this.do_selection();
				this.close();
			}
		},
		//
		strs:['Error','Missing'],
		sel_point:createVector(),
		do_selection:function(){
			this.callback(this.flags.selection);
		},
		callback:function(){console.log('Warning: selector window #'+this.id+' has missing callback function');}
	},data);
	data.flags = Object.assign({
		'is_focused':true,
		'selection':-1
	},data.flags);
	return this.newBaseWindow(data);
};
Windows.prototype.newYesNo = function (data) {
	data = Object.assign({
		strs:['Yes','No']
	},data);
	return this.newSelector(data);
};
Windows.prototype.newSelectorVertical = function (data) {
	data = Object.assign({
		y:height*0.5,
		w:width*0.3,
		h:height*0.3,
		//
		update:function(){
			if(this.flags.selection!=this.flags.cur){
				var d = this.flags.cur-this.flags.selection;
				if(abs(d)<1)d*=1.5;
				this.flags.cur += d*-0.1;
			}
			//
		},
		draw:function(){
			//
			var cur = floor(this.flags.cur);
			var twn = cur-this.flags.cur;
			var sublist = [
				this.strs[cur-4],
				this.strs[cur-3],
				this.strs[cur-2],
				this.strs[cur-1],
				this.strs[cur],
				this.strs[cur+1],
				this.strs[cur+2],
				this.strs[cur+3],
				this.strs[cur+4]
			];
			//
			push();
			noFill();
			stroke(0);
			ellipse(this.x,this.y,10,10);
			rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
			//
			fill(200);
			textFont("Georgia");
			textSize(24);
			var str;
			var y;
			for(var i=0;i<10;i++){//8=sublist.length
				str = sublist[i];
				if(str){
					fill(200,200,200,GameMath.serp(0,255,(i+twn)/8));
					stroke(0,0,0,GameMath.serp(0,255,(i+twn)/8));
					y = GameMath.cerp(this.y-this.h*0.4,this.y+this.h*0.4,(i+twn)/8,1);
					text(str,this.x-this.w/2+20,y);
				}
			}
			fill(200,200,200,255);
			stroke(0,0,0,255);
			text(this.flags.selection,this.x-this.w/2-20,this.y);
			//
			pop();
		},
		keyPressed:function(data){
			this._keyPressed(data);
			if(data.type == 'Mouse'){
				this.do_selection();
				this.close();
			}
		},
		_keyPressed:function(data){
			//
			if(data.type=='MouseWheel'){
				if(data.delta>0){
					this.flags.selection++;
					this.flags.direction='+';
				}else{//delta<0
					this.flags.selection--;
					this.flags.direction='-';
				}
				var old_sel = this.flags.selection;
				this.flags.anm_tween+=0.01;
				this.flags.selection = constrain(this.flags.selection,0,this.strs.length-1);
				if(old_sel==this.flags.selection)windows._playSound('menu');
			}
		}
	},data);
	data.flags = Object.assign({
		'anm_tween':0,
		'cur':0,
		'selection':0
	},data.flags);
	return this.newSelector(data);
};
Windows.prototype._newSlider = function (data) {
	data = Object.assign({
		w:300,
		h:60,
		//
		orient:'horizontal'||'vertical',
		value:0,
		min:0,
		max:1,
		step:0.1,
		//
		update:function(){
			//
			this._anm();
		},
		draw:function(){
			//
			this._draw();
			push();
			translate(this.x,this.y);
			if(this.orient=='vertical')rotate(radians(-90));
			rectMode(CENTER);
			fill(200,200,200,100);
			rect(0,0,this.w*0.7,5);
			//
			var pos = (this.value-(this.max-this.min)/2)/this.max*0.7*this.w;
			fill(200,200,200,255);
			ellipse(pos,0,10,10);
			pop();
		},
		keyPressed:function(data){
			if(data.type == 'Mouse'){
				if(this.callback)this.callback(this.value);
				this.close();
			}else if(data.type == 'MouseWheel'){
				var sign = 1;
				if(data.delta>0)sign = -1;
				this.value += sign*this.step;
				var last = this.value;
				this.value = constrain(this.value, this.min, this.max);
				if(last == this.value)windows._playSound('menu');
				if(this.onchange)this.onchange(this.value);
			}
		}
	},data);
	if(data.orient == 'vertical')data.rotation = -90;
	// data.flags = Object.assign({},data.flags);
	return this.newBaseWindow(data);
};
// -=- Menu Functions -=- //
//
Windows.prototype.newMenu = function(){
	console.log('Warning: Windows obj has no `newMenu` function defined\n\tdefine one by setting Windows.prototype.newMenu');
	this.newMenu = function(){};
};
//
Windows.prototype._menu_settings = function(parent, callback){
	//
	console.log('Settings');
	windows.newSelectorVertical({
		strs:['Fullscreen','Video Option 1','Video Option 2','Video Option 3','exit'],
		unload:function(){
			if(parent){
				windows._addKeyPressed(parent);
				windows.focus(parent);
			}
		},
		callback:function(i){
			console.log('i',i);
			if(callback)callback(i);
		}
	});
};
Windows.prototype._menu_audio = function(parent, callback){
	//
	console.log('Audio Options');
	var sel = windows.newSelectorVertical({
		strs:['Master Volume','Music Volume','SFX Volume','exit'],
		doClose:false,
		unload:function(){
			if(parent){
				windows._addKeyPressed(parent);
				windows.focus(parent);
			}
		},
		callback:function(i){
			windows._rmKeyPressed(sel);
			windows.focus(sel, false);
			var volcb = function (val){
				// console.log(i, val);
				switch(i){
					case 0:
						masterVolume(val);
						break;
					case 1:
						sound.setMusicVolume(val);
						break;
					case 2:
						sound.setSFXVolume(val);
						break;
					default:
						break;
				}
			};
			switch(i){
				case 0:
				case 1:
				case 2:
					var value = [
						getMasterVolume(),
						sound.musicVolume,
						sound.SFXVolume
					][i];
					windows._newSlider({
						x:width*0.8,
						orient:'vertical',
						step:0.02,
						value:value,
						//
						unload:function(){
							windows._addKeyPressed(sel);
							windows.focus(sel);
						},
						onchange:volcb,
						callback:volcb
					});
					break;
				default:
					this.doClose = true;
					break;
			}
			if(callback)callback(i);
		}
	});
};
Windows.prototype._menu_party = function(parent, callback){
	var strs = [];
	for(i=0;i<5;i++){
		strs.push('party_'+i);
	}
	windows.newSelectorVertical({
		strs:strs,
		unload:function(){
			if(parent){
				windows._addKeyPressed(parent);
				windows.focus(parent);
			}
		},
		callback:function(i){
			console.log('i',i);
			if(callback)callback(i);
		}
	});
};
Windows.prototype._menu_items = function(parent, callback){
	var strs = [];
	for(i=0;i<20;i++){
		strs.push('item_'+i);
	}
	strs.push('exit');
	var item_sel = windows.newSelectorVertical({
		strs:strs,
		keyPressed:function(data){
			this._keyPressed(data);
			if(data.type == 'Mouse'){
				this.do_selection();
			}
		},
		callback:function(i){
			if(i==this.strs.length-1){
				if(parent){
					windows._addKeyPressed(parent);
					windows.focus(parent);
				}
				if(callback)callback(i);
				this.close();
				return;
			}
			windows._rmKeyPressed(item_sel);
			var itm = this.strs[i];
			windows.newSelector({
				strs:['use','examine','drop','exit'],
				callback:function(j){
					console.log(i,itm,this.strs[j]);
					//
					switch(j){
						case 0://use
							//
							windows.newWindow({
								strs:['tmp use window...'],
								unload:function(){
									windows._addKeyPressed(item_sel);
								}
							});
							break;
						case 1://examine
							//
							windows.newWindow({
								strs:['tmp examine window...'],
								unload:function(){
									windows._addKeyPressed(item_sel);
								}
							});
							break;
						case 2://drop
							//
							windows.newWindow({
								strs:['tmp drop window...'],
								unload:function(){
									windows._addKeyPressed(item_sel);
								}
							});
							break;
						default:
						case 3://exit
							windows._addKeyPressed(item_sel);
							windows.focus(item_sel);
							break;
					}
					if(callback)callback(i,itm,j);
				}
			});
		}
	});
};
Windows.prototype._menu_credits = function(parent, callback){
	windows.newWindow({
		x:width*0.6,
		y:height*0.6,
		w:width*0.7,
		h:height*0.6,
		strs:['tmp credits win\n\nby Me...\nand helpers\n    thanks.'],
		unload:function(){
			if(parent){
				windows._addKeyPressed(parent);
				windows.focus(parent);
			}
			if(callback)callback();
		}
	});
};



// -=-=-=-=- Player -=-=-=- //
//
var Player = function () {
	GameEntity.call(this, {
		flags:{
			'path' : [],
			'noclip' : false,
			'gravity':true,
			'friction':true,
			//
			'check_dist':30
		}
	});

	this.w = 20;
	this.h = 40;
	this.color = [70,65,60];
	//
	this.party_members = [];
	this.grapple = new Grapple(this);
	//
	this.attribs = {
		"health" : 20,
		"speed" : 2.5
	};
	//
	ambience.newLight({agent:this,d:1.25});
};
Player.prototype = Object.create(GameEntity.prototype);
// -=- Player Functions -=- //
Player.prototype.update = function () {
	this.grapple.update();
	//
	var mx = 0;
	var my = 0;
	if (keyIsDown(87)) {//w
		my -= 1;
	}
	if (keyIsDown(83)){//s
		my += 1;
	}
	if (keyIsDown(65)){//a
		mx -= 1;
	}
	if (keyIsDown(68)){//d
		mx += 1;
	}
	// this.move(mx, my);
	if (mx!==0 || my!==0){
		if (!this.collide(this.get_move(mx,my))) {
			// this.unmove();
			this.move(mx,my);
		}
	}
	this.flags.check = false;
	this.flags.checking = null;
	var check_distSq = pow(this.flags.check_dist, 2);
	var active = entities.getActive();
	var ent;
	for(var i=active.length-1;i>=0;i--){
		ent = active[i];
		if(ent!=this&&ent.check&&p5.Vector.sub(ent.pos,this.pos).magSq()<=check_distSq){
			if(!this.flags.check){
				this.flags.check = true;
				this.flags.checking = ent;
			}else if(this.flags.checking != ent){
				var old_dist = p5.Vector.sub(this.flags.checking.pos,this.pos).magSq();
				var cur_dist = p5.Vector.sub(ent.pos,this.pos).magSq();
				if(cur_dist < old_dist) this.flags.checking = ent;
			}
		}
	}
};
Player.prototype.draw = function () {
	push();
	colorMode(HSB, 360, 100, 100);
	fill(this.color[0],this.color[1],this.color[2]);
	rect(this.pos.x-this.w/2, this.pos.y-this.h-this.pos.z, this.w, this.h);
	colorMode(RGB, 255);
	pop();
	if(this.flags.check){
		fill(225);
		ellipse(this.pos.x-this.w/2, this.pos.y-this.h-this.pos.z, this.w, this.w*0.8);
	}
	this.grapple.draw();
};
Player.prototype.keyPressed = function (data) {
	if(data.type=='Mouse'){
		if(this.flags['check']){
			this.flags['checking'].check();
		}else {
			this.grapple.grapple(data.pos);
		}
	}
	if(data.type=='MouseWheel'){
		this.grapple.retract(data.delta);
	}
};
Player.prototype.check = function () {

};
Player.prototype.collide = function (vec) {
	return false;
};
Player.prototype.get_move = function (x, y, spd) {
	spd = spd || this.attribs['speed'] + (this.flags['spd_buf'] || 0);
	return createVector(x*spd, y*spd);
};
Player.prototype.move = function (x, y, spd) {
	var vec = this.get_move(x,y,spd);
	this.pos.add(vec);
	// this.x += vec.x;
	// this.y += vec.y;
	// var maxPath = 10;
	// this.path.push([x, y, spd]);
	// if (this.path.length>maxPath) {
	// 	this.path = this.path.slice(1);
	// }
};

// -=-=- Grapple -=-=- //
//
var Grapple = function (parent) {
	this.parent = parent;
	this.pos=createVector();
	this.vec=createVector();
	this.FSM=new SimpleFSM(this);
	this.camera_id = camera.addFocus(this,0.8,true);
	//
	this.is_out = false;
	this.state=false;
	//
	this.maxLen = 300;
	this.minLen = 50;
	this.curLen=0;
	this.tension=0;
	//
	this.flags = {
		'gravity':true,
		'friction':true,
		'cooldown':0
	};
};
Grapple.prototype.update = function(){
	if(!this.is_out)return;
	if(this.flags.cooldown>0)this.flags.cooldown--;
	this.FSM.Execute();
};
Grapple.prototype.draw = function(){
	if(!this.is_out)return;
	fill(200);
	push();
	strokeWeight(1.5);
	line(this.pos.x,this.pos.y-this.pos.z,this.parent.pos.x,this.parent.pos.y-this.parent.pos.z-10);
	pop();
	ellipse(this.pos.x,this.pos.y-this.pos.z,5,5);
};
Grapple.prototype.grapple = function(vec){
	var start;
	if(this.is_out){
		start = this.pos.copy();
	}else{
		this.is_out = true;
		camera.activeFocus(this.camera_id);
		start = this.parent.pos.copy();
		this.pos = start.copy();
		this.tension = 0;
	}
	vec.add(camera.x-width/2,camera.y-height/2);
	this.vec = p5.Vector.sub(vec,start);
	this.vec.setMag(10);
	this.vec.z = 3+(this.pos.z*-0.3);
	this.FSM.setState('throw');
};
Grapple.prototype.retract = function(dlt){
	if (this.is_out) {
		if (dlt >= 200 && this.flags.cooldown<=0) {
			if (!this.state) {
				this.FSM.setState('retract');
			}//else {
		// 		var e = this.target_obj;
		// 		if(e.flags.throwable !== true) {
		// 			this.state_functions.pull(this);
		// 		}else {
		// 			this.state_functions.throw_obj(this,e);
		// 		}
		// 	}
		// }else if(dlt > 0 && this.cooldown<=0 && this.state){
		// 	if(!this.target_obj.flags.throwable)this.tension += delta*0.2;
		// 	if(this.tension >= this.maxLen-50)this.state_functions.retract(this);
		}
	}
};
//
Grapple.prototype._states = {
	init:'rest',
	rest:{
		Execute:function(){
			var distVec = p5.Vector.sub(this.agent.pos,this.agent.parent.pos);
			this.agent.curLen = distVec.mag();
			if(this.agent.curLen>=this.agent.maxLen-this.agent.tension){
				distVec.limit(this.agent.maxLen-this.agent.tension);
				this.agent.pos = p5.Vector.add(this.agent.parent.pos, distVec);
			}
		}
	},
	throw:{
		Enter:function(args){
			this.agent.state = false;
			this.agent.target_obj = null;
			this.agent.flags.cooldown = 3;
			this.agent.pos.z = 10;
		},
		Execute:function(){
			this.agent.pos.add(this.agent.vec);
			GameMath.gravity(this.agent);
			var distVec = p5.Vector.sub(this.agent.pos,this.agent.parent.pos);
			this.agent.curLen = distVec.mag();
			if(this.agent.curLen>=this.agent.maxLen-this.agent.tension){
				distVec.limit(this.agent.maxLen-this.agent.tension);
				this.agent.pos = p5.Vector.add(this.agent.parent.pos, distVec);
				//
				var d = this.agent.vec.copy();
				var n = p5.Vector.sub(this.agent.parent.pos, this.agent.pos);
				n.normalize();
				if(d.dot(n)<0){
					// r = d + -2(d.n)n //vector reflection
					this.agent.vec = p5.Vector.add(d, n.mult(-2*p5.Vector.dot(d, n)));
					this.agent.vec.mult(0.5);
				}
			}
			if(this.agent.vec.magSq()>0&&this.agent.vec.magSq()<0.1){
				this.agent.vec = createVector();
				this.FSM.setState('rest');
				return;
			}
			var ents = entities.getActive();
			var i;
			var e;
			var distSq;
			for(i = ents.length-1;i>=0;i--){
				e = ents[i];
				if(e.grapple && p5.Vector.sub(e.pos,this.agent.pos).magSq() <= pow(10+(e.w||10), 2)){
					data = {};
					e.grapple(data)
				}
			}
			if(this.agent.state)this.setState('lock');
		}
	},
	retract:{
		Enter:function(){
			this.agent.vec.z = 4;
		},
		Execute:function(){
			this.agent.pos.add(this.agent.vec);
			var v = p5.Vector.sub(this.agent.parent.pos,this.agent.pos);
			v.z=0;
			if(v.magSq()<50){
				this.agent.is_out = false;
				if(this.agent.camera_id)camera.removeFocus(this.agent.camera_id);
				this.FSM.setState('rest');
			}
			v.limit(15);
			this.agent.vec.x = v.x;
			this.agent.vec.y = v.y;
			GameMath.gravity(this.agent);
		}
	},
	pull:{},
	throw_obj:{},
	lock:{},
	bounce_back:{}
};





var NPC = function (data) {
	GameEntity.call(this, data);
	//
	this.w = 20;
	this.h = 40;
	//
	var h = data.hue || random(360);
	var s = 0;
	var b = 0;
	if (data.gender == 'male') {
		s = random(20, 50);
		b = random(15, 50);
		this.h+=floor(random(4));
	}else if (data.gender == 'female') {
		s = random(20, 50);
		b = random(50, 85);
		this.w-=floor(random(5));
		this.h+=floor(random(3));
	}else if (data.gender == 'boy') {
		s = random(50, 80);
		b = random(15, 50);
		b+=15;
		this.h-=floor(random(5))+5;
	}else if (data.gender == 'girl') {
		s = random(50, 80);
		b = random(50, 85);
		b+=15;
		this.h-=floor(random(5))+5;
	}
	this.color = [floor(h),floor(s),floor(b)];
	//
	this.img_buffer = createGraphics(this.w+4, this.h+4);
	this.buf_offset = createVector(this.w/2+2,this.h+2);
	this.refresh();
	//
	this.txt_ord = 0;
};
NPC.prototype = Object.create(GameEntity.prototype);
// -=- NPC functions -=- //
NPC.prototype.update = function () {
	
};
NPC.prototype.refresh = function () {
	this.img_buffer.clear();
	this.img_buffer.colorMode(HSB, 360, 100, 100);
	this.img_buffer.fill(this.color[0],this.color[1],this.color[2]);
	this.img_buffer.rect(2, 2, this.w, this.h);
	//
};
NPC.prototype.draw = function () {
	this._draw();
	// push();
	// colorMode(HSB, 360, 100, 100);
	// fill(this.color[0],this.color[1],this.color[2]);
	// rect(this.pos.x-this.w/2, this.pos.y-this.h-this.pos.z, this.w, this.h);
	// colorMode(RGB, 255);
	// pop();
};
NPC.prototype.check = function () {
	this._check({strs:this._getText()});
};
NPC.prototype._getText = function () {
	var index = this.txt_ord;
	var ret_text;
	var ret_prop;
	var self = this;
	// if (this.flags.override_text) return [this.flags.override_text];
	try {
		for (var prop in this.entity_data.text) {
			if (prop == 'default' || this.flags.text_state === prop) {
				ret_text = this.entity_data.text[prop][index];
				ret_prop = prop;
			}else if(prop.slice(0,1)=='#' && game.flags[prop.slice(1)] === true) {
				ret_text = this.entity_data.text[prop][index];
				ret_prop = prop;
			}
		}
		if(index >= this.entity_data.text[ret_prop].length) {
			this.txt_ord = 0;
			return this.get_text();
		}
		if(this.flags.repeatln!==true) {
			this.txt_ord++;
			if(index >= this.entity_data.text[ret_prop].length-1)this.txt_ord = 0;
		}
		return ret_text || ['Default text (this should not appear)\nConsult someone...'];
	}catch (err) {
		console.log(err);
		return ['Error text.\nIf this appears then run and scream'];
	}
};


// -=-=-=-=- Ambience -=-=-=- //
//
// Handles lighting, weather, and other ambeince
//
var Ambience = function () {
	this.depth = 2;
	this.thickness = 100;
	this.color = createVector(0,1,10);
	//
	this.lights = [];
	this.activeLights = [];
	this.particles = [];
	//
	this.buffer = createImage(width/4, height/4);
	//
	this._lastDraw = 0;
};

// -=- Functions -=- //
Ambience.prototype.drawLight = function () {
	var pnts = [];
	var ofs = camera.get_transition();
	var depth = this.depth*this.thickness;
	//
	var pnt;
	var distSq;
	var mapCheck;
	for(i=this.activeLights.length-1;i>=0;i--){
		pnt = this.lights[this.activeLights[i]];
		mapCheck = (!pnt.agent||((!pnt.agent.entity_data._map_id)||pnt.agent.entity_data._map_id==terrain.current_map));
		// console.log(mapCheck);
		if(camera.collide(pnt.pos,pnt.r)&&mapCheck){
			pnts.push({
				pos:pnt.pos.copy().add(pnt.ofs),
				col:pnt.col||createVector(0,0,0),
				r:pnt.r,
				d:pnt.d,
				l:pnt.l,
			});
		}
	}
	//
	this._lastDraw = pnts.length;
	//
	var d = pixelDensity();
	var w = this.buffer.width;
	var h = this.buffer.height;
	var r,g,b,a;
	var a2;
	var p;
	var dx, dy;
	var dst;
	var x,y;
	var i,j;
	var idx;
	var li;
	//
	this.buffer.loadPixels();
	for(i=0;i<w;i++){
		for(j=0;j<h;j++){
			idx = 4 * ((d * j) * w * d + (d * i));
			x = (i*4-ofs.x)/ofs.z;
			y = (j*4-ofs.y)/ofs.z;
			r = this.color.x;
			g = this.color.y;
			b = this.color.z;
			a = depth;
			//
			for(li=pnts.length-1;li>=0;li--){
				p = pnts[li];
				dx = x-p.pos.x;
				dy = y-p.pos.y;
				dst = (dx*dx+dy*dy)*0.000025;
				a2 = (depth*dst)/p.r;
				if(a2>depth)a2=depth;
				//
				r += (p.col.x/dst*p.l);
				g += (p.col.y/dst*p.l);
				b += (p.col.z/dst*p.l);
				a -= (depth-a2)*(0.25*p.d);
			}
			//
			if(a<0)a=0;
			if(a>depth)a=depth;
			// idx+[0-3] = color[rgba]
			this.buffer.pixels[idx] = r; //alpha
			this.buffer.pixels[idx+1] = g; //alpha
			this.buffer.pixels[idx+2] = b; //alpha
			this.buffer.pixels[idx+3] = a; //alpha
		}
	}
	this.buffer.updatePixels();
	//
	push();
	//
	image(this.buffer,0,0,width,height);
	pop();
};
Ambience.prototype.update = function () {
	// lights
	for(var i=this.activeLights.length-1;i>=0;i--){
		this.lightUpdate(this.activeLights[i]);
	}
};
//
Ambience.prototype.lightActive = function (id, bool){
	if(bool!==false){//true/null
		if(this.activeLights.indexOf(id)==-1)this.activeLights.push(id);
	}else{
		if(this.activeLights.indexOf(id)!=-1){
			this.activeLights.splice(this.activeLights.indexOf(id),1);
		}
	}
};
Ambience.prototype.lightRemove = function (id) {
	this.lightActive(id, false);
	this.lights[id]=null;
};
Ambience.prototype.lightUpdate = function (id) {
	var l = this.lights[id];
	if(!l)return;
	//
	if(l.agent){
		l.pos = l.agent.pos.copy();
		if(l.agent.lightOffset)l.ofs = l.agent.lightOffset.copy();
	}
	if(l.update)l.update();
};
//
Ambience.prototype.newLight = function (data) {
	//
	var id = this.lights.length;
	data = Object.assign({
		id:id,
		agent:null,
		pos:createVector(),
		ofs:createVector(),
		r:1,
		d:1,
		l:1,
		//
		offset:0.01+random(10000),
		rs:0,
		ds:1,
		ls:0,
		update:function(){
			this.offset += 0.02;
			if(this.rs)this.r = noise(this.offset*this.rs*0.1+134678)+0.5;
			if(this.ds)this.d = noise(this.offset*this.ds*0.1+534838)+0.2;
			if(this.ls)this.l = noise(this.offset*this.ls*0.5+878132);
		}
	},data);
	this.lights[data.id]=data;
	this.lightActive(data.id);
	//
	return data.id;
};
Ambience.prototype.newParticle = function (data) {
	// particle subclass
	var Particle = function(data){
		GameEntity.call(this,data);
		//
		this.id = data.id;
		this.agent = data.agent;
		this.offset = data.offset||createVector();
		this.weight = data.weight;
		//
		this.force = data.force||createVector();
		this.velocity = data.vel||createVector();
		this.vel_scalar = data.vel_scalar||1;
		//
		this.parts = [];
		this.limit = 10;
		//
		this.w = -200; // camera visabilaty
		//
		this.update=function(isVisable){
			if(this.agent)this.pos = this.agent.pos.copy();
			if(!isVisable)return;
			for(var i=this.parts.length-1;i>=0;i--){
				if(!this.parts[i].isDead()){
					this.parts[i].update();
					this.parts[i].force(this.force);
				}else{
					this.parts.splice(i,1);
				}
			}
			if(this.parts.length<this.limit){
				this.parts.push(this._newPart());
			}
			//
		};
		this.draw=function(){
			//
			push();
			var pos = this.pos.copy().add(this.offset);
			fill(200,0,0);
			ellipse(pos.x,pos.y-pos.z,5,5);
			//
			var _sort = function (a,b) {
				return b.pos.y-a.pos.y;
			};
			this.parts = this.parts.sort(_sort);
			noStroke();
			fill(0,200,0);
			for(var i=this.parts.length-1;i>=0;i--){
				this.parts[i].draw();
			}
			pop();
		};
		this.getWeight=function(){
			return this.weight||(this.pos.y+this.offset.y);
		};
		this._newPart=function(){
			return {
				pos:this.pos.copy().add(this.offset),
				vel:this.velocity.copy().add(p5.Vector.random3D().mult(this.vel_scalar)),
				acc:createVector(),
				col:random(10,50),
				//
				life:100.0+random(-50,50),
				rand:random(1000000),
				//
				update:function(){
					this.life-=1.0;
					this.vel.add(this.acc);
					this.pos.add(this.vel);
					this.acc = createVector();
					if(this.pos.z<0){
						this.pos.z=0;
						this.vel.z*=-0.75;
					}
					//
					this.w = 10*(noise(this.life*0.01+this.rand)+0.5);
				},
				draw:function(){
					fill(this.col,this.col,this.col,this.life/100*255);
					ellipse(this.pos.x,this.pos.y-this.pos.z,this.w,this.w);
				},
				//
				force:function(v){
					this.acc.add(v);
				},
				isDead:function(){
					return (this.life<=0);
				}
			};
		};
	};
	Particle.prototype = Object.create(GameEntity.prototype);
	//
	var id = this.particles.length;
	data = Object.assign({
		id:id,
		agent:null,
		pos:createVector(),
		//
		weight:null
	},data);
	//
	this.particles[data.id]=new Particle(data);
	return data.id;
};



// -=-=-=-=- Terrain -=-=-=- //
//
// Handles loading and drawing terrain, 
//     and handles terrain collision.
//
var Terrain = function () {
	//
	this._debug = false;
	this._debug_dat = [];
	//
	this.current_map = null;
	this.url_table = {};
	this.map_data = [];
	this._map_ord = 1;
	//
	this._warp_hystory = [];
};
Terrain.prototype.loadMap = function (url, parent) {
	if(!url)return;
	url = game_url+'/maps/'+url+'.json';
	if(this.url_table[url])return this.url_table[url];
	var self = this;
	var id = this._map_ord++;
	var data = {
		poly:[]
	};
	this.url_table[url] = id;
	loadJSON(url, function(json){
		console.log(id);
		var i;
		// loading submaps
		var _data = [];
		if(parent)_data.push(parent);
		if(json.load){
			for(i = json.load.length-1;i>=0;i--){
				_data.push(terrain.loadMap(json.load[i], id));
			}
		}
		data.load = _data;
		if(parent)data.parent = parent;
		// poly
		var vert = json.map_data.vertex;
		for (i = vert.length-1;i>=0;i--) {
			var poly = vert[i];
			var new_poly = [];
			for(var j = poly.length-1;j>=0;j--){
				var p = poly[j];
				new_poly.push(createVector(p[0],p[1]));
			}
			if(json.map_data.inverted)new_poly.reverse();
			data.poly.push(new_poly);
		}
		json.map_data.vertex = undefined;
		
		//music
		if(json.music){
			data.music = sound.loadSound({track:game_url+json.music});
		}else{
			data.music = null;
		}
		//entities
		data.entities = [];
		for (i = json.npcs.length -1;i>=0;i--) {
			data.entities.push(new NPC(Object.assign(json.npcs[i],{
				_map_id:id,
				_map_data:data
			}))._entity_id);
		}
		for (i = json.entities.length -1;i>=0;i--) {
			var ent = Object.assign(json.entities[i],{
				_map_id:id,
				_map_data:data
			});
			if(Object.keys(window).indexOf(ent.type)!=-1){
				var c = window[ent.type];
				data.entities.push(new c(ent)._entity_id);
			}
		}
		// for(i=0;i<json.events.length;i++){
		// 	console.log(json.events[i]);
		// 	events.push(new GameEvent(json.events[i]));
		// }
		terrain.map_data[id] = Object.assign(json.map_data,data);
		if(!parent)terrain._changeMap(id);
	});
	return id;
};
// -=- Terrain Functions -=- //
Terrain.prototype.refresh = function () {
	//
	if(this._getMap())this._getMap().entities = entities._entities;
	entities.refresh();
};
Terrain.prototype.draw = function () {
	var data = this._getMap(this.current_map);
	if(!data)return;
	if(!(data.is_loading||data.is_error)){
		push();
		if(!data.inverted){
			background(90);
			fill(30);
		}else{
			background(30);
			fill(90);
		}
		//
		for (pi=0;pi<data.poly.length;pi++){
			var p = data.poly[pi];
			beginShape();
			for(i=0; i < p.length; i++){
				vertex(p[i].x,p[i].y);
			}
			endShape(CLOSE);
		}
		pop();
	}
};
Terrain.prototype.draw_debug = function () {

};
Terrain.prototype.toggleDebug = function () {
	this._debug = !this._debug;
};
Terrain.prototype.collide = function (x,y) {
	var r;
	var res;
	// r = [-200,-200,400,400];
	for(i=this.map_data.length-1;i>=0;i--){
		r = this.map_data[i];
		res = collidePointRect(x,y,r[0],r[1],r[2],r[3])||collideRectCircle(r[0],r[1],r[2],r[3], x,y,40);
		if(res)return true;
	}
	return false;
};
Terrain.prototype._getMap = function(id){
	if(typeof id == 'string'){
		return this.map_data[this.url_table[id]];
	}else if(typeof id == 'number'){
		return this.map_data[id];
	}else if(this.current_map){
		return this._getMap(this.current_map);
	}
};
Terrain.prototype._changeMap = function(id){
	var map = this._getMap(id);
	this.current_map = id;
	if(map){
		entities._entities = map.entities;
		entities.refresh();
		//
		sound.setMusic(map.music);
		sound.playMusic();
	}
};
Terrain.prototype.teleport = function(pos,id){
	//hyst
	this._warp_hystory.push([
		player.pos.copy(),
		this.current_map
	]);
	while(this._warp_hystory.length>10){
		this._warp_hystory.splice(0,1);
	}
	//tp
	this._changeMap(id,pos);
	player.pos = pos.copy();
	camera.set_pos(pos);
};



// -=-=- Common Etities -=-=- //
//
// things like rocks, trees, houses, etc
//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-//




// -=-=- Tortch -=-=- //
//
// light on a stick plus smoke and fire particles... fun...
//
//
var Tortch = function(data){
	GameEntity.call(this,data);
	//
	this.light = ambience.newLight({
		agent:this,
		ofs:createVector(0,-20),
		col:data.col||createVector(3,2,0),
		rs:6,
		ds:1,
		ls:6
	});
	//
	this.particle = ambience.newParticle({
		agent:this,
		offset:createVector(0,1,20),
		//
		force:createVector(0,0,0.02),
		velocity:createVector(0,0,1),
		vel_scalar:0.3
	});
	var part_id = ambience.particles[this.particle]._entity_id;
	if(data._map_data){
		data._map_data.entities.push(part_id);
	}else if(data._map_id&&terrain._getMap(data._map_id)){
		terrain._getMap(data._map_id).entities.push(part_id);
	}else if(terrain._getMap()){
		terrain._getMap().entities.push(part_id);
	}
	terrain.refresh();
	//
};
Tortch.prototype = Object.create(GameEntity.prototype);
//
Tortch.prototype.draw = function () {
	push();
	fill(100);
	ellipse(this.pos.x,this.pos.y,10,10);
	pop();
};



// -=-=- Tree -=-=- //
//
// Args:
// ----
// data:
//   x:<int>
//   y:<int>
//   size:<int>
var Tree = function (data){
	data = Object.assign(data,{
		flags:{
			'buffer_debug':false
		}
	});
	GameEntity.call(this, data);
	//
	this.size = data.size||random(1,1.5);
	this.w = (data.w||random(30,50))*this.size;
	this.h = 60*this.size;
	this.sway = random(-15,15);
	//
	this.vertices = [];
	this.points = [];
	this.img_buffer = createGraphics(200*this.size,200*this.size);
	this.buf_offset = createVector(this.img_buffer.width*0.5,this.img_buffer.height*0.8);
	//
	// this.flags.buffer_debug = true;
	//
	if(this.size<1.5)this.check=undefined;
	//
	this.generate();
};
Tree.prototype = Object.create(GameEntity.prototype);
// -=- Functions -=- //
Tree.prototype.update = function () {
	//
};
Tree.prototype.draw = function () {
	this._draw();
};
Tree.prototype.check = function () {
	this._check({
		strs:this.entity_data.strs||['This is a tree....\n\nit is tree... -ing...']
	});
};
Tree.prototype.refresh = function () {
	//
	var ofs = this.buf_offset.copy();
	var i;
	var p;
	var s;
	this.img_buffer.colorMode(HSB, 360, 100, 100);
	this.img_buffer.noStroke();
	for (i = this.points.length - 1; i >= 0; i--) {
		p = this.points[i];
		s = p[2];
		this.img_buffer.fill(p[3],p[4],p[5]);
		this.img_buffer.ellipse(p[0],p[1],s,s);
	}
	this.img_buffer.colorMode(RGB, 255);
	this.img_buffer.fill(10);
	this.img_buffer.stroke(10);
	for(i=this.vertices.length-1;i>=0;i--){
		p = this.vertices[i];
		this.img_buffer.triangle(p[0],p[1],p[2],p[3],p[4],p[5]);
	}
	this.img_buffer.ellipse(ofs.x,ofs.y,10,10);
};
Tree.prototype.generate = function () {
	//
	var ofs = this.buf_offset.copy();
	var p1x = ofs.x - this.w/2;
	var p1y = ofs.y;
	var p2x = ofs.x + this.sway;
	var p2y = ofs.y - this.h;
	var p3x = ofs.x + this.w/2;
	var p3y = ofs.y;
	//
	this.vertices.push([p1x,p1y,p2x,p2y,p3x,p3y]);
	this.vertices.push([p1x,p1y,ofs.x,ofs.y+10,p3x,p3y]);
	//
	var bt1 = random(20,80);
	var bt2 = random(-80,-20);
	this._gen_branch([p1x,p1y,p2x,p2y,p3x,p3y], bt1, this.size*20);
	this._gen_branch([p1x,p1y,p2x,p2y,p3x,p3y], bt2, this.size*20);
	if(abs(bt1-bt2)>120)this._gen_branch([p1x,p1y,p2x,p2y,p3x,p3y],random(-10,10),this.size*15);
	//
	this.refresh();
};
Tree.prototype._gen_branch = function (tri, angle, size) {
	size = size*0.7 || 20;
	var branch_length = 1.7;
	var theta = angle * (Math.PI/180);
	var p1x = -1 * size* branch_length * Math.sin(theta);
	var p1y = size* branch_length * Math.cos(theta);
	var n = random(0.3,0.5);
	var p2x,p2y;
	if (theta*(180/Math.PI)<0) {
		p2x = tri[2] + (tri[4]-tri[2])*n;
		p2y = tri[3] + (tri[5]-tri[3])*n;
	}else {
		p2x = tri[2] + (tri[0]-tri[2])*n;
		p2y = tri[3] + (tri[1]-tri[3])*n;
	}
	var new_tri = [tri[2],tri[3],tri[2]+p1x,tri[3]-p1y,p2x,p2y];
	this.vertices.push(new_tri);
	if (size > 5) {
		this._gen_branch(new_tri, angle+random(20,60), size);
		this._gen_branch(new_tri, angle+-1*random(20,60), size);
	}
	if (size < 15) {
		this.points.push([tri[2]+p1x,tri[3]-p1y,random(5,20),45,random(60,100),random(30,70)]); // x,y,s, h,s,b
	}
};




// -=- Grass -=- //
//
//
var Grass = function (data) {
	GameEntity.call(this,data);
	//
	this.w = random(5,15);
	this.sway = random(-this.w/2,this.w/2);
	this.bushSize = data.size||random(3,15);
	this.draw_data = {
		points:[],
		leaves:[],
		blades:[]
	};
	this.typ = data.typ||random([1,2,3,4]);
	this.generate();
	//
	this.img_buffer = createGraphics(50,70);
	this.buf_offset = createVector(25,65);
	this.refresh();
	// this.flags.buffer_debug = true;

};
Grass.prototype = Object.create(GameEntity.prototype);
//
Grass.prototype.draw = function () {
	this._draw();
};
Grass.prototype.refresh = function () {
	var ofs = this.buf_offset.copy();
	var i;
	var p, l;
	//
	this.img_buffer.clear();
	// draw lines
	for (i = this.draw_data.points.length - 1; i >= 0; i--) {
		p = this.draw_data.points[i];
		this.img_buffer.line(ofs.x, ofs.y, p.x+ofs.x, ofs.y-p.y);
	}
	// draw leaves
	this.img_buffer.fill(143, 143, 86);
	for (i = this.draw_data.leaves.length - 1; i >= 0; i--) {
		l = this.draw_data.leaves[i];
		this.img_buffer.triangle(ofs.x+l[0],ofs.y-l[1],ofs.x+l[2],ofs.y-l[3],ofs.x+l[4],ofs.y-l[5]);
	}
	// draw base
	this.img_buffer.stroke(27, 27, 10);
	this.img_buffer.fill(32, 32, 19);
	this.img_buffer.quad(ofs.x-this.w/2,ofs.y, ofs.x+this.sway,ofs.y-6, ofs.x+this.w/2,ofs.y, ofs.x,ofs.y+3);
};
Grass.prototype._gen_point = function (angle, len){
	var p  = p5.Vector.fromAngle(radians(angle+90));
	p.mult(len);
	return p;
};
Grass.prototype._gen_leaf = function (point, angle){
	var size = random(10,20);
	var v = p5.Vector.fromAngle(radians(angle+90));
	v.mult(size);
	var p;
	if (Math.random()>0.5) {
		p = p5.Vector.fromAngle(radians(angle+90+30));
	}else {
		p = p5.Vector.fromAngle(radians(angle+90-30));
	}
	p.mult(size/2);
	v.add(point.x,point.y);
	p.add(point.x,point.y);
	return [point.x,point.y,v.x,v.y,p.x,p.y];
};
Grass.prototype._gen_blade = function (){
	//
};
Grass.prototype.generate = function () {
	//
	switch(this.typ){
		default:
		case 1:
			for (var i=0;i<=this.bushSize;i++) {
				var a = random(-15,15);
				var l = random(15,40);
				var p = this._gen_point(a,l);
				this.draw_data.points.push(p);
				if(l > 30 && random()<0.5) {
					this.draw_data.leaves.push(this._gen_leaf(p, a));
				}
			}
			if (random()<0.75) {
				var p = createVector(this.sway,10);
				var a = random(-50,50);
				this.draw_data.leaves.push(this._gen_leaf(p, a));
			}
			break;
	}
};



// -=- Rocks -=- //
//
//
var Rock = function (data) {
	GameEntity.call(this,data);
	//
	this.img_buffer = createGraphics(20,12);
	this.buf_offset = createVector(10,8);
	this.refresh();
	//
	// this.flags.buffer_debug = true;
};
Rock.prototype = Object.create(GameEntity.prototype);
//
Rock.prototype.draw = function () {
	this._draw();
};
Rock.prototype.refresh = function () {
	this.img_buffer.clear();
	this.img_buffer.fill(150);
	this.img_buffer.ellipse(10,6,15,10);
};



// -=-=- Door -=-=- //
//
// Note:
// ----
//   Parent to all teleportation entities
//
var Warp = function (data) {
	data = Object.assign(data,{
		//
		_tp_back:data._tp_back||false,
		_tp_loc:entities._buildVector(data._tp_loc)
	});
	GameEntity.call(this,data);
	//
	if(!this.entity_data._tp_loc)this.entity_data._tp_loc = this.pos.copy().mult(2);
	//
};
Warp.prototype = Object.create(GameEntity.prototype);
//
Warp.prototype.check = function () {
	this.go();
};
//
Warp.prototype.go = function () {
	//
	console.log('go function called');
	var map = terrain._getMap();
	var id = map.load[0];
	var loc;
	if(!this.entity_data._tp_back){
		loc = this.entity_data._tp_loc||createVector();
	}else{
		var h = terrain._warp_hystory[terrain._warp_hystory.length-1];
		loc = h[0];
		id = h[1];
	}
	terrain.teleport(loc,id);
};



// -=-=- House -=-=- //
//
var House = function (data) {
	Warp.call(this,data);
	//
	this.w = data.w||200;
	this.h = data.h||60;
	this.sway = random(-30,30);
	this.rsway = random(-30,30);
	this.door_offset = data.door_offset||0;
	//
	// this.flags.buffer_debug = true;
	//
	this.img_buffer = createGraphics(300,150);
	this.buf_offset = createVector(150,130);
	//
	this.refresh();
	ambience.newLight({
		agent:this,
		r:2
	});
};
House.prototype = Object.create(Warp.prototype);
//
House.prototype.draw = function () {
	this._draw();
};
House.prototype.refresh = function () {
	var ofs = this.buf_offset.copy();
	//
	this.img_buffer.fill(10);
	// draw wall
	this.img_buffer.quad(ofs.x-this.w/2,ofs.y,ofs.x-this.w*(0.4)+this.sway,ofs.y-this.h,ofs.x+this.w*(0.4)+this.sway,ofs.y-this.h,ofs.x+this.w/2,ofs.y);
	// draw roof
	this.img_buffer.triangle(ofs.x-this.w/2+this.sway,ofs.y-this.h,ofs.x+this.sway+this.rsway,ofs.y-this.h-40,ofs.x+this.w/2+this.sway,ofs.y-this.h);
	// draw door
	this.img_buffer.fill(143, 143, 36);
	this.img_buffer.quad(ofs.x+this.door_offset-10,ofs.y,ofs.x-this.sway/4+this.door_offset-15,ofs.y-40,ofs.x-this.sway/4+this.door_offset+15,ofs.y-40,ofs.x+this.door_offset+10,ofs.y);
};
House.prototype.generate = function () {
	//
	this.refresh();
};






//