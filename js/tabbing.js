function toggle_div(div_type)
{

	 if(div_type=='featured')
	{
		document.getElementById("featured").style.display="block"; 
		document.getElementById("Reviews").style.display="none";
 
		document.getElementById("href_featured").className = "active";
		document.getElementById("href_Reviews").className = "";
 	}
	 
	
	else if(div_type=='Reviews')
	{
		document.getElementById("featured").style.display="none"; 
		document.getElementById("Reviews").style.display="block";
 
		document.getElementById("href_featured").className = "";
		document.getElementById("href_Reviews").className = "active";
 	}
	 

}
 