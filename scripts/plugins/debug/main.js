loadAppCode("debug",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];

  function updateInfo(child){
      var pos = child.getPos();
      child.debug_info.innerHTML = child.UID+"@"+pos.x+"|"+pos.y;
  }

  function track(e){
    updateInfo(e.target);
  }

  function processChild(child){
    console.log("Debug:"+utils.debug(child));
    //adding a h3 tag to the child element
    var info = child.addPrimitive({type:"h5",content:{innerHTML:"loading container info",style:"background:white"}});
    child.debug_info = info; //store the info handler in the child object
    updateInfo(child);
    //when the child is moved update the info
    child.addEventListener('changePosition',track);

  }
  function onAddedChild(e){
    console.log("Debug: added new container:"+utils.debug(e));
    if(e.child)
      processChild(e.child);
  }

  this.init = function()
  {
    //any new containers will be processed
    GEM.addEventListener("addChild",0,onAddedChild,this);
    //now parse all the already present containers
    function processNode(node){
      processChild(node);
      for( i in node.children )
        processNode(node.children[i]);
    }
    processNode(factory.root);
  }
});
