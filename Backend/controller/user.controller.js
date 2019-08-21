/* 
    File : user.controller.js
    v1.0
    Desc : Server side user management and controller file
    Developed By : Ishan Bhatt
*/

//Modules
var path = require('path');
var user = require('../models/user.model');
var requests = require('../models/request.model');
var fs = require('fs');

//Global Search
exports.globalSearch = (req, res) => {
    sess = req.sess;
    var searchString = req.body.searchString;
    console.log("Search String is : " +searchString);
    user.find( { "username" : { $regex : "^"+searchString+".*" , $options: 'i'} }, (err, user) => {
        console.log("Searched Result is : " +user);
        res.send(user);
    });
};

//Get non friends of logged in user
exports.getNonFriends = (req, res) => {
    sess = req.session;
    user.find( { $and :  [{ "username" : {$ne : sess.email} },{"friends": {"$not":{"$elemMatch":{"friendName":{$in:[sess.email]}}}} }]}, (err, users) => {    
        console.log("For new API : " +users);
        console.log("===========================================================");
        res.send(users);
    });
};

//Get friends of logged in user
exports.getFriends = (req, res) => {

    sess = req.session;
    console.log("Hyy");
    var i = 0;
    requests.aggregate([
        {
           $lookup:
            {
                from: "usernews",
                let : {
                    "toUser" : "$users.fromUser",
                    "fromUser" : "$users.toUser"

                }, 
                pipeline : [
                    {
                        $unwind :  "$friends"
                    },
                    {
                        $match : {
                            $expr : {
                                $or : [
                                    {
                                        $in : ["$friends.friendName","$$toUser"]
                                    },
                                    {
                                        $in : ["$friends.friendName","$$fromUser"]
                                    }
                                ]
                            }   
                        }
                    }
                ],
                as: "inventory_docs"
            }
        }
    ]).exec(function(err, result) {
        if(err) {
            return err;
        } else {
            // console.log("List of Friends : " +JSON.stringify(result[0].inventory_docs));
            // console.log("===========================================================");
            res.send(result);
        }
    });

};

//Get details of logged in user
exports.getLoggedUserData = (req, res) => {
    sess = req.session;
    user.findOne({ "_id" : sess._id }, (err, user) => {
        if(err){
            return err;
        } else {
            res.send(user);
        }
    });
};

//Update user profile
exports.updateUserData = (req, res) => {
    sess = req.session;

    if(req.body.img == '' && req.body.img_name == ''){
        user.update({
            _id : sess._id
        },{
            $set : {
                "fname" : req.body.fname,
                "lname" : req.body.lname,
                "email" : req.body.email,
                "city"  : req.body.city,
            }
        },function(err, success){
            if(err){
                return err;
            } else {
                console.log("Update Record "); 
            }
        });
        res.send(200);
    } else {
        console.log("Image name is : " +req.body.img_name);
        var filename = req.body.img_name;
        console.log("File name is : " +filename);
        var file = path.resolve('../Backend/assets/'+filename);
        let myCropImg = req.body.img.replace(/^data:([A-Za-z-+/]+);base64,/, "");
        fs.writeFile(file,myCropImg, 'base64', function(err) {
            if (err) {
                console.log("Printing Error while Registration : " +err);
                console.log("===========================================================");
                res.send(500);
            }  else {
                user.update({
                    _id : sess._id
                },{
                    $set : {
                        "fname" : req.body.fname,
                        "lname" : req.body.lname,
                        "email" : req.body.email,
                        "city"  : req.body.city,
                        "img_upload" : filename
                    }
                },function(err, success){
                    if(err){
                        return err;
                    } else {
                        console.log("Update Record "); 
                    }
                });
            }
        });
        res.send(200);
    }
};

//Load user profile page
exports.userProfile = (req, res) => {
    sess=req.session;
    sess.email;
    console.log('sesion name is : ' +sess.email);

    if(sess.email == undefined && sess._id == undefined ) {
        console.log("Can't access without login");
        console.log("===========================================================");
        res.redirect('./');
    } else {    
        console.log("From indexpage:" +sess.email);
        console.log("===========================================================");
        res.sendFile(path.resolve('../Frontend/view/profile.html'));
    }
};


