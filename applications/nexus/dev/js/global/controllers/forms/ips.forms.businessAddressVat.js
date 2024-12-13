/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.forms.businessAddressVat.js - Controller for a business address form helper which will ask for a VAT number
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.global.forms.businessAddressVat', {
		
		/**
		 * Init
		 */
		initialize: function () {
			this.on( 'change', '[data-role="addressTypeRadio"]', this.changeRelevantField );
			this.on( 'change', '[data-role="countrySelect"]', this.changeRelevantField );
			this.changeRelevantField();
		},
		
		/**
		 * Change address type
		 *
		 * @returns 	{void}
		 */
		changeRelevantField: function () {
			if ( this.scope.find('[data-role="addressTypeRadio"][value="business"]').is(':checked') && ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','GB'].indexOf( this.scope.find('[data-role="countrySelect"]').val() ) !== -1 ) {
				this.scope.find('[data-role="vatField"]').show();
			} else {
				this.scope.find('[data-role="vatField"]').hide();
			}
		}
		
	});
}(jQuery, _));