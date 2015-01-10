var userMessages = 0;
loadAppCode("userMsg",function(data){
	this.config = {interface:"none"};
	var parent = data['parent'];
	var currentBoard = 0;
	parent.permissions.save = false;
	parent.permissions.track = false;
	this.init = function() //called only once when bound with container
	{
		console.log(parent.appPath+" - init.");
		userMessages = this;
	}
	this.shutdown = function(){
		console.log(parent.appPath+" - shutdown.");
	}

	function hide(){
		if(currentBoard)
		{
			currentBoard.discard();
			currentBoard = 0;
		}
	}

 	function makeBoard(){
		currentBoard = factory.newContainer({x:0,y:0,width:"100%",height:"100%",style:"z-index:150",background:"rgba(0,0,0,0.95)"},factory.base);
		currentBoard.onTrigger = hide;
	}
	this.inform = function(message){
		console.log("Inform:"+message);
		hide();
		makeBoard();
		utils.makeHTML([{
			div:{
				onclick:hide,
				style:"position:fixed;top:0px;left:0px;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:150",
				children:[{
					p:{
						style:"color:white;vertical-align:middle;margin-top:200px;text-align:center;font-size:25px",
						innerHTML:message
					}
				},{br:{}},{
					button:{
						style:"margin-left:50%;margin-right:50%",
						class:"btn btn-warning",
						innerHTML:"OK"
					}
				}]
			}
		}],currentBoard.DOMreference);
	}

	this.error = function(message,target){
		console.error(message);
		hide();
		makeBoard();
		utils.makeHTML([{
			div:{
				onclick:hide,
				style:"position:fixed;top:0px;left:0px;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:150",
				children:[{
					p:{
						style:"color:red;vertical-align:middle;margin-top:200px;text-align:center;font-size:25px",
						innerHTML:message
					}
				},{br:{}},{
					button:{
						style:"margin-left:50%;margin-right:50%",
						class:"btn btn-warning",
						innerHTML:"OK"
					}
				}]
			}
		}],currentBoard.DOMreference);
	}
});
