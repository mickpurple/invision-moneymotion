/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.announcementBanner.js - Announcement Banners
 *
 * Author: Stuart Silvester
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.announcementBanner', {

		/**
		 * Initialise event handlers
		 *
		 * @returns		{void}
		 */
		initialize: function () {
			this.setup();
			this.on( 'click', '[data-role="dismissAnnouncement"]', this.dismissAnnouncement );
		},

		/**
		 * Set up CSS for announcements
		 *
		 * @returns		{void}
		 */
		setup: function(){
			$('.cAnnouncements').addClass( 'cAnnouncementsFloat' ).css( 'zIndex', ips.ui.zIndex() );

			// Cycle and show announcements, the HTML will always contain the announcement HTML so that it's present
			// for guest caching, we use JS to show them based on the cookie values.
			this.scope.find('[data-announcementId]').each( function() {
				var announcement = $( this );
				if( !ips.utils.cookie.get( 'announcement_' + announcement.attr('data-announcementId') ) ) {
					announcement.show();
				}
			});
		},

		/**
		 * Dismiss Announcement
		 *
		 * @param		{event}		e		Event object
		 * @returns		{void}
		 */
		dismissAnnouncement: function ( e ) {
			if( e ){
				e.preventDefault();
			}

			var element = $( e.target ).closest('[data-announcementId]');
			var id = element.attr('data-announcementId');

			var date = new Date();
			date.setTime( date.getTime() + ( 7 * 86400000 ) );
			ips.utils.cookie.set( 'announcement_' + id, true, date.toUTCString() );

			element.slideUp( {
				duration: 400,
				complete: function() {
					$(this).remove();
				},
				progress: function() {

				}
			});
		},

		/**
		 * Adjust the body margin
		 *
		 * @param		{event}		e		Event object
		 * @returns		{void}
		 */
		reflow: function( e ){
			// Deprecated
		}

	});
}(jQuery, _));
