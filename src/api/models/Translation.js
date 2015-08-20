/* global module */
/**
* Translation.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		firstWord: {
			model: "word",
			required: true
		},
		secondWord: {
			model: "word",
			required: true
		},
		rating: {
			type: "integer"
		},
		examples: {
			type: "array"
		},
		cards: {
			collection: "translation",
			via: "translation"
		}
	}
};