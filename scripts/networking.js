var network = function(){
  var server = "http://localhost:8080/";
  var HTTPrequest = function(method,url,params,oncomplete,error,pass_to_listener)
  {
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
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); //WARNING: This encoding will replace all base64 '+' with ' ' so PHP needs to deal with that

      http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
          console.log(http);
          oncomplete(http.responseText,pass_to_listener);
        }
        else if( http.status != 200 && error)
          error();
      }

      console.log( "HTTP " + method + " " + url +" data:"+params);
      http.send( params );
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
