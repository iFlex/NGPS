/**
*	NGPS Container Class
*   Author: Milorad Liviu Felix
*	10 May 01:57 GMT
*	Dependencies:
*	GSAP library:
*		TweenLite Module
*/
//include dependencies
requirejs(['TweenMax.min',"interact","app","camera","gem"]);
//
this.containerData = {};
containerData.containerIndex = 0;
this.container = function(properties)
{
	this.UID = 0;
	this.DOMreference = 0;
	this.parent = 0;
	//display properties
	this.angle = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.properties = properties || {};
	//content properties
	this.isLeaf = false;
	this.isApp = false;
	this.isLink = false;
	this.child = 0;
	this.children = {};
	//connections
	this.outgoing = {};
	this.incoming = {};
	//EVENTS
	this.events = {};
	//INTERACTION Rights
	this.allowMove = true;
	this.allowTrigger = true;
	this.onMoved = 0; //this overrides the default container move function ( for camera use )
	this.onMouseDown = 0;
	this.onMouseUp  = 0;
	//DOM manipulation
	//TODO: Add possibility to  style with CSS
	this.load = function(parent)
	{

		if(this.parent)
			return false;

		this.UID = containerData.containerIndex++;
		this.DOMreference = document.createElement("div");
		this.DOMreference.setAttribute('id',this.UID);

		//convert numbers to vaild CSS pixel quantity
		for( key in {"width":0,"height":0,"x":0,"y":0,"border_size":0} )
		{
			if( typeof this.properties[key]  == "number" )
				this.properties[key] += "px";	
		}

		//Custom Styling
		if(this.properties['class']) //custom CSS styling
			this.DOMreference.setAttribute('class',this.properties['class']);

		//Default Styling 
		if(this.properties['width'])
			this.DOMreference.style.width 		= this.properties['width'];
		if(this.properties['height'])
			this.DOMreference.style.height 		= this.properties['height'];

		if(!this.DOMreference.style.position)
			this.DOMreference.style.position 	= 'absolute';
		if(!this.DOMreference.style.overflow)
			this.DOMreference.style.overflow 	= "hidden";

		if(this.properties['x'])
		{
			this.DOMreference.style.position 	= 'absolute';
			this.DOMreference.style.left 		= this.properties['x'];
		}

		if(this.properties['y'])
		{
			this.DOMreference.style.position 	= 'absolute';
			this.DOMreference.style.top 		= this.properties['y'];
		}

		if(this.properties['bottom'])
			this.DOMreference.style.bottom = this.properties['bottom'];

		if(this.properties['right'])
			this.DOMreference.style.right = this.properties['right'];

		if(this.properties['left'])
			this.DOMreference.style.left = this.properties['left'];

		
		if(!this.DOMreference.style.background)
			this.DOMreference.style.background 	= this.properties['background'] || "transparent";
		
		//border props
		if(!this.DOMreference.style.borderWidth)
			this.DOMreference.style.borderWidth = (this.properties['border_size'] || "0px");
		if(!this.DOMreference.style.borderColor)
			this.DOMreference.style.borderColor = (this.properties['border_color'] || "0x000000");
		if(!this.DOMreference.style.borderStyle)
			this.DOMreference.style.borderStyle = (this.properties['border_type'] || this.properties['border_style'] || "solid");
		//add reference of the current object in the DOM object
		this.DOMreference.context = this;

		if(this.properties['border_radius'])
		{
			var borders = this.properties["border_radius"];
			for( var i=0; i < 4; ++i )
			{
				switch(i)
				{
					case 0:this.DOMreference.style.borderTopLeftRadius 		= (( borders && borders[i%borders.length] ) || "0px");break;
					case 1:this.DOMreference.style.borderTopRightRadius 	= (( borders && borders[i%borders.length] ) || "0px");break;
					case 2:this.DOMreference.style.borderBottomRightRadius 	= (( borders && borders[i%borders.length] ) || "0px");break;
					case 3:this.DOMreference.style.borderBottomLeftRadius 	= (( borders && borders[i%borders.length] ) || "0px");break;
				}
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
		
		this.properties['width'] = this.getWidth();
		this.properties['height']= this.getHeight();
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
	this.strip = function( extensions )
	{
		for( k in extensions )
			if( this.hasOwnProperty(k) )
				delete this[k];
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
		//unload app
		if(this.adestroy)
			this.adestroy();

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
	//TODO: add styling and event enabling and disablig for child
	//		add event dispatching for apps that run inside in case that is needed
	this.addPrimitive = function(descriptor)
	{
		console.log("AddPrimitive called on "+this.UID+" isLeaf:"+this.isLeaf)
		if(!descriptor['type'])
			return false;
		
		if(this.isLeaf == true)
			this.removePrimitive();

		this.child = document.createElement(descriptor['type']);

		if(descriptor['content'])
			for( k in descriptor['content'] )
				this.child.setAttribute(k, descriptor['content'][k]);

		if(descriptor['style'])
			for( k in descriptor['style'] )
				this.child.style.k = descriptor['style'][k];

		//size the container to the image
		if(descriptor['adapt_size'])
		{
			console.log("Adapting container to content")
			var container = this;
			var child = this.child;
			this.child.onload = function()
			{
				console.log("Setting parent container size:"+child.clientWidth+" x "+child.clientHeith );
				container.setWidth( child.clientWidth );
				container.setHeight( child.clientHeight	);
			}
		}
		else
		{
			if(descriptor['width'])
				this.setWidth(descriptor['width'])
			else
				this.child.width = this.getWidth();

			if(descriptor['height'])
				this.setHeight(descriptor['height'])
			else
				this.child.height = this.getHeight();
		}

		//this.child.pointerEvents = "none";
		this.child.ondragstart = function() { return false; };
		this.DOMreference.appendChild(this.child);
		this.isLeaf = true;
	}
	
	this.removePrimitive = function()
	{
		if(this.isLeaf)
		{
			this.isLeaf = false;
			if(this.child)
			{
				this.DOMreference.removeChild(this.child);
				delete this.child;
			}
			console.log(" remove primitive called ");
		}
	}

	this.show = function()
	{
		this.DOMreference.style.display = "block";
	}

	this.hide = function()
	{
		this.DOMreference.style.display = "none";
	}
	this.redraw = function (){
		this.hide();
		this.show();
	}

	//getters
	//TODO: Fix bad actual size reporting problem
	this.getPos   = function(cx,cy)
	{	
		if(!cx)
			cx = 0;
		if(!cy)
			cy = 0;

		return { x: (this.DOMreference.offsetLeft + this.getWidth()*cx), y: (this.DOMreference.offsetTop + this.getHeight()*cy) };
	}
	this.getWidth = function()
	{
		return  ( this.DOMreference.clientWidth + 2*parseInt(getComputedStyle(this.DOMreference,null).getPropertyValue("border-width")) ) * this.scaleX;
	} 

	this.getHeight = function()
	{
		return ( this.DOMreference.clientHeight + 2*parseInt(getComputedStyle(this.DOMreference,null).getPropertyValue("border-width")) ) * this.scaleY;
	}

	this.getCenter = function()
	{
		return { x: this.DOMreference.offsetLeft + this.getWidth()/2 , y: this.DOMreference.offsetTop + this.getHeight()/2 };
	}

	//setters
	this.setWidth = function(w)
	{
		TweenMax.to(this.DOMreference,0,{
			width:w,
		});
		if(this.isLeaf == true )
			this.child.width = w;
		//this.redraw();
	} 

	this.setHeight = function(h)
	{
		TweenMax.to(this.DOMreference,0,{
			height:h,
		});
		if(this.isLeaf == true )
			this.child.height = h;
		//this.redraw();
	}
	this.setAngle = function(angle)
	{
		this.angle = angle;
		TweenMax.to(this.DOMreference,0,{
			rotation:angle,
		});
	}
	this.putAt = function(	x, y, refX , refY )
	{
		//if(this.DOMreference.style.position != 'absolute')
		//	this.DOMreference.style.position = 'absolute';

		if(!refX)
			refX = 0;
		
		if(!refY)
			refY = 0;

		this.DOMreference.style.left = x - refX * this.getWidth() + "px";
		this.DOMreference.style.top  = y - refY * this.getHeight() + "px";
	}

	//actuators
	this.move = function(dx,dy,noevent)//SLOW  ~ 1 ms to exec
	{
		//if(this.DOMreference.style.position != 'absolute')
		//	this.DOMreference.style.position = 'absolute';

		this.DOMreference.style.left = this.DOMreference.offsetLeft + dx + "px";
		this.DOMreference.style.top  = this.DOMreference.offsetTop  + dy + "px";

		if(this.events["moved"] && !noevent)
			GEM.fireEvent({event:"moved",target:this,dx:dx,dy:dy});
	}

	this.scale = function(amount)
	{
		this.scaleX *= amount;
		this.scaleY *= amount;
		TweenMax.to(this.DOMreference,0,{
			scaleX:this.scaleX,
			scaleY:this.scaleY,
		});
	}
	this.enlarge = function(amount)
	{
		var w = this.getWidth()*amount;
		var h = this.getHeight()*amount;
		this.setWidth(w);
		this.setHeight(h);
	}

	this.rotate = function(dangle)
	{
		this.setAngle(this.angle + dangle);	
	}
	//CONNections
	this.getAncestors = function( node )
	{
		if( !node.parent )
		{
			var response = [];
			response[0] = node;
			return response;
		}
		
		var response = this.getAncestors(node.parent);
		response[response.length] = node;
		return response;
	} 
	this.greatestCommonParent = function ( target )
	{
		var thisAncestors = this.getAncestors( this );
		var targAncestors = this.getAncestors( target );

		var len = (thisAncestors.length < targAncestors.length) ? thisAncestors.length : targAncestors.length;
		var i = 0;
		for(  ; i < len ; ++i )
			if(thisAncestors[i] != targAncestors[i] )
			{
				i--;
				break;
			}
		
		return thisAncestors[i];
	}
	this.link = function (target,descriptor)
	{
		//delete already existing link
		if(this.outgoing[target.UID])
			this.unlink(target);

		//create container for link
		var gcp = this.greatestCommonParent(target);
		var leLink = gcp.addChild( descriptor['container'] );
		leLink.isLink = true;

		this.outgoing[target.UID] = {link:leLink,target:target};
		target.incoming[this.UID] = {link:leLink,target:this};
		//do positioning
		leLink.linkData = descriptor['anchors'];
		this.maintainLink(target);
		//add listeners
		this.addEventListener("moved",maintainLinks);
		this.addEventListener("resized",maintainLinks);
		target.addEventListener("moved",maintainLinks);
		target.addEventListener("resized",maintainLinks);
	}
	this.unlink = function (target)
	{
		//delete form incoming
		if(target.incoming[this.UID])
			delete target.incoming[this.UID];
		//delete from outgoing
		if(this.outgoing[target.UID])
		{
			this.outgoing[target.UID]['link'].discard();
			delete this.outgoing[target.UID];
		}
		//remove listeners
		this.removeEventListener("moved",maintainLinks);
		this.removeEventListener("resized",maintainLinks);
		target.removeEventListener("moved",maintainLinks);
		target.removeEventListener("resized",maintainLinks);
	}
	this.changeLinkTarget = function(oldTarget,newTarget)
	{
		//delete form incoming (oldTarget)
		if(oldTarget.incoming[this.UID])
			delete oldTarget.incoming[this.UID];
		//change outgoing
		if(this.outgoing[oldTarget.UID])
		{
			var leLink = this.outgoing[oldTarget.UID]['link'];
			var gcp = this.greatestCommonParent(target)
			leLink.changeParent(gcp);

			this.outgoing[newTarget.UID] = {link:leLink,target:newTarget};
			delete this.outgoing[oldTarget.UID];
		}		
	}
	this.maintainLink = function(target)
	{
		if(this.outgoing[target.UID])
		{
			var leLink = this.outgoing[target.UID]['link'];	
			var acPos = this.getPos(leLink.linkData['left_container_xreff'],leLink.linkData['left_container_yreff']);
			var bcPos = target.getPos(leLink.linkData['right_container_xreff'],leLink.linkData['right_container_yreff']);
			var alPos = leLink.getPos(leLink.linkData['left_link_xreff'],leLink.linkData['left_link_yreff']);
			var blPos = leLink.getPos(leLink.linkData['right_link_xreff'],leLink.linkData['right_link_yreff']);

			var dx = bcPos.x - acPos.x;
			var dy = bcPos.y - acPos.y;
			var dist = Math.sqrt(dx*dx + dy*dy);
			var cAngle = Math.atan2( dy , dx );
			//set angle
			leLink.setAngle( cAngle * 180 / Math.PI ); //degrees
			//set correct width
			leLink.setWidth(dist);
			//put at correct possition according to left parent
			leLink.putAt(acPos.x+dx/2,acPos.y+dy/2,0.5,0.5);
			//	leLink.linkData['left_link_xreff'],leLink.linkData['left_link_yreff']);
		}
	}
	//EVENTs support
	this.addEventListener = function( event , handler )
	{
		this.events[event] = true;
		GEM.addEventListener( event, this, handler );
	}
	this.removeEventListener = function( event , handler )
	{
		delete this.events[event];
		GEM.removeEventListener( event, this, handler);
	}
	//App support
	//TODO: read app descriptor and load accordingly
	this.loadApp = function(app)
	{
		//if loading over a previous app
		if(this.isApp == true)
			this.adestroy();

		//REQUIRES: AppMgr to be defined by the time this function is called
		var host = this;
		if(! AppMgr.loadedApps[app] )
		{
			//lookup app
			requirejs(['plugins/'+app+"/main.js"],function(){
				AppMgr.loadedApps[app] = eval(app);
				ldApp(AppMgr.loadedApps[app]);
			});
		}
		else
			ldApp(AppMgr.loadedApps[app]);

		function ldApp(app)
		{
			host.extend(AppCtl);
			host.ainit(app);
			
			if(this.events["appLoaded"])
				GEM.fireEvent({event:"appLoaded",target:this});
			
		}
	}
}
function maintainLinks(data)
{
	var ctx = data['target'];
	for( k in ctx.outgoing )
		ctx.maintainLink( ctx.outgoing[k]['target'] )
		
	for( t in ctx.incoming )
	{
		var trg = ctx.incoming[t]['target'];
		trg.maintainLink( ctx );
	}
}