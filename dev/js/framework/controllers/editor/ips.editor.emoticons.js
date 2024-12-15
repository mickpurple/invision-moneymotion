/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.editor.emoticons.js - Controller for emoticons panel
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.editor.emoticons', {
						
		initialize: function () {
			this.on( 'click', '[data-emoji]', this.insertEmoji );
			this.on( 'menuItemSelected', '[data-role="skinToneMenu"]', this.changeSkinTone );
			
			this.on( document, 'menuOpened', this.menuOpened );
			this.on( document, 'menuClosed', this.menuClosed );
			this.on( 'focus', '[data-role="emoticonSearch"]', this.searchEmoticons );
			this.on( 'blur', '[data-role="emoticonSearch"]', this.stopSearchEmoticons );
			
			this.on( 'menuItemSelected', '[data-role="categoryTrigger"]', this.changeCategory );
			
			this.setup();
		},

		/**
		 * Setup when the controller is initialized
		 *
		 * @returns 	{void}
		 */
		setup: function () {
			this.editorID = this.scope.attr('data-editorID');
			
			ips.utils.emoji.getEmoji(function(emoji,categories){
				setTimeout(function(){
					this._buildEmoji( emoji, ips.utils.cookie.get('emojiSkinTone'), null, categories );
				}.bind(this),100);
			}.bind(this));
		},
		
		/**
		 * Insert emoji
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		insertEmoji: function(e) {
			/* Insert */
			this.trigger( $( document ), 'insertEmoji', {
				editorID: this.editorID,
				emoji: $( e.currentTarget ).attr('data-emoji'),
			});
			
			/* Clear search box */
			this.scope.find('[data-role="emoticonSearch"]').val('');
			
			/* Close menu */
			this.scope.trigger( 'closeMenu' );
			
			/* Rebuild so Recently Used is correct */
			ips.utils.emoji.getEmoji(function(emoji,categories){
				this._buildEmoji( emoji, ips.utils.cookie.get('emojiSkinTone'), null, categories );
			}.bind(this));
		},
		
		/* !Main panel */
				
		/**
		 * Show emoji
		 *
		 * @param 		{object}		emoji		Emoji data
		 * @param 		{string}		tone		Skin tone
		 * @param 		{RegExp|null}	search		RegEx for searching
		 * @param 		{array}			categories	The categories in the correct order (JS objects are unordered so may be incorrectly ordered in the emoji variable)
		 * @returns 	{void}
		 */
		_buildEmoji: function(emoji, tone, search, categories) {
						
			ips.controller.cleanContentsOf( this.scope.find('.ipsMenu_innerContent') );

			/* Init */
			var finalHtml = '';
			var categoryHtml = '';
			var pos = 0;
			var emojiForThisRow = '';
			var menuContent = [];
						
			// Start with recently used
			if ( !search && ips.utils.cookie.get( 'recentEmoji' ) ) {
				var recentlyUsed = ips.utils.cookie.get( 'recentEmoji' ).split(',');
				var newRecentlyUsed = [];
				if ( recentlyUsed.length ) {
					for ( var i = 0; i < recentlyUsed.length; i++ ) {
						if ( ips.utils.emoji.canRender( recentlyUsed[i] ) ) {
							var displayHtml = ips.utils.emoji.preview( recentlyUsed[i] );
							if ( displayHtml ) {
								newRecentlyUsed.push( recentlyUsed[i] );
								
								emojiForThisRow += ips.templates.render('core.editor.emoji', {
									display: displayHtml,
									name: null,
									code: recentlyUsed[i]
								} );					
								
								// Once we've reached the limit per line, add the line 
								if( newRecentlyUsed.length == 8 || newRecentlyUsed.length == 16 ) {
									categoryHtml += ips.templates.render('core.editor.emoticonRow', { emoticons: emojiForThisRow } );
									emojiForThisRow = '';
								}
							}
						}
					}
					if( emojiForThisRow ){
						categoryHtml += ips.templates.render('core.editor.emoticonRow', { emoticons: emojiForThisRow } );
					}
					if ( categoryHtml ) {
						finalHtml += ips.templates.render('core.editor.emoticonCategory', { title: ips.getString( 'emoji-category-recent' ), categoryID: category, emoticons: categoryHtml } );
						categoryHtml = '';
						emojiForThisRow = '';
					}
				}
				if ( newRecentlyUsed != recentlyUsed ) {
					ips.utils.cookie.set( 'recentEmoji', newRecentlyUsed.join(','), true );
				}
			}
		
			/* Loop all the emoji categories */
			for ( var i in categories ) {
				var category = categories[i];
				var categoryCount = 0;
								
				/* Loop each emoji... */
				for ( var i = 0; i < emoji[category].length; i++ ) {
					
					/* Include in search results? */
					if ( search ) {
						var match = false;
						if ( emoji[category][i].name.match( search ) ) {
							match = true;
						}
						if ( !match && emoji[category][i].shortNames ) {
							for ( var j = 0; j < emoji[category][i].shortNames.length; j++ ) {
								if ( emoji[category][i].shortNames[j].match( search ) ) {
									match = true;
								}
							}
						}
						if ( !match && emoji[category][i].ascii ) {
							for ( var j = 0; j < emoji[category][i].ascii.length; j++ ) {
								if ( emoji[category][i].ascii[j].match( search ) ) {
									match = true;
								}
							}
						}
						if ( !match ) {
							continue;
						}
					}
										
					/* Get which code we'll use */
					var codeToUse = emoji[category][i].code;
					if ( emoji[category][i].skinTone && tone && tone != 'none' ) {
						codeToUse = ips.utils.emoji.tonedCode( codeToUse, tone );
					}
					
					/* Display */
					emojiForThisRow += ips.templates.render('core.editor.emoji', {
						display: ips.utils.emoji.preview( codeToUse ),
						name: ips.haveString( 'emoji-' + emoji[category][i].name ) ? ips.getString( 'emoji-' + emoji[category][i].name ) : emoji[category][i].name,
						code: codeToUse
					} );
					
					/* Once we've reached the limit per line, add the line */
					pos++;
					categoryCount++;
					if( pos == 8 ) {
						categoryHtml += ips.templates.render('core.editor.emoticonRow', { emoticons: emojiForThisRow } );
						pos = 0;
						emojiForThisRow = '';
					}
				}
				
				/* Add the HTML */
				if ( !search ) {
					if( pos ){
						categoryHtml += ips.templates.render('core.editor.emoticonRow', { emoticons: emojiForThisRow } );
					}
					if ( categoryHtml ) {
						var categoryTitle = ['smileys_emotion','people_body','animals_nature','food_drink','activities','travel_places','objects','symbols','flags'].indexOf(category) == -1 ? emoji[category][0].categoryName : ips.getString( 'emoji-category-' + category );
						
						finalHtml += ips.templates.render('core.editor.emoticonCategory', { title: categoryTitle, categoryID: category, emoticons: categoryHtml } );
						categoryHtml = '';
						pos = 0;
						emojiForThisRow = '';
						
						menuContent.push( ips.templates.render('core.editor.emoticonMenu', { 
							title: categoryTitle,
							count: categoryCount,
							categoryID: category
						}));
					}
				}
			}
			if ( search ) {
				this.scope.find('[data-role="categoryTrigger"]').hide();
				if( pos ){
					categoryHtml += ips.templates.render('core.editor.emoticonRow', { emoticons: emojiForThisRow } );
				}
				if ( categoryHtml ) {
					finalHtml = ips.templates.render('core.editor.emoticonSearch', { emoticons: categoryHtml } );
				} else {
					finalHtml = ips.templates.render('core.editor.emoticonNoResults');
				}
			} else {
				this.scope.find('[data-role="categoryTrigger"]').show();
				this.scope.find('[data-role="categoryMenu"]').get(0).innerHTML = menuContent.join('');
			}
			
			/* Display */
			this.scope.find('.ipsEmoticons_content').get(0).innerHTML = finalHtml;
			
			/* Show the skin tone indicator */
			if ( ips.getSetting('emoji_style') != 'disabled' && ( ips.getSetting('emoji_style') != 'native' || ips.utils.emoji.canRender( '1F44D-1F3FB' ) ) ) {
				this.scope.find("[data-role='skinToneMenu']").show();
				switch ( tone ) {
				case 'light':
					this.scope.find("[data-role='skinToneIndicator']").text( String.fromCodePoint( parseInt( '1F44D', 16 ) ) + String.fromCodePoint( parseInt( '1F3FB', 16 ) ) );
					break;
				case 'medium-light':
					this.scope.find("[data-role='skinToneIndicator']").text( String.fromCodePoint( parseInt( '1F44D', 16 ) ) + String.fromCodePoint( parseInt( '1F3FC', 16 ) ) );
					break;
				case 'medium':
					this.scope.find("[data-role='skinToneIndicator']").text( String.fromCodePoint( parseInt( '1F44D', 16 ) ) + String.fromCodePoint( parseInt( '1F3FD', 16 ) ) );
					break;
				case 'medium-dark':
					this.scope.find("[data-role='skinToneIndicator']").text( String.fromCodePoint( parseInt( '1F44D', 16 ) ) + String.fromCodePoint( parseInt( '1F3FE', 16 ) ) );
					break;
				case 'dark':
					this.scope.find("[data-role='skinToneIndicator']").text( String.fromCodePoint( parseInt( '1F44D', 16 ) ) + String.fromCodePoint( parseInt( '1F3FF', 16 ) ) );
					break;
				default:
					this.scope.find("[data-role='skinToneIndicator']").text( String.fromCodePoint( parseInt( '1F44D', 16 ) ) );
					break;
				}
			}
		},
		
		/**
		 * Event handler called when the skin tone is change
		 *
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		changeSkinTone: function (e, data) {
			ips.utils.emoji.getEmoji(function(emoji,categories){
				this._buildEmoji( emoji, data.selectedItemID, this._lastVal ? new RegExp( this._lastVal.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&" ), 'i' ) : null, categories );
			}.bind(this));
			ips.utils.cookie.set( 'emojiSkinTone', data.selectedItemID, true );
		},
		
		/* !Search */

		_typeTimer: null,
		_lastVal: '',
		
		/**
		 * Event handler called when the emoticons menu is opened.
		 * Iniializes the menu if it hasn't already been done
		 *
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		menuOpened: function (e, data) {
			if( data.menu.attr('data-controller') == 'core.global.editor.emoticons' ){
				setTimeout(function(){
					this.scope.find('.ipsEmoticons_content').show();
					this.scope.find('.ipsMenu_innerContent').css({ height: 'auto' });
					this.scope.find('[data-role="emoticonSearch"]').focus();
				}.bind(this),100);
			}
		},

		/**
		 * Event handler called when the emoticons menu is closed.
		 * Hide the content area but set a fixed height on the innerContent elem to preserve position
		 *
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		menuClosed: function (e, data) {
			if( data.menu.attr('data-controller') == 'core.global.editor.emoticons' ){
				var inner = this.scope.find('.ipsMenu_innerContent');
				var content = this.scope.find('.ipsEmoticons_content');
				inner.css({ height: content.outerHeight() + 'px' });
				content.hide();
			}
		},

		/**
		 * The search box has received focus
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		searchEmoticons: function (e) {
			this._typeTimer = setInterval( _.bind( this._typing, this ), 200 );
		},

		/**
		 * The search box has blurred
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		stopSearchEmoticons: function (e) {
			if( this._typeTimer ){
				clearInterval( this._typeTimer );
				this._typeTimer = null;
			}
		},

		/**
		 * Runs a continuous interval to check the current search value, and call the search function
		 *
		 * @param 		{event} 	e 		Event object	
		 * @returns 	{void}
		 */
		_typing: function () {
			var textElem = this.scope.find('[data-role="emoticonSearch"]');

			if( this._lastVal == textElem.val() ){
				return;
			}

			if( textElem.val() == '' ){
				this._clearSearch();
			} else {
				this._doSearch( textElem.val() );
			}

			this._lastVal = textElem.val();
		},

		/**
		 * Clears the search panel (called when value is empty)
		 *
		 * @returns 	{void}
		 */
		_clearSearch: function () {
			ips.utils.emoji.getEmoji(function(emoji,categories){
				this._buildEmoji( emoji, ips.utils.cookie.get('emojiSkinTone'), null, categories );
			}.bind(this));
		},

		/**
		 * Finds emoticons matching the value
		 *
		 * @param 		{string} 	value  		Search value	
		 * @returns 	{void}
		 */
		_doSearch: function (value) {
			ips.utils.emoji.getEmoji(function(emoji,categories){
				this._buildEmoji( emoji, ips.utils.cookie.get('emojiSkinTone'), new RegExp( value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&" ), 'i' ), categories );
			}.bind(this));
		},
		
		/* !Categories */
		
		/**
		 * Event handler called when the a category is selected
		 *
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		changeCategory: function (e, data) {
			this.scope.find('.ipsMenu_innerContent').scrollTop( this.scope.find('.ipsMenu_innerContent').scrollTop() + this.scope.find('[data-categoryid="' + data.selectedItemID + '"]').position().top - 85 );
		}
	
	});
	
}(jQuery, _));