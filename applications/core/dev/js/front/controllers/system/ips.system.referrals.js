/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.system.referrals.js - Referrals section
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.system.referrals', {

		initialize: function () {
			
			// There can be a delay while the library loads for the first time
			$('.cReferrer_copy').each( function()
			{
				$(this).hide();
			} );
					
			ips.loader.get( ['core/interface/clipboard/clipboard.min.js'] ).then( function()
	        {
		        if ( ClipboardJS.isSupported() ) {
			        $('.cReferrer_copy').each( function()
					{
						$(this).show();
					} );
			
					var clipboard = new ClipboardJS('.cReferrer_copy');
					
					clipboard.on('success', function(e) {
					    ips.ui.flashMsg.show( ips.getString('copied') );
					    e.clearSelection();
					});
				} else {
					$('.cReferrals_directLink_input').removeClass('ipsHide');
					$('.cReferrals_directLink_link').addClass('ipsHide');
				}
			} );
		}
	});
}(jQuery, _));