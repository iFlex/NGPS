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
	this.descriptors['button_upright'] = {x:"90%",y:"0%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};

	this.descriptors['button_dnleft'] = {x:"0%",y:"90%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_dnmid'] = {x:"50%",y:"90%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_dnright'] = {x:"90%",y:"90%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};

	this.descriptors['button_midleft'] = {x:"0%",y:"50%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_midright'] = {x:"90%",y:"50%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	this.descriptors['button_midright'] = {x:"50%",y:"90%",width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};

	this.init =   function()
	{ 
		if(this.inited)
			return;

		this.inited = true;
		this.root = factory.root.addChild( this.descriptors['root'] );
		this.components['rotate'] = this.root.addChild(this.descriptors['button_upleft']);
		this.components['more'] = this.root.addChild(this.descriptors['button_upmid']);
		this.components['delete'] = this.root.addChild(this.descriptors['button_upright']);
		this.components['expandRigth'] = this.root.addChild(this.descriptors['button_midright']);
		this.components['expandLeft'] = this.root.addChild(this.descriptors['button_midleft']);
		this.components['expandBottom'] = this.root.addChild(this.descriptors['button_midbottom']);
		this.components['expandCornerRight'] = this.root.addChild(this.descriptors['button_dnright']);
		this.components['expandCornerLeft'] = this.root.addChild(this.descriptors['button_dnleft']);
		this.hide();
	}
	this.hide =   function()
	{ 
		if(this.target)
		{
			this.target.changeParent(this.root.parent);
			//add properties back
			var pos = this.root.getPos();
			this.target.putAt(pos.x+this.target_properties['dx'],pos.y+this.target_properties['dy'])
			this.target.propagation = this.target_properties['propagation'];
			//
			delete this.target;
			delete this.target_properties;
		}
		this.root.hide();
	}
	this.show =   function(target,options)
	{ 
		if(this.target)
			this.hide();
		
		this.target = target;
		this.root.setWidth( this.target.getWidth() * 1.1 );
		this.root.setHeight( this.target.getHeight() * 1.1 );
		var pos = target.getPos();
		var dx = this.target.getWidth() * 0.1 /2;
		var dy = this.target.getHeight() * 0.1 /2;

		this.root.putAt( pos.x -  dx, pos.y - dy);
		for( k in this.components )
		{
			this.components[k].setWidth(dx);
			this.components[k].setHeight(dy);
		}
		
		//save properties:
		this.target_properties = {}
		this.target_properties['dx'] = dx 
		this.target_properties['dy'] = dy
		this.target_properties['propagation'] = target.propagation;
		target.propagation = 1;
		//
		target.putAt(dx,dy)

		this.root.changeParent(target.parent);
		target.changeParent(this.root);

		this.root.show();
		if(options['focusOn'])
			factory.root.cfocusOn(this.root);
	}
}
