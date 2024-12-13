/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.members.lazyLoadingProfileBlock.js
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.members.lazyLoadingProfileBlock', {
		
		/**
		 * Init
		 */
		initialize: function () {
			var scope = $(this.scope);
			ips.getAjax()( scope.attr('data-url') ).done(function(response){
				scope.html( response );
				$( document ).trigger( 'contentChange', [ scope ] );
			});
		},
				
	});
}(jQuery, _));