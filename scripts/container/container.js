/**
*	NGPS Container Class
*   Author: Milorad Liviu Felix
*	10 May 01:57 GMT
*	Dependencies:
*	GSAP library:
*		TweenLite Module
*/
this.containerIndex = 0;
this.container = function(properties)
{
	this.UID = 0;
	this.DOMreference = 0;
	this.DOMparent = 0;
	this.angle = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.properties = properties || {};
	this.isLeaf = false;
	this.child = 0;

	//INTERACTION
	//What to do with interaction events( In some cases it's necessary to pass them to the parent )
	this.propagation = "leaf";
	//event internals
	this.allowMove = false;
	this.lx = 0;
	this.ly = 0;

	//DOM manipulation
	this.load = function(parent)
	{

		if(this.DOMparent)
			return false;

		if(!parent)
			parent = document.body;

		this.UID = this.containerIndex++;
		this.DOMreference = document.createElement("div");
		this.DOMreference.setAttribute('id',this.UID);

		//testing
		this.DOMreference.style.width = (this.properties['width'] || "1")+"px";
		this.DOMreference.style.height = (this.properties['height'] || "1")+"px";
		this.DOMreference.style.position = 'absolute';
		this.DOMreference.style.overflow = "hidden";
		this.DOMreference.style.left = (this.properties['x'] || "0")+"px";
		this.DOMreference.style.top = (this.properties['y'] || "0")+"px";
		this.DOMreference.style.background = this.properties['background'] || "transparent";
		
		//border props
		this.DOMreference.style.borderWidth = (this.properties['border_size'] || "0")+"px";
		this.DOMreference.style.borderColor = (this.properties['border_color'] || "0x000000");
		this.DOMreference.style.borderStyle = (this.properties['border_type'] || "solid");
		//add reference of the current object in the DOM object
		this.DOMreference.parent = this;

		var borders = this.properties["border_radius"];

		for( var i=0; i < 4; ++i )
		{
			switch(i)
			{
				case 0:this.DOMreference.style.borderTopLeftRadius = (( borders && borders[i%borders.length] ) || "0px");break;
				case 1:this.DOMreference.style.borderTopRightRadius = (( borders && borders[i%borders.length] ) || "0px");break;
				case 2:this.DOMreference.style.borderBottomRightRadius = (( borders && borders[i%borders.length] ) || "0px");break;
				case 3:this.DOMreference.style.borderBottomLeftRadius = (( borders && borders[i%borders.length] ) || "0px");break;
			}
		}

		//append
		this.DOMparent = parent;
		this.DOMparent.appendChild(this.DOMreference);
		return true;
	}

	this.discard = function(bitch)
	{
		alert(this.DOMparent);
		
		console.log("Removing from:"+this.DOMparent);
		if(this.DOMparent)
			this.DOMparent.removeChild(this.DOMreference);
		
		this.DOMparent = null;
		delete this.DOMreference;
		delete this;
	}

	this.changeParent = function(parent)
	{
		if(!parent)
			parent = document.body;

		if( this.DOMparent && this.DOMreference)
		{
			this.DOMparent.removeChild(this.DOMreference);
			this.DOMparent = parent;
			this.DOMparent.appendChild(this.DOMreference);
			return true;
		}
		return false;
	}

	this.addPrimitive = function(descriptor)
	{
		if(!descriptor['type'])
			return false;

		this.isLeaf = true;
		this.child = document.createElement(descriptor['type']);
		
		if(descriptor['content'])
			for( k in descriptor['content'] )
				this.child.setAttribute(k, descriptor['content'][k]);

		if(descriptor['style'])
			for( k in descriptor['style'] )
				this.child.style.k = descriptor['style'][k];

		this.child.pointerEvents = "none";
		this.DOMreference.appendChild(this.child);
	}

	this.show = function()
	{
		this.DOMreference.style.display = "block";
	}

	this.hide = function()
	{
		this.DOMreference.style.display = "none";
	}

	//getters
	this.getWidth = function(w)
	{
		return this.DOMreference.clientWidth;
	} 

	this.getHeight = function(h)
	{
		return this.DOMreference.clientHeight;
	} 

	//setters
	this.setWidth = function(w)
	{
		TweenMax.to(this.DOMreference,0,{
			width:w,
		});
	} 

	this.setHeight = function(h)
	{
		TweenMax.to(this.DOMreference,0,{
			height:h,
		});
	}
	this.setAngle = function(angle)
	{
		this.angle = angle;
		TweenMax.to(this.DOMreference,0,{
			rotation:angle,
		});
	}

	//actuators
	this.move = function(dx,dy)
	{
		this.DOMreference.style.left = this.DOMreference.offsetLeft + dx + "px";
		this.DOMreference.style.top  = this.DOMreference.offsetTop  + dy + "px";
	}

	this.scale = function(amount)
	{
		this.scaleX = amount;
		this.scaleY = amount;
		TweenMax.to(this.DOMreference,0,{
			scaleX:amount,
			scaleY:amount,
		});
	}

	this.rotate = function(dangle)
	{
		this.setAngle(this.angle + dangle);	
	}

	//INTERACTION
	this.onMouseDown = function(e)
	{
		e.stopPropagation();
		this.parent.lx = e.clientX;
		this.parent.ly = e.clientY;
		this.parent.allowMove = true;
		console.log("MMouse Down("+this.parent.UID+")"+this+" / "+this.parent);
	}
	
	this.onMouseMove = function(e)
	{
		if(this.parent.allowMove)
		{
			//alert(this);
			console.log("Mouse Move("+this.parent.UID+")");
			this.parent.move(e.clientX - this.parent.lx , e.clientY - this.parent.ly );
			this.parent.lx = e.clientX;
			this.parent.ly = e.clientY;
		}
	}

	this.onMouseUp = function(e)
	{
		console.log("Mouse Up("+this.parent.UID+")");
		this.parent.allowMove = false;
	}

	this.draggable = function( d )
	{
		this.DOMreference.setAttribute('draggable', d);
		this.DOMreference.addEventListener('dragstart', this.onMouseDown, false);
  		this.DOMreference.addEventListener('dragenter', this.onMouseDown, false);
  		this.DOMreference.addEventListener('dragover',  this.onMouseMove, false);
  		this.DOMreference.addEventListener('dragleave', this.onMouseUp,   false);
  		this.DOMreference.addEventListener('dragend',   this.onMouseUp,   false);
  		this.DOMreference.addEventListener('drop',      this.onMouseUp,   false);
	}
}
