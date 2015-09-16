/*
*	NGPS General Event Manager system
*	Author: Milorad Liviu Felix
*	15 Jun 2014  10:43 GMT
*
*	Specifications:
*		a run_context can be passed to GEM so that each event listener runs in an appropriate context
*		 inside the handler the context can be retireved with: this.context
*/
//TODO: Bubble events to all children
//      problems with identifying anonymous handlers

var GEM = {};
GEM.events = {};
GEM.debug = false;
GEM.bubble = true;
GEM.fireEvent = function(data)
{
	if(GEM.debug)
		console.log("GEM_event:"+utils.debug(data));

	function _fireEvent(event,ctx)
	{
		//console.log("Firing with context:"+ctx);
		if( GEM.events[event] && GEM.events[event][ctx] )
			for(k in GEM.events[event][ctx])
			{
				if(GEM.events[event][ctx][k]['handler'] )
				{
					var type = typeof( GEM.events[event][ctx][k]['handler']);
					//running with global context
					if( type == "function")
						GEM.events[event][ctx][k]['handler'](data);

					else 	if( GEM.events[event][ctx][k]['context'] &&
						        type == "string" &&
						        typeof(GEM.events[event][ctx][k]['context']) == "object" ){
									GEM.events[event][ctx][k]['context'][ GEM.events[event][ctx][k]['handler'] ] (data);
							}
				}
			}
	}

	if(!data['isGlobal'])
		_fireEvent(data['event'],data['target'].UID);
	_fireEvent(data['event'],"_global");

	/*
	if(GEM.bubble){
		var node = data['target'];
		var d = data;
		for( c in node.children)
		{
			d.target = node.children[c];
			GEM.fireEvent(d);
		}

	}
	*/
	//console.log("Firing event:");
	//console.log(data);
	if(GEM.debug)
		cli.showPrompt("<br> ** NGPS_GEM_EVENT<br>"+utils.debug(data));
}
GEM.addEventListener = function(event,ctx,handler,run_context)
{
	if( typeof(event)!="string" || ( ctx && typeof(ctx)!="object" ) )
		return;

	if(!ctx)
		ctx = {UID:"_global"};

	if(!GEM.events[event])
		GEM.events[event] = {};

	if(!GEM.events[event][ctx.UID])
		GEM.events[event][ctx.UID] = [];

	//check if this listening context is already present
	for( i in GEM.events[event][ctx.UID])
		if(	GEM.events[event][ctx.UID][i]['handler'] == handler &&
			GEM.events[event][ctx.UID][i]['context'] == run_context)
			return;

	GEM.events[event][ctx.UID][ GEM.events[event][ctx.UID].length ] = {"handler":handler,"context":run_context};
	//console.log("Adding event("+event+") listener:"+handler+" context:"+run_context)
	if(GEM.debug )
		cli.showPrompt("<br> * NGPS_GEM_LISTENER+<br>"+event+"("+ctx+" > "+ctx.UID+")="+utils.debug(handler));
}
GEM.removeEventListener = function(event,ctx,handler,run_context)
{
	if(typeof(event)!="string" )
		return;

	if(!ctx)
		ctx ={UID:"_global"};
	console.log("removing event:"+event);
	var success = false;
	if( GEM.events[event] && GEM.events[event][ctx.UID] )
	{
		//handler = JSON.stringify(handler);
		//console.log("checking contex:"+ctx.UID+" event:"+event);
		for( h in GEM.events[event][ctx.UID] )
		{
			console.log(typeof(GEM.events[event][ctx.UID][h]['context']) + " == " + typeof(run_context)+ " ? "+ (GEM.events[event][ctx.UID][h]['context'] == run_context) )
			if( (handler && (">"+GEM.events[event][ctx.UID][h]['handler'] == ">"+handler)) )//||
					//(run_context && GEM.events[event][ctx.UID][h]['context'] == run_context))
			{
				//console.log("Deleting handler:"+handler);
				if(GEM.debug)
					cli.showPrompt("<br> * NGPS_GEM_LISTENER-<br>"+event+"("+ctx+" > "+ctx.UID+")="+utils.debug(handler));

				GEM.events[event][ctx.UID].splice(h,1);
				success = true;
				break;
			}
		}

		if(GEM.events[event][ctx.UID].length == 0)
			delete GEM.events[event][ctx.UID];
	}
	return success;
}
GEM.list = function(verbose,separator)
{
	str = "NGPS_GEM:[";
	if(!separator)
		separator = "<br>"

	for( i in GEM.events )
	{
		str += separator+i+":";
		for( j in GEM.events[i] )
		{
			str += separator+">>context:"+j+" handlers:"+GEM.events[i][j].length;
			for( h in GEM.events[i][j])
			{
				if(verbose == true)
					str +=separator+">>>>handler:"+GEM.events[i][j][h]['handler'];
			}
		}
	}
	str += separator+"]";
	return str;
}
GEM.cancelAll = function()
{
	for( i in GEM.events )
		for( j in GEM.events[i] )
			delete GEM.events[i][j];
}
window.onresize = function(){
	GEM.fireEvent({event:"windowResize",isGlobal:true});
}
