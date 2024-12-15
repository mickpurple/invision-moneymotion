/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.notifications.pendingTransactions.js
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.notifications.pendingTransactions', {
		
		/**
		 * Init
		 */
		initialize: function () {
			this.on( 'click', '[data-action="quickAction"]', this.doAction );
		},
		
		/**
		 * Event handler for the buttons
		 *
		 * @param 	{event} 	e 		Event object
		 * @returns {void}
		 */
		doAction: function (e) {
			e.preventDefault();
			var self = this;
			var button = $( e.currentTarget );
			var url = button.attr('href');
			var type = button.attr('data-action');
			var row = button.closest('[data-role="validatingRow"]');
			var name = row.find('[data-role="userName"]').text();
			var toggles = button.closest('[data-role="buttons"]');
			
			
			ips.ui.alert.show({
				type: 'confirm',
				callbacks: {
					'ok': function() {
						toggles.find('a').addClass('ipsButton_disabled');
						
						ips.getAjax()( url )
						.done( function ( response ) {
																	
							// Show flash msg
							if ( response.message ) {
								ips.ui.flashMsg.show( response.message );
							}
							
							// Update HTML
							if ( response.queue ) {
								var newElement = $( response.queue );
								$(self.scope).replaceWith( newElement );
								$( document ).trigger( 'contentChange', [ newElement ] );
							} else {
								ips.utils.anim.go( 'fadeOut', $(self.scope).closest('.cNotification') );
								$('body').trigger('updateNotificationCount');
							}
						})
						.fail( function ( response ) {
							if ( response.responseJSON ) {
								ips.ui.alert.show({
									type: 'alert',
									message: response.responseJSON,
								});
								toggles.find('a').removeClass('ipsButton_disabled');
							} else {
								window.location = url;
							}
						});
					}
				},
			});

		}
				
	});
}(jQuery, _));