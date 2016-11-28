function Game() {
	this.gamestate = 'startmenu';
	this.flags = {
		"flag" : true
	};

	this.setGamestate = function (state) {
		//animation
		this.gamestate = state;
	};
}