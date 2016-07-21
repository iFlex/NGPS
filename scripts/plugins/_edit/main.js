/*
*	NGPS Edit Interface
*	Author: Milorad Liviu Felix
*	28 Jun 2014  18:45 GMT
*	Requires:
*		factory.base - attach potin for interface which is overlayed on the main camera
*		ngps.mainCamera - main camera
*/
this.Editor = this.Editor || {};
loadAppCode("_edit",function(data)
{
	//var componentsPath = "edit/components/";
	this.config = {interface:"none"};
	data.parent.setPermissions(factory.UIpermissions);
	Editor = this;
	//shared variables that allow subapps to easily interact and share data - like current selected container
	Editor.shared = {
		currentTapResponder:0,
		currentCleanupHandler:0,
		lastTapped:0,
		focus:0,
		selection:[]
	};
	var descriptor = {autopos:true,width:"100%",height:"33px",backrgound:"black",style:"margin-top:2px"};
	
	function linkTapCallbacks() {
		Editor.dock.addContainer.EDIT_TAP = Editor.addContainer;
		
		Editor.dock.addText.EDIT_TAP = Editor.text.quickMake;
		Editor.dock.addText.CLEANUP  = Editor.text.hide;
		
		Editor.dock.addImage.EDIT_TAP = Editor.images.import;
		Editor.dock.addImage.CLEANUP = Editor.images.hide;
		
		Editor.dock.addVideo.EDIT_TAP = Editor.videos.show;
		Editor.dock.addVideo.CLEANUP = Editor.videos.hide;
		
		Editor.dock.link.EDIT_TAP = Editor.link.doLink;
		Editor.dock.link.CLEANUP  = Editor.link.clear;
		
		Editor.actionButtons.edit.onTrigger = Editor.toggleEdit;
		Editor.actionButtons.apps.onTrigger = function(){Editor.apps.toggle();};//Editor.apps.toggle;
		Editor.actionButtons.save.onTrigger = Editor.save;
		Editor.actionButtons.load.onTrigger = Editor.load;
	}
	
	function buildInterface(){
		
		//var defaultDock = ["zoomOut","zoomIn","addContainer","link","addText","addImage","addVideo","save","load","apps"]
		Editor.interface = factory.base.addChild({x:0,y:0,width:"15%",height:"100%",class:"menu",permissions:factory.UIpermissions});
		Editor.title = Editor.interface.addChild({type:"input",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.actionButtons.edit = Editor.interface.addChild({background:"black",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.dock.addContainer = Editor.interface.addChild({background:"black",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.dock.addText = Editor.interface.addChild({background:"black",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.dock.addImage = Editor.interface.addChild({background:"black",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.dock.addVideo = Editor.interface.addChild({background:"black",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.dock.link = Editor.interface.addChild({background:"black",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.actionButtons.save = Editor.interface.addChild({background:"black",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.actionButtons.load = Editor.interface.addChild({background:"black",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.actionButtons.apps = Editor.interface.addChild({background:"black",autopos:true,width:"99%",height:32,style:"margin-top:5px;margin-left:auto;mergin-right:auto;padding-left:2px;background:rgba(0,0,0,0);text-aling:center"});
		
		Editor.title.DOMreference.placeholder = "Title, click to change";
		Editor.title.DOMreference.onfocus = function(){if(Editor.keyBind)Editor.keyBind.deactivate();}
		Editor.title.DOMreference.onblur  = function(){if(Editor.keyBind)Editor.keyBind.activate();}
		
		for( i in Editor.dock ) {
			if(i == "link")
				Editor.dock[i].onTrigger = function(e){Editor.disableEdit();Editor.menuTap(e);};	
			else
				Editor.dock[i].onTrigger = Editor.menuTap;
			
			Editor.dock[i].extend(Interactive);
			Editor.dock[i].interactive(true);
			Editor.dock[i].DOMreference.innerHTML = i;
		}
		
		for( i in Editor.actionButtons ) {
			Editor.actionButtons[i].extend(Interactive);
			Editor.actionButtons[i].interactive(true);
			Editor.actionButtons[i].DOMreference.innerHTML = i;
		}
	}

	this.init = function() //called only one when bound with container
	{
		Editor.dock = {};
		Editor.actionButtons = {};
		Editor.dockedApps = {};
		buildInterface();
		GEM.addEventListener("triggered",0,"onTap",this);
		
		factory.newGlobalApp("edit/components/pchange");
		factory.newGlobalApp("edit/components/text");
		factory.newGlobalApp("edit/components/sizer");
		factory.newGlobalApp("edit/components/addImage");
		factory.newGlobalApp("edit/components/addVideo");
		factory.newGlobalApp("edit/components/appChoice");
		factory.newGlobalApp('edit/components/link',{lastInterfaceContainer:5});
		factory.newGlobalApp("edit/components/linkEdit");
		factory.newGlobalApp("edit/components/containerConfigurer");
		//factory.newGlobalApp("edit/components/quickAddInterface");
		factory.newGlobalApp("edit/components/keyBindings");
		factory.newGlobalApp("edit/components/effects");
		factory.newGlobalApp("edit/components/selection");
		factory.newGlobalApp("edit/components/clipboard");
		factory.newGlobalApp("userMsg");
		
		pLOAD.doInstallTriggers   = false;
		pLOAD.doInitialiseEffects = false;
		pLOAD.doTranslateAddress  = true;// must be true
		
		Editor.shared.currentTapResponder = Editor.addContainer;
		GEM.addEventListener("startup",0,function(){
			pLOAD.loadStartOffset = containerData.containerIndex + 10;
			linkTapCallbacks();
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
	
	this.menuTap = function(e){
		if(Editor.shared.currentCleanupHandler)
			Editor.shared.currentCleanupHandler();
		
		for( i in Editor.dock)
			Editor.dock[i].DOMreference.style.backgroundColor = "black";
		e.DOMreference.style.backgroundColor = "blue";
		
		console.log("Menu change")
		console.log(e);
		
		if(e.EDIT_TAP){
			console.log(e.EDIT_TAP);
			Editor.shared.currentTapResponder = e.EDIT_TAP;
			Editor.shared.currentCleanupHandler = e.CLEANUP;
		}
		console.log("...................")
	}
	
	this.onTap = function(e){
		console.log("Editor click registered");
		console.log(e);
		console.log("...................")
		
		if(e.target.UID > ngps.mainCamera.UID && e.target.getPermission("edit") != true)
			return;
		
		if(Editor.shared.lastTapped == e.target.UID || e.target.UID == ngps.mainCamera.UID || !Editor.actionButtons.edit.ENABLED){
			console.log(Editor.shared.currentTapResponder);
			Editor.shared.currentTapResponder(e.nativeEvent.clientX,e.nativeEvent.clientY,e.target,e);
		} else {
			Editor.sizer.show(e.nativeEvent.clientX,e.nativeEvent.clientY,e.target,e);
		}
		Editor.shared.lastTapped = e.target.UID;
	}
	////////////////////////
	//operations
	////////////////////////
	this.enableEdit = function(){
		Editor.actionButtons.edit.ENABLED = true;
	}
	this.disableEdit = function(){ 
		Editor.sizer.hide();
		Editor.actionButtons.edit.ENABLED = false;
	}
	this.toggleEdit = function(e){	
		if(!Editor.actionButtons.edit.ENABLED){
			e.DOMreference.style.backgroundColor = "blue";
			Editor.enableEdit();
		} else {
			e.DOMreference.style.backgroundColor = "black";
			Editor.disableEdit();
		}
	}
	
	this.save = function() {
	  save.toFile(Editor.title.DOMreference.value);
	}
	
	this.load = function() {
	  Dialogue.import.show({
      	title:"Choose presentation",
      	fileHandler:function(e){ pLOAD.fromHTML(atob(e.target.result.split(",")[1])); delete pLOAD.loadStartOffset;},
      	urlHandler:function(){},
      	target:factory.base
      });
	}
	
	this.zoomIn = function(){
		ngps.mainCamera.czoom(1.1);
	}
	
	this.zoomOut = function(){
		//ngps.mainCamera.czoom(0.6);
		ngps.mainCamera.czoom(0.9);
	}

	//UTILITY
	//event listeners
this._addContainer = function(x,y,parent){ //causes cyclic references in save tree
    
    var d = {
    x:x,y:y,
    width:parent.getWidth()*0.5,
    height:parent.getHeight()*0.5,
    permissions:{track:true,connect:true,edit:true}};
	
    var container = factory.newContainer(d,"c000000",parent);
    var pos = container.global2local();
    container.putAt(pos.x,pos.y,0.5,0.5);

    return container;
  }

  this.addContainer = function(x,y,p,e){
	  var c = Editor._addContainer(x,y,p);
	  var fx = effects.getEffect("Focus Camera");
	  fx.install("triggered",c,c);
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
