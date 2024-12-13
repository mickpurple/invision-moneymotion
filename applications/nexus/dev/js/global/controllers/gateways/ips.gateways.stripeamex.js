/**
 * IPS Community Suite 4
 * (c) 2017 Invision Power Services - http://www.invisionpower.com
 *
 * ips.gateways.stripeamex.js - Stripe Amex Express Checkout Controller
 *
 * Author: Mark Wade
 */
/* A global function breaks our coding standards, but it's the only way Amex will allow it */
function aecCallbackHandler(response){
	jQuery( window ).trigger( 'aecCallbackHandler', response );
};

;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.global.gateways.stripeamex', {
		
		selected: false,
		
		/**
		 * Init
		 */
		initialize: function () {
			this.setup();
		},
		
		/**
		 * Init
		 */
		setup: function(){
			var self = this;
			ips.loader.get( ['https://icm.aexp-static.com/Internet/IMDC/US_en/RegisteredCard/AmexExpressCheckout/js/AmexExpressCheckout.js'] );
			
			$( window ).on( 'aecCallbackHandler', function(e,response) {
				$(self.scope).find('input').val( response.token );
				$(self.scope).closest('form').submit();
			});	
		}
		
	});
}(jQuery, _));