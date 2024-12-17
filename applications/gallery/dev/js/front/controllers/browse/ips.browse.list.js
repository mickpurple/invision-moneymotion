/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.browse.list.js - Gallery browse list controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('gallery.front.browse.list', {

		initialize: function () {
			this.on( 'change', '[data-role="moderation"]', this.selectImage );
		},

		/**
		 * Toggles classes when the moderation checkbox is checked
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		selectImage: function (e) {
			var row = $( e.currentTarget ).closest('.cGalleryImageItem');
			row.toggleClass( 'cGalleryImageItem_selected', $( e.currentTarget ).is(':checked') );
		}
	});
}(jQuery, _));