var ngps = ngps || {};

ngps.init = function(ngpsLocation,rootElement){
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

        console.log("loading initialiser...");
        requirejs(['support/main'],function(){

          ngps.initStatus = 3;

          console.log("loaded initialiser");
          _INIT(function(){
            if(window.location.search.indexOf("mode")>-1){

              var mode = window.location.search.substring(window.location.search.indexOf("=")+1,window.location.search.length);
              console.log("INITIALISED MODE - "+mode);
              factory.init(mode);

            } else {
              factory.init('editor');
            }
          });
        });

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
