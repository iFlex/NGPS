
this.Editor = this.Editor || {};

loadAppCode("edit/components/customizer",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);
  Editor.customizer = this;
	
  var path = this.parent.appFullPath;
  var root = 0;
  function _buildMain(){
    popular = main.addChild({autopos:true,background:"transparent","overflow-x":"scroll","overflow-y":"hidden",style:"white-space:nowrap;"});
    utils.makeHTML([{
      h4:{
        innerHTML:"All Apps",
        style:"margin-left:15px"
      }
    },{
      hr:{}
    }],main.DOMreference);
  }
  function _buildActive(){

    for( c in active.children )
      active.children[c].discard();
    utils.clearHTML(active.DOMreference);

    utils.makeHTML([{
      h4:{
        innerHTML:"Active apps - click to shut down.",
        style:"margin-left:15px;display:inline-block"
      }
    },{
      button:{
        onclick:hideActive,
        innerHTML:"Close",
        class:"btn btn-danger",
        style:"display:inline-block;margin-left:20px"
      }
    },{
      hr:{}
    }],active.DOMreference);

    var allApps = Object.keys(AppMgr.loadedApps);//factory.listGlobalApps(); - user only needs to know about global apps

    for( k in allApps)
    {
      allApps[k] = {name:allApps[k]};
      makeAppRecord(allApps[k],active,shutdownApp);
    }
  }

  this.init = function(){
    console.log(path + " - initialising...");
    
	root = factory.base.addChild({x:0,y:"100%",width:"100%",height:"30%",background:"#E6E6E6",style:"padding-left:5px;padding-right:5px",permissions:factory.UIpermissions});
	
	var border = root.addChild({autopos:"true",height:"100%",width:"20%",background:"transparent",style:"display:inline-block"});
	var shape  = root.addChild({autopos:"true",height:"100%",width:"20%",background:"transparent",style:"display:inline-block"});
    var backg  = root.addChild({autopos:"true",height:"100%",width:"20%",background:"transparent",style:"display:inline-block"});
	  
	border.loadApp("edit/components/customizer/views/borders");
	shape.loadApp("edit/components/customizer/views/shapes");
	backg.loadApp("edit/components/customizer/views/background");
  }
  
  this.shutdown = function(){
    console.log("edit/components/customizer - shutdown.");
    root.discard();
    delete Editor.apps;
  }

  this.toggle = function(){
      if(this.showing == true)
        this.hide();
      else
        this.show();
  }

  this.show = function(){
    if(root) {
      root.tween({top:"70%"},1);
      this.showing = true;
    }
  }
  
  this.hide = function(){
    if(root) {
      root.tween({top:"100%"},1);
      this.showing = false;
    }
  }
  
  this.focus = function(x,y,t){
	  Editor.customizer.target = t;
	  Editor.customizer.show();
  }
});
