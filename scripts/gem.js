/*
*	NGPS General Event Manager system
*	Author: Milorad Liviu Felix
*	15 Jun 2014  10:43 GMT
*/
this.GEM = {};
GEM.events = {};
GEM.debug = false;
GEM.fireEvent = function(data)
{
	var event = data['event'];
	var ctx = data['target'];
	if( GEM.events[event] && GEM.events[event][ctx] )
		for(k in GEM.events[event][ctx])
			GEM.events[event][ctx][k](data);
		
	if(GEM.debug)
		cli.showPrompt("<br> ** NGPS_GEM_EVENT<br>"+utils.debug(data));
}
GEM.addEventListener = function(event,ctx,handler)
{
	if(typeof(event)!="string" || typeof(ctx)!="object" || typeof(handler)!= "function" )
		return;

	if(!GEM.events[event])
		GEM.events[event] = {};
	
	if(!GEM.events[event][ctx])
		GEM.events[event][ctx] = [];
	
	GEM.events[event][ctx][GEM.events[event][ctx].length] = handler;

	if(GEM.debug )
		cli.showPrompt("<br> * NGPS_GEM_LISTENER+<br>"+event+"("+ctx.UID+")="+utils.debug(handler));
}
GEM.removeEventListener = function(event,ctx,handler)
{
	if(typeof(event)!="string" || typeof(ctx)!="object" || typeof(handler)!= "function" )
		return;

	if( GEM.events[event] && GEM.events[event][ctx] )
	{
		for( h in GEM.events[event][ctx] )
			if( GEM.events[event][ctx][h] == handler )
			{
				if(GEM.debug)
					cli.showPrompt("<br> * NGPS_GEM_LISTENER-<br>"+event+"("+ctx.UID+")="+utils.debug(handler));

				GEM.events[event][ctx].splice(h,1);
				return true;
			}
	}
	return false;
}
GEM.list = function(verbose)
{
	str = "NGPS_GEM:";
	for( i in GEM.events )
	{
		str += "<br>_"+i+":";
		for( j in GEM.events[i] )
		{
			str += "<br>__"+j.UID;
			var nrev = 0;
			for( h in GEM.events[i][j])
			{
				if(verbose == true)
					str +="<br>___"+GEM.events[i][j][h];
				nrev++;
			}
			str += " has "+nrev+" handlers";
		}
	}
	return str;
}
GEM.cancelAll = function()
{
	for( i in GEM.events )
		for( j in GEM.events[i] )
			delete GEM.events[i][j];
}
/*
*	EVENTS
*		container:
*			moved
*			resized
*			triggered
*			cameraMoved
*			appLoaded
*/