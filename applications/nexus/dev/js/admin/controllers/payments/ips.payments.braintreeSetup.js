/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.payments.braintreeSetup.js
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.payments.braintreeSetup', {
		
		/**
		 * Init
		 */
		initialize: function () {
			ips.loader.get(['https://js.braintreegateway.com/web/3.40.0/js/client.min.js']);
			this.on( 'submit', this.submitForm );
		},
		
		/**
		 * Submit form action
		 *
		 * @param		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		submitForm: function(e) {
			
			var scope = this.scope;
	
			if ( scope.find('input[name="braintree_features"]').length ) {
				return;
			}
			
			e.preventDefault();
			e.stopPropagation();
			
			var scope = this.scope;
			
			scope.find('button[type="submit"]').addClass('ipsButton_disabled').text( ips.getString('braintreeSaving') );
						
			ips.getAjax()( scope.attr('action') + '&_getClientToken=1', {
				method: 'post',
				data: {
					merchant_id: scope.find('input[name="braintree_merchant_id"]').val(),
					public_key: scope.find('input[name="braintree_public_key"]').val(),
					private_key: scope.find('input[name="braintree_private_key"]').val()
				}
			} ).done(function(response){				
				if ( response.success ) {
					ips.loader.get(['https://js.braintreegateway.com/web/3.40.0/js/client.min.js']).then( function () {
						
						var currency;
						var tokensReversed = {};
						var finalData = {};
						for ( currency in response.tokens ) {
							
							tokensReversed[ response.tokens[currency] ] = currency;
							
							braintree.client.create({
								authorization: response.tokens[currency]
							}, function(err, clientInstance) {
								if ( err ) {
									console.error( err );
									scope.find('button[type="submit"]').removeClass('ipsButton_disabled').text( ips.getString('save') );
									ips.ui.alert.show({
										type: 'alert',
										icon: 'warn',
										message: ips.getString('braintreeError'),
										subText: err.message
									});
									return;
								}
								
								var configuration = clientInstance.getConfiguration();
								
								finalData[ tokensReversed[ configuration.authorization ] ] = {
									paypal: configuration.gatewayConfiguration.paypalEnabled,
									cardTypes: configuration.gatewayConfiguration.creditCards.supportedCardTypes
								};
								
								if ( Object.keys( finalData ).length == Object.keys( response.tokens ).length ) {
									scope.append( $('<input type="hidden" />').attr( 'name', 'braintree_features' ).val( $.param( finalData ) ) );
									scope.submit();
								}
							} );
						}
					});
				} else {
					scope.find('button[type="submit"]').removeClass('ipsButton_disabled').text( ips.getString('save') );
					ips.ui.alert.show({
						type: 'alert',
						icon: 'warn',
						message: response.message
					});
				}
			});
		}
				
	});
}(jQuery, _));