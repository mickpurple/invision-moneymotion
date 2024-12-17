/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.templates.variablesDialog.js - Controller for the variables dialog
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	const regex = /[^a-z0-9_]+|^[^a-z_]/gi;

	ips.controller.register('cms.admin.templates.variablesDialog', {

		initialize: function () {
			this.on( 'blur', '[data-role="title"]', this.checkTitle );
			this.on( 'click', 'input[type="submit"]', this.submitChange );
		},

		/**
		 * Check the template title for spaces
		 * @param e
		 */
		checkTitle: function (e) {
				var elem = $( e.currentTarget );
				var val = elem.val();

				if ( val.match(regex) ) {
					elem.val( val.replaceAll( regex, '' ) );
					ips.ui.alert.show({
						type: 'alert',
						message: ips.getString('template_title_desc'),
						icon: 'warn'
					});
				}
		},

		/**
		 * Event handler called when the submit button within the dialog is clicked
		 * Fires an event that the editor controller can respond to
		 *
		 * @param	{event} 	e 	Event object
		 * @returns {void}
		 */
		submitChange: function (e) {

			var key = this.scope.find('[name="_variables_fileid"]').val();
			$('[data-fileid="' + key + '"]')
				.attr('data-state', 'unsaved')
				.find('[data-action="closeTab"]')
				.html( ips.templates.render('templates.editor.unsaved') );

			this.trigger( 'variablesUpdated.templates', {
				fileID: this.scope.find('[name="_variables_fileid"]').val(),
				value: this.scope.find('[data-role="variables"]').val(),
				title: this.scope.find('[data-role="title"]').val(),
				description: this.scope.find('[data-role="description"]').val(),
				container: this.scope.find('[data-role="container"]').val(),
				group: this.scope.find('[data-role="group"]:not(.ipsHide)').val()
			});

			this.trigger( 'closeDialog' );
		}
	});
}(jQuery, _));