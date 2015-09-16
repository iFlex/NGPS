//TODO: fix linker issues with large containers ( it links with absurd positions)
this.Editor = this.Editor || {};

loadAppCode("edit/components/link",function(data){
	this.config = {interface:"none"};
	this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

	var startFrom = data['lastInterfaceContainer'] || 2 ;
	var temp = 0;
	this.active = false;
	this.toggled = false;
	this.cDescriptor = {};
	var linkParent = 0;
	var linkData = {};
	var scale = 1;
	this.descriptor = {};

	this.toggle = function(){
		if(this.toggled) {
			Editor.defaultMainInterface();
			Editor.link.parent.restyle({background:"transparent"});
		} else {
			Editor.setMainInterface(Editor.link.trigger);
			Editor.link.parent.restyle({background:"rgba(255,255,255,0.25)"});
		}

		this.toggled = !this.toggled;
	}

  function cancel(){
		if(temp)
			temp.hide();
		linkParent = 0;
	}
	this.trigger = function(data)
	{
		console.log(data);
		scale = 1/factory.root.czoomLevel;
		var target = data['target'];
		if(!target.getPermission('connect'))
			return;

		if( target.UID < startFrom || (linkParent && target.UID == linkParent.UID ) )//clicked on root
		{
			temp.hide();
			return;
		}
		var e = data['original_event'];
		var localPos = target.global2local(e.clientX*scale,e.clientY*scale);
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

			Editor.requestNextClick(Editor.link.trigger);
		}
		else
		{
			oldPos = temp.getPos(0.5,0.5);

			linkData['left_container_xreff'] = oldPos.x / temp.parent.getWidth();
			linkData['left_container_yreff'] = oldPos.y / temp.parent.getHeight();

			linkData['right_container_xreff'] = localPos.x / target.getWidth();
			linkData['right_container_yreff'] = localPos.y / target.getHeight();
			var cDescriptor = Descriptors.links["l000000"];

			var l = linkParent.link(target,{
				container:cDescriptor,
				anchors:linkData
			});
			l.setPermission("edit",false);
			linkParent = 0;
			temp.hide();
		}
	}

	this.init = function() //called only one when bound with container
	{
		Editor.link = this;
		console.log(this.parent.appPath+" - initialising...");
		temp  = factory.newContainer({x:0,y:0,width:32,height:32,ignoreTheme:true,permissions:data.parent.getPermissions()},'link_dot',factory.root);
		console.log("link.init> created pointer:"+utils.debug(temp));
		var g = temp.addPrimitive({type:"span",content:{class:"glyphicon glyphicon-record"}});//<span class="glyphicon glyphicon-record"></span>
		g.style.cssText = "font-size:32px";
		temp.hide();

		this.parent.attachTextIcon(this.parent,"Link ideas","glyphicon glyphicon-link",this.toggle);
	}
	this.shutdown = function() //called only when app is unloaded from container
	{
		console.log(this.parent.appPath+" - shutdown.");
		temp.discard();
		delete Editor.link;
	}
});
