/**
*	NGPS CLI
*	Author: Milorad Liviu Felix
*	12 Jun 2014  00:11 GMT
*/

//TODO: implement a way to refer to other objects when on a certain object

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

cli.showPrompt = function()
{
	cli.UIout.innerHTML += "<br>NGPS#"+cli.node.UID+":";
}

cli.show = function()
{
	console.log("CLI:: call to cli.show(); CLI status:"+cli.status);
	if(cli.status  == 0 )
	{
		//build the cli
		cli.status = 1;
		cli.UI = document.createElement("div");
		cli.UI.style.width = "400px";
		cli.UI.style.height = "500px";
		cli.UI.style.top = "0px";
		cli.UI.style.left = "0px";
		cli.UI.style.background = "black";
		cli.UI.style.color = "white";
		cli.UI.style.opacity = "0.8";
		cli.UI.style.zIndex = 1000;
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
		//cli.UI.appendChild(cli.UIdo);
		
		cli.UIout.innerHTML = "NGPS command line interface";
		cli.showPrompt();
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
	cli.UIout.innerHTML += cli.UIin.value;
	cli.execute(cli.UIin.value);
	cli.showPrompt();
	cli.UIin.value = "";
	cli.show();
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
			if(result && result.UID)
				cli.UIout.innerHTML += "<br>#"+result.UID;
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

cli.shtree = function()
{
	function show( node, tabsize )
	{
		cli.UIout.innerHTML += "<br>"+tabsize+"#"+node.UID;
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
	for( k in cli.node.children )
		if( cli.node.children[k].UID == id )
		{
			cli.node = cli.node.children[k];
			return;
		}	

	if(cli.node.parent && cli.node.parent.UID)
		cli.node = cli.node.parent;
}

cli.rst = function ( )
{
	cli.node = factory.root;
}

function init()
{
	cli.show();
}
setTimeout(init,1000);