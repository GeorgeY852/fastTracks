/*  
	George Yao
	gyao
	67-328 
	Modules for passport
	December 13th, 2017
*/

/* 
	The files in passport-spotify are not written by me,
	but instead taken from JMPerz's github page. The link
	to his github is the follow: 
	https://github.com/JMPerez/passport-spotify/tree/master/lib/passport-spotify;
	
	index.js and strategy.js were written by JMPerz, and help with 
	the utilizing of a correct strategy for using passport with spotify.
	Most importantly, they help establish what is stored in a session after 
	authorization. Few modifications were made.
*/

/**
 * Module dependencies.
 */
var Strategy = require('./strategy');

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Strategy = Strategy;
