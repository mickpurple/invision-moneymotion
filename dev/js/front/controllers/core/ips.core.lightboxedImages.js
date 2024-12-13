/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.lightboxedImages.js - As of 4.4 this is more of a general UGC controller. We've opted not to rename it
 * so that mass template changes don't become necessary, so that's a @future todo
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.lightboxedImages', {

		_random: null,

		initialize: function () {
			this.on( 'initializeImages', this.refreshContent );
			this.on( 'refreshContent', this.refreshContent );
			this.setup();
		},

		/**
		 * Setup method
		 *	
		 * @returns 	{void}
		 */
		setup: function () {
			this._random = 'g' + ( Math.round( Math.random() * 100000 ) );
			this._initializeAttachments();
			this._initializeImages();
		},

		/**
		 * Refresh the content in this container
		 *	
		 * @returns 	{void}
		 */
		refreshContent: function (e) {
			Debug.log("Refreshing content in lightboxedImages");
			this.scope.removeAttr('data-loaded');
			this._initializeAttachments();
			this._initializeImages();

			e.stopPropagation();
		},

		/**
		 * Build the attachment display inside content
		 *	
		 * @returns 	{void}
		 */
		_initializeAttachments: function () {
			var fileIDsToFetch = {};
			var self = this;
			var attachments = this.scope.find('[data-fileid]').not( function (idx, elem) {
				// We don't want to change any image/video attachments, so exclude those here
				var elem = $(elem);
				return elem.is('img, source, video') || elem.find('img, source, video').length;
			});

			if( !attachments.length ){
				return;
			}

			// Loop through each attachment and build the initial HTML for it
			attachments.each( function () {
				var attachment = $(this);

				if( !_.isUndefined( attachment.attr('data-loaded') ) ){
					return;
				}

				var parent = attachment.parent();
				var clone = parent.clone();

				// To figure out if this attachment is on a line either by itself or only with other attachments,
				// we'll clone the parent, remove all child elements, remove whitespace, and see if we
				// have any text left. If we do, we know it's inline.
				clone.children().remove();
				clone.text( clone.text().replace(/\s/g, '') );

				if( !clone.text().length ){
					// This is a BLOCK attachment
					attachment.addClass('ipsAttachLink_block');

					if( attachment.children().length ){
						return;
					}

					var title = attachment.text();
					attachment.html( ips.templates.render('core.attachments.attachmentPreview', {
						title: title
					}));
				} else {
					// This is an INLINE attachment
					attachment.addClass('ipsAttachLink_inline');
					attachment.attr('title', ips.getString('attachmentPending'));
					attachment.attr('data-ipstooltip', true);
				}

				fileIDsToFetch[ attachment.attr('data-fileid') ] = true;
			});

			// If we have no files to fetch, we can bail
			if( !_.size( fileIDsToFetch ) ){
				return;
			}

			// Now set up our lazy load observer which will load file info 	
			ips.utils.lazyLoad.observe( this.scope.get(0), {
				loadCallback: function () {
					// Get the file info for each block attachment in this post
					ips.getAjax()( ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=ajax&do=attachmentInfo', {
						dataType: 'json',
						data: {
							attachIDs: fileIDsToFetch
						}
					})
						.done( function (response) {
							attachments.each( function () {
								var attachment = $(this);
								var attachmentID = attachment.attr('data-fileid');

								if( _.isUndefined( response[ attachmentID ] ) ){
									self._updateAttachmentMetaDataError( attachment );
								} else {
									self._updateAttachmentMetaData( attachment, response[ attachmentID ] );
								}
							});
						})
						.fail( function () {
							attachments.each( function () {
								var attachment = $(this);
								self._updateAttachmentMetaDataError( attachment );
							});
						});
				}
			});
		},

		/**
		 * Update an attachment with the provided meta data
		 *	
		 * @returns 	{void}
		 */
		_updateAttachmentMetaData: function (attachment, response) {
			var attachmentID = attachment.attr('data-fileid');

			if( attachment.hasClass('ipsAttachLink_block') ){
				attachment.find('.ipsAttachLink_metaInfo').html( ips.templates.render('core.attachments.metaInfo', {
					size: response.size,
					downloads: ips.pluralize( ips.getString('attachmentDownloads'), response.downloads )
				}));
			} else {
				attachment.attr('title', response.size + ' - ' + ips.pluralize( ips.getString('attachmentDownloads'), response.downloads ));
			}

			attachment.attr('data-loaded', true);
		},

		/**
		 * Update an attachment with an 'unavailable' message
		 *	
		 * @returns 	{void}
		 */
		_updateAttachmentMetaDataError: function (attachment) {
			if( attachment.hasClass('ipsAttachLink_block') ){
				attachment.find('.ipsAttachLink_metaInfo').html( ips.getString('attachmentUnavailable') );
			} else {
				attachment.attr('title', ips.getString('attachmentUnavailable') );
			}

			attachment.attr('data-loaded', true);
		},

		/**
		 * Pre-initialize an element.
		 * This is called on page load, possibly *before* images have been lazy-loaded. Used to set up
		 * any behaviors not requiring the image itself to be loaded yet (e.g. lightbox)
		 *	
		 * @returns 	{void}
		 */
		_preLazyLoadInit: function (elem) {
			// Since we're supplying a custom preload handler to lazyload, we should
			// still call the default preload handler manually
			ips.utils.lazyLoad.preload(elem);
			this._nonLazyLoadInit(elem);
		},

		/**
		 * Image init method used for both legacy content and when lazy-loading is disabled on a site.
		 *
		 * @returns 	{void}
		 */
		_nonLazyLoadInit: function (image) {
			if( image instanceof $ ){
				var rawImage = image.get(0);
			} else {
				var rawImage = image;
				image = $( image );
			}
			
			if( ( !image.is('img') || image.is('[data-emoticon], .ipsEmoji') ) && !image.hasClass('ipsImage_thumbnailed') ){
				return;
			}

			image.addClass('ipsImage_thumbnailed');
			
			// Wrap image in a link
			this._addOrUpdateWrappingLink( image );			
		},
		
		/**
		 * Given an image, either updates the wrapping link or adds one, before adding lightbox attrs
		 *
		 * @returns 	{void}
		 */
		_addOrUpdateWrappingLink: function (image) {
			var closestLink = image.closest('a');
			var imageSrc = image.attr('data-src') ? image.attr('data-src') : image.attr('src');

			if( closestLink.length && closestLink.hasClass('ipsAttachLink') && closestLink.hasClass('ipsAttachLink_image') ){
				var href = closestLink.attr('href');
				var ext = href.substr( href.lastIndexOf('.') + 1 ).toLowerCase();

				if( ['gif', 'jpeg', 'jpe', 'jpg', 'png'].indexOf( ext ) !== -1 ){
					closestLink
						.attr( 'data-fullURL', closestLink.attr('href') )
						.attr( 'data-ipsLightbox', '' )
						.attr( 'data-ipsLightbox-group', this._random );
				}
			} else if( !closestLink.length ) {
				image.wrap( $( "<a href='" + imageSrc + "' title='" + ips.getString('enlargeImage') + "' data-wrappedLink data-ipsLightbox data-ipsLightbox-group='" + self._random + "'></a>" ) );
			}
		},

		/**
		 * Event handler for main event
		 *	
		 * @returns 	{void}
		 */
		_initializeImages: function () {
			var self = this;
			var toLazyLoad = this.scope.find( ips.utils.lazyLoad.contentSelector );

			if( toLazyLoad.length ){
				if( ips.getSetting('lazyLoadEnabled') ){
					//var _postLoadBound = _.bind( this._postLazyLoadInit, this );
					var _preloadBound = _.bind( this._preLazyLoadInit, this );

					toLazyLoad.each( function () {
						ips.utils.lazyLoad.observe( this, { // this == the raw dom node, not this controller
							preloadCallback: _preloadBound,
							//imgLoadedCallback: _postLoadBound
						});
					});
				} else {
					var _nonLazyLoadBound = _.bind( this._nonLazyLoadInit, this );
					ips.utils.lazyLoad.loadContent(this.scope.get(0), _nonLazyLoadBound); // load immediately
				}
			}

			// Handle legacy images that don't have the lazy load attributes applies
			// Only select non-lazy-load images	
			var nonLazyImages = this.scope.find('img:not([data-src])'); 
			if( nonLazyImages.length ){
				this.scope.imagesLoaded( function (imagesLoaded) {
					if( !imagesLoaded.images.length ){
						return;
					}
					_.each( imagesLoaded.images, function (image, i) {
						self._nonLazyLoadInit(image.img);
					});
				});
			}
		}
	});
}(jQuery, _));