/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.list.js - Controller for main support request list
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.list', {
		
		_ajaxObj: null,
		_editAjaxObj: null,
		_storedCustomForm: '',
				
		initialize: function () {			
			this.on( 'click', '[data-action="reloadTable"]', this.reloadTableClick );
			this.on( 'menuItemSelected', this.itemSelected );
			this.on( 'click', '[data-action="quickToggleCount"]', this.streamCountClicked );
			this.on( 'change', '[data-action="quickToggle"]', this.toggleStream );
			this.on( 'click', '[data-action="editStream"]', this.editStream );
			this.on( 'click', 'tr.cNexusSupportTable_row', this.rowClick );
		},
		
		/**
		 * Event handler for menu selections
		 *
		 * @param 		{event} 	e 		Event object
		 * @param 		{data} 		data	Data
		 * @returns 	{void}
		 */
		itemSelected: function (e,data) {
			if ( $(data.menuElem).attr('id') === 'elSortMenu_menu' || $(data.menuElem).attr('id') === 'elOrderMenu_menu' ) {
				this._reloadTable( data.menuElem.find( '[data-ipsMenuValue="' + data.selectedItemID + '"] a' ).attr('href') );
			}
		},
		
		/**
		 * Event handler for a link which should reload the table
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		reloadTableClick: function (e) {
			e.preventDefault();
			this._reloadTable( $(e.target).attr('href') );
		},

		/**
		 * Event handler to toggle stream when count is clicked
		 *
		 * @param		{event}		e		Event object
		 * @return		{void}
		 */
		 streamCountClicked: function(e) {
		 	$(e.target).next('label').click();
		 },
		
		/**
		 * Event handler for toggling a stream radio
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		toggleStream: function (e) {
			if ( $(e.target).attr('value') != 'custom' ) {
				this.scope.find('[data-role="mainTable"]').show();
				this._reloadTable( $(e.target).attr('data-url') );
			} else {
				if ( this._storedCustomForm ) {
					var form = $(this.scope).find('[data-role="filterForm"]');
					form.html( this._storedCustomForm );
					this._storedCustomForm = '';
					$( document ).trigger( 'contentChange', [ form ] );
					$('#elRadio_stream_custom').click();
				}

				$( e.target )
					.closest('.ipsTabs')
						.find('.ipsTabs_item')
							.removeClass('ipsTabs_activeItem')
						.end()
					.end()
					.closest('.ipsTabs_item')
						.addClass('ipsTabs_activeItem');

				this.scope.find('[data-role="mainTable"]').hide();
			}
		},
		
		/**
		 * Event handler for edit stream click
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		editStream: function (e) {
			
			e.preventDefault();
						
			this.scope.find('[data-role="mainTable"]').hide();

			var url = $(e.target).attr('href');			
			var form = $(this.scope).find('[data-role="filterForm"]');
			this._storedCustomForm = form.html();
			form.append( '<div class="ipsLoading ipsLoading_small cNexusFormLoading"></div>' );
			
			if( this._ajaxObj && _.isFunction( this._ajaxObj.abort ) ){
				this._ajaxObj.abort();
			}
			
			var self = this;			
			this._ajaxObj = ips.getAjax()( url )
				.done( function ( response, status, jqxhr ) {
					form.html( response );
					$( document ).trigger( 'contentChange', [ form ] );
					$('#elFilterFormFull').show();
				})
				.fail( function () {
					window.location = url;
				});
			
		},

		/**
		 * Reload the table
		 *
		 * @param 		{string} 	url 	The URL
		 * @returns 	{void}
		 */
		_reloadTable: function (url) {
			
			var scope = $(this.scope);
			var mainTable = scope.find('[data-role="mainTable"]');
			var resultsTable = scope.find('[data-role="resultsTable"]');
			var form = scope.find('[data-role="filterForm"]');

			resultsTable.addClass('ipsLoading').css( { opacity: "0.4" } );

			if( this._ajaxObj && _.isFunction( this._ajaxObj.abort ) ){
				this._ajaxObj.abort();
			}
			
			this._ajaxObj = ips.getAjax()( url )
				.done( function ( response, status, jqxhr ) {
										
					form.html(response.form);
					mainTable.html(response.results);
					resultsTable.removeClass('ipsLoading').css( { opacity: "1" } );
					$( document ).trigger( 'contentChange', [ scope ] );
										
				})
				.fail( function () {
					window.location = url;
				});
		},
		
		/**
		 * Event handler for clicking a clickable row
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		rowClick: function (e) {
			var target = $( e.target );

			// Ignore if we clicked something clickable (besides the row)
			if ( target.is('a') || target.is('i') || target.is('input') || target.is('textarea') || target.closest('a').length || target.closest('.ipsMenu').length ) {
				return;
			}

			// Ignore if we didn't use the left mouse button. 1 is left mouse button, 2 is middle
			// We allow 2 through here because we'll treat it differently shortly
			if( e.which !== 1 && e.which !== 2 ){
				return;
			}

			// Ignore if special keys are pressed
			if( e.altKey || e.shiftKey ){
				return;
			}
			
			// If we clicked into a cell with a checkbox, check that checkbox rather than redirect
			if ( target.is('td') ) {
				var checkbox = target.find('input[type="checkbox"]');
				if ( checkbox.length ) {
					checkbox.prop( 'checked', !checkbox.prop( 'checked' ) ).trigger('change');
					return;
				}
			}
			
			var link = $( e.currentTarget ).find('[data-role="supportLink"]');

			// If we are using the meta key or middle mouse button, we're going to adjust the link
			// to include _blank, so that it opens in a new tab
			if( e.metaKey || e.ctrlKey || e.which == 2 ){
				link.attr('target', '_blank');
 				link.get(0).click();
 				link.attr('target', '');
			} else {
				// Okay, we can go...
 				link.get(0).click();
			}			
		}
		
	});
}(jQuery, _));