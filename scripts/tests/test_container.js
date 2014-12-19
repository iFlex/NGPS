/**
*	NGPS Container Class Tester
*   Author: Milorad Liviu Felix
*	10 May 2014 02:40 GMT
*/

function test_add_and_remove()
{
	var div = 0;
	function discard()
	{
		div.discard();
		setTimeout(build,1000);
	}
	function build()
	{
		div = new container({width:100,height:100,x:0,y:0,background:"blue",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
		success = div.load();
		div.interactive(true);
		setTimeout(discard,1000);
	}
	build();
}

function test_move()
{
	var step = 5;
	var div = new container({width:100,height:100,x:0,y:100,background:"blue",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div.load();

	var div2 = new container({width:400,height:300,x:600,y:1000,background:"green",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div2.load();

	div2.addPrimitive({type:'iframe',content:{src:"http://www.youtube.com/embed/XGSy3_Czz8k",width:"420",height:"345"},})

	var kid = new container({width:50,height:50,x:0,y:0,background:"red",border_size:1,border_style:"solid",border_color:"0x000000"});
	kid.load(div);

	var kid2 = new container({width:20,height:20,x:25,y:25,background:"orange",border_size:1,border_style:"solid",border_color:"0x000000"});
	success = kid2.load(kid);
	
	var count = 1000;
	var interval  = 10;
	var scale = 1;
	var scaleop = -0.001;
	var changed = false;
	function move()
	{
		//if(count < 1)
		//	return;
		count--;
		
		if(count > 100 && !changed)
		{
			kid.changeParent(div2);
			changed = true;
		}

		div.move(step,0);
		div.scale(scale);
		div.rotate(1);

		div2.rotate(1);
		scale += scaleop;

		setTimeout(move,interval);
	}
	
	move();
}

function test_show_hide()
{
	var div = new container({width:100,height:100,x:0,y:200,background:"red"});
	success = div.load();
	var op = true;
	var count = 15;
	function operate()
	{
		if(count < 1)
			return;
		count--;

		if(op)
			div.show();
		else
			div.hide();

		op = !op;
		setTimeout(operate,100);
	}

	operate();
}

function test_leaf()
{
	var div = new container({width:400,height:300,x:0,y:350,border_size:1,border_style:"solid",border_color:"0x000000",border_radius:[25]});
	success = div.load();
	div.addPrimitive({type:'img',content:{src:"http://www.dumpaday.com/wp-content/uploads/2011/12/funny-meme-pictures.jpg"},})
}

function test_event_listeners()
{
	var div = new container({width:300,height:200,x:100,y:400,background:"blue",border_size:5,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div.load();

	var div2 = new container({width:400,height:300,x:500,y:400,background:"green",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div2.load();

	div2.addPrimitive({type:'iframe',content:{src:"http://www.youtube.com/embed/XGSy3_Czz8k",width:"420",height:"345"},})

	var kid = new container({width:50,height:50,x:0,y:0,background:"red",border_size:0,border_style:"solid",border_color:"0x000000"});
	kid.load(div);

	var kid2 = new container({width:20,height:20,x:25,y:25,background:"orange",border_size:0,border_style:"solid",border_color:"0x000000"});
	success = kid2.load(kid);

	kid2.propagation = 1;
	kid.propagation = 1;
	div.onTrigger = function(e){alert("Bitch Please:"+e.UID+" :: "+e.triggerCount);}

	div.interactive(true);
	div2.interactive(true);
	kid.interactive(true);
	kid2.interactive(true);
}

function test_camera_extensions()
{
	var div = new container({width:300,height:200,x:0,y:400,background:"blue",border_size:5,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div.load();

	var div2 = new container({width:300,height:200,x:300,y:400,background:"blue",border_size:5,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div2.load();
	//making camera
	div.extend(Camera);
	//
	div.cmove(0,0);

	//making camera
	div2.extend(Camera);
	//
	div2.cmove(0,0);
}

function test_new_containment()
{

	var div = new container({width:200,height:200,x:100,y:0,background:"blue",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div.load();

	var r1 = div.addChild({width:100,height:50,x:10,y:0,background:"green",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});

	div.interactive(true);
	r1.interactive(true);
	
	var r2 = r1.addChild({width:30,height:30,x:10,y:0,background:"yellow",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["0px"]});
	r2.interactive(true);
	
	var div2 = new container({width:200,height:200,x:400,y:0,background:"red",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div2.load();
	div2.interactive(true);
	
	r2.onTrigger = function(obj)
	{
		if( obj.parent == div )
			obj.changeParent(div2)
		else
			obj.changeParent(div)
		
		str = "a:";
		for(k in div.children)
			str += k+" ";
		str+=" b:"
		for(k in div2.children)
			str+= k+" ";

		//alert(str);
		console.log(str);
	};
	div.extend(Camera);
}
setTimeout(test_add_and_remove,1000);
setTimeout(test_move,500);
setTimeout(test_leaf,700);
setTimeout(test_show_hide,500);
setTimeout(test_event_listeners,500);
setTimeout(test_camera_extensions,500);
setTimeout(test_new_containment,500);
