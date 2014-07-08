loadAppCode("zoom",function(data){
	this.config = {interface:"none"};
	this.parent = factory.root;
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
		{
			this.buttons[this.buttonNames[i]].putAt(offset + i*this.buttonSize , 50)
		}
	}
	this.init = function() //called only one when bound with container
	{	
		var ctx = this;
		var btnSize = this.buttonSize;
		for( i in this.buttonNames)
		{
			var ctl = this.parent.addChild({width:btnSize,height:btnSize,type:"button",class:"btn btn-danger btn-lg",cssText:"width: 30px;height: 30px;text-align: center;padding: 6px 0;font-size: 12px;line-height: 1.42;border-radius: 15px;"},true);
			ctl.extend(Interactive);
			ctl.interactive(true);
			ctl.onMoved = function(){};

			ctl.DOMreference.style.top = "0px";
			ctl.DOMreference.style.left = "0px";
			ctl.DOMreference.type = "button";

			this.buttons[this.buttonNames[i]] = ctl;
		}
		this.buttons['zup'].addPrimitive({type:"i",content:{class:"glyphicon glyphicon-zoom-in"}});
		this.buttons['zup'].onTrigger = function(){
			ctx.zoomLevel *= ctx.zoomAmUp;
			factory.root.tween({zoom:ctx.zoomLevel},ctx.zoomTime);
		}
		
		this.buttons['zdn'].addPrimitive({type:"i",content:{class:"glyphicon glyphicon-zoom-out"}});
		this.buttons['zdn'].onTrigger = function(){
			ctx.zoomLevel *= ctx.zoomAmDn;
			factory.root.tween({zoom:ctx.zoomLevel},ctx.zoomTime);
		}
		//
		this.positionButtons();
	}
});