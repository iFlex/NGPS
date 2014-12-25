/*
*	NGPS Edit Interface
*	Author: Milorad Liviu Felix
*	28 Jun 2014  18:45 GMT
*	Need:
*		Need to be able to pup up editor same size regardless of zoom level
*/
//TODO: Fix weird trigger ( with the start editor listener ) evend firing on factory.root even though it's not listened for.
this.keyboard = {};
keyboard.editor = 0;
//NOT REQUIRED ANYMORE
keyboard.cursor = "|";
keyboard.cursor_interval = 250;

keyboard.keys = {}
keyboard.keys.caps_lock = 20;
keyboard.keys.shift = 16;
keyboard.keys.alt = 18;
keyboard.keys.ctrl = 17;
keyboard.keys.command = 91; //apple only
keyboard.keys.back_space = 8;
keyboard.keys.enter = 13;
keyboard.uppercase = false;

loadAppCode("edit/components/text",function(data)
{
	this.config = {};
	this.parent = data['parent'];
	this.startWorker = data['startWorker'];
	this.stopWorker = data['stopWorker'];
	this.rootDir = "plugins/text";
	keyboard.uppercase = 0;

	this.init = function() //called only one when bound with container
	{
		//include app
		keyboard.editor = factory.newContainer({x:100,y:100,width:500,height:50,background:"transparent"},"simple_rect",factory.base);
		requirejs([this.parent.appPath+"operations",this.parent.appPath+"interface"],function(){
			keyboard.buildTextInterface(keyboard.editor.DOMreference);
			keyboard.interface.init();
			keyboard.interface.parent = keyboard.editor;
		})
		keyboard.editor.hide();

		factory.root.addEventListener("triggered",keyboard.hide);
	}

	keyboard.focus = function(target)
	{
		keyboard.interface.parent.show();
		//assigns the editable DOM object
		keyboard.interface.target = target;
		keyboard.interface.subject = target.subject;
		var pos = target.getPos();
		pos = factory.root.surfaceToViewport(pos.x,pos.y);
		//alert("c:"+utils.debug(pos))
		keyboard.interface.parent.putAt(pos.x,pos.y - keyboard.interface.originalHeight);
		target.interactive(false);
	}
	keyboard.hide = function()
	{
		keyboard.interface.parent.hide();
		if(keyboard.interface.target)
			keyboard.interface.target.interactive(true);

		keyboard.interface.subject = 0;
	}
});
