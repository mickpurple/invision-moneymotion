/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.nexus.hosting.accountform.js
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.hosting.accountform', {
		
		/**
		 * Init
		 */
		initialize: function () {
			$( document ).on( 'nodeItemSelected', function(){
				$('#form_account_server_warning').show();
			});
			
			$('[data-role="editWarning"]').hide();
			$( 'input[name^="account_"], input[name^="p_"]' ).change(function(){
				$(this).parent().find('[data-role="editWarning"]').show();
				$('[data-role="editWarningBox"]').show();
			});
			
			$('#form_account_server_warning').hide();
		},
				
	});
}(jQuery, _));