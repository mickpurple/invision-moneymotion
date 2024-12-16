/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.forms.reactionmapper.js - Conversion specific Reaction map form
 *
 * Author: Stuart Silvester
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('convert.admin.forms.reactionmapper', {

		initialize: function () {
			var id = $(this.scope).data( 'reactionid' );

			this.on( document, 'click', "#elReactionMapper" + id + "_menu .ipsMenu_item", this.selectReaction );

			this.setup();
		},

		/**
		 * Set up the default reaction
		 *
		 * @returns		{void}
		 */
		setup: function () {
			this.scope.find('a[data-default="true"]').click();
		},

		/**
		 * Select Reaction
		 *
		 * @param		{event}		e		Event object
		 * @returns		{void}
		 */
		selectReaction: function ( e ) {
			e.preventDefault();
			var menuItem = $( e.target );
			this.scope.find('.elMenuSelect_replace').html( menuItem.html() );
			this.scope.find('input[type=hidden]').val( menuItem.data('id') );
		}
	});
}(jQuery, _));