loadAppCode("interactiveContent",function(data)
{
  this.config = {interface:"normal"};
  this.parent = data['parent'];
  var url = data['url'];
  var pCTL = 0;
  this.init = function(){
    console.log(this.parent.appPath+" - initialising. Params:"+utils.debug(data));

    var contentDesc = {src:url};
    if(data.width)
      contentDesc.width = data.width;
    if(data.height)
      contentDesc.height = data.height;

    this._save = contentDesc;
    this._save.url = this._save.src;

    pCTL = this.parent.addPrimitive({type:"iframe",adapt_container:true,content:contentDesc});
  }

  this.changeSource = function(link){
    url = link;
    pCTL.src = link;
  }

  this.run = function(){
    if( Editor && Editor.sizer )
      Editor.sizer.hide(),console.log("HIDE ED");
  }

  this.suspend = function(){
    if( Editor && Editor.sizer )
      Editor.sizer.show(this.parent),console.log("SHOW ED");
  }

  this.shutdown = function(){

  }

});
