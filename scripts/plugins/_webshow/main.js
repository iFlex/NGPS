var webshow = 0;
loadAppCode("_webshow",function(data){
  this.config = {interface:"none"}
  var p_config = 0;
  data.parent.setPermission('save',false);
	data.parent.setPermission('connect',false);
  data.parent.setPermission('noOverride',true);

  this.init = function(){
    p_config = this.getQueryParams();
    var dataToLive = {webshow:this}
    if(p_config.p && (p_config.remote||p_config.audience)){ //this endpoint is a remote
        factory.presentation = p_config.p;
        factory.remote = p_config.remote;
        factory.audience = p_config.audience;
        dataToLive.doStart = true;
    }

    this.importer = factory.newGlobalApp("dialogue/dialogues/import",{Dialogue:{}});
    this.chooseMode = factory.newGlobalApp(data.parent.appName+"/components/modeSelect",{chaining:this});
    this.login = factory.newGlobalApp(data.parent.appName+"/components/login",{chaining:this});
    this.register = factory.newGlobalApp(data.parent.appName+"/components/register",{chaining:this});
    this.add = factory.newGlobalApp(data.parent.appName+"/components/add",{chaining:this});
    factory.newGlobalApp(data.parent.appName+"/components/live",dataToLive);
    webshow = this;
  }
  this.loadFromFile = function(data){
    pLOAD.fromHTML(atob(data.split(",")[1]));
  }
  this.shutdown = function(){

  }
  this.onBackToLogin = function(text){
    this.login.app.attach(text);
  }
  this.onLogin = function(){
    this.chooseMode.app.activate();
  }
  this.onRegister = function(){
    this.register.app.attach();
  }
  this.onModeSelect = function(){

  }
  this.getQueryParams = function() {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
          // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
          // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
        query_string[pair[0]] = arr;
          // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }
    return query_string;
  }
});
