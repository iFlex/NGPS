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
    GEM.removeEventListener("mouseDown",0,forwardEvent,this);
    GEM.removeEventListener("mouseUp",0,forwardEvent,this);
    GEM.removeEventListener("mouseMove",0,forwardEvent,this);
    //GEM.removeEventListener("triggered",0,forwardEvent,this);
  }

  this.continue = function(){
    hideInterface();
    GEM.addEventListener("mouseDown",0,forwardEvent,this);
    GEM.addEventListener("mouseUp",0,forwardEvent,this);
    GEM.addEventListener("mouseMove",0,forwardEvent,this);
    //GEM.addEventListener("triggered",0,forwardEvent,this);
  }

  function forwardEvent(e){
    var exclude = {
      target:1,
      srcElement:1,
      path:1,
      toElement:1,
      currentTarget:1,
      relatedTarget:1,
      view:1
    };

    var event_data = {};
    event_data.event = e.event;
    event_data.target = e.target.UID;
    event_data.original = {};
    for( k in e.original_event )
      if(!exclude[k])
        event_data.original[k] = e.original_event[k];

    var data = {event:event_data,action:"event"};
    console.log("#### Forwarding event ####");
    console.log(e);
    console.log("#### PACKAGED ####");
    console.log(data);
    args.live.send(data);
  }
});
