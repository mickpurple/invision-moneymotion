/**
 * IPS Social Suite 4
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.editor.stockReplies.js - Controller for editor templates/saved replies
 *
 * Author: Matt Mecham
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.editor.stockReplies', {

		initialize: function () {
			this.on( 'click', '.ipsStockReplies_row', this.insertTemplate );
			this.on( document, 'menuOpened', this.menuOpened );
			this.setup();
		},
		
		setup: function () {
			this._editorId = $( this.scope ).data('editorid');
			this._editor = CKEDITOR.instances[ this._editorId ];
		},
		
		insertTemplate: function(e)
		{
			e.stopPropagation();
			e.preventDefault();
			
			var template = $( e.target );
			var _self = this;
			ips.getAjax()( this._editor.config.controller + '&do=storedReplies&id=' + template.attr('data-templatesId'), {
				type: 'POST'
			} ).done( function (response) {
				if ( ! response.error )
				{
				   _self._editor.insertElement( CKEDITOR.dom.element.createFromHtml( '<div>' + response.reply + '</div>') );
				}
			} );
			
			this.scope.trigger( 'closeMenu' );
		},

		/**
		 * Event handler called when the emoticons menu is opened.
		 * Initializes the menu if it hasn't already been done
		 *
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		menuOpened: function (e, data) {
			if( data.menu.attr('data-controller') == 'core.global.editor.stockReplies' ){
				setTimeout(function(){
					var resultsbox = this.scope.find('[data-role="stockRepliesLoading"]');
					if ( resultsbox.hasClass('ipsLoading') ) {
						var _self = this;
						ips.getAjax()( this._editor.config.controller + '&do=storedReplies', {
							type: 'POST'
						} ).done( function (response) {
							var data   = response;
							var result = '';
							if ( data.error )
							{
							   result = data.error;
							}
							else
							{
								_.each( data, function (template) {
									result += ips.templates.render('core.editor.editorStockRepliesRow', {
										title: template.title,
										id: template.id
									} );
								} );
								
							}
											
							resultsbox.removeClass('ipsLoading').html( ips.templates.render('core.editor.editorStockRepliesWrap', { content: result } ) );
						} );
					}
				}.bind(this),100);
			}
		},
	});
}(jQuery, _));