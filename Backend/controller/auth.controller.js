/* 
    File : auth.controller.js
    v1.0
    Desc : Server side authentication file
    Developed By : Ishan Bhatt
*/

//Modules
var path = require('path');
var fs = require('fs');
var passport = require('../db/passport');
var config = require('../db/config');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var user = require('../models/user.model');
var fbConfig = require('../db/facebook.config');

//Global Variables
var sess;
var token;

//For API Progress
exports.apiProgress = (req,res) => {
	console.log("Got request");
	user.findOne({ username: 'Ishan_17' }, (err, usr) => {
		res.json(usr);
	})
};

//Register User Data
exports.signup = (req, res) => {

    user.findOne( { $or : [ { username : req.body.username }, { email : req.body.email } ] }, (err, alreadyUser) => {
        if(!err && alreadyUser){
            console.log("User is already registered.")
            res.send("Found");
			return;
        } else{
            var filename = req.file.originalname;
            var file = path.resolve('../Backend/assets/'+filename);
            var ext = path.extname(req.file.originalname);
            let myCropImg = req.body.imagecrop.replace(/^data:([A-Za-z-+/]+);base64,/, "");
            var pwd;
            fs.writeFile(file,myCropImg, 'base64', function(err) {
                if (err) {
                    console.log("Printing Error while Registration : " +err);
                    console.log("===========================================================");
                    res.send(500);
                }  else {
                    bcrypt.hash(req.body.pwd, 10, function(err, hash) {
                        if(err) {
                            return console.log(err);
                        } 
                        pwd = hash;
                        var model = new user();
                        model.img_upload = filename,
                        model.fname = req.body.fname,
                        model.lname = req.body.lname,
                        model.username = req.body.username,
                        model.city = req.body.city,
                        model.mobile_number = req.body.mobile_number,
                        model.datepicker_validate = req.body.datepicker_validate,
                        model.email = req.body.email,
                        model.pwd = pwd,
                        model.save(function(err,doc){});
                        res.json({
                            message: 'File uploaded successfully',
                            filename: req.file.filename
                        });
                    });
                }
            });
        }
    });
};

//Sign In and set session
exports.signin = (req, res) => {
    sess = req.session;
    
    user.findOne({ "username" : req.body.username }, ( err, user1 ) => {
        if(err) return err;

        if(!user1) {
            res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            console.log(user1);
            if(user1.pwd != undefined){
                console.log(user1);
                var passwordIsValid = bcrypt.compareSync(req.body.password, user1.pwd);
                if (!passwordIsValid) {
                    return res.status(401).send({ 
                        status: 0, 
                        message: "Invalid password!" 
                    });
                }
                sess.email = req.body.username;
                sess._id = user1.id;
                console.log("Session id is : " +sess._id);
                token = jwt.sign({ id: user1.id }, config.secret, {
                expiresIn: 72000 // expires in 1 hours
                });
                console.log(token);
            
                res.json({success: true, token: 'jwt ' + token, data: user1});
            } else {
                res.send("notValid")
            }
        }
    });
}

//Check Token
exports.checkToken = (req, res) => {
    console.log("Hell");
    res.send(200);
};

exports.saveGoogleData = (req, res)=> {
    var email = req.body.email
    var username   = email.substring(0, email.lastIndexOf("@"));
    sess = req.session;
    sess.email = username;

    user.findOne({"googleId" : req.body.googleId}, (err, doc) => {
        if(err) {
            return err;
        } if(!err && doc){
            sess._id = doc._id;
            token = jwt.sign({ id: doc.id }, config.secret, {
                expiresIn: 3600 // expires in 1 hours
            });
            res.json({success: true, token: 'jwt ' + token, data: doc});
        } else{
            function checksave(){
                return new Promise((resolve,reject)=>{
                    var newModel = new user();
                    newModel.googleId = req.body.googleId;
                    newModel.fname = req.body.fname;
                    newModel.lname = req.body.lname;
                    newModel.username = username,
                    newModel.email = req.body.email;
                    newModel.img_upload = req.body.img_upload;
                    newModel.save(function(err, result){
                        if(result){
                            resolve({result : 'success'});
                        }
                    });
                });
            }

            return checksave().then(Response =>{
                user.findOne({'googleId':req.body.googleId},(err,doc)=>{
                    token = jwt.sign({ id: doc.id }, config.secret, {
                        expiresIn: 3600 // expires in 1 hours
                    });
                  sess._id = doc._id;
                  res.json({success: true, token: 'jwt ' + token, data: doc});
                })
              }).catch(err =>{
                console.log("catch error" + err);
            });
        }
    });
}

//Login Page and checking session
exports.loginPage = (req, res) => {
    sess=req.session;
    sess.email;
    console.log('Directory Name is :' +__dirname)
    if(sess.email == undefined && sess._id == undefined) {
        console.log("Can't access without login");
        console.log("===========================================================");
        res.sendFile(path.resolve('../Frontend/view/login.html'));
    } else {    
        console.log("For getting fname from sess varsiable:" +sess.email);
        console.log("===========================================================");
        sess.pwd;
        res.sendFile(path.resolve('../Frontend/view/modified_users.html'));
    }
}

//Index Page
exports.indexPage = (req, res) => {
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
        res.sendFile(path.resolve('../Frontend/view/modified_users.html'));
    }
}

//Signout and destroy session
exports.signout = (req, res) => {
    sess = req.session;
    user.update({
        "_id" : sess._id,
      /*   "toUser" : toUser */
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
                console.log("At logout: " +result);
                console.log("===========================================================");
                
        }
    });

    req.session.destroy();
    res.redirect('./');
};
