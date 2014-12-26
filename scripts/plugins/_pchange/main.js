//TODO: needs to be made configurable: buttons should be able to be hidden, swapped, etc
this.Editor = this.Editor || {};

loadAppCode("_pchange",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  var levelsMap = {};
  var interfaces = [];
  this.target = 0;
  Editor.track = this;
  //debug:
  factory._pchangecheck = function(){
    console.log("::"+utils.debug(levelsMap));
  }

  function makeTrigger(obj){
    var pos = obj.getPos(0.5,0.5);
    console.log("pos:"+utils.debug(pos));
    pos = factory.root.surfaceToViewport(pos.x,pos.y);
    console.log("pss:"+utils.debug(pos));
    var c = factory.newContainer({x:pos.x,y:pos.y,width:32,height:32,background:"blue"},"none",factory.base);
    c.target = obj;
    c.addEventListener("triggered",trigger);
    return c;
  }
  function hideTriggers(){
    for( i in interfaces)
      interfaces[i].discard();
    interfaces = [];
  }
  function showTriggers(selection){
    for(i in selection)
      interfaces.push(makeTrigger(selection[i]));
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
          return true;
    return false;

  }

  var track = function(e)
  {
    target = e.target;
    var ch = target.parent.children;
    console.log("_pchange::mv:"+utils.debug(target));
    var overlapList = [];
    //check kids on same level
    for( k in ch )
    {
      if( ch[k].permissions.track && ch[k].UID != target.UID )
        if( areOverlapping(target,ch[k]) )
        {
          console.log("OVERLAP::"+utils.debug(ch[k]));
          overlapList.push(ch[k]);
        }
    }
    //check parent
    var top = target.getPos(0,0);
    var bottom = target.getPos(1,1);
    var w = target.parent.getWidth();
    var h = target.parent.getHeight();
    if(top.x < 0 || top.y < 0 || bottom.x > w || bottom.y>h)
      overlapList.push(target.parent);

    if(overlapList.length < 1)
        hideTriggers();
    else
        showTriggers(overlapList);

  }

  var trigger = function(e){
    console.log("moving to :"+utils.debug(e.target.target));
    if(target){
      var parent = e.target.target;
      var spos = target.getPos();
      var dpos = parent.getPos();
      console.log("spos:"+utils.debug(spos)+" dpos:"+utils.debug(dpos));
      dpos.x = spos.x - dpos.x;
      dpos.y -= spos.y;
      console.log("new pos:"+utils.debug(dpos));
      target.changeParent(parent);
      target.putAt(dpos.x,dpos.y);

      hideTriggers();
    }
  }

  var addToLevel = function(level,e){
    if(!levelsMap[level])
      levelsMap[level] = [];
    levelsMap[level].push(e);
  }

  var onAddedChild = function(e){
    var c = e.child;
    if(c.permissions.track)
    {
      console.log("_pchange:: Added child:"+utils.debug(c));
      addToLevel(c.parent.UID,c);
      c.addEventListener('changePosition',track);
    }
  }

  this.init = function()
  {
    levelsMap[factory.root.UID] = [];
    factory.root.addEventListener("addChild",onAddedChild);
  }

});
