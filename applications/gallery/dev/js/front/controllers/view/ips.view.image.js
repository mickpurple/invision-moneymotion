/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.view.image.js - Image controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('gallery.front.view.image', {

		initialize: function () {
			this.on( 'menuOpened', this.menuOpened );
			this.on( 'menuClosed', this.menuClosed );
			this.on( document, 'keydown', this.keyDown );
			this.on( 'click', '[data-action="setAsCover"]', this.setAsCover );
			this.on( 'click', '[data-action="setAsProfile"]', this.setAsProfile );
			this.on( 'click', '[data-action="rotateImage"]', this.rotateImage );
		},

		/**
		 * Adds a classname to wrapper when a menu opens
		 *
		 * @returns {void}
		 */
		menuOpened: function () {
			this.scope.find('.elGalleryImage').addClass('cGalleryImageHover');
		},

		/**
		 * Removes classname to wrapper when a menu opens
		 *
		 * @returns {void}
		 */
		menuClosed: function (e) {
			this.scope.find('.elGalleryImage').removeClass('cGalleryImageHover');
		},
		
		/**
		 * Handles the keyDown event for navigating photos
		 *
		 * @returns {void}
		 */
		keyDown: function (e) {

			// Ignore the keypress if we're in a form element
			if( $( e.target ).closest('input, textarea, .ipsComposeArea, .ipsComposeArea_editor').length ){
				return;
			}

			switch( e.keyCode ){
				case ips.ui.key.LEFT:
					this.scope.find('[data-action="prevMedia"]')[0].click();
				break;
				case ips.ui.key.RIGHT:
					this.scope.find('[data-action="nextMedia"]')[0].click();
				break;
			}
		},

		/**
		 * Sets the current image as the user's profile picture
		 *
		 * @param 	{event}		e 	Event object
		 * @returns {void}
		 */
		setAsProfile: function (e) {
			e.preventDefault();

			var url = $( e.currentTarget ).attr('href');

			ips.ui.alert.show( {
				type: 'confirm',
				icon: 'question',
				message: ips.getString('set_as_photo_confirm'),
				callbacks: {
					ok: function () {
						ips.getAjax()( url, {
							showLoading: true
						} )
							.done( function (response) {
								ips.ui.flashMsg.show( response.message );
							})
							.fail( function () {
								window.location = url;
							});
					}
				}
			});
		},

		/**
		 * Sets the image as a cover photo
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		setAsCover: function (e) {
			e.preventDefault();

			var url = $( e.currentTarget ).attr('href');

			ips.getAjax()( url, {
				showLoading: true
			} )
				.done( function (response) {
					ips.ui.flashMsg.show( response.message );
				})
				.fail( function () {
					window.location = url;
				});
		},

		/**
		 * Rotates the image
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		rotateImage: function (e) {
			e.preventDefault();

			var url = $( e.currentTarget ).attr('href');
			var self = this;

			ips.getAjax()( url, {
				showLoading: true
			} )
				.done( function (response) {
					self.scope.find('[data-role="theImage"]')[0].src = response.src;
					self.scope.find('[data-role="theImage"]').css( { 'width': response.width + 'px', 'height': response.height + 'px' } );
					self.scope.find('[data-role="theImage"]').closest('.cGalleryViewImage').css( { 'width': response.width + 'px', 'height': response.height + 'px' } );
					ips.ui.flashMsg.show( response.message );
				})
				.fail( function () {
					window.location = url;
				});
		}
	});
}(jQuery, _));