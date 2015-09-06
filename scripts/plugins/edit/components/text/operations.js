keyboard.interface = {};
keyboard.interface.originalHeight = 50;
keyboard.interface.textSize = 12;
keyboard.interface.maxTextSize = 500;
keyboard.interface.minTextSize = 5;
keyboard.interface.textChangeAm = 2;

keyboard.interface.subject = 0;
keyboard.interface.isBold = false;
keyboard.interface.isItalic = false;
keyboard.interface.align = "center";
keyboard.interface.indentationLevel = 0;

var _parent;
keyboard.interface.updateText = function()
{
	//for now change whole text size
	if(keyboard.interface.subject)
	{
		var e = document.getElementById('_InterfT_font');

		keyboard.interface.subject.style.color = keyboard.interface.current_color.style.background;
		keyboard.interface.subject.style.fontSize = keyboard.interface.textSize+"px";
		keyboard.interface.subject.style.fontStyle = (keyboard.interface.isItalic)?"italic":"";
		keyboard.interface.subject.style.fontWeight = (keyboard.interface.isBold)?"bold":"";
		keyboard.interface.subject.style.textAlign = keyboard.interface.align;

		document.getElementById('current_alignment').className = "glyphicon glyphicon-align-"+keyboard.interface.align;

		if(keyboard.interface.isBold) {
			$(_parent.bold.DOMreference).removeClass("btn-default");
			$(_parent.bold.DOMreference).addClass("btn-warning");
		} else {
			$(_parent.bold.DOMreference).removeClass("btn-warning");
			$(_parent.bold.DOMreference).addClass("btn-default");
		}

		if(keyboard.interface.isItalic) {
			$(_parent.italic.DOMreference).removeClass("btn-default");
			$(_parent.italic.DOMreference).addClass("btn-warning");
		} else {
			$(_parent.italic.DOMreference).removeClass("btn-warning");
			$(_parent.italic.DOMreference).addClass("btn-default");
		}

		if(keyboard.interface.subject.focus)
			keyboard.interface.subject.focus();
	}
}
keyboard.interface.onCurrentColorChanged = function(e)
{
	keyboard.interface.current_color.style.background = e.target.style.background;
	keyboard.interface.updateText();
	//TODO:notify parent
}
keyboard.interface.onTextEnlarged = function()
{
	if(keyboard.interface.textSize + keyboard.interface.textChangeAm <= keyboard.interface.maxTextSize)
		keyboard.interface.textSize += keyboard.interface.textChangeAm;
	keyboard.interface.updateText();
	//TODO:notify parent
}
keyboard.interface.onTextShrinked = function()
{
	if(keyboard.interface.textSize - keyboard.interface.textChangeAm >= keyboard.interface.minTextSize)
		keyboard.interface.textSize -= keyboard.interface.textChangeAm;
	keyboard.interface.updateText();
	//TODO:notify parent
}

keyboard.interface.onToggleBold = function(e)
{
	keyboard.interface.isBold = !keyboard.interface.isBold;
	keyboard.interface.updateText();
}

keyboard.interface.onToggleItalic = function(e)
{
	keyboard.interface.isItalic= !keyboard.interface.isItalic;
	keyboard.interface.updateText();
}
keyboard.interface.alignLeft = function(e)
{
	keyboard.interface.align = "left";
	keyboard.interface.updateText();
}
keyboard.interface.alignCenter = function(e)
{
	keyboard.interface.align = "center";
	keyboard.interface.updateText();
}
keyboard.interface.alignRight = function(e)
{
	keyboard.interface.align = "right";
	keyboard.interface.updateText();
}
keyboard.interface.alignJustified = function(e)
{
	keyboard.interface.align = "justify";
	keyboard.interface.updateText();
}
keyboard.interface.fonts = ["Arial","Times New Roman"];
keyboard.interface.palette = ["#000000","#ffffff","#9A0511","#273F27","#E8C03B","#E6A285","#E65665","#000000","#ffffff","#9A0511","#273F27","#E8C03B","#E6A285","#E65665","#000000","#ffffff","#9A0511","#273F27","#E8C03B","#E6A285","#E65665"];
keyboard.interface.init = function(parent){
	//bind events
	_parent = parent;
	parent.shrink.DOMreference.onclick = keyboard.interface.onTextShrinked;
	parent.enlarge.DOMreference.onclick = keyboard.interface.onTextEnlarged;
	parent.bold.DOMreference.onclick = keyboard.interface.onToggleBold;
	parent.italic.DOMreference.onclick = keyboard.interface.onToggleItalic;
	document.getElementById("_InterfT_alignLeft").onclick = keyboard.interface.alignLeft;
	document.getElementById("_InterfT_alignCenter").onclick = keyboard.interface.alignCenter;
	document.getElementById("_InterfT_alignRight").onclick = keyboard.interface.alignRight;
	document.getElementById("_InterfT_alignJustify").onclick = keyboard.interface.alignJustify;

	keyboard.interface.current_color = document.getElementById('current_color');
	keyboard.interface.current_color.style.background = keyboard.interface.palette[0];

	//alert("running...");
	var perWidth = 10;
	var currentNode = 0;
	var root = document.getElementById('color_palette');

	function cellSpace(){
		var spacing = document.createElement('td');
		spacing.className = "dropdown_cell_small";
		content.className = "color_preview";
		return spacing;
	}

	for(i in keyboard.interface.palette)
	{
		if(!i || i%perWidth == 0)
		{
			currentNode = document.createElement('tr');
			var space = document.createElement('tr');
			space.style.height = "2px";
			root.appendChild(currentNode);
			root.appendChild(space);
		}

		var currentCell = document.createElement('td');
		var content = document.createElement('div');
		content.style.background = keyboard.interface.palette[i];
		content.onclick = keyboard.interface.onCurrentColorChanged;
		currentCell.appendChild(content);

		currentNode.appendChild(cellSpace());
		currentNode.appendChild(currentCell);
		if(i%perWidth == perWidth-1)
			currentNode.appendChild(cellSpace())

	}
}
