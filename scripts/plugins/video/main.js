loadAppCode("video",function(data)
{
  this.config = {interface:"normal"};
  this.parent = data['parent'];
  var url = data['url'];
  var pCTL = 0;
  this.init = function(){
    pCTL = this.parent.addPrimitive({type:"iframe",adapt_container:true,content:{src:url}});
  }

  this.changeSource = function(link){
    url = link;
    pCTL.src = link;
  }

  this.run = function(){
    if( Editor && Editor.sizer )
      Editor.sizer.hide();
  }

  this.suspend = function(){
    if( Editor && Editor.sizer )
      Editor.sizer.show(this.parent);
  }

  this.shutdown = function(){

  }

});
