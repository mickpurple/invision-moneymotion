/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://invisioncommunity.com
 *
 * ips.core.onlineUsersWidget.js - Widget block controller for handling online users
 *
 * Author: Stuart Silvester
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.onlineUsersWidget', {

		initialize: function () {

			if( !ips.getSetting('member_url') || this.scope.find('[data-memberId=' + ips.getSetting('member_id') + ']').length )
			{
				return;
			}

			var memberRowHtml = ips.templates.render('core.onlineUser.linked', {
				memberUrl: ips.getSetting('member_url'),
				memberHovercardUrl: ips.getSetting('member_hovercardUrl'),
				formattedName: ips.getSetting('member_formattedName'),
			});

			this.scope.find('ul').prepend( memberRowHtml );

			var numOnline = this.scope.find( 'span[data-memberCount]' );
			numOnline.text( ips.pluralize( ips.getString('widget_onlineusers_membercount'), parseInt( numOnline.attr('data-memberCount') ) + 1 ) );
			this.scope.find('li[data-noneOnline]').remove();
		}
	});
}(jQuery, _));