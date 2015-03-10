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
	//main interface exclusive access to system
	var mainActiveUI = {
		current:0,
		previous:0,
	};//storage for descriptor
	Editor.mainActiveUI = {};
	Editor.mainActiveUI.hide = function(){
		if( mainActiveUI.current &&
				mainActiveUI.current.hide )
					mainActiveUI.current.hide.apply(mainActiveUI.current.context,mainActiveUI.current.passToHide);
		mainActiveUI.current = {};

		//activate previous
		if( mainActiveUI.previous.activate )
		{
			mainActiveUI.previous.activate.apply(mainActiveUI.previous.context,mainActiveUI.previous.passToActivate);
			mainActiveUI.current = mainActiveUI.previous;
		}
		mainActiveUI.previous = {};
	}
	Editor.mainActiveUI.activate = function( descriptor, _context, activate){
		//save previous descriptor
		if( mainActiveUI.current.activate )
			mainActiveUI.previous = mainActiveUI.current;

		//hide current UI
		if( mainActiveUI.current &&
				mainActiveUI.current.hide )
					mainActiveUI.current.hide.apply(mainActiveUI.current.context,mainActiveUI.current.passToHide);

		//save descriptor
		mainActiveUI.current = descriptor;
		mainActiveUI.current.context = _context;

		if( activate && descriptor.activate )
			descriptor.activate.apply( _context , descriptor.passToActivate );
	}
	//
	var isMob = false;
	console.log(this.parent.appPath+" - initialising...");

	this.UI = function(info){
		this.parent = info['parent'];
		this.parts = {};
		this.parts['root'] = document.createElement("nav");

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

		if(platform.isMobile)
		{
			this.parts['mobile'] = factory.newContainer({x:"-100%",y:0,width:factory.base.getWidth()*0.4,height:"100%",background:"rgba(200,20,200,0.75)"},"none",factory.base);
			this.parts['mobile'].allowUserMove = false;
		}

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

			if(isMob)
				this.parts['mobile'].DOMreference.appendChild(li);
			else
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

			if(isMob)
				this.parts['mobile'].DOMreference.appendChild(li);
			else
				this.parts['interfaceRight'].appendChild(li);

			return span;
		}
		this.destroy = function()
		{
			this.parent.DOMreference.removeChild(this.parts['root']);
		}
	}

	var dim = (factory.base.getWidth() < factory.base.getHeight() ? factory.base.getWidth() : factory.base.getHeight())*0.6;
	Editor.dock.possize = {x:0,y:0,width:dim,height:dim};
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
		Editor.dock.interfaces['main']	= new Editor.dock.UI({parent:Editor.dock.parent,title:"2048 Challenge"});//"NGPS - "+factory.presentation.name});
		if(platform.isMobile || factory.base.getWidth() < 450)
		{
			Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-list',Editor.dock.toggleMobile)//,"#REG:EDIT_add:innerHTML");
			isMob = true;
			Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-chevron-right',Editor.dock.toggleMobile);
			Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-chevron-right',Editor.dock.toggleMobile);
			Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-chevron-right',Editor.dock.toggleMobile);
			Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-chevron-left',Editor.dock.toggleMobile);
		}

		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-plus',Editor.dock.onAddContainer)//,"#REG:EDIT_add:innerHTML");
		//Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-picture',Editor.dock.onAddPicture)//,"#REG:EDIT_picture:innerHTML");
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-font',Editor.dock.onAddText)//,"#REG:EDIT_text:innerHTML");
		//Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-film',Editor.dock.onAddVideo)//,"#REG:EDIT_video:innerHTML");
		Editor.dock.dockApp('edit/components/background',{lastInterfaceContainer:5});
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-save',Editor.dock.save)//,"#REG:EDIT_save:innerHTML");
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-upload',Editor.dock.load)//,"#REG:EDIT_save:innerHTML");
		Editor.dock.interfaces['main'].addButton('glyphicon glyphicon-th',Editor.dock.toggleCli);


		//Editor.dock.dockApp('link');
		//factory.newGlobalApp("edit/components/pchange");
		factory.newGlobalApp("edit/components/text");
		factory.newGlobalApp("edit/components/sizer");
		factory.newGlobalApp("edit/components/addImage");
		factory.newGlobalApp("edit/components/addVideo");
		factory.newGlobalApp("edit/components/appChoice");
		factory.newGlobalApp('edit/components/link',{lastInterfaceContainer:5});
		factory.newGlobalApp("edit/components/linkEdit");
		factory.newGlobalApp("edit/components/configureContainer");
		factory.newGlobalApp("edit/components/quickAddInterface");
		factory.newGlobalApp("_actions",{mode:"edit"});
		factory.newGlobalApp("userMsg");
		//read tags
		for( k in Descriptors.containers)
			Editor.dock.tags.push(k);

		//Editor.dock.dockApp('edit/components/link',{lastInterfaceContainer:5}); - investigate how dock works
		Editor.dock.dockApp('edit/components/aligner',{lastInterfaceContainer:5});

		factory.newGlobalApp("edit/components/saveDisplay"); //this app messes up saving
		setTimeout(function(){
			console.log("Editor Components:"+utils.debug(Editor));
		},1000);
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
				//cli.show();
				Editor.apps.show();
		}
		else
		{
			//cli.hide();
			Editor.apps.hide();
		}
		Editor.dock.clistatus = !Editor.dock.clistatus;
	}

	this.save = function(){
		if(Editor.saveAid)
			Editor.saveAid.show();
		else
			window.prompt("Presenation content",save.toConsole());
	}
	this.load = function(){
		var pcnt = window.prompt("presentation content:");
		factory.init('editor');
		pLOAD.proceed(pcnt);
	}
	this.toggleMobile = function(){
		if(!Editor.dock.interfaces['main'].parts['mobile'].active)
		{
			Editor.dock.interfaces['main'].parts['mobile'].tween({left:"0%"},1);
			Editor.dock.interfaces['main'].parts['mobile'].active = true;
		}
		else
		{
			Editor.dock.interfaces['main'].parts['mobile'].tween({left:"-100%"},1);
			Editor.dock.interfaces['main'].parts['mobile'].active = false;
		}
		console.log("mobile toggled:"+Editor.dock.interfaces['main'].parts['mobile'].active);
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
			permissions:{track:true,connect:true,edit:true}},descriptor),"c000000",Editor.sizer.target,false,true);

		if(noEvent == true)
			return container;

		if(userMessages)
			userMessages.inform(
			"To add elements to the screen, simply click anywhere and a round interface will appear:<br>\
				to add a container press on <span class='glyphicon glyphicon-unchecked' style='color:white;'></span><br>\
				to add text press on <span class='glyphicon glyphicon-font' style='color:white;'></span><br>\
				to add an image press on <span class='glyphicon glyphicon-picture' style='color:white;'></span><br>\
				to add a video press on <span class='glyphicon glyphicon-film' style='color:white;'></span><br>\
				to add a website view press on <span class='glyphicon glyphicon-globe' style='color:white;'></span><br>\
				");

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
		var container = Editor.dock.onAddContainer(true,{type:"textarea",ignoreTheme:true,background:"transparent"});
		container.editInterface = 'text';
		//container.subject = container.addPrimitive({type:"textarea",content:{style:"width:100%;height:100%;border:none;resize: none;"}});
		//Editor.sizer.hide();
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
