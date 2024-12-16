/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.profile.main.js - Main profile wrapper
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.profile.main', {
		
		contentArea: null,
		lastType: null,

		/**
 		 * Initialize controller events
		 * Sets up the events from the view that this controller will handle
		 *
		 * @returns 	{void}
		 */
		initialize: function () {
			this.on( 'click', '[data-action="goToProfile"]', this.changeType );
			this.on( 'click', '[data-action="browseContent"]', this.changeType );
			this.on( 'click', '[data-action="repLog"]', this.changeType );
			this.on( 'click', '[data-action="badgeLog"]', this.changeType );
			this.on( 'click', '[data-action="solutionLog"]', this.changeType );

			// Primary event that watches for URL changes
			this.on( window, 'historychange', this.stateChange );

			this.setup();
		},

		/**
		 * Try to see what the state of this is by the content in the DOM. It is not always going to be correct, but a good guess
		 *
		 * @return {"goToProfile"|"browseContent"|"repLog"|"solutionLog"|"badgeLog"}
		 * @private
		 */
		_getHistoryStateFromPage() {
			const elem = this.scope.get(0)

			const selectorMap = {
				browseContent: '#elUserContent',
				repLog: '#elUserReputation',
				badgeLog: '.cProfileBadgeGrid'
			}

			for (const state in selectorMap) {
				if (elem.querySelector(selectorMap[state])) {
					return state
				}
			}

			return "goToProfile"
		},

		/**
 		 * Non-event-based setup
		 *
		 * @returns 	{void}
		 */
		setup: function () {
			this.contentArea = this.scope.find('[data-role="profileContent"]');
			this.contentHeader = this.scope.find('[data-role="profileHeader"]');

			if (!ips.utils.history.getState('profile')?.section) {
				ips.utils.history.replaceState({ section : this._getHistoryStateFromPage()}, 'profile', window.location.href);
			}

		},

		/**
		 * Called when browser navigation is invoked without triggering a true redirect
		 *	
		 * @returns 	{void}
		 */
		stateChange: function (e) {
			if (e.detail?.type === 'load' || e.detail?.type === 'replace') {
				return
			}

			const url = window.location.href
			const data = ips.utils.history.getState('profile')

			// Only change the state if it's an actual change
			if (this._getHistoryStateFromPage() === data.section && data.section) {
				return
			}

			this.lastType = data.section;
			e?.stopPropagation?.()
			e?.stopImmediatePropagation?.()


			switch( data?.section ){
				case 'goToProfile':
					this._showProfile( url );
				break;
				case 'browseContent':
					this._showContent( url );
				break;
				case 'repLog':
				case 'solutionLog':
				case 'badgeLog':
					this._showGenericLog( url );
				break;
			}
		},

		/**
		 * User clicked something that changes the profile view
		 * Just change the URL, the state change handler does the rest
		 *	
		 * @param 		{Event} 	e 		Event object
		 * @returns 	{void}
		 */
		changeType: function (e) {
			e.preventDefault();
			let target = $( e.currentTarget );

			if( !target.is('a') ){
				target = target.find('a');
			}

			ips.utils.history.pushState({ section: $( e.currentTarget ).attr('data-action') }, 'profile', target.attr('href'));
			document.title = target.attr('title')
		},

		/**
		 * Shows the user's reputation or solution log
		 *	
		 * @param 		{string} 	url 		URL to load the content
		 * @returns 	{void}
		 */
		_showGenericLog: function (url) {
			var self = this;
			this._changeContent( true, url );
			this._showProfileButton();

			if( ips.utils.responsive.enabled() && ips.utils.responsive.currentIs('phone') ){
				$('#elProfileStats').addClass('cProfileHeaderContent');
			}
		},

		/**
		 * Shows the user's content
		 *	
		 * @param 		{string} 	url 		URL to load the content
		 * @returns 	{void}
		 */
		_showContent: function (url) {
			$( '[data-action="goToProfile"]' ).attr( "disabled", true );
			this._showProfileButton();
			this._changeContent( true, url );

			if( ips.utils.responsive.enabled() && ips.utils.responsive.currentIs('phone') ){
				$('#elProfileStats').addClass('cProfileHeaderContent');
			}
		},

		/**
		 * Shows the 'view profile' button in the header
		 *	
		 * @returns 	{void}
		 */
		_showProfileButton: function () {
			var self = this;

			// Hide browse button
			this.contentHeader.find('[data-action="browseContent"]').each( function () {
				var elem = $( this );

				if( elem.is(':visible') ){
					elem.animationComplete( function () {
						ips.utils.anim.go( 'fadeIn fast', self.contentHeader.find('[data-action="goToProfile"][data-type="' + elem.attr('data-type') + '"]') );
					 });
					 
					ips.utils.anim.go( 'fadeOut fast', elem );
				} else {
					elem.hide();
					self.contentHeader.find('[data-action="goToProfile"][data-type="' + elem.attr('data-type')  + '"]').show();
				}
			});
		},

		/**
		 * Shows the user's profile
		 *	
		 * @param 		{string} 	url 		URL to load the content
		 * @returns 	{void}
		 */
		_showProfile: function (url) {
			$( '[data-action="browseContent"]' ).attr( "disabled", true );
			this._showContentButton();
			this._changeContent( false, url );

			$('#elProfileStats').removeClass('cProfileHeaderContent');
		},

		/**
		 * Shows the 'view profile' button in the header
		 *	
		 * @returns 	{void}
		 */
		_showContentButton: function () {
			var self = this;

			// Hide browse button
			this.contentHeader.find('[data-action="goToProfile"]').each( function () {
				var elem = $( this );

				if( elem.is(':visible') ){
					elem.animationComplete( function () {
						ips.utils.anim.go( 'fadeIn fast', self.contentHeader.find('[data-action="browseContent"][data-type="' + elem.attr('data-type') + '"]') );
					});
					
					ips.utils.anim.go( 'fadeOut fast', elem );
				} else {
					elem.hide();
					self.contentHeader.find('[data-action="browseContent"][data-type="' + elem.attr('data-type') + '"]').show();
				}
			});
		},

		/**
		 * Changes the content in the content section
		 *	
		 * @param 		{boolean} 	small 		Show the header in its minimal state?
		 * @param 		{string} 	url 		The URL to load
		 * @returns 	{void}
		 */
		_changeContent: function (small, url) {
			var self = this;

			ips.controller.cleanContentsOf( this.contentArea );

			// Get height and set it, so that it doesn't jolt the page
			this.contentArea.css({
				height: String(this.contentArea.outerHeight())
			});

			// Remove content and set to loading
			this.contentArea.html( 
				$('<div/>').addClass('ipsLoading').css({
					height: '300px'
				})
			);

			// Add class to the header to shrink it
			this.contentHeader.find('#elProfileHeader').toggleClass( 'cProfileHeaderMinimal', small );

			// Load the content
			url += (url.includes('?') ? '&' : '?') + 'entireSection=1';
			ips.getAjax()( url )
				.done( function (response) {
					self.contentArea
						.hide()
						.html( response )
						.css({
							height: 'auto'
						});

					self.contentHeader.find("#elProfileStats a").each( function () {
						$( this ).removeAttr( "disabled" );
					});

					ips.utils.anim.go( 'fadeIn fast', self.contentArea );

					$( document ).trigger( 'contentChange', [ self.contentArea ] );
				})
				.fail( function () {
					window.location = url;
				});
		}

	});
}(jQuery, _));