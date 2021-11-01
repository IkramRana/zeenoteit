var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
require('dotenv').config();
var appRoutes = require('./src/routes/app.route');

mongoose.connect('mongodb://localhost:27017/ze_note_it', {
  useNewUrlParser: true,
  //useCreateIndex: true,
  useUnifiedTopology: true,
  //useFindAndModify: false
})
  .then(async res => {
    console.log("DB Connected Successfully")
  })
  .catch(err => {
    console.log('err', err);
    console.log('Unable to connect with DB')
  })

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', appRoutes);

app.get('/*', function (req, res) {
  return res.status(500).json({ message: 'Invalid path' });
  // res.sendFile(path.join(__dirname + '/build/index.html'));
});

module.exports = app;
