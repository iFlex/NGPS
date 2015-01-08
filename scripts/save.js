/**
*	NGPS save module
*	Author: Milorad Liviu Felix
*	13 Jun 2014  00:32 GMT
* 	This module reads the presentation configuration and saves in the form of a website
ToDo:
Save link information
Save camera relations info
Save any functionality that has to reference other containers
Make sure inner content is saved
(ISSUE: images are only saved if they are visible on the screen
	solution?: zoom out to maximum then save
)

Format:
{
	metadata:{
		author:<>,
		title:<>,
		date_created:<>,
		date_modified:<>,
	}
	requirements:{
		apps:[], //this is used to specify to the packager what apps need to be included
		styles:[],
		themes:[],
	}
	content:{
		//the container tree here
	}
}
*/
this.save = {};

save.clear = function(){
	for( k in save )
		delete save[k];

	save.saveTree = {};
	save.requiredApps = {};
	save.nestCount = 0;
	//just for testing
	this.saveBuffer = 0;
}
//init
save.clear();

function pack(){
	var output = {};
	output.metadata = {};
	output.requirements = {
		apps:save.requiredApps
	};
	output.content = save.saveTree;
	console.log("SAVE:"+utils.debug(output,"\n",true));
	return JSON.stringify(output);
}
//TODO check if memory allows a ram save

//if not do a step by step save
save.proceed = function(){
	//saves the presentation
	console.log(save.RAMsave());
}
//builds the saved data in the ram then flushes it to the host
save._unit = function(node,operation_mode)
{
	var nostore = {x:true,y:true,top:true,bottom:true,left:true,right:true,width:true,height:true}

	console.log("NODE:"+node.UID);
	if(!node.permissions.save)
		return;
	console.log("Parsing...");
	save.nestCount++;

	//now save the most relevant stuff

	var st = {};
	st[node.UID] = {};
	st[node.UID].UID = node.UID;
	st[node.UID].isApp = node.isApp;
	st[node.UID].isCamera = node.isCamera;
	st[node.UID].isLink = node.isLink;
	st[node.UID].isLeaf = node.isLeaf;
	for( a in node.actions){
		for( k in node.actions[a] )
			if( k[0] == "_" )
				delete node.actions[a][k];
	}
	st[node.UID].actions = node.actions; // Presentation animations & actions
	st[node.UID].parent = (node.parent)?node.parent.UID:null;
	st[node.UID].properties = utils.merge(node.properties,{});
	//take out any possize data that is not relevant anymore
	for( prop in nostore )
		delete st[node.UID].properties[prop];
	st[node.UID].properties['cssText'] = node.DOMreference.style.cssText;
	if( node.isLink )
		st[node.UID].linkData = node.linkData;

	if(node.DOMreference.value && node.DOMreference.value.length > 0)
		st[node.UID].value = node.DOMreference.value;

	//now look for static children
	if(node.child)
	{
		st[node.UID].child = {};
		st[node.UID].child.type = "div";//TODO: store type of child in div
		st[node.UID].child.css = node.child.style.cssText;
		//testing
		//st[node.UID].child.innerHTML = node.child.innerHTML;
	}
	//now look for apps
	if(node.isApp)
	{
		//store the name of the app and move it to the folder as well
		if( !save.requiredApps[node.appName] )
			save.requiredApps[node.appName] = []; //store nodes that need the app here
		save.requiredApps[node.appName].push(node.UID);
	}
	//now look for camera
	if(node.isCamera)
	{
		st[node.UID].camera = {};
		st[node.UID].camera.interval = node.cinterval;
		st[node.UID].camera.relations = node.crelations;
		st[node.UID].camera.boundaries = node.boundaries;
		for( i in st[node.UID].camera.relations )
			st[node.UID].camera.relations[i].root = st[node.UID].camera.relations[i].root.UID;
	}
	st[node.UID].children = [];

	if( operation_mode['build'] == "continuous")
		save.saveTree[node.UID] = st[node.UID];
	if( operation_mode['build'] == "chunked")
	{
		//do somethign with saved chunk st
	}

	var nrc = 0;
	for(k in node.children)
	{
		nrc++;
		st[node.UID].children.push(node.children[k].UID);

		if(operation_mode['iteration'] == "recursive")
			save._unit(node.children[k],operation_mode);
		if(operation_mode['iteration'] == "asynchronous")
			setTimeout(
				function(){
					save._unit(node.children[k],operation_mode)
				},(operation_mode['iteration_delay'])?operation_mode['iteration_delay']:1)
	}

	//if terminal container then save inner content
	if(!nrc){
		st[node.UID].innerHTML = encodeURIComponent(node.DOMreference.innerHTML);
	}

	save.nestCount--;
	if(save.nestCount == 0 && operation_mode['iteration'] == 'asynchronous')
	{
		//TODO:notify that save was completed
		alert("save completed");
	}
}
save.RAMsave = function(stringify){

	//clean save tree
	delete  save.saveTree;
	save.saveTree = {};
	//start save
	save._unit(factory.base,{build:"continuous",iteration:"recursive"});
	//now stringify
	if(stringify)
		return JSON.stringify(save.saveTree);

	return save.saveTree;
}

save.toConsole = function(_alert){

	save.RAMsave();
	if(_alert)
		alert(pack());
	else
		console.log(pack());
}

save.jsonTree = function(){
	console.log( JSON.stringify(factory.base));
}
