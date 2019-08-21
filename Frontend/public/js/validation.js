/*
	File : custom.js
	v1.0
	Desc : Custom validation file
	Developed By : Ishan Bhatt
*/

var flag = 0; //no error

/*for tooltip password*/
$(document).ready(function(){
	$('#pwd').tooltip({
		'trigger':'focus', 'title': 'Password should contain minimum 8 to 12 characters, atleast 1 numeric value and 2 special characters'
	});
});

/*Date Picker*/
$( function() {
    $( "#datepicker_validate" ).datepicker({
    	dateFormat : 'dd-mm-yy',
    	changeMonth : true,
    	changeYear : true,
    	maxDate : 'now'
    });
});

/*Validate First Name*/
function validateFname(){
	var a = document.getElementById('fname').value;
	var t = '';
	var temp =0;

	if(a!=''){
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
				document.getElementById('lname').style.borderColor = "dodgerblue";
			}
		}
	} 

	else{
		document.getElementById('error1').style.color = "red"; 
		document.getElementById('error1').innerHTML = "Enter alphabets only.";
		document.getElementById('fname').style.borderColor = "red";
		flag = 1; //error
	}
}

/*Block Space*/
function blockSpace(e){
	if(e.which == 32){
		return false;
	}
}

/*Validate Last Name*/
function validateLname(){
	var a = document.getElementById('lname').value;
	var t = '';
	var temp =0;

	if(a!=''){
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
		document.getElementById('error2').innerHTML = "Enter alphabets only.";
		document.getElementById('lname').style.borderColor = "red";
		flag = 1; //error
	}
}

/*Validate City*/
function validateCity(){
    validateFname();
    validateLname();
	var a = document.getElementById('city').value;
	var t = '';
	var temp = 0;
	if(a!=''){
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
		document.getElementById('error3').innerHTML = "Enter alphabets only.";
		document.getElementById('city').style.borderColor = "red";
		flag = 1; //error	
	}
}

/*Block speacial characters excluding @, . , and  _*/
function preventSpace(e){	
	var k = e.which;
	if((k>64 && k<91) || (k>96 && k<123) || (k>47 && k <58) || k == 8 || k == 9
	|| k==64 || k==95 || k==46)
	{
		return true;
	} else {
		return false;
	}
}

/*Validate Password*/
function validatePassword(){
	validateFname();
    validateLname();
    validateCity();

	var psw = document.getElementById('pwd').value;
	var t='';
	var count_capital =0, count_digit=0, count_small=0, count_special=0;

	if(psw != '' || psw.length > 8 || psw.length < 12){
		document.getElementById('error6').innerHTML = "";
		document.getElementById('pwd').style.borderColor = "dodgerblue";
	}

	for(x=0;x<psw.length;x++)
	{
		t = psw.charCodeAt(x);
       	if(t >= 65 && t <= 90)
        {
            count_capital = 1;
        }

        if (t >= 48 && t <= 57) 
        {
        	count_digit = 1;
        }

        if((t >= 33 && t <= 47) || (t >= 58 && t <= 64) || (t >= 91 && t <= 96) || (t >= 123 && t <= 126)){
        	count_special = 1;
        }

        if(t >= 97 && t <=122){
        	count_small = 1;
        }	
	}

	if (count_digit == 1 && count_capital == 1 && count_small == 1 && count_special == 1) 
	{
		document.getElementById('error6').innerHTML = "";
		document.getElementById('pwd').style.borderColor = "dodgerblue";
	}

	else{
		
		document.getElementById('error6').style.color = "red"; 
		document.getElementById('error6').innerHTML = "Enter password using 8 to 12 characters";
        document.getElementById('pwd').style.borderColor = "red";
        flag = 1; //error
	}		
}

/*Validate Confirm Password*/
function validateConfirmPassword(){
    validateFname();
    validateLname();
    validateCity();
	validatePassword();

	document.getElementById('error7').innerHTML = "";
	document.getElementById('confirm_psw').style.borderColor = "dodgerblue";

	var password = document.getElementById("pwd").value;
  	var confirm_password = document.getElementById("confirm_psw").value;	
  	
  	if(confirm_password == '')
  	{
		document.getElementById('error7').style.color = "red"; 
		document.getElementById('error7').innerHTML = "Enter Password for confirmation";
        document.getElementById('confirm_psw').style.borderColor = "red";
        flag = 1; //error
        return false;
    }

	else if(password != confirm_password) 
	{
		document.getElementById('error7').style.color = "red"; 
		document.getElementById('error7').innerHTML = "Password doesn't match";
        document.getElementById('confirm_psw').style.borderColor = "red";
        flag = 1; //error
		return false;
	}
}

/*Validate checkbox*/
function isChecked() {
    validateFname();
    validateLname();
    validateCity();
	validatePassword();
	validateConfirmPassword();

	var small = $('small').text();
	var span = $('.help-block').text();

	//var agree = document.getElementById('inlineCheckbox4');
	var btn = document.getElementById('submit-form');
	if (small != '' || span != ''){
			btn.disabled = true;
	} else {
		btn.disabled = false;
	}
    
}