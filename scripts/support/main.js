var _INITIALISED = false;
function _INIT(onReady,mode){
  var modules = {
    "essentials":["support/TweenLite.min","support/jquery","support/jquery.ui","container","networking","factory","save","load"],
    "os":["support/host"],
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

    function isReady(){
      if(factory.ready && containerData.ready) {
        _INITIALISED = true;
        if(onReady)
          onReady();
      }
      else
        setTimeout(isReady,100);
    }
    requirejs(scripts,isReady);
  }
  loadConfig(mode||"editor");
}

function _TOTAL_INIT(presentation_data){
  function _total_init(){
    pLOAD.proceed(atob(presentation_data));
  }
  console.log("_TOTAL_INIT: is env initialised?:"+_INITIALISED);
  if(!_INITIALISED) {
    console.log("_TOTAL_INIT: cold start..");
    _INIT(_total_init,"view");
  }
  else {
    console.log("_TOTAL_INIT: warm start..");
    _total_init();
  }
}
this.factory = this.factory || {};
factory.setup ={
editor:function(){
  factory.newGlobalApp('dialogue');
  factory.newGlobalApp('edit');
  factory.newGlobalApp('debug');
  //factory.root.display.DOMreference.style.background = "red";
  //factory.newGlobalApp('_test');
  console.log("loaded edit setup");
},
view:function(){
  factory.newGlobalApp('dialogue');
  factory.newGlobalApp('zoom',{offsetY:0});
  setTimeout(function(){Dialogue.import.show({
    title:"Choose presentation to view",
    fileHandler:function(e){ pLOAD.fromHTML(atob(e.target.result.split(",")[1])); },
    urlHandler:function(){},
    target:factory.base
  });},2000);
  factory.newGlobalApp('debug');
  console.log("Loaded view setup");
},
webshow:function(){
  factory.newGlobalApp('dialogue');
  factory.newGlobalApp('_webshow');
  factory.newGlobalApp('debug');
  console.log("loaded webshow setup");
}};
console.log(factory);
