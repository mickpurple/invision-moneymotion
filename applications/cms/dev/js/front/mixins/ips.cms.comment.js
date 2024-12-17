/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.cms.comment.js - Front-end mixin for comments
 *
 * Author: Matt Mecham
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.mixin('comment', 'core.front.core.comment', true, function () {
		/**
		 * Switch off table loading after results are fetched
		 *
		 * @returns {void}
		 */
		this.after('saveEditCommentDone', function () {
			this.scope
				.find('[data-role="commentContent"]')
				.addClass('sm:ipsPadding_vertical:half')
				.addClass('ipsPadding_vertical')
				.addClass('ipsPadding_horizontal')
				.removeClass('ipsPadding_bottom')
		});
	});
}(jQuery, _));