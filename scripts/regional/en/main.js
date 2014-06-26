var idx = 0;

function main(){
	loadRegionalSpecificText();
	var parent = document.getElementById('holder');
	for( k in messages['FAQ']){
		if(k.charAt(0) == '?')
		{
			var button = document.createElement("input");
			button.className = "btn btn-lg btn-default little_pluses site_font";
			button.style.width = window.innerWidth * 0.8+"px";
			button.style.fontSize = "35px";
			button.style.fontStyle = "bold";
			button.type = 'button';
			button.value = messages['FAQ'][k];
			button.onclick = reveal_answer;
			button.rel = k.slice(1,k.length);

			var div = document.createElement("div");
			div.id = button.rel;
			div.className = "seventy faq_answer";
			div.style.width = button.style.width;
			div.style.border = 2+"px";
			div.style.borderRadius = 7+"px";
			div.style.display = "none";

			var p = document.createElement("p");
			p.className = "site_font";
			p.style.fontSize = "25px";
			//p.style.color = "#FFFFFF";
			p.innerHTML = messages["FAQ"][button.rel];
			div.appendChild(p);

			var space_div = document.createElement("div");
			space_div.style.height = "10px";

			var c1 = parent.insertRow(idx++);
			var c2 = parent.insertRow(idx++);
			var c3 = parent.insertRow(idx++);

			c1.appendChild(button);
			c2.appendChild(div);
			c3.appendChild(space_div);
		}
	}
}

function reveal_answer(e){
	var name = e.target.rel;
	var answer = document.getElementById(name);
	if(answer.style.display == "none" )
		answer.style.display = "block";
	else
		answer.style.display = "none";
}

window.onload = main;