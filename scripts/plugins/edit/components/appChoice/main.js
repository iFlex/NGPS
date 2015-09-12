//TODO: Fix weird trigger ( with the start interface listener ) evend firing on factory.base even though it's not listened for.
this.Editor = this.Editor || {};
//hardcoded for now
//TODO: needs to get apps from server infrastructure
//      needs to be able to save usage of apps and preferences
loadAppCode("edit/components/appChoice",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

  var path = this.parent.appFullPath;
  var root = 0;
  var main = 0;
  var active = 0;
  var popular = 0;
  var all = 0;
  var apps = [];
  var iconSize = 74;
  function showActive(){
    _buildActive();
    active.tween({top:"0%"},1);
  }

  function hideActive(){
    active.tween({top:"100%"},1);
  }

  function _buildMain(){
    console.log("building main:"+utils.debug(main));
    for( c in main.children )
      main.children[c].discard();
    utils.clearHTML(main.DOMreference);

    utils.makeHTML([{
      h4:{
        innerHTML:"Your Favourite - click to load.",
        style:"margin-left:15px;display:inline-block"
      }
    },{
      button:{
        onclick:showActive,
        innerHTML:"Show Active Apps",
        class:"btn btn-danger",
        style:"display:inline-block;margin-left:20px"
      }
    },{
      button:{
        onclick:Editor.apps.hide,
        innerHTML:"Close",
        class:"btn btn-danger",
        style:"display:inline-block;margin-left:20px"
      }
    },{
      hr:{}
    }],main.DOMreference);

    popular = main.addChild({autopos:true,background:"transparent","overflow-x":"scroll","overflow-y":"hidden",style:"white-space:nowrap;"});
    utils.makeHTML([{
      h4:{
        innerHTML:"All Apps",
        style:"margin-left:15px"
      }
    },{
      hr:{}
    }],main.DOMreference);

    ordinaryArrange();
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
    Editor.apps = this;
    console.log("edit/components/appChoice - initialising...");
    host.getInstalledUserApps(function(_apps){
        apps = _apps;
        console.log(apps);
        root = factory.base.addChild({x:0,y:"100%",width:"100%",height:"50%",border_radius:["10px","10px","0px","0px"],background:"#E6E6E6",style:"padding-left:5px;padding-right:5px",permissions:factory.UIpermissions});
        main = root.addChild({x:0,y:0,width:"100%",height:"100%",border_radius:["0px"],"overflow-y":"scroll","overflow-x":"hidden",permissions:factory.UIpermissions,style:bkgStyle});
        active = root.addChild({left:"0%",y:"100%",width:"100%",height:"100%",border_radius:["0px"],permissions:factory.UIpermissions,"overflow-y":"scroll","overflow-x":"hidden",style:activeBkg});
        _buildMain();
        _buildActive();
    });
  }
  this.shutdown = function(){
    console.log("edit/components/appChoice - shutdown.");
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
      root.tween({top:"50%"},1);
      this.showing = true;
    }
  }
  this.hide = function(){
    if(root) {
      root.tween({top:"100%"},1);
      this.showing = false;
    }
  }

  var shutdownApp = function(e){
    var info = e.target.info;
    if(confirm("Are you sure you want to shut down "+info.name+"?"))
    {
      factory.removeGlobalApp(info.name,true);
      e.target.discard();
    }
  }

  var loadTheApp = function(e){
    console.log("Target:"+utils.debug(e.target));
    var info = e.target.info;
    if(info.local)
    {
      if(Editor.shared.selected)
        Editor.shared.selected.loadApp(info.name);
    }
    else {//if( info.global ){
      factory.newGlobalApp(info.name);
    }
  }
  var makeAppRecord = function(info,mp,onclick){
    var record = mp.addChild({width:100,height:125,border_radius:["10px","10px",0,0],autopos:true,style:"display:inline-block;white-space:normal;margin-right:20px"});
    record.extend(Interactive);
    record.interactive(true);
    record.info = info;
    record.addEventListener("triggered",onclick || loadTheApp);

    var fs = record.getWidth()/info.name.length;
    if(fs > 18)
      fs = 18;
    if(fs < 8)
      fs = 8;
    var _p = record.addPrimitive({type:"img",id:record.UID+"_img",content:{src:"scripts/plugins/"+info.name+"/resources/icon.png",width:iconSize+"px",height:iconSize+"px",style:"background-image:url('scripts/plugins/default.png');background-size: 100% 100%;"}});
    record.DOMreference.innerHTML += "<p style='margin-left:auto;margin-right:auto;margin-top:5px;text-align: center;font-size:"+fs+"px'>"+info.name+"</p>";
    return record;
  }
  var ordinaryArrange = function(){
    for( k in apps)
      makeAppRecord(apps[k],main);
    for( k in apps)
      makeAppRecord(apps[k],popular);
  }
  var bkgStyle = "background-size: 50px 50px;\
background-color: #cdd1d2;\
background-image: -webkit-linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);\
background-image: -moz-linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);\
background-image: linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);\
-pie-background: linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent) 0 0 / 50px #0ae;";
  var activeBkg = "background-size: 50px 50px;\
background-color: #77ce74;\
background-image: -webkit-linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);\
background-image: -moz-linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);\
background-image: linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);\
-pie-background: linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent) 0 0 / 50px #0ae;";
});
