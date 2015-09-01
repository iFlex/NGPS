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
    if(btch.chaining){
      if( btch.chainIndex == undefined || btch.chainIndex > btch.effects.length )
        btch.chainIndex = 0;
      this.execut(btch.effects[btch.chainIndex++]);
    } else {
      for(i in btch.effects)
        this.execute(btch.effects[i]);
    }
  }

  this.execute = function(fx){
    var efx = effectSet[fx.fxname];
    if(efx)
      if(efx.execute) {
        try {
          efx.execute.apply(findContainer(fx.target),fx.parameters);
        } catch(e)  {
          console.error("Could not execute fx",e)
        }
      }
  }
  this.initialise = function(fx,isDelegate){
    var efx = effectSet[fx.fxname];
    if(efx){
      if(efx.initialise) {
        try {
          efx.initialise.call(findContainer(fx.target),fx.initialState);
        } catch(e)  {
          console.error("Could not execute fx",e)
        }
      }
    }
  }

  this.preview = function(fx){
    //todo: record current state
    this.initialise(fx);
    this.execute(fx);
    //todo: need to bring back to original state after the effect ends
  }

  this.installTrigger = function(trigger,triggerer,target){
    triggerer.addEventListener(trigger,0,function(e){
      try {
        effects.onTrigger(triggerer.effects[trigger]);
      } catch(e){
        console.error("Could not execute effects for trigger:"+trigger,e);
      }
    },triggerer);
  }

  this.uninstall = function(trigger,triggerer,fx){
    fxs = 0;
    try{
      console.log("Deleting:"+trigger+" trgr:"+triggerer);
      console.log(fx);
      fxs = triggerer.effects[trigger];
      for( i in fxs.fx)
        if(fxs.fx[i].target == fx.target && fxs.fx[i].fxname == fx.fxname)
          delete fxs.fx[i];
      //clean effects bay for given trigger
      if( Object.keys(fxs.fx).length < 1 )
        delete triggerer.effects[trigger];

    }catch(e){
      console.error("Could not uninstall effect",e);
    }
    triggerer.removeEventListener(triggerer,0,0,triggerer);
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
        if( triggerer.effects[trigger].fx[i].fxname == fx.fxname && triggerer.effects[trigger].fx[i].target == fx.target)
          return {error:"Effect already exists"};
      //push passed effect to list
      triggerer.effects[trigger].fx.push(fx);
      return fx;
    }catch(e){
      console.log("Could not add effect record to triggerer",e);
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
        target:target.UID,
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
            fx.initialState = findContainer(fx.target).getPos();
        } catch (e) {}
      } else {
        try {
            fx.parameters.push(findContainer(fx.target).getPos());
        } catch (e) {}
      }
      fx.installIndex++;
    },
    uninstall:function(trigger,triggerer,fx){
      effects.uninstall(trigger,triggerer,fx);
    },
    execute:function(descriptor){
      descriptor.delay = 1;
      this.tween(descriptor);
    },
    initialise:function(descriptor){
      this.putAt(descriptor.x,descriptor.y);
    }
  }

  //initialise with proper name
  for( fx in effectSet )
    effectSet[fx].fxname = fx;
})();
