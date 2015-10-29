var ngps = ngps || {};

ngps.init = function(ngpsLocation,rootElement,overrideDependencyLoadCallback){
    if(ngpsLocation == undefined)
      ngpsLocation = "";
    if(rootElement == undefined)
      rootElement = document.body;

    console.log("Loading NGPS from /"+ngpsLocation);
    console.log("Initialising NGPS on root element:"+rootElement);
    ngps.location = ngpsLocation;
    ngps.root = rootElement;

    ngps.initStatus = 0;

    function loadRequiredStyleSheets(){
      var css = ['style/bootstrap/css/bootstrap.min.css','style/general.css'];
        for( i in css )
          utils.loadStyle(css[i]);
    }

    function loadDrivers(){

      console.log("loading ngps drivers...");
      requirejs([ngps.location+"scripts/drivers.js"],function(){
        ngps.initStatus = 2;

        platform.setup(rootElement);
        loadRequiredStyleSheets();

        console.log("loaded ngps drivers");
        requirejs.config({
            baseUrl: ngps.location+'scripts',
        });

        ngps.initStatus = 3;
        if( typeof overrideDependencyLoadCallback === "function")
          overrideDependencyLoadCallback();
        else {
          ngps.dependencyLoad(function(){
            ngps.initStatus = 5;
            if(window.location.search.indexOf("mode")>-1){
              var mode = window.location.search.substring(window.location.search.indexOf("=")+1,window.location.search.length);
              console.log("INITIALISED MODE - "+mode);
              factory.init(mode);
            } else {
              factory.init('editor');
            }
          });
        }
      });
    }

    function loadBootScripts(){
        console.log("loading dynamic script loader...");

        var script = document.createElement('script');
        script.src = ngpsLocation+"scripts/support/require.js";
        script.onload = function () {
          console.log("loaded dynamic script loader - RequireJS");
          ngps.initStatus = 1;//loaded requireJS
          loadDrivers();
        };
        document.body.appendChild(script);
    }

    loadBootScripts();
}

ngps.dependencyLoad = function(onReady,mode){
  var modules = {
    "essentials":["support/TweenLite.min","support/jquery","support/FileSaver","container","networking","factory","save","load"],
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
      if(factory.ready === true && containerData.ready === true) {
        ngps.initStatus = 4;
        if(typeof onReady === 'function')
          onReady();
      }
      else
        setTimeout(isReady,100);
    }

    requirejs(scripts,isReady);
  }

  loadConfig(mode||"editor");
}

ngps.loadPresentation = function(presentation_data){

  function doLoadPresentation(){
    pLOAD.proceed(atob(presentation_data));
  }

  function doLoadDependencies(){
    ngps.dependencyLoad(doLoadPresentation,"view");
  }

  if(ngps.initStatus == 0){ //no initialisation has been done whatsoever
    console.log("*** COLD START ***");
    //this is a cold start
    ngps.init("",document.body,doLoadDependencies);
  } else if(ngps.initStatus < 4 ){//dependencies have not been loaded
    console.log("*** WARM START ***");
    doLoadDependencies();
  } else { //dependencies have been loaded
    console.log("*** HOT START ***");
    doLoadPresentation();
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
