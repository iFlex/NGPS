loadAppCode("dialogue/dialogues/singleChoice",function(data){
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
    var dialogue = divContainer.addChild({autopos:true,width:rect.width*0.65,height:rect.height*0.75,background:"white",border_radius:["10px"],cssText:"margin-left:auto;margin-right:auto"});
    dialogue.rootParent = dlg;
    Dialogue.singleChoice.rootParent = dlg;

    var title = dialogue.addChild({autopos:true,width:"100%",height:"10%",background:"rgba(0,0,0,0.1)",cssText:"user-select: none;-moz-user-select: none;-khtml-user-select: none;-webkit-user-select: none;-o-user-select: none;"});
    title.DOMreference.innerHTML = descriptor.title;
    var body  = dialogue.addChild({autopos:true,width:"100%",height:"80%",background:"rgba(0,0,0,0)"});
    var close = dialogue.addChild({autopos:true,width:"100%",height:"10%",background:"rgba(255,0,0,0.5)",cssText:"vertical-align: middle;user-select: none;-moz-user-select: none;-khtml-user-select: none;-webkit-user-select: none;-o-user-select: none;"});

    close.extend(Interactive);
    close.interactive(true);
    close.DOMreference.innerHTML = "close";
    close.onTrigger = function(ctx,e) {
      ctx.parent.rootParent.discard();
    }
    body.DOMreference.style.overflowY = "scroll";
    for( i in descriptor.selection ){
        var desc = descriptor.selection_item;
        desc[0].button.innerHTML = descriptor.selection[i].label;
        console.log(desc);
        var button = utils.makeHTML(desc);
        body.DOMreference.appendChild(button);
        button.onclick = function(){Dialogue.singleChoice.hide();}
    }
    return dlg;
  }

  this.hide = function(){
    Dialogue.singleChoice.rootParent.discard();
  }
});
