/**
*	NGPS Drivers
* 	Author: Milorad Liviu Felix
*	30 May 2014 07:13 GMT
*/
var utils = {};
utils.merge = function(a,b,override){
	var nw = {}
	for( k in a)
		nw[k] = a[k];

	for( k in b )
	{
		if(nw.hasOwnProperty(k))
			if( !override )
				continue;

		nw[k] = b[k];
	}
	return nw;
}
utils.clearHTML = function(markup)
{
	var node = markup.firstChild;
	while(node)
	{
		console.log("Clearing:"+node);
		var ns = node.nextSibling;
		markup.removeChild(node);
		node = ns;
	}
}
utils.makeHTML = function(markup,parent)
{
	var child;
	for( i in markup )
	{
		if(!markup[i]._noParse)
		{
			var type = Object.keys(markup[i])[0];
			child = document.createElement(type);
			keys = markup[i][type];

			for( j in keys )
			{
				if(j != "children")
				{
					if(j.indexOf("data-") > -1)
					{
						var attrib = j.slice(5, j.length);
						child.dataset[attrib] = markup[i][type][j]
						continue;
					}
					if(j == "class")
					{
						child.className = markup[i][type][j];
						continue;
					}
					//style
					if(j == "style" || j == "cssText")
					{
						child.style.cssText = markup[i][type][j];
						continue;
					}
					//normal properties
					child[ j ] = markup[i][type][j];
				}
				else
					utils.makeHTML(markup[i][type][j],child);
			}
		}
		else
			child = markup[i];

		if(!parent)
		{
			child._noParse = true;
			return child;
		}

		parent.appendChild(child);
	}
}
utils.validateEmail = function(email)
{
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
utils.redFlagField = function(field)
{
	field.style.border = "2px solid";
	field.style.borderColor = "red";
}
utils.normaliseField = function(field)
{
	field.style.border = "0px";
}

utils.loadStyle = function(path,onload)
{
	var link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('type', 'text/css');
	link.setAttribute('href', path);

	if(typeof onload === 'function')
		link.onload = onload

	document.getElementsByTagName('head')[0].appendChild(link);
}

utils.loadScript = function(path,onload){
	var script = document.createElement("script");
	script.src = path;

	if(typeof onload === 'function')
		script.onload = onload

	document.getElementsByTagName('head')[0].appendChild(script);
}

utils.loadRawStyle = function(style)
{
	var s = document.createElement('style');
	s.innerHTML = style;
	document.getElementsByTagName('head')[0].appendChild(s);
}

utils.sDeepDebug = function( node, spcs ){
	var str = "";
	var struct = "";
	var cstruct = "";
	var willEnter = false;
	if(!spcs)
		spcs = "";

	if( typeof(node) == "object" )
	{
		struct = "{";
		cstruct = "}";

		if( node instanceof Array )
		{
			struct = "[";
			cstruct = "]";
		}
		willEnter = true;
	}

	str += spcs+struct+((willEnter)?"\n":"");
	if(typeof(node) != "object")
	{
		if( typeof(node) == "function" )
			return spcs+"* function *";

		str += spcs + node;
	}
	else {

		if(node && node._visited)
			return "#CYCLIC REFERENCE HERE#";

		for( k in node){
			if( k == "DOMreference" || k == "parent" )
				continue;

			if( node instanceof Array )
				str += spcs; //+ this.sDeepDebug(node[k],spcs+" ")+",\n";
			else
				str += spcs + k + ":";

			if( typeof(node[k]) == "object" )
				str += this.sDeepDebug(node[k],spcs+" ")+",\n";
			else
				str += ((typeof(node[k]) == "function")?"function":node[k])+"\n";
		}
		if(node && typeof(node) == "object")
			node._visited = true;
	}
	str += spcs+cstruct+((willEnter)?"\n":"");
	return str;
}
utils.debug = function(elem,newline,verbose)
{
	if(elem == undefined || elem == null)
		return;

	if(!newline)
		newline = "\n";

	if(typeof(elem) == "string" || typeof(elem) == "number")
		return "";

	var str = "{"
	if(typeof(elem) == "object" && elem.hasOwnProperty('UID'))
		str+= " NGPS Container #"+elem.UID+"}"+newline;
	else
	{
		for( k in elem )
		{
			str += k + ":";
			if(typeof(elem[k]) != "function" )
			{
				//if((typeof(elem) == "string" || typeof(elem) == "number" || typeof(elem) == "boolean") && verbose )
					str += elem[k]
				if(verbose)
					str += utils.debug(elem[k],newline,verbose)+" ";
				else
				{
					if(elem[k] && elem[k].hasOwnProperty("UID"))
						str += "("+elem[k].UID+")";
				}
				str += newline;
			}
			//else
			//	str += utils.debug(elem[k])+" ";
		}
	}
	str += "}"+newline
	return str;
}
utils.whois = function(elem)
{
	if(!elem)
		return "Unknown";
	return elem.UID;
}

this.platform = {};
platform.os = "unknown";
platform.isMobile = "false";

platform.setup = function(root){
	platform.NGPS_REF_CANVAS = document.createElement("canvas");
	platform.NGPS_REF_CANVAS.style.cssText = "position:fixed;width:100%;height:100%;min-height:100%;"
	root.appendChild(platform.NGPS_REF_CANVAS);
}

platform.getScreenSize = function(){
	return { height:platform.NGPS_REF_CANVAS.clientHeight, width:platform.NGPS_REF_CANVAS.clientWidth }
}

platform.detectOS = function(){
	platform.isMobile = false;
	function detect (a)
	{
		if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
			platform.isMobile = true;
	}
	detect(navigator.userAgent||navigator.vendor||window.opera);
	console.log("IsMobile:"+platform.isMobile);
}

platform.detectOS();
