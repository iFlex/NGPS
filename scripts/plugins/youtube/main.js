/*
*	NGPS built in YouTube app
*	Authors: Milorad Liviu Felix,
*	17 Jun 2014  21:29 GMT
*/
//TODO: make more pro
this.youtube = function(data)
{
	this.config = {interface:"true"};
	this.parent = data['parent'];
	this.source = data['src'];
	this.init = function() //called only one when bound with container
	{
		this.parent.addPrimitive({type:"iframe",width:560,height:315,content{src:this.source,width:560,height:315}});
	}
	this.run = function()	//called whenever the container is triggered
	{
		console.log("YouTube video now playable");
	}
	this.suspend = function() //called whenever the container looses focus ( or gets out of view )
	{
		console.log("YouTube video now paused");
	}
	this.shutdown = function() //called only when app is unloaded from container
	{
		this.parent.removePrimitive();	
	}
	this.show = function() //shows app
	{
		//there is no interface to show for a youtube video
	}
	this.hide = function() //hides app
	{
		//there is no interface to show for a youtube video
	}
}