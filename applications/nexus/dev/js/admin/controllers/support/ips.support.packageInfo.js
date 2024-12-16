/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.packageInfo.js - Support packageInfo area
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.packageInfo', {

		initialize: function () {
			this.on( 'click', '[data-action="showMoreRows"]', this.showRows );
			this.on( 'click', '[data-action="showFewerRows"]', this.hideRows );
		},

		showRows: function (e) {
			e.preventDefault();
			this.scope
				.find('.cNexusSupportHeader_optional')
					.show()
				.end()
				.find('[data-action="showMoreRows"]')
					.hide()
				.end()
				.find('[data-action="showFewerRows"]')
					.show();

			ips.utils.cookie.set('showAllPackageInfo', true);
		},

		hideRows: function (e) {
			e.preventDefault();
			this.scope
				.find('.cNexusSupportHeader_optional')
					.hide()
				.end()
				.find('[data-action="showMoreRows"]')
					.show()
				.end()
				.find('[data-action="showFewerRows"]')
					.hide();

			ips.utils.cookie.unset('showAllPackageInfo');
		}
	});
}(jQuery, _));