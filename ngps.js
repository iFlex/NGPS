//Infrastructure controller
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
ngps.status = {loaded:{}};

ngps.initParams = (function(){ var items = {}; 
var query = window.location.search.substring(1).split("&"); 
for( i in query){
	var pair = query[i].split("=")
	items[pair[0]] = pair[1];
}
return items;
})();

ngps.location = ngps.location || "";
ngps.root = ngps.root || document.body;
ngps.mode = "editor";
if(window.location.search.indexOf("mode")>-1)
    ngps.mode = ngps.initParams["mode"];//window.location.search.substring(window.location.search.indexOf("=")+1,window.location.search.length);

ngps.startup_callback = function(){
        platform.setup();
        ngps.initStatus = ngps.statuses["platform_setup"];
        ngps.loadDependencies(ignition,ngps.mode);
}

function loadRequiredStyleSheets(){
    var css = ['style/bootstrap/css/bootstrap.min.css','style/general.css'];
    for( i in css )
        ngps.utils.loadStyle(ngps.location+css[i]);
}

function loadEssentials(onLoaded){
    console.log("loading dynamic script loader...");

    var script = document.createElement('script');
    script.src = ngps.location+"scripts/support/require.js";
    script.onload = function () {
        console.log("loaded dynamic script loader - RequireJS");
        requirejs.config({baseUrl: ngps.location+'scripts'});
        ngps.initStatus = ngps.statuses["script_autoloader"];//loaded requireJS
        
        console.log("loading ngps drivers...");
        requirejs(["drivers"], function() {
            ngps.initStatus = ngps.statuses["drivers_loaded"];
            loadRequiredStyleSheets();
            
            try { onLoaded(); } catch ( e ){ console.log("BootScriptLoader: Bad callback provided:"+e);}
        });
    };
    document.body.appendChild(script);
}

ngps.loadDependencies = function(onReady,mode){
  var modules = {
    "essentials":["support/TweenLite.min","support/jquery","support/FileSaver","container","networking","factory","save","load"],
    "os":["support/host"],
    "Bootstrap":"support/bootstrap/js/bootstrap.min",
  }
  var configs = {
    editor:["essentials","os","Bootstrap"],
    view:["essentials","Bootstrap"],
	webshow:["essentials","os","Bootstrap"]
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
      if(ngps.status.loaded["factory"] === true && ngps.status.loaded["container"] === true) {
        ngps.initStatus = ngps.statuses["mode_initialised"];
        if(typeof onReady === 'function')
          onReady();
      } else { setTimeout(isReady,100); }
    }

    requirejs(scripts,isReady);
  }

  loadConfig(mode||"editor");
}

ngps.prezInit = function(){
	var mode = "view";
    ngps.loadDependencies(function(){
      factory.init(mode);
      doLoadPresentation();
    },"editor");
}

ngps.loadPresentation = function(presentation_data){

  function doLoadPresentation(){
    pLOAD.proceed(atob(presentation_data));
  }

  if(ngps.initStatus == ngps.statuses["not_initialised"]){ //no initialisation has been done whatsoever this is a cold start
    console.log("*** COLD START ***");
	ngps.startup_callback = ngps.prezInit;
    ngps.init();
  } else if(ngps.initStatus < ngps.statuses["mode_initialised"] ){//dependencies have not been loaded
    console.log("*** WARM START ***");
    ngps.prezInit();
  } else { //dependencies have been loaded
    console.log("*** HOT START ***");
    doLoadPresentation();
  }
}

function ignition(){
    ngps.initStatus = ngps.statuses["completed"];
    factory.init(ngps.mode);
}

ngps.init = function(root){
    if(ngps.location.legth > 0 && ngps.location[ngps.location.length-1] != "/" )
        ngps.location += "/";
    
    if(typeof root === "object")
        ngps.root = root;
    
    console.log("Loading NGPS from /"+ngps.location);
    console.log("Initialising NGPS on root element:"+ngps.root);

    ngps.initStatus = ngps.statuses["bare_start"];
    
    loadEssentials(ngps.startup_callback);
}