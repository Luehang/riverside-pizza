const express               = require('express');
const path                  = require('path');
const favicon               = require('serve-favicon');
const logger                = require('morgan');
const cookieParser          = require('cookie-parser');
const bodyParser            = require('body-parser');
const expressHbs            = require('express-handlebars');
const mongoose              = require('mongoose');
const session               = require('express-session');
const passport              = require('passport');
const flash                 = require('connect-flash');
const validator             = require('express-validator');
const MongoStore            = require('connect-mongo')(session);
const helmet                = require('helmet');

const routes                = require('./routes/index');
const userRoutes            = require('./routes/user');
const adminRoutes           = require('./routes/admin');

require('dotenv').config();

const app                   = express();

mongoose.connect(process.env.DATABASE, { useMongoClient: true });
const db = mongoose.connection;
db.on("open", function(ref) {
  console.log("Connected to mongo server.");
});
db.on("error", function(err) {
  console.log("Could not connect to mongo server.");
  console.error(err);
});
require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(helmet({
    frameguard: {
        action: 'deny'
    },
    hidePoweredBy: {
        setTo: 'PHP 7.0.21'
    },
    xssFilter: {
        setOnOldIE: true
    },
    ieNoOpen: true
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 } // 3 hours
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  if (req.isAuthenticated()) {
    res.locals.admin = req.user._id.toString() === process.env.ADMIN ? true : false;
  }
  res.locals.session = req.session;
  next();
});

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;