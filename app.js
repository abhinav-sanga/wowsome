var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var session = require('express-session');
var passport = require('passport');
var validator = require('express-validator');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');

var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://abhinav:abhinav05@ds055575.mlab.com:55575/wowsome');
//mongoose.connect('mongodb://127.0.0.1:27017/wowsome');
var db = mongoose.connection;
db.on('error',console.error);
db.once('open',function(){
    console.log('connection successfull');
});

require('./config/passport');

// view engine setup
app.engine('.hbs', hbs({defaultLayout: 'layout',partialsDir: 'views/partials', extname:'.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
    secret: 'mysupersecret',
    resave:true,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
}));

app.use(function(req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (req,res,next) {
    console.log('came here');
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.currentUser = req.user;
    res.locals.sessionFlash = req.session.sessionFlash;
    next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
    res.locals.session = req.session;
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var http = require('http');
setInterval(function() {
    http.get("http://wowsome.herokuapp.com/");
    console.log("executed");
}, 1200000); // every 20 minutes (1200000)


module.exports = app;
