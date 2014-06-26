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
requirejs(['container',"descriptors/containers","descriptors/links","themes/default"]);
//we still need a container descriptor file that will be the selection of containers available to the user
this.factory = this.factory || {};
this.factory.initialised = false;
//initiation script comes here
factory.init = factory.init || function(mode) // editor init
{
	if(factory.initialised)
	{
		//resetting the factory
		factory.initialised = false;
		factory.root.discard();
	}
	//settings
	factory.settings = factory.settings || {};
	factory.settings.container = {}
	factory.settings.container.width = 250;
	factory.settings.container.height = 250;
	factory.settings.mode = mode || "editor";
	//
	var descriptor = platform.getScreenSize();
	//"#fAfAfA"
	descriptor = utils.merge({x:0,y:0,background:"black",border_size:1,border_style:"solid"},descriptor);
	//make a full screen camera object
	var root = new container(descriptor);
	root.load();
	root.extend(Interactive);
	root.extend(Camera);
	root.interactive(true);
	//root.DOMreference.addEventListener('mouseout' ,root.onMouseUp,  false);
	root.cstart(1);
	factory.root = root;
	factory.initialised = true;
	
	if(factory.setup) //if custom setup is loaded, run it
		factory.setup();

	if(factory.AMS && factory.AMS.init)
		factory.AMS.init( factory.settings.container, factory.AMS);
}
factory.defaultDescriptor = { x:0 , y:0 , width:250 , height:250 ,background:"transparent"}

//FACTORY functions
factory.newContainer = function(possize,tag,parent)
{
	if(!factory.initialised)
		factory.init();

	if(!parent)
		parent = factory.root;
	
	//fetch descriptor
	var descriptor = 0;
	if(Descriptors.containers[tag])
		descriptor = Descriptors.containers[tag];
	if(!descriptor)
		descriptor = factory.defaultDescriptor;

	descriptor = utils.merge(descriptor,factory.settings.container,"override");
	
	var obj = parent.addChild( utils.merge(descriptor,possize,true) );
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
	if(!factory.initialised)
		factory.init();
	
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
	if(!factory.initialised)
		factory.init();

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
//APPs
factory.newGlobalApp = function ( app )
{
	var host = factory.newContainer({x:0,y:0,width:1,height:1,background:"transparent"},"simple_rect");
	host.loadApp(app);
	return host;
}
//TODO: 
factory.newLink = function( a , b , type)
{

}
