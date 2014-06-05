/**
*	NGPS container edit interface
*	Author: Milorad Liviu Felix
*	31 May 2014 20:31 GMT
*/
this.edit = function(){
	this.initiated= 0;
	this.target=0;
	this.target_properties = {};
	this.root=0;
	this.components= {};
	//descriptors
	this.descriptors = {};
	this.descriptors['root'] = {x:0,y:0,width:100,height:100,background:"transparent",border_size:5,border_style:"solid",border_color:"0xFA0000"};
	this.descriptors['button'] = {x:0,y:0,width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
	
	this.init =   function()
	{ 
		if(this.inited)
			return;

		this.inited = true;
		this.root = factory.root.addChild( this.descriptors['root'] );
		this.components['rotate'] = this.root.addChild(this.descriptors['button']);
		this.components['more'] = this.root.addChild(this.descriptors['button']);
		this.components['delete'] = this.root.addChild(this.descriptors['button']);
		this.components['expandRigth'] = this.root.addChild(this.descriptors['button']);
		this.components['expandLeft'] = this.root.addChild(this.descriptors['button']);
		this.components['expandBottom'] = this.root.addChild(this.descriptors['button']);
		this.components['expandCornerRight'] = this.root.addChild(this.descriptors['button']);
		this.components['expandCornerLeft'] = this.root.addChild(this.descriptors['button']);
	},
	this.hide =   function()
	{ 
		if(this.target)
		{
			this.root.hide();
			delete this.target;
		}
	},
	this.show =   function(target)
	{ 
		if(this.target)
			this.hide();
		
		this.target = target;
		//save properties:
		//
		this.root.changeParent(target.parent);
		target.changeParent(this.root);

		this.root.show();
	},
}
