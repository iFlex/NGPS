//TODO: Fix weird trigger ( with the start interface listener ) evend firing on factory.base even though it's not listened for.
this.Editor = this.Editor || {};
//hardcoded for now
z_apps = [{name:"collision",local:true},{name:"debug",local:false,global:true},{name:"fps",local:false,global:true}];
//TODO: needs to get apps from server infrastructure
//      needs to be able to save usage of apps and preferences
loadAppCode("edit/components/appChoice",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.permissions.save = false;
  this.parent.permissions.connect = false;
  var path = this.parent.appFullPath;
  var root = 0;
  var main = 0;
  var active = 0;
  var popular = 0;
  var all = 0;
  Editor.apps = this;

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

    popular = main.addChild({autopos:true,background:"transparent",style:"overflow-x:scroll;height:auto"});

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
    console.log("edit/components/appChoice - initialising...");

    root = factory.base.addChild({x:0,y:"100%",width:"100%",height:"50%",border_radius:["10px","10px","0px","0px"],background:"grey",style:"padding-left:5px;padding-right:5px",permissions:{save:false,connect:false}});
    main = root.addChild({x:0,y:0,width:"100%",height:"100%",border_radius:["0px"],background:"transparent",permissions:{save:false,connect:false}});
    active = root.addChild({left:"0%",y:"100%",width:"100%",height:"100%",border_radius:["0px"],background:"grey",permissions:{save:false,connect:false}});

    main.DOMreference.style.overflowY = "scroll";
    active.DOMreference.style.overflowY = "scroll";

    _buildMain();
    _buildActive();
  }
  this.shutdown = function(){
    console.log("edit/components/appChoice - shutdown.");
    root.discard();
  }

  this.show = function(){
    if(root)
      root.tween({top:"50%"},1);
  }
  this.hide = function(){
    if(root)
      root.tween({top:"100%"},1);
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
    if(Editor.sizer.target)
    {
      if(info.local)
        Editor.sizer.target.loadApp(info.name);
    }
    else if( info.local && !info.global ){
      userMessages.inform("Sorry, this type of app needs to be loaded on a container!<br>Click anywhere on the screen and select container then load the app.");
    }
    else if( info.global ){
      factory.newGlobalApp(info.name);
    }
  }
  var makeAppRecord = function(info,mp,onclick){
    var record = mp.addChild({width:"100px",height:"125px",border_radius:["10px","10px",0,0],autopos:true,style:"display: inline-block;margin-right:20px"});
    record.extend(Interactive);
    record.interactive(true);
    record.info = info;
    record.addEventListener("triggered",onclick || loadTheApp);

    var fs = record.getWidth()/info.name.length;
    if(fs > 18)
      fs = 18;
    if(fs < 8)
      fs = 8;
    record.addPrimitive({type:"img",content:{src:"scripts/plugins/"+info.name+"/resources/icon.png",width:"100%",height:"auto"}});
    record.DOMreference.innerHTML += "<p style='margin-left:auto;margin-right:auto;margin-top:5px;text-align: center;font-size:"+fs+"px'>"+info.name+"</p>";
    return record;
  }
  var ordinaryArrange = function(){
    var apps = z_apps;
    for( k in apps)
      makeAppRecord(apps[k],main);
    for( k in apps)
      makeAppRecord(apps[k],popular);
  }
});
