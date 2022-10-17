var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
require('dotenv').config();
var { initJob } = require('./src/services/cronJob');
var { initSocket } = require('./src/services/socket');
var appRoutes = require('./src/routes/app.route');

// *db connect
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async res => {
    console.log("DB Connected Successfully")
}).catch(err => {
    console.log('err', err);
    console.log('Unable to connect with DB')
})

var app = express();

// app.set('port', (process.env.PORT || 5000));
// var server = app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });
// var server = require('http').createServer(app);

// *init cron job
// initJob();
// *init socket
// initSocket();

// *view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.options('*', cors());

app.use('/api', appRoutes);

app.get('/*', function (req, res) {
  return res.status(500).json({ message: 'Invalid path' });
  // res.sendFile(path.join(__dirname + '/build/index.html'));
});

module.exports = app;
