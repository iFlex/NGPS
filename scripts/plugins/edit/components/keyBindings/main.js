this.Editor = this.Editor || {};
//TODO: implement some sort of foreground application system so that keybindings does not interfere with other apps
loadAppCode("edit/components/keyBindings",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.setPermission('save',false);
  this.parent.setPermission('connect',false);
  active = 0;
  Editor.keyBind = this;
  this.activate = function(){
    active = 1;
  }
  this.deactivate = function(){
    active = 0;
  }

  this.init = function(){
    console.log("edit/components/keyBind - initialising...");
    this.activate();
    window.onkeyup = function(e) {
      var key = e.keyCode ? e.keyCode : e.which;
      if(active) {
        try {
          actUponKey(key);
        }catch(e){
          console.log("KeyBindings:"+e);
        }
        e.stopPropagation();
      }
    }
  }

  this.setBindings = function(_bindings){
    bindings = _bindings;
  }

  function actUponKey(key) {
    if(bindings[key] && bindings[key].action )
      bindings[key].action(bindings[key].parameters);
  }

  bindings = {
    13:{action:factory.container},
    8:{action:Editor.sizer.onDelete},
    46:{action:Editor.sizer.onDelete},
  }
});
