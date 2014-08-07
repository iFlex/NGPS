/**
*	NGPS Camera System
*	Author: Milorad Liviu Felix
*	30 May 2014 03:16 GMT
*	
*	Requirements:
*		Must be applied to an existing Container Object
*/
//TODO: Change camera working method:
//TODO: Make display object very wide and high

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
//		Make content pulling and content boundary monitoring
this.Camera = {};

Camera.cstart = function(interval)
{
	//now adding camera specific functions
	this.display = 0; // this is the display area used for move, zoom, rotate
	//camera focus
	//camera content properties
	//scroll
	this.oldX = 0;
	this.oldY = 0;
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

	this.initialWidth = this.getWidth();
	this.initialHeight = this.getHeight();
	this.display = this.addChild({ x:0 , y:0 , width: this.initialWidth , height: this.initialHeight, background:bkg},true);
	this.display.DOMreference.style.overflow = "hidden";
	this.DOMreference.style.overflow = "scroll";
	//this.display.extend(Interactive);
	//this.display.interactive(true);
	this.addEventListener("addChild","maintainBoundaries"); // there is no more maintainBoundaries function
	this.isCamera = true;
	console.log(" Camera range:"+this.properties.range)
	if( this.properties.range != "restricted")
	{	
		this.initialWidth = (this.properties['initialWidth']) ? this.properties['initialWidth'] : 50000;
		this.initialHeight = (this.properties['initialHeight']) ? this.properties['initialHeight'] : 50000;
		
		this.display.setWidth(this.initialWidth);
		this.display.setHeight(this.initialHeight);
		console.log("iW:"+this.initialWidth + " iH:"+this.initialHeight+" w:"+this.display.getWidth()+" h:"+this.display.getHeight());
		var dx = ( this.display.getWidth() - this.getWidth() ) / 2;
		var dy = ( this.display.getHeight() - this.getHeight() ) / 2;
		this.cmove( dx > 0 ? -dx : 0 , dy > 0 ? -dy : 0 );
	}
	//
	console.log(" iW:" + this.initialWidth + " iH:" + this.initialHeight )
	this.DOMreference.onscroll = this.scrollHandler;
}

Camera.maintainBoundaries = function(data)
{
	var target = data['child'];
	console.log("t:"+utils.debug(target, " ")+" d:"+utils.debug(this.display," "));
	var pos = target.getPos(0,0);
	var hpos = target.getPos(1,1);
	//extend downwards and rightwards
	if( pos.x < 0)
		this.pullContent(-pos.x,0);

	if( pos.y < 0 )
		this.pullContent(0,-pos.y);

	if( this.properties.hasOwnProperty('onMoreContent') && this.properties['onMoreContent'] == "extend" )
	{
		console.log("hps:"+utils.debug(hpos," ")+" pw:"+this.display.getPureWidth()+" ph:"+this.display.getPureHeight())
		if( hpos.x > this.display.getPureWidth())
		{
			this.display.setWidth(hpos.x);
			console.log("EXTENDED Camera surface W:",hpos.x);
		}
		if( hpos.y > this.display.getPureHeight())
		{
			this.display.setHeight(hpos.y);
			console.log("EXTENDED Camera surface H:",hpos.y)
		}
	}
}
Camera.screenToDisplayCoord = function(x,y)
{
	return {x:parseInt(x) + this.DOMreference.scrollLeft,
			y:parseInt(y) + this.DOMreference.scrollTop}
		
}
Camera.addChild = function(descriptor,addToFrame,translate) //translate is used to translate the given position ( which is in relation to the screen ) to actual camera position
{
	//alert("tra:"+translate);
	var reff = 0;
	if( translate )
	{
		var pos = this.screenToDisplayCoord(parseInt(descriptor['x']),parseInt(descriptor['y']));
		descriptor['x'] = pos.x;
		descriptor['y'] = pos.y;
		console.log("Translated:"+utils.debug(descriptor," "))
	}
	//add to camera display
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

	//add to camera frame
	this.children[ containerData.containerIndex ] = new container( descriptor );
	reff = this.children[ containerData.containerIndex ] 
	reff.load( this );

	//EVENT
	if( !addToFrame && this.events['addChild'] || ( GEM.events['addChild'] && GEM.events['addChild']['_global'] ) )
		GEM.fireEvent({event:"addChild",target:this,child:reff})

	return reff;
}

Camera.setCameraRange = function ( w , h )
{
	this.display.setWidth(w);
	this.display.setHeight(h);
}

Camera.reset = function()//brings camera back to origin
{
	var sl = (this.display.getWidth() - this.getWidth())/2
	var st = (this.display.getHeight() - this.getHeight())/2
	
	this.DOMreference.scrollLeft = sl;
	this.DOMreference.scrollTop = st;
}


//GETTERS
Camera.cgetPos = function(refX,refY)
{
	var pos = this.display.getPos(refX,refY);
	pos.x += this.DOMreference.scrollLeft;
	pos.y += this.DOMreference.scrollTop;
	
	//if(!this.DOMreference.scrollLeft)
	//	pos.x += this.zoomDX;
	
	//if(!this.DOMreference.scrollTop)
	//	pos.y += this.zoomDY;

	return pos;
}
Camera.cgetTransformOrigin = function(ox,oy)
{
	if(typeof(ox) == "undefined")
		ox = 0.5;
	if(typeof(oy) == "undefined")
		oy = 0.5;
	
	ox = ( this.DOMreference.scrollLeft + this.getWidth() * ox ) / this.display.getWidth();
	oy = ( this.DOMreference.scrollTop + this.getHeight() * oy ) / this.display.getHeight();
	return {ox:ox,oy:oy};
}
//
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

Camera.pullContent = function(dx,dy) // works
{
	//pulls content from camera's edge to make it visible while keeping the camera's position at the same place
	if(!dx)
		dx = 0;
	if(!dy)
		dy = 0;

	if(!dx && !dy)
	{
		console.log("PULLING CANCELED FROMT THE START!");
		return;
	}

	var result = this.cmove(-dx,-dy,true,true); 
	console.log("PULLING CONTENT. dx:"+dx+" dy:"+dy+" r:"+result)
	
	if(result)
	{
		for( k in this.display.children )
			this.display.children[k].move(dx,dy);
	}
	else
		console.log("PULL CANCELED!");
}
//for content status updates
Camera.getContentPositioning = function()
{
	if(!this.display)
		return null;

	var pos = this.cgetPos();
	return { x:pos.x,
		     y:pos.y,
		     width:this.display.getWidth(),
		     height:this.display.getHeight() };
}

Camera.scrollHandler = function()
{
	var parent = this.context;
	var dy = parent.DOMreference.scrollTop - parent.oldY;
	var dx = parent.DOMreference.scrollLeft - parent.oldX;
	parent.oldY = parent.DOMreference.scrollTop;
	parent.oldX = parent.DOMreference.scrollLeft;

	//check cross refference 
	if(parent.antiCrossReff("cmove",1))
		return;

	//relations support
	for( k in parent.crelations )
		parent.crelations[k]['root'].cmove(dx*parent.crelations[k]['x'],dy*parent.crelations[k]['y'])

	parent.antiCrossReff("cmove",0);
}
//TODO: calculate boundaries and add boundary limit enforcing
Camera.cmove = function(dx,dy,norel,ICR) //ICR ignore cross refference
{
	if(!this.callow)
	{
		console.log("Operation denied!");
		return false;
	}
	//check cross refference 
	if(!ICR && this.antiCrossReff("cmove",1))
	{
		console.log("Cross reference prevented!");
		return false;
	}
	//inertia buildup
	if(this.c_allowInertia && this.allowInertia)
	{
		//this.xInertia += dx;
		//this.yInertia += dy;
	}
	//
	this.oldY = this.DOMreference.scrollTop;
	this.oldX = this.DOMreference.scrollLeft; 
	
	this.DOMreference.scrollTop -= dy;
	this.DOMreference.scrollLeft -= dx;

	if(this.DOMreference.scrollTop == this.oldY && this.DOMreference.scrollLeft == this.oldX )
	{
		console.log("DID NOT MOVE! BITH DOES NOT WANT TO WORK:"+this.DOMreference.scrollTop+" "+this.DOMreference.scrollLeft+" w:"+this.getWidth()+" h:"+this.getHeight())
		if(!ICR)
			this.antiCrossReff("cmove",0);
		return false;
	}
	//	this.display.move(dx,dy);
	//TODO: investigate if moving a scaled camera needs any kind of adaptation: * (1/this.czoomLevel) , *(1/this.czoomLevel) 

	//relations support
	if(!norel)
		for( k in this.crelations )
			this.crelations[k]['root'].cmove(dx*this.crelations[k]['x'],dy*this.crelations[k]['y'])

	if(!ICR)
		this.antiCrossReff("cmove",0);
	
	return true;
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
	//this.zoomDX += this.display.getWidth() * ( 1 - amount ) / 2;
	//this.zoomDY += this.display.getHeight() * ( 1 - amount ) / 2;
	//
	this.czoomLevel = next;
	var torig = this.cgetTransformOrigin(ox,oy);
	//console.log("TORIG:"+utils.debug(torig," ")+" x:"+this.display.getWidth()*torig['ox']+" y:"+this.display.getHeight()*torig['oy']);
	this.display.scale(amount,torig['ox'],torig['oy'])

	for( k in this.crelations )
		if(this.crelations[k]['zoom'] != 0)
			this.crelations[k]['root'].czoom( amount * this.crelations[k]['zoom'] )
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
	
	var pace = 10;
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
		
		//console.log("CX:"+camPos.x+" CY:"+camPos.y+" TX:"+targetPos.x+" TY:"+targetPos.y+" Dx:"+destination.x+" Dy:"+destination.y)
		targetPos.x -= camPos.x;
		targetPos.y -= camPos.y;
	
		var zoomWrap = (focusWidth / (target.getWidth()*camera.czoomLevel));
		var zoomHrap = (focusHeight / (target.getHeight()*camera.czoomLevel));
		var zoom = ( zoomWrap < zoomHrap ) ? zoomWrap : zoomHrap;

		//console.log("zoom:"+zoom+" zoomW:"+zoomWrap+" zoomH:"+zoomHrap + " fw:"+focusWidth+" w:"+target.getWidth()*camera.czoomLevel + " czl:"+camera.czoomLevel);
		if( Math.abs( targetPos.x - destination.x) > 5 || Math.abs( targetPos.y - destination.y) > 5 ||  zoom != 1 )
		{
			if(zoom != 1)
				camera.czoom(1+(zoom-1)/(pace*1.3));
			//move
			var dx = ( destination.x - targetPos.x );
			var dy = ( destination.y - targetPos.y );
			if( Math.abs(dx) < pace && Math.abs(dy) < pace)
			{	
				pace /= 2;
				if(pace<1)
					pace = 1;
			}
			dx/=pace;
			dy/=pace;
			camera.cmove(dx,dy);
			//console.log("Dx:"+destination.x+" Dy:"+destination.y+" tx:"+targetPos.x+"ty:"+targetPos.y+" dx:"+dx+" dy:"+dy)
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