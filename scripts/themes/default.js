 //standard for writting AMS
//upon tick you receive:
//		the applied settings 		         data
//		a reference to the settings          set
//		a reference to state storage space   store ( which points to your AMS object therefore don't override keywords: tick and init )

this.factory = this.factory || {};
//have custom AMS
factory.AMS = {
	maxWidth  : 500,
	maxHeight : 500,
	minWidth  : 100,
	minHeight : 100,
	direction : -50,
	index     :   0,
	generate : function( parent, set, store){
		var r,g,b;
		r = Math.floor(Math.random()*1000%256);
		g = Math.floor(Math.random()*1000%256);
		b = Math.floor(Math.random()*1000%256);
		set.background = "rgb("+r+","+g+","+b+")";
	}
}
