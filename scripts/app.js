/**
*	NGPS App Controler
*	Authos:	Milorad Liviu Felix
*	7 June 2014 	12:20 GMT
*
*	Available Events:
*		appInitalised
*		appDestroyed
*		appShowed
*		appHidden
*		appRun
*		appSuspend
*
*	Conventions:
*		App must all the loadAppCode function with it's name as the first argument and it's code as the second ( function as class )
*		App constructor function will get a object {} with parent: startWorker: and stopWorker properties and other initial required information
*		startWorker returns the id of the worker or -1 in case the worker was not started
*/
/**
*	NGPS App Controler
*	Authos:	Milorad Liviu Felix
*	7 June 2014 	12:20 GMT
*
*	Available Events:
*		appInitalised
*		appDestroyed
*		appShowed
*		appHidden
*		appRun
*		appSuspend
*		appsLoaded - all apps have been loaded
*
*	Conventions:
*		App must all the loadAppCode function with it's name as the first argument and it's code as the second ( function as class )
*		App constructor function will get a object {} with parent: startWorker: and stopWorker properties and other initial required information
*		startWorker returns the id of the worker or -1 in case the worker was not started
*/

var AppCtl = {};
var AppMgr = {};
AppMgr.status = "idle";
AppMgr.maxAppWorkers = 10;
AppMgr.running_app_parent = 0;
AppMgr.workers = {};
AppMgr.loadedApps = {};
AppMgr.appHosts = {};
//only one app can be running at one time
//apps can have backbround tasks running even though they are suspended
//those processes will be stopped when the app is unloaded
//TODO make sure the function loadAppCode is available before any app is loaded
function loadAppCode(name,app)
{
	AppMgr.loadedApps[name] = app;
	if( AppMgr.checkIfAllLoaded() )
		GEM.fireEvent({event:"appsLoaded",isGlobal:true});
}

AppMgr.checkIfAllLoaded = function(){
		for(i in AppMgr.loadedApps)
			if(AppMgr.loadedApps[i] == 0)
				return false;
		return true;
}

AppCtl.ainit = function(app,params)
{
	if(!params)
		params = {};
	params = utils.merge(params,{parent:this,startWorker:this.requestWorker,stopWorker:this.stopWorker},"override");

	this.isApp = true;
	try {
		this.app = new app(params);
	} catch(e) {
		console.log("Failed to initialise app on container:"+this.UID,e);
		this.adestroy();
		return;
	}

	AppMgr.appHosts[this.appName] = AppMgr.appHosts[this.appName] || {};
	AppMgr.appHosts[this.appName][this.UID] = this;
	//unique identifiers for workers
	this.aworkers = 0;
	//
	this.cover = 0;
	this.exit = 0;
	/////////////////////
	data = this.app.config;
	var _permissions = {edit:false,save:false,track:false,connect:false};
	if(data['interface'] != "none")
	{
		if(data && data['cover'])
		{
			data['cover'].setPermissions(_permissions);
			this.cover = this.addChild(data['cover'])
		}
		else
			this.cover = this.addChild({x:"0%",y:"0%",width:"100%",height:"100%",background:"transparent",permissions:_permissions});

		if(data && data['exit'])
		{
			data['exit'].setPermissions(_permissions);
			this.exit = this.addChild(data['exit'])
		}
		else
		{
			var attach = this.parent;
			var pos = this.getPos(0,0);
			if(!attach)
			{
				attach = this;
				pos.x = 0;
				pos.y = 0;
			}

			d = 40;
			this.exit = attach.addChild({x:"0%",y:"0%",width:d,height:d,background:"black",border_radius:["5px","5px","0px","0px"],permissions:_permissions})
			this.exit.putAt(pos.x,pos.y,0,1);
		}
		//
		this.cover.DOMreference.name = "cover";
		this.exit.DOMreference.name = "exit";
		//configure for interaction
		this.exit.theapp = this;
		this.cover.extend(Interactive);
		this.cover.interactive(true);

		this.exit.extend(Interactive);
		this.exit.interactive(true);

		this.cover.DOMreference.style.zIndex = 1;
		this.exit.DOMreference.style.zIndex = 2;

		this.exit.addPrimitive({type:"div"});
		this.exit.child.innerHTML = '<center><span class="glyphicon glyphicon-remove" style="color:white;font-size:'+(d/2)+'px"></span></center>'

		//Configure triggers and propagation
		this.cover.onMoved = function(dx,dy,ctx){ctx.parent.move(dx,dy);}
		this.cover.onTrigger = this.arun;
		this.exit.onTrigger = this.asuspend;

		//prepare for run
		this.cover.show();
		this.exit.hide();
	}
	//initialise app
	this.app.init();

	//EVENT
	if( this.events['appInitialised'] || ( GEM.events['appInitialised'] && GEM.events['appInitialised']['_global'] ) )
		GEM.fireEvent({event:"appInitialised",target:this})
}
AppCtl.adestroy = function() // completely remove app from container
{
	if( AppMgr.running_app_parent == this)
	{
		AppMgr.running_app_parent = 0;
		AppMgr.status = "idle";
	}

	try{
		this.app.shutdown();
		//stop all of the apps workers
		this.stopWorker();
	}catch(e){
		console.ward("ERROR: could not shutdown application",e);
	}

	delete AppMgr.appHosts[this.appName][this.UID];
	if( Object.keys(AppMgr.appHosts[this.appName]).length == 0 ) //all apps instances destroyed, time to unload the app
		delete AppMgr.loadedApps[this.appName];

	delete this.app;
	this.isApp = false;
	//EVENT
	if( this.events['appDestroyed'] || ( GEM.events['appDestroyed'] && GEM.events['appDestroyed']['_global'] ) )
		GEM.fireEvent({event:"appDestroyed",target:this})
}
AppCtl.ashow = function()
{
	this.app.show();
	this.allowMove = false;

	//EVENT
	if( this.events['appShowed'] || ( GEM.events['appShowed'] && GEM.events['appShowed']['_global'] ) )
		GEM.fireEvent({event:"appShowed",target:this})
}
AppCtl.ahide = function()
{
	this.app.hide();
	this.allowMove = true;

	//EVENT
	if( this.events['appHidden'] || ( GEM.events['appHidden'] && GEM.events['appHidden']['_global'] ) )
		GEM.fireEvent({event:"appHidden",target:this})
}
AppCtl.arun = function(ctx)
{
	//suspend previous app
	if( AppMgr.running_app_parent && AppMgr.running_app_parent != this )
		AppMgr.running_app_parent.asuspend();

	var host = this;
	if(ctx)
		host = ctx.parent;

	host.pauseInteraction(true);
	host.cover.hide();

	var attach = host.parent;
	var pos = host.getPos(0,0);
	if(!attach)
	{
		attach = host;
		pos.x = 0;
		pos.y = 0;
	}
	host.exit.show();
	host.exit.putAt(pos.x,pos.y,0,1);
	//app
	host.app.run();
	AppMgr.running_app_parent = host;
	AppMgr.status = "running";

	//EVENT
	if( this.events['appRun'] || ( GEM.events['appRun'] && GEM.events['appRun']['_global'] ) )
		GEM.fireEvent({event:"appRun",target:this})
}
AppCtl.asuspend = function(ctx)
{
	if(	AppMgr.running_app_parent == this )
	{
		AppMgr.running_app_parent = 0;
		AppMgr.status = "idle";
	}
	var host = this;
	if(ctx)
		host = ctx.theapp;

	host.pauseInteraction(false);
	host.cover.show();
	host.exit.hide();
	//app
	host.app.suspend();

	//EVENT
	if( this.events['appSuspend'] || ( GEM.events['appSuspend'] && GEM.events['appSuspend']['_global'] ) )
		GEM.fireEvent({event:"appSuspend",target:this})
}

//TODO test
//	   optimize worker requester so that it takes account of CPU usage & mem
AppCtl.requestWorker = function( worker, interval )
{
	if(!worker)
		return -2;//no worker specified

	if(!interval)
	{
		//TODO: calculate a suitable default interval
		interval = 30;
	}

	if( !AppMgr.workers[this.UID] )
		AppMgr.workers[this.UID] = [];

	var nrWorkers = AppMgr.workers[this.UID].length;

	var context = this;
	function tick(){
		//pass the context of the app to the worker
		worker(context);
	}

	if( nrWorkers == 0 ) //every app has the right to at least one worker
	{
		this.aworkers++;
		AppMgr.workers[this.UID][nrWorkers] = {id:this.aworkers,ctl:setInterval( tick , interval )};
		return this.aworkers;
	}
	else
	{
		if( nrWorkers < AppMgr.maxAppWorkers )
		{
			this.aworkers++;
			AppMgr.workers[this.UID][nrWorkers] = {id:this.aworkers,ctl:setInterval( tick , interval )};
			return this.aworkers;
		}
	}
	return -1;
}

AppCtl.stopWorker = function( id )
{
	//console.log("this:"+this+" "+this.UID);
	if( AppMgr.workers[this.UID] )
	{
		var len = AppMgr.workers[this.UID].length;
		for( var i=0; i < len; ++i )
			if( !id || AppMgr.workers[this.UID][i]['id'] == id )
			{
				clearInterval( AppMgr.workers[this.UID][i]['ctl'] )
				AppMgr.workers[this.UID].splice(i,1);
				if(id)
					return true;
			}
		if(!id)
			return true;
	}
	return false;
}
