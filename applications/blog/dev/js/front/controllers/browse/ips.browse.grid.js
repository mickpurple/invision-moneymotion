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

	ips.controller.register('blog.front.browse.grid', {

		initialize: function () {
          	this.on('click', '.cBlog_grid_item', this.clickNewsItem);
			this.setup();
		},

		setup: function () {
			
		},
      
      	clickNewsItem: function (e) {
          	var link = $( e.currentTarget ).find('[data-role="newsTitle"]');
          
			if( $( e.target ).closest('a').length > 0 ){
				return;
			}
			
			if( $( e.target ).closest('input').length > 0 ){
				return;
			}
          
          	window.location = link.attr('href');
      	}
	});
}(jQuery, _));