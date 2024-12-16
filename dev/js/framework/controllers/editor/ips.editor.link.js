/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.editor.link.js - Controller for link panel in editor
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.editor.link', {
		
		_typingTimer: null,
		_textTypingTimer: null,
		_ajaxObj: null,
		
		initialize: function () {
			this.on( 'submit', 'form', this.formSubmit );
			this.on( 'click', '.cEditorURLButtonInsert', this.formSubmit );
			this.on( 'click', '[data-action="linkRemoveButton"]', this.removeLink );

			this.scope.find('[data-role="linkURL"]').focus();
		},

		/**
		 * Event handler for submitting the form
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		formSubmit: function (e) {
			e.preventDefault();
			this.insertLink(e);
		},

		/**
		 * Event handler for 'insert' url button
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		insertLink: function (e) {
			var url = this.scope.find('[data-role="linkURL"]').val().replace(/'/g, '%27').replace(/"/g, '%22').replace(/</g, '%3C').replace(/>/g, '%3E');
			
			if ( !url ) {
				$(this.scope).find('.ipsFieldRow.ipsFieldRow_fullWidth').addClass('ipsFieldRow_error');
				return;
			} else {
				$(this.scope).find('.ipsFieldRow.ipsFieldRow_fullWidth').removeClass('ipsFieldRow_error');
			}

			$(this.scope).find('.elLinkError').remove();

			if ( !url.match( /^[a-z]+\:\/\//i ) && !url.match( /^mailto\:/i ) && !url.match( /^\#/ ) ) {
				url = 'http://' + url.replace( /^\/*/, '' );
			}
			
			var editor = CKEDITOR.instances[ $( this.scope ).data('editorid') ];
			var selection = editor.getSelection();

			if ( !_.isUndefined( editor._linkBookmarks) ) {
				selection.selectBookmarks( editor._linkBookmarks );
				delete editor._linkBookmarks;
			}
			
			var selectedElement = selection.getSelectedElement();
			if ( selectedElement && selectedElement.is('img') ) {
				var selectedElement = $( selection.getSelectedElement().$ );

				if( !selectedElement.parent().is('a') )
				{
					var element = CKEDITOR.dom.element.createFromHtml( "<a href='" + url + "'>" + selectedElement[0].outerHTML + "</a>" );

					editor.insertElement( element );
				}
				else
				{
					selectedElement.parent().attr( 'href', url ).removeAttr('data-cke-saved-href');
				}
				this.scope.find('input.cEditorURL').val('');
				this.trigger('closeDialog');
			} else if ( selectedElement && ( selectedElement.is('a') && $( selection.getSelectedElement().$ ).children().is('img') ) ) { 
				selectedElement.setAttribute( 'href', url ).removeAttribute('data-cke-saved-href');

				this.scope.find('input.cEditorURL').val('');
				this.trigger('closeDialog');
			} else {
				if ( $( this.scope ).data('image') ) {
					
					this.scope.find('[data-role="linkURL"]').addClass('ipsField_loading');
					this.scope.find('[data-action="linkButton"]').prop('disabled', true);
					
					var scope = this.scope;
					var self = this;
					
					var img = new Image();
					img.onerror = function(){
						scope.find('[data-role="linkURL"]').removeClass('ipsField_loading');
						scope.find('[data-action="linkButton"]').prop('disabled', false);
						scope.find('.ipsFieldRow.ipsFieldRow_fullWidth').addClass('ipsFieldRow_error');
					};
					img.onload = function(){
						
					    var ajaxUrl = editor.config.controller + '&do=validateLink'
						if ( $(this.scope).attr('data-image') ) {
							ajaxUrl += '&image=1';
						}
						
						ips.getAjax()( ajaxUrl, {
							data: {
								url: url,
								width: img.width,
								height: img.height,
								image: 1
							},
							type: 'post'
						})
						.done(function( response ){
							if ( response.embed ) {
								scope.find('[data-role="linkURL"]').removeClass('ipsField_loading');
								scope.find('[data-action="linkButton"]').prop('disabled', false);
								scope.find('input.cEditorURL').val('');
								editor.insertHtml( response.preview );
								self.trigger('closeDialog');
							} else {
								scope.find('[data-role="linkURL"]').removeClass('ipsField_loading');
								scope.find('[data-action="linkButton"]').prop('disabled', false);
								scope.find('.ipsFieldRow.ipsFieldRow_fullWidth').addClass('ipsFieldRow_error');

								if( !_.isUndefined( response.errorMessage ) )
								{
									scope.find('.ipsFieldRow.ipsFieldRow_fullWidth').append( "<span class='elLinkError ipsType_warning'>" + response.errorMessage + "</span>" );
								}
							}
						})
						.fail(function(){
							scope.find('[data-role="linkURL"]').removeClass('ipsField_loading');
							scope.find('[data-action="linkButton"]').prop('disabled', false);
							scope.find('.ipsFieldRow.ipsFieldRow_fullWidth').addClass('ipsFieldRow_error');
						});
					}
					img.src = url;
				} else {
					// Normal link
					if( this.scope.find('[data-role="linkText"]').length )
					{
						var title = this.scope.find('[data-role="linkText"]').val().replace( / {2}/g,' &nbsp;' );
						if ( !title ) {
							title = decodeURI( url );
						}
						title = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

						var element = CKEDITOR.dom.element.createFromHtml( "<a>" + title + "</a>" );
					}
					// Something (i.e. an img tag) is selected
					else
					{
						element = selectedElement;
					}

					element.setAttribute( 'href', url );

					editor.insertElement( element );
					this.scope.find('input.cEditorURL').val('');
					this.trigger('closeDialog');
				}
			}
		},
		
		/**
		 * Event handler for remove link button
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		removeLink: function (e) {			
			e.preventDefault();
			e.stopPropagation();
			
			var editor = CKEDITOR.instances[ $( this.scope ).data('editorid') ];
			editor.focus();
			editor.execCommand( 'ipsLinkRemove' );
			
			this.trigger('closeDialog');
			
		},
	});
}(jQuery, _));