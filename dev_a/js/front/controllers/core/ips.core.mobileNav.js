/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.mobileNav.js - Mobile navigation controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.mobileNav', {

		initialize: function () {
			this.on( document, 'notificationCountUpdate', this.updateCount );
		},

		/**
		 * Update the badge when we have a different notification count
		 *
		 * @param	{event} 	e 		Event object
		 * @param 	{object} 	data 	Event data object
		 * @returns {void}
		 */
		updateCount: function (e, data) {
			if( !_.isUndefined( data.total ) ){
				if( data.total <= 0 ){
					this.scope.find('[data-notificationType="total"]').hide();
				} else {
					this.scope.find('[data-notificationType="total"]').text( parseInt( data.total ) );
				}
			}
		}
	});
}(jQuery, _));