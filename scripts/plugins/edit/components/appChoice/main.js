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
  var root = 0;
  var popular = 0;
  var all = 0;
  Editor.apps = this;

  this.init = function(){
    console.log("edit/components/appChoice - initialising...");

    root = factory.base.addChild({x:0,y:"100%",width:"100%",height:"50%",border_radius:["15px","15px","0px","0px"],background:"grey",style:"padding-left:5px;padding-right:5px",permissions:{save:false,connect:false}});
    utils.makeHTML([{
      h4:{
        innerHTML:"Your Favourite",
        style:"margin-left:15px"
      }
    },{
      hr:{}
    }],root.DOMreference);
    popular = root.addChild({autopos:true,background:"blue",style:"overflow-x:scroll;height:auto"});
    utils.makeHTML([{
      h4:{
        innerHTML:"All Apps",
        style:"margin-left:15px"
      }
    },{
      hr:{}
    }],root.DOMreference);
    ordinaryArrange();
    console.log("app show:"+utils.debug(root));
  }
  this.show = function(){
    if(root)
      root.tween({top:"50%"},1);
  }
  this.hide = function(){
    if(root)
      root.tween({top:"100%"},1);
  }
  var loadTheApp = function(e){
    console.log("Target:"+utils.debug(e.target));
    var info = e.target.info;
    if(Editor.sizer.target)
    {
      if(info.local)
        Editor.sizer.target.loadApp(info.name);
    }
    else if( info.global ){
      factory.newGlobalApp(info.name);
    }
  }
  var makeAppRecord = function(info,mp){
    var record = mp.addChild({width:"50px",height:"75px",border_radius:["15px","15px",0,0],autopos:true,style:"display: inline-block;margin-right:20px"});
    record.extend(Interactive);
    record.interactive(true);
    record.info = info;
    record.addEventListener("triggered",loadTheApp);

    record.addPrimitive({type:"img",content:{src:"http://icons.iconarchive.com/icons/yellowicon/game-stars/256/Mario-icon.png",width:"100%",height:"auto"}});
    record.DOMreference.innerHTML += "<p style='margin-left:auto;margin-right:auto;margin-top:5px;text-align: center;'>"+info.name+"</p>";
    return record;
  }
  var ordinaryArrange = function(){
    var apps = z_apps;
    for( k in apps)
      makeAppRecord(apps[k],root);
    for( k in apps)
      makeAppRecord(apps[k],popular);
  }
});
