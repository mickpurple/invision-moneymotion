/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.checkout.shippingForm.js - Address book for shipping form
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.front.checkout.shippingForm', {

		initialize: function () {
			this.on( 'change', 'select', this.selectNew );
			this.on( 'keypress', 'input[type="text"]', this.selectNew );
		},

		selectNew: function () {
			this.scope.find('[name="shipping_address"][value="0"]').prop( 'checked', true );
		}
	});
}(jQuery, _));