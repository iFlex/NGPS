var userMessages = 0;
loadAppCode("userMsg",function(data){
	this.config = {interface:"none"};
	var parent = data['parent'];
	var currentBoard = 0;
	parent.setPermission('save',false);
  parent.setPermission('connect',false);
	this.init = function() //called only once when bound with container
	{
		console.log(parent.appPath+" - init.");
		userMessages = this;
	}
	this.shutdown = function(){
		console.log(parent.appPath+" - shutdown.");
	}

	this.hide = function(){
		hide();
	}
	function hide(){
		if(currentBoard)
		{
			currentBoard.discard();
			currentBoard = 0;
		}
	}

 	function makeBoard(style){
		currentBoard = factory.base.addChild(utils.merge({x:0,y:0,width:"100%",height:"100%",style:"z-index:150",background:"rgba(0,0,0,0.95)",permissions:factory.UIpermissions},style,true));
		currentBoard.onTrigger = hide;
		return currentBoard;
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

	this.chooseList = function( components ){
		hide();
		makeBoard({overflow:"scroll",style:"overflow-y:scorll;display:block"});
		for( var k = 0; k < components.length; ++k ){
			var c = currentBoard.addChild(components[k].descriptor);
			c.extend(Interactive);
			c.interactive(true);
			if(components[k].descriptor.innerHTML)
				c.DOMreference.innerHTML = components[k].descriptor.innerHTML;

			c.onMoved = null;
			c.onTrigger = components[k].callback || hide;
		}
	}
	this.choosePool = function(events,actions,selected,callback){
		hide();
		var board = makeBoard({style:"overflow-y:scorll;display:block",background:"rgba(0,0,0,0.5)"});
		var lanes = [];
		var currentActive = -1;
		var chevButton = [
			{label:"bubble",cssClass: 'btn-warning',action:changeTrigmode},
			{label:"anywhere",cssClass: 'btn-warning',action:changeTrigmode},
			{label:"container",cssClass: 'btn-warning',action:changeTrigmode}];
		var eventsList = [];
		for( k in events)
			eventsList.push({
				label:events[k],
				cssClass: 'btn-warning',
				action:changeEvent,
			});

		var actionsList = [];
		for( k in actions)
			actionsList.push({
				label:k,
				cssClass: 'btn-warning',
				action:changeAction
		});
		function save(){
			//commit to select
			selected.splice(0,selected.length);
			for( i in lanes ){
				var nev = {trigmode:0,triggers:{}};
				var obj = lanes[i];
				for( var j = 0; j < chevButton.length; ++j )
					if(chevButton[j].label == obj.trigmode.DOMreference.innerHTML){
						nev.trigmode = j;
						break;
					}
				var bdy = {};
				bdy.name = obj.action.DOMreference.innerHTML;
				nev.triggers[obj.event.DOMreference.innerHTML] = bdy;
				selected[i] = nev;
			}
			console.log("Saved:");
			console.log(selected);

		}
		function remove(){
			save();
			if(!currentActive) {
				userMessages.hide();
				if(callback)
					callback(-1);
			}
			else {
				lanes[currentActive].parent.discard();
				for( var k = currentActive+1; k < lanes.length; ++k )
					for( e in lanes[k])
						if(lanes[k][e].reff)
							lanes[k][e].reff--;
				lanes.splice(currentActive,1);
				currentActive = 1;
			}
		}
		function changeEvent(e,c){
			lanes[currentActive].event.DOMreference.innerHTML = c.currentTarget.textContent;
			e.close();
		}
		function changeTrigmode(e,c){
			lanes[currentActive].trigmode.DOMreference.innerHTML = c.currentTarget.textContent;
			e.close();
		}
		function changeAction(e,c){
			lanes[currentActive].action.DOMreference.innerHTML = c.currentTarget.textContent;
			e.close();
		}

		function makeLane(evt,trg,act,_k){
			var rootdesc = {width:"100%",height:"auto",autopos:true,background:"rgba(255,255,255,0.2)",style:"display:table;padding-top:5px;padding-bottom:5px;padding-left:5px"};
			var k = _k || currentBoard.addChild(rootdesc);
			var i = (_k != undefined ) ? 0 : lanes.length;
			if( _k == undefined )
				lanes.push({parent:k,close:0,event:0,trigmode:0,action:0,board:board});

			var a = k.addChild({type:"button",height:"auto",width:"auto",autopos:true,class:"btn btn-default",style:"display:table-cell"});
			lanes[i].close = a;
			a.reff = i;
			a.DOMreference.innerHTML = "cancel";
			a.extend(Interactive);
			a.interactive(true);
			a.onMoved = function(){};
			a.onTrigger = function(crt){
				currentActive = crt.reff;
				remove();
			};

			a = k.addChild({height:"auto",width:25,autopos:true,style:"display:table-cell"});
			a.onMoved = function(){};

			if( actions[act.name][0] || !i )
			{
				a = k.addChild({type:"button",height:"auto",width:"auto",autopos:true,class:"btn btn-danger",style:"display:table-cell"});
				lanes[i].adjust = a;
				a.reff = i;
				if(!i)
					a.DOMreference.innerHTML = "add";
				else
					a.DOMreference.innerHTML = "adjust";

				a.extend(Interactive);
				a.interactive(true);
	 			a.onMoved = function(){};
				a.onTrigger = function(crt){
				  	currentActive = crt.reff;
						var obj = lanes[crt.reff];
						if(actions[obj.action.DOMreference.innerHTML][0] && callback){
							save();
							callback(crt.reff);
							userMessages.hide();
							return;
						}
						else
							obj.adjust.hide();

						var siblng = obj.parent.DOMreference.nextSibling;
						obj.parent.changeParent(obj.board);
						var cld = currentBoard.addChild(rootdesc);
						for( k in lanes )
							for( e in lanes[k] )
								if(lanes[k][e].reff != undefined)
									lanes[k][e].reff++;

						lanes.unshift({parent:cld,close:0,event:0,trigmode:0,action:0,board:board});
						obj.parent.parent.DOMreference.insertBefore(cld.DOMreference, siblng);
						makeLane("click",0,{name:Object.keys(actions)[0],needAdjust:actions[Object.keys(actions)[0]][0]},cld);
				}
			};

			a = k.addChild({height:"auto",width:25,autopos:true,style:"display:table-cell"});
			a.onMoved = function(){};
			a = k.addChild({type:"h5",height:"auto",width:"auto",autopos:true,style:"display:table-cell;padding-left:10px;padding-right:10px;text-shadow: 0 0 9px rgba(255,255,255,1)"});
			a.DOMreference.innerHTML = "When";
			a.onMoved = function(){};

			a = k.addChild({type:"button",height:"auto",width:"auto",autopos:true,class:"btn btn-danger",style:"display:table-cell"});
			lanes[i].event = a;
			a.reff = i;
			a.DOMreference.innerHTML = evt;
			a.extend(Interactive);
			a.interactive(true);
			a.onMoved = function(){};
			a.onTrigger = function(crt){
				currentActive = crt.reff;
				NGPS_Dialogue.show({
					title:"Choose what triggers the animation",
					selection:eventsList,
					selection_item:[{button:{class:"btn btn-warning",style:"width:99%;margin-top:2px;margin-left:2px"}}]
				});
			};

			a = k.addChild({type:"h5",height:"auto",width:"auto",autopos:true,style:"display:table-cell;padding-left:10px;padding-right:10px;text-shadow: 0 0 9px rgba(255,255,255,1)"});
			a.DOMreference.innerHTML = "on";
			a.onMoved = function(){};

			a = k.addChild({type:"button",height:"auto",width:"auto",autopos:true,class:"btn btn-danger",style:"display:table-cell"});
			lanes[i].trigmode = a;
			a.reff = i;
			a.DOMreference.innerHTML = chevButton[trg].label;
			a.extend(Interactive);
			a.interactive(true);
			a.onMoved = function(){};
			a.onTrigger = function(crt){
				currentActive = crt.reff;
				NGPS_Dialogue.show({
					title: "Choose how to start animation",
					selection:chevButton,
					selection_item:[{button:{class:"btn btn-warning",style:"width:99%;margin-top:2px;margin-left:2px"}}]
				});
			};

			a = k.addChild({type:"h5",height:"auto",width:"auto",autopos:true,style:"display:table-cell;padding-left:10px;padding-right:10px;text-shadow: 0 0 9px rgba(255,255,255,1)"});
			a.DOMreference.innerHTML = ">";
			a.onMoved = function(){};

			a = k.addChild({height:"auto",width:25,autopos:true,style:"display:table-cell"});
			a.onMoved = function(){};
			a = k.addChild({type:"button",height:"auto",width:"auto",autopos:true,class:"btn btn-danger",style:"display:table-cell"});
			lanes[i].action = a;
			a.reff = i;
			a.DOMreference.innerHTML = act.name;
			a.extend(Interactive);
			a.interactive(true);
 			a.onMoved = function(){};
			a.onTrigger = function(crt){
				currentActive = crt.reff;
				NGPS_Dialogue.show({
					title:"Choose what to do",
					selection: actionsList,
					selection_item:[{button:{class:"btn btn-warning",style:"width:99%;margin-top:2px;margin-left:2px"}}]
				});
			};

			return k;
		}
		var t = currentBoard.addChild({type:"h3",width:"100%",height:"auto",autopos:true,background:"transparent",style:"display:table;text-align:center;text-shadow: 0 0 9px rgba(255,255,255,1)"});
		t.DOMreference.innerHTML = "Add a new animation. Hit finish when you are done";
		makeLane("click",0,{name:Object.keys(actions)[0],needAdjust:actions[Object.keys(actions)[0]][0]});
		t = currentBoard.addChild({type:"h3",width:"100%",height:"auto",autopos:true,background:"transparent",style:"display:table;padding-top:2px;padding-bottom:2px;text-align:center;text-shadow: 0 0 9px rgba(255,255,255,1)"});
		t.DOMreference.innerHTML = "All animations on this object";
		for( k in selected ) {
			for( e in selected[k])
				makeLane(e,selected[k][e].trigmode,selected[k][e]);
		}
	}
});
