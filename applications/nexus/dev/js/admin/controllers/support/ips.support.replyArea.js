/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.replyArea.js - Support request reply area
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.replyArea', {

		initialize: function () {
			this.on( 'tabChanged', this.tabChanged );
			this.on( 'click', '[data-action="showCCForm"]', this.showCCForm );
			this.on( 'change', '#elSelect_stock_action', this.stockAction );
		},

		/**
		 * Shows the form fields for to/cc/bcc
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		showCCForm: function (e) {
			e.preventDefault();
			this.scope.find('[data-role="sendToInfo"]').hide();
			this.scope.find('[data-role="sendToForm"]').show();
			this.scope.find('#elInput_cc_wrapper').click();
		},

		/**
		 * When the reply form tabs are toggled between reply/note, toggles a class to enable styling on the nore form
		 *
		 * @param 	{event} 	e 	Event object
		 * @param 	{object} 	e 	Event data object from the tab widget
		 * @returns {void}
		 */
		tabChanged: function (e, data) {
			if( data.tab.attr('data-role') == 'noteTab' ){
				this.scope.addClass('cNexusSupportForm_note');
			} else {
				this.scope.removeClass('cNexusSupportForm_note');
			}
		},

		/**
		 * Stock action event handler - adds a reply and/or changes the form controls automatically
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		stockAction: function (e) {
			var self = this;
			var val = $( e.currentTarget ).val();
			var action = this.scope.find('#elSupportReplyForm').attr('action');

			ips.getAjax()( action + '&stockActionData=' + val, { showLoading: true } )
				.done( function (response) {
					if( _.isObject( response ) ){
						_.each( response, function (value, key) {
							if( key === 'message' ){
								CKEDITOR.instances.message.setData( value );
							} else {
								self.scope.find( '[name="' + key + '"]' ).val( value );
							}
						});

						// Set the focus to the submit button for ease of use
						self.scope.find('[data-role="primarySubmit"]').focus();
					}
				})
				.fail( function (response) {
					ips.ui.alert.show( {
						type: 'alert',
						icon: 'warn',
						message: ips.getString('support_ajax_error'),
					});
				});

		}
	});
}(jQuery, _));