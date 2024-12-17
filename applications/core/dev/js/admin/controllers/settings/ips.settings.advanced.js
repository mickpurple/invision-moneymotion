/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.settings.advanced.js
 *
 * Author: Brandon Farber
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.settings.advanced', {
		defaultStatus: false,

		initialize: function () {
			this.defaultStatus = $( '#check_lazy_load_enabled' ).is(':checked');
			this.on( 'change', '#check_lazy_load_enabled', this.promptRebuildPreference );
		},

		promptRebuildPreference: function (e) {
			/* Do not prompt if the setting is toggled to the default */
			if( this.defaultStatus == $( '#check_lazy_load_enabled' ).is(':checked') )
			{
				/* Disable any rebuild process */
				$('input[name=rebuildPosts]').val( 0 );
				return;
			}

			/* Show Rebuild Prompt */
			ips.ui.alert.show({
				type: 'confirm',
				message: ips.getString('imageProxyRebuild'),
				subText: $( '#check_lazy_load_enabled' ).is(':checked') ? ips.getString('imageLazyLoadRebuildBlurbEnable') : ips.getString('imageLazyLoadRebuildBlurbDisable'),
				icon: 'question',
				buttons: {
					ok: ips.getString('imageProxyRebuildYes'),
					cancel: ips.getString('imageProxyRebuildNo')
				},
				callbacks: {
					ok: function(){
						$('input[name=rebuildPosts]').val( 1 );
					},
					cancel: function(){
						$('input[name=rebuildPosts]').val( 0 );
					}
				}
			});
		}

	});
}(jQuery, _));