loadAppCode("dialogue/dialogues/import",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.container = 0;
  data.parent.setPermissions(factory.UIpermissions);

  function onFileReceived(file){
    var reader = new FileReader();
    if( data.Dialogue.import.config.fileHandler )
      reader.onload = data.Dialogue.import.config.fileHandler;
    reader.readAsDataURL(file);
    data.Dialogue.import.hide();
  }

  function _change(){
    if( data.Dialogue.import.config.urlHandler )
      data.Dialogue.import.config.urlHandler(data.Dialogue.import.link.value);
  }

  function fileDialog(){
    data.Dialogue.import.input.click();
  }

  function close(){
    if(data.Dialogue.import.config.onCancel)
      data.Dialogue.import.config.onCancel();
    data.Dialogue.import.hide();
  }

  this.init = function(){
    console.log(data.parent.appFullPath+" - initialising...");
    data.Dialogue.import = this;
    this.container = factory.base.addChild({x:0,y:0,height:600,width:300,background:"rgba(0,0,0,0.65)",permissions:data.parent.getPermissions()});
    var ghostTable = utils.makeHTML([{
      div:{
        style:"display: table;width: 100%;height:100%;background:transparent"
      }
    }]);
    var divContainer = utils.makeHTML([{
      div:{
        class:"wrapper",
        style:"display: table-cell;text-align: center;vertical-align: middle;background:transparent"
      }}]);
    ghostTable.appendChild(divContainer);

    this.title = utils.makeHTML([{
      p:{
        style:"width:100%;border-radius:0px 0px 0px 0px;border-width:0px;text-align:center;background:transparent;color:white"
      }
    }]);

    this.link = utils.makeHTML([{
      input:{
        class:"main_input",
        onchange:_change,
        onpaste:_change,
        onkeydown:_change,
        placeholder:"URL",
        style:"width:100%;"
      }
    }]);
    this.buttons = [];
    for( var i = 0 ; i < 2; ++i ){
      this.buttons[i] = utils.makeHTML([{
      button:{
        class:"main_button glyphicon glyphicon-open",
        style:"width:100%;margin-bottom:5px",
      }}]);
      if(i == 0){
        this.buttons[i].onclick = fileDialog
        this.buttons[i].innerHTML = "Browse";
      } else {
        this.buttons[i].onclick = close;
        this.buttons[i].innerHTML = "x";
      }
    }
    var lnks = [this.title,this.link];
    for( i in this.buttons ){
      lnks.push(this.buttons[i]);
      lnks.push(utils.makeHTML([{br:{}}]))
    }

    utils.makeHTML(lnks,divContainer);
    this.container.DOMreference.appendChild(ghostTable);

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
  this.shutdown = function(){
    console.log("edit/components/importDialog - shutting down...");
    this.container.discard();
    this.parent.removeChild(this.input);
    delete data.Dialogue.import;
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
        this.container.putAt(pos.x * factory.root.czoomLevel,pos.y * factory.root.czoomLevel);
      }
      if(cfg.title)
        this.title.innerHTML = cfg.title;
      else
        this.title.innerHTML = "";
    }
  }
});
