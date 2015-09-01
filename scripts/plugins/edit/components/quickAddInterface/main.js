this.Editor = this.Editor || {};

loadAppCode("edit/components/quickAddInterface",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.setPermission('save',false);
  this.parent.setPermission('connect',false);

  this.interface = {};
  this.active = true;
  this.x = 0;
  this.y = 0;

  Editor.addInterface = this;
  var buttons;
  var interfaceSize = 32;
  var sizeCoef = 0.75;
  var radius = 48;
  this.onClick = function(e){
    if(!Editor.addInterface.active)
      return;
    Editor.addInterface.event = e;
    show(e.nativeEvent.pageX,e.nativeEvent.pageY,e.target);
  }
  this.hide = function() {
    for( k in Editor.addInterface.interface){
      Editor.addInterface.interface[k].hide();
      Editor.addInterface.interface[k].DOMreference.className = "";
    }

    if(closeButton.button){
      closeButton.button.hide();
      closeButton.button.DOMreference.className = "";
    }
    hide();
  }

  function hide(){
    for( b in buttons ){
      Editor.addInterface.interface[b].hide();
    }
  }

  function show( globalX, globalY , parent){
    //console.log("perms:"+parent.getPermission('quickAddInterface'));
    if(parent && parent.getPermission('quickAddInterface') == false)
      return;
    Editor.addCloseCallback(Editor.addInterface.hide);

    if(parent.UID < 3)
      parent = factory.root;

    Editor.shared.selected = parent; //this causes cyclic references in save tree
    Editor.shared.selected = parent;
    Editor.addInterface.x = globalX;
    Editor.addInterface.y = globalY;
    //console.log("Click happened on:"+utils.debug(parent)+" @ "+globalX+"|"+globalY);
    var ctx = Editor.addInterface;
    var pos = factory.root.viewportToSurface(globalX,globalY);
    var r = radius;
    var maxPerRadius = Math.floor(2*Math.PI*r/interfaceSize);
    var index = 0;
    var nrc = ( buttons.length < maxPerRadius ) ? buttons.length : maxPerRadius;
    if( nrc < 6)
      nrc = 10;
    var angle = (360 / nrc )*Math.PI/180;

    closeButton.button.show();
    closeButton.button.putAt(pos.x,pos.y,0.5,0.5);
    closeButton.button.DOMreference.style.zIndex = containerData.containerIndex+1;
    //closeButton.button.DOMreference.className = "sizeTrans";
    for( b in buttons ){
      Editor.addInterface.interface[b].show();
      Editor.addInterface.interface[b].DOMreference.style.zIndex = containerData.containerIndex+1;
      if( index > maxPerRadius )
      {
        r += interfaceSize;
        maxPerRadius = Math.floor(2*Math.PI*r/interfaceSize);
        index = 0;
        angle = (360 / maxPerRadius )*Math.PI/180;
      }
      Editor.addInterface.interface[b].putAt(pos.x + Math.cos(-angle*index)*r,pos.y + Math.sin(-angle*index)*r,0.5,0.5);
      //Editor.addInterface.interface[b].DOMreference.className = "sizeTrans";
      index++;
    }

  }
  function makeButton(dsc,x,y){
    console.log("QAinterface making button");
    var descriptor = {x:0,y:0,width:interfaceSize,height:interfaceSize,background:"white",border_radius:[interfaceSize/2+"px"],border_size:0,cssText:"z-index:4;",permissions:{save:false,connect:false}};
    var cnt = factory.newContainer(descriptor,"simple_rect",factory.root);
    cnt.DOMreference.innerHTML = "<center><span class='"+dsc.icon+"' style='font-size:"+interfaceSize*sizeCoef+"px'></span><i style='font-size:10px'>"//+dsc.name
    +"</i></center>";
    for( e in dsc.callbacks)
      cnt[e] = dsc.callbacks[e];

    cnt.putAt(x,y,0.5,0.5);
    return cnt;
  }
  function discardInterface(){
    if(closeButton.button && closeButton.button.discard)
    {
      closeButton.button.discard();
      for( b in buttons )
        Editor.addInterface.interface[b].discard();
    }
  }
  this.setInterface = function(interfaceNo){
    discardInterface();

    if(!interfaceNo)
      interfaceNo = 0;
    buttons = button_store[interfaceNo];
    closeButton.button = makeButton(closeButton,0,0);
    for( b in buttons ){
      var cnt = makeButton(buttons[b],0,0);
      Editor.addInterface.interface[b] = cnt;
    }
  }
  this.init = function(){
    console.log(this.parent.appPath+" - initialising...");
    this.setInterface(0);
  }
  this.shutdown = function(){
    console.log(this.parent.appPath+" - shutdown...");
    discardInterface();
    delete Editor.addInterface;
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
  function _addContainer(noInterface,descriptor,tag){ //causes cyclic references in save tree
    Editor.addInterface.hide();
    var dparent = Editor.shared.selected;
    if(dparent.UID < 3 && factory.root.display.UID != dparent.UID)
      dparent = factory.base;

    var d = utils.merge({
    x:0,y:0,
    width:dparent.getWidth()*0.2,
    height:dparent.getWidth()*0.2,
    permissions:{track:true,connect:true,edit:true}},descriptor,true);

    var container = factory.newContainer(d,((tag)?tag:"c000000"),Editor.shared.selected);
    var pos = container.global2local(Editor.addInterface.x,Editor.addInterface.y);
    container.putAt(pos.x,pos.y,0.5,0.5);

    if(Editor.sizer && !noInterface)
      Editor.sizer.show(container);

    return container;
  }
  this.newContainer = function(where){
    return _addContainer(true);
  }
  //event listeners
  function addContainer(){
    _addContainer();
  }
  function addCamera(){
    Editor.addInterface.hide();
    var dparent = Editor.shared.selected;
    if(dparent.UID < 3)
      dparent = factory.base;

    var container = factory.newCamera({
      x:0,
      y:0,
      width:dparent.getWidth()*0.8,
      height:dparent.getHeight()*0.8,
      surfaceWidth:50000,surfaceHeight:50000,CAMERA_type:"scroller",
      permissions:{track:false,connect:true,edit:true}},"c000000",
      Editor.shared.selected,false,true);

      var pos = container.global2local(Editor.addInterface.x,Editor.addInterface.y);
      container.putAt(pos.x,pos.y,0.5,0.5);

      if(Editor.sizer)
        Editor.sizer.show(container);
    }
  function addText(){
    //var container = _addContainer(true,null,"text_field");
    var container = (Editor.shared.selected.UID>2)?Editor.shared.selected:_addContainer();
    Editor.text.makeTextContainer(container);
    Editor.sizer.show(container);
    keyboard.focus(container);
  }

  function addVideo(){
    Editor.addInterface.hide();
    console.log("Adding Video");
    if(Editor.shared.selected.UID < 3)
      Editor.shared.selected = factory.base;
    if(Editor.videos)
      Editor.videos.show(Editor.shared.selected);
  }
  function addImage(){
    Editor.addInterface.hide();
    console.log("Adding image");
    Editor.onAddImage();
  }
  function addWebsite(){
    Editor.addInterface.hide();
    console.log("Adding Video");
    if(Editor.shared.selected.UID < 3)
      Editor.shared.selected = factory.base;
    if(Editor.videos)
      Editor.videos.show(Editor.shared.selected);
  }
  function connect(){
    Editor.addInterface.hide();
    Editor.link.trigger(Editor.addInterface.event);
  }
  function addCGI(e){
    Editor.addInterface.hide();
    var dparent = Editor.shared.selected;
    if(dparent.UID < 3)
      dparent = factory.base;
    if(Editor.effects)
      Editor.effects.show(dparent);
  }
  var closeButton = {
    name:"close",
    description:"Close interface",
    icon:"glyphicon glyphicon-remove",
    callbacks:{onTrigger:Editor.addInterface.hide}
  }

  var button_store = [[{
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
  },{
    name:"CGI",
    description:"Add an effect",
    icon:"glyphicon glyphicon-star",
    callbacks:{onTrigger:addCGI}
  }],[{
    name:"ch_shape",
    description:"Change the shape of the container",
    icon:"glyphicon glyphicon-stop",
    callbacks:{onTrigger:function(){
      Editor.configureContainer.show(0);
      factory.root.cfocusOn(Editor.sizer.target,{speed:1});}}
  },{
    name:"ch_border",
    description:"Change the border style of the container",
    icon:"glyphicon glyphicon-unchecked",
    callbacks:{onTrigger:function(){
      Editor.configureContainer.show(1);
      factory.root.cfocusOn(Editor.sizer.target,{speed:1});}}
  },{
    name:"ch_colors",
    description:"Change the color of the container",
    icon:"glyphicon glyphicon-pencil",
    callbacks:{onTrigger:function(){
      Editor.configureContainer.show(2);
      factory.root.cfocusOn(Editor.sizer.target,{speed:1});}}
  },{
    name:"CGI",
    description:"Add an effect",
    icon:"glyphicon glyphicon-star",
    callbacks:{onTrigger:addCGI}
  }]];
});
