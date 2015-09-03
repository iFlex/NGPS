loadAppCode("interactiveContent",function(data)
{
  this.config = {interface:"normal"};
  this.parent = data['parent'];
  this.url = data['url'];
  this.pCTL = 0;
  this.init = function(){
    console.log(this.parent.appPath+" - initialising. Params:"+utils.debug(data));

    var contentDesc = {src:this.url}//,width:"100%",height:"100%"};
    this._store = contentDesc;
    this._store.url = this._store.src;

    this.pCTL = this.parent.addPrimitive({type:"iframe",glue_content:true,content:contentDesc});
  }

  this.changeSource = function(link){
    this.url = link;
    this.pCTL.src = link;
    this._store.url = link;
    console.log("Changed source of container:"+this.parent.UID+":"+link);
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
