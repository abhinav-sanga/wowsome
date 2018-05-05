var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var User = require('../models/user');

/* GET home page. */
var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/', notLoggedIn, function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/landing', { title: 'Wowsome', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.get('/profile',isLoggedIn, function (req,res,next) {
    res.render('user/profile', {usr: req.user});
});

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
    req.session.destroy();
});


router.post('/register', passport.authenticate('local-signup',{
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}));

router.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}));



module.exports = router;


function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}