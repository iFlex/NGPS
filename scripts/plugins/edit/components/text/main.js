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
			ctdiv = factory.base.addChild({x:"100%",y:"100",width:1,height:1,style:"overflow:scroll",permissions:factory.UIpermissions});
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
		keyboard.editor = factory.newContainer({x:100,y:100,width:"auto",height:"32px",border_size:0,border_radius:["10px"],background:"rgba(255,255,255,0.25)",permissions:data.parent.getPermissions(),style:"box-shadow: 0 0 9px rgba(0,0,0,0.7);"},"simple_rect",factory.base);
		keyboard.editor.DOMreference.style.overflow = 'visible';
		requirejs([this.parent.appPath+"operations",this.parent.appPath+"interface"],function(){
			keyboard.buildTextInterface(keyboard.editor);
			keyboard.interface.parent = keyboard.editor;
			keyboard.interface.init(keyboard.editor);
		})
		keyboard.editor.hide();

	}
	this.quickMake = function(){
		var c = factory.container();
		this.makeTextContainer(c);
		keyboard.focus(c);
	}
	this.makeTextContainer = function(container,text){
		if(!container.textField){
			if(container._store && container._store.textFieldParentUID)
			{
				container.verticalAligner = findContainer(container._store.textFieldParentUID);
				container.textField = container.verticalAligner.child;
			} else {
				container.ghostTable = container.addChild({width:"100%",height:"100%",autopos:true,background:"transparent",style:"display: table",permissions:{interact:false}});
				container.verticalAligner = container.ghostTable.addChild({width:"100%",height:"100%",autopos:true,background:"transparent",style:"display: table-cell;text-align: center;vertical-align: middle;",permissions:{interact:false}});
				container.textField = container.verticalAligner.addPrimitive({type:"textarea",style:"width:100%;background:transparent;resize: none;outline: none;border: 0px solid;display: block;padding: 0;text-align: center;overflow-y:hidden"});
				container.addEventListener("triggered",function(data){keyboard.focus(data['target']);});
				//////////////////////////////////////////////////////////////
				container._store = {textFieldParentUID:container.verticalAligner.UID,"#BIND_editInterface":"text"};
			}
		}

		container.textField.onkeyup = adaptHeight;
		container.textField.parent = container;
		container.editInterface    = 'text';
		container.onTrigger = focusOnTextField;
		if(text)
			container.textField.innerHTML += text;
		keyboard.focus(container);
	}

	function adaptHeight(e){
		console.log(e);
		e.target.style.height = "1px";
		var newHeight = (25+e.target.scrollHeight);
		if(newHeight > e.target.parent.getHeight()){
			newHeight = e.target.parent.getHeight();
			e.target.style.overflowY = "scroll";
		} else {
			e.target.style.overflowY = "hidden";
		}
		e.target.style.height = newHeight+"px";
	}

	function focusOnTextField(target){
			if(target.textField)
				keyboard.focus(target);
	}

	keyboard.triggerResize = function(target){
		adaptHeight({target:target});
	}

	keyboard.focus = function(target)
	{
		Editor.addCloseCallback(keyboard.hide);
		if(Editor.keyBind)
				Editor.keyBind.deactivate();

		keyboard.interface.parent.show();
		//assigns the editable DOM object
		_target = target;
		keyboard.interface.target = target;
		keyboard.interface.subject = target.textField;

		var pos = target.local2global();
		keyboard.interface.parent.putAt(pos.x * factory.root.czoomLevel,(pos.y - keyboard.editor.getHeight()) * factory.root.czoomLevel);
		target.allowUserMove = false;

		if(keyboard.interface.subject.focus)
			keyboard.interface.subject.focus();
	}

	keyboard.hide = function()
	{
		keyboard.interface.parent.hide();
		if(_target)
			_target.allowUserMove = true;
		keyboard.interface.subject = 0;
		_target = 0;

		if(Editor.keyBind)
				Editor.keyBind.activate();
	}
});
