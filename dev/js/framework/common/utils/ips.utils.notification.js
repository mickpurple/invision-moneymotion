/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.utils.notification.js - A module for working with HTML5 notifications
 *
 * Author: Rikki Tissier
 */

;( function($, _, undefined){
	"use strict";
	
	ips.createModule('ips.utils.notification', function () {

		var sound = null;

		var _isSupported = function() {
			if ( !window.Notification || !Notification.requestPermission ) {
				return false;
			}

			if( Notification.permission == 'granted' ) {
				return true;
			}

			try {
				new Notification('');
			} catch (e) {
				if ( e.name == 'TypeError' ) {
					return false;
				}
			}

			return true;
		},

		supported = _isSupported(),

		initSoundFile = function () {
			var deferred = $.Deferred();

			// Have we already loaded Howler and the sound file? if so, just resolve and continue
			if( sound !== null ){
				deferred.resolve();
				return deferred.promise();
			}

			// Preload our notification sound
			ips.loader.get( ['core/interface/howler/howler.core.min.js'] ).then( function () {
				
				// Howler helpfully suspends the audiocontext after 30 seconds unless we set this.
				Howler.autoSuspend = false;

				sound = new Howl({
					src: ips.getSetting('baseURL') + 'applications/core/interface/sounds/notification.mp3',
					preload: false
				});

				Debug.log( "Audio created with state: " + Howler.state );

				// If the audio context was created in a suspended state, resume() it upon a user interaction
				if( Howler.state == 'suspended' ){
					$(document).one( 'click', function() {
						Howler.ctx.resume().then( function() {
							Debug.log( "Resumed audio context now has state: " + Howler.state ); 
						} );
					} );
				}

				deferred.resolve();
			});

			return deferred.promise();
		},

		/**
		 * Determines whether the user has granted permission for notifications
		 *
		 * @returns 	{boolean}	Whether notifications have permission
		 */
		hasPermission = function () {
			if( !supported || ips.utils.cookie.get('noBrowserNotifications') || Notification.permission == 'denied' || Notification.permission == 'default' ){
				return false;
			}

			return true;
		},

		/**
		 * Do we need permission to show notifications? If the user has agreed or explicitly declined, this
		 * will be false. If they haven't decided yet, it'll return true.
		 *
		 * @returns 	{boolean} 	Whether the browser needs to ask for permission
		 */
		needsPermission = function () {
			if( supported && !ips.utils.cookie.get('noBrowserNotifications') && Notification.permission == 'default' ){
				return true;
			}

			return false;
		},

		/**
		 * Returns the granted permission level
		 *
		 * @returns 	{mixed}
		 */
		permissionLevel = function () {
			if( !supported ){
				return null;
			}

			return Notification.permission;
		},

		/**
		 * Requests permission for notifications from the user
		 *
		 * @returns 	{void}
		 */
		requestPermission = function () {
			if( supported ){
				Notification.requestPermission( function (result) {
					if( result == 'granted' ){
						$( document ).trigger('permissionGranted.notifications');	
					} else {
						$( document ).trigger('permissionDenied.notifications');
					}					
				});
			}
		},

		/**
		 * Creates a new notification and returns a notification object
		 *
		 * @param 		{object} 	options 	Configuration object
		 * @returns 	{function}
		 */
		create = function (options) {
			try {
				return new notification( options );
			} catch( e ) {
				Debug.log( e );

				if ( e.name == 'TypeError' ) {
					try {
						navigator.permissions.revoke( { name: "notifications" } );
					} catch( e ) {}

					return false;
				}
			}
		},

		/**
		 * Plays the notification sound
		 *
		 * @returns 	{function}
		 */
		playSound = function () {
			try {
				if( ips.getSetting('disableNotificationSounds') ){
					return;
				}

				initSoundFile().then( function () {
					if( Howler.state != "suspended" ){
						sound.load();
						sound.play();
					}
				});
			} catch (err) { 
				Debug.log(err);
			}
		};

		/**
		 * Our notification construct
		 *
		 * @param 		{object} 	options 	Configuration object
		 * @returns 	{void}
		 */
		function notification (options) {
			this._notification = null;

			this._options = _.defaults( options, {
				title: '',
				body: '',
				icon: '',
				timeout: false,
				tag: '',
				dir: $('html').attr('dir') || 'ltr',
				lang: $('html').attr('lang') || '',
				onShow: $.noop,
				onHide: $.noop,
				onClick: $.noop,
				onError: $.noop
			} );

			// Unescape body & title because we'll be getting escaped chars from the backend
			this._options.body = _.unescape( this._options.body.replace( /&#039;/g, "'" ).replace( /<[^>]*>?/g, '' ) );
			this._options.title = _.unescape( this._options.title.replace( /&#039;/g, "'" ) );

			this.show = function () {
				this._notification = new Notification( this._options.title, this._options );
				this._notification.addEventListener( 'show', this._options.onShow, false );
				this._notification.addEventListener( 'hide', this._options.onHide, false );
				this._notification.addEventListener( 'click', this._options.onClick, false );
				this._notification.addEventListener( 'error', this._options.onError, false );

				if( this._options.timeout !== false ){
					setTimeout( _.bind( this.hide, this ), this._options.timeout * 1000 );
				}
			};

			this.hide = function () {
				this._notification.close();
				this._notification.removeEventListener( 'show', this._options.onShow, false );
				this._notification.removeEventListener( 'hide', this._options.onHide, false );
				this._notification.removeEventListener( 'click', this._options.onClick, false );
				this._notification.removeEventListener( 'error', this._options.onError, false );
			};
		};	
		
		// If we are logged in, init howler and the sound file ahead of time
		if( ips.getSetting('memberID') !== 0 ){
			initSoundFile().then( function () {
				Debug.log("Initialized notification audiocontext.");
			});
		}
		
		return {
			supported: supported,
			hasPermission: hasPermission,
			needsPermission: needsPermission,
			permissionLevel: permissionLevel,
			requestPermission: requestPermission,
			create: create,
			playSound: playSound
		};
	});
}(jQuery, _));