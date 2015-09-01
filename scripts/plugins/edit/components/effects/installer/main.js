this.Editor = this.Editor || {};
loadAppCode("edit/components/effects/installer",function(data){
  this.config = {interface:"none"};

  var triggerer = 0;
  var trigger = 0;
  var effect = 0;
  var fxrecord = 0;
  var button = 0;
  var cancel = 0;

  function nextStage(){
    if(effect) {
      console.log(effect.install_steps[fxrecord.installIndex]);
      Dialogue.toast.show(effect.install_steps[fxrecord.installIndex],(effect.install_steps.length == fxrecord.installIndex+1)?1500:0);
      effect.configure(fxrecord);
      if(effect.install_steps.length == fxrecord.installIndex)
        endEditing();
    }
  }

  function cancelEdit(){
      effects.uninstall(trigger,triggerer,fxrecord);
      endEditing();
  }

  function endEditing(){
    Editor.effects.show(triggerer);
    effects.initialise(fxrecord,false);
    triggerer = 0;
    trigger = 0;
    effect = 0;
    fxrecord = 0;
    button.hide();
    cancel.hide();
  }

  this.show = function(_trigger,_triggerer,fxsource,fx){
    if(!triggerer) {
      trigger = _trigger;
      triggerer = _triggerer;
      effect = fxsource;
      fxrecord = fx;
      fx.installIndex = 0;
      nextStage();

      button.show();
      cancel.show();
      button.putAt(factory.base.getWidth()/2,0);
      cancel.putAt(button.getPos().x+button.getWidth(),0);

      Editor.effects.hide();
    } else {
      cancelEdit();
      this.show(_trigger,_triggerer,fxsource,fx);
    }
  }

  this.init = function(){
    button = factory.base.addChild({type:"button",x:factory.base.getWidth()/2,y:0,autosize:true,class:"btn btn-warning"});
    button.DOMreference.innerHTML = "Finish Editing";
    button.DOMreference.onclick = nextStage;

    cancel = factory.base.addChild({type:"button",x:button.getPos().x+button.getWidth(),y:0,autosize:true,class:"btn btn-warning"});
    cancel.DOMreference.innerHTML = '<span class="glyphicon glyphicon-remove"></span>';
    cancel.DOMreference.onclick = cancelEdit;

    button.hide();
    cancel.hide();
  }

  this.shutdown = function(){
    button.discard();
  }

});
