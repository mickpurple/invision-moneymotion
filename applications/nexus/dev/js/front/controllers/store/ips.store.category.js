/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.store.category.js - Category screen
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.front.store.category', {

		_ajaxObj: null,

		initialize: function () {
			this.on( 'click', '[data-action="filter"],[data-page]', this.changeView );
			this.on( window, 'historychange:nexus.front.store.category', this.stateChange );
			this.setup();
		},
		
		/**
		 * Controller setup method
		 *
		 * @returns {void}
		 */
		setup: function () {
			ips.utils.history.pushState( { controller: 'storeCategoryView' }, 'nexus.front.store.category', window.location.href );
		},

		/**
		 * Changes the calendar view dynamically
		 *
		 * @param 	{Event} 	e 	Event object
		 * @returns {void}
		 */
		changeView: function (e) {
			e.preventDefault();
			
			if ( $(e.target).hasClass('ipsSideMenu_item') ) {
				$(e.target).toggleClass('ipsSideMenu_itemActive');
			}

			ips.utils.history.pushState( { controller: 'storeCategoryView' }, 'nexus.front.store.category', $(e.currentTarget).attr('href') );
		},

		/**
		 * Event handler for history state changes
		 *
		 * @returns {void}
		 */
		stateChange: function () {
			const url = window.location.href;

			if (!('nexus.front.store.category' in ips.utils.history.getState())) {
				return;
			}

			// Track page view
			ips.utils.analytics.trackPageView( url );

			this._updateView( url, document.title )
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

			this._ajaxObj = ips.getAjax()( url )
				.done( function (response) {
					
					$('[data-role="packageListContainer"]').html(response.contents);
					$('[data-role="categorySidebar"]').html(response.sidebar);
					$( document ).trigger( 'contentChange', [ $('[data-role="packageListContainer"]'), $('[data-role="categorySidebar"]') ] );

					ips.utils.history.pushState({ controller: 'storeCategoryView' }, 'nexus.front.store.category', url);
					document.title = title
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
				$('[data-role="packageList"]').css( 'height', $('[data-role="packageList"]').height() ).html('').addClass('ipsLoading');
			} else {
				$('[data-role="packageList"]').css( 'height', 'auto' ).removeClass('ipsLoading');
			}
		}
	});
}(jQuery, _));