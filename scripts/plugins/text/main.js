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

loadAppCode("text",function(data)
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
		keyboard.editor = factory.newContainer({x:100,y:100,width:500,height:50,background:"transparent"},"simple_rect",factory.root);
		requirejs([this.parent.appPath+"operations",this.parent.appPath+"interface"],function(){
			keyboard.buildTextInterface(keyboard.editor.DOMreference);
			keyboard.interface.init();
			keyboard.interface.parent = keyboard.editor;
		})
		keyboard.editor.hide();

		//enable keyboard
		//document.onkeydown = keyboard.onKeyDown;
		//document.onkeyup   = keyboard.onKeyUp;
	}
	this.run = function()	//called whenever the container is triggered
	{
		
	}
	this.suspend = function() //called whenever the container looses focus ( or gets out of view )
	{

	}
	this.shutdown = function() //called only when app is unloaded from container
	{

	}
	this.show = function() //shows app
	{

	}
	this.hide = function() //hides app
	{

	}
	keyboard.onKeyDown = function(evt)
	{
		/*
		evt = evt || window.event;
		console.log("."+evt.keyCode);
		if(evt.keyCode == keyboard.keys.caps_lock || evt.keyCode == keyboard.keys.shift) // caps loc or shift
			keyboard.uppercase = !keyboard.uppercase;
		keyboard.addLetter(evt.keyCode);
		*/
	}
	keyboard.onKeyUp = function(evt)
	{
		/*
		evt = evt || window.event;
		console.log("^"+evt.keyCode);
		if(evt.keyCode == keyboard.keys.caps_lock || evt.keyCode == keyboard.keys.shift) // caps loc or shift
			keyboard.uppercase = !keyboard.uppercase;
		*/
	}
	keyboard.checkKeyOperation = function(key)
	{
		/*
		if( key == keyboard.keys.enter )
			keyboard.interface.subject.innerHTML += "<br>";
		if( key == keyboard.keys.back_space)
			keyboard.interface.subject.innerHTML = keyboard.interface.subject.innerHTML.slice(0,keyboard.interface.subject.innerHTML.length-1)
		*/
	}
	keyboard.addLetter = function(code)
	{
		/*
		var nc = String.fromCharCode(code);
		
		if(keyboard.interface.subject)
		{
			for(k in keyboard.keys)
			{
				if(keyboard.keys[k] == code)
				{
					keyboard.checkKeyOperation(code);
					return;
				}
			}
			if(keyboard.uppercase)
				nc = nc.toUpperCase();
			else
				nc = nc.toLowerCase();
			keyboard.interface.subject.innerHTML += nc;
		}	
		*/
	}
	keyboard.focusEditor = function(target)
	{
		keyboard.interface.parent.show();
		//assigns the editable DOM object
		keyboard.interface.target = target;
		keyboard.interface.subject = target.subject;
		var pos = target.getPos();
		//alert("c:"+utils.debug(pos))
		keyboard.interface.parent.putAt(pos.x,pos.y - keyboard.interface.originalHeight);
		target.interactive(false);
	}
	keyboard.hideEditor = function()
	{
		keyboard.interface.parent.hide();
		if(keyboard.interface.target)
			keyboard.interface.target.interactive(true);
		
		keyboard.interface.subject = 0;
	}
});
