/*  
	George Yao
	gyao
	67-328 
	Final Project 
	Room model (model)
	December 13th, 2017
*/

// This model uses the Node.js MongoDB Driver
var mongoClient = require('mongodb').MongoClient;

// For local testing
var connection_string = "mongodb://gyao:"
                      + "WRurqwr19!"//process.env.MLAB_NAMEOFMYDB_PASSWD
                      + "@ds113566.mlab.com:13566/fasttrack_database";//'mongodb://127.0.0.1:27017/fasttrack_database';

if(process.env.MLAB_NAMEOFMYDB_PASSWD){
    connection_string = "mongodb://gyao:"
                      + "WRurqwr19!"//process.env.MLAB_NAMEOFMYDB_PASSWD
                      + "@ds113566.mlab.com:13566/fasttrack_database"                
}

// Global variable of the connected database
var mongoDB; 

// Use connect method to connect to the MongoDB server
mongoClient.connect(connection_string, function(err, db) {
  if (err) doError(err);
  console.log("Connected to MongoDB server at: "+connection_string);
  mongoDB = db; // Make reference to db globally available.
});

/*
  A user model has 4 main attributes: 
  		user_name (string), 
		user_role (string), 
		user_rooms (string),
  		spotifyID (string)
*/

/*
 * Collection name is stored in the user models, as opposed to being on
 * the client side
 */
exports.usersCollection = "user_collection";

/********** CRUD Create -&gt; Mongo insert ***************************************
 * @param {string} collection - The collection within the database
 * @param {object} data - The object to insert as a MongoDB document
 * @param {function} callback - Function to call upon insert completion
 */
exports.create = function(collection, data, callback) {
  // Do an asynchronous insert into the given collection
  mongoDB.collection(collection).insertOne(
    data,                     // the object to be inserted
    function(err, status) {   // callback upon completion
      if (err) doError(err);
      // use the callback function supplied by the controller to pass
      // back true if successful else false
      var success = (status.result.n == 1 ? true : false);
      callback(success,data);
    });
}

/********** CRUD Retrieve -&gt; Mongo find ***************************************
 * @param {string} collection - The collection within the database
 * @param {object} query - The query object to search with
 * @param {function} callback - Function to call upon completion
 */
exports.retrieve = function(collection, query, callback) {
  mongoDB.collection(collection).find(query).toArray(function(err, docs) {
    if (err) doError(err);
    // docs are MongoDB documents, returned as an array of JavaScript objects
    // Use the callback provided by the controller to send back the docs.
    callback(docs);
  });
}

/********** CRUD Update -&gt; Mongo updateMany ***********************************
 * @param {string} collection - The collection within the database
 * @param {object} filter - The MongoDB filter
 * @param {object} update - The update operation to perform
 * @param {function} callback - Function to call upon completion
 */
exports.update = function(collection, filter, update, callback) {
  mongoDB
    .collection(collection)     // The collection to update
    .updateMany(                // Use updateOne to only update 1 document
      filter,                   // Filter selects which documents to update
      update,                   // The update operation
      {upsert:true},            // If document not found, insert one with this update
                                // Set upsert false (default) to not do insert
      function(err, status) {   // Callback upon error or success
        if (err) doError(err);
        callback('Modified '+ status.modifiedCount 
                 +' and added '+ status.upsertedCount+" documents",filter);
        });
}

/********** CRUD Delete -&gt; Mongo deleteOne or deleteMany **********************
 * @param {string} collection - The collection within the database
 * @param {object} filter - The MongoDB filter
 * @param {function} callback - Function to call upon completion
 */
exports.delete = function(collection, filter, callback) {
  mongoDB
    .collection(collection)     // The collection to update
    .deleteOne(                 // Use deleteOne to only update 1 document
      filter,                   // Filter selects which documents to update
      null,                     // options (Default null)
      function(err, result) {   // Callback upon error or success
        if (err) doError(err);
        callback('Deleted '+ result.result.n + ' document(s)', result);
        });
}

var doError = function(e) {
        console.error("ERROR: " + e);
        throw new Error(e);
    }