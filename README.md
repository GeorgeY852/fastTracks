# fastTracks

This is my final project for the 67-328 Mobile to Cloud: Building Distributed SYstems. This project reolves around utilizing all the back-end technolgy we covered this semester; ranging from express+nodejs, passport, socket.io, jquery and others. This project in particular focuses on making third-party web API calls to Spotify. 

fastTrack is a web-application build on a Bootstrap framework to help allow individuals share and suggest songs to DJs at social events. Using the spotify API, it allows guests to suggest songs to an event's DJ and their playlist. It is made with a focus on the backend to meet the requirements of the final project, including appropiate use of AJax, socketio, localSession storage and more. 

## Prerequisites
This majority of this application was written in JavaScript. It uses a number of modules that can be managed by NPM; mongoDB is used as the back-end main persistent storage. 

To easily run the application locally, have install node; You can download Node at the following link: https://nodejs.org/en/download/. 
 On top of this, download NPM to get easy management of third-party modules at this link:https://www.npmjs.com/get-npm
After downloading, go into the parent directory and type
  $ npm init
To automatically create node_module folder containing necessary modules used in the application. Finally, type 
  $ node app
to have your computer start the local server. 

## Using the application
This application can be best utilized with at least two individuals: One as the DJ, and the other as the guest. The DJ will follow the simple steps to setting up a room, including choosing names, give authorization and choosing a room playlist. The guest will simply have to choose a unique username. After the DJ has done setting up the room, the guest should be able to see a selection of available rooms (run locally, it would probably only be the room he just opened). Click on the selection to enter the DJ's room, and you'll be presented with a screen split in three columns: The left column returns any track results you search for; the middle column displays suggested songs you and any others in the room have choosen; the right column shows a reguarlly updated spotify playlist. Anyone in the room can search for songs, and simply click on them to add them to the suggestion list. However, only the DJ of the room can move this song into the room-playlist. Users do not have to continuously create unique names, as local storage and passport sesions remembers recent users of the application. This application works best when used with the desktop spotify application running in the back; additions to the playlist are seen immedieatly on the desktop version, allowing DJs to split their attention easily between suggestions from the audience, and mixing on the computer.

## Notes about the application
While this application does work in functionality, there are still a lot of practical 'bugs'. The original button to leave a room as a DJ was eventually removed due to session issues. Thus, the only way to truly 'leave' a room is to logout; doing so will delete the room's data in the rooms collection. The DJ's object is shortly after also removed. I did not create a way to remove any guests, unfortunetly focusing too much on fixing bugs and thinking about using the application practically (ie. not having to worry about login details and such). Additionally, there are console.log messages on both front and back end, which were meant to be used for debugging. 

## Future improvments
* Improve back-end design with more features, including: the ability to kick users, a simply voting system to upvote/downvote suggestions, the ability for Dj's to have multiple rooms, a simply chat system. 
* Patch up known security flaws
* Reformat front-end UI 

## Built With
* [Spotify Web Api](https://developer.spotify.com/web-api/) - Needed to manipulate playlists, search for songs, 
* [JavasScript](https://www.javascript.com/) - Build the majority of the models and controllers 
* [BootStrap](https://getbootstrap.com/) - Utilized grid system to be used across devices
* [Express](https://expressjs.com/) - Web application framework used for backend server
* [passport](http://www.passportjs.org/) - Authentication usage with Spotify's security control flows
* [socket.io](https://socket.io/docs/) - to create and establish room connections


## Author
* **George Yao** 
