//TODO: needs to be made configurable: buttons should be able to be hidden, swapped, etc
/*
https://www.youtube.com/watch?v=yeSJ2YdhG5k
https://youtu.be/yeSJ2YdhG5k
https://www.youtube.com/embed/yeSJ2YdhG5k
*/
this.Editor = this.Editor || {};
loadAppCode("edit/components/addVideo",function(data)
{
  this.config = {interface:"none"};
  this.parent = data['parent'];
  data.parent.setPermissions(factory.UIpermissions);

  Editor.videos = this;
  var vCTL = 0;

  var correctYoutubeLink = function(link){
    if(link.indexOf("https://www.youtube.com/") == 0 ||
       link.indexOf("http://www.youtube.com/") == 0  ||
       link.indexOf("http://youtu.be/") == 0         ||
       link.indexOf("https://youtu.be/") == 0        ){
       var find = "watch?v=";
       var point = link.indexOf(find);
       if( point != -1 )
          point += find.length;
       else
          point = link.lastIndexOf("/");

       var end = link.indexOf("&");
       if( end == -1 )
          end = link.length;

       return "https://www.youtube.com/embed/"+link.substring(point,end);
    }
    return link;
  }
  var addFromURL = function(link,info)
  {
    link = correctYoutubeLink(link);
    console.log("Adding video link:"+link);
    if(!vCTL)
    {
      vCTL = mountPoint || Editor.onAddContainer();
      vCTL.loadApp('interactiveContent',{url:link});
      vCTL.src = link;
      //primitiveCTL = container.addPrimitive({type:'iframe',width:420,height:345,content:{src:link,width:"420",height:"345"}});
      Editor.sizer.show(Editor.sizer.target);
    }
    else
      if(vCTL.src != link)
        vCTL.app.changeSource(link);
  }
  var addFromFile = function(e)
  {
    var container = mountPoint || Editor.onAddContainer();
    var img = container.addPrimitive({type:"iframe",adapt_container:true,content:{src:e.target.result}});
    Editor.sizer.show(container);
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

  this.init = function(){
    console.log("edit/components/addVideo - initialising...");
  }
  this.shutdown = function(){
    console.log("edit/components/addVideo - shutting down...");
    delete Editor.videos;
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

      Editor.keyBind.deactivate();
      Dialogue.import.show({
        fileHandler:addFromFile,
        urlHandler:addFromURL,
        target:target,
        onCancel:function(){Editor.keyBind.activate();}
      });

      vCTL = 0;
    }
});
