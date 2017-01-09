/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Sketch -=-			   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/

// Globals and Constants //
var VERSION = 'pra-alpha: v0.5.6'; // version.release.patch
var amouseX;
var amouseY;
var hmouseCanvas;
var mouseLastClicked;
var doublePressedSpeed = 30;
var params;
var camera;
var terrain;
var debug_htm;
var info_htm;
var map_input;
var editor_nav= [];
var draw_q = [];
var entities = [];
var base_url = base_url || '.';


// -=-=- Setup Function -=-=- //
// 
// called once after loaded
//
function setup () {
	// Create Canvas //
	var myCanvas = createCanvas(800, 600);
	myCanvas.parent('game-container');
	// Init //
	params = getURLParams();
	camera = new Camera();
	terrain = new Terrain();

	var map = params.m || 'test';
	terrain.loadmap('../maps/'+map+'.json');
	info_htm = createP();
	info_htm.parent('#game-nav');
	debug_htm = createP();
	debug_htm.parent('#game-debug');
	var make_button = function (t,p,f){
		var b = createButton(t);
		if(p)b.parent(p);
		if(f)b.mousePressed(f);
		return b;
	};
	editor_nav.push(make_button('Save Map','#game-nav',terrain.savemap));
	map_input = createInput(map);
	map_input.parent('#game-nav');
	editor_nav.push(make_button('Load Map','#game-nav',function(){
		var base = getURL().split('?')[0];
		location.href = base+'?m='+map_input.value();
		// console.log(map_input.value());
	}));
	editor_nav.push(make_button('New Poly','#game-nav',terrain.new_poly));
	editor_nav.push(make_button('New Object','#game-nav',terrain.new_obj));
	editor_nav.push(make_button('Edit Object','#game-nav',terrain.edit_obj));
	// Test //
}

// -=-=- Draw -=- Main Game Loop -=-=- //
//
// doc string thing
//
function draw () {
	debug_htm.html('');
	info_htm.html('');
	background(255);
	//update
	amouseX = floor(mouseX/camera.zoom) + camera.x - (width/2)/camera.zoom;
	amouseY = floor(mouseY/camera.zoom) + camera.y - (height/2)/camera.zoom;
	hmouseCanvas = 0<=mouseX && mouseX<=width && 0<=mouseY && mouseY<=height;

	terrain.update();

	info_htm.html('Camera:('+floor(camera.x)+','+floor(camera.y)+','+camera.zoom+') ',true);
	info_htm.html('Mouse:('+mouseX+','+mouseY+';'+floor(amouseX)+','+floor(amouseY)+';'+hmouseCanvas+') ',true);
	info_htm.html('Mode: '+terrain.clickMode+' ',true);
	//draw
	push();
	camera.apply_transition();
	terrain.draw();
	pop();
}


// -=-=- Functions -=-=- //
function keyPressed() {
	terrain.keyPressed();
	// if(key == '1') game.toggleDebug();
	// if(key == '2') terrain.toggleDebug();
	// if(key == '3') player.toggleDebug();
	// if(key == 'E' && !windows.open_window) windows.menu.open();
}
function mouseDoublePressed() {
	terrain.mouseDoublePressed();
}
function mousePressed() { // For debug use !?!?! //
	// console.log(amouseX,amouseY);
	terrain.mousePressed();
	//doublepressed
	if(mouseDoublePressed&&frameCount-mouseLastClicked<=doublePressedSpeed){
		mouseDoublePressed();
		mouseLastClicked = -Infinity;
		return;
	}
	mouseLastClicked = frameCount;
}
function mouseReleased() {
	if(terrain.target_obj && ['default','delete'].indexOf(terrain.clickMode)!=-1){
		terrain.target_obj.x = round(terrain.target_obj.x);
		terrain.target_obj.y = round(terrain.target_obj.y);
		terrain.target_obj=null;
	}
}
function mouseDragged(){
	var dx = mouseX - pmouseX;
	var dy = mouseY - pmouseY;
	if(!terrain.target_obj){
		camera.move(dx,dy);
	}else if(terrain.clickMode=='default'){
		terrain.target_obj.x += dx/camera.zoom;
		terrain.target_obj.y += dy/camera.zoom;
		if(terrain.target_obj.type=='poly'){
			var obj = terrain.target_obj;
			obj.vertex.x = obj.x;
			obj.vertex.y = obj.y;
		}
	}
}
function mouseWheel(e){
	if(hmouseCanvas){
		camera.zoom += e.delta*(camera.zoom*0.001);
		camera.zoom = constrain(camera.zoom,0.3,10);
	}
}
new p5();
