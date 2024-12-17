/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.filterForm.js
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.filterCheckboxSet', {
		
		/**
		 * Init
		 */
		initialize: function () {
			this.on( 'click', '[data-action="checkAll"]', this.checkAll );
			this.on( 'click', '[data-action="checkNone"]', this.checkNone );
		},
		
		/**
		 * Check all
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		checkAll: function (e) {
			e.preventDefault();
			this.scope
				.find('input[type="checkbox"]')
					.prop( 'checked', true )
					.closest('.ipsSideMenu_item')
						.addClass('ipsSideMenu_itemActive');
		},
		
		/**
		 * Uncheck all
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		checkNone: function (e) {
			e.preventDefault();
			this.scope
				.find('input[type="checkbox"]')
					.prop( 'checked', false )
					.closest('.ipsSideMenu_item')
						.removeClass('ipsSideMenu_itemActive');
		}
				
	});
}(jQuery, _));