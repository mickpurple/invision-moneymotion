/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.store.currencySelect.js - Alert when changing currency
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.front.store.currencySelect', {

		initialize: function () {
			this.on( 'click', 'a', this.currencyChangeWarning );
		},
		
		/**
		 * Prevent checkout button being clicked more than once
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		currencyChangeWarning: function (e) {
			e.preventDefault();

			var url = $(e.currentTarget).attr('href');;

			ips.ui.alert.show({
				type: 'confirm',
				message: ips.getString('store_currency_change_warning'),
				icon: 'warn',
				callbacks: {
					ok: function () {
						window.location = url;
					}
				}
			});
			
			
		}
	});
}(jQuery, _));