//TODO: fix linker issues with large containers ( it links with absurd positions)
this.Editor = this.Editor || {};

loadAppCode("edit/components/background",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.setPermission('save',false);
  this.parent.setPermission('connect',false);
  Editor.background = this;
  var temp = 0;
  this.isActive = false;

  this.toggle = function(ctx)
  {
    var app = ctx.app;
    app.isActive = !app.isActive;
    Editor.importDialog.show({
      fileHandler:add,
      urlHandler:add,
      target:0,
      title:"Choose a background"
    })
  }
  this.init = function() //called only one when bound with container
  {
    console.log( this.parent.appPath + " - initialising..." );
    this.parent.onTrigger = this.toggle;
    this.parent.DOMreference.className = "glyphicon glyphicon-picture";
  }

  this.shutdown = function() //called only when app is unloaded from container
  {
    console.log(this.parent.appPath+" - shutdown.");
  }

  add = function(e)
  {
    factory.root.DOMreference.style.backgroundImage="url('"+e.target.result+"')";
    factory.root.DOMreference.style.backgroundSize = "cover";
    Editor.importDialog.hide();
  }

});
