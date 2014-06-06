/**
*	NGPS container edit interface
*	Author: Milorad Liviu Felix
*	31 May 2014 20:31 GMT
*/
this.Editor = function(){
	this.initiated= 0;
	this.target=0;
	this.target_properties = {};
	this.root=0;
	this.components= {};
	//descriptors
	this.descriptors = {};
	this.descriptors['root'] = {x:0,y:0,width:100,height:100,background:"transparent",border_size:2,border_style:"double",border_color:"#ff0a0d",border_radius:["10px"]};
	this.descriptors['button_upleft'] = {x:"0%",y:"0%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_upmid'] = {x:"50%",y:"0%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_upright'] = {right:"0%",y:"0%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};

	this.descriptors['button_dnleft'] = {x:"0%",bottom:"0%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_dnmid'] = {x:"50%",bottom:"0%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_dnright'] = {right:"0%",bottom:"0%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};

	this.descriptors['button_midleft'] = {x:"0%",y:"50%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_midright'] = {right:"0%",y:"50%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_midbottom'] = {x:"50%",bottom:"0%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};

	this.init =   function()
	{ 
		if(this.inited)
			return;

		this.inited = true;
		this.root = factory.createContainer( this.descriptors['root'] );
		
		this.components['rotate'] = factory.createContainer(this.descriptors['button_upleft'],this.root);
		this.components['rotate'].onMoved = this.rotate;

		this.components['more'] = factory.createContainer(this.descriptors['button_upmid'],this.root);
		this.components['delete'] = factory.createContainer(this.descriptors['button_upright'],this.root);
		this.components['delete'].onTrigger = this.eDelete;

		this.components['expandRight'] = factory.createContainer(this.descriptors['button_midright'],this.root);
		this.components['expandRight'].onMoved = this.expandRight;

		this.components['expandLeft'] = factory.createContainer(this.descriptors['button_midleft'],this.root);
		this.components['expandLeft'].onMoved = this.expandLeft;

		this.components['expandBottom'] = factory.createContainer(this.descriptors['button_midbottom'],this.root);
		this.components['expandBottom'].onMoved= this.expandBottom;
		
		this.components['expandCornerRight'] = factory.createContainer(this.descriptors['button_dnright'],this.root);
		this.components['expandCornerRight'].onMoved = this.expandCornerRight;

		this.components['expandCornerLeft'] = factory.createContainer(this.descriptors['button_dnleft'],this.root);
		this.components['expandCornerLeft'].onMoved = this.expandCornerLeft;

		this.hide();
	}
	this.hide =   function()
	{ 
		if(this.target)
		{
			this.target.changeParent(this.root.parent);
			//add properties back
			var pos = this.root.getPos();
			if(this.target_properties)
			{
				this.target.putAt(pos.x+this.target_properties['dx'],pos.y+this.target_properties['dy'])
				this.target.propagation = this.target_properties['propagation'];
				this.target.setAngle(this.root.angle);
			}
			//
			delete this.target;
			delete this.target_properties;
		}
		factory.root.ccancel("focusOn");
		this.root.hide();
	}
	this.show =   function(target,options)
	{ 
		if(this.target)
			this.hide();
		
		this.target = target;
		this.root.setWidth( this.target.getWidth() * 1.1 );
		this.root.setHeight( this.target.getHeight() * 1.1 );
		//angle
		this.root.setAngle(this.target.angle);
		this.target.setAngle(0);

		this.root.econtext = this;

		var pos = target.getPos();
		var dx = this.target.getWidth() * 0.1 /2;
		var dy = this.target.getHeight() * 0.1 /2;

		this.root.putAt( pos.x -  dx, pos.y - dy);

		this.root.DOMreference.style.overflow = "";
		for( k in this.components )
		{
			this.components[k].setWidth(dx);
			this.components[k].setHeight(dy);
			this.components[k].DOMreference.style.zIndex = 2;
		}
		
		//save properties:
		this.target_properties = {}
		this.target_properties['dx'] = dx 
		this.target_properties['dy'] = dy
		this.target_properties['propagation'] = target.propagation;
		
		this.target_properties['zIndex'] = target.DOMreference.style.zIndex;
		target.DOMreference.style.zIndex = 0;

		target.propagation = 1;
		//
		target.putAt(dx,dy)

		this.root.changeParent(target.parent);
		target.changeParent(this.root);

		this.root.show();
		if(options['focusOn'])
			factory.root.cfocusOn(this.root);
	}
	this.eDelete = function(ctx)
	{
		var target = ctx.parent.econtext.target;
		var parent = ctx.parent;

		parent.hide();
		target.discard();
	}
	this.expandLeft = function(dx,dy,ctx)
	{
		dx = -dx;
		var target = ctx.parent.econtext.target;
		var parent = ctx.parent;

		parent.setWidth(parent.getWidth()+dx);
		parent.move(-dx,0);
		target.setWidth(target.getWidth()+dx);
	}
	this.expandRight = function(dx,dy,ctx)
	{
		var target = ctx.parent.econtext.target;
		var parent = ctx.parent;

		parent.setWidth(parent.getWidth()+dx);
		target.setWidth(target.getWidth()+dx);
	}
	this.expandRight = function(dx,dy,ctx)
	{
		var target = ctx.parent.econtext.target;
		var parent = ctx.parent;

		parent.setWidth(parent.getWidth()+dx);
		target.setWidth(target.getWidth()+dx);
	}
	this.expandCornerRight = function(dx,dy,ctx)
	{
		var target = ctx.parent.econtext.target;
		var parent = ctx.parent;

		parent.setWidth(parent.getWidth()+dx);
		parent.setHeight(parent.getHeight()+dy);

		target.setWidth(target.getWidth()+dx);
		target.setHeight(target.getHeight()+dy);
	}
	this.expandCornerLeft = function(dx,dy,ctx)
	{
		dx = -dx;
		//dy = -dy;
		var target = ctx.parent.econtext.target;
		var parent = ctx.parent;

		parent.setWidth(parent.getWidth()+dx);
		parent.setHeight(parent.getHeight()+dy);
		parent.move(-dx,0);

		target.setWidth(target.getWidth()+dx);
		target.setHeight(target.getHeight()+dy);
	}
	this.expandBottom  = function (dx,dy,ctx)
	{
		var target = ctx.parent.econtext.target;
		var parent = ctx.parent;

		parent.setHeight(parent.getHeight()+dy);
		target.setHeight(target.getHeight()+dy);
	}
	this.rotate = function(dx,dy,ctx)
	{
		var multiplier = 100;
		var target = ctx.parent.econtext.target;
		var parent = ctx.parent;
		var posParent = parent.getPos();
		var posTarget = target.getPos();
		var angleb4 = Math.atan2(posParent.y - posTarget.y,posParent.x - posTarget.x);
		var angle   = Math.atan2(posParent.y - (posTarget.y+dy),posParent.x - (posTarget.x+dx));
		console.log(angleb4 + " " + angle + " "+(angleb4 - angle) );

		parent.rotate((angle - angleb4)*multiplier);
		//target.rotate((angle - angleb4)*multiplier);
	}
}
function _Edit_expandRight (dx,dy)
{
	this.target.setWidth(this.target.getWidth()+dx);
}
function _Edit_expandTop (dx,dy)
{
	this.target.setHeight(this.target.getHeight()+dy);
	this.target.move(0,-dy);
}
function _Edit_expandBottom (dx,dy)
{
	this.target.setHeight(this.target.getHeight()+dy);
}
function _Edit_expandCornerRight (dx,dy)
{
	this.target.setWidth(this.target.getWidth()+dx);
	this.target.setHeight(this.target.getHeight()+dy);
}
