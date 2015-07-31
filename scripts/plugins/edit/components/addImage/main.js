//TODO: needs to be made configurable: buttons should be able to be hidden, swapped, etc
this.Editor = this.Editor || {};
loadAppCode("edit/components/addImage",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.setPermission('save',false);
  this.parent.setPermission('connect',false);
  Editor.images = this;
  var midBody = 0;
  var link = 0;
  var mountPoint = 0;
  var primitiveCTL = 0;
  var _target = false;

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

  var addFromURL = function(link,info)
  {
    if(!primitiveCTL)
    {
      var container = Editor.addInterface.newContainer();//mountPoint || Editor.dock.onAddContainer();
      primitiveCTL = container.addPrimitive({type:"img",adapt_container:true,content:{src:link}},function(){resizeToFit(container)});
    }
    else
      if(primitiveCTL.src != link)
        primitiveCTL.src = link;

    //Editor.images.hide();
  }

  var addFromFile = function(e)
  {
    var container = Editor.addInterface.newContainer();//mountPoint || Editor.dock.onAddContainer();
    var img = container.addPrimitive({type:"img",adapt_container:true,content:{src:e.target.result}},function(){resizeToFit(container)});
    //Editor.images.hide();
  }

  var _add = function(){
    if(link && link.value.length > 0)
      addFromURL(link.value);
  }

  this.import = function(target){
    if(target)
    {
      if(!target.hasChildren())
        mountPoint = target;
      _target = target;
    }
    else
    {
      target = factory.base;
      _target = 0;
    }

    Editor.importDialog.show({
      fileHandler:addFromFile,
      urlHandler:addFromURL,
      target:target
    })
  }

  this.init = function(){
    console.log("edit/components/addImage - initialising...");
  }
});
