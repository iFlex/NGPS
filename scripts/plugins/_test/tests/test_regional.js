/*
*	NGPS Regional Module Test
*	Author: Milorad Liviu Felix
*	
*/
factory.init();
ngps.mainCamera.onTrigger = newContainer;
function newContainer(){
	var c = factory.newContainer({x:0,y:0,width:200,height:200,background:"red"});
	c.DOMreference.value = "#REG:I<3U:innerHTML";
	Regional.translate(ngps.mainCamera);
}
requirejs(['regional/regionalLoader'],function(){
		newContainer();
});
