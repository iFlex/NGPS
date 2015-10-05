function _tmakeRandomText(length){
  token = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0;i<length;++i)
    token += possible.charAt(Math.floor(Math.random() * possible.length));
  return token;
}

var _dscrptr = {
  title:"test title",
  selection:[]
};
for( var i = 0 ; i < 1000; ++i ){
  _dscrptr.selection.push({label:_tmakeRandomText(1+Math.random()*10%10),callback:function(){}});
}

Dialogue.singleChoice.show(_dscrptr);
