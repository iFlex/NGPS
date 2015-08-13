var webshow = 0;
loadAppCode("_webshow",function(data){
  this.config = {interface:"none"}
  this.init = function(){
    this.chooseMode = factory.newGlobalApp(data.parent.appName+"/components/modeSelect",{chaining:this});
    this.login = factory.newGlobalApp(data.parent.appName+"/components/login",{chaining:this});
    this.add = factory.newGlobalApp(data.parent.appName+"/components/add",{chaining:this});
    webshow = this;
  }
  this.loadFromFile = function(data){
    pLOAD.fromHTML(atob(data.split(",")[1]));
  }
  this.shutdown = function(){

  }
  this.onLogin = function(){
    this.chooseMode.app.activate();
  }
  this.onModeSelect = function(){

  }
});
