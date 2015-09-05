this.Editor = this.Editor || {};
//TODO: make sure it's under the dock & close button visivle
loadAppCode("edit/components/configureContainer",function(data)
{
  data.parent.setPermissions(factory.UIpermissions);
  //temporary
  var shapes={1:{border_radius:["0px"]},2:{border_radius:["10%"]},3:{border_radius:["10%","10%","0px","10%"]},4:{border_radius:["50%"]},5:{border_radius:["0px"]},6:{border_radius:["10%"]},7:{border_radius:["0px","10%","0px","10%"]},8:{border_radius:["50%"]}};
  var borders={1:{border_size:5,border_style:"solid",border_color:"0x000000"},2:{border_size:5,border_style:"dotted",border_color:"0x000000"},3:{border_size:5,border_style:"dashed",border_color:"0x000000"}}
  //code
  this.config = { interface:"none" };
  var parent = data['parent'];
  parent.setPermission('save',false);
  parent.setPermission('connect',false);

  var interfaces = [];
  var w = 60;
  var h = 60;
  var root = 0;
  var target;
  Editor.configureContainer = this;
  this.init = function(){
    console.log("edit/components/configureContainer - initialising...");

    utils.loadStyle(parent.appFullPath+'colorpicker/spectrum.css');
    requirejs([parent.appFullPath+'colorpicker/spectrum.js',parent.appFullPath+'colorpicker/jquery.spectrum-fi.js'],function(){
    for(var i = 0 ; i < 3; ++i )
    {
      interfaces.push(factory.newContainer({type:"div",width:"100%",height:h*1.1,y:Editor.headerHeight,x:0,background:"rgba(0,0,0,0.1)",permissions:{save:false,connect:false},style:"vertical-align:middle"},"none",factory.base));
      interfaces[interfaces.length-1].onMoved = function(){};
      interfaces[interfaces.length-1].hide();
    }

    //load the shapes
    var textdescr = {width:w,height:h,autopos:true,style:"display:inline-block;margin-right:5px;font-size:15px;border_size:2px"};
    var descriptor = {width:w,height:h,autopos:true,style:"display:inline-block;margin-right:5px",class:"sizeTransD"}
    var cldtxt = interfaces[0].addChild(textdescr);
    cldtxt.DOMreference.innerHTML = "Choose Shape";
    for( s in shapes)
    {
      var aux = interfaces[0].addChild(utils.merge(utils.merge(descriptor,{background:"black"}),shapes[s]));
      aux.extend(Interactive);
      aux.interactive(true);
      aux.configProps = shapes[s];
      aux.onMoved = function(){};
      aux.onTrigger = function(e){
        target.restyle(e.configProps);
      }
    }
    //load the bordersis
    console.log(textdescr);
    cldtxt = interfaces[1].addChild(textdescr);
    cldtxt.DOMreference.innerHTML = "Choose Border";
    for( s in borders )
    {
      var aux = interfaces[1].addChild(utils.merge(utils.merge(descriptor,{background:"rgba(255,255,255,0.025)"}),borders[s]));
      aux.configProps = borders[s];
      aux.extend(Interactive);
      aux.interactive(true);
      aux.onMoved = function(){};
      aux.onTrigger = function(e){
        console.log("utils:"+utils.debug(e.configProps));
        target.restyle(e.configProps);
      }
    }

    cldtxt = interfaces[2].addChild(textdescr);
    cldtxt.DOMreference.innerHTML = "Choose Fill Color";
    var bkclr = interfaces[2].addChild(utils.merge(descriptor,{type:"input"},true)).UID;
    cldtxt = interfaces[2].addChild(textdescr);
    cldtxt.DOMreference.innerHTML = "Choose Border Color";
    var brclr = interfaces[2].addChild(utils.merge(descriptor,{type:"input"},true)).UID;

      var colorpickdata = {
        showPaletteOnly: true,
        togglePaletteOnly: true,
        togglePaletteMoreText: 'more',
        togglePaletteLessText: 'less',
        color: 'blanchedalmond',
        palette: [
        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
        ]
      }
      $("#"+bkclr).spectrum( utils.merge(colorpickdata,{
        change: function(color) {
          target.restyle({background:color});
        }
      }));
      $("#"+brclr).spectrum( utils.merge(colorpickdata,{
        change: function(color) {
          target.restyle({border_color:color});
        }
      }));
    });
  }
  this.setTarget = function(t){
    target = t;
  }
  var showing = 0;
  this.show = function(interface){
    Editor.addCloseCallback(Editor.configureContainer.hide);
    showing = interface;
    if(interfaces[interface])
      interfaces[interface].show();
    else
      showing = 0;
  }
  this.hide = function(){
    interfaces[showing].hide();
  }
});
