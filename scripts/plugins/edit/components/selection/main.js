this.Editor = this.Editor || {};
loadAppCode("edit/components/selection",function(data)
{
  this.config = {interface:"none"};
	data.parent.setPermissions(factory.UIpermissions);
  var selection = {};

  this.init = function(){
    console.log(data.parent.appPath+" - initialising...");
    Editor.selection = this;
  }

  this.shutdown = function(){
    console.log(data.parent.appPath+" - shutdown...");
  }

  this.add = function(container){
    try{
        selection[container.UID] = {container:container,cover:0};
    } catch(e){
      console.warn("Could not add container to selection - "+container,e);
      return;
    }

    var pos = container.local2global();
    pos.x *= factory.root.czoomLevel;
    pos.y *= factory.root.czoomLevel;
    pos = factory.root.viewportToSurface(pos.x,pos.y);
    //selection[container.UID].cover = factory.root.addChild({x:pos.x,y:pos.y,width:container.getPureWidth(),height:container.getPureHeight(),background:"rgba(0,0,0,0.25)"});
  }

  this.remove = function(container){
    try{
      selection[container.UID].cover.discard();
      delete selection[container.UID];
    }catch(e){
      console.warn("Error while removing item from selection:"+container,e);
    }
  }

  this.clear = function(){
    for( k in selection)
      this.remove(selection[k].container);
  }

});
