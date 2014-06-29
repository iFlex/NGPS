/*
*	NGPS Edit Interface
*	Author: Milorad Liviu Felix
*	28 Jun 2014  18:45 GMT
*/
this.NGPS_Editor = {};
loadAppCode("edit",function(data)
{
	NGPS_Editor.app = this;
	NGPS_Editor.app.clistatus = 0;
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

		this.addButton = function(icon,handler,description)
		{
			var li = document.createElement('li');
		
			var a = document.createElement('a');
			a.href = "#";
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
		}
		this.addCustom = function(element,style,events)
		{
			var li = document.createElement('li');
		
			var a = document.createElement('a');
			a.href = "#";
		
			var span = document.createElement(element);
			span.style = style;

			if(events)
				for(k in events)
					span[k] = events[k];

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

	NGPS_Editor.node = 0;
	NGPS_Editor.possize = {x:0,y:0,width:100,height:100};
	NGPS_Editor.tags = [];
	this.init = function() //called only one when bound with container
	{
		//include language packs
		//requirejs(['plugins/edit/messages']);
		//manual inclusion
		var messages = document.createElement("script");
		messages.src = "plugins/edit/messages.js";
		messages.onload;
		document.head.appendChild(messages);
		//build the interface
		var dimensions = 0;
		if(this.parent.parent)
			dimensions = {width:this.parent.parent.getWidth(),height:this.parent.parent.getHeight()}
		else
			dimensions = platform.getScreenSize();

		this.parent.setWidth(0);
		this.parent.setHeight(0);

		this.input = document.createElement("input");
		this.input.type = "file";
		this.input.multiple = "multiple"
		this.input.display = "none";
		this.input.onchange = function () {
			// assuming there is a file input with the ID `my-input`...
			var files = this.files;
			for (var i = 0; i < files.length; i++)
	    		NGPS_Editor.app.loadFromDataURL(files[i])		
		};
		
		this.parent.DOMreference.appendChild(this.input);
		//init interface
		this.interfaces['main']	= new this.UI({parent:this.parent,title:"NGPS - "+factory.presentation.name});
		this.interfaces['main'].addButton('glyphicon glyphicon-th',this.toggleCli);
		this.interfaces['main'].addButton('glyphicon glyphicon-plus',this.onAddContainer);
		this.interfaces['main'].addButton('glyphicon glyphicon-picture',this.onAddPicture);
		this.interfaces['main'].addButton('glyphicon glyphicon-font',this.onAddContainer);
		this.interfaces['main'].addButton('glyphicon glyphicon-film',this.onAddVideo);
		this.interfaces['main'].addButton('glyphicon glyphicon-save',this.save);
		//edit UI
		this.EditUI['rotate']  = factory.newContainer({x:0,y:0,width:32,height:32},"simple_rect",factory.root);
		this.EditUI['rotate'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-share-alt'></span></center>"; 
		this.EditUI['rotate'].onMoved = this.onRotate;
		this.EditUI['rotate'].hide();
		
		this.EditUI['enlarge'] = factory.newContainer({x:0,y:0,width:32,height:32},"simple_rect",factory.root); 
		this.EditUI['enlarge'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-resize-full'></span></center>"; 
		this.EditUI['enlarge'].onMoved = this.onEnlarge;
		this.EditUI['enlarge'].hide();

		this.EditUI['changeWidthLeft'] = factory.newContainer({x:0,y:0,width:32,height:32},"simple_rect",factory.root); 
		this.EditUI['changeWidthLeft'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-left'></span></center>"; 
		this.EditUI['changeWidthLeft'].onMoved = this.onChangeWidthLeft;
		this.EditUI['changeWidthLeft'].hide();

		this.EditUI['changeWidthRight'] = factory.newContainer({x:0,y:0,width:32,height:32},"simple_rect",factory.root); 
		this.EditUI['changeWidthRight'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-right'></span></center>";
		this.EditUI['changeWidthRight'].onMoved = this.onChangeWidthRight; 
		this.EditUI['changeWidthRight'].hide();

		this.EditUI['changeHeightBottom'] = factory.newContainer({x:0,y:0,width:32,height:32},"simple_rect",factory.root); 
		this.EditUI['changeHeightBottom'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-down'></span></center>"; 
		this.EditUI['changeHeightBottom'].onMoved = this.onChangeHeightBottom;
		this.EditUI['changeHeightBottom'].hide();

		this.EditUI['changeHeightTop'] = factory.newContainer({x:0,y:0,width:32,height:32},"simple_rect",factory.root); 
		this.EditUI['changeHeightTop'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-up'></span></center>"; 
		this.EditUI['changeHeightTop'].onMoved = this.onChangeHeightTop;
		this.EditUI['changeHeightTop'].hide();

		this.EditUI['delete'] = factory.newContainer({x:0,y:0,width:32,height:32},"simple_rect",factory.root); 
		this.EditUI['delete'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-remove'></span></center>"; 
		this.EditUI['delete'].hide();

		this.EditUI['more'] = factory.newContainer({x:0,y:0,width:32,height:32},"simple_rect",factory.root); 
		this.EditUI['more'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-th-list'></span></center>"; 
		this.EditUI['more'].hide();

		//read tags
		for( k in Descriptors.containers)
			NGPS_Editor.tags.push(k);

	}
	this.run = function()	//called whenever the container is triggered
	{
		
	}
	this.suspend = function() //called whenever the container looses focus ( or gets out of view )
	{

	}
	this.shutdown = function() //called only when app is unloaded from container
	{

	}
	this.show = function() //shows app
	{

	}
	this.hide = function() //hides app
	{

	}
	this.fileDialog = function()
	{
		NGPS_Editor.app.input.click();
	}
	this.startEditInterface = function(target)
	{
		NGPS_Editor.app.EditUI.target = target;
		//add event listeners
		target.addEventListener("changeWidth",this.focusEditInterface);
		target.addEventListener("changeHeight",this.focusEditInterface);
		target.addEventListener("changePosition",this.focusEditInterface);
		//shot interface
		this.focusEditInterface();
	}
	this.stopEditInterface = function()
	{
		//remove event listeners
		NGPS_Editor.app.EditUI.target.removeEventListener("changeWidth",this.focusEditInterface);
		NGPS_Editor.app.EditUI.target.removeEventListener("changeHeight",this.focusEditInterface);
		NGPS_Editor.app.EditUI.target.removeEventListener("changePosition",this.focusEditInterface);
		//hide interface
		for( k in NGPS_Editor.app.EditUI )
			if( k != "target" )
				NGPS_Editor.app.EditUI[k].hide();	
	}
	this.focusEditInterface = function(e){
		var target =  NGPS_Editor.app.EditUI.target;
		var targetPos = target.getPos();
		NGPS_Editor.app.EditUI['rotate'].show();
		NGPS_Editor.app.EditUI['rotate'].putAt( targetPos.x - NGPS_Editor.app.EditUI['rotate'].getWidth(), targetPos.y - NGPS_Editor.app.EditUI['rotate'].getHeight() )
		
		NGPS_Editor.app.EditUI['enlarge'].putAt( targetPos.x + target.getWidth(), targetPos.y + target.getHeight() )
		NGPS_Editor.app.EditUI['enlarge'].show();

		NGPS_Editor.app.EditUI['changeWidthLeft'].show();
		NGPS_Editor.app.EditUI['changeWidthLeft'].putAt( targetPos.x - NGPS_Editor.app.EditUI['changeWidthLeft'].getWidth(), targetPos.y + (target.getHeight() - NGPS_Editor.app.EditUI['changeWidthLeft'].getHeight())/2 )	

		NGPS_Editor.app.EditUI['changeWidthRight'].show();
		NGPS_Editor.app.EditUI['changeWidthRight'].putAt( targetPos.x + target.getWidth(), targetPos.y + (target.getHeight() - NGPS_Editor.app.EditUI['changeWidthLeft'].getHeight())/2 )	
	
		NGPS_Editor.app.EditUI['changeHeightBottom'].show();
		NGPS_Editor.app.EditUI['changeHeightBottom'].putAt( targetPos.x + (target.getWidth() - NGPS_Editor.app.EditUI['changeWidthLeft'].getWidth())/2, targetPos.y + target.getHeight() )

		NGPS_Editor.app.EditUI['changeHeightTop'].show();
		NGPS_Editor.app.EditUI['changeHeightTop'].putAt( targetPos.x + (target.getWidth() - NGPS_Editor.app.EditUI['changeWidthLeft'].getWidth())/2, targetPos.y - NGPS_Editor.app.EditUI['changeWidthLeft'].getHeight() )	
		
		NGPS_Editor.app.EditUI['delete'].show();
		NGPS_Editor.app.EditUI['delete'].putAt( targetPos.x + target.getWidth(), targetPos.y - NGPS_Editor.app.EditUI['rotate'].getHeight() )
		NGPS_Editor.app.EditUI['delete'].onTrigger = this.onDelete;
		NGPS_Editor.app.EditUI['delete'].onMoved = function(){};

		NGPS_Editor.app.EditUI['more'].show();
		NGPS_Editor.app.EditUI['more'].putAt( targetPos.x - NGPS_Editor.app.EditUI['rotate'].getWidth(), targetPos.y + target.getHeight() )
		
	}

	this.loadFromDataURL = function(url)
	{
		var reader = new FileReader();
		reader.onload = NGPS_Editor.app.onLoadedFile;
		reader.readAsDataURL(url);
	}
	
	this.toggleCli = function()
	{
		if(!NGPS_Editor.app.clistatus)
			cli.show();
		else
			cli.hide();
		NGPS_Editor.app.clistatus = !NGPS_Editor.app.clistatus;
	}

	this.save = function(){
		alert("saving...");
		document.execCommand("SaveAs");
	}

	this.onAddContainer = function(){
		if(!NGPS_Editor.node)
			NGPS_Editor.node = factory.root;

		var x = ( NGPS_Editor.node.getWidth() - NGPS_Editor.possize.width ) / 2;
		var y = ( NGPS_Editor.node.getHeight() - NGPS_Editor.possize.height ) / 2;
		var dx = 0;
		var dy = 0;

		if(NGPS_Editor.node.isCamera)
		{
			var cameraInfo = NGPS_Editor.node.getContentPositioning();
			dx = cameraInfo.x;
			dy = cameraInfo.y;
		}
		var container = factory.newContainer({x:x-dx,y:y-dy,width:NGPS_Editor.possize.width,height:NGPS_Editor.possize.height},NGPS_Editor.tags[2],NGPS_Editor.node);
		NGPS_Editor.app.startEditInterface(container);
		return container;
	}
	
	this.addPictureFromFile = function(e)
	{
		var container = NGPS_Editor.app.onAddContainer();
		container.addPrimitive({type:"img",adapt_container:true,content:{src:e.target.result}});
	}

	this.addPicture = function(link,info)
	{
		
		//add image from link
		var container = NGPS_Editor.app.onAddContainer();
		container.addPrimitive({type:"img",adapt_container:true,content:{src:link}});
		
	}
	
	this.onAddPicture = function()
	{
		NGPS_Editor.app.interfaces['secondary'] = new NGPS_Editor.app.UI({parent:NGPS_Editor.app.parent,title:"#REG:EDIT_Add_Picture:innerHTML"})
		NGPS_Editor.app.interfaces['secondary'].type = "image";
		NGPS_Editor.app.interfaces['secondary'].addButton('glyphicon glyphicon-link');
		
		NGPS_Editor.app.interfaces['secondary']['link'] = NGPS_Editor.app.interfaces['secondary'].addCustom('input');
		NGPS_Editor.app.interfaces['secondary']['link'].id =  "#REG:EDIT_IMAGE_LINK:placeholder"
		Regional.inspectObject(NGPS_Editor.app.interfaces['secondary']['link']);

		NGPS_Editor.app.interfaces['secondary'].addButton('glyphicon glyphicon-open', NGPS_Editor.app.fileDialog,"#REG:EDIT_browse:innerHTML");
		NGPS_Editor.app.interfaces['secondary'].addButton('glyphicon glyphicon-ok', NGPS_Editor.app.succesSecondaryInterface);
		NGPS_Editor.app.interfaces['secondary'].addButton('glyphicon glyphicon-remove', NGPS_Editor.app.cancelSecondaryInterface);

		NGPS_Editor.app.onLoadedFile = NGPS_Editor.app.addPictureFromFile;
		
	}
	this.succesSecondaryInterface = function()
	{
		if(NGPS_Editor.app.interfaces['secondary']['link'].value.length > 0)
		{
			if(NGPS_Editor.app.interfaces['secondary'].type == "image")
				NGPS_Editor.app.addPicture(NGPS_Editor.app.interfaces['secondary']['link'].value);
			
			if(NGPS_Editor.app.interfaces['secondary'].type == "video")
				NGPS_Editor.app.addVideo(NGPS_Editor.app.interfaces['secondary']['link'].value);
		}

		NGPS_Editor.app.cancelSecondaryInterface();
	}
	this.cancelSecondaryInterface = function()
	{
		if(NGPS_Editor.app.interfaces['secondary'])
			NGPS_Editor.app.interfaces['secondary'].destroy();
	}

	this.onAddText = function()
	{

	}

	this.addVideo = function(link,info)
	{
		//add image from link
		var container = NGPS_Editor.app.onAddContainer();
		container.addPrimitive({type:'iframe',width:420,height:345,content:{src:link,width:"420",height:"345"}});
	}

	this.onAddVideo = function()
	{
		NGPS_Editor.app.interfaces['secondary'] = new NGPS_Editor.app.UI({parent:NGPS_Editor.app.parent,title:"#REG:EDIT_Add_Video:innerHTML"})
		NGPS_Editor.app.interfaces['secondary'].type = "video";
		NGPS_Editor.app.interfaces['secondary'].addButton('glyphicon glyphicon-link');
		NGPS_Editor.app.interfaces['secondary']['link'] = NGPS_Editor.app.interfaces['secondary'].addCustom('input');
		NGPS_Editor.app.interfaces['secondary']['link'].id =  "#REG:EDIT_VIDEO_LINK:placeholder"
		Regional.inspectObject(NGPS_Editor.app.interfaces['secondary']['link']);

		NGPS_Editor.app.interfaces['secondary'].addButton('glyphicon glyphicon-open', NGPS_Editor.app.fileDialog,"#REG:EDIT_browse:innerHTML");
		NGPS_Editor.app.interfaces['secondary'].addButton('glyphicon glyphicon-ok', NGPS_Editor.app.succesSecondaryInterface);
		NGPS_Editor.app.interfaces['secondary'].addButton('glyphicon glyphicon-remove', NGPS_Editor.app.cancelSecondaryInterface);

		//NGPS_Editor.app.onLoadedFile = NGPS_Editor.app.addVideoFromFile;
	}
	//edit interface functions
	this.onEnlarge = function(dx,dy)
	{
		var minD = (dx<dy)?dx:dy;
		var amount = (NGPS_Editor.app.EditUI['target'].getWidth()+minD)/NGPS_Editor.app.EditUI['target'].getWidth();
		NGPS_Editor.app.EditUI['target'].enlarge(amount);
	}
	//edit interface functions
	this.onChangeWidthRight = function(dx,dy)
	{
		NGPS_Editor.app.EditUI['target'].setWidth(NGPS_Editor.app.EditUI['target'].getWidth()+dx);
		NGPS_Editor.app.focusEditInterface();
	}
	//edit interface functions
	this.onChangeWidthLeft = function(dx,dy)
	{
		NGPS_Editor.app.EditUI['target'].setWidth(NGPS_Editor.app.EditUI['target'].getWidth()-dx);
		NGPS_Editor.app.EditUI['target'].move(dx,0);
	}
	//edit interface functions
	this.onChangeHeightBottom = function(dx,dy)
	{
		NGPS_Editor.app.EditUI['target'].setHeight(NGPS_Editor.app.EditUI['target'].getHeight()+dy);
	}
	//edit interface functions
	this.onChangeHeightTop = function(dx,dy)
	{
		NGPS_Editor.app.EditUI['target'].setHeight(NGPS_Editor.app.EditUI['target'].getHeight()-dy);
		NGPS_Editor.app.EditUI['target'].move(0,dy);
	}
	this.onDelete = function()
	{
		NGPS_Editor.app.EditUI.target.discard();
		NGPS_Editor.app.stopEditInterface();
	}
	this.onRotate = function(dx,dy)
	{
		NGPS_Editor.app.EditUI['rotate'].move(dx,dy)
		var center = NGPS_Editor.app.EditUI.target.getCenter();
		var ctl   = NGPS_Editor.app.EditUI['rotate'].getCenter();
		var angle = Math.atan2( center.y - ctl.y , center.x - ctl.x )
		if(NGPS_Editor.app.EditUI['rotate'].lastEditAngle)
		{
			var dif = ( angle - NGPS_Editor.app.EditUI['rotate'].lastEditAngle )*180/Math.PI;
			NGPS_Editor.app.EditUI.target.rotate(dif);
		}
		NGPS_Editor.app.EditUI['rotate'].lastEditAngle = angle;
	}
});