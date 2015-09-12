/*
* Author: Milorad Liviu Felix
* 29 Apr 2015 00:30
*
* Host module is an OS abstraction that allows the NGPS system to interacti with OS level functions
* This varies depending on what Host app solution is chosen for running the NGPS system
* requires a driver object
*/
var host = new (function(){
  //returns object with status = true | false and apps array
  this.getInstalledUserApps = function(callback){
    console.log("Listing installed apps");
      network.POST("list",{directory:"scripts/plugins"},function(data){
        console.log("APP DATA");
        console.log(data);
        data = JSON.parse(data);
        if(data.success == true){
          var leapps = [];
          for( i in data.apps ){
            leapps.push({
              name:data.apps[i],
              id:data.apps[i],
              //local:true
            })
          }
          callback(leapps);
          return;
        }
        callback();
      },function(){callback();});
  }
  this.getUserName = function(callback){

  }
  this.save = function() {
    network.POST("save",data,function(){
      callback({success:false});
    },function(){
      callback({success:true});
    });
  }
})();
