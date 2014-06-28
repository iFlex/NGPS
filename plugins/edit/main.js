/*
*	NGPS Edit Interface
*	Author: Milorad Liviu Felix
*	28 Jun 2014  18:45 GMT
*/
this.NGPS_Editor = {};
loadAppCode("edit",function(data)
{
	this.config = {interface:"none"};
	this.parent = data['parent'];
	this.startWorker = data['startWorker'];
	this.stopWorker = data['stopWorker'];
	//
	this.heightCoeficient = 0.1;
	this.UI = {};
	NGPS_Editor.node = 0;
	NGPS_Editor.possize = {x:0,y:0,width:100,height:100};
	NGPS_Editor.tags = [];
	this.addInterfaceButton = function(icon,handler)
	{
		var li = document.createElement('li');
		
		var a = document.createElement('a');
		a.href = "#";
		
		var span = document.createElement('span');
		span.className = icon;
		span.onclick = handler;

		li.appendChild(a);
		a.appendChild(span);
		this.UI['interfaceRight'].appendChild(li);
	}
	this.init = function() //called only one when bound with container
	{
		//build the interface
		var dimensions = 0;
		if(this.parent.parent)
			dimensions = {width:this.parent.parent.getWidth(),height:this.parent.parent.getHeight()}
		else
			dimensions = platform.getScreenSize();

		this.parent.setWidth(0);
		this.parent.setHeight(0);

		this.UI['root'] = document.createElement("nav");
		//this.root.style.height = this.parent.getHeight()+"px";
		//this.root.style.width = this.parent.getWidth()+"px";
		this.UI['root'].className = "navbar navbar-default navbar-fixed-top";
		this.UI['root'].role = "navigation";

		this.UI['mainDiv'] = document.createElement('div');
		this.UI['mainDiv'].className = "container-fluid";
		
		this.UI['title'] = document.createElement('a');
		this.UI['title'].className = "navbar-brand";
		this.UI['title'].innerHTML = "NGPS";
		
		this.UI['interfaceRight'] = document.createElement('ul');
		this.UI['interfaceRight'].className = "nav navbar-nav navbar-right";
		
		
		this.UI['mainDiv'].appendChild(this.UI['title']);
		this.UI['mainDiv'].appendChild(this.UI['interfaceRight']);
		//now adding individual buttons and their actions
		this.addInterfaceButton('glyphicon glyphicon-plus',this.onAdd)
		this.addInterfaceButton('glyphicon glyphicon-pencil',function(){alert("fck off")});	
		//
		this.UI['root'].appendChild(this.UI['mainDiv']);
		this.parent.DOMreference.appendChild(this.UI['root']);

		//read tags
		for( k in Descriptors.containers)
			NGPS_Editor.tags.push(k);

	}
	this.run = function()	//called whenever the container is triggered
	{
		
	}
	this.suspend = function() //called whenever the container looses focus ( or gets out of view )
	{

	}
	this.shutdown = function() //called only when app is unloaded from container
	{

	}
	this.show = function() //shows app
	{

	}
	this.hide = function() //hides app
	{

	}

	this.onAdd = function(){
		if(!NGPS_Editor.node)
			NGPS_Editor.node = factory.root;

		var x = ( NGPS_Editor.node.getWidth() - NGPS_Editor.possize.width ) / 2;
		var y = ( NGPS_Editor.node.getHeight() - NGPS_Editor.possize.height ) / 2;
		var dx = 0;
		var dy = 0;

		if(NGPS_Editor.node.isCamera)
		{
			var cameraInfo = NGPS_Editor.node.getContentPositioning();
			dx = cameraInfo.x;
			dy = cameraInfo.y;
		}
		factory.newContainer({x:x-dx,y:y-dy,width:NGPS_Editor.possize.width,height:NGPS_Editor.possize.height},NGPS_Editor.tags[0],NGPS_Editor.node);
	}
});