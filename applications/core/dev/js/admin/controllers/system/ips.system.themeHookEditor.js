/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.system.codeHook.js - Makes the theme hook editor all fancy like
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.system.themeHookEditor', {
				
		initialize: function () {	
			this.on( 'click', 'a[data-action="templateLink"]', this._itemClick );
		},
		
		/**
		 * Event handler for clicking on an item
		 *
		 * @param 	{event} 	e 		Event object
		 * @returns {void}
		 */
		_itemClick: function (e) {
			e.preventDefault();
			
			var themeHookWindow = $(this.scope).find('[data-role="themeHookWindow"]');
			var sidebar = this.scope.find('[data-role="themeHookSidebar"]');
			var target = $( e.currentTarget );
			var templateName = target.text().trim();

			ips.utils.history.replaceState( {}, 'core.admin.system.themeHookEditor', target.attr('href') );
			
			themeHookWindow.children('[data-template],[data-role="themeHookWindowPlaceholder"]').hide();
			themeHookWindow.addClass('ipsLoading');
			sidebar.find('.ipsSideMenu_itemActive').removeClass('ipsSideMenu_itemActive');
						
			if ( themeHookWindow.children( '[data-template="' + templateName + '"]' ).length ) {
				themeHookWindow.children( '[data-template="' + templateName + '"]' ).show();
				themeHookWindow.removeClass('ipsLoading');
			} else {
				ips.getAjax()( target.attr('href') + '&editor=1' )
					.done( function (response) {
						themeHookWindow.append( "<div class='cHookEditor_content' data-template='" + templateName + "'>" + response + '</div>' );
						$( document ).trigger('contentChange', [ themeHookWindow.find('[data-template="' + templateName + '"]') ]);
					})
					.fail( function () {
						window.location = target.attr('href');
					})
					.always( function () {
						themeHookWindow.removeClass('ipsLoading');
					});
			}
			
			target.closest('.ipsSideMenu_item').addClass('ipsSideMenu_itemActive');
		}
		
	});
}(jQuery, _));
