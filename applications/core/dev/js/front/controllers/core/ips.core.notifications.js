/**
 * IPS Social Suite 4
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.notifications.js - Browser notifications prompt
 *
 * Author: Stuart Silvester
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.notifications', {

		initialize: function () {
			this.on( document, 'menuOpened', this.menuOpened );
			this.on( document, 'permissionGranted.notifications', this.hideNotice );
			this.on( document, 'permissionDenied.notifications', this.hideNotice );
			if( ips.getSetting('memberID') && ips.utils.notification.supported ){
				this.setup();
			}
		},

		setup: function() {
			this._timeout = null;

			if( ips.utils.notification.needsPermission() && _.isUndefined( ips.utils.cookie.get('browserNotificationDismiss') ) ) {
				this.scope.html( ips.templates.render( 'core.browserNotification.prompt' ) ).hide();

				// show message saying we need permission
				this.on( 'click', '[data-action=browserNotificationPrompt]', this.requestPermission );
				this.on( 'click', '[data-role=dismissNotification]', this.dismissNotification );
			}
		},

		destroy: function () {
			clearTimeout( this._timeout );
		},

		/**
		 * Called when the notifications menu is opened
		 *
		 * @param 	{event} 	e 		Event object
		 * @param 	{object} 	data 	Event data
		 * @returns {void}
		 */
		menuOpened: function (e, data) {
			var self = this;

			if( data.elemID == 'elFullNotifications' || data.elemID == 'elMobNotifications' ) {
				// To prevent annoyance for new users, we'll only show the callout after 2+ days
				if( !_.isUndefined( ips.utils.cookie.get( 'notificationMenuShown' ) ) ){
					var date = parseInt( ips.utils.cookie.get( 'notificationMenuShown' ) );

					if( date && Date.now() >= date ){
						this._timeout = setTimeout( function () {
							self.scope.slideDown('fast');
						}, 750 );
					}
				} else {
					var date = new Date();
					date.setDate( date.getDate() + 2 );
					ips.utils.cookie.set('notificationMenuShown', date.getTime(), true );
				}
			}
		},

		/**
		 * Called when the user clicks the button to init the notification popup
		 *
		 * @returns {void}
		 */
		requestPermission: function() {
			this.scope.find( '[data-role="promptMessage"]').slideDown();
			ips.utils.notification.requestPermission();
		},

		/**
		 * Event handler called when the browser (via ips.utils.notifications) changes notification status
		 * Whatever the user decides, hide the message now so we arent annoying
		 *
		 * @returns {void}
		 */
		hideNotice: function() {
			this.scope.slideUp('fast');
		},

		/**
		 * Allows the user to dismiss the callout in the notifications menu
		 *
		 * @param	{event} 	e 	Event object
		 * @returns {void}
		 */
		dismissNotification: function(e) {
			if( e ) {
				e.preventDefault();
			}

			var date = new Date();
			date.setDate( date.getDate() + 100 );
			ips.utils.cookie.set( 'browserNotificationDismiss', true, date.toUTCString() );

			this.scope.slideUp( {
				duration: 400,
				complete: function() {
					$(this).remove();
				}
			});
		}

	});
}(jQuery, _));