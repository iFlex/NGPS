/**
*	NGPS Camera System
*	Author: Milorad Liviu Felix
*	30 May 2014 03:16 GMT
*	
*	Requirements:
*		Must be applied to an existing Container Object
*/

//TODO: if container is leaf: bind it's properties to it's child's properties: so that when you change the container size the content size changes
this.Camera = {};
//now adding camera specific functions
//camera focus
Camera.conTick = 0;
Camera.cfocusTarget = 0;
//camera content properties
Camera.czoomLevel = 1;
Camera.cangle = 0;
Camera.cx = 0;
Camera.cy = 0;
Camera.cwidth = 0;
Camera.cheight = 0;
//operations flags
Camera.callow = true;
Camera.cops = {};

Camera.cstart = function(interval)
{
	if(!this.cinterval)
	{
		//used for time based animations and corrections
		if(!interval || interval < 0 )
			interval = 32;

		this.cinterval = interval;
	}
	
	this.onMoved = this.cmove;
	this.callow = true;
}
//TODO: TEST
Camera.ccancel = function(what)
{
	if(!what)
	{
		for( k in this.cops )
			clearInterval( this.cops );
	}
	else if( this.cops[what] )
		clearInterval(this.cops[what]);
}
//TODO: TEST
Camera.cstop = function()
{
	this.ccancel();
	this.callow = false;
	delete this.onMoved;
}
//TODO: calculate boundaries and add boundary limit enforcing
Camera.cmove = function(dx,dy)
{
	for( k in this.children )
		this.children[k].move(dx,dy);
}

//TODO  investigate positioning imperfections
//		Calculate boundaries and enforce zoom limits
//		exclude objects that have been zoomed out to far in order not to loose accurate positioning
Camera.czoom = function(amount,cx,cy)
{
	this.czoomLevel *= amount;
	console.log("Camera Zoom Level:"+this.czoomLevel);

	if(!cx && !cy)
	{
		var pos = this.getCenter();
		cx = pos.x;
		cy = pos.y;
	}

	for( k in this.children )
	{
		var center = this.children[k].getCenter();
		
		var dx = center.x - cx; 
		var dy = center.y - cy;
		
		var angle = Math.atan2(dy,dx);
		var radius = Math.sqrt( dx*dx + dy*dy ) * amount;
		
		dx = cx + radius * Math.cos( angle );
		dy = cy + radius * Math.sin( angle );
		
		this.children[k].putAt( dx, dy, 0.5, 0.5);
		this.children[k].scale( amount );	
	}
}
//TODO investigate aligning imperfections
Camera.crotate = function(amount,cx,cy)
{
	this.cangle += amount;
	console.log("Camera Angle:"+this.cangle);

	//JS precision issues
	if(!cx && !cy)
	{
		var pos = this.getCenter();
		cx = pos.x;
		cy = pos.y;
	}
	for( k in this.children )
	{
		var center = this.children[k].getCenter();
		
		var dx = center.x - cx; 
		var dy = center.y - cy;
		
		var angle = Math.atan2(dy,dx);
		var radius = Math.sqrt( dx*dx + dy*dy );
		
		//rotate container
		//this.children[k].rotate((180.0*amount)/Math.PI);
		//relocate container
		angle += amount;
		dx = cx + radius * Math.cos( angle );
		dy = cy + radius * Math.sin( angle );
		
		this.children[k].putAt( dx, dy, 0.5, 0.5);
	}
}

//TODO 3D like camera pan
Camera.cpan = function(panx,pany)
{

}

//TODO perfect focus exit conditin and add parameters for selective exclusion of tweening
// eg. don't zoom to level, don't turn to level, don't pan camera 
//TODO focus on correct parent object when focusing on nested object
Camera.cfocusOn = function(target,options)
{
	if(!this.callow)
		return;

	if(this.cops['focusOn'])
		clearInterval(this.cops['focusOn']);
	
	var camera = this;
	var realTarget = null;
	var globalPos = {x:0,y:0};
	var beginning = true;
	var realTarget = target;
	//find correct parent to focus on ( in case target is nested )
	function getCorrectFocusTarget(t){
		if( t.parent && t.parent == camera )
		{	
			realTarget = t;
			return false;
		}
		else
		{
			if(beginning)
				globalPos = t.getPos();
			else
			{
				var lepos = t.getPos();
				globalPos.x += lepos.x;
				globalPos.y += lepos.y;
				console.log("found Pos:"+globalPos.x+" "+globalPos.y);
			}
			beginning = false;
		}
		return getCorrectFocusTarget(t.parent);
	}
	var fail = getCorrectFocusTarget(target);
	if(fail)
		return;

	function focusOn()
	{
		
		var targetPos = realTarget.getPos();
		targetPos.x += globalPos.x + target.getWidth()/2;
		targetPos.y += globalPos.y + target.getHeight()/2;

		var camPos    = camera.getCenter();
	
		if( Math.abs( targetPos.x - camPos.x) > 5 || Math.abs( targetPos.y - camPos.y) > 5) //|| Math.abs(target.angle) > 0 )
		{
			var dx = ( camPos.x - targetPos.x ) / 10;
			var dy = ( camPos.y - targetPos.y ) / 10;
			var da = -target.angle /10;
			//do zoom adaptation as well ( and consider fit screen )
			camera.cmove(dx,dy);
			//camera.crotate(da);
		}
		else
		{
			clearInterval(camera.cops['focusOn']);
			delete camera.cops['focusOn'];
		}
	}

	this.cops['focusOn'] = setInterval( focusOn, this.cinterval );
}
//TODO: Camera relationships
//TODO: add tween function for camera properties ( pos, zoom, rot, pan )
//TODO: Camera Scripts

