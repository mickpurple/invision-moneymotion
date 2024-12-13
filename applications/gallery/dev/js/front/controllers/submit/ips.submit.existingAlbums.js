/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.submit.existingAlbums.js - Allows user to select an existing gallery album
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('gallery.front.submit.existingAlbums', {
		/**
		 * Initialization method
		 *
		 * @returns {void}
		 */
		initialize: function () {
			this.on( 'click', '#elGallerySubmit_albumChooser > li', this.clickAlbum );
			this._checkSelected();
		},

		/**
		 * Event handler for clicking an album entry
		 *
		 * @param	{event} 	e 	Event object
		 * @returns {void}
		 */
		clickAlbum: function (e) {
			$( e.currentTarget ).find('input[type="radio"]').prop( 'checked', true );
			this._checkSelected();
		},

		/**
		 * Checks whether any radios are selected, and enables/disables the submit button as needed
		 *
		 * @returns {void}
		 */
		_checkSelected: function () {
			if( this.scope.find('input[name="existing_album"]:checked').length ){
				this.scope.find('button[type="submit"]').prop( 'disabled', false );
			} else {
				this.scope.find('button[type="submit"]').prop( 'disabled', true );
			}
		}
	});
}(jQuery, _));