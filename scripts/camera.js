/**
*	NGPS Camera System
*	Author: Milorad Liviu Felix
*	30 May 2014 03:16 GMT
*
*	Requirements:
*		Must be applied to an existing Container Object
*/
//Definitions
/*
+-------------------------------+
|	+---------------------+   	  |
|	|  *Camera Frame      |		    |
|	|  contains all the   |		    |
|	|  visible content    |		    |
|	|                     |		    |
|	+---------------------+		    |
|								                |
|	*Camera Surface	     		      |
|	all the content that the 	    |
|   camera contains				      |
+-------------------------------+
*/
//CAMERA OPTIONS:
// >> surfaceWidth: presets the width of the camera surface
// >> surfaceHeight: presets the height of the camera surface
// >> onMoreContent: ['extend','extend_frame','extend_frame_x','extend_frame_y'] // when content exceeds surface boundaries 0: camera surface is extended 1: extends both the surface and frame
// >> CAMERA_type: ['generic','scroller'] 0: camera movement is supplied by movind the surface div 1: camera movement is supplied by native browser scroll

// relations are defined in terms of a coefficient applied to the a property
//	crelations[index] - root = the camera to relate to
//						        - descriptor = the properties that relate them
// example: x => 0.5

// boundaries are limits defined for a property which include a High and Low limit
// the limit is a coefficient applied to the corresponding property of the camera

// example: HIx => 0.5
//			LOx => 0.1

//			HIrotate => 25
//			LOrotate => 0   	//allows the camera to rotate between 0 and 25 degrees

//NOTE: when camera frame is an automatically positioned object the child display must be the same
var Camera = {};

Camera.cstart = function()
{
	console.log("Creating camera");
	//now adding camera specific functions
	//camera focus
	//camera content properties
	//zoom
	this.czoomLevel = 1;
	this.zoomDX = 0;
	this.zoomDY = 0;
	//rotate
	this.cangle = 0;
	//ViewportXY
	this.cViewPortX = 0;
	this.cViewPortY = 0;

	//operations flags
	this.callow = true;
	//
	this.crelations = this.crelations || {};
	this.wasCalled = {};
	//
	this.boundaries = this.boundaries || {};
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
	this.display.isDisplay = true;
	this.display.DOMreference.style.overflow = "hidden";
	if(this.properties.autopos)
		this.display.DOMreference.style.position = "relative";

	this.display.getPos = function(ox,oy){
		return this.parent.getSurfaceXY(ox,oy);
	}

	if(this.properties['CAMERA_type'] == "scroller")
	{
		this.cameraType = 1;//GENERIC CAMERA TYPE = 0; SCROLLER CAMERA = 1 ( uses native scroll )
		var sxy = this.getSurfaceXY(0,0);
		this.lastScrollLeft = sxy.x;
		this.lastScrollTop = sxy.y;
	}
	else
		this.cameraType = 0;
	this.setCameraType(this.cameraType);

	//scroll
	this.ctargetX = 0;
	this.ctargetY = 0;
	this.oldX = 0;
	this.oldY = 0;
	this.addEventListener("addChild","maintainBoundaries"); // there is no more maintainBoundaries function
	this.isCamera = true;
	//setting camera range
	var sr = platform.getScreenSize();
	this.setCameraRange((this.properties['surfaceWidth']) ? this.properties['surfaceWidth'] : this.getWidth(),
						(this.properties['surfaceHeight']) ? this.properties['surfaceHeight'] : this.getHeight());

	console.log("New Camera("+this.UID+"):"+utils.debug(this.properties," "));
}

Camera.setCameraRange = function ( w , h, ox, oy )
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
//GETTERS
Camera.getViewportXY = function(ox,oy){
	if(!ox)
		ox = 0;
	if(!oy)
		oy = 0;
	var ret = this.getSurfaceXY(0,0);
	ret['x'] = -ret['x'] + this.getWidth()*ox*ret.zoomMod;
	ret['y'] = -ret['y'] + this.getHeight()*oy*ret.zoomMod;
	return ret;
}
Camera.getSurfaceXY = function(ox,oy,noScale){
	if(ox == undefined )
		ox = 0;
	if(oy == undefined )
		oy = 0;

	var zoomMod = (noScale)?1:(1 / this.czoomLevel);
	var w = this.getWidth()*ox;
	var h = this.getHeight()*oy;
	var pos = {x:0,y:0}//this.display.getPos();
	if(this.cameraType == 1)//scroll camera
	{
		pos.x = -this.DOMreference.scrollLeft;
		pos.y = -this.DOMreference.scrollTop;
	}

	return {
			x: (pos.x+w)*zoomMod,
			y: (pos.y+h)*zoomMod,
			zoomMod: zoomMod
	}
}
Camera.getSurface = function(ox,oy){
	var data = this.getSurfaceXY(ox,oy);
	data['width'] = this.display.getWidth();
	data['height'] = this.display.getHeight();
	data['targetX'] = this.ctargetX;
	data['targetY'] = this.ctargetY;
	return data;
}
Camera.cgetTransformOrigin = function(ox,oy){
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

Camera.viewportToSurface = function(x,y){
	var v = this.getSurfaceXY(0,0);
	v.x = -v.x;
	v.y = -v.y;
	v.x += x * v.zoomMod;
	v.y += y * v.zoomMod;
	return v;
}
Camera.surfaceToViewport = function(x,y){
	var v = this.getSurfaceXY(0,0);
	v.x += x;
	v.y += y;
	return v;
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
			var reff = new container(descriptor,this.display);
			//EVENT
			if( this.events['addChild'] || ( GEM.events['addChild'] && GEM.events['addChild']['_global'] ) )
				GEM.fireEvent({event:"addChild",target:this,child:reff})

			return reff;
		}
	}

	//add to camera frame
	reff = new container( descriptor, this );
	//EVENT
	if( !addToFrame && this.events['addChild'] || ( GEM.events['addChild'] && GEM.events['addChild']['_global'] ) )
		GEM.fireEvent({event:"addChild",target:this,child:reff})

	return reff;
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
//fires when scroller camera is moved by any of the functions or the user
Camera.scrollHandler = function(e)
{
	//console.log("Camera: handling scroll");
	var parent = this;
	var pos = parent.getSurfaceXY();
	parent.ctargetY = pos.y;
	parent.ctargetX = pos.x;
	//check cross refference
	var dx = parent.lastScrollLeft - pos.x;
	var dy = parent.lastScrollTop - pos.y;
	parent.lastScrollLeft = pos.x;
	parent.lastScrollTop = pos.y;
	//console.log("Scroller Camera move:"+dx+"|"+dy);
	for( k in parent.crelations )
		parent.crelations[k]['root'].cmove(dx*parent.crelations[k]['x'],dy*parent.crelations[k]['y'])

	this.antiCrossReff("cmove",0);
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
	if(delay == undefined)
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

	var pos = this.getSurfaceXY(0,0,true);

	if(!this.properties['lockY'])
		this.ctargetY = pos.y + dy;
	if(!this.properties['lockX'])
		this.ctargetX = pos.x + dx;
	this.cmoveBound();

	//console.log("DX:"+dx+" DY:"+dy);
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

	var pos = this.getSurfaceXY(0,0,true);
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

Camera.czoomTo = function(zlevel,ox,oy,delay)
{
	var level  = zlevel / this.czoomLevel;

	var stepPeriod = 50;
	if(!this.callow)
		return false;

	if(ox == undefined)
		ox = 0.5;

	if(oy == undefined)
		oy = 0.5;

	if(delay == undefined)
		delay = 1;

	//check cross referencing
	if(this.antiCrossReff("czoom",1))
		return;

	//cancel previous zoom
	if(this.czmInterval)
		clearInterval(this.czmInterval);

	var ctx = this;
	function doZoom(level){
		var before = ctx.getSurfaceXY(-0.5,-0.5);
		ctx.czoomLevel *= level;
		ctx.display.scale(level,0,0,0);
		var after = ctx.getSurfaceXY(-0.5,-0.5);
		ctx.c_move((before.x - after.x) * ctx.czoomLevel,(before.y - after.y) * ctx.czoomLevel);
	}

	var steps      = delay * 1000 / stepPeriod;
	var taregt     = this.czoomLevel * level;
	var zoom_level = Math.pow(level,1/steps);
	console.log("level:" + level + " steps:" + steps + " zl:" + zoom_level);
	doZoom(zoom_level);
	this.czmInterval = setInterval(function(){
		steps--;
		doZoom(zoom_level);
		if(steps < 1){
			clearInterval(ctx.czmInterval);
			ctx.czmInterval = 0;
		}
	},10);

	for( k in this.crelations )
		if(this.crelations[k]['zoom'] != 0)
			this.crelations[k]['root'].czoomTo( zlevel * this.crelations[k]['zoom'] )

	//anti cross reff
	this.antiCrossReff("czoom",0);
	return true;
}
//warning: if the step is too precise .xxx the zoom will not be precisely around the center of the viewport
Camera.czoom = function(level,ox,oy,delay)
{
	this.czoomTo(this.czoomLevel * level,ox,oy,delay);
}

Camera.c_zoom = function(level,ox,oy)
{
	this.czoom(level,ox,oy,0);
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
	var speed = options.speed || 1;
	var tpos = target.local2global(0.5,0.5,this.display.UID);
	console.log("tx:"+tpos.x+" ty:"+tpos.y)
	this.cXYmove(tpos.x * this.czoomLevel,tpos.y * this.czoomLevel,0.5,0.5,speed);
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
