//TODO: add configuration for text editor and adapt to angle of object
this.Editor = this.Editor || {};

loadAppCode("edit/components/sizer",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.target = 0;
  this.fastAccess = {};
  var interfaceSize = 32;
  var sizeCoef = 0.75;
  var buttons = [];
  var mountPoint = factory.root;
  Editor.sizer = this;
  this.configure = function(data){
    if(Editor.sizer.EditUI> 0)
    {
      for(k in Editor.sizer.EditUI)
        Editor.sizer.EditUI.discard();
      Editor.sizer.EditUI = [];
      buttons = [];
    }
    buttons = data;
    Editor.sizer.fastAccess = {};
  }
  this.init = function(){
    this.configure(this.interfaces.basic);
    //edit UI
    var descriptor = {x:0,y:0,width:interfaceSize,height:interfaceSize,background:"white",border_radius:["20%"],border_size:0,cssText:"z-index:4;"};
    Editor.sizer.EditUI = [];
    console.log("buttons:"+buttons.length)
    for(var k = 0 ; k < buttons.length; ++k)
    {
      console.log("building sizer interface:"+k);
      var cnt = factory.newContainer(descriptor,"simple_rect",mountPoint);
      cnt.DOMreference.innerHTML = buttons[k]['innerHTML'] || "";
      for( e in buttons[k].callbacks)
        cnt[e] = buttons[k].callbacks[e];
      cnt.hide();
      cnt.lastEditAngle = 0;
      Editor.sizer.EditUI.push(cnt);
      this.fastAccess[buttons[k].name] = cnt;
    }
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
        var targetPos = target.local2global(); //get global target pos
        targetPos = factory.root.viewportToSurface(targetPos.x,targetPos.y);
        var bsz = 32;
        var w = target.getWidth();
        var h = target.getHeight();
        var difx = [-bsz,( w - bsz)/2,w,w,w,( w - bsz)/2,-bsz,-bsz];
        var dify = [-bsz,-bsz,-bsz,( h - bsz)/2,h,h,h,( h - bsz)/2];
        var i = 0;
        for(k in Editor.sizer.EditUI)
        {
          Editor.sizer.EditUI[k].show();
          Editor.sizer.EditUI[k].putAt(targetPos.x+difx[i],targetPos.y+dify[i]);
          i++;
        }

        Editor.sizer.fastAccess['rotate'].lastEditAngle = "none";
        //Editor.sizer.setEditInterfaceAngle(target.angle);
      }
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
    Editor.sizer.fastAccess['rotate'].move(dx,dy)
    var center = Editor.sizer.target.getPos(0.5,0.5,true);
    var ctl   = Editor.sizer.fastAccess['rotate'].getPos(0.5,0.5,true);
    var angle = Math.atan2( center.y - ctl.y , center.x - ctl.x )
    if(Editor.sizer.fastAccess['rotate'].lastEditAngle && typeof(Editor.sizer.fastAccess['rotate'].lastEditAngle)!="string")
    {
      var dif = ( angle - Editor.sizer.fastAccess['rotate'].lastEditAngle )*180/Math.PI;
      Editor.sizer.target.rotate(dif);
    }
    Editor.sizer.fastAccess['rotate'].lastEditAngle = angle;
  }
  this.interfaces = {
    basic:
    [{
      name:"rotate",
      tag:"simple_rect",
      innerHTML:"<center><span class='glyphicon glyphicon-share-alt' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:Editor.sizer.onRotate}
    },
    {
      name:"changeHeightTop",
      tag:"simple_rect",
      innerHTML:"<center><span class='glyphicon glyphicon-arrow-up' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:Editor.sizer.onChangeHeightTop}
    },
    {
      name:"delete",tag:"simple_rect",
      innerHTML:"<center><span class='glyphicon glyphicon-remove' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:function(){},onTrigger:Editor.sizer.onDelete}
    },
  {name:"changeWidthRight",tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-arrow-right' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",callbacks:{onMoved:Editor.sizer.onChangeWidthRight}},
    {name:"enlarge",tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-resize-full' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",callbacks:{onMoved:Editor.sizer.onEnlarge}},
    {name:"changeHeightBottom",tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-arrow-down' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",callbacks:{onMoved:Editor.sizer.onChangeHeightBottom}},
    {name:"more",tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-th-list' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",callbacks:{onMoved:Editor.sizer.onRotate}},
    {name:"changeWidthLeft",tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-arrow-left' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",callbacks:{onMoved:Editor.sizer.onChangeWidthLeft}},
    ],
    text:[]
  }
});
