
loadAppCode('simple_connector',function(data)
{
	this.config = {interface:"none"};
	this.parent = data['parent'];
	this.a = 0;
	this.b = 0;
	
	this.trigger = function(data)
	{
		console.log("App event:"+utils.debug(data));
		this.a = this.b;
		this.b = data['target'];

		if( this.a && this.b.UID == this.a.UID )
			this.b = 0;

		if( this.a && this.a.UID == factory.root.UID )
			this.a = 0;
		
		if( this.b.UID == factory.root.UID )
			this.b = 0;

		if(this.a && this.b)
		{
			var cdsc = Descriptors.links["l000001"];
			cdsc['height'] = 10;
			var dsc = {
				container:cdsc,
				anchors:{
					left_container_xreff:1,
					left_container_yreff:0.5,
					right_container_xreff:0,
					right_container_yreff:0.5,
					left_link_xreff:0,
					left_link_yreff:0,
					right_link_xreff:0,
					right_link_yreff:0,
				}
			};
			this.a.link(this.b,dsc);
			this.a = 0;
			this.b = 0;
		}
	}
	this.init = function() //called only one when bound with container
	{
		console.log("App is initialising...");
		GEM.addEventListener("triggered",0,this.trigger);
	}
	this.run = function()	//called whenever the container is triggered
	{
		console.log("App is running...");
	}
	this.suspend = function() //called whenever the container looses focus ( or gets out of view )
	{
		console.log("App was suspended but still responding to events")
	}
	this.shutdown = function() //called only when app is unloaded from container
	{
		console.log("App is sutting down")
		GEM.removeEventListener("triggered",0,this.trigger);
	}
	this.show = function() //shows app
	{
		console.log("App is showing interface");
	}
	this.hide = function() //hides app
	{
		console.log("App has hiddne it's interface but showing content");
	}
});