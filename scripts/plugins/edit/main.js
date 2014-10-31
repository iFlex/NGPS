/*
*	NGPS Edit Interface
*	Author: Milorad Liviu Felix
*	28 Jun 2014  18:45 GMT
*/
//TODO: Fix weird trigger ( with the start interface listener ) evend firing on factory.root even though it's not listened for.
loadAppCode("edit",function(data)
{
	factory.dock = this;
	factory.dock.clistatus = 0;
	this.config = {interface:"none"};
	this.parent = data['parent'];
	this.startWorker = data['startWorker'];
	this.stopWorker = data['stopWorker'];
	//
	this.heightCoeficient = 0.1;
	this.interfaces = {};
	this.input = 0;
	this.file = 0;
	this.onLoadedFile = 0;
	//edit interface
	this.EditUI = {};
	//
	this.UI = function(info){
		this.parent = info['parent'];
		this.parts = {};
		this.parts['root'] = document.createElement("nav");
		//this.root.style.height = this.parent.getHeight()+"px";
		//this.root.style.width = this.parent.getWidth()+"px";
		this.parts['root'].className = "navbar navbar-default navbar-fixed-top";
		this.parts['root'].role = "navigation";

		this.parts['mainDiv'] = document.createElement('div');
		this.parts['mainDiv'].className = "container-fluid";
		
		this.parts['title'] = document.createElement('a');
		this.parts['title'].className = "navbar-brand";

		if( info['title'].indexOf("#REG:") > -1 )
			this.parts['title'].value = info['title'];
		else
			this.parts['title'].innerHTML =	info['title'];
		Regional.inspectObject(this.parts['title']);
				
		this.parts['interfaceRight'] = document.createElement('ul');
		this.parts['interfaceRight'].className = "nav navbar-nav navbar-right";
		
		
		this.parts['mainDiv'].appendChild(this.parts['title']);
		this.parts['mainDiv'].appendChild(this.parts['interfaceRight']);
	
		this.parts['root'].appendChild(this.parts['mainDiv']);
		this.parent.DOMreference.appendChild(this.parts['root']);

		this.addButton = function(icon,handler,description,properties)
		{
			var li = document.createElement('li');
			var a = document.createElement('a');
			a.href = "#";
			
			if(properties && properties['no_anchor'])
				a.style.color = "inherit";

			a.onclick = handler;
			
			var span = document.createElement('span');
			span.className = icon;
			
			var name = 0;
			if(description)
			{
				name = document.createElement('i');
				name.value = description;
				Regional.inspectObject(name);
			}

			
			li.appendChild(a);
			a.appendChild(span);
			if(name)	a.appendChild(name);
			this.parts['interfaceRight'].appendChild(li);
			return span;
		}
		this.addCustom = function(element,style,events,properties)
		{
			var li = document.createElement('li');
		
			var a = document.createElement('a');
			a.href = "#";
			
			var span = 0;
			if(typeof(element) == "string")
			{
				span = document.createElement(element);
				span.style = style;

				if(events)
					for(k in events)
						span[k] = events[k];
			}
			else
			{
				span = element.DOMreference;
				//events seem to bleed through the anchor so no bother
				//a.onclick = function(){
					//element.onTrigger(element,{});
				//};
			}

			li.appendChild(a);
			a.appendChild(span);
			this.parts["interfaceRight"].appendChild(li);
			return span;
		}
		this.destroy = function()
		{
			this.parent.DOMreference.removeChild(this.parts['root']);
		}
	}

	factory.dock.node = 0;
	factory.dock.possize = {x:0,y:0,width:100,height:100};
	factory.dock.tags = [];
	this.buildInterface = function()
	{
		//build the interface
		var dimensions = 0;
		if(factory.dock.parent.parent)
			dimensions = {width:factory.dock.parent.parent.getWidth(),height:factory.dock.parent.parent.getHeight()}
		else
			dimensions = platform.getScreenSize();

		factory.dock.parent.setWidth(0);
		factory.dock.parent.setHeight(0);

		factory.dock.input = document.createElement("input");
		factory.dock.input.type = "file";
		factory.dock.input.multiple = "multiple"
		factory.dock.input.display = "none";
		factory.dock.input.onchange = function () {
			// assuming there is a file input with the ID `my-input`...
			var files = this.files;
			for (var i = 0; i < files.length; i++)
	    		factory.dock.loadFromDataURL(files[i])		
		};
		
		factory.dock.parent.DOMreference.appendChild(factory.dock.input);
		//init interface
		factory.dock.interfaces['main']	= new factory.dock.UI({parent:factory.dock.parent,title:"NGPS - "+factory.presentation.name});
		factory.dock.interfaces['main'].addButton('glyphicon glyphicon-plus',factory.dock.onAddContainer)//,"#REG:EDIT_add:innerHTML");
		factory.dock.interfaces['main'].addButton('glyphicon glyphicon-picture',factory.dock.onAddPicture)//,"#REG:EDIT_picture:innerHTML");
		factory.dock.interfaces['main'].addButton('glyphicon glyphicon-font',factory.dock.onAddText)//,"#REG:EDIT_text:innerHTML");
		factory.dock.interfaces['main'].addButton('glyphicon glyphicon-film',factory.dock.onAddVideo)//,"#REG:EDIT_video:innerHTML");
		factory.dock.interfaces['main'].addButton('glyphicon glyphicon-save',factory.dock.save)//,"#REG:EDIT_save:innerHTML");
		factory.dock.interfaces['main'].addButton('glyphicon glyphicon-th',factory.dock.toggleCli);
		//factory.dock.dockApp('link');
		factory.newGlobalApp("text");
		//edit UI
		var descriptor = {x:0,y:0,width:32,height:32,background:"white",border_size:"0px",cssText:"z-index:4;"};
		factory.dock.EditUI['rotate']  = factory.newContainer(descriptor,"simple_rect",factory.root);
		factory.dock.EditUI['rotate'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-share-alt'></span></center>"; 
		factory.dock.EditUI['rotate'].onMoved = factory.dock.onRotate;
		factory.dock.EditUI['rotate'].hide();
		
		factory.dock.EditUI['enlarge'] = factory.newContainer(descriptor,"simple_rect",factory.root); 
		factory.dock.EditUI['enlarge'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-resize-full'></span></center>"; 
		factory.dock.EditUI['enlarge'].onMoved = factory.dock.onEnlarge;
		factory.dock.EditUI['enlarge'].hide();

		factory.dock.EditUI['changeWidthLeft'] = factory.newContainer(descriptor,"simple_rect",factory.root); 
		factory.dock.EditUI['changeWidthLeft'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-left'></span></center>"; 
		factory.dock.EditUI['changeWidthLeft'].onMoved = factory.dock.onChangeWidthLeft;
		factory.dock.EditUI['changeWidthLeft'].hide();

		factory.dock.EditUI['changeWidthRight'] = factory.newContainer(descriptor,"simple_rect",factory.root); 
		factory.dock.EditUI['changeWidthRight'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-right'></span></center>";
		factory.dock.EditUI['changeWidthRight'].onMoved = factory.dock.onChangeWidthRight; 
		factory.dock.EditUI['changeWidthRight'].hide();

		factory.dock.EditUI['changeHeightBottom'] = factory.newContainer(descriptor,"simple_rect",factory.root); 
		factory.dock.EditUI['changeHeightBottom'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-down'></span></center>"; 
		factory.dock.EditUI['changeHeightBottom'].onMoved = factory.dock.onChangeHeightBottom;
		factory.dock.EditUI['changeHeightBottom'].hide();

		factory.dock.EditUI['changeHeightTop'] = factory.newContainer(descriptor,"simple_rect",factory.root); 
		factory.dock.EditUI['changeHeightTop'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-up'></span></center>"; 
		factory.dock.EditUI['changeHeightTop'].onMoved = factory.dock.onChangeHeightTop;
		factory.dock.EditUI['changeHeightTop'].hide();

		factory.dock.EditUI['delete'] = factory.newContainer(descriptor,"simple_rect",factory.root); 
		factory.dock.EditUI['delete'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-remove'></span></center>"; 
		factory.dock.EditUI['delete'].hide();

		factory.dock.EditUI['more'] = factory.newContainer(descriptor,"simple_rect",factory.root); 
		factory.dock.EditUI['more'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-th-list'></span></center>"; 
		factory.dock.EditUI['more'].hide();

		//read tags
		for( k in Descriptors.containers)
			factory.dock.tags.push(k);

		factory.root.addEventListener("triggered",factory.dock.stopEditInterface);
		factory.dock.dockApp('link');
	}
	this.init = function() //called only one when bound with container
	{
		//include language packs
		var ctx = this;
		requirejs([this.parent.appPath+'messages'],function(){ctx.buildInterface();});
		factory.dock.dockedApps = {};
	};
	this.fileDialog = function()
	{
		factory.dock.input.click();
	}
	this._startEditInterface = function(data)
	{
		factory.dock.startEditInterface(data['target']);
	}
	this.startEditInterface = function(target)
	{
		factory.dock.stopEditInterface();
		factory.dock.EditUI.target = target;
		factory.dock.node = target;
		//$(target.DOMreference).zoomTo({targetsize:0.75, duration:600});
		//add event listeners
		target.addEventListener("changeWidth",this.focusEditInterface);
		target.addEventListener("changeHeight",this.focusEditInterface);
		target.addEventListener("changePosition",this.focusEditInterface);
		//target.addEventListener("changeAngle",this.focusEditInterface);
		//shot interface
		this.focusEditInterface();
	}
	this.startSpecialEditInterface = function(target)
	{
		factory.dock.stopEditInterface();
		factory.dock.EditUI.target = target;
		factory.dock.node = target;
		//add event listeners
		target.addEventListener("changeWidth",this.focusEditInterface);
		target.addEventListener("changeHeight",this.focusEditInterface);
		target.addEventListener("changePosition",this.focusEditInterface);
		//target.addEventListener("changeAngle",this.focusEditInterface);
		//shot interface
		factory.dock.isSpecialInterface = true;
		this.focusSpecialEditInterface();
	}
	this.stopSpecialEditInterface = function()
	{
		if(factory.dock.EditUI.target)
		{
			//remove event listeners
			factory.dock.EditUI.target.removeEventListener("changeWidth",factory.dock.focusEditInterface);
			factory.dock.EditUI.target.removeEventListener("changeHeight",factory.dock.focusEditInterface);
			factory.dock.EditUI.target.removeEventListener("changePosition",factory.dock.focusEditInterface);
			//hide interface
			for( k in factory.dock.EditUI )
				if( k != "target" )
					factory.dock.EditUI[k].hide();

			factory.dock.EditUI.target = 0;	
			factory.dock.node = 0;
			factory.dock.isSpecialInterface = 0;
		}
		keyboard.hideEditor();
	}
	this.stopEditInterface = function()
	{
		if(factory.dock.EditUI.target)
		{
			if(factory.dock.isSpecialInterface)
			{
				factory.dock.stopSpecialEditInterface(factory.dock.EditUI.target)
				return;
			}
			//remove event listeners
			factory.dock.EditUI.target.removeEventListener("changeWidth",factory.dock.focusEditInterface);
			factory.dock.EditUI.target.removeEventListener("changeHeight",factory.dock.focusEditInterface);
			factory.dock.EditUI.target.removeEventListener("changePosition",factory.dock.focusEditInterface);
			factory.dock.EditUI.target.removeEventListener("changeAngle",factory.dock.focusEditInterface);
			//hide interface
			for( k in factory.dock.EditUI )
				if( k != "target" )
					factory.dock.EditUI[k].hide();
			factory.dock.EditUI.target = 0;	
			factory.dock.node = 0;
			factory.dock.isSpecialInterface = 0;
		}
		keyboard.hideEditor();
		
	}
	//TODO:NOT WORKING PORPERLY 
	this.setEditInterfaceAngle = function(angle)
	{
		angle *= Math.PI/180;
		var tpos = factory.dock.EditUI.target.getCenter();
		for( k in factory.dock.EditUI)
			if( k != "target" )
			{
				var pos = factory.dock.EditUI[k].getCenter();
				var dx = tpos.x - pos.x;
				var dy = tpos.y - pos.y;
				var distance = Math.sqrt( dx*dx + dy*dy );
				
				angle += factory.dock.EditUI[k].originalAngle;
				factory.dock.EditUI[k].putAt(tpos.x - distance*Math.cos(angle),tpos.y - distance*Math.sin(angle),0.5,0.5)
				factory.dock.EditUI[k].setAngle(angle);
			}
	}
	//TODO: Not working properly for nested object
	this.focusEditInterface = function(e){
		if(factory.dock.isSpecialInterface)
		{
			factory.dock.focusSpecialEditInterface(e);
			return;
		}
		var target =  factory.dock.EditUI.target;
		var targetPos = target.getPos(0,0,true); //get global target pos
		
		factory.dock.EditUI['rotate'].show();
		factory.dock.EditUI['rotate'].putAt( targetPos.x - factory.dock.EditUI['rotate'].getWidth(), targetPos.y - factory.dock.EditUI['rotate'].getHeight(),0,0,true)
		
		factory.dock.EditUI['enlarge'].putAt( targetPos.x + target.getWidth(), targetPos.y + target.getHeight(),0,0,true)
		factory.dock.EditUI['enlarge'].show();

		factory.dock.EditUI['changeWidthLeft'].show();
		factory.dock.EditUI['changeWidthLeft'].putAt( targetPos.x - factory.dock.EditUI['changeWidthLeft'].getWidth(), targetPos.y + (target.getHeight() - factory.dock.EditUI['changeWidthLeft'].getHeight())/2,0,0,true)	

		factory.dock.EditUI['changeWidthRight'].show();
		factory.dock.EditUI['changeWidthRight'].putAt( targetPos.x + target.getWidth(), targetPos.y + (target.getHeight() - factory.dock.EditUI['changeWidthLeft'].getHeight())/2,0,0,true)	
	
		factory.dock.EditUI['changeHeightBottom'].show();
		factory.dock.EditUI['changeHeightBottom'].putAt( targetPos.x + (target.getWidth() - factory.dock.EditUI['changeWidthLeft'].getWidth())/2, targetPos.y + target.getHeight(),0,0,true)

		factory.dock.EditUI['changeHeightTop'].show();
		factory.dock.EditUI['changeHeightTop'].putAt( targetPos.x + (target.getWidth() - factory.dock.EditUI['changeWidthLeft'].getWidth())/2, targetPos.y - factory.dock.EditUI['changeWidthLeft'].getHeight(),0,0,true)	
		
		factory.dock.EditUI['delete'].show();
		factory.dock.EditUI['delete'].putAt( targetPos.x + target.getWidth(), targetPos.y - factory.dock.EditUI['rotate'].getHeight(),0,0,true)
		factory.dock.EditUI['delete'].onTrigger = this.onDelete;
		factory.dock.EditUI['delete'].onMoved = function(){};

		factory.dock.EditUI['more'].show();
		factory.dock.EditUI['more'].putAt( targetPos.x - factory.dock.EditUI['rotate'].getWidth(), targetPos.y + target.getHeight(),0,0,true)
		factory.dock.EditUI['rotate'].lastEditAngle = "none";
		//factory.dock.setEditInterfaceAngle(target.angle);
	}
	this.focusSpecialEditInterface = function(e){
		var target =  factory.dock.EditUI.target;
		var targetPos = target.getPos(0,0,true);
		keyboard.focusEditor(target);
		factory.dock.EditUI['changeWidthRight'].show();
		factory.dock.EditUI['changeWidthRight'].putAt( targetPos.x + target.getWidth(), targetPos.y + (target.getHeight() - factory.dock.EditUI['changeWidthLeft'].getHeight())/2,0,0,true)	
	
		factory.dock.EditUI['changeHeightBottom'].show();
		factory.dock.EditUI['changeHeightBottom'].putAt( targetPos.x + (target.getWidth() - factory.dock.EditUI['changeWidthLeft'].getWidth())/2, targetPos.y + target.getHeight(),0,0,true)

		factory.dock.EditUI['delete'].show();
		factory.dock.EditUI['delete'].putAt( targetPos.x + target.getWidth(), targetPos.y + target.getHeight(),0,0,true)
		factory.dock.EditUI['delete'].onTrigger = this.onDelete;
		factory.dock.EditUI['delete'].onMoved = function(){};

		factory.dock.EditUI['more'].show();
		factory.dock.EditUI['more'].putAt( targetPos.x - factory.dock.EditUI['rotate'].getWidth(), targetPos.y + target.getHeight(),0,0,true)
		
		//factory.dock.setEditInterfaceAngle(target.angle);
	}
	this.loadFromDataURL = function(url)
	{
		var reader = new FileReader();
		reader.onload = factory.dock.onLoadedFile;
		reader.readAsDataURL(url);
	}
	
	this.toggleCli = function()
	{
		if(!factory.dock.clistatus)
			cli.show();
		else
			cli.hide();
		factory.dock.clistatus = !factory.dock.clistatus;
	}

	this.save = function(){
		alert("saving...");
		document.execCommand("SaveAs");
	}

	this.onAddContainer = function(noEvent,descriptor){
		var pos = {}
		if(!factory.dock.node)
		{
			factory.dock.node = factory.root;
			pos = factory.root.getViewportXY(0.5,0.5);
		}
		else
		{
			pos.x = (factory.dock.node.getWidth() - factory.dock.possize.width)/2;
			pos.y = (factory.dock.node.getHeight() - factory.dock.possize.height)/2;
		}
		var container = factory.newContainer(utils.merge({
			x:pos.x,
			y:pos.y,
			width:factory.dock.possize.width,
			height:factory.dock.possize.height},descriptor),factory.dock.tags[3],factory.dock.node,false,true);
		
		if(noEvent == true)
			return container;

		container.addEventListener("triggered",factory.dock._startEditInterface);
		factory.dock.startEditInterface(container);
		return container;
	}
	
	this.addPictureFromFile = function(e)
	{
		var container = factory.dock.onAddContainer();
		container.addPrimitive({type:"img",adapt_container:true,content:{src:e.target.result}});
	}

	this.addPicture = function(link,info)
	{
		
		//add image from link
		var container = factory.dock.onAddContainer();
		container.addPrimitive({type:"img",adapt_container:true,content:{src:link}});
		
	}
	
	this.onAddPicture = function()
	{
		factory.dock.interfaces['secondary'] = new factory.dock.UI({parent:factory.dock.parent,title:"#REG:EDIT_Add_Picture:innerHTML"})
		factory.dock.interfaces['secondary'].type = "image";
		factory.dock.interfaces['secondary'].addButton('glyphicon glyphicon-link',0,0,{no_anchor:true});
		
		factory.dock.interfaces['secondary']['link'] = factory.dock.interfaces['secondary'].addCustom('input');
		factory.dock.interfaces['secondary']['link'].id =  "#REG:EDIT_IMAGE_LINK:placeholder"
		Regional.inspectObject(factory.dock.interfaces['secondary']['link']);

		factory.dock.interfaces['secondary'].addButton('glyphicon glyphicon-open', factory.dock.fileDialog,"#REG:EDIT_browse:innerHTML");
		factory.dock.interfaces['secondary'].addButton('glyphicon glyphicon-ok', factory.dock.succesSecondaryInterface);
		factory.dock.interfaces['secondary'].addButton('glyphicon glyphicon-remove', factory.dock.cancelSecondaryInterface);

		factory.dock.onLoadedFile = factory.dock.addPictureFromFile;
		
	}
	this.succesSecondaryInterface = function()
	{
		if(factory.dock.interfaces['secondary']['link'].value.length > 0)
		{
			if(factory.dock.interfaces['secondary'].type == "image")
				factory.dock.addPicture(factory.dock.interfaces['secondary']['link'].value);
			
			if(factory.dock.interfaces['secondary'].type == "video")
				factory.dock.addVideo(factory.dock.interfaces['secondary']['link'].value);
		}

		factory.dock.cancelSecondaryInterface();
	}
	this.cancelSecondaryInterface = function()
	{
		if(factory.dock.interfaces['secondary'])
			factory.dock.interfaces['secondary'].destroy();
	}

	this.onAddText = function()
	{
		var container = factory.dock.onAddContainer(true,{});
		container.subject = container.addPrimitive({type:"textarea",content:{style:"width:100%;height:100%;border:none;resize: none;"}});
		factory.dock.stopEditInterface();
		container.addEventListener("triggered",function(data){ factory.dock.startSpecialEditInterface(data['target']);});
		factory.dock.startSpecialEditInterface(container);
	}

	this.addVideo = function(link,info)
	{
		//add image from link
		var container = factory.dock.onAddContainer();
		container.addPrimitive({type:'iframe',width:420,height:345,content:{src:link,width:"420",height:"345"}});
	}

	this.onAddVideo = function()
	{
		factory.dock.interfaces['secondary'] = new factory.dock.UI({parent:factory.dock.parent,title:"#REG:EDIT_Add_Video:innerHTML"})
		factory.dock.interfaces['secondary'].type = "video";
		factory.dock.interfaces['secondary'].addButton('glyphicon glyphicon-link',0,0,{no_anchor:true});
		factory.dock.interfaces['secondary']['link'] = factory.dock.interfaces['secondary'].addCustom('input');
		factory.dock.interfaces['secondary']['link'].id =  "#REG:EDIT_VIDEO_LINK:placeholder"
		Regional.inspectObject(factory.dock.interfaces['secondary']['link']);

		factory.dock.interfaces['secondary'].addButton('glyphicon glyphicon-open', factory.dock.fileDialog,"#REG:EDIT_browse:innerHTML");
		factory.dock.interfaces['secondary'].addButton('glyphicon glyphicon-ok', factory.dock.succesSecondaryInterface);
		factory.dock.interfaces['secondary'].addButton('glyphicon glyphicon-remove', factory.dock.cancelSecondaryInterface);

		//factory.dock.onLoadedFile = factory.dock.addVideoFromFile;
	}
	//edit interface functions
	this.onEnlarge = function(dx,dy)
	{
		var minD = (dx<dy)?dx:dy;
		var amount = (factory.dock.EditUI['target'].getWidth()+minD)/factory.dock.EditUI['target'].getWidth();
		factory.dock.EditUI['target'].enlarge(amount);
	}
	//edit interface functions
	this.onChangeWidthRight = function(dx,dy)
	{
		factory.dock.EditUI['target'].setWidth(factory.dock.EditUI['target'].getWidth()+dx);
		factory.dock.focusEditInterface();
	}
	//edit interface functions
	this.onChangeWidthLeft = function(dx,dy)
	{
		factory.dock.EditUI['target'].setWidth(factory.dock.EditUI['target'].getWidth()-dx);
		factory.dock.EditUI['target'].move(dx,0);
	}
	//edit interface functions
	this.onChangeHeightBottom = function(dx,dy)
	{
		factory.dock.EditUI['target'].setHeight(factory.dock.EditUI['target'].getHeight()+dy);
	}
	//edit interface functions
	this.onChangeHeightTop = function(dx,dy)
	{
		factory.dock.EditUI['target'].setHeight(factory.dock.EditUI['target'].getHeight()-dy);
		factory.dock.EditUI['target'].move(0,dy);
	}
	this.onDelete = function()
	{
		factory.dock.EditUI.target.discard();
		factory.dock.stopEditInterface();
	}
	this.onRotate = function(dx,dy)
	{
		factory.dock.EditUI['rotate'].move(dx,dy)
		var center = factory.dock.EditUI.target.getPos(0.5,0.5,true);
		var ctl   = factory.dock.EditUI['rotate'].getPos(0.5,0.5,true);
		var angle = Math.atan2( center.y - ctl.y , center.x - ctl.x )
		if(factory.dock.EditUI['rotate'].lastEditAngle && typeof(factory.dock.EditUI['rotate'].lastEditAngle)!="string")
		{
			var dif = ( angle - factory.dock.EditUI['rotate'].lastEditAngle )*180/Math.PI;
			factory.dock.EditUI.target.rotate(dif);
		}
		factory.dock.EditUI['rotate'].lastEditAngle = angle;
	}
	//DOCK code
	this.dockApp = function(app){
		if(!factory.dock.dockedApps[app])
		{
			factory.dock.dockedApps[app] = {};
			factory.dock.dockedApps[app].host = factory.newIsolatedContainer({type:"span"});
			var parent = factory.dock.interfaces['main'].addCustom(factory.dock.dockedApps[app].host);
			factory.dock.dockedApps[app].host.onMoved = function(){};//cancel movement
			factory.dock.dockedApps[app].host.loadApp(app);
		}
	}
	this.undockApp = function(app){
		if(factory.dock.dockedApps[app])
		{
			factory.dock.dockedApps[app].host.discard();
			//rearrange others
		}
	}
});