/**
*	NGPS Interactive System
*	Author: Milorad Liviu Felix
*	5 July 2014 18:17 GMT
*	
*	Requirements:
*		Must be applied to an existing Container Object
*/
this.Interactive = {}

//What to do with interaction events( In some cases it's necessary to pass them to the parent )
Interactive.propagation = 0; 
// 0 no propagation; 
// 1 Native propagation to parent ( Native Browser Propagation ); 
// 2 Manual propagation to parent ( Strict )

//Classic Interaction
Interactive.hasMD = false;
Interactive.lx = 0;
Interactive.ly = 0;
Interactive.dragDist = 0;
Interactive.triggerCount = 0;

Interactive.onMouseDown = function( e , ctx )
{
	if(!ctx)
		ctx = this.context;
	
	if( ctx.propagation == 1 )
		return true;

	e.stopPropagation();
	if( ctx.propagation == 0 )
	{
		ctx.lx = e.clientX;
		ctx.ly = e.clientY;
		ctx.hasMD = true;
		ctx.dragDist = 0;
		console.log("Mouse Down("+ctx.UID+")");
	}
	else
	{
		console.log("Propagating:"+e.type +" to:"+ ctx.parent.UID)
		ctx.parent.onMouseDown( e , ctx.parent );
	}
}

Interactive.onMouseMove = function(e, ctx)
{
	if(!ctx)
		ctx = this.context;

	if( ctx.propagation == 1 )
		return true;

	if( ctx.propagation == 0)
	{
		if(ctx.hasMD)
		{
			//console.log("Mouse Move("+ctx.UID+")");
			var dx = e.clientX - ctx.lx;
			var dy = e.clientY - ctx.ly
			if(ctx.allowMove)
			{
				if( ctx.onMoved )
					ctx.onMoved(dx,dy)
				else
					ctx.move( dx , dy );
			}
			ctx.dragDist += Math.sqrt(dx*dx+dy*dy);
			ctx.lx = e.clientX;
			ctx.ly = e.clientY;
		}
	}
	else
	{
		//console.log("Propagating:"+e.type +" to:"+ ctx.parent.UID)
		ctx.parent.onMouseMove( e , ctx.parent );
	}
}
Interactive.onMouseUp = function( e , ctx )
{

	if(!ctx)
		ctx = this.context;

	if( ctx.propagation == 1 )
		return true;

	if(ctx.propagation == 0)
	{
		if(ctx.hasMD)
		{
			console.log("Mouse Up("+ctx.UID+")"+"<"+e.type+">");
			// if triggered then call handler
			if( ctx.dragDist < 7 && ctx.allowTrigger ) // this is considered a tap / click
				if(	ctx.onTrigger ) // minimal handler call ( no event object generated yet )
				{
					ctx.onTrigger( ctx , e);
					ctx.triggerCount++;
				}
		}
		ctx.hasMD = false;
	}
	else
	{
		ctx.hasMD = false;
		console.log("Propagating:"+e.type +" to:"+ ctx.parent.UID)
		ctx.parent.onMouseUp( e , ctx.parent );
	}
}
Interactive.onMouseOut = function( e , ctx )
{
	if(!ctx)
		ctx = this.context;

	if( ctx.propagation == 1 ) 
		return true;
	
	//determine if point is within boundaries ( if yes ignore )
	var pos = ctx.getPos();
	var w = ctx.getWidth();
	var h = ctx.getHeight();
	//console.log(" px:"+e.clientX+" py:"+e.clientY+" dx:"+pos.x+" dy:"+pos.y+" w:"+w+" h:"+h);
	if( e.clientX >= pos.x && e.clientX < pos.x + w )
		if( e.clientY >= pos.y && e.clientY < pos.y + h )
			return false;
	
	e.type = "mouseup";
	ctx.onMouseUp( e , ctx );
} 

//Mobile interaction
Interactive.touch_points = {};
Interactive.nr_touch_points = 0;
Interactive.mLastDistance = 0;
Interactive.mLastAngle = 0;

Interactive.enableMobile = function ( obj )
{
	//one finger events
	obj.addEventListener('touchmove', this.touchmoved, false);
	obj.addEventListener('touchend', this.touchend, false);
	obj.addEventListener('touchcancel', this.touchend, false);
	obj.addEventListener('touchleave', this.touchend, false);

}

Interactive.disableMobile = function (obj)
{
	//one finger events
	obj.removeEventListener('touchmove', this.touchmoved, false);
	obj.removeEventListener('touchend', this.touchend, false);
	obj.removeEventListener('touchcancel', this.touchend, false);
	obj.removeEventListener('touchleave', this.touchend, false);
}

Interactive.touchstart = function( e , ctx)
{
	if(!ctx)
		ctx = this.context;
	
	if( ctx.propagation == 1 )
		return true;

	//NOT NEEDED AT THE MOMENT
}
Interactive.touchmoved = function( e , ctx)
{
	if( e.touches.length > 1 )
	{
		if(!ctx)
			ctx = this.context;
	
		if( ctx.propagation == 1 )
			return true;

		var p1 = e.touches[0];
		var p2 = e.touches[1];
		var dx = p1.pageX - p2.pageX;
		var dy = p1.pageY - p2.pageY;
		var angle = Math.atan2(dy,dx);
		var dist = Math.sqrt(Math.pow((dx),2) + Math.pow((dy),2));
		
		//ZOOM
		if(!ctx.mLastDistance)
			ctx.mLastDistance = dist;
		else
		{
			if(ctx.onZoomed)
				ctx.onZoomed( dist / ctx.mLastDistance )
			else
				ctx.enlarge( dist / ctx.mLastDistance )
			
			ctx.mLastDistance = dist;
		}
		//ROTATE
		if(!ctx.mLastAngle)
			ctx.mLastAngle = angle
		else
		{
			if(ctx.onRotated)
				ctx.onRotated( angle - ctx.mlastAngle )
			else
				ctx.rotate( angle - ctx.mlastAngle )
			
			ctx.mLastAngle = angle;
		}
	}
}

Interactive.touchend = function( e, ctx){
	
	if(!ctx)
		ctx = this.context;
	
	if( ctx.propagation == 1 )
		return true;

	ctx.mLastDistance = 0;
	ctx.mLastAngle = 0;
}



//INTERACTION CONTROLLERS
//TODO: Integrate mobile events
//		Integrate touch gestures: pinch enlarge, touch rotate
//			for camera
//		Integrate Mac scrolling
//		Integrate mouse wheel scrolling
Interactive.interactive = function( d )
{
	if( d ) 
	{
		if(	!this.isInteractive )
		{
			this.isInteractive = true;
	  		//engage listeners
	  		this.DOMreference.addEventListener('mousedown',this.onMouseDown, false);
	  		this.DOMreference.addEventListener('mousemove',this.onMouseMove, false);
	  		this.DOMreference.addEventListener('mouseover',this.onMouseMove, false);
	  		this.DOMreference.addEventListener('mouseup'  ,this.onMouseUp,   false);
	  		this.DOMreference.addEventListener('mouseout' ,this.onMouseOut,  false);
	  		this.enableMobile ( this.DOMreference );
	  	}
  	}
  	else
  	{
  		if( this.isInteractive )
  		{
	  		this.isInteractive = false;
	  		//disengage listeners
	  		this.DOMreference.removeEventListener('mousedown',this.onMouseDown, false);
		  	this.DOMreference.removeEventListener('mousemove',this.onMouseMove, false);
		  	this.DOMreference.removeEventListener('mouseover',this.onMouseMove, false);
		  	this.DOMreference.removeEventListener('mouseup'  ,this.onMouseUp,   false);
		  	this.DOMreference.removeEventListener('mouseout' ,this.onMouseOut,  false);
		  	this.disableMobile( this.DOMreference )
		}
  	}
}