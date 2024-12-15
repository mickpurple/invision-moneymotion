/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.changeTheme.js - ACP theme changing
 *
 * Author: Brandon Farber
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.core.changeTheme', {

		initialize: function () {
			$('#elAdminUser,#elThemeLangMenuMob').on( 'menuItemSelected', _.bind( this.themePreferenceSelected, this ) );

			this.setTheme();
		},

		/**
		 * Determine if we should be using dark mode or not and set the class if so
		 *
		 * @returns {void}
		 */
		setTheme: function () {
			// If we don't have a specific preference, use the OS default
			if( _.isUndefined( ips.utils.cookie.get('acptheme') ) || ips.utils.cookie.get('acptheme') == 'undefined' )
			{
				if ( window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches )
				{
					$('body').addClass('ipsDarkMode');
					ips.utils.cookie.set( 'acpthemedefault', 'dark' );
				}
				else
				{
					$('body').removeClass('ipsDarkMode');
					ips.utils.cookie.set( 'acpthemedefault', 'light' );
				}
			}
			// We have a cookie preference set so make sure that's being used
			else
			{
				$('body').toggleClass( 'ipsDarkMode', ips.utils.cookie.get('acptheme') === 'dark' );
			}
		},

		/**
		 * Change our AdminCP theme
		 *
		 * @param	{event} 	e 		Event object
		 * @param	{object}	data	Event data
		 * @returns {void}
		 */
		themePreferenceSelected: function (e, data) {
			// Make sure something was selected and this isn't a click on a different menu item
			if( _.isUndefined( data.selectedItemID ) )
			{
				return;
			}

			e.preventDefault();

			if( data.selectedItemID == 'os' )
			{
				// If we selected to use the OS preference delete the cookie (if it exists) and let the normal behavior resume
				ips.utils.cookie.unset('acptheme');
			}
			else
			{
				// Otherwise set our cookie and force the behavior we requested
				var expires = new Date();
				expires.setFullYear( expires.getFullYear() + 1 );
				ips.utils.cookie.set( 'acptheme', data.selectedItemID, expires.toUTCString() );
			}

			// The menu system can't handle our nested radio-selectable list, so manually update what is checked
			$('#elThemeMenu_menu, #elNavThemeMob_menu').find('.ipsMenu_itemChecked').removeClass('ipsMenu_itemChecked');
			$('#elThemeMenu_menu, #elNavThemeMob_menu').find( '[data-ipsMenuValue="' + data.selectedItemID + '"]' ).addClass('ipsMenu_itemChecked');

			this.setTheme();
		}
	});
}(jQuery, _));