/**
*	NGPS Camera System
*	Author: Milorad Liviu Felix
*	30 May 2014 03:16 GMT
*	
*	Requirements:
*		Must be applied to an existing Container Object
*/

this.Camera = {};
//now adding camera specific functions
Camera.ctick = function()
{
	//general camera tick function
	//console.log("Camera tick:"+this.name);
}

Camera.cstart = function(interval)
{
	if(!this.cinterval)
	{
		//used for time based animations and corrections
		if(!interval || interval < 0 )
			interval = 32;

		this.cinterval = interval;
	}
	this.cticker = setInterval( Camera.ctick , this.cinterval );
}
Camera.cstop = function()
{
	if(this.cticker)
	{	
		clearInterval(this.cticker);
		this.cticker = 0;
	}
}

Camera.cmove = function(dx,dy)
{
	for( k in this.children )
		this.children[k].move(dx,dy);
}
Camera.onMoved = Camera.cmove;

Camera.czoom = function(cx,cy,amount)
{
	for( k in this.children )
		this.children[k].move(cx,cy,amount);	
}

Camera.crotate = function(cx,cy,amount)
{
	
}

Camera.cfocusOn = function(target)
{
	
}
