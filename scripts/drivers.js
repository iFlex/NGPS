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