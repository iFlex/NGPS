/**
*	NGPS load module
*	Author: Milorad Liviu Felix
*	3 Jun 2014  00:33 GMT
* 	This module reads the index.html, builds the object tree and renders the presentation
*/
this.pLOAD = {}
pLOAD.root = 0;
var LOADtree = {};
var LOADreferences = {};
pLOAD._unit = function(node,root)
{
	var croot = 0;
	if(root)
		croot = root.addChild({cssText:node.css});
	else
	{
		croot = new container({cssText:node.css})
		croot.load();
	}
	//reference needed containers
	if( LOADreferences[croot.UID] )
	{
		LOADreferences[croot.UID] = croot;
		console.log("Saved container for referencing:"+croot.UID);
	}

	if(node.camera)
	{
		croot.extend(Camera);
		croot.extend(Interactive);
		croot.interactive(true);
		croot.cstart(node.camera.interval);
	}
	//add content
	if(node.innerHTML)
		croot.DOMreference.innerHTML = decodeURIComponent(node.innerHTML);

	//initialise the factory
	if(!factory.base)
		factory.base = croot;
	else
		if(!factory.root)
		{
			factory.root = croot;
			factory.initialised = true;
		}
	//extensions
	for(k in node.children)
	{
		console.log("going to child:"+node.children[k]+">"+LOADcontent[node.children[k]+""]);
		if(LOADcontent[node.children[k]+""])
			pLOAD._unit( LOADcontent[node.children[k]],croot);
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
			var k = Object.keys(LOADcontent)[0];
			pLOAD._unit(LOADcontent[k]);

			//now load all the apps
			pLOAD.loadApps( LOADtree.requirements.apps  );

		}
		else
			setTimeout(waitForJson,50);
	}
	waitForJson();
}

