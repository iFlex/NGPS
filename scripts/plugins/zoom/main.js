loadAppCode("zoom",function(data){
	this.config = {interface:"none"};
	this.parent = factory.base; //WARNING: this depends on the structure of the standard factory.js setup
	this.buttonNames = ['zup','zdn'];
	this.buttons = {};
	this.buttonSize = 30;
	this.zoomLevel = 1;
	this.zoomAm = 0.25;
	this.zoomAmDn = 0.6
	this.zoomAmUp = 1.4;
	this.zoomTime = 50;
	this.positionButtons = function()	
	{
		var width = this.buttonNames.length*this.buttonSize;
		var screen = platform.getScreenSize();
		var offset = ( screen.width - width) / 2;
		for(i in this.buttonNames)
			this.buttons[this.buttonNames[i]].putAt(offset + i*this.buttonSize , 55);
		
	}
	this.init = function() //called only once when bound with container
	{	
		var ctx = this;
		var btnSize = this.buttonSize;
		for( i in this.buttonNames)
		{
			var ctl = this.parent.addChild({x:0,y:0,width:btnSize,height:btnSize,type:"button",class:"btn btn-danger btn-lg",cssText:"position:fixed;text-align: center;padding: 6px 0;font-size: 12px;line-height: 1.42;border-radius: 15px;"},true);
			ctl.extend(Interactive);
			ctl.interactive(true);
			ctl.onMoved = function(){};
			ctl.DOMreference.type = "button";

			this.buttons[this.buttonNames[i]] = ctl;
		}
		this.buttons['zup'].addPrimitive({type:"i",content:{class:"glyphicon glyphicon-zoom-in"}});
		this.buttons['zup'].onTrigger = function(){
			factory.root.czoom(1.1);
			console.log("ZUP");
		}
		
		this.buttons['zdn'].addPrimitive({type:"i",content:{class:"glyphicon glyphicon-zoom-out"}});
		this.buttons['zdn'].onTrigger = function(){
			factory.root.czoom(0.9);
			console.log("ZDN");
		}
		//
		this.positionButtons();
	}
});