//the interface
keyboard.buildTextInterface = function(parent){
  parent.shrink = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
  parent.shrink.DOMreference.innerHTML = "a";

  parent.enlarge = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
  parent.enlarge.DOMreference.innerHTML = "A";

  parent.color = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default",background:"repeating-linear-gradient(\
  45deg,\
  #cccccc,\
  #cccccc 10px,\
  #ffffff 10px,\
  #ffffff 20px)"});

  parent.color.DOMreference.innerHTML = '<li class="dropdown textinterfT">\
    <a href="#" class="dropdown-toggle" data-toggle="dropdown">\
      <table>\
        <tr>\
          <td><div id="current_color" class="color_preview"></div></td>\
          <td><span class="caret"></td>\
        </tr>\
      </table>\
    </a>\
    <ul id="dropdown_menu_color" class="dropdown-menu" role="menu">\
      <table id="color_palette"></table>\
    </ul>\
  </li>';

  parent.bold = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
  parent.bold.DOMreference.innerHTML = "B";

  parent.italic = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default italic"});
  parent.italic.DOMreference.innerHTML = "I";

  parent.align = parent.addChild({type:"button",autopos:true,autosize:true,class:"btn btn-default"});
  parent.align.DOMreference.innerHTML = '<li class="dropdown textinterfT">\
    <a href="#" class="dropdown-toggle" data-toggle="dropdown">\
      <span id="current_alignment" class="glyphicon glyphicon-align-left"></span>\
    </a>\
    <span class="caret"></span>\
    <ul id="dropdown_menu_align" class="dropdown-menu dropdown-menu-right" role="menu">\
      <center>\
        <table>\
          <tr>\
            <td class="dropdown_cell">\
              <li>\
                <a id="_InterfT_alignLeft" href="#">\
                  <span class="glyphicon glyphicon-align-left"></span>\
                </a>\
              </li>\
            </td>\
            <td class="dropdown_cell">\
              <li>\
                <a id="_InterfT_alignCenter" href="#">\
                  <span class="glyphicon glyphicon-align-center"></span>\
                </a>\
              </li>\
            </td>\
            <td class="dropdown_cell">\
              <li>\
                <a id="_InterfT_alignRight" href="#">\
                  <span class="glyphicon glyphicon-align-right"></span>\
                </a>\
              </li>\
            </td>\
            <td class="dropdown_cell">\
              <li>\
                <a id="_InterfT_alignJustify" href="#">\
                  <span class="glyphicon glyphicon-align-justify"></span>\
                </a>\
              </li>\
            </td>\
          </tr>\
        </table>\
      </center>\
    </ul>\
  </li>';

}
