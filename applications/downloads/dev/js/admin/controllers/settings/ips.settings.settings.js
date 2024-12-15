/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.settings.settings.js
 *
 * Author: Stuart Silvester
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('downloads.admin.settings.settings', {
		alertOpen: false,

		initialize: function () {
			this.on( 'uploadComplete', '[data-ipsUploader]', this.promptRebuildPreference );
			this.on( 'fileDeleted', this.promptRebuildPreference );
		},

		promptRebuildPreference: function (e) {

			if( this.alertOpen )
			{
				return;
			}

			this.alertOpen = true;

			/* Show Rebuild Prompt */
			ips.ui.alert.show({
				type: 'confirm',
				message: ips.getString('downloadsScreenshotsWatermark'),
				subText: ips.getString('downloadsScreenshotsWatermarkBlurb'),
				icon: 'question',
				buttons: {
					ok: ips.getString('downloadsScreenshotsWatermarkYes'),
					cancel: ips.getString('downloadsScreenshotsWatermarkNo')
				},
				callbacks: {
					ok: function(){
						$('input[name=rebuildWatermarkScreenshots]').val( 1 );
						this.alertOpen = false;
					},
					cancel: function(){
						$('input[name=rebuildWatermarkScreenshots]').val( 0 );
						this.alertOpen = false;
					}
				}
			});
		}

	});
}(jQuery, _));