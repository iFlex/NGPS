/**
*	NGPS Interactive System
*	Author: Milorad Liviu Felix
*	5 July 2014 18:17 GMT
*
*	Requirements:
*		Must be applied to an existing Container Object
*
*	Available events:
*		mouseDown
*		mouseMove
*		mouseUp
*		mouseOut
*		triggered

*	Available callbacks:
*		onMouseDown
*		onMouseUp
*		onMouseOut
*		onMouseMove
*		onTrigger
*		onMoved
*/
var Interactive = {}
//What to do with interaction events( In some cases it's necessary to pass them to the parent )
Interactive.propagation = 0;
// 0 no propagation;
// 1 Native propagation to parent ( Native Browser Propagation );
// 2 Manual propagation to parent ( Strict )
//TODO: when mouse exits root area cancel Origin and hasMD ( so that when the mouse comes back does not resume the previous drag )
//Classic Interaction
Interactive.hasMD = false;
Interactive.lx = 0;
Interactive.ly = 0;
Interactive.dragDist = 0;
Interactive.triggerCount = 0;
Interactive.allowUserMove = true;
Interactive.allowUserTrigger = true;
//smooth continuous interaction
this.Interaction = {}
Interaction.origin = 0;

Interaction.pmo = function(e){
	//prevent mobile overscroll
	if(e.preventDefault)
		e.preventDefault();
}

Interactive._onMouseDown = function( e , ctx )
{
	if(!ctx)
		ctx = this.context;

	if( ctx.propagation == 1 )
		return true;

	if(e.stopPropagation)
		e.stopPropagation();
	else
		e.cancelBubbling = true;

	if( ctx.propagation == 0 )
	{

		ctx.lx = e.pageX;
		ctx.ly = e.pageY;
		ctx.dragDist = 0;
		ctx.hasMD = true;

		var center = ctx.getCenter();
		ctx.natAngle = Math.atan2(center.y - e.pageY,center.x - e.pageX);

		if(ctx.onMouseDown)
			ctx.onMouseDown(ctx,e);
		//console.log("Mouse Down("+ctx.UID+")");
		//smooth continuous interaction
		if(!Interaction.origin)
		{
			Interaction.origin = ctx;
			//console.log("origin:"+utils.debug(Interaction.origin));
		}
		//EVENT
		if( ctx.events['mouseDown'] || ( GEM.events['mouseDown'] && GEM.events['mouseDown']['_global'] ) )
			GEM.fireEvent({event:"mouseDown",target:ctx,original_event:e})
	}
	else
	{
		if(ctx.parent)
			ctx.parent._onMouseDown( e , ctx.parent );
	}
}

Interactive._onMouseMove = function(e, ctx)
{
	if(!ctx)
		ctx = this.context;

	//do not bring back, find workarounds if necessary
	if(e.stopPropagation)
		e.stopPropagation();

	//smooth continuous interaction
	if( Interaction.origin && ctx.UID != Interaction.origin.UID )
	{
		Interaction.origin._onMouseMove( e , Interaction.origin )
		return;
	}

	if( ctx.propagation == 1 )
		return true;

	if( ctx.propagation == 0)
	{
		if(ctx.hasMD)
		{
			//console.log("Mouse Move("+ctx.UID+")");
			var dx = e.pageX - ctx.lx;
			var dy = e.pageY - ctx.ly
			if(ctx.allowUserMove)
			{
				if( ctx.onMoved )
					ctx.onMoved(dx,dy,ctx)
				else
					ctx.move( dx , dy );
			}
			ctx.dragDist += Math.sqrt(dx*dx+dy*dy);

			//check if Natural movement is on
			//EXPERIMENTAL
			if(ctx.allowNaturalMove)
			{
				var hWindow = ctx.getHeight()*0.5;
				var wWindow = ctx.getWidth() *0.5;
				if( e.pageX > (ctx.getWidth() - wWindow) ||  e.pageX < wWindow )
					if( e.pageY < hWindow || e.pageY > (ctx.getHeight() - hWindow) )
					{
						var forceDir = Math.atan2(dy,dx);
						var center = ctx.getCenter();
						var angle = Math.atan2(center.y - e.pageY,center.x - e.pageX);
						var amount = forceDir - angle / 10;
						ctx.rotate(amount);
						console.log("fd:"+forceDir+" a:"+angle+" am:"+amount);
					}
			}
			ctx.lx = e.pageX;
			ctx.ly = e.pageY;
		}
		//EVENT
		if( ctx.events['mouseMove'] || ( GEM.events['mouseMove'] && GEM.events['mouseMove']['_global'] ) )
			GEM.fireEvent({event:"mouseMove",target:ctx,original_event:e})
	}
	else
	{
		//console.log("Propagating:"+e.type +" to:"+ ctx.parent.UID)
		if(ctx.parent)
			ctx.parent._onMouseMove( e , ctx.parent );
	}
}
Interactive._onMouseUp = function( e , ctx )
{
	if(!ctx)
		ctx = this.context;

	if( ctx.propagation == 1 )
		return true;

	if(ctx.propagation == 0)
	{
		if( Interaction.origin && ctx.UID == Interaction.origin.UID )
		{
			// if triggered then call handler
			if( ctx.dragDist < 7 && ctx.allowUserTrigger ) // this is considered a tap / click
			{
				if(	ctx.onTrigger )
					ctx.onTrigger( ctx , e);

				if( ctx.events['triggered'] || ( GEM.events['triggered'] && GEM.events['triggered']['_global'] ) )
					GEM.fireEvent({event:"triggered",target:ctx,original_event:e,nativeEvent:e})//TODO: delete nativeEvent after making sure it's not used

				ctx.triggerCount++;
			}

		}
		//EVENT
		if( ctx.events['mouseUp'] || ( GEM.events['mouseUp'] && GEM.events['mouseUp']['_global'] ) )
			GEM.fireEvent({event:"mouseUp",target:ctx,original_event:e})

		ctx.hasMD = false;
		delete ctx.natAngle;

		if(ctx.onMouseUp)
			ctx.onMouseUp(ctx,e);
	}
	else
	{
		//propagate
		ctx.hasMD = false;
		if(ctx.parent)
			ctx.parent._onMouseUp( e , ctx.parent );
	}
	Interaction.origin.hasMD = false;
	Interaction.origin = 0;
}
Interactive._onMouseOut = function( e , ctx )
{
	if(!ctx)
		ctx = this.context;

	if( ctx.propagation == 1 )
		return true;

	/*
	//determine if point is within boundaries ( if yes ignore )
	var pos = ctx.getPos();
	var w = ctx.getWidth();
	var h = ctx.getHeight();
	//console.log(" px:"+e.pageX+" py:"+e.pageY+" dx:"+pos.x+" dy:"+pos.y+" w:"+w+" h:"+h);
	if( e.pageX >= pos.x && e.pageX < pos.x + w )
		if( e.pageY >= pos.y && e.pageY < pos.y + h )
			return false;

	e.type = "mouseup";
	ctx.onMouseUp( e , ctx );*/
	//EVENT
	if( ctx.events['mouseOut'] || ( GEM.events['mouseOut'] && GEM.events['mouseOut']['_global'] ) )
		GEM.fireEvent({event:"mouseOut",target:ctx,original_event:e})
}
Interactive.cancelMouse = function( e, ctx)
{
	if(!ctx)
		ctx = this.context;

	if( ctx.propagation == 1 )
		return true;

	ctx.hasMD = false;

	if( ctx.propagation != 0 )
	{
		ctx.hasMD = false;
		if(ctx.parent)
			ctx.parent._onMouseUp( e , ctx.parent );
	}
	Interaction.origin = null;
}
//Mobile interaction
Interactive.mLastDistance = 0;
Interactive.mLastAngle = 0;

Interactive.touchstart = function( e , ctx)
{
	if(!ctx)
		ctx = this.context;

	if( ctx.propagation == 1 )
		return true;

  ctx._onMouseDown(e,ctx);
  //NOT NEEDED AT THE MOMENT
}
//TODO: sort out propagation for this
Interactive.touchmoved = function( e , ctx)
{
  if(!ctx)
      ctx = this.context;

	Interaction.pmo(e);

	if( e.touches.length > 1 )
	{
		ctx.cancelMouse(e,ctx)
		if( ctx.propagation == 1 )
			return true;

		if(e.stopPropagation)
			e.stopPropagation();

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
			var degAngle = (angle - ctx.mLastAngle) * 180 / 3.14;
			if(ctx.onRotated)
				ctx.onRotated( degAngle )
			else
				ctx.rotate( degAngle )

			ctx.mLastAngle = angle;

			ctx.mLastAngle = angle;
		}
	}
  else
  	ctx._onMouseMove(e,ctx);
}

Interactive.touchend = function( e, ctx){

	if(!ctx)
		ctx = this.context;

	if( ctx.propagation == 1 )
		return true;

	ctx.mLastDistance = 0;
	ctx.mLastAngle = 0;
    ctx._onMouseUp(e,ctx);
}

Interactive.enableMobile = function ( obj )
{
	//one finger events
  obj.ontouchstart = this.touchstart;
	obj.ontouchmove = this.touchmoved;
	obj.ontouchend = this.touchend;
	obj.ontouchcancel = this.touchend;
	obj.ontouchleave = this.touchend;
}

Interactive.disableMobile = function (obj)
{
	//one finger events
  obj.ontouchstart = null;
	obj.ontouchmove = null;
	obj.ontouchend = null;
	obj.ontouchcancel = null;
	obj.ontouchleave = null;
}

Interactive.onClick = function(e,ctx){
	if(!ctx)
		ctx = this.context;
	if( ctx.onTrigger )
		ctx.onTrigger( ctx , e );
	ctx.triggerCount++;
}
//INTERACTION CONTROLLERS
//TODO: Integrate mobile events
//		Integrate touch gestures: pinch enlarge, touch rotate
//			for camera
//		Integrate Mac scrolling
//		Integrate mouse wheel scrolling
Interactive.interactive = function( d )
{
	if(this.getPermission("interact") == false)
		return;

  if( d )
	{
        if(	!this.isInteractive )
		{
			this.isInteractive = true;
	  		//engage listeners
	  		if(platform.isMobile)
	  			this.enableMobile ( this.DOMreference );
	  		else
	  		{
					this.DOMreference.addEventListener('mousedown',this._onMouseDown, false);
	  			this.DOMreference.addEventListener('mousemove',this._onMouseMove, false);
	  			this.DOMreference.addEventListener('mouseover',this._onMouseMove, false);
	  			this.DOMreference.addEventListener('mouseup'  ,this._onMouseUp,   false);
	  			this.DOMreference.addEventListener('mouseout' ,this._onMouseOut,  false);
	  		}
        }
  	}
  	else
  	{
  		if( this.isInteractive )
  		{
	  		this.isInteractive = false;
	  		//disengage listeners
	  		if(platform.isMobile)
	  			this.disableMobile( this.DOMreference );
	  		else
	  		{
	  			this.DOMreference.removeEventListener('mousedown',this._onMouseDown, false);
		  		this.DOMreference.removeEventListener('mousemove',this._onMouseMove, false);
		  		this.DOMreference.removeEventListener('mouseover',this._onMouseMove, false);
		  		this.DOMreference.removeEventListener('mouseup'  ,this._onMouseUp,   false);
		  		this.DOMreference.removeEventListener('mouseout' ,this._onMouseOut,  false);
		 	}
		}
  }
}
Interactive.pauseInteraction = function( d )
{
	//TODO: think over what kind of functionaly this should offer
	if( d )
	{
        if(	this.isInteractive )
		{
			this.savedFunctions = {};
			this.savedFunctions.onMouseDown = this.onMouseDown;
			this.savedFunctions.onMouseMove = this.onMouseMove;
			this.savedFunctions.onMouseUp   = this.onMouseUp;
			this.savedFunctions.onMouseOut  = this.onMouseOut;
			this.savedFunctions.onTrigger   = this.onTrigger;
			this.savedFunctions.onMoved     = this.onMoved;

			this.onMouseDown = 0;
			this.onMouseMove = 0;
			this.onMouseUp = 0;
			this.onMouseOut = 0;
			this.onTrigger = 0;
			this.onMoved = function(){};
        }
  	}
  	else
  	{
  		if( this.isInteractive )
  		{
  			for( k in this.savedFunctions )
  				this[k] = this.savedFunctions[k];
		}
  	}
}
