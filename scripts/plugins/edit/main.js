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
	this.config = {interface:"none"};
	data.parent.setPermission('save',false);
	data.parent.setPermission('connect',false);
	Editor = this;
	var descriptor = {autopos:true,width:"100%",height:33,backrgound:"rgba(0,0,0,0.5);",style:"margin-top:2px"};
	//main interface exclusive access to system
	var mainActiveUI = {
		current:{},
		previous:{},
	};//storage for descriptor
	Editor.mainActiveUI = {};
	Editor.mainActiveUI.hide = function(){
		if( mainActiveUI.current &&
				mainActiveUI.current.hide )
				mainActiveUI.current.hide.apply(mainActiveUI.current.context,mainActiveUI.current.passToHide);
		mainActiveUI.current = {hide:0};
	}
	Editor.mainActiveUI.activate = function( descriptor, _context, activate){
		Editor.mainActiveUI.hide();

		mainActiveUI.current = descriptor;
		mainActiveUI.current.context = _context;
		if( activate && mainActiveUI.current.activate )
			mainActiveUI.current.activate.apply( _context , mainActiveUI.current );
	}

	function attachTextIcon(ct,text,icon,hook){
		utils.makeHTML([{
			i:{
				class:icon
			}
		},{
			input:{
				type:"button",
				class:"form-control",
				style:"background:rgba(0,0,0,0);",
				value:text
			}
		}],ct.DOMreference);
		ct.DOMreference.className="inner-addon right-addon";
		if(hook)
			ct.DOMreference.childNodes[1].onclick = function(){hook();};
	}
	function changeTextIcon(ct,text,icon,hook){
		ct.DOMreference.childNodes[0].className = icon;
		ct.DOMreference.childNodes[1].value = text;
		if(hook)
			ct.DOMreference.childNodes[1].onclick = function(){hook();};
	}
	function buildInterface(){
		var defaultDock = ["menuToggle","zoomOut","zoomIn","addContainer","addText","save","load","apps"]
		Editor.interface = factory.base.addChild({x:0,y:0,width:"15%",height:"100%",background:"rgba(0,0,0,0.25)"});
		Editor.dock.title = Editor.interface.addChild({type:"input",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		Editor.dock.title.DOMreference.value = "Title, click to change";

		for( i in defaultDock ) Editor.dock[defaultDock[i]] = Editor.interface.addChild(descriptor);
		attachTextIcon(Editor.dock.menuToggle,"Collapse","glyphicon glyphicon-chevron-left",Editor.toggleMenu);
		attachTextIcon(Editor.dock.zoomOut,"Zoom out","glyphicon glyphicon-zoom-out",Editor.zoomOut);
		attachTextIcon(Editor.dock.zoomIn,"Zoom in","glyphicon glyphicon-zoom-in",Editor.zoomIn);
		attachTextIcon(Editor.dock.addContainer,"New box","glyphicon glyphicon-plus",Editor.onAddContainer);
		attachTextIcon(Editor.dock.addText,"Text","glyphicon glyphicon-font",Editor.onAddText);
		attachTextIcon(Editor.dock.save,"Save","glyphicon glyphicon-save",Editor.save);
		attachTextIcon(Editor.dock.load,"Load","glyphicon glyphicon-upload",Editor.load);
		attachTextIcon(Editor.dock.apps,"Apps","glyphicon glyphicon-th",Editor.toggleAppsMenu);
	}

	this.init = function() //called only one when bound with container
	{
		Editor.dock = {};
		Editor.dockedApps = {};
		buildInterface();
		//this.dockApp('edit/components/background',{lastInterfaceContainer:5});

		factory.newGlobalApp("edit/components/pchange");
		factory.newGlobalApp("edit/components/text");
		factory.newGlobalApp("edit/components/sizer");
		factory.newGlobalApp("edit/components/addImage");
		factory.newGlobalApp("edit/components/addVideo");
		factory.newGlobalApp("edit/components/appChoice");
		factory.newGlobalApp('edit/components/link',{lastInterfaceContainer:5});
		factory.newGlobalApp("edit/components/linkEdit");
		factory.newGlobalApp("edit/components/configureContainer");
		factory.newGlobalApp("edit/components/quickAddInterface");
		factory.newGlobalApp("edit/components/keyBindings");
		factory.newGlobalApp("_actions",{mode:"edit"});
		factory.newGlobalApp("_CGI",{mode:"edit"});
		factory.newGlobalApp("userMsg");
	};
	this.shutdown = function(){
		delete Editor.dock;
		delete Editor;

		factory.removeGlobalApp("edit/components/pchange");
		factory.removeGlobalApp("edit/components/text");
		factory.removeGlobalApp("edit/components/sizer");
		factory.removeGlobalApp("edit/components/addImage");
		factory.removeGlobalApp("edit/components/addVideo");
		factory.removeGlobalApp("edit/components/appChoice");
		factory.removeGlobalApp('edit/components/link',{lastInterfaceContainer:5});
		factory.removeGlobalApp("edit/components/linkEdit");
		factory.removeGlobalApp("edit/components/configureContainer");
		factory.removeGlobalApp("edit/components/quickAddInterface");
		factory.removeGlobalApp("edit/components/keyBindings");
		factory.removeGlobalApp("_actions",{mode:"edit"});
		factory.removeGlobalApp("_CGI",{mode:"edit"});
		factory.removeGlobalApp("userMsg");
	}

	//functions
	this.toggleMenu = function(){
		if(Editor.interface.w){
			Editor.interface.w = 0;
			Editor.dock.menuToggle.DOMreference.childNodes[0].className = "glyphicon glyphicon-chevron-left";
		}
		else{
			Editor.interface.w = -Editor.interface.getWidth()*0.80;
			Editor.dock.menuToggle.DOMreference.childNodes[0].className = "glyphicon glyphicon-chevron-right";
		}
		Editor.interface.tween({left:Editor.interface.w+"px"},1);
	}
	this.toggleAppsMenu = function()
	{
		Editor.apps.toggle();
	}

	this.save = function(){
		save.toFile(Editor.dock.title.DOMreference.value);
	}
	this.load = function(){
		var pcnt = window.prompt("presentation content:");
		pLOAD.proceed(pcnt);
	}

	this.zoomIn = function(){
		factory.root.czoom(1.4);
	}
	this.zoomOut = function(){
		factory.root.czoom(0.6);
	}
	this.onAddContainer = function(){
		var c = factory.container();
		Editor.sizer.show(c);
		return container;
	}

	this.onAddPicture = function()
	{
		Editor.images.show(Editor.sizer.target);
	}

	this.onAddText = function()
	{
		Editor.text.quickMake();
	}

	this.onAddVideo = function()
	{
		Editor.videos.show(Editor.sizer.target);
	}

	//DOCK code
	this.dockApp = function(app,passTo){
		if(!Editor.dockedApps[app])
		{
			console.log("Docking app:"+app);
			Editor.dockedApps[app] = Editor.interface.addChild(descriptor);
			attachTextIcon(Editor.dockedApps[app],"Loading...","glyphicon glyphicon-flash");
			Editor.dockedApps[app].loadApp(app,passTo);
			Editor.dockedApps[app].attachTextIcon = changeTextIcon;
		}
	}
	this.undockApp = function(app){
		if(Editor.dockedApps[app])
		{
			Editor.dockedApps[app].discard();
			delete Editor.dockedApps[app];
		}
	}

	utils.loadRawStyle("/* enable absolute positioning */\
.inner-addon { \
	position: relative; \
}\
/* style icon */\
.inner-addon .glyphicon {\
position: absolute;\
padding: 10px;\
pointer-events: none;\
}\
/* align icon */\
.left-addon .glyphicon  { left:  0px;}\
.right-addon .glyphicon { right: 0px;}\
/* add padding  */\
.left-addon input  { padding-left:  30px; }\
.right-addon input { padding-right: 30px; }");
});
