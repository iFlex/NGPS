/*
* Author: Milorad Liviu Felix
* 29 Apr 2015 00:30
*
* Host module is an OS abstraction that allows the NGPS system to interacti with OS level functions
* This varies depending on what Host app solution is chosen for running the NGPS system
* requires a driver object
*/
this.host = new (function(){
  this.fs = {};

  this.fs = OSdriver.fs;
  //returns object with status = true | false and apps array
  this.getInstalledUserApps = function(callback){
    if(callback)
      callback({success:true,apps:[{name:"collision",local:true},{name:"debug",local:false,global:true},{name:"fps",local:false,global:true},{name:"2048",local:true,global:false}]});
  }
  
  this.getUserName = function(callback){

  }
  
})();
