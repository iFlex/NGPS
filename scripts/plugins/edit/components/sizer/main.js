//TODO: needs to be made configurable: buttons should be able to be hidden, swapped, etc
this.Editor = this.Editor || {};

loadAppCode("edit/components/sizer",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.target = 0;
  var mountPoint = factory.root;
  Editor.sizer = this;

  this.init = function(){
    //edit UI
    var descriptor = {x:0,y:0,width:32,height:32,background:"white",border_size:"0px",cssText:"z-index:4;"};
    Editor.sizer.EditUI = {};
    Editor.sizer.EditUI['rotate'] = factory.newContainer(descriptor,"simple_rect",mountPoint);
    Editor.sizer.EditUI['rotate'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-share-alt'></span></center>";
    Editor.sizer.EditUI['rotate'].onMoved = Editor.sizer.onRotate;
    Editor.sizer.EditUI['rotate'].hide();

    Editor.sizer.EditUI['enlarge'] = factory.newContainer(descriptor,"simple_rect",mountPoint);
    Editor.sizer.EditUI['enlarge'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-resize-full'></span></center>";
    Editor.sizer.EditUI['enlarge'].onMoved = Editor.sizer.onEnlarge;
    Editor.sizer.EditUI['enlarge'].hide();

    Editor.sizer.EditUI['changeWidthLeft'] = factory.newContainer(descriptor,"simple_rect",mountPoint);
    Editor.sizer.EditUI['changeWidthLeft'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-left'></span></center>";
    Editor.sizer.EditUI['changeWidthLeft'].onMoved = Editor.sizer.onChangeWidthLeft;
    Editor.sizer.EditUI['changeWidthLeft'].hide();

    Editor.sizer.EditUI['changeWidthRight'] = factory.newContainer(descriptor,"simple_rect",mountPoint);
    Editor.sizer.EditUI['changeWidthRight'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-right'></span></center>";
    Editor.sizer.EditUI['changeWidthRight'].onMoved = Editor.sizer.onChangeWidthRight;
    Editor.sizer.EditUI['changeWidthRight'].hide();

    Editor.sizer.EditUI['changeHeightBottom'] = factory.newContainer(descriptor,"simple_rect",mountPoint);
    Editor.sizer.EditUI['changeHeightBottom'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-down'></span></center>";
    Editor.sizer.EditUI['changeHeightBottom'].onMoved = Editor.sizer.onChangeHeightBottom;
    Editor.sizer.EditUI['changeHeightBottom'].hide();

    Editor.sizer.EditUI['changeHeightTop'] = factory.newContainer(descriptor,"simple_rect",mountPoint);
    Editor.sizer.EditUI['changeHeightTop'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-arrow-up'></span></center>";
    Editor.sizer.EditUI['changeHeightTop'].onMoved = Editor.sizer.onChangeHeightTop;
    Editor.sizer.EditUI['changeHeightTop'].hide();

    Editor.sizer.EditUI['delete'] = factory.newContainer(descriptor,"simple_rect",mountPoint);
    Editor.sizer.EditUI['delete'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-remove'></span></center>";
    Editor.sizer.EditUI['delete'].hide();

    Editor.sizer.EditUI['more'] = factory.newContainer(descriptor,"simple_rect",mountPoint);
    Editor.sizer.EditUI['more'].DOMreference.innerHTML = "<center><span class='glyphicon glyphicon-th-list'></span></center>";
    Editor.sizer.EditUI['more'].hide();

    factory.root.addEventListener("triggered",Editor.sizer.hide);
  }

  this._show = function(data)
  {
    Editor.sizer.show(data['target']);
  }

  this.show = function(target)
  {
    Editor.sizer.hide();
    Editor.sizer.target = target;
    Editor.sizer.node = target;
    //$(target.DOMreference).zoomTo({targetsize:0.75, duration:600});
    //add event listeners
    target.addEventListener("changeWidth",Editor.sizer.focus);
    target.addEventListener("changeHeight",Editor.sizer.focus);
    target.addEventListener("changePosition",Editor.sizer.focus);
    //target.addEventListener("changeAngle",this.focus);
    //shot interface
    this.focus();
  }

  this.hide = function()
  {
    if(Editor.sizer.target)
    {
      //remove event listeners
      Editor.sizer.target.removeEventListener("changeWidth",Editor.sizer.focus);
      Editor.sizer.target.removeEventListener("changeHeight",Editor.sizer.focus);
      Editor.sizer.target.removeEventListener("changePosition",Editor.sizer.focus);
      //Editor.sizer.target.removeEventListener("changeAngle",Editor.sizer.focus);
      //hide interface
      for( k in Editor.sizer.EditUI )
        if( k != "target" )
          Editor.sizer.EditUI[k].hide();

      Editor.sizer.target = 0;
      Editor.sizer.node = 0;
      Editor.sizer.isSpecialInterface = 0;
    }

    Editor.sizer.target = 0;
  }
  //TODO:NOT WORKING PORPERLY
  this.setEditInterfaceAngle = function(angle)
  {
    angle *= Math.PI/180;
    var tpos = Editor.sizer.target.getCenter();
    for( k in Editor.sizer.EditUI)
      if( k != "target" )
      {
        var pos = Editor.sizer.EditUI[k].getCenter();
        var dx = tpos.x - pos.x;
        var dy = tpos.y - pos.y;
        var distance = Math.sqrt( dx*dx + dy*dy );

        angle += Editor.sizer.EditUI[k].originalAngle;
        Editor.sizer.EditUI[k].putAt(tpos.x - distance*Math.cos(angle),tpos.y - distance*Math.sin(angle),0.5,0.5)
        Editor.sizer.EditUI[k].setAngle(angle);
      }
  }
  //TODO: Not working properly for nested object
  this.focus = function(e){
      if(Editor.sizer.target)
      {
        var target =  Editor.sizer.target;
        var targetPos = target.getPos(0,0,true); //get global target pos

        Editor.sizer.EditUI['rotate'].show();
        Editor.sizer.EditUI['rotate'].putAt( targetPos.x - Editor.sizer.EditUI['rotate'].getWidth(), targetPos.y - Editor.sizer.EditUI['rotate'].getHeight(),0,0,true)

        Editor.sizer.EditUI['enlarge'].putAt( targetPos.x + target.getWidth(), targetPos.y + target.getHeight(),0,0,true)
        Editor.sizer.EditUI['enlarge'].show();

        Editor.sizer.EditUI['changeWidthLeft'].show();
        Editor.sizer.EditUI['changeWidthLeft'].putAt( targetPos.x - Editor.sizer.EditUI['changeWidthLeft'].getWidth(), targetPos.y + (target.getHeight() - Editor.sizer.EditUI['changeWidthLeft'].getHeight())/2,0,0,true)

        Editor.sizer.EditUI['changeWidthRight'].show();
        Editor.sizer.EditUI['changeWidthRight'].putAt( targetPos.x + target.getWidth(), targetPos.y + (target.getHeight() - Editor.sizer.EditUI['changeWidthLeft'].getHeight())/2,0,0,true)

        Editor.sizer.EditUI['changeHeightBottom'].show();
        Editor.sizer.EditUI['changeHeightBottom'].putAt( targetPos.x + (target.getWidth() - Editor.sizer.EditUI['changeWidthLeft'].getWidth())/2, targetPos.y + target.getHeight(),0,0,true)

        Editor.sizer.EditUI['changeHeightTop'].show();
        Editor.sizer.EditUI['changeHeightTop'].putAt( targetPos.x + (target.getWidth() - Editor.sizer.EditUI['changeWidthLeft'].getWidth())/2, targetPos.y - Editor.sizer.EditUI['changeWidthLeft'].getHeight(),0,0,true)

        Editor.sizer.EditUI['delete'].show();
        Editor.sizer.EditUI['delete'].putAt( targetPos.x + target.getWidth(), targetPos.y - Editor.sizer.EditUI['rotate'].getHeight(),0,0,true)
        Editor.sizer.EditUI['delete'].onTrigger = this.onDelete;
        Editor.sizer.EditUI['delete'].onMoved = function(){};

        Editor.sizer.EditUI['more'].show();
        Editor.sizer.EditUI['more'].putAt( targetPos.x - Editor.sizer.EditUI['rotate'].getWidth(), targetPos.y + target.getHeight(),0,0,true)
        Editor.sizer.EditUI['rotate'].lastEditAngle = "none";
        //Editor.sizer.setEditInterfaceAngle(target.angle);
      }
  }
  this.focusSpecialEditInterface = function(e){
      var target =  Editor.sizer.target;
      var targetPos = target.getPos(0,0,true);
      keyboard.focusEditor(target);
      Editor.sizer.EditUI['changeWidthRight'].show();
      Editor.sizer.EditUI['changeWidthRight'].putAt( targetPos.x + target.getWidth(), targetPos.y + (target.getHeight() - Editor.sizer.EditUI['changeWidthLeft'].getHeight())/2,0,0,true)

      Editor.sizer.EditUI['changeHeightBottom'].show();
      Editor.sizer.EditUI['changeHeightBottom'].putAt( targetPos.x + (target.getWidth() - Editor.sizer.EditUI['changeWidthLeft'].getWidth())/2, targetPos.y + target.getHeight(),0,0,true)

      Editor.sizer.EditUI['delete'].show();
      Editor.sizer.EditUI['delete'].putAt( targetPos.x + target.getWidth(), targetPos.y + target.getHeight(),0,0,true)
      Editor.sizer.EditUI['delete'].onTrigger = this.onDelete;
      Editor.sizer.EditUI['delete'].onMoved = function(){};

      Editor.sizer.EditUI['more'].show();
      Editor.sizer.EditUI['more'].putAt( targetPos.x - Editor.sizer.EditUI['rotate'].getWidth(), targetPos.y + target.getHeight(),0,0,true)

      //Editor.sizer.setEditInterfaceAngle(target.angle);
  }
  //edit interface functions
  this.onEnlarge = function(dx,dy)
  {
    var minD = (dx<dy)?dx:dy;
    var amount = (Editor.sizer.target.getWidth()+minD)/Editor.sizer.target.getWidth();
    Editor.sizer.target.enlarge(amount);
  }
  //edit interface functions
  this.onChangeWidthRight = function(dx,dy)
  {
    Editor.sizer.target.setWidth(Editor.sizer.target.getWidth()+dx);
    Editor.sizer.focus();
  }
  //edit interface functions
  this.onChangeWidthLeft = function(dx,dy)
  {
    Editor.sizer.target.setWidth(Editor.sizer.target.getWidth()-dx);
    Editor.sizer.target.move(dx,0);
  }
  //edit interface functions
  this.onChangeHeightBottom = function(dx,dy)
  {
    Editor.sizer.target.setHeight(Editor.sizer.target.getHeight()+dy);
  }
  //edit interface functions
  this.onChangeHeightTop = function(dx,dy)
  {
    Editor.sizer.target.setHeight(Editor.sizer.target.getHeight()-dy);
    Editor.sizer.target.move(0,dy);
  }
  this.onDelete = function()
  {
    Editor.sizer.target.discard();
    Editor.sizer.hide();
  }
  this.onRotate = function(dx,dy)
  {
    Editor.sizer.EditUI['rotate'].move(dx,dy)
    var center = Editor.sizer.target.getPos(0.5,0.5,true);
    var ctl   = Editor.sizer.EditUI['rotate'].getPos(0.5,0.5,true);
    var angle = Math.atan2( center.y - ctl.y , center.x - ctl.x )
    if(Editor.sizer.EditUI['rotate'].lastEditAngle && typeof(Editor.sizer.EditUI['rotate'].lastEditAngle)!="string")
    {
      var dif = ( angle - Editor.sizer.EditUI['rotate'].lastEditAngle )*180/Math.PI;
      Editor.sizer.target.rotate(dif);
    }
    Editor.sizer.EditUI['rotate'].lastEditAngle = angle;
  }
});
