/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.checkout.review.js - Review page in checkout process
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.front.checkout.review', {

		initialize: function () {
			this.on( 'submit', '[data-role="couponForm"]', this.submitCoupon );
			this.setup();
		},

		setup: function () {
			var button = this.scope.find('[data-role="couponForm"] button[type="submit"]');
			var textbox = this.scope.find('[data-role="couponForm"] input[type="text"]');

			button.prop('disabled', !textbox.val() );
			textbox.on('keyup', function (e) {
				if ( textbox.val() ) {
					button.prop( 'disabled', false );
				} else {
					button.prop( 'disabled', true );
				}
			});
		},

		submitCoupon: function (e) {
			e.preventDefault();
		}
	});
}(jQuery, _));