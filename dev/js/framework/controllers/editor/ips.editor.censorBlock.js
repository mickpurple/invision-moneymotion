/**
 * IPS Social Suite 4
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.editor.censorBlock.js - Controller for the censor block feature
 *
 * Author: Matt Mecham
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.editor.censorBlock', {

		initialize: function () {
			/* Set up case-insensitive matching */
			jQuery.expr[':'].icontains = function(a, i, m) {
				return jQuery(a).text().toUpperCase()
					.indexOf(m[3].toUpperCase()) >= 0;
			};			

			this._words = $.parseJSON( this.scope.attr('data-censorBlockWords') );
			this._editorId = $( this.scope ).data('editorid');
			
			this.on( document, 'editorWidgetInitialized', this.setup );
		},
		_editorId: null,
		_editor: null,
		
		/**
		 * Perform some set up after the editor has initialised
		 *
		 */
		setup: function (e) {
			this._editor = CKEDITOR.instances[ this._editorId ];
			this._form = $( this._editor.container.$ ).closest('form');
			
			/* Add submit listener */
			this._form.on( 'submit', this.checkCensorBlock.bind(this) );
		},

		/**
		 * Sanitize HTML
		 * @param {string} html
		 */
		sanitizeHtml: function( html ) {
			return ( new DOMParser() ).parseFromString( html, 'text/html' ).body;
		},

		/**
		 * On form submit, check the contents for any words we want to block
		 *
		 */
		checkCensorBlock: function (e) {
			if ( this._words.length ) {
				this._editor.updateElement();
				var value = this._editor.getData();
				var found = 0;

				this.scope.find('[data-role="editorCensorBlockMessageInternal"]').html( value );
				var display = this.scope.find('[data-role="editorCensorBlockMessageInternal"]');
				/* Knock out quote/code blocks, so we effectively ignore them then force into text to remove everything else */
				$( display ).html(
					XRegExp.replace( $( display ).html(), new RegExp( "<(pre|blockquote).+?</\\1>", "sig" ), '' )
				);

				// Sanitize it to ensure malicious code is removed
				const clean = this.sanitizeHtml( $(display).text() );
				$( display ).html( '' );
				clean.childNodes.forEach(node => $(display).append(node));

				found = 0;
				var index = 0;
				var exactWords = [];
				var looseWords = [];
				var reggie = null;
				for( var i in this._words ) {
					var word = this._words[i]['word'];
					var type = this._words[i]['type'];
					if( $( value ).is(':icontains("' + word + '")' ) ){
						if ( type == 'exact' ) {
							exactWords.push( word );
						}
						else {
							looseWords.push( word );
						}
					}
				}

				if ( looseWords.length && exactWords.length ) {
					reggie = new RegExp( "((?:\\b|\\s|^)([^\\b]*" + looseWords.join('|') + "[^\\b]*)(?:\\b|\\s|$)|(?:\\b|\\s|^)(" + exactWords.join('|') + ")(?:\\b|\\s|$))", "ig" );
				} else if ( looseWords.length ) {
					reggie = new RegExp( "(?:\\b|\\s|^)([^\\b]*" + looseWords.join('|') + "[^\\b]*)(?:\\b|\\s|$)", "ig" );
				} else if ( exactWords.length ) {
					reggie = new RegExp( "(?:\\b|\\s|^)(" + exactWords.join('|') + ")(?:\\b|\\s|$)", "ig" );
				}
				Debug.log(reggie);
				if ( $(value).text().match( reggie ) ) {
					$(display).each( function() {
						$( this ).contents().filter(
							function() { return this.nodeType === 3 }
						).each( function(){
							$(this).replaceWith( _.escape( XRegExp.replace( $( this ).text(), reggie, '<mark class="ipsMatchWarning ipsType_bold ipsType_large ipsMatch' + ( index ) + '">' + "$1" + '</mark>' ) ).replace( new RegExp("&lt;mark class=&quot;ipsMatchWarning ipsType_bold ipsType_large ipsMatch" + ( index ) + "&quot;&gt;", 'ig'), "<mark class='ipsMatchWarning ipsType_bold ipsType_large ipsMatch" + ( index ) + "'>" ).replace( new RegExp("&lt;/mark&gt;", 'ig'), "</mark>" ).trim() );
						} );
						found++;
					} );
				}
			}

			if ( found > 0 ) {
				e.preventDefault();
				this._form.find('input[type="submit"],button[type="submit"]').prop( 'disabled', false );
				$(display).html( XRegExp.replace( $( display ).html(), new RegExp( "((\s+?)?(\r\n|\r|\n)(\s+?)?){1,}", "g" ), '<br><br>' ) );
				this.scope.show();
				var elemPosition = ips.utils.position.getElemPosition( this.scope );

				// Is it on the page?
				var windowScroll = $( window ).scrollTop();
				var viewHeight = $( window ).height();

				// Only scroll if it isn't already on the screen
				if( elemPosition.absPos.top < windowScroll || elemPosition.absPos.top > ( windowScroll + viewHeight ) ){
					$('html, body').animate( { scrollTop: elemPosition.absPos.top + 'px' } );
				}

				return false;
			} else {
				this.scope.find('[data-role="editorCensorBlockMessage"]').html('<div data-role="editorCensorBlockMessageInternal"></div>');
				this.scope.hide();
				return true;
			}
		},
	});
}(jQuery, _));