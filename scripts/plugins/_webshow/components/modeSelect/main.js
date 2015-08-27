loadAppCode("_webshow/components/modeSelect",function(args){
  this.config = {interface:"none"}
  args.parent.setPermission('save',false);
	args.parent.setPermission('connect',false);
  args.parent.setPermission('noOverride',true);

  this.init = function(){

  }
  this.shutdown = function(){

  }

  function loadSelectDialog(fileHandle,urlHandle){
    /*args.chaining.importer.app.show({
      title:"Choose presentation",
      fileHandler:fileHandle,
      urlHandler:function(){args.chaining.add.app.activate();},
      target:factory.base
    });*/
  }
  function initCreate(){
    $('#webshow_wrapper').fadeOut({duration:1500,complete:function(){factory.init("editor");}});
  }

  function initPresent(){
    function np_failed(){
      $('#webshow_info').html("Sorry :( something went wrong!)");
      $('.wrapper').removeClass("form-success")
      $('#webshow_form_choose').fadeIn({duration:500});
      //$('#webshow_chooser').fadeIn({duration:500});
    }
    function np_response(info){
      try {
        info = JSON.parse(info);
        if(info.success == true) {
          factory.session = {};
          factory.session.presentation = info.presentation;
          $('#webshow_chooser').fadeOut({duration:500});
          factory.session.rootDevice = info.rootDevice;
          args.chaining.add.app.activate(info.remote,info.audience);
          return;
        }
      } catch(e){
        console.log("Failed to create presentation:"+e);
      }
      np_failed();
    }
    $('#webshow_info').html("One moment...");
    $('#webshow_form_choose').fadeOut({duration:500,complete:function(){$('.wrapper').addClass('form-success');}});
    data = {token:factory.login.token,email:factory.login.useremail};
    data = JSON.stringify(data);
    setTimeout(function(){network.POST("newpresentation",data,np_response,np_failed);},1000);
  }

  function initWatch(){
    $('#webshow_wrapper').fadeOut({duration:1500});
    args.chaining.importer.app.show({
      title:"Choose presentation",
      fileHandler:function(e){args.chaining.loadFromFile(e.target.result);},
      urlHandler:function(){},
      onCancel:onCancel,
      target:factory.base
    });
  }

  function onCancel(){
    $('#webshow_wrapper').fadeIn({duration:500});
  }

  this.activate = function(){
    $('.wrapper').removeClass('form-success');
    $('#webshow_container').fadeOut(250);
    var chooser = utils.makeHTML(
    [{
      div:{
        id:"webshow_chooser",
        class:"container",
        children:[{
          h1:{
            id:"webshow_info",
            innerHTML:"Make some magic happen",
          }
        },{
          form:{
            id:"webshow_form_choose",
            class:"form",
            children:[{
              input:{
                id:"mode_present",
                type:"button",
                value:"Present",
                onclick:initPresent
              }
            },{
              input:{
                id:"mode_create",
                type:"button",
                value:"Create",
                onclick:initCreate
              }
            },{
              input:{
                id:"mode_watch",
                type:"button",
                value:"Watch",
                onclick:initWatch
              }
            }]
          }
        }]
      }
    }]);
    $("#webshow_wrapper").append(chooser);
    $(chooser).fadeOut(0);
    $(chooser).fadeIn(1000);
  }
});
