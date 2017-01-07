/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Sketch -=-			   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/

// Globals and Constants //
var VERSION = 'pra-alpha: v0.5.6'; // version.release.patch
var params;
var camera;
var terrain;
var debug_htm;
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
	myCanvas.parent('game_container');
	// Init //
	params = getURLParams();
	camera = new Camera();
	terrain = new Terrain();

	var map = params.m || 'test';
	terrain.loadmap('../maps/'+map+'.json');
	debug_htm = createP();
	// Test //
}

// -=-=- Draw -=- Main Game Loop -=-=- //
//
// doc string thing
//
function draw () {
	background(255);
	//update
	// terrain.update();
	debug_htm.html('Camera:('+camera.x+','+camera.y+','+camera.zoom+')');
	//draw
	push();
	camera.apply_transition();
	terrain.draw();
	pop();
}


// -=-=- Functions -=-=- //
function keyPressed() {
	// if(key == '1') game.toggleDebug();
	// if(key == '2') terrain.toggleDebug();
	// if(key == '3') player.toggleDebug();
	// if(key == 'E' && !windows.open_window) windows.menu.open();
}

// function mousePressed() { // For debug use !?!?! //
// 	// console.log('mouse:', mouseX, mouseY);
// 	// if(game.debug_mode)console.log('abs:',mouseX + camera.x - width/2, mouseY + camera.y - height/2);
// }
function mouseDragged(){
	var dx = mouseX - pmouseX;
	var dy = mouseY - pmouseY;
	camera.move(dx,dy);
}
function mouseWheel(e){
	camera.zoom += e.delta*0.01;
	camera.zoom = constrain(camera.zoom,0.3,10);
	// if(game.gamestate == 'game') {
	// 	player.mouseWheel(e.delta);
	// }
}
new p5();
