this.text = function(data)
{
	this.parent = data['parent'];
	this.startWorker = data['startWorker'];
	this.stopWorker = data['stopWorker'];
	this.init = function() //called only one when bound with container
	{
		this.parent.addPrimitive({type:'iframe',content:{src:"plugins/text/index.html",border:"0px",frameborder:"0px"}});
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
}