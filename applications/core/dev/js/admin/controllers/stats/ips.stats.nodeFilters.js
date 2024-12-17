/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.stats.overviewBlock.js - Overview statistics block controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.stats.nodeFilters', {

		url: null,
		dateFilters: { 'start': null, 'end': null, 'range': null },

		initialize: function () {
			this.on( 'submit', this.reloadBlock );

			$(document).on( 'stats.setDateFilters', _.bind( this.statsReady, this ) );
			$(document).on( 'click.hovercard', _.bind( function(){ this.trigger( 'reloadStatsDateFilters' ); }, this ) );

			this.trigger( 'reloadStatsDateFilters' );
		},

		/**
		 * Stats overview is ready, so store the values we need
		 *
		 * @param	{e}		event	Event
		 * @param	{data}	object	Data
		 * @returns {void}
		 */
		 statsReady: function( e, data ) {
			this.url = data.url;
			this.dateFilters = data.dateFilters;
		 },

		/**
		 * Store the nodes we want to filter by and reload the block
		 *
		 * @param	{e} 	event	 Submit event
		 * @returns {void}
		 */
		reloadBlock: function (e) {
			var blockKey = $(e.currentTarget).attr('data-block');
			var subblock = $(e.currentTarget).attr('data-subblock');

			var blockElement = $( '[data-role="statsBlock"][data-block="' + blockKey + '"][data-subblock="' + subblock.replace( /\\/g, '\\\\' ) + '"]' );

			blockElement.attr( 'data-nodeFilter', $(e.currentTarget).find('[data-role="nodeValue"]').val() );

			e.preventDefault();
			e.stopPropagation();

			this.trigger( 'stats.nodeFilters', {
				blockToRefresh: blockKey,
				subblockToRefresh: subblock,
				url: this.url,
				dateFilters: this.dateFilters
			} );

			// Close the hovercard
			$(document).trigger('click');
		}
	});
}(jQuery, _));