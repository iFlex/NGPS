this.Editor = this.Editor || {};

loadAppCode("edit/components/configureContainer",function(data)
{
  //temporary
  var shapes={1:{border_radius:["0px"]},2:{border_radius:["10%"]},3:{border_radius:["10%","10%","0px","10%"]},4:{border_radius:["50%"]},5:{border_radius:["0px"]},6:{border_radius:["10%"]},7:{border_radius:["0px","10%","0px","10%"]},8:{border_radius:["50%"]}};
  var borders={1:{border_size:5,border_style:"solid",border_color:"0x000000"},2:{border_size:5,border_style:"dotted",border_color:"0x000000"},3:{border_size:5,border_style:"dashed",border_color:"0x000000"}}
  //code
  this.config = {interface:"none"};
  var parent = data['parent'];
  var w = 100;
  var h = 100;
  var root = 0;
  var target;
  Editor.configureContainer = this;
  this.init = function(){
    utils.loadStyle(parent.appFullPath+'colorpicker/spectrum.css');
    requirejs([parent.appFullPath+'colorpicker/spectrum.js',parent.appFullPath+'colorpicker/jquery.spectrum-fi.js'],function(){
      root = factory.newContainer({type:"dev",width:"30%",height:"100%",top:"0%",left:"-30%",background:"grey"},"none",factory.base);
      root.DOMreference.innerHTML = '<style> .inline{ display: inline-block; *display: inline; } .margin{ margin-left:10px } .displayer{ width:100%;height:'+h+'px;overflow:scroll; background:transparent } .sliderBKG{ background:rgba(50,50,50); } </style> <h2> Edit </h2> <div id="EDIT_Appearence"> <div width="100%"> <h3 class="inline"> Shape </h3> </div> <div id="SHAPES" class="displayer"></div> <div> <h3 class="inline"> Border </h3> <input type="text" id="BRD_COLOR" class="btn btn-default inline"/> </div> <div id="BORDERS" class="displayer"></div> <div id="BORDER_Slider" class="dragdealer"> <div class="handle red-bar" style="perspective: 1000px; backface-visibility: hidden; transform: translateX(0px);"> <p style="" class="inline"> Opacity </p> <span class="value inline">0</span>% </div> </div> <div> <h3 class="inline"> Background </h3> <input type="text" id="BKG_COLOR" class="btn btn-default inline"/> </div> <div id="BACKGROUND_Slider" class="dragdealer"> <div class="handle red-bar" style="perspective: 1000px; backface-visibility: hidden; transform: translateX(0px);"> <p style="" class="inline"> Opacity </p> <span class="value inline">0</span>% </div> </div> </div> <div id="EDIT_Events"> </div> <script> new Dragdealer("BORDER_Slider", { animationCallback: function(x, y) { $("#BORDER_Slider .value").text(Math.round(x * 100)); } }); new Dragdealer("BACKGROUND_Slider", { animationCallback: function(x, y) { $("#BACKGROUND_Slider .value").text(Math.round(x * 100)); } }); </script>';
      root.onMoved = function(){}

      var mountShapes = document.getElementById("SHAPES");
      var mountBorders = document.getElementById("BORDERS");

      //load the shapes
      var descriptor = {width:w,height:h,autopos:true,"*isolated":true,style:"display:inline-block;margin-right:5px"}
      for( s in shapes)
      {
        var aux = new container(utils.merge(utils.merge(descriptor,{background:"black"}),shapes[s]));
        aux.load(mountShapes);
        aux.extend(Interactive);
        aux.interactive(true);
        aux.configProps = shapes[s];
        aux.onMoved = function(){};
        aux.onTrigger = function(e){
          target.restyle(e.configProps);
        }
      }
      //load the bordersis
      for( s in borders )
      {
        var aux = new container(utils.merge(utils.merge(descriptor,{background:"rgba(255,255,255,0.025)"}),borders[s]));
        aux.load(mountBorders);
        aux.configProps = borders[s];
        aux.extend(Interactive);
        aux.interactive(true);
        aux.onMoved = function(){};
        aux.onTrigger = function(e){
          console.log("utils:"+utils.debug(e.configProps));
          target.restyle(e.configProps);
        }
      }

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
      $("#BKG_COLOR").spectrum( utils.merge(colorpickdata,{
        change: function(color) {
          target.restyle({background:color});
        }
      }));
      $("#BRD_COLOR").spectrum( utils.merge(colorpickdata,{
        change: function(color) {
          target.restyle({border_color:color});
        }
      }));
    });

    //utils.loadStyle("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",function(){loaded++;});
    //utils.loadStyle("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css",function(){loaded++;});
    //utils.loadStyle(parent.appFullPath+"lib/jasmine.css",function(){loaded++;});
    //utils.loadStyle(parent.appFullPath+"lib/font-awesome/css/font-awesome.min.css",function(){loaded++;});
    //utils.loadStyle(parent.appFullPath+"src/dragdealer.css",function(){loaded++;});
/*
    requirejs([
      "http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js",
      "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js",
      parent.appPath+"lib/jquery.simulate",
      parent.appPath+"lib/jasmine",
      parent.appPath+"lib/jasmine-jsreporter",
      parent.appPath+"lib/jasmine-html",
      parent.appPath+"lib/jasmine-jquery",
      parent.appPath+"src/dragdealer",
      parent.appPath+"spec/helpers",
      parent.appPath+"spec/matchers",
      parent.appPath+"spec/callbacksSpec",
      parent.appPath+"spec/optionsSpec",
      parent.appPath+"spec/draggingSpec",
      parent.appPath+"spec/touchDraggingSpec",
      parent.appPath+"spec/apiSpec",
      parent.appPath+"spec/resizingSpec",
      parent.appPath+"spec/eventsSpec",
      parent.appPath+"spec/browser-runner"
    ],function(){loaded++;});*/
  }
  this.setTarget = function(t){
    target = t;
  }
  this.show = function(){
    root.tween({left:0},1);
  }
  this.hide = function(){
    root.tween({left:-root.getWidth()+"px"},1)
  }
});
