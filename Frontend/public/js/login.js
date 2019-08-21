//For Google Sign in
function onSignIn(googleUser) {
  //Getting profile of logged in user
  var profile = googleUser.getBasicProfile();
  
  var googleData = {
    googleId : profile.getId(),
    fname : profile.ofa,
    lname : profile.wea,  
    email : profile.getEmail(),
    img_upload : profile.getImageUrl()
  };

  //Prevent from auto-login
  googleUser.disconnect();

  //For saving/finding google logged in user data
  $.ajax({
    type : "POST",
    url : url+"saveGoogleData",
    data : JSON.stringify(googleData),
    contentType : 'application/JSON'
  }).done(function(res){
    console.log(res);
    if(res.data[0] == undefined){
      localStorage.setItem("loggedUserName", res.data.username);
      localStorage.setItem("loggedUserImg", res.data.img_upload);
      localStorage.setItem("loggedUserId", res.data._id);
      localStorage.setItem('token', res.token);
    } else {
      localStorage.setItem("loggedUserName", res.data[0].username);
      localStorage.setItem("loggedUserImg", res.data[0].img_upload);
      localStorage.setItem("loggedUserId", res.data[0]._id);
      localStorage.setItem('token', res.token);
    }

    window.location = url+'users';
  }).fail(function(e, s, t){
    window.location = url;
  });
}

$(document).ready(function(){

    function readURL(input) {
        if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#my-image').attr('src', e.target.result);
            var resize = new Croppie($('#my-image')[0], {
            viewport: { width: 100, height: 100 },
            boundary: { width: 300, height: 300 },
            showZoomer: true,
            enableResize: true,
            enableOrientation: true
            });
            $('#use').fadeIn();
        
            $('#use').on('click', function(e) {
              e.preventDefault();
              resize.result('base64').then(function(dataImg) {
            
                imgdata1 = [{ image: dataImg }, { name: 'myimgage.jpg' }];
                // use ajax to send data to php
                $('#result').attr('src', dataImg);
                $("#imagecrop").val(dataImg);
              });
            });
        };
        reader.readAsDataURL(input.files[0]);
        }
    }
    
    $("#img_upload").change(function() {
        readURL(this);
    });

    // Form submit
    $("#submit-form").click(function(){
      var name = $('#name').val();
      var fname = $('#fname').val();
      var lname =  $('#lname').val();
      var city =  $('#city').val();
      var mobile_number = $('#mobile_number').val();
      var datepicker_validate = $('#datepicker_validate').val();
      var email = $('#email').val();
      var pwd = $('#pwd').val();
      var img = $('#img_upload').val();
      console.log(img);
      var formData = new FormData($('#myForm')[0]); 
      console.log(formData);
      debugger;
      $.ajax({
          type: 'POST',
          url: url+'saveUserData',
          "contentType": false,
          "mimeType": "multipart/form-data",
          "data": formData, 
          "processData": false,  
          beforeSend: function() {
              $("#preloader").delay().show();
          } ,  
          success : function(data){
            if(data != 'Found'){
              window.location= url;
            } else{
              var mkConfig = {
                positionY: 'top',
                positionX: 'right',
                max: 5,
                scrollable: true
              };
            
              mkNotifications(mkConfig);
            
              mkNoti(
                'Username Exists ',
                'User is already registered with same Username or Email.',
                {
                  status:'danger'
                }
              );
            }
          },
          error : function(jqXHR, textStatus, err){
              window.location = url;
          } 
      });
    });

    //Post data for login verification
    $("#loginButton").click(function(){
       
        var userLoginData  = {
            username : $("#username").val(),
            password : $("#password").val()
        };

        $.ajax({
          async: true,
          crossDomain: true,
          type: "POST",
          url: url+"userAuthentication",
          contentType:'application/JSON',
          data : JSON.stringify(userLoginData)
        }).done(function(data){
          
            if(data.token != undefined && data != 'notValid'){
              localStorage.setItem('loggedUserId', data.data._id);
              localStorage.setItem('loggedUserName',data.data.username);
              localStorage.setItem('loggedUserImg',data.data.img_upload);
              localStorage.setItem('token',data.token);
              window.location = url+"users";
            }else {
              var mkConfig = {
                positionY: 'bottom',
                positionX: 'right',
                max: 5,
                scrollable: true
              };
            
              mkNotifications(mkConfig);
            
              mkNoti(
                'Wrong Credentials',
                'Username or Password is wrong.',
                {
                  status:'danger'
                }
              );
            }
        }).fail( function(jqXHR, textStatus, err){
          var mkConfig = {
            positionY: 'bottom',
            positionX: 'right',
            max: 5,
            scrollable: true
          };
        
          mkNotifications(mkConfig);
        
          mkNoti(
            'Wrong Credentials',
            'Username or Password is wrong.',
            {
              status:'danger'
            }
          );
        });
    });
});