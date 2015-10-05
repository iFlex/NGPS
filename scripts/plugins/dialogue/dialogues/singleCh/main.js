loadAppCode("dialogue/dialogues/singleCh",function(data){
  this.config = {interface:"none"};
  data.parent.setPermissions(factory.UIpermissions);

  this.init = function(){
    console.log(data.parent.appFullPath);
    data.Dialogue.singleChoice = this;
  }
  this.shutdown = function(){
  }

  this.show = function(descriptor){
    console.log("Dialogue showing");
    console.log(descriptor);
    rect = platform.getScreenSize();
    var dlg = factory.base.addChild({x:0,y:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.75)",permissions:data.parent.getPermissions()});
    var ghostTable = dlg.addChild({autopos:true,width:"100%",height:"100%",background:"transparent",cssText:"display: table"});
    var divContainer = ghostTable.addChild({autopos:true,background:"transparent",cssText:"display: table-cell;text-align:center;vertical-align: middle"})
    var dialogue = divContainer.addChild({autopos:true,width:rect.width*0.65,autosize:true,background:"rgba(255,255,255,0.25)",border_radius:["10px"],cssText:"margin-left:auto;margin-right:auto"});
    var title = dialogue.addChild({autopos:true,width:"100%",autosize:true,background:"transparent",cssText:"font-size:20px;margin-bottom:10px;user-select: none;-moz-user-select: none;-khtml-user-select: none;-webkit-user-select: none;-o-user-select: none;"});
    var body  = dialogue.addChild({autopos:true,width:"100%",autosize:true,background:"rgba(0,0,0,0)", style:"max-height:"+factory.base.getHeight()*0.8+"px"});
    var close = dialogue.addChild({type:"button",class:"btn btn-danger",autopos:true,width:"100%",autosize:true,cssText:"margin-top:10px;vertical-align: middle;user-select: none;-moz-user-select: none;-khtml-user-select: none;-webkit-user-select: none;-o-user-select: none;"});

    Dialogue.singleChoice.rootParent = dlg;

    title.DOMreference.innerHTML = descriptor.title;
    close.DOMreference.innerHTML = "Close";
    close.DOMreference.onclick = function(){ Dialogue.singleChoice.hide();}
    body.DOMreference.style.overflowY = "scroll";
    for( i in descriptor.selection ){
        var child = body.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default",style:"margin-right:5px;margin-bottom:5px"});
        child.info = descriptor.selection[i];
        child.DOMreference.innerHTML = descriptor.selection[i].label;
        child.DOMreference.onclick = function(e){
          try{
            var ctx = e.target.context;
            ctx.info.callback(ctx.info);
          }catch(err){
            console.warn("Could not apply callback for selected item",err);
          }
          Dialogue.singleChoice.hide();
        }
    }

    return dlg;
  }

  this.hide = function(){
    Dialogue.singleChoice.rootParent.discard();
  }
});
