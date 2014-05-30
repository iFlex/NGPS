/**
*	NGPS Container Models
*   Author: Milorad Liviu Felix
*	30 May 2014 07:05 GMT
*	Dependencies:
*		drivers
*		container
*/
//we still need a container descriptor file that will be the selection of containers available to the user

this.factory = this.factory || {};
//initiation script comes here
factory.init = factory.init || function(){
	var descriptor = platform.getScreenSize();
	descriptor = utils.merge({x:0,y:0,background:"black",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]},descriptor);
	//make a full screen camera object
	var root = new container(descriptor);
	root.load();
	root.extend(Camera);	
	root.interactive(true);
	root.cstart(30);

	factory.root = root;
}
//
factory.newContainer = function(descriptor,parent)
{
	if(!parent)
		parent = factory.root;
	var obj = parent.addChild(descriptor);
	obj.load();
	obj.interactive(true);
}

factory.newCamera = function (descriptor,parent,interval)
{
	if(!parent)
		parent = factory.root

	var obj = parent.addChild(descriptor);
	obj.load();
	obj.interactive(true);
	obj.extend(Camera);	
	obj.cstart(interval);
}