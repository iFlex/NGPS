/**
*	NGPS Edit Interface Test
*	Author: Milorad Liviu Felix
*	6 June 2014 00:15 GMT
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
	editor.init();
	for(k in tests)
		tests[k]();
}

tests = {
	build: function(){
		var o = factory.newContainer({width:200,height:200,x:x*size,y:y*size},"rounded_rect");
		o.addPrimitive({type:'img',content:{src:"http://www.dumpaday.com/wp-content/uploads/2011/12/funny-meme-pictures.jpg"},})
		nextSector();

		var o2 = factory.newContainer({width:420,height:350,x:x*size,y:y*size},"rounded_rect");
		o2.addPrimitive({type:'iframe',content:{src:"http://www.youtube.com/embed/XGSy3_Czz8k",width:"420",height:"345"},})
		nextSector();
		
		var o3 = factory.newContainer({width:200,height:200,x:x*size,y:y*size},"rounded_rect");
		factory.newContainer({width:50,height:50,x:"50%",y:"50%"},"rounded_rect",o2);
		nextSector();
		
		function show(e){ editor.show(e,{focusOn:1}) }
		o.onTrigger = show;
		o2.onTrigger = show;
		o3.onTrigger = show;
			
	}
}

setTimeout(init,500);