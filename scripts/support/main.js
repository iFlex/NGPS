function _INIT(onReady){
  var modules = {
    "essentials":["support/TweenLite.min","support/jquery","container","networking","factory","save","load"],
    "os":["OSdriver","host"],
    "CSSPlugin":"support/plugins/CSSPlugin.min",
    "EasePack":"support/easing/EasePack.min",
    "Draggable":"support/utils/Draggable.min",
    "Bootstrap":"support/bootstrap/js/bootstrap.min",
    "BootstrapDialog":"support/bootstrap-dialog/js/bootstrap-dialog.min"
  }
  var configs = {
    editor:["essentials","os","CSSPlugin","EasePack","Bootstrap","BootstrapDialog"],
    present:["essentials"]
  }

  function loadConfig(name){
    var moduleList = configs[name];
    var scripts = [];
    for( i in moduleList ) {
      if( typeof modules[moduleList[i]] == "string")
        scripts.push(modules[moduleList[i]]);
      else
        for( j in modules[moduleList[i]])
          scripts.push(modules[moduleList[i]][j]);
    }
    requirejs(scripts,onReady);
  }

  loadConfig("editor");
}
