var config = require('../db/config');
var user = require('../models/user.model');

checkDuplicateUserNameOrEmail = (req, res, next) => {
    console.log(req.body);
    user.findOne( { $or : [ { username : req.body.username }, { email : req.body.email } ] }, (err, user) => {
        if(!err && user){
            console.log("User is already registered.");
            res.send("Found");
			return;
        } else{
            next();
        }
    });
};

////Exported variable
const signUpVerify = {};
signUpVerify.checkDuplicateUserNameOrEmail = checkDuplicateUserNameOrEmail;

module.exports = signUpVerify;