/* 
    File : update-validation.js
    v1.0
    Desc : Update user details form validation file
    Developed By : Ishan Bhatt
*/

function validateFname(){
	var a = document.getElementById('fname').value;
	var t = '';
	var temp =0;

	if(a!='' && a.length>3){
		for(i=0;i<a.length;i++)
		{
			t = a.charCodeAt(i);
			if( (t >= 48 && t<=57) || (t >= 33 && t <= 47) || (t >= 58 && t <= 64) 
					|| (t >= 91 && t <= 96) || (t >= 123 && t <= 126) ){
                flag = 1; //error
				temp = 1;
			}

			if(temp == 1){
				document.getElementById('error1').style.color = "red"; 
				document.getElementById('error1').innerHTML = "Enter alphabets only.";
                document.getElementById('fname').style.borderColor = "red";
                flag = 1; //error
			} 

			else{
				document.getElementById('error1').innerHTML = "";
				document.getElementById('fname').style.borderColor = "dodgerblue";
			}
		}
	} 

	else{
		document.getElementById('error1').style.color = "red"; 
		document.getElementById('error1').innerHTML = "Enter name containing atleast 3 letters.";
		document.getElementById('fname').style.borderColor = "red";
		flag = 1; //error
	}
}

function validateLname(){
	var a = document.getElementById('lname').value;
	var t = '';
	var temp =0;

	if(a!='' && a.length>3){
		for(i=0;i<a.length;i++)
		{
			t = a.charCodeAt(i);
			if( (t >= 48 && t<=57) || (t >= 33 && t <= 47) || (t >= 58 && t <= 64) 
					|| (t >= 91 && t <= 96) || (t >= 123 && t <= 126) ){
                flag = 1; //error
				temp = 1;
			}

			if(temp == 1){
				document.getElementById('error2').style.color = "red"; 
				document.getElementById('error2').innerHTML = "Enter alphabets only.";
                document.getElementById('lname').style.borderColor = "red";
                flag = 1; //error
			} 

			else{
				document.getElementById('error2').innerHTML = "";
				document.getElementById('lname').style.borderColor = "dodgerblue";
			}
		}
	} 

	else{
		document.getElementById('error2').style.color = "red"; 
		document.getElementById('error2').innerHTML = "Enter name containing atleast 3 letters.";
		document.getElementById('lname').style.borderColor = "red";
		flag = 1; //error
	}
}

function validateCity(){
	var a = document.getElementById('city').value;
	var t = '';
	var temp =0;

	if(a!='' && a.length>3){
		for(i=0;i<a.length;i++)
		{
			t = a.charCodeAt(i);
			if( (t >= 48 && t<=57) || (t >= 33 && t <= 47) || (t >= 58 && t <= 64) 
					|| (t >= 91 && t <= 96) || (t >= 123 && t <= 126) ){
                flag = 1; //error
				temp = 1;
			}

			if(temp == 1){
				document.getElementById('error3').style.color = "red"; 
				document.getElementById('error3').innerHTML = "Enter alphabets only.";
                document.getElementById('city').style.borderColor = "red";
                flag = 1; //error
			} 

			else{
				document.getElementById('error3').innerHTML = "";
				document.getElementById('city').style.borderColor = "dodgerblue";
			}
		}
	} 

	else{
		document.getElementById('error3').style.color = "red"; 
		document.getElementById('error3').innerHTML = "Enter name containing atleast 3 letters.";
		document.getElementById('city').style.borderColor = "red";
		flag = 1; //error
	}
}