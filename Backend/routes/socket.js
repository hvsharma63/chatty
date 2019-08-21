/* 
    File : socket.js
    v1.0
    Desc : Server side socket file to manage sockets and all emitted events
    Developed By : Ishan Bhatt
*/

//Modules
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

//Models
var user = require('../models/user.model');
var requests = require('../models/request.model');
var  chat = require('../models/chat.model');
var  group = require('../models/group.model');
var groupChat = require('../models/groupChat.model');
var groupNotification = require('../models/groupNotification.model');


//Global variables/objs
var user_socket_id  = {};
var unique_id;
var chatRoom;
var fromUser,toUser;
var sess,newPerson;
//All Socket Communication
exports = module.exports = function(io) {
    io.sockets.on('connection', (socket) => {
        
        //Get socket ids for logged in user
        socket.on('join', (req) => {
            console.log("From Video Call",req.user_id);
            if (req.user_id != 0) {
                socket.join(req.user_id);
                user[socket.id] = req.user_id;
                user_socket_id[req.user_id] = socket.id;
                unique_id = user_socket_id[req.user_id];
                /* console.log(user); */
                console.log("Socket ID of Logged In User : " +user_socket_id[req.user_id]);
                console.log("===========================================================");
            } else {
              console.log('no user_id');
              console.log("===========================================================");
            }  
        });
    
        //Emitting event of send request
        socket.on('sendRequest', (data) => {
            console.log("Logged In User From Main.js File:" +data.fromUser);
            console.log("Requested User From Main.js File:" +data.toUser);
            console.log("Requested user image : " +data.imgSrc);
            
            user.findOne({ username : data.fromUser }, (err, resFromUser) => {
                if(err) {
                    return err;
                } else {
                    fromUser = resFromUser._id;
                    user.findOne({username : data.toUser}, (err,resToUser) => {
                        if(err) {
                            return err;
                        } else{
                            toUser = resToUser._id;    
                            console.log("From user and to user is : " +fromUser+ ' ' +toUser);
                            console.log("===========================================================");

                            requests.find({$and:[ {"fromUser" : fromUser}, {"toUser" : toUser}, {"reject_status" : false} ]}, (err,doc) => {
            
                                if(doc.length == 0) {
                                    
                                    var requestModel = new requests();    
                                    requestModel.fromUser = fromUser,
                                    requestModel.toUser = toUser;
                                    requestModel.request_status = 0; //0 for pending requests
                                    requestModel.request_sent = 1; //1 for knowing that request is sent
                                    requestModel.reject_status = 0; //0 for not rejected and for 1 vice-versa
                                    requestModel.read_status = 0; // 0 for unread message
                                    requestModel.save(function(err,doc){});

                                    console.log("Request Sent successfully and stored in DB");
                                    console.log("Socket ID for toUser : " +user_socket_id[data.toUser]);  
                                    console.log("===========================================================");
                                    io.to(user_socket_id[data.toUser]).emit('receiveChatRequestPrompt', data); 
                                    io.to(user_socket_id[data.toUser]).emit('receiveFriendRequest', data); 
                                
                                } else {
                                     
                                    console.log("Showing User data for sending requests in for socket : " +doc[0].request_status);
                                    console.log("===========================================================");
                                    if(doc[0].request_status == 0 && doc[0].request_sent == 0) {
                                    
                                        var requestModel = new requests();    
                                        requestModel.fromUser = fromUser,
                                        requestModel.toUser = toUser;
                                        requestModel.request_status = 0; //0 for pending requests
                                        requestModel.request_sent = 1; //1 for knowing that request is sent
                                        requestModel.reject_status = 0; //0 for not rejected and for 1 vice-versa
                                        requestModel.read_status = 0; // 0 for unread message
                                        requestModel.save(function(err,doc){});
                                        console.log("INSERTED SUCCESSFULLY");
                                        console.log("FOR CHECKING :" +user_socket_id[data.toUser]);  
                                        io.to(user_socket_id[data.toUser]).emit('receiveChatRequestPrompt', data);   
                                        io.to(user_socket_id[data.toUser]).emit('receiveFriendRequest', data); 
                                    
                                    }  else if( doc[0].request_sent == 1 ) {
                                        io.to(user_socket_id[data.fromUser]).emit('alreadyRequestSent', data);
                                    }
                                }
                            });
                        }
                    });
                }
            });
        });

        //Emit event for send message
        socket.on('sendMessage', (data) => {  
            console.log("For sending message : Logged In User From Main.js File:" +data.fromUser);
            console.log("For sending message : Message sent to User From Main.js File:" +data.toUser);
            console.log("For sending message : Message is : " +data.message);
            console.log("===========================================================");
            var chatModel = new chat();
           
            user.findOne({ username : data.fromUser }, (err, resFromUser) => {
                if(err) {
                    return err;
                } else {
                    fromUser = resFromUser._id;
                    user.findOne({username : data.toUser}, (err,resToUser) => {
                        if(err) {
                            return err;
                        } else{
                            toUser = resToUser._id;    
                        }
                        console.log("NEW ONE FNAME : " +fromUser+ ' ' +toUser );
                        user.find({ $and : [{ "_id" : toUser }, { "is_online" : true }] }, (err, doc1) => {
                            if(doc1.length <= 0) {
                                chat.find({ $or : [{ $and : [{ "fromUser": fromUser }, { "toUser" : toUser }] }, { $and : [{ "fromUser": toUser }, { "toUser" : fromUser }] }] }, (err, res) => {
                                    if(res.length <= 0){
                                        console.log("FIRST");
                                        chatModel.fromUser = fromUser;
                                        chatModel.toUser = toUser;
                                        chatModel.message = data.message;
                                        chatModel.read_status = 0; //For notitication functionality
                                        chatModel.chatUniqueId = unique_id;
                                        chatModel.save(function(err,doc){});
            
                                        io.to(user_socket_id[data.toUser]).emit('sentMessage', data); 
                                        io.to(user_socket_id[data.toUser]).emit('receiveChatRequestPrompt', data); 
                                        io.to(user_socket_id[data.toUser]).emit('receiveMessageLi',resFromUser.img_upload,data);
                                    }  else {
                                        console.log("SECOND");
                                        chatModel.fromUser = fromUser;
                                        chatModel.toUser = toUser;
                                        chatModel.message = data.message;
                                        chatModel.read_status = 0; //For notitication functionality
                                        chatModel.chatUniqueId = res[0].chatUniqueId;
                                        chatModel.save(function(err,doc){});
                                        
                                        io.to(user_socket_id[data.toUser]).emit('sentMessage', data, ); 
                                        io.to(user_socket_id[data.toUser]).emit('receiveChatRequestPrompt', data); 
                                        io.to(user_socket_id[data.toUser]).emit('receiveMessageLi',resFromUser.img_upload,data);
                                        }
                                    });
                                } else {
                                    chat.find({ $or : [{ $and : [{ "fromUser": fromUser }, { "toUser" : toUser }] }, { $and : [{ "fromUser": toUser }, { "toUser" : fromUser }] }] }, (err, res) => {
                                        if(res.length <= 0){
                                            console.log("THIRD");
                                            chatModel.fromUser = fromUser;
                                            chatModel.toUser = toUser;
                                            chatModel.message = data.message;
                                            chatModel.read_status = 1; //For notitication functionality
                                            chatModel.chatUniqueId = unique_id;
                                            chatModel.save(function(err,doc){});   
                                        }  else {           
                                            console.log("FOURTH");
                                            chatModel.fromUser = fromUser;
                                            chatModel.toUser = toUser;
                                            chatModel.message = data.message;
                                            chatModel.read_status = 1; //For notitication functionality
                                            chatModel.chatUniqueId = res[0].chatUniqueId;
                                            chatModel.save(function(err,doc){});
                                        }


                                        try {
                                            fs.appendFileSync('G:/Work/socket_backup/backup1/Socket_v2.0/public/media/'+res[0].chatUniqueId+'/message.txt', data.fromUser+ ":" +data.message);
                                            console.log('The "data to append" was appended to file!');
                                          } catch (err) {
                                            /* Handle the error */
                                        }   
                                        
                                        chat.update({
                                            "fromUser" : toUser,
                                            "toUser" : fromUser
                                        }, {
                                            $set : {
                                                read_status : true
                                            }
                                        }, {
                                            multi :true
                                        },function(err, result) {
                                            if(err){
                                                return err;
                                            } else{
                                                console.log("Update read status from Socket : " +result);
                                                console.log("===========================================================");
                                            }
                                        });     
                                        io.to(user_socket_id[data.toUser]).emit('sentMessage', data); 
                                    });
                                } 
                        });
                    });
                }
            });
        });

        //Send Image
        socket.on('sendImage', function (data) {
            var filename = data.imagename;
            var fromUserId = data.fromUserId;
            var toUserId = data.toUserId;
            var fromUser = data.fromUser;
            var toUser = data.toUser;
            var fileSent, fileReceived, FroUserImage;

            console.log("From and to id : " +fromUserId+ ' ' +toUserId);
            /* var image = data.image.replace(/^data:([A-Za-z-+/]+);base64,/, ""); */
            var image = data.image.replace(/^data:(.*?);base64,/, "");
            user.findOne({ "_id" : fromUserId }, (err, resFromUser) => {
                if(resFromUser){
                    FroUserImage = resFromUser.img_upload;
                }
            });
            user.find({ $and : [{ "_id" : toUserId }, { "is_online" : true }] }, (err, doc1)=>{
             
              if(doc1.length <= 0) {
                chat.find({ $or : [{ $and : [{ "fromUser": fromUserId }, { "toUser" : toUserId }] }, { $and : [{ "fromUser": toUserId }, { "toUser" : fromUserId }] }] }, (err, res) => {
                    if(res.length <= 0){

                        console.log("Inside return 1");
                        function checkCreateDirectory(){
                            return new Promise((resolve,reject) =>{
                            
                                mkdirp('media/'+unique_id+'/'+fromUser+'/sent',function(err,result){
                                    resolve({result:'success'});
                                });
                                
                                mkdirp('media/'+unique_id+'/'+fromUser+'/received',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+unique_id+'/'+toUser+'/sent',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+unique_id+'/'+toUser+'/received',function(err,result){
                                    resolve({result:'success'});
                                });
                            });
                        }
                        
                        return checkCreateDirectory().then(Response => {
                            var filepath = path.resolve('../Backend/media/'+unique_id+'/'+fromUser+'/sent/'+filename);
                            var file1path = path.resolve('../Backend/media/'+unique_id+'/'+toUser+'/received/'+filename);
                           
                            fs.writeFile(filepath, image.replace(/ /g, "+"), 'base64', function(err,result){
                            fs.writeFile(file1path, image.replace(/ /g, "+"), 'base64', function(){});
                            if(err){
                                console.log("ERR"+err);
                            } else{
                                var chatModel = new chat();
                                chatModel.fromUser = fromUserId;
                                chatModel.toUser = toUserId;
                                chatModel.image = unique_id+'/'+fromUser+'/sent/'+filename;
                                chatModel.read_status = 0; //For notitication functionality
                                chatModel.chatUniqueId = unique_id;
                                chatModel.save(function(err,doc){});    

                                //For live results
                                io.to(user_socket_id[data.toUser]).emit('sentImage', data); 
                                io.to(user_socket_id[data.toUser]).emit('receiveChatRequestPrompt', data); 
                                io.to(user_socket_id[data.toUser]).emit('receiveMessageLi',FroUserImage,data);
                            }
                        });
                        }).catch(err =>{
                            console.log("catch error" + err);
                        });       
                    } else {
                    
                        console.log("Inside return 2");
                        function checkCreateDirectory(){
                            return new Promise((resolve,reject) =>{
                                mkdirp('media/'+res[0].chatUniqueId+'/'+fromUser+'/sent',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+res[0].chatUniqueId+'/'+fromUser+'/received',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+res[0].chatUniqueId+'/'+toUser+'/sent',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+res[0].chatUniqueId+'/'+toUser+'/received',function(err,result){
                                    resolve({result:'success'});
                                });
                            });
                        }

                        return checkCreateDirectory().then(Response =>{
                            var filepath = path.resolve('../Backend/media/'+res[0].chatUniqueId+'/'+fromUser+'/sent/'+filename);
                            var file1path = path.resolve('../Backend/media/'+res[0].chatUniqueId+'/'+toUser+'/received/'+filename);
                                       
                            fs.writeFile(filepath, image.replace(/ /g, "+"), 'base64', function(err,result){
                            fs.writeFile(file1path, image.replace(/ /g, "+"), 'base64', function(){});
                            if(err){
                                console.log("ERR"+err);
                            } else{
                                var chatModel = new chat();
                                chatModel.fromUser = fromUserId;
                                chatModel.toUser = toUserId;
                                chatModel.image = res[0].chatUniqueId+'/'+fromUser+'/sent/'+filename;
                                chatModel.read_status = 0; //For notitication functionality
                                chatModel.chatUniqueId = res[0].chatUniqueId;
                                chatModel.save(function(err,doc){});

                                //For live results
                                io.to(user_socket_id[data.toUser]).emit('sentImage', data); 
                                io.to(user_socket_id[data.toUser]).emit('receiveChatRequestPrompt', data); 
                                io.to(user_socket_id[data.toUser]).emit('receiveMessageLi',FroUserImage,data);
                            }
                        });
                        }).catch(err =>{
                            console.log("catch error" + err);
                        });
                    }
                });
              } else{

                chat.find({ $or : [{ $and : [{ "fromUser": fromUserId }, { "toUser" : toUserId }] }, { $and : [{ "fromUser": toUserId }, { "toUser" : fromUserId }] }] }, (err, res) => {
                    if(res.length <= 0){
                        console.log("Inside return 3");
                        function checkCreateDirectory(){
                            return new Promise((resolve,reject) =>{
                                mkdirp('media/'+unique_id+'/'+fromUser+'/sent',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+unique_id+'/'+fromUser+'/received',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+unique_id+'/'+toUser+'/sent',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+unique_id+'/'+toUser+'/received',function(err,result){
                                    resolve({result:'success'});
                                });
                            });
                        }

                        return checkCreateDirectory().then(Response =>{
                            var filepath = path.resolve('../Backend/media/'+unique_id+'/'+fromUser+'/sent/'+filename);
                            var file1path = path.resolve('../Backend/media/'+unique_id+'/'+toUser+'/received/'+filename);
                            
                            fs.writeFile(filepath, image.replace(/ /g, "+"), 'base64', function(err,result){
                            fs.writeFile(file1path, image.replace(/ /g, "+"), 'base64', function(){});
                            if(err){
                                console.log("ERR"+err);
                            } else{
                                var chatModel = new chat();
                                chatModel.fromUser = fromUserId;
                                chatModel.toUser = toUserId;
                                chatModel.image = unique_id+'/'+fromUser+'/sent/'+filename;;
                                chatModel.read_status = 1; //For notitication functionality
                                chatModel.chatUniqueId = unique_id;
                                chatModel.save(function(err,doc){});
                                
                                //Updating read status (vice-versa)
                                chat.update({
                                    "fromUser" : toUserId,
                                    "toUser" : fromUserId
                                }, {
                                    $set : {
                                        read_status : true
                                    }
                                }, {
                                    multi :true
                                },function(err, result) {
                                    if(err) {
                                        return err;
                                    } else {
                                        console.log("Success");
                                    }
                                });

                                //For live results
                                io.to(user_socket_id[data.toUser]).emit('sentImage', data);
                            }
                        });
                        }).catch(err =>{
                            console.log("catch error" + err);
                        });

                    } else {
                        console.log("Inside return 4");
                        function checkCreateDirectory(){
                            return new Promise((resolve,reject) =>{
                                mkdirp('media/'+res[0].chatUniqueId+'/'+fromUser+'/sent',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+res[0].chatUniqueId+'/'+fromUser+'/received',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+res[0].chatUniqueId+'/'+toUser+'/sent',function(err,result){
                                    resolve({result:'success'});
                                });
                                mkdirp('media/'+res[0].chatUniqueId+'/'+toUser+'/received',function(err,result){
                                    resolve({result:'success'});
                                });
                            });
                        }

                        return checkCreateDirectory().then(Response =>{
                            var filepath = path.resolve('../Backend/media/'+res[0].chatUniqueId+'/'+fromUser+'/sent/'+filename);
                            var file1path = path.resolve('../Backend/media/'+res[0].chatUniqueId+'/'+toUser+'/received/'+filename);
                            
                            fs.writeFile(filepath, image.replace(/ /g, "+"), 'base64', function(err,result){
                            fs.writeFile(file1path, image.replace(/ /g, "+"), 'base64', function(){});
                            if(err){
                                console.log("ERR"+err);
                            } else{
                                var chatModel = new chat();
                                chatModel.fromUser = fromUserId;
                                chatModel.toUser = toUserId;
                                chatModel.image = res[0].chatUniqueId+'/'+fromUser+'/sent/'+filename;
                                chatModel.read_status = 1; //For notitication functionality
                                chatModel.chatUniqueId = res[0].chatUniqueId;
                                chatModel.save(function(err,doc){});
                                            
                                //Updating read status (vice-versa)
                                chat.update({
                                    "fromUser" : toUserId,
                                    "toUser" : fromUserId
                                }, {
                                    $set : {
                                        read_status : true
                                    }
                                }, {
                                    multi :true
                                },function(err, result) {
                                    if(err) {
                                        return err;
                                    } else {
                                        console.log("Success");
                                    }
                                });

                                //For live results
                                io.to(user_socket_id[data.toUser]).emit('sentImage', data);
                            }
                        });
                        }).catch(err =>{
                            console.log("catch error" + err);
                        });
                    }
                });  
            }});
        });

        //Create chatroom dynamically
        socket.on('create', function(data) {
            console.log("Connected to chatroo : " +data.grpName);
            console.log("Hyy");
            chatRoom = data.grpName;
            group.findOne({ "group_name" :  data.grpName} , (err, grp) => {
                console.log("HYY");
                if(!err) {
                    socket.join(data.grpName); 
                }
            });
        });

        //Send message to particular group
        socket.on('sendGrpMessage', function(data) {
            var grpImage;
            /* console.log('From User & Group Name & Message : ' +data.fromUser+ ' ' +data.grpName+ ' ' +data.grpMessage); */
            var grpMessage = data.grpMessage;
            group.findOne({ "group_name" :  data.grpName} , (err, grp) => {
                if(!err) {
                    grpImage = grp.group_image;
                    function saveGroupMessage(){
                        return new Promise((resolve, reject) => {
                            console.log("Hello");
                            var groupChatModel = new groupChat();
                            groupChatModel.fromUser = data.fromUser;
                            groupChatModel.group_id = grp._id;
                            groupChatModel.message = data.grpMessage;
                            groupChatModel.save(function(err, result){
                                resolve({result:'success'});
                            });
                        });
                    }

                    return saveGroupMessage().then(Response => {
                        var readByUsers = [];
                        var grpMembers = grp.group_members.length;
                        
                        //Find Last Document from DB
                        groupChat.find({"group_id" : grp._id} ).sort({$natural : -1}).limit(1).then(
                            function(doc){
                                console.log("Doc is : ", doc);
                        
                                for(var j=0; j<grpMembers; j++){
                                    if(grp.group_members[j].online_status == true){
                                        readByUsers.push(grp.group_members[j].members)
                                    }
                                } 

                                //Update read_by array for notification
                                groupChat.update({
                                    "_id" : doc[0]._id
                                }, {
                                    $set : {
                                        "read_by" : readByUsers
                                    }
                                },function(err, success){
                                    console.log("Succes from update : ",success);
                                }  
                                );
                        });

                        //For sending notification particular user
                        for(var i=0; i<grpMembers; i++){
                            if(grp.group_members[i].online_status == false){
                                io.to(user_socket_id[grp.group_members[i].members]).emit('receiveChatRequestPrompt', data);
                                io.to(user_socket_id[grp.group_members[i].members]).emit('receiveGrpMessageLi',grpImage,data);
                            }
                        }
                        
                        io.sockets.in(data.grpName).emit('RoomMessage', data); 
                    });
                }
            });
        });

        //send Group Image
        socket.on('sendGroupImage', function(data){
            var grpName = data.grpName;
            var fromUser = data.fromUser;
            var Grpfilename = data.imagename;
            var fileSent, fileReceived;

            var grpImage;
            console.log("From user and group name : " +fromUser+ ' ' +grpName);
            var image = data.image.replace(/^data:(.*?);base64,/, "");
            group.findOne({ "group_name" :  data.grpName} , (err, grp) => {
                if(!err) {
                    grpImage = grp.group_image;
                    function saveGroupImage(){

                        return new Promise((resolve,reject) =>{
                            console.log("Hello 1");
                            mkdirp('groupimages/'+data.grpName+'/'+fromUser+'/sent',function(err,result){
                                resolve({result:'success'});
                            });
                        
                            var groupChatModel = new groupChat();
                            groupChatModel.fromUser = data.fromUser;
                            groupChatModel.group_id = grp._id;
                            groupChatModel.image = Grpfilename;
                            groupChatModel.save(function(err, result){
                                resolve({result:'success'});
                            });   
                        });
                    }

                    return saveGroupImage().then(Response => {
                        console.log("Hello 2");
                        var readByUsers = [];
                        var grpMembers = grp.group_members.length;
                        var filepath = path.resolve('../Backend/groupimages/'+data.grpName+'/'+fromUser+'/sent/'+Grpfilename);
                        fs.writeFile(filepath, image.replace(/ /g, "+"), 'base64', function(err,result){
                            if(err){
                                console.log("ERR"+err);
                            } else{
                                //Find Last Document from DB
                                groupChat.find({"group_id" : grp._id} ).sort({$natural : -1}).limit(1).then(
                                    function(doc){
                                        console.log("Doc is : ", doc);
                                        
                                        //Check which members are online
                                        for(var j=0; j<grpMembers; j++){
                                            if(grp.group_members[j].online_status == true){
                                                readByUsers.push(grp.group_members[j].members)
                                            }
                                        } 

                                        //Update read_by array for notification
                                        groupChat.update({
                                            "_id" : doc[0]._id
                                            }, {
                                                $set : {
                                                    "read_by" : readByUsers
                                                }
                                            },function(err, success){
                                                console.log("Succes from update : ",success);
                                            }  
                                        );
                                    }
                                );

                                //For sending notification particular user
                                for(var i=0; i<grpMembers; i++){
                                    if(grp.group_members[i].online_status == false){
                                        io.to(user_socket_id[grp.group_members[i].members]).emit('receiveChatRequestPrompt', data);
                                        io.to(user_socket_id[grp.group_members[i].members]).emit('receiveGrpMessageLi',grpImage,data);
                                    }
                                }
                                
                                io.sockets.in(data.grpName).emit('GroupImageSent', data);
                            }
                        });
                    });
                }
            });
        });

        //For video notification from callee
        socket.on('sendVideoNotification', function(data){
            newPerson = data.fromUser;
            console.log("From user and touser is : " +data.fromUser+ ' ' +data.toUser);
            io.to(user_socket_id[data.toUser]).emit('getVideoNotification', data); 
        });

        //Video Call  joinVideoRoom          
        var sockeId;

        //Video Call Initiation
        socket.on('initiateVideoCall', function(data) {
            sockeId = data.toUser;
            io.to(user_socket_id[data.toUser]).emit('readyForVideo', data.toUser); 
        });

        socket.on('offer', function (id, message) {
            
            io.to(user_socket_id[sockeId]).emit('offer', sockeId, message);
        });

        socket.on('answer', function (id, message) {
            io.to(user_socket_id[sockeId]).emit('answer', sockeId, message);
        });
        
        socket.on('candidate', function (id, message) {
            io.to(user_socket_id[sockeId]).emit('candidate', sockeId, message);
        });

        socket.on('callOnHold', function(data){
            io.to(user_socket_id[sockeId]).emit('callOnHold', sockeId, data);
        });

        socket.on('callUnHold', function(data){
            io.to(user_socket_id[sockeId]).emit('callUnHold', sockeId, data);
        });

        socket.on('HangUp', function() {
            io.to(user_socket_id[sockeId]).emit('bye', sockeId);
        });

        socket.on('DeniedCall', function() {
            /*  console.log("Denie Call", +data.fromUser); */
            io.to(user_socket_id[newPerson]).emit('bye', newPerson);
        });
        
        /*  socket.on('disconnect', function() {
            socket.broadcast.to(room).emit('bye', socket.id);
            io.to(user_socket_id[sockeId]).emit('bye', room);
        }); */
    });
};