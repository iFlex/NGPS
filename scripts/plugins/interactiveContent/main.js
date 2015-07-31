loadAppCode("interactiveContent",function(data)
{
  this.config = {interface:"normal"};
  this.parent = data['parent'];
  this.url = data['url'];
  this.pCTL = 0;
  this.init = function(){
    console.log(this.parent.appPath+" - initialising. Params:"+utils.debug(data));

    var contentDesc = {src:this.url};
    if(data.width)
      contentDesc.width = data.width;
    if(data.height)
      contentDesc.height = data.height;

    this._save = contentDesc;
    this._save.url = this._save.src;

    this.pCTL = this.parent.addPrimitive({type:"iframe",adapt_container:true,content:contentDesc});
  }

  this.changeSource = function(link){
    this.url = link;
    this.pCTL.src = link;
    console.log("Changed source of container:"+this.parent.UID+":"+link);
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
