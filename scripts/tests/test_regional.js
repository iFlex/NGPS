/*
*	NGPS Regional Module Test
*	Author: Milorad Liviu Felix
*	
*/
requirejs(['regional/regionalLoader'],function(){
	var c = factory.newContainer({x:0,y:0,width:200,height:200,background:"red"});
	c.DOMreference.value = "#REG:ERROR_SERVER_NO_STORE_IMAGE:innerHTML";
	Regional.translate(factory.root);	
});
