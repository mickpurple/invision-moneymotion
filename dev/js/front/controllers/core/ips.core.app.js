/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.app.js - Front end app controller 
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.app', {
		
		initialize: function () {
			this.on( 'click', 'a[data-confirm],button[data-confirm]', this.confirmSomething );
			this.on( document, 'contentChange', this._checkAndClearAutosave );
			this.on( document, 'contentChange', this.checkOldEmbeds );
			this.on( document, 'contentChange', this.updateExternalLinks );
			
			this.setup();
		},

		/**
		 * Setup method for the front app
		 *
		 * @returns {void}
		 */
		setup: function () {	
			if( ips.utils.serviceWorker.supported ){
				ips.utils.serviceWorker.registerServiceWorker('front', !_.isUndefined( ips.utils.cookie.get('loggedIn') ));
			}

			// Add a classname to the document for js purposes
			this.scope.addClass('ipsJS_has').removeClass('ipsJS_none');
			if ( !ips.utils.events.isTouchDevice() ) {
				this.scope.addClass('ipsApp_noTouch');
			}

			// Timezone detection
			ips.utils.cookie.set( 'ipsTimezone', new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" );
			
			// Clear any autosave stuff
			this._checkAndClearAutosave();
			if ( !ips.getSetting('memberID') && ips.utils.url.getParam('_fromLogout') ) {
				ips.utils.db.removeByType('editorSave');
			}

			// Inline message popup
			// Create a dialog if it exists
			if( $('#elInlineMessage').length ){
				var dialogRef = ips.ui.dialog.create({
					showFrom: '#inbox',
					content: '#elInlineMessage',
					title: $('#elInlineMessage').attr('title')
				});

				// Leave a little time
				setTimeout( function () {
					dialogRef.show();
				}, 800);				
			}

			// Open external links in a new window
			ips.utils.links.updateExternalLinks( this.scope );

			// Find any embeds on the page and upgrade them, and fix lazy load images without a wrapper
			this._upgradeOldEmbeds( this.scope );
			this._fixMissingLazyLoadItems( this.scope );

			// Set up prettyprint
			prettyPrint();

			// Set our JS cookie for future use - we'll set it for a day
			if( _.isUndefined( ips.utils.cookie.get( 'hasJS') ) ){
				var expires = new Date();
				expires.setDate( expires.getDate() + 1 );
				ips.utils.cookie.set( 'hasJS', true, expires.toUTCString() );
			}

			// If we can't view user profiles, remove links in the comment content
			if( !ips.getSetting('viewProfiles') ){
				this._removeProfileLinks();
			}
		},

		/**
		 * Called on content change. Updates externals links to open in a new window.
		 *
		 * @returns {void}
		 */
		updateExternalLinks: function (e, data) {
			ips.utils.links.updateExternalLinks( data );
		},

		/**
		 * Called on content change. Upgrade any old embeds within this content container.
		 *
		 * @returns {void}
		 */
		checkOldEmbeds: function (e, data) {
			this._upgradeOldEmbeds( data );
		},

		/**
		 * Remove user profile links where possible if the current viewing user cannot access profiles
		 *
		 * @returns {void}
		 */
		_removeProfileLinks: function () {
			this.scope
				.find('a[data-mentionid],a[href*="controller=profile"]')
					.replaceWith( function(){ return $(this).contents(); } );
		},

		/**
		 * Upgrade old embeds so that they include the correct controller
		 *
		 * @returns {void}
		 */
		_upgradeOldEmbeds: function (element) {
			// element is not always defined
			if( _.isUndefined( element ) ){
				return;
			}

			// Apply embed controllers on old content
			var oldEmbeds = element.find('[data-embedcontent]:not([data-controller], [data-embed-src])');
			var toRefresh = [];

			if( oldEmbeds.length ){
				oldEmbeds.each( function () {
					$( this ).attr('data-controller', 'core.front.core.autoSizeIframe');
					toRefresh.push( this );
					Debug.log("Upgraded old embed");
				});
				$( document ).trigger( 'contentChange', [ jQuery([]).pushStack( toRefresh ) ] );
			}
		},

		/**
		 * Check and clear autosave
		 *
		 * @returns {void}
		 */
		 _checkAndClearAutosave: function() {
		 	if( ips.utils.cookie.get('clearAutosave') ) {
				var autoSaveKeysToClear = ips.utils.cookie.get('clearAutosave').split(',');
				for ( var i = 0; i < autoSaveKeysToClear.length; i++ ) {
					ips.utils.db.remove( 'editorSave', autoSaveKeysToClear[i] );
				}
				ips.utils.cookie.unset('clearAutosave');
			}
		 },
		
		/**
		 * Prompts the user to confirm an action
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		confirmSomething: function (e) {
			e.preventDefault();
			var elem = $( e.currentTarget );
			var customMessage = $( e.currentTarget ).attr('data-confirmMessage');
			var subMessage = $( e.currentTarget ).attr('data-confirmSubMessage');
			var icon = $( e.currentTarget ).attr('data-confirmIcon');
			
			ips.ui.alert.show( {
				type: 'confirm',
				icon: ( icon ) ? icon : 'warn',
				message: ( customMessage ) ? customMessage : ips.getString('generic_confirm'),
				subText: ( subMessage ) ? subMessage : '',
				callbacks: {
					ok: function () {
						window.location = elem.attr('href') + '&wasConfirmed=1';
					}
				}
			});
		},

		/**
		 * A catch-all for items that need to be lazy loaded, but which might not be inside a lazy load wrapper
		 *
		 * @returns {void}
		 */
		_fixMissingLazyLoadItems: function (container) {
			// Find any lazy load stuff in this container
			var content = $( container ).find( ips.utils.lazyLoad.contentSelector ).not('.ipsHide');
			var initialLength = content.length;
			var toObserve = [];

			if( !initialLength ){
				return;
			}

			content.each( function () {
				// Loop through each item that needs to be loaded, and check it isn't already within
				// a lazy-load compatible wrapper. If it isn't, then manually observe it now.
				var closest = $( this ).closest('[data-ipsLazyLoad], [data-controller^="core.front.core.lightboxedImages"]');

				if( !closest.length ){
					if( ips.getSetting('lazyLoadEnabled') ){
						ips.utils.lazyLoad.observe( this );
					} else {
						ips.utils.lazyLoad.loadContent(this); // load immediately
					}
				}
			});
		}
	});
}(jQuery, _));
