this.factory = this.factory || {}
factory.setup = function(){
	
	requirejs(['tests/benchmark']);
	factory.newGlobalApp('fps');

}