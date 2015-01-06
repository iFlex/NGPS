this.factory = this.factory || {}
factory.setup = function(){
  factory.newGlobalApp('zoom',{offsetY:0});
  factory.newGlobalApp('_actions',{mode:'present'});
  console.log("Loaded view setup");
}
