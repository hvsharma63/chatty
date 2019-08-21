var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

//Modules
var user = require('../models/user.model');

//Config
var config = require('../db/config');

//Extra Options for Passport JWT
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
opts.secretOrKey = config.secret;
        
//Exported variable
module.exports = passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

    user.findOne({id: jwt_payload._id}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));