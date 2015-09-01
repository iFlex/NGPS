//TODO: add previewing of effect
//TODO: Add loading of triggers when presentation si loaded

this.Editor = this.Editor || {};
loadAppCode("edit/components/effects",function(data){
  this.config = {interface:"none"};
  this.showing = false;
  this.triggerer = 0;
  var cardUI,mountPoint;
  var availableEffects = {};
  var availableTriggers = ["triggered","mouseDown","mouseUp","mouseMove"];
  var selectTriggerDlgDesc = {title:"Select how to trigger your effect",selection_item:[{button:{class:"btn btn-warning",onclick:triggerSelected}}],selection:[]};
  var selectEffectDlgDesc = {title:"Select the effect",selection_item:[{button:{class:"btn btn-warning",onclick:selectEffect}}],selection:[]};
  this.init = function(){
    Editor.effects = this;
    Editor.effects.installer = factory.newGlobalApp(data.parent.appName+"/installer");

    availableEffects = effects.getEffects();
    for( i in availableTriggers)
      selectTriggerDlgDesc.selection.push({label:availableTriggers[i]});

    for( i in availableEffects)
      selectEffectDlgDesc.selection.push({label:availableEffects[i].name,description:availableEffects[i].description});

    cardUI = factory.base.addChild({x:0,y:factory.base.getHeight(),width:"100%",height:"25%",border_radius:["0px"],"overflow-y":"scroll","overflow-x":"hidden",permissions:{save:false,connect:false},style:bkgStyle});

    var ghostTable = utils.makeHTML([{
      div:{
        style:"display: table;width: 100%;height:100%;background:transparent"
      }
    }]);

    var divContainer = utils.makeHTML([{
      div:{
        class:"wrapper",
        style:"display: table-cell;text-align: center;vertical-align: middle;background:transparent"
      }
    }]);

    ghostTable.appendChild(divContainer);
    cardUI.DOMreference.appendChild(ghostTable);
    mountPoint = divContainer;
  }

  this.shutdown = function() {
    delete Editor.effects;
  }

  function buildEffectDisplay(trigger,effect,delegate,isInterface) {
    var contain = cardUI.addChild({"*isolated":mountPoint,autopos:true,width:"100%",background:"transparent","overflow":"auto"});
    if(!isInterface){
      var act = contain.addChild({autopos:true,autosize:true,class:"btn btn-default"});
      act.DOMreference.fxctl = contain;
      utils.makeHTML([{
        span:{
          class:"glyphicon glyphicon-align-justify",
          fxctl:contain
        }
      }],act.DOMreference);
    } else {
      var act = contain.addChild({autopos:true,autosize:true,class:"btn btn-default"});
      act.DOMreference.fxctl = contain;
      act.DOMreference.innerHTML = "Choose an animation for your container "
    }

    contain.fxtrigger = contain.addChild({autopos:true,autosize:true,class:"btn btn-danger"});
    contain.fxname = contain.addChild({autopos:true,autosize:true,class:"btn btn-danger"});
    contain.fxtrigger.DOMreference.innerHTML = trigger;
    contain.fxname.DOMreference.innerHTML = effect;

    contain.fxtrigger.DOMreference.onclick = function(e) {
      selectTriggerDlgDesc.subject = e.target;
      Dialogue.singleChoice.show(selectTriggerDlgDesc);
    }

    contain.fxname.DOMreference.onclick = function(e) {
      selectEffectDlgDesc.subject = e.target;
      Dialogue.singleChoice.show(selectEffectDlgDesc);
    }

    if(isInterface) {
      var act = contain.addChild({autopos:true,autosize:true,class:"btn btn-default"});
      act.DOMreference.onclick = installEffect;
      act.DOMreference.fxctl = contain;
      utils.makeHTML([{
        span:{
          class:"glyphicon glyphicon-plus-sign",
          fxctl:contain
        }
      }],act.DOMreference);
      cardUI.addChild({"*isolated":mountPoint,autopos:true,width:"100%",height:"10px"});
    } else {
      var act = contain.addChild({autopos:true,autosize:true,class:"btn btn-default"});
      act.DOMreference.onclick = uninstallEffect;
      act.DOMreference.fxctl = contain;
      utils.makeHTML([{
        span:{
          class:"glyphicon glyphicon-trash",
          fxctl:contain
        }
      }],act.DOMreference);
      cardUI.addChild({"*isolated":mountPoint,autopos:true,width:"100%",height:"2px"});
    }
  }

  this.show = function(triggerer){
    if(this.showing)
      deleteOld();

    this.showing = true;
    this.triggerer = triggerer;
    var close = cardUI.addChild({type:"button",x:0,y:0,autosize:"true",class:"btn btn-danger",permissions:{save:false,connect:false}});
    utils.makeHTML([{
      span:{
        class:"glyphicon glyphicon-remove"
      }
    }],close.DOMreference);
    close.DOMreference.onclick = this.hide;

    //for each event create a record
    buildEffectDisplay("Choose how to trigger effect","Choose effect",false,true);
    if(triggerer) {
      for( i in triggerer.effects){
        for( j in triggerer.effects[i].fx){
          buildEffectDisplay(i,triggerer.effects[i].fx[j].fxname,triggerer.effects[i].delegate,false);
        }
      }
      cardUI.tween({top:"75%"},1);
    }
  }

  this.hide = function(){
    this.showing = false;
    if(cardUI ) {
      deleteOld();
      cardUI.tween({top:"100%"},1);
    }
  }
  function deleteOld(){
    for( i in cardUI.children)
      cardUI.children[i].discard();
  }
  function uninstallEffect(e) {
    var ctl = e.target.fxctl;
    console.log(e.target);
    if(ctl){
      var fxrecord = effects.getEffect(ctl.fxname.DOMreference.innerHTML);
      console.log("fxrecord:");
      console.log(fxrecord);
      try {
        if(fxrecord) {
          fxrecord.uninstall(
                          ctl.fxtrigger.DOMreference.innerHTML,
                          Editor.effects.triggerer,
                          {target:Editor.effects.triggerer.UID,fxname:ctl.fxname.DOMreference.innerHTML})
        }
      } catch(e) {
        console.error("Could not discard effect",e);
      }
      ctl.discard();
    }
  }

  function installEffect(e){
    var ctl = e.target.fxctl;
    if(ctl){
      var fxrecord = effects.getEffect(ctl.fxname.DOMreference.innerHTML);
      var message = "Could not find selected effect";
      if(fxrecord){
        producedFx = fxrecord.install(
                            ctl.fxtrigger.DOMreference.innerHTML,
                            Editor.effects.triggerer,
                            Editor.effects.triggerer)
        if( !producedFx.error ) {
          Editor.effects.installer.app.show(ctl.fxtrigger.DOMreference.innerHTML,Editor.effects.triggerer,fxrecord,producedFx);
          return;
        }
      }
      console.log(producedFx.error);
    }
  }

  function triggerSelected(e){
    selectTriggerDlgDesc.subject.innerHTML = e.target.innerHTML;
    Dialogue.singleChoice.hide();
  }

  function selectEffect(e){
    selectEffectDlgDesc.subject.innerHTML = e.target.innerHTML;
    Dialogue.singleChoice.hide();
  }

  var bkgStyle = "background-size: 50px 50px;\
background-color: #cdd1d2;\
background-image: -webkit-linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);\
background-image: -moz-linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);\
background-image: linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);\
-pie-background: linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent) 0 0 / 50px #0ae;";
});