/**
*	NGPS load module
*	Author: Milorad Liviu Felix
*	3 Jun 2014  00:33 GMT
* 	This module reads the index.html, builds the object tree and renders the presentation
*	Available events:
*		loaded
*/
var pLOAD = {loadOffset:0,doTranslateAddress:true,doLoadApps:true,doInstallTriggers:true,doInitialiseEffects:true}
pLOAD.root = 0;
var LOADtree = {};
var LOADreferences = {};
var _LINKS = [];
var _CAMERAS = [];
pLOAD._unit = function(node,root,jumpAlreadyExisting)
{
	console.log("----- UNIT CALL ---");
	console.log(node);
	console.log("***************")
	console.log(root);
	console.log("__________________");
	try {
		if(node.isLink)//save link for loading after whole tree is loaded
		{
			_LINKS.push(node);
			return;
		}

		console.log("jumpAlreadyExisting:"+jumpAlreadyExisting+" logical UID:"+node.UID+" actual UID:"+(node.UID+pLOAD.loadOffset));
		if( jumpAlreadyExisting == undefined || node.UID > jumpAlreadyExisting )
		{
			console.log("adding:"+utils.debug(node)+" to:"+utils.debug(root));
			var croot = 0;

			if(!factory.base && !root){
				croot = new container(node.properties)
				factory.base = croot;
				console.log("Created new root");
				console.log(croot);
				console.log("----------------------");
			}
			else
			{
				if(factory.root) {
					console.log("Translating load address:"+node.UID+" to:"+(node.UID+pLOAD.loadOffset));
					if(pLOAD.doTranslateAddress)
						node.UID += pLOAD.loadOffset;

					if(containerData.containerIndex < node.UID)
						containerData.containerIndex = node.UID;
				}

				node.properties.UID = node.UID;
				if(node.properties.cssText && node.properties.style)
					delete node.properties.style;

				croot = factory.createContainer(node.properties,root);
				if(!factory.root)
				{
					factory.root = croot;
					factory.initialised = true;
				}
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
				var _node = LOADcontent[node.children[0]];
				node.children.splice(0,1);
				node = _node;

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
		}
		else
			croot = findContainer(node.UID);

		//install effect
		if(pLOAD.doInstallTriggers)
			effects.installTriggers(croot);

		//extensions
		for(k in node.children)
		{
			//console.log("going to child:"+node.children[k]+">"+LOADcontent[node.children[k]+""]);
			if(LOADcontent[node.children[k]+""])
				pLOAD._unit( LOADcontent[node.children[k]],croot,jumpAlreadyExisting);
		}
	}catch(e){
		console.error("Failed to load container:"+node.UID,e);
	}
	console.log("----- END UNIT CALL ---");
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
	for( app in apps )
	{
		//console.log("Attempting to load required app:"+app);
		for( j in apps[app] )
		{
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

pLOAD.proceed = function(jsn)
{
	console.log("----------- LOADING PROCESS ------------");
	if( pLOAD.loadStartOffset != undefined )
		pLOAD.loadOffset = pLOAD.loadStartOffset;
	else
	 	pLOAD.loadOffset = containerData.containerIndex;
  console.log("---- LOAD START OFFSET:"+pLOAD.loadOffset);
	console.log("Loading:"+jsn)
	if(typeof(jsn) == "string")
		LOADtree = JSON.parse(jsn);
	else
		LOADtree = jsn;

	function waitForJson()
	{
		if(LOADtree)
		{
			LOADcontent = LOADtree.content;
			var jae = -1;
			if( factory.base && factory.base.UID != undefined ) //neet to jump over base and root
				jae = 2;


			var k = Object.keys(LOADcontent)[0];
			//console.log(">>LD>>Starting load at:"+k);
			pLOAD._unit(LOADcontent[k],undefined,jae);
			pLOAD.loadLinks();
			pLOAD.activateCameras();
			//now load all the apps
			console.log("Loading apps:"+utils.debug(LOADtree.requirements.apps));
			if(pLOAD.doLoadApps)
				pLOAD.loadApps( LOADtree.requirements.apps  );

			if(pLOAD.doInitialiseEffects)
				pLOAD.initialiseEffects(factory.base);

			//adapt loadOffset
			containerData.containerIndex += 1;
			console.log("--- Load offset:"+pLOAD.loadOffset+" maxOffset:"+containerData.containerIndex);
			//fire presentation loaded event
			GEM.fireEvent({event:"loaded",isGlobal:true});
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
	_TOTAL_INIT(b64data);
}
