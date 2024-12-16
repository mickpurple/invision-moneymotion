/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.browse.main.js - Calendar main browsing controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('calendar.front.browse.main', {

		_ajaxObj: null,
		
		initialize: function () {
			this.on( 'click', '[data-action="changeView"]', this.changeView );
			this.on( window, 'historychange:calendarView', this.stateChange );
			this.setup();
		},

		/**
		 * Controller setup method
		 *
		 * @returns {void}
		 */
		setup: function () {
			ips.utils.history.replaceState( { controller: 'calendarView' }, 'calendarView', window.location.href );
		},

		/**
		 * Changes the calendar view dynamically
		 *
		 * @param 	{Event} 	e 	Event object
		 * @returns {void}
		 */
		changeView: function (e) {
			e.preventDefault();

			// Load the url via ajax instead
			var title = $( e.currentTarget ).attr('title');
			var url = $( e.currentTarget ).attr('href');

			ips.utils.history.pushState( { controller: 'calendarView' }, 'calendarView', url );
			document.title = title
		},

		/**
		 * Event handler for history state changes
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		stateChange: function () {
			const data = ips.utils.history.getState('calendarView') || {}, url = window.location.href

			if (data.controller !== 'calendarView') {
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
			if( this._ajaxObj && _.isFunction( this._ajaxObj.abort ) ){
				this._ajaxObj.abort();
			}

			this._setLoading( true );

			this._ajaxObj = ips.getAjax()( url, {
				showLoading: true
			} )
				.done(response => {
					this.scope.html( response );

					$( document ).trigger( 'contentChange', [ this.scope ] );
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