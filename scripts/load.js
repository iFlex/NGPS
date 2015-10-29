/**
*	NGPS load module
*	Author: Milorad Liviu Felix
*	3 Jun 2014  00:33 GMT
* 	This module reads the index.html, builds the object tree and renders the presentation
*	Available events:
*		loaded
*/

//TODO: asynchronous mode is not loading properly when copying

var pLOAD = { loadOffset:0,
							doTranslateAddress:true,
							doLoadApps:true,
							doInstallTriggers:true,
							doInitialiseEffects:true}

var LOADtree = {};
var _LINKS = [];
var _CAMERAS = [];
pLOAD.remainingUnits = 0;

pLOAD.clear = function(){
	LOADtree = {};
	_LINKS = [];
	_CAMERAS = [];
	pLOAD.remainingUnits = 0;
}

pLOAD.unit = function(node,root,preBuilt){

	function translateAllStoredIDs(item){
		for( k in item) {
			if( typeof item == "object" )
				translateAllStoredIDs(item[k]);
			if( k.indexOf("UID") != -1 )
				item[k] += pLOAD.loadOffset;
		}
	}

	var croot = 0;
	if( preBuilt == undefined )	{
		//address translation
		if(pLOAD.doTranslateAddress)
			node.UID += pLOAD.loadOffset;

		if(containerData.containerIndex < node.UID)
			containerData.containerIndex = node.UID;

		node.properties.UID = node.UID;
		if(node.properties.cssText && node.properties.style)
			delete node.properties.style;

		croot = factory.createContainer(node.properties,root);
		console.log("UNIT new conainer");
		console.log(croot);
		console.log("PARENT")
		console.log(root);
		console.log("_____________");
	} else {
		croot = preBuilt;
	}

	//copy any stored information
	croot._store = node._store;
	if(pLOAD.doTranslateAddress)
		translateAllStoredIDs(croot._store);

	//bind properties
	for( k in node._store )
		if( k.indexOf("#BIND_") != -1 ){
			var key = k.substr("#BIND_".length,k.length);
			croot[key] = node._store[k];
		}

	if(node.camera)
	{
		croot.extend(Camera);
		croot.extend(Interactive);
		croot.interactive(true);
		croot.cstart(node.camera.interval);
		//load all camera specific data
		for( p in node.camera )
			croot["c"+p] = node.camera[p];

		//immediately instantiate the display object and replace the display of the above camera
		//var _node = LOADcontent[node.children[0]];
		//node.children.splice(0,1);
		//node = _node;

		_CAMERAS.push(croot);
	}

	croot.effects = node.effects;
	if(pLOAD.doTranslateAddress) {
		for(trig in croot.effects){
			for( index in croot.effects[trig].fx ){
				croot.effects[trig].fx[index].UID += pLOAD.loadOffset;
			}
		}
	}

	if(node.value)
		croot.DOMreference.value = node.value;
	if(node.innerHTML)
		croot.DOMreference.innerHTML = decodeURIComponent(node.innerHTML);

	if(node.child)
	{
		var cld = croot.addPrimitive(node.child.descriptor);
		cld.innerHTML = node.child.innerHTML;
		cld.innerHTML = node.child.value;
	}

	if(node.isApp)
		croot.appData = node.appData;
	//install effect
	if(pLOAD.doInstallTriggers)
		effects.installTriggers(croot);

	return croot;
}

pLOAD.iterate = function(node,root,load_mode)
{
	function delayedExecution(n){
		pLOAD.remainingUnits++;
		setTimeout(function(){
			pLOAD.iterate(n,root,load_mode);
		},2);
	}

	console.log("----- ITERATE CALL ---");
	console.log(node);
	console.log("***************")
	console.log(root);
	console.log("__________________");
	var croot = 0;
	try {

		if(node.isLink)//save link for loading after whole tree is loaded
		{
			console.log("Pushing to links");
			console.log(node);
			_LINKS.push(node);
			return 0;
		}

		if(!load_mode.skip || load_mode.skip[node.UID] != true){
			croot = pLOAD.unit(node,root);
		} else {
			croot = findContainer(node.UID);
		}
		//extensions
		if(croot) {
			for(k in node.children)
				if(LOADcontent[node.children[k]+""]) {
					if(load_mode['iteration'] == "asynchronous")
						delayedExecution(LOADcontent[node.children[k]]);
					else
						pLOAD.iterate(LOADcontent[node.children[k]],croot,load_mode);
				}
		}
	}catch(e){
		console.error("Failed to load container:"+node.UID,e);
	}

	pLOAD.remainingUnits--;
	console.log("----- END ITERATE CALL --- ru:"+pLOAD.remainingUnits);
	if(pLOAD.remainingUnits == 0 && load_mode['iteration'] == 'asynchronous'){
		console.log("Asynchronous load has finished!");
		GEM.fireEvent({event:"loadComplete",isGlobal:true});
	}
}

pLOAD.loadLinks = function(){
	var left = 0;
	var right = 0;
	var link = 0;
	for( l in _LINKS )
	{
		link = _LINKS[l];
		if(pLOAD.doTranslateAddress){
			link.linkData.left += pLOAD.loadOffset;
			link.linkData.right += pLOAD.loadOffset
		}

		left = findContainer(link.linkData.left);
		right = findContainer(link.linkData.right);
		console.log("left");
		console.log(left);
		console.log(right);
		console.log("--------------");
		if(left && right)
			left.link(right,{container:link.properties,anchors:link.linkData});
	}
}
pLOAD.activateCameras = function(){
	//saved camera relations only reference by id not by actual pointer to container
	//need to read the UIDs and replace with actual pointer to container
	for( c in _CAMERAS ){
		var rels = _CAMERAS[c].crelations;
		//console.log("Checking relations for camera:"+utils.debug(_CAMERAS[c])+" > "+utils.debug(rels));
		for( r in rels )
		{
			//console.log("Adding relation with:"+r+" dsc:"+utils.debug(rels[r]));
			if( rels[r].root ){
				if(pLOAD.doTranslateAddress)
					rels[r].root += pLOAD.loadOffset
				rels[r].root = findContainer(rels[r].root);//LOADreferences[rels[r].root];
			}
		}
	}
}
pLOAD.loadApps = function(apps){
	console.log("LOADING APPS:");
	console.log(apps);
	for( app in apps )
	{
		//console.log("Attempting to load required app:"+app);
		for( j in apps[app] )
		{
			console.log("Loading app "+app+" on container:"+apps[app][j]);
			if(pLOAD.doTranslateAddress)
				apps[app][j] += pLOAD.loadOffset
			var contain = findContainer(apps[app][j]);
			contain.loadApp(app,contain.appData);
		}
	}
}

pLOAD.initialiseEffects = function(node){
	effects.initialiseEffects(node);
	for(k in node.children)
		pLOAD.initialiseEffects(node.children[k]);
}

pLOAD.aggregate = function(unit){
	try {
		if(unit.UID){
			console.log("Aggregating uid:"+unit.UID);
			if(!LOADtree.content)
				LOADtree.content = {};
			LOADtree.content[unit.UID] = unit;
		} else {
			console.log("Aggregating metadata");
			for( k in unit )
				LOADtree[k] = unit[k];
		}
	} catch ( e ){
		console.ward("Could not aggregate",e);
	}
}

pLOAD.proceed = function(jsn,mount,operation_mode)
{
	console.log("----------- LOADING PROCESS ------------");
	if( pLOAD.loadStartOffset != undefined )
		pLOAD.loadOffset = pLOAD.loadStartOffset;
	else
	 	pLOAD.loadOffset = containerData.containerIndex;

  console.log("------- LOAD START OFFSET - "+pLOAD.loadOffset);
	console.log("Loading:");
	console.log(jsn);

	if(jsn)	{
		if(typeof(jsn) == "string")
			LOADtree = JSON.parse(jsn);
		else
			LOADtree = jsn;
	}

	function waitForJson()
	{
		if(LOADtree)
		{
			LOADcontent = LOADtree.content;
			var k = Object.keys(LOADcontent)[0];
			var load_mode = operation_mode || {skip:{0:true,1:true,2:true},iteration:"recursive"};
			pLOAD.remainingUnits = 1;
			pLOAD.iterate(LOADcontent[k],factory.root,load_mode);

			function initialiseLoadedContent(){
				//now load all the apps
				if(pLOAD.doLoadApps && LOADtree.requirements && LOADtree.requirements.apps){
					console.log("Loading apps:"+utils.debug(LOADtree.requirements.apps));
					pLOAD.loadApps( LOADtree.requirements.apps  );
				}
				//adapt loadOffset
				containerData.containerIndex += 1;
				console.log("--- Load offset:"+pLOAD.loadOffset+" maxOffset:"+containerData.containerIndex);

				pLOAD.loadLinks();
				pLOAD.activateCameras();
				//initialise the effects
				if(pLOAD.doInitialiseEffects)
					pLOAD.initialiseEffects(factory.base);

				//fire presentation loaded event
				GEM.fireEvent({event:"loaded",isGlobal:true});
			}

			if(load_mode.iteration != "asynchronous")
				initialiseLoadedContent();
			else
				GEM.addEventListener("loadComplete",0,initialiseLoadedContent,pLOAD);

			console.log("------------- END of LOADING PROCESS ------------");
		}
		else
			setTimeout(waitForJson,50);
	}
	waitForJson();
}

pLOAD.fromHTML = function(data){
	var start_of_data= 'var _presentation="';
	var start   = data.indexOf(start_of_data);
	var end     = data.indexOf('"',start+start_of_data.length);
	console.log(start+","+end);
	var b64data = data.substring(start+start_of_data.length,end);
	ngps.loadPresentation(b64data);
}

pLOAD.clear();
