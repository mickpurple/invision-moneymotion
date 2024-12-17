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

		var _isSupported = function() {
			
			/* First, let's check if notifications are supported by the browser */
			if (!("Notification" in window) || !Notification.requestPermission) {
				return false;
			}
			
			/* Don't do anything if we have no key */
			if( _.isNull( ips.getSetting('pushPublicKey') ) ){
				return false;
			}

			// Now let's see if this is Safari >= 16.4 */
			let match = navigator.userAgent.toLowerCase();
			let isSafari = match.match(/version\/([\d\.]+).*safari/);

			if (isSafari) {
				return parseFloat(isSafari[1]) >= 16.4;
			}
			
			if( Notification.permission == 'granted' ) {
				return true;
			}

			return true;
		},

		supported = _isSupported(),

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

		permissionGranted = function () {
			subscribeToPush();
		},

		/**
		 * Subscribes a user to push notifications
		 * Note: permission must be checked before calling or it will fail
		 *
		 * @returns 	{Promise}
		 */
		subscribeToPush = function () {
			$(document).trigger('subscribePending.notifications');

			return ips.utils.serviceWorker.registerServiceWorker('front', true)
				.then( (registration) => {					
					const options = {
						userVisibleOnly: true, // Required: https://developers.google.com/web/fundamentals/push-notifications/subscribing-a-user#uservisibleonly_options
						applicationServerKey: ips.utils.urlBase64ToUint8Array( ips.getSetting('pushPublicKey') )
					};

					return registration.pushManager.subscribe(options);
				})
				.then( (pushSubscription) => {
					Debug.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
					
					ips.getAjax()( ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=notifications&do=subscribeToPush', {
						type: 'post',
						data: {
							subscription: JSON.stringify(pushSubscription),
							encoding: ( PushManager.supportedContentEncodings || ['aesgcm'] )[0]
						}
					})
						.done( (response) => {
							$(document).trigger('subscribeSuccess.notifications');
						})
						.fail( (jqXHR, textStatus, errorThrown) => {
							$(document).trigger('subscribeFail.notifications');
						});
				});
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
		 * Get the user's subscription, if any
		 *
		 * @returns 	{Promise}
		 */
		getSubscription = function () {
			return ips.utils.serviceWorker.getRegistration()
				.then( (registration ) => {
					return registration.pushManager.getSubscription().then( subscription => {
						if( !subscription ){
							return false;
						}

						return subscription;
					})
					.catch( err => {
						Debug.log( err );
					});
				})
				.catch( err => {
					Debug.log(err);
				});
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
			Debug.log("ips.utils.notification.playSound() is deprecated");
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

		$( document ).on('subscribeToPush.notifications', subscribeToPush);
		$( document ).on('requestPermission.notifications', requestPermission);
		$( document ).on('permissionGranted.notifications', permissionGranted );
		
		return {
			supported: supported,
			subscribeToPush: subscribeToPush,
			hasPermission: hasPermission,
			getSubscription: getSubscription,
			needsPermission: needsPermission,
			permissionLevel: permissionLevel,
			requestPermission: requestPermission,
			create: create,
			playSound: playSound
		};
	});
}(jQuery, _));