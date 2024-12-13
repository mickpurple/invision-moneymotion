/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.marketplace.search.js - Handles searching marktplace
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.marketplace.search', {
		
		_timer: null,
		_textField: null,
		_lastValue: '',
		_ajax: null,

		initialize: function () {
			this._textField = $(this.scope).find('[data-role="searchBox"]');
			
			this.on( document, 'focus', '[data-role="searchBox"]', this.fieldFocus );
			this.on( document, 'blur', '[data-role="searchBox"]', this.fieldBlur );
			this.on( 'click', '[data-file]', this.selectFile )
			
			this.setup();
		},
		
		setup: function (e) {
			this.scope.find('[data-role="searchBox"]').focus();
		},
		
		/**
		 * Select a file
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		selectFile: function (e) {
			e.preventDefault()
			e.stopPropagation();

			this.trigger( 'searchResultSelected', { id: $(e.currentTarget).attr('data-file'), url: $(e.currentTarget).attr('href'), dialogId: $(e.currentTarget).closest('.ipsDialog').attr('id') } );
		},
		
		/**
		 * Event handler for focusing in the search box
		 * Set a timer going that will watch for value changes. If there's already a value,
		 * we'll show the results immediately
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		fieldFocus: function (e) {
			this._timer = setInterval( _.bind( this._timerFocus, this ), 700 );
		},

		/**
		 * Event handler for field blur
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		fieldBlur: function (e) {
			clearInterval( this._timer );
		},
		
		/**
		 * Timer callback from this.fieldFocus
		 * Compares current value to previous value, and shows/loads new results if it's changed
		 *
		 * @returns {void}
		 */
		_timerFocus: function () {
			var currentValue = this._textField.val();
			
			if( currentValue == this._lastValue ){
				return;
			}

			this._lastValue = currentValue;
			
			this._loadResults();
		},
		
		/**
		 * Load results from the server
		 *
		 * @returns {void}
		 */
		_loadResults: function () {			
			if( this._ajax ){
				this._ajax.abort();
			}
			
			if ( this._lastValue ) {
				this._textField.addClass('ipsField_loading');
				this.scope.find('[data-role="results"]').html('');
										
				var self = this;
				this._ajax = ips.getAjax()( '?app=core&module=marketplace&controller=marketplace&do=apiSearch&title=' + encodeURIComponent( this.scope.attr('data-search-literal') ? ( '"' + this._lastValue + '"' ) : this._lastValue ) + '&category=' + this.scope.attr('data-category') + '&compatible=' + this.scope.attr('data-compatible')  ).done(function(response){
	 				self.scope.find('[data-role="results"]').html(response);
	 				self.scope.find('[data-role="hideWhenSearching"]').hide();
					self._textField.removeClass('ipsField_loading');
				});
			} else {
				this.scope.find('[data-role="results"]').html('');
				this.scope.find('[data-role="hideWhenSearching"]').show();
				this._textField.removeClass('ipsField_loading');
			}
		}
	});
}(jQuery, _));