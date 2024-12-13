/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.ui.copy.js - Widget that has something that can be copied to clipboard
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.createModule('ips.ui.copy', function(){

		var respond = function (elem, options, e) {
			ips.loader.get( ['core/interface/clipboard/clipboard.min.js'] ).then( function()
	        {
		        if ( ClipboardJS.isSupported() ) {
			        elem.find('[data-role="copyButton"]').show();
			
					var clipboard = new ClipboardJS( elem.find('[data-role="copyButton"]').get(0) );
										
					clipboard.on('success', function(e) {
						elem.find('[data-role="copyButton"]').text( ips.getString('copied') );
					});
				}
			} );
		};
		
		ips.ui.registerWidget( 'copy', ips.ui.copy, [] );

		return {
			respond: respond,
		};
	});
}(jQuery, _));