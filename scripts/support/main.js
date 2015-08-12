var _INITIALISED = false;
function _INIT(onReady,mode){
  var modules = {
    "essentials":["support/TweenLite.min","support/jquery","container","networking","factory","save","load"],
    "os":["OSdriver","host"],
    "Bootstrap":"support/bootstrap/js/bootstrap.min",
  }
  var configs = {
    editor:["essentials","os","Bootstrap"],
    present:["essentials","Bootstrap"]
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
  _INITIALISED = true;
  loadConfig(mode||"editor");
}

function _TOTAL_INIT(presentation_data){
  function _total_init(){
    pLOAD.proceed(atob(presentation_data));
  }

  if(!_INITIALISED) {
    _INIT(_total_init,"view");
  }
  else {
    _total_init();
  }
}
