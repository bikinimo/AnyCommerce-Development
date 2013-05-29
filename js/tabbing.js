
function toggle_div(div_type)
{

	if(div_type=='dis')
	{
		
		document.getElementById("dis").style.display="block"; 
		document.getElementById("Specs").style.display="none"; 
		document.getElementById("featured").style.display="none";
		document.getElementById("Reviews").style.display="none";
		document.getElementById("video").style.display="none";
		document.getElementById("Acc").style.display="none"; 


		document.getElementById("href_dis").className = "active";
		document.getElementById("href_Specs").className = "";
		document.getElementById("href_featured").className = "";
		document.getElementById("href_Reviews").className = "";
		document.getElementById("href_video").className = "";
		document.getElementById("href_Acc").className = "";	
		

}
	else if(div_type=='Specs')
	{
		document.getElementById("dis").style.display="none"; 
		document.getElementById("Specs").style.display="block"; 
		document.getElementById("featured").style.display="none"; 	
		document.getElementById("Reviews").style.display="none";
		document.getElementById("video").style.display="none";
		document.getElementById("Acc").style.display="none"; 


		document.getElementById("href_dis").className = "";
		document.getElementById("href_Specs").className = "active";
		document.getElementById("href_featured").className = "";
		document.getElementById("href_Reviews").className = "";
		document.getElementById("href_video").className = "";	
		document.getElementById("href_Acc").className = "";	

	}
	else if(div_type=='featured')
	{
		document.getElementById("dis").style.display="none"; 
		document.getElementById("Specs").style.display="none"; 
		document.getElementById("featured").style.display="block"; 
		document.getElementById("Reviews").style.display="none";
		document.getElementById("video").style.display="none"; 	
		document.getElementById("Acc").style.display="none"; 

		document.getElementById("href_dis").className = "";
		document.getElementById("href_Specs").className = "";
		document.getElementById("href_featured").className = "active";
		document.getElementById("href_Reviews").className = "";
		document.getElementById("href_video").className = "";
		document.getElementById("href_Acc").className = "";	

}
else if(div_type=='Reviews')
	{
		document.getElementById("dis").style.display="none"; 
		document.getElementById("Specs").style.display="none"; 
		document.getElementById("featured").style.display="none"; 
		document.getElementById("Reviews").style.display="block";
		document.getElementById("video").style.display="none"; 	
		document.getElementById("Acc").style.display="none"; 

		document.getElementById("href_dis").className = "";
		document.getElementById("href_Specs").className = "";
		document.getElementById("href_featured").className = "";
		document.getElementById("href_Reviews").className = "active";
		document.getElementById("href_video").className = "";	
		document.getElementById("href_Acc").className = "";	

}
else if(div_type=='video')
	{
		document.getElementById("dis").style.display="none"; 
		document.getElementById("Specs").style.display="none"; 
		document.getElementById("featured").style.display="none"; 
		document.getElementById("Reviews").style.display="none";
		document.getElementById("video").style.display="block";
		document.getElementById("Acc").style.display="none"; 

		document.getElementById("href_dis").className = "";
		document.getElementById("href_Specs").className = "";
		document.getElementById("href_featured").className = "";
		document.getElementById("href_Reviews").className = "";
		document.getElementById("href_video").className = "active";
		document.getElementById("href_Acc").className = "";	

}

else if(div_type=='Acc')
	{
		document.getElementById("dis").style.display="none"; 
		document.getElementById("Specs").style.display="none"; 
		document.getElementById("featured").style.display="none"; 
		document.getElementById("Reviews").style.display="none";
		document.getElementById("video").style.display="none";
		document.getElementById("Acc").style.display="block"; 

		document.getElementById("href_dis").className = "";
		document.getElementById("href_Specs").className = "";
		document.getElementById("href_featured").className = "";
		document.getElementById("href_Reviews").className = "";
		document.getElementById("href_video").className = "";
		document.getElementById("href_Acc").className = "active";	

}


}
