/**
*	NGPS load module
*	Author: Milorad Liviu Felix
*	3 Jun 2014  00:33 GMT
* 	This module reads the index.html, builds the object tree and renders the presentation
*/
this.pLOAD = {}
pLOAD.root = 0;
this.loadTree = 0;
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
	if(node.camera)
	{
		croot.extend(Camera);
		croot.extend(Interactive);
		croot.interactive(true);
		croot.cstart(node.camera.interval);
	}
	//add content
	if(node.innerHTML && node.innerHTML.length)
		croot.DOMreference.innerHTML = decodeURIComponent(node.innerHTML);

	//extensions
	for(k in node.children)
	{
		if(loadTree[node.children[k]])
			pLOAD._unit( loadTree[node.children[k]],croot);
	}
}
pLOAD.proceed = function(jsn)
{
	loadTree = JSON.parse(jsn);
	function waitForJson()
	{
		if(loadTree)
		{
			var k = Object.keys(loadTree)[0];
			pLOAD._unit(loadTree[k])
		}
		else
			setTimeout(waitForJson,50);
	}
	waitForJson();
}

