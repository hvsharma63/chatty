/* 
    File : req.controller.js
    v1.0
    Desc : Server side requests controller file
    Developed By : Ishan Bhatt
*/

//Modules
var path = require('path');
var user = require('../models/user.model');
var requests = require('../models/request.model');
var chat = require('../models/chat.model');

//Global Variables
var firsttablecount ;
var secondtablecount ;
var totalcount;
var toUser;
var request1;
var newArray = [];

//Get all the pending request
exports.getRequests = async(req, res) => {
   /*  newArray.length = 0; */
    sess = req.session;
    console.log("From req.controller.js : " +sess._id);

    requests.distinct("fromUser" ,{$and:[ {toUser : sess._id}, {request_status : false}, {reject_status : false} ]}, (err, doc) => {
     
        if(err){
            return err;
        } else{
            console.log(doc);
           /*  res.json({doc : doc, token : req.headers.authorization}); 
 */
          
            const myfunc = async function(){
                try{
                 
                    for(var i=0; i<doc.length; i++){
                        request1 = await user.find({"_id" : doc[i]});
                        newArray[i] = request1; 
                        /* console.log("New array is : " +newArray); */
                    }      
                } catch(err){
                    console.log(err);
                }
            };

            myfunc();
            console.log("My New Array is : " +newArray)
            console.log("===========================================================");
            res.send(newArray);
            newArray = [];
        }
    });
};

//When user accept request
exports.acceptReq = (req, res) => {
   /*  newArray.length = 0; */
    newArray = [];
    sess = req.session;
    var requestedUser = req.body.requestedUser;
    console.log(requestedUser);

    user.findOne({ username : req.body.requestedUser }, (err, resToUser) => {
        if(err) {
            return err;
        } else {
            toUser = resToUser._id;
            
            //On accepting req. updating request_status : true
            requests.update({
                "fromUser" : toUser,
                "toUser" : sess._id
            },{
                $set: {
                    "request_status" : true,
                    "read_status" : true //To negelate it from notification count
                }
            },{
                multi: true
            },
            function(err, result) {
                if(err){
                    return err;
                } else{
                    console.log("Accept User Functionality : " +result);
                    console.log("===========================================================");  
                }
            });
        
            //Update the array of the user who sent the request when current user accepts the requests
            user.update({
                    "_id" : toUser
                }, 
                {
                    $push : {
                        friends : {
                            friendName : sess.email
                        }
                    }
                }, 
                function(err, result) {
                    console.log("For user updation in friends array : " +result.fname);
                    console.log("===========================================================");
                
            });
            
            //Update friends array of current user when current user accepts the request
            user.update({
                "_id" : sess._id
            }, 
            {
                $push : {
                    friends : {
                        friendName : requestedUser
                    }
                }
            }, 
            function(err, result) {
                console.log("For user updation in friends array : " +result.fname);
                console.log("===========================================================");
            });
            
            //Update user array in request model
            requests.update({
                "fromUser" : toUser,
                "toUser" : sess._id
                }, 
                {
                    $push : {
                        users : {
                            fromUser : requestedUser,
                            toUser : sess.email
                        }
                    }
                }, 
                function(err, result) {
                    console.log("For requests updation in friends array : " +result);
                    console.log("===========================================================");
                }
            );
        }
    });
};

//When user reject request
exports.rejectReq = (req, res) => {
    
    sess = req.session;
    newArray = [];
    var requestedUser = req.body.requestedUser;

    user.findOne({ username : req.body.requestedUser }, (err, resToUser) => {
        if(err) {
            return err;
        } else {
            toUser = resToUser._id;

            requests.update({
                "fromUser" : toUser,
                "toUser" : sess._id
            },{
                $set: {
                    "reject_status" : true, //user's request is rejected.
                    "request_sent" : false, //Enable user to send request again.
                    "read_status" : true //To negelate it from notification count
                }
            }, {
                multi: true
            },
            function(err, result) {
                if(err){
                    return err;
                } else{
                    console.log("Reject Request Functionality : " +result);
                    console.log("===========================================================");
                    res.send(result);
                }
            });
        }
    });
};

//Check the status : Accepted / Rejected / Pending
exports.getReqStatus = (req, res) => {
    var i;
    var arr = [];
    sess = req.session;
    //For temporary purpose
    
    requests.find({fromUser : sess._id}, (err, doc) => {
        for(i=0; i<doc.length; i++){
            console.log("Inside For Loop in Request Status API : " +doc[i].toUser);
            arr[i] = doc[i];
        }
        
        console.log("Printin Array for Request Status API : " +arr);
        console.log("===========================================================");
        res.send(arr);
    });
};

//Notification Count
exports.notificationCount = (req, res) => {
    sess = req.session;

    //TO Count the pending req. and unread msgs. for notification count
    requests.find({$and:[ {"toUser" : sess._id}, {"read_status" : false} ]}, (err, doc) => {
        firsttablecount = doc.length;
        console.log("Request Count : " + firsttablecount);
  
        chat.find({$and: [{'toUser':sess._id},{'read_status':false}]},(err,doc)=>{
            console.log("Message Count : " + doc.length);
            secondtablecount = doc.length;
            totalcount = firsttablecount + secondtablecount;
            console.log("Total count : " +totalcount);
            res.json({totalcount});
        });
    }); 
};

//Load request page page and check session
exports.showAllReq = (req,res) => {
    console.log(req.headers);
    sess=req.session;
    sess.email;

    if(sess.email == undefined) {
        console.log("Can't access without login");
        console.log("===========================================================");
        res.redirect('./');
    } else {    
        console.log("For getting fname from sess variable:" +sess.email);
        console.log("===========================================================");
        sess.pwd;
        res.sendFile(path.resolve('../Frontend/view/requests.html'));
    }
};