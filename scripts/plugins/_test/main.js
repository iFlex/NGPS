loadAppCode("_test",function(data){
  this.config = {interface:"none"},
  this.controller;
  this.tests = [
  {file:"test_ssDialogue"},
  {file:"test_apps"},
  {file:"test_camera"},
  {file:"test_cli"},
  {file:"test_container"},
  {file:"test_css"},
  {file:"test_edit"},
  {file:"test_factory"},
  {file:"test_gem"},
  {file:"test_link"},
  {file:"test_load"},
  {file:"test_regional"},
  {file:"test_save"},
  {file:"test_windowResize"},
  ]
  var testLocation = data.parent.appPath+"tests/";
  var parentDescriptor = {x:0,y:100,width:"20%",height:"50%",background:"rgba(0,0,0,0.5)"};
  var subitemDescriptor = { autopos:true,width:"100%",height:"10%",background:"rgba(100,100,100,0.5)"};

  function onClick(ctx,e){
    requirejs([testLocation+e.target.innerHTML]);
    ctx.discard();
  }

  this.init = function(){
    this.controller = factory.base.addChild(parentDescriptor)
    this.controller.extend(Interactive);
    this.controller.interactive(true);

    //load the tests
    for( i in this.tests ){
      var child = this.controller.addChild(subitemDescriptor);
      child.extend(Interactive);
      child.interactive(true);
      child.DOMreference.innerHTML = this.tests[i].file;
      child.onTrigger = onClick;
    }
  }
  this.shutdown = function(){

  }
});
