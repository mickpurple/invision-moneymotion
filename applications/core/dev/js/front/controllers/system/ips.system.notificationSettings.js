/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.system.notificationSettings.js - Notification settings controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.system.notificationSettings', {

		initialize: function () {
			this.on( 'click', '[data-action="enablePush"]', this.enablePush );
			this.on( document, 'subscribePending.notifications', this.subscribePending );
			this.on( document, 'subscribeSuccess.notifications', this.subscribeSuccess );
			this.on( document, 'subscribeFail.notifications', this.subscribeFail );
			this.on( document, 'permissionDenied.notifications', this.permissionDenied );


			this.on( 'click', '[data-action="showNotificationSettings"]', this.showNotificationSettings );
			this.on( 'click', '[data-action="closeNotificationSettings"]', this.closeNotificationSettings );
			this.on( 'change', '[data-role="notificationSettingsWindow"]', this.saveNotificationSettings );

			this.on( 'change', '#elBrowserNotifications', this.promptMe );
			this.setup();
		},

		/**
		 * Setup method
		 *
		 * @returns 	{void}
		 */
		setup: function () {
			this._showNotificationOptions();
		},

		/**
		 * Updates the push toggle link with the relevant content depending on notification status
		 *
		 * @returns 	{void}
		 */
		_showNotificationOptions: function () {
			const pushElement = this.scope.find('[data-action="enablePush"]');

			if( ips.utils.notification.supported && ips.utils.serviceWorker.supported ){
				if( Notification.permission === 'granted' ){
					ips.utils.notification.getSubscription()
						.then( subscription => {
							if( !subscription ){
								// No subscription - leave the enable button showing
								return;
							}

							const enableLink = pushElement.contents();
							pushElement.html( ips.templates.render('core.notifications.checking') );

							// We can end up in a situation where the server has removed the device's keys, but the device
							// still retains a subscription. To handle that situation and give the user the opportunity to 
							// resubscription, we'll ping the server with the key and verify it exists. If not, show the
							// enable button again.
							const jsonSubscription = JSON.parse( JSON.stringify(subscription) );
							const key = jsonSubscription.keys.p256dh;
							
							ips.getAjax()( ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=notifications&do=verifySubscription', {
								type: 'post',
								data: {
									key
								}
							} )
								.done( (response, status, jqXHR) => {
									if( jqXHR.status === 200 ){
										pushElement.html( ips.templates.render('core.notifications.success') );
										return;
									}

									// For any other status, leave the enable button showing
									pushElement.html( enableLink );
								})
								.fail( () => {
									pushElement.html( enableLink );
								});
						})
						.catch( err => {
							console.log( err );
							pushElement.html( ips.templates.render('core.notifications.notSupported') );
						});
				} else if( Notification.permission === 'denied' ){
					pushElement.html( ips.templates.render('core.notifications.fail') );
				}
			} else {
				console.log( "Notifications not supported" );
				pushElement.html( ips.templates.render('core.notifications.notSupported') );
			}
			
			pushElement.slideDown();
		},

		/**
		 * Event handler for enabling push notificiations
		 *
		 * @returns 	{void}
		 */
		enablePush: function (e) {
			e.preventDefault();
			ips.utils.notification.requestPermission();
		},

		/**
		 * Pending subscription: Event handler when browser is trying to subscribe to notifications
		 *
		 * @returns 	{void}
		 */
		subscribePending: function (e, data) {
			this.scope.find('[data-action="enablePush"]').html( ips.templates.render('core.notifications.pending') ).show();
		},

		/**
		 * Sucessful subscription: Event handler when browser has subscribed to notifications
		 *
		 * @returns 	{void}
		 */
		subscribeSuccess: function (e, data) {
			this.scope.find('[data-action="enablePush"]').html( ips.templates.render('core.notifications.success') ).show();
		},

		/**
		 * Failed subscription: Event handler when browser has failed to subscribe to notifications
		 *
		 * @returns 	{void}
		 */
		subscribeFail: function (e, data) {
			this.scope.find('[data-action="enablePush"]').html( ips.templates.render('core.notifications.fail') ).show();
		},

		/**
		 * Permission denied: Event handler for when the notification permission changes
		 *
		 * @returns 	{void}
		 */
		permissionDenied: function () {
			this.scope.find('[data-action="enablePush"]').html( ips.templates.render('core.notifications.fail') ).show();
		},

		/**
		 * Event handler for changing the browser notifications checkbox
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		promptMe: function (e) {
			if ( $(e.target).is(':checked') ) {
				ips.utils.cookie.unset( 'noBrowserNotifications' );
				if( !ips.utils.notification.hasPermission() ){
					ips.utils.notification.requestPermission();
				} else {
					ips.ui.flashMsg.show( ips.getString('saved') );
				}
			} else {
				ips.utils.cookie.set( 'noBrowserNotifications', true, true );
				ips.ui.flashMsg.show( ips.getString('saved') );
			}
		},

		/**
		 * Displays an info panel, with the message depending on whether notifications are enabled in the browser
		 *
		 * @returns 	{void}
		 */
		_showNotificationChoice: function () {
			this.scope.find('[data-role="browserNotifyInfo"]').show();
			var type = ips.utils.notification.permissionLevel();
			switch ( type ) {
				case 'denied':
					$('#elBrowserNotifications').prop( 'checked', false ).prop( 'disabled', true );
					this.scope.find('[data-role="browserNotifyDisabled"]').show();
					break;
				case 'granted':
					$('#elBrowserNotifications').prop( 'checked', !ips.utils.cookie.get('noBrowserNotifications') );
					break;
				default:
					break;
			}
		},
		
		/**
		 * Event handler for when a notification type is clicked
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		showNotificationSettings: function (e) {
			e.preventDefault();
			
			var target = $(e.currentTarget);
			var expandedContainer = target.parent().find('[data-role="notificationSettingsWindow"]');
			
			this.scope.find('.cNotificationTypes__row--selected').removeClass('cNotificationTypes__row--selected');
			this.scope.find('[data-action="showNotificationSettings"]').show();
			this.scope.find('[data-role="notificationSettingsWindow"]').hide();
			
			target.parent().addClass('cNotificationTypes__row--selected');
			target.find('.cNotificationSettings_expand').addClass('ipsLoading ipsLoading_tiny').find('i').addClass('ipsHide');
						
			ips.getAjax()( target.attr('href') ).done(function(response){
				expandedContainer.html(response).show();
				target.hide();
				target.find('.cNotificationSettings_expand').removeClass('ipsLoading').find('i').removeClass('ipsHide');
			}).fail(function(){
				window.location = target.attr('href');
			})
		},
		
		/**
		 * Event handler for when a notification type is clicked
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		closeNotificationSettings: function (e) {
			e.preventDefault();
			
			this.scope.find('.cNotificationTypes__row--selected').removeClass('cNotificationTypes__row--selected');
			this.scope.find('[data-action="showNotificationSettings"]').show();
			this.scope.find('[data-role="notificationSettingsWindow"]').hide();
		},
		
		/**
		 * Event handler for when a notification form is saved
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		saveNotificationSettings: function (e) {
			e.preventDefault();
			
			var target = $(e.target);
			var form = target.closest('form');
			var container = form.closest('[data-role="notificationSettingsWindow"]');
			var containerParent = container.closest('.cNotificationTypes__row');
			var closeIcon = container.find('[data-action="closeNotificationSettings"]');
			
			closeIcon.addClass('ipsLoading ipsLoading_tiny').text('');
						
			ips.getAjax()( form.attr('action'), {
				data: form.serialize(),
				type: 'post'
			} ).done(function(response){
				closeIcon.removeClass('ipsLoading').html('&times;');
				containerParent.find('[data-action="showNotificationSettings"]').html(response);
				ips.ui.flashMsg.show( ips.getString('saved') );
			});
		}
	});
}(jQuery, _));