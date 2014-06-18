this.factory = this.factory || {};
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