/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.pagination.js - Pagination controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.pagination', {

		initialize: function () {
			this.on( 'paginationClicked paginationJump', this.paginationClick );
		},
		
		paginationClick: function (e, data) {
			var self = this;

			if( !data.href ){
				return;
			}

			ips.getAjax()( data.href )
				.done( function (response) {
					self.scope.hide().html( response );
					ips.utils.links.updateExternalLinks();
					ips.utils.anim.go('fadeIn', self.scope);
				})
				.fail( function () {
					window.location = data.href;
				});
		}

	});
}(jQuery, _));
