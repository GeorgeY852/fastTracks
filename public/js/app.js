/*  
	George Yao
	gyao
	67-328 
	Final Project
	JS for index page
	December 13th, 2017
*/


var aUserName="";
var aUserType="";
var roomDJ="";
var roomDJID="";
var roomName="";
var roomPlaylist="";
var socket = io.connect();




$(function() {
	
	// Pressing enter is the same as clicking submit
	$(document).keypress(function(event) {
    	if (event.which == 13) {
			$('#searchButton').click();
    	}
	});
	
	// Displays number of users
	socket.on('users', function(data) {
		$(document).find("title").text("FastTracks ("+data.userCount+")");
	});
	
	// Case 0: DJ logs off
	$("#logout").on("click", function() {
		 event.preventDefault();
		$.ajax({
			url: "/users/"+aUserName,
			type: 'delete',
			success: function(data) {
				console.log(data);
				
			}
		});
		$.ajax({
			url: "/rooms/"+roomName,
			type: 'delete',
			success: function(data) {
				console.log(data);
			}
		});
		
		localStorage.clear();
		window.location = "/logout";
	});
	
	// Case 1: A guest who just recently logged in, but
	// refreshed page
	if (localStorage.getItem("userRole")==="Guest" &&
	   	(localStorage.getItem("userName"))) {
		aUserName = localStorage.getItem("userName");
		aUserType = localStorage.getItem("userRole")
		
		// Skip over initial form questions
		$("#pickRole").fadeOut(500);
		$("#pickRole").css("display","none");
		$("#initialSelection h3").hide();
		$("#initialSelection br").remove();
		
		// Show a selection of rooms for the guest
		$("#defaultRoomSelection").fadeIn(500);
		$.ajax({
			url: "/rooms/", 
			type: 'GET',
			success: function(data) {
				var formattedRooms = '<div class="row">';
				for (var i = 0; i < data.roomData.length; i++) {
					var roomEntry = '<div class="card col-md-3" id="'+data.roomData[i].room_name+'"><img src="https://placehold.it/150x80?text=IMAGE" class="card-img-top" alt="Image"> <div class="card-block"><h4 class="card-title">';
					roomEntry += data.roomData[i].room_name;
					roomEntry += '</h4><p class="card-text">';
					roomEntry += "Hosted by DJ "+data.roomData[i].room_DJ+'</p></div></div>';
					formattedRooms+=roomEntry;
				}
				formattedRooms+='</div>';
				$("#allRooms").append(formattedRooms);
		}});
	}
	// Case 1b: Clicking the log as a guest
	// will disconnect you from your current room
	$("#logo").on("click", function() {
		event.preventDefault();
		if (aUserType==="Guest") {
			socket.emit('leaveRoom',roomName);
		}
		window.location = "/";
	});
	
	// Case 2: The DJ is logged in, but refreshed his room
	// page accidentally
	if ((localStorage.getItem("userRole")==="DJ") && 
		(localStorage.getItem("roomDJID")) && 
		(localStorage.getItem("roomName")) && 
		(localStorage.getItem("roomDJ")) &&
	   	(localStorage.getItem("roomPlaylist"))) {
		roomDJID = localStorage.getItem("roomDJID");
		aUserType = localStorage.getItem("userRole");
		roomName = localStorage.getItem("roomName");
		aUserName = localStorage.getItem("roomDJ");
		roomDJ = localStorage.getItem("roomDJ");
		roomPlaylist = localStorage.getItem("roomPlaylist");
		// Skip over previous steps and return back to room
		$("#pickRole").fadeOut(500);
		$("#pickRole").css("display","none");
		$("#loginSpotify").fadeOut(500);
		$("#pickDJName").fadeOut(500);
		$("#pickDJName").css("display","none");
		$("#setUpRoom").fadeOut(500);
		$("#setUpRoom").css("display","none");
		
		/* **** DJ user should be updated and completed at this point **** */
		$.ajax({
			url: "/users/"+aUserName+"/"+aUserType+"/"+roomName, 
			type: 'POST',
			success: function(data) {
				// Joins a socketio room with the same roomname
				socket.emit('DJNewRoom',{roomName:roomName});
				
				// Set up inital room for DJ
				$("#DJroom").text(roomName+":");
				$("#DJname").text(aUserName);
				console.log("After creating room, DJ object is returned: ");
				console.log(data);
				var baseURL = "https://open.spotify.com/embed?uri=spotify:user:"+roomDJID+":playlist:"+roomPlaylist;
				$("#roomPlaylist").append('<iframe src="'+baseURL+'" height="400" frameborder="0" allowtransparency="true"></iframe>');
				$("#aRoom").fadeIn(500);
				// Load the suggestionList, which should be initally empty;
				$.ajax({
				url: "/rooms/"+roomName+"/suggestionList",
				type: 'GET',
				success: function(data) {
					$("#songSuggestions").empty();
					var songSuggestionList = '<div class="list-group">';
					for (var i = 0; i < data.suggestionlist.length; i++) {
						var entryButton = '<button type="button" id='+data.suggestionlist[i].track_id+' class="list-group-item list-group-item-action flex-column align-items-start" value = "'+data.suggestionlist[i].track_id+'">';
						var entryContent = '<div class="d-flex w-100 justify-content-between"> <h5 class="mb-1">'+data.suggestionlist[i].track_name+'</div><p class="mb-1">'+data.suggestionlist[i].track_artist+'</p><p class="mb-1"> Suggested by '+data.suggestionlist[i].suggester+'</p></button>';
									entryButton+=entryContent;
									songSuggestionList += entryButton;
					}
					songSuggestionList += "</div>";
					$('#songSuggestions').append(songSuggestionList);
					
					// Now logged in, the DJ's details are stored locally
					// until the window closes; this will be used redirect 
					// the DJ back to setting up the room in the final stage.
					
					// If back at final stage of setting up room, but roomName exists
					// send ajax request to delete the room. 
					localStorage.setItem("userRole", "DJ");
					localStorage.setItem("roomName", roomName);
					// The spotify ID of the DJ
					localStorage.setItem("roomDJID", roomDJID);
					// The DJ's choosen name
					localStorage.setItem("roomDJ",aUserName);
					//localStorage.getItem("roomPlaylist",roomPlaylist);
			}});
		}});
	}

		 
		 
	// DJ or Guest
	$("#pickRole").submit( function(event) {
		event.preventDefault();
		aUserType = $(this).find("input[type=submit]:focus" ).val();
		console.log(aUserType);
		$("#pickRole").fadeOut(500);
		$("#pickRole").css("display","none");
		if (aUserType === "DJ") {
			$("#loginSpotify").fadeIn(500);
		} else {
			$("#pickUsername").fadeIn(500);
		}
	});

	// Username for guest
	$("#pickUsername").submit(function() {	
		event.preventDefault();
		aUserName = $('#un_form').val();
		
		if (aUserName === null || aUserName === "") {
			alert("Username cannot be empty!");
			return;
		}
		// Check if guest name has already been taken
		$.ajax({
			url:"/users/"+aUserName,
			type: 'GET',
			success: function(data) {
				// Username already exists
				if (data.userAccount) {
					alert("Username is already taken!");
					return;
				} else {
					
					$("#pickUsername").fadeOut(500);
        			$("#pickUsername").css("display","none");
					
					// Create a guest document
					$.ajax({
						url: "/users/"+aUserName+"/"+aUserType, 
						type: 'PUT',
						success: function(data) {
							console.log("Successfully created guest account");
					}});
					localStorage.setItem("userName", aUserName);
					localStorage.setItem("userRole", "Guest");
					$("#initialSelection h3").hide();
					$("#initialSelection br").remove();
					
					// Show a selection of rooms for the guest
					$("#defaultRoomSelection").fadeIn(500);
					$.ajax({
						url: "/rooms/", 
						type: 'GET',
						success: function(data) {
							var formattedRooms = '<div class="row">';
							for (var i = 0; i < data.roomData.length; i++) {
								var roomEntry = '<div class="card col-md-3" id="'+data.roomData[i].room_name+'"><img src="https://placehold.it/150x80?text=IMAGE" class="card-img-top" alt="Image"> <div class="card-block"><h4 class="card-title">';
								roomEntry += data.roomData[i].room_name;
								roomEntry += '</h4><p class="card-text">';
								roomEntry += "Hosted by DJ "+data.roomData[i].room_DJ+'</p></div></div>';
								formattedRooms+=roomEntry;
							}
							formattedRooms+='</div>';
							$("#allRooms").append(formattedRooms);
					}});
				}}});	
     });

	// Log in through Spotify if DJ
	$("#loginSpotify").submit(function(event) {
		event.preventDefault();
		$("#loginSpotify").fadeOut(500);
		$("#loginSpotify").css("display","none");	
		$("pickDJName").fadeIn(500);
	});
	
	// Select username for DJ
	$("#pickDJName").submit(function() {
		event.preventDefault();
		aUserType = "DJ";
		aUserName = $('#dj_name_form').val();
		if (aUserName === null || aUserName === "") {
			alert("DJ name cannot be empty!");
			return;
		}
		// Check if username already exists
		$.ajax({
			url:"/users/"+aUserName,
			type: 'GET',
			success: function(data) {
					// Username already exists
					if (data.userAccount) {
						alert("Username is already taken!");
						return;
					} else {
						$("#pickDJName").fadeOut(500);
						$("#pickDJName").css("display","none");
						$("#setUpRoom").fadeIn(500);
						console.log(aUserType);
						// Create a DJ user into the user collection
						$.ajax({
							url: "/users/"+aUserName+"/"+aUserType, 
							type: 'PUT',
							success: function(data) {
							console.log("Successfully created DJ account");
						}});
					}
			}});
		// Get all the playlists of the DJ's account
		$.ajax({
			url: "/getPlaylists", 
			type: 'GET',
			success: function(data) {
				$("#playlistsFromSpotify").empty();
				var myDiv = document.getElementById("playlistsFromSpotify");
				console.log("Playlist data recieved: ");
				console.log (data.playlists);
				var selectPlayList = document.createElement("select");
				selectPlayList.id = "selectPlayList";
				selectPlayList.className = "custom-select form-control";
				myDiv.appendChild(selectPlayList);
				for(var i = 0; i < data.playlists.length; i++)
				{
					var opt = document.createElement("option");
					opt.value= data.playlists[i].id;
					opt.innerHTML = data.playlists[i].name; 
					selectPlayList.appendChild(opt);
				}
		}});
		
		
     });
	
	// Choose room name and room playlist
	$("#setUpRoom").submit(function(event) {
		event.preventDefault();
		$("#setUpRoom").fadeOut(500);
		$("#setUpRoom").css("display","none");
		roomName = $("#room_name").val();
		roomPlaylist=$("#selectPlayList").val();
		/* **** Room should be created at this point **** */
		$.ajax({
			url: "/rooms/"+roomName+"/"+aUserName+"/"+roomPlaylist, 
			type: 'PUT',
			success: function(data) {
				console.log(data);
		}});
		/* **** DJ user should be updated and completed at this point **** */
		$.ajax({
			url: "/users/"+aUserName+"/"+aUserType+"/"+roomName, 
			type: 'POST',
			success: function(data) {
				// Joins a socketio room with the same roomname
				socket.emit('DJNewRoom',{roomName:roomName});
				
				// Set up inital room for DJ
				$("#DJroom").text(roomName+":");
				$("#DJname").text(aUserName);
				console.log("After creating room, DJ object is returned: ");
				console.log(data);
				roomDJID = data.success.username;
				var baseURL = "https://open.spotify.com/embed?uri=spotify:user:"+roomDJID+":playlist:"+roomPlaylist;
				$("#roomPlaylist").append('<iframe src="'+baseURL+'" height="400" frameborder="0" allowtransparency="true"></iframe>');
				$("#aRoom").fadeIn(500);
				// Load the suggestionList, which should be initally empty;
				$.ajax({
				url: "/rooms/"+roomName+"/suggestionList",
				type: 'GET',
				success: function(data) {
					$("#songSuggestions").empty();
					var songSuggestionList = '<div class="list-group">';
					for (var i = 0; i < data.suggestionlist.length; i++) {
						var entryButton = '<button type="button" id='+data.suggestionlist[i].track_id+' class="list-group-item list-group-item-action flex-column align-items-start" value = "'+data.suggestionlist[i].track_id+'">';
						var entryContent = '<div class="d-flex w-100 justify-content-between"> <h5 class="mb-1">'+data.suggestionlist[i].track_name+'</div><p class="mb-1">'+data.suggestionlist[i].track_artist+'</p><p class="mb-1"> Suggested by'+data.suggestionlist[i].suggester+'</p></button>';
									entryButton+=entryContent;
									songSuggestionList += entryButton;
					}
					songSuggestionList += "</div>";
					$('#songSuggestions').append(songSuggestionList);
					
					// Now logged in, the DJ's details are stored locally
					// until the window closes; this will be used redirect 
					// the DJ back to setting up the room in the final stage.
					
					// If back at final stage of setting up room, but roomName exists
					// send ajax request to delete the room. 
					localStorage.setItem("userRole", "DJ");
					localStorage.setItem("roomName", roomName);
					// The spotify ID of the DJ
					localStorage.setItem("roomDJID", roomDJID);
					// The DJ's choosen name
					localStorage.setItem("roomDJ",aUserName);
					localStorage.setItem("roomPlaylist",roomPlaylist);
			}});
		}});
	});	
	
	
	

	
	// When a guest selects a room to join:
	$('#allRooms').on('click', '.row .card', function() { 
		$("#defaultRoomSelection").remove();
		$("#allRooms").remove();
		guestJoinRoom(this.id);
	});
	
	// When either the DJ or guest suggests a song
	$("#responseList").on('click', ':button',function() {
		addToSuggestion(this.id,this.value);
	});

	// Works only for the DJ, when clicking on a song,
	// that song is removed from the suggestion list
	$("#songSuggestions").on('click', ':button',function() {	
		if (aUserType==="" || aUserType==="Guest") {
			return;
		}
		console.log("Check if this is undefined");
		var songRemovedFromSuggestions = this.id;
		// Add song to playlist
		$.ajax({
			url: "/addSong/"+roomPlaylist+"/"+this.id, 
			type: 'POST',
			success: function(data) {
				if (data) {
					console.log("Successfully moved song from suggestion to playlist");
					refreshRoomPlaylist();
					$("#roomPlaylist").empty();
					var baseURL = "https://open.spotify.com/embed?uri=spotify:user:"+roomDJID+":playlist:"+roomPlaylist;
					$("#roomPlaylist").append('<iframe src="'+baseURL+'" height="400" frameborder="0" allowtransparency="true"></iframe>');
					socket.emit('refreshRoomPlaylist',{userId:roomDJID});
					$.ajax({
						url:"/rooms/"+roomName+"/"+songRemovedFromSuggestions,
						type: 'POST',
						success: function(data) {
							console.log("Removed suggestion from this room: ");
							console.log(data.result);
							// Getting the room's (updated) suggestion list using the previous ajax's data, the room object
							$.ajax({
								url: "/rooms/"+roomName+"/suggestionList",
								type: 'GET',
								success: function(data) {
									$("#songSuggestions").empty();
									var songSuggestionList = '<div class="list-group">';
									console.log(data);
									console.log(data.suggestionlist[0]);
									for (var i = 0; i < data.suggestionlist.length; i++) {
										var entryButton = '<button type="button" id='+data.suggestionlist[i].track_id+' class="list-group-item list-group-item-action flex-column align-items-start" value = "'+data.suggestionlist[i].track_id+'">';
										var entryContent = '<div class="d-flex w-100 justify-content-between"> <h5 class="mb-1">'+data.suggestionlist[i].track_name+'</div><p class="mb-1">'+data.suggestionlist[i].track_artist+'</p><p class="mb-1"> Suggested by'+data.suggestionlist[i].suggester+'</p></button>';
										entryButton+=entryContent;
										songSuggestionList += entryButton;
									}
									songSuggestionList += "</div>";
									$('#songSuggestions').append(songSuggestionList);
									
									// update this emit and any other refresh suggestion to just send the above html list, instead of room
									socket.emit('refreshSuggestionList',{newList:songSuggestionList,roomName:roomName});
								}
							});
						}		
					});
				}
			}
		});
	});


	

});


// Can't fix this bug: Attempted to refresh the
// the suggestion list everytime someone makes an edit,
// but couldn't get the event be sent back from the socket io
// file
socket.on('refreshList', function(data) {
	//event.preventDefault();
	console.log("Did everyone get this message?");
	$("#songSuggestions").empty();
	$("#songSuggestions").append(data.updatedList);
});

// Alternative solution was to update the list every 10 seconds
// across all rooms; very resource heavy though
function refreshSuggestionPlaylist() {
	$("#songSuggestions").empty();
	$.ajax({
		url: "/rooms/"+roomName+"/suggestionList",
		type: 'GET',
		success: function(data) {
			$("#songSuggestions").empty();
			var songSuggestionList = '<div class="list-group">';
			console.log(data);
			console.log(data.suggestionlist[0]);
			for (var i = 0; i < data.suggestionlist.length; i++) {
				var entryButton = '<button type="button" id='+data.suggestionlist[i].track_id+' class="list-group-item list-group-item-action flex-column align-items-start" value = "'+data.suggestionlist[i].track_id+'">';
				var entryContent = '<div class="d-flex w-100 justify-content-between"> <h5 class="mb-1">'+data.suggestionlist[i].track_name+'</div><p class="mb-1">'+data.suggestionlist[i].track_artist+'</p><p class="mb-1"> Suggested by'+data.suggestionlist[i].suggester+'</p></button>';
				entryButton+=entryContent;
				songSuggestionList += entryButton;
			}
			songSuggestionList += "</div>";
			$('#songSuggestions').append(songSuggestionList);
		}});
};
setInterval(refreshSuggestionPlaylist,10000);


// Refresh the playlist every minute 
// (Spotify's web iframe has a known issue
// of a delay in updating itself; this is just 
// an added measure to make sure that the web-player
// is relatively up to date)
function refreshRoomPlaylist() {
	$("#roomPlaylist").empty();
	var baseURL = "https://open.spotify.com/embed?uri=spotify:user:"+roomDJID+":playlist:"+roomPlaylist;
	$("#roomPlaylist").append('<iframe src="'+baseURL+'" height="400" frameborder="0" allowtransparency="true"></iframe>');
	socket.emit('refreshRoomPlaylist',{roomDJID});	
}
setInterval(refreshRoomPlaylist,60000);

// Search for songs through spotify query
function searchThroughSpotify() {
	var searchRequest = $("#searchSpotify").val()
	// If nothing is in the field, send alert to user
	if ($("#searchSongs").val()=='') {
		// add error checking later
		return;
	}
	else {
		$.ajax({
		url: "/searchSongs/"+searchRequest, 
		type: 'GET',
		success: function(data) {
			$('#responseList').empty();
			var spotifyResponse = '<div class="list-group">';
			var length = data.tracks.items.length;
			for (var i = 0; i < length; i++) {
				var entryButton = '<button type="button" id='+data.tracks.items[i].id+' class="list-group-item list-group-item-action flex-column align-items-start" value = "'+data.tracks.items[i].name+'_'+data.tracks.items[i].artists[0].name+'">';
				var entryContent = '<div class="d-flex w-100 justify-content-between"> <h5 class="mb-1">'+data.tracks.items[i].name+'</div><p class="mb-1">'+data.tracks.items[i].artists[0].name+'</p></button>';
				entryButton+=entryContent;
				spotifyResponse += entryButton;
			}
			spotifyResponse += "</div>";
			$('#responseList').append(spotifyResponse);
			console.log(data);
			return;
		}});
	}
}

// Add song from search to suggestion list
function addToSuggestion(trackId,trackInfo) {
	var [trackName, trackArtist] = trackInfo.split('_');
	$.ajax({
		url: "/rooms/"+roomName+"/"+trackName+"/"+trackId+"/"+trackArtist+"/"+aUserName, 
		type: 'POST',
		success: function(data) {
			console.log(data);
			if (data) {
				$.ajax({
					url:"/rooms/"+roomName,
					type: 'GET',
					success: function(data) {
						$("#songSuggestions").empty();
						var songSuggestionList = '<div class="list-group">';
						for (var i = 0; i < data.roomData[0].room_suggestion_list.length; i++) {
							var entryButton = '<button type="button" id='+data.roomData[0].room_suggestion_list[i].track_id+' class="list-group-item list-group-item-action flex-column align-items-start" value = "'+data.roomData[0].room_suggestion_list[i].track_id+'">';
							var entryContent = '<div class="d-flex w-100 justify-content-between"> <h5 class="mb-1">'+data.roomData[0].room_suggestion_list[i].track_name+'</div><p class="mb-1">'+data.roomData[0].room_suggestion_list[i].track_artist+'</p></button>';
							entryButton+=entryContent;
							songSuggestionList += entryButton;
						}
						songSuggestionList += "</div>";
						$('#songSuggestions').append(songSuggestionList);
						socket.emit('refreshSuggestionList',{newList:songSuggestionList,roomName:roomName});
					}
				});
			}
		}
	});
}

function guestJoinRoom(nameOfRoom) {
	socket.emit('joinRoom',{roomName:nameOfRoom});
	roomDJID = "";
	var baseURL = "";
	$.ajax({
		url:"/rooms/"+nameOfRoom,
		type:"GET",
		success: function(data) {
			$("#defaultRoomSelection").css("display","none");
			roomDJ= data.roomData[0].room_DJ;
			roomName= data.roomData[0].room_name;
			roomPlaylist= data.roomData[0].room_playlist;
			console.log(data)
			$("#DJroom").text(data.roomData[0].room_name);
			$("#DJname").text(data.roomData[0].room_DJ);
			$("#aRoom").fadeIn(500);
			// Get the Room's DJ object to load iframe
			$.ajax({
				url:"/users/"+roomDJ,
				type:"GET",
				success: function(data) {
					roomDJID = data.userAccount.user_spotifyId;
					console.log(data.userAccount.user_spotifyId);
					baseURL = "https://open.spotify.com/embed?uri=spotify:user:"+roomDJID+":playlist:"+roomPlaylist;
					$("#roomPlaylist").append('<iframe src="'+baseURL+'" height="400" frameborder="0" allowtransparency="true"></iframe>');
				}
			});
			// Loads up initial song suggestion list
			$.ajax({
				url: "/rooms/"+roomName+"/suggestionList",
				type: 'GET',
				success: function(data) {
					$("#songSuggestions").empty();
					var songSuggestionList = '<div class="list-group">';
					for (var i = 0; i < data.suggestionlist.length; i++) {
						var entryButton = '<button type="button" id='+data.suggestionlist[i].track_id+' class="list-group-item list-group-item-action flex-column align-items-start" value = "'+data.suggestionlist[i].track_id+'">';
						var entryContent = '<div class="d-flex w-100 justify-content-between"> <h5 class="mb-1">'+data.suggestionlist[i].track_name+'</div><p class="mb-1">'+data.suggestionlist[i].track_artist+'</p><p class="mb-1"> Suggested by'+data.suggestionlist[i].suggester+'</p></button>';
									entryButton+=entryContent;
									songSuggestionList += entryButton;
					}
					songSuggestionList += "</div>";
					$('#songSuggestions').append(songSuggestionList);
				}
			});
		}
	});
}