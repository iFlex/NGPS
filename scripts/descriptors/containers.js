/** 
*	Container Models File
*	States container descriptor & resources needed
*	Mod de operare: descrie direct proprietatile sau indica fisierul CSS necesar + clasa necesara
*	Author:
* 	31 May 2014 14:20
*/
//initialise
this.Descriptors = this.Descriptors || {}
Descriptors.containers = Descriptors.containers || {};
//default
Descriptors.containers['simple_rect'] = {x:0,y:0,width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
Descriptors.containers['rounded_rect'] = {x:0,y:0,width:100,height:100,background:"blue",border_size:2,border_style:"solid",border_color:"0x000000",border_radius:["15px"]};
//custom
Descriptors.containers['c000000'] = { name:"Simple" , x:0 , y:0 , width:100 , height:100 , cssText : "background: red;" };
Descriptors.containers['c000001'] = { name:"Rounded" , x:0 , y:0 , width:100 , height:100 , cssText : "border-radius:15px;background: red;" };
Descriptors.containers['c000002'] = { name:"Dashed" , x:0 , y:0 , width:100 , height:100 , cssText : "border-width:5px;border-style:dashed;background: red;" };
Descriptors.containers['c000003'] = { name:"Dotted" , x:0 , y:0 , width:100 , height:100 , cssText : "border-width:5px;border-style:dotted;background: red;" };
