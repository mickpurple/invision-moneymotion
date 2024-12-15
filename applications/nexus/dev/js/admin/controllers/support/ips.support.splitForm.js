/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.splitForm.js - Controller for link panel in editor
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.splitForm', {
				
		initialize: function () {
			this.on( 'submit', this.formSubmit );
		},

		/**
		 * Event handler for submitting the form
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		formSubmit: function (e) {
			e.preventDefault();
			
			var form = $(this.scope);
			if( form.attr('data-bypassValidation') ){
				return false;
			}
			
			var dialog = ips.ui.dialog.getObj( $('[data-role="moderationTools"]') );
			dialog.setLoading(true);
			
			var newWindow = window.open( '', '_blank' );
			newWindow.opener = null;
			newWindow.blur();
			window.focus();
			
			ips.getAjax()( form.attr('action'), {
				data: form.serialize(),
				type: 'post'
			} )
				.done( function (response, status, jqXHR) {
					if( jqXHR.getAllResponseHeaders().indexOf('X-IPS-FormError: true') !== -1 || jqXHR.getAllResponseHeaders().indexOf('X-IPS-FormNoSubmit: true') !== -1 || jqXHR.getAllResponseHeaders().indexOf('x-ips-formerror: true') !== -1 || jqXHR.getAllResponseHeaders().indexOf('x-ips-formnosubmit: true') !== -1 ){
						dialog.setLoading( false );
						dialog.updateContent( response );
					} else {
						try {
							var json = $.parseJSON( jqXHR.responseText );
														
							newWindow.location = json.newUrl;
							window.location = json.oldUrl;
							
						} catch (err) {
							newWindow.close();
							dialog.setLoading( false );
							dialog.updateContent( response );
						}
					}
				})
				.fail(function(response){
					newWindow.close();
					form.attr( 'data-bypassValidation', true ).submit();
				});
			
			
		}
	});
}(jQuery, _));