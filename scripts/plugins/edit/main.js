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
	data.parent.setPermissions(factory.UIpermissions);
	Editor = this;

	//shared variables that allow subapps to easily interact and share data - like current selected container
	Editor.shared = {
		selected:{},
	};

	var descriptor = {autopos:true,width:"100%",height:33,backrgound:"rgba(0,0,0,0.5);",style:"margin-top:2px"};

	var InterfaceSequencing = {
		main:0,
		secondary:0,
		override:0,
		lastClicked:0,
		lastClickedDepth:0,
		toClose:{},
		toCloseIndex:0,
	}

	function hideActiveInterfaces(){
		console.log("Hiding active interfaces");
		for( k in InterfaceSequencing.toClose )
			try{
				InterfaceSequencing.toClose[k]();
			} catch (e){

			}
			delete InterfaceSequencing.toClose[k];
	}

	Editor.addCloseCallback = function(callback){
		InterfaceSequencing.toClose[InterfaceSequencing.toCloseIndex++] = callback;
	}
	Editor.requestNextClick = function(callback){
		InterfaceSequencing.noCancelOverride = true;
		console.log("Requested next click");
		InterfaceSequencing.override = callback;
		console.log(InterfaceSequencing);
	}
	Editor.cancelNextClickRequest = function(){
		InterfaceSequencing.noCancelOverride = false;
		InterfaceSequencing.override = 0;
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
				style:"background-color: Transparent;background-repeat:no-repeat;border: none;color: white;",
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
		Editor.interface = factory.base.addChild({x:0,y:0,width:"15%",height:"100%",class:"menu",permissions:factory.UIpermissions});
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
		GEM.addEventListener("triggered",0,"changeSelected",this);
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
		factory.newGlobalApp("edit/components/effects");
		factory.newGlobalApp("userMsg");
		setTimeout(function(){
			InterfaceSequencing.main = Editor.sizer._show;
			InterfaceSequencing.secondary = Editor.addInterface.onClick;
		},1000);
		////////////////////////////////
		pLOAD.doInstallTriggers = false;
		pLOAD.doInitialiseEffects = false;
	};
	this.shutdown = function(){

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
		factory.removeGlobalApp("userMsg");

		Editor.interface.discard();
		delete Editor;

	}
	this.changeSelected = function(e){
		console.log("Editor click registered");
		if(e.target.getPermission("edit") == true && e.target.UID > 2) {
			Editor.shared.selected = e.target;
			hideActiveInterfaces()
			if(	e.target.UID == InterfaceSequencing.lastClicked ){
				InterfaceSequencing.lastClickedDepth++;
			} else {
				InterfaceSequencing.lastClickedDepth = 0;
				InterfaceSequencing.lastClicked = e.target.UID;
			}

			//Sequence interfaces
			if(InterfaceSequencing.override != 0){
				InterfaceSequencing.override(e);
				if(InterfaceSequencing.noCancelOverride)
					InterfaceSequencing.noCancelOverride = false;
				else
					InterfaceSequencing.override = 0;
			} else {
				if(InterfaceSequencing.lastClickedDepth > 0)
					InterfaceSequencing.secondary(e);
				else
					InterfaceSequencing.main(e);
			}
		}
		else {
			Editor.shared.selected = factory.base;
			if( e.target.UID < 3 ) {
				InterfaceSequencing.override = 0;
				hideActiveInterfaces()
				InterfaceSequencing.secondary(e);
			}
		}
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
		//var pcnt = window.prompt("presentation content:");
		//pLOAD.proceed(pcnt);
		Dialogue.import.show({
      title:"Choose presentation",
      fileHandler:function(e){ pLOAD.fromHTML(atob(e.target.result.split(",")[1])); },
      urlHandler:function(){},
      target:factory.base
    });
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

	this.onAddImage = function()
	{
		if(Editor.shared.selected.UID < 3) {
      Editor.shared.selected = factory.root;
      Editor.images.import();
    }
    else
      Editor.images.import(Editor.shared.selected);
	}

	this.onAddText = function()
	{
		console.log("Selected UID:"+Editor.shared.selected.UID);
		var container = ( Editor.shared.selected.UID > 2 ) ? Editor.shared.selected : factory.container();
    Editor.text.makeTextContainer(container);
    Editor.sizer.show(container);
    keyboard.focus(container);
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
.right-addon input { padding-right: 30px; }\
.menu{\
	opacity:50%;\
  background: #50a3a2;\
  background: -webkit-linear-gradient(top left, #50a3a2 0%, #53e3a6 100%);\
  background: linear-gradient(to bottom right, #50a3a2 0%, #53e3a6 100%);\
	font-family: 'Source Sans Pro', sans-serif;\
  color: white;\
  font-weight: 300;\
}");
});
