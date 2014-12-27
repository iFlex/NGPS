/*
*	NGPS Edit Interface
*	Author: Milorad Liviu Felix
*	28 Jun 2014  18:45 GMT
*	Requires:
*		factory.base - attach potin for interface which is overlayed on the main camera
*		factory.root - main camera
*/
//TODO: Fix weird trigger ( with the start interface listener ) evend firing on factory.base even though it's not listened for.
this.Editor = this.Editor || {};
loadAppCode("edit",function(data)
{
	//var componentsPath = "edit/components/";
	Editor.dock = this;
	Editor.dock.clistatus = 0;
	this.config = {interface:"none"};
	this.parent = data['parent'];
	this.parent.permissions.save = false;
	this.parent.permissions.connect = false;

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

	Editor.dock.possize = {x:0,y:0,width:100,height:100};
	Editor.dock.tags = [];
	this.buildInterface = function()
	{
		//build the interface
		var dimensions = 0;
		if(Editor.dock.parent.parent)
			dimensions = {width:Editor.dock.parent.parent.getWidth(),height:Editor.dock.parent.parent.getHeight()}
		else
			dimensions = platform.getScreenSize();

		Editor.dock.parent.setWidth(0);
		Editor.dock.parent.setHeight(0);

		//init interface
		Editor.dock.interfaces['main']	= new Editor.dock.UI({parent:Editor.dock.parent,title:"NGPS - "+factory.presentation.name});
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-plus',Editor.dock.onAddContainer)//,"#REG:EDIT_add:innerHTML");
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-picture',Editor.dock.onAddPicture)//,"#REG:EDIT_picture:innerHTML");
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-font',Editor.dock.onAddText)//,"#REG:EDIT_text:innerHTML");
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-film',Editor.dock.onAddVideo)//,"#REG:EDIT_video:innerHTML");
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-save',Editor.dock.save)//,"#REG:EDIT_save:innerHTML");
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-th',Editor.dock.toggleCli);

		//Editor.dock.dockApp('link');
		factory.newGlobalApp("edit/components/pchange");
		factory.newGlobalApp("edit/components/text");
		factory.newGlobalApp("edit/components/sizer");
		factory.newGlobalApp("edit/components/addImage");
		factory.newGlobalApp("edit/components/addVideo");
		factory.newGlobalApp("edit/components/appChoice");
		factory.newGlobalApp("edit/components/linkEdit");
		//read tags
		for( k in Descriptors.containers)
			Editor.dock.tags.push(k);

		Editor.dock.dockApp('edit/components/link',{lastInterfaceContainer:5});
		Editor.dock.dockApp('edit/components/aligner',{lastInterfaceContainer:5});
	}
	this.init = function() //called only one when bound with container
	{
		//include language packs
		var ctx = this;
		requirejs([this.parent.appPath+'messages'],function(){ctx.buildInterface();});
		Editor.dock.dockedApps = {};

	};

	this.toggleCli = function()
	{
		if(!Editor.dock.clistatus)
		{
				cli.show();
				Editor.apps.show();
		}
		else
		{
			cli.hide();
			Editor.apps.hide();
		}
		Editor.dock.clistatus = !Editor.dock.clistatus;
	}

	this.save = function(){
		save.toConsole();
		alert("Saved!");
	}

	this.onAddContainer = function(noEvent,descriptor){
		var pos = {}
		if(!Editor.sizer.target)
			pos = factory.root.getViewportXY(0.5,0.5);
		else
		{
			pos.x = (Editor.sizer.target.getWidth() - Editor.dock.possize.width)/2;
			pos.y = (Editor.sizer.target.getHeight() - Editor.dock.possize.height)/2;
		}
		var container = factory.newContainer(utils.merge({
			x:pos.x,
			y:pos.y,
			width:Editor.dock.possize.width,
			height:Editor.dock.possize.height,
			permissions:{track:true,connect:true}},descriptor),Editor.dock.tags[5],Editor.sizer.target,false,true);

		if(noEvent == true)
			return container;

		container.addEventListener("triggered",Editor.sizer._show);
		Editor.sizer.show(container);
		return container;
	}

	this.onAddPicture = function()
	{
		Editor.images.show(Editor.sizer.target);
	}

	this.succesSecondaryInterface = function()
	{
		Editor.dock.cancelSecondaryInterface();
	}
	this.cancelSecondaryInterface = function()
	{
		if(Editor.dock.interfaces['secondary'])
			Editor.dock.interfaces['secondary'].destroy();
	}

	this.onAddText = function()
	{
		var container = Editor.dock.onAddContainer(true,{});
		container.subject = container.addPrimitive({type:"textarea",content:{style:"width:100%;height:100%;border:none;resize: none;"}});
		Editor.sizer.hide();
		container.addEventListener("triggered",function(data){ Editor.sizer.show(data['target']);});
		Editor.sizer.show(container);
		keyboard.focus(container);
		container.addEventListener("triggered",function(){ keyboard.focus(container); });
	}

	this.onAddVideo = function()
	{
		Editor.videos.show(Editor.sizer.target);
	}

	//DOCK code
	this.dockApp = function(app,passTo){
		if(!Editor.dock.dockedApps[app])
		{
			Editor.dock.dockedApps[app] = {};
			Editor.dock.dockedApps[app].host = factory.newIsolatedContainer({type:"span"});
			var parent = Editor.dock.interfaces['main'].addCustom(Editor.dock.dockedApps[app].host);
			Editor.dock.dockedApps[app].host.onMoved = function(){};//cancel movement
			Editor.dock.dockedApps[app].host.loadApp(app,passTo);
		}
	}
	this.undockApp = function(app){
		if(Editor.dock.dockedApps[app])
		{
			Editor.dock.dockedApps[app].host.discard();
			//rearrange others
		}
	}
});
