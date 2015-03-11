/*
Adds trigger hooks, when a trigger happens a operation gets executed.
Enables animations and transitions
Author: Milorad Liviu Felix
11 Mar 2015  02:30 GMT

{UID:container}
to container the
coreography field will be added
_CGI:{
}
*/
this._CGI = this._CGI || {};
loadAppCode("_CGI",function(data){
  _CGI = this;
  this.config = {interface:"none"};
  this.parent = data['parent'];
  hasInterface = (data['mode'] == 'edit');
  Interface = 0;
  index = 0;
  bsz = 32;
  rad = bsz/2;
  controllers = {};
  txtstyle = "display: table-cell;vertical-align: middle;text-align: center;";
  horizontal = "display: inline-block; *display: inline; vertical-align: top;"
  bubstyle = "";
  fsstyle = "";
  animstyle = "";
  this.init = function(){
    if(hasInterface){
      Interface = factory.base.addChild({width:"100%",height:(bsz*1.2)+"px",x:"0px",bottom:"0%",background:"rgba(0,0,0,0.1)",cssText:"overflow:scroll;padding-left:5px;padding-top:3px"});
    }
  }
  function interfClick(e){
    factory.root.cfocusOn(e._CGI_CTL,{speed:1});
  }

  this.create = function(x,y){
    index++;
    var cld = factory.root.addChild({width:bsz,height:bsz,x:x,y:y,border_radius:[rad+"px"],border_size:2,background:"rgba(255,255,0,0.2)",style:txtstyle});
    cld.DOMreference.innerHTML = index;
    controllers[cld.i] = Interface.addChild({width:bsz,height:bsz,border_radius:[rad+"px"],border_size:2,autopos:true,background:"rgba(255,255,0,0.2)",style:txtstyle+horizontal});
    controllers[cld.i].DOMreference.innerHTML = index;
    cld.extend(Interactive);
    controllers[cld.i].extend(Interactive);
    cld.interactive(true);
    controllers[cld.i].interactive(true);
    controllers[cld.i].onTrigger = interfClick;
    controllers[cld.i]._CGI_CTL = cld;
  }
  this.setTarget = function(target){

  }
  this.getTriggers = function(){

  }
  this.destroy = function(){

  }

});
