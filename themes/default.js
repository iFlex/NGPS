//standard for writting AMS
//upon tick you receive:
//		the applied settings 		         data
//		a reference to the settings          set
//		a reference to state storage space   store ( which points to your AMS object therefore don't override keywords: tick and init )

this.factory = this.factory || {};
factory.AMS = {
	maxWidth : 500,
	maxHeight : 500,
	minWidth : 100,
	minHeight : 100,
	direction : -50,
	a:"http://youtu.be/OglS3Q0Zxik",
	b:"http://assets3.parliament.uk/iv/main-large//ImageVault/Images/id_7382/scope_0/ImageVaultHandler.aspx.jpg",
	init: function( set, store){
		factory.settings.background = "red";	
	},
	tick: function( data, set, store){
		
		if(data.background == "red")
			set.background = "blue";
		else
			set.background = "red";
		
		set.width += store.direction;
		set.height += store.direction;
		if( set.width < store.minWidth ||	set.height < store.minHeight || set.width > store.maxWidth || set.height > store.maxHeight )
			store.direction *= -1;

		
	}
}