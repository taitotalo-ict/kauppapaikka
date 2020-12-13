var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
// initalize sequelize with session store
var SequelizeStore = require("connect-session-sequelize")(session.Store);
// create database
var Sequelize = require("sequelize");
var sequelizeSession = new Sequelize({
  dialect: "sqlite",
  storage: "./session.sqlite",
});
var myStore = new SequelizeStore({
  db: sequelizeSession,
});

var indexRouter = require('./routes/index');
var tuotteetRouter = require('./routes/tuotteet');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'MySecret',
  store: myStore,
resave: false,
  saveUninitialized: true
}));
myStore.sync();


app.use('/', indexRouter);
app.use('/tuote', tuotteetRouter);
app.use('/rekisterointi', require('./routes/rekisteröinti'));
app.use('/kirjaudu', require('./routes/kirjaudu'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.locals = require('./helperFunctions');

module.exports = app;
