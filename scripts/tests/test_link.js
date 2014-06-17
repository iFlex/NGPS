/*
*	NGPS Link test module
*	Author: Milorad Liviu Felix
*	15 Jun 2014  9:00 GMT
*/
var a;
function init()
{
	factory.init();
	factory.root.loadApp("simple_connector");
	factory.root.onTrigger = function(ctx,e)
	{
		var c = factory.newContainer({x:e.clientX,y:e.clientY,width:100,height:100},"rounded_rect");
		/*var cdsc = Descriptors.containers["rounded_rect"];
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
				right_link_xreff:0,
			}
		};
		a.link(c,dsc);*/
	}
	for( k in tests )
		tests[k]();
}

tests = {
	simpleLink: function()
	{
		a = factory.newContainer({x:0,y:0,width:100,height:100},"simple_rect")
		var b = factory.newContainer({x:200,y:0,width:100,height:100},"rounded_rect")
		var cdsc = Descriptors.containers["rounded_rect"];
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
				right_link_xreff:0,
			}
		};
		a.link(b,dsc);
	}

}

setTimeout(init,300);