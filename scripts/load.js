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
	for(k in node.children)
	{
		var croot = root.addChild(loadTree[node.children[k]].css);
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
			pLOAD.root = new container({cssText:loadTree[k].css});
			pLOAD.root.load();
			pLOAD.root.extend(Interactive);
			pLOAD.root.interactive(true);
			if(loadTree[k].camera)
			{
				pLOAD.extend(Camera);
				pLOAD.root.cstart(loadTree[k].camera.interval);
			}
			pLOAD._unit(loadTree[k],pLOAD.root);
		}
		else
			setTimeout(waitForJson,50);
	}
	waitForJson();
}

