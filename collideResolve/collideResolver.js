//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
//																	//
//						collideResolver								//
//																	//
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
//
//
// Functions:
//
//   collideDetect (entityList) : 
//     detects all potentially colliding objects and returns
//     collisionData.
//
//   collideResolve (collisionData) : 
//     finds a global resolution state and callsback to each
//     entity.collideCallback(posVec, VelVec)
//
//   collideDebugDraw () :
//     if COLLIDE_DEBUG == true then it will draw collide debug info
//
//   _collideBuildDOM () :
//     builds an HTML toolbox in the game-container so a user can
//     interact with collision system.
//
//   _collideCheck (ent_a, ent_b) : 
//     returns a bool value true if ent_a could collide with ent_b
//     else false.
//
//   _collideGetLines (poly, line, size) : 
//     finds and returns all edges that collide with line with 
//     pointSize = size<arg>
//
//   _collideGetLineIntersection (line_a, line_b) : 
//     finds and returns the intersection of two infinite lines 
//     defined by two points.
//
//   _collideResolveCirclePoly (ent_a, ent_b) :
//     computes a single collision resolution for ent_a and ent_b
//     and sets the appropriate values on said objects.
//
//   _collideResolveCircleCircle (ent_a, ent_b) :
//     computes a single collision resolution for ent_a and ent_b
//     and sets the appropriate values on said objects.
//
//
//
// Classes:
//   CollideEntity () :
//     A base class for collidable entities. To be inherited
//
//
// TODO:
//   - make CollisionEntity.collideClamp a scalar
//   - add CollisionEntity.getCollisionRect()
//   - Clean up
//   -
//
//

// -=-=- Globals and Constants -=-=- //


var DEFAULT_FRAMERATE = 30;
var DEBUG_FRAMERATE = 10;
//
var COLLIDE_DEBUG = true;
var COLLIDE_RESOLUTIONS = 0;
var COLLIDE_DRAW_DATA = [];
var RESOLVE_DATA = null;
var RESOLUTION_CYCLES = 3;
//
//

// -=-=- Functions -=-=- //
//
//

var collideDetect = function (entityData) {
	//
	// To DocString
	//
	var collideData = [];
	var i,j;
	var ent_a, ent_b;
	var collData;
	for(i = entityData.length-1;i >= 0; i--){
		if(entityData[i]){
			collData = [];
			for(j = entityData.length-1;j >= 0; j--){
				if(i!=j && entityData[j]){
					ent_a = entityData[i];
					ent_b = entityData[j];
					if(_collideCheck(ent_a, ent_b)){
						collData.push(ent_b);
					}else{
						var posVec = p5.Vector.add(ent_a.pos, ent_a.vel);
						ent_a.collideCallback(posVec);
						if(COLLIDE_DEBUG)frameRate(DEFAULT_FRAMERATE);
					}
				}
			}
			if(collData.length)collideData.push([ent_a, collData]);
		}
	}
	return collideData;
};


var collideResolve = function (data) {
	console.log('resolving');
	//
	RESOLVE_DATA = data;
	//
	var ent_a;
	var collObjs;
	for(var count=RESOLUTION_CYCLES-1;count>=0;count--){

		for(var i=data.length-1;i>=0;i--){
			ent_a = data[i][0];
			collObjs = data[i][1];
			//
			if(COLLIDE_DEBUG)frameRate(0.0001);
			//
			var ent_b;
			// ent_a.collideClamp = createVector();
			for(var o=collObjs.length-1;o>=0;o--){
				ent_b = collObjs[o];
				if(ent_b.collideType=='circle'){
					_collideResolveCircleCircle(ent_a, ent_b);
				}else if(ent_b.collideType=='poly'){
					_collideResolveCirclePoly(ent_a, ent_b);
				}
			}
			COLLIDE_DRAW_DATA.push({
				type:'line',
				p1:createVector(100,100),
				p2:p5.Vector.add(createVector(100,100),p5.Vector.mult(ent_a.collideClamp,3)),
				stroke:createVector(0,0,255)
			});
			COLLIDE_DRAW_DATA.push({
				type:'circle',
				x:ent_a.pos.x+ent_a.vel.x+ent_a.collideClamp.x,
				y:ent_a.pos.y+ent_a.vel.y+ent_a.collideClamp.y,
				w:ent_a.size,
				fill:createVector(0,255,0),
				stroke:createVector(),
				alpha:15
			});
			
		}
	}
	for(var i=data.length-1;i>=0;i--){
		ent_a = data[i][0];
		//
		var velVec = p5.Vector.add(ent_a.vel, ent_a.collideClamp);
		var posVec = p5.Vector.add(ent_a.pos, velVec);
		ent_a.collideCallback(posVec, createVector());
		ent_a.collideClamp = createVector();
		if(COLLIDE_DEBUG)frameRate(DEBUG_FRAMERATE);
	}




	// console.log(data.length);
	return;
};

var collideDebugDraw = function () {
	//
	// to clean
	// to docstring
	//

	// DOM stuff //
	var collisionsLabel = document.getElementById('game-label-collisions');
	var resolutionsLabel = document.getElementById('game-label-resolutions');
	if(collisionsLabel)collisionsLabel.innerHTML = RESOLVE_DATA.length;
	if(resolutionsLabel){
		var avgres = floor((COLLIDE_RESOLUTIONS/RESOLVE_DATA.length)*10)/10||0;
		var avgcol = floor((avgres/RESOLUTION_CYCLES)*10)/10||0;
		resolutionsLabel.innerHTML = COLLIDE_RESOLUTIONS+"\t("+avgres+" / "+avgcol+')';
	}
	COLLIDE_RESOLUTIONS=0;
	//
	if(!COLLIDE_DEBUG){
		COLLIDE_DRAW_DATA = [];
		return;
	}
	// draw Debug info //
	push();
	var d;
	for(var i=COLLIDE_DRAW_DATA.length-1;i>=0;i--){
		d = COLLIDE_DRAW_DATA[i];
		//
		if(d.fill){fill(d.fill.x,d.fill.y,d.fill.z,d.alpha||255);}
		else{fill(0,0,0,0);}
		if(d.stroke){stroke(d.stroke.x,d.stroke.y,d.stroke.z,d.alpha||255);}
		else{stroke(0,0,255,255);}
		//
		if(d.type == 'circle'){
			ellipse(d.x,d.y,d.w||1,d.w||1);
		}else if(d.type == 'line'){
			line(d.p1.x,d.p1.y,d.p2.x,d.p2.y);
		}
	}
	pop();
	COLLIDE_DRAW_DATA = [];
};

// -=- DOM stuff -=- //
//
var _collideBuildDOM = function () {
	var gameContainer = document.getElementById('game-container');
	var container = gameContainer.querySelector('#game-dom-container');
	//check if DOM container exists else: build it
	if(!container){
		container = document.createElement('div');
		container.id = 'game-dom-container';
		container.innerHTML = ''+
			"Collisions: <label id='game-label-collisions'>0</label><br>"+
			"Resolutions: <label id='game-label-resolutions'>0</label><br>"+
			"Resolution Cycles: <input type='number' id='game-input-rescycles' value=3 min=0 onchange='_collideBuildDOM();'><br>"+
			"Debug FPS: <input type='number' id='game-input-debugFPS' value="+DEBUG_FRAMERATE+" min=0 onchange='_collideBuildDOM();'><br>"+
			"<button onclick='COLLIDE_DEBUG=false;_collideBuildDOM();'>Disable Debug</button>"+
			"<button onclick='COLLIDE_DEBUG=true;_collideBuildDOM();'>Enable Debug</button>";
		gameContainer.appendChild(container);
	}
	// if COLLIDE_DEBUG then read taskbar
	if(COLLIDE_DEBUG){
		//
		RESOLUTION_CYCLES = parseInt(document.getElementById('game-input-rescycles').value);
		//
		DEBUG_FRAMERATE = parseInt(document.getElementById('game-input-debugFPS').value);
		if(DEBUG_FRAMERATE<=0)DEBUG_FRAMERATE=0.000001;
		frameRate(DEBUG_FRAMERATE);
		//
	}else{
		frameRate(DEFAULT_FRAMERATE);
	}
};

// -=- collision backend -=- //
//

var _collideCheck = function (ent_a, ent_b) {
	//
	// To Clean
	//
	var collideLinesFunction = function (line1, line2, s1, s2) {
		s1 = s1 || 0;
		s2 = s2 || s1;
		if(collideCircleCircle(line1[1].x,line1[1].y,s1,line2[1].x,line2[1].y,s2))return true;
		if(collideLineLine(line1[0].x,line1[0].y,line1[1].x,line1[1].y,line2[0].x,line2[0].y,line2[1].x,line2[1].y)) return true;
		if(collideLineCircle(line2[0].x,line2[0].y,line2[1].x,line2[1].y,line1[1].x,line1[1].y,s1))return true;
	};
	//
	var vel_a = ent_a.vel.copy();
	var vel_b = ent_b.vel.copy();
	//
	if(!(ent_a.collideType&&ent_b.collideType))return;
	if(ent_a == ent_b)return;
	if(ent_a.collideType == 'circle'){
		if(ent_b.collideType == 'circle'){
			var line_a = [ent_a.pos.copy(),p5.Vector.add(ent_a.pos,vel_a)];
			var line_b = [ent_b.pos.copy(),p5.Vector.add(ent_b.pos,vel_b)];
			if (collideLinesFunction(line_a, line_b, ent_a.size, ent_b.size)){
				return true;
			}
		}else if(ent_b.collideType == 'poly'){
			var line_a = [ent_a.pos.copy(),p5.Vector.add(ent_a.pos,vel_a)];
			if(collideCirclePoly(line_a[1].x,line_a[1].y,ent_a.size||0,ent_b.poly,true)){
				return true;
			}
		}
	}
	return false;
};

var _collideGetLines = function (poly, line_, size){
	var ret = [];
	for(var i=poly.length-1;i>=0;i--){
		var v1 = poly[i];
		var v2 = poly[i-1]||poly[poly.length-1];
		var dv = p5.Vector.sub(v2,v1);
		var norm = createVector(dv.y,-dv.x);
		norm.setMag(size||0);
		v1n = p5.Vector.add(v1,norm);
		v2n = p5.Vector.add(v2,norm);
		if(collideLineCircle(v1.x,v1.y,v2.x,v2.y,line_[1].x,line_[1].y,size*2)){
			COLLIDE_DRAW_DATA.push({type:'line', p1:v1n, p2:v2n});
			ret.push([v1n,v2n, norm]);
		}else if(collideLineLine(line_[0].x,line_[0].y,line_[1].x,line_[1].y,v1n.x,v1n.y,v2n.x,v2n.y)){
			COLLIDE_DRAW_DATA.push({type:'line', p1:v1n, p2:v2n});
			ret.push([v1n,v2n, norm]);
		}
	}
	return ret;
};

var _collideGetLineIntersection = function (line_a, line_b) {
	// line_a = p -> p+tr
	var p = line_a[0].copy();
	var r = p5.Vector.sub(line_a[1],line_a[0]);
	// line_b = q -> q+us
	var q = line_b[0].copy();
	var s = p5.Vector.sub(line_b[1],line_b[0]);
	//
	// t = (q - p) x s /(r x s)
	var rxs = p5.Vector.cross(r,s).z;
	var qpxs = p5.Vector.cross(p5.Vector.sub(q,p),s).z;
	if(rxs === 0){
		console.log('no intersect');
		return line_a[0];
	}
	var t = qpxs/rxs;
	// console.log('intersect', t);
	// console.log('intersect', t, qpxs, rxs, p, r);
	return p5.Vector.add(p, p5.Vector.mult(r,t));
};

var _collideResolveCirclePoly = function (ent_a, ent_b) {
	//
	//
	var ln = [ent_a.pos.copy(), p5.Vector.add(ent_a.pos,
		p5.Vector.add(ent_a.vel,ent_a.collideClamp))];
	var lines = _collideGetLines(ent_b.poly, ln, ent_a.size*0.5);
	COLLIDE_DRAW_DATA.push({
		type:'line',
		p1:ln[0],
		p2:ln[1]
	});
	//
	var ln2;
	var distSq;
	//
	var theta;
	var retvec = createVector();
	var vecn;
	var vecnx;
	var vecny;
	//
	for(var lni=lines.length-1;lni>=0;lni--){
		ln2 = lines[lni];
		theta = -(ln2[2].heading()+PI*0.5);
		vecn = p5.Vector.add(ent_a.vel,ent_a.collideClamp);
		vecn.rotate(theta);

		var intsct = _collideGetLineIntersection(ln, ln2);
		intsct = p5.Vector.sub(intsct, ent_a.pos);
		intsct.rotate(theta);
		retvec = createVector(vecn.x,intsct.y);
		sval = intsct.y;
		ent_a.collideClamp.rotate(theta);
		// ent_a.collideClamp.x = ent_a.collideClamp.x+retvec.x-vecn.x; //always 0
		// ent_a.collideClamp.y = min(0, ent_a.collideClamp.y+retvec.y-vecn.y);
		ent_a.collideClamp.y = ent_a.collideClamp.y+retvec.y-vecn.y;
		// console.log(ent_a.collideClamp);
		ent_a.collideClamp.rotate(-theta);
		//
		COLLIDE_DRAW_DATA.push({
			type:'line',
			p1:ln2[0],
			p2:p5.Vector.add(ln2[0],ln2[2]),
			stroke:createVector(255,0,0)
		});
		//
		COLLIDE_DRAW_DATA.push({
			type:'line',
			p1:createVector(100,100),
			p2:p5.Vector.add(createVector(100,100),vecn),
			stroke:createVector(255,0,0)
		});
		COLLIDE_DRAW_DATA.push({
			type:'line',
			p1:createVector(100,100),
			p2:p5.Vector.add(createVector(100,100),retvec),
			stroke:createVector(0,255,0)
		});
	}
	COLLIDE_DRAW_DATA.push({
		type:'circle',
		x:100,
		y:100,
		w:5
	});
	//
	COLLIDE_RESOLUTIONS++;
};

var _collideResolveCircleCircle = function (ent_a, ent_b) {
	//
	//
	// frameRate(5);
	// ent_a.collideCallback();
	var coln = p5.Vector.sub(
		p5.Vector.add(ent_b.pos,
			p5.Vector.add(ent_b.vel,ent_b.collideClamp)),
		p5.Vector.add(ent_a.pos,
			p5.Vector.add(ent_a.vel,ent_a.collideClamp)));
	var dist = coln.mag();
	coln.normalize();
	var s = 0.5*(dist - ent_a.size*0.5 - ent_b.size*0.5);
	var c = p5.Vector.mult(coln, s);
	ent_a.collideClamp.add(c);
	// ent_b.collideClamp.sub(c);
	//
	COLLIDE_RESOLUTIONS++;
};


// -=-=- Classes -=-=- //
//
//

var CollideEntity = function () {
	this.pos = this.pos || createVector();
	this.vel = this.vel || createVector();
	this.size = this.size || 0;
	this.collideType = this.collideType || null;
	//
	this.collidePos = this.collidePos || createVector();
	this.collideVel = this.collideVec || createVector();
	this.collideClamp = this.collideClamp || createVector(); // make scalar
};
//
CollideEntity.prototype._collideCallback = function (posVec, velVec) {
	if(posVec)this.pos = posVec.copy();
	if(velVec)this.vel = velVec.copy();
};
CollideEntity.prototype.collideCallback = CollideEntity.prototype._collideCallback;
//
CollideEntity.prototype.applyForce = function (f) {
	if(f)this.vel.add(f);
};
CollideEntity.prototype.getCollisionRect = function () {
	// return a rect bounding possable movement collision this frame
};






