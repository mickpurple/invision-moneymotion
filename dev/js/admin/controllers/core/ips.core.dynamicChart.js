/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.dynamicChart.js - Dynamic chart controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.core.dynamicChart', {

		storedValues: {},
		identifier: '',
		
		type: '',

		initialize: function () {
			// Set up the events that will capture chart changes
			this.on( 'click', '[data-timescale]', this.changeTimescale );
			this.on( document, 'submit', '[data-role="dateForm"]', this.changeDateRange );
			this.on( document, 'click', '[data-role="clearSearchTerm"]', this.resetSearch );
			this.on( document, 'submit', '[data-role="searchForm"]', this.changeSearch );
			this.scope.find('[data-role="clearSearchTerm"]').hide();
			this.on( 'menuItemSelected', '[data-action="chartFilter"]', this.changeFilter );
			this.on( 'click', '[data-type]', this.changeChartType );

			// Select all/none for filters
			$('[data-role="filterMenu"] [data-role="selectAll"]').on( 'click', _.bind( this.selectAllFilters, this ) );
			$('[data-role="filterMenu"] [data-role="unselectAll"]').on( 'click', _.bind( this.unselectAllFilters, this ) );
			$('button[data-role="applyFilters"]').on( 'click', function() {
				$('[data-action="chartFilter"]').trigger('closeMenu');
			});

			// Save filters
			this.on( 'click', '[data-role="saveReport"]', _.bind( this.saveFilters, this ) );
			this.on( 'click', '[data-role="renameChart"]', _.bind( this.renameFilters, this ) );

			this.setup();
		},

		/**
		 * Select all filters
		 *
		 * @returns {void}
		 */
		selectAllFilters: function ( e ) {
			$( e.currentTarget ).closest('.ipsMenu').find('.ipsMenu_item:not( .ipsMenu_itemChecked ) a:not( .ipsMenu_itemInline )').trigger('click');

			$('button[data-role="applyFilters"]').prop( 'disabled', false );

			this.showSaveButton();
		},

		/**
		 * Un-select all filters
		 *
		 * @returns {void}
		 */
		unselectAllFilters: function ( e ) {
			$( e.currentTarget ).closest('.ipsMenu').find('.ipsMenu_item.ipsMenu_itemChecked a').trigger('click');

			$('button[data-role="applyFilters"]').prop( 'disabled', false );

			this.showSaveButton();
		},

		/**
		 * Setup method. Sets the default storeValues values.
		 *
		 * @returns {void}
		 */
		setup: function () {
			var self = this;
			this.identifier = this.scope.attr('data-chart-identifier');

			// Get the initial values
			// Timescale & type
			this.storedValues.timescale = this.scope.find('[data-timescale][data-selected]').attr('data-timescale');
			this.storedValues.type = this.scope.find('[data-type][data-selected]').attr('data-type');

			if( this.scope.find('[data-role="searchForm"] input') )
			{
				this.storedValues.term = null;
			}

			this.storedValues.filters = [];
			this.storedValues.dates = { start: '', end: '' };
			this.type = this.scope.attr('data-chart-type');
			this.timescale = this.scope.attr('data-chart-timescale');
			
			// Filters
			$('#el' + this.identifier + 'Filter_menu').find('.ipsMenu_itemChecked').each( function () {
				self.storedValues.filters.push( $( this ).attr('data-ipsMenuValue') );
			});
			
			this.checkType();
		},

		/**
		 * Event handler for changing the timescale
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		changeTimescale: function (e) {
			this.timescale = $(e.currentTarget).attr('data-timescale');
			this._toggleButtonRow( e, 'timescale');
		},

		/**
		 * Event handler for changing the chart type
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		changeChartType: function (e) {
			this.type = $(e.currentTarget).attr('data-type');
			this._toggleButtonRow( e, 'type' );
			this.checkType();
		},
		
		/**
		 * Check type
		 */
		checkType: function() {
			if ( this.type == 'Table' || this.type == 'PieChart' || this.type == 'GeoChart' ) {
				$(this.scope).find('[data-role="groupingButtons"] a.ipsButton').addClass('ipsButton_disabled ipsButton_veryLight').removeClass('ipsButton_primary');
			} else {
				$(this.scope).find('[data-role="groupingButtons"] a.ipsButton').removeClass('ipsButton_disabled');
				$(this.scope).find('a.ipsButton[data-timescale="' + this.timescale + '"]').removeClass('ipsButton_veryLight').addClass('ipsButton_primary');
			}
		},

		/**
		 * Track whether we've bound the updateUrl method
		 */
		updateUrlBound: false,

		/**
		 * Event handler for changing the filter
		 *
		 * @param 	{event} 	e 		Event object
		 * @param 	{object} 	data 	Data object from the menu widget
		 * @returns {void}
		 */
		changeFilter: function (e, data) {
			data.originalEvent.preventDefault();

			// Reset filters
			this._resetFilters();

			if( this.updateUrlBound === false )
			{
				$('[data-action="chartFilter"]').one( 'menuClosed', _.bind( this.fetchNewResults, this ) );
				this.updateUrlBound = true;
			}

			$('button[data-role="applyFilters"]').prop( 'disabled', false );

			this.showSaveButton();
		},

		/**
		 * Show the button to save filters
		 *
		 * @returns	{void}
		 */
		 showSaveButton: function()
		 {
		 	var button = this.scope.find('[data-role="saveReport"]');

		 	if( !button.is(':visible') )
		 	{
		 		ips.utils.anim.go( 'fadeIn fast', button );
		 	}
		 },

		/**
		 * Wrapper method for _updateUrl() so we only send request if needed
		 *
		 * @returns {void}
		 */
		fetchNewResults: function( e ) {
			this._updateURL();

			this.updateUrlBound = false;
		},

		/**
		 * Save the current filters
		 *
		 * @returns	{void}
		 */
		 saveFilters: function( event )
		 {
		 	// Init
		 	var identifier	= this.scope.closest('.ipsTabs_panel').closest('section').attr('id');
		 	var self		= this;
		 	var pieces		= [];

			_.each( this.storedValues.filters, function (value, idx ) {
				pieces.push( "chartFilters[" + idx + "]=" + value );
			});

		 	var newFilters	= pieces.join('&');

		 	// Are we on default panel or a custom one?
		 	if( !$( event.currentTarget ).attr('data-chartId') )
		 	{
		 		// When clicking on the save button, stop the chart from updating initially
		 		this._skipUpdate = true;

		 		// Then set an event handler for the form submission where we specify the chart title
		 		$('#el' + this.identifier + 'FilterSave_menu').one( 'submit', 'form', function( e ){
					if( $(this).attr('data-bypassValidation') ){
						return false;
					}

					// Hide the menu
					$(this).trigger('closeMenu');

					var tabTitle = $(this).find('[name="custom_chart_title"]').val();

		 			e.preventDefault();

					ips.getAjax()( $(this).attr('action'), {
						data: $(this).serialize() + '&' + newFilters,
						type: 'post'
					} )
						.done( function (response, status, jqXHR) {
							// Add the tab
							$('[data-ipsTabBar-contentArea="#' + identifier + '"]').find('ul[role="tablist"]').append(
								"<li><a href='" + response.tabHref + "' id='" + response.tabId + "_tab_" + response.chartId + "' class='ipsTabs_item' title='" + tabTitle + "' role='tab' aria-selected='true'>" + tabTitle + "</a></li>"
							);

							// Add the new tab content area
							$('#' + identifier ).append(
								"<div id='ipsTabs_elTabs_" + response.tabId + "_" + response.tabId + "_tab_" + response.chartId + "_panel' class='ipsTabs_panel' aria-labelledby='" + response.tabId + "_tab_" + response.chartId + "' aria-hidden='true'></div>"
							);

						 	// Hide the button
						 	ips.utils.anim.go( 'fadeOut fast', self.scope.find('[data-role="saveReport"]') );

						 	// Make sure we update URL correctly moving forward
						 	self._skipUpdate = false;

						 	// And trigger content change event
						 	$( document ).trigger( 'contentChange', [ self.scope ] );

						 	// Clear input field
						 	$('#el' + self.identifier + 'FilterSave_menu').find('[name="custom_chart_title"]').val( '' );

						 	// And then switch to the tab
						 	$('#' + response.tabId + "_tab_" + response.chartId ).click();
						})
						.fail( function () {
							$(this).attr( 'data-bypassValidation', true ).submit();
						});
		 		});
		 	}
		 	else
		 	{
			 	// Send AJAX request to save report
				ips.getAjax()( this.scope.attr('data-chart-url') + '&saveFilters=1&chartId=' + $( event.currentTarget ).attr('data-chartId'), {
					data: newFilters,
					type: 'post'
				});

			 	// Hide the button
			 	ips.utils.anim.go( 'fadeOut fast', this.scope.find('[data-role="saveReport"]') );

			 	// And update the chart
			 	this._updateURL();
		 	}
		 },

		/**
		 * Rename the current filters
		 *
		 * @returns	{void}
		 */
		 renameFilters: function( event )
		 {
		 	// Init
		 	var identifier	= this.scope.closest('.ipsTabs_panel').closest('section').attr('id');

	 		// Set an event handler for the form submission where we specify the chart title
	 		$('#el' + this.identifier + 'FilterRename_menu').on( 'submit', 'form', function( e ){
				if( $(this).attr('data-bypassValidation') ){
					return false;
				}

				// Hide the menu
				$(this).trigger('closeMenu');

	 			e.preventDefault();

				ips.getAjax()( $(this).attr('action'), {
					data: $(this).serialize(),
					type: 'post'
				} )
					.done( function (response, status, jqXHR) {
						// Update the tab
						$('[data-ipsTabBar-contentArea="#' + identifier + '"]').find('ul[role="tablist"]').find('.ipsTabs_activeItem').text( response.title );
					})
					.fail( function () {
						$(this).attr( 'data-bypassValidation', true ).submit();
					});
	 		});
		 },

		/**
		 * Searches for a specific value in the graph
		 *
		 * @param 	{event} 	e 		Event object
		 * @returns {void}
		 */
		changeSearch: function (e) {
			e.preventDefault();

			var form = $('#el' + this.identifier + 'Search_menu');

			this.storedValues.term = form.find('[name="search"]').val();

			this.scope.find('[data-role="searchSummary"]').text( this.storedValues.term );

			if( this.storedValues.term )
			{
				Debug.log( this.scope.find('[data-role="clearSearchTerm"]') );
				form.find('[data-role="clearSearchTerm"]').show();
			}
			else
			{
				form.find('[data-role="clearSearchTerm"]').hide();
			}

			form.trigger('closeMenu');

			this._updateURL();
		},

		/**
		 * Resets our search term
		 *
		 * @param 	{event} 	e 		Event object
		 * @returns {void}
		 */
		resetSearch: function (e) {
			$('#el' + this.identifier + 'Search_menu').find('[name="search"]').val( '' );

			// The event bubbles up since this is a "submit" button, and changeSearch will be called next
		},

		/**
		 * Changes the range of the graph being shown
		 *
		 * @param 	{event} 	e 		Event object
		 * @returns {void}
		 */
		changeDateRange: function (e) {
			e.preventDefault();

			var form = $('#el' + this.identifier + 'Date_menu');

			this.storedValues.dates.start = form.find('[name="start"]').val();
			this.storedValues.dates.end = form.find('[name="end"]').val();

			form.trigger('closeMenu');

			if( this.storedValues.dates.start && this.storedValues.dates.end )
			{
				this.scope.find('[data-role="dateSummary"]').text( '(' + ips.getString('betweenXandX', { start: ips.utils.time.localeDateString( ips.utils.time.removeTimezone( new Date( this.storedValues.dates.start ) ) ), end: ips.utils.time.localeDateString( ips.utils.time.removeTimezone( new Date( this.storedValues.dates.end ) ) ) }) + ')' );
			}
			else if( this.storedValues.dates.start )
			{
				this.scope.find('[data-role="dateSummary"]').text( '(' + ips.getString('afterX', { start: ips.utils.time.localeDateString( ips.utils.time.removeTimezone( new Date( this.storedValues.dates.start ) ) ) }) + ')' );
			}
			else if( this.storedValues.dates.end )
			{
				this.scope.find('[data-role="dateSummary"]').text( '(' + ips.getString('beforeX', { end: ips.utils.time.localeDateString( ips.utils.time.removeTimezone( new Date( this.storedValues.dates.end ) ) ) }) + ')' );
			}
			else
			{
				this.scope.find('[data-role="dateSummary"]').text( '' );
			}

			this._updateURL();
		},

		/**
		 * Method for toggling buttons and setting new values in the store
		 *
		 * @param 	{event} 	e 		Event object from the event handler
		 * @param 	{string} 	type 	The type being handled (timescale or type)
		 * @returns {void}
		 */
		_toggleButtonRow: function (e, type) {
			e.preventDefault();

			var val = $( e.currentTarget ).attr( 'data-' + type );

			this.scope.find('[data-' + type + ']')
				.removeClass('ipsButton_primary')
				.addClass('ipsButton_veryLight')
				.removeAttr('data-selected')
				.filter('[data-' + type + '="' + val + '"]')
					.addClass('ipsButton_primary')
					.removeClass('ipsButton_veryLight')
					.attr('data-selected', true);

			this.storedValues[ type ] = val;

			// Reset filters
			this._resetFilters();

			this._updateURL();
		},

		/**
		 * Reset our stored filters to only include what we presently have selected
		 *
		 * @return {void}
		 */
		_resetFilters: function() {
			// Reset filters
			var self = this;
			this.storedValues.filters = [];

			$('#el' + this.identifier + 'Filter_menu').find('.ipsMenu_itemChecked').each( function () {
				self.storedValues.filters.push( $( this ).attr('data-ipsMenuValue') );
			});
		},

		_skipUpdate: false,

		/**
		 * Fetches new chart HTML from the server, then reinits the chart widget
		 *
		 * @returns {void}
		 */
		_updateURL: function () {
			// We skip updating the chart when clicking over to the save button the first time
			if( this._skipUpdate === true )
			{
				this._skipUpdate = false;
				return;
			}

			var url = this._buildURL();
			var chartArea = this.scope.find('[data-role="chart"]');
			chartArea.css( 'height', chartArea.height() ).html( '' ).addClass('ipsLoading');

			ips.getAjax()( this.scope.attr('data-chart-url'), {
				data: url,
				type: 'post'
			})
				.done( function (response) {
					chartArea.css( 'height', 'auto' ).html( response );
					$( document ).trigger( 'contentChange', [ chartArea ] );
				})
				.always( function () {
					chartArea.removeClass('ipsLoading');
				});

			$('button[data-role="applyFilters"]').prop( 'disabled', true );

			// Update download button URL
			this.scope.find('[data-role="downloadChart"]').attr('href', this.scope.attr('data-chart-url') + '&' + url + '&download=1');
		},

		/**
		 * Builds a query param based on the values we have stored
		 *
		 * @returns {string}
		 */
		_buildURL: function () {
			var pieces = [];
			var self = this;

			// Needed for dynamic chart buttons. We can't simply rely on checking request isAjax() as it could be loaded inside tabs etc. 
			pieces.push( "noheader=1" );
			
			// Timescale
			pieces.push( "timescale[" + this.identifier + "]=" + this.storedValues.timescale );

			// Type
			if( !_.isUndefined( this.storedValues.type ) )
			{
				pieces.push( "type[" + this.identifier + "]=" + this.storedValues.type );
			}

			// Term
			if( !_.isUndefined( this.storedValues.term ) && !_.isNull( this.storedValues.term ) )
			{
				pieces.push( "search[" + this.identifier + "]=" + this.storedValues.term );
			}

			// Filters
			_.each( this.storedValues.filters, function (value, idx ) {
				pieces.push( "filters[" + self.identifier + "][" + idx + "]=" + value );
			});

			// Dates
			if( this.storedValues.dates.start || this.storedValues.dates.end ){
				pieces.push( "start[" + this.identifier + "]=" + this.storedValues.dates.start );
				pieces.push( "end[" + this.identifier + "]=" + this.storedValues.dates.end );
			}

			return pieces.join('&');
		}
	});
}(jQuery, _));