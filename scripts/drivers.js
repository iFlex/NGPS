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
			if( option && option != "override" )
				continue;
		
		a[k] = b[k];
	}
	return a;
}
utils.debug = function(elem)
{
	var str = "{"
	for( k in elem )
	{	
		str += k+":";
		//if(typeof(elem[k]) != "object" )
			str += elem[k]+"\n";
		//else
		//	str += utils.debug(elem[k])+" ";
	}
	str += "}"
	return str;
}
utils.whois = function(elem)
{
	if(!elem)
		return "Unknown";
	return elem.UID;
}

console.log(utils.debug({x:0,y:0,c:{caca:1,pipi:2,leba:{kur:10}}}));
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