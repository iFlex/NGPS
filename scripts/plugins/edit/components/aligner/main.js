//TODO: optimize magnet
//      opitmize showing of lines

this.Editor = this.Editor || {};

loadAppCode("edit/components/aligner",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

  this.active = true;

  var enabled = true;
  var magnetEnabled = false;

  var interfaces = [];
  var interfSize = 32;
  var interval = 0;
  this.target = 0;
  Editor.align = this;

  var pointsx = [0.5,1,0.5,0,0.5];
  var pointsy = [0,0.5,1,0.5,0.5];
  var slimness = 1;
  var magnetDist = 5;

  this.toggle = function(ctx)
  {
    var app = ctx.app;
    enabled = !enabled;
    //change icon
    if(enabled)
      ctx.DOMreference.innerHTML = "<img src='"+app.parent.appFullPath+"resources/0.png"+"' style='width:16px;height:16px'></img>";
    else
      ctx.DOMreference.innerHTML = "<img src='"+app.parent.appFullPath+"resources/1.png"+"' style='width:16px;height:16px'></img>";
  }

  function getdist(a,b){
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
  }
  function isCloseEnough(a,b){
    var maxdist = 500;
    var points = [];
    var apts = [];

    for( i in pointsx )
    {
      var ap = a.getPos(pointsx[i],pointsy[i])
      var bp = b.getPos(pointsx[i],pointsy[i]);
      apts.push(ap);

      if(getdist(ap,bp) < maxdist ){
        w = b.getWidth()*3;
        h = b.getHeight()*3;
        points.push({x:bp.x,y:bp.y,width:w,height:slimness});
        points.push({x:bp.x,y:bp.y,width:slimness,height:h});
      }
    }

    if(magnetEnabled){
      //magnet link to points
      var ft = true;
      var dx = 0;
      var dy = 0;
      var odx = 0;
      var ody = 0;

      for( i in points ){
        for( j in apts ){
          var xdif = Math.abs(apts[j].x-points[i].x);
          var ydif = Math.abs(apts[j].y-points[i].y);
          if(dx > xdif || ft)
          {
            dx = xdif;
            odx = points[i].x - apts[j].x;
          }
          if(dy > ydif || ft)
          {
            dy = ydif;
            ody = points[i].y - apts[j].y;
          }
          ft = false;
        }
      }

      if(dx > magnetDist)
        odx = 0;
      if(dy > magnetDist)
        ody = 0;

      if(odx || ody)
        a.move(odx,ody);

    }
    return points;
  }
  function showLines(lines){
    //format {x,y,w,h} where x and y are at the middle
    for( l in lines ){
      var ln = factory.newContainer({x:lines[l].x - lines[l].width/2,y:lines[l].y - lines[l].height/2,width:lines[l].width,height:lines[l].height,style:"border-width:2px;border-style:dashed;background: grey;opacity:0.5",ignoreTheme:true,permissions:data.parent.getPermissions()},"none",factory.root);
      ln.interactive(false);
      Editor.align.lines.push(ln);
    }
  }

  function recalc(){

    if(!target)
    {
      cancelInterval(interval);
      interval = 0;
      target = 0;
      return;
    }

    var ch = target.parent.children;
    var lines = [];
    //check kids on same level
    for( k in ch )
    {
      if(ch[k].getPermission('track') && ch[k].UID != target.UID )
      {
        var l = isCloseEnough(target,ch[k]);
        for( i in l)
          lines.push(l[i]);
      }
    }

    hideLines();
    if(lines.length > 0 && Editor.align.lines.length < 1)
      showLines(lines);
  }

  function hideLines(){
    target =0;
    for( l in Editor.align.lines )
      Editor.align.lines[l].discard();
    Editor.align.lines = [];
  }
  var track = function(e)
  {
    if(!enabled || e.target.isLink)
      return;

    target = e.target;
    recalc();
    //interval = setInterval(recalc,10);
  }

  var onAddedChild = function(e){
    var c = e.child;
    if(c.getPermission('track'))
    {
      c.addEventListener('changePosition',track);
    }
  }

  this.init = function()
  {
    console.log("edit/components/aligner - initialising...");

    GEM.addEventListener("addChild",0,onAddedChild,this);
    factory.root.addEventListener("triggered",hideLines);
  }
  this.shutdown = function()
  {
    console.log("edit/components/aligner - shutdown.");

    GEM.removeEventListener("addChild",0,onAddedChild,this);
    factory.root.removeEventListener("triggered",hideLines);
  }
});
