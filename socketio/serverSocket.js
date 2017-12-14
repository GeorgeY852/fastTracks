/*  
	George Yao
	gyao
	67-328 
	Final Project 
	Socket IO
	December 13th, 2017
*/
exports.init = function(io) {
	var userModel = require("../models/user_model.js");
	var currentUsers = 0;
	
	io.sockets.on('connection', function (socket) {		
		// Increase the number of users and add this to the  
		++currentUsers;
		console.log(currentUsers);
		//listOfSockets[socket.id] = currentPlayers;

		// Send ("emit") a 'players' event back to the socket that just connected.
		socket.emit('users', {userCount : currentUsers});
		socket.broadcast.emit('users', {userCount : currentUsers});
		
		socket.on('DJNewRoom', function (data) {
			socket.join(data); // DJ has created the room with name of data value
		});
		
		socket.on('guestJoinRoom', function (data) {
			socket.join(data);
		});
		
		socket.on('refreshSuggestionList', function(data) {
			console.log("Everyone should be refreshed now");
			console.log(data.roomName);
			io.sockets.in(data.roomName).emit('refreshList', {updatedList: data.newList});
			io.sockets.in('"'+data.roomName+'"').emit('refreshList', {updatedList: data.newList});
		});
		socket.on('leaveRoom', function(data) {
			console.log("User is leaving this room: ");
			console.log(data);
			socket.leave(data);
		})
		socket.on('disconnect', function () {
		 	--currentUsers;	
		 	socket.broadcast.emit('users', { userCount: currentUsers});
		});
	});
};