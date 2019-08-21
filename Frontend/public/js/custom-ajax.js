/*
  File Name : custom-ajax
  v1.0
  Description : It is for custom ajax call to pass data in Node Server
  Developed By : Ishan Bhatt
*/

// Global Variables
var loggedUserImg = localStorage.getItem('loggedUserImg');
var friendName = localStorage.getItem('friendName');
var friendImg = localStorage.getItem('friendImg');
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct','Nov','Dec'];
var loggedUserName = localStorage.getItem('loggedUserName');
var token = localStorage.getItem('token');

$(document).ready(function(){

    //For cropping of image
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

    //For showing cropped image
    $("#img_upload").change(function() {
        readURL(this);
    });

    //Show chat div
    $(".showChat").click(function(){
      $(".mychats").css("display", "none");
      $(".searchALlUser").css("display", "none");
      $(".showChatOption").css("display","block");
      $(".backHome").css("display","block");
      $(".header-title").html('Chats');
    });

    //Back Button
    $(".backHome").click(function(){
      $(".mychats").css("display", "block");
      $(".searchALlUser").css("display", "block");
      $(".showChatOption").css("display","none");
      $(".header-title").html('All Users');
      $(".backHome").css("display","none");
    });

    //SearchFriends
    $(".searchFrined").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#chatTarget li").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });

    //SearchGroups
    $(".searchGroups").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#menu2 li").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });

    //searchALlUser
    $(".searchALlUser").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $(".mychats li").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
      });
    });

    //For getting user's friends list
    $("#nav-profile-tab").one('click', function(e){
        e.preventDefault();
        $.ajax({
          async: true,
          crossDomain: true,
          type:"GET",
          url:url+"getFriends",
          "headers": {
            "authorization": token,
            "cache-control": "no-cache",
          },
          contentType: 'application/JSON',
      }).done(function(res){     
        if(res.length > 0){
          var i=0,j=0;
          var friendDetails;

          //Main for loop
          for(i=0; i<res.length; i++){
              //Loop to access inventory_docs
              for(j=0; j<res[i].inventory_docs.length; j++){

                  //Check if logged in user sent request or not
                  if( res[i].users[0].fromUser == loggedUserName && res[i].inventory_docs[j].username == res[i].users[0].toUser ) {
                    
                      //Shwoing in tab
                      friendDetails = '<li class="userName" style="list-style:none;padding-top:20px; padding-bootom:20px; margin-left:-40px;" id="x'+i+'"><div class="row custom-row"><div class="img_cont"><img src="'+res[i].inventory_docs[j].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+i+'">'+res[i].inventory_docs[j].username+'</span><div id="req_sent_status" style="float:right;"><small class="label label-info" style="display:none;">Request Sent</small></div></div></div></li>';
                      
                      $(".myFriendsList").append(friendDetails);
                  } 
                  
                  //Check if some has sent request to logged in user and they are friends as well
                  else if( res[i].users[0].toUser == loggedUserName && res[i].inventory_docs[j].username == res[i].users[0].fromUser ) {
                    
                      //Shwoing in friends tab
                      friendDetails = '<li class="userName" style="list-style:none; padding-top:20px; padding-bootom:20px; margin-left:-40px;" id="x'+i+'"><div class="row custom-row"><div class="img_cont"><img src="'+res[i].inventory_docs[j].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+i+'">'+res[i].inventory_docs[j].username+'</span><div id="req_sent_status" style="float:right;"><small class="label label-info" style="display:none;">Request Sent</small></div></div></div></li>';
                      
                      $(".myFriendsList").append(friendDetails);
                  } else {
                      /* console.log("No friend for this conditions"); */
                  }
              }        
          }
        } else {
          var empty = '<li class="" style="list-style:none;"><div class="row custom-row"><div class="user_info"><span>Make New Frineds</span></div></div></li>';
                
          $(".myFriendsList").append(empty);
        } 
            
      }).fail(function(e, s, t){
      });
    });

    //Create Group Modal
    $("#create-group").one('click',function(e){
      e.preventDefault();
      $.ajax({
        async: true,
        crossDomain: true,
        type:"GET",
        url:url+"getFriends",
        "headers": {
          "authorization": token,
          "cache-control": "no-cache",
        },
        contentType: 'application/JSON',
    }).done(function(res){
        console.log(res);
        if(res.length > 0){
          var i=0,j=0;
          var groupFriends;
          
          //Main for loop
          for(i=0; i<res.length; i++){
              /* console.log(res); */
              //Loop to access inventory_docs
              for(j=0; j<res[i].inventory_docs.length; j++){

                  //Check if logged in user sent request or not
                  if( res[i].users[0].fromUser == loggedUserName && res[i].inventory_docs[j].username == res[i].users[0].toUser ) {
                    
                      //Shwoing in tab
                      groupFriends = '<li class="addGroup" style="list-style:none;" id="x'+i+'"><div class="row custom-row"><div class="img_cont"><img src="'+res[i].inventory_docs[j].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+i+'">'+res[i].inventory_docs[j].username+'</span></div><div class="round" style="margin-left:500px; margin-top:-30px;"><input type="checkbox" value='+res[i].inventory_docs[j].username+' class="chkListItem" id="checkbox'+i+'"/><label for="checkbox'+i+'" name="checkbox'+i+'"></label></div></div></li>';

                      
                          
                      $(".friendsForGroup").append(groupFriends);
                  }   
                  
                  //Check if some has sent request to logged in user and they are friends as well
                  else if( res[i].users[0].toUser == loggedUserName && res[i].inventory_docs[j].username == res[i].users[0].fromUser ) {
                    
                      //Shwoing in friends tab
                      groupFriends = '<li class="addGroup" style="list-style:none;" id="x'+i+'"><div class="row custom-row"><div class="img_cont"><img src="'+res[i].inventory_docs[j].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+i+'">'+res[i].inventory_docs[j].username+'</span></div><div class="round" style="margin-left:500px; margin-top:-30px;"><input type="checkbox" value='+res[i].inventory_docs[j].username+' class="chkListItem" id="checkbox'+i+'"/><label for="checkbox'+i+'" name="checkbox'+i+'"></label></div></div></li>';
                      
                      $(".friendsForGroup").append(groupFriends);
                  } else {
                      /* console.log("No friend for this conditions"); */
                  }
              }        
          }
        } else {
          var empty = '<li class="" style="list-style:none;"><div class="row custom-row"><div class="user_info"><span>Make New Frineds</span></div></div></li>';
                
          $(".myFriendsList").append(empty);
        }
    }).fail(function(e, s, t){
    });
    });

    //Create Group button
    $("#save-group").click(function(){
      var GrpName = $("#grpName").val();
      if(GrpName == ''){
        $('.error').css('color','red');
        $('.error').css('text-align','center');
        $('.error').html('Enter Group Name');
        return;
      } else{
          var allVals = [];
          $('input:checkbox[type=checkbox]:checked').each(function () {
            allVals.push($(this).val());
            localStorage.setItem('groupMembers',allVals);
          });
          localStorage.setItem('groupName', GrpName);

          var grpDetails = {
            groupMembers : allVals,
            groupName : GrpName
          };

          $.ajax({
            type : "POST",
            url : url+"createGroup",
            "headers": {
              "authorization": token,
              "cache-control": "no-cache",               
            },
            contentType : "application/JSON",
            data : JSON.stringify(grpDetails)
          }).done(function(res){
            if(res == 'already'){
              $('.error').css('color','red');
              $('.error').css('text-align','center');
              $('.error').html('Choose another name.This group is already created.');
            } else if(res == 'notElegible'){
              $('.error').css('color','red');
              $('.error').css('text-align','center');
              $('.error').html("You must add 2 or more than 2 members");
            } else{
              $(".chkListItem").prop('checked',false);
              $(".grpName").val('');
              $('#modal-default').modal('toggle');
              window.location = url+'gruopChat';
              return false;
            }
          }).fail(function(e, s, t){
          });
        }
    });

    //Add Members
    $("#add-members").click(function(){
      var allVals = [];
      var newMem = [];
      
      //Push checked username into array
      $('input:checkbox[type=checkbox]:checked').each(function () {
        allVals.push($(this).val());
      });

      //Take array of group members
      var alreadyMem = localStorage.getItem('groupMembers');
      var strsplit = alreadyMem.split(',');
      console.log(strsplit);
      
      //Push distinct values into new array
      for( var i = 0; i < allVals.length; i++ ) {
        if( $.inArray( allVals[i], strsplit ) == -1 ) {
          newMem.push(allVals[i]);
        }
      }

      var x = strsplit.push(newMem);
      //Give unique Values
      function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
      }
      var newMembers = newMem.filter( onlyUnique );

      localStorage.setItem('groupMembers', strsplit);

      console.log("New Member array : " +newMembers);

      var grpName = localStorage.getItem('groupName');
      var grpMem = {
        groupMembers : newMembers,
        grpName : grpName
      };

      //Ajax call for add members
      $.ajax({
        type : "POST",
        url : url+"addGroupMembers",
        "headers": {
          "authorization": token,
          "cache-control": "no-cache",               
        },
        contentType : 'application/JSON',
        data : JSON.stringify(grpMem)
      }).done(function(res){
        console.log("response is : " +res);
        $(".chkListItem").prop('checked',false);
        $('#modal-default').modal('toggle');
        var mkConfig = {
          positionY: 'bottom',
          positionX: 'right',
          max: 5,
          scrollable: true
        };
      
        mkNotifications(mkConfig);
      
        mkNoti(
          'Member Added ',
          'Selected members are added successfully',
          {
            status:'success'
          }
        );
      }).fail(function(e, s, t){
      });
    });

    //Show members onclick
    $(".remove-members").one('click',function(e){
      var alreadyMem = localStorage.getItem('groupMembers');
      var strsplit = alreadyMem.split(',');

      $.ajax({
        async: true,
        crossDomain: true,
        type:"GET",
        url:url+"getFriends",
        "headers": {
          "authorization": token,
          "cache-control": "no-cache",
        },
        contentType: 'application/JSON',
      }).done(function(res){
        console.log(res);
        if(res.length > 0){
          var i=0,j=0;
          var groupFriends;
          
          //Main for loop
          for(i=0; i<res.length; i++){
            //Loop to access inventory_docs
            for(j=0; j<res[i].inventory_docs.length; j++){

              //Check if logged in user sent request or not
              if( res[i].users[0].fromUser == loggedUserName && res[i].inventory_docs[j].username == res[i].users[0].toUser ) {
                  for(var m=0; m<strsplit.length; m++){
                    if(res[i].inventory_docs[j].username == strsplit[m]){

                      //Shwoing in tab
                      groupFriends = '<li class="addGroup" style="list-style:none;" id="x'+i+'"><div class="row custom-row"><div class="img_cont"><img src="'+url+''/''+res[i].inventory_docs[j].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+i+'">'+res[i].inventory_docs[j].username+'</span></div><div class="round forRemove" style="margin-left:520px; margin-top:-22px;"><input type="checkbox" value='+res[i].inventory_docs[j].username+' class="removeFromGroup" id="checkbox'+i+'"/><label for="checkbox'+i+'" name="checkbox'+i+'"></label></div></div></li>';    
                          
                      $(".removeGroupMember").append(groupFriends); 
                    }
                  }
              }   
                
              //Check if some has sent request to logged in user and they are friends as well
              else if( res[i].users[0].toUser == loggedUserName && res[i].inventory_docs[j].username == res[i].users[0].fromUser ) {
                for(var m=0; m<strsplit.length; m++){
                  if(res[i].inventory_docs[j].username == strsplit[m]){
                    
                    //Shwoing in friends tabs
                    groupFriends = '<li class="addGroup" style="list-style:none;" id="x'+i+'"><div class="row custom-row"><div class="img_cont"><img src="'+url+''/''+res[i].inventory_docs[j].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+i+'">'+res[i].inventory_docs[j].username+'</span></div><div class="round" style="margin-left:500px; margin-top:-30px;"><input type="checkbox" value='+res[i].inventory_docs[j].username+' class="chkListItem" id="checkbox'+i+'"/><label for="checkbox'+i+'" name="checkbox'+i+'"></label></div></div></li>';
                    
                    $(".removeGroupMember").append(groupFriends);
                  }
                }
              } 
            }        
          }
        } else {
          var empty = '<li class="" style="list-style:none;"><div class="row custom-row"><div class="user_info"><span>Make New Frineds</span></div></div></li>';
                
          $(".myFriendsList").append(empty);
        }
      }).fail(function(e, s, t){
      });
    });

    //Remove selected members
    $("#removeMultiMem").click(function(){
      var removeMem = [];
      var grpName = localStorage.getItem('groupName');
      //Push checked username into array
      $('input:checkbox[type=checkbox]:checked').each(function () {
        removeMem.push($(this).val());
      });

      var removeSelected = {
        removeMem : removeMem,
        grpName : grpName
      };

      $.ajax({
        async: true,
        crossDomain: true,
        type:"POST",
        url:url+"removeGroupMembers",
        "headers": {
          "authorization": token,
          "cache-control": "no-cache",
        },
        data : JSON.stringify(removeSelected),
        contentType: 'application/JSON',
      }).done(function(res){
        console.log("Success : " +res);
      }).fail(function(e, s, t){
        console.log("Error : " +e);
      });
      
    });

    //Get user associated group list
    $("#get-groups").one('click', function(e){
      $.ajax({
        async: true,
        crossDomain: true,
        type:"GET",
        url:url+"getGroupList",
        "headers": {
          "authorization": token,
          "cache-control": "no-cache",               
        },
      }).done(function(res){
        
        if(res != null){
          for(var i=0; i<res.length; i++){  

              if(res[i].group_image == undefined){
                var grpList = '<li class="getGrpData" style="cursor:pointer; margin-left:-2px;"><div class="row custom-row"><img src="grpImage.png" class="rounded-circle user_img" ><a><span >'+res[i].group_name+'</span></a></div></li>';
                
                $('#menu2').append(grpList);
              } else{
                console.log()
                var grpList = '<li class="getGrpData" style="cursor:pointer; margin-left:-2px;"><div class="row custom-row"><img src="'+res[i].group_image+'" class="rounded-circle user_img" ><a><span >'+res[i].group_name+'</span></a></div></li>';
                
                $('#menu2').append(grpList);
              }
              
          }
        } if(res.length <= 0){
          $('#menu2').html("<h4>No Groups</h4>");
        }
      }).fail(function(e, s, t){
        console.log("Error is : " +e);
      });
    });

    //Leave group
    $(".leaveGroup").on('click', function(){
      $(".wrapper1").show();
      var grpName = localStorage.getItem('groupName');
      var groupObj = {
        grpName : grpName
      }
      $.ajax({
        async: true,
        crossDomain: true,
        method : "POST",
        url : url+"leaveGroup",
        "headers": {
          "authorization": token,
          "cache-control": "no-cache",               
        },
        contentType : "application/JSON",
        data : JSON.stringify(groupObj)
      }).done(function(res){
        $(".wrapper1").hide();
        window.location = url;
      }).fail(function(e, s, t){

      });
    });
    
    //Clear the locastorage on logout
    $(".logout").click(function(){
        localStorage.clear();

        $.ajax({
          type:'GET',
          url : url+"logout",
          crossDomain : true,
          async : true
        }).done(function(res) {
          window.location = 'https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue='+url+'logout';
        }).fail(function(e, s, t){
          console.log(e);
        });
    });
});

//For removing members
$(document).on('click','.test',function(){
  var removeMem = [];
  var grpName = localStorage.getItem('groupName');
  //Push checked username into array
  $('input:checkbox[type=checkbox]:checked').each(function () {
    removeMem.push($(this).val());
  });
  var removeSelected = {
    removeMem : removeMem,
    grpName : grpName
  };

  $.ajax({
    async: true,
    crossDomain: true,
    type:"POST",
    url:url+"removeGroupMembers",
    "headers": {
      "authorization": token,
      "cache-control": "no-cache",
    },
    data : JSON.stringify(removeSelected),
    contentType: 'application/JSON',
  }).done(function(res){
    $('input:checkbox[type=checkbox]:checked').each(function () {
      $(this).closest('li').remove()
      console.log();
    });
    var mkConfig = {
      positionY: 'bottom',
      positionX: 'right',
      max: 5,
      scrollable: true
    };
  
    mkNotifications(mkConfig);
  
    mkNoti(
      'Members removed successfully ',
      'Selected members are removed successfully',
      {
        status:'success'
      }
    );
  }).fail(function(e, s, t){
    console.log("Error : " +e);
  });
});

//Document ready event
$(document).ready(function(){

  //Update User details
  $("#submitUpdateForm").click(function(e){
    var filepath = $("#fileupload").val();
    console.log(filepath);
    var filename = filepath.replace(/^.*(\\|\/|\:)/, '');
    if(filename != ''){
      localStorage.setItem('loggedUserImg', filename);
    }
    var formData = {
      fname : $('#fname').val(),
      lname :  $('#lname').val(),
      city :  $('#city').val(),
      email : $('#email').val(),
      img_name : filename,
      img : $('#imagecrop1').val()
    };
        
    $.ajax({
        type: 'POST',
        url: url+'updateUserData',
        "headers": {
          "authorization": token,
          "cache-control": "no-cache",               
        },
        "mimeType": "multipart/form-data",
        data: JSON.stringify(formData), 
        contentType : "application/JSON",
        "processData": false,  
        success : function(data){
          var mkConfig = {
            positionY: 'bottom',
            positionX: 'right',
            max: 5,
            scrollable: true
          };
        
          mkNotifications(mkConfig);
        
          mkNoti(
            'Updated Successfully',
            'User profile has been updated.',
            {
              status:'success'
            }
          );
          var x = localStorage.getItem('loggedUserImg');
          console.log(x);
          $(".profile-user-img").attr("src", x);
          $("#user_img1").attr("src", x);
          $("#user_img2").attr("src", x);
          $("#user_img3").attr("src", x);
        },
        error : function(jqXHR, textStatus, err){
            console.log("Error : " +jqXHR);
        } 
    });
  });

  //Accept Request
  $(document).on("click", ".accept1", function() {
    var btn = $(this).text();
    var spanData = $(this).parent().find('span').html();
    $(this).parent().remove();
    
    var requestedUserObj = {
      requestedUser : spanData
    };

    $.ajax({
      async: true,
      crossDomain: true,
      type : "POST",
      url : url+"acceptRequest",
      "headers": {
        "authorization": token,
        "cache-control": "no-cache",               
      },
      contentType : "application/JSON",
      data : JSON.stringify(requestedUserObj)
    }).done(function(res){
    }).fail(function(e, s, t){
    }); 
  });

  //Reject Request
  $(document).on("click", ".reject1", function() {
    var btn = $(this).text();
    var spanData = $(this).parent().find('span').html();
    $(this).parent().remove();

    var requestedUserObj = {
      requestedUser : spanData
    };

    $.ajax({
      async: true,
      crossDomain: true,
      type : "POST",
      url : url+"rejectRequest",
      "headers": {
        "authorization": token,
        "cache-control": "no-cache",               
      },
      contentType : "application/JSON",
      data : JSON.stringify(requestedUserObj)
    }).done(function(res){
      console.log(res);
    }).fail(function(e, s, t){
    });
  });

  //Get Group Data
  $(document).on("click",".getGrpData",function(){
    var x = $(this).find('span').html();
    var grpImage = $(this).find('img').attr('src');
    localStorage.setItem('groupName', x);
    localStorage.setItem('groupImage', grpImage);
    window.location = url+'gruopChat';
  });
});

//Get all users when window is loaded
window.onload = function(){
    var grpName = localStorage.getItem('groupName');
    $("#nav-profile-tab").trigger('click');

    //Setting up image and username from localstorage
    var imgSrc = loggedUserImg;
    
    $("#user_img1").attr("src", imgSrc);
    $("#user_img2").attr("src", imgSrc);
    $("#user_img3").attr("src", imgSrc);
    $('.logged-in-user').html(loggedUserName);
    $(".friendName").html(friendName);
    $("#friendImg").attr("src",friendImg);
    var i;
    var userDetails = {
      loggedUserName : loggedUserName
    };

    //Get req. status
    $.ajax({
      async: true,
      crossDomain: true,
      type:"POST",
      url:url+"getRequestStatus",
      "headers": {
        "authorization": token,
        "cache-control": "no-cache",               
      },
      contentType : "application/JSON",
      data : JSON.stringify(userDetails)
    }).done(function(res){
        for(i=0; i<res.length; i++){
          $( "li input" ).each(function( index ) {
            
            if($( this ).val() == res[i].toUser){
              if(res[i].request_sent == 1){ 
                $(this).parent().find('button').attr('disabled',true);
              }
            }
          });
        }
    }).fail(function(e, s, t){
    });

    //Get Logged user details
    $.ajax({
      async: true,
      crossDomain: true,
      type : "POST",
      url : url+"getLoggedUserData",
      "headers": {
        "authorization": token,
        "cache-control": "no-cache",               
      },
      contentType : "application/JSON",    
    }).done(function(res){
      if(res.googleId == undefined){
       
        $('.profile-user-img').attr('src', res.img_upload);
        $('.profile-username').html(res.username);
        $('.friednsCount').html(res.friends.length);

        //Fill Input Values
        $("#fname").attr('value',res.fname);      
        $("#lname").attr('value',res.lname);      
        $("#email").attr('value',res.email);      
        $("#pwd").attr('value',res.pwd);      
        $("#city").attr('value',res.city);     
      } else{
        $('.cityHide').hide();
        $('.profile-user-img').attr('src',res.img_upload);
        $('.profile-username').html(res.username);
        $('.friednsCount').html(res.friends.length);
        $("#email").attr('disabled',true);
        $("#email").attr('value',res.email);
        $("#fname").attr('value',res.fname);      
        $("#lname").attr('value',res.lname); 
      }
    }).fail(function(e){
    });
};

//offline user when tab is closed
window.onbeforeunload = function() {
  var friendName = localStorage.getItem('friendName');
  var token = localStorage.getItem('token');
  var toUser = {
      toUser : friendName
  };
  
  $.ajax({
    async: true,
    crossDomain: true,
    method : "POST",
    url : url+"updateOnlineStatus",
    "headers": {
        "authorization": token,
        "cache-control": "no-cache",               
    },
    contentType : 'application/JSON',
    data : JSON.stringify(toUser)
    }).done(function(res){
        console.log("Response for notification is : " +res);
    }).fail(function(e, s, t){
        console.log("Error : " +e); 
    });
};