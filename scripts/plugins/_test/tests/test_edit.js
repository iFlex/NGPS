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
	factory.root.onTrigger = function(){ editor.hide();}
	for(k in tests)
		tests[k]();
}

tests = {
	build: function(){
		var o = factory.newContainer({width:200,height:200,x:x*size,y:y*size},"rounded_rect");
		o.addPrimitive({type:'img',content:{src:"http://www.dumpaday.com/wp-content/uploads/2011/12/funny-meme-pictures.jpg"},})
		nextSector();

		var oo = factory.newContainer({width:600,height:550,x:x*size,y:y*size},"rounded_rect");
		
		var o2 = factory.newContainer({width:420,height:350,x:0,y:0},"rounded_rect",oo);
		o2.addPrimitive({type:'iframe',content:{src:"http://www.youtube.com/embed/XGSy3_Czz8k",width:"420",height:"345"},})
		nextSector();

		var o4 = factory.newContainer({width:50,height:50,x:"50%",y:"50%"},"rounded_rect",oo);
		
		var o3 = factory.newContainer({width:200,height:200,x:x*size,y:y*size},"rounded_rect");
		nextSector();

		var o5 = factory.newContainer({width:420,height:350,x:x*size,y:y*size},"rounded_rect");
		o5.addPrimitive({type:'iframe',content:{src:"plugins/text/samples/index.html",width:"420",height:"345"},})
		nextSector();
		
		var o6 = factory.newContainer({width:1024,height:500,x:x*size,y:y*size},"rounded_rect");
		o6.addPrimitive({type:'iframe',content:{src:"http://mudcu.be/sketchpad/",width:"1024px",height:"500px"},})
		nextSector();

		function show(e){ editor.show(e,{focusOn:1}) }
		o.onTrigger = show;
		o2.onTrigger = show;
		o3.onTrigger = show;
		o4.onTrigger = show;	
		oo.onTrigger = show;
	},
	meganest:function(){
		var w = 300;
		var h = 300;
		var decrease = 25;
		var count = 10;
		function show(e){ editor.show(e,{focusOn:1}) }
		function nest(parent)
		{
			if(count<1)
				return;
			
			var descriptor = {x:0,y:0,height:h,width:w};
			var obj = factory.newContainer(descriptor,"rounded_rect",parent);
			obj.onTrigger = show;

			w -= decrease;
			h -= decrease;
			count--;
			
			nest(obj);	
		}

		nest(factory.root);
	}
}

setTimeout(init,500);