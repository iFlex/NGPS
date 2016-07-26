
this.Editor = this.Editor || {};

loadAppCode("edit/components/customizer/views/shapes",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.coordintion = data['coordination']
  this.path = this.parent.appFullPath;
  data.parent.setPermissions(factory.UIpermissions);
	
  var shapes={
	  1:{border_radius:["0px"]},
	  2:{border_radius:["10px"]},
	  3:{border_radius:["10px","10px","0px","10px"]},
	  4:{border_radius:["50px"]},
	  5:{border_radius:["0px"]},
	  6:{border_radius:["10px"]},
	  7:{border_radius:["0px","10px","0px","10px"]},
	  8:{border_radius:["50%"],lock_aspect:true,equal_edges:true},
      9:{style:"-ms-transform: skewX(5deg);-webkit-transform: skewX(5deg);transform: skewX(5deg);"},
  	  10:{style:"-ms-transform: skewY(5deg);-webkit-transform: skewY(5deg);transform: skewY(5deg);"},
  	  11:{style:"-ms-transform: skewY(5deg);-webkit-transform: skewY(5deg);transform: skewY(5deg);-ms-transform: skewX(5deg);-webkit-transform: skewX(5deg);transform: skewX(5deg);"}};
  
  this.init = function(){
    console.log(this.path + " - initialising...");
	this.parent.DOMreference.style.overflow = "scroll";
    this.parent.DOMreference.innerHTML = "Shape<br>";
	  
	this.buildInterface();
  }
  
  this.shutdown = function(){
    root.discard();
    delete Editor.apps;
  }
  
  this.buildInterface = function(){
	  var size = this.parent.getWidth();
	  if( size < this.parent.getHeight())
		  size = this.parent.getHeight();
	  size /= 5;
	  
	  var positioning = ";margin-bottom:5px;margin-left:5px;display:inline-block"
	  var desc = {};
	  for( i in shapes){
		  desc = ngps.utils.merge(shapes[i],{autopos:true,width:size,height:size,background:"rgba(0,0,0,0.8)"});
		  
		  if(desc["style"])
			  desc["style"]+=positioning
		  else
			  desc["style"] = positioning;
		  
		  var c = this.parent.addChild(desc);
		  c.extend(Interactive)
		  c.interactive(true);
		  
		  c.CONFIG_STYLE = shapes[i];
		  c.onTrigger = function(e){
			if(e.CONFIG_STYLE["equal_edges"]){
				var a = Editor.customizer.target.getWidth();
				var b = Editor.customizer.target.getHeight();
				if(a > b)
					a = b
				Editor.customizer.target.setWidth(a);
				Editor.customizer.target.setHeight(a);
			}
        	Editor.customizer.target.restyle(e.CONFIG_STYLE);
      	  }
	  }
  }
  
});
