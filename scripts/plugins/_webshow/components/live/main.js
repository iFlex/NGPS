var DEBUG_LIVE = 0;
loadAppCode("_webshow/components/live",function(args){
  this.config = {interface:"none"}
  //var http = new XMLHttpRequest();
  var server = "http://localhost:8080/";
  var endpoint = "live";
  var presentation  = factory.presentation;
  var audience = factory.audience;
  var remote = factory.remote;
  var rootDevice = factory.rootDevice;
  var module = this;
  var socket = 0;
  args.parent.setPermission('save',false);
	args.parent.setPermission('connect',false);
  args.parent.setPermission('noOverride',true);

  DEBUG_LIVE = this;
  //http.send( params );
  this.setup = function(options){
    if(options) {
      server = options.server || network.getServerAddress();
      presentation = options.presentation || presentaton;
      audience = options.audience || audience;
      remote = options.remote || remote;
      rootDevice = factory.rootDevice;
    }

    if(audience)
      GEM.addEventListener("loaded",0,offerPresentation,this);
    if(remote)
      GEM.addEventListener("triggered",0,sendClick,this);

    socket = io(server);
    var data = {action:"register",presentation:presentation};
    if(audience)
      data.audience = audience;
    if(remote)
      data.remote = remote;
    console.log("connecting to endpoint:"+JSON.stringify(data));
    socket.emit('live',JSON.stringify(data));

    socket.on(endpoint, function (d) {
      console.log(d);
      try {
        d = JSON.parse(d);
      } catch ( e ){
        console.error(e);
        return;
      }
      actUponData(d);
    });
  }

  function _send(data){
    data.presentation = presentation;
    if(!audience)
      data.remote = remote;
    else if(!remote)
      data.audience = audience;
    if(rootDevice)
      data.rootDevice = rootDevice;

    console.log("Sending ***");
    console.log(data);
    try {
      if(socket)
        socket.emit(endpoint,JSON.stringify(data));
    } catch(e){
      console.error(e);
    }
  }

  this.send = function(data){
    _send(data);
  }

  this.init = function(){
    console.log(args.parent.appFullPath+" - initialising...");
    console.log(args);
    //require(["socket.io/socket.io.js"]);
    //var scio = document.createElement("script");
    //scio.src = "socket.io/socket.io.js";

    if(args.webshow)
      args.webshow.live = this;
    if(args.doStart == true)
      this.setup();
  }
  this.shutdown = function(){
    console.log(args.parent.appFullPath+" - shutdown...");
  }

  function actUponData(data){
    if(data.action == "notification"){
      if(data.info == "NEW_REMOTE") // proceed to presentation
        args.webshow.add.app.continue();
    }

    if(data.action == "offerPresentation")
      _send({action:"getPresentation"});

    if(data.action == "getPresentation")
      sendPresentation(data);

    if(data.action == "setPresentation")
      pLOAD.proceed(data.data);
  }

  function sendPresentation(data){
    var p = {}
    p.data = JSON.stringify(save.RAMsave());
    p.action = "setPresentation";
    console.log("sending");
    console.log(p);
    _send(p);
  }

  //audience member 1 offers presentaiton to remote controllers
  function offerPresentation(){
    console.log("Offering presentation to remote");
    _send({action:"offerPresentation"})
  }
  this.offer = function(){
    offerPresentation();
  }

  function sendClick(e){
    var d = {};
    d.action = "update";
    d.type = "click";
    d.target = e.target.UID;
    _send(d);
  }
});
