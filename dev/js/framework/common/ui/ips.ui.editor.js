/* global ips, _, CKEDITOR */
/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.ui.editor.js - Editor widget
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.createModule('ips.ui.editor', function(){
		
		var defaults = {
			allbuttons: false,
			postKey: '',
			toolbars: '',
			extraPlugins: '',
			contentsCss: '',
			minimized: false,
			autoSaveKey: null,
			skin: 'ips',
			autoGrow: true,
			pasteBehaviour: 'rich',
			autoEmbed: true,
			controller: null,
			defaultIfNoAutoSave: false,
			minimizeAfterReset: false
		};
		
		/**
		 * Respond method, sets up the editor widget.
		 * Loads the CKEditor libraries, then boots the editor
		 *
		 * @param	{element} 	elem 		The element this widget is being created on
		 * @param	{object} 	options 	The options passed into this instance
		 * @returns {void}
		 */
		var respond = function (elem, options) {
			
			var loadTries = 0;
			
			var fileToLoad = ips.getSetting('useCompiledFiles') !== true ? 'core/dev/ckeditor/ckeditor.js' : 'core/interface/ckeditor/ckeditor/ckeditor.js';
						
			if ( !options.minimized || ips.getSetting('memberID') ) {
				ips.loader.get([fileToLoad]).then( bootEditor );
			} else {
				$( elem ).data('_editorInit', function( callback ) {
					$( elem ).find('.ipsComposeArea_dummy').html( ips.templates.render('core.editor.initLoading') );
					ips.loader.get([fileToLoad]).then( function(){
						bootEditor( callback );
					} );
				});
				$( elem ).find('.ipsComposeArea_dummy').show().on('focus', function(){
					$( elem ).data('_editorInit')( function( instance ){
						instance.unminimize( function() {
								/* If this is guest posting, there'll be an email (for post-before-register) or text (for name) field, so focus that */
								var inputs = elem.closest('.ipsComposeArea').find('input[type="text"], input[type="email"]');
								if ( inputs.length ) {
									inputs[0].focus();
								}
								/* Otherwise focus the editor itself */
								else {
									instance.focus();
								}
							});
						});
				} ).end().find('[data-role="mainEditorArea"]').hide().end().closest('.ipsComposeArea').addClass('ipsComposeArea_minimized').find('[data-ipsEditor-toolList]').hide();
			}

			/**
			 * Wrapper function that ensures we don't try and boot ckeditor until the library is ready
			 *
			 * @returns {void}
			 */
			function bootEditor ( callback ) {
				if( ( !CKEDITOR || _.isUndefined( CKEDITOR.on ) ) && loadTries < 60 ){ // We'll wait 3 seconds for it to init
					loadTries++;
					setTimeout( bootEditor, 50 );
					return;
				}

				if( CKEDITOR.status == 'loaded' ){
					ckLoaded( callback );
				} else {
					CKEDITOR.on( 'loaded', function () {
						ckLoaded( callback );		
					});	
				}
			};

			/**
			 * The function that actually initializes the editor on our widget element
			 *
			 * @returns {void}
			 */
			function ckLoaded ( callback ) {
				if( !$( elem ).data('_editor') ){
					var editor = editorObj( elem, _.defaults( options, defaults ) );
					$( elem ).data('_editor', editor );
					editor.init( callback );
				}
			};
		},

		/**
		 * Destruct the editor
		 *
		 * @param	{element} 	elem 		The element to check
		 * @returns {void}
		 */
		destruct = function (elem) {
			var obj = getObj( elem );
			
			if( !_.isUndefined( obj ) ){
				obj.destruct();
			}
		},

		/**
		 * Retrieve the editor instance (if any) on the given element
		 *
		 * @param	{element} 	elem 		The element to check
		 * @returns {mixed} 	The editor instance or undefined
		 */
		getObj = function (elem) {
			if( $( elem ).data('_editor') ){
				return $( elem ).data('_editor');
			}
			
			return undefined;
		},
		
		/**
		 * Retrieve the editor instance (if any) on the given element, initiating it if it isn't already
		 *
		 * @param	{element} 	elem 		The element to check
		 * @returns {void} 
		 */
		getObjWithInit = function ( elem, callback ) {
			var obj = this.getObj( elem );
			if ( obj ) {
				callback( obj );
			} else {
				var initFunction = $( elem ).data('_editorInit');
				if ( initFunction ) {
					initFunction( callback );
				}
			}
		};

		ips.ui.registerWidget('editor', ips.ui.editor, 
			[ 'allbuttons', 'postKey', 'toolbars', 'extraPlugins', 'autoGrow', 'contentsCss', 'minimized', 'minimizeAfterReset', 'autoSaveKey', 'skin', 'name', 'pasteBehaviour', 'autoEmbed', 'controller', 'defaultIfNoAutoSave', 'ipsPlugins' ]
		);
		
		return {
			respond: respond,
			getObj: getObj,
			getObjWithInit: getObjWithInit,
			destruct: destruct
		};
	});

	/**
	 * Editor instance
	 *
	 * @param	{element} 	elem 		The element this widget is being created on
	 * @param	{object} 	options 	The options passed into this instance
	 * @returns {void}
	 */
	var editorObj = function (elem, options) {
		
		var changePolled = false;
		var instance = null;
		var hiddenAtStart = false;
		var minimized = options.minimized;
		var hiddenInterval = null;
		var size = 'phone';
		var name = '';
		var previewIframe = null;
		var currentPreviewView = '';
		var previewInitialHeight = 0;
		var previewSizes = {
			phone: 375,
			tablet: 780
		};
						
		/**
		 * Initializes ckeditor
		 *
		 * @returns void
		 */
		var init = function (callback) {
			
			// CKEditor automatically removes inline tags which do not have any content (which is sensible) but for some weird reason,
			// Google Adsense uses <ins> (which is supposed to be for indicating text that has been inserted into a document) to pass
			// variables to itself. CKEditor sees this empty tag as meaningless (which, in an actual document it would be) and removes
			// it. See https://dev.ckeditor.com/ticket/12397 for the (closed without fix) bug report
			// To work around this, this line just removes <ins> from the list of tags CKEditor will remove if empty.
			delete CKEDITOR.dtd.$removeEmpty['ins'];

			// Similarly many people use <i> tags to insert font-awesome icons, but an empty <i> tag will get stripped. Let's allow those too.
			delete CKEDITOR.dtd.$removeEmpty['i'];
						
			// Build config
			var config = {
				// We totally bypass CKEditor's ACF because custom plugins can add anything. HTMLPurifier will later remove anything we don't want
				allowedContent: true,
				// LTR or RTL
				contentsLangDirection: $('html').attr('dir'),
				// Don't disable the browser's native spellchecker
				disableNativeSpellChecker: false,
				// Adds IPS-created plugins
				extraPlugins: options.ipsPlugins,
				// Autosave key
				ipsAutoSaveKey: options.autoSaveKey,
				ipsDefaultIfNoAutoSave: options.defaultIfNoAutoSave,
				// Behaviour for pasting
				ipsPasteBehaviour: options.pasteBehaviour,
				// Auto emebed?
				ipsAutoEmbed: options.autoEmbed,
				// The default configuration removes underline and other buttons, but we want to control that ourselves
				removeButtons: '',
				// The skin
				skin: options.skin,
				// Autogrow
				height: 'auto',
				// Title for tooltip
				title: window.navigator.platform == 'MacIntel' ? ips.getString('editorRightClickMac') : ips.getString('editorRightClick'),
				// controller
				controller: options.controller
			};
			
			/* Paste behaviour. If we are forcing paste as plaintext, set that... */
			if ( options.pasteBehaviour == 'force' ) {
				config.pasteFilter = 'plain-text';
			}
			/* Otherwise it's a bit complicated... */
			else {
				/* If this is a Webkit browser, pasted data contains lots of inline styles which, if we allow to be pasted, can make the content unable to be formatted
					(this is documented http://docs.ckeditor.com/#!/guide/dev_drop_paste and reported in IPS bug tracker #13006) so we need to filter it. CKEditor does
					have a special option ("semantic-content") for this, which is their default on Webkit, but this excludes colors and other styles users might reasonably use,
					so what we're doing here is emulating CKEditor's semantic-content filter, but also allowing some basic styles */
				if ( CKEDITOR.env.webkit ) {
					var tags = [];
					for ( var tag in CKEDITOR.dtd ) {
						if ( tag.charAt( 0 ) != '$' ) {
							tags.push(tag);
						}
					}
					config.pasteFilter = tags.join(' ') + '[*]{background-color,border*,color,padding,text-align,vertical-align,font-size}';
				}
				/* On other browsers we can trust them to paste sensible data */
				else {
					config.pasteFilter = null;
				}
			}
			

			// http://dev.ckeditor.com/ticket/13713
			if( !/iPad|iPhone|iPod/.test( navigator.platform ) ){
				config.removePlugins = 'elementspath';
			}
			
			if ( ips.getSetting('ipb_url_filter_option') == 'none' && ips.getSetting('url_filter_any_action') == 'moderate' && ips.getSetting('bypass_profanity') == 0 ) {
				config.removePlugins = 'ipslink';
			}

			name = $( elem ).find('textarea').attr('name');

			// Let the documnt know whether we can actually use the editor
			$( elem ).trigger('editorCompatibility', {
				compatible: CKEDITOR.env.isCompatible
			});

			if( options.minimized && minimized ){
				$( elem )
					.find('.ipsComposeArea_dummy')
						.show()
						.on('focus click', function(e) {
							$( this ).off('focus click'); // Ensure these events only fire once

							unminimize( function() {
								focus();
							});			
						})
					.end()
					.find('[data-role="mainEditorArea"]')
						.hide()
					.end()
					.closest('.ipsComposeArea')
						.addClass('ipsComposeArea_minimized')
						.find('[data-ipsEditor-toolList]')
							.hide();

				// Let other controllers initialize us
				$( document ).on( 'initializeEditor', _initializeEditor );

				minimized = true;
			}

			// If we aren't visible, we'll need to reinit when we show so that
			// we can get the correct width to show the buttons
			if( !elem.is(':visible') ){
				hiddenAtStart = true;

				// If it's minimized, we don't need to do anything - we'll check the size
				// again when we unminimize. When we're already full size, we need to run
				// an interval to check the visibility.
				if( !options.minimized && !minimized ){
					clearInterval( hiddenInterval );

					hiddenInterval = setInterval( function () {
						if( elem.is(':visible') ){
							clearInterval( hiddenInterval );
							resize(false);
							hiddenAtStart = false;
						}
					}, 400);
				}
			}
			
			// Language
			var language = $('html').attr('lang').toLowerCase();
			if ( !CKEDITOR.lang.languages[language] ) {
				var language = language.substr( 0, 2 );
				if ( CKEDITOR.lang.languages[language] ) {
					config.language = language;
				}
			} else {
				config.language = language;
			}
			
			// Toolbars
			if( !options.allbuttons ){
				var toolbars = $.parseJSON( options.toolbars );
				var width = elem.width();
				if ( width > 700 ) {
					size = 'desktop';
				} else if ( width > 400 ) { 
					size = 'tablet';
				}
				
				config.toolbar = toolbars[ size ];
			} else {
				config.removePlugins = 'sourcearea';
			}
			
			// Extra plugins
			if( options.extraPlugins !== true ){
				config.extraPlugins += ',' + options.extraPlugins;
			}
			
			if ( ips.getSetting('cloud2') ) {
				var addPlugins, i;
				if( options.extraPlugins !== true ){
					addPlugins = options.extraPlugins.split(',');
					
					for( i = 0; i < addPlugins.length; i++ ) {
						CKEDITOR.plugins.addExternal( addPlugins[i], '/ckeditor_custom/' + addPlugins[i] + '/' );
					}
				}
				
				/* These are the default we ship with, so will always be in interface/ckeditor */
				if( options.skin !== 'ips' && options.skin !== 'moono' ) {
					config.skin = options.skin + ',/ckeditor_custom/skin_' + options.skin + '/';
				}
			}
			
			// Actually initiate
			// 01/05/16 - Changed to replacing a dom node instead of form field name here
			// because in some places we use the same field name multiple times on the page
			// e.g. editing posts in a topic. Using a string name broke the second editor.
			instance = CKEDITOR.replace( $( elem ).find('textarea').get(0), config );
			
			instance.once('instanceReady', function(){
				// Disable grammarly as it confuses CKEditor DOM- test re-enable 4.7.7
				//$( instance.container.$ ).find('div.cke_wysiwyg_div').attr( 'data-gramm', 'false' );
		
				elem.trigger( 'editorWidgetInitialized', { id: name } );
				
				// Saved editor content might have lazy load attributes.
				// We won't bother observing editors, just swap out the content now
				ips.utils.lazyLoad.loadContent( elem );

				// Any other callback?
				if( _.isFunction( callback ) ){
					callback( this );
				}
			}.bind(this));

			// Focus event handling
			let focusTimeout;

			instance.on('focus', function () {
				_checkFocusState();
				focusTimeout = setInterval( _checkFocusState, 2000 );
			});

			instance.on('blur', function () {
				_triggerBlurEvent();
				clearInterval(focusTimeout);
			}.bind(this));

			const _checkFocusState = () => {
				if( !instance.focusManager.hasFocus ){
					clearInterval(focusTimeout);
					return;
				}

				_triggerFocusEvent()
			};

			const _triggerFocusEvent = () => elem.trigger('editor.focused', { elem });
			const _triggerBlurEvent = () => elem.trigger('editor.blurred', { elem });

			// Set listener to apply ratio to images and replace any lazy loaded 
			// content after insertHtml is called directly on the CKEditor (not to 
			// be confused with ips.ui.editor.insertHtml)
			instance.on('afterInsertHtml', function (e) {
				$( instance.container.$ ).find('img:not([data-ratio])').each( function () {
					ips.utils.lazyLoad.applyLazyLoadAttributes( this );
				});

				ips.utils.lazyLoad.loadContent( instance.container.$ );
			});

			// Resize the editor as the element resizes
			if( !options.allbuttons ){
				$( window ).on( 'resize', resize );
			}
			
			// When we delete a file from the uploader, we need to remove it from the editor
			$( document ).on( 'fileDeleted', _deleteFile );
			
			// And listen for emoticon inserts
			$( document ).on( 'insertEmoji', _insertEmoji );

			// Editor preview
			$( elem ).on( 'togglePreview', _togglePreview );
			$( window ).on( 'message', _previewMessage );
			
			// Have a jolly good clear out of old editor saves
			_cleanUpStaleAutoSaves();
		};
		
		/**
		 * Remove old auto saves if they've been there for more than 3 days
		 *
		 * @returns void
		 */
		var _cleanUpStaleAutoSaves = function() {
			var keys = ips.utils.db.getByType('editorSave');
			
			$.each( keys, function(i)
			{
				try{
					// Older than 3 days, remove.
					if ( this[1] < Math.round( new Date().getTime() / 1000 ) - ( 86400 * 3 ) ) {
						ips.utils.db.remove( 'editorSave', i );
					}
				} catch( err ) {
					Debug.error("Trying to remove editorSave keys:");
					Debug.error( err );
				}
			} );
		};
		
		/**
		 * Destructs this object
		 *
		 * @returns void
		 */
		var destruct = function () {
			// Tell editor we are resetting
			instance.fire( 'resetOrDestroy' );

			try {
				if( instance.status == 'ready' ) {
					instance.destroy();
				} else {
					instance.on( 'instanceReady', function(){ instance.destroy(); } );
				}

				Debug.log("Destroyed editor instance");
			} catch (err) { 
				Debug.error("Editor destruct error:");
				Debug.error( err );

				// Turns out ckInstance.destroy() is not reliable and CKE doesn't clean itself up properly.
				// Manually removing listeners and then using CKEDITOR.remove is more reliable when dynamically creating/destroying instances.
				// See http://stackoverflow.com/questions/19328548/ckeditor-uncaught-typeerror-cannot-call-method-unselectable-of-null-in-emberj
				instance.removeAllListeners();
				CKEDITOR.remove( instance );
			}

			_offEvents();
		};

		/**
		 * Returns this instance of CKEditor
		 *
		 * @returns CKEDITOR.editor
		 */
		var getInstance = function () {
			if( instance ){
				return instance;
			}

			return null;
		};

		/**
		 * Stop listening to events for this editor
		 *
		 * @returns void
		 */
		var _offEvents = function () {
			$( window ).off( 'resize', resize );
			$( document ).off( 'fileDeleted', _deleteFile );
			$( document ).off( 'initializeEditor', _initializeEditor );
			$( document ).off( 'insertEmoji', _insertEmoji );
			$( elem ).off( 'togglePreview', _togglePreview );
			$( window ).off( 'message', _previewMessage );
		};

		/**
		 * Handles window resizes
		 *
		 * @returns void
		 */
		var resize = function (focus) {
			var width = elem.width();
			var newSize = 'phone';

			if ( width > 700 ) {
				newSize = 'desktop';
			} else if ( width > 400 ) { 
				newSize = 'tablet';
			}
			
			if ( newSize != size ) {
				size = newSize;
				instance.destroy();
				_offEvents(); // Stop listening to all events that init is about to set up again

				init( function () {
					if( focus ){
						instance.focus();
					}	
				});
			}
		};

		/**
		 * Focus
		 *
		 * @returns void
		 */
		var focus = function () {
			instance.focus();
		};
		
		/**
		 * Unminimize
		 *
		 * @param	{callback}	callback	Function to run after unminimized
		 * @returns void
		 */
		var unminimize = function ( callback ) {
			if( !_.isFunction(callback) ){
				callback = $.noop;
			}

			if( minimized ){
				var _unminimize = function () {
					// Hide the dummy area and show the actual editor
					$( elem )
						.find('.ipsComposeArea_dummy')
							.hide()
						.end()
						.find('[data-role="mainEditorArea"]')
							.show()
						.end()
						.closest('.ipsComposeArea')
							.removeClass('ipsComposeArea_minimized')
							.find('[data-ipsEditor-toolList]')
								.show();
					
					// Focus it. If it isn't ready yet, wait until it is
					if ( instance.status == 'ready' ) {
						minimized = false;
						callback();

						if( hiddenAtStart ){
							resize(true);
							hiddenAtStart = false;
						}
						
						instance.on( 'change', function(e) {
							if ( ! changePolled && _.isUndefined( ips.getSetting('isAcp') ) ) {
								changePolled = true;
								ips.getAjax()( elem.parentsUntil( '', 'form' ).attr('action'), { 
									'data': { 
										'usingEditor': 1
									} 
								} );
							}
						} );
					} else {
						instance.once( 'instanceReady', function(){
							minimized = false;
							callback();

							if( hiddenAtStart ){
								resize(true);
								hiddenAtStart = false;
							}
						});
					}
					
					// Load the upload area
					var minimizedUploader = $(elem).find('[data-ipsEditor-toolListMinimized]');
					if ( minimizedUploader.length ) {
						minimizedUploader.show();
						ips.getAjax()( elem.parentsUntil( '', 'form' ).attr('action'), { 
							'data': { 
								'getUploader': minimizedUploader.attr('data-name')
							} 
						})
							.done( function (response) {
								minimizedUploader.replaceWith( response );
								elem.trigger( 'uploaderReady', {} );
								$( document ).trigger( 'contentChange', [ elem ] );
							});
					}
				};

				// Some browsers will see a click on the editor toolbar after unminimizing.
				// Initially to fix this, we had a timeout on unminmizing the editor, but this then
				// meant iOS would not focus it (because that must happen as a response to a user action)
				// So, to solve both, the timeout is now placed here, and it works by setting the editor to 
				// readonly for 200ms when unminimizing when the user isn't using iOS
				if( !/iPad|iPhone|iPod/.test( navigator.platform ) ){
					//instance.setReadOnly( true );
					setTimeout( function () {
						_unminimize();
					}, 200);
				} else {
					_unminimize();
				}				
			} else {
				callback();
			}
		};

		/**
		 * Minimize
		 *
		 * @returns void
		 */
		var minimize = function () {
			if( !minimized ){
				$( elem )
					.find('.ipsComposeArea_dummy')
						.show()
					.end()
					.find('[data-role="mainEditorArea"]')
						.hide()
					.end()
					.closest('.ipsComposeArea')
						.addClass('ipsComposeArea_minimized')
						.find('[data-ipsEditor-toolList]')
							.hide();

				minimized = true;
			}
		};
		
		/**
		 * Insert quotes into editor
		 *
		 * @param 		{array} 	quotes 	Array of data objects (which should contain all of the properties necessary for a quote)
		 * @returns void
		 */
		var insertQuotes = function ( quotes ) {

			// Wrapper method for inserting quotes into the editor
			var _doInsert = function () {
				/* Now insert the posts */
				for ( var i = 0; i < quotes.length; i++ ) {
					var data = quotes[i];

					// Remove any lightboxes on the content (they'll be reapplied when viewing the quote)
					var regex = /data-ipsLightbox(-group)?="([\w]+)?"/ig;
					var html = data.quoteHtml.replace(regex, '');

					/* Build quote */
					var quote = $( ips.templates.render( 'core.editor.quote', { citation: ips.utils.getCitation( data ), contents: html } ) );
					var attrs = [ 'timestamp', 'userid', 'username', 'contentapp', 'contenttype', 'contentclass', 'contentid', 'contentcommentid' ];
					var j = 0;
					for ( j in attrs ) {
						if ( data[ attrs[j] ] ) {
							quote.attr( 'data-ipsQuote-' + attrs[j], data[ attrs[j] ] );
						}
					}
					
					/* Insert it */
					var element = CKEDITOR.dom.element.createFromHtml( $('<div>').append( quote ).html() );
					instance.setReadOnly( false );
					instance.insertElement( element );
					instance.widgets.initOn( element, 'ipsquote' );
					
					/* Insert a blank paragraph between multiple quotes */
					if ( i + 1 < quotes.length ) {
						var blankParagraph = new CKEDITOR.dom.element('p');
						( new CKEDITOR.dom.element( 'br' ) ).appendTo( blankParagraph );
						instance.insertElement( blankParagraph );
					}
				}
			};

			// If we are minimized, we will unminimize, then empty the editor contents, and then insert the quotes
			// If we aren't minimized, keep the existing content.
			if( minimized ){
				unminimize( function () {
					try {
						instance.setData('');
						elem.find('[data-role="autoSaveRestoreMessage"]').hide();
					} catch (err) {}
					
					_doInsert();
				});	
			} else {
				/* If we're up against another widget, insert a blank paragraph between them */
				var ranges = instance.getSelection().getRanges();
				for ( var i = 0; i < ranges.length; i ++ ) {
					var previousNode = ranges[i].getCommonAncestor( true, true ).getPrevious();
					if ( previousNode && previousNode.hasClass('cke_widget_wrapper') ) {
						var blankParagraph = new CKEDITOR.dom.element('p');
						( new CKEDITOR.dom.element( 'br' ) ).appendTo( blankParagraph );
						instance.insertElement( blankParagraph );
					}
				}

				_doInsert();
			}
		};
		
		/**
		 * Update a selected image
		 *
		 * @param	{number}		width	Width in pixels
		 * @param	{number}		height	Height in pixels
		 * @param	{string}		align	'left', 'right' or ''
		 * @param	{string}		url		URL to link to
		 * @param	{string}		alt		Image Alt Tag
		 * @returns	{void}
		 */
		var updateImage = function ( width, height, align, url, alt ) {
			var selection = instance.getSelection();
			var selectedElement = $( selection.getSelectedElement().$ );
			
			if ( url ) {
				if ( !url.match( /^[a-z]+\:\/\//i ) ) {
					url = 'http://' + url;
				}
				
				if ( selectedElement.parent().prop('tagName') === 'A' ) {
					selectedElement.parent().attr( 'href', url ).removeAttr('data-cke-saved-href');
				} else {
					selectedElement.wrap( $('<a>').attr( 'href', url ) );
				}
			} else {
				if ( selectedElement.parent().prop('tagName') === 'A' ) {
					selectedElement.parent().replaceWith( selectedElement );
				}
			}
															
			selectedElement.css({
				"width": width,
				"height": height
			});
			
			var alignClasses = 'ipsAttachLink_left ipsAttachLink_right';

			if ( align ) {
				if ( selectedElement.parent().prop('tagName') === 'A' ) {
					selectedElement.parent().css( 'float', align ).removeClass( alignClasses ).addClass('ipsAttachLink ipsAttachLink_' + align);
				} else {
					selectedElement.css( 'float', align ).removeClass( alignClasses ).addClass('ipsAttachLink_image ipsAttachLink_' + align);
				}
			} else {
				selectedElement.css( 'float', '' ).removeClass( alignClasses );
				if ( selectedElement.parent().prop('tagName') === 'A' ) {
					selectedElement.parent().css( 'float', '' ).removeClass( alignClasses );
				}
			}

			if ( alt ) {
				selectedElement.attr( 'alt', alt );
			} else {
				selectedElement.removeAttr( 'alt' );
			}

			// Apply our lazy load attributes
			ips.utils.lazyLoad.applyLazyLoadAttributes( selectedElement.get(0), {
				width: width,
				height: height
			}, true);
		};

		/**
		 * Check if the editor content has been changed from the default
		 *
		 * @returns	bool
		 */
		 var checkDirty = function() {
		 	return instance.checkDirty();
		 };

		/**
		 * Resets whether the editor content has been changed or not
		 *
		 * @returns	void
		 */
		 var resetDirty = function() {
		 	return instance.resetDirty();
		 };
		
		/**
		 * Insert arbitrary HTML into editor
		 *
		 * @param 		{string} 	html 	HTML to insert
		 * @returns void
		 */
		var insertHtml = function ( html ) {
			instance.insertHtml( html );
		};
		
		/**
		 * Reset the editor
		 *
		 * @param 		{string} 	html 	HTML to insert
		 * @returns void
		 */
		var reset = function () {
			// Tell editor we are resetting
			instance.fire( 'resetOrDestroy' );
				
			instance.setData('<p></p>');
			_closePreview();
			elem.find('[data-ipsUploader]').trigger('resetUploader');

			if( options.minimized && options.minimizeAfterReset ){
				minimize();
				$( elem )
					.find('.ipsComposeArea_dummy')
					.on('focus click', function(e) {
						$( this ).off('focus click'); // Ensure these events only fire once
						unminimize( function() {
							focus();
						});
					})
			}
		};
		
		/**
		 * Save and clear autosave
		 *
		 * @returns void
		 */
		var saveAndClearAutosave = function () {
			instance.updateElement();
			ips.utils.db.remove( 'editorSave', options.autoSaveKey );
		};

		/**
		 * Determines whether the provided editor ID matches this widget
		 *
		 * @param 		{object} 	Event data; requires editorID key which is the editor name to check
		 * @returns 	boolean
		 */
		var _belongsToThisEditor = function (data) {
			if( _.isUndefined( data.editorID ) || data.editorID !== name ){		
				return false;
			}

			return true; 
		};

		/**
		 * Allows other JS to initialize the editor
		 *
		 * @returns void
		 */
		var _initializeEditor = function (e, data) {
			if( !_belongsToThisEditor( data ) ){
				return;
			}

			unminimize(	function () {
				_scrollToEditor();
				focus();
			});
		};

		/**
		 * Remove a file from the editor
		 *
		 * @param	{event} 	e 		Event object
		 * @param	{object} 	data 	Data object from the event
		 * @returns {boolean}
		 */
		var _deleteFile = function(e, data){
			var document = elem.find('.cke_contents');
			var links = document.find('a');

			var images = document.find('img,video,audio');
			var toRemove = [];

			// Push items to remove into a new array because otherwise javascript removes all except one of the same attached image
			$.each( images, function () {
				var image = $( this );
				if( image.attr('data-fileid') == data.fileElem.attr('data-fileid')  || image.children('a').attr('data-fileid') == data.fileElem.attr('data-fileid') ){
					toRemove.push( image );
				}
			});

			$.each( links, function () {
				var link = $( this );
				if( link.attr('data-fileid') == data.fileElem.attr('data-fileid') || link.attr('href') == ips.getSetting('baseURL') + 'applications/core/interface/file/attachment.php?id=' + data.fileElem.attr('data-fileid') ){
					link.remove();
				}
			});


			
			for( var i = 0 ; i < toRemove.length; i++ ) {
				toRemove[i].remove();
			}
		};

		/**
		 * Scrolls the page to the editor
		 *
		 * @returns {boolean}
		 */
		var _scrollToEditor = function () {
			var elemPosition = ips.utils.position.getElemPosition( elem );

			// Is it on the page?
			var windowScroll = $( window ).scrollTop();
			var viewHeight = $( window ).height();

			// Only scroll if it isn't already on the screen
			if( elemPosition.absPos.top < windowScroll || elemPosition.absPos.top > ( windowScroll + viewHeight ) ){
				$('html, body').animate( { scrollTop: elemPosition.absPos.top + 'px' } );	
			}
		};
		
		/**
		 * Responds to an insertEmoji event
		 *
		 * @param	{event} 	e 		Event object
		 * @param	{object} 	data 	Data object from the event
		 * @returns {boolean}
		 */
		var _insertEmoji = function (e, data) {
			try {
				if( _belongsToThisEditor( data ) ){
					
					/* Get element */
					var element = ips.utils.emoji.editorElement( data.emoji );
					
					/* Check it won't exceed our 75 limit */
					if ( element.getName() == 'img' && $('<div>' + instance.getData() + '</div>' ).find('img[data-emoticon]').length >= 75 ) {
						var emoMessage = $(elem).closest('[data-ipsEditor]').find('[data-role="emoticonMessage"]');
						emoMessage.slideDown();
						
						/* Function to handle cancels */
						var hideEmoMessage = function(){
							emoMessage.slideUp();
						};
								
						/* After 2.5 seconds, more typing will remove */
						setTimeout(function(){
							instance.once( 'key', function() {
								hideEmoMessage();
							});
							instance.once( 'setData', function() {
								hideEmoMessage();
							});
						}, 2500);
						
						return;
					}
					
					/* Insert */
					instance.setReadOnly( false );
					instance.insertElement( element );
					if ( element.getName() == 'span' && element.hasClass( 'ipsEmoji' ) ) {
						instance.widgets.initOn( element, 'ipsemoji' );
					}
					
					/* Add to recently used */
					ips.utils.emoji.logUse( data.emoji );
				}
			} catch (err) {
				Debug.error("CKEditor instance couldn't be fetched");
				return;
			}	
		};
		
		//============================================================================================================
		// EDITOR PREVIEW FUNCTIONALITY
		//============================================================================================================

		/**
		 * Toggles the preview mode of the editor instance
		 *
		 * @returns void
		 */
		var _togglePreview = function () {
			if( elem.find('[data-role="previewFrame"]').length ){
				_showPreview();
			} else {
				_buildAndShowPreview();
			}
		};

		/**
		 * Hides the editor and shows the preview
		 *
		 * @returns void
		 */
		var _showPreview = function () {
			// Show preview
			var currentHeight = elem.height();

			elem.find('[data-role="editorComposer"]').hide();
			elem.find('[data-role="editorPreview"]').show();

			var toolbarHeight = elem.find('[data-role="previewToolbar"]').height();

			elem.find('[data-role="previewFrame"]').css({ height: ( currentHeight - toolbarHeight ) + 'px' });

			// Fetch a new preview
			_fetchPreview();
		};

		/**
		 * Builds the preview frame and sets up initial handling
		 *
		 * @returns void
		 */
		var _buildAndShowPreview = function () {
			// Create an iframe that we'll insert into the preview area. Set the height to the current height of the editor.
			var currentHeight = elem.height();
			var iframe = $('<iframe />')
					.addClass('ipsAreaBackground_reset')
					.css({ border: "0", width: '100%' })
					.prop('seamless', true)
					.attr('src', ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=editor&do=preview&editor_id=' + name )
					.attr('data-role', 'previewFrame');

			// Reset the toolbar
			currentPreviewView = ips.utils.responsive.getCurrentKey();
			_showPreviewButtons( currentPreviewView );

			// Watch for event
			elem.on( 'click', 'a[data-action="closePreview"]', _closePreview );
			elem.on( 'click', '[data-action="resizePreview"] a', _resizePreview );

			// Show preview
			elem.find('[data-role="editorComposer"]').hide();
			elem.find('[data-role="editorPreview"]').show();

			// Subtract the height of toolbar so that the overall height stays the same
			var toolbarHeight = elem.find('[data-role="previewToolbar"]').height();
			previewInitialHeight = currentHeight - toolbarHeight;

			elem.find('[data-role="previewContainer"]').append( iframe.css({ height: previewInitialHeight + 'px' }) );

			// Get the reference we'll need to the iframe
			previewIframe = iframe.get(0).contentWindow;
		};

		/**
		 * Show and toggle the appropriate view buttons
		 *
		 * @param 	{string} 	currentView 		The current view key (phone, tablet, desktop)
		 * @returns void
		 */
		var _showPreviewButtons = function (currentView) {
			var toolbar = elem.find('[data-role="previewToolbar"]');

			// Shortcut - if we're on mobile, hide all the buttons
			if( ips.utils.responsive.getCurrentKey() == 'phone' || size == 'phone' ){
				toolbar.find('[data-size]').hide();
				return;
			}

			// Set active button
			toolbar
				.find('[data-size]')
					.show()
					.filter('[data-size="' + currentView + '"]')
						.find('a')
							.removeClass('ipsButton_light')
							.addClass('ipsButton_primary');

			// If we're on tablet, we can't switch to desktop
			if( ips.utils.responsive.getCurrentKey() == 'tablet' || size == 'tablet' ){
				toolbar.find('[data-size="desktop"]').hide();
			}
		};

		/**
		 * Resizes the preview frame
		 *
		 * @param 	{event} 	e 		Event object
		 * @returns void
		 */
		var _resizePreview = function (e) {
			e.preventDefault();
			var newKey = $( e.target ).closest('[data-size]').attr('data-size');

			if( newKey == currentPreviewView ){
				return;
			}

			// Highlight
			var toolbar = elem.find('[data-role="previewToolbar"]');

			toolbar.find('[data-size] a').removeClass('ipsButton_primary').addClass('ipsButton_light');
			toolbar.find('[data-size="' + newKey + '"] a').addClass('ipsButton_primary').removeClass('ipsButton_light');

			currentPreviewView = newKey;

			// Reset the height
			// The iframe will send us its new height every 150ms
			elem
				.find('[data-role="previewFrame"]')
				.css({
					height: previewInitialHeight + 'px'
				});

			// If the new size is our actual size, we don't want any spacing
			if( newKey == size ){
				elem.find('[data-role="previewFrame"]')
					.removeClass('ipsComposeArea_smallPreview')
					.css({ 
						margin: '0px',
						maxWidth: '100%',
						width: '100%'
					});
			} else {
				elem.find('[data-role="previewFrame"]')
					.addClass('ipsComposeArea_smallPreview')
					.css({
						marginTop: '10px',
						marginBottom: '10px',
						maxWidth: previewSizes[ newKey ] + 'px',
						width: '100%'
					});
			}
		};

		/**
		 * Handles a message posted to us by the iframe controller
		 *
		 * @param 	{event} 	e 		Event object
		 * @param 	{object}	data 	Data object
		 * @returns void
		 */
		var _previewMessage = function (e, data) {
			var oE = e.originalEvent;

			// Security: check our origin is what we expect so that third-party frames can't tamper
			// Check the source is what we expect so we don't handle messages not meant for us
			if( oE.origin !== ips.utils.url.getOrigin() || oE.source !== previewIframe ){
				return;
			}

			try {
				var json = $.parseJSON( oE.data );
			} catch (err) {
				Debug.err("Error parsing JSON from preview frame");
				return;
			}

			// Ignore any messages not for this editor
			if( _.isUndefined( json.editorID ) || json.editorID !== name || _.isUndefined( json.message ) ){
				return;
			}

			switch( json.message ){
				case 'iframeReady':
					// Send our data to the iframe
					_fetchPreview();
				break;
				case 'previewHeight':
					_setPreviewHeight( json );
				break;
			}
		};

		/**
		 * Instructs iframe to fetch the preview
		 *
		 * @returns void
		 */
		var _fetchPreview = function () {
			_sendMessage({
				message: 'fetchPreview',
				editorContent: instance.getData(),
				url: elem.closest('form').attr('action')
			});
		};

		/**
		 * Instructs iframe to fetch the preview
		 *
		 * @returns void
		 */
		var _closePreview = function (e) {
			if( e ){
				e.preventDefault();
			}

			// Hide preview
			elem.find('[data-role="editorPreview"]').hide();
			elem.find('[data-role="editorComposer"]').show();

			_sendMessage({
				message: 'previewClosed'
			});	
		};

		/**
		 * Sets the height of the iframe preview window
		 *
		 * @param 	{object} 	data 	Data from iframe's postMessage
		 * @returns void
		 */
		var _setPreviewHeight = function (data) {
			if( data.height > previewInitialHeight ){
				elem
					.find('[data-role="previewFrame"]')
					.css({
						height: data.height + 'px'
					});	
			}			
		};

		/**
		 * Send a message to the preview iframe
		 *
		 * @param 	{object}	data 	Data object to serialize and send
		 * @returns void
		 */
		var _sendMessage = function (data) {
			Debug.log('Sending message FROM parent');
			if( previewIframe !== null ){
				previewIframe.postMessage( JSON.stringify( data ), ips.utils.url.getOrigin() );
			}
		};		
		
		return {
			init: init,
			focus: focus,
			unminimize: unminimize,
			minimize: minimize,
			insertQuotes: insertQuotes,
			insertHtml: insertHtml,
			checkDirty: checkDirty,
			resetDirty: resetDirty,
			updateImage: updateImage,
			reset: reset,
			destruct: destruct,
			saveAndClearAutosave: saveAndClearAutosave,
			getInstance: getInstance
		};
		
	};
}(jQuery, _));