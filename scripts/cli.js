/**
*	NGPS CLI
*	Author: Milorad Liviu Felix
*	12 Jun 2014  00:11 GMT
*/
//TODO: implement a way to refer to other objects when on a certain object
var gthis = this;
this.FPS = 0;
this.cli = {};
cli.status = 0;
//call system
cli.owner = 0;
cli.tocall = 0;
cli.params = [];
cli.global = 0;
//display
cli.maxHistory = 3;
cli.history = [];
//navigation
cli.node = {};
cli.node.UID = "-1";
cli.globalContext = this;

cli.showPrompt = function(message)
{
	cli.UIout.innerHTML += "<br>NGPS#"+cli.node.UID+":";
	if(message)
		cli.UIout.innerHTML += message;
	cli.UIout.scrollTop = cli.UIout.scrollHeight;
}

cli.show = function()
{
	console.log("CLI:: call to cli.show(); CLI status:"+cli.status);
	if(cli.status  == 0 )
	{
		//build the cli
		cli.status = 1;
		cli.UIfps = document.createElement("div");
		cli.UI = document.createElement("div");
		cli.UI.style.width = "400px";
		cli.UI.style.height = "500px";
		cli.UI.style.position = "fixed"
		cli.UI.style.top = "0px";
		cli.UI.style.right = "0px";
		cli.UI.style.background = "black";
		cli.UI.style.color = "white";
		cli.UI.style.opacity = "0.8";
		cli.UI.style.zIndex = "1000";
		//define in out channels
		//out
		cli.UIout = document.createElement('div');
		cli.UIout.style.height = "470px";
		cli.UIout.style.width = "%100";
		cli.UIout.background = "transparent";
		cli.UIout.style.overflowY = "scroll";
		//in
		cli.UIin  = document.createElement('input');
		cli.UIin.style.width = "99%";
		cli.UIin.style.color = "white";
		cli.UIin.style.bottom = "0px";
		cli.UIin.style.background = "transparent";
		cli.UIin.onkeypress= cli.keysHandler;
		//exec
		/*
		cli.UIdo = document.createElement('button');
		cli.UIdo.style.width = "100%";
		cli.UIdo.value = "Execute";
		cli.UIdo.addEventListener("click",cli.onExec);
		*/
		
		//add them to the parend UI
		cli.UI.appendChild(cli.UIout);
		cli.UI.appendChild(cli.UIin);
		cli.UI.appendChild(cli.UIfps)
		//cli.UI.appendChild(cli.UIdo);
		
		cli.UIout.innerHTML = "NGPS command line interface";
		cli.showPrompt();
		/*FPS = new FPSMeter(cli.UIfps);
		FPS.showDuration();*/
		console.log("CLI:: completed building the CLI UI");
	}
	if(cli.status == 2)
	{
		cli.UI.style.display = "block";
		cli.status = 1;
	}
	else
		document.body.appendChild(cli.UI);
}

cli.hide = function()
{
	console.log("CLI:: call to cli.hide(); CLI status:"+cli.status);
	if(cli.status == 1)
	{
		cli.UI.style.display = "none";
		cli.status = 2;
	}
}

cli.keysHandler = function(e)
{
	if(e.keyCode == 13)
		cli.onExec();
}

//TODO: limit history to a number of records
//		limit cli text entries to a number of lines
cli.onExec  = function()
{
	cli.showPrompt(cli.UIin.value);
	cli.execute(cli.UIin.value);
	cli.UIin.value = "";
	//cli.show();
	cli.UIout.scrollTop = cli.UIout.scrollHeight;
}

cli.fetchParameters = function(breakdown)
{
	delete cli.owner;
	try
	{
		cli.owner = eval(breakdown[0]);
	}
	catch( err )
	{
		return;
	}
	
	cli.tocall = breakdown[1];
	for(var i = 2 ; i < breakdown.length ; ++ i )
	{
		breakdown[i-2] = "cli.global = " + breakdown[i];
		try
		{
			eval(breakdown[i-2]);
		}
		catch(err)
		{
			cli.global = null;
		}

		cli.params[i-2] = cli.global;
		console.log("CLI:: parameter"+(i-2)+"="+cli.params[i-2]+" type "+typeof(cli.params[i-2]));
	}
}

cli.execute = function(str)
{
	console.log("CLI:: call to cli.execute(); command:"+str);
	cli.history[cli.history.length] = str;
	var breakdown = str.split(" ");
	
	if(breakdown[0] == "help" || breakdown[0] == "?" )
	{
		cli.help();
		return;
	}

	if(breakdown[0] == "sh") //show value of property
	{
		var property = eval(breakdown[1]);
		cli.UIout.innerHTML += "<br>"+property+"="+utils.debug(property,"<br>");
		return;
	}
	
	if(breakdown[0] == "set") //set value of property
	{
		eval(breakdown[1]+" = "+breakdown[2]);
		return;
	}

	//get params
	cli.fetchParameters(breakdown);
	//call
	var result = 0;
	if(cli.owner && cli.owner[cli.tocall])
	{
		try
		{
			result = cli.owner[cli.tocall](cli.params[0],cli.params[1],cli.params[2],cli.params[3],cli.params[4],cli.params[5]);
			//process result
			if(result)
			{
				//	cli.UIout.innerHTML += "<br>#"+result.UID;
				if(typeof(result) != "function")
				 cli.UIout.innerHTML += "<br>"+result+":"+utils.debug(result,"<br>");
			}
		} 
		catch ( err )
		{
			cli.UIout.innerHTML += "<br> ERROR:"+err;
		} 
	}
	else
	{
		if(!cli.owner)
			cli.UIout.innerHTML += "<br>ERROR: No such object '"+breakdown[0]+"'";
		else
			cli.UIout.innerHTML += "<br>ERROR:"+breakdown[0]+" does not have a function '"+breakdown[1]+"'";
	}
}

cli.shobjects = function (obj)
{
	if(!obj)
		obj = gthis;
	cli.UIout.innerHTML += "<br> Available objects:";
	for( k in obj )
		cli.UIout.innerHTML += "<br>"+k;
		
}

cli.help = function()
{
	cli.UIout.innerHTML += "<br>*** NGPS CLI help";
	cli.UIout.innerHTML += "<br> This interface works upon objects loaded into the JS engine";
	cli.UIout.innerHTML += "<br> To see a propety of an element use the 'sh' command.<br> sh cli.UI.style.width";
	cli.UIout.innerHTML += "<br> To set a propety of an element use the 'set' command.<br> set cli.UI.width 100";
	cli.UIout.innerHTML += "<br> To call a function you need to specify the owning object of the function, then the function name and then the parameters ( all separated by white spaces)";
	cli.UIout.innerHTML += "<br> example: cli.node setWidth 100";
	cli.UIout.innerHTML += "<br> To see available objects:<br> cli shobjects";
	cli.UIout.innerHTML += "<br> To see available members of an object:<br> cli shobjects <object_name> example: cli shobjects cli (shows the members of the cli object)";
	cli.UIout.innerHTML += "<br> The NGPS presentation is a tree of objects:";
	cli.UIout.innerHTML += "<br 	cli rst (resets the cli to the root node of the presentation)";
	cli.UIout.innerHTML += "<br> 	cli shtree ( shows the complete presentation tree)";
	cli.UIout.innerHTML += "<br> 	cli cn <node number> ( changes the cli to the specified node )";
	cli.UIout.innerHTML += "<br> 	cli sh ( shows the nodes related to the current node )";
	cli.UIout.innerHTML += "<br> 	To operate on the current node use cli.node <function_name> <parameters>";
	cli.UIout.innerHTML += "<br> 		cli.node move 10 0 (moves the node by 10 pixels to the right)";
	cli.UIout.innerHTML += "<br> To include a unit test: cli ldtest 'test_name' ";
	cli.UIout.innerHTML += "<br> To include a script: cli require 'script_name'";
	cli.UIout.innerHTML += "<br> The factory object is the one controlling object creation:";
	cli.UIout.innerHTML += "<br> eg: factory newContainer {x:0,y:0,width:100,height:100}";
	cli.UIout.innerHTML += "<br> Before inputing any execute: factory init";	
}

cli.shtree = function()
{
	function show( node, tabsize )
	{
		var type = " [ ";
			
		if( node.isLeaf == true )
			type += ".";
		if( node.isLink == true )
			type += "L"
		if( node.isApp == true )
			type += "A";
		var pos = node.getPos();
		type+=" x:"+pos.x+" y:"+pos.y+" w:"+node.getWidth()+" h:"+node.getHeight()+"]";

		cli.UIout.innerHTML += "<br>"+tabsize+"#"+node.UID+type;
		for( k in node.children )
			show( node.children[k], (tabsize+"_"));	
	}
	show(factory.root,"");
}

cli.sh = function( )
{
	if(cli.node.parent)
		cli.UIout.innerHTML += "<br>Parent:"+cli.node.parent.UID;
	
	cli.UIout.innerHTML += "<br>Current:"+cli.node.UID;
	cli.UIout.innerHTML += "<br>";
	for( k in cli.node.children )
		cli.UIout.innerHTML += " #"+cli.node.children[k].UID;
}

cli.cn = function ( id )
{
	function find( node, id )
	{
		if(node.UID == id )
		{
			cli.node = node;
			return;
		}
		for( k in node.children )
			find( node.children[k], id);	
	}
	find(factory.root,id);
}

cli.rst = function ( )
{
	cli.node = factory.root;
}

cli.ldtest = function ( test )
{
	return requirejs(['tests/'+test]);
}

cli.require = function ( scripts )
{
	return requirejs([scripts]);
}

cli.debugConfig = function()
{
	cli.execute("factory init");
	cli.execute("cli ldtest 'benchmark'");
	cli.execute('factory newGlobalApp "fps"');
}

cli.t = function()
{
	cli.execute("cli ldtest 'test_link'");
	cli.execute('factory newGlobalApp "link"');
}

function init()
{
	//requirejs(['fps'],cli.show);
	cli.show();
}
setTimeout(init,300);