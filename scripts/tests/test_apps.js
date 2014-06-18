/**
*	NGPS Apps Test
*	Author: Milorad Liviu Felix
*	7 June 2014 00:17 GMT
*/
var x = 0;
var y = 0;
var size = 400;
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
	for(k in tests)
		tests[k]();
	factory.root.onTrigger = tests.build;
}

tests = {
	
	test_overwritting: function(){
		var o  = factory.newContainer({width:200,height:200,x:100,y:100},"simple_rect");
		
		function onld(data){
			var t = data['target'];
			t.removeEventListener("appLoaded",onld);
			t.loadApp("fps");
		}

		o.addEventListener("appLoaded",onld);
		o.loadApp("simple_connector");
	}
}

setTimeout(init,500);