/**
*	NGPS Apps Test
*	Author: Milorad Liviu Felix
*	7 June 2014 00:17 GMT
*/
var x = 0;
var y = 0;
var size = 400;
var editor = new Editor();
function nextSector(){
	x++;
	if(x > 10)
	{
		x=0;
		y++;
	}
}


function init(){
	factory.init();
	//editor.init();
	//factory.root.onTrigger = function(){ editor.hide();}
	for(k in tests)
		tests[k]();
	factory.root.onTrigger = tests.build;
}

tests = {
	build: function(ctx,e){
		var px = x*size;
		var py = y*size;
		if(e && e.clientX)
		{
			px = e.clientX;
			py = e.clientY;
		}
		var o = factory.newContainer({width:200,height:200,x:px,y:py},"rounded_rect");
		o.loadApp("text");
		nextSector();
	},
}

setTimeout(init,500);