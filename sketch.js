/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Terrain -=-			   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/

// Globals and Constants //
var VERSION = 'pra-alpha: v0.5.1'; // version.release.patch
var game;
var player;
var windows;
var camera;
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
	game = new Game();
	windows = new Windows();
	player = new Player();
	terrain = new Terrain();
	terrain.loadmap(base_url+'/maps/test.json');
	camera = new Camera();
	// Test //

	entities.push(new Post(createVector(200,400)));
	// entities.push(new Rat(createVector(200,500)));
	// entities.push(new Rat(createVector(10,500)));
	// entities.push(new Rat(createVector(20,50)));
	// entities.push(new Rat(createVector(50,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50),2));
	// entities.push(new Rat(createVector(100,50),2));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50)));
	// entities.push(new Rat(createVector(100,50),5));

}

// -=-=- Draw -=- Main Game Loop -=-=- //
//
// doc string thing
//
function draw () {
	// body...
	if (game.gamestate == "logo") {
		background(30);

		game._logos.update();
		game._logos.draw();

	}else if (game.gamestate == "startmenu") {
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
		text('"T" to start', width/2, height/2);
		textSize(12);
		text(VERSION, width*0.9, height*0.95);
		pop();
	}else if (game.gamestate == "pregame"){
		background(30);
		if (player.gender == 'male') {
			player.color_b = 40;
			player.color_s = 60;
		}else {
			player.color_b = 80;
			player.color_s = 70;
		}
		// display text
		push();
		noStroke();
		fill(100);
		textAlign(CENTER);
		textFont("Georgia");
		textSize(40);
		text("Create you!", width/2, height*0.2);
		textSize(25);
		fill(200);
		text(player.gender, width*0.75, height*0.35);
		text(player.color_h, width*0.75, height*0.50);
		colorMode(HSB, 360, 100, 100);
		rectMode(CENTER);
		fill(player.color_h, player.color_s, player.color_b);
		rect(width/2, height/2, 100, 200);
		colorMode(RGB, 255);
		pop();

		windows.update();
		windows.draw();

		
	}else if (game.gamestate == "game"){
		background(90);
		draw_q = [];

		// update
		game.update();
		player.update();
		windows.update();
		camera.update(player);

		// blit all entities
		for (var i = entities.length - 1; i >= 0; i--) {
			var e = entities[i];
			if(collideRectCircle(camera.x-width/2,camera.y-height/2,width,height,e.x,e.y,300)){
				e.update();
				blit(e,e.y);
			}else if (player.party_members.indexOf(e) != -1) e.update();
		}
		blit(player,player.y);

		// draw
		terrain.draw();
		push();
		translate(width/2-camera.x, height/2-camera.y);
		draw_blitz();
		pop();
		terrain.fog.draw(player, camera);
		windows.draw();
		
		if(terrain._debug)terrain.draw_debug();
		if(player._debug)player.draw_debug();
		if(game.debug_mode)game.draw_debug();
	}
}


// -=-=- Functions -=-=- //
function blit(itm, w) {
	// adds an entity to a draw queue with draw weight 'w'
	draw_q.push([itm, w]);
}

function draw_blitz () {
	// draw queue based on weight
	draw_q = draw_q.sort(function(a,b){return a[1]-b[1];});
	for (i = 0; i < draw_q.length; i++) {
		draw_q[i][0].draw();
	}
}

function pushNPC (npc) {
	// push an npc onto the entity list
	entities.push(npc);
}

function keyPressed() {
	if (game.gamestate == "startmenu") {
		if (key == 'T') {
			game.setGamestate("pregame");
			var strs = ["W+S to swap genders\nA+D to change color","Make You..."];
			var win = windows.newSimple(strs);
		}
	}else if (game.gamestate == 'pregame') {
		if (!windows.open_window) {
			if (key == 'T') {
				game.setGamestate("game");
			}else if (key == 'W' || key == 'S') {
				if (player.gender == 'male') {
					player.gender = 'female';
				}else {
					player.gender = 'male';
				}
			}else if (key == 'A') {
				player.color_h -= 5;
				player.color_h += 360;
				player.color_h %= 360;
			}else if (key == 'D') {
				player.color_h += 5;
				player.color_h %= 360;
			}
		}else {
			windows.keyPressed(key);
		}
	}else if (game.gamestate == 'game') {
		if (!windows.open_window) {
			player.keyPressed(key);
		}else {
			windows.keyPressed(key);
		}
		if(key == '1') game.toggleDebug();
		if(key == '2') terrain.toggleDebug();
		if(key == '3') player.toggleDebug();
		if(key == 'E' && !windows.open_window) windows.menu.open();
	}
	if(game.debug_mode)console.log(keyCode + " : " + key);
}

function mousePressed() { // For debug use !?!?! //
	if(game.gamestate == 'game') {
		player.mousePressed(mouseX + camera.x - width/2, mouseY + camera.y - height/2);
	}

	// console.log('mouse:', mouseX, mouseY);
	// console.log('abs:',mouseX + camera.x - width/2, mouseY + camera.y - height/2);
}
function mouseWheel(e){
	if(game.gamestate == 'game') {
		player.mouseWheel(e.delta);
	}
}


/*
// Loaded check
var load_count = 100;
while (true) {
	// Checks if an obj from each src is defined
	var loaded = true;
	var checks = [
		typeof Game,
		typeof Terrain,
		typeof Windows,
		typeof Camera,
		typeof EntitiesLoaded,
		typeof BuildingEntity,
		typeof Player
	];
	for (var i = checks.length - 1; i >= 0; i--) {
		if (checks[i] == 'undefined') loaded = false;
	}
	if(loaded || load_count <= 0)break;
	load_count--;
}
*/

new p5();
