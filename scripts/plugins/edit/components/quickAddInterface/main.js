this.Editor = this.Editor || {};

loadAppCode("edit/components/quickAddInterface",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.permissions.save = false;
  this.parent.permissions.connect = false;

  this.interface = {};
  this.x = 0;
  this.y = 0;

  var interfaceSize = 32;
  var sizeCoef = 0.75;
  var radius = 48;
  var connectActive = false;
  this.overrideEdit = false;

  Editor.addInterface = this;
  this.active = true;

  this.onClick = function(e){
    if(!Editor.addInterface.active)
      return;

    Editor.addInterface.event = e;
    if( (e.target.permissions.edit) || e.target.UID < 3 )
    {
      if(connectActive)
      {
        connectActive = false;
        Editor.addInterface.overrideEdit = false;
        Editor.link.trigger(e);
        return;
      }
      //use pagex & pagey or screenx & screeny
      show(e.nativeEvent.pageX,e.nativeEvent.pageY,e.target);
    }
  }
  this.hide = function(){
    for( k in Editor.addInterface.interface)
    {
      Editor.addInterface.interface[k].discard();
      delete Editor.addInterface.interface[k];
    }
    Editor.addInterface.interface = {}
    if(closeButton.button)
    {
      closeButton.button.discard();
      closeButton.button = 0;
    }
  }
  function show( globalX, globalY , parent){

    if(parent && parent.permissions.quickAddInterface == false)
      return;

    console.log("Adding to container:"+utils.debug(parent)+" >> "+utils.debug(parent.permissions));
    Editor.addInterface.hide();

    if(parent.UID < 3)
      parent = factory.root;

    Editor.addInterface.origin = parent; //this causes cyclic references in save tree
    Editor.addInterface.x = globalX;
    Editor.addInterface.y = globalY;
    //console.log("Click happened on:"+utils.debug(parent)+" @ "+globalX+"|"+globalY);
    var ctx = Editor.addInterface;
    var pos = factory.root.viewportToSurface(globalX,globalY);
    var r = radius;
    var maxPerRadius = Math.floor(2*Math.PI*r/interfaceSize);
    var index = 0;
    var nrc = ( buttons.length < maxPerRadius ) ? buttons.length : maxPerRadius;
    var angle = (360 / nrc )*Math.PI/180;

    closeButton.button = makeButton(closeButton,pos.x,pos.y);
    for( b in buttons ){
      if( index > maxPerRadius )
      {
        r += interfaceSize;
        maxPerRadius = Math.floor(2*Math.PI*r/interfaceSize);
        index = 0;
        angle = (360 / maxPerRadius )*Math.PI/180;
      }

      var cnt = makeButton(buttons[b],pos.x + Math.cos(-angle*index)*r,pos.y + Math.sin(-angle*index)*r);
      ctx.interface[b] = cnt;
      index++;
    }
  }
  function makeButton(dsc,x,y){
    var descriptor = {x:0,y:0,width:interfaceSize,height:interfaceSize,background:"white",border_radius:["20%"],border_size:0,cssText:"z-index:4;",permissions:{save:false,connect:false}};
    var cnt = factory.newContainer(descriptor,"simple_rect",factory.root);
    cnt.DOMreference.innerHTML = "<center><span class='"+dsc.icon+"' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>";
    for( e in dsc.callbacks)
      cnt[e] = dsc.callbacks[e];

    cnt.putAt(x,y,0.5,0.5);
    return cnt;
  }
  this.init = function(){
    console.log(this.parent.appPath+" - initialising...");
    //GEM.addEventListener("triggered",0,clickHandler,this);
    factory.root.addEventListener("triggered",Editor.addInterface.onClick);
  }
  this.shutdown = function(){
    console.log(this.parent.appPath+" - shutdown...");
    //GEM.removeEventListener("triggered",0,clickHandler,this);
    factory.root.removeEventListener("triggered",Editor.addInterface.onClick);
  }
  //apps can attach buttons to this interface
  //TODO: function should require the app's name and listen for the app's shutdown event, when that happens the buttons whould be deleted from the interface
  this.addButton = function(options,app){
    if(!app)
      return;
    options.owner = app;
    buttons.push(options);
  }
  //adders
  function _addContainer(noInterface,descriptor){ //causes cyclic references in save tree
    Editor.addInterface.hide();

    var d = utils.merge({
    x:0,y:0,
    width:Editor.dock.possize.width,
    height:Editor.dock.possize.height,
    permissions:{track:true,connect:true,edit:true}},descriptor);

    var container = factory.newContainer(d,"c000000",Editor.addInterface.origin);
    var pos = container.global2local(Editor.addInterface.x,Editor.addInterface.y);
    container.putAt(pos.x,pos.y,0.5,0.5);

    if(Editor.sizer && !noInterface)
      Editor.sizer.show(container);

    return container;
  }
  function addContainer(){
    _addContainer();
  }
  function addCamera(){
    Editor.addInterface.hide();

    var dparent = Editor.addInterface.origin;
    if(Editor.addInterface.origin.UID < 3)
      dparent = factory.base;

    var container = factory.newCamera({
      x:0,
      y:0,
      width:dparent.getWidth()*0.8,
      height:dparent.getHeight()*0.8,
      surfaceWidth:50000,surfaceHeight:50000,CAMERA_type:"scroller",
      permissions:{track:true,connect:true,edit:true}},"c000000",
      Editor.addInterface.origin,false,true);

      var pos = container.global2local(Editor.addInterface.x,Editor.addInterface.y);
      container.putAt(pos.x,pos.y,0.5,0.5);

      if(Editor.sizer)
        Editor.sizer.show(container);
    }
  function addText(){
    var container = _addContainer(true,{type:"textarea",ignoreTheme:true,background:"rgba(255,255,255,0.5)"});
    container.permissions.children = false;
    container.permissions.quickAddInterface = false;

    container.editInterface = 'text';
    Editor.sizer.show(container);
    keyboard.focus(container);
    container.addEventListener("triggered",function(data){ Editor.sizer.show(data['target']);});
    container.addEventListener("triggered",function(){ keyboard.focus(container); });
  }

  function addVideo(){
    Editor.addInterface.hide();
    console.log("Adding Video");
    if(Editor.addInterface.origin.UID < 3)
      Editor.addInterface.origin = factory.base;
    if(Editor.videos)
      Editor.videos.show(Editor.addInterface.origin);
  }
  function addImage(){
    Editor.addInterface.hide();
    console.log("Adding image");
    if(Editor.addInterface.origin.UID < 3)
      Editor.addInterface.origin = factory.base;
    if(Editor.images)
      Editor.images.show(Editor.addInterface.origin);
  }
  function addWebsite(){
    Editor.addInterface.x = 0;
    Editor.addInterface.hide();
    console.log("Adding Website");
    var container = factory.newContainer({
    x:0,
    y:0,
    width:Editor.addInterface.origin.getWidth(),
    height:300,
    permissions:{track:true,connect:true,edit:true}},"c000000",Editor.addInterface.origin,false,true);

    var pos = container.global2local(Editor.addInterface.x,Editor.addInterface.y);
    container.putAt(pos.x,pos.y,0,0);
    container.addPrimitive({type:"iframe",content:{src:"http://www.gla.ac.uk",width:"100%",height:"100%"}});
  }
  function connect(){
    Editor.addInterface.hide();
    connectActive = true;
    Editor.addInterface.overrideEdit = true;
    Editor.link.trigger(Editor.addInterface.event);
  }
  var closeButton = {
    name:"close",
    description:"Close interface",
    icon:"glyphicon glyphicon-remove-circle",
    callbacks:{onTrigger:Editor.addInterface.hide}
  }

  var buttons = [{
    name:"container",
    description:"Add a new container",
    icon:"glyphicon glyphicon-unchecked",
    callbacks:{onTrigger:addContainer}
  },{
    name:"Text",
    description:"Add Text",
    icon:"glyphicon glyphicon-font",
    callbacks:{onTrigger:addText}
  },{
    name:"image",
    description:"Add an image",
    icon:"glyphicon glyphicon-picture",
    callbacks:{onTrigger:addImage}
  },{
    name:"connect",
    description:"Connect this object with another one",
    icon:"glyphicon glyphicon-pushpin",
    callbacks:{onTrigger:connect}
  },{
    name:"video",
    description:"Add a video",
    icon:"glyphicon glyphicon-film",
    callbacks:{onTrigger:addVideo}
  },{
    name:"website",
    description:"Add a website in your presentation",
    icon:"glyphicon glyphicon-globe",
    callbacks:{onTrigger:addWebsite}
  },{
    name:"camera",
    description:"Add a new container",
    icon:"glyphicon glyphicon-camera",
    callbacks:{onTrigger:addCamera}
  }];
});
