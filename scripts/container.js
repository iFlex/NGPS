/**
*	NGPS Container Class
*   Author: Milorad Liviu Felix
*	10 May 01:57 GMT
*	Dependencies:
*	GSAP library:
*		TweenLite Module
*
*	Available events:
*		loadContainer
*		addChild
*		removeChild
*		discardContainer
*		hideContainer
*		showContainer
*		changeParent
*		changeWidth
*		changeHeight
*		changeAngle
*		changePosition
*		link
*		unlink
*		linkChange
*		appLoaded
*/
//include dependencies
//requirejs(['TweenMax.min',"interact","app","camera","gem"]);
requirejs(['TweenMax.min',"interact","app","productionCamera","gem"]);
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
	//FLAGS
	this.permissions = {save:true,connect:true};//savable, connectable, extend in future
	//DOM manipulation
	//TODO: Add possibility to  style with CSS
	this.load = function(parent)
	{
		if(this.parent)
			return false;

		this.UID = containerData.containerIndex++;
		var DOMtype = "div";
		if(typeof(this.properties['type']) == "string")
			DOMtype = this.properties['type'];

		this.DOMreference = document.createElement(DOMtype);
		this.DOMreference.setAttribute('id',this.UID);

		//convert numbers to vaild CSS pixel quantity
		for( key in {"width":0,"height":0,"x":0,"y":0,"border_size":0} )
		{
			if( typeof this.properties[key]  == "number" )
				this.properties[key] += "px";	
		}

		//Custom Styling
		if(this.properties['class']) //custom CSS styling ()
			this.DOMreference.setAttribute('class',this.properties['class']);
		
		for( k in {cssText:true,style:true})
			if(this.properties[k]) // custom CSS styling ( works more efficient, only needs CSS )
				this.DOMreference.style.cssText = this.properties[k];

		//Default Styling 
		if(this.properties['width'])
			this.DOMreference.style.width 		= this.properties['width'];
		if(this.properties['height'])
			this.DOMreference.style.height 		= this.properties['height'];

		if(!this.DOMreference.style.position)
			this.DOMreference.style.position 	= 'absolute';
		
		if(!this.DOMreference.style.overflow && this.properties['dynamic_size'] != true )
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

		
		if(this.properties['background']) //initial descriptor overrides cssText
			this.DOMreference.style.background 	= this.properties['background'];
		
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
		//isolated containers do not get included in the standard container hierarchy 
		if(!this.properties['*isolated'])
		{
			if(parent)
			{
				//append
				this.parent = parent;
				parent.DOMreference.appendChild(this.DOMreference);
			}
			else //this is the master object ( root )
				document.body.appendChild(this.DOMreference);
		}

		this.properties['width'] = this.getWidth();
		this.properties['height']= this.getHeight();

		//EVENT
		if( this.events['loadContainer'] || ( GEM.events['loadContainer'] && GEM.events['loadContainer']['_global'] ) )
			GEM.fireEvent({event:"loadContainer",target:this})

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
		//inherit permissions
		if(!properties['permissions'])
			properties['permissions'] = this.permissions;

		this.children[ containerData.containerIndex ] = new container( properties );
		var reff = this.children[ containerData.containerIndex ] 
		reff.load( this );

		//EVENT
		if( this.events['addChild'] || ( GEM.events['addChild'] && GEM.events['addChild']['_global'] ) )
			GEM.fireEvent({event:"addChild",target:this,child:reff})

		return reff;
	}
	
	this.removeChild = function(UID)
	{
		if( this.children[UID] )
		{
			//EVENT
			if( this.events['removeChild'] || ( GEM.events['removeChild'] && GEM.events['removeChild']['_global'] ) )
				GEM.fireEvent({event:"removeChild",target:this,childID:UID})

			delete this.children[UID];
		}
	}

	this.discard = function()
	{
		var uid = this.UID;
		//discard all children
		for( k in this.children )
			this.children[k].discard();
		
		//unload app
		if(this.adestroy)
			this.adestroy();
		
		//discard all links related to this container
		this.unlinkAll();

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

		//EVENT
		if( this.events['discardContainer'] || ( GEM.events['discardContainer'] && GEM.events['discardContainer']['_global'] ) )
			GEM.fireEvent({event:"discardContainer",target:uid})
	}

	this.changeParent = function(parent)
	{
		var oldP = 0;
		if( parent && this.parent )
		{
			//handle old parent
			oldP = this.parent;
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

			//EVENT
			if( this.events['changeParent'] || ( GEM.events['changeParent'] && GEM.events['changeParent']['_global'] ) )
				GEM.fireEvent({event:"changeParent",target:this,newParent:parent,oldParent:oldP})

			return true;
		}
		return false;
	}
	//TODO: add styling and event enabling and disablig for child
	//		add event dispatching for apps that run inside in case that is needed
	this.addPrimitive = function(descriptor)
	{
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
		if(descriptor['adapt_container'] == true)
		{
			var container = this;
			var child = this.child;
			this.child.onload = function()
			{
				container.setWidth( child.clientWidth );
				container.setHeight( child.clientHeight	);
			}
		}
		else
		{

			if(descriptor['adapt_content'] == true)
			{
				var w = this.getWidth();
				var h = this.getHeight();
				var child = this.child;
				this.child.onload = function()
				{	
					//adapt content to container
					var rapw = child.width / w; 
					var raph = child.height / h;
					var diff = 1;
					
					if( rapw > 1)
						diff = 1/rapw;
					if( raph > 1 && (1/raph < diff) )
						diff = 1/raph;

					var nw = child.clientWidth * diff;
					var nh = child.clientHeight * diff;
					child.width = nw;
					child.height = nh;
				}
				 
			}
			else
			{
				if(descriptor['width'])
					this.setWidth(descriptor['width'])
		
				if(descriptor['height'])
					this.setHeight(descriptor['height'])
			}
		}

		//this.child.pointerEvents = "none";
		this.child.ondragstart = function() { return false; };
		this.DOMreference.appendChild(this.child);
		this.isLeaf = true;
		return this.child;
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
		//EVENT
		if( this.events['showContainer'] || ( GEM.events['showContainer'] && GEM.events['showContainer']['_global'] ) )
			GEM.fireEvent({event:"showContainer",target:this})
	}

	this.hide = function()
	{
		this.DOMreference.style.display = "none";
		//EVENT
		if( this.events['hideContainer'] || ( GEM.events['hideContainer'] && GEM.events['hideContainer']['_global'] ) )
			GEM.fireEvent({event:"hideContainer",target:this})
	}
	//NOT RELEVANT
	this.redraw = function (){
		this.hide();
		this.show();
	}

	//getters
	this.local2global = function(x,y){
		function getGlobalPos(node)
		{
			if(node)
			{
				var before = getGlobalPos(node.parent);
				var now = node.getPos(0,0,false);
				if(before)
				{
					now.x += before.x;
					now.y += before.y;
				}
				return now;
			}
			return 0;
		}
		var pos = getGlobalPos(this.parent);
		var ret = {x:x,y:y};
		if(pos)
		{
			ret.x+=pos.x;
			ret.y+=pos.y;
		}
		return ret;
	}
	
	this.global2local = function(x,y){
		var origin = this.local2global(0,0);
		return { x: x - origin.x, y: y - origin.y};
	}

	//TODO: make it work for other browsers than chrome
	this.getPos   = function(cx,cy,global)
	{	
		if(!cx)
			cx = 0;
		if(!cy)
			cy = 0;

		var pos = { x: (this.DOMreference.offsetLeft + this.getWidth()*cx), y: (this.DOMreference.offsetTop + this.getHeight()*cy) };
		if(global)
		{
			var l2g = this.local2global(0,0);
			pos.x += l2g.x;
			pos.y += l2g.y;
		}
		return pos;
	}
	this.getWidth = function(pure)
	{
		var  w = this.DOMreference.clientWidth
		var  a =  2*parseInt(getComputedStyle(this.DOMreference,null).getPropertyValue("border-width"));
		if(a)
			w+=a;
		if(pure)
			return w*this.scaleX;
		return w;
	} 

	this.getHeight = function(pure)
	{
		var h = this.DOMreference.clientHeight
		var a = 2*parseInt(getComputedStyle(this.DOMreference,null).getPropertyValue("border-width"))
		if(a)
			h+=a;
		if(pure)
			return h*this.scaleX;
		return h;
	}

	this.getPureWidth = function()
	{
		return this.getWidth(true);
	} 

	this.getPureHeight = function()
	{
		return this.getHeight(true)
	}

	this.getCenter = function() //deprecated, don't use
	{
		return this.getPos(0.5,0.5);
	}

	this.getLocalPos = function(x,y)
	{
		var pos = this.getPos();
		console.log("Getting local pos ID:"+this.UID+" x:"+x+" y:"+y+" px:"+pos.x+" py:"+pos.y)
		return {x: x - pos.x, y: y - pos.y};
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

		this.maintainLinks();
		//EVENT
		if( this.events['changeWidth'] || ( GEM.events['changeWidth'] && GEM.events['changeWidth']['_global'] ) )
			GEM.fireEvent({event:"changewidth",target:this})
	} 

	this.setHeight = function(h)
	{
		TweenMax.to(this.DOMreference,0,{
			height:h,
		});
		if(this.isLeaf == true )
			this.child.height = h;
		//this.redraw();

		this.maintainLinks();
		//EVENT
		if( this.events['changeHeight'] || ( GEM.events['changeHeight'] && GEM.events['changeHeight']['_global'] ) )
			GEM.fireEvent({event:"changeHeight",target:this})
	}
	this.setAngle = function(angle,ox,oy)
	{
		if(!ox)
			ox = 0.5;
		if(!oy)
			oy = 0.5;

		this.angle = angle;
		TweenMax.to(this.DOMreference,0,{
			rotation:angle,
			transformOrigin:((ox*100)+"% "+(oy*100)+"%")
		});

		this.maintainLinks();
		//EVENT
		if( this.events['changeAngle'] || ( GEM.events['changeAngle'] && GEM.events['changeAngle']['_global'] ) )
			GEM.fireEvent({event:"changeAngle",target:this})
	}
	this.putAt = function(	x, y, refX, refY, global)
	{
		//if(this.DOMreference.style.position != 'absolute')
		//	this.DOMreference.style.position = 'absolute';

		if(!refX)
			refX = 0;
		
		if(!refY)
			refY = 0;

		if(global)
		{
			var pos = this.global2local(x,y);
			x = pos.x;
			y = pos.y;
		}

		this.DOMreference.style.left = x - refX * this.getWidth() + "px";
		this.DOMreference.style.top  = y - refY * this.getHeight() + "px";

		this.maintainLinks();
		//EVENT
		if( this.events['changePosition'] || ( GEM.events['changePosition'] && GEM.events['changePosition']['_global'] ) )
			GEM.fireEvent({event:"changePosition",target:this})
	}

	//actuators
	this.move = function(dx,dy,noevent)//SLOW  ~ 1 ms to exec
	{
		//if(this.DOMreference.style.position != 'absolute')
		//	this.DOMreference.style.position = 'absolute';

		this.DOMreference.style.left = this.DOMreference.offsetLeft + dx + "px";
		this.DOMreference.style.top  = this.DOMreference.offsetTop  + dy + "px";

		this.maintainLinks();
		//EVENT
		if( this.events['changePosition'] || ( GEM.events['changePosition'] && GEM.events['changePosition']['_global'] ) )
			GEM.fireEvent({event:"changePosition",target:this})
	}

	this.scale = function(amount,ox,oy)
	{
		if(!ox)
			ox = 0.5;
		if(!oy)
			oy = 0.5;
		
		this.scaleX *= amount;
		this.scaleY *= amount;
		TweenMax.to(this.DOMreference,0,{
			scaleX:this.scaleX,
			scaleY:this.scaleY,
			transformOrigin:((ox*100)+"% "+(oy*100)+"%")
		});
	}
	this.enlarge = function(amount)
	{
		var oldW = this.getWidth()
        var oldH = this.getHeight()
		var w = oldW * amount;
		var h = oldH * amount;
		
        this.setWidth(w);
		this.setHeight(h);
        this.move((oldW-w)/2,(oldH-h)/2);
		this.maintainLinks();
	}

	this.rotate = function(dangle,ox,oy)
	{
		this.setAngle(this.angle + dangle,ox,oy);	
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
		var gcp = factory.root;//this.greatestCommonParent(target);
		var leLink = gcp.addChild( descriptor['container'] );
		leLink.isLink = true;

		this.outgoing[target.UID] = {link:leLink,target:target};
		target.incoming[this.UID] = {link:leLink,target:this};
		//do positioning
		leLink.linkData = descriptor['anchors'];
		this.maintainLink(target);
		//add listeners
		this.onMoved = function(dx,dy){
			this.move(dx,dy);
			this.maintainLinks();
		};
		target.onMoved = function(dx,dy){
			target.move(dx,dy);
			target.maintainLinks();	
		}

		//EVENT
		if( this.events['link'] || ( GEM.events['link'] && GEM.events['link']['_global'] ) )
			GEM.fireEvent({event:"link",target:this,other:target,link:leLink})
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

			//EVENT
			if( this.events['unlink'] || ( GEM.events['unlink'] && GEM.events['unlink']['_global'] ) )
				GEM.fireEvent({event:"unlink",target:this,other:target})
		}
	}
	this.unlinkAll = function(){
		for( k in this.outgoing )
			this.unlink( this.outgoing[k]['target'] )
			
		for( t in this.incoming )
		{
			var trg = this.incoming[t]['target'];
			trg.unlink( this );
		}
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

			//EVENT
			if( this.events['linkChange'] || ( GEM.events['linkChange'] && GEM.events['linkChange']['_global'] ) )
				GEM.fireEvent({event:"linkChange",target:ctx,old_owner:oldTarget,new_owner:newTarget,link:leLink})
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
	this.maintainLinks = function()
	{
		for( k in this.outgoing )
			this.maintainLink( this.outgoing[k]['target'] )
			
		for( t in this.incoming )
		{
			var trg = this.incoming[t]['target'];
			trg.maintainLink( this );
		}

		for( c in this.children )
			this.children[c].maintainLinks();
	}
	//EVENTs support
	this.addEventListener = function( event , handler , context )
	{
		if(!context)
			context = this;
		this.events[event] = true;
		GEM.addEventListener( event, this, handler, context );
	}
	this.removeEventListener = function( event , handler , context )
	{
		if(!context)
			context = this;
		delete this.events[event];
		GEM.removeEventListener( event, this, handler, context );
	}
	//App support
	//TODO: read app descriptor and load accordingly
	this.loadApp = function(app,passToApp)
	{
		//if loading over a previous app
		if(this.isApp == true)
			this.adestroy();

		//REQUIRES: AppMgr to be defined by the time this function is called
		var host = this;
		if(! AppMgr.loadedApps[app] )
		{
			//lookup app
			requirejs(['plugins/'+app+"/main"],function(){
				//AppMgr.loadedApps[app] = eval(app);
				host.appName = app;
				host.appPath = 'plugins/'+app+'/';
				host.appFullPath = requirejs.s.contexts._.config.baseUrl+host.appPath;
				ldApp(AppMgr.loadedApps[app]);
			});
		}
		else
			ldApp(AppMgr.loadedApps[app]);

		function ldApp(app)
		{
			host.extend(AppCtl);
			host.ainit(app,passToApp);

			if(host.events["appLoaded"])
				GEM.fireEvent({event:"appLoaded",target:host});
			
		}
	}
}
/*
BAD IDEA, global function event handler is a bottleneck
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
*/