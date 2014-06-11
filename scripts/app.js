/**
*	NGPS App Controler
*	Authos:	Milorad Liviu Felix
*	7 June 2014 	12:20 GMT
*/

this.AppCtl = {};
AppCtl.app = 0;
AppCtl.cover = 0;
AppCtl.exit = 0;
AppCtl.ainit = function(app)
{
	this.isLeaf = true;
	this.app = new app();
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
	this.app.status = 0;
	//not standard yet
	//if(data && data['init'] && data['init'] == "run" )
	//	AppCtl_arun(this);

	alert("cover:"+this.cover);
	
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
	host = ctx.parent
	host.cover.hide();
	host.exit.show();
	
	if(host.app.status == 0 )
	{
		host.app.init(host);
		host.app.status = 1;
	}
	host.ashow();
}
AppCtl.asuspend = function(ctx)
{
	host = ctx.parent;
	host.cover.show();
	host.exit.hide();
	host.ahide();
}