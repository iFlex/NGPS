loadAppCode("_webshow/components/live",function(args){
  this.config = {interface:"none"}
  //var http = new XMLHttpRequest();
  var server = "http://localhost:8080/";
  var presentation  = factory.presentation;
  var audience = factory.audience;
  var remote = factory.remote;
  var module = this;
  var canListen = false;
  args.parent.setPermission('save',false);
	args.parent.setPermission('connect',false);
  args.parent.setPermission('noOverride',true);

  //http.send( params );
  this.setup = function(options){
    if(options) {
      server = options.server || network.getServerAddress();
      presentation = options.presentation || presentaton;
      audience = options.audience || audience;
      remote = options.remote || remote;
    }
  }
  function _listen(){
    console.log("Listening:"+server+'live');
    var http = new XMLHttpRequest();
    http.open("POST", server+'live', true);
    http.setRequestHeader("Content-type", "text/plain"); //WARNING: This encoding will replace all base64 '+' with ' ' so PHP needs to deal with that
    http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
        console.log("HTTP LIVE LISTENER DATA");
        console.log(http);
        handleRequest(JSON.parse(http.responseText));
        console.log("#######################");
        if(canListen)
          _listen();
      }
      else if( http.status != 200){
        if(canListen)
          _listen();
      }
    }
    data = {presentation:presentation,action:"listen"};
    if(audience && audience.length>0)
      data.audience = audience;
    if(remote && remote.length>0)
      data.remote = remote;
    console.log("sending:"+JSON.stringify(data));
    http.send(JSON.stringify(data));
  }
  function _send(data){
    try{
      var httpo = new XMLHttpRequest();
      httpo.open("POST", server+'live', true);
      httpo.setRequestHeader("Content-type", "text/plain"); //WARNING: This encoding will replace all base64 '+' with ' ' so PHP needs to deal with that
      data.presentation = presentation;
      if(!audience)
        data.remote = remote;
      else if(!remote)
        data.audience = audience;
      httpo.send(JSON.stringify(data));
    }catch(e){
      console.error("Could not send HTTP data:"+e);
    }
  }
  this.send = function(data){
    _send(data);
  }
  this.listen = function(){
    canListen = true;
    _listen();
  }
  this.stopListenint = function(){
    canListen = false;
  }
  this.init = function(){
    console.log(args.parent.appFullPath+" - initialising...");
    console.log(args);
    if(args.webshow)
      args.webshow.live = this;
    if(args.doStart == true){
      this.setup();
      this.listen();
    }
  }
  this.shutdown = function(){
    console.log(args.parent.appFullPath+" - shutdown...");
  }

  function handleRequest(data){
    console.log(data);
    if(data.action == "getPresentation")
      sendPresentation(data);
    if(data.action == "update")
      applyUpdate(data);
  }
  function sendPresentation(data){
    var p = {}
    p.data = JSON.strinfigy(save.RAMsave());
    p.data.action = "setPresentation";
    p.action = "setPresentation";

    console.log("sending")
    console.log(p);
    _send(p);
  }
  function applyUpdate(data){

  }
});
