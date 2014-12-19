/**
*	NGPS save module
*	Author: Milorad Liviu Felix
*	13 Jun 2014  00:32 GMT
* 	This module reads the presentation configuration and saves in the form of a website
*/
this.save = {};

save.clear = function(){
	for( k in save )
		delete save[k];

	save.saveTree = {};
	save.requiredApps = [];
	save.nestCount = 0;
	save.ignore = {};
	//just for testing
	this.saveBuffer = 0;
}

//init
save.clear();

//TODO check if memory allows a ram save

//if not do a step by step save
save.proceed = function(){
	//saves the presentation
	console.log(save.RAMsave());
}
//builds the saved data in the ram then flushes it to the host
save._unit = function(node,operation_mode)
{
	if(!node.permissions.save)
		return;
	
	save.nestCount++;
	var st = {};
	st[node.UID] = {};
	//now save the most relevant stuff
	st[node.UID].css = node.DOMreference.style.cssText;
	st[node.UID].parent = (node.parent)?node.parent.UID:null;
	st[node.UID].innerHTML = encodeURIComponent(node.DOMreference.innerHTML);
	//now look for static children
	if(node.child)
	{
		st[node.UID].child = {};
		st[node.UID].child.type = "div";//TODO: store type of child in div
		st[node.UID].child.css = node.child.style.cssText;
		//st[node.UID].child.innerHTML = node.child.innerHTML;
	}
	//now look for apps
	if(node.isApp)
	{
		//store the name of the app and move it to the folder as well
		st[node.UID].app = node.appName;
	}
	//now look for camera
	if(node.isCamera)
	{
		st[node.UID].camera = {};
		st[node.UID].camera.interval = node.cinterval;
		st[node.UID].camera.relations = node.crelations;
		st[node.UID].camera.boundaries = node.boundaries;
		save.ignore[ node.display.UID ] = node.UID;
	}
	st[node.UID].children = [];
	//save links
	//save callbacks
	//save certain event bindings
	if( operation_mode['build'] == "continuous")
		save.saveTree[node.UID] = st[node.UID];
	if( operation_mode['build'] == "chunked")
	{
		//do somethign with saved chunk st
	}
	
	for(k in node.children)
	{
		st[node.UID].children.push(node.children[k].UID);
		
		if(operation_mode['iteration'] == "recursive")
			save._unit(node.children[k],operation_mode);
		if(operation_mode['iteration'] == "asynchronous")
			setTimeout(
				function(){
					save._unit(node.children[k],operation_mode)
				},(operation_mode['iteration_delay'])?operation_mode['iteration_delay']:1)
	}
	save.nestCount--;
	if(save.nestCount == 0 && operation_mode['iteration'] == 'asynchronous')
	{
		//TODO:notify that save was completed
		alert("save completed");
	}
}
save.RAMsave = function(){
	
	//clean save tree
	delete  save.saveTree;
	save.saveTree = {};
	//start save
	save._unit(factory.base,{build:"continuous",iteration:"recursive"});
	//now stringify
	saveBuffer = JSON.stringify(save.saveTree);

	return saveBuffer;
}

save.toConsole = function(){
	console.log(save.RAMsave());
}