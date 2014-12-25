loadAppCode("edit/components/link3",function(data){
	this.config = {interface:"none"};
	this.parent = data['parent'];
	this.left = 0;
	this.right = 0;
	this.temp = 0;
	this.active = true;

	this.cDescriptor = {};
	this.linkData = {};
	this.descriptor = {};
	this.isActive = false;

	this.toggle = function(ctx)
	{
		var app = ctx.app;
		app.isActive = !app.isActive;
		//change icon
		if(app.isActive)
			ctx.DOMreference.innerHTML = "<i class='glyphicon glyphicon-th-list'></i>";
		else
			ctx.DOMreference.innerHTML = "<i class='glyphicon glyphicon-lock'></i>";
	}
	this.onMouseOut = function(data)
	{

	}
	this.onMouseMove = function(data)
	{
		if(!this.isActive)
			return;

		var target = data['target']
		var e = data['original_event'];

		this.temp.putAt(e.clientX,e.clientY,0.5,0.5);
		if( (this.left && this.left.UID != target.UID) && (this.temp && this.temp.UID != target.UID) && (target.UID != factory.root.UID) )
		{	this.right = target;
			console.log("right:"+this.right.UID);
		}
	}
	this.onMouseUp = function(data)
	{
		if(!this.isActive)
			return;

		var target = data['target'];
		console.log(" luid:"+this.left.UID+" t:"+target.UID);
		if(!this.left || (this.left && this.left.UID == target.UID))
			return;


		this.temp.hide();
		this.left.unlink(this.temp);

		if(this.right)
		{
			console.log("TOUCHDOWN!:"+this.left.UID+" - "+this.right.UID);
			//compute link position
			var e = data['original_event'];
			var localPos = target.getLocalPos(e.clientX,e.clientY);
			this.linkData['right_container_xreff'] = localPos.x / target.getWidth();
			this.linkData['right_container_yreff'] = localPos.y / target.getHeight();
			//link
			this.left.link(this.right,this.descriptor);
			//start edit interface

		}
	}
	this.onMouseDown = function(data)
	{
		if(!this.isActive)
			return;

		var target = data['target'];
		this.left = target;

		if(this.temp.UID == target.UID )
			return;

		this.linkData = {
			left_container_xreff:0,
			left_container_yreff:0,
			right_container_xreff:0.5,
			right_container_yreff:0.5,
			left_link_xreff:0,
			left_link_yreff:0.5,
			right_link_xreff:1,
			right_link_yreff:0.5,
		}
		this.cDescriptor = Descriptors.containers["rounded_rect"];
		this.cDescriptor['height'] = 5;
		this.descriptor = {
			container:this.cDescriptor,
			anchors:this.linkData
		};

		var e = data['original_event'];
		var localPos = target.getLocalPos(e.clientX,e.clientY);

		this.linkData['left_container_xreff'] = localPos.x / target.getWidth();
		this.linkData['left_container_yreff'] = localPos.y / target.getHeight();

		this.temp.show();
		this.temp.putAt(e.clientX,e.clientY,0.5,0.5);

		target.link(this.temp,this.descriptor);
		//deal with interaction;
		target.onMouseUp(e,target);
		//this.temp.onMouseDown(e,this.temp);
	}
	this.init = function() //called only one when bound with container
	{
		this.parent.onTrigger = this.toggle;

		this.temp  = factory.root.addChild({x:0,y:0,width:10,height:10})
		this.temp.hide();

		GEM.addEventListener("mouseDown",0,"onMouseDown",this);
		GEM.addEventListener("mouseUp",0,"onMouseUp",this);
		GEM.addEventListener("mouseMove",0,"onMouseMove",this);
		//GEM.addEventListener("mouseOut",0,"onMouseOut",this);

		this.toggle(this.parent);
	}
	this.run = function()	//called whenever the container is triggered
	{

	}
	this.suspend = function() //called whenever the container looses focus ( or gets out of view )
	{

	}
	this.shutdown = function() //called only when app is unloaded from container
	{
		GEM.removeEventListener("mouseDown",0,"onMouseDown",this);
		GEM.removeEventListener("mouseUp",0,"onMouseUp",this);
		GEM.removeEventListener("mouseMove",0,"onMouseMove",this);
		//GEM.removeEventListener("mouseOut",0,"onMouseOut",this);
	}
	this.show = function() //shows app
	{

	}
	this.hide = function() //hides app
	{

	}
});
