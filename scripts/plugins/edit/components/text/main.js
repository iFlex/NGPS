/*
*	NGPS Edit Interface
*	Author: Milorad Liviu Felix
*	28 Jun 2014  18:45 GMT
*	Need:
*		Need to be able to pup up editor same size regardless of zoom level
*/
//TODO: Fix weird trigger ( with the start editor listener ) evend firing on ngps.mainCamera even though it's not listened for.
this.keyboard = {};
keyboard.ops;
keyboard.editor = 0;

loadAppCode("edit/components/text",function(data)
{
	this.config = {};
	this.parent = data['parent'];
	data.parent.setPermissions(factory.UIpermissions);

	this.startWorker = data['startWorker'];
	this.stopWorker = data['stopWorker'];
	this.rootDir = "plugins/text";
	
	Editor.text = this;
	
	keyboard.uppercase = 0;
	keyboard.ops = this;
	var _target = 0;
	var monInterval;
	var ctdiv = 0;
	
	function processText(text){
		var lines = (text.split(/\n/g)||[])
		var longest = ""
		
		if(lines.length == 0)
			longest = text
		else
			for( i in lines ) if(lines[i].length > longest.length) longest = lines[i]
		
		if(longest.length == 0)
			longest = "Test text here"
			
		return [longest,lines.length+1];
	}
	
	function monitor(){
		if(!_target)
			return;
		ctdiv.DOMreference.style.fontSize = _target.textField.style.fontSize;
		ctdiv.DOMreference.style.fontStyle = _target.textField.style.fontStyle;
		ctdiv.DOMreference.style.fontWeight = _target.textField.style.fontWeight;
		
		var processed = processText(_target.textField.value)
		ctdiv.DOMreference.innerHTML = processed[0];
		_target.setWidth(ctdiv.DOMreference.scrollWidth+20);
		_target.setHeight(ctdiv.DOMreference.scrollHeight * processed[1]);
	}

	this.startMonitoring = function(){
		monInterval = setInterval(monitor,250);

		if(!ctdiv)
			ctdiv = factory.base.addChild({x:"100%",y:"100",width:1,height:1,style:"overflow:hidden;white-space:nowrap;",permissions:factory.UIpermissions});
		ctdiv.DOMreference.innerHTML = _target.textField.value;
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
		keyboard.editor = factory.newContainer({x:100,y:100,width:"auto",height:"32px",border_size:0,border_radius:["10px"],background:"rgba(255,255,255,0.25)",permissions:data.parent.getPermissions(),style:"box-shadow: 0 0 9px rgba(0,0,0,0.7);"},"simple_rect",factory.base);
		keyboard.editor.DOMreference.style.overflow = 'visible';
		requirejs([this.parent.appPath+"operations",this.parent.appPath+"interface"],function(){
			keyboard.buildTextInterface(keyboard.editor);
			keyboard.interface.parent = keyboard.editor;
			keyboard.interface.init(keyboard.editor);
		})
		keyboard.editor.hide();

	}
	
	this.quickMake = function(x,y,target){
		if(target.textField){
			Editor.sizer.show(target);
			return;
		}
		
		keyboard.hide();
	
		var c = target.addChild({x:x,y:y,width:100,height:100,background:"rgba(0,0,0,0.5)"});//factory.container();
		var pos = c.global2local();
		c.putAt(pos.x,pos.y,0.5,0.5);
		
		c.extend(Interactive);
		c.interactive(true);  
		Editor.text.makeTextContainer(c);
		keyboard.focus(c);
		Editor.text.startMonitoring();
	}
	
	this.makeTextContainer = function(container,text){
		if(!container.textField){
			container.DOMreference.style.overflow = "hidden"
			container.textField = container.addPrimitive({type:"textarea",
			style:"width:100%;height:100%;background:transparent;resize: none;outline: none;border: 0px solid;display: block;padding: 0;text-align: left;overflow-y:hidden"});
			container.addEventListener("triggered",function(data){keyboard.focus(data['target']);});
			
			container.textField.parent  = container;
			container.onkeyup           = monitor;
			container.editInterface     = 'text';
			container.onTrigger         = focusOnTextField;
		}
		
		if(text)
			container.textField.innerHTML += text;
		keyboard.focus(container);
	}

	function focusOnTextField(target){
			if(target.textField)
				keyboard.focus(target);
	}

	keyboard.triggerResize = function(target){
		adaptHeight({target:target});
	}

	keyboard.focus = function(target) {
		//Editor.addCloseCallback(keyboard.hide);
		if(Editor.keyBind)
				Editor.keyBind.deactivate();

		keyboard.interface.parent.show();
		//assigns the editable DOM object
		console.log("FOCUS")
		console.log(target);
		
		_target = target;
		keyboard.interface.target = target;
		keyboard.interface.subject = target.textField;
		target.textField.style.border = "2px solid";
		
		var pos = target.local2global();
		keyboard.interface.parent.putAt(pos.x * ngps.mainCamera.czoomLevel,(pos.y - keyboard.editor.getHeight()) * ngps.mainCamera.czoomLevel);
		target.allowUserMove = false;

		if(keyboard.interface.subject.focus)
			keyboard.interface.subject.focus();
		
	}

	keyboard.hide = function() {
		
		Editor.text.stopMonitoring();
		keyboard.interface.parent.hide();
		if(_target){
			_target.allowUserMove = true;
			_target.textField.style.border = "0px solid";
		}
		keyboard.interface.subject = 0;
		_target = 0;

		if(Editor.keyBind)
				Editor.keyBind.activate();
		
	}
	Editor.text.hide = keyboard.hide;
});
