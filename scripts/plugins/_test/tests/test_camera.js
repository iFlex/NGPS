/**
*	NGPS Camera Tester
*   Author: Milorad Liviu Felix
*	31 May 2014 16:00 GMT
*/
var zoomUp = 0;
var zoomDn = 0;
var rotateLeft = 0;
var rotateRight = 0;
var zoomLevel = 1;
var rotateBy  = 0.01;
function init(){

	//factory.root.setBoundaries({'LOx':0.5,'HIx':0.5,'LOy':0.5,'HIy':0.5});
	factory.root.cXYmove(0,0);
	for(k in tests)
	{
		console.log("test(CAMERA) Loading sub-tests:"+k);
		tests[k]();
	}
}
tests = {
	relations: function()
	{
		var cam = factory.newCamera({x:250,y:250,width:500,height:350},"rounded_rect");
		var child = cam.addChild({x:100,y:100,width:100,height:100,background:"black"});
		console.log("New camera");
		console.log(cam);
		//this creates a cross referrence between the two cameras ( should be ok ) antiCrossReff system is in place
		//allowing only one instance of actuator function to be called per object in one tick
		//cam.addRelated(factory.root,{x:1,y:1,zoom:0.1});
		factory.root.addRelated(cam,{x:2,y:2,zoom:0.1});

		function makeContainer( ctx , e )
		{
			var obj = factory.newContainer( { x : e.clientX, y : e.clientY },"rounded_rect",cam);
			obj.onTrigger = function(ctx)
			{
				factory.root.cfocusOn(ctx);
			}
		}
		cam.onTrigger = makeContainer;
	}

}
setTimeout(init,500);
