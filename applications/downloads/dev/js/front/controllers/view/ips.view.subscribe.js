/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.view.subscribe.js - Controller to handle subscribing to new version updates
 *
 * Author: Andrew Millne
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('downloads.front.view.subscribe', {

		ajaxObj: null,

		/**
		 * Initialize controller events
		 *
		 * @returns 	{void}
		 */
		initialize: function () {
			this.on( 'click', '[data-action="subscribe"]', this.toggle );
		},

		/**
		 * Subscribe
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		toggle: function (e) {
			e.preventDefault();

			var self = this;
			var clicked = $( e.currentTarget );


			clicked.addClass('ipsFaded ipsFaded_more');

			ips.getAjax()( clicked.attr('href') )
				.done( function (response) {
					if( !response.error ) {
						if( response == 'unsubscribed' )
						{
							clicked.removeClass( 'ipsButton_primary' );
							clicked.addClass( 'ipsButton_link' );
							clicked.text( ips.getString('file_subscribe')  );
						}
						else
						{
							clicked.addClass( 'ipsButton_primary' );
							clicked.removeClass( 'ipsButton_link' );
							clicked.text( ips.getString('file_unsubscribe')  );
						}
					}

				})
				.always( function () {
					clicked.removeClass('ipsFaded ipsFaded_more');
				});
		}
	});
}(jQuery, _));