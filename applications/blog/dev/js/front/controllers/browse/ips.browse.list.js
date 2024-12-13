/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.browse.list.js - Blog browse list controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('blog.front.browse.list', {

		initialize: function () {
			this.on( 'change', '[data-role="moderation"]', this.selectEntry );
		},

		/**
		 * Toggles classes when the moderation checkbox is checked
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		selectEntry: function (e) {
			var row = $( e.currentTarget ).closest('.cBlogView_entry');
			row.toggleClass( 'cBlogView_entrySelected', $( e.currentTarget ).is(':checked') );
		}
	});
}(jQuery, _));