/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.utils.js - General utilities
 *
 * Author: Rikki Tissier
 */

;( function($, _, undefined){
	"use strict";
	
	ips.createModule('ips.utils', function (options) {

		/**
		 * Converts an arguments object to an array
		 *
		 * @param	{object} 	obj 	Arguments object
		 * @returns {array}
		 */
		var argsToArray = function (obj) {
			return Array.prototype.slice.call( obj );
		},

		/**
		 * Uppercases the first letter in a string
		 *
		 * @param 	{string} 	fromString 		String to use
		 * @returns {string}	String with first letter uppercased
		 */
		uppercaseFirst = function (fromString) {
			return fromString.charAt(0).toUpperCase() + fromString.slice(1);
		},

		/**
		 * Given a comma-delimited string, returns a string that can be used as a selector for IDs
		 *
		 * @param	{array,string} 	list 	Array of values, or comma-delimited string
		 * @returns {mixed}	 Selector string in format: #value1, #value2, or false if no values
		 */
		getIDsFromList = function (list) {
			if( !list ){
				return '';
			}
			
			if( !_.isArray( list ) ){
				list = list.toString().split(',');
			}

			list = _.compact( list );

			if( !list.length ){
				return false;
			}

			return _.map( list, function (val){
				return '#' + val;
			}).join(',');
		},
		
		/**
		 * Get a citation for a quote
		 *
		 * @param	{object} 	data 	The quote data
		 * @param	{bool}		html	If this can include HTML
		 * @returns {string}
		 */
		getCitation = function(data, html, defaultValue) {
			var citation = ips.getString('editorQuote');
			if ( defaultValue ) {
				var citation = defaultValue;
			}
			if( data.username ){
				var username = data.username;
				if ( html && data.userid && ips.getSetting('viewProfiles') ) {
					username = ips.templates.render( 'core.editor.citationLink', {
						baseURL: ips.getSetting('baseURL'),
						userid: data.userid,
						username: data.username
					} );
				} else {
					username = _.escape( username );
				}
				if( data.timestamp ){
					var citation = ips.getString( 'editorQuoteLineWithTime', {
						date: ips.utils.time.readable( data.timestamp ),
						username: username
					} );
				} else {
					var citation = ips.getString( 'editorQuoteLine', { username: username } );
				}
			}
			return citation;
		},

		escapeRegexp = function (toEscape) {
			return toEscape.replace( /[.*+?^${}()|[\]\\]/g, "\\$&" );
		},

		/**
		 * urlBase64ToUint8Array
		 * 
		 * @param {string} base64String a public vavid key
		 */
		urlBase64ToUint8Array = function (base64String) {
			var padding = '='.repeat((4 - base64String.length % 4) % 4);
			var base64 = (base64String + padding)
				.replace(/\-/g, '+')
				.replace(/_/g, '/');

			var rawData = window.atob(base64);
			var outputArray = new Uint8Array(rawData.length);

			for (var i = 0; i < rawData.length; ++i) {
				outputArray[i] = rawData.charCodeAt(i);
			}
			return outputArray;
		};

		return {
			argsToArray: argsToArray,
			uppercaseFirst: uppercaseFirst,
			getIDsFromList: getIDsFromList,
			getCitation: getCitation,
			escapeRegexp: escapeRegexp,
			urlBase64ToUint8Array: urlBase64ToUint8Array
		};
	});
}(jQuery,_));