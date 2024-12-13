/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.browse.lightbox.js - Gallery browse list controller
 *
 * Author: Brandon Farber
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('gallery.front.browse.imageLightbox', {
		/**
		 * Initialize controller
		 *
		 * @returns {void}
		 */
		initialize: function () {
			this.on( 'click', '[data-imageLightbox]', this.launchLightbox );
			this.on( document, 'keydown', this.keyDown );
			this.on( document, 'click', '.cLightboxClose', this.closeLightbox );

			// Primary event that watches for URL changes
			History.Adapter.bind( window, 'statechange', _.bind( this.stateChange, this ) );

			this.setup();
		},

		/**
		 * Setup controller instance
		 *
		 * @returns {void}
		 */
		setup: function () {
			if( !_.isUndefined( this.scope.attr('data-launchLightbox') ) ){
				this._launch( this.scope.attr('data-lightboxURL'), document.title );
			}
		},

		/**
		 * Handles URL state changes
		 *
		 * @returns {void}
		 */
		stateChange: function () {
			var state = History.getState();

			// Monitor for back button when we're on the 'first' image
			if( state.data.controller != 'gallery.front.view.image' ){
				if( state.data.controller == 'gallery.front.browse.imageLightbox' && ( _.isUndefined( state.data.initialLaunch ) || state.data.initialLaunch != true ) ) {
					Debug.log( state.data );
					this.hideLightbox();
				}
				return;
			}

			// We are looking for next/prev clicks in the lightbox, so make sure we know which was done
			if( _.isUndefined( state.data.direction ) ){
				return;
			}

			// If the image ID we are loading is already on the page, we didn't switch to a different page yet
			if( $('[data-role="tableRows"] div[data-imageId="' + state.data.imageID + '"]' ).length ){
				return;
			}

			// If we are moving next and are on the last image in the listing, we need to paginate forward
			if( state.data.direction == 'next' ){
				$('#cLightbox').attr('data-originalUrl', $('[data-role="tablePagination"]').find('.ipsPagination_next:not(.ipsPagination_inactive) a').first().attr('href') );
				$('[data-role="tablePagination"]').find('.ipsPagination_next:not(.ipsPagination_inactive) a').first().click();
			}

			// If we are moving backwards and are on the first image in the listing, we need to paginate backward
			if( state.data.direction == 'prev' ){
				$('#cLightbox').attr('data-originalUrl', $('[data-role="tablePagination"]').find('.ipsPagination_prev:not(.ipsPagination_inactive) a').first().attr('href') );
				$('[data-role="tablePagination"]').find('.ipsPagination_prev:not(.ipsPagination_inactive) a').first().click();
			}
		},

		/**
		 * Event handler for launching the lightbox
		 * 
		 * @param	e	Event
		 * @return void
		 */
		launchLightbox: function (e) {
			e.preventDefault();

			// Get the image URL and set the lightbox param
			var url	= $( e.currentTarget ).attr('href');
			var title = $( e.currentTarget ).attr('title');
			this._launch( url, title );
		},

		/**
		 * Launch a lightbox
		 * 
		 * @param	e	Event
		 * @return void
		 */
		_launch: function(url, title) {
			if( url.indexOf( '?' ) == -1 ){
				var logUrl = ips.utils.url.removeParams( [ 'lightbox', 'browse' ], url ) + '?browse=1&lightbox=1';
				url = url + '?lightbox=1';
			} else {
				var logUrl = ips.utils.url.removeParams( [ 'lightbox', 'browse' ], url ) + '&browse=1&lightbox=1';
				url = url + '&lightbox=1';
			}

			// Now draw the general lightbox (if we haven't done so already)
			if( !$('#cLightbox').length ){
				var newWidget = ips.templates.render('gallery.lightbox.wrapper', { originalUrl: window.location.href, originaltitle: document.title });
				$('body').append( newWidget );

				$('#cLightbox').css({
					zIndex: ips.ui.zIndex()
				});
			} else if( !$('#cLightbox').is(':visible') ) {
				$('#cLightbox').show();
			}

			if( ips.utils.responsive.currentIs('phone') ){
				$( window ).scrollTop(0);
			}

			History.pushState( { controller: 'gallery.front.browse.imageLightbox', initialLaunch: true, lightbox: true, realUrl: logUrl }, title, ips.utils.url.removeParams( [ 'lightbox', 'browse' ], url ) );

			// And then load the page into the lightbox
			ips.getAjax()( url, {
				type: 'get',
				showLoading: true
			})
			.done( function(response) {
			   $('#cLightbox > .cLightboxBack').html( response );
			   $( document ).trigger('contentChange', [ $('#cLightbox') ] );
			})
			.fail( function () {
				window.location = url;
			});

			$('body').addClass('ipsNoScroll');
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
				case ips.ui.key.ESCAPE:
					this.closeLightbox();
				break;
			}
		},

		/**
		 * Close the lightbox and update the state history
		 *
		 * @returns {void}
		 */
		closeLightbox: function( e ) {
			this.hideLightbox();

			// Store a history entry
			History.pushState( { controller: 'gallery.front.browse.imageLightbox', bypassStateAdjustment: true }, $('#cLightbox').attr('data-originalTitle'), $('#cLightbox').attr('data-originalUrl') );
		},

		 /**
		  * Hides the lightbox
		  *
		  * @returns {void}
		  */
		  hideLightbox: function() {
			// Hide the lightbox
			$('#cLightbox').fadeOut( 400 );
			$('body').removeClass('ipsNoScroll');

			// If it's a video, pause it to stop the sound
			if( $('#cLightbox video').length )
			{
				_.each( $('#cLightbox video'), function( elem ) {
					elem.pause();
				} );
			}
		}
	});
}(jQuery, _));