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
*	Events:
*		startup
*/
this.factory = this.factory || {};

//NGPS Factory creates 2 main objects: foot ( dymanic object holder ) overlay ( a static holder that allows headers or interfaces to be independent from the main camera)
requirejs(["","descriptors/containers","descriptors/links","themes/default","regional/regionalLoader"],function(){
	factory.ready = true;
});
//we still need a container descriptor file that will be the selection of containers available to the user
this.factory.initialised = false;
this.factory.allInitialised = 0;
this.factory.UIpermissions = {save:false,edit:false,connect:false,track:false}
//initiation script comes here
factory.init = function(mode,manualSetup) // editor init
{
	function _init() {
		if(!manualSetup) //if custom setup is loaded, run it
			factory.setup[mode]();

		GEM.addEventListener("appsLoaded",0,function(){
			if(!factory.allInitialised){
				factory.allInitialised = true;
				GEM.fireEvent({event:"startup",isGlobal:true});
				GEM.removeEventListener("appsLoaded",0,0,factory);
			}
		},factory);
	}

	console.log("Factory initialised:"+factory.initialised);
	if(factory.initialised)
	{
		//resetting the factory
		factory.initialised = false;
		factory.base.discard();
		containerData.containerIndex = 0;
	}
	//settings
	factory.settings = factory.settings || {};
	factory.settings.debug = false;
	factory.settings.container = {}
	factory.settings.container.width = 250;
	factory.settings.container.height = 250;

	factory.base = new container(Descriptors.containers['base']);

	factory.root = factory.base.addChild(Descriptors.containers['root']);
	factory.root.extend(Interactive);
	factory.root.extend(Camera);
	factory.root.interactive(true);
	factory.root.cstart(5);
	containerData.cameraCtx = factory.root;

	//center camera
	var s = factory.root.getSurface();
	factory.root.c_move(-s['width']/2,-s['height']/2);
	factory.initialised = true;
	console.log("setup basics for mode:"+mode);
	_init();

	if(factory.AMS && factory.AMS.init)
		factory.AMS.init( factory.settings.container, factory.AMS);
}
factory.defaultDescriptor = { x:0 , y:0 , width:250 , height:250 ,background:"transparent"}

//FACTORY functions
factory.container = function(){
	var parent = factory.root;
  var w = factory.base.getWidth()/2;
	var h = factory.base.getHeight()/2;
	var possize = {x:(w-w/2),y:(h-h/2),width:w,height:h};
	var actpos = factory.root.display.global2local(possize.x,possize.y);
	possize.x = actpos.x;
	possize.y = actpos.y;
	return factory.newContainer(possize,"",parent);
}
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

	//apply theme
	if(factory.AMS && factory.AMS.generate)
		factory.AMS.generate( parent , factory.settings.container, factory.AMS );

	if(!descriptor['ignoreTheme'])
		descriptor = utils.merge(descriptor,factory.settings.container,true);

	var obj = parent.addChild( utils.merge(descriptor,possize,true) , false );
	obj.extend(Interactive); //make object interactive
	obj.interactive(true);

	return obj;
}

factory.createContainer = function(descriptor,parent,noInteraction)
{
	if(!factory.initialised)
		factory.init();

	if(!parent)
		parent = factory.root;

	if(factory.AMS && factory.AMS.generate)
		factory.AMS.generate( parent , factory.settings.container, factory.AMS );

	var obj = parent.addChild(descriptor);
	if(obj && !noInteraction)
	{
		obj.extend(Interactive);
		obj.interactive(true);
	}
	return obj;
}

factory.newIsolatedContainer = function(descriptor,parent)
{
	descriptor['*isolated'] = parent;
	var obj = new container(descriptor);
	obj.extend(Interactive);
	obj.interactive(true);
	return obj;
}

factory.newCamera = function (possize,tag,parent)
{
	if(!factory.initialised)
		factory.init();

	possize.isCamera = true;
	var obj = factory.newContainer(possize,tag,parent)
	if(obj)
	{
		//possibly fetch camera tag for camera configurations
		obj.extend(Camera);
		obj.extend(Interactive);
		obj.interactive(true);
		obj.cstart();
	}
	return obj;
}
//Global APPs
factory._glApps = {};
factory.newGlobalApp = function ( app , passToApp )
{
	//keep track of all global apps
	if(!factory._glApps[app]) {
		factory._glApps[app] = factory.newContainer({x:0,y:0,width:1,height:1,background:"transparent"},"global_app",factory.base);
		factory._glApps[app].loadApp(app,passToApp);
	}
	return factory._glApps[app];
}

factory.removeGlobalApp = function ( app,unsafe )
{
	console.log("removing global app:"+app);
	if( factory._glApps[app] )
	{
		factory._glApps[app].discard();
		delete factory._glApps[app];
		return true;
	}

	if(unsafe)
	{
		if(AppMgr.loadedApps[app])
		{
			for( k in AppMgr.appHosts[app])
			{
				console.log("uFound instance of "+app+":"+utils.debug(AppMgr.appHosts[app][k]));
				AppMgr.appHosts[app][k].discard();
			}
			return true;
		}
	}
	return false;
}

factory.listGlobalApps = function(withCount){
	if(!withCount)
		return Object.keys(factory._glApps);

	var apps = {};
	for( k in factory._glApps)
		apps[k] = factory._glApps[k].length;
	return apps;
}

factory.removeAllGlobalApps = function(){
	var apps = factory.listGlobalApps();
	for( a in apps)
		factory.removeGlobalApp(apps[a]);
}
