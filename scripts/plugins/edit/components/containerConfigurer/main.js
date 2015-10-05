loadAppCode("edit/components/containerConfigurer",function(data){
  this.config = {interface:"none"};
	this.parent = data['parent'];
	data.parent.setPermissions(factory.UIpermissions);
  var interf = 0;
  var _target = 0;
  var shapeScroll = 0;
  var borderScroll = 0;
  var shapes={1:{border_radius:["0px"]},2:{border_radius:["10px"]},3:{border_radius:["10px","10px","0px","10px"]},4:{border_radius:["50px"]},5:{border_radius:["0px"]},6:{border_radius:["10px"]},7:{border_radius:["0px","10px","0px","10px"]},8:{border_radius:["50px"]}};
  var borders={1:{border_size:5,border_style:"solid",border_color:"0x000000"},2:{border_size:5,border_style:"dotted",border_color:"0x000000"},3:{border_size:5,border_style:"dashed",border_color:"0x000000"}}


  this.init = function(){
    Editor.customizer = this;
    utils.loadStyle(data.parent.appFullPath+'colorpicker/spectrum.css');
    requirejs([data.parent.appPath+'colorpicker/spectrum',data.parent.appPath+'colorpicker/jquery.spectrum-fi'],function(){
      interf = factory.base.addChild({x:factory.base.getWidth(),y:factory.base.getHeight(),autosize:true,background:"transpaten",permissions:data.parent.getPermissions()});
      Editor.customizer.buildInterface(interf);
      interf.hide();
    });
  }
  this.shutdow = function(){
    interf.discard();
    shapeScroll.discard();
    borderScroll.discard();
    delete interf;
  }
  this.show = function(target){
    interf.show();
    _target = target;
    var pos = _target.local2global();
		interf.putAt(pos.x * factory.root.czoomLevel,pos.y * factory.root.czoomLevel);
  }
  this.hide = function(){
    interf.hide();
    shapeScroll.hide();
    borderScroll.hide();
    _target = 0;
  }
  this.buildInterface = function(parent){
    parent.close = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
    parent.close.DOMreference.innerHTML = '<i class="glyphicon glyphicon-remove"></i>';
    parent.close.DOMreference.onclick = function(){
      Editor.customizer.hide();
    }

    parent.color = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
    parent.color.DOMreference.innerHTML = '<i class="icon-user icon-white"></i> color';

    parent.brd_color = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
    parent.brd_color.DOMreference.innerHTML = '<i class="glyphicon glyphicon-pencil"></i> border color';

    parent.shape = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
    parent.shape.DOMreference.innerHTML = '<i class="glyphicon glyphicon-stop"></i> shape';
    parent.shape.DOMreference.onclick = function(){
        borderScroll.hide();
        shapeScroll.show();
        shapeScroll.putAt(0,interf.getPos().y+interf.getHeight());
    }

    parent.border = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
    parent.border.DOMreference.innerHTML = '<i class="glyphicon glyphicon-unchecked"></i> border';
    parent.border.DOMreference.onclick = function(){
        shapeScroll.hide();
        borderScroll.show();
        borderScroll.putAt(0,interf.getPos().y+interf.getHeight());
    }

    var scroller = {x:0,y:0,width:"100%",height:"auto",autosize:true,background:"rgba(255,255,255,0.5)","overflow-x":"scroll","overflow-y":"hidden",style:"white-space:nowrap;padding-top:5px;padding-bottom:5px;padding-left:2px",permissions:data.parent.getPermissions()};
    shapeScroll = factory.base.addChild(scroller);
    borderScroll = factory.base.addChild(scroller);

    var descriptor = {width:60,height:60,autopos:true,style:"display:inline-block;margin-right:5px",class:"sizeTransD"}
    for( s in shapes)
    {
      var aux = shapeScroll.addChild(utils.merge(utils.merge(descriptor,{background:"black"}),shapes[s]));
      aux.extend(Interactive);
      aux.interactive(true);
      aux.configProps = shapes[s];
      aux.onMoved = function(dx,dy){shapeScroll.DOMreference.scrollLeft -= dx};
      aux.onTrigger = function(e){
        _target.restyle(e.configProps);
      }
    }
    //load the bordersis
    for( s in borders )
    {
      var aux = borderScroll.addChild(utils.merge(utils.merge(descriptor,{background:"rgba(255,255,255,0.025)"}),borders[s]));
      aux.configProps = borders[s];
      aux.extend(Interactive);
      aux.interactive(true);
      aux.onMoved = function(){borderScroll.DOMreference.scrollLeft -= dx};
      aux.onTrigger = function(e){
        console.log("utils:"+utils.debug(e.configProps));
        _target.restyle(e.configProps);
      }
    }
    shapeScroll.hide();
    borderScroll.hide();

    var colorpickdata = {
      showPaletteOnly: true,
      togglePaletteOnly: true,
      togglePaletteMoreText: 'more',
      togglePaletteLessText: 'less',
      color: 'blanchedalmond',
      palette: [
      ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff","transparent"],
      ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
      ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
      ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
      ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
      ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
      ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
      ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
      ]
    }
    $("#"+parent.color.UID).spectrum( utils.merge(colorpickdata,{
      change: function(color) {
        _target.restyle({background:color});
      }
    }));
    $("#"+parent.brd_color.UID).spectrum( utils.merge(colorpickdata,{
      change: function(color) {
        _target.restyle({border_color:color});
      }
    }));

    parent.fsw = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
    parent.fsw.DOMreference.innerHTML = '<i class="icon-user icon-white"></i>Full Screen Width';
    parent.fsw.DOMreference.onclick = function(){
      _target.setWidth(factory.base.getWidth());
      factory.root.cfocusOn(_target,{});
    }

    parent.fsh = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
    parent.fsh.DOMreference.innerHTML = '<i class="icon-user icon-white"></i>Full Screen Height';
    parent.fsh.DOMreference.onclick = function(){
      _target.setHeight(factory.base.getHeight());
      factory.root.cfocusOn(_target,{});
    }

  }
})
