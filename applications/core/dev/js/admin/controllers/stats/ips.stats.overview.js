/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.stats.overview.js - Overview statistics controller
 *
 * Author: Brandon Farber
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.stats.overview', {

		dateFilters: { 'start': null, 'end': null, 'range': null },

		initialize: function () {
			this.on( 'submit', '[data-role="dateFilter"]', this.updateDateFilter );
			this.on( 'change', '[data-action="toggleApp"]', this.toggleApp );
			this.on( 'change', '[name="predate"]', this.submitForm );
			this.on( 'click', '[data-action="cancelDateRange"]', this.cancelDateRange );
			this.on( 'stats.ready', this.blockReady );
			$(document).on( 'reloadStatsDateFilters', _.bind( this.resendDateFilters, this ) );
			this.setup();
		},

		setup: function () {
			this.url = this.scope.attr('data-url');
			this.dateFilters.range = this.scope.find('[data-role="dateFilter"]').attr('data-defaultRange');
		},

		resendDateFilters: function (e) {
			this.trigger( 'stats.setDateFilters', {
				dateFilters: this.dateFilters,
				url: this.url
			});
		},

		cancelDateRange: function (e) {
			e.preventDefault();
			this.scope.find('select[name="predate"]').val( this.scope.find('.cStatsFilters').attr('data-defaultRange') ).change();
		},

		submitForm: function (e) {
			var select = $( e.currentTarget );

			if( select.val() === '-1' ){
				this.scope.find('.cStatsFilters [data-role="formTitle"], select[name="predate"]').hide();
				this.scope.find('.cStatsFilters button').show();
			} else {
				this.scope.find('.cStatsFilters [data-role="formTitle"], select[name="predate"]').show();
				this.scope.find('.cStatsFilters button').hide();
				select.closest('form').submit();
			}
		},

		/**
		 * A block is ready to be loaded
		 *
		 * @param	{event} 	e		Event
		 * @param 	{object}	data 	Event data
		 * @returns {void}
		 */
		blockReady: function (e, data) {
			$(e.target).trigger('stats.loadBlock', {
				dateFilters: this.dateFilters,
				url: this.url
			});
		},

		/**
		 * Event handler for toggling which apps to see
		 *
		 * @returns {void}
		 */
		toggleApp: function () {
			// Get selected apps
			var enabledApps = _.map( this.scope.find('[data-action="toggleApp"]:checked'), function(app) { 
				return $( app ).attr('data-toggledApp') 
			});
			var disabledApps = _.map( this.scope.find('[data-action="toggleApp"]:not( :checked )'), function (app) {
				return $( app ).attr('data-toggledApp');
			});

			// Select all tiles, except those that are enabled
			this.scope.find('.cStatTile[data-app]').each( function () {
				var tile = $(this);
				if( tile.hasClass('ipsHide') && enabledApps.indexOf( $( this ).attr('data-app') ) !== -1 ){
					tile.css({ transform: 'scale(0.7)', opacity: "0" }).removeClass('ipsHide').animate({ transform: 'scale(1)', opacity: "1" });
				} else if ( enabledApps.indexOf( $( this ).attr('data-app') ) === -1 ){
					tile.addClass('ipsHide');
				}
			});

			// Write the cookie to set disabled apps
			ips.utils.cookie.set('overviewExcludedApps', JSON.stringify( disabledApps ), true );
		},

		/**
		 * Update blocks on the page to use the new date filters
		 *
		 * @param	{event} 	e	Event
		 * @returns {void}
		 */
		updateDateFilter: function (e) {
			e.preventDefault();
			e.stopPropagation();

			this.dateFilters = { 'start': null, 'end': null, 'range': this.scope.find( '[name="predate"]' ).val() };

			// Are we specifying a custom date range?
			if( this.dateFilters.range == '-1' ){
				this.dateFilters.start = this.scope.find( '[name="date[start]"]' ).val();
				this.dateFilters.end = this.scope.find( '[name="date[end]"]' ).val();
			}
			
			this.triggerOn('core.admin.stats.overviewBlock', 'stats.loadBlock', {
				dateFilters: this.dateFilters,
				url: this.url
			});

			this.triggerOn('core.admin.stats.nodeFilters', 'stats.setDateFilters', {
				dateFilters: this.dateFilters,
				url: this.url
			});
		},
	});
}(jQuery, _));