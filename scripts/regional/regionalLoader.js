
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
	console.log("Attempting translation:"+str);
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
				
				console.log("str:"+str+" msg:"+message+" method:"+apply_method+" le message:"+Regional.messages[Regional.language][message]+" messages:"+utils.debug(Regional.messages[Regional.language]));
				//apply the message
				if(Regional.messages && Regional.messages[Regional.language] && Regional.messages[Regional.language][message])
				{
					console.log("Success");
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
			Regional.tryToApply(str,obj);
		}
	}	
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

	var all = root.DOMreference.children;//document.getElementsByTagName("*");
	
	Regional.inspectObject(root.DOMreference,message);
	for (var i=0, max=all.length; i < max; i++)
		Regional.inspectObject(all[i]);
	
	//extend to children
	for( k in root.children )
		Regional.translate(root.children[k]);
}
//initialise
Regional.includeLanguagePack();
