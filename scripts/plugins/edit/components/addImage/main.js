//TODO: needs to be made configurable: buttons should be able to be hidden, swapped, etc
this.Editor = this.Editor || {};
loadAppCode("edit/components/addImage",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);
  
  Editor.images = this;
  var _target = false;
  var host = 0;

  function resizeToFit(c){
    var parent = 0;
    var dw = 0;
    var dh = 0;
    if(!_target){
      dw = c.getWidth()/factory.base.getWidth();
      dh = c.getHeight()/factory.base.getHeight();
    }
    else
    {
      dw = c.getWidth()/_target.getWidth();
      dh = c.getHeight()/_target.getHeight();
    }

    if(dw > 1 || dh > 1)
    {
      var r = 1/((dw > dh)?dw:dh);
      c.setWidth(c.getWidth()*r);
      c.setHeight(c.getHeight()*r);

      //now center it
      var cpos = {};
      if(!_target){
        cpos = factory.base.getPos(0.5,0.5);
        cpos = factory.root.viewportToSurface(cpos.x,cpos.y);
      }
      else{
        cpos.x = _target.getWidth()/2;
        cpos.y = _target.getHeight()/2;
      }

      c.putAt(cpos.x,cpos.y,0.5,0.5);
    }

  }

  var addFromURL = function(img)
  {
    if(!host){
        if(_target){
        host = _target.addChild({x:0,y:0,width:0,height:0})
        host.extend(Interactive);
        host.interactive(true);
      } else
        host = factory.container();
    } else {
      if(host.child) {
        host.DOMreference.removeChild(host.child);
        host.child = 0;
      }
    }
    host.addPrimitive({type:"img",adapt_container:true,content:{src:img}},function(){resizeToFit(host)});
  }

  var addFromFile = function(e)
  {
    addFromURL(e.target.result);
  }

  this.import = function(target){
    host = 0;
    if(target)
      _target = target;
    else
    {
      target = factory.base;
      _target = 0;
    }

    Dialogue.import.show({
      fileHandler:addFromFile,
      urlHandler:addFromURL,
      target:target
    })
  }

  this.init = function(){
    console.log("edit/components/addImage - initialising...");
  }

  this.shutdown = function(){
    console.log("edit/components/addImage - shutting down...");
    delete Editor.images;
  }
});
