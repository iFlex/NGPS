var DEBUG_LIVE = 0;
loadAppCode("_webshow/components/live",function(args){
  this.config = {interface:"none"}
  //var http = new XMLHttpRequest();
  var endpoint = "live";
  var presentation  = (factory.session)?factory.session.presentation:undefined;
  var audience = (factory.session)?factory.session.audience:undefined;
  var remote = (factory.session)?factory.session.remote:undefined;
  var rootDevice = (factory.session)?factory.session.rootDevice:undefined;
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
      if(factory.session)
        rootDevice = factory.session.rootDevice;
      else
        rootDevice = 0;
    }

    if(audience)
      GEM.addEventListener("loaded",0,offerPresentation,this);
    if(remote)
      args.remote = factory.newGlobalApp(args.parent.appName+"/remote",{live:this});


    socket = io(network.getServerAddress());
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
  this.cancelSession = function(){
    try{
      socket.disconnect();
    } catch(e){
      console.error("Failed disconnect",e);
    }

    if(args.remote && args.remote.isApp)
      args.remote.discard();
    delete factory.session;
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

    if(data.action == "setPresentation" && !factory.session.remoteInitialised){
      pLOAD.doTranslateAddress = false;
      pLOAD.proceed(data.data);
      args.remote.app.continue();
    }

    if(data.action == "event"){
      console.log("-------- REMOTE EVENT --------");
      console.log(data.event);
      var target = 0;
      try {
        target = findContainer(data.event.target);
        target = target.DOMreference;
      } catch(e){
        console.log("Could not identify target",e);
        return;
      }
      //GEM.fireEvent(data.event);
      simulateEvent(data.event.original,data.event.event.toLowerCase(),target);
    }
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

  var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
  }

  function simulateEvent(e,eventName,element){

    var options = e;
    var oEvent, eventType = e.name;

    for (var name in eventMatchers)
    {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        console.error('Only HTMLEvents and MouseEvents interfaces are supported ' + eventName);

    console.log("creating event");
    console.log(options);
    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pageX, options.pageY, options.clientX, options.clientY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        console.log("Dispatcing with dispatchEvent()");
        console.log(oEvent);
        element.dispatchEvent(oEvent);
    }
    else
    {
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        console.log("document.createEventObject");
        console.log(oEvent);
        element.fireEvent('on' + eventName, oEvent);
    }
  }
});
