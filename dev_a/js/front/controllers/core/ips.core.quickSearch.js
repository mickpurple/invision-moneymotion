/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.quickSearch.js - Controller for search in header
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.quickSearch', {
		
		_moreOptions: null,
		
		initialize: function () {
			this.on( 'focus', '#elSearchField', this.openSearch );
			this.on( 'click', '[data-action="showMoreSearchContexts"]', this.showMoreSearchContexts );
			this.setup();
		},

		/**
		 * Setup method
		 *
		 * @returns {void}
		 */
		setup: function () {
		},
		
		/**
		 * Event handler for when the search box loses focus
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		closeSearch: function (e, data) {
			// This function returns the trigger element that was clicked on, if any
			var clickedOnTrigger = function () {
				if( $( e.target ).is('#elSearchExpanded') ){
					Debug.log( e.target );
					return $( e.target );
				} else if ( $( e.target ).parent('#elSearchExpanded') ){
					return $( e.target ).parent('#elSearchExpanded').get(0);
				}
			}();

			if( clickedOnTrigger ||  $( e.target ).closest('[data-ipsMenuValue]').length || $( e.target ).attr('id') == 'elSearchField' || $.contains( $('#elSearchExpanded').get(0), $( e.target ) ) ){
				$('#elSearchField').focus();
				return true;
			}
			
			$( document ).off('click.elSearchExpanded');
			ips.utils.anim.go('fadeOut fast', $('#elSearchExpanded'));
			$('#elSearchWrapper').removeClass('cSearchExpanded');
		},
		
		/**
		 * Event handler for when the search box is clicked into
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		openSearch: function (e, data) {
			if ( $('#elSearchExpanded').is(':visible') ) {
				return;
			}

			ips.utils.anim.go('fadeIn fast', $('#elSearchExpanded'));
			$('#elSearchWrapper').addClass('cSearchExpanded');
			$( document ).on('click.elSearchExpanded', this.closeSearch );
			
			if( this._moreOptions === null ){
				var url = ips.getSetting('baseURL') + 'index.php?app=core&module=search&controller=search&do=globalFilterOptions&exclude=' + $('[data-action="showMoreSearchContexts"]').attr('data-exclude');
				ips.getAjax()( url )
					.done(function( response ){
						this._moreOptions = response;
					}.bind(this));
			}
		},
				
		/**
		 * Event handler for the "More Options" lik being clicked
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		showMoreSearchContexts: function (e, data) {
			e.stopPropagation();
			e.preventDefault();
			this.scope.find('[data-role="showMoreSearchContexts"]').replaceWith( this._moreOptions );
		}
	});
}(jQuery, _));