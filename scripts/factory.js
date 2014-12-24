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

//NGPS Factory creates 2 main objects: foot ( dymanic object holder ) overlay ( a static holder that allows headers or interfaces to be independent from the main camera)
requirejs(['container',"descriptors/containers","descriptors/links","themes/default","regional/regionalLoader"]);
//we still need a container descriptor file that will be the selection of containers available to the user
this.factory = this.factory || {};
this.factory.initialised = false;
//initiation script comes here
factory.init = function(mode) // editor init
{
	if(factory.initialised)
	{
		//resetting the factory
		factory.initialised = false;
		factory.root.discard();
	}
	//global initalisation operations
	factory.presentation = {};
	factory.presentation.name = "Not Decided Yet";
	//settings
	factory.settings = factory.settings || {};
	factory.settings.debug = false;
	factory.settings.container = {}
	factory.settings.container.width = 250;
	factory.settings.container.height = 250;

	if( mode == "editor" )
	{
		//creating factory.root ( place where dynamic content is placed )
		factory.base = new container(Descriptors.containers['base']);
		factory.base.load();

		factory.root = factory.base.addChild(Descriptors.containers['root']);
		factory.root.extend(Interactive);
		factory.root.extend(Camera);
		factory.root.interactive(true);
		factory.root.cstart(10);

		//center camera
		var s = factory.root.getSurface();
		factory.root.c_move(-s['width']/2,-s['height']/2);

		factory.initialised = true;

		if(factory.setup) //if custom setup is loaded, run it
			factory.setup();
	}
	if( mode == "view" )
	{
		//need to be manually set
		factory.base = 0;
		factory.root = 0;
	}


	if(factory.AMS && factory.AMS.init)
		factory.AMS.init( factory.settings.container, factory.AMS);
}
factory.defaultDescriptor = { x:0 , y:0 , width:250 , height:250 ,background:"transparent"}

//FACTORY functions
factory.newContainer = function(possize,tag,parent,addToFrame,translate)
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

	var obj = parent.addChild( utils.merge(descriptor,possize,true) , addToFrame, translate );
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

factory.createContainer = function(descriptor,parent,addToFrame,translate)
{
	if(!factory.initialised)
		factory.init();

	if(!parent)
		parent = factory.root;
	var obj = parent.addChild(descriptor,addToFrame,translate);
	if(obj)
	{
		obj.load();
		obj.extend(Interactive);
		obj.interactive(true);
	}
	return obj;
}

factory.newIsolatedContainer = function(descriptor)
{
	descriptor['*isolated'] = true;
	var obj = new container(descriptor);
	obj.load();
	obj.extend(Interactive);
	obj.interactive(true);
	//safety
	obj.parent = factory.root;
	return obj;
}

factory.newCamera = function (possize,tag,parent,interval,addToFrame,translate)
{
	if(!factory.initialised)
		factory.init();

	possize.isCamera = true;
	var obj = factory.newContainer(possize,tag,parent,addToFrame,translate)
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
factory.newGlobalApp = function ( app , passToApp )
{
	var host = factory.newContainer({x:0,y:0,width:1,height:1,background:"transparent"},"simple_rect",factory.base);
	host.loadApp(app,passToApp);
	return host;
}
//TODO:
factory.newLink = function( a , b , type)
{

}
