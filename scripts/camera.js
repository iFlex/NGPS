/**
*	NGPS Camera System
*	Author: Milorad Liviu Felix
*	30 May 2014 03:16 GMT
*	
*	Requirements:
*		Must be applied to an existing Container Object
*/

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

Camera.ccancel = function()
{
	for( k in this.cops)
		clearInterval(this.cops);
}

Camera.cstop = function()
{
	this.ccancel();
	this.callow = false;
	delete this.onMoved;
}

Camera.cmove = function(dx,dy)
{
	for( k in this.children )
		this.children[k].move(dx,dy);
}

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

Camera.cfocusOn = function(target)
{
	if(!this.callow)
		return;

	if(this.cops['focusOn'])
		clearInterval(this.cops['focusOn']);

	var camera = this;
	function focusOn()
	{
		
		var targetPos = target.getCenter();
		var camPos    = camera.getCenter();
	
		if( Math.abs( targetPos.x - camPos.x) > 5 || Math.abs( targetPos.y - camPos.y) > 5 || Math.abs(target.angle) > 0 )
		{
			var dx = ( camPos.x - targetPos.x ) / 10;
			var dy = ( camPos.y - targetPos.y ) / 10;
			var da = -target.angle /10;
			//do zoom adaptation as well ( and consider fit screen )
			camera.cmove(dx,dy);
			camera.crotate(da);
		}
		else
		{
			clearInterval(camera.cops['focusOn']);
			delete camera.cops['focusOn'];
		}
	}

	this.cops['focusOn'] = setInterval( focusOn, this.cinterval );
}
