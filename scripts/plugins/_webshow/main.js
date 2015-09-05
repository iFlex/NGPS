var webshow = 0;
loadAppCode("_webshow",function(args){
  this.config = {interface:"none"}
  var p_config = 0;
  args.parent.setPermission('save',false);
	args.parent.setPermission('connect',false);
  args.parent.setPermission('noOverride',true);

  this.init = function(){
    pLOAD.loadStartOffset = 100;

    p_config = this.getQueryParams();
    var dataToLive = {webshow:this}
    if(p_config.p && (p_config.remote||p_config.audience)){ //this endpoint is a remote
        factory.session = {};
        factory.session.presentation = p_config.p;
        factory.session.remote = p_config.remote;
        factory.session.audience = p_config.audience;
        dataToLive.doStart = true;
    }
    if(!dataToLive.doStart) {
      this.importer = factory.newGlobalApp("dialogue/dialogues/import",{Dialogue:{}});
      this.chooseMode = factory.newGlobalApp(args.parent.appName+"/components/modeSelect",{chaining:this});
      this.login = factory.newGlobalApp(args.parent.appName+"/components/login",{chaining:this});
      this.register = factory.newGlobalApp(args.parent.appName+"/components/register",{chaining:this});
      this.add = factory.newGlobalApp(args.parent.appName+"/components/add",{chaining:this});
    }
    factory.newGlobalApp(args.parent.appName+"/components/live",dataToLive);
    webshow = this;

    var ctx = this;
    console.log(args.parent.appFullPath+" - initialising");
    utils.loadStyle(args.parent.appFullPath+"css/style.css",function(){
      console.log(args.parent.appFullPath+" styles - OK");
      ctx.create(factory.base);
    });
  }
  this.loadFromFile = function(data){
    pLOAD.fromHTML(atob(data.split(",")[1]));
  }
  this.shutdown = function(){

  }
  this.onBackToLogin = function(text){
    this.login.app.attach(text);
  }
  this.selectMode = function(){
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

  this.create = function(target){
    var innerBubbles = [{li:{}},{li:{}},{li:{}},{li:{}},{li:{}},{li:{}},{li:{}},{li:{}},{li:{}},{li:{}}];
    var bubbles = utils.makeHTML([{
      ul:{
        class:"bg-bubbles",
        children:innerBubbles
      }
    }]);
    utils.makeHTML([{
      div:{
        id:"webshow_wrapper",
        class:"wrapper",
        children:[bubbles]
      }
    }],target.DOMreference);
  }

});
