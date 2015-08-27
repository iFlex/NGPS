loadAppCode("_webshow/components/live/remote",function(args){
  this.config = {interface:"none"}
  this.init = function(){
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
            innerHTML:"Waiting for presentaiton to load on main device ...",
          }
        },{
          form:{
            id:"webshow_form_choose",
            class:"form",
            children:[{
              input:{
                id:"mode_present",
                type:"button",
                value:"Cancel",
                onclick:hideInterface
              }
            }]
          }
        //},{
        //  form:{
        //    id:"webshow_form_choose",
        //    class:"form",
        //    children:[{
        //      input:{
        //        id:"mode_present",
        //        type:"button",
        //        value:"Cancel",
        //      }
        //    }]
        //  }
        }]
      }
    }]);
    $("#webshow_wrapper").append(chooser);
    $(chooser).fadeOut(0);
    $(chooser).fadeIn(1000);
  }

  function hideInterface(){
    if(factory.session)
      factory.session.remoteInitialised = true;
    $('.wrapper').fadeOut(500);
  }

  this.shutdown = function(){
    GEM.removeEventListener("mouseUp",0,sendUpdate,this);
    GEM.removeEventListener("mouseMove",0,sendUpdate,this);
    GEM.removeEventListener("triggered",0,sendClick,this);
  }

  this.continue = function(){
    hideInterface();
    GEM.addEventListener("mouseUp",0,sendUpdate,this);
    GEM.addEventListener("mouseMove",0,sendUpdate,this);
    GEM.addEventListener("triggered",0,sendClick,this);
  }

  function sendClick(e){
    var data = {UID:e.target.UID};
    data.action = "doClick";
    args.live.send(data);
  }

  function sendUpdate(e){
    var data = {UID:e.target.UID};
    data.action = "do";
    var pos = e.target.getPos();
    data.x = pos.x;
    data.y = pos.y;
    args.live.send(data);
  }

});
