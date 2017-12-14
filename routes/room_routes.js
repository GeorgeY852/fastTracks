/*  
	George Yao
	gyao
	67-328
	Final project
	Room routes (server-side)
	December 13th, 2017
*/

// Include my room model and authentication module
var roomModel = require("../models/room_model.js");
var authenticationModule = require('../models/authentication');
var spotifyApi = authenticationModule.spotifyApi;

// Define the routes for this controller
exports.init = function(app) {	
	// Route for basic, CRUD operations
	app.get("/rooms/:roomName?", getRoom);
    app.put("/rooms/:roomName/:roomDJ/:roomPlaylist", createRoom);
	app.delete("/rooms/:roomName", deleteRoom);
	
	// These two routes are 'update' operations, and manipulate the
	// only thing that should be changed in a room: the suggestion_list
	app.post('/rooms/:roomName/:songName/:songID/:songArtist/:suggester',addSongSuggestion);
	app.post('/rooms/:roomName/:songID',removeSongSuggestion);
	
	// Route for getting suggestion list from room object
	app.get("/rooms/:roomName/suggestionList",getSuggestionList);

}
// The rest of the functions below pertain to basic CRUD operations
createRoom = function(req, res){
  	var aRoom = {"room_name":req.params.roomName, "room_DJ":req.params.roomDJ, "room_playlist":req.params.roomPlaylist, "room_suggestion_list":[]};
	// need to change back to roomModel.RoomsCollection
  	roomModel.create ("room_collection", 
					aRoom,
                     function(result,data) {
                      // result equal to true means create was successful
                      var success = (result ? "Create successful" : "Create unsuccessful");
                      console.log(success + " for " + aRoom);
                      res.send({success: success+ " for "+data.room_name});
                      });
};

getRoom = function(req, res){
	var aRoom;
	if (req.params.roomName === undefined) {
		aRoom = {};
	}
	else {
		aRoom = {"room_name":req.params.roomName};
	}
   roomModel.retrieve(
    "room_collection", 
    aRoom,
		function(roomData) {
		  if (roomData.length) {
        console.log("Found: "+JSON.stringify(roomData[0]));
        res.send({roomData: roomData});
      } else {
        console.log("Could not: "+JSON.stringify(roomData[0]));
        res.send({success: "Retrieve unsuccessful: "+aRoom.room_name});
      }
		});
}

getSuggestionList = function(req,res) {
	var aRoom = {"room_name":req.params.roomName};
   	roomModel.retrieve(
    "room_collection", 
    aRoom,
		function(data) {
		  if (data.length) {
        console.log("Found: "+JSON.stringify(data[0]));
        res.send({suggestionlist: data[0].room_suggestion_list});
      } else {
        console.log("Could not: "+JSON.stringify(data[0]));
        res.send({success: "Retrieve unsuccessful: "+aRoom.room_name});
      }
	});
	
}

addSongSuggestion = function(req, res){
  var filter = {"room_name":req.params.roomName};
  var update = {$push:{ "room_suggestion_list":{'track_id':req.params.songID,'track_name':req.params.songName,'track_artist':req.params.songArtist,'suggester':req.params.suggester}}};
  roomModel.update( "room_collection", filter, update,
		                  function(status,Room) {
                        console.log(status);
	  					res.send({successfullyUpdated: 1});
		                });
};

removeSongSuggestion = function(req, res){
	console.log("In removeSong Suggestion, not removing song here");
  var filter = {"room_name":req.params.roomName};
  var update = {$pull:{ "room_suggestion_list": {"track_id": req.params.songID}}};
	console.log("filter: ");
	console.log(filter);
	console.log("Song id: ");
	console.log(req.params.songID);
  roomModel.update( "room_collection", filter, update,
		                  function(status,Room) {
                        console.log(status);
	  					res.send({result: status});
		                });
};

deleteRoom = function(req, res){

  var filter = {"room_name":req.params.roomName};
  roomModel.delete(
    "room_collection", 
    filter,
    function(result,status) {
      if (status.result.n) {
        console.log(result);
        res.send({success: "Deleted successfully "+status.result.n+" Room: " +filter.room_name});
      } else {
        var message = "No documents with " +filter.room_name+ 
                      " in collection found.";
        console.log(result);
        console.log(message);
		res.redirect('/');
        res.send({success: "Delete unsuccessful; "+message});
      }
    });
};
