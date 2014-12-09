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
*	    
*	Conventions:
*		App must all the loadAppCode function with it's name as the first argument and it's code as the second ( function as class )
*		App constructor function will get a object {} with parent: startWorker: and stopWorker properties and other initial required information
*		startWorker returns the id of the worker or -1 in case the worker was not started
*/

this.AppCtl = {};
this.AppMgr = {};
AppMgr.status = "idle";
AppMgr.maxAppWorkers = 10;
AppMgr.running_app_parent = 0;
AppMgr.workers = {};
AppMgr.loadedApps = {};
//only one app can be running at one time
//apps can have backbround tasks running even though they are suspended
//those processes will be stopped when the app is unloaded
//TODO make sure the function loadAppCode is available before any app is loaded
function loadAppCode(name,app)
{
	AppMgr.loadedApps[name] = app;
}

AppCtl.ainit = function(app,params)
{
	if(!params)
		params = {};
	params = utils.merge(params,{parent:this,startWorker:this.requestWorker,stopWorker:this.stopWorker},"override");

	this.isApp = true;
	this.app = new app(params);
	//unique identifiers for workers
	this.aworkers = 0;
	//
	this.cover = 0;
	this.exit = 0;
	/////////////////////
	data = this.app.config;
	if(data['interface'] != "none")
	{
		if(data && data['cover'])
			this.cover = this.addChild(data['cover'])
		else
			this.cover = this.addChild({x:"0%",y:"0%",width:this.getWidth(),height:this.getHeight(),background:"transparent"});
		
		if(data && data['exit'])
			this.exit = this.addChild(data['exit'])
		else
		{
			var d = this.getWidth()*0.1;
			var h = this.getHeight()*0.1;
			if(d>h)
				d=h;
			if( d > 64 )
				d = 64;
			this.exit = this.addChild({x:"0%",y:"0%",width:d,height:d,background:"red",border_radius:["15px"]})
		}
		//configure for interaction
		this.cover.extend(Interactive);
		this.cover.interactive(true);

		this.exit.extend(Interactive);
		this.exit.interactive(true);
		
		this.cover.DOMreference.style.zIndex = 1;
		this.exit.DOMreference.style.zIndex = 2;

		this.exit.addPrimitive({type:"div"});
		this.exit.child.innerHTML = '<center><span class="glyphicon glyphicon-ok"></span></center>'
		
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

	if( this.app.shutdown )
		this.app.shutdown();
	//stop all of the apps workers
	this.stopWorker();
	
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

	host.suspendInteraction();
	host.cover.hide();
	host.exit.show();
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
		host = ctx.parent;
	
	host.resumeInteraction();
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
	console.log("this:"+this+" "+this.UID);
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
/*
Centralised Version
this.AppCtl = {};
this.AppMgr = {};
AppMgr.status = "idle";
AppMgr.maxAppWorkers = 10;
AppMgr.running_app_parent = 0;
AppMgr.workers = {};
AppMgr.loadedApps = {};
//only one app can be running at one time
//apps can have backbround tasks running even though they are suspended
//those processes will be stopped when the app is unloaded
//TODO make sure the function loadAppCode is available before any app is loaded
function loadAppCode(name,app)
{
	AppMgr.loadedApps[name] = app;
}

AppCtl.ainit = function(app)
{
	this.isApp = true;
	this.app = new app({parent:this,startWorker:this.requestWorker,stopWorker:this.stopWorker});
	//unique identifiers for workers
	this.aworkers = 0;
	//
	this.cover = 0;
	this.exit = 0;
	/////////////////////
	data = this.app.config;
	if(data['interface'] != "none")
	{
		if(data && data['cover'])
			this.cover = this.addChild(data['cover'])
		else
			this.cover = this.addChild({x:"0%",y:"0%",width:this.getWidth(),height:this.getHeight(),background:"transparent"});
		
		if(data && data['exit'])
			this.exit = this.addChild(data['exit'])
		else
		{
			var d = this.getWidth()*0.1;
			var h = this.getHeight()*0.1;
			if(d>h)
				d=h;
			if( d > 64 )
				d = 64;
			this.exit = this.addChild({x:"0%",y:"0%",width:d,height:d,background:"red",border_radius:["15px"]})
		}
		//configure for interaction
		this.cover.extend(Interactive);
		this.cover.interactive(true);

		this.exit.extend(Interactive);
		this.exit.interactive(true);
		
		this.cover.DOMreference.style.zIndex = 1;
		this.exit.DOMreference.style.zIndex = 2;

		this.exit.addPrimitive({type:"div"});
		this.exit.child.innerHTML = '<center><span class="glyphicon glyphicon-ok"></span></center>'
		
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

	if( this.app.shutdown )
		this.app.shutdown();
	//stop all of the apps workers
	this.stopWorker();
	
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
		host = ctx.parent
	host.cover.hide();
	host.exit.show();
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
		host = ctx.parent;
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
	var ctx = this;
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

	if( nrWorkers == 0 ) //every app has the right to at least one worker
	{
		this.aworkers++;
		AppMgr.workers[this.UID][nrWorkers] = {id:this.aworkers,worker:worker,context:ctx,interval:interval,tick:0};
		AppMgr.tuneSchedulerFrequency(interval);
		return this.aworkers;
	}
	else
	{
		if( nrWorkers < AppMgr.maxAppWorkers )
		{
			this.aworkers++;
			AppMgr.workers[this.UID][nrWorkers] = {id:this.aworkers,worker:worker,context:ctx,interval:interval,tick:0};
			AppMgr.tuneSchedulerFrequency(interval);
			return this.aworkers;
		}
	}
	return -1;
}

AppCtl.stopWorker = function( id )
{
	console.log("this:"+this+" "+this.UID);
	if( AppMgr.workers[this.UID] )
	{
		var len = AppMgr.workers[this.UID].length;
		for( var i=0; i < len; ++i )
			if( !id || AppMgr.workers[this.UID][i]['id'] == id )
			{
				clearInterval()
				AppMgr.workers[this.UID].splice(i,1);
				if(id)
					return true;
			}
		if(!id)
			return true;
	} 
	return false;
}
//SCHEDULER CONTROLLERS
AppMgr.SI = 1; //Scheduler Interval
AppMgr.TK = 0; //Tick Count
AppMgr.SS = 0; //Scheduler Started
AppMgr.SC = 0; //Scheduler Controller
AppMgr.tuneSchedulerFrequency = function(interval)
{
	if(!AppMgr.SS)
	{	
		AppMgr.SC = setInterval(AppMgr.scheduler,interval);
		AppMgr.SS  = 1;
	}
	else
	{
		if( interval < AppMgr.SI)
		{
			AppMgr.SI = interval;
			clearInterval(AppMgr.SC);
			AppMgr.SC = setInterval(AppMgr.scheduler,AppMgr.SI);
		}
	}
}

AppMgr.scheduler = function(){
	
	for( k in AppMgr.workers )
	{
		var aw = AppMgr.workers[k];
		for( i in aw )
		{
			aw[i].tick += AppMgr.SI;
			if(aw[i].tick >= aw[i].interval)
			{
				console.log("Le context:"+aw[i].context);
				aw[i].worker(aw[i].context);
				aw[i].tick = 0;
			}
		}
	}
	AppMgr.TK += AppMgr.SI;
}
*/