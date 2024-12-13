/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.multimod.js - Controller for moderation actions in support requests
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.multimod', {
		
		initialize: function () {
			this.on( 'submit', '[data-role="moderationTools"]', this.moderationSubmit );
		},
			
		/**
		 * Event handler called when the moderation bar submits
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		moderationSubmit: function (e) {
			
			var action = this.scope.find('[data-role="moderationAction"]').val();

			switch (action) {
				case 'delete':
					this._modActionDelete(e);
				break;
				case 'split':
					this._modActionDialog(e, 'split', 'wide');
				break;
				default:
					 $( document ).trigger('moderationSubmitted');
				break;
			}
		},

		/**
		 * Handles a delete action from the moderation bar
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		_modActionDelete: function (e) {
			var self = this;
			var form = this.scope.find('[data-role="moderationTools"]');

			if( self._bypassDeleteCheck ){
				return;
			}

			e.preventDefault();

			// How many are we deleting?
			var count = parseInt( this.scope.find('[data-role="moderation"]:checked').length );

			ips.ui.alert.show( {
				type: 'confirm',
				icon: 'warn',
				message: ( count > 1 ) ? ips.pluralize( ips.getString( 'delete_confirm_many' ), count ) : ips.getString('delete_confirm'),
				callbacks: {
					ok: function () {
                        $( document ).trigger('moderationSubmitted');
						self._bypassDeleteCheck = true;
						self.scope.find('[data-role="moderationTools"]').submit();
					}
				}
			});
		},

		/**
		 * Handles a move/split action from the moderation bar
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		_modActionDialog: function (e, title, size) {
			e.preventDefault();
			
			var form = this.scope.find('[data-role="moderationTools"]');
			
			// Create dialog to show the form
			var moveDialog = ips.ui.dialog.create({
				url: form.attr('action') + '&' + form.serialize().replace( /%5B/g, '[' ).replace( /%5D/g, ']' ),
				modal: true,
				title: ips.getString(title),
				forceReload: true,
				remoteVerify: false,
				size: size
			});
			$( form ).data('_dialog', moveDialog );

			moveDialog.show();
			$( document ).trigger('moderationSubmitted');
		}
	});
}(jQuery, _));