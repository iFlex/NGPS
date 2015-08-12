var Dialogue = 0;
loadAppCode("dialogue",function(data){
  this.config = {interface:"none"};

  this.init = function(){
    Dialogue = this;
    Dialogue.import = factory.newGlobalApp(this.parent.appName+"/dialogues/import").app;
    Dialogue.singleChoice = factory.newGlobalApp(this.parent.appName+"/dialogues/singleChoice").app;
  }

  this.shutdown = function(){
    delete Dialogue;
  }
  
});
