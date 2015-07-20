//TODO: fix linker issues with large containers ( it links with absurd positions)
this.Editor = this.Editor || {};

loadAppCode("edit/components/background",function(data){
  this.config = {interface:"none"};
  this.parent = data['parent'];
  this.parent.setPermission('save',false);
  this.parent.setPermission('connect',false);

  Editor.background = this;

  var temp = 0;
  this.isActive = false;

  this.toggle = function(ctx)
  {
    var app = ctx.app;
    app.isActive = !app.isActive;
    //change icon
    if(app.isActive)
    {
      ctx.DOMreference.style.background = "transparent";
      Editor.background.container.hide();
    }
    else
    {
      ctx.DOMreference.style.background = "rgba(255,255,255,0.5)";
      Editor.background.container.show();
    }
  }
  this.init = function() //called only one when bound with container
  {
    console.log(this.parent.appPath+" - initialising...");
    this.parent.onTrigger = this.toggle;
    this.parent.addPrimitive({type:"span",content:{class:"glyphicon glyphicon-picture"}});
    //prepare image from file import
    Editor.background.input = document.createElement("input");
    Editor.background.input.type = "file";
    Editor.background.input.multiple = "single"
    Editor.background.input.style.display = "none";
    Editor.background.input.onchange = function () {
      // assuming there is a file input with the ID `my-input`...
      var files = this.files;
      loadFromDataURL(files[0]);
    };
    Editor.background.parent.DOMreference.appendChild(Editor.background.input);

    buildInterface();

    this.toggle(this.parent);
  }

  this.shutdown = function() //called only when app is unloaded from container
  {
    console.log(this.parent.appPath+" - shutdown.");
  }

  var link = 0;
  var add = function(_link,info)
  {
    alert("adding bkg:"+_link);
    factory.root.DOMreference.style.backgroundImage="url('"+_link+"')";
    //addPrimitive({type:'img',content:{src:_link,style:"position:absolute;top:0px;left:0px"}});
  }

  var fileDialog = function()
  {
    Editor.background.input.click();
  }

  var loadFromDataURL = function(url)
  {
    var reader = new FileReader();
    reader.onload = function(e){add(e.target.result);};
    reader.readAsDataURL(url);
  }

  var _add = function()
  {
    if(link && link.value.length > 0)
      add(link.value);
  }

  function buildInterface()
  {
    Editor.background.container = factory.newContainer({width:"100%",height:"64px",background:"black",permissions:{save:false,connect:false}},"none",factory.base);
    var sp = 0;
    if(!sp)
      sp = (factory.base.getHeight() - Editor.background.container.getHeight())/2;
    Editor.background.container.putAt(0,sp);
      //midBody = Editor.background.container.addChild({height:"100%",background:"blue",cssText:"margin-left:auto;margin-right:auto"});
      midBody = factory.newContainer({height:"100%",background:"transparent",cssText:"margin-left:auto;margin-right:auto"},"none",Editor.background.container);
      midBody.DOMreference.style.width = "auto";
      utils.loadRawStyle(".adimgmrg{margin-right:10px;font-size:20px}");
      link = utils.makeHTML([{
        input:{
          class:"adimgmrg",
          onchange:_add,
          onpaste:_add,
          onkeydown:_add,
          placeholder:"URL",
          style:"width:100%;border-radius:0px 0px 0px 0px;border-width:0px;text-align:center;background:transparent"
        }
      }]);
      utils.makeHTML([link,{
        button:{
          class:"btn btn-success glyphicon glyphicon-open adimgmrg",
          onclick:fileDialog,
          style:"width:100%;border-radius:0px 0px 0px 0px;border-width:0px",
          children:[{
            i:{
              id:"#REG:EDIT_Add_BACKGROUND:innerHTML",
              innerHTML:"Browse",
            }
          }]
        }
      }],midBody.DOMreference);
      midBody.putAt((factory.base.getWidth() - midBody.getWidth())/2,0)
      //Regional.inspectObject(minBody);
      //Editor.background.container.hide();
  }
});
