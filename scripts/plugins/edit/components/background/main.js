//TODO: fix linker issues with large containers ( it links with absurd positions)
this.Editor = this.Editor || {};

loadAppCode("edit/components/background",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

  var temp = 0;
  this.isActive = false;

  this.toggle = function()
  {
    Editor.background.isActive = !Editor.background.isActive;
    Dialogue.import.show({
      fileHandler:add,
      urlHandler:add,
      target:factory.base,
      title:"Choose a background"
    })
  }

  this.init = function() //called only one when bound with container
  {
    console.log( this.parent.appPath + " - initialising..." );
    Editor.background = this;
    this.parent.attachTextIcon(this.parent,"Background","glyphicon glyphicon-tree-conifer",this.toggle);
  }

  this.shutdown = function() //called only when app is unloaded from container
  {
    console.log(this.parent.appPath+" - shutdown.");
    delete Editor.background;
  }

  add = function(e)
  {
    factory.root.DOMreference.style.backgroundImage="url('"+e.target.result+"')";
    factory.root.DOMreference.style.backgroundSize = "cover";
    Dialogue.import.hide();
  }

});
