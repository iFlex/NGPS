/**
*	NGPS load module
*	Author: Milorad Liviu Felix
*	3 Jun 2014  00:33 GMT
* 	This module reads the index.html, builds the object tree and renders the presentation
	WARNING: the UID of the LOADcontent will not tally with the UIDs created when building the tree
*/
this.pLOAD = {}
pLOAD.root = 0;
var LOADtree = {};
var LOADreferences = {};
pLOAD._unit = function(node,root,jumpAlreadyExisting)
{
	console.log("jumpAlreadyExisting:"+jumpAlreadyExisting+" UID:"+node.UID);
	if( jumpAlreadyExisting == undefined || node.UID > jumpAlreadyExisting )
	{
		console.log("adding:"+utils.debug(node)+" to:"+utils.debug(root));
		var croot = 0;

		if(!factory.base && !root){
			croot = new container(node.properties)
			croot.load();
			factory.base = croot;
		}
		else
		{
			croot = factory.createContainer(node.properties,root);
			if(!factory.root)
			{
				factory.root = croot;
				factory.initialised = true;
			}
		}
		//reference needed containers
		/*if( LOADreferences[croot.UID] )
		{
			LOADreferences[croot.UID] = croot;
			console.log("Saved container for referencing:"+croot.UID);
		}*/
		//save for referencing
		LOADreferences[node.UID] = croot;

		if(node.camera)
		{
			croot.extend(Camera);
			croot.extend(Interactive);
			croot.interactive(true);
			croot.cstart(node.camera.interval);
			//immediately instantiate the display object and replace the display of the above camera
			var _node = LOADcontent[node.children[0]];
			node.children.splice(0,1);
			node = _node;
		}
		//add content
		croot.actions = node.actions;
		if(node.value)
			croot.DOMreference.value = node.value;
		if(node.innerHTML)
			croot.DOMreference.innerHTML = decodeURIComponent(node.innerHTML);
	}
	else
		croot = LOADreferences[node.UID];
	//extensions
	for(k in node.children)
	{
		console.log("going to child:"+node.children[k]+">"+LOADcontent[node.children[k]+""]);
		if(LOADcontent[node.children[k]+""])
			pLOAD._unit( LOADcontent[node.children[k]],croot,jumpAlreadyExisting);
	}
}

pLOAD.loadApps = function(apps){
	for( app in apps )
	{
		console.log("Attempting to load required app:"+app);
		for( j in apps[app] )
		{
			console.log(">> On container:"+j);
			LOADreferences[apps[app][j]].loadApp(app);
		}
	}
}

pLOAD.proceed = function(jsn)
{
	if(typeof(jsn) == "string")
		LOADtree = JSON.parse(jsn);
	else
		LOADtree = jsn;
	function waitForJson()
	{
		if(LOADtree)
		{
			//prepare the references for containers needing apps
			delete LOADreferences;
			LOADreferences = {};
			for( app in LOADtree.requirements.apps )
				for( j in LOADtree.requirements.apps[app] )
					LOADreferences[LOADtree.requirements.apps[app][j]] = true;
			//
			LOADcontent = LOADtree.content;
			var jae = -1;
			if( factory.base && factory.base.UID != undefined ) //neet to jump over base and root
			{

				LOADreferences[0] = factory.base;
				LOADreferences[1] = factory.root;
				LOADreferences[2] = factory.root.display;

				jae = 2;
			}

			var k = Object.keys(LOADcontent)[0];
			console.log(">>LD>>Starging load at:"+k);
			pLOAD._unit(LOADcontent[k],undefined,jae);
			//now load all the apps
			if(factory.setup) //if custom setup is loaded, run it
				factory.setup();
			console.log("Loading apps:"+utils.debug(LOADtree.requirements.apps));
			pLOAD.loadApps( LOADtree.requirements.apps  );

		}
		else
			setTimeout(waitForJson,50);
	}
	waitForJson();
}
