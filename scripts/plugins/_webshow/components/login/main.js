loadAppCode("_webshow/components/login",function(args){
  this.config = {interface:"none"}
  args.parent.setPermission('save',false);
	args.parent.setPermission('connect',false);
  args.parent.setPermission('noOverride',true);

  this.init = function(){
    console.log("Attaching login...");
    this.attach("Welcome");
  }

  function login_failed(){
    $('form').fadeIn(500);
    $('.wrapper').removeClass("form-success")
  }
  function login_response(data){
    console.log(data);
    try {
      data = JSON.parse(data);
      if(data.success == true){
        factory.login.token = data.token;
        args.chaining.selectMode();
        return;
      }
    }catch(e){
      console.log("Failed to login:"+e);
    }
    login_failed();
  }
  function login(event){
    event.preventDefault();
    $('form').fadeOut(500);
    $('.wrapper').addClass('form-success');
    data = {email:$('#login_user').val(),password:$('#login_password').val()};
    factory.login = {};
    factory.login.useremail = $('#login_user').val();
    data = JSON.stringify(data);
    network.POST("login",data,login_response,login_failed);
  }

  this.shutdown = function(){

  }

  this.buildLoginForm = function(){
    return utils.makeHTML(
    [{
      div:{
        id:"webshow_container",
        class:"container",
        children:[{
          h1:{
            id:"webshow_login_text",
            innerHTML:"Welcome"
          }
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
            },
            {br:{}},{br:{}},
            {
              a:{
                href:"#",
                class:"signup",
                innerHTML:"Sign Up",
                onclick:function(){
                  $("#webshow_container").fadeOut({duration:250,complete:function(){$("#webshow_container").remove()}});
                  args.chaining.onRegister();
                }
              }
            }]
          }
        }]
      }
    }]);
  }
  this.attach = function(text){
    var form = this.buildLoginForm();
    $("#webshow_wrapper").append(form);
    if(text && text.length > 0)
      $("#webshow_login_text").html(text);
    $(form).fadeOut(0);
    $(form).fadeIn(1500);
  }
});
