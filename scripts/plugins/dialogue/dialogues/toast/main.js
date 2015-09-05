loadAppCode("dialogue/dialogues/toast",function(data){
  this.config = {interface:"none"};
  data.parent.setPermissions(factory.UIpermissions)

  var descriptor = {x:0,y:factory.base.getHeight(),width:"100%",autosize:true,background:"black",style:"color:white;text-align:center",permissions:data.parent.getPermissions()};
  var toast = 0;
  var timeout = 0;
  this.show = function(message,timeout){
    var delay = 1;
    if(toast)
      delay = 0;
    this.hide(true);
    toast = factory.base.addChild(descriptor);
    toast.DOMreference.innerHTML = message;
    toast.tween({top:100*(1-toast.getHeight()/factory.base.getHeight()) +"%"},delay);
    if(timeout)
      timeout = setTimeout(function(){data.Dialogue.toast.hide();},timeout);
  }

  this.hide = function(force){
    if(timeout) {
      clearTimeout(timeout);
      timeout = 0;
    }
    if(!toast)
      return;

    if(force) {
      toast.discard();
      toast = 0;
    }
    else
      toast.tween({top:"100%",complete:function(){data.Dialogue.toast.hide(true);}},1);
  }

  this.init = function(){
    console.log(data.parent.appFullPath);
    data.Dialogue.toast = this;
  }

  this.shutdown = function(){

  }

});
