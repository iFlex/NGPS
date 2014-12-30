var HTTPrequest = function(method,url,params,oncomplete,pass_to_listener)
{
  if(typeof(params)!="string")
  {
    var aux = "";
    for(k in params)
      aux += k+"="+encodeURIComponent(params[k])+"&";
      params = aux;
    }
    if(method == "GET")
    {
      url += "?"+params;
      params = null;
    }
    var http = new XMLHttpRequest();
    http.open(method, url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); //WARNING: This encoding will replace all base64 '+' with ' ' so PHP needs to deal with that
    http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
        console.log("HTTP Response:"+http.responseText)
        oncomplete(http.responseText,http.status,pass_to_listener);
      }
    }

    console.log( "HTTP " + method + " " + url +" data:"+JSON.stringify(params));
    http.send( params );
}
