var _debug = 0;
loadAppCode("debug",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

  function processChild(child){
    console.log("Debug:"+utils.debug(child));
    if(!child.properties.isDebug) {
      child.dbg_info = child.addChild({x:0,y:0,autosize:true,background:"white",isDebug:true});
      child.dbg_info.DOMreference.innerHTML = child.UID;
    }
  }
  function onAddedChild(e){
    console.log("Debug: added new container:"+utils.debug(e));
    if(e.child)
      processChild(e.child);
  }

  this.init = function()
  {
    console.log("Debugger online!");
    _debug = this;
    //any new containers will be processed
    //GEM.addEventListener("addChild",0,onAddedChild,this);
    //now parse all the already present containers
    function processNode(node){
      processChild(node);
      for( i in node.children )
        processNode(node.children[i]);
    }
    //processNode(factory.root);
  }

  this.findAllAppInstances = function(){
    var instances = [];
    function getAppInstances(node){
      if(node.isApp)
        instances.push({UID:node.UID,app:node.appName});
      for( i in node.children )
        getAppInstances(node.children[i]);
    }
    getAppInstances(factory.base);
    return instances;
  }

  this.treeList = function(){
    var instances = [];
    function getNode(node){
      instances.push(node.UID);
      for( i in node.children )
        getNode(node.children[i]);
    }
    getNode(factory.base);
    return instances;
  }
  this.makeDot = function(x,y,parent){
    var c = parent.addChild({x:x,y:y,width:5,height:5,border_radius:["50%","50%"],background:"red"});
    c.putAt(x,y,0.5,0.5);
  }
});
