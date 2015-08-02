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
//CORE
Descriptors.containers['base'] = {width:"100%",height:"100%",background:"white",permissions:{save:true,connect:true,edit:true,children:true}};//not a camera
Descriptors.containers['root'] = {width:"100%",height:"100%",background:"white",permissions:{noOverride:false},surfaceWidth:50000,surfaceHeight:50000,CAMERA_type:"scroller"};
Descriptors.containers['overlay'] = {width:"100%",height:"100%",background:"transparent",cssText:"position:fixed;top:0px;left:0px;z-index:100"};
Descriptors.containers['link_dot'] = {border_size:0,border_style:"solid",border_radius:["50%"],border_color:"black",background:"white"}
Descriptors.containers['global_app'] = {border_size:0,border_radius:["0px"],background:"transparent"}
Descriptors.containers['text_field'] = {type:"textarea",background:"transparent",cssText:"resize: none;outline: none;border: 0px solid;display: block;padding: 0;text-align: center;"}
//default
Descriptors.containers['simple_rect'] = {background:"blue",border_size:2,border_style:"solid",border_color:"0x000000"};
Descriptors.containers['rounded_rect'] = {background:"blue",border_size:2,border_style:"solid",border_color:"0x000000",border_radius:["15px"]};
Descriptors.containers['simple_dashed'] = {background:"blue",border_size:5,border_style:"dashed"};

//custom
Descriptors.containers['c000000'] = { name:"Simple"};
Descriptors.containers['c000001'] = { name:"Rounded" , cssText : "border-radius:15px;" };
Descriptors.containers['c000002'] = { name:"Dashed"  , cssText : "border-width:5px;border-style:dashed;" };
Descriptors.containers['c000003'] = { name:"Dotted" , cssText : "border-width:5px;border-style:dotted;" };
