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
	solution?: zoom out to maximum then save)

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
var save = {};
save.clear = function(){
	delete save.saveTree;
	delete save.requiredApps;

	save.saveTree = {};
	save.requiredApps = {};
	save.remainingUnits = 0;
	save.nestCount = 0;
}
//init
save.clear();
save.pack = function(noStringify,noContent){
	var output = {};
	output.metadata = {};
	output.requirements = {
		apps:save.requiredApps
	};
	console.log("SAVE metadata:");
	console.log(output);
	if(noContent != true)
		output.content = save.saveTree;
	if(!noStringify)
		return JSON.stringify(output);
	return output
}

//if not do a step by step save
save.proceed = function(){
	//saves the presentation
	host.fs.save(function(s){if(s.status)console.log("Saved!");else console.log("Error: could not save!");},"prez1.html",save.RAMsave());
}

save.unit = function(node){
	var nostore = {x:true,y:true,top:true,bottom:true,left:true,right:true,width:true,height:true}
	var _svd = {};

	_svd.UID = node.UID;
	_svd.isApp = node.isApp;
	_svd.isCamera = node.isCamera;
	_svd.isLink = node.isLink;
	_svd.isLeaf = node.isLeaf;

	for( a in node.actions){
		for( k in node.actions[a] )
			if( k[0] == "_" )
				delete node.actions[a][k];
	}

	_svd.parent = (node.parent)?node.parent.UID:null;
	_svd.effects = node.effects; // Presentation effects
	_svd.properties = utils.merge(node.properties,{});

	//take out any possize data that is not relevant anymore
	for( prop in nostore )
		delete _svd.properties[prop];

	_svd.properties['cssText'] = node.DOMreference.style.cssText;
	if( node.isLink )
		_svd.linkData = node.linkData;

	if(node.DOMreference.value && node.DOMreference.value.length > 0)
		_svd.value = node.DOMreference.value;

	//now look for static children
	if(node.child)
	{
		_svd.child = {};
		_svd.child.descriptor = node.child.descriptor;
		_svd.child.descriptor.style = node.child.style.cssText;
		_svd.child.value     = node.child.value;
		_svd.child.innerHTML = node.child.innerHTML;
	}
	//now look for apps
	if(node.isApp)
	{
		if(node.app){
			//store the name of the app
			if( !save.requiredApps[node.appName] )
				save.requiredApps[node.appName] = []; //store nodes that need the app here
			save.requiredApps[node.appName].push(node.UID);
			console.log("Rapps:"+utils.debug(save.requiredApps));
			_svd.appData = node.app._store;
		} else {
			console.error("Found app that was not correctly shutdown: still claims to be an app but has no .app property. Node below");
			console.log(node);
		}
	}
	//now look for camera
	if(node.isCamera)
	{
		_svd.camera = {};
		_svd.camera.interval = node.cinterval;
		_svd.camera.relations = node.crelations;
		_svd.camera.boundaries = node.boundaries;
		for( i in _svd.camera.relations )
			_svd.camera.relations[i].root = _svd.camera.relations[i].root.UID;
	}

	//save children
	_svd._store = node._store;
	_svd.children = [];
	for(k in node.children)
		_svd.children.push(node.children[k].UID);

	return _svd;
}
//builds the saved data in the ram then flushes it to the host
save.iterate = function(node,operation_mode,tree)
{
	function delayedExecution(nod){
		setTimeout(function(){
			save.iterate(nod,operation_mode,tree)
		},2);
	}

	console.log("------ ITERATE CALL:"+node.UID);
	if( node && node.getPermission('save') == true )
	{
		//now save the most relevant stuff
		var st = save.unit(node);
		console.log("SAVED");
		//console.log(st);
		if(!tree) {
			if(operation_mode['build'] == "chunked"){
				try {
					operation_mode['stream'](st);
				} catch(e){
					console.error("Could not save unit of presentation",e);
					console.warn("Make sure you have provided a stream method in the save call");
				}
			}
			else
				save.saveTree[node.UID] = st;
		} else {
			tree[node.UID] = st;
		}

		for(k in node.children)
		{
			if(operation_mode['iteration'] == "recursive"){
				//console.log("starting new unit - recursive:"+node.children[k].UID);
				save.remainingUnits++;
				save.iterate(node.children[k],operation_mode,tree);
			}
			if(operation_mode['iteration'] == "asynchronous"){
				//console.log("starting new unit - asynch:"+node.children[k].UID);
				save.remainingUnits++;
				delayedExecution(node.children[k]);
			}
		}
	}
	save.remainingUnits--;
	//notify save complete
	if(save.remainingUnits == 0 && operation_mode['iteration'] == 'asynchronous'){
		console.log("Asynchronous save has finished!");
		GEM.fireEvent({event:"saveComplete",isGlobal:true});
	}
	//console.log("--- ITERATE CALL END ------");
}

save.RAMsave = function(stringify){
	//clean save tree
	save.clear();
	//start save
	save.remainingUnits = 1;
	save.iterate(factory.base,{build:"continuous",iteration:"recursive"});
	//now stringify
	if(stringify)
		return save.pack();
	return save.pack(true);
}

save.toConsole = function(_alert){
	save.RAMsave();
	var dta = save.pack();
	if(_alert)
		alert(dta);
	else
		console.log(dta);
	return dta;
}

save.jsonTree = function(){
	console.log( JSON.stringify(factory.base));
}

//TODO: make it show dialog for save as
save.toFile = function(filename){
	if(!filename || filename.length < 1)
		filename = "AwesomePresentation";

	var serverLocation = "http://localhost:8080";
	var header  = '<html><head><script src="'+serverLocation+'/ngps.js"></script></head><body><script type="text/javascript">var _presentation="';
	var trailer = '";window.onload = function(){ngps.location="'+serverLocation+'";ngps.loadPresentation(_presentation);}</script></body></html>';
	var data = "";
	function onAsynchUnit(unit){
		console.log("chunk");
		console.log(unit);
		data += ((data.length > 0)?",":"")+'"'+unit.UID+'":'+JSON.stringify(unit);//btoa(JSON.stringify(unit));
	}

	GEM.addEventListener("saveComplete",0,function(){
		console.log("FILENAME:"+filename);
		var metadata = save.pack(true);
		delete metadata.content;
		//form
		var allData = "{";
		for( k in metadata)
			allData += '"'+k+'":'+JSON.stringify(metadata[k])+",";
		allData +='"content":{'+data+'}';
		allData += "}"
		allData = btoa(allData);
		saveTextAs(header+allData+trailer,filename+".html");
	},save);

	save.clear();
	save.remainingUnits = 1;
	save.iterate(factory.base,{build:"chunked",iteration:"asynchronous",stream:onAsynchUnit});
}
