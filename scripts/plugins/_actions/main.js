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
  this.parent.setPermission('save',false);
  this.parent.setPermission('connect',false);

  mode = data['mode'] || 'present';
  Actions = this;

  function getById(id,node){
      //assume that if in present mode the containers are loaded via LOAD module
      if( mode == 'present' && LOADreferences[id])
      {
        console.log("MODE:"+mode+" id:"+id+" reff:"+LOADreferences[id]);
        console.log("found reff to:"+id);
        return LOADreferences[id];
      }
      //recursive BFS
      if(!node)
        node = factory.base;

      console.log("Recursive BFS.("+node.UID+") ~ "+id);
      if( node.UID == id )
        return node;

      var n = undefined;
      for( c in node.children ) {
        n = getById(id,node.children[c]);
        if(n)
          return n;
      }
      return n;
  }

  function getObjectFromID(id,self){
    if( typeof(id) == "string" )
    {
      if( id == "#self" )
        return self;
      var pos = id.search("#:");
      if( pos == 0 )
        return getById(id.substr(pos+2,id.length));
    }
    return id;
  }
  this.forceTrigger = function(node, _event){
    if(!node.actions || !node.actions.triggers)
      return;
    if(!_event){
      for( ev in node.actions.triggers)
        exec(ev);
    }
    else
      exec(_event);

    function exec(event){
      var act = node.actions.triggers[event];
      var a,t;
      for( i in act){
        a = act[i];
        t = a.target;
        if(!t[a.handler] && a.isMember)
          t = factory.root;
        console.log("Force trigger target:"+t.UID);
        if( t[a.handler] ) {
          if(a.params.initial)
            t.DOMreference.style.cssText = a.params.initial;
          t[a.handler].apply(t,a.params.pass);
        }
        else
          console.log("Actions: ERROR, handler"+act.handler+" does not exist on object:"+utils.debug(targ));
      }
    }
  }
  this.processActionDescriptor = function(node,sl){
    processActionDescriptor(node,sl);
  }
  function processActionDescriptor(node,sl){
    var epl = node.actions.triggers;
    console.log("Actions:: processing node descriptor("+node.UID+")");
    if(!node._actrdy) {
      for( a in epl){
        for( i in epl[a]) {
          ep = epl[a][i];
          console.log("Actions processing("+node.UID+"):"+a+" >> "+i);
          console.log(ep);
          ep["target"] = getObjectFromID(ep.target,node);
          for( g in ep.params )
            for( p in ep.params[g] )
              ep.params[g][p] = getObjectFromID( ep.params[g][p] , node);
        }
        node._actrdy = true;
        if(sl)
          node.addEventListener(a,handle);
      }
    }
    function handle(e){
      var act = e.target.actions[e.event];
      var a,t;
      for( i in act){
        a = act[i];
        t = a.target;
        if(!t[a.handler] && a.isMember)
          t = factory.root;

        if( t[a.handler] ) {
          if(a.params.initial)
            t.DOMreference.style.cssText = a.params.initial;
          t[a.handler].apply(t,a.params.pass);
        }
        else
          console.log("Actions: ERROR, handler"+act.handler+" does not exist on object:"+utils.debug(targ));
      }
    }
  }

  function loadNode(node){
    console.log("Loading actions for node:"+utils.debug(node)+" actions:"+utils.debug(node.actions," ",true));
    processActionDescriptor(node,true);
    for( c in node.children )
      loadNode(node.children[c]);
  }

  function traverse(root){

    //if( mode == 'edit')
      //defaultNode(root);

    //if( mode == 'present' )
      loadNode(root);
  }

  function onNewNode(e){
    //defaultNode(e.child);
    //console.log("Actions added to new container:"+utils.debug(e.child)+">"+utils.debug(e.child.actions,";",true));
  }

  this.init = function(){
    console.log(this.parent.appPath+" - initialising. Mode:"+mode);
    traverse( factory.root );
    //GEM.addEventListener("addChild",0,onNewNode,this);
  }

  this.shutdown = function(){
    console.log(this.parent.appPath+" - shutdown...");
    GEM.removeEventListener("addChild",0,onNewNode,this);
  }
});
