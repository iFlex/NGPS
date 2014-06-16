/*
*	NGPS Benchmark Test
*	Author: Milorad Liviu Felix
*	15 Jun 2014  19:47 GMT
*/

var x = 0;
var y = 0;
var size = 120;
function nextSector(){
	y++;
	if(y > 6)
	{
		y=0;
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
benchmark.scroll = function(i)
{
	if(!i)
		i=30;
	function move(){
		factory.root.cmove(-1,0)
		setTimeout(move,i)
	}
	move();
}

benchmark.rotate = function(i)
{
	if(!i)
		i=30;
	function rot(){
		factory.root.crotate(Math.PI/180)
		setTimeout(rot,i)
	}
	rot();	
}

benchmark.zoom = function(i)
{
	if(!i)
		i=30;
	var zc = 1.1;
	function zm(){
		factory.root.czoom(zc);
		if(factory.root.czoomLevel < 0.05)
			zc = 1.01;
		if(factory.root.czoomLevel > 10)
			zc = 0.99;
		setTimeout(zm,i)
	}
	zm();
}