loadAppCode("edit/components/linkEdit",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  function toggleInterface(e){
    var target = e.target;
  }
  function newlink(e){
    var target = e.child;
    if(target.isLink)
    {
      target.extend(Interactive);
      target.interactive(true);
      target.onMoved = function(){};
      target.onRotated = function(){};
      target.onZoomed = function(){};

      console.log("link click:"+utils.debug(target));
      target.addEventListener("trigger",toggleInterface);
    }
  }
  this.init = function(){
    GEM.addEventListener("addChild",0,newlink,this);
  }
});
