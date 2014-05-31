/**
*	NGPS Factory Tester
*   Author: Milorad Liviu Felix
*	10 May 2014 07:34 GMT
*/

function test_init()
{
	factory.init();

	var div =  factory.newContainer({width:200,height:200,x:100,y:0},"rounded_rect",factory.root);
	var r1  =  factory.newContainer({width:100,height:50,x:10,y:0},"simple_rect",div);	
	var r2  =  factory.newContainer({width:30,height:30,x:10,y:0},"rounded_rect",r1);
	
	factory.newContainer({width:200,height:200,x:400,y:0},"simple_rect");
	test_addNremove();
}

function test_addNremove()
{
	function makeContainer( ctx , e ){
		var obj = factory.newContainer( { x : e.clientX, y : e.clientY },"rounded_rect");
		obj.onTrigger = obj.discard;
	}
	factory.root.onTrigger = makeContainer;
}

setTimeout(test_init,500);
