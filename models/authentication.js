/*  
	George Yao
	gyao
	67-328 
	Final Project 
	Authentication module 
	December 13th, 2017
*/

/*  
	This module handles the authentication needed to use 
	Spotify's api. There are two ways to get the necessary
	access and refresh tokens from Spotify (to be used for 
	calls to their api as endpoint parameters): 
	Authorization Code Flow OR Client Credentials Flow.
	If you are a DJ on the site, you have to authorize and log
	in to the web-app through Spotify, and will go through the first 
	flow. Otherwise, you are a guest that will use the Client Credentials
	flow to gain access for api calls (this is because guests do not have 
	to make any major api calls, and only need an access token briefly)
*/

// Define modules needed
var passport = require('passport');
var session = require('express-session');
var SpotifyStrategy = require('../lib/passport-spotify/index.js').Strategy;


// The Client's id and secret are stored as secrets through now

var client_id = "0557f5f1c8444161ac17e7a7e12a6a2f";
var client_secret = "5ea0b5740e2e4690ac902db20136d895";


if (process.env.CLIENT_ID){
    client_id = process.env.CLIENT_ID;               
}

// Variables needed for authentication
var stateKey = 'spotify_auth_state';
var redirect_uri = "http://localhost:50000/callback"; 

// External modules required
var SpotifyWebApi = require('spotify-web-api-node');
var userModel = require("../models/user_model.js");

// Create a new SpotifyWebApi object that holds the
// apps' identification with Spotify
var spotifyApi = new SpotifyWebApi({
  clientId : client_id,
  clientSecret : client_secret,
  redirectUri : redirect_uri
});

// Create future sessions that use the following secret,
// and initialize them
exports.init = function (app) {
	app.use(session({	
						//key:express.sid,
						secret: 'Stanley Market',
						resave: false,
					 	//store: sessionStore,
						saveUninitialized: true}));
	app.use(passport.initialize());
	app.use(passport.session());
	return passport;
}
exports.spotifyApi = spotifyApi;

// Retrieve an access token for guests who don't need
// need to log in and authenticate (using the client's id
// and secret)
spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });

// Define the strategy used for OAUTH. After authentication
// from Spotify, the client recieves the DJ's unique access and
// refresh tokens, which are used for further API calls. 
// After authentication, we return back to the server, and checks
// to see if the DJ has already logged in; if so, they are returned 
// to the index page. Otherwise, they pass the Spotify profile forward
// NOTE: Because logging in a DJ can have multiple DJ names,
// the actual document created for that DJ is created after
// choosing a unique DJ name. 
passport.use(new SpotifyStrategy({
    clientID: client_id,
    clientSecret: client_secret,
    callbackURL: "http://localhost:50000/callback",
	passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
	spotifyApi.setAccessToken(accessToken);
	console.log("access Token: " + accessToken);
	spotifyApi.setRefreshToken(refreshToken);
	console.log("refresh Token: " + refreshToken);
	// FIX THIS; GOOGLE WHERE TO PUT !REQ.USER
	process.nextTick(function(){
		userModel.retrieve(userModel.usersCollection, {'user_spotifyID':profile.id}, function(err, user) {
			// Error trying to find user
			if (err)
				console.log("Error finding user");
				return done(err);
			// User with that Spotify account is already logged in, redirecting back
			if (user) {
				console.log("Spotify account is already logged in");
				return done(null, false, req.flash('loginMessage', 'This Spotify account is already logged into the db.'));
			}
		});
		// Check if the account is already logged in
		if (!req.user) {
			return done(null, profile);
		}
		else {
			console.log("ASDF");
			return done(null, profile);
		}
		 
	});
  }
));

// Storing the user object, which is the user account
// from Spotify, into the session, retrievable by the session
passport.serializeUser(function(user, done) {
	console.log("req.session.passport.user: "+user);
  	done(null, user);
});

// Deserialize finds the correct session state given a key,
// in this case the object. 
passport.deserializeUser(function(object, done) {
	// Current error is that retrieve returns nothing; 
	// serialize stores user in req.user or req.sessions, 
	// deserialize should find the correct session state given
	// the key, which is user; current solution is to create 
	// a user here and then update it; 
	/*
	userModel.retrieve(userModel.usersCollection,{'spotifyUserObject':object}, function(err, user) {
		if (err) {
			console.log(err);
		}
		else 
			console.log('hit2');
		return done(err,user);
	})*/
	return done(null,object);
});

