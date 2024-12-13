/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.prefixedAutocomplete.js - Controller for prefix functionality
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.core.optionalAutocomplete', {

		_autoComplete: null,
		_closedTagging: false,

		initialize: function () {
			this.setup();
			this.on('click', '[data-action="showAutocomplete"]', this.showAutocomplete);
		},

		/**
		 * Setup method
		 *
		 * @returns 	{void}
		 */
		setup: function () {
			this._autoComplete = this.scope.find('[data-ipsAutocomplete]');

			if( !_.isUndefined( this._autoComplete.attr('data-ipsAutocomplete-minimized') ) ){
				return;
			}

			// Wrap the contents of the row so that we can hide it, and show on demand
			var div = $('<div data-role="autoCompleteWrapper" />').html( this.scope.contents() ).hide();
			this.scope.html( div );
			this.scope.append( ips.templates.render('core.autocomplete.optional', { langString: ips.getString( this._autoComplete.attr('data-ipsAutocomplete-lang') ) } ) );
			this.scope.closest('.ipsFieldRow').find('.ipsFieldRow_label').hide();

			// Get the options the autocomplete uses
			if( this._autoComplete.attr('data-ipsAutocomplete-freeChoice') && this._autoComplete.attr('data-ipsAutocomplete-freeChoice') == 'false' ){
				this._closedTagging = true;
			}
		},

		/**
		 * Toggles showing the autocomplete field
		 *
		 * @returns 	{void}
		 */
		showAutocomplete: function (e) {
			if( e ){
				e.preventDefault();
			}
			
			var self = this;
			var autoCompleteObj = ips.ui.autocomplete.getObj( this._autoComplete );

			this.scope.find('[data-action="showAutocomplete"]').hide();
			this.scope.find('[data-role="autoCompleteWrapper"]').show();
			this.scope.closest('.ipsFieldRow').find('.ipsFieldRow_label').show();

			setTimeout( function () {
				if( self._closedTagging ){
					self.scope.find('[data-action="addToken"]').click();
				} else {
					autoCompleteObj.focus();
				}
			}, 100);
		}
	});
}(jQuery, _));