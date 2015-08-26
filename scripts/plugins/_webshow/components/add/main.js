loadAppCode("_webshow/components/add",function(data){
  this.config = {interface:"none"}
  var remoteQr = 0;
  var audienceQr = 0;
  data.parent.setPermission('save',false);
	data.parent.setPermission('connect',false);
  data.parent.setPermission('noOverride',true);

  this.init = function(){
    console.log(data.parent.appFullPath+" - initialising...");
    require([data.parent.appPath+"/lib/qrcodedraw"]);
  }
  this.shutdown = function(){

  }

  function continueToPresentation(){
    remoteQr.tween({left:factory.base.getWidth()},1);
    audienceQr.tween({left:factory.base.getWidth()},1);

    $('#webshow_wrapper').fadeOut({duration:500,complete:function(){
      data.chaining.importer.app.show({
        title:"Choose presentation",
        fileHandler:function(e){data.chaining.loadFromFile(e.target.result);},
        urlHandler:function(){},
        target:factory.base
      });
    }});
  }

  this.continue = function(){
    continueToPresentation();
  }

  this.activate = function(remoteLink,audienceLink){
    factory.audience = audienceLink;
    factory.remote = remoteLink;

    remoteLink = network.getServerAddress()+"?R="+remoteLink;
    audienceLink = network.getServerAddress()+"?A="+audienceLink;
    webshow.live.setup({server:network.getServerAddress(),presentation:factory.presentation,audience:factory.audience});
    //addRemote = factory.base.addChild({x:0,y:0,width:"50%",height:"60%",background:"blue"});
    //addRemote.v
    //encode(remoteLink,addRemote.canvas.DOMreference,addRemote.getWidth(),addRemote.getHeight(),1);
    var height = $('.wrapper').height()*0.65;
    $('.wrapper').removeClass("form-success")

    remoteQr = factory.base.addChild({type:"canvas",x:factory.base.getWidth(),y:(factory.base.getHeight()-height)/2,width:height,height:height});
    audienceQr = factory.base.addChild({type:"canvas",x:factory.base.getWidth(),y:(factory.base.getHeight()-height)/2,width:height,height:height});
    var glyph = factory.base.addChild({type:"div",x:factory.base.getWidth()-height,y:(factory.base.getHeight()-height)/2,width:height,height:height});

    var chooser = utils.makeHTML(
    [{
      div:{
        id:"webshow_chooser",
        class:"container",
        children:[{
          h1:{
            innerHTML:"Use your phone to present"
          }
        },{
          h3:{
            innerHTML:"scan with your smartphone"
          }
        },{
          h5:{
            innerHTML:"Can't scan? Go to this location with your phone's browser"
          }
        },{
          h5:{
            innerHTML:remoteLink
          }
        },{
          form:{
            class:"form",
            children:[{
              input:{
                id:"mode_watch",
                type:"button",
                value:"Done",
                onclick:continueToPresentation
              }
            },{
              input:{
                id:"mode_watch",
                type:"button",
                value:"No thanks, i'll be sitting down",
                onclick:continueToPresentation
              }
            }]
          }
        }]
      }
    }]);
    $("#webshow_wrapper").append(chooser);
    $(chooser).fadeOut(0);
    $(chooser).fadeIn({duration:1000,complete:function(){remoteQr.tween({left:factory.base.getWidth()-height},1);}});
    encode(remoteLink,remoteQr.DOMreference,height,height,1);
    encode(audienceLink,audienceQr.DOMreference,height,height,1);
  }
});
