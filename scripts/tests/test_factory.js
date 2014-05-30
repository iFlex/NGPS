/**
*	NGPS Factory Tester
*   Author: Milorad Liviu Felix
*	10 May 2014 07:34 GMT
*/

function test_init()
{
	factory.init();

	var div = factory.root.addChild({width:200,height:200,x:100,y:0,background:"blue",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div.load();
	div.interactive(true);

	var r1 = div.addChild({width:100,height:50,x:10,y:0,background:"green",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});

	div.interactive(true);
	r1.interactive(true);
	
	var r2 = r1.addChild({width:30,height:30,x:10,y:0,background:"yellow",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["0px"]});
	r2.interactive(true);
	
	var div2 =factory.root.addChild({width:200,height:200,x:400,y:0,background:"red",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div2.load();

}

setTimeout(test_init,500);
