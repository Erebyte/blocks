var game;
var player;
var windows;
var camera;
var npcs = [];
var draw_q = [];

function setup () {
	// body...
	var myCanvas = createCanvas(800, 600);
	myCanvas.parent('game_container');

	game = new Game();
	windows = new Windows();
	player = new Player();
	terrain = new Terrain();
	terrain.loadmap(base_url+'/maps/test.json');
	camera = new Camera();
	// npcs.push(new NPC({x:random(width), y:random(height), gender:'girl'}));
	// npcs.push(new NPC({x:random(width), y:random(height), gender:'boy'}));
	// npcs.push(new NPC({x:random(width), y:random(height), gender:'female'}));
	// npcs.push(new NPC({x:random(width), y:random(height), gender:'male'}));
}

function draw () {
	// body...
	if (game.gamestate == "logo") {

	}else if (game.gamestate == "startmenu") {
		background(50);

		// display text
		push();
		noStroke();
		fill(100);
		textAlign(CENTER);
		textFont("Georgia");
		textSize(40);
		text("Spacebar to play", width/2, height/2);
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
		player.update(npcs);
		windows.update();
		camera.update(player);

		// blit all sprites
		for (var i = npcs.length - 1; i >= 0; i--) {
			var npc = npcs[i];
			blit(npc,npc.y);
		}
		blit(player,player.y);

		// draw
		terrain.draw(camera.x, camera.y);
		push();
		translate(width/2-camera.x, height/2-camera.y);
		draw_blitz();
		// camera.draw();
		pop();
		windows.draw();
		
	}
}

function blit(itm, w) {
	draw_q.push([itm, w]);
}

function draw_blitz () {
	draw_q = draw_q.sort(function(a,b){return a[1]-b[1];});
	for (i = 0; i < draw_q.length; i++) {
		draw_q[i][0].draw();
	}
}

function pushNPC (npc) {
	npcs.push(npc);
}

function keyPressed() {
	if (game.gamestate == "startmenu") {
		if (key == ' ') {
			game.setGamestate("pregame");
			var strs = ["W+S to swap genders\nA+D to change color","Make You...", "Space to continue."];
			var win = windows.newWindow(strs, width/2, height*0.8, width*0.9, height/2*0.60);
			var kp_id = windows.kp.length;
			windows.kp.push(function (key) {
				if (key == 'T') {
					windows.windows[win].next();
				}
			});
			windows.windows[win].unload = function () {
				windows.kp[kp_id] = null;
			};
		}else if (keyCode == LEFT_ARROW) {
			console.log("left");
		}else if (keyCode == RIGHT_ARROW) {
			console.log("right");
		}
	}else if (game.gamestate == 'pregame') {
		if (!windows.open_window) {
			if (key == ' ') {
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
	}
	console.log(keyCode + " : " + key);
}

function mousePressed() {
	player.x = mouseX;
	player.y = mouseY;
}
new p5();
