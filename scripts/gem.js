/*
*	NGPS General Event Manager system
*	Author: Milorad Liviu Felix
*	15 Jun 2014  10:43 GMT
*	
*	Specifications:
*		a run_context can be passed to GEM so that each event listener runs in an appropriate context
*		 inside the handler the context can be retireved with: this.context
*/
//TODO: investigate strange additional null handlers appearing after loaiding "simple_connector" app on factory.root
//		problems with identifying anonymous handlers
this.GEM = {};
GEM.events = {};
GEM.debug = false;
GEM.fireEvent = function(data)
{
	function _fireEvent(event,ctx)
	{
		if( GEM.events[event] && GEM.events[event][ctx] )
			for(k in GEM.events[event][ctx])
			{
				if( GEM.events[event][ctx][k]['handler'] )
				{
					var type = typeof(GEM.events[event][ctx][k]['handler']);
					//running with global context
					if( type == "function")
						GEM.events[event][ctx][k]['handler'](data);
				
					else 	if( GEM.events[event][ctx][k]['context'] && type == "string" && typeof(GEM.events[event][ctx][k]['context']) == "object" )
						GEM.events[event][ctx][k]['context'][ GEM.events[event][ctx][k]['handler'] ] (data);
				}
			}	
	}

	_fireEvent(data['event'],data['target']);
	_fireEvent(data['event'],"_global");	
		
	if(GEM.debug)
		cli.showPrompt("<br> ** NGPS_GEM_EVENT<br>"+utils.debug(data));
}
GEM.addEventListener = function(event,ctx,handler,run_context)
{
	if( typeof(event)!="string" || ( ctx && typeof(ctx)!="object" ) )
		return;

	if(!ctx)
		ctx = "_global";

	if(!GEM.events[event])
		GEM.events[event] = {};
	
	if(!GEM.events[event][ctx])
		GEM.events[event][ctx] = [];
	
	GEM.events[event][ctx][GEM.events[event][ctx].length] = {"handler":handler,"context":run_context};

	if(GEM.debug )
		cli.showPrompt("<br> * NGPS_GEM_LISTENER+<br>"+event+"("+ctx+" > "+ctx.UID+")="+utils.debug(handler));
}
GEM.removeEventListener = function(event,ctx,handler)
{
	if(typeof(event)!="string" || ( ctx && typeof(ctx)!="object" ) )
		return;

	if(!ctx)
		ctx = "_global";

	if( GEM.events[event] && GEM.events[event][ctx] )
	{
		//handler = JSON.stringify(handler);
		for( h in GEM.events[event][ctx] )
		{
			console.log(GEM.events[event][ctx][h] + " == " + handler )
			if( GEM.events[event][ctx][h]['handler'] == handler )
			{
				if(GEM.debug)
					cli.showPrompt("<br> * NGPS_GEM_LISTENER-<br>"+event+"("+ctx+" > "+ctx.UID+")="+utils.debug(handler));

				GEM.events[event][ctx].splice(h,1);
				return true;
			}
		}
		if(GEM.events[event][ctx].length == 0)
			delete GEM.events[event][ctx];
	}
	return false;
}
GEM.list = function(verbose)
{
	str = "NGPS_GEM:[";
	for( i in GEM.events )
	{
		str += "<br>-"+i+":";
		for( j in GEM.events[i] )
		{
			str += "<br>--"+j+" > "+j.UID;
			var nrev = 0;
			for( h in GEM.events[i][j])
			{
				if(verbose == true)
					str +="<br>----"+GEM.events[i][j][h];
				nrev++;
			}
			str += "<br>--has "+nrev+" handlers";
		}
	}
	str += "<br>]";
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