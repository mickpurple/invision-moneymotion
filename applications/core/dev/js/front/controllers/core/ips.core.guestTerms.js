/**
 * IPS Social Suite 4
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.guestTerms.js - Guest terms bar
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.guestTerms', {

		initialize: function () {
			this.setup();
			this.on( 'click', '[data-action="dismissTerms"]', this.dismissTerms );
		},

		setup: function () {
			// If guest caching is enabled, the bar HTML will exist in the page even if this
			// user has accepted terms or rejected optional cookies. We'll hide it with JS if that happens.
			let hide = false;
			if( this.scope.attr('data-role') == 'cookieConsentBar' && ips.utils.cookie.get('cookie_consent') )
			{
				hide = true;
			}
			else if( this.scope.attr('data-role') == 'guestTermsBar' && ips.utils.cookie.get('guestTermsDismissed') )
			{
				hide = true;
			}

			/* Hide things like theme selector because we cannot change it as a guest */
			if( this.scope.attr('data-role') == 'cookieConsentBar' && ( !ips.getSetting( 'memberID' ) && !ips.utils.cookie.get( 'cookie_consent_optional' ) ) )
			{
				$('#elNavTheme').hide();
			}
			/* Hide announcement dismiss if optional cookies are not enabled in browser or account */
			if( this.scope.attr('data-role') == 'cookieConsentBar' && !ips.utils.cookie.get( 'cookie_consent_optional' ) )
			{
				$('[data-role="dismissAnnouncement"]').hide();
			}

			this.scope.toggle( !hide );
			$('body').toggleClass('cWithGuestTerms', !hide );
		},

		dismissTerms: function ( e ) {
			e.preventDefault();
			ips.utils.cookie.set('guestTermsDismissed', 1 ); // intentionally only a session cookie
			this.hideGuestBar();
		},

		hideGuestBar: function() {
			this.scope.toggle( false );
			$('body').toggleClass('cWithGuestTerms', false );
		}
	});
}(jQuery, _));