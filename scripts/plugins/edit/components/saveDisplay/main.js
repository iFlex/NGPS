this.Editor = this.Editor || {};

loadAppCode("edit/components/saveDisplay",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.permissions.save = false;
  this.parent.permissions.connect = false;
  this.textarea = 0;
  var doClose = false;
  Editor.saveAid = this;
  this.init = function(){
    this.textarea = factory.newContainer({type:"textarea",x:100,y:60,width:factory.base.getWidth()/2,height:factory.base.getHeight()*0.6,background:"rgba(200,200,200,0.5)",style:"margin-left:auto;mergin-right:auto"},"none",factory.base);
    this.textarea.DOMreference.style.overflowY = "scroll";
    this.textarea.hide();
    this.textarea.onMoved = function(){}
    this.textarea.onTrigger = function(){ if(doClose) Editor.saveAid.hide(); if(!doClose) doClose = true; };
  }
  this.shutdown = function(){
    this.textarea.discard();
  }
  this.show = function(){
    save.RAMsave();
    var dta = pack();
    this.textarea.show();
    this.textarea.DOMreference.value = dta;
    doClose = false;
  }
  this.hide = function(){
    this.textarea.hide();
  }
});
