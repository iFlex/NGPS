/**
*	NGPS Container Class Tester
*   Author: Milorad Liviu Felix
*	10 May 02:40 GMT
*/

function test_add_and_remove()
{
	var div = new container();
	success = div.load();
	console.log("added:"+success);
	function discard()
	{
		div.discard();
	}
	setTimeout(discard,1000);
}

function test_move()
{
	var step = 5;
	var div = new container({width:100,height:100,x:100,y:0,background:"blue",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div.load();

	var div2 = new container({width:400,height:300,x:600,y:0,background:"green",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
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
	var div = new container({width:"100px",height:"100px",x:"100px",y:"0:px",background:"red"});
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
	var div = new container({width:400,height:300,x:150,y:250,border_size:1,border_style:"solid",border_color:"0x000000",border_radius:[25]});
	success = div.load();
	div.addPrimitive({type:'img',content:{src:"http://www.dumpaday.com/wp-content/uploads/2011/12/funny-meme-pictures.jpg"},})
}

function test_event_listeners()
{
	var div = new container({width:300,height:200,x:100,y:0,background:"blue",border_size:5,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div.load();

	var div2 = new container({width:400,height:300,x:500,y:250,background:"green",border_size:1,border_style:"solid",border_color:"0x000000",border_radius:["15px"]});
	success = div2.load();

	div2.addPrimitive({type:'iframe',content:{src:"http://www.youtube.com/embed/XGSy3_Czz8k",width:"420",height:"345"},})

	var kid = new container({width:50,height:50,x:0,y:0,background:"red",border_size:0,border_style:"solid",border_color:"0x000000"});
	kid.load(div);

	var kid2 = new container({width:20,height:20,x:25,y:25,background:"orange",border_size:0,border_style:"solid",border_color:"0x000000"});
	success = kid2.load(kid);

	kid2.propagation = 0;
	kid.propagation = 2;
	kid2.onTrigger = function(e){alert("Bitch Please:"+e.UID+" :: "+e.triggerCount);}

	div.interaction(true);
	div2.interaction(true);
	kid.interaction(true);
	kid2.interaction(true);
}

//setTimeout(test_add_and_remove,1000);
//setTimeout(test_move,500);
//setTimeout(test_leaf,700);
//setTimeout(test_show_hide,500);
setTimeout(test_event_listeners,500);