//TODO: need to fix where the button appears

this.Editor = this.Editor || {};

loadAppCode("edit/components/pchange",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.active = true;
  data.parent.setPermissions(factory.UIpermissions);

  var interfaces = [];
  var interfSize = 23;
  var target = 0;
  Editor.track = this;
  //debug:
  factory._pchangecheck = function(){
    //console.log("::"+utils.debug(levelsMap));
  }

  function updateTrigger(i,obj,pos,last){
      var o = interfaces[i];
      o.show();
      o.destination = obj;
      pos = factory.root.viewportToSurface(pos.x * factory.root.czoomLevel,pos.y * factory.root.czoomLevel);
      o.child.className = (last == true)?"glyphicon glyphicon-log-out":"glyphicon glyphicon-log-in";
      o.putAt(pos.x,pos.y);
      o.DOMreference.style.zIndex = containerData.containerIndex;
  }
  function makeTrigger(obj,pos,last)
  {
    pos = factory.root.viewportToSurface(pos.x,pos.y);
    var c = factory.newContainer({x:pos.x,y:pos.y,width:interfSize,height:interfSize,background:"white",border_radius:["10%"],style:"text-align: center;",permissions:data.parent.getPermissions()},"none",factory.root);//factory.base);
    var g = c.addPrimitive({type:"span",content:{class:(last == true)?"glyphicon glyphicon-log-out":"glyphicon glyphicon-log-in"}});
    g.style.cssText = "font-size:"+interfSize*0.9+"px";
    c.destination = obj;
    c.addEventListener("triggered",trigger);
    return c;
  }
  function hideTriggers(){
    for( i in interfaces)
      interfaces[i].hide();
  }
  function showTriggers(selection,poslist){
    for(i in selection){
      if( i >= interfaces.length)
        interfaces.push(makeTrigger(selection[i],poslist[i],poslist[i].isexit));
      else
        updateTrigger(i,selection[i],poslist[i],poslist[i].isexit);
    }
  }

  function areOverlapping(a,b){
    var ap = a.getPos();
    var bp = b.getPos();
    var a_p = a.getPos(1,1);
    var b_p = b.getPos(1,1);

    //check X axis
    if( (ap.x < bp.x && a_p.x > bp.x) ||  // a|   b|  a|   b|   a|
        (ap.x > bp.x && ap.x < b_p.x ) ) // b|  a|  a|  b|  a|
      if( (ap.y < bp.y && a_p.y > bp.y) ||  // a|   b|  a|   b|   a|
          (ap.y > bp.y && ap.y < b_p.y ) ) // b|  a|  a|  b|  a|
          {
              var p = b.local2global();
              var mid = {x:p.x,y:p.y};
              if( ap.x > bp.x && ap.x < b_p.x )
              {
                var d = ap.x - bp.x;
                if( a_p.x < b_p.x && d < (b_p.x - a_p.x))
                  d = (a_p.x - bp.x);
                mid.x += d;
              }
              if( ap.y > bp.y && ap.y < b_p.y )
              {
                var d = ap.y - bp.y;
                if( a_p.y < b_p.y && d < ( b_p.y - a_p.y))
                  d = (a_p.y - bp.y);
                  mid.y += d;
                }
              return mid;
          }
    return 0;

  }

  var track = function(e)
  {
    target = e.target;
    if(target.isLink)
      return;

    var ch = target.parent.children;
    //console.log("_pchange::mv:"+utils.debug(target));
    var overlapList = [];
    var poslist = [];
    //check kids on same level
    for( k in ch )
    {
      if( ch[k].getPermission('track') && ch[k].UID != target.UID )
      {
        var pos = areOverlapping(target,ch[k]);
        if( pos )
        {
          //console.log("OVERLAP::"+utils.debug(ch[k]));
          overlapList.push(ch[k]);
          poslist.push(pos);
        }
      }
    }

    function checkOverlap(parent,node){
      if(!parent)
        return null;

      if(parent.UID != factory.root.display.UID)
      {
        //check parent
        var pt = parent.local2global(0,0);
        var pb = parent.local2global(1,1);
        var nt = node.local2global(0,0);
        var nb = node.local2global(1,1);
        //console.log("Cheking parent:"+utils.debug(parent)+" pt:"+pt.x+"|"+pt.y+" pb:"+pb.x+"|"+pb.y+" nt:"+nt.x+"|"+nt.y+" nb:"+nb.x+"|"+nb.y);
        var w = parent.getWidth();
        var h = parent.getHeight();
        if(nt.x < pt.x || nt.y < pt.y || nb.x > pb.x || nb.y > pb.y )
          return checkOverlap(parent.parent,node) || {
            node:parent.parent,
            pos:{
              x:(-nt.x > ( nb.x - w )) ? nt.x : nb.x,
              y:(-nt.y > ( nb.y - h)) ? nt.y : nb.y
            }
          };
      }
      return 0;
    }

    var prnt = checkOverlap( target.parent, target );
    if(prnt)
    {
      prnt.pos.isexit = true;
      overlapList.push(prnt.node);
      poslist.push(prnt.pos);
    }

    hideTriggers();
    if(overlapList.length > 0)
      showTriggers(overlapList,poslist);

  }

  var trigger = function(e){
    if(target && e.target.destination ){
      console.log("Change parent:"+e.target.destination);
      target.changeParent(e.target.destination);
      hideTriggers();
    }
  }

  var onAddedChild = function(e){
    var c = e.child;
    if(c.getPermission('track'))
    {
      //console.log("_pchange:: Added child:"+utils.debug(c));
      c.addEventListener('changePosition',track);
    }
  }

  this.init = function()
  {
    console.log(this.parent.appPath+" - initialising...");
    GEM.addEventListener("addChild",0,onAddedChild,this);
  }

  this.shutdown = function(){
    console.log(this.parent.appPath+" - shutdown...");
    GEM.removeEventListener("addChild",0,onAddedChild,this);
  }
});
