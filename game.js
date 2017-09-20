// all game specific engine things

Game.prototype._states = {
	init:'logo',
	logo:{
		logos:['erebyte','title'],
		current:0,
		frame:0,
		FSM:new SimpleFSM({_states:{
			init:'erebyte',
			erebyte:{Execute:function(){}},
			title:{Execute:function(){}}
		}}),
		Execute:function(){
			// this.data.FSM.Execute();
			push();
			background(30);
			noStroke();
			fill(100);
			textFont("Georgia");
			textSize(20);
			var title = this.data.logos[this.data.current];
			text(title+"_frame_"+this.data.frame, 20, 20);
			pop();
			//
			if(this.data.frame==50){
				if(this.data.logos[this.data.current+1]){
					this.data.FSM.setState(this.data.logos[++this.data.current]);
					this.data.frame = 0;
				}else{
					this.FSM.setState('menu');
				}
			}
			this.data.frame++;
		}
	},
	menu:{
		// Enter:function(){},
		Execute:function(){
			background(50);
			// display text
			push();
			noStroke();
			fill(100);
			textAlign(CENTER);
			textFont("Georgia");
			textSize(80);
			text("Blocks!", width/2, height/4);
			textSize(40);
			text('Click to start', width/2, height/2);
			textSize(12);
			text(VERSION, width*0.9, height*0.95);
			pop();
			// console.log('menu');
			// this.FSM.setState('game');
		},
		KeyPressed:function(state, data){
			if(data.type=='Mouse')state.FSM.setState('pregame');
		}
	},
	pregame:{
		Enter:function(){
			this.data.color = [70,80,70]; //hsb
			this.data.gender = 0.5;
			//
			windows.newWindow({strs:["W+S to swap genders\nA+D to change color","Make You..."],textitrdef:-1});
		},
		Execute:function(){
			// -=- Draw -=- //
			background(30);
			//
			push();
			noStroke();
			fill(100);
			textAlign(CENTER);
			textFont("Georgia");
			textSize(40);
			text("Create you!", width/2, height*0.2);
			textSize(25);
			fill(200);
			text(floor(this.data.gender*100), width*0.75, height*0.35);
			text(this.data.color[0], width*0.75, height*0.50);
			colorMode(HSB, 360, 100, 100);
			rectMode(CENTER);
			var col = this.data.color;
			fill(col[0],col[1],col[2]);
			rect(width/2, height/2, 100, 200);
			colorMode(RGB, 255);
			pop();
			//
			windows.update();
			windows.draw();
		},
		KeyPressed:function(state,data){
			if(data.type=='Key'){
				if (data.key == 'W' ) {
					state.data.gender += 0.05;
					if(state.data.gender>1)state.data.gender=1;
					state.data.color[1]=map(state.data.gender,0,1,60,70);
					state.data.color[2]=map(state.data.gender,0,1,40,80);
				}else if( data.key == 'S') {
					state.data.gender -= 0.05;
					if(state.data.gender<0)state.data.gender=0;
					state.data.color[1]=map(state.data.gender,0,1,60,70);
					state.data.color[2]=map(state.data.gender,0,1,40,80);
				}else if (data.key == 'A') {
					state.data.color[0] -= 5;
					state.data.color[0] += 360;
					state.data.color[0] %= 360;
				}else if (data.key == 'D') {
					state.data.color[0] += 5;
					state.data.color[0] %= 360;
				}else if (data.key == ' ') {
					entities.refresh();
				}
			}else if(data.type=='Mouse'){
				if(windows.open_window){
					windows.keyPressed(data);
				}else{
					state.FSM.setState('game', {
						gender:state.data.gender,
						color:state.data.color
					});
				}
			}
		}
	},
	game:{
		Enter:function(args){
			//
			if(args){
				//set player atribs
				if(args.color)player.color = args.color;
				if(args.gender)player.attribs.gender = args.gender;
			}
			terrain._changeMap(terrain.loadMap('test'));
		},
		Execute:function(){
			// -=- Draw -=- //
			background(100);
			//
			entities.update();
			ambience.update();
			// terrain.update();
			windows.update();
			camera.update();
			//
			push();
			camera.apply_transition();
			terrain.draw();
			entities.draw();
			pop();
			ambience.drawLight();
			windows.draw();
			//
			game.debug();
		},
		KeyPressed:function(state, data){
			if(windows.open_window){
				windows.keyPressed(data);
			}else{
				player.keyPressed(data);
				if(data.type=='Key'){
					console.log(data.key);
					if(data.key=='E') windows.newMenu();
					if(data.key=='1') game.toggleDebug();
					if(data.key=='2') sound.toggleDebug();
					if(data.key==' ') entities.refresh();
				}
			}
		}
	}
};

Game.prototype._quickload = function () {
	this.FSM.setState('game');
};

//
Windows.prototype._soundData = Object.assign({
	//
},Windows.prototype._soundData);
//
Windows.prototype.newMenu = function () {
	if(this.open_menu)return;
	this.open_menu = true;
	var txtWin = windows.newWindow({
		y:height*0.15,
		h:height*0.2,
		strs:['This is the menu,\nit is currently empty.'],
		keyPressed:null
	});

	var sel = windows.newSelector({
		x:width*0.15,
		strs:['Party','Items','Options','Other','Exit'],
		keyPressed:function(data){
			if(data.type == 'Mouse'){
				this.do_selection();
			}
		},
		callback:function(i){
			windows._rmKeyPressed(sel);
			windows.focus(sel, false);
			switch(i){
				case 0: //party
					windows._menu_party(sel);
					break;
				case 1: //items
					windows._menu_items(sel);
					break;
				case 2: //options
					windows.newSelector({
						strs:['Debug','Credits','Audio','Settings','Exit'],
						callback:function(oi){
							if(oi<0)oi=this.strs.length-1;
							switch(oi){
								case 0: //debug
									windows.newWindow({
										x:width*0.6,
										y:height*0.6,
										w:width*0.7,
										h:height*0.6,
										strs:['To toggle debug press:\n  "1" for debugMode\n  "2" for audio\n  "3" for camera\n  "4" for terrain'],
										unload:function(){
											windows._addKeyPressed(sel);
											windows.focus(sel);
										}
									});
									break;
								case 1: //credits
									windows._menu_credits(sel);
									break;
								case 2: // Audio
									windows._menu_audio(sel);
									break;
								case 3: // Settings
									windows._menu_settings(sel);
									break;
								default:
								case 3: //exit
									windows._addKeyPressed(sel);
									windows.focus(sel);
									break;
							}
						}
					});
					break;
				case 3: //other
					windows._addKeyPressed(sel);
					windows.focus(sel);
					break;
				default:
				case 4: //exit
					windows.windows[txtWin].close();
					this.close();
					windows.open_menu = false;
					break;
			}
		}
	});
};




//entities //



// -=- Posts -=- //
//
//
var Post = function (data) {
	GameEntity.call(this,data);
	//
	this.h = random(20,30);
	this.sway = random(-5,5);
	//
	this.img_buffer = createGraphics(30,50);
	this.buf_offset = createVector(15,40);
	this.refresh();
	//
	// this.flags.buffer_debug = true;
};
Post.prototype = Object.create(GameEntity.prototype);
//
Post.prototype.draw = function () {
	this._draw();
};
Post.prototype.refresh = function () {
	//
	var ofs = this.buf_offset.copy();
	var ps = [
		createVector(ofs.x-10,ofs.y+6),
		createVector(ofs.x-10-this.sway/2,ofs.y-6),
		createVector(ofs.x+10-this.sway/2,ofs.y-6),
		createVector(ofs.x+10,ofs.y+6)
	];
	this.img_buffer.fill(120);
	this.img_buffer.quad(ps[0].x,ps[0].y,ps[1].x,ps[1].y,ps[2].x,ps[2].y,ps[3].x,ps[3].y);
	
	ps = [
		createVector(ofs.x-5,ofs.y),
		createVector(ofs.x-5-this.sway,ofs.y-this.h-this.sway),
		createVector(ofs.x+5-this.sway,ofs.y-this.h),
		createVector(ofs.x+5,ofs.y)
	];
	this.img_buffer.fill(86, 63, 41);
	this.img_buffer.quad(ps[0].x,ps[0].y,ps[1].x,ps[1].y,ps[2].x,ps[2].y,ps[3].x,ps[3].y);
};
Post.prototype.grapple = function (data) {
	console.log('hit');
};



// -=- TombStone -=- ///
//
//
var Tombstone = function (data) {
	GameEntity.call(this,data);
	//
	this.col = floor(random(60,120));
	this.w = random(17,22);
	this.h = random(25,30);
	this.sway = random(-this.w/4,this.w/4);
	//
	this.typ = data.typ||random([1,2,3,4]);
	//
	this.img_buffer = createGraphics(60,this.h*2+20);
	this.buf_offset = createVector(30,this.h*2+15);
	this.refresh();
	//
	// this.flags.buffer_debug = true;
};
Tombstone.prototype = Object.create(GameEntity.prototype);
//
Tombstone.prototype.draw = function () {
	this._draw();
};
Tombstone.prototype.refresh = function () {
	var ofs = this.buf_offset.copy();
	var p1 = createVector(ofs.x-this.w/2,ofs.y);
	var p2 = createVector(ofs.x-this.w/2+this.sway-5,ofs.y-this.h-this.sway);
	var p3 = createVector(ofs.x+this.w/2+this.sway+5,ofs.y-this.h+this.sway);
	var p4 = createVector(ofs.x+this.w/2,ofs.y);
	//
	this.img_buffer.fill(this.col);
	switch(this.typ){
		default:
		case 1:
			this.img_buffer.quad(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y,p4.x,p4.y);
			break;
		case 2:
			this.img_buffer.beginShape();
			this.img_buffer.vertex(p1.x,p1.y);
			this.img_buffer.vertex(p2.x,p2.y);
			this.img_buffer.vertex(ofs.x+this.sway*2,ofs.y-this.h-10);
			this.img_buffer.vertex(p3.x,p3.y);
			this.img_buffer.vertex(p4.x,p4.y);
			this.img_buffer.endShape(CLOSE);
			break;
		case 3:
			var v1 = p5.Vector.sub(p2,p1);
			var v2 = p5.Vector.sub(p3,p4);
			v1.mult(0.6);
			v2.mult(0.6);
			var p5_ = p5.Vector.add(p2,v1);
			var p6 = p5.Vector.add(p3,v2);
			this.img_buffer.beginShape();
			this.img_buffer.vertex(p1.x,p1.y);
			this.img_buffer.vertex(p2.x,p2.y);
			this.img_buffer.bezierVertex(p5_.x,p5_.y,p6.x,p6.y,p3.x,p3.y);
			this.img_buffer.vertex(p4.x,p4.y);
			this.img_buffer.endShape(CLOSE);
			break;
		case 4:
			this.img_buffer.beginShape();
			this.img_buffer.vertex(p1.x,p1.y);
			this.img_buffer.vertex(p2.x,p2.y);
			this.img_buffer.vertex(ofs.x+this.sway*2,ofs.y-this.h-20);
			this.img_buffer.vertex(p3.x,p3.y);
			this.img_buffer.vertex(p4.x,p4.y);
			this.img_buffer.endShape(CLOSE);
			this.img_buffer.ellipse(ofs.x+this.sway*2, ofs.y-this.h-20, this.w, this.w);
			break;
	}
};



// -=- Dragging mouse control -=- //
//
// function mouseDragged(){
// 	var dx = mouseX - pmouseX;
// 	var dy = mouseY - pmouseY;
// 	camera.move(dx,dy);
// }
// function mouseWheel(e){
// 	if(hmouseCanvas){
// 		camera.zoom += e.delta*(camera.zoom*0.001);
// 		camera.zoom = constrain(camera.zoom,0.1,10);
// 	}
// }


