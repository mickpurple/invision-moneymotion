/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.marketplace.onboard.js - Handles looking up an existing app/plugin/theme
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.marketplace.onboard', {
		
		initialize: function () {
			this.on( 'onboardMatch', this.check );
			this.check();
		},
		
		check: function () {
			var haveAllMatches = true;
			this.scope.find('[data-role="confirm"]').each(function(){
				if ( $(this).val() == 0 ) {
					haveAllMatches = false;
				}
			});
			
			if ( haveAllMatches ) {
				this.scope.find('[data-role="continueButton"]').removeClass('ipsButton_disabled').prop('disabled', false);
			} else {
				this.scope.find('[data-role="continueButton"]').addClass('ipsButton_disabled').prop('disabled', true);
			}
		}
	});
}(jQuery, _));