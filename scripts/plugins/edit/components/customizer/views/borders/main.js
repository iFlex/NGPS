
this.Editor = this.Editor || {};

loadAppCode("edit/components/customizer/views/borders",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.coordintion = data['coordination']
  this.path = this.parent.appFullPath;
  data.parent.setPermissions(factory.UIpermissions);
  
  var borders={0:{border_size:0,border_style:"solid",border_color:"0x000000"},
			   1:{border_size:5,border_style:"solid",border_color:"0x000000"},
			   2:{border_size:5,border_style:"dotted",border_color:"0x000000"},
			   3:{border_size:5,border_style:"dashed",border_color:"0x000000"},
			   4:{border_size:5,border_style:"double",border_color:"0x000000"},
			   5:{border_size:5,border_style:"groove",border_color:"0x000000"},
			   6:{border_size:5,border_style:"ridge",border_color:"0x000000"},
			   7:{border_size:5,border_style:"inset",border_color:"0x000000"},
			   8:{border_size:5,border_style:"outset",border_color:"0x000000"}}
  
  this.init = function(){
    console.log(this.path + " - initialising...");
	this.parent.DOMreference.style.overflow = "scroll";
    this.parent.DOMreference.innerHTML = "Border";
	  
	this.buildInterface();
  }
  
  this.shutdown = function(){
    console.log("edit/components/customizer - shutdown.");
    root.discard();
    delete Editor.apps;
  }
  
  this.buildInterface = function(){
	  var desc = {};
	  for( i in borders){
		  desc = ngps.utils.merge(borders[i],{autopos:true,width:"95%",height:"15%",style:"margin-bottom:5px",background:"rgba(0,0,0,0.3)"});
		  var c = this.parent.addChild(desc);
		  c.extend(Interactive)
		  c.interactive(true);
		  c.CONFIG_STYLE = borders[i];
		  c.onTrigger = function(e){
        	Editor.customizer.target.restyle(e.CONFIG_STYLE);
      	  }
	  }
  }
  
});
