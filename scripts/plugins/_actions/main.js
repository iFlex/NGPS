/*
Author: Milorad Liviu Felix
6 Jan 2015  18:16 GMT+2
An applications used to set container actions and load container acions used in both the editor and presenter.
In editor: the app sets the container actions
In presenter: the app loads container actions and maintains the timers for the efects and actions

MODES: 'edit' or 'present'
Actions format:
{
  "event_name":{
    // self will be replaced wih the object on which the event fires
    // "#UID:x" - string with #UID: prefix will identify the container with the ID of the x number

    target: '#UID:x' or 'self' //the target of the animation - this contains the function that will be called
    handler:"name_of_member_function_to_cal" //this function is called on target when event happens
    parameters:[] //list of parameters to pass to handler function
  }

  example, focus main camera on object
  "triggered":{
    target:"#UID:"+factory.root.UID,
    handler:"cfocusOn",
    parameters:["self"]
  }
}
*/
this.Actions = {};
loadAppCode("_actions",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.permissions.save = false;
  this.parent.permissions.connect = false;

  mode = data['mode'] || 'present';
  Actions = this;

  function getById(id,node){
      //assume that if in present mode the containers are loaded via LOAD module
      console.log("MODE:"+mode+" id:"+id+" reff:"+LOADreferences[id]);
      if( mode == 'present' && LOADreferences[id])
      {
        console.log("found reff to:"+id);
        return LOADreferences[id];
      }
      //recursive BFS
      if(!node)
        node = factory.base;

      if( node.UID == id )
        return node;

      for( c in node.children )
        getById(id,node.children[c]);
  }

  function getObjectFromID(id,self){
    if( typeof(id) == "string" )
    {
      if( id == "self" )
        return self;
      var pos = id.search("#UID:");
      if( pos == 0 )
        return getById(id.substr(pos+5,id.length));
    }
    return id;
  }

  function processActionDescriptor(node,sl){
    for( a in node.actions){
      var act = node.actions[a];
      act["_target"] = getObjectFromID(act.target,node);
      act["_parameters"] = [];
      for( p in act.parameters )
        act["_parameters"][p] = getObjectFromID( act.parameters[p] , node);

      console.log("Created act:"+utils.debug(act," ",true)+" will add events:"+sl);
      if(sl){
        node.addEventListener(a,function(e){
          var act = e.target.actions[e.event];
          var targ = act._target;
          if( targ[act.handler] )
            targ[act.handler].apply(targ,act._parameters);
          else
            console.log("Actions: ERROR, handler"+act.handler+" does not exist on object:"+utils.debug(targ));
        })
        console.log("Actions: added "+a+" to "+utils.debug(node)+" target:"+utils.debug(act._target));
      }
    }
  }

  function defaultNode(node){
    node.actions = {
      "triggered":{
        target:"#UID:"+factory.root.UID,
        handler:"cfocusOn",
        parameters:['self']
      },
    };

    for( c in node.children )
      defaultNode(node.children[c]);
  }

  function loadNode(node){
    console.log("Loading actions for node:"+utils.debug(node)+" actions:"+utils.debug(node.actions," ",true));
    processActionDescriptor(node,true);
    for( c in node.children )
      loadNode(node.children[c]);
  }

  function traverse(root){

    if( mode == 'edit')
      defaultNode(root);

    if( mode == 'present' )
      loadNode(root);
  }

  function onNewNode(e){
    defaultNode(e.child);
    //console.log("Actions added to new container:"+utils.debug(e.child)+">"+utils.debug(e.child.actions,";",true));
  }

  this.init = function(){
    console.log(this.parent.appPath+" - initialising. Mode:"+mode);
    traverse( factory.root );
    GEM.addEventListener("addChild",0,onNewNode,this);
  }

  this.shutdown = function(){
    console.log(this.parent.appPath+" - shutdown...");
    GEM.removeEventListener("addChild",0,onNewNode,this);
  }
});
