const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin').Strategy;
const User = require("./models/user");
const config = require("../config");

// Configure the local strategy for use by Passport.
//

passport.use(
    new LocalStrategy(function(username, password, cb) {
        User.authenticate(username, password, cb);
    })
);

// Use the GoogleStrategy within Passport.
passport.use(
    new GoogleStrategy(config.google, function(accessToken, refreshToken, profile, cb) {
        User.findOrCreateByProviderID(
            profile.provider,
            profile.id,
            profile.emails[0].value,
            profile.name.givenName,
            profile.name.familyName,
            accessToken,
            refreshToken,
            profile._json,
            function(err, user) {
                return cb(err, user);
            }
        );
    })
);

// Use the FacebookStrategy within Passport.
passport.use(
    new FacebookStrategy(config.facebook, function(accessToken, refreshToken, profile, cb) {
        User.findOrCreateByProviderID(
            profile.provider,
            profile.id,
            profile.emails[0].value,
            profile.name.givenName,
            profile.name.familyName,
            accessToken,
            refreshToken,
            profile._json,
            function(err, user) {
                return cb(err, user);
            }
        );
    })
);

// Use the LinkedInStrategy within Passport.
passport.use(
    new LinkedInStrategy(config.linkedin, function(accessToken, refreshToken, profile, cb) {
        User.findOrCreateByProviderID(
            profile.provider,
            profile.id,
            profile.emails[0].value,
            profile.name.givenName,
            profile.name.familyName,
            accessToken,
            refreshToken,
            profile._json,
            function(err, user) {
                return cb(err, user);
            }
        );
    })
);

// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {
    cb(null, user.user_id);
});

passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
        cb(err, user);
    });
});

module.exports = passport;
