/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.request.js - Support request controller for keyboard shortcuts
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.request', {

		initialize: function () {
			this.on( document, 'keypress', this.keyPress );
			this.on( window, 'resize', this.resizeInfo );

			this.setup();
		},

		setup: function () {
			var self = this;

			if ( navigator.userAgent.indexOf('Mac OS X') != -1 ) {
				this.scope.find('[data-role="replyForm"] [data-role="primarySubmit"]').attr( { 'title': ips.getString('cmd_and_enter'), 'data-ipsTooltip': '' } );
				this.scope.find('[data-role="noteForm"] button[type="submit"]').attr( { 'title': ips.getString('cmd_and_enter'), 'data-ipsTooltip': '' } );
			} else {
				this.scope.find('[data-role="replyForm"] [data-role="primarySubmit"]').attr( { 'title': ips.getString('ctrl_and_enter'), 'data-ipsTooltip': '' } );
				this.scope.find('[data-role="noteForm"] button[type="submit"]').attr( { 'title': ips.getString('ctrl_and_enter'), 'data-ipsTooltip': '' } );
			}

			this.resizeInfo();
		},

		resizeInfo: function () {
			// Set height of ticket info panel
			if( ips.utils.responsive.currentIs('phone') ){
				this.scope.find('#elNexusRequestInfo').css({
					height: 'auto'
				});
			} else {	
				this.scope.find('#elNexusRequestInfo').css({
					height: $( window ).height() + 'px'
				});
			}
		},

		/**
		 * Handles key press
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		keyPress: function (e) {
			
			var tag = e.target.tagName.toLowerCase();
			if ( tag != 'body' ) {
				return;
			}
			
			switch ( e.which ) {
				case 114: // r
					e.preventDefault();
					this.scope.find('[data-role="replyTab"]').click();
					var editor = ips.ui.editor.getObj( this.scope.find('[data-role="replyForm"] [data-ipsEditor]') );
					editor.unminimize();
					editor.focus();
					break;
				case 110: // n
					e.preventDefault();
					this.scope.find('[data-role="noteTab"]').click();
					var editor = ips.ui.editor.getObj( this.scope.find('[data-role="noteForm"] [data-ipsEditor]') );
					editor.unminimize();
					editor.focus();
					break;
				case 115: // s
					this.scope.find('[data-role="statusMenu"]').click();
					break;
				case 118: // v
					this.scope.find('[data-role="severityMenu"]').click();
					break;
				case 100: // d
					this.scope.find('[data-role="departmentMenu"]').click();
					break;
				case 97: // a
					this.scope.find('[data-role="staffMenu"]').click();
					break;
				case 116: // t
					this.scope.find('[data-role="trackMenu"]').click();
					break;
				case 112: // p
					this.scope.find('[data-role="associatePurchaseMenu"]').click();
					break;
				case 107: // k
					var next = this.scope.find('[data-role="nextRequestLink"]');
					if ( next.length ) {
						window.location = next.attr('href');
					}
					break;
				case 106: // j
					var prev = this.scope.find('[data-role="prevRequestLink"]');
					if ( prev.length ) {
						window.location = prev.attr('href');
					}
					break;
			}
		}
	});
}(jQuery, _));