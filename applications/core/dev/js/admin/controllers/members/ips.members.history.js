/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.members.history.js - Filters for member history log
 *
 * Author: Mark Wade
 */

;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.members.history', {

		initialize: function () {
			this.on( 'menuItemSelected', this.filterSelected );
		},
		
		/**
		 * Event handler for when a filter option is chosen
		 *
		 * @param	{event} 	e		Event object
		 * @param	{object} 	data	Event data object
		 * @returns {void}
		 */
		filterSelected: function (e, data) {
			if( data.originalEvent ){
				data.originalEvent.preventDefault();
			}
												
			if( data.triggerID == 'memberHistoryFilters' ){
				$(this.scope).find('[data-role="historyTitle"]').text( data.menuElem.find('[data-ipsMenuValue="' + data.selectedItemID + '"]').text() );
				$(this.scope).find('[data-role="historyDisplay"]').addClass('ipsLoading ipsLoading_dark').html('');
								
				ips.getAjax()( data.menuElem.find('[data-ipsMenuValue="' + data.selectedItemID + '"] a').attr('href') ).done(function(response){
					$(this.scope).find('[data-role="historyDisplay"]').html( response ).removeClass('ipsLoading ipsLoading_dark');
					$( document ).trigger( 'contentChange', [ this.scope ] );
				}.bind(this));
			}
		}
		
	});
}(jQuery, _));