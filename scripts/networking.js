var network = function(){
  var server = "http://"+window.location.host+"/";
  this.getServerAddress = function(){
    return server;
  }
  this.setServerAddress = function(s){
    if(s.indexOf("http://"))
      s = "http://"+s+"/";

    console.log("Set new networking address:"+s);
    server = s;
  }
  var HTTPrequest = function(method,url,params,oncomplete,error,pass_to_listener)
  {
    try {
      if( method == "GET"){
        if(typeof(params) != "string"){
          var aux = "";
          for(k in params)
            aux += k+"="+encodeURIComponent(params[k])+"&";
            params = aux;
        }
        url += "?"+params;
        params = null;
      }
      else if( typeof(params) != "string" )
          params = JSON.stringify(params);

        var http = new XMLHttpRequest();
        http.open(method, url, true);
        http.setRequestHeader("Content-type", "text/plain"); //WARNING: This encoding will replace all base64 '+' with ' ' so PHP needs to deal with that
        http.onreadystatechange = function() {//Call a function when the state changes.
          if(http.readyState == 4 && http.status == 200) {
            console.log(http);
            oncomplete(http.responseText,pass_to_listener);
          }
          else if( http.status != 200 && error)
            error(),console.log("LAME!");
        }
      console.log( "HTTP " + method + " " + url +" data:"+params);
      http.send( params );
    } catch(e) {
      error();
    }
  }

  this.GET = function(path,success,error,pass){
    if( path.indexOf("http://") < 0 || path.indexOf("https://") < 0 )
      path = server + path;

    HTTPrequest("GET",path,null,success,error,pass);
  }
  this.POST = function(path,data,success,error,pass){
    if( path.indexOf("http://") < 0 || path.indexOf("https://") < 0 )
      path = server + path;
    HTTPrequest("POST",path,data,success,error,pass);
  }
};

this.network = new network();
