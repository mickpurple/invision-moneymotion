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
			this.on( window, 'statechange', this.stateChange );
			this.setup();
		},

		/**
		 * Controller setup method
		 *
		 * @returns {void}
		 */
		setup: function () {
			History.pushState( { controller: 'venueView' }, document.title, window.location.href );
		},

		/**
		 * Changes the calendar view dynamically
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		changeView: function (e) {
			e.preventDefault();

			// Load the url via ajax instead
			var self = this;
			var title = $( e.currentTarget ).attr('title');
			var url = $( e.currentTarget ).attr('href');

			History.pushState( { controller: 'venueView' }, title, url );
		},

		/**
		 * Event handler for history state changes
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		stateChange: function () {
			var state = History.getState();

			if( _.isUndefined( state.data.controller ) || state.data.controller != 'venueView' ) {
				return;
			}

			// Track page view
			ips.utils.analytics.trackPageView( state.url );

			this._updateView( state.url, state.title )
		},

		/**
		 * Loads a new view 
		 *
		 * @param 	{string} 	url 	URL to load
		 * @param 	{string} 	title 	New browser title
		 * @returns {void}
		 */
		_updateView: function (url, title) {
			var self = this;

			if( this._ajaxObj && _.isFunction( this._ajaxObj.abort ) ){
				this._ajaxObj.abort();
			}

			this._setLoading( true );

			this._ajaxObj = ips.getAjax()( url, {
				showLoading: true
			} )
				.done( function (response) {
					console.log( response );
					self.scope.html( response );

					$( document ).trigger( 'contentChange', [ self.scope ] );

					History.pushState( { controller: 'venueView' }, title, url );
				})
				.always( function () {
					self._setLoading( false );
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