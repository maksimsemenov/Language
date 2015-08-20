/* global module */
/**
* Word.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	
	attributes: {
		
		word: {
			type: "string",
			required: true,
			unique: true
		},
		lang: {
			type: "string",
			required: true
		},		
		pos: "string",
		transcription: "string",
		
		parent: {
			model: "word"
		},
		translationsFirstWord: {
			collection: "translation",
			via: "firstWord"
		},
		translationsSecondWord: {
			collection: "translation",
			via: "secondWord"
		}
	}	
};