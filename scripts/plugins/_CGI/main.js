/*
Adds trigger hooks, when a trigger happens a operation gets executed.
Enables animations and transitions
Author: Milorad Liviu Felix
11 Mar 2015  02:30 GMT

{UID:container}
to container the
coreography field will be added
_CGI:{
  subject:,
}
*/
this._CGI = this._CGI || {};
loadAppCode("_CGI",function(data){
  _CGI = this;
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.adjInterf = 0;
  this.target;
  this.adjusting = 0;
  hasInterface = (data['mode'] == 'edit');
  Interface = 0;
  index = 0;
  bsz = 32;
  rad = bsz/2;
  controllers = {};
  txtstyle = "display: table-cell;vertical-align: middle;text-align: center;";
  horizontal = "display: inline-block; *display: inline; vertical-align: top;"
  interfHeight = (bsz*1.2);
  var lastX,lastY;
  var miniInterf;
  this.init = function(){
    if(hasInterface){
      Interface = factory.base.addChild({permissions:{save:false},width:"100%",height:interfHeight+"px",x:"0px",bottom:"0%",background:"rgba(0,0,0,0.1)",cssText:"overflow:scroll;padding-left:5px;padding-top:3px"});
      if( Editor && Editor.headerHeight )
        this.adjInterf = factory.base.addChild({width:"10%",height:"auto",x:"-10%",bottom:interfHeight+"px",border_radius:[0,"10px",0,0],style:"padding-left:5px;padding-right:5px;",background:"rgba(0,0,0,0.05)"});
    }
  }
  this.interfClick = function(e){
    console.log("Focusing...");
    _CGI.createInterface(3,e);
    factory.root.cfocusOn(e._CGI_CTL,{speed:1});
  }

  this.create = function(target,x,y){
    lastX = x;lastY = y;
    _CGI.target = target;
    editEventList();
  }

  this.showAdj = function(x){
    _CGI.adjInterf.tween({left:x},1);
  }
  this.hideAdj = function(){
    _CGI.adjInterf.tween({left:"-10%"},1);
  }
  function playback(e){
    if(Actions){
      Actions.processActionDescriptor(e.target,true);
      Actions.forceTrigger(e.target);
    }
  }
  function destroy(e){
    if(e.target.actions) {
      var rem = parseInt(e.DOMreference.innerHTML);
      e.target._CGI_ROOT = 0;
      delete e.target.actions;
      if( e._CGI_CTL && e._CGI_CTL.UID )
        e._CGI_CTL.discard();
      e.discard();
    }
    _CGI.hideAdj();
  }

  function reconfigure(e){
    _CGI.target = e.target;
    editEventList();
    _CGI.hideAdj();
  }
  var prevaj = 0;
  this.createInterface = function(v,e){
    if(e && prevaj == e.UID){
      _CGI.hideAdj();
      prevaj = 0;
      return;
    }

    for( i in buttons )
      buttons[i].discard();

    for( var i = 0 ; i < v ; ++i )
    {
      buttons[i] = _CGI.adjInterf.addChild({width:"100%",height:"auto",autopos:true,style:"margin-top:5px;margin-bottom:5px;text-align:center;box-shadow: 0 0 9px rgba(0,0,0,0.7);",class:"sizeTransD btn btn-warning"});
      buttons[i].extend(Interactive);
      buttons[i].interactive(true);
      buttons[i].onMoved = function(){};
    }
    if(v == 1) {
      buttons[0].DOMreference.innerHTML = "finish adjusting";
      buttons[0].onTrigger = onAdjustmentReady;
      _CGI.adjInterf.tween({left:"0%"},1);
    }
    else {
      buttons[0].DOMreference.innerHTML = "delete";
      buttons[0].onTrigger = function(){destroy(e);};
      buttons[1].DOMreference.innerHTML = "configure";
      buttons[1].onTrigger = function(){reconfigure(e);};
      buttons[2].DOMreference.innerHTML = "play back";
      buttons[2].onTrigger = function(){playback(e);};
      prevaj = e.UID;
      var pos = e.getPos(0,0,true);
      _CGI.showAdj(pos.x);
    }
  }
  this.addDotToInterface = function(type){
    if(_CGI.target._CGI_ROOT)
      return;

    index++;
    var descriptor = {width:"32px",height:"32px",border_radius:["50%"],border_size:2,background:"rgba(255,215,0,0.35)",class:"centerText unselectable",style:"display:inline-block"};
    var c = Interface.addChild(utils.merge(descriptor,{autopos:true,class:"sizeTransD centerText unselectable"}));
    c._CGI_CTL = factory.root.addChild(utils.merge(descriptor,{x:lastX,y:lastY}));
    c._CGI_CTL.putAt(lastX,lastY,0.5,0.5);
    c.target = _CGI.target;
    _CGI.target._CGI_ROOT = c;
    c.DOMreference.innerHTML = index;
    c._CGI_CTL.DOMreference.innerHTML = index;

    c.extend(Interactive);
    c._CGI_CTL.extend(Interactive);
    c.interactive(true);
    c._CGI_CTL.interactive(true);
    c.onMoved = function(){};
    c.onTrigger = _CGI.interfClick;
    //c._CGI_CTL.onTrigger;

    console.log("Added child");
    console.log(c);
    console.log("@"+lastX+":"+lastY);
  }

  var buttons = [];
  this.selected = [];

  function editEventList(){
    //read actions list and convert it
    _CGI.selected = [];
    if(_CGI.target.actions)
      for( k in _CGI.target.actions.triggers){//for every event
        for( ech in _CGI.target.actions.triggers[k])
        {
          _CGI.target.actions.triggers[k][ech].trigmode = _CGI.target.actions.trigmode;
          var d = {}; d[k] = _CGI.target.actions.triggers[k][ech];
          _CGI.selected.push( d );
        }
      }
    console.log("Loading:");
    console.log(_CGI.selected);
    userMessages.choosePool(availableEvents,availableActions,_CGI.selected,waitForAdjustment);
  }

  function finalCommit(how){
      console.log("Commit:");
      console.log(_CGI.selected);
      if(!saveIndex)
        saveIndex = 0;

      var key = Object.keys(_CGI.selected[saveIndex].triggers)[0];
      var slct = _CGI.selected[saveIndex].triggers[key];
      var avac = availableActions[slct.name][1];
      slct.handler = avac.handler;
      slct.isMember = avac.isMember;
      slct.target = "#:"+_CGI.target.UID;
      if(avac.target)
        slct.target = "#:"+avac.target.UID;

      slct.params = slct.params || {};
      slct.params.pass = slct.params.pass || avac.params || [];
      _CGI.target.actions = {
        subject:_CGI.target.UID
      };
      _CGI.target.actions.triggers = {};
      for( i in _CGI.selected ) {
        _CGI.target.actions.trigmode = _CGI.selected[i].trigmode;
        var key = Object.keys(_CGI.selected[i].triggers)[0];
        if(!_CGI.target.actions.triggers[key])
          _CGI.target.actions.triggers[key] = [];
        _CGI.target.actions.triggers[key].push(_CGI.selected[i].triggers[key]);
      }

      if(_CGI.selected.length)
        _CGI.addDotToInterface(0);
  }

  var saveIndex = undefined;
  function onAdjustmentReady(){
    _CGI.hideAdj();
    if( saveIndex != undefined ){
      var key = Object.keys(_CGI.selected[saveIndex].triggers)[0];
      var slct = _CGI.selected[saveIndex].triggers[key];
      var aname = slct.name;
      slct.params = slct.params || {pass:[]};
      slct.params.final = _CGI.target.DOMreference.style.cssText;
      //callback
      if(typeof(availableActions[aname][1].onAdjustEnd) == 'function')
        availableActions[aname][1].onAdjustEnd(_CGI.target,slct.params.pass);

      //restore to initial pos
      if( slct.params.initial)
        _CGI.target.DOMreference.style.cssText = slct.params.initial;

    }
    finalCommit(false);
    _CGI.adjusting = false;
  }

  function waitForAdjustment(data){
    //show interface
    if(data == undefined ){
      finalCommit(true);
      saveIndex = undefined;
    } else {
      if( data < 0 ){
        cancelLast();
        return;
      }

      if( _CGI.selected.length && _CGI.selected[ _CGI.selected.length - 1 ].triggers)
        _CGI.createInterface(1);

      saveIndex = data;
      _CGI.adjusting = true;

      var key = Object.keys(_CGI.selected[data].triggers)[0];
      var aname = _CGI.selected[data].triggers[key].name;
      var slct = _CGI.selected[data].triggers[key];
      slct.params = slct.params || {pass:[]};
      slct.params.initial = _CGI.target.DOMreference.style.cssText;
      //callback
      if(typeof(availableActions[aname][1].onAdjustStart) == 'function')
        availableActions[aname][1].onAdjustStart(_CGI.target,slct.params.pass);

      finalCommit(false);
    }
  }
  function cancelLast(){
    _CGI.hideAdj();
    _CGI.selected.splice(0,1);
    finalCommit(false);
  }
  var availableActions = {
    move:[2,{
      //target:,//override target
      handler:function(e,f){console.log(e);console.log(f);},//"tween",
      params:[],//parameters to pass
      onAdjustStart:function(o,storage){
        var pos = o.getPos(0,0);
        storage[0] = pos.x;
        storage[1] = pos.y;
      },// function to be called when starting to adjust
      onAdjustEnd:function(o,storage){
        var pos = o.getPos(0,0);
        storage[0] = {left:pos.x,top:pos.y};
        storage[1] = 1;
      },// function to be called when adjust ended
    }],
    scale:[2,true],
    zoom:[2,true],
    "focus camera":[0,{
      isMember:true,
      handler:"cfocusOn",
      params:[0,{speed:1}],
      target:factory.root
    }],
    fadeIn:[2,false],
    fadeOut:[2,false],
    restyle:[2,true,],
  };
  var availableEvents  = ['click','mouseMove'];
});
