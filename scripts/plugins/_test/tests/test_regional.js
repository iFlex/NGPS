/*
*	NGPS Regional Module Test
*	Author: Milorad Liviu Felix
*	
*/
factory.init();
factory.root.onTrigger = newContainer;
function newContainer(){
	var c = factory.newContainer({x:0,y:0,width:200,height:200,background:"red"});
	c.DOMreference.value = "#REG:I<3U:innerHTML";
	Regional.translate(factory.root);
}
requirejs(['regional/regionalLoader'],function(){
		newContainer();
});
