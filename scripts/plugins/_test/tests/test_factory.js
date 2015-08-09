/**
*	NGPS Factory Tester
*   Author: Milorad Liviu Felix
*	10 May 2014 07:34 GMT
*/
var x = 0;
var y = 0;
var size = 400;
function test_init()
{
	factory.init();
	//initiate all tests
	for( key in tests )
		tests[key]();
}
function nextSector(){
	x++;
	if(x > 10)
	{
		x=0;
		y++;
	}
}

function test_addNremove()
{
	function makeContainer( ctx , e ){
		var obj = factory.newContainer( { x : e.clientX, y : e.clientY },"rounded_rect");
		obj.onTrigger = obj.discard;
	}
	factory.root.onTrigger = makeContainer;
}

var tests = {
test_img:function()
{
	var o = factory.newContainer({width:200,height:200,x:x*size,y:y*size},"rounded_rect");
	o.addPrimitive({type:'img',content:{src:"http://www.dumpaday.com/wp-content/uploads/2011/12/funny-meme-pictures.jpg"},})
	nextSector();
},
test_vid: function()
{
	var o = factory.newContainer({width:420,height:350,x:x*size,y:y*size},"rounded_rect");
	o.addPrimitive({type:'iframe',content:{src:"http://www.youtube.com/embed/XGSy3_Czz8k",width:"420",height:"345"},})
	nextSector();
},
test_relative_pos:function(){
	var o = factory.newContainer({width:200,height:200,x:x*size,y:y*size},"rounded_rect");
	factory.newContainer({width:50,height:50,x:"50%",y:"50%"},"rounded_rect",o);
	nextSector();
},
}
setTimeout(test_init,500);
