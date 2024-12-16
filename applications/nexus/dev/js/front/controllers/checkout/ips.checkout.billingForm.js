/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.checkout.billingAddress.js
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.front.checkout.billingForm', {
		
		initialize: function () {
			this.on( 'click', '[data-action="changeShippingAddress"]', this.newShippingAddress );
			//this.setup();
		},
		
		setup: function () {
			
		},

		newShippingAddress: function (e) {
			e.preventDefault();
			var url = this.scope.attr('data-new-billing-address-url');

			var dialogRef = ips.ui.dialog.create({
				title: ips.getString('changeShippingAddress'),
				fixed: false,
			    url: url,
			    size: 'medium'
			});
			dialogRef.show();
		},
		
		updateSelectedAddress: function ( val, dialogUrl ) {
			if ( val == 0 ) {
				
				var dialogRef = ips.ui.dialog.create({
					title: '',
					fixed: false,
				    url: dialogUrl
				});
				dialogRef.show();
				
			} else {
				window.location = window.location + '&shipping_address=' + val;
			}
		}
		
				
	});
}(jQuery, _));