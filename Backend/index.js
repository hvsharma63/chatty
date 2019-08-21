//Setup plugins 
var express = require('express');
var passport = require('passport');
var session = require('express-session');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//For renderfile with data
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

//Body parser defaut code
app.use(bodyParser.json({limit : '500mb'}));
app.use(bodyParser.urlencoded({limit : '500mb',extended: true, parameterLimit:50000}));

//Cookie parser
app.use(cookieParser());

//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000/");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  req.header("Access-Control-Allow-Origin", "http://localhost:3000/");
  req.header('Access-Control-Allow-Credentials', 'true');
  next();
});

//Session init
app.use(session({
    secret: 'ssshhhhh',
}));

//Socket Route
var socket = require('./routes/socket')(io);

//Initialize passport
app.use(passport.initialize());

//Routing
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/media'));
app.use(express.static(__dirname + '/groupimages'));

//Common Route
app.use(require('./routes/routes'));

//404 error for random url
app.use(function(req, res, next) {
  res.status(404).sendFile(path.resolve('G:/Work/socket_backup/backup1/Socket_v2.0/view/404.html'));
});



//Setting up node connection
var port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

