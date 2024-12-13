/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.pendingalert.js - Shows an alert
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.pendingalert', {
		
		/**
		 * Init
		 */
		initialize: function () {
			ips.ui.alert.show( {
				type: 'alert',
				icon: 'warn',
				message: $(this.scope).text(),
			});
			$(this.scope).remove();
		},
				
	});
}(jQuery, _));