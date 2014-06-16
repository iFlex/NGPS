/**
*	NGPS Charts App
*	Author: Milorad Liviu Felix
*	14 Jun 2014  01:03 GMT
*/
this.charts = function(data)
{
	this.loadedDependencies = false;
	this.parent = data['parent'];
	this.startWorker = data['startWorker'];
	this.stopWorker = data['stopWorker'];
	this.init = function() //called only one when bound with container
	{
		this.parent.addPrimitive({type:"canvas",width:600,height:450,content:{top:0,left:0,width:600,height:450}});
		var child = this.parent.child;
		if(!this.loadedDependencies)
		{
			//requirejs(['plugins/charts/Chart']);
			var sc = document.createElement("script")
			sc.src = "plugins/charts/Chart.min.js";
			document.body.appendChild(sc);
			this.loadedDependencies = true;
			sc.onload = function(){
				var barChartData = {
					labels : ["January","February","March","April","May","June","July"],
					datasets : [
						{
							fillColor : "rgba(220,220,220,0.5)",
							strokeColor : "rgba(220,220,220,1)",
							data : [65,59,90,81,56,55,40]
						},
						{
							fillColor : "rgba(151,187,205,0.5)",
							strokeColor : "rgba(151,187,205,1)",
							data : [28,48,40,19,96,27,100]
						}
					]
					
				}

				var myLine = new Chart(child.getContext("2d")).Bar(barChartData);
			}
		}
	}
	this.run = function()	//called whenever the container is triggered
	{
		
	}
	this.suspend = function() //called whenever the container looses focus ( or gets out of view )
	{

	}
	this.shutdown = function() //called only when app is unloaded from container
	{

	}
	this.show = function() //shows app
	{

	}
	this.hide = function() //hides app
	{

	}
}