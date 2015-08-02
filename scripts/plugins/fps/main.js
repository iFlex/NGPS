loadAppCode("fps",function(data){
  this.config = {interface:"none"};
  var parent = data['parent'];
  var meter;
  function render(){
    meter.tick();
  }
  this.init = function(){
    parent.putAt(0,100);
    parent.setWidth(100);
    parent.setHeight(60);
    requirejs([parent.appPath+'api/fpsmeter.min'],function(){
      meter = new FPSMeter(parent.DOMreference,{ theme: 'light' });
      setInterval(render,20);
    });
  }
  this.shutdown = function(){
    //TODO
  }
});
