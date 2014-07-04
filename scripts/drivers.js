/**
*	NGPS Drivers
* 	Author: Milorad Liviu Felix
*	30 May 2014 07:13 GMT
*/
this.utils = {};
utils.merge = function(a,b,option){
	for( k in b )
	{
		if(a.hasOwnProperty(k))
			if( !option )
				continue;
		
		a[k] = b[k];
	}
	return a;
}
utils.makeHTML = function(markup,parent)
{
	for( i in markup )
	{
		var type = Object.keys(markup[i])[0];
		var child = document.createElement(type);
		keys = Object.keys(markup[i][type]);
		//console.log("Key:"+type+" "+keys.length+" : "+utils.debug(keys));
		
		for( j = 0 ; j < keys.length ; ++j )
		{
			if(keys[j] != "children")
			{
				if(keys[j].indexOf("data-") > -1)
				{
					var attrib = keys[j].slice(5, keys[j].length);
					child.dataset[attrib] = markup[i][type][keys[j]]
					continue;
				}
				if(keys[j] == "class")
				{
					child.className = markup[i][type][keys[j]];
					continue;
				}
				//style
				if(keys[j] == "style" || keys[j] == "cssText")
				{
					child.style.cssText = markup[i][type][keys[j]];
					continue;
				}
				//normal properties
				child[ keys[j] ] = markup[i][type][keys[j]];
			}
			else
				utils.makeHTML(markup[i][type][keys[j]],child); 
		}
		
		if(!parent)
			return child;
		
		parent.appendChild(child);
	}
}
utils.debug = function(elem,newline,verbose)
{
	if(!newline)
		newline = "\n";

	if(typeof(elem) == "string")
		return "";
	
	var str = "{"+newline;
	if(typeof(elem) == "object" && elem.hasOwnProperty('UID'))
		str+= " NGPS Container #"+elem.UID+newline+"}";
	else
	{
		for( k in elem )
		{	
			str += k + ":";
			if(typeof(elem[k]) != "function" )
			{
				str += elem[k]
				if(verbose)
					str += utils.debug(elem[k],verbose)+" ";
				else
				{	
					if(elem[k] && elem[k].hasOwnProperty("UID"))
						str += "("+elem[k].UID+")";
				}
				str += newline;
			}
			//else
			//	str += utils.debug(elem[k])+" ";
		}
	}
	str += newline+"}"
	return str;
}
utils.whois = function(elem)
{
	if(!elem)
		return "Unknown";
	return elem.UID;
}

this.platform = {};
platform.os = "unknown";
platform.isMobile = "false";

platform.getScreenSize = function(){
	return { height:window.screen.availHeight, width:window.screen.availWidth }
}

platform.detectOS = function(){
	str = "";
	for(k in navigator.appVersion)
		str +=	navigator.appVersion[k];
	alert(str);
}

platform.detectOS();