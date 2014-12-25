//TODO: needs to be made configurable: buttons should be able to be hidden, swapped, etc
this.Editor = this.Editor || {};
loadAppCode("edit/components/addImage",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  Editor.images = this;
  var midBody = 0;
  var link = 0;
  var mountPoint = 0;
  var primitiveCTL = 0;
  var addFromURL = function(link,info)
  {
    if(!primitiveCTL)
    {
      var container = mountPoint || Editor.dock.onAddContainer();
      primitiveCTL = container.addPrimitive({type:"img",adapt_container:true,content:{src:link}});
    }
    else
      if(primitiveCTL.src != link)
        primitiveCTL.src = link;

    //Editor.images.hide();
  }

  var addFromFile = function(e)
  {
    var container = mountPoint || Editor.dock.onAddContainer();
    var img = container.addPrimitive({type:"img",adapt_container:true,content:{src:e.target.result}});
    //Editor.images.hide();
  }

  var fileDialog = function()
  {
    Editor.images.input.click();
  }

  var loadFromDataURL = function(url)
  {
    var reader = new FileReader();
    reader.onload = addFromFile;
    reader.readAsDataURL(url);
  }
  var _add = function(){
    if(link && link.value.length > 0)
      addFromURL(link.value);
  }

  this.init = function(){
    //prepare image from file import
    Editor.images.input = document.createElement("input");
    Editor.images.input.type = "file";
    Editor.images.input.multiple = "multiple"
    Editor.images.input.display = "none";
    Editor.images.input.onchange = function () {
      // assuming there is a file input with the ID `my-input`...
      var files = this.files;
      for (var i = 0; i < files.length; i++)
        loadFromDataURL(files[i]);
      };
    Editor.images.parent.DOMreference.appendChild(Editor.images.input);

    Editor.images.interface = {};
    factory.root.addEventListener("triggered",Editor.images.hide);
  }
  this.hide = function(){
    if(Editor.images.container)
      Editor.images.container.discard();
    Editor.images.container = 0;
  }
  this.show = function(target,sp){
    if(target)
    {
      if(!target.hasChildren())
        mountPoint = target;
    }
    else
      target = factory.base;

    Editor.images.container = factory.newContainer({width:"100%",height:"64px",background:"black"},"none",target);
    if(!sp)
      sp = (target.getHeight() - Editor.images.container.getHeight())/2;
    Editor.images.container.putAt(0,sp);
    //midBody = Editor.images.container.addChild({height:"100%",background:"blue",cssText:"margin-left:auto;margin-right:auto"});
    midBody = factory.newContainer({height:"100%",background:"blue",cssText:"margin-left:auto;margin-right:auto"},"none",Editor.images.container);
    midBody.DOMreference.style.width = "auto";
    utils.loadRawStyle(".adimgmrg{margin-right:10px;font-size:20px}");
    link = utils.makeHTML([{
      input:{
        class:"adimgmrg",
        onchange:_add,
        onpaste:_add,
        onkeydown:_add,
        placeholder:"URL"
      }
    }]);
    utils.makeHTML([link,{
      button:{
        class:"glyphicon glyphicon-open adimgmrg",
        onclick:fileDialog,
        children:[{
          i:{
            id:"#REG:EDIT_Add_Picture:innerHTML",
            innerHTML:"Browse"
          }
        }]
      }
    }],midBody.DOMreference);
    midBody.putAt((target.getWidth() - midBody.getWidth())/2,0)
    //Regional.inspectObject(minBody);
  }
});
