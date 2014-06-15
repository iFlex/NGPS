/**
*	NGPS App Controler
*	Authos:	Milorad Liviu Felix
*	7 June 2014 	12:20 GMT
*	
*	Conventions:
*		App constructor function will get a object {} with parent: startWorker: and stopWorker properties
*		startWorker returns the id of the worker or -1 in case the worker was not started
*/

this.AppCtl = {};
this.AppMgr = {};
AppMgr.status = "idle";
AppMgr.maxAppWorkers = 10;
AppMgr.maxWorkers = 1000;
AppMgr.running_app_parent = 0;
AppMgr.workers = {};
AppMgr.loadedApps = {}
//only one app can be running at one time
//apps can have backbround tasks running even though they are suspended
//those processes will be stopped when the app is unloaded

AppCtl.ainit = function(app)
{
	this.isApp = true;
	this.app = new app({parent:this,startWorker:this.startWorker,stopWorker:this.stopWorker});
	this.aworkers = 0;
	//
	this.cover = 0;
	this.exit = 0;
	/////////////////////
	data = {};
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

	//initialise app
	this.app.init();
}
AppCtl.adestroy = function() // completely remove app from container
{
	if( AppMgr.running_app_parent == this)
	{
		AppMgr.running_app_parent = 0;
		AppMgr.status = "idle";
	}

	if( this.app.shutdown )
		this.app.shutdow();
	//stop all of the apps workers
	this.stopWorker();
}
AppCtl.ashow = function()
{
	this.app.show();
	this.allowMove = false;
}
AppCtl.ahide = function()
{
	this.app.hide();
	this.allowMove = true;
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
	if( nrWorkers == 0 ) //every app has the right to at least one worker
	{
		this.aworkers++;
		AppMgr.workers[this.UID][nrWorkers] = {id:this.aworkers,ctl:setInterval( worker , interval )};
		return this.aworkers;
	}
	else
	{
		if( nrWorkers < AppMgr.maxAppWorkers )
		{
			this.aworkers++;
			AppMgr.workers[this.UID][nrWorkers] = {id:this.aworkers,ctl:setInterval( worker , interval )};
			return this.aworkers;
		}
	}
	return -1;
}

AppCtl.stopWorker = function( id )
{
	if( AppMgr.worker[this.UID] )
	{
		var len = AppMgr.workers[this.UID].length;
		for( var i=0; i < len; ++i )
			if( !id || AppMgr.workers[thsi.UID][i]['id'] == id )
			{
				clearInterval( AppMgr.workers[thsi.UID][i]['ctl'] )
				AppMgr.workers[this.UID].splice(i,1);
				if(id)
					return true;
			}
		if(!id)
			return true;
	} 
	return false;
}