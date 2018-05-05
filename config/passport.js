var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user,done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req,email,password,done) {
    req.checkBody('email','Invalid Email').notEmpty().isEmail();
    req.checkBody('password','Invalid Password').notEmpty().isLength({min:5});
    req.checkBody('confirm', 'Passwords do not match!').equals(password);
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email},function(err,user){
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, {message: 'Email is already in use'});
        }
        var newUser = new User();
        newUser.name = req.body.name;
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.contact = req.body.contact;
        newUser.save(function (err, result) {
            if(err){
                return done(err);
            }
            return done(null, newUser);
        });

    });
}));

passport.use('local-signin', new LocalStrategy({
    usernameField: 'email1',
    passwordField: 'password1',
    passReqToCallback: true
}, function (req, email1, password1, done){
    req.checkBody('email1','Invalid Email').notEmpty().isEmail();
    req.checkBody('password1','Invalid Password').notEmpty();

    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email1},function(err,user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'No user found'});
        }
        if(!user.validPassword(password1)){
            return done(null, false, {message: 'Wrong Password'});
        }
        return done(null, user);
    });
}));