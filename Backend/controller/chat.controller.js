/* 
    File : chat.controller.js
    v1.0
    Desc : Server side chat controller and chat collection manipulation file
    Developed By : Ishan Bhatt
*/

//Modules
var path = require('path');
var fs = require('fs');
var donwload = require('image-downloader');

//Models
var user = require('../models/user.model');
var requests = require('../models/request.model');
var chat = require('../models/chat.model');
var group = require('../models/group.model');
var groupChat = require('../models/groupChat.model');
var groupNotification = require('../models/groupNotification.model');

var fromUser, toUser;

//Get messages for paritcular DB
exports.getMessages = async(req, res) => {
    sess = req.session;
    var toUser = req.body.toUser;
    console.log("From chat controller session id and touser id  : " +sess._id+ ' ' +toUser );
    
    chat.find({$and : [{ $or : [ {"fromUser" : sess._id}, {"fromUser" : toUser} ] } , {$or : [ { "toUser" : sess._id },{ "toUser" : toUser } ] }]}, (err, doc) => {
        if(err) {
            return err;
        } else {
            res.send(doc);

            //Updating read status for toUser
            chat.update({
                "fromUser": toUser,
                "toUser" : sess._id
                },{
                    $set: {
                        "read_status" : true, //for not showing notification in list
                    }
                }, {
                    multi: true
                },
                function(err, result) {
                    if(err){
                        return err;
                    } else{
                        console.log("Update read status : " +result);
                    }
                }
            );

            //Updating online status for from user
            user.update({
                "_id" : sess._id,
                
                },{
                    $set: {
                        "is_online" : true, //for not showing notification in list
                    }
                }, {
                    multi: true
                },
                function(err, result) {
                    if(err){
                        return err;
                    } else{
                        console.log("Update is_online status 1: " +result);
                        console.log("===========================================================");
                    }
                }
            );
        }
    });      
};  

//Update the read_status (call from privatechat.js)
exports.getUnreadMessages = (req, res) => {
    sess = req.session;

    console.log("to user is : " +sess._id);
    chat.distinct("fromUser",{$and : [{"toUser" : sess._id}, {"read_status" : false}]}, (err, doc) => {
        if(err){
            return err;
        } else {
            //Updating online status for fromUser
            user.update({
                "_id" : sess._id,
                },{
                    $set: {
                        "is_online" : false, //for not showing notification in list
                    }
                }, {
                    multi: true
                },
                function(err, result) {
                    if(err){
                        return err;
                    } else{
                        console.log("Update onlin_status 2 : " +result);
                        console.log("===========================================================");
                        
                }
            });
        
            //Updating read status for fromUser 
            chat.update({
                /* "fromUser" : toUser, */
                "_id" : sess._id
                },{
                    $set: {
                        "read_status" : true, //for not showing notification in list
                    }
                }, {
                    multi: true
                },
                function(err, result) {
                    if(err){
                        return err;
                    } else{
                        console.log("Update read status : " +result);
                        console.log("===========================================================");
                        
                }
            });
            user.find({ _id : doc }, (err, docName) => {
                console.log("Final Name of notification user : " +docName);
                res.send(docName);
            });
        }
    });
};

//Store Group Details 
exports.createGroup = (req, res) => {
    console.log("Group Members are : " +req.body.groupMembers.length);
    var grpArray = req.body.groupMembers;
    /* grpArray.push(sess.email); */
    if(req.body.groupMembers.length <= 1){
        res.send('notElegible');
    } else{
        group.findOne({ "group_name" :  req.body.groupName}, (err, grp) => {
            if(err) {
                return;
            } if( grp ){
                res.send('already');
            } else{
                function saveModel(){
                    return new Promise((resolve, reject) => {
                        var groupModel = new group();
                        groupModel.created_by = sess._id;
                        groupModel.group_name = req.body.groupName;
                        /* groupModel.group_members = grpArray; */
                        groupModel.save(function(err, result){
                            resolve({result:'success'});
                        });        
                    });
                }
                return saveModel().then(Response => {
                    group.update(
                        {
                            group_name : req.body.groupName
                        }, 
                        {
                            $push : {
                                group_members : {
                                    members : sess.email,
                                    online_status : false, //0 for offline
                                    admin : true //0 for Not an admin 
                                }
                            }    
                        },function(err, succes){
                            console.log("SUCESSS");
                        }
                    );
                    console.log("In return : " +grpArray  );
                    for(var i=0; i<grpArray.length; i++){
                        console.log("In for Loop : " +grpArray[i]  );

                        group.update(
                            {
                                group_name : req.body.groupName
                            }, 
                            {
                                $push : {
                                    group_members : {
                                        members : grpArray[i],
                                        online_status : false, //0 for offline
                                        admin : false //0 for Not an admin 
                                    }
                                }    
                            },function(err, succes){
                                console.log("SUCESSS");
                            }
                        );
                    }
                    res.send("success");
                });
            }
        });
    }
    
};

//Get detalis of particular groups
exports.getGroupDetails = (req, res) =>{
    var groupName = req.body.grpName;

    group.findOne({ "group_name" : groupName }, (err, grp) => {
       if(err) {
           return err;
       } else{
           res.send(grp);
       }
    });
};

//Get user associated groups list
exports.getGroupList = (req, res) => {
    group.find( {"group_members": {"$elemMatch":{"members":{$in:[sess.email]}}} }, (err, grpList) => {
        if(!err){
            console.log("Current groups of logged in user : " +grpList);
            console.log("==========================================================="); 
            res.send(grpList);
        }
    });
};

//Get Group Chat History
exports.getGroupChatHistory = (req, res) => {
    group.findOne( { "group_name" : req.body.grpName }, (err, grp) => {
        if(!err){
            groupChat.find( { "group_id" : grp._id }, (err, grpMessages) => {
                if(!err){
                    res.send(grpMessages);
                }
            });
        }
    });
};

//Add extra members to group
exports.addGroupMembers = (req, res) => {
    console.log("Group NAme : " +req.body.groupMembers[0]);
    group.findOne( { "group_name" : req.body.grpName }, (err, grp) => { 
        if(!err){
            for(var i=0; i<req.body.groupMembers.length; i++){
                group.update(
                    {
                        "group_name" : req.body.grpName
                    },
                    {
                        $push : {
                            "group_members" : {
                                members : req.body.groupMembers[i],
                                online_status : false, //For offline status
                                admin : false //For Not an admin
                            }
                        }
                    },function(err, succes){
                        console.log("A big congratulations");
                    }
                );
            }
        }
    });
    res.send('created');
    
};

//Remove group members
exports.removeGroupMembers = (req, res) => {
    console.log(req.body.grpName);
    group.findOne( { "group_name" : req.body.grpName }, (err, grp) => { 
        if(!err){
            for(var i=0; i<req.body.removeMem.length; i++){
                console.log(req.body.removeMem[i]);
                group.update({
                    "group_name" : req.body.grpName 
                    }, 
                    {
                        $pull: {
                            "group_members" : {"members" : req.body.removeMem[i]}
                         }
                    }, function(err, success){
                        console.log(success);
                    }
                );
            }
            res.send(200);
        }
    });  
};

//Leave group 
exports.leaveGroup = (req, res) => {
    console.log("Group Name is : " +req.body.grpName);

    group.findOne( {"group_name" : req.body.grpName} , (err, grp) => { 
        if(grp){    
            var adminFlag = 0;
            var alternateAdmin;
            console.log("Total members : " +grp.group_members.length);
            if(grp.group_members.length == 1){
                console.log("In");
                group.remove({ "group_name" : req.body.grpName }, (err, deleted)=>{
                    if(err){
                        console.log(err);
                    } else{
                        console.log("Deleted");
                    }
                });
            }
            else {
                for(var i=0; i<grp.group_members.length; i++){
                    if(grp.group_members[i].admin == true && grp.group_members[i].members != sess.email){
                       console.log("Found Another admin" +grp.group_members[i].members);
                       adminFlag = 1;    
                    }
                    if(grp.group_members[i].members != sess.email){
                       alternateAdmin = grp.group_members[i].members;
                    }
                }
                if(adminFlag == 1){
                   group.update({
                       "group_name" : req.body.grpName 
                       }, 
                       {  
                           $pull: {
                               "group_members" : {"members" : sess.email}
                           }
                       }, function(err, success){
                           console.log(success);
                       }
                   );
               } else{
                   console.log("Alternate admin is : " +alternateAdmin);
                   group.update({
                       "group_name" : req.body.grpName,
                       "group_members.members" : alternateAdmin
                       }, 
                       {  
                           $set: {
                               "group_members.$.admin" : true
                           }
                       }, function(err, success){
                           console.log(success);
                       }
                   );
   
                   group.update({
                       "group_name" : req.body.grpName,
                       "group_members.members" : alternateAdmin
                       }, 
                       {  
                           $pull: {
                               "group_members" : {"members" : sess.email}
                           }
                       }, function(err, success){
                           console.log(success);
                       }
                   );
               }
            }
            res.send(200);
        } 
    });
};

//Get the friends details when someone click on friend li
exports.getFriendDetails = (req, res) => {
    var fname = req.body.friendName;
    var token = req.headers.authorization;
    
    //Get friend details whenever user click on another user li
    user.findOne({ "username" : fname }, (err, doc) => {
        res.json({doc : doc, token : token});
    });
};

//Update online
exports.updateOnlineStatus1 = (req, res) => {
    sess = req.session;

    user.update({
        "_id" : sess._id,
        },{
            $set: {
                "is_online" : false, //for not showing notification in list
            }
        }, {
            multi: true
        },
        function(err, result) {
            if(err){
                return err;
            } else{
                console.log("Update is_online status 3 : " +result);
                console.log("===========================================================");
            }
    });     
};

//Update online status = true
exports.updateGroupOnlieeStatus = (req, res) => {
    sess = req.session;
    console.log("Online Group Name is : " +req.body.grpName);
    group.findOne({ "group_name" : req.body.grpName }, (err, grp) => {
        if(grp){
            group.update({
                    "group_name" : req.body.grpName,
                  "group_members.members" : sess.email
                }, 
                {
                    $set : {
                        "group_members.$.online_status" :true //For onlie status
                    }
                }, function(err, result){
                    if(!err){
                        console.log("Success");
                        console.log(result);
                    }
                }
            );
        }
    });

};

//Update online status = false
exports.updateGroupOfflineStatus = (req, res) => {
    sess = req.session;
    console.log("Offline Group Name is : " +req.body.grpName);
    group.findOne({ "group_name" : req.body.grpName }, (err, grp) => {
        if(grp){
            group.update({
                    "group_name" : req.body.grpName,
                    "group_members.members" : sess.email
                }, 
                {
                    $set : {
                        "group_members.$.online_status" :false //For onlie status
                    }
                }, function(err, result){
                    if(!err){
                        console.log("Recent Success");
                        console.log(result);
                    }
                }
            );
        }
    });

};

//Read all the group messages
exports.readChat = (req, res) => {
    var readByUsers = [];
    var grpMembers = [];
    group.findOne( { "group_name" : req.body.grpName }, (err, grpList) => {
        console.log("Group List : " ,grpList);

            grpMembers = grpList.group_members.length;
            for(var j=0; j<grpMembers; j++){
                //To get users who is online
                if(grpList.group_members[j].online_status == true){
                    readByUsers.push(grpList.group_members[j].members);
                }
            }

            groupChat.update({
                "group_id" : grpList._id
            }, {
                    $set : {
                        "read_by" : readByUsers
                    }
            },{
                multi : true
            },function(err, success){
                console.log("Read By Status : ",success);
                res.send(success);
            });
        }
    /* groupChat.find().sort({$natural: -1}).limit(1).then(
        function(doc) {
            group.findOne({ "_id" :  doc[0].group_id} , (err, grp) => {
                var grpMembers = grp.group_members.length;
                
                for(var j=0; j<grpMembers; j++){
                    //To get users who is online
                    if(grp.group_members[j].online_status == true){
                        readByUsers.push(grp.group_members[j].members);
                    }
                } 

                //Update read_by array for notification
                groupNotification.update({
                    "group_id" : doc[0].group_id
                }, {
                        $set : {
                            "read_by" : readByUsers
                        }
                },{
                    upsert : true
                },function(err, success){
                    console.log("Succes from update : ",success);
                    res.send(success);
                });
            });
       }
    ); */
)};

//Get particular group data 
exports.getGroupData = (req, res) => {
    console.log("Group name is " +req.body.grpName);

    group.findOne( { "group_name" : req.body.grpName }, (err, grp) => {
        if(!err && grp){
            res.send(grp);
        }
    });
};

//Update Group data 
exports.updateGroupData = (req, res) => {
    group.findOne( { "group_name" : req.body.oldGrpName }, (err, grp) => {
        var filename = req.body.img_name;
        var file = path.resolve('../Backend/assets/'+filename);
        let myCropImg = req.body.img.replace(/^data:([A-Za-z-+/]+);base64,/, "");
        fs.writeFile(file,myCropImg, 'base64', function(err) {
            if (err) {
                console.log("Printing Error while Registration : " +err);
                console.log("===========================================================");
                res.send(500);
            }  else {
                console.log(grp.group_name);
                group.update({
                    group_name : grp.group_name,
                },{
                    $set: { 
                        group_name : req.body.grpName,
                        group_image : 'http://localhost:3000/'+filename
                    }
                },function(err, success){
                    if(err){
                        return err;
                    } else {
                        console.log("Update Record", success); 
                    }
                });
                res.send(200);
            }
        });
        
    });
};

//Get particular group admin data
exports.getMembersData = (req, res) => {
    console.log(req.body.admin);

    user.find( { "username" : req.body.admin }, (err, adminData) => {
        console.log(adminData);
        res.send(adminData);
    });
};

//Get group list of inread messages
exports.getGroupUnreadMessages = (req, res) => {
    var grpNameArray = [];

    groupChat.find({"read_by":{$nin:[sess.email]} }, (err, grp) => {
        if(grp){
            for(var i=0; i<grp.length; i++){
                grpNameArray.push(grp[i].group_id);
            }
            console.log(grpNameArray);
            console.log("===========================================================");
            group.find({ "_id" : grpNameArray }, (err, grpData) => {
                console.log("Final Group Data : ", grpData)
                res.send(grpData);
            });
        }
    });
}

//Donwload Image
exports.donwloadImage = (req, res) => {
    const options = {
        url : req.body.imgagePath,
        dest : 'C:/downloadImage'
    };

    donwload.image(options).then(({filename, image}) => {
        console.log("File is saved : " +filename );
    }).catch((err) => {
        console.log(err);
    });
};

//Load chat file 
exports.privateChatPage = (req, res) => {
    sess=req.session;

    if(sess.email == undefined && sess._id == undefined) {
        console.log("Can't access without login");
        console.log("===========================================================");
        res.redirect('./');
    } else {    
        console.log("For getting fname from sess variable:" +sess.email);
        console.log("===========================================================");
        res.sendFile(path.resolve('../Frontend/view/modified-chat.html'));
    }  
};

//Load geoup chat file
exports.groupChat = (req, res) => {
    sess=req.session;

    if(sess.email == undefined && sess._id == undefined) {
        console.log("Can't access without login");
        console.log("===========================================================");
        res.redirect('./');
    } else {    
        console.log("For getting fname from sess variable:" +sess.email);
        console.log("===========================================================");
        res.sendFile(path.resolve('../Frontend/view/groupChat.html'));
    }  
};

//Load gorup setting page
exports.groupSetting = (req, res) => {  
    sess=req.session;

    if(sess.email == undefined && sess._id == undefined) {
        console.log("Can't access without login");
        console.log("===========================================================");
        res.redirect('./');
    } else {    
        console.log("For getting fname from sess variable:" +sess.email);
        console.log("===========================================================");
        res.sendFile(path.resolve('../Frontend/view/group-setting.html'));
    }
};

//Load video call page
exports.videoCall = (req, res) => {
    sess=req.session;

    if(sess.email == undefined && sess._id == undefined) {
        console.log("Can't access without login");
        console.log("===========================================================");
        res.redirect('./');
    } else {    
        console.log("For getting fname from sess variable:" +sess.email);
        console.log("===========================================================");
        res.sendFile(path.resolve('../Frontend/view/video-call.html'));
    }
}