/*  
	George Yao
	gyao
	67-328 
	Final project 
	Server (Controller)
	December 13th, 2017
*/

/* Modules required for the web-aplication */ 
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var express = require('express');
var app = express();

var methodOverride = require('method-override');
var swig = require('swig');
var consolidate = require('consolidate');


// Set the views directory
app.set('views', __dirname + '/views');

// Define the view (templating) engine
app.set('view engine', 'ejs');

// Define how to log events
app.use(morgan('tiny'));	

// parse application/x-www-form-urlencoded, with extended qs library
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride());
app.set('passport', require('./models/authentication.js').init(app));
app.engine('html', consolidate.swig);


// Load all routes in the routes directory
fs.readdirSync('./routes').forEach(function (file){
  // Check for non-js files and not load them
  if (path.extname(file) == '.js') {
    console.log("Adding routes in "+file);
  	require('./routes/'+ file).init(app);
  	}
});

// Handle static files
app.use(express.static(__dirname + '/public')).use(cookieParser());;
  
// Catch any routes not already handed with an error message
app.use(function(req, res) {
	var message = 'Error 404, did not understand path '+req.path;
	// Set the status to 404 not found, and render a message to the user.
  res.status(404).send(message);
});
// Used to create server and setting up socket io 
var httpServer = require('http').createServer(app);
var sio =require('socket.io')(httpServer);

// The server socket.io code is in the socketio directory.
require('./socketio/serverSocket.js').init(sio);

// Listen on port 50000
httpServer.listen(50000, function()
{console.log('Listening on port:'+this.address().port);});