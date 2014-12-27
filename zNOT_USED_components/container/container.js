/**
*	NGPS Container Class
*   Author: Milorad Liviu Felix
*	10 May 2014 01:57 GMT
*	Dependencies:
*	GSAP library:
*		TweenLite Module
*/
this.containerData = {};
containerData.containerIndex = 0;
this.container = function(properties)
{
	this.UID = 0;
	this.name = "noname";
	this.DOMreference = 0;
	this.parent = 0;
	//display properties
	this.angle = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.properties = properties || {};
	//content properties
	this.isLeaf = false;
	this.child = 0;
	this.children = {};
	//INTERACTION
	//What to do with interaction events( In some cases it's necessary to pass them to the parent )
	this.propagation = 0; 
	// 0 no propagation; 
	// 1 Native propagation to parent ( Native Browser Propagation ); 
	// 2 Manual propagation to parent ( Strict )

	//INTERACTION Rights
	this.allowMove = true;
	this.allowTrigger = true;
	this.onMoved = 0; //this overrides the default container move function ( for camera use )
	//interaction internals
	this.hasMD = false;
	this.lx = 0;
	this.ly = 0;
	this.dragDist = 0;
	this.triggerCount = 0;

	//DOM manipulation
	this.load = function(parent)
	{

		if(this.parent)
			return false;

		this.UID = containerData.containerIndex++;
		this.DOMreference = document.createElement("div");
		this.DOMreference.setAttribute('id',this.UID);

		//testing
		this.DOMreference.style.width = (this.properties['width'] || "1")+"px";
		this.DOMreference.style.height = (this.properties['height'] || "1")+"px";
		this.DOMreference.style.position = 'absolute';
		this.DOMreference.style.overflow = "hidden";
		this.DOMreference.style.left = (this.properties['x'] || "0")+"px";
		this.DOMreference.style.top = (this.properties['y'] || "0")+"px";
		this.DOMreference.style.background = this.properties['background'] || "transparent";
		
		//border props
		this.DOMreference.style.borderWidth = (this.properties['border_size'] || "0")+"px";
		this.DOMreference.style.borderColor = (this.properties['border_color'] || "0x000000");
		this.DOMreference.style.borderStyle = (this.properties['border_type'] || "solid");
		//add reference of the current object in the DOM object
		this.DOMreference.context = this;

		var borders = this.properties["border_radius"];

		for( var i=0; i < 4; ++i )
		{
			switch(i)
			{
				case 0:this.DOMreference.style.borderTopLeftRadius = (( borders && borders[i%borders.length] ) || "0px");break;
				case 1:this.DOMreference.style.borderTopRightRadius = (( borders && borders[i%borders.length] ) || "0px");break;
				case 2:this.DOMreference.style.borderBottomRightRadius = (( borders && borders[i%borders.length] ) || "0px");break;
				case 3:this.DOMreference.style.borderBottomLeftRadius = (( borders && borders[i%borders.length] ) || "0px");break;
			}
		}

		if(parent)
		{
			//append
			this.parent = parent;
			parent.DOMreference.appendChild(this.DOMreference);
		}
		else //this is the master object ( root )
			document.body.appendChild(this.DOMreference);
		
		return true;
	}
	
	//EXTENTION Posibilities ( Turn Object into Camera )
	this.extend = function( extensions )
	{
		for( k in extensions )
		{
			if( this.hasOwnProperty(k) )
				delete this[k];

			this[k] = extensions[k];
		}
	}

	this.addChild = function(properties)
	{
		this.children[ containerData.containerIndex ] = new container( properties );
		var reff = this.children[ containerData.containerIndex ] 
		reff.load( this );
		return reff;
	}
	
	this.removeChild = function(UID)
	{
		if( this.children[UID] )
			delete this.children[UID];
	}

	this.discard = function(bitch)
	{

		if(this.parent)
		{
			this.parent.DOMreference.removeChild(this.DOMreference);
			this.parent.removeChild( this.UID ); //remove from child reference of the parent
		}
		else
		{
			document.body.removeChild(this.DOMreference);
			delete this;
		}
	}

	this.changeParent = function(parent)
	{
	
		if( parent && this.parent )
		{
			//handle old parent
			if( this.parent.DOMreference && this.DOMreference )
				this.parent.DOMreference.removeChild(this.DOMreference);
			
			copy = this;
			delete this.parent.children[this.UID];

			//handle new parent
			copy.parent = parent;
			copy.parent.children[copy.UID] = copy;
			if( copy.parent.DOMreference && copy.DOMreference )
				copy.parent.DOMreference.appendChild(copy.DOMreference);
			//WARNING: think about position when changing parents

			return true;
		}
		return false;
	}

	this.addPrimitive = function(descriptor)
	{
		if(!descriptor['type'])
			return false;

		this.isLeaf = true;
		this.child = document.createElement(descriptor['type']);
		
		if(descriptor['content'])
			for( k in descriptor['content'] )
				this.child.setAttribute(k, descriptor['content'][k]);

		if(descriptor['style'])
			for( k in descriptor['style'] )
				this.child.style.k = descriptor['style'][k];

		this.child.pointerEvents = "none";
		this.DOMreference.appendChild(this.child);
	}

	this.show = function()
	{
		this.DOMreference.style.display = "block";
	}

	this.hide = function()
	{
		this.DOMreference.style.display = "none";
	}

	//getters
	this.getPos   = function()
	{	
		return { x:this.DOMreference.offsetLeft , y:this.DOMreference.offsetTop };
	}

	this.getWidth = function(w)
	{
		return this.DOMreference.clientWidth;
	} 

	this.getHeight = function(h)
	{
		return this.DOMreference.clientHeight;
	} 

	//setters
	this.setWidth = function(w)
	{
		TweenMax.to(this.DOMreference,0,{
			width:w,
		});
	} 

	this.setHeight = function(h)
	{
		TweenMax.to(this.DOMreference,0,{
			height:h,
		});
	}
	this.setAngle = function(angle)
	{
		this.angle = angle;
		TweenMax.to(this.DOMreference,0,{
			rotation:angle,
		});
	}

	//actuators
	this.move = function(dx,dy)
	{
		this.DOMreference.style.left = this.DOMreference.offsetLeft + dx + "px";
		this.DOMreference.style.top  = this.DOMreference.offsetTop  + dy + "px";
	}

	this.scale = function(amount)
	{
		this.scaleX = amount;
		this.scaleY = amount;
		TweenMax.to(this.DOMreference,0,{
			scaleX:amount,
			scaleY:amount,
		});
	}

	this.rotate = function(dangle)
	{
		this.setAngle(this.angle + dangle);	
	}

	//INTERACTION
	this.onMouseDown = function( e , ctx )
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
	
	this.onMouseMove = function(e, ctx)
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
	this.onMouseUp = function( e , ctx )
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
						alert("event:"+e);
						//ctx.onTrigger( ctx , e );
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
	this.onMouseOut = function( e , ctx )
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

	//INTERACTION CONTROLLERS
	this.interactive = function( d )
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
			}
	  	}
	}
}
