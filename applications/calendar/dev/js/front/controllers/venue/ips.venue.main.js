/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.venue.main.js - Venue main browsing controller
 *
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('calendar.front.venue.main', {

		_ajaxObj: null,
		
		initialize: function () {
			this.on( 'click', '[data-action="changeView"]', this.changeView );
			this.on( window, 'historychange:venueView', this.stateChange );
			this.setup();
		},

		/**
		 * Controller setup method
		 *
		 * @returns {void}
		 */
		setup: function () {
			ips.utils.history.pushState( { controller: 'venueView' }, 'venueView', window.location.href );
		},

		/**
		 * Changes the calendar view dynamically
		 *
		 * @param 	{Event} 	e 	Event object
		 * @returns {void}
		 */
		changeView: function (e) {
			e.preventDefault();

			ips.utils.history.pushState({ controller: 'venueView' }, 'venueView', $( e.currentTarget ).attr('href'));
			document.title = $( e.currentTarget ).attr('title');
		},

		/**
		 * Event handler for history state changes
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		stateChange: function () {
			const data = ips.utils.history.getState('venueView') || {},
				url = window.location.href

			if (data.controller !== 'venueView') {
				return;
			}

			// Track page view
			ips.utils.analytics.trackPageView( url );

			this._updateView( url )
		},

		/**
		 * Loads a new view 
		 *
		 * @param 	{string} 	url 	URL to load
		 * @returns {void}
		 */
		_updateView: function (url) {
			if (this._ajaxObj && _.isFunction( this._ajaxObj.abort ) ){
				this._ajaxObj.abort();
			}

			this._setLoading( true );

			this._ajaxObj = ips.getAjax()( url, {
				showLoading: true
			} )
				.done(response => {
					console.log( response );
					this.scope.html( response );
					$( document ).trigger( 'contentChange', [ self.scope ] );
				})
				.always(() => {
					this._setLoading( false );
				});
		},

		/**
		 * Toggles the loading state on the view
		 *
		 * @param 	{boolean} 	state 		Enable the loading state?
		 * @returns {void}
		 */
		_setLoading: function (state) {
			if( state ){
				this.scope.animate( { opacity: "0.6" }, 'fast' );
			} else {
				this.scope.animate( { opacity: "1" }, 'fast' );
			}
		}
	});
}(jQuery, _));