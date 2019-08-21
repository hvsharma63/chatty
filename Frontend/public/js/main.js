/* 
    File : main.js
    v1.0
    Desc : For socket connections
    Developed By : Ishan Bhatt
*/

var socket = io();
/* socket = io.connect(url,{secure : false}); */
socket = io.connect();

$(function() {
    var loggedUserId = localStorage.getItem('loggedUserId');
    var loggedUserImg = localStorage.getItem('loggedUserImg');
    var loggedUserName = localStorage.getItem('loggedUserName');
    var friendId = localStorage.getItem('friendId');
    var friendName = localStorage.getItem('friendName');
    var grpName = localStorage.getItem('groupName');
    var token = localStorage.getItem('token');
    var inputBox = $("#emojionearea1");
    var strDateTime,myDate,monthDigit,currentDate,currentMonth,currentHours,currentMin,i=0;
    var typingMessage = $('.msgText');
    var element;
    var i=0,sendEmoji;
    var notificationCount = 0;    
    
    //Emit event on logging of a user
    socket.emit('join', {user_id : loggedUserName});

    //Join Room
    socket.emit('create', {
        grpName : grpName,
        room : 'room'
    });
    
    $('body').attr("user_id",loggedUserName );
    
    //For sending request
    $("#target").on("click", "button.send-req-btn", function() {
        $(this).attr("disabled", true);
        element = $(this).parent().parent().find('span').html();
        var imgEle = $(this).parent().parent().parent().find('img');
        var imgSrc = imgEle[0].currentSrc;
        
        socket.emit('sendRequest',{
            fromUser : loggedUserName,
            imgSrc : imgSrc,
            toUser : element
        });
    });

    //Send message on enter key
    $('#emojionearea1').on('keyup', function(event){
        if(event.which === 13){
            alert("wfewf")
            $("#sendMessage").trigger("click");
        }
    });

    //Sending Emojis
    $("#emojionearea1").emojioneArea({
        pickerPosition: "top",
        tonesStyle: "bullet",
        /* events: {
            keyup: function (editor, event) {
                if(event.which === 13){
                    alert("hhh")
                    $("#sendMessage").click();
                }
                console.log(this.getText());
                sendEmoji = editor.html();
           }
       } */
    });

    //For sending messages
    $("#sendMessage").on("click", function(){
        myDate = new Date();
        monthDigit = myDate.getMonth();
        var el = $("#emojionearea1").emojioneArea();

        currentDate = ('0' + myDate.getDate()).slice(-2);
        currentMonth = months[monthDigit];
        currentHours = ('0' + myDate.getHours()).slice(- 2);
        currentMin = ('0' + myDate.getMinutes()).slice(-2);
        var message = $('.msgText').val();
        if(message != ''){
            console.log("Message is : " +message);
       
            var fromUserMessage = '<div class="direct-chat-msg right fromUser"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-right">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="direct-chat-text">'+message+'</div></div>';
            
            $('.direct-chat-messages').append(fromUserMessage);
            socket.emit('sendMessage', {
                message : message,
                fromUserId : loggedUserId,
                fromUser : loggedUserName,
                toUser : friendName,
                toUserId : friendId
            });
            /* inputBox.data('emojioneArea1').setText();    */
            el[0].emojioneArea.setText('');
        }
    });

    //Send Multiple files
    $('#send_mult_file').on('change', function(e){
        var files = event.target.files; 
        console.log(files);
    });

    //Send Image
    $('#send_file').on('change', function(e){

        myDate = new Date();
        monthDigit = myDate.getMonth();
        currentDate = ('0' + myDate.getDate()).slice(-2);
        currentMonth = months[monthDigit];
        currentHours = ('0' + myDate.getHours()).slice(- 2);
        currentMin = ('0' + myDate.getMinutes()).slice(-2);

        const files = e.currentTarget.files;
        console.log("File Length : " +files.length);

        if(files.length <= 5){
            Object.keys(files).forEach(i => {
                const file = files[i];
                var Extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
                console.log("Extension is : " +Extension);
                if(Extension == 'mp4' || Extension == 'flv'|| Extension == 'avi'){
                    const reader = new FileReader();
                    reader.onload = (e) => {

                        // get file content  
                        var bin = e.target.result;
                        var ownmessage ='<div class="direct-chat-msg right"><div class="direct-chat-info clearfix"></span><span class="direct-chat-timestamp pull-right">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><video src="'+bin+'" height="150px" width ="150px" style = "float : right;" controls></video></div>';
                    
                        $('.direct-chat-messages').append(ownmessage);
                    
                        socket.emit('sendImage', {
                            image :bin, 
                            fromUserId : loggedUserId,
                            fromUser:loggedUserName, 
                            toUser:friendName, 
                            toUserId : friendId,
                            imagename:file.name,
                            Extension : Extension
                        });
                    };
                    reader.readAsDataURL(file);
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {

                        // get file content  
                        var bin = e.target.result;
                        
                        var ownmessage ='<div class="direct-chat-msg right"><div class="direct-chat-info clearfix"></span><span class="direct-chat-timestamp pull-right">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><img src="'+bin+'" height="150px" width ="150px" style = "float : right;"/></div>';
                    
                        $('.direct-chat-messages').append(ownmessage);
                    
                        socket.emit('sendImage', {
                            image :bin, 
                            fromUserId : loggedUserId,
                            fromUser:loggedUserName, 
                            toUser:friendName, 
                            toUserId : friendId,
                            imagename:file.name
                        });
                    };
                    reader.readAsDataURL(file);
                }
                
            });
        } else{
            var mkConfig = {
                positionY: 'bottom',
                positionX: 'right',
                max: 5,
                scrollable: true
            };
            
            mkNotifications(mkConfig);
        
            mkNoti(
            'File limit exceed.',
            "Can't send more than 5 files together.",
            {
                status:'danger'
            }
            );
        } 
    });

    //Send Group File
    $('#send_grp_file').on('change', function(e){
        myDate = new Date();
        monthDigit = myDate.getMonth();
        currentDate = ('0' + myDate.getDate()).slice(-2);
        currentMonth = months[monthDigit];
        currentHours = ('0' + myDate.getHours()).slice(- 2);
        currentMin = ('0' + myDate.getMinutes()).slice(-2);

        const files = e.currentTarget.files;
        console.log("File Length : " +files.length);

        if(files.length <= 5){
            Object.keys(files).forEach(i => {
                const file = files[i];
                var Extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
                console.log("Extension is : " +Extension);
                if(Extension == 'mp4' || Extension == 'flv'|| Extension == 'avi'){
                    const reader = new FileReader();
                    reader.onload = (e) => {

                        // get file content  
                        var bin = e.target.result;
                        var ownmessage ='<div class="direct-chat-msg right fromUser"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-right">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="direct-chat-text" style="height:220px; width:220px;float:right; background-color:#f39c12;"><span style="color:white; font-size:15px; font-weight:bold; font-family:Helvetica">You</span><video src='+bin+' height="180px" width ="200px" style="margin-top:10px; padding-bottom:10px;" controls></video></div></div>';
                    
                        $('.direct-chat-messages').append(ownmessage);
                    
                        socket.emit('sendGroupImage', {
                            image :bin, 
                            fromUser:loggedUserName, 
                            grpName : grpName,
                            imagename:file.name,
                            Extension : Extension
                        });
                    };
                    reader.readAsDataURL(file);
                } if(Extension == 'pdf'){
                    const reader = new FileReader();
                    reader.onload = (e) => {

                        // get file content  
                        var bin = e.target.result;
                        console.log(e.target);
                        var ownmessage ='<div class="direct-chat-msg right fromUser"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-right">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="direct-chat-text" ><div class="row" style="margin-left:5px;"><span style="color:white; font-size:15px; font-weight:bold; font-family:Helvetica">You</span></div class="row"><div class="row" style="margin-left:5px;"><i class="fa  fa-file-pdf-o file-pdf" style=""><a href='+e.target.file+' target="_blank">'+file.name+'</a></i></div></div></div>';
                    
                        $('.direct-chat-messages').append(ownmessage);
                    
                        socket.emit('sendGroupImage', {
                            image :bin, 
                            fromUser:loggedUserName, 
                            grpName : grpName,
                            imagename:file.name,
                            Extension : Extension
                        });
                    };
                    reader.readAsDataURL(file);
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {

                        // get file content  
                        var bin = e.target.result;
                        console.log(e.target.result);
                        var ownmessage ='<div class="direct-chat-msg right"><div class="direct-chat-info clearfix"></span><span class="direct-chat-timestamp pull-right">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="direct-chat-text" style="height:220px; width:220px;;float:right; background-color:#f39c12;"><span style="color:white; font-size:15px; font-weight:bold; font-family:Helvetica">You</span><img src='+bin+' height="180px" width ="200px" style="margin-top:10px; padding-bottom:10px;"></div></div>';
                    
                        $('.direct-chat-messages').append(ownmessage);
                    
                        socket.emit('sendGroupImage', {
                            image :bin, 
                            fromUser:loggedUserName, 
                            grpName : grpName,
                            imagename:file.name
                        });
                    };
                    reader.readAsDataURL(file);
                }         
            });
        } else{
            var mkConfig = {
                positionY: 'bottom',
                positionX: 'right',
                max: 5,
                scrollable: true
              };
            
              mkNotifications(mkConfig);
            
              mkNoti(
                'File limit exceed.',
                "Can't send more than 5 files together.",
                {
                  status:'danger'
                }
              );
        }
    });

    //Send Group Message
    $("#sendGrpMessage").click(function(){
        var grpMessage = $('.grpMessage').val();
        
        //Get Current Date and Time
        myDate = new Date();
        monthDigit = myDate.getMonth();
        currentDate = ('0' + myDate.getDate()).slice(-2);
        currentMonth = months[monthDigit];
        currentHours = ('0' + myDate.getHours()).slice(- 2);
        currentMin = ('0' + myDate.getMinutes()).slice(-2);

        var grpFromUserMessage = '<div class="direct-chat-msg right fromUser"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-right">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="direct-chat-text"><div class="row" style="margin-left:5px;"><span style="color:white; font-size:15px; font-weight:bold; font-family:Helvetica">You</span></div><div class="row" style="margin-left:5px;">'+grpMessage+'</div></div></div>';

        $('.direct-chat-messages').append(grpFromUserMessage);

        if(grpMessage != '') {
            socket.emit('sendGrpMessage', {
                fromUser : loggedUserName,
                grpName : grpName,
                grpMessage : grpMessage,
            });
        }
    });

    //For count of notifications
    $.ajax({
        async: true,
        crossDomain: true,
        method : "POST",
        url : url+"getNotificationCount",
        "headers": {
            "authorization": token,
           /*  "Content-Type": "application/x-www-form-urlencoded", */
            "cache-control": "no-cache",               
          },
        contentType : "application/JSON"
    }).done(function(res){
        $("#notification-count").html(res.totalcount);
    }).fail(function(e, s, t){
    });

    //For onclick of notification dropdown and get records from database
    $("#req_notification").one("click" , function(e){
        e.preventDefault();
      
        $.ajax({
            async: true,
            crossDomain: true,
            type:"POST",
            url:url+"getRequests",
            "headers": {
                "authorization": token,
               /*  "Content-Type": "application/x-www-form-urlencoded", */
                "cache-control": "no-cache",               
            }
        }).done(function(res){     
            console.log(res);
            window.location = url+'showAllRequests';
        }).fail(function(e, s, t){
            console.log(e);
        });     
    });

    //To chat with particular user
    $("#chatTarget").on("click", "li.userName", function() {
        console.log("On click of LI: " +$(this).find('img').attr('src'));
        localStorage.setItem('friendName',$(this).find('span').html());
        localStorage.setItem('friendImg',$(this).find('img').attr('src'));

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
                localStorage.setItem('friendId', res.doc._id);
                console.log(localStorage);
                window.location = url+'privateChat';
            }
        }).fail(function(e, s, t){
            console.log("Error is : " +e);
        });
    });

    //For socket live notification
    socket.on('receiveChatRequestPrompt', (data) => {
        i++;
        notificationCount = i;
        $("#notification-count").html(i);
    });

    //Showing live message from socket for one-2-one chat
    socket.on('receiveMessageLi', (img, data) => {
        var unread = '<div class="chatTargetLi" style="margin-left:-10px; padding-top:15px; padding-bottom:15px;"><li class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="'+img+'" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor:pointer; margin-left: 15px;">'+data.fromUser+'</span></div></li></div>';
        
        $("#chatTargetUl").append(unread);  
    });

    //Showing live message from socket for groups
    socket.on('receiveGrpMessageLi', (img ,data) => {
        
        console.log($('.grpTargetLi').length);
        if($('.grpTargetLi').length == 0){
            if(img == undefined){
                var groupUnread = '<div class="grpTargetLi" style="margin-left:-10px; padding-top:15px; padding-bottom:15px;"><li class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="grpImage.png" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor:pointer; margin-left: 15px;">'+data.grpName+'</span></div></li></div>';
        
                $("#grpTargetUl").append(groupUnread);    
            } else {
                var groupUnread = '<div class="grpTargetLi" style="margin-left:-10px; padding-top:15px; padding-bottom:15px;"><li class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="'+img+'" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor:pointer; margin-left: 15px;">'+data.grpName+'</span></div></li></div>';
            
                $("#grpTargetUl").append(groupUnread);
            }
        } else{
            var arrayLi = [];
            $('.grpTargetLi').each(function () {
                var liGrpName = $(this).find('span').html();
                arrayLi.push(liGrpName);
                console.log(arrayLi);
            });

            for(var i=0; i<arrayLi.length; i++){
                
                if(arrayLi[i] != data.grpName){
                    console.log(data.grpName+ ' & ' +arrayLi[i]);
                    if(img == undefined){
                        var groupUnread = '<div class="grpTargetLi" style="margin-left:-10px; padding-top:15px; padding-bottom:15px;"><li class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="grpImage.png" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor:pointer; margin-left: 15px;">'+data.grpName+'</span></div></li></div>';
                
                        $("#grpTargetUl").append(groupUnread);    
                    } else {
                        var groupUnread = '<div class="grpTargetLi" style="margin-left:-10px; padding-top:15px; padding-bottom:15px;"><li class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="'+img+'" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor:pointer; margin-left: 15px;">'+data.grpName+'</span></div></li></div>';
                    
                        $("#grpTargetUl").append(groupUnread);
                    }    
                }
            }         
        }
    });

    //Showing requests data using socket
    socket.on('receiveFriendRequest', (data) => {
        var requestString = '<div class="requester-li"><sli class="userName" style="list-style:none;" id="x'+i+'"><div class="row"><div class="img_cont"><img src="'+data.imgSrc+'" class="rounded-circle user_img" style="margin-top:-10px; width:50px; height:50px;"></div><span class="requster-name" id="x'+i+'" style="cursor : pointer; margin-left:15px;">'+data.fromUser+'</span><button type="button" style="width:10%; float: right;margin-right:15px;" class="btn btn-block btn-danger btn-sm reject1">Reject</button><button type="button" style="width:10%; float: right; margin-right: 20px;margin-top: 0px;" class="accept1 btn btn-block btn-success btn-sm" id="accept'+i+'">Accept</button></div></li></div>';

        $("#myRequests").append(requestString);
    });

    //Decreament notification
    socket.on('decrementNotification', (data) => {
        i--;
        if(i <= 0){
            $("#notification-count").html(0);
        } else{
            $("#notification-count").html(i);
        }
    });

    //Get message from another user
    socket.on('sentMessage', (data) => {
            myDate = new Date();
            monthDigit = myDate.getMonth();
            currentDate = ('0' + myDate.getDate()).slice(-2);
            currentMonth = months[monthDigit];
            currentHours = ('0' + myDate.getHours()).slice(- 2);
            currentMin = ('0' + myDate.getMinutes()).slice(-2);
            var message = $('.msgText').val();
            
            var messageDiv = '<div class="direct-chat-msg"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-left">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="direct-chat-text fromUserMessage">'+data.message+'</div></div>';

            $('.direct-chat-messages').append(messageDiv);
    });

    //Received Image from Socket
    socket.on('sentImage', (data)=>{
        
        var i = 0;
        if(data.fromUser != friendName){
            i++;
            $("#notification-count").html(i);
        } else {
            myDate = new Date();
            monthDigit = myDate.getMonth();
            currentDate = ('0' + myDate.getDate()).slice(-2);
            currentMonth = months[monthDigit];
            currentHours = ('0' + myDate.getHours()).slice(- 2);
            currentMin = ('0' + myDate.getMinutes()).slice(-2);
            
            var filename = data.imagename.substring(data.imagename.lastIndexOf('/') + 1).toLowerCase();
            var Extension = data.imagename.substring(data.imagename.lastIndexOf('.') + 1).toLowerCase();

            if(Extension == 'mp4' || Extension == 'flv'|| Extension == 'avi'){
                var friendusermessage ='<div class="direct-chat-msg"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-left">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="overlay-container"><video src="'+data.image+'" height="150px" width ="150px" controls></video><div class="overlay"><p class="downloadImg">Download<p></div></div></div>';
                $('.direct-chat-messages').append(friendusermessage);
            } else {
                var friendusermessage ='<div class="direct-chat-msg"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-left">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="overlay-container"><img src="'+data.image+ '" id="downloadImg" height="150px" width ="150px"/><div class="overlay"><p class="downloadImg">Download<p></div></div></div>';
                $('.direct-chat-messages').append(friendusermessage);
            } 
        }
    });

    //Get group messages
    socket.on('RoomMessage', (data)=>{
        console.log('data : ' +data.fromUser);

        if(data.fromUser == loggedUserName){
            $('.direct-chat-messages').append();
        } else {
            myDate = new Date();
            monthDigit = myDate.getMonth();
            currentDate = ('0' + myDate.getDate()).slice(-2);
            currentMonth = months[monthDigit];
            currentHours = ('0' + myDate.getHours()).slice(- 2);
            currentMin = ('0' + myDate.getMinutes()).slice(-2);

            var grpMessageDiv = '<div class="direct-chat-msg"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-left">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="direct-chat-text fromUserMessage"><div class="row" style="margin-left:5px;"><span style="color:black; font-size:15px; font-weight:bold; font-family:Helvetica">'+data.fromUser+'</span></div><div class="row" style="margin-left:5px;">'+data.grpMessage+'</div></div></div>';

            $('.direct-chat-messages').append(grpMessageDiv);
        }
    });

    //Get Group chat notification
    socket.on('ReceiveGrpNotification', (data) => {
       
        if(data.fromUser == loggedUserName){
            $('#notification-count').html();
        } else {
            i++;
            notificationCount = i;
            $("#notification-count").html(notificationCount);
        }
    });

    //Receive sent image from group
    socket.on('GroupImageSent', (data) => {
        
        if(data.fromUser == loggedUserName){
            $('#notification-count').html();
        }  else {
            myDate = new Date();
            monthDigit = myDate.getMonth();
            currentDate = ('0' + myDate.getDate()).slice(-2);
            currentMonth = months[monthDigit];
            currentHours = ('0' + myDate.getHours()).slice(- 2);
            currentMin = ('0' + myDate.getMinutes()).slice(-2);
            
            var filename = data.imagename.substring(data.imagename.lastIndexOf('/') + 1).toLowerCase();
            var Extension = data.imagename.substring(data.imagename.lastIndexOf('.') + 1).toLowerCase();

            if(Extension == 'mp4' || Extension == 'flv'|| Extension == 'avi'){
                var friendusermessage ='<div class="direct-chat-msg"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-left">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="overlay-container"><video src="'+data.image+'" height="150px" width ="150px" controls></video><div class="overlay"><p class="downloadImg">Download<p></div></div></div>';
                $('.direct-chat-messages').append(friendusermessage);
            } else {
                var friendusermessage ='<div class="direct-chat-msg"><div class="direct-chat-info clearfix"><span class="direct-chat-timestamp pull-left">'+currentDate+ " " +currentMonth+ " " +currentHours+ ":" +currentMin+'</span></div><div class="direct-chat-text" style="height:220px; width:220px;;background-color:#d2d6de;"><span style="color:black; font-size:15px; font-weight:bold; font-family:Helvetica">'+data.fromUser+'</span><div class="overlay-container" style="height:180px; width:200px; max-width:200px;"><img src='+data.image+' height="180px" width ="200px" style="margin-top:10px; padding-bottom:10px;"><div class="overlay"><p class="downloadImg">Download<p></div></div></div></div>';
                $('.direct-chat-messages').append(friendusermessage);
            } 
        }
    });

    //Donwload Image
    $(document).one("click",".downloadImg", function(){
        var imgagePath = $(this).parent().parent().find('img').attr('src');
        var imageData = {
          imgagePath : imgagePath
        };
  
        var file_path = imgagePath;
        var a = document.createElement('A');
        a.href = file_path;
        a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });


    /* =========================  For Video call ============================= */

    //For video call
    const localVideo = document.querySelector('.localVideo');
    const remoteVideos = document.querySelector('.remoteVideos');
    const peerConnections = {};
    let getUserMediaAttempts = 5;
    let gettingUserMedia = false;
    /* let room = !location.pathname.substring(1) ? 'home' : location.pathname.substring(1); */
    var loalStream;

    //Config server
    const config = {
        'iceServers': [{
          'urls': ['stun:stun.l.google.com:19302']
        }]
    };

    //Video & audio options
    const constraints = {
        audio: true,
        video: { facingMode: "user" }
    };

   /*  socket.on('full', function(room) {
        alert('Room ' + room + ' is full');
    }); */

    //Sending Video call notification to receiver
    $('.videoCall').click(function(){
        socket.emit('sendVideoNotification', {
            fromUser : loggedUserName,
            toUser : friendName
        });
    });

    //Get Video call notification from callee
    socket.on('getVideoNotification', (data) => {
        var fromUser = data.fromUser;
        swal({
            title: data.fromUser+ ' is calling you.',
            buttons: ['End', 'Receive'],
            closeOnClickOutside: false
          }).then((isConfirm) => {
            if (isConfirm) {
              /* window.location = url+'videoCall'; */
              window.open(url+'videoCall', '_blank','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=1024,height=768');
            } else{
                console.log(data.fromUser);
                socket.emit('DeniedCall');        
            }
        });
    });

    //Click on cut button
    $("#hangUp").click(function(){
        socket.emit('HangUp');
       
        /* window.location = url+'privateChat'; */
        window.close();
    });
    
    //Cut the call
    socket.on('bye', function(id) {
        handleRemoteHangup(id); 
    });

    //Join room
    /* if (room && !!room) {
        socket.emit('joinVideoRoom', room);
    } */

    //While videoCall.html open this socket event will be emmitted from sever
    socket.on('readyForVideo', function (id) {
        if (!(localVideo instanceof HTMLVideoElement) || !localVideo.srcObject) {
            return;
        }
        const peerConnection = new RTCPeerConnection(config);
        peerConnections[id] = peerConnection;
        if (localVideo instanceof HTMLVideoElement) {
            peerConnection.addStream(localVideo.srcObject);
        }
        peerConnection.createOffer()
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(function () {
            socket.emit('offer', id, peerConnection.localDescription);
        });
        peerConnection.onaddstream = event => handleRemoteStreamAdded(event.stream, id);
        peerConnection.onicecandidate = function(event) {
            if (event.candidate) {
                socket.emit('candidate', id, event.candidate);
            }
        };
    });

    //Make a call
    socket.on('offer', function(id, description) {
        const peerConnection = new RTCPeerConnection(config);
        peerConnections[id] = peerConnection;
        if (localVideo instanceof HTMLVideoElement) {
        peerConnection.addStream(localVideo.srcObject);
        }
        peerConnection.setRemoteDescription(description)
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(function () {
        socket.emit('answer', id, peerConnection.localDescription);
        });
        peerConnection.onaddstream = event => handleRemoteStreamAdded(event.stream, id);
        peerConnection.onicecandidate = function(event) {
            if (event.candidate) {       
                socket.emit('candidate', id, event.candidate);
            }
        };
    });

    //Add user to peerconnection object
    socket.on('candidate', function(id, candidate) {
        peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
    });

    //While picking up call
    socket.on('answer', function(id, description) {
        peerConnections[id].setRemoteDescription(description);
    });

    function getUserMediaSuccess(stream) {
        gettingUserMedia = false;
        loalStream = stream;
        if (localVideo instanceof HTMLVideoElement) {
            !localVideo.srcObject && (localVideo.srcObject = stream);
        }
        socket.emit('initiateVideoCall', {
            toUser : friendName
        });
    }

    //Hold / unload call
    $('.holdCall').click(function(){
        if(loalStream.getVideoTracks()[0].enabled == false){
            loalStream.getVideoTracks()[0].enabled = true;
            socket.emit('callUnHold',{
                fromUser : loggedUserName,
                toUser : friendName
            });   
        } else{
            loalStream.getVideoTracks()[0].enabled = false;
            socket.emit('callOnHold',{
                fromUser : loggedUserName,
                toUser : friendName
            });
        }     
    });

    //Hold video
    socket.on('callOnHold', (id, data)=>{
        $('.onHold').css('display', 'block');
        $('.onHold p').html(data.fromUser+ ' has hold your call');
    });

    //Video Resume
    socket.on('callUnHold', (id, data)=>{
        $('.onHold').css('display', 'none');
    });

    //Mute and unmute audio
    $('.muteCall').click(function(){
        if(loalStream.getAudioTracks()[0].enabled == false){
            loalStream.getAudioTracks()[0].enabled = true;
        } else{
            loalStream.getAudioTracks()[0].enabled = false;
        }
    });

    //Show video from receiver (Remote Video)
    function handleRemoteStreamAdded(stream, id) {
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = stream;
        remoteVideo.setAttribute("id", id.replace(/[^a-zA-Z]+/g, "").toLowerCase());
        remoteVideo.setAttribute("playsinline", "true");
        remoteVideo.setAttribute("autoplay", "true");
        remoteVideos.appendChild(remoteVideo);

        if (remoteVideos.querySelectorAll("video").length === 1) {
        remoteVideos.setAttribute("class", "one remoteVideos");
        } else {
        remoteVideos.setAttribute("class", "remoteVideos");
        }
    }

    //Error in opening camera
    function getUserMediaError(error) {
        console.error(error);
        gettingUserMedia = false;
        (--getUserMediaAttempts > 0) && setTimeout(getUserMediaDevices, 1000);
    }

    //Get user media(open camera)
    function getUserMediaDevices() {
        if (localVideo instanceof HTMLVideoElement) {
        if (localVideo.srcObject) {
            getUserMediaSuccess(localVideo.srcObject);
        } else if (!gettingUserMedia && !localVideo.srcObject) {
            gettingUserMedia = true;
            navigator.mediaDevices.getUserMedia(constraints)
            .then(getUserMediaSuccess)
            .catch(getUserMediaError);
        }
        }
    }

    function handleRemoteHangup(id) {
        peerConnections[id] && peerConnections[id].close();
        delete peerConnections[id];
        /* document.querySelector("#" + id.replace(/[^a-zA-Z]+/g, "").toLowerCase()).remove(); */
        if (remoteVideos.querySelectorAll("video").length === 1) {
        remoteVideos.setAttribute("class", "one remoteVideos");
        } else {
        remoteVideos.setAttribute("class", "remoteVideos");
        }

        window.close();
        
    }

    getUserMediaDevices();
});
