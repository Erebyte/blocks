// p5 init stuff
/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Sketch -=-			   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/

// Globals and Constants //
var game;
var params;

function setup () {
	// Create Canvas //
	var myCanvas = createCanvas(800, 600);
	myCanvas.parent('game-container');
	// Init //
	params = getURLParams();
	game = new Game(params);
	game.init();
	// Load? //
}
function draw () {
	game.update();
	game.draw();
}

new p5();