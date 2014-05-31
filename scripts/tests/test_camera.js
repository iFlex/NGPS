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
	//initiate factory
	factory.init("editor");

	zoomUp    =  factory.newContainer({x:0,y:0,width:40,height:40},"rounded_rect");
	zoomDn     =  factory.newContainer({x:50,y:0,width:40,height:40},"rounded_rect");	
	rotateLeft  =  factory.newContainer({x:100,y:0,width:40,height:40},"rounded_rect");
	rotateRight  = 	factory.newContainer({x:150,y:0,width:40,height:40},"rounded_rect");

	zoomUp.onTrigger = function(){ factory.root.czoom(0.9) }
	zoomDn.onTrigger = function(){ factory.root.czoom(1.1) }
	rotateLeft.onTrigger = function(){ factory.root.crotate(rotateBy) }
	rotateRight.onTrigger = function(){ factory.root.crotate(-rotateBy) }

	function makeContainer( ctx , e ){
		var obj = factory.newContainer( { x : e.clientX, y : e.clientY },"rounded_rect");
		obj.onTrigger = function(ctx){
			factory.root.cfocusOn(ctx);
		}
		//obj.discard;
	}
	factory.root.onTrigger = makeContainer;
}
setTimeout(init,500);
