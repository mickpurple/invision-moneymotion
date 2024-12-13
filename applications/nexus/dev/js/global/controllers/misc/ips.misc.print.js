/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.misc.print.js - Makes the page print
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.global.misc.print', {
		
		/**
		 * Init
		 */
		initialize: function () {
			window.print();
		},
				
	});
}(jQuery, _));