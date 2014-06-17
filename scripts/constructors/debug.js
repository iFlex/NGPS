this.factory = this.factory || {}
factory.init = function(){
	if(!factory.initialised)
	{
		//settings
		factory.settings = factory.settings || {};
		factory.settings.container = {}
		factory.settings.container.width = 250;
		factory.settings.container.height = 250;
		factory.settings.mode = mode || "editor";
		//
		var descriptor = platform.getScreenSize();
		descriptor = utils.merge({x:0,y:0,background:"#fAfAfA",border_size:0},descriptor);
		//make a full screen camera object
		var root = new container(descriptor);
		root.load();
		root.extend(Interactive);
		root.extend(Camera);
		root.interactive(true);
		root.cstart(1);

		factory.root = root;

		requirejs(['tests/benchmark']);
		factory.newGlobalApp('fps');

		if(factory.AMS && factory.AMS.init)
			factory.AMS.init( factory.settings.container, factory.AMS);
		
		factory.initialised = true;
	}
}