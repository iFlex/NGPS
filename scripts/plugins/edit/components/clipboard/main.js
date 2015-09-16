this.Editor = this.Editor || {};
loadAppCode("edit/components/clipboard",function(data) {
	//var componentsPath = "edit/components/";
	this.config = {interface:"none"};
	data.parent.setPermissions(factory.UIpermissions);
  var clipboard = {};

  this.init = function() {
    console.log(data.parent.appPath+" - initialising...");
    Editor.clipboard = this;
  }

  this.shutdown = function() {
    console.log(data.parent.appPath+" - shutdown...");
    delete clipboard;
    delete Editor.clipboard;
  }

	this.clear = function(){
    delete clipboard;
		clipboard = {};
		save.clear();
  }

  this.copy = function(c){
    try {
      save.iterate(c,{build:"continuous",iteration:"recursive"},clipboard);
			clipboard["metadata"] = save.pack(true,true);
    } catch(e){
      console.warn("Could not copy container",e);
    }
  }

  this.paste = function(props){
		if(!props)
			props = {};
		pLOAD.clear();
    for( i in clipboard) {
      try {
				pLOAD.aggregate(clipboard[i]);
      } catch(e) {
        console.warn("Could not paste element @ "+i,e);
      }
    }
		pLOAD.proceed(0,props.mountPoint || factory.root);
  }

  this.getClipboard = function(){
    return clipboard;
  }

});
