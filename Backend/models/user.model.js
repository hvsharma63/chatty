var mongoose1 = require('../db/index');
var bcrypt = require('bcrypt')
Schema = mongoose1.Schema;

//Schema
const userSchema = new mongoose1.Schema({
    googleId : String,
    fname : String,
	lname : String,
    email : String,
    username : String,
	city : String,
	mobile_number : String,
	datepicker_validate : String,
    pwd : String,
    img_upload : String,
	friends : [],
	is_online : Boolean
});

//Hasing of password before saving it to database 
/* userSchema.pre('save', function(next) {
    var user = this;
    console.log("From user schema : " +user);
    if(user.pwd != undefined){
        bcrypt.hash(user.pwd, 10, function(err, hash) {
            if(err) {
                return next(err);
            } 
    
            user.pwd = hash;
            next();
        });
    } else {
        return;
    }
    
    
}); */

////Exported variable
var user = mongoose1.model('userNew', userSchema);
module.exports = user;