/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.staffreply.js - Support reply processing
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.message', {
		
		/**
		 * Init
		 */
		initialize: function () {
			this.setup();
		},

		/**
		 * Setup method
		 *
		 * @returns {void}
		 */
		setup: function () {
			this.scope.find('a').each( this._obscureLink );
		},

		/**
		 * Takes a link and makes it safe to show in the AdminCP, adding an icon to text links
		 *
		 * @returns {void}
		 */
		_obscureLink: function () {
			var elem = $( this );
			var realUrl = decodeURIComponent( ips.utils.url.getParam( 'url', elem.attr('href') ) );
			elem.attr('target', '_blank');
			
			if( realUrl !== 'undefined' && realUrl != elem.text() ){
								
				var icon = $('<i class="fa fa-external-link ipsCursor_pointer ipsType_medium" title="' + ips.getString('click_to_show_url') + '" data-ipsTooltip></i>');
				
				icon.on( 'click', function () {
					ips.ui.alert.show( {
						type: 'alert',
						icon: 'info',
						message: _.escape( realUrl ),
					});
				});
				
				elem.after( icon ).after(' ');
			}
		}
	});
}(jQuery, _));