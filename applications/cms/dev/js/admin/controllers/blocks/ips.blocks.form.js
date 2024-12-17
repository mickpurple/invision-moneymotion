/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.blocks.form.js
 *
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('cms.admin.blocks.form', {

		initialize: function () {
			this.on( 'change', '#elSelect_block_template_use_how', this.toggle );
			this.on( 'click', '[data-role=viewTemplate]', this.viewTemplate );
			
			$('#elCodemirror_block_content-input').attr('loaded', 'false');
		},
		
		/**
		 * View a template. As the title of the method suggests.
		 *
		 * @param	{event} 	e 	Event object
		 * @returns {void}
		 */
		viewTemplate: function (e) {
			var span = $( e.currentTarget );
			
			if ( !_.isUndefined( this.scope.find('input[name=block_plugin_app]').val() ) )
			{
				var appOrPlugin = '&block_app=' + this.scope.find('input[name=block_plugin_app]').val();
			}
			else
			{
				var appOrPlugin = '&block_plugin=' + this.scope.find('input[name=block_plugin_plugin]').val();
			}
			
			var dialogRef = ips.ui.dialog.create({
				title: this.scope.find('input[name=block_plugin]').val(),
				url: '?app=cms&module=pages&controller=ajax&do=loadTemplate&show=modal&t_location=block' + appOrPlugin + '&block_key=' + this.scope.find('input[name=block_plugin]').val() + '&t_key=' + this.scope.find('#elSelect_block_template_id').val(),
				forceReload: true,
				remoteSubmit: true
			});
				
			dialogRef.show();
		},

		/**
		 * Toggle event handler
		 *
		 * @param	{event} 	e 	Event object
		 * @returns {void}
		 */
		toggle: function (e) {
			var thisToggle = $( e.currentTarget );
			
			if ( thisToggle.val() === 'copy' && $('#elCodemirror_block_content-input').attr('loaded') == 'false' )
			{
				var save = { 't_location': 'block', 't_key': this.scope.find('#elSelect_block_template_id').val(), 'block_key': this.scope.find('input[name=block_plugin]').val(), 'block_app': this.scope.find('input[name=block_plugin_app]').val() };
				var self = this;
				
				ips.getAjax()( '?app=cms&module=pages&controller=ajax&do=loadTemplate&show=json&noencode=1', {
					dataType: 'json',
					data: save,
					type: 'post'
				} )
					.done( function (response) {
						/* Update codemirror */
						$('#elCodemirror_block_content-input').data('CodeMirrorInstance').setValue( response.template_content );
						$('input[name=template_params]').val( response.template_params );
						$('#elCodemirror_block_content-input').attr('loaded', 'true');
					});
			}
		}
	});
}(jQuery, _));