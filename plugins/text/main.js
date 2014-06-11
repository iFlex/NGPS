this.text = function()
{
	this.parent = 0;
	this.init = function(parent){
		this.parent = parent;
		this.parent.addPrimitive({type:'iframe',content:{src:"plugins/text/index.html",border:"0px"}});
	}
	this.load = function(){
	}
	this.store = function(){

	}
	this.show = function(){

	}
	this.hide = function(){

	}
}