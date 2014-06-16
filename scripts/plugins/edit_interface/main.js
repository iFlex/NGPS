/**
*	NGPS Edit Interface for containers
*	Author: Milorad Liviu Felix
*	14 Jun 2014  01:03 GMT
*/
this.text = function(data)
{
	this.parent = data['parent'];
	this.startWorker = data['startWorker'];
	this.stopWorker = data['stopWorker'];
	this.init = function() //called only one when bound with container
	{

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