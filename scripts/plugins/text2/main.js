/*
*	NGPS Edit Interface
*	Author: Milorad Liviu Felix
*	28 Jun 2014  18:45 GMT
*	Need:
*		Need to be able to pup up editor same size regardless of zoom level
	Requires:
		InterfaceMountPoint
*/
//TODO: Fix weird trigger ( with the start editor listener ) evend firing on factory.root even though it's not listened for.
var keyboard = {};
loadAppCode("text2",function(data)
{
	this.config = {interface:"none"};
	this.parent = data['parent'];
	var rootDir = data["appPath"];
	var mountPoint = factory.base;//data['InterfaceMountPoint'];

	this.init = function() //called only one when bound with container
	{
		//include app
		keyboard.editor = factory.newContainer({x:100,y:100,width:500,height:50,background:"transparent"},"simple_rect",mountPoint);
		var ctx = this;
		utils.loadStyle(this.parent.appFullPath+"lib/jquery.toolbars.css",function(){
			requirejs([ctx.parent.appPath+"lib/jquery.toolbar",ctx.parent.appPath+"resources/fonts"],function(){
				utils.makeHTML([{
					div:{
						id:"text-toolbar",
						children:[{
							a:{
								href:"#",
								children:[{
									i:{
										class:"glyphicon glyphicon-plus"
									}
								}]
							}
						}]	
					} 
				}],document.body);	
			})
		})
		
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
	
	keyboard.focusEditor = function(target)
	{
		console.log(utils.debug(target.subject));
		$(target.subject).toolbar({
			content: '#text-toolbar', 
			position: 'top',
		});
		target.interactive(false);
	}
	keyboard.hideEditor = function()
	{

	}
});
