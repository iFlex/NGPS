//TODO: test cover functionality
var effects = new (function(){
  var effectSet = {};

  this.addEffects = function(fxset){
    for( fx in fxset ){
      effectSet[fx] = fxset[fx];
      effectSet[fx].fxname = fx;
    }
  }

  this.getEffects = function(){
    fxs = {};
    for( fx in effectSet ){
      fxs[fx] = {};
      fxs[fx].fxname = effectSet[fx].fxname;
      fxs[fx].name = effectSet[fx].name;
      fxs[fx].description = effectSet[fx].description;
    }
    return fxs;
  }

  this.getEffect = function(name){
    return effectSet[name];
  }

  this.onTrigger = function(btch){
    console.log("Execuing effects:");
    console.log(btch);
    if(btch.chaining){
      if( btch.chainIndex == undefined || btch.chainIndex > btch.effects.length )
        btch.chainIndex = 0;
      this.execut(btch.fx[btch.chainIndex++]);
    } else {
      for(i in btch.fx)
        this.execute(btch.fx[i]);
    }
  }

  this.execute = function(fx,onFinished){
    try {
      var c = findContainer(fx.UID);
      GEM.fireEvent({event:fx.fxname+"Start",target:c,info:fx});
      effectSet[fx.fxname].execute.call(c,fx.parameters,function(){
        GEM.fireEvent({event:fx.fxname+"End",target:c,info:fx});
        if(onFinished)
          onFinished();
      });

      if(c.cover)
        c.cover.discard();

    } catch(e)  {
      console.error("Could not execute fx",e)
    }
  }

  this.initialise = function(fx,isDelegate){
    try {
      effectSet[fx.fxname].initialise.call(findContainer(fx.UID),fx.initialState);
      if(isDelegate && !fx.cover){
        //need to initialise cover container
        var c = factory.base.addChild({x:0,y:0,width:"100%",height:"100%",background:transparent});
        c.cover = c;
        this.installRecord("triggered",c,fx);
        this.installTrigger("triggered",c,fx);
      }
    } catch(e)  {
      console.error("Could not execute fx",e)
    }
  }

  this.preview = function(fx){
    this.initialise(fx);
    this.execute(fx,function(){setTimeout(onFinished,1500);});
    var ctx = this;
    function onFinished(){
      if(!fx.initAtExecutionOnly)
        ctx.initialise(fx);
    }
  }

  this.externalPreview = function(trigger,triggerer,fxname,targetID){
    //need to find fx
    try{
      for( i in triggerer.effects[trigger].fx )
        if( triggerer.effects[trigger].fx[i].fxname == fxname && triggerer.effects[trigger].fx[i].UID == targetID )
        {
          this.preview(triggerer.effects[trigger].fx[i]);
          break;
        }
    } catch (e){
      console.error("Coult not perform preview of effect",e)
    }
  }

  this.installTrigger = function(trigger,triggerer){
    triggerer.addEventListener(trigger,function(e){
      try {
        effects.onTrigger(e.target.effects[trigger]);
      } catch(e){
        console.error("Could not execute effect trigger:"+trigger,e);
      }
    });
  }

  this.installTriggers = function(triggerer){
    if(!triggerer.effects)
      return;

    for( trigger in triggerer.effects ){
      this.installTrigger(trigger,triggerer);
    }
  }

  this.initialiseEffects = function(triggerer){
    if(!triggerer.effects)
      return;

    for( trigger in triggerer.effects ){
      for( i in triggerer.effects[trigger].fx){
        this.initialise(triggerer.effects[trigger].fx[i]);
      }
    }
  }

  this.uninstallEffects = function(triggerer){
    if(!triggerer.effects)
      return;

    for( trigger in triggerer.effects ){
      for( k in triggerer.effects[trigger].fx)
        this.uninstall(trigger,triggerer,triggerer.effects[trigger].fx[k]);
    }
  }

  this.uninstall = function(trigger,triggerer,fx){
    fxs = 0;
    try{
      console.log("Deleting:"+trigger+" trgr:"+triggerer.UID);
      console.log(fx);
      fxs = triggerer.effects[trigger];
      for( i in fxs.fx)
        if(fxs.fx[i].UID == fx.UID && fxs.fx[i].fxname == fx.fxname){
          console.log("DELETED");
          delete fxs.fx[i];
        }
      //clean effects bay for given trigger
      if( Object.keys(fxs.fx).length < 1 )
        delete triggerer.effects[trigger];

    }catch(e){
      console.error("Could not uninstall effect",e);
    }
    triggerer.removeEventListener(trigger);
  }

  this.installRecord = function(trigger,triggerer,fx){
    try{
      //initialise effects bay if empty
      if(!triggerer.effects)
        triggerer.effects = {};
      //initialise effects bay for specified trigger
      if(!triggerer.effects[trigger])
        triggerer.effects[trigger] = {
          delegated: false,
          chaining: false,
          chainIndex: 0,
          fx:[]
        };
      //check the effect is not present already
      for( i in triggerer.effects[trigger].fx)
        if( triggerer.effects[trigger].fx[i].fxname == fx.fxname && triggerer.effects[trigger].fx[i].UID == fx.UID)
          return {error:"Effect already exists"};
      //push passed effect to list
      triggerer.effects[trigger].fx.push(fx);
      return fx;
    } catch(e) {
      console.error("Could not add effect record to triggerer",e);
      return {error:"Sorry, something went wrong"};
    }
  }
  //default effects
  effectSet.move = {
    name:"move", //display name, fxname is the referencing one
    description:"This animation moves your container",
    install_steps:["Place your container in it's final position after the movement","Compelted!"],
    install:function(trigger,triggerer,target){
      var fx = {
        fxname:"move",
        UID:target.UID,
        parameters:[],
        initialState:{}
      }
      return effects.installRecord(trigger,triggerer,fx);
    },
    configure:function(fx){
      if(!fx.installIndex)
        fx.installIndex = 0;
      if(fx.installIndex == 0 ){
        //record initial state
        try {
            fx.initialState = findContainer(fx.UID).getPos();
        } catch (e) {}
      } else {
        try {
            fx.parameters.push(findContainer(fx.UID).getPos());
        } catch (e) {}
      }
      fx.installIndex++;
    },
    uninstall:function(trigger,triggerer,fx){
      effects.uninstall(trigger,triggerer,fx);
    },
    execute:function(params,onFinished){
      var pos = params[0];
      ctx = this;
      this.tween({top:pos.y,left:pos.x,onComplete:onFinished},1);
    },
    initialise:function(descriptor){
      this.putAt(descriptor.x,descriptor.y);
    }
  }

  effectSet["Focus Camera"] = {
    name:"Focus Camera", //display name, fxname is the referencing one
    description:"This animation focuses the camera on a container you select",
    install_steps:["Compelted!"],
    install:function(trigger,triggerer,target){
      var fx = {
        fxname:"Focus Camera",
        UID:target.UID,
        parameters:[],
        initialState:{}
      }
      return effects.installRecord(trigger,triggerer,fx);
    },
    configure:function(fx){
      if(!fx.installIndex)
        fx.installIndex = 0;
      fx.installIndex++;
    },
    uninstall:function(trigger,triggerer,fx){
      effects.uninstall(trigger,triggerer,fx);
    },
    execute:function(params,onFinished){
      factory.root.cfocusOn(this,{});
    },
    initialise:function(descriptor){

    }
  }

  effectSet["Fade In"] = {
    name:"Fade In", //display name, fxname is the referencing one
    description:"This animation focuses the camera on a container you select",
    install_steps:["Compelted!"],
    install:function(trigger,triggerer,target){
      var fx = {
        fxname:"Fade In",
        UID:target.UID,
        parameters:[],
        initialState:{},
        initAtExecutionOnly:true
      }
      return effects.installRecord(trigger,triggerer,fx);
    },
    configure:function(fx){
      if(!fx.installIndex)
        fx.installIndex = 0;
      fx.installIndex++;
    },
    uninstall:function(trigger,triggerer,fx){
      effects.uninstall(trigger,triggerer,fx);
    },
    execute:function(params,onFinished){
      $(this.DOMreference).fadeIn(1000,onFinished);
    },
    initialise:function(descriptor){
      $(this.DOMreference).fadeOut(0);
    }
  }
  effectSet["Fade Out"] = {
    name:"Fade Out", //display name, fxname is the referencing one
    description:"This animation focuses the camera on a container you select",
    install_steps:["Compelted!"],
    install:function(trigger,triggerer,target){
      var fx = {
        fxname:"Fade Out",
        UID:target.UID,
        parameters:[],
        initialState:{}
      }
      return effects.installRecord(trigger,triggerer,fx);
    },
    configure:function(fx){
      if(!fx.installIndex)
        fx.installIndex = 0;
      fx.installIndex++;
    },
    uninstall:function(trigger,triggerer,fx){
      effects.uninstall(trigger,triggerer,fx);
    },
    execute:function(params,onFinished){
      $(this.DOMreference).fadeOut(1000,onFinished);
    },
    initialise:function(descriptor){
      $(this.DOMreference).fadeIn(0);
    }
  }
  //initialise with proper name
  for( fx in effectSet )
    effectSet[fx].fxname = fx;
})();
