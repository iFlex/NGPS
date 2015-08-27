loadAppCode("_webshow/components/register",function(args){
  this.config = {interface:"none"}
  args.parent.setPermission('save',false);
	args.parent.setPermission('connect',false);
  args.parent.setPermission('noOverride',true);

  this.init = function(){
    console.log(args.parent.appFullPath+" - initialiseing...");
  }
  function back(noMessage){
    $('.wrapper').removeClass("form-success")
    $('#webshow_chooser').fadeOut({duration:250,complete:function(){$('#webshow_chooser').remove()}})
    args.chaining.onBackToLogin((noMessage)?null:"Login to your new account");
  }
  function register_failed(){
    $('form').fadeIn(500);
    $('.wrapper').removeClass("form-success")
  }
  function register_response(data){
    console.log(data);
    try {
      data = JSON.parse(data);
      if(data.success == true){
        back();
        return;
      } else if(data.error){
        $('#reg_message').html(data.error);
      }
    }catch(e){
      console.log("Failed to login:"+e);
    }
    register_failed();
  }
  function register(event){
    event.preventDefault();
    if($('#reg_password').val() != $('#reg_confirm_pass').val()){
      $("#reg_message").html("Passwords don't match!");
    } else {
      $('#reg_message').html("Creating your account...");
      $('form').fadeOut(500);
      $('.wrapper').addClass('form-success');
      data = {email:$('#reg_email').val(),password:$('#reg_password').val()};
      data = JSON.stringify(data);
      setTimeout(function(){network.POST("register",data,register_response,register_failed);},500)
    }
  }

  this.shutdown = function(){
    console.log(args.parent.appFullPath+" - shutdown...");
  }

  this.attach = function(){
    var chooser = utils.makeHTML(
      [{
        div:{
          id:"webshow_chooser",
          class:"container",
          children:[{
            h3:{
              id:"reg_message",
              innerHTML:"Create an account"
            }
          },{
            form:{
              class:"form",
              children:[{
                input:{
                  id:"reg_email",
                  type:"text",
                  placeholder:"email"
                }
              },{
                input:{
                  id:"reg_password",
                  type:"Password",
                  placeholder:"password"
                }
              },{
                input:{
                  id:"reg_confirm_pass",
                  type:"Password",
                  placeholder:"Confirm password"
                }
              },{
                button:{
                  id:"mode_watch",
                  type:"button",
                  innerHTML:"Register",
                  onclick:register
                }
              },
              {br:{}},
              {
                a:{
                  href:"#",
                  class:"signup",
                  innerHTML:"back",
                  onclick:function(){ back(true); }
                }
              }]
            }
          }]
        }
      }]);
    $("#webshow_wrapper").append(chooser);
    $(chooser).fadeOut(0);
    $(chooser).fadeIn(1500);
  }
});
