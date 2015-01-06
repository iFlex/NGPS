//TODO: fix linker issues with large containers ( it links with absurd positions)
this.Editor = this.Editor || {};

loadAppCode("edit/components/link",function(data){
	this.config = {interface:"none"};
	this.parent = data['parent'];
	this.parent.permissions.save = false;
	this.parent.permissions.connect = false;
	Editor.link = this;

	var startFrom = data['lastInterfaceContainer'] || 2 ;

	var temp = 0;
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
  function cancel(){
		if(temp)
			temp.hide();
		linkParent = 0;
	}
	this.trigger = function(data)
	{
		if(!this.isActive)
		{
			temp.hide();
			return;
		}

		var target = data['target'];
		if(!target.permissions.connect)
			return;

		if( target.UID < startFrom || (linkParent && target.UID == linkParent.UID ) )//clicked on root
		{
			temp.hide();
			return;
		}
		var e = data['original_event'];
		var localPos = target.global2local(e.clientX,e.clientY);
		console.log("cx:"+e.clientX+" cy:"+e.clientY+" lp:"+localPos.x+"|"+localPos.y);
		//console.log("Link maker:"+utils.debug(target)+" last:"+linkParent);

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
			//linkData['left_container_xreff'] = localPos.x / target.getWidth();
			//linkData['left_container_yreff'] = localPos.y / target.getHeight();
			console.log("Link left:"+utils.debug(target)+" temp:"+utils.debug(temp));
			temp.changeParent(target);
			temp.show();
			temp.putAt(localPos.x,localPos.y,0.5,0.5);
		}
		else
		{
			oldPos = temp.getPos(0.5,0.5);

			linkData['left_container_xreff'] = oldPos.x / temp.parent.getWidth();
			linkData['left_container_yreff'] = oldPos.y / temp.parent.getHeight();

			linkData['right_container_xreff'] = localPos.x / target.getWidth();
			linkData['right_container_yreff'] = localPos.y / target.getHeight();
			var cDescriptor = Descriptors.links["l000001"];

			var l = linkParent.link(target,{
				container:cDescriptor,
				anchors:linkData
			});

			linkParent = 0;
			temp.hide();
		}
	}

	this.init = function() //called only one when bound with container
	{
		console.log(this.parent.appPath+" - initialising...");
		this.parent.onTrigger = this.toggle;

		temp  = factory.newContainer({x:0,y:0,width:32,height:32,ignoreTheme:true,permissions:{save:false,connect:false,edit:false}},'link_dot',factory.root);
		console.log("link.init> created pointer:"+utils.debug(temp));
		var g = temp.addPrimitive({type:"span",content:{class:"glyphicon glyphicon-record"}});//<span class="glyphicon glyphicon-record"></span>
		g.style.cssText = "font-size:32px";
		temp.hide();

		//GEM.addEventListener("triggered",0,"trigger",this);
		factory.root.addEventListener("triggered",cancel);

		this.toggle(this.parent);
	}
	this.shutdown = function() //called only when app is unloaded from container
	{
		console.log(this.parent.appPath+" - shutdown.");
		temp.discard();
		factory.root.removeEventListener("triggered",cancel);
		GEM.removeEventListener("triggered",0,"trigger",this);
	}
});
