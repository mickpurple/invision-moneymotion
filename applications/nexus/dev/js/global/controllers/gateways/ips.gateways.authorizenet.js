/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.gateways.authorizenet.js - Authorize.Net DPM controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.global.gateways.authorizenet', {
		
		/**
		 * Init
		 */
		initialize: function () {
			this.on( $(this.scope).closest('form')[0], 'submit', this.submitForm );
			this.setup();
		},
		
		/**
		 * Init
		 */
		setup: function(){
			this.scope.show();
		},
		
		/**
		 * Submit form action
		 *
		 * @param		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		submitForm: function(e) {
			if ( !$(e.currentTarget).find( 'input[name="payment_method"]' ).length || $(e.currentTarget).find( 'input[name="payment_method"][value="' + $(this.scope).attr('data-id') + '"]' ).is(':checked') ) {
				
				e.stopPropagation();
				
				var data = $.parseJSON( $(this.scope).attr('data-fields') );
				var i;
				for ( i in data )
				{
					$( e.currentTarget ).append( $('<input type="hidden">').attr( 'name', i ).attr( 'value', data[i] ) );
				}
				
				var expmonth = $(this.scope).find('[data-card="exp_month"]').val();
				if ( expmonth && expmonth.length == 1 ) {
					expmonth = '0' + expmonth;
				}
				$( e.currentTarget ).append( $('<input type="hidden">').attr( 'name', 'x_card_num' ).attr( 'value', $(this.scope).find('[data-card="number"]').val() ) );
				$( e.currentTarget ).append( $('<input type="hidden">').attr( 'name', 'x_exp_date' ).attr( 'value', expmonth + '-' + $(this.scope).find('[data-card="exp_year"]').val() ) );
				$( e.currentTarget ).append( $('<input type="hidden">').attr( 'name', 'x_card_code' ).attr( 'value', $(this.scope).find('[data-card="ccv"]').val() ) );
				
				$( e.currentTarget ).attr( 'action', $(this.scope).attr('data-url') );
			}
		}
		
	});
}(jQuery, _));