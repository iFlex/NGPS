//TODO: make proper interface for deleting and moving anchor points
loadAppCode("edit/components/linkEdit",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  var link   = 0;
  var left   = 0;
  var right  = 0;
  var ileft  = 0;
  var iright = 0;
  var ldel   = 0;
  var icsz  = 32;
  //var rdel   = 0;
  function makeDel(mount){
    var c = factory.newContainer({x:0,y:0,width:icsz,height:icsz,ignoreTheme:true,opacity:0.5,background:"white",style:"text-align:center"},'link_dot',mount);
    var g = c.addPrimitive({type:"span",content:{class:"glyphicon glyphicon-trash"}});//<span class="glyphicon glyphicon-record"></span>
    g.style.cssText = "font-size:"+(icsz-4)+"px";
    return c;
  }
  function makeDot(mount){
    var c = factory.newContainer({x:0,y:0,width:icsz,height:icsz,ignoreTheme:true,opacity:0.5,background:"white"},'link_dot',mount);
    var g = c.addPrimitive({type:"span",content:{class:"glyphicon glyphicon-record"}});//<span class="glyphicon glyphicon-record"></span>
    g.style.cssText = "font-size:"+icsz+"px";
    return c;
  }

  function hide(){
    if(link)
      link.removeEventListener("changePosition",maintainDelButtons);

    if(ileft)
    {
      ileft.discard();
      iright.discard();
      ldel.discard();
      //rdel.discard();
    }

    iright = 0;
    ileft = 0;
    left = 0;
    right = 0;
    link = 0;
    //rdel = 0;
    ldel = 0;
  }

  function deleteLink(){
    //if(link)
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
    //var pos2 = link.local2global(0.9,0.5);
    ldel.putAt(pos1.x,pos1.y,0.5,0.5);
    //rdel.putAt(pos2.x,pos2.y,0.5,0.5);
  }
  function showInterface(){

    ileft = makeDot(left);
    iright = makeDot(right);
    ldel = makeDel(factory.root);
    //rdel = makeDel(factory.base);

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

    //console.log("Click on link:"+utils.debug(e)+" left:"+utils.debug(e.target.left)+" r:"+utils.debug(e.target.right));
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
    GEM.addEventListener("link",0,newlink,this);
    factory.root.addEventListener("triggered",hide);
  }
});
