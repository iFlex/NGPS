/*
*	NGPS Edit Interface
*	Author: Milorad Liviu Felix
*	28 Jun 2014  18:45 GMT
*	Need:
*		Need to be able to pup up editor same size regardless of zoom level
*/
//TODO: Fix weird trigger ( with the start editor listener ) evend firing on factory.root even though it's not listened for.
this.keyboard = {};
keyboard.ops;
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
	this.parent.permissions.save = false;
	this.parent.permissions.connect = false;

	this.startWorker = data['startWorker'];
	this.stopWorker = data['stopWorker'];
	this.rootDir = "plugins/text";
	keyboard.uppercase = 0;
	keyboard.ops = this;
	var _target = 0;
	var monInterval;
	var ctdiv = 0;
	function monitor(){
		if(!_target)
			return;
		ctdiv.DOMreference.innerHTML = _target.DOMreference.value;
		_target.setWidth(ctdiv.DOMreference.scrollWidth+5);
		_target.setHeight(ctdiv.DOMreference.scrollHeight+5);
		console.log(ctdiv.DOMreference);
		console.log("w:"+ctdiv.DOMreference.scrollWidth+" h:"+ctdiv.DOMreference.scrollHeight);
	}

	this.startMonitoring = function(){
		monInterval = setInterval(monitor,100);

		if(!ctdiv)
			ctdiv = factory.base.addChild({x:"100%",y:"100",width:1,height:1,style:"overflow:scroll"});
		ctdiv.DOMreference.innerHTML = _target.DOMreference.innerHTML;
	}

	this.stopMonitoring = function(){
		clearInterval(monInterval);
	}

	this.init = function() //called only one when bound with container
	{
		console.log("edit/components/text - initialising.");
		utils.loadRawStyle(".textinterfC{\
			display: inline-table;\
			width: auto;\
			height:  100%;\
			text-align: center;\
			padding-left:5px;\
			padding-right:5px;\
		}\
\
		.textinterfT{\
			display: table-cell;\
			vertical-align: middle;\
			margin-top:auto;\
			margin-bottom:auto;\
			text-shadow: 0 0 9px rgba(255,255,255,1.0);\
		}\
		.bold{\
			font-weight: bold;\
		}\
		.italic{\
			font-style: italic;\
		}");

		//include app
		keyboard.editor = factory.newContainer({x:100,y:100,width:"auto",height:"32px",border_size:0,border_radius:["10px"],background:"rgba(255,255,255,0.25)",permissions:{save:false,connect:false},style:"box-shadow: 0 0 9px rgba(0,0,0,0.7);"},"simple_rect",factory.base);
		keyboard.editor.DOMreference.style.overflow = 'visible';
		requirejs([this.parent.appPath+"operations",this.parent.appPath+"interface"],function(){
			keyboard.buildTextInterface(keyboard.editor.DOMreference);
			keyboard.interface.parent = keyboard.editor;
			keyboard.interface.init();
		})
		keyboard.editor.hide();
		factory.root.addEventListener("triggered",keyboard.hide);
	}
	keyboard.focus = function(target)
	{
		if(Editor.addInterface)
			Editor.addInterface.hide();

		keyboard.interface.parent.show();
		//assigns the editable DOM object
		_target = target;
		keyboard.interface.target = target;
		keyboard.interface.subject = target.DOMreference;//.subject;

		var pos = target.local2global();
		keyboard.interface.parent.putAt(pos.x,pos.y - keyboard.interface.originalHeight-10);
		target.allowUserMove = false;

		if(keyboard.interface.subject.focus)
			keyboard.interface.subject.focus();

		keyboard.ops.startMonitoring();
	}
	keyboard.hide = function()
	{
		keyboard.interface.parent.hide();
		if(_target)
			_target.allowUserMove = true;
		keyboard.interface.subject = 0;
		_target = 0;
		keyboard.ops.stopMonitoring();
	}
});
