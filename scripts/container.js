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
requirejs(['TweenMax.min',"interact","app","camera","gem","networking"]);
//
this.containerData = {};
containerData.containerIndex = 0;
containerData.reffTree = {}; //quick reference tree

function findContainer(uid){
	return containerData.reffTree[uid];
}

this.container = function(_properties,_parent)
{
	function addToTree(container) {
		containerData.reffTree[container.UID] = container;
	}
	function removeFromTree(container) {
		delete containerData.reffTree[container.UID];
	}

	this.UID = 0;
	this.DOMreference = 0;
	this.parent = _parent;
	this.discarded = false;
	this.permissions = {};//save:true,connect:false,edit:false,children:true,connect:true};//savable, connectable, extend in future
	//content properties
	this.isLeaf = false;
	this.isApp = false;
	this.isLink = false;
	this.isCamera = false;
	//display properties
	this.angle = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	//TODO:
	this.autoWidth  = 0;//size in percentage out of parent w
	this.autoHeight = 0;//size in percentage out of parent h
	this.autoX      = undefined;//x in percentage from (0,0) of parent
	this.autoY      = undefined;//y in percentage from (0,0) of parent
	this.autoAspect = 1;
	this.preserveAspect = true;//preserves the aspect ratio of the container when scaling to parent
	//TODO: add save code for these properties ( VERY IMPORTANT )
	//todo implement functions for size setting

	this.properties = utils.merge({},_properties,true);

	this.child = 0; //not sure if used anywhere - save and load seem to have had something to do with it
	this.children = {};
	//connections
	this.outgoing = {};
	this.incoming = {};
	//EVENTS
	this.events = {};
	//INTERACTION Rights
	this.onMoved = 0; //this overrides the default container move function ( for camera use )
	this.onMouseDown = 0;
	this.onMouseUp  = 0;

	if(_properties['isLink'])
		this.isLink = true;

	if(_properties['isCamera'])
		this.isCamera = true;

	//warning this code is identical to the one above, use this function above
	this.restyle = function(data)
	{
	  if(!this.DOMreference)
			return;

		//override the old properties
		for( k in data)
			this.properties[k] = data[k];

		if( typeof data['border_size']  == "number" )
			data["border_size"] += "px";
		console.log("Container:Restyling:"+utils.debug(data));
		//Custom Styling
		if(data['class']) //custom CSS styling ()
			this.DOMreference.setAttribute('class',data['class']);

		for( k in {cssText:true,style:true})
			if(data[k]) // custom CSS styling ( works more efficient, only needs CSS )
				this.DOMreference.style.cssText = data[k];

		if(data['background']) //initial descriptor overrides cssText
			this.DOMreference.style.background 	= data['background'];
		if(data['opacity']) //initial descriptor overrides cssText
			this.DOMreference.style.opacity 	= data['opacity'];
		//border props
		if(data['border_size'])
			this.DOMreference.style.borderWidth = (data['border_size'] || "0px");
		if(data['border_color'])
			this.DOMreference.style.borderColor = (data['border_color'] || "0x000000");
		if(data['border_style'])
			this.DOMreference.style.borderStyle = (data['border_type'] || data['border_style'] || "solid");

		if(data['border_radius'])
		{
			var borders = data["border_radius"];
			for( var i=0; i < 4 && borders ; ++i )
			{
				switch(i)
				{
					case 0:this.DOMreference.style.borderTopLeftRadius 		= ( borders[i%borders.length] || "0px");break;
					case 1:this.DOMreference.style.borderTopRightRadius 	= ( borders[i%borders.length] || "0px");break;
					case 2:this.DOMreference.style.borderBottomRightRadius 	= ( borders[i%borders.length] || "0px");break;
					case 3:this.DOMreference.style.borderBottomLeftRadius 	= ( borders[i%borders.length] || "0px");break;
				}
			}
		}
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

	this.setPermission = function(name,value){
		this.permissions[name] = value;
	}

	this.setPermissions = function(perms){
		for( k in perms )
			this.permissions[k] = perms[k];
	}

	this.getPermission = function(name){
		return this.permissions[name];
	}

	this.getPermissions = function(){
		return this.permissions;
	}

	this.hasChildren = function()
	{
			var nrc = 0;
			for( k in this.children )
				return true;
			return false;
	}

	this.addChild = function(properties)
	{
		if(this.permissions.children == false)
			return;

		var reff = new container( properties , this );
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
		if(this.discarded)//already discarded
			return;

		removeFromTree(this);
		//console.log("Container.discard()>"+this.UID);
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
			if(this.DOMreference)
			{
				this.parent.DOMreference.removeChild(this.DOMreference);
				this.parent.removeChild( this.UID ); //remove from child reference of the parent
			}
		}
		else
		{
			document.body.removeChild(this.DOMreference);
		}

		//EVENT
		if( this.events['discardContainer'] || ( GEM.events['discardContainer'] && GEM.events['discardContainer']['_global'] ) )
			GEM.fireEvent({event:"discardContainer",target:this.UID})

		//mark container as unusable
		this.discarded = true;
	}

	this.changeParent = function(parent)
	{
		 if(parent.getPermission('children') == false)
			return;

		var oldP = 0;
		if( parent && this.parent )
		{
			//calculate new position
			var spos = this.local2global(0,0);
			var dpos = parent.local2global(0,0);

			spos.x -= dpos.x;
			spos.y -= dpos.y;

			//handle old parent
			console.log("Container:changeParent()> old parent:"+utils.debug(this.parent)+" this:"+utils.debug(this)+" new Parent:"+utils.debug(parent));
			oldP = this.parent;
			if( this.parent.DOMreference && this.DOMreference )
				this.parent.DOMreference.removeChild(this.DOMreference);

			copy = this;
			delete this.parent.children[this.UID];

			//handle new parent
			copy.parent = parent;
			copy.parent.children[copy.UID] = copy;
			copy.putAt(spos.x,spos.y);

			//fire event
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
	this.addPrimitive = function(descriptor,onready)
	{
		if(!descriptor['type'])
			return false;

		if(this.isLeaf == true)
			this.removePrimitive();

		this.child = document.createElement(descriptor['type']);

		if(descriptor['type'] == "iframe")
			this.child.sandbox = "allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation"

		if(descriptor['content'])
			for( k in descriptor['content'] )
				this.child.setAttribute(k, descriptor['content'][k]);

		if(descriptor['style'])
				this.child.style.cssText = descriptor['style'];

		//size the container to the image
		if(descriptor['adapt_container'] == true)
		{
			var container = this;
			var child = this.child;
			this.child.onload = function()
			{
				container.setWidth( child.clientWidth );
				container.setHeight( child.clientHeight	);

				if(onready)
					onready();
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

					if(onready)
						onready();
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
		this.child.descriptor = descriptor;
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
	this.local2global = function(cx,cy,stopAt){
		var p;
		var node = this;
		var pos = {x:0,y:0};
		while(node){
			if(node.UID == stopAt)
				break;
			if(node.isDisplay)
				p = node.parent.getSurfaceXY(cx,cy);
			else
				p = node.getPos(cx,cy);
			pos.x += p.x;
			pos.y += p.y;
			node = node.parent;
			cx = 0;
			cy = 0;
		}
		return pos;
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
		if( this.angle && (cx != 0.5 || cy != 0.5) ){ //adapt for angle
			var center = this.getPos(0.5,0.5);

			var a = this.angle*Math.PI/180; //radians
			var dx = (pos.x - center.x);
			var dy = (pos.y - center.y);
			a = Math.atan2(dy,dx) + a;
			var r = Math.sqrt( Math.pow(dx,2) + Math.pow(dy,2) );
			pos = {x: (center.x + Math.cos(a)*r), y: (center.y + Math.sin(a)*r) }

		}
		/*if(global)
		{
			var l2g = this.local2global(0,0);
			pos.x += l2g.x;
			pos.y += l2g.y;
		}*/
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

	this.sampleAutoSizePos = function(){ //use to calculate precentages for saving
		if(this.parent == undefined)
			return;

		this.autoAspect = this.getWidth() / this.getHeight();
		this.autoWidth  = this.getWidth() / this.parent.getWidth();
		this.autoHeight = this.getHeight() / this.parent.getHeight();
		var pos = this.getPos(0,0);
		this.autoX      = pos.x / this.parent.getWidth();
		this.autoY      = pos.y / this.parent.getHeight();
	}
	this.updateAutoSizePos = function(){ //use to impose percentages
		if(this.parent == undefined)
			return;

		if(!this.preserveAspect){
			if( this.autoWidth != 0 )
				this.setWidth( this.parent.getWidth() * this.autoWidth );
			if( this.autoHeight != 0 )
				this.setHeight( this.parent.getHeight() * this.autoHeight );
		}
		else { //preserve aspect
			var w = this.parent.getWidth(), h = this.parent.getHeight();

			if( w > h ){ //preserve based on height
				if( this.autoWidth != 0 ) {
					this.setHeight( this.parent.getHeight() * this.autoHeight );
					this.setWidth( this.getHeight() * this.autoAspect );
				}
			} else { //preserve based on width
				if( this.autoHeight != 0 ){
					this.setWidth( this.parent.getWidth() * this.autoWidth );
					this.setHeight( this.getWidth() * (1/this.autoAspect) );
				}
			}
		}

		var pos = this.getPos();
		if( this.autoX != undefined )
			pos.x = this.parent.getWidth() * this.autoX;
		if( this.autoY != undefined)
			pos.y = this.parent.getHeight() * this.autoY;

		this.putAt(pos.x,pos.y,0,0);
		this.autoAspect = this.getWidth() / this.getHeight();
	}
	this.setAutoWidth = function(w){
		this.autoWidth = w;
		this.updateAutoSizePos();
	}
	this.setAutoHeight = function(h){
		this.autoHeight = h;
		this.updateAutoSizePos();
	}
	this.setAutoX = function(x){
		this.autoX = x;
		this.updateAutoSizePos();
	}
	this.setAutoY = function(y){
		this.autoY = y;
		this.updateAutoSizePos();
	}

	this.scale = function(amount,ox,oy,delay)
	{
		if(!ox)
			ox = 0.5;
		if(!oy)
			oy = 0.5;
		if(delay == undefined)
			delay = 0;
		this.scaleX *= amount;
		this.scaleY *= amount;
		TweenMax.to(this.DOMreference,delay,{
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
	this.tween = function(data,d){
		TweenMax.to(this.DOMreference,d||0,data);
	}
	this.link = function (target,descriptor)
	{
		if( this.permissions.connect == false || target.getPermission('connect') == false )
			return;
		//delete already existing link
		if(this.outgoing[target.UID])
			this.unlink(target);

		//create container for link
		var gcp = factory.root;//this.greatestCommonParent(target);
		descriptor['container'].isLink = true;
		var leLink = gcp.addChild( descriptor['container'] );

		this.outgoing[target.UID] = {link:leLink,target:target};
		target.incoming[this.UID] = {link:leLink,target:this};
		//do positioning
		leLink.linkData = descriptor['anchors'];
		leLink.linkData.left = this.UID;
		leLink.linkData.right = target.UID;

		this.maintainLink(target);
		//add callbacks //could use GEM events but it will make it slower
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

		return leLink;//warning deleting link manually messes up the link records of the containers
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
		if(newTarget.getPermission('connect') == false)
			return;

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

			leLink.linkData.right = newTarget.UID;
			//EVENT
			if( this.events['linkChange'] || ( GEM.events['linkChange'] && GEM.events['linkChange']['_global'] ) )
				GEM.fireEvent({event:"linkChange",target:ctx,old_owner:oldTarget,new_owner:newTarget,link:leLink})
		}
	}
//WARNING: this code assumes the structure of the presentation has a base and a root camera
	this.maintainLink = function(target)
	{
		if(this.outgoing[target.UID])
		{
			var leLink = this.outgoing[target.UID]['link'];

			var acPos = this.local2global(leLink.linkData['left_container_xreff'],leLink.linkData['left_container_yreff'],2);
			var bcPos = target.local2global(leLink.linkData['right_container_xreff'],leLink.linkData['right_container_yreff'],2);
			var alPos = leLink.local2global(leLink.linkData['left_link_xreff'],leLink.linkData['left_link_yreff'],2);
			var blPos = leLink.local2global(leLink.linkData['right_link_xreff'],leLink.linkData['right_link_yreff'],2);

			var bps = target.local2global(0,0,2);
			//console.log("connecting: A"+acPos.x+"|"+acPos.y+" B:"+bcPos.x+"|"+bcPos.y+" bps:"+bps.x+"|"+bps.y+" ldata"+utils.debug(leLink.linkData));
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
	this.addEventListener = function( event , handler , context ) {
		if(!context)
			context = this;

		if(!this.events[event])
			this.events[event] = 1;
		else
			this.events[event]++;

		GEM.addEventListener( event, this, handler, context );
	}
	this.removeEventListener = function( event , handler , context ) {
		if(!context)
			context = this;

		if(this.events[event])
			this.events[event]--;

		GEM.removeEventListener( event, context, handler );
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
		host.appName = app;
		host.appPath = 'plugins/'+app+'/';
		host.appFullPath = requirejs.s.contexts._.config.baseUrl+host.appPath;

		if(! AppMgr.loadedApps[app] )
		{
			//lookup app
			requirejs(['plugins/'+app+"/main"],function(){
				//AppMgr.loadedApps[app] = eval(app);
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
	/////////////////////////////////////////////////////////////////////////////////////
	//this.load = function(parent)
	//{
		//if(this.parent)
			//return false;
//////////////////////////////////////////////////////////////////////////////////////////
		//enforce UID preservation
		if( this.properties['UID'] ) {
			var victim = findContainer(this.properties['UID']);
			if( victim ) {
				if( !victim.getPermission('noOverride') )//conflicts with existing container - abort if container can't be overriden
					return false;
				else
					victim.discard(); //override old container
			}

			this.UID = this.properties['UID']
			if(containerData.containerIndex < this.UID)
				containerData.containerIndex = this.UID + 1;
		}
		else
			this.UID = containerData.containerIndex++;
		//store child object
		if(this.parent)
			this.parent.children[ this.UID ] = this;
		//DOM manipulation
		var DOMtype = "div";
		if(typeof(this.properties['type']) == "string")
			DOMtype = this.properties['type'];

		if(this.properties['_DOMreference'])
			this.DOMreference = this.properties['_DOMreference'];
		else
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

		if(!this.DOMreference.style.position && !this.properties['autopos'])
			this.DOMreference.style.position 	= 'absolute';

		if(!this.DOMreference.style.overflow && this.properties['autosize'] != true )
			this.DOMreference.style.overflow 	= "hidden";

		if(this.properties['x'])
		{
			if(!this.properties['autopos'])
				this.DOMreference.style.position 	= 'absolute';
			this.DOMreference.style.left 		= this.properties['x'];
		}

		if(this.properties['y'])
		{
			if(!this.properties['autopos'])
				this.DOMreference.style.position 	= 'absolute';
			this.DOMreference.style.top 		= this.properties['y'];
		}

		if(this.properties['bottom'])
			this.DOMreference.style.bottom = this.properties['bottom'];

		if(this.properties['right'])
			this.DOMreference.style.right = this.properties['right'];

		if(this.properties['left'])
			this.DOMreference.style.left = this.properties['left'];

		if(this.properties['top'])
			this.DOMreference.style.left = this.properties['top'];

		if(this.properties['background']) //initial descriptor overrides cssText
			this.DOMreference.style.background 	= this.properties['background'];
		if(this.properties['opacity']) //initial descriptor overrides cssText
				this.DOMreference.style.opacity 	= this.properties['opacity'];
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
			for( var i=0; i < 4 && borders ; ++i )
			{
				switch(i)
				{
					case 0:this.DOMreference.style.borderTopLeftRadius 		= ( borders[i%borders.length] || "0px");break;
					case 1:this.DOMreference.style.borderTopRightRadius 	= ( borders[i%borders.length] || "0px");break;
					case 2:this.DOMreference.style.borderBottomRightRadius 	= ( borders[i%borders.length] || "0px");break;
					case 3:this.DOMreference.style.borderBottomLeftRadius 	= ( borders[i%borders.length] || "0px");break;
				}
			}
		}
		//isolated containers do not get included in the standard container hierarchy
		if(!this.properties['*isolated'])
		{
			if( this.parent )
				this.parent.DOMreference.appendChild(this.DOMreference);
			else //this is the master object ( root )
				document.body.appendChild(this.DOMreference);
		}
		else{ //add the isolated container
			if(!this.parent)
				this.parent = document.body;
			this.parent.appendChild(this.DOMreference);
		}

		this.properties['width']  = this.getWidth();
		this.properties['height'] = this.getHeight();

		//inherit and set new specific permissions
		if(this.UID == 0 )
			this.setPermission('noOverride',true);
		if(this.parent)
			this.setPermissions(this.parent.getPermissions());
		this.setPermissions(_properties['permissions']);

		//EVENT
		addToTree(this);
		if( this.events['loadContainer'] || ( GEM.events['loadContainer'] && GEM.events['loadContainer']['_global'] ) )
			GEM.fireEvent({event:"loadContainer",target:this})

		return this;
		//return true;
	//}
}
