//TODO: needs to be made configurable: buttons should be able to be hidden, swapped, etc
this.Editor = this.Editor || {};
loadAppCode("edit/components/addVideo",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  Editor.videos = this;
  var midBody = 0;
  var link = 0;
  var mountPoint = 0;
  var vCTL = 0;
  var addFromURL = function(link,info)
  {
    if(!vCTL)
    {
      vCTL = mountPoint || Editor.dock.onAddContainer();
      vCTL.loadApp('video',{url:link});
      vCTL.src = link;
      //primitiveCTL = container.addPrimitive({type:'iframe',width:420,height:345,content:{src:link,width:"420",height:"345"}});
    }
    else
      if(vCTL.src != link)
        vCTL.changeSource(link);
  }
  var addFromFile = function(e)
  {
    var container = mountPoint || Editor.dock.onAddContainer();
    var img = container.addPrimitive({type:"iframe",adapt_container:true,content:{src:e.target.result}});
  }

  var fileDialog = function()
  {
    Editor.videos.input.click();
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
    Editor.videos.input = document.createElement("input");
    Editor.videos.input.type = "file";
    Editor.videos.input.multiple = "multiple"
    Editor.videos.input.display = "none";
    Editor.videos.input.onchange = function () {
      // assuming there is a file input with the ID `my-input`...
      var files = this.files;
      for (var i = 0; i < files.length; i++)
        loadFromDataURL(files[i]);
      };
      Editor.videos.parent.DOMreference.appendChild(Editor.videos.input);

      Editor.videos.interface = {};
      factory.root.addEventListener("triggered",Editor.videos.hide);
    }
    this.hide = function(){
      if(Editor.videos.container)
        Editor.videos.container.discard();
        Editor.videos.container = 0;
      }
      this.show = function(target,sp){
        if(target)
        {
          if(!target.hasChildren())
            mountPoint = target;
          }
          else
            target = factory.base;

            Editor.videos.container = factory.newContainer({width:"100%",height:"64px",background:"black"},"none",target);
            if(!sp)
              sp = (target.getHeight() - Editor.videos.container.getHeight())/2;
              Editor.videos.container.putAt(0,sp);
              //midBody = Editor.videos.container.addChild({height:"100%",background:"blue",cssText:"margin-left:auto;margin-right:auto"});
              midBody = factory.newContainer({height:"100%",background:"blue",cssText:"margin-left:auto;margin-right:auto"},"none",Editor.videos.container);
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
