/*
* Author: Milorad Liviu Felix
* 29 Apr 2015 14:05
*
* Driver that supports file system operation through a specific hosting method
* This is utilises a python server to service os level requests
*/

this.OSdriver = new (function(){
  this.fs = {};

  this.fs.list = function(callback,path){

  } 
  this.fs.save = function(callback,name,data){
    network.POST("save",data,function(){
      callback({success:false});
    },function(){
      callback({success:true});
    });
  }
  this.fs.saveChunked = function(callback,name, fragment, islast){

  }
  this.fs.load = function(callback,name){

  }
  this.fs.loadChunked = function(callback,name,size){

  }  
})();
