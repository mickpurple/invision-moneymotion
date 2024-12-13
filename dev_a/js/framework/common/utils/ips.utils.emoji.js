/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.utils.emoji.js - Emoji module
 *
 * Author: Mark Wade
 */

;( function($, _, undefined){
	"use strict";
	
	ips.createModule('ips.utils.emoji', function () {

		var _emoji = null,
		_categories = null,
		_testingCanvasContext = null,
		_ajax = null,

		init = function () {
			this._invalidCharacterImageData = ['0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'];
		},
				
		/**
		 * Get all supported Emoji
		 *
		 * @param 		{function}	callback	Function to run once emoji data has been fetched
		 * @returns 	{bool}
		 */
		getEmoji = function(callback) {
			if ( this._emoji && this._categories ) {
				callback(this._emoji, this._categories);
				return;
			}
			
			var storage = ips.utils.db.get( 'emoji', ips.getSetting('baseURL') + '-' + ips.getSetting('emoji_cache') );
			var categories = ips.utils.db.get( 'emojiCategories', ips.getSetting('baseURL') + '-' + ips.getSetting('emoji_cache') );
			if ( storage && categories ) {
				this._emoji = storage;
				callback( storage, categories );
			} else {
				ips.utils.db.removeByType('emoji');
				if( this._ajax && this._ajax.abort ){
					this._ajax.abort();
				}
				this._ajax = ips.getAjax()( ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=editor&do=emoji' ).done(function(emoji){
					this._emoji = {};
					this._categories = [];
					var canUseTones = null;
					for ( var category in emoji ) {
						var categoryName = emoji[category].category;
						this._categories.push( categoryName );
						this._emoji[categoryName] = [];
						for ( var i = 0; i < emoji[category].emoji.length; i++ ) {
							if ( this.canRender( emoji[category].emoji[i].code ) ) {

								// If the emoji supports skin tone modifiers, check if our browser does
								if ( emoji[category].emoji[i].skinTone ) {
									if( canUseTones === null ) {
										if( !this.canRender( this.tonedCode( emoji[category].emoji[i].code, 'light' ) ) ) {
											canUseTones = false;
										}
										else {
											canUseTones = true;
										}
									}
									if ( canUseTones === false ) {
										emoji[category].emoji[i].skinTone = false;
									}
								}

								// Add translated name too
								emoji[category].emoji[i].shortNames.push( ips.getString('emoji-' + emoji[category].emoji[i].name ) );
								this._emoji[categoryName].push( emoji[category].emoji[i] );
							}
						}
					}
					ips.utils.db.set( 'emoji', ips.getSetting('baseURL') + '-' + ips.getSetting('emoji_cache'), this._emoji );
					ips.utils.db.set( 'emojiCategories', ips.getSetting('baseURL') + '-' + ips.getSetting('emoji_cache'), this._categories );
					callback(this._emoji,this._categories);
				}.bind(this));
			}
		},
		
		/**
		 * Check if we can render a particular Emoji
		 *
		 * @param 		{string}	code	The code 
		 * @returns 	{bool}
		 */
		canRender = function(code) {
												
			/* We only need to do this check for native */
			if ( code.substr( 0, 7 ) == 'custom-' ) {
				return true;
			}
			else if ( ips.getSetting('emoji_style') == 'disabled' ) {
				return false;
			}
			else if ( ips.getSetting('emoji_style') != 'native' ) {
				return true;
			}
			
			/* Windows renders country flags as letters which looks terrible */
			if ( navigator.platform.indexOf('Win') > -1 && code.match( /^1F1(E[6-9A-F]|F[0-9A-F])/ ) ) {
				return false;
			}
			
			/* Load the canvas if we haven't already */
			if ( this._testingCanvasContext == null ) {
				var testingCanvas = document.createElement('canvas');
				testingCanvas.width = 8;
				testingCanvas.height = 6;
				if ( testingCanvas && testingCanvas.getContext && typeof String.fromCodePoint == 'function' ) {
					this._testingCanvasContext = testingCanvas.getContext('2d');
					if ( typeof this._testingCanvasContext.fillText == 'function' ) {
						this._testingCanvasContext.textBaseline = 'top';
						this._testingCanvasContext.font = '5px "Apple Color Emoji", "Segoe UI Emoji", "NotoColorEmoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols"';
						
						/* Draw a deliberately invalid character (x1 and x2) so that we can compare it with valid emojis to see if they were rendered properly */
						this._testingCanvasContext.fillText( String.fromCodePoint( parseInt( '1F91F', 16 ) ), 0, 0 );
						this._invalidCharacterImageData.push( Array.prototype.toString.call( this._testingCanvasContext.getImageData( 0, 0, 6, 6 ).data ) );
						this._testingCanvasContext.clearRect( 0, 0, 8, 6 );
						this._testingCanvasContext.fillText( String.fromCodePoint( parseInt( '1F91F', 16 ) ) + String.fromCodePoint( parseInt( '1F91F', 16 ) ), 0, 0 );
						this._invalidCharacterImageData.push( Array.prototype.toString.call( this._testingCanvasContext.getImageData( 0, 0, 6, 6 ).data ) );
					} else {
						return false;
					}
				} else {
					return false;
				}
			}
			
			/* Clear the canvas */
			this._testingCanvasContext.clearRect( 0, 0, 8, 6 );
						
			/* Draw the character */
			var emoji = this.emojiFromHex( code );
			if ( emoji == null ) {
				return false;
			}
			this._testingCanvasContext.fillText( emoji, 0, 0 );
			
			/* If it rendered the same as the deliberately invalid character, or it's blank, we know it can't be rendered */
			if ( this._invalidCharacterImageData.indexOf( Array.prototype.toString.call( this._testingCanvasContext.getImageData( 0, 0, 6, 6 ).data ) ) != -1  ) {
				return false;
			}
			
			/* Look at an imaginary line down the right side, if it's *not* totally blank, there is probably two characters
				(i.e. the base character and a modifier like a gender sign), so assume this emoji not supported */
			if ( Array.prototype.toString.call( this._testingCanvasContext.getImageData( 7, 0, 1, 6 ).data ) != '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0' ) {
				return false;
			}
						
			/* Return true */
			return true;
		},
		
		/**
		 * Get emoji character from hex
		 *
		 * @param 		{string}	hex Hexadecimal code(s) separated by -
		 * @returns 	{string|null}
		 */
		emojiFromHex = function(hex) {
			try {
				var decimals = [];
				var hexPoints = hex.split('-');
				for ( var p = 0; p < hexPoints.length; p++ ) {
					decimals.push( parseInt( hexPoints[p], 16 ) );
				}
				
				return String.fromCodePoint.apply( null, decimals );
			} catch ( err ) {
				return null;
			}
		},
				
		/**
		 * Get emoji image from hex
		 *
		 * @param 		{string}	codeToUse Hexadecimal code(s) separated by -
		 * @returns 	{string|null}
		 */
		emojiImage = function( codeToUse, lazyLoad ) {
			if ( codeToUse.substr( 0, 7 ) == 'custom-' ) {
				var parts = codeToUse.split('-');
				
				// Recent emoji are stored in a recentEmoji cookie, but the group may have since been deleted or renamed, so account for that
				if( _.isUndefined( this._emoji[ parts[1] ] ) )
				{
					return null;
				}

				for ( var i = 0; i < this._emoji[ parts[1] ].length; i++ ) {
					if( this._emoji[ parts[1] ][i].code == codeToUse ) {
						var imgTag = '<img ';

						if( lazyLoad ){
							imgTag += 'src="' + ips.getSetting('blankImg') + '" data-loading data-src="' + this._emoji[ parts[1] ][i].image + '"';
						} else {
							imgTag += 'src="' + this._emoji[ parts[1] ][i].image + '"';
						}

						imgTag += 'title="' + this._emoji[ parts[1] ][i].name + '" alt="' + this._emoji[ parts[1] ][i].name + '"';
	
						if( this._emoji[ parts[1] ][i].image2x )
						{
							imgTag += ' srcset="' + this._emoji[ parts[1] ][i].image2x + ' 2x"';
						}

						if( parseInt( this._emoji[ parts[1] ][i].width ) && parseInt( this._emoji[ parts[1] ][i].height ) )
						{
							imgTag += ' width="' + this._emoji[ parts[1] ][i].width + '" height="' + this._emoji[ parts[1] ][i].height + '"';
						}
						
						imgTag += ' data-emoticon="true">';
						
						return imgTag;
					}
				}
				return null;
			} else {
				var url;
				var image = codeToUse.toLowerCase();
				
				if ( image.indexOf( '200d' ) == -1 || ['1f441-fe0f-200d-1f5e8-fe0f'].indexOf( image ) != -1 ) {
					image = image.replace( /\-fe0f/g, '' );
				}
				if ( ['0031-20e3', '0030-20e3', '0032-20e3', '0034-20e3', '0035-20e3', '0036-20e3', '0037-20e3', '0038-20e3', '0033-20e3', '0039-20e3', '0023-20e3', '002a-20e3', '00a9', '00ae'].indexOf( image ) != -1 ) {
					image = image.replace( '00', '' );
				}
				
				url = "https://twemoji.maxcdn.com/2/72x72/" + image + ".png";
				
				var character = this.emojiFromHex( codeToUse );

				if( lazyLoad ){
					return '<img src="' + ips.getSetting('blankImg') + '" data-loading data-src="' + url + '" alt="' + character + '" class="ipsEmoji" data-emoticon="true">';
				} else {
					return '<img src="' + url + '" alt="' + character + '" class="ipsEmoji" data-emoticon="true">';
				}
			}
		},
				
		/**
		 * Get the code for an emoji with a skin tone modifier
		 *
		 * @param 		{string}	code	Hexadecimal code(s) separated by -
		 * @param 		{string}	tone	Skin tone to use (light, medium, etc)
		 * @returns 	{string|null}
		 */
		tonedCode = function( code, tone ) {
			switch ( tone ) {
			case 'light':
				return code.replace( /^([0-9A-F]*)(\-|$)(?:FE0F\-)?/, '$1-1F3FB$2' );
				break;
			case 'medium-light':
				return code.replace( /^([0-9A-F]*)(\-|$)(?:FE0F\-)?/, '$1-1F3FC$2' );
				break;
			case 'medium':
				return code.replace( /^([0-9A-F]*)(\-|$)(?:FE0F\-)?/, '$1-1F3FD$2' );
				break;
			case 'medium-dark':
				return code.replace( /^([0-9A-F]*)(\-|$)(?:FE0F\-)?/, '$1-1F3FE$2' );
				break;
			case 'dark':
				return code.replace( /^([0-9A-F]*)(\-|$)(?:FE0F\-)?/, '$1-1F3FF$2' );
				break;
			}
			return code;
		},
		
		/**
		 * Get HTML to preview a particular emoji
		 *
		 * @param 		{string}	code	Hexadecimal code(s) separated by -
		 * @returns 	{string}
		 */
		preview = function(code) {
			if ( ips.getSetting('emoji_style') == 'native' && code.substr( 0, 7 ) != 'custom-' ) {
				return "<span class='ipsEmoji'>" + this.emojiFromHex( code ) + '</span>';
			}
			else {
				return this.emojiImage( code, true );
			}
		},
		
		/**
		 * Get the CKEditor element to use for a particular emoji
		 *
		 * @param 		{string}	code	Hexadecimal code(s) separated by -
		 * @returns 	{CKEDITOR.dom.element}
		 */
		editorElement = function( code ) {
			if ( ips.getSetting('emoji_style') == 'native' && code.substr( 0, 7 ) != 'custom-' ) {
				return CKEDITOR.dom.element.createFromHtml( "<span class='ipsEmoji'>" + this.emojiFromHex( code ) + "</span>" );
			} else {
				return CKEDITOR.dom.element.createFromHtml( this.emojiImage( code, false ) );
			}
		},
		
		/**
		 * Log that an emoji has been used for the "Recently Used" section
		 *
		 * @param 		{string}	code	Hexadecimal code(s) separated by -
		 * @returns 	{CKEDITOR.dom.element}
		 */
		logUse = function( code ) {
			var recentEmoji = [];
			if ( ips.utils.cookie.get( 'recentEmoji' ) ) {
				recentEmoji = ips.utils.cookie.get( 'recentEmoji' ).split(',');
			}
			
			var index = recentEmoji.indexOf( code );
			if ( index != -1 ) {
				recentEmoji.splice( index, 1 );
			}
			recentEmoji.unshift(code);
			recentEmoji.splice( 24 );
			
			ips.utils.cookie.set( 'recentEmoji', recentEmoji.join(','), true );
		};
		
		return {
			init: init,
			getEmoji: getEmoji,
			canRender: canRender,
			emojiFromHex: emojiFromHex,
			emojiImage: emojiImage,
			tonedCode: tonedCode,
			preview: preview,
			editorElement: editorElement,
			logUse: logUse
		};
	});

}(jQuery, _));

/* This is a polyfill for IE11 to support String.fromCodePoint, taken from
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint */
/*! https://mths.be/fromcodepoint v0.2.1 by @mathias */
if (!String.fromCodePoint) {
  (function() {
    var defineProperty = (function() {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch(error) {}
      return result;
    }());
    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;
    var fromCodePoint = function(_) {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
        return "";
      }
      var result = "";
      while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (
          !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                    codePoint < 0 || // not a valid Unicode code point
                    codePoint > 0x10FFFF || // not a valid Unicode code point
                    floor(codePoint) != codePoint // not an integer
        ) {
          throw RangeError("Invalid code point: " + codePoint);
        }
        if (codePoint <= 0xFFFF) { // BMP code point
          codeUnits.push(codePoint);
        } else { // Astral code point; split in surrogate halves
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          codePoint -= 0x10000;
          highSurrogate = (codePoint >> 10) + 0xD800;
          lowSurrogate = (codePoint % 0x400) + 0xDC00;
          codeUnits.push(highSurrogate, lowSurrogate);
        }
        if (index + 1 == length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    };
    if (defineProperty) {
      defineProperty(String, "fromCodePoint", {
        "value": fromCodePoint,
        "configurable": true,
        "writable": true
      });
    } else {
      String.fromCodePoint = fromCodePoint;
    }
  }());
}