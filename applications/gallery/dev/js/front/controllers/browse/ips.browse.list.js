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
			this.on( 'tableRowsUpdated', this.rowsUpdated );
		},

		/**
		 * Refreshes the patchwork when table rows are updated
		 *
		 * @returns {void}
		 */
		rowsUpdated: function () {
			var patchwork = ips.ui.photoLayout.getObj( this.scope );

			if( patchwork ){
				patchwork.refresh();
			}
		},

		/**
		 * Toggles classes when the moderation checkbox is checked
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		selectImage: function (e) {
			// e.stopPropagation();
			// Can't do that or the moderator floating menu never shows up

			var row = $( e.currentTarget ).closest('.cGalleryImageItem');
			row.toggleClass( 'cGalleryImageItem_selected', $( e.currentTarget ).is(':checked') );

			//return false;
		}
	});
}(jQuery, _));