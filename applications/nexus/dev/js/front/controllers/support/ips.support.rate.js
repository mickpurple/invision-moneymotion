/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.rate.js
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.front.support.rate', {

		initialize: function () {
			this.on( 'submitDialog', this.update );
		},
		
		update: function (e, data) {
			$(this.scope).html( data.response );
		}
	});
}(jQuery, _));