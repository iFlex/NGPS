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
//Definitions
/*
+-------------------------------+
|	+---------------------+   	|
|	|  *Camera Frame      |		|
|	|  contains all the   |		|
|	|  visible content    |		|
|	|                     |		|
|	+---------------------+		|
|								|
|	*Camera Surface	     		|
|	all the content that the 	|
|   camera contains				|			
+-------------------------------+
*/
//CAMERA OPTIONS:
// >> surfaceWidth: presets the width of the camera surface
// >> surfaceHeight: presets the height of the camera surface
// >> onMoreContent: ['extend','extend_frame','extend_frame_x','extend_frame_y'] // when content exceeds surface boundaries 0: camera surface is extended 1: extends both the surface and frame
// >> CAMERA_type: ['generic','scroller'] 0: camera movement is supplied by movind the surface div 1: camera movement is supplied by native browser scroll
// relations are defined in terms of a coefficient applied to the a property
// example: x => 0.5

// boundaries are limits defined for a property which include a High and Low limit
// the limit is a coefficient applied to the corresponding property of the camera

// example: HIx => 0.5
//			LOx => 0.1

//			HIrotate => 25
//			LOrotate => 0   	//allows the camera to rotate between 0 and 25 degrees

//NOTE: when camera frame is an automatically positioned object the child display must be the same
this.Camera = {};

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
	this.onMoved = this.c_move;//this.cmove;
	this.onMouseDown = this.onMoveStart;
	this.onMouseUp   = this.onMoveEnd;

	//add the display
	var bkg = "transparent";
	//debug, take out after 
	if(factory && factory.settings.debug == true)
		bkg = "yellow";
	
	this.display = this.addChild( { x:0, y:0 ,width: this.getWidth() , height: this.getHeight(), background:bkg},true);
	this.display.DOMreference.style.overflow = "hidden";
	if(this.properties.autopos)
		this.display.DOMreference.style.position = "relative";

	if(this.properties['CAMERA_type'] == "scroller")
		this.cameraType = 1;//GENERIC CAMERA TYPE = 0; SCROLLER CAMERA = 1 ( uses native scroll )
	else
		this.cameraType = 0;
	this.setCameraType(this.cameraType);

	//scroll
	this.ctargetX = 0;
	this.ctargetY = 0;
	this.oldX = 0;
	this.oldY = 0;
	//this.display.extend(Interactive);
	//this.display.interactive(true);
	this.addEventListener("addChild","maintainBoundaries"); // there is no more maintainBoundaries function
	this.isCamera = true;
	//setting camera range
	var sr = platform.getScreenSize();
	this.setCameraRange((this.properties['surfaceWidth']) ? this.properties['surfaceWidth'] : this.getWidth(),
						(this.properties['surfaceHeight']) ? this.properties['surfaceHeight'] : this.getHeight());
	console.log("New Camera("+this.UID+"):"+utils.debug(this.properties," "));
}
Camera.setCameraRange = function ( w , h, ox,oy )
{
	if(typeof ox === 'undefined')
		ox = 0.5;
	if(typeof oy == 'undefined')
		oy = 0.5;
		
	this.display.setWidth(w);
	this.display.setHeight(h);
	
	var dx = ( this.display.getWidth() - this.getWidth() ) * ox;
	var dy = ( this.display.getHeight() - this.getHeight() ) * oy;
	this.cXYmove( dx > 0 ? -dx : 0 , dy > 0 ? -dy : 0 );
}
Camera.setCameraType = function(type)
{
	if(typeof(type) == "string")
	{
		if(type == "generic")
			type = 0;
		if(type == "scroller")
			type = 1;
	}

	var pos = this.getSurfaceXY();
	if( type == 0 )//0
	{
		this.DOMreference.style.overflow = "hidden";
		if( this.cameraType == 1)
		{
			this.display.DOMreference.style.top = pos.y + "px";
			this.display.DOMreference.style.left = pos.x + "px";
			this.DOMreference.scrollTop = 0;
			this.DOMreference.scrollLeft = 0;
		}
		this.DOMreference.onscroll = 0;
		this.cameraType = 0;
	}
	if( type == 1 )//1
	{
		this.DOMreference.style.overflow = "scroll";
		if( this.cameraType == 0)
		{
			this.DOMreference.scrollTop = -pos.y;
			this.DOMreference.scrollLeft = -pos.x;
			this.display.DOMreference.style.top = "0px";
			this.display.DOMreference.style.left = "0px";
		}
		var ctx = this;
		this.DOMreference.onscroll = function(e){ ctx.scrollHandler(e); }
		this.cameraType = 1;	
	}
}
Camera.maintainBoundaries = function(data)
{
	var target = data['child'];
	var pos = target.getPos(0,0);
	var hpos = target.getPos(1,1);
	/*//extend downwards and rightwards
	if( pos.x < 0)
		this.pullContent(-pos.x,0);

	if( pos.y < 0 )
		this.pullContent(0,-pos.y);
	*/
	if( this.properties.hasOwnProperty('onMoreContent'))
	{
		if(this.cameraType == 1)
		{
			hpos.x = this.display.DOMreference.scrollWidth;
			hpos.y = this.display.DOMreference.scrollHeight;
		}
		if( hpos.x > this.display.getPureWidth() )
		{
			this.display.setWidth(hpos.x);
			if(this.properties['onMoreContent'] == "extend_frame" || this.properties['onMoreContent'] == "extend_frame_x")
				this.setWidth(hpos.x);
			//console.log("EXTENDED Camera("+this.UID+") surface W:",hpos.x);
		}
		if( hpos.y > this.display.getHeight() )
		{
			this.display.setHeight(hpos.y);
			if(this.properties['onMoreContent'] == "extend_frame" || this.properties['onMoreContent'] == "extend_frame_y")
				this.setHeight(hpos.y);
			//console.log("EXTENDED Camera("+this.UID+") surface H:",hpos.y)
		}
	}
	//chain up to root
	function chainUp(node){
		while(node)
		{
			if(node.maintainBoundaries && node.display)
			{
				node.maintainBoundaries({child:node.display});
				return;
			}
			else
				node = node.parent;
		}
	}
	chainUp(this.parent);
}
Camera.screenToDisplayCoord = function(x,y)
{
	//deprecated?
	return {x:parseInt(x) + this.DOMreference.scrollLeft,
			y:parseInt(y) + this.DOMreference.scrollTop}
		
}
Camera.viewportToSurface = function(x,y)
{
	//reimplement above correctly
}
//GETTERS
Camera.getViewportXY = function(ox,oy){
	if(!ox)
		ox = 0;
	if(!oy)
		oy = 0;
	var ret = this.getSurfaceXY(0,0);
	ret['x'] = -ret['x'] + this.getWidth()*ox;
	ret['y'] = -ret['y'] + this.getHeight()*oy;
	return ret;
}
Camera.getSurfaceXY = function(ox,oy){
	if(!ox)
		ox = 0;
	if(!oy)
		oy = 0;
	
	var w = this.getWidth()*ox;
	var h = this.getHeight()*oy;
	var pos = this.display.getPos();
	if(this.cameraType == 1)//scroll camera
	{
		pos.x = -this.DOMreference.scrollLeft; 
		pos.y = -this.DOMreference.scrollTop;
	}

	return {x: pos.x+w,
			y: pos.y+h}
}
Camera.getSurface = function(ox,oy){
	var data = this.getSurfaceXY(ox,oy);
	data['width'] = this.display.getWidth();
	data['height'] = this.display.getHeight();
	data['targetX'] = this.ctargetX;
	data['targetY'] = this.ctargetY;
	return data;
}
Camera.cgetTransformOrigin = function(ox,oy)
{
	//deprecated, must delete
	if(typeof(ox) == "undefined")
		ox = 0.5;
	if(typeof(oy) == "undefined")
		oy = 0.5;
	var vprt = this.getViewportXY(ox,oy);
	ox =  vprt.x / this.display.getWidth();
	oy =  vprt.y / this.display.getHeight();
	return {ox:ox,oy:oy};
}
//UTILS
Camera.addChild = function(descriptor,addToFrame) //translate is used to translate the given position ( which is in relation to the screen ) to actual camera position
{
	var reff = 0;
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

Camera.ccancel = function(what)
{
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
Camera.moveContent = function(dx,dy)
{
	//console.log("Camera moving content:"+dx+" "+dy)
	for( k in this.display.children )
		this.display.children[k].move(dx,dy,0);
}
Camera.pullContent = function(dx,dy) // works
{
	console.log("Camera pull content dx:"+dx+" dy:"+dy);
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

	this.c_move(dx,dy,true);
	this.moveContent(-dx,-dy);
}

Camera.scrollHandler = function(e)
{
	//console.log("Camera: handling scroll");
	var parent = this;
	var pos = parent.getSurfaceXY();
	parent.ctargetY = pos.y;
	parent.ctargetX = pos.x;
	//check cross refference 
	var dx = 0;
	var dy = 0;
	for( k in parent.crelations )
		parent.crelations[k]['root'].cmove(dx*parent.crelations[k]['x'],dy*parent.crelations[k]['y'])

}
//TODO: calculate boundaries and add boundary limit enforcing
//MOVE CODE
//TO move the camera use ctargetX and ctargetY to store the next position it will be placed at
// this will be trimmed by the camera boundary enforcer function cmoveBound 
Camera.cmoveBound = function(){
	//boundary enforcement
	var s = this.getSurface();
	var w = this.getWidth();
	var h = this.getHeight();
	//TODO: replace string comparison with something else
	if(typeof(this.boundaries['LOx']) != 'undefined' && this.boundaries['LOx']*w < s.targetX )
		this.ctargetX = this.boundaries['LOx']*w;
	if(typeof(this.boundaries['HIx']) != 'undefined' && this.boundaries['HIx']*w > (s.targetX + s.width) )
		this.ctargetX += this.boundaries['HIx']*w - (s.targetX + s.width);
	
	if(typeof(this.boundaries['LOy']) != 'undefined' && this.boundaries['LOy']*h < s.targetY )
		this.ctargetY = this.boundaries['LOy']*h;
	if(typeof(this.boundaries['HIy']) != 'undefined' && this.boundaries['HIy']*h > (this.ctargetY + s.height) )
		this.ctargetY += this.boundaries['HIy']*h - (this.ctargetY + s.height);
}
Camera.cXYmove = function(px,py,ox,oy,delay,norel)
{
	if(!delay)
		delay = 0;

	if(!ox)
		ox = 0;
	if(!oy)
		oy = 0;
		
	if(!this.callow)
	{
		console.log("Operation denied!");
		return false;
	}
	//check cross refference 
	if(!norel && this.cameraType != 1 && this.antiCrossReff("cXYmove",1))
	{
		console.log("Cross reference prevented!");
		return false;
	}	
	//TODO: check if movement is possible;
	this.ctargetX = -px + this.getWidth()*ox;
	this.ctargetY = -py + this.getHeight()*oy;
	this.cmoveBound();
	
	if(this.cameraType == 1)
		TweenMax.to(this.DOMreference,delay,{scrollTop:-this.ctargetY,scrollLeft:-this.ctargetX});
	else
	{
		TweenMax.to(this.display.DOMreference,delay,{top:this.ctargetY,left:this.ctargetX});
	
		//relations support
		if(!norel)
		{
			for( k in this.crelations )
				this.crelations[k]['root'].cXYmove( this.ctargetX * this.crelations[k]['x'] , this.ctargetY * this.crelations[k]['y'] ,ox,oy , false, delay );

			this.antiCrossReff("cXYmove",0);
		}
	}
	return true;
}
Camera.cmove = function(dx,dy,delay,norel) //ICR ignore cross refference, make this cummulative
{
	if(!delay)
		delay = 0;
	if(!this.callow)
	{
		console.log("Operation denied!");
		return false;
	}
	//check cross refference 
	if(!norel && this.cameraType != 1 && this.antiCrossReff("cmove",1))
	{
		console.log("Cross reference prevented cmove");
		return false;
	}

	var pos = this.getSurfaceXY();

	if(!this.properties['lockY'])
		this.ctargetY = pos.y + dy;
	if(!this.properties['lockX'])
		this.ctargetX = pos.x + dx;
	this.cmoveBound();

	console.log("DX:"+dx+" DY:"+dy);
	var ctx = this;
	if(this.cameraType == 1)
		TweenMax.to(this.DOMreference,1,{scrollTop:-this.ctargetY,scrollLeft:-this.ctargetX});
	else
	{
		TweenMax.to(this.display.DOMreference,1,{top:this.ctargetY,left:this.ctargetX});//,onUpdate:function(e){ctx.scrollHandler(e);}});
	
		//relations support
		if(!norel)
		{
			for( k in this.crelations )
				this.crelations[k]['root'].cmove(dx*this.crelations[k]['x'],dy*this.crelations[k]['y'])

			this.antiCrossReff("cmove",0);
		}
	}
	return true;
}
Camera.c_move = function(dx,dy,norel)
{
	//check cross refference 
	if(!norel && this.cameraType != 1 && this.antiCrossReff("c_move",1))
	{
		console.log("Anti cross ref terminated c_move");
		return false;
	}
	
	var pos = this.getSurfaceXY();
	this.ctargetX = pos.x;
	this.ctargetY = pos.y;
	if(!this.properties['lockY'])
		this.ctargetY += dy;	
	if(!this.properties['lockX'])
		this.ctargetX += dx;
	this.cmoveBound();	

	if(this.cameraType == 1)
	{	
		this.DOMreference.scrollLeft = -this.ctargetX;
		this.DOMreference.scrollTop = -this.ctargetY;
	}
	else
	{
		this.display.DOMreference.style.top = this.ctargetY + "px";
		this.display.DOMreference.style.left = this.ctargetX + "px";
	
		if(!norel)
		{
			for( k in this.crelations )
					this.crelations[k]['root'].c_move(dx*this.crelations[k]['x'],dy*this.crelations[k]['y'])

			this.antiCrossReff("c_move",0);
		}
	}
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
Camera.czoom = function(level,ox,oy)
{
	if(!this.callow)
		return false;
	
	//TODO: check boundaries
	if( this.boundaries["HIzoom"] && level > this.boundaries['HIzoom'])
		return false;
	if( this.boundaries["LOzoom"] && level < this.boundaries['LOzoom'])
		return false;
	
	if(typeof(ox) == "undefined")
		ox = 0.5;
	if(typeof(oy) == "undefined")
		oy = 0.5;

	this.czoomLevel = level;
	//check cross referencing
	if(this.antiCrossReff("czoom",1))
		return;
	
	var torig = this.cgetTransformOrigin(ox,oy);
	this.display.scale(level,torig['ox'],torig['oy'],1);

	for( k in this.crelations )
		if(this.crelations[k]['zoom'] != 0)
			this.crelations[k]['root'].czoom( level * this.crelations[k]['zoom'] )
	//anti cross reff
	this.antiCrossReff("czoom",0);
	return true;
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

	//calculate distance to target
	var tpos = target.getPos(0.5,0.5);
	tpos = target.local2global(tpos.x,tpos.y);
	console.log("tx:"+tpos.x+" ty:"+tpos.y)
	this.cXYmove(tpos.x,tpos.y,0.5,0.5,1);
	//calculate zoom difference
	//this.czoom(level,ox,oy);
	//calculate rotation difference
	//this.crotate(angle,ox,oy);
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

//TODO: remove this function
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

/*
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
		this.xInertia += dx;
		this.yInertia += dy;
	}
	//
	var st = this.DOMreference.scrollTop + dy;
	var sl = this.DOMreference.scrollLeft + dx;
	this.oldY = this.DOMreference.scrollTop;
	this.oldX = this.DOMreference.scrollLeft; 
	
	//this.DOMreference.scrollTop -= dy;
	//this.DOMreference.scrollLeft -= dx;
	TweenMax.to(this.DOMreference,1,{scrollTop:st,scrollLeft:sl});
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
	//var dsx = this.DOMreference.scrollLeft; 
	//var dsy = this.DOMreference.scrollTop;
	//this.DOMreference.scrollLeft *= amount;
	//this.DOMreference.scrollTop *= amount;
	this.display.scale(amount,torig['ox'],torig['oy'])

	//cli.showPrompt("Z Amount:"+amount)
	//TODO: TEST
	//this.DOMreference.scrollTop = dsx*amount;
	//this.DOMreference.scrollLeft = dsy*amount;

	for( k in this.crelations )
		if(this.crelations[k]['zoom'] != 0)
			this.crelations[k]['root'].czoom( amount * this.crelations[k]['zoom'] )
	//anti cross reff
	this.antiCrossReff("czoom",0)
}
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
			if(!camera.cmove(dx,dy))
			{
				clearInterval(camera.cops['focusOn']);
				delete camera.cops['focusOn'];
			}
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
*/