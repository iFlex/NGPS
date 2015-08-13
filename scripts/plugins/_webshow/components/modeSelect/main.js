loadAppCode("_webshow/components/modeSelect",function(data){
  this.config = {interface:"none"}
  this.init = function(){

  }
  this.shutdown = function(){

  }

  function loadSelectDialog(fileHandle,urlHandle){
    /*data.chaining.importer.app.show({
      title:"Choose presentation",
      fileHandler:fileHandle,
      urlHandler:function(){data.chaining.add.app.activate();},
      target:factory.base
    });*/
  }
  function initCreate(){
    $('#webshow_wrapper').fadeOut({duration:1500,complete:function(){factory.init("editor");}});
  }

  function initPresent(){
    $('#webshow_chooser').fadeOut({duration:1500});
    data.chaining.add.app.activate();
  }

  function initWatch(){
    $('#webshow_wrapper').fadeOut({duration:1500});
    data.chaining.importer.app.show({
      title:"Choose presentation",
      fileHandler:function(e){data.chaining.loadFromFile(e.target.result);},
      urlHandler:function(){},
      target:factory.base
    });
  }
  this.activate = function(){
    $('#webshow_container').fadeOut(250);
    var chooser = utils.makeHTML(
    [{
      div:{
        id:"webshow_chooser",
        class:"container",
        children:[{
          form:{
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
