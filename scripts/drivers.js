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

this.platform = {};
platform.getScreenSize = function(){
	return { height:window.screen.availHeight, width:window.screen.availWidth }
}