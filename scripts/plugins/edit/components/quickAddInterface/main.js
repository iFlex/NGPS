this.Editor = this.Editor || {};

loadAppCode("edit/components/quickAddInterface",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

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
    console.log("Add Interface Trigger");
    console.log(e);
    Editor.addInterface.event = e;
    show(e.nativeEvent.pageX,e.nativeEvent.pageY,e.target);
  }

  this.hide = function() {
    console.log("HIDING add interface");
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
    if(parent && parent.getPermission('quickAddInterface') == false){
      console.log("Premission to show add interface denied");
      return;
    }

    Editor.addCloseCallback(Editor.addInterface.hide);

    if(parent.UID < 3)
      parent = factory.root;
    console.log("Showing add interface with parent:"+parent.UID);
    Editor.addInterface.x = globalX;
    Editor.addInterface.y = globalY;
    //console.log("Click happened on:"+utils.debug(parent)+" @ "+globalX+"|"+globalY);
    var ctx = Editor.addInterface;
    var scale = 1/factory.root.czoomLevel;
    var pos = factory.root.viewportToSurface(globalX,globalY);
    var r = radius;
    var maxPerRadius = Math.floor(2*Math.PI*r/interfaceSize);
    var index = 0;
    var nrc = ( buttons.length < maxPerRadius ) ? buttons.length : maxPerRadius;
    if( nrc < 6)
      nrc = 10;
    var angle = (360 / nrc )*Math.PI/180;

    closeButton.button.show();
    closeButton.button.scale(scale,0.5,0.5,0,true);
    closeButton.button.putAt(pos.x,pos.y,0.5,0.5);
    closeButton.button.DOMreference.style.zIndex = containerData.containerIndex+1;
    //closeButton.button.DOMreference.className = "sizeTrans";
    for( b in buttons ){
      Editor.addInterface.interface[b].show();
      Editor.addInterface.interface[b].scale(scale,0.5,0.5,0,true);
      Editor.addInterface.interface[b].DOMreference.style.zIndex = containerData.containerIndex+1;
      if( index > maxPerRadius )
      {
        r += interfaceSize;
        maxPerRadius = Math.floor(2*Math.PI*r/interfaceSize);
        index = 0;
        angle = (360 / maxPerRadius )*Math.PI/180;
      }
      Editor.addInterface.interface[b].putAt(pos.x + Math.cos(-angle*index)*r*scale,pos.y + Math.sin(-angle*index)*r*scale,0.5,0.5);
      //Editor.addInterface.interface[b].DOMreference.className = "sizeTrans";
      index++;
    }

  }
  function makeButton(dsc,x,y){
    console.log("QAinterface making button");
    var descriptor = {x:0,y:0,width:interfaceSize,height:interfaceSize,background:"white",border_radius:[interfaceSize/2+"px"],border_size:0,cssText:"z-index:4;",permissions:data.parent.getPermissions()};
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
  function attachInterfaceButton(b){
    var cnt = makeButton(buttons[b],0,0);
    Editor.addInterface.interface[b] = cnt;
  }
  this.setInterface = function(interfaceNo){
    discardInterface();

    if(!interfaceNo)
      interfaceNo = 0;
    buttons = button_store[interfaceNo];
    closeButton.button = makeButton(closeButton,0,0);
    for( b in buttons )
      attachInterfaceButton(b);
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
    attachInterfaceButton(buttons.length - 1);
  }
  //adders
  this.newContainer = function(where){
    return _addContainer(true);
  }

  function connect(){
    Editor.addInterface.hide();
    Editor.link.trigger(Editor.addInterface.event);
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
    icon:"glyphicon glyphicon-plus",
    callbacks:{onTrigger:Editor.addContainer}
  },{
    name:"Text",
    description:"Add Text",
    icon:"glyphicon glyphicon-font",
    callbacks:{onTrigger:Editor.addText}
  },{
    name:"image",
    description:"Add an image",
    icon:"glyphicon glyphicon-picture",
    callbacks:{onTrigger:Editor.addImage}
  },{
    name:"connect",
    description:"Connect this object with another one",
    icon:"glyphicon glyphicon-link",
    callbacks:{onTrigger:connect}
  },{
    name:"video",
    description:"Add a video",
    icon:"glyphicon glyphicon-film",
    callbacks:{onTrigger:Editor.addVideo}
  },{
    name:"Copy",
    description:"Copy selected container",
    icon:"glyphicon glyphicon-copy",
    callbacks:{onTrigger:Editor.copy}
  },{
    name:"Paste",
    description:"Paste into selected container",
    icon:"glyphicon glyphicon-paste",
    callbacks:{onTrigger:Editor.paste}
  },{
    name:"Effects",
    description:"Add an effect",
    icon:"glyphicon glyphicon-star",
    callbacks:{onTrigger:Editor.manageEffects}
  },{
    name:"Configure",
    description:"Configure the container",
    icon:"glyphicon glyphicon-wrench",
    callbacks:{onTrigger:Editor.configureContainer}
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
    name:"Effects",
    description:"Add an effect",
    icon:"glyphicon glyphicon-star",
    callbacks:{onTrigger:Editor.manageEffects}
  }]];
});
