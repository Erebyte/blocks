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
var params;
var camera;
var terrain;
var debug_htm;
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
	myCanvas.parent('game_container');
	// Init //
	params = getURLParams();
	camera = new Camera();
	terrain = new Terrain();

	var map = params.m || 'test';
	terrain.loadmap('../maps/'+map+'.json');
	debug_htm = createP();
	map_input = createInput(map);
	map_input.parent('#game-nav');
	var make_button = function (t,p,f){
		var b = createButton(t);
		if(p)b.parent(p);
		if(f)b.mousePressed(f);
		return b;
	};
	editor_nav.push(make_button('Load Map','#game-nav',function(){
		var base = getURL().split('?')[0];
		location.href = base+'?m='+map_input.value();
		// console.log(map_input.value());
	}));
	editor_nav.push(make_button('Edit Object','#game-nav'));
	editor_nav.push(make_button('New Object','#game-nav'));
	// Test //
}

// -=-=- Draw -=- Main Game Loop -=-=- //
//
// doc string thing
//
function draw () {
	debug_htm.html('');
	background(255);
	//update
	amouseX = mouseX + camera.x - width/2;
	amouseY = mouseY + camera.y - height/2;
	terrain.update();
	debug_htm.html('Camera:('+camera.x+','+camera.y+','+camera.zoom+')<br>',true);
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

function mousePressed() { // For debug use !?!?! //
	// console.log(amouseX,amouseY);
	terrain.mousePressed();
}
function mouseReleased() {
	terrain.target_obj=null;
}
function mouseDragged(){
	var dx = mouseX - pmouseX;
	var dy = mouseY - pmouseY;
	if(!terrain.target_obj){
		camera.move(dx,dy);
	}else{
		terrain.target_obj.x += dx;
		terrain.target_obj.y += dy;
	}
}
function mouseWheel(e){
	camera.zoom += e.delta*0.01;
	camera.zoom = constrain(camera.zoom,0.3,10);
}
new p5();
