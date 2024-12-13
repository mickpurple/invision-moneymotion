/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.convert.menu.js - 
 *
 * Author: Ryan Ashbrook
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('convert.admin.convert.menu', {

		initialize: function () {
			this.on( 'click', "[data-action='reConvert']", this.areYouSure );
			this.on( 'click', "[data-action='remove_converted_data']", this.removeConverted );
		},
		
		areYouSure: function(e) {
			var self = this;
			
			e.preventDefault();
			
			ips.ui.alert.show( {
				type: 'confirm',
				icon: 'warning',
				message: 'Are you sure you wish to reconvert this?',
				subText: 'Reconverting can cause data inconsistency. If you reconvert this step, you must also reconvert each step below it.',
			} );
		},
		
		removeConverted: function(e) {
			var self = this;
			
			e.preventDefault();
			
			ips.ui.alert.show( {
				type: 'confirm',
				icon: 'warning',
				message: 'Are you sure you wish to remove all converted data for this step?',
				subText: 'Removing all converted data will remove all data that has been converted for this step. This action cannot be undone.',
			} );
		}
	} );
}(jQuery, _));