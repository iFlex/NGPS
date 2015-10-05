this.Editor = this.Editor || {};
//TODO: implement some sort of foreground application system so that keybindings does not interfere with other apps
loadAppCode("edit/components/keyBindings",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

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
          console.log("KeyBindings error",e);
        }
        e.stopPropagation();
      }
    }
  }
  this.shutdown = function(){
    console.log("edit/components/keyBind - shutting down...");
    window.onkeyup = null;
    delete Editor.keyBind;
  }
  this.setBindings = function(_bindings){
    bindings = _bindings;
  }

  function actUponKey(key) {
    if(bindings[key]) {
      if(bindings[key].action )
        bindings[key].action(bindings[key].parameters);
    } else {
      if( Editor.shared.selected )//&& Editor.shared.selected.children.length == 0 )
        Editor.addText(String.fromCharCode(key));
    }
  }

  bindings = {
    13:{action:Editor.addContainer},
    46:{action:Editor.sizer.onDelete},
  }
});
