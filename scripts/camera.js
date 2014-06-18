/**
*	NGPS Camera System
*	Author: Milorad Liviu Felix
*	30 May 2014 03:16 GMT
*	
*	Requirements:
*		Must be applied to an existing Container Object
*/
// relations are defined in terms of a coefficient applied to the a property
// example: x => 0.5

// boundaries are limits defined for a property which include a High and Low limit
// the limit is a coefficient applied to the corresponding property of the camera

// example: HIx => 0.5
//			LOx => 0.1

//			HIrotate => 25
//			LOrotate => 0   	//allows the camera to rotate between 0 and 25 degrees

//NODE: Camera pos is defined by center x + scrollLeft and center y + scrollTop
//TODO: Add Camera mock objects ( to be able to enforce boundaries and control the scrollable content area )
this.Camera = {};
Camera.cstart = function(interval)
{
	//now adding camera specific functions
	//camera focus
	this.conTick = 0;
	this.cfocusTarget = 0;
	//camera content properties
	this.czoomLevel = 1;
	this.cangle = 0;
	this.cx = 0;
	this.cy = 0;
	this.cwidth = 0;
	this.cheight = 0;
	//inertia
	this.tInertia = 0;
	this.xInertia = 0;
	this.yInertia = 0;
	//operations flags
	this.callow = true;
	this.cops = {};

	if(!this.cinterval)
	{
		//used for time based animations and corrections
		if(!interval || interval < 0 )
			interval = 32;

		this.cinterval = interval;
	}
	
	this.c_allowInertia = true;
	this.allowInertia = true;
	this.callow = true;
	//
	this.crelations = {};
	this.wasCalled = {};
	//
	this.boundaries = {};

	this.onMoved = this.cmove;
	//inertia enabled by default
	this.onMouseDown = this.onMoveStart;
	this.onMouseUp   = this.onMoveEnd;
}
Camera.showAnimations = function(){
	str = "Camera_animations:[";
	for(k in this.cops)
		str += k+";";
	str+="]";
	return str;
}
Camera.ccancel = function(what)
{
	if(!what)
	{
		for( k in this.cops )
			clearInterval( this.cops );
		
		delete this.cops;
		this.cops = {};

		console.log("Camera("+this.UID+"): All animations canceled! "+this.showAnimations());
	}
	else if( this.cops[what] )
	{
		clearInterval(this.cops[what]);
		delete this.cops[what];
		console.log("Camera("+this.UID+"):"+what+" animation canceled!"+this.showAnimations());
	}
}
//TODO: TEST
Camera.cstop = function()
{
	this.ccancel();
	this.callow = false;
	delete this.onMoved;
}
//Anti cross referencing
Camera.antiCrossReff = function(funcName,action)
{
	if(this.wasCalled[funcName])
	{
		if( action == 1 )
			return true;
		else
			delete this.wasCalled[funcName];
	}
	else
	{
		if( action == 1 )
			this.wasCalled[funcName] = true;
	}
	return false;;
}
//TODO: calculate boundaries and add boundary limit enforcing
Camera.cmove = function(dx,dy)
{
/* No need for manual boundaries when using native div scroll	
	//check boundaries
	//check x axis
	var w = this.getWidth();
	var nextX = this.cx + dx;
	if( this.boundaries['LOx'] && nextX < this.boundaries['LOx']*w)
		return;
	if( this.boundaries['HIx'] && nextX > this.boundaries['HIx']*w)
		return;

	//check y axis
	var h = this.getHeight();
	var nextY = this.cy + dy;
	if( this.boundaries['LOy'] && nextY < this.boundaries['LOy']*h)
		return;
	if(	this.boundaries['HIy'] && netxY > this.boundaries['HIy']*h)
		return;
*/
	//check cross refference 
	if(this.antiCrossReff("cmove",1))
		return;

//	this.cx = nextX;
//	this.cy = nextY;
	//inertia buildup
	if(this.c_allowInertia && this.allowInertia)
	{
		this.xInertia += dx;
		this.yInertia += dy;
	}
	//move children
	//FPS.tickStart();
	/*for( k in this.children )
	{
		//if(this.children[k]);
		var c = this.children[k];
		var pos = c.getPos();
		TweenLite.to(c.DOMreference, 0, {css:{x:pos.x+dx,y:pos.y+dy},
										ease:Cubic.easeIn,
										overwrite:"none"});
	}
		//this.children[k].move(dx,dy,true);
	*/
	this.DOMreference.scrollTop -= dy;
	this.DOMreference.scrollLeft-= dx;	
	//FPS.tick();

	//relations support
	for( k in this.crelations )
		this.crelations[k]['root'].cmove(dx*this.crelations[k]['x'],dy*this.crelations[k]['y'])

	this.antiCrossReff("cmove",0);
}

Camera.onMoveStart = function(ctx,e)
{
	if(this.allowInertia)
	{
		var root = this;
		this.ccancel("inertia");

		this.xInertia = 0;
		this.yInertia = 0;
		this.tInertia = 0;
		this.c_allowInertia = true;

		function measureInertia()
		{	
			root.tInertia++;
		}
		this.cops['measureInertia'] = setInterval(measureInertia,this.cInterval);
	}
}
Camera.onMoveEnd = function(ctx,e)
{
	var ok = false;
	if(this.cops['measureInertia'])
	{
		this.ccancel('measureInertia');
		ok = true;
	}
	if(this.allowInertia && ok)
	{
		var root = this;
		
		var decay = 0.99;
		var doubleDecay = 0.999;
		var decayLim = 0.5;

		this.c_allowInertia = false;
					
		if(	this.tInertia > 1 )
		{
			this.xInertia /= this.tInertia;
			this.yInertia /= this.tInertia;
			this.cops['inertia'] = setInterval(inertia,this.cInterval);

			function inertia()
			{
				if(Math.abs(root.xInertia) > 1 || Math.abs(root.yInertia)>1)
				{
					root.cmove(root.xInertia,root.yInertia);
					root.xInertia *= decay;
					root.yInertia *= decay;

					if(decay > decayLim)
						decay *= doubleDecay;
				}
				else
				{
					root.ccancel('inertia');
					this.tInertia = 0;
					this.xInertia = 0;
					this.yInertia = 0;
				}
			}
		}
	}
}
//TODO  add camera mock containers to manipulate scroll area
//		Calculate boundaries and enforce zoom limits
Camera.czoom = function(amount,cx,cy)
{
	next = this.czoomLevel * amount
	//check boundaries
	if( this.boundaries["HIzoom"] && next > this.boundaries['HIzoom'])
		return;
	if( this.boundaries["LOzoom"] && next < this.boundaries['LOzoom'])
		return;
	//check cross referencing
	if(this.antiCrossReff("czoom",1))
		return;
	
	this.czoomLevel = next;
	this.DOMreference.style.zoom = this.czoomLevel;
	this.setWidth(this.properties['width']*(1/this.czoomLevel));
	this.setHeight(this.properties['height']*(1/this.czoomLevel));

	if(!cx && !cy)
	{
		var pos = this.getCenter();
		cx = pos.x;
		cy = pos.y;
	}
	else
	{
		var pos = this.getPos(cx,cy);
		cx = pos.x;
		cy = pos.y;
	}

	//this.cmove( -cx * (1/amount), -cy * (1/amount) );
	this.antiCrossReff("czoom",0)
}
//TODO investigate aligning imperfections
Camera.crotate = function(amount,cx,cy) //SLOW & POSITIONING IMPERFECTIONS
{
	//check boundaries
	var next = this.cangle+amount;
	if( this.boundaries['HIrotate'] && next > this.boundaries['HIrotate'] )
		return;
	if( this.boundaries['LOrotate'] && next < this.boundaries['LOrotate'] )
		return;	 
	//check cross referencing
	if(this.antiCrossReff("crotate",1))
		return;

	this.cangle = next;
	console.log("Camera Angle:"+this.cangle);

	//JS precision issues
	if(!cx && !cy)
	{
		var pos = this.getCenter();
		cx = pos.x;
		cy = pos.y;
		console.log("Camera center:"+cx+" "+cy);
	}
	//FPS.tickStart()
	for( k in this.children )
	{
		var object = this.children[k].getCenter();
		
		var dx = object.x - cx; 
		var dy = object.y - cy;
		
		var angle = Math.atan2(dy,dx);
		var radius = Math.sqrt( dx*dx + dy*dy );
		
		//relocate container
		angle += amount;
		dx = cx + radius * Math.cos( angle );
		dy = cy + radius * Math.sin( angle );
		
		this.children[k].putAt( dx, dy, 0.5, 0.5);
		//rotate container
		this.children[k].rotate((180.0*amount)/Math.PI);
	}
	//FPS.tick();
	//relations support
	for( k in this.crelations )
		this.crelations[k]['root'].crotate(amount*this.crelations[k]['angle'])

	this.antiCrossReff("crotate",0);
}

//TODO 3D like camera pan
Camera.cpan = function(panx,pany)
{

}

//TODO perfect focus exit conditin and add parameters for selective exclusion of tweening
// eg. don't zoom to level, don't turn to level, don't pan camera 
//TODO adapt to new move & zoom system
Camera.cfocusOn = function(target,options)
{
	console.log("Camera focusing on:"+target+" "+target.UID);
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
			var dx = ( ( camPos.x + camera.DOMreference.scrollLeft )- targetPos.x ) / 20;
			var dy = ( ( camPos.y + camera.DOMreference.scrollTop ) - targetPos.y ) / 20;
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
//Camera relationships
//TODO: When adding new actuators make sure you include the antiCrossReff system
Camera.addRelated = function(cam,descriptor)
{
	console.log("Adding related camera("+cam.UID+") to camera:"+this.UID);
	//relations between cameras are established based on position, zoom level and angle of a camera
	if(!descriptor['x'])
		descriptor['x'] = 0;

	if(!descriptor['y'])
		descriptor['y'] = 0;
	
	if(!descriptor['angle'])
		descriptor['angle'] = 0;
	
	if(!descriptor['zoom'])
		descriptor['zoom'] = 0;

	this.crelations[cam.UID] = descriptor;
	this.crelations[cam.UID]['root'] = cam;

}
Camera.removeRelated = function(camera)
{
	if(this.crelations[camera.UID])
		delete this.crelations[camera.UID];
}

Camera.setBoundaries = function(boundaries)
{
	for( k in boundaries )
		this.boundaries[k] = boundaries[k];
}

Camera.unsetBoundaries = function(boundaries)
{
	for( k in boundaries )
		delete this.boundaries[k];
}

//TODO: add tween function for camera properties ( pos, zoom, rot, pan )
Camera.tween = function(data)
{
	var interval = 1;
	if(data['interval'])
		interval = data['interval'];

}