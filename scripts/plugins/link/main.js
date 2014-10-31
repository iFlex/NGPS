loadAppCode("link",function(data){
	this.config = {interface:"none"};
	this.parent = data['parent'];
	this.temp = 0;
	this.active = false;
	
	this.cDescriptor = {};
	var linkParent = 0;
	var linkData = {};
	this.descriptor = {};
	this.isActive = false;

	this.toggle = function(ctx)
	{
		var app = ctx.app;
		app.isActive = !app.isActive;
		//change icon
		if(app.isActive)
			ctx.DOMreference.innerHTML = "<img src='"+app.parent.appFullPath+"resources/0.png"+"' style='width:16px;height:16px'></img>";
		else
			ctx.DOMreference.innerHTML = "<img src='"+app.parent.appFullPath+"resources/1.png"+"' style='width:16px;height:16px'></img>";
	}
	
	this.trigger = function(data)
	{	
		if(!this.isActive)
		{
			this.temp.hide();
			return;
		}

		var target = data['target'];
		if( target.UID == 0 || (linkParent && target.UID == linkParent.UID ) )//clicked on root
		{
			this.temp.hide();
			return;
		}
		var e = data['original_event'];
		var actualPos = factory.root.screenToDisplayCoord(e.clientX,e.clientY);
		var localPos = target.getLocalPos(actualPos.x,actualPos.y);
		console.log("Link maker:"+utils.debug(target)+" last:"+linkParent);
		
		if(!linkParent)
		{
			linkData = {
				left_container_xreff:0,
				left_container_yreff:0,
				right_container_xreff:0.5,
				right_container_yreff:0.5,
				left_link_xreff:0,
				left_link_yreff:0.5,
				right_link_xreff:1,
				right_link_yreff:0.5,
			}

			linkParent = target;
			linkData['left_container_xreff'] = localPos.x / target.getWidth();
			linkData['left_container_yreff'] = localPos.y / target.getHeight();
			
			this.temp.changeParent(target);
			this.temp.putAt(localPos.x,localPos.y,0.5,0.5);
			this.temp.show(); 
		}
		else
		{
			linkData['right_container_xreff'] = localPos.x / target.getWidth();
			linkData['right_container_yreff'] = localPos.y / target.getHeight();	
			
			var cDescriptor = Descriptors.containers["rounded_rect"];
			cDescriptor['height'] = 5;
			linkParent.link(target,{
				container:cDescriptor,
				anchors:linkData
			});
			linkParent = 0;
			this.temp.hide();
		}
	}

	this.init = function() //called only one when bound with container
	{
		this.parent.onTrigger = this.toggle;

		this.temp  = factory.newContainer({x:0,y:0,width:32,height:32},'link_dot',factory.root);
		this.temp.hide();
		
		GEM.addEventListener("triggered",0,"trigger",this);
		
		this.toggle(this.parent);
	}
	this.shutdown = function() //called only when app is unloaded from container
	{
		GEM.removeEventListener("triggered",0,"trigger",this);
	}
});