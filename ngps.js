var ngps = ngps || {};

ngps.statuses = {
  "not_initialised":0,
  "bare_start":1,
  "script_autoloader":2,
  "drivers_loaded":3,
  "platform_setup":4,
  "initialising_mode":5,
  "mode_initialised":6,
  "completed":7
}
//defaults
ngps.initStatus = ngps.statuses["not_initialised"];
ngps.location = ngps.location || "";
ngps.root = ngps.root || document.body;
ngps.mode = "editor";

ngps.init = function(overrideDependencyLoadCallback){
    if(!ngps.root)
      ngps.root = document.body;

    if(ngps.location.legth > 0 && ngps.location[ngps.location.length-1] != "/" )
        ngps.location += "/";

    console.log("Loading NGPS from /"+ngps.location);
    console.log("Initialising NGPS on root element:"+ngps.root);

    ngps.initStatus = ngps.statuses["bare_start"]; //TODO - change from magic numbers to
    function loadRequiredStyleSheets(){
      var css = ['style/bootstrap/css/bootstrap.min.css','style/general.css'];
        for( i in css )
          utils.loadStyle(ngps.location+css[i]);
    }

    function loadDrivers(){

      console.log("loading ngps drivers...");
      requirejs([ngps.location+"scripts/drivers.js"],function(){
        ngps.initStatus = ngps.statuses["drivers_loaded"];

        platform.setup(ngps.root);
        loadRequiredStyleSheets();

        console.log("loaded ngps drivers");
        requirejs.config({
            baseUrl: ngps.location+'scripts',
        });

        ngps.initStatus = ngps.statuses["platform_setup"];
        if( typeof overrideDependencyLoadCallback === "function")
          overrideDependencyLoadCallback();
        else {
          ngps.dependencyLoad(function(){
            ngps.initStatus = ngps.statuses["completed"];
            if(window.location.search.indexOf("mode")>-1){
              var mode = window.location.search.substring(window.location.search.indexOf("=")+1,window.location.search.length);
              console.log("INITIALISED MODE - "+mode);
              factory.init(mode);
            } else {
              factory.init('editor');
            }
          },ngps.mode);
        }
      });
    }

    function loadBootScripts(){
        console.log("loading dynamic script loader...");

        var script = document.createElement('script');
        script.src = ngps.location+"scripts/support/require.js";
        script.onload = function () {
          console.log("loaded dynamic script loader - RequireJS");
          ngps.initStatus = ngps.statuses["script_autoloader"];//loaded requireJS
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
    view:["essentials","Bootstrap"]
  }

  function loadConfig(name){
    ngps.initStatus = ngps.statuses["initialising_mode"];
    var moduleList = configs[name];
    var scripts = [];
    console.log("Initialising mode:"+name);

    for( i in moduleList ) {
      if( typeof modules[moduleList[i]] == "string")
        scripts.push(modules[moduleList[i]]);
      else
        for( j in modules[moduleList[i]])
          scripts.push(modules[moduleList[i]][j]);
    }

    console.log("Mode Scripts");
    console.log(scripts);

    function isReady(){
      if(factory.ready === true && containerData.ready === true) {
        ngps.initStatus = ngps.statuses["mode_initialised"];
        containerData.root = ngps.root;
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
    var mode = "view";
    ngps.dependencyLoad(function(){
      factory.init(mode);
      doLoadPresentation();
    },"editor");
  }

  if(ngps.initStatus == ngps.statuses["not_initialised"]){ //no initialisation has been done whatsoever
    console.log("*** COLD START ***");
    //this is a cold start
    ngps.init(doLoadDependencies);
  } else if(ngps.initStatus < ngps.statuses["mode_initialised"] ){//dependencies have not been loaded
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
