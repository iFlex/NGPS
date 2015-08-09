/*
*	NGPS Benchmark Test
*	Author: Milorad Liviu Felix
*	15 Jun 2014  19:47 GMT
*/

var x = 0;
var y = 1;
var size = 120;
function nextSector(){
	y++;
	if(y > 6)
	{
		y=1;
		x++;
	}
}

this.benchmark = {};
benchmark.grid = function(nr)
{
	for(var i =0;i<nr;++i)
	{
		factory.newContainer({x:x*size,y:y*size,width:100,height:100},"rounded_rect")
		nextSector();
	}
}
benchmark.heavyGrid = function(nr)
{
	for(var i =0;i<nr;++i)
	{
		var elem = factory.newContainer({x:x*size,y:y*size,width:100,height:100},"rounded_rect")
		if(i%2)
			elem.DOMreference.innerHTML = "askjvhsakjfhaslkdfhasldkjalskjdlaskjdlkasjdlkajslkdsjalkdjasldkjaskjfhdlkhbaskjhflkasjdlkjasldkjsalkdjalkjdlkajsdlkajlkasjdlkasjda"
			//elem.addPrimitive({type:"p",content:{innerHTML:"as;kfjhs;fahlksjdbhf;kalhjsf;kajlhsfb;wih3poufwblskvjbaci;kesn bdlkvzjbklw;ejb;fkujlabs;jbc;kjdsn.kfj,mbvsdjkambfk.a,smbfkj.,bmsa.kj"}});
		else
			elem.addPrimitive({type:"img",adapt_content:true,content:{src:"./res/a.jpg"}});
		nextSector();
	}
}
benchmark.scroll = function(i,am)
{
	if(!i)
		i=30;
	if(!am)
		am = -1;
	function move(){
		factory.root.cmove(am,0)
		setTimeout(move,i)
	}
	move();
}

benchmark.rotate = function(i,am)
{
	if(!i)
		i=30;
	if(!am)
		am = 1;
	function rot(){
		factory.root.crotate(am*Math.PI/180)
		setTimeout(rot,i)
	}
	rot();
}

benchmark.zoom = function(i)
{
	if(!i)
		i=30;
	var zc = 0.99;
	function zm(){
		factory.root.czoom(zc);
		if(factory.root.czoomLevel < 0.05)
		{
			zc = 1.01;
			cli.showPrompt(" Benchmark zoom changed direction > ");
		}
		if(factory.root.czoomLevel > 10)
		{
			zc = 0.99;
			cli.showPrompt(" Benchmark zoom changed direction <");
		}
		setTimeout(zm,i)
	}
	zm();
}

benchmark.focusTest = function()
{
	for(var i =0;i<500;++i)
	{
		var o = factory.newContainer({x:x*size,y:y*size,width:100,height:100},"rounded_rect")
		o.onTrigger = function(ctx){ factory.root.cfocusOn(ctx);}
		nextSector();
	}
}

benchmark.link = function(nr,verbose){
	var childrenList = [];
	function getAllElements(node){
		childrenList.push(node);
		for( k in node.children )
			getAllElements(node.children[k]);
	}
	getAllElements(factory.root);

	linkData = {
		left_container_xreff:0.5,
		left_container_yreff:0.5,
		right_container_xreff:0.5,
		right_container_yreff:0.5,
		left_link_xreff:0,
		left_link_yreff:0.5,
		right_link_xreff:1,
		right_link_yreff:0.5,
	}
	console.log("Complete children list:"+utils.debug(childrenList));
	var cDescriptor = Descriptors.containers["rounded_rect"];
	cDescriptor['height'] = 5;
	choices = {}
	var left;
	var right;
	var ok = false;
	while(nr)
	{
		ok = false;
		while(!ok)
		{
			left = Math.floor((Math.random()*childrenList.length)%childrenList.length);
			right = Math.floor((Math.random()*childrenList.length)%childrenList.length);
			var key = left+" "+right;
			ok = !choices[key];
			choices[key] = true;
		}
		childrenList[left].link(
			childrenList[right],{
			container:cDescriptor,
			anchors:linkData
		});
		if(verbose)
		{
			alert("pairing:"+key);
			factory.root.cfocusOn(childrenList[left]);
		}
		nr--;
	}

}
