/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.quickSearch.js - Controller for search in header
 *
 * Author: Ehren Harber
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.quickSearch', {
		
		initialize: function () {
			this.on( 'mouseup', '.cSearchFilter__menu', this.updateAndClose );
			this.on( 'change', 'input[name="type"]', this.updateFilter );
			this.on( 'focus', '.cSearchSubmit', this.a11yFocusSubmit );
			this.on( 'keypress', '.cSearchFilter__text', this.a11yOpenDetails );
			this.setup();
		},

		/* Populate the search filter with the default filter */
		setup: function () {
			document.querySelector('.cSearchFilter__text').innerText = document.querySelector('.cSearchFilter__menu input:checked + .cSearchFilter__menuText').innerHTML;
		},
		
		/* Update the search filter when a new filter is selected */
		updateFilter: function(e){
			document.querySelector('.cSearchFilter__text').innerText = e.target.nextElementSibling.innerHTML;
		},

		/* Close the menu and add focus back to the search form when a new filter is selected */
		updateAndClose: function(e){
			setTimeout(() => {
				document.querySelector('.cSearchFilter').open = false;
				document.querySelector('#elSearchField').focus();
			}, "500");
		},

		/* Automatically focus the selected filter when opened using keyboard */
		a11yOpenDetails: function(e){
			if(e.key === "Enter"){
				e.preventDefault();
				document.querySelector('.cSearchFilter').open = true;
				document.querySelector('.cSearchFilter__menu input:checked').focus();
			}
		},

		/* Hide the dropdown menu when the submit button is focused using keyboard */
		a11yFocusSubmit: function(e){
			document.querySelector('.cSearchFilter').open = false;
		}
	});
}(jQuery, _));