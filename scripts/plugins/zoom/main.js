loadAppCode("zoom",function(data){
	this.config = {interface:"none"};
	var parent = data['parent'];
	parent.setPermission('save',false);
	parent.setPermission('track',false);

	this.parent = factory.base; //WARNING: this depends on the structure of the standard factory.js setup
	this.buttonNames = ['zup','zdn'];
	this.buttons = {};
	this.buttonSize = 30;

	var zoomLevel = 1;
	var zoomAmDn = 0.9
	var zoomAmUp = 1.1;

	var offsetTop = data['offsetY'] || 0;
	this.positionButtons = function()
	{
		var width = this.buttonNames.length*this.buttonSize;
		var screen = platform.getScreenSize();
		var offset = 0;//( screen.width - width) / 2;
		for(i in this.buttonNames)
			this.buttons[this.buttonNames[i]].putAt(offset + i*this.buttonSize , offsetTop);
	}
	this.init = function() //called only once when bound with container
	{
		console.log(parent.appPath+" - initialising...");
		var ctx = this;
		var btnSize = this.buttonSize;
		for( i in this.buttonNames)
		{
			var ctl = this.parent.addChild({x:0,y:0,width:btnSize,height:btnSize,type:"button",class:"btn btn-danger btn-lg",cssText:"position:absolute;text-align: center;padding: 6px 0;font-size: 17px;line-height: 1.42;border-radius:0px"},true);
			ctl.extend(Interactive);
			ctl.interactive(true);
			ctl.onMoved = function(){};
			ctl.DOMreference.type = "button";
			ctl.setPermission('save',false);

			this.buttons[this.buttonNames[i]] = ctl;
		}
		this.buttons['zup'].addPrimitive({type:"i",content:{class:"glyphicon glyphicon-zoom-in"}});
		this.buttons['zup'].onTrigger = function(){
			factory.root.czoom(zoomAmUp);
			zoomLevel *= zoomAmUp;
		}

		this.buttons['zdn'].addPrimitive({type:"i",content:{class:"glyphicon glyphicon-zoom-out"}});
		this.buttons['zdn'].onTrigger = function(){
			factory.root.czoom(zoomAmDn);
			zoomLevel *= zoomAmDn;
		}
		//
		this.positionButtons();
	}
	this.shutdown = function(){
		console.log(parent.appPath+" - shutdown...");
		for( b in this.buttons)
			this.buttons[b].discard();
		delete this.buttons;
	}
});
