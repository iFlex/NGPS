/**
*	NGPS Container Models
*   Author: Milorad Liviu Felix
*	30 May 2014 07:05 GMT
*	Dependencies:
*		drivers
*		container
*	Description: Generic method of creating containers and cameras
*		Applies uniform settings to every container created ( color, size, style, etc ).
*		In order to reduce monotony has plugin possibility for an AMS script (Anti Monotnony Script) Which will change
*		the general container settings based on the previous settings applied (which will be provided as an argument to the AMS) 
*			This functionality enables themes ( a theme will therefore be an AMS combined with certain features )
*		It also can decide what functions to link to the trigger events of containers depending on what mode it is initiated in ( Viewer or Editor )
*/
requirejs(['container',"containerTemplates"]);
//we still need a container descriptor file that will be the selection of containers available to the user
this.factory = this.factory || {};
//initiation script comes here
factory.init = factory.init || function(mode) // editor init
{
	//settings
	factory.settings = factory.settings || {};
	factory.settings.container = {}
	factory.settings.container.width = 250;
	factory.settings.container.height = 250;
	factory.settings.mode = mode || "editor";
	//
	var descriptor = platform.getScreenSize();
	descriptor = utils.merge({x:0,y:0,background:"#fAfAfA",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]},descriptor);
	//make a full screen camera object
	var root = new container(descriptor);
	root.load();
	root.extend(Interactive);
	root.extend(Camera);
	root.interactive(true);
	root.cstart(30);

	factory.root = root;

	if(factory.AMS && factory.AMS.init)
		factory.AMS.init( factory.settings.container, factory.AMS);
}
factory.defaultDescriptor = { x:0 , y:0 , width:250 , height:250 ,background:"transparent",border_size:5,border_style:"dashed",border_color:"0xFFFFDD",border_radius:["15px"]}

//FACTORY functions
factory.newContainer = function(possize,tag,parent)
{
	if(!parent)
		parent = factory.root;
	
	//fetch descriptor
	var descriptor = descriptors.containers[tag];
	if(!descriptor){
		descriptor = factory.defaultDescriptor;
		console.error("Coule not load desired container descriptor:" + tag);
	}

	descriptor = utils.merge(descriptor,factory.settings.container,"override");
	//set position and size
	if(possize.x)
		descriptor.x = possize.x;
	
	if(possize.y)
		descriptor.y = possize.y;
	
	if(possize.width)
		descriptor.width = possize.width;
	
	if(possize.height)
		descriptor.height = possize.height;
	
	var obj = parent.addChild(descriptor);
	obj.extend(Interactive); //make object interactive

	if(obj)
	{
		obj.load();
		obj.interactive(true);
	}
	
	if(factory.AMS && factory.AMS.tick)
		factory.AMS.tick( utils.merge(descriptor,possize) , factory.settings.container, factory.AMS );

	return obj;
}
factory.createContainer = function(descriptor,parent)
{
	if(!parent)
		parent = factory.root;
	var obj = parent.addChild(descriptor);
	if(obj)
	{
		obj.load();
		obj.extend(Interactive);
		obj.interactive(true);
	}
	return obj;
}
factory.newCamera = function (possize,tag,parent,interval)
{
	possize.isCamera = true;
	var obj = factory.newContainer(possize,tag,parent)
	if(obj)
	{
		//possibly fetch camera tag for camera configurations
		obj.extend(Camera);
		
		if(!interval)
			interval = 30;
		
		obj.cstart(interval);
	}
	return obj;
}
//TODO: simplify method of adding content through a few modes
factory.addContent = function( obj , content , mode )
{

}
//TODO: make factory locate app, load it's files and load up the main.js
factory.loadApp = function(app,host)
{
	if(host)
	{
		host.extend(AppCtl);
		host.ainit(app);
		console.log("App bound at:"+utils.whois(host));
	}
}