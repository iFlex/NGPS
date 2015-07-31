this.Editor = this.Editor || {};
loadAppCode("edit/components/importDialog",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.setPermission('save',false);
  this.parent.setPermission('connect',false);
  this.container = 0;
  this.config = {}
  Editor.importDialog = this;

  this.setTitle = function(str){

  }

  this.setCallback = function(){

  }

  function onFileReceived(file){
    var reader = new FileReader();
    if( Editor.importDialog.config.fileHandler )
      reader.onload = Editor.importDialog.config.fileHandler;
    reader.readAsDataURL(file);
  }

  function _change(){
    if( Editor.importDialog.config.urlHandler )
      Editor.importDialog.config.urlHandler(Editor.importDialog.link.value);
  }

  function fileDialog(){
    Editor.importDialog.input.click();
  }

  function close(){
    Editor.importDialog.hide();
  }

  this.init = function(){
    console.log("edit/components/importDialog - initialising...");
    this.container = factory.base.addChild({x:0,y:0,height:600,width:300,background:"rgba(0,0,0,0.4)"});
    this.link = utils.makeHTML([{
      input:{
        class:"adimgmrg",
        onchange:_change,
        onpaste:_change,
        onkeydown:_change,
        placeholder:"URL",
        style:"width:100%;border-radius:0px 0px 0px 0px;border-width:0px;text-align:center;background:transparent"
      }
    }]);
    this.buttons = [];
    for( var i = 0 ; i < 2; ++i ){
      this.buttons[i] = utils.makeHTML([{
      button:{
        class:"btn btn-success glyphicon glyphicon-open",
        style:"width:100%;border-radius:0px 0px 0px 0px;border-width:0px",
      }}]);
      if(i == 0){
        this.buttons[i].onclick = fileDialog
        this.buttons[i].innerHTML = "Browse";
      } else {
        this.buttons[i].onclick = close;
        this.buttons[i].innerHTML = "x";
      }
    }
    var lnks = [this.link];
    for( i in this.buttons )
      lnks.push(this.buttons[i]);

    utils.makeHTML(lnks,this.container.DOMreference);

    this.input = document.createElement("input");
    this.input.type = "file";
    this.input.multiple = "multiple"
    this.input.display = "none";
    this.input.onchange = function () {
      // assuming there is a file input with the ID `my-input`...
      var files = this.files;
      for (var i = 0; i < files.length; i++)
        onFileReceived(files[i]);
    };
    this.parent.DOMreference.appendChild(this.input);
    this.hide();
  }

  this.hide = function(){
    if(this.container)
      this.container.hide();
  }

  this.show = function(cfg){
    this.link.value = "";
    if(cfg)
      this.config = cfg;
    if(this.container) {
      this.container.show();
      if(this.config.target){
        var pos = this.config.target.local2global(0,0);
        this.container.setWidth(this.config.target.getWidth());
        this.container.setHeight(this.config.target.getHeight());
        this.container.putAt(pos.x,pos.y);
      }
    }
  }
});
