/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.emailsetup.js
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.emailsetup', {
		
		/**
		 * Init
		 */
		initialize: function () {
			var self = this;
			var scope = $(this.scope);
			scope.find('[data-role="toggleView"]').click(function(e){
				e.preventDefault();
				var height = scope.height();
				scope.html('').css( 'min-height', height ).addClass('ipsLoading');
				ips.getAjax()( $(e.currentTarget).attr('href') )
					.done(function( response ){
						scope.removeClass('ipsLoading').css( 'min-height', 0 ).html( response );
						self.initialize();
					})
					.fail(function(){
						window.location = $(e.currentTarget).attr('href');
					});
			});
		},
				
	});
}(jQuery, _));