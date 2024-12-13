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
			this.on( 'click', '[data-action="showNotificationSettings"]', this.showNotificationSettings );
			this.on( 'click', '[data-action="closeNotificationSettings"]', this.closeNotificationSettings );
			this.on( 'change', '[data-role="notificationSettingsWindow"]', this.saveNotificationSettings );

			this.on( 'change', '#elBrowserNotifications', this.promptMe );
			this.on( 'change', '#elNotificationSounds', this.enableDisableSounds );
			this.on( document, 'permissionGranted.notifications', this.permissionChanged );
			this.on( document, 'permissionDenied.notifications', this.permissionChanged );
			this.setup();
		},

		/**
		 * Setup method
		 *
		 * @returns 	{void}
		 */
		setup: function () {
			if( ips.utils.notification.supported ){
				this._showNotificationChoice();	
			}			
		},

		/**
		 * Event handler for when the notification permission changes
		 *
		 * @returns 	{void}
		 */
		permissionChanged: function () {
			this._showNotificationChoice();
			ips.ui.flashMsg.show( ips.getString('saved') );
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
		 * Event handler for changing the "Play notification sounds" checkbox
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		enableDisableSounds: function (e) {
			var url = $(e.target).attr('data-callback') + '&enable=' + ( $(e.target).is(':checked') ? 1 : 0 );
			ips.getAjax()( url ).done(function(response){
				ips.ui.flashMsg.show( ips.getString('saved') );
			}).fail(function(){
				window.location = url;
			});
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
			
			$(this.scope).find('.ipsDataItem_selected').removeClass('ipsDataItem_selected');
			$(this.scope).find('[data-action="showNotificationSettings"]').show();
			$(this.scope).find('[data-role="notificationSettingsWindow"]').hide();
			
			target.parent().addClass('ipsDataItem_selected');
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
			
			$(this.scope).find('.ipsDataItem_selected').removeClass('ipsDataItem_selected');
			$(this.scope).find('[data-action="showNotificationSettings"]').show();
			$(this.scope).find('[data-role="notificationSettingsWindow"]').hide();
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
			var containerParent = container.closest('.ipsDataItem');
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