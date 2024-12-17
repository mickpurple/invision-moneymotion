CKEDITOR.plugins.add( 'ipsemoticon', {
    icons: 'ipsemoticon',
    hidpi: true,
    init: function( editor ) {
	    editor.widgets.add( 'ipsemoji', {
	        editables: {},
		    upcast: function( element ) {
		        if ( element.name == 'span' && element.hasClass( 'ipsEmoji' ) ) {
			       return true;
		        }
		    }
		} );
		
		if ( ips.getSetting('emoji_shortcodes') ) {
			new CKEDITOR.plugins.ipsemoji( editor );
		}
    	var menu;
    	editor.addCommand( 'ipsEmoticon', {
    		allowedContent: '',
		    exec: function( editor ) {
		    	
		    	var button = $( '.' + editor.id ).find( '.cke_button__ipsemoticon' );
		    
		    	if( !$( '#' + button.attr('id') + '_menu' ).length ){
									
					$('body').append( ips.templates.render( 'core.editor.emoticons', {
						id: button.attr('id'),
						editor: editor.name
					}) );
						
					$( editor.element.$ ).closest('[data-ipsEditor]').trigger('contentChange', [ $('#' + button.attr('id') + '_menu') ] );
					
					button.ipsMenu({
			    		alignCenter: true,
			    		closeOnClick: false
		    		});
		    	}
		    }
		});
		editor.ui.addButton( 'ipsEmoticon', {
		    label: ips.getString('emoji'),
		    command: 'ipsEmoticon',
		    toolbar: 'insert'
		});		
    }
});

/**
 * IPS :emoji: handler
 *
 * @param	{CKEDITOR.editor} 	editor 		The element this widget is being created on
 * @returns {void}
 */
CKEDITOR.plugins.ipsemoji = function( editor ){
	
	this.listenForColonSymbolEvent = null;
	this.listenWithinEmoji = null;
	this.listenForDestruct = null;
	this.currentEmoji = null;
	this.callsWithNoResults = 0;
	this.emoji = {};
		
	/**
	 * Start listening for : symbol
	 *
	 * @returns	{void}
	 */
	this.listenForColonSymbol = function(){
		/* We need to do this asynchronously */
		CKEDITOR.tools.setTimeout( function() {
			
			/* If we currently have just normal text selected, we're typing normally and there might be an : */
			var selection = editor.getSelection();
			if ( selection.getType() == CKEDITOR.SELECTION_TEXT ) {
				
				/* Loop the ranges... */
				var ranges = selection.getRanges( true );
				for ( var i = 0; i < ranges.length; i++ ) {
					
					/* If it's collapsed (meaning we just have a normal caret, indicating normal typing, nothing highlighted) and the caret has something before it... */
					if ( ranges[i].collapsed && ranges[i].startOffset ) {
						
						/* And that is an : symbol... */
						ranges[i].setStart( ranges[i].startContainer, 0 );
						if ( ranges[i].cloneContents().$.textContent.substr( -1 ) == ':' ) {
							$( editor.element.$ ).closest('[data-ipsEditor]').trigger( 'ips.editorMenuOpen', { type: 'emoticon' } );
							this.respondToColonSymbol( ranges[i] );
						}
						
					}
					
				}
				
			}
		
		}, 0, this );
	};
	
	/**
	 * Respond to : symbol being pressed
	 *
	 * @param	{CKEDITOR.dom.range}	range	The range
	 * @returns	{void}
	 */
	this.respondToColonSymbol = function( range ){
				
		/* If there's content before the : besides a space, ignore it
			For example - "something:" means the user is typing a list so it's ignored
			but just ":" is what could be an emoji */
		var rangeText = range.cloneContents().$.textContent;
		if ( rangeText.length > 1 && !rangeText.substr( -2, 1 ).match( /\s/ ) ) {
			$( editor.element.$ ).closest('[data-ipsEditor]').trigger( 'ips.editorMenuClosed', { type: 'emoticon' } );
			return;
		}

		/* Stop listening for any more :s for now */
		if( this.listenForColonSymbolEvent && !_.isUndefined( this.listenForColonSymbolEvent ) ){
			editor.removeListener( 'change', this.listenForColonSymbol );
		}
		
		/* Move the : into its own tag */
		this.currentEmoji = new CKEDITOR.dom.element( 'span' );
		this.currentEmoji.setText(':');
		if ( range.endContainer instanceof CKEDITOR.dom.element ) {
			var colonSymbol;
			var i;
			var children = range.endContainer.getChildren();
			for ( i = children.count(); i >= 0; i-- ) {
				var item = children.getItem( i )
				if ( item instanceof CKEDITOR.dom.text && item.getText() == ':' ) {
					colonSymbol = item;
					break;
				}
			}
			if ( !colonSymbol ) {
				$( editor.element.$ ).closest('[data-ipsEditor]').trigger( 'ips.editorMenuClosed', { type: 'emoticon' } );
				return;
			}
		} else {
			var colonSymbol = range.endContainer.split( range.endOffset - 1 );
		}
		colonSymbol.split( 1 );
		this.currentEmoji.replace(colonSymbol);
		var newRange = editor.createRange();
		newRange.moveToPosition( this.currentEmoji, CKEDITOR.POSITION_BEFORE_END );
		editor.getSelection().selectRanges( [ newRange ] );
		
		/* Reset the results tracking variables */
		this.callsWithNoResults = 0;
				
		/* Create and position the results menu. Hide it until we type another character so that it doesn't look like it's doing something when it's not */
		this.results = $('<ul class="ipsMenu ipsMenu_auto cEmojiMenu" data-emojiMenu></ul>').hide();
		this.results.append('<li class="ipsLoading ipsLoading_small" style="height: 40px">&nbsp;</li>');
		$( 'body' ).append( this.results );
		this.positionResults(range);
		
		/* Listen for escape key */
		this.listenWithinEmoji = editor.on( 'key', this.listenWithinEmojiEvent, this );

		/* Listen for editor reset */
		this.listenForDestruct = editor.on( 'resetOrDestroy', this.listenForDestructEvent, this );
	};
	
	/**
	 * Positions the results menu according to position of the mention
	 *
	 * @param	{CKEDITOR.dom.range}	range	The range
	 * @returns	{void}
	 */
	this.positionResults = function (range) {
		var lineHeight = ( range && range.getNextEditableNode() ) ? range.getNextEditableNode().getSize('height') : 12;
		var positionInfo = {
			trigger: $(this.currentEmoji.$),
			target: this.results,
			center: true,
			above: false,
			stemOffset: { left: 25, top: 0 }
		};

		var editorElem = $( editor.container.$ );
		var menuPosition = ips.utils.position.positionElem( positionInfo );
		var editorPosition = ips.utils.position.getElemPosition( editorElem );

		// Make the menu as wide as the editor
		this.results.css({
			position: ( menuPosition.fixed ) ? 'fixed' : 'absolute',
			top: menuPosition.top + 'px',
			left: editorPosition.absPos.left + 'px',
			width: ( editorElem.width() - 30 ) + 'px'
		});

			
	};

	/**
	 * Respond to key press within the emoji picker
	 *
	 * @param	{CKEDITOR.eventInfo}	evt		Key press event
	 * @returns	{void}
	 */
	this.listenForDestructEvent = function( evt ){
		this.cancelEmoji();
		this.closeResults();
		return;
	}

	/**
	 * Respond to key press within the emoji picker
	 *
	 * @param	{CKEDITOR.eventInfo}	evt		Key press event
	 * @returns	{void}
	 */
	this.listenWithinEmojiEvent = function( evt ){
		
		/* Escape is cancel */
		if ( evt.data.keyCode == 27 ){
			this.cancelEmoji();
			this.closeResults();
			return;
		}
		
		/* Arrow keys are for highlighting results */
		if ( evt.data.keyCode == 40 || evt.data.keyCode == 38 || evt.data.keyCode == 39 || evt.data.keyCode == 37 ) {
			var current = this.results.children('[data-selected]');
			if ( current.length ) {
				current.removeAttr('data-selected');
				if ( evt.data.keyCode == 40 || evt.data.keyCode == 39 ) {
					current.next().attr( 'data-selected', true );
				} else {
					current.prev().attr( 'data-selected', true );
				}
			} else {
				if ( evt.data.keyCode == 40 || evt.data.keyCode == 37 ) {
					this.results.children(':first-child').attr( 'data-selected', true );
				} else {
					this.results.children(':last-child').attr( 'data-selected', true );
				}
			}
			evt.cancel();
			return;
		}
		
		/* Return/tab key is the equivilant of clicking a result - or if enter is hit when a result is not selected, treat it like normal by cancelling the
			mention and allowing the caret to move to the next line */
		if ( evt.data.keyCode == 13 || evt.data.keyCode == 9 ) {
			var current = this.results.children('[data-selected]');
			if ( current.length ) {
				current.click();
				evt.cancel();
			} else if ( evt.data.keyCode == 13 ) {
				this.closeResults();
			}
			return;
		}
		
		/* Backspace means they might be correcting a typo, so reset the callsWithNoResults counter
			to give them an oppertunity to do that */
		if ( evt.data.keyCode == 8 ) {
			this.callsWithNoResults = 0;
		}
				
		/* For everything else, update the results, which we need to do asynchronously */
		CKEDITOR.tools.setTimeout( function() {
						
			/* If we have removed the : symbol (by hitting backspace or whatever), cancel */
			if ( _.isNull( this.currentEmoji ) || !this.currentEmoji.getText().trim().length ) {
				this.closeResults();
				return;
			}
			
			/* If we have enterred another :, cancel */
			if ( this.currentEmoji.getText().substr( -1 ) == ':' ) {
				this.closeResults();
				return;
			}

			/* If the colon character no longer exists (perhaps the ASCII auto-replacement occurred from the ipsautolink plugin), cancel */
			if ( this.currentEmoji.getText().substr( 0, 1 ) != ':' ) {
				this.closeResults();
				return;
			}

			// If we have fewer than three characters, don't do anything right now
			// This prevents a massive list of emoji showing based on a single character
			if( this.currentEmoji.getText().trim().length < 3 ){
				return;
			}
			
			/* Or if we're just not in that element anymore (by hitting return or repositioning the mouse), also cancel */
			var ranges = editor.getSelection().getRanges();
			for ( var i = 0; i < ranges.length; i++ ) {
				if ( !ranges[i].getCommonAncestor( true, true ).equals( this.currentEmoji ) ) {
					this.cancelEmoji();
					this.closeResults();
					return;
				}
			}
			
			/* Get the name being typed */
			var emojiShortCode = this.currentEmoji.getText();
						
			/* Show the box if it's not showing yet (it will have ipsLoading) */
			this.results.show();

			/* Reposition it */
			this.positionResults();

			/* Get any matching emojis */
			ips.utils.emoji.getEmoji(function( emoji, categories ){
				this.results.removeClass('ipsLoading').html('');
				
				var text = emojiShortCode.substr(1).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&" );
				var matches = [];
				var regex = new RegExp( text, 'i' );
				var results = 0;

				// First, find matching emoji
				for ( var c in emoji ) {
					for ( var i = 0; i < emoji[c].length; i++ ) {
						for ( var j = 0; j < emoji[c][i]['shortNames'].length; j++ ) {
							if ( emoji[c][i]['shortNames'][j].match( regex ) ) {
								matches.push({
									shortName: emoji[c][i]['shortNames'][j],
									emoji: emoji[c][i]
								});
							}
						}
					}
				}

				// Now sort based on how close the match is to the beginning of the shortcode
				var sortedMatches = _.sortBy( matches, function (match) {
					return match.shortName.indexOf( text );
				});

				// Now reverse so that the smaller indexes (i.e. closest to the start) are first in our array
				//sortedMatches.reverse();

				// Now we can build our list...
				for( var k = 0; k < sortedMatches.length; k++ ){
					var codeToUse = sortedMatches[k].emoji.code;
					if ( sortedMatches[k].emoji.skinTone && ips.utils.cookie.get('emojiSkinTone') ) {
						codeToUse = ips.utils.emoji.tonedCode( codeToUse, ips.utils.cookie.get('emojiSkinTone') );
					}

					this.results.append( ips.templates.render('core.editor.emojiResult', {
						'code': codeToUse,
						'emoji': ips.utils.emoji.preview( codeToUse ),
						'name': ips.haveString( 'emoji-' + sortedMatches[k].emoji.name ) ? ips.getString( 'emoji-' + sortedMatches[k].emoji.name ) : sortedMatches[k].emoji.name,
						'short_code': ':' + sortedMatches[k].shortName + ':'
					} ) );
					
					results++;
				}

				// Finish up with some basic checks and updates				
				if ( !results ) {
					/* Hide the results */
					this.results.hide();
					
					/* Note that there were no results */
					this.callsWithNoResults++;
										
					/* And if it's failed more than 3 times, give up. We don't want to give up immediately in case of typos, but we also don't want to keep going forever */
					if ( this.callsWithNoResults >= 3 ) {
						this.cancelEmoji();
						this.closeResults();
						return;
					}					
				} else {
					ips.utils.lazyLoad.observe( this.results );
					this.results.children().click( $.proxy( this.selectEmoji, this ) );
				}
			}.bind(this));
			
				
		}, 50, this );
	};
	
	/**
	 * Select an emoji
	 *
	 * @param	{jQuery.Event}	evt	The click event
	 * @returns	{void}
	 */
	this.selectEmoji = function( evt ){
		evt.preventDefault();

		/* Which emoji did we click on? */
		var selectedEmoji = $(evt.currentTarget);
		var element = ips.utils.emoji.editorElement( selectedEmoji.attr('data-emoji') );
				
		/* Check limit */
		if ( element.getName() == 'img' && $('<div>' + editor.getData() + '</div>' ).find('img[data-emoticon]').length >= 75 ) {
			/* Insert text */
			var element = CKEDITOR.dom.element.createFromHtml( '<span>' + selectedEmoji.find("[data-role='shortCode']").text() + '</span>' );
			
			/* Show message */
			var emoMessage = $( '.' + editor.id ).closest('[data-ipsEditor]').find('[data-role="emoticonMessage"]');
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
		}
		
		/* Insert the emoji */
		element.replace( this.currentEmoji );
		if ( element.getName() == 'span' && element.hasClass('ipsEmoji') ) {
			editor.widgets.initOn( element, 'ipsemoji' );
		}

		/* Focus the editor again, placing the cursor just after the emoji */
		editor.focus();
		var newRange = editor.createRange();
		newRange.moveToElementEditEnd( element );
		editor.getSelection().selectRanges( [ newRange ] );
		
		/* Close the results menu */
		this.closeResults();
				
		/* Log the use for recently used */
		ips.utils.emoji.logUse( selectedEmoji.attr('data-emoji') );
	};
	
	/**
	 * Cancel the emoji picker
	 *
	 * @returns	{void}
	 */
	this.cancelEmoji = function(){
		if( this.currentEmoji ) {
			this.currentEmoji.remove(true);
		}
	};
	
	/**
	 * Close results menu and resume listening for :
	 *
	 * @returns	{void}
	 */
	this.closeResults = function(){
		$( editor.element.$ ).closest('[data-ipsEditor]').trigger( 'ips.editorMenuClosed', { type: 'emoticon' } );
		this.currentEmoji = null;
		
		if( this.results ){
			this.results.remove();
		}
		
		if( this.listenWithinEmoji && !_.isUndefined( this.listenWithinEmoji ) ){
			editor.removeListener( 'key', this.listenWithinEmojiEvent );
		}

		this.listenForColonSymbolEvent = editor.on( 'change', this.listenForColonSymbol, this );
	};
	
	/* On initiation, get emoji data and start listening for : */
	if ( document.createElement('canvas').getContext ) {
		var context = document.createElement('canvas').getContext('2d');
		if ( typeof context.fillText == 'function' ) {
			ips.utils.emoji.getEmoji(function(response){
				this.emoji = response;
			}.bind(this));
		}
		
		this.listenForColonSymbolEvent = editor.on( 'change', this.listenForColonSymbol, this );
	}
};