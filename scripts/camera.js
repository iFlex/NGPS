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

//TODO: Add camera display object & adapt all actuators + adapt addChild
//		Inspect camera move boundaries when scaled
this.Camera = {};
Camera.addChild = function(descriptor,addToFrame)
{
	var reff = 0;
	if(!addToFrame)
	{
		if(this.display)
		{
			this.display.children[ containerData.containerIndex ] = new container( descriptor );
			reff = this.display.children[ containerData.containerIndex ] 
			reff.load( this.display );
			
			//EVENT
			if( this.events['addChild'] || ( GEM.events['addChild'] && GEM.events['addChild']['_global'] ) )
				GEM.fireEvent({event:"addChild",target:this,child:reff})

			return reff;
		}
	}
	
	this.children[ containerData.containerIndex ] = new container( descriptor );
	reff = this.children[ containerData.containerIndex ] 
	reff.load( this );

	//EVENT
	if( !addToFrame && this.events['addChild'] || ( GEM.events['addChild'] && GEM.events['addChild']['_global'] ) )
		GEM.fireEvent({event:"addChild",target:this,child:reff})

	return reff;
}
Camera.cstart = function(interval)
{
	//now adding camera specific functions
	this.display = 0; // this is the display area used for move, zoom, rotate
	//camera focus
	//camera content properties
	//zoom
	this.czoomLevel = 1;
	this.zoomDX = 0;
	this.zoomDY = 0;
	//rotate
	this.cangle = 0;
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
	//
	this.crelations = {};
	this.wasCalled = {};
	//
	this.boundaries = {};
	// Built in Fast Callbacks
	this.onMoved = this.cmove;
	this.onMouseDown = this.onMoveStart;
	this.onMouseUp   = this.onMoveEnd;

	//add the display
	var bkg = "transparent";
	if(factory && factory.settings.debug == true)
		bkg = "yellow";
	this.display = this.addChild({x:0,y:0,width:this.getWidth(),height:this.getHeight(),background:bkg},true);
	this.display.DOMreference.style.overflow = "";
	
	//this.display.extend(Interactive);
	//this.display.interactive(true);
	this.addEventListener("addChild","maintainBoundaries");
	this.isCamera = true;
}
//TODO: treat case when content is added outside the reference point of the camera div
Camera.maintainBoundaries = function(data)
{
	var target = data['child'];
	var pos = target.getPos(1,1);
	var hpos = target.getPos(0,0);
	var tpos = this.display.getPos();
	//far right
	if( pos.x > this.display.getPureWidth())
		this.display.setWidth(pos.x);

	if( pos.y > this.display.getPureHeight())
		this.display.setHeight(pos.y);

	//far left
	/*if( hpos.x < tpos.x)
		this.display.setWidth(pos.x);

	if( pos.y < tpos.y)
		this.display.setHeight(pos.y);
	*/
}

Camera.cgetPos = function(refX,refY)
{
	var pos = this.display.getPos(refX,refY);
	pos.x += this.zoomDX;
	pos.y += this.zoomDY;
	return pos;
}

Camera.showAnimations = function()
{
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
//for content status updates
Camera.getContentPositioning = function()
{
	if(!this.display)
		return null;

	var pos = this.display.getPos();
	return { x:pos.x+this.zoomDX,
		     y:pos.y+this.zoomDY,
		     width:this.display.getWidth(),
		     height:this.display.getHeight() };
}
//TODO: calculate boundaries and add boundary limit enforcing
Camera.cmove = function(dx,dy)
{
	if(!this.callow)
		return;
	
	//check boundaries
	//check x axis
	var sw = this.getPureWidth();
	var sh = this.getPureHeight();
	var w = this.display.getPureWidth();
	var h = this.display.getPureHeight();
	//TODO: not working!
	var originX = (this.display.getWidth() - w) / 2;
	var originY = (this.display.getHeight() - h ) / 2;
	var pos = this.display.getPos();
	pos.x += dx;
	pos.y += dy;
	
	if( this.boundaries['LOx'] && pos.x - originX> this.boundaries['LOx'] * sw)
		return;
	if( this.boundaries['HIx'] && pos.x + w - originX< this.boundaries['HIx'] * sw)
		return;

	if( this.boundaries['LOy'] && pos.y - originY > this.boundaries['LOy'] * sh)
		return;
	if(	this.boundaries['HIy'] && pos.y + h - originY < this.boundaries['HIy'] * sh)
		return;

	//check cross refference 
	if(this.antiCrossReff("cmove",1))
		return;

	//inertia buildup
	if(this.c_allowInertia && this.allowInertia)
	{
		this.xInertia += dx;
		this.yInertia += dy;
	}
	this.display.move(dx,dy);
	//TODO: investigate if moving a scaled camera needs any kind of adaptation: * (1/this.czoomLevel) , *(1/this.czoomLevel) 

	//relations support
	for( k in this.crelations )
		this.crelations[k]['root'].cmove(dx*this.crelations[k]['x'],dy*this.crelations[k]['y'])

	this.antiCrossReff("cmove",0);
}

Camera.onMoveStart = function(ctx,e)
{
	if(!this.callow)
		return;

	if(this.allowInertia)
	{
		var root = this;
		this.ccancel("inertia");

		//this.xInertia = 0;
		//this.yInertia = 0;
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
	if(!this.callow)
		return;

	var ok = false;
	if(this.cops['measureInertia'])
	{
		this.ccancel('measureInertia');
		ok = true;
	}
	if(ok)
		this.applyInertia();
}
Camera.applyInertia = function(){
	if(this.allowInertia)
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

Camera.cgetTransformOrigin = function(ox,oy)
{
	if(!ox)
		ox = 0.5;
	if(!oy)
		oy = 0.5;

	var dpos = this.display.getPos(0,0);
	ox = ( - dpos.x + this.getPureWidth()*ox) / this.display.getPureWidth();
	oy = ( - dpos.y + this.getPureHeight()*oy) / this.display.getPureHeight();
	return {ox:ox,oy:oy};
}

//TODO	Calculate boundaries and enforce zoom limits
Camera.czoom = function(amount,ox,oy)
{
	if(!this.callow)
		return;
	next = this.czoomLevel * amount
	//check boundaries
	if( this.boundaries["HIzoom"] && next > this.boundaries['HIzoom'])
		return;
	if( this.boundaries["LOzoom"] && next < this.boundaries['LOzoom'])
		return;

	//check cross referencing
	if(this.antiCrossReff("czoom",1))
		return;
	//maintain displacement from original position
	this.zoomDX += this.display.getWidth()*( 1 - amount ) / 2;
	this.zoomDY += this.display.getHeight()*( 1 - amount ) / 2;
	//
	this.czoomLevel = next;
	var torig = this.cgetTransformOrigin(ox,oy);
	this.display.scale(amount,torig['ox'],torig['oy'])

	for( k in this.crelations )
		if(this.crelations[k]['zoom'] != 0)
			this.crelations[k]['root'].czoom(amount*this.crelations[k]['zoom'])
	//anti cross reff
	this.antiCrossReff("czoom",0)
}
//TODO investigate aligning imperfections
Camera.crotate = function(amount,ox,oy) //SLOW & POSITIONING IMPERFECTIONS
{
	if(!this.callow)
		return;
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
	var torig = this.cgetTransformOrigin(ox,oy);
	this.display.setAngle(this.cangle,torig['ox'],torig['oy']);
	
	//relations support
	for( k in this.crelations )
		this.crelations[k]['root'].crotate(amount*this.crelations[k]['angle'])

	this.antiCrossReff("crotate",0);
}
//TODO 3D like camera pan
Camera.cpan = function(panx,pany)
{
	if(!this.callow)
		return;

}

//TODO perfect focus exit conditin and add parameters for selective exclusion of tweening
// eg. don't zoom to level, don't turn to level, don't pan camera 
Camera.cfocusOn = function(target,options)
{
	console.log("Camera focusing on:"+target+" "+target.UID);
	if(!this.callow)
		return;

	if(this.cops['focusOn'])
		clearInterval(this.cops['focusOn']);
	
	var camera = this;
	var destination = this.getPos(0.5,0.5);//destination position
	
	var pace = 20;
	var focusWidth = this.getWidth();
	var focusHeight = this.getHeight();
	if(options)
	{
		if(options['pace'])
			pace = options['pace'];
		
		if(options['focusWidth'])
			focusWidth = options['focusWidth'];

		if(options['focusHeight'])
			focusHeight = options['focusHeight'];
	}

	function focusOn()
	{
		
		var camPos = camera.cgetPos(0,0);
		var targetPos = target.getPos(0.5,0.5);
		camPos.x += targetPos.x;
		camPos.y += targetPos.y;

		var zoomWrap = (focusWidth / (target.getWidth()*camera.czoomLevel));
		var zoomHrap = (focusHeight / (target.getHeight()*camera.czoomLevel));
		var zoom = ( zoomWrap < zoomHrap ) ? zoomWrap : zoomHrap;

		//console.log("zoom:"+zoom+" zoomW:"+zoomWrap+" zoomH:"+zoomHrap + " fw:"+focusWidth+" w:"+target.getWidth()*camera.czoomLevel + " czl:"+camera.czoomLevel);
		if( Math.abs( destination.x - camPos.x) > 5 || Math.abs( destination.y - camPos.y) > 5 ||  zoom != 1 )
		{
			//TODO: fux zoom
			//if(zoom != 1)
			//	camera.czoom(1+(zoom-1)/pace);
			//move
			var dx = ( destination.x - camPos.x );
			var dy = ( destination.y - camPos.y );
			if( Math.abs(dx) < pace && Math.abs(dy) < pace)
			{	
				pace /= 2;
				if(pace<1)
					pace = 1;
			}
			dx/=pace;
			dy/=pace;
			camera.cmove(dx,dy);
			//console.log("x:"+camPos.x+" y:"+camPos.y+" dx:"+destination.x+"dy:"+destination.y)
			//rotate
			//var da = -target.angle /10;
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
Camera.tween = function(data,time)
{
	this.ccancel('tween');
	console.log("prep tween:"+time+" "+this.cinterval);
	var ctx = this;
	var steps = time/this.cinterval;
	if(steps < 1)
		steps = 1;
	console.log("steps:"+steps)
	var delta = 0;
	function _unit()
	{
		
		//do transforms
		if(data['zoom'])
		{
			delta = (data['zoom'] - ctx.czoomLevel)/steps;
			//regula de 3 simpla
			var w = ctx.display.getWidth()
			var intendedZ = w*(ctx.czoomLevel+delta)/ctx.czoomLevel
			ctx.czoom(intendedZ/w);
		}
		//console.log("tweenwork:"+ctx.ctweenInfo.steps)
		steps--;
		//stop
		if(steps <= 0)
			ctx.ccancel('tween');
	}
	this.cops['tween'] = setInterval(_unit,this.cinterval);
}