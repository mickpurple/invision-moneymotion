/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.coverPhoto.js - Controller for cover photos
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.core.coverPhoto', {

		_image: null,
		_repositioning: false,
		_existingPosition: 0,
		_tooltip: null,
		_expandedCover: false,
		_containerHeight: 0,

		initialize: function () {
			var self = this;
			this.on( 'menuItemSelected', function(e, data){
				switch( $( data.originalEvent.target ).attr('data-action') ){
					case 'removeCoverPhoto':
						self.removePhoto(data);
						break;
					case 'positionCoverPhoto':
						self.positionPhoto(data.originalEvent);
						break;
				}
			});
			
			this.on( 'click', '[data-action="savePosition"]', this.savePosition );
			this.on( 'click', '[data-action="cancelPosition"]', this.cancelPosition );
			$( window ).on( 'resize', _.bind( this.resizeWindow, this ) );

			this.on( 'click', '[data-action="toggleCoverPhoto"]', this.toggleCoverPhoto );

			this.setup();
		},

		/**
		 * Setup method.
		 *
		 * @returns 	{void}
		 */
		setup: function () {
			this._initCoverPhotoImage();
			this._containerHeight = this.scope.outerHeight();

			// Remove manage button if showing in a widget
			if ( this.scope.closest('.cWidgetContainer').length ){
				$('#elEditPhoto').hide();
			}

			// Get the URL bits and see if we're immediately going into position mode
			var doPosition = ips.utils.url.getParam('_position');

			if( !_.isUndefined( doPosition ) ){
				this.positionPhoto();
			}
						
			this.scope.find('a[data-action="positionCoverPhoto"]').parent().removeClass('ipsHide');
		},

		/**
		 * Initialize the cover photo image. Calls this._positionImage when the cover photo is loaded.
		 *
		 * @returns 	{void}
		 */
		_initCoverPhotoImage: function() {
			var self = this;
			this._image = this.scope.find('.ipsCoverPhoto_photo');
			this._offset = this.scope.attr('data-coverOffset') || 0;

			if( !this._image.attr('data-positioned') ){
				this._image.css({ opacity: "0.0001" });
			}

			// Set up lazy loaded cover photo, providing a callback to fade
			// in the image after loading
			if( this._image.length ){
				var position = _.bind( this._positionImage, self );

				if( this._image.is('[data-src]') && !this._image.is('[data-loaded]') ){
					ips.utils.lazyLoad.observe( this.scope.find('.ipsCoverPhoto_photo'), {
						imgLoadedCallback: function () {
							position();
						} 
					});
				} else {
					this._image.imagesLoaded( position );
				}
			}
		},

		/**
		 * Event handler for the window resizing
		 *
		 * @returns 	{void}
		 */
		resizeWindow: function () {
			if ( this._expandedCover )
			{
				this.toggleCoverPhoto();
			}

			this._initCoverPhotoImage();
		},

		/**
		 * Removes the cover photo
		 *
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data 	Event data object
		 * @returns 	{void}
		 */
		removePhoto: function (data) {			
			data.originalEvent.preventDefault();
			var self = this;

			ips.ui.alert.show( {
				type: 'confirm',
				icon: 'warn',
				message: ips.getString('confirmRemoveCover'),
				callbacks: {
					ok: function () {
						ips.getAjax()( $( data.originalEvent.target ).attr('href') + '&wasConfirmed=1' )
							.done( function () {

								ips.utils.anim.go( 'fadeOut', self._image )
									.done( function () {
										ips.ui.flashMsg.show( ips.getString('removeCoverDone') );
									});

								data.menuElem.find('[data-role="photoEditOption"]').hide();
							})
							.fail( function (err) {
								window.location = $( data.originalEvent.target ).attr('href');
							});
					}
				}
			});
		},

		/**
		 * Save a new position of the cover photo
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		savePosition: function (e) {
			e.preventDefault();

			// Get the natural size
			var natHeight = ips.utils.position.naturalHeight( this._image );
			var realHeight = this._image.outerHeight();
			var topPos = parseInt( this._image.css('top') ) * -1;
			var percentage = ( topPos / realHeight ) * 100;
			var newOffset = Math.floor( ( natHeight / 100 ) * percentage );

			this._offset = newOffset;
			this.scope.attr( 'data-coverOffset', newOffset );
			
			ips.getAjax()( this.scope.attr('data-url') + '&do=coverPhotoPosition' + '&offset=' + newOffset )
				.fail( function (err) {
					this.scope.attr('data-url') + '&do=coverPhotoPosition' + '&offset=' + newOffset;
				});
							
			this._resetImage();
		},

		/**
		 * Cancels changing the position of the image
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		cancelPosition: function (e) {
			e.preventDefault();

			this._image.css( {
				top: this._existingPosition + 'px',
			});

			this._resetImage();
		},

		/**
		 * Starts the 'editing' state of the cover photo
		 *
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data 	Event data object
		 * @returns 	{void}
		 */
		positionPhoto: function (e) {

			if( !_.isUndefined( e ) ){
				e.preventDefault();	
			}
			
			var self = this;

			this.scope.find('[data-hideOnCoverEdit]').css({ visibility: 'hidden' });

			this._image.css({
				cursor: 'move'
			});

			this._repositioning = true;
			this._existingPosition = parseInt( this._image.css('top') ) || 0;

			this.scope.find('.ipsCoverPhoto_container').append( ips.templates.render('core.coverPhoto.controls') );

			this._showTooltip();

			ips.loader.get( ['core/interface/jquery/jquery-ui.js'] ).then( function () {
				self._image.draggable({ axis: 'y', scroll: false, stop: _.bind( self._dragStop, self ) });
			});
		},

		/**
		 * Positions the image so that the offset stays correct regardless of actual image size
		 *
		 * @returns 	{void}
		 */
		_positionImage: function () {

			if( !this._image.length ){
				return;
			}
			
			// Get the natural size
			var natHeight = ips.utils.position.naturalHeight( this._image );
			var realHeight = this._image.outerHeight();

			if( this._offset === 0){
				this._image.animate({
					opacity: "1"
				}, 'fast');

				return;
			}

			// The provided offset is relative to the natural width, so we need to work out what it is for the actual width
			var percentage = ( ( this._offset * 1 ) / natHeight ) * 100;
			var adjustedOffset = ( Math.floor( ( realHeight / 100 ) * percentage ) * -1 );

			// set bounds so image is never higher than bottom of the viewing area
			var minBottom = ( realHeight - this.scope.outerHeight() ) * -1;
			
			if( adjustedOffset < minBottom ){
				adjustedOffset = minBottom;
			}

			this._image
				.attr('data-positioned', true)
				.css({
					position: 'absolute',
					left: "0",
					top: adjustedOffset + 'px',
				})
				.animate({
					opacity: "1"
				}, 'fast');
		},

		/**
		 * Cancels the 'editing' state of the cover photo
		 *
		 * @returns 	{void}
		 */
		_resetImage: function () {
			if( this._image.draggable ){
				this._image.draggable('destroy');
			}

			this._image.css( {
				cursor: 'default'
			});

			this.scope.find('.ipsCoverPhoto_container [data-role="coverPhotoControls"]').remove();
			this.scope.find('[data-hideOnCoverEdit]').css({ visibility: 'visible' });

			this._hideTooltip();

			// Reset the URL so refreshing the page does not re-trigger repositioning
			ips.utils.history.pushState({}, 'core.global.core.coverPhoto', ips.utils.url.removeParam( 'csrfKey', this.scope.attr('data-url') ) );
		},

		/**
 		 * Shows a tooltip on the autocomplete with the provided message
		 *
		 * @param 	{string} 	msg 	Message to show
		 * @returns {void}
		 */
		_showTooltip: function (msg) {
			if( !this._tooltip ){
				this._buildTooltip();
			}

			this._tooltip.hide().text( ips.getString('dragCoverPhoto') );

			this._positionTooltip();
		},

		/**
 		 * Hides the tooltip
		 *
		 * @returns {void}
		 */
		_hideTooltip: function () {
			if( this._tooltip && this._tooltip.is(':visible') ){
				ips.utils.anim.go( 'fadeOut', this._tooltip );
			}
		},

		/**
 		 * Positions the tooltip over the autocomplete
		 *
		 * @returns {void}
		 */
		_positionTooltip: function () {
			var positionInfo = {
				trigger: this.scope.find('.ipsCoverPhoto_container'),
				target: this._tooltip,
				center: true,
				above: true
			};

			var tooltipPosition = ips.utils.position.positionElem( positionInfo );

			this._tooltip.css({
				left: tooltipPosition.left + 'px',
				top: tooltipPosition.top + 'px',
				position: ( tooltipPosition.fixed ) ? 'fixed' : 'absolute',
				zIndex: ips.ui.zIndex()
			});

			if( tooltipPosition.location.vertical == 'top' ){
				this._tooltip.addClass('ipsTooltip_top');
			} else {
				this._tooltip.addClass('ipsTooltip_bottom');
			}

			this._tooltip.show();
		},

		/**
 		 * Builds the tooltip element
		 *
		 * @param 	{string} 	msg 	Message to show
		 * @returns {void}
		 */
		_buildTooltip: function () {
			// Build it from a template
			var tooltipHTML = ips.templates.render( 'core.tooltip', {
				id: 'elCoverPhotoTooltip'
			});

			// Append to body
			ips.getContainer().append( tooltipHTML );

			this._tooltip = $('#elCoverPhotoTooltip');
		},

		/**
		 * Event handler for when dragging stops
		 * Checks that the cover photo is within the bounds of the header (i.e. still visible)
		 *
		 * @returns 	{void}
		 */
		_dragStop: function () {
			var imageTop = parseInt( this._image.css('top') );

			if( imageTop > 0 ) {
				this._image.css({ top: "0", bottom: 'auto', position: 'absolute' });
			} else {
				var containerHeight = this.scope.find('.ipsCoverPhoto_container').outerHeight();
				var imageHeight = this._image.outerHeight();

				if( ( imageTop + imageHeight ) < containerHeight ){
					this._image.css({ top: 'auto', bottom: "0", position: 'absolute' });
				}
			}
		},

		/**
		 * Toggles cover photo to full height
		 *
		 * @returns 	{void}
		 */
		toggleCoverPhoto: function () {
			var imageHeight = this._image.outerHeight();

			if( this._expandedCover == false ) {
				this._existingPosition = parseInt( this._image.css('top') ) || 0;

				this.scope.animate({
					height: ( imageHeight + this._existingPosition ) + 'px',
				});

				this._expandedCover = true;
			} else {
				this.scope.animate({
					height: this._containerHeight + 'px'
				});

				this._expandedCover = false;
			}

			this.scope.toggleClass('ipsCoverPhotoMinimal');
		},
	});
}(jQuery, _));