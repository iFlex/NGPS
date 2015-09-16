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
		selected:0,
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

	this.setMainInterface = function(callback){
		InterfaceSequencing.main = callback;
	}
	this.defaultMainInterface = function(){
		InterfaceSequencing.main = Editor.sizer._show;
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
		var defaultDock = ["menuToggle","zoomOut","zoomIn","addContainer","link","addText","addImage","addVideo","save","load","apps"]
		Editor.interface = factory.base.addChild({x:0,y:0,width:"15%",height:"100%",class:"menu",permissions:factory.UIpermissions});
		Editor.dock.title = Editor.interface.addChild({type:"input",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		Editor.dock.title.DOMreference.placeholder = "Title, click to change";
		Editor.dock.title.DOMreference.onfocus = function(){if(Editor.keyBind)Editor.keyBind.deactivate();}
		Editor.dock.title.DOMreference.onblur  = function(){if(Editor.keyBind)Editor.keyBind.activate();}

		for( i in defaultDock ) Editor.dock[defaultDock[i]] = Editor.interface.addChild(descriptor);
		attachTextIcon(Editor.dock.menuToggle,"Collapse","glyphicon glyphicon-chevron-left",Editor.toggleMenu);
		attachTextIcon(Editor.dock.zoomOut,"Zoom out","glyphicon glyphicon-zoom-out",Editor.zoomOut);
		attachTextIcon(Editor.dock.zoomIn,"Zoom in","glyphicon glyphicon-zoom-in",Editor.zoomIn);
		attachTextIcon(Editor.dock.addContainer,"New box","glyphicon glyphicon-plus",Editor.addContainer);
		attachTextIcon(Editor.dock.addText,"Text","glyphicon glyphicon-font",Editor.addText);
		attachTextIcon(Editor.dock.addImage,"Image","glyphicon glyphicon-picture",Editor.addImage);
		attachTextIcon(Editor.dock.addVideo,"Video","glyphicon glyphicon-film",Editor.addVideo);
		attachTextIcon(Editor.dock.save,"Save","glyphicon glyphicon-save",Editor.save);
		attachTextIcon(Editor.dock.load,"Load","glyphicon glyphicon-open",Editor.load);
		attachTextIcon(Editor.dock.apps,"Apps","glyphicon glyphicon-th",Editor.toggleAppsMenu);

		Editor.dockApp("edit/components/link",{},Editor.dock.link);
	}

	this.init = function() //called only one when bound with container
	{
		Editor.dock = {};
		Editor.dockedApps = {};
		buildInterface();
		GEM.addEventListener("triggered",0,"changeSelected",this);
		factory.newGlobalApp("edit/components/pchange");
		factory.newGlobalApp("edit/components/text");
		factory.newGlobalApp("edit/components/sizer");
		factory.newGlobalApp("edit/components/addImage");
		factory.newGlobalApp("edit/components/addVideo");
		factory.newGlobalApp("edit/components/appChoice");
		//factory.newGlobalApp('edit/components/link',{lastInterfaceContainer:5});
		factory.newGlobalApp("edit/components/linkEdit");
		factory.newGlobalApp("edit/components/containerConfigurer");
		factory.newGlobalApp("edit/components/quickAddInterface");
		factory.newGlobalApp("edit/components/keyBindings");
		factory.newGlobalApp("edit/components/effects");
		factory.newGlobalApp("edit/components/selection");
		factory.newGlobalApp("edit/components/clipboard");
		factory.newGlobalApp("userMsg");

		this.dockApp("edit/components/background");

		////////////////////////////////
		pLOAD.doInstallTriggers   = false;
		pLOAD.doInitialiseEffects = false;
		pLOAD.doTranslateAddress  = true;// must be true
		GEM.addEventListener("startup",0,function(){
			pLOAD.loadStartOffset = containerData.containerIndex + 10;
			Editor.defaultMainInterface();
			InterfaceSequencing.secondary = Editor.addInterface.onClick;

		},this);
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
		console.log(e.target);
		console.log("...................")
		if(e.target.UID > 2 && e.target.getPermission("edit") != true)
			return;

		Editor.shared.selected = 0;
		if(e.target.getPermission("edit") == true && e.target.UID > 2) {
			Editor.shared.selected = e.target;
			Editor.selection.clear();
			Editor.selection.add(e.target);

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
				if( (InterfaceSequencing.lastClickedDepth%2))
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

		console.log("Editor Selected item now:");
		console.log(Editor.shared.selected);
	}
	//DOCK code
	this.dockApp = function(app,passTo,slot){
		if(!Editor.dockedApps[app])
		{
			console.log("Docking app:"+app);
			if(slot)
				Editor.dockedApps[app] = slot;
			else
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
	////////////////////////
	//operations
	////////////////////////
	this.save = function(){
		save.toFile(Editor.dock.title.DOMreference.value);
	}
	this.load = function(){
		//var pcnt = window.prompt("presentation content:");
		//pLOAD.proceed(pcnt);
		Dialogue.import.show({
      title:"Choose presentation",
      fileHandler:function(e){ pLOAD.fromHTML(atob(e.target.result.split(",")[1])); delete pLOAD.loadStartOffset;},
      urlHandler:function(){},
      target:factory.base
    });
	}

	this.zoomIn = function(){
		factory.root.czoom(1.1);
	}
	this.zoomOut = function(){
		//factory.root.czoom(0.6);
		factory.root.czoom(0.9);
	}

	//UTILITY
	//event listeners
	this._addContainer = function(noInterface,descriptor,tag){ //causes cyclic references in save tree
    Editor.addInterface.hide();
    var dparent = Editor.shared.selected;
		var actpos = {};
		if( !dparent || Editor.addInterface.x == undefined){
      dparent = factory.root;
			actpos.x = factory.root.getWidth()/2;
			actpos.y = factory.root.getHeight()/2;
		}
		if(dparent.UID < 3)
			dparent = factory.root;

    var d = utils.merge({
    x:0,y:0,
    width:dparent.getWidth()*0.2,
    height:dparent.getWidth()*0.2,
    permissions:{track:true,connect:true,edit:true}},descriptor,true);

    var container = factory.newContainer(d,((tag)?tag:"c000000"),dparent);
    var pos = container.global2local( (actpos.x || Editor.addInterface.x)*1/factory.root.czoomLevel,(actpos.y || Editor.addInterface.y)*1/factory.root.czoomLevel);
    container.putAt(pos.x,pos.y,0.5,0.5);

    if(Editor.sizer && !noInterface)
      Editor.sizer.show(container);

    return container;
  }

  this.addContainer = function(){
    var c = Editor._addContainer();
		var fx = effects.getEffect("Focus Camera");
		fx.install("triggered",c,c);
	}
  this.addCamera = function(){
    Editor.addInterface.hide();
    var dparent = Editor.shared.selected;
    if(dparent.UID < 3)
      dparent = factory.base;

    var container = factory.newCamera({
      x:0,
      y:0,
      width:dparent.getWidth()*0.8,
      height:dparent.getHeight()*0.8,
      surfaceWidth:50000,surfaceHeight:50000,CAMERA_type:"scroller",
      permissions:{track:false,connect:true,edit:true}},"c000000",
      Editor.shared.selected,false,true);

      var pos = container.global2local(Editor.addInterface.x*1/factory.root.czoomLevel,Editor.addInterface.y*1/factory.root.czoomLevel);
      container.putAt(pos.x,pos.y,0.5,0.5);

      if(Editor.sizer)
        Editor.sizer.show(container);
  }

  this.addText = function(text){
    //var container = _addContainer(true,null,"text_field");
		console.log(Editor.shared);
    var container = (Editor.shared.selected && Editor.shared.selected.UID>2)?Editor.shared.selected:Editor._addContainer();
    Editor.text.makeTextContainer(container,text);
    Editor.sizer.show(container);
  }

  this.addVideo = function(){
    Editor.addInterface.hide();
    console.log("Adding Video");
    if(Editor.videos)
      Editor.videos.show((Editor.shared.selected && Editor.shared.selected.UID > 2)?Editor.shared.selected:0);
  }
  this.addImage = function(){
    Editor.addInterface.hide();
    console.log("Adding image");
    Editor.images.import((Editor.shared.selected && Editor.shared.selected.UID > 2)?Editor.shared.selected:0);
  }
  this.addWebsite = function(){
    Editor.addInterface.hide();
    console.log("Adding Video");
    if(Editor.shared.selected.UID < 3)
      Editor.shared.selected = factory.base;
    if(Editor.videos)
      Editor.videos.show(Editor.shared.selected);
  }
  this.manageEffects = function(){
    Editor.addInterface.hide();
    var dparent = Editor.shared.selected;
    if(dparent.UID < 3)
      dparent = factory.base;
    if(Editor.effects)
      Editor.effects.show(dparent);
  }

	this.copy = function(){
		if(Editor.shared.selected) {
			Editor.clipboard.clear();
			Editor.clipboard.copy(Editor.shared.selected);
			Editor.addInterface.hide();
		}
	}

	this.paste = function(){
		where = ((Editor.shared.selected && Editor.shared.selected.UID > 2)?Editor.shared.selected:factory.root);
		Editor.clipboard.paste({dx:10,dy:10,mountPoint:where});
		Editor.addInterface.hide();
	}

	this.configureContainer = function(){
		if(Editor.customizer && Editor.shared.selected.UID > 2) {
			Editor.addInterface.hide();
			Editor.customizer.show(Editor.shared.selected);
			Editor.sizer.hide();
		}
	}

	this.showPie = function(){
		setTimeout(function(){
		Editor.sizer.hide();
		var pos = Editor.shared.selected.local2global(0.5,0.5);
		var e = {event:"triggered",nativeEvent:{pageX:pos.x * factory.root.czoomLevel,pageY:pos.y * factory.root.czoomLevel},target:Editor.shared.selected};
		Editor.addInterface.hide();
		Editor.addInterface.onClick(e);},100);
	}

	///////////////////////
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
