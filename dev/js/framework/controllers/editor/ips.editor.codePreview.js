/**
 * IPS Social Suite 4
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.editor.codePreview.js - Codemirror preview panel
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.editor.codePreview', {

		_origin: '',

		initialize: function () {
			this.on( 'click', '[data-action="preview"]', this.fetchPreview );
		},

		fetchPreview: function (data) {
			var scope = $(this.scope);
			$('#' + scope.attr('data-name') + '_preview').addClass('ipsLoading').html('');
			ips.getAjax()( scope.attr('data-preview-url'), {
				type: 'POST',
				data: {
					'value': scope.find('textarea').data('CodeMirrorInstance').getValue()
				}
			} ).done( function (response) {
				$('#' + scope.attr('data-name') + '_preview').removeClass('ipsLoading').html( response );
			});
		}
	});
}(jQuery, _));