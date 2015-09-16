this.Editor = this.Editor || {};

loadAppCode("edit/components/sizer",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

  this.target = 0;
  var currentInterface = 0;
  var defaultInterface = "basic";
  var interfaceSize = 23;
  var sizeCoef = 0.75;
  var mountPoint = factory.root;
  Editor.sizer = this;
  this.configure = function(data){
      for(k in Editor.sizer.EditUI)
      {
        Editor.sizer.EditUI[k].object.discard();
        delete Editor.sizer.EditUI[k];
      }

      Editor.sizer.EditUI = {};
      for( k in data )
      {
        if( Object.keys(data[k]).length == 1 && data[k].anchors ) //simplify making the same interface with buttons in different places
          Editor.sizer.EditUI[k] = {descriptor:utils.merge(Editor.sizer.interfaces[defaultInterface][k],data[k],true)};
        else
          Editor.sizer.EditUI[k] = {descriptor:data[k]};
      }

      var descriptor = {x:0,y:0,width:interfaceSize,height:interfaceSize,background:"white",opacity:0.75,border_size:0,cssText:"z-index:4;",permissions:factory.UIpermissions};
      for( B in Editor.sizer.EditUI )
      {
        var cnt = factory.newContainer(descriptor,"simple_rect",mountPoint);
        cnt.DOMreference.innerHTML = Editor.sizer.EditUI[B].descriptor['innerHTML'] || "";
        for( e in Editor.sizer.EditUI[B].descriptor.callbacks)
          cnt[e] = Editor.sizer.EditUI[B].descriptor.callbacks[e];
        cnt.hide();
        cnt.lastEditAngle = 0;

        Editor.sizer.EditUI[B].object = cnt;
      }
  }

  this.init = function(){
    console.log(this.parent.appPath+" - initialising. Default interface:"+defaultInterface);
    this.configure(this.interfaces[defaultInterface]);
    currentInterface = defaultInterface;
  }

  this.shutdown = function(){
    console.log(this.parent.appPath+" - shutting down");
    this.hide();
    delete Editor.sizer;
  }

  this._show = function(e){
    Editor.sizer.show(e.target);
  }

  this.show = function(target)
  {

    //console.log("SHOW");
    //console.log(target);
    if(!target || !target.getPermission('edit') || target.isLink)
      return;

    Editor.addCloseCallback(Editor.sizer.hide);
    Editor.sizer.target = target;
    console.log("Showing interface for:"+utils.debug(target)+" prefered interface:"+target.editInterface);
    //debug
    if( target.editInterface )
    {
      if( target.editInterface != currentInterface ) {
        currentInterface = target.editInterface;
        this.configure(this.interfaces[currentInterface]);
      }
    } else {
      currentInterface = defaultInterface;
      this.configure(this.interfaces[currentInterface]);
    }
    //add event listeners
    target.addEventListener("changeWidth",Editor.sizer.focus);
    target.addEventListener("changeHeight",Editor.sizer.focus);
    target.addEventListener("mouseUp",Editor.sizer.focus);
    target.addEventListener("changePosition",Editor.sizer.move);
    //target.addEventListener("changeAngle",this.focus);
    //shot interface
    this.focus();
  }

  this.hide = function()
  {
    //console.log("sizer:hide()");
    if(Editor.sizer.target)
    {
      //remove event listeners
      Editor.sizer.target.removeEventListener("changeWidth",Editor.sizer.focus);
      Editor.sizer.target.removeEventListener("changeHeight",Editor.sizer.focus);
      Editor.sizer.target.removeEventListener("mouseUp",Editor.sizer.focus);
      Editor.sizer.target.removeEventListener("changePosition",Editor.sizer.move);
      //Editor.sizer.target.removeEventListener("changeAngle",Editor.sizer.focus);
      //hide interface
      for( k in Editor.sizer.EditUI )
        Editor.sizer.EditUI[k].object.hide();

      Editor.sizer.target = 0;
      Editor.sizer.isSpecialInterface = 0;
    }

    Editor.sizer.target = 0;
  }

  focusState = 0;
  this.move = function(e){
    if(focusState == 1) {
      for( k in Editor.sizer.EditUI )
        Editor.sizer.EditUI[k].object.hide();
        focusState = 2;
    }
  }

  this.focus = function(e){
      if(Editor.sizer.target)
      {
        focusState = 1;
        var target =  Editor.sizer.target;
        for(k in Editor.sizer.EditUI)
        {
          var targetPos = target.local2global(Editor.sizer.EditUI[k].descriptor.anchors['px'], Editor.sizer.EditUI[k].descriptor.anchors['py']);
          targetPos = factory.root.viewportToSurface(targetPos.x * factory.root.czoomLevel,targetPos.y * factory.root.czoomLevel);
          Editor.sizer.EditUI[k].object.show();
          Editor.sizer.EditUI[k].object.putAt(targetPos.x,targetPos.y,
            Editor.sizer.EditUI[k].descriptor.anchors['bx'],
            Editor.sizer.EditUI[k].descriptor.anchors['by']);
          Editor.sizer.EditUI[k].object.setAngle(target.angle);
          //TODO: scale around anchor point so that icons don't overlap
          Editor.sizer.EditUI[k].object.scale(1/factory.root.czoomLevel,0,0,0,true);
        }
        Editor.sizer.target.lastEditAngle = undefined;
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
  function autoScale(target){
    target.sampleAutoSizePos();
    for( kid in target.children )
      target.children[kid].updateAutoSizePos();
  }
  this.onChangeWidthRight = function(dx,dy)
  {
    Editor.sizer.target.setWidth(Editor.sizer.target.getWidth()+dx*(1/factory.root.czoomLevel));
    Editor.sizer.focus();
    //autoScale(Editor.sizer.target);
  }
  //edit interface functions
  this.onChangeWidthLeft = function(dx,dy)
  {
    Editor.sizer.target.setWidth(Editor.sizer.target.getWidth()-dx *(1/factory.root.czoomLevel) );
    Editor.sizer.target.move(dx,0);
    //autoScale(Editor.sizer.target);
  }
  //edit interface functions
  this.onChangeHeightBottom = function(dx,dy)
  {
    Editor.sizer.target.setHeight(Editor.sizer.target.getHeight()+dy*(1/factory.root.czoomLevel));
    //autoScale(Editor.sizer.target);
  }
  //edit interface functions
  this.onChangeHeightTop = function(dx,dy)
  {
    Editor.sizer.target.setHeight(Editor.sizer.target.getHeight()-dy*(1/factory.root.czoomLevel));
    Editor.sizer.target.move(0,dy);
    //autoScale(Editor.sizer.target);
  }
  this.onDelete = function()
  {
    Editor.sizer.target.discard();
    Editor.sizer.hide();
  }
  this.onRotate = function(dx,dy)
  {
    Editor.sizer.EditUI['rotate'].object.move(dx,dy)
    var center = Editor.sizer.target.getPos(0.5,0.5,true);
    var ctl   = Editor.sizer.EditUI['rotate'].object.getPos(0.5,0.5,true);
    var angle = Math.atan2( center.y - ctl.y , center.x - ctl.x )
    if(Editor.sizer.target.lastEditAngle == undefined)
      Editor.sizer.target.lastEditAngle = angle;
    else if(Editor.sizer.target.lastEditAngle)
    {
      var dif = ( angle - Editor.sizer.target.lastEditAngle )*180/Math.PI;
      Editor.sizer.target.rotate(dif);
    }
    Editor.sizer.target.lastEditAngle = angle;
  }
  this.interfaces = {
    old_first:{
    rotate:{
      anchors:{bx:1,by:1,px:0,py:0},
      tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-share-alt' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:Editor.sizer.onRotate}
    },
    changeHeightTop:{
      anchors:{bx:0.5,by:1,px:0.5,py:0},
      tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-arrow-up' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:Editor.sizer.onChangeHeightTop}
    },
    "delete":{
      anchors:{bx:0,by:1,px:1,py:0},
      tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-remove' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:function(){},onTrigger:Editor.sizer.onDelete}
    },
    changeWidthRight:{
      anchors:{bx:0,by:0.5,px:1,py:0.5},
      tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-arrow-right' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:Editor.sizer.onChangeWidthRight}
    },
    enlarge:{
      anchors:{bx:0,by:0,px:1,py:1},
      tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-resize-full' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:Editor.sizer.onEnlarge}
    },
    changeHeightBottom:{
      anchors:{bx:0.5,by:0,px:0.5,py:1},
      tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-arrow-down' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:Editor.sizer.onChangeHeightBottom}
    },
    more:{
      anchors:{bx:1,by:0,px:0,py:1},
      tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-th-list' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:Editor.sizer.onRotate}
    },
    changeWidthLeft:{
      anchors:{bx:1,by:0.5,px:0,py:0.5},
      tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-arrow-left' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>",
      callbacks:{onMoved:Editor.sizer.onChangeWidthLeft}
      },
    },
    basic:{
      ulsz:{
        anchors:{bx:0,by:0,px:0,py:0},
        callbacks:{onMoved:function(dx,dy,ctx){ ctx.move(dx,dy); Editor.sizer.onChangeWidthLeft(dx,dy); Editor.sizer.onChangeHeightTop(dx,dy); }},
        tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-chevron-up' style='font-size:"+interfaceSize*sizeCoef+"px;transform: rotate(-45deg);display: block'></span></center>"
      },
      ursz:{
        anchors:{bx:1,by:0,px:1,py:0},
        callbacks:{onMoved:function(dx,dy,ctx){ ctx.move(dx,dy); Editor.sizer.onChangeWidthRight(dx,dy); Editor.sizer.onChangeHeightTop(dx,dy); }},
        tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-chevron-up' style='font-size:"+interfaceSize*sizeCoef+"px;transform: rotate(45deg);display: block'></span></center>"
      },
      blsz:{
        anchors:{bx:0,by:1,px:0,py:1},
        callbacks:{onMoved:function(dx,dy,ctx){ ctx.move(dx,dy); Editor.sizer.onChangeWidthLeft(dx,dy); Editor.sizer.onChangeHeightBottom(dx,dy); }},
        tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-chevron-up' style='font-size:"+interfaceSize*sizeCoef+"px;transform: rotate(-135deg);display: block'></span></center>"
      },
      brsz:{
        anchors:{bx:1,by:1,px:1,py:1},
        callbacks:{onMoved:function(dx,dy,ctx){ ctx.move(dx,dy); Editor.sizer.onChangeWidthRight(dx,dy); Editor.sizer.onChangeHeightBottom(dx,dy); }},
        tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-chevron-up' style='font-size:"+interfaceSize*sizeCoef+"px;transform: rotate(135deg);display: block'></span></center>"
      },
      move:{
        anchors:{bx:0.5,by:0.5,px:0.5,py:0.5},
        callbacks:{onMoved:function(dx,dy,ctx){ ctx.move(dx,dy); Editor.sizer.target.move(dx,dy); }},
        tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-move' style='font-size:"+interfaceSize*sizeCoef+"px;'></span></center>"
      },
      del:{
        anchors:{bx:0,by:1,px:0.5,py:0},
        callbacks:{onMoved:function(){},onTrigger:function(){Editor.sizer.onDelete();}},
        tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-trash' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>"
      },
      rotate:{
        anchors:{bx:0,by:0.5,px:0,py:0.5},
        callbacks:{onMoved:Editor.sizer.onRotate},
        tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-repeat' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>"
      },
      config:{
        anchors:{bx:1,by:1,px:0.5,py:0},
        callbacks:{onMoved:function(){},onTrigger:Editor.showPie},
        tag:"simple_rect",innerHTML:"<center><span class='glyphicon glyphicon-wrench' style='font-size:"+interfaceSize*sizeCoef+"px'></span></center>"
      },
    },
    text:{
      move:{
        anchors:{bx:0.5,by:0,px:0.5,py:1},
      },
      brsz:{
        anchors:{bx:1,by:1,px:1,py:1},
      },
      del:{
        anchors:{bx:1,by:0,px:0,py:0},
      },
      rotate:{
        anchors:{bx:1,by:-1,px:0,py:0},
      }
    },
    test:{
      move:{
        anchors:{bx:0.5,by:0.5,px:0.5,py:0.5},
      },
      brsz:{
        anchors:{bx:1,by:1,px:1,py:1},
      }
    }
  }
});
