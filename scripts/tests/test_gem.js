/*
*	NGPS G.E.M. tester
*	Author: Milorad Liviu Felix
*	18 Jun 2014  10:20 GMT
*/

function init(){
	factory.init();
	for(k in tests)
		tests[k]();
}

tests = {
	test_add_remove: function(){
		var o = factory.newContainer({width:200,height:200,x:100,y:100},"simple_rect");
		o.addEventListener("triggered",function(){alert("bitch please");});
		o.removeEventListener("triggered",function(){alert("bitch please");}); //cant be recognised since it is anonimous
		o.addEventListener("triggered",function(){alert("wtf bitch?");});

		o.addEventListener("triggered",o.discard);
		o.removeEventListener("triggered",o.discard);//OK
	},


}

setTimeout(init,500);