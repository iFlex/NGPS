
/**
*	NGPS Regionalisation module
*	Authod: Milorad Liviu Felix
*	29 Jun 2014  14:04 GMT
* 
* Encoding for elements that are regional specific
*    #REG: this signals that the element is regional specific
*    < message_name >
*    :apply_method 
*    example:  #REG:SUBMIT_BUTTON:value
* 	 available fields: id, value, placeholder, data-regional
*/
this.Regional = {};
//default language english
Regional.language = "en";
Regional.loadedLanguages = {};
Regional.queue = {};
Regional.index = 0;
//
Regional.includeLanguagePack = function()
{
	console.log(Regional.language+" is loaded? "+(!!Regional.loadedLanguages[Regional.language]))
	if(!Regional.loadedLanguages[Regional.language])
		requirejs(["./regional/"+Regional.language+"/messages"],
			function(){
				Regional.loadedLanguages[Regional.language] = true;
				console.log("Loaded language pack:"+Regional.language)
				for( k in Regional.queue)
				{
					Regional.translate(Regional.queue[k]['obj']);
					delete Regional.queue[k];
				}
		});
}
Regional.extend = function(language,messages)
{
	if(!Regional.messages)
		Regional.messages = {};
	
	if(!Regional.messages[language])
		Regional.messages[language] = {}

	for( k in messages )
		Regional.messages[language][k] = messages[k];
}
Regional.setLanguage = function(lng)
{
	//if(typeof(lng)!="string")
	//	return;
	//TODO:validate
	Regional.language = lng;
	Regional.translate();	
}
Regional.tryToApply = function(str,obj)
{
	if(str)
	{
		var isReg = str.indexOf("#REG:");
		if( isReg > -1 ){
			
			str = str.slice(isReg+5,str.length);
			
			var separator = str.indexOf(":");
			if( separator > -1 )
			{
				var message = str.slice(0,separator);
				var apply_method = str.slice(separator+1,str.length);
				
				//apply the message
				if(Regional.messages && Regional.messages[Regional.language] && Regional.messages[Regional.language][message])
				{
					obj[apply_method] = Regional.messages[Regional.language][message];
					return true;
				}
			}
		}
	}
	return false;
}
Regional.inspectObject = function(obj,message)
{
	if(message) //apply a provided message
	{
		Regional.tryToApply(message,obj);
		return;
	}
	//handle this element
	var str = obj.value;
	if(!Regional.tryToApply(str,obj)) //try the value field
	{
		str = obj.id; //try the id field
		if(!Regional.tryToApply(str,obj)){
			str = obj.placeholder; //try the placeholder
			if(!Regional.tryToApply(str,obj)){
				str = obj.getAttribute("data-regional");
				Regional.tryToApply(str,obj);
			}
		}
	}
	var all = obj.children;//document.getElementsByTagName("*");
	for (var i=0; i < all.length; i++)
		Regional.inspectObject(all[i]);
}
Regional.translate = function(root,message)
{
	if(!root)
		root = factory.root;

	Regional.includeLanguagePack();
	if(!Regional.loadedLanguages[Regional.language])
	{
		Regional.queue[Regional.index++] = {obj:root}
		return;
	}
	
	Regional.inspectObject(root.DOMreference,message);
	
	//extend to children
	//for( k in root.children )
	//	Regional.translate(root.children[k]);
}
//initialise
Regional.includeLanguagePack();
