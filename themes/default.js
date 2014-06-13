//standard for writting AMS
//upon tick you receive:
//		the applied settings 		         data
//		a reference to the settings          set
//		a reference to state storage space   store ( which points to your AMS object therefore don't override keywords: tick and init )

this.factory = this.factory || {};
//keep default factory init
//have custom AMS
factory.AMS = {
	maxWidth : 500,
	maxHeight : 500,
	minWidth : 100,
	minHeight : 100,
	direction : -50,
	index:0,
	palette: ["#AB9EAD","#AA84AC","#A102A8","#6C577A","#CCA2E0"],
	init: function( set, store){
		factory.settings.background = store.palette[0];	
	},
	tick: function( data, set, store){
		
		store.index++;
		set.background = store.palette[store.index%store.palette.length];
		
		set.width += store.direction;
		set.height += store.direction;
		if( set.width < store.minWidth ||	set.height < store.minHeight || set.width > store.maxWidth || set.height > store.maxHeight )
			store.direction *= -1;

		
	}
}