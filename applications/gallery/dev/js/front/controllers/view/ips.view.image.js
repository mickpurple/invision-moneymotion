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

		_sizeBuffer: 20,
		_ajaxObj: null,
		_scrolling: false,
		_rtl: false,
		_curWidth: 0,
		_curHeight: 0,
		_windowDims: null,
		_inLightbox: false,
		_preloadAjax: { next: null, prev: null },

		initialize: function () {
			this.on( 'click', '[data-action="nextImage"]', this.nextImage );
			this.on( 'click', '[data-action="prevImage"]', this.prevImage );
			this.on( 'menuOpened', this.menuOpened );
			this.on( 'menuClosed', this.menuClosed );
			this.on( document, 'keydown', this.keyDown );
			this.on( window, 'resize', _.debounce( _.bind( this.windowResize, this ), 250 ) );

			this.on( 'click', '[data-role="toggleFullscreen"]', this.toggleFullscreen );

			// AJAX it up in HERE
			this.on( 'click', '[data-action="setAsCover"]', this.setAsCover );
			this.on( 'click', '[data-action="setAsProfile"]', this.setAsProfile );
			this.on( 'click', '[data-action="rotateImage"]', this.rotateImage );

			// Primary event that watches for URL changes
			History.Adapter.bind( window, 'statechange', _.bind( this.stateChange, this ) );

			this.setup();
		},

		/**
		 * Setup method
		 *
		 * @returns {void}
		 */
		setup: function () {
			if( $('html').attr('dir') == 'rtl' ){
				this._rtl = true;
			}

			this._windowDims = {
				width: $( window ).width(),
				height: $( window ).height()
			};

			this._setUpSizing(false);
			this._setUpLightboxEvents();

			if( this.scope.closest('#cLightbox').length ){
				this._inLightbox = true;
			}

			this._checkForPreload();

			// Add swipe left/right support
			delete Hammer.defaults.cssProps.userSelect; // see https://github.com/hammerjs/hammer.js/issues/81
			var mc = new Hammer( this.scope.find('.elGalleryHeader').get(0) ); // Can't touch this

			var self = this;
			mc.on( 'swipeleft', function( e ) {
				if( !self.scope.find('.cGalleryNote_editing').length )
				{
					$( document ).trigger('lightboxNextImage');
				}
			} );
			mc.on( 'swiperight', function( e ) {
				if( !self.scope.find('.cGalleryNote_editing').length )
				{
					$( document ).trigger('lightboxPrevImage');
				}
			} );

			// Toggle document scrolling when dialogs open/close
			var self = this;
			$(document).on( 'hideDialog', function() {
				if( self.scope.closest('#cLightbox').length && !ips.ui.dialog.hasOpenDialogs() )
				{
					$('body').addClass('ipsNoScroll');
				}
			});

			$(document).on( 'openDialog', function() {
				if( self.scope.closest('#cLightbox').length )
				{
					$('body').removeClass('ipsNoScroll');
				}
			});
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
		 * Handles URL state changes
		 *
		 * @returns {void}
		 */
		 _setUpLightboxEvents: function() {
		 	var self = this;

		 	// When a lightbox image is shown, see if there are any next/previous and emit the appropriate events
		 	$( document ).on( 'lightboxImageShown', function(){
		 		// See if we have a previous image
		 		if( self.scope.find('[data-action="prevImage"]').length ) {
		 			$( document ).trigger('lightboxEnable_prev');
		 		} else {
		 			$( document ).trigger('lightboxDisable_prev');
		 		}

		 		// See if we have a next image
		 		if( self.scope.find('[data-action="nextImage"]').length ) {
		 			$( document ).trigger('lightboxEnable_next');
		 		} else {
		 			$( document ).trigger('lightboxDisable_next');
		 		}
		 	});

		 	// When you click next image in the lightbox, trigger our normal next image routine which will later emit an event to update the lightbox
		 	$( document ).on( 'lightboxNextImage', function(e, data){
		 		self.scope.find('[data-action="nextImage"]').click();
		 	});

		 	$( document ).on( 'lightboxPrevImage', function(e, data){
		 		self.scope.find('[data-action="prevImage"]').click();
		 	});
		 },

		/**
		 * Handles URL state changes
		 *
		 * @returns {void}
		 */
		stateChange: function () {
			var state = History.getState();

			if( state.data.controller != 'gallery.front.view.image' ){
				if( state.data.controller != 'gallery.front.browse.imageLightbox' && ( _.isUndefined( state.data.initialLaunch ) || !state.data.initialLaunch ) ){
					return;
				}
			}

			// Only handle this if the event comes from the lightbox and we're inside the lightbox (or vice versa)
			if( _.isUndefined( state.data.lightbox ) || state.data.lightbox !== this._inLightbox ){
				return;
			}

			// Track page view
			ips.utils.analytics.trackPageView( state.data.realUrl );
			
			// If the request was in the lightbox but the lightbox is closed, we must have closed the lightbox but then hit 'back' so now we need to relaunch it
			if( $('#cLightbox').length && !$('#cLightbox').is(':visible') ) {
				$('#cLightbox').show();
			}

			// Scroll to the image but only if we're not in the lightbox
			if( !$('#cLightbox').length || !$('#cLightbox').is(':visible') ) {
				this._scrollPage();
			}

			this._loadURL( state.data.realUrl, false );
		},

		/**
		 * Scrolls the page to the image
		 *
		 * @returns {void}
		 */
		_scrollPage: function () {
			if( this._scrolling ){
				return;
			}

			var self = this;

			// Get top postition of table
			var elemPosition = ips.utils.position.getElemPosition( this.scope );
			var viewportHeight = $( window ).height();
			var docScrollTop = $( document ).scrollTop();

			// If it isn't on screen, scroll to it
			if( ( elemPosition.absPos.top - docScrollTop < 0 ) || elemPosition.absPos.top > viewportHeight + docScrollTop ){
				this._scrolling = true;

				$('html, body').animate( { scrollTop: elemPosition.absPos.top + 'px' }, function () {
					self._scrolling = false;
				} );	
			}			
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
					this.scope.find('[data-action="prevImage"]').click();
				break;
				case ips.ui.key.RIGHT:
					this.scope.find('[data-action="nextImage"]').click();
				break;
			}
		},

		/**
		 * Navigates the page to the next image
		 *
		 * @param 	{event}		e 	Event object
		 * @returns {void}
		 */
		nextImage: function (e) {
			e.preventDefault();

			var url = $( e.currentTarget ).attr('href');
			var id = $( e.currentTarget ).attr('data-imageID');
			var title = $( e.currentTarget ).attr('title');

			History.pushState( {
				controller: 'gallery.front.view.image',
				imageID: id,
				realUrl: url,
				direction: 'next',
				lightbox: this._inLightbox
			}, title, ips.utils.url.removeParams( [ 'lightbox', 'browse' ], url ) );
		},

		/**
		 * Navigates the page to the previous image
		 *
		 * @param 	{event}		e 	Event object
		 * @returns {void}
		 */
		prevImage: function (e) {
			e.preventDefault();

			var url = $( e.currentTarget ).attr('href');
			var id = $( e.currentTarget ).attr('data-imageID');
			var title = $( e.currentTarget ).attr('title');

			History.pushState( {
				controller: 'gallery.front.view.image',
				imageID: id,
				realUrl: url,
				direction: 'prev',
				lightbox: this._inLightbox
			}, title, ips.utils.url.removeParams( [ 'lightbox', 'browse' ], url ) );
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
		},

		/**
		 * Event handler for window resizing
		 *
		 * @returns {void}
		 */
		windowResize: function (e) {
			if( $( window ).width() !== this._windowDims.width || $( window ).height() !== this._windowDims.height ){
				this._setUpSizing(true);

				this._windowDims = {
					width: $( window ).width(),
					height: $( window ).height()
				};
			}
		},

		_cachedUrls: {},

		/**
		 * Loads the specified URL to fetch a new image
		 *
		 * @param 	{string}	url 	URL of new image to fetch
		 * @returns {void}
		 */
		_loadURL: function (url, cacheOnly, direction) {
			var self = this;

			// If we've cached this URL already, bail now
			if( cacheOnly && !_.isUndefined( this._cachedUrls[ url ] ) ){
				return;
			}

			if( !cacheOnly ){
				this.cleanContents();
				this._setImageLoading();

				var urlToRequest = url;
			}
			else
			{
				// We need to add preload=1 to the 
				if( url.match(/\?/) ) {
					if( url.slice(-1) != '?' ){
						var urlToRequest = url + '&preload=1';	
					}				
				} else {
					var urlToRequest = url + '?preload=1';
				}
			}

			// If this is a regular load, set to loading
			if( _.isUndefined( cacheOnly ) || !cacheOnly ){
				if( this._ajaxObj && _.isFunction( this._ajaxObj.abort ) ){
					this._ajaxObj.abort();
				}
			} else {
				if( this._preloadAjax[ direction ] && _.isFunction( this._preloadAjax[ direction ].abort ) ){
					this._preloadAjax[ direction ].abort();
				}
			}

			// Already have cached data? Just show it.
			if( self._cachedUrls[ url ] ){
				self._updateImage( self._cachedUrls[ url ] );
				self._markImageRead( url );
				return;
			}

			var ajax = ips.getAjax();

			if( cacheOnly ){
				this._preloadAjax[ direction ] = ajax;
			} else {
				this._ajaxObj = ajax;
			}

			ajax( urlToRequest, {
				dataType: 'json'
			} )
				.done( function (response) {
					// Cache for next time
					self._cachedUrls[ url ] = response;

					if( !cacheOnly ){
						self._updateImage( response );
					}
				})
				.fail( function( jqXHR, textStatus, errorThrown ) {
					if( Debug.isEnabled() ){
						Debug.error( errorThrown );
					} else {
						if( !cacheOnly ){
							window.location = url;
						}
					}
				});
		},

		/**
		 * Mark an image read. When we fetch for caching we don't want the image marked as read, but when we move forward/back
		 * to view the image in the lightbox, it should be marked at that point.
		 *
		 * @param 	{string}	url 	URL of new image to fetch
		 * @returns {void}
		 */
		_markImageRead: function (url) {
			var self = this;

			if( url.match(/\?/) ) {
				if( url.slice(-1) != '?' ){
					url = url + '&do=markread';	
				}				
			} else {
				url = url + '?do=markread';
			}

			ips.getAjax()( url, {
				dataType: 'json'
			} )
				.done( function (response) {
					Debug.log( "Marked read" );
				});
		},

		/**
		 * Handles a response from the server with new image info
		 *
		 * @param 	{object}	response 	Server response json
		 * @returns {void}
		 */
		_updateImage: function (response) {
			this.scope.find('[data-role="imageInfo"]')
				.closest('.cGalleryLightbox_info')
					.show()
				.end()
					.html( response.info );
			this.scope.find('[data-role="imageFrame"]').replaceWith( response.image );
			
			if( response.comments ){
				this.scope.find('[data-role="imageComments"]').html( response.comments );	
			} else {
				this.scope.find('[data-role="imageComments"]').html( '' );
			}

			// Update breadcrumb
			$('nav.ipsBreadcrumb [data-role="breadcrumbList"] > li:last-child').html( response.title );

			// Reinit each area
			$( document ).trigger( 'contentChange', [ this.scope ] );

			// Trigger event for lightbox handler
			$( document )
				.trigger( 'imageUpdated', [ {
					closeLightbox: ( response.image.match( /<video /ig ) || response.image.match( /<embed /ig ) ) ? true : false,
					updateImage: {
						imageElem: null,
						largeImage: ( response.image.match( /<video /ig ) || response.image.match( /<embed /ig ) ) ? null : this.scope.find('[data-role="theImage"]')[0].src,
						commentsURL: null,
						meta: null
					}
				} ] );

	 		// See if we have a previous image
	 		if( this.scope.find('[data-action="prevImage"]').length ){
	 			$( document ).trigger('lightboxEnable_prev');
	 		} else {
	 			$( document ).trigger('lightboxDisable_prev');
	 		}

	 		// See if we have a next image
	 		if( this.scope.find('[data-action="nextImage"]').length ) {
	 			$( document ).trigger('lightboxEnable_next');
	 		} else {
	 			$( document ).trigger('lightboxDisable_next');
	 		}

	 		this._checkForPreload()
			this._setUpSizing(false);
		},

		/**
		 * Checks the current image to see if we can preload a prev/next image
		 *
		 * @param 	{boolean}		loading 	Are we loading?
		 * @returns {void}
		 */
		_checkForPreload: function () {
			// See if we can cache the next/prev image
	 		if( this.scope.find('[data-action="nextImage"]').length ){
	 			Debug.log("Caching next image");
	 			this._loadURL( this.scope.find('[data-action="nextImage"]').attr('href'), true, 'next' );
	 		}
	 		if( this.scope.find('[data-action="prevImage"]').length ){
	 			Debug.log("Caching prev image");
	 			this._loadURL( this.scope.find('[data-action="prevImage"]').attr('href'), true, 'prev' );
	 		}
		},

		/**
		 * Sets various page elements to a loading state while new data is loaded
		 *
		 * @param 	{boolean}		loading 	Are we loading?
		 * @returns {void}
		 */
		_setImageLoading: function (loading) {
			var description = this.scope.find('[data-role="imageDescription"]');
			var stats = this.scope.find('[data-role="imageStats"]');
			var image = this.scope.find('[data-role="imageFrame"]');

			description
				.css({
					height: description.outerHeight() + 'px'
				})
				.html('')
				.addClass('ipsLoading');

			stats
				.css({
					height: stats.outerHeight() + 'px'
				})
				.html('')
				.addClass('ipsLoading');

			image
				/*.css({
					height: image.outerHeight() + 'px'
				})*/
				.html('')
				.addClass('ipsLoading');

			this.scope.find('[data-role="imageInfo"]').closest('.cGalleryLightbox_info').hide();

			// Trigger event for lightbox handler
			$( document ).trigger( 'imageLoading', [] );
		},

		/**
		 * Determine whether we're viewing on mobile or desktop
		 *
		 * @param 	{boolean}	forceResize 	Images smaller than previous won't shrink lightbox; setting this to true overrides that behavior
		 * @returns {void}
		 */		
		_setUpSizing: function (forceResize) {
			if( ips.utils.responsive.currentIs('phone') ){
				this._setUpSizingMobile();
			} else {
				this._setUpSizingDesktop(forceResize);
			}
		},

		/**
		 * Handles resizing image elements for mobile view
		 *
		 * @returns {void}
		 */		
		_setUpSizingMobile: function (forceResize) {
			var isLightbox = this.scope.is('[data-role="lightbox"]');
			var frame = this.scope.find('[data-role="imageFrame"]');
			var frameHeight = $( window ).height() - 80;
			var imageData = frame.attr('data-imageSizes');

			if( isLightbox ){
				$( window ).scrollTop(0);
				frame.css({ height: frameHeight + 'px' });

				var maxHeight = frameHeight;
				var maxWidth = $( window ).width();
			} else {
				var maxHeight = frameHeight;
				var maxWidth = frame.width();
			}

			var ratio = 1;

			if( imageData ){
				imageData = $.parseJSON( imageData );
				ratio = imageData['large'][ 0 ] / imageData['large'][ 1 ];

				var marginTop = 0;
				var imageSize = {
					width: imageData['large'][0],
					height: imageData['large'][1]
				};

				if( imageSize['width'] > maxWidth ){
					imageSize['width'] = maxWidth;
					imageSize['height'] = Math.round( imageSize['width'] / ratio );
				}

				if( imageSize['height'] > maxHeight ){
					imageSize['height'] = maxHeight;
					imageSize['width'] = Math.round( imageSize['height'] * ratio );
				}

				this.scope
					.find('[data-role="notesWrapper"], [data-role="theImage"]')
					.css({
						width: imageSize['width'] + 'px',
						height: imageSize['height'] + 'px',
					})
					.show();
			}
		},

		/**
		 * Handles sizing elements as required
		 *
		 * @param 	{boolean}	forceResize 	Images smaller than previous won't shrink lightbox; setting this to true overrides that behavior
		 * @returns {void}
		 */
		_setUpSizingDesktop: function (forceResize) {
			var isLightbox = this.scope.is('[data-role="lightbox"]');
			var frame = this.scope.find('[data-role="imageFrame"]');
			var imageSizer = this.scope.find('[data-role="imageSizer"]');
			var infoPanel = this.scope.find('[data-role="imageInfo"]');
			var infoPanelWidth = infoPanel.width();
			var imageData = frame.attr('data-imageSizes');

			if( isLightbox ){
				var maxHeight = $( window ).height() - (this._sizeBuffer * 2);
				var maxWidth = $( window ).width() - (this._sizeBuffer * 2) - infoPanelWidth;

				frame.css({
					height: 'auto'
				});
			} else {
				var maxHeight = frame.height();
				var maxWidth = frame.width();
			}
			
			var ratio = 1;		

			if( maxHeight < 400 ){
				maxHeight = 400;
			}

			if( imageData ){
				imageData = $.parseJSON( imageData );
				ratio = imageData['large'][ 0 ] / imageData['large'][ 1 ];

				var marginTop = 0;
				var imageSize = {
					width: imageData['large'][0],
					height: imageData['large'][1]
				};

				if( imageSize['width'] > maxWidth ){
					imageSize['width'] = maxWidth;
					imageSize['height'] = Math.round( imageSize['width'] / ratio );
				}

				if( imageSize['height'] > maxHeight ){
					imageSize['height'] = maxHeight;
					imageSize['width'] = Math.round( imageSize['height'] * ratio );
				}

				this.scope
					.find('[data-role="notesWrapper"], [data-role="theImage"]')
					.css({
						width: imageSize['width'] + 'px',
						height: imageSize['height'] + 'px',
					})
					.show();

				
				// ========
				// This code handled resizing the image frame to fit the photo.
				// However, in testing it's easier to use the lightbox when it is full-size, due to the number of UI controls
				// we display in the sidebar. Commenting this block out for now, but leaving for reference.
				// ========
				// Now size the container if needed. If this image is smaller than the last one, we DON'T shrink the lightbox
				// However if the image is larger than the previous, we do enlarge it.
				// We also make sure the panel is never smaller than 500x500.
				/*var minimumAllowedWidth = 500 + infoPanelWidth;
				if( forceResize || ( imageSize['width'] > this._curWidth && ( imageSize['width'] + infoPanelWidth ) >= minimumAllowedWidth ) ){
					imageSizer.css({ width: imageSize['width'] + infoPanelWidth + 'px' });
					this._curWidth = imageSize['width'];
				} else if ( ( imageSize['width'] + infoPanelWidth ) < minimumAllowedWidth && !this._curWidth ){
					imageSizer.css({ width: minimumAllowedWidth + 'px' });
					this._curWidth = 500;
				}

				// Height is simpler because we don't have to account for the info panel width here.
				if( forceResize || ( imageSize['height'] > this._curHeight && imageSize['height'] >= 500 ) ){
					imageSizer.css({ height: imageSize['height'] + 'px' });
					this._curHeight = imageSize['height'];
				} else if ( imageSize['height'] < 500 && !this._curHeight ){
					imageSizer.css({ height: '500px' });
					this._curHeight = 500;
				}*/
			}
		},

		/**
		 * Toggle viewing full image or viewing fancy lightbox
		 *
		 * @returns {void}
		 */
		 toggleFullscreen: function( e ) {
		 	e.preventDefault();
		 	
		 	if( $('#cLightbox').is('[data-fullScreen]' ) )
		 	{
		 		$('#cLightbox').removeAttr('data-fullScreen');
		 	}
		 	else
		 	{
		 		$('#cLightbox').attr( 'data-fullScreen', "true" );
		 	}
		 }
	});
}(jQuery, _));