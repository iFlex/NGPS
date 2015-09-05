//TODO: make proper interface for deleting and moving anchor points
loadAppCode("edit/components/linkEdit",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

  var uiPerm = factory.UIpermissions;
  var link   = 0;
  var left   = 0;
  var right  = 0;
  var ileft  = 0;
  var iright = 0;
  var ldel   = 0;
  var icsz  = 32;
  //var rdel   = 0;
  function makeDel(mount){
    var c = factory.newContainer({x:0,y:0,width:icsz,height:icsz,ignoreTheme:true,opacity:0.85,background:"white",style:"text-align:center",permissions:uiPerm},'link_dot',mount);
    var g = c.addPrimitive({type:"span",content:{class:"glyphicon glyphicon-trash"}});//<span class="glyphicon glyphicon-record"></span>
    g.style.cssText = "font-size:"+(icsz-4)+"px";
    return c;
  }
  function makeDot(mount){
    var c = factory.newContainer({x:0,y:0,width:icsz,height:icsz,ignoreTheme:true,opacity:0.85,background:"white",permissions:uiPerm},'link_dot',mount);
    var g = c.addPrimitive({type:"span",content:{class:"glyphicon glyphicon-record"}});//<span class="glyphicon glyphicon-record"></span>
    g.style.cssText = "font-size:"+icsz+"px";
    return c;
  }

  function hide(){
    if(link)
      link.removeEventListener("changePosition",maintainDelButtons);

    if(ileft)
    {
      ileft.hide();
      iright.hide();
      ldel.hide();
    }
  }

  function deleteLink(){
    left.unlink(right);
    hide();
  }
  function moveLeftEnd(dx,dy,ctx){
    ctx.move(dx,dy);

    var pos = ileft.getPos(0.5,0.5);
    link.linkData['left_container_xreff'] = pos.x/left.getWidth();
    link.linkData['left_container_yreff'] = pos.y/left.getHeight();
    left.maintainLinks();
  }
  function moveRightEnd(dx,dy,ctx){
    ctx.move(dx,dy);

    var pos = iright.getPos(0.5,0.5);
    link.linkData['right_container_xreff'] = pos.x/right.getWidth();
    link.linkData['right_container_yreff'] = pos.y/right.getHeight();
    right.maintainLinks();
  }
  function maintainDelButtons(){
    var pos1 = link.local2global(0.5,0.5,factory.root.display.UID);
    ldel.putAt(pos1.x,pos1.y,0.5,0.5);
  }
  function showInterface(){
    if(!ileft) {
      ileft = makeDot(left);
      iright = makeDot(right);
      ldel = makeDel(factory.root);
    } else {
      ileft.show(true);
      iright.show(true);
      ldel.show(true);
      ileft.changeParent(left);
      iright.changeParent(right);
      //rdel.show();
    }
    ileft.putAt(
      link.linkData['left_container_xreff']*left.getWidth(),
      link.linkData['left_container_yreff']*left.getHeight(),0.5,0.5);

    iright.putAt(
      link.linkData['right_container_xreff']*right.getWidth(),
      link.linkData['right_container_yreff']*right.getHeight(),0.5,0.5);

    maintainDelButtons();
    link.addEventListener("changePosition",maintainDelButtons);

    ileft.onMoved = moveLeftEnd;
    iright.onMoved = moveRightEnd;

    ldel.onTrigger = deleteLink;
    ldel.onMoved = 0;
    ldel.onZoomed = 0;
    ldel.onRotated = 0;

  }

  function linkClick(e){
    hide();

    link = e.target;
    left = link.left;
    right = link.right;

    showInterface();
  }

  function newlink(e){
    hide();

    link = e.link;
    left = e.target;
    right = e.other;

    link.left = left;
    link.right = right;

    link.extend(Interactive);
    link.interactive(true);
    link.onMoved = function(){};
    link.onRotated = function(){};
    link.onZoomed = function(){};

    showInterface();

    link.addEventListener("triggered",linkClick);
  }
  this.init = function(){
    console.log(this.parent.appPath+" - initialising...");

    GEM.addEventListener("link",0,newlink,this);
    factory.root.addEventListener("triggered",hide);
  }
  this.shutdown = function(){
    console.log(this.parent.appPath+" - shutting down...");

    GEM.removeEventListener("link",0,newlink,this);
    factory.root.removeEventListener("triggered",hide);
  }
});
