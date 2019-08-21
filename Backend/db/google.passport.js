var passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../db/config');
var fbConfig = require('../db/facebook.config');
const user = require('../models/user.model');

var sess;

module.exports = passport.use(new GoogleStrategy({
       
    clientID: fbConfig.facebook.clientID,
    clientSecret: fbConfig.facebook.clientSecret,
    callbackURL: fbConfig.facebook.callbackURL
},
function (accessToken, refreshToken, profile, done) {
    console.log("From passport ");
    process.nextTick(function () {

        console.log(profile.name.familyName);
        console.log(profile.emails[0].value);
        passport.serializeUser(function(user, done) {
            console.log(user);
            done(null, user);
          });
          passport.deserializeUser(function(user, done) {
            done(null, user);
            });
        user.findOne({googleId: profile.id}, function(err, user1) {
              
            if (err) { console.log(err); }
            if (!err && user1 !== null) {
                console.log('found user', user1);
                
            } else {
                console.log(profile);
            
                var newUser = new user();   
                newUser.googleId = profile.id,
                newUser.fname = profile.name.givenName,
                newUser.lname = profile.name.familyName,
                newUser.img_upload = profile._json.picture,
                newUser.email = profile.emails[0].value,
                newUser.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('saving user....');
                        done(null, newUser);
                    }
                });
            }
        });
    });
}
));