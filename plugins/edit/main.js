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
		return factory.newContainer({x:x-dx,y:y-dy,width:NGPS_Editor.possize.width,height:NGPS_Editor.possize.height},NGPS_Editor.tags[0],NGPS_Editor.node);
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
});