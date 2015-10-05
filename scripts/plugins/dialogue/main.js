var Dialogue = 0;
loadAppCode("dialogue",function(data){
  this.config = {interface:"none"};
  data.parent.setPermissions(factory.UIpermissions);
  //CALLBACK HELL IS CRIPLING THIS ENGINE... WTF...
  this.init = function(){
    console.log(data.parent.appFullPath+" - initialising...");
    Dialogue = this;
    factory.newGlobalApp(data.parent.appName+"/dialogues/import",{Dialogue:this});
    factory.newGlobalApp(data.parent.appName+"/dialogues/singleCh",{Dialogue:this});
    factory.newGlobalApp(data.parent.appName+"/dialogues/toast",{Dialogue:this});
  }

  this.shutdown = function(){
    console.log(data.parent.appFullPath+" - shutdown...");
    delete Dialogue;
  }

});
