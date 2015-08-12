loadAppCode("_webshow/components/login",function(args){
  this.config = {interface:"none"}
  var attachTo = 0;
  this.init = function(){
    var ctx = this;
    console.log("init"+args.parent.appFullPath);
    utils.loadStyle(args.parent.appFullPath+"css/style.css",function(){
      console.log("loaded style");
      ctx.attach(factory.base);
    });
  }

  function login_failed(){
    //$('form').fadeIn(500);
    //$('.wrapper').removeClass("form-success")
    setTimeout(function(){args.chaining.onLogin();},500);
  }
  function login_response(e){
    try {
      data = atob(e);
      data = JSON.decode(data);
      if(data.status == 'success')
        args.chaining.onLogin();
    }catch(e){
      login_failed();
    }
  }
  function login(event){
    event.preventDefault();
    $('form').fadeOut(500);
    $('.wrapper').addClass('form-success');
    data = {user:$('#login_user').val(),password:$('#login_password').val()};
    data = JSON.stringify(data);
    data = btoa(data);
    network.POST("login",data,login_response,login_failed);
  }

  this.shutdown = function(){

  }

  this.attach = function(target){
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
        children:[{
          div:{
            id:"webshow_container",
            class:"container",
            children:[{
              h1:{innerHTML:"Welcome"}
            },{
              form:{
                class:"form",
                children:[{
                  input:{
                    id:"login_user",
                    type:"text",
                    placeholder:"Username"
                  }
                },{
                  input:{
                    id:"login_password",
                    type:"Password",
                    placeholder:"password",
                  }
                },{
                  button:{
                    type:"button",
                    id:"login-button",
                    innerHTML:"Login",
                    onclick:login
                  }
                }]
              }
            }]
          }
        },bubbles]
      }
    }],target.DOMreference);
  }
});
