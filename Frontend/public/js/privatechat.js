/* 
    File : privatechat.js
    v1.0
    Desc : For request.html page and get unread msgs and request from another user
    Developed By : Ishan Bhatt
*/
$(function() {
    var friendName = localStorage.getItem('friendName');
    var loggedUserName = localStorage.getItem('loggedUserName');
    var loggedUserId = localStorage.getItem('loggedUserId');
    var loggedUserImg = localStorage.getItem('loggedUserImg');
    var friendImg = localStorage.getItem('friendImg');
    var friendId = localStorage.getItem('friendId');
    var token = localStorage.getItem('token');
    var grpName = localStorage.getItem('groupName');
    var toUser = {
        toUser : friendName
    };

    var imgSrc = loggedUserImg;
    $("#user_img1").attr("src", imgSrc);
    $("#user_img2").attr("src", imgSrc);
    $("#user_img3").attr("src", imgSrc);
    $('.logged-in-user').html(loggedUserName);

    //Get unread messages
    $.ajax({
        async: true,
        crossDomain: true,
        method : "POST",
        url : url+"getUnreadMessages",
        "headers": {
            "authorization": token,
           /*  "Content-Type": "application/x-www-form-urlencoded", */
            "cache-control": "no-cache",               
        },
        contentType : 'application/JSON',
        data : JSON.stringify(toUser)
    }).done(function(res){
        var i=0;
        for(i=0; i<res.length; i++){
            console.log(res[i].fname);

            var unread = '<div class="chatTargetLi" style="margin-left:-10px; padding-top:15px; padding-bottom:15px;"><li class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="'+res[i].img_upload+'" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor:pointer; margin-left: 15px;">'+res[i].username+'</span></div></li></div>';
        
            $("#chatTargetUl").append(unread);  
        }
        $(".total-msg-count").append(' (' +res.length+ ') ');
    }).fail(function(e, s, t){a
        console.log("Error : " +e); 
    });

    //Get unread group messsages
    $.ajax({
        async: true,
        crossDomain: true,
        method : "POST",
        url : url+"getGroupUnreadMessages",
        "headers": {
            "authorization": token,
           /*  "Content-Type": "application/x-www-form-urlencoded", */
            "cache-control": "no-cache",               
        },
        contentType : 'application/JSON',
        data : JSON.stringify(toUser)
    }).done(function(res){
        for(var i=0; i<res.length; i++){
            if(res[i].group_image == undefined){
                var groupUnread = '<div class="grpTargetLi" style="margin-left:-10px; padding-top:15px; padding-bottom:15px;"><li class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="grpImage.png" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor:pointer; margin-left: 15px;">'+res[i].group_name+'</span></div></li></div>';
        
                $("#grpTargetUl").append(groupUnread);    
            } else {
                var groupUnread = '<div class="grpTargetLi" style="margin-left:-10px; padding-top:15px; padding-bottom:15px;"><li class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="'+res[i].group_image+'" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor:pointer; margin-left: 15px;">'+res[i].group_name+'</span></div></li></div>';
            
                $("#grpTargetUl").append(groupUnread);
            }
        }
    }).fail(function(e, s, t){
        console.log(e);
    }); 

    //Getting requests
    $.ajax({
        type:"POST",
        url:url+"getRequests",
        "headers": {
          "authorization": token,
         /*  "Content-Type": "application/x-www-form-urlencoded", */
          "cache-control": "no-cache",               
        }
    }).done(function(res){     
        for(var i=0; i<res.length; i++){
          console.log(res);
          var requestString = '<div class="requester-li"><sli class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="'+res[i][0].img_upload+'" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor : pointer; margin-left:15px;">'+res[i][0].username+'</span><button type="button" style="width:10%; float: right;margin-right:15px;" class="btn btn-block btn-danger btn-sm reject1">Reject</button><button type="button" style="width:10%; float: right; margin-right: 20px;margin-top: 0px;" class="accept1 btn btn-block btn-success btn-sm" id="accept'+i+'">Accept</button></div></li></div>';

          $("#myRequests").append(requestString);
        }
        $(".total-req-count").append(' (' +res.length+ ') ');
    }).fail(function(e, s, t){
        console.log(e);
    });

    $("#chatTargetUl").on("click", "li.userName", function() {
        var toUser = {
            friendName : $(this).find('span').html()
        };

        $.ajax({
            async: true,
            crossDomain: true,
            type : "POST",
            url :  url+"getFriendDetails",
            "headers": {
                "authorization": token,
               /*  "Content-Type": "application/x-www-form-urlencoded", */
                "cache-control": "no-cache",               
            },
            contentType : "application/JSON",
            data : JSON.stringify(toUser)
        }).done(function(res){
            if(res.token == token){
                var username = res.doc.username;
                localStorage.setItem('friendName', username);
                var friendImg = res.doc.img_upload;
                localStorage.setItem('friendImg',friendImg);
                localStorage.setItem('friendId', res.doc._id);
                window.location = url+'privateChat';
            }
        }).fail(function(e, s, t){
            console.log("Error is : " +e);
        });
    });

    //Load group chat page
    $("#grpTargetUl").on("click", "li.userName", function() {
        var groupName = $(this).find('span').html();

        var grpName = {
            grpName : $(this).find('span').html()
        };

        $.ajax({
            async: true,
            crossDomain: true,
            method : "POST",
            url : url+"getGroupDetails",
            "headers": {
              "authorization": token,
              "cache-control": "no-cache",               
            },
            contentType : "application/JSON",
            data : JSON.stringify(grpName)
        }).done(function(res){
              var meme = [];
              for(var i=0; i< res.group_members.length; i++){
                meme.push(res.group_members[i].members);
              }
              localStorage.setItem('groupName', groupName);
              localStorage.setItem('groupMembers', meme);
              window.location = url+'gruopChat';
        }).fail(function(e, s, t){ 
        });
    });

    //Update user_online == false for private chat
    $.ajax({
        async: true,
        crossDomain: true,
        method : "POST",
        url : url+"updateOnlineStatus",
        "headers": {
            "authorization": token,
           /*  "Content-Type": "application/x-www-form-urlencoded", */
            "cache-control": "no-cache",               
        },
        contentType : 'application/JSON',
        data : JSON.stringify(toUser)
    }).done(function(res){
        console.log("Response for notification is : " +res);
    }).fail(function(e, s, t){
        console.log("Error : " +e); 
    });

    //Update online_status == false in particular group
    var grpName = {
        grpName : grpName
    };
    
    $.ajax({
      async: true,
      crossDomain: true,
      method : "POST",
      url : url+"updateGroupOfflineStatus",
      "headers": {
        "authorization": token,
        "cache-control": "no-cache",               
      },
      contentType : "application/JSON",
      data : JSON.stringify(grpName)
    }).done(function(res){
    }).fail(function(e, s, t){
      console.log("Error : " +e);
    });
});

window.onload = function(){
    var x = 0;
    $("#notification-count").html(x);
};