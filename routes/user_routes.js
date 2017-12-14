/*  
	George Yao
	gyao
	67-328 
	Final project
	User routes (server-side)
	December 13th, 2017
*/

// Include my user model and authentication module
var userModel = require("../models/user_model.js");
var authenticationModule = require('../models/authentication');

// A wrapper function that can easily make api calls to 
// Spotify given parameters
var spotifyApi = authenticationModule.spotifyApi;

// Define the routes for this controller
// NOTE: I will only be using one 'physical' page, 
// the index.ejs page, for simplicity. 
// I will be hiding, and/or removing elements
// from the DOM to create different enviornment
exports.init = function(app) {	
	var passport = app.get('passport');
	
	// Basic index route 
	app.get('/', function(req, res) {
	    res.render('../public/index.ejs',{user:req.user, roomName:req.session.roomName});
  	});	
  
	// login through spotify route
  	app.get('/login', passport.authenticate('spotify', 
			{scope: ['user-read-email', 'user-read-private','playlist-read-private', 
									'playlist-read-collaborative','playlist-modify-public'],showDialog: true }), 
			function(req, res){
    			// The request will be redirected to spotify for authentication, so this
    			// function will not be called.
  			});
	
	// logout spotify route
	app.get('/logout', spotifyLogout);
	
	// callback route after returning from Spotify.com
	// (which simply redirects back home on success)
	app.get('/callback', passport.authenticate('spotify', { failureRedirect: '/login' }),
  	function(req, res) {
    	// Successful authentication, redirect home
    	res.redirect('/');
  	});	
	
	// These routes pertain to using the SpotifyAPI
	// to obtain data; 
  	app.get('/getPlaylists', checkAuthentication, spotifyGetPlaylists);
	app.get('/searchSongs/:searchTerm', spotifyGetSongs)
	app.post('/addSong/:playlistID/:songID', checkAuthentication, spotifyAddToPlaylist)
	
	// These routes pertain to basic CRUD operations 
	app.get("/users/:userName", getUser);
    app.put("/users/:userName/:userRole/", createUser);
    app.post("/users/:userName/:userRole/:userRoom", updateUser);
  	app.delete("/users/:userName", deleteUser);
}

/*
 * Check if the user has authenticated
 * @param req, res - as always...
 * @param {function} next - The next middleware to call.  This is a standard
 *    pattern for middleware; it should call the next() middleware component
 *    once it has completed its work.  Typically, the middleware you have
 *    been defining has made a response and has not needed any additional 
 *    middleware.
 */
function checkAuthentication(req, res, next){
    // Passport will set req.isAuthenticated
    if(req.isAuthenticated()){
        // call the next bit of middleware
        next();
    }else{
        // The user is not logged in. 
		// Redirect to the login page.
        res.redirect("/login.ejs");
    }
};

// Redirects DJ back home after logout
function spotifyLogout(req,res) {
	req.logout();
  	res.redirect('/');
};

// Retrieves all playlists of the DJ's account
function spotifyGetPlaylists(req,res) {
	spotifyApi.getUserPlaylists(req.user.id).then(function(data) {
		var filteredPlaylist = []
		// filter out any playlists that aren't owned by the account
		for (var i = 0; i < data.body.items.length; i++) {
			if (data.body.items[i].owner.id === req.user.id) {
				filteredPlaylist.push(data.body.items[i]);
			}
		}
		  res.send({playlists:filteredPlaylist});
	},function(err) {
      	console.log('Something went wrong!', err);
		res.send("No available playlist");
  	});
};

// Retrieves all list of 20 tracks given a query
function spotifyGetSongs(req,res) {
	spotifyApi.searchTracks(req.params.searchTerm).then(function(data) {
    	console.log('Returned results for '+req.query.searchTerm, data.body);
		res.send(data.body);
  		}, function(err) {
    		console.error(err);
  	});
};

// Adds a song to the current playlist of the room
function spotifyAddToPlaylist(req,res) {
	spotifyApi.addTracksToPlaylist(req.user.id, req.params.playlistID, ["spotify:track:"+req.params.songID])
  .then(function(data) {
    console.log('Added track to playlist!');
	res.send("Succesful");
  }, function(err) {
    console.log('Something went wrong!', err);
	res.send("Unsuccessful");
  });
}

// The rest of the functions below pertain to basic CRUD operations
createUser = function(req, res){
	var aUser;
	if (req.user) {
		var aUser = {"user_name":req.params.userName, "user_role":req.params.userRole, "user_room":"None", "user_spotifyId":req.user.id, "spotifyUserObject":req.user};
	}
	else {
		var aUser = {"user_name":req.params.userName, "user_role":req.params.userRole, "user_room":"None", "user_spotifyId":"None", "spotifyUserObject":"None"};
	}
  userModel.create ( userModel.usersCollection, 
                      aUser,
                      function(result,data) {
                      // result equal to true means create was successful
                      var success = (result ? "Create successful" : "Create unsuccessful");
                      console.log(success + " for " + aUser);
                      res.send({success: success+ " for "+data.user_name});
                      });
};

getUser = function(req, res){
   var aUser = {"user_name":req.params.userName};
  userModel.retrieve(
    userModel.usersCollection, 
    aUser,
		function(modelData) {
		  if (modelData.length) {
        console.log("Found: "+JSON.stringify(modelData[0]));
        res.send({userAccount: modelData[0]});
      } else {
        console.log("Could not: "+JSON.stringify(modelData[0]));
        res.send({unsuccessful: "Retrieve unsuccessful: "+aUser.user_name});
      }
		});
}

updateUser = function(req, res){
  var filter = {"user_name":req.params.userName};
  req.session.roomName = req.params.userRoom;
  var update = {$set:{"user_role":req.params.userRole, "user_room":req.params.userRoom}};
  userModel.update( userModel.usersCollection, filter, update,
		                  function(status,user) {
                        console.log(status);
                        res.send({success: req.user});
		                });
}

deleteUser = function(req, res){
  var filter = {"user_name":req.params.userName};
  userModel.delete(
    userModel.usersCollection, 
    filter,
    function(result,status) {
      if (status.result.n) {
        console.log(result);
        res.send({success: "Deleted successfully "+status.result.n+" user: " +filter.user_name});
      } else {
        var message = "No documents with " +filter.user_name+ 
                      " in collection found.";
        console.log(result);
        console.log(message);
        res.send({success: "Delete unsuccessful; "+message});
      }
    });
};
