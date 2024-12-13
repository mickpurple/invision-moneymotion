/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.ui.lazyLoad.js - Widget that will find lazy loaded elements and begin observing them
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.createModule('ips.ui.lazyLoad', function(){

		/**
		 * Responder for lazyLoad widget
		 *
		 * @param	{element} 	elem 		The element this widget is being created on
		 * @param	{object} 	options 	The options passed into this instance
		 * @param	{event} 	e 		 	The event object passed through
		 * @returns {void}
		 */
		var respond = function (elem, options, e) {
			ips.utils.lazyLoad.observe( elem );	
		};
		
		// Register this widget with ips.ui
		ips.ui.registerWidget( 'lazyLoad', ips.ui.lazyLoad );

		return {
			respond: respond
		}
	});
}(jQuery, _));