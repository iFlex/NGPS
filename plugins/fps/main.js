
loadAppCode('fps',function(data)
{
	this.config = {interface:"none"};
	this.parent = data['parent'];
	this.startWorker = data['startWorker'];
	this.stopWorker = data['stopWorker'];
	this.reff = 0;
	this.FPS = 0;
	this.worker = 0;
	this.init = function() //called only one when bound with container
	{
		/*requirejs(['plugins/fps/fps'],);*/
		var sc = document.createElement("script")
		sc.src = "plugins/fps/fps.js";
		document.body.appendChild(sc);
		sc.onload = _init;
		var ths = this;
		function _init(){
			console.log("vorking...")
			ths.parent.DOMreference.style.width = "100px";
			ths.parent.DOMreference.style.height = "30px";
			ths.reff = ths.parent.addPrimitive({type:"div"});
			var FPS = new FPSMeter(ths.reff);
			ths.FPS = FPS;

			function tick(){
				FPS.tick();
			}
			ths.worker = ths.startWorker(tick,1);
		}
	}
	this.run = function()	//called whenever the container is triggered
	{
		console.log("App is running...");
	}
	this.suspend = function() //called whenever the container looses focus ( or gets out of view )
	{
		console.log("App was suspended but still responding to events")
	}
	this.shutdown = function() //called only when app is unloaded from container
	{
		this.stopWorker(this.worker);
	}
	this.show = function() //shows app
	{
		console.log("App is showing interface");
	}
	this.hide = function() //hides app
	{
		console.log("App has hiddne it's interface but showing content");
	}
});