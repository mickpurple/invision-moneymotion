/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.vse.main.js - Main VSE controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.vse.main', {

		_mainFrame: null,
		_mainWindow: null,
		_frameReady: false,
		_data: {},
		_originalData: {},
		_xrayOn: false,
		_customCSSOpen: false,
		_url: '',
		_unsaved: false,
		_codeMirror: null,
		_vseData: null,

		/**
		 * Initialization: set up our events
		 *
		 * @returns 	{void}
		 */
		initialize: function () {
			// Interface buttons
			this.on( 'click', '#vseStartXRay', this.toggleXRay );
			this.on( 'click', '#vseColorize', this.startColorizer );
			this.on( 'click', '#vseAddCustomCSS', this.toggleCustomCSS );
			this.on( 'click', '[data-action="buildSkin"]', this.buildSkin );
			this.on( 'click', '[data-action="cancelSkin"]', this.cancelSkin );
			// Class list
			this.on( 'click', '#vseClassList [data-styleID]', this.selectClass );
			this.on( 'click', '[data-action="back"]', this.editorBack );
			this.on( 'change.spectrum move.spectrum', this.colorChange );
			// Messages coming from panels
			this.on( 'colorized', this.styleColorized );
			this.on( 'styleUpdated', this.styleUpdated );
			this.on( 'revertChanges', this.revertChanges );
			this.on( 'invertColors', this.invertColors );
			this.on( 'click', '[data-action="colorizerBack"]', this.colorizerBack );
			this.on( 'closeColorizer', this.colorizerBack );
			this.on( 'change', '#ipsTabs_vseSection_vseSettingsTab_panel :input', this.settingChanged );
			// Window events
			this.on( window, 'message', this.handleCommand );
			this.on( window, 'beforeunload', this.windowBeforeUnload );

			this.setup();
		},
		
		/**
		 * Setup
		 *
		 * @returns 	{void}
		 */
		setup: function () {
			var self = this;

			this._mainFrame = $('#vseMainWrapper');
			this._mainWindow = this._mainFrame.find('iframe').get(0).contentWindow;

			if( !ipsVSEData || !_.isObject( ipsVSEData ) || !colorizer || !_.isObject( colorizer ) ){
				Debug.error("VSE JSON data not found, cannot continue.");
				return;
			}
			
			//this._originalData = $.extend( true, {}, ipsVSEData );
			//this._data = this.getVSEData();

			// Build URL
			var url = ips.utils.url.getURIObject( window.location.href );
			this._url = url.protocol + '://' + url.host;
			if ( url.port && url.port != 80 ) {
				this._url = this._url + ':' + url.port;
			}

			// Set up codemirrior
			this._codeMirror = CodeMirror.fromTextArea( document.getElementById('vseCustomCSS_editor'), { 
				mode: 'css',
				lineWrapping: true,
				lineNumbers: true
			});

			this._codeMirror.setSize( null, 235 );
			this._codeMirror.on( 'change', function (doc, cm) {
				self._updateCustomCSS();
			});

			$('#vseCustomCSS').hide();

			this._buildClassList();
		},

		/**
		 * Event handler for changing a color in a Spectrum color field
		 *
		 * @param 		{event} 	e 		Event
		 * @param 		{object} 	color 	The tinycolor object passed by spectrum
		 * @returns 	{void}
		 */
		colorChange: function (e, color) {
			this._updateCssVar( $( e.target ).attr('data-key'), color );
		},

		/**
		 * Invert every color swatch. Fairly naive implementation, simply flips the luminence value
		 *
		 * @param 		{event} 	e
		 * @returns 	{void}
		 */
		invertColors: function (e) {
			e.preventDefault();

			var swatches = this.scope.find('#vseClassList input.vseClass_swatch');
			var self = this;

			_.each( swatches, function (swatch) {
				var $swatch = $( swatch );
				var setting = $swatch.attr('data-key');
				var color = $swatch.spectrum('get').toHsl();

				color.l = 1 - color.l;

				var updatedColor = $swatch.spectrum('set', color).spectrum('get');

				self._updateCssVar( setting, updatedColor );
			});
		},

		/**
		 * Send a command to the main window to update a particular CSS variable value
		 *
		 * @param 		{string} 	key 	The key to be updated
		 * @param 		{object} 	color 	tinycolor color object to be applied
		 * @returns 	{void}
		 */
		_updateCssVar: function (key, color) {
			this.sendCommand('updateVar', {
				var: key,
				color: color.toRgb()
			});

			this._unsaved = true;
		},

		/**
		 * Merge resume data with vseData
		 *
		 * @return {object}
		 */
		_getVSEData: function()	{
			if ( _.isObject( this._vseData ) ){
				return this._vseData;
			}
			
			this._vseData = ipsVSEData;			
			this._vseData.colors = ipsResumeVse.colors;
			
			return this._vseData;
		},
		
		/**
		 * Builds the class list, from which the user can choose which class to edit
		 *
		 * @returns 	{void}
		 */
		_buildClassList: function () {
			var self = this;
			var output = '';

			_.each( this._getVSEData().sections, function (value, key) {
				output += ips.templates.render('vse.classes.title', {
					title: ips.getString( 'vseSection_' + key ),
					key: key
				});

				if( _.isObject( value ) && _.size( value ) ){
					_.each( value, function (item, itemKey) {
						output += ips.templates.render('vse.classes.item', {
							title: item.title,
							styleid: key + '_' + itemKey,
							swatch: self._buildSwatch( item, true )
						});
					});
				}
			});

			this.scope.find('#vseClassList > ul').html( output );

			
			// Build each color picker
			ips.loader.get( ['core/interface/spectrum/spectrum.js'] ).then( function () {
				
				var inputs = self.scope.find('#vseClassList input.vseClass_swatch');
				
				inputs.each( function () {
					var options = {
						type: "color",
						clickoutFiresChange: true,
						hideAfterPaletteSelect: true,
						preferredFormat: "hex",
						showAlpha: false,
						allowEmpty: false,
						showInput: true,
						showInitial: true,
						replacerClassName: this.className
					};
					
					$( this ).spectrum( options );	
				})
			} );
		},
		
		/**
		 * Builds style properties to be used on the swatch in the class list
		 *
		 * @param		{object} 	data 		Key/value pairs of styles to be changed
		 * @param 		{boolean} 	toString 	If true, object is turned into string to use in style=''
		 * @returns 	{object}	Object containing `back` and `fore` keys
		 */
		_buildSwatch: function (data, toString) {
			
			var toReturn = { back: false, fore: false };
			
			if( !_.isUndefined( data.settings.background ) && !_.isUndefined( this._vseData.colors[ data.settings.background ] ) ){
				toReturn.back = {
					color: "rgb(" + this._vseData.colors[ data.settings.background ] + ")",
					key: data.settings.background
				};
			}

			if( !_.isUndefined( data.settings.foreground ) && !_.isUndefined( this._vseData.colors[ data.settings.foreground ] ) ){
				toReturn.fore = {
					color: "rgb(" + this._vseData.colors[ data.settings.foreground ] + ")",
					key: data.settings.foreground
				};
			}

			return toReturn;
		},

		/**
		* Colorize some settings
		*
		* @param 	{event} 	e 		Event
		* @param 	{object} 	data 	data object, containing `type` (which colorizer group) and `color` (tinycolor object with the source color)
		* @returns 	{void}
		*/
		styleColorized: function (e, data) {
			var hue = data.color.h;
			var type = data.type;
			var settings = colorizer[ type ];
			var self = this;

			var sat = data.color.s * 100;
			var lig = data.color.l * 100;

			_.each( settings, function (setting) {				
				var control = self.scope.find('[data-key="' + setting + '"]');
				var currentColor = tinycolor( 'rgb(' + self._vseData.colors[ setting ] + ')' ).toHsl();
	
				currentColor.h = data.color.h;
				currentColor.s = Math.max( Math.min( ( sat / 100 ) * currentColor.s, 1 ), 0 );

				var currentLig = currentColor.l * 100;
				var newLig = data.color.l * 100;

				// Difference in lightness
				var lightnessDiff = currentLig - newLig;

				// percentage of difference to apply
				var remainder = 100 - currentLig;
				var percentDiff = ( lightnessDiff / 100 ) * remainder;

				// Returned to a fraction
				var fraction = percentDiff / 100;

				// Applied to L
				currentColor.l = currentColor.l - fraction;

				var updatedColor = control.spectrum('set', currentColor).spectrum('get');

				self._updateCssVar( setting, updatedColor );
			});
	   	},

		
		/**
		 * Sends the provided command to the frame window
		 *
		 * @param 		{string} 	command 		The command to send
		 * @param 		{object} 	data			Data to send
		 * @returns 	{void}
		 */
		sendCommand: function (command, data) {
			this._mainWindow.postMessage( _.extend( data || {}, { command: command } ), this._url );
		},
		
		/**
		* Handles a command from the frame window, running one of our own methods if it exists
		*
		* @param 		{event} 	e 		Event object
		* @returns 	{void}
		*/
	   	handleCommand: function (e) {
		   if( e.originalEvent.origin != this._url ){
			   Debug.error("Invalid origin");
			   return;
		   }

		   var commandName = 'command' + e.originalEvent.data.command.charAt(0).toUpperCase() + e.originalEvent.data.command.slice(1);

		   if( !_.isUndefined( this[ commandName ] ) ){
			   this[ commandName ]( e.originalEvent.data );
		   }
	   	},

		/**
		 * Builds/shows the colorizer panel
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		startColorizer: function (e) {
			e.preventDefault();

			// Disable the two buttons
			$('#vseColorize, #vseStartXRay').attr('disabled', true);

			this.scope.find('#vseClassWrap').hide();
			ips.utils.anim.go('fadeIn', this.scope.find('#vseColorizerPanel') );
		},

		/**
		 * Event handler for back button on the colorizer panel
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		colorizerBack: function (e) {
			e.preventDefault();

			// Disable the two buttons
			$('#vseColorize, #vseStartXRay').attr( 'disabled', false );

			this.scope.find('#vseColorizerPanel').hide();
			ips.utils.anim.go('fadeIn', this.scope.find('#vseClassWrap') );
		},

		/**
		 * Event handler for the 'show custom css' pane
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		toggleCustomCSS: function (e) {
			e.preventDefault();

			if( this._customCSSOpen ){
				$( e.currentTarget ).removeClass('ipsButton_normal').addClass('ipsButton_primary');
				this._customCSSOpen = false;
				$('#vseCustomCSS').hide();
				$('#vseMainWrapper').css({ bottom: '0px' });
			} else {
				$( e.currentTarget ).removeClass('ipsButton_primary').addClass('ipsButton_normal');
				this._customCSSOpen = true;
				ips.utils.anim.go( 'fadeIn', $('#vseCustomCSS') );
				$('#vseMainWrapper').css({ bottom: '300px' });
			}
		},

		/**
		 * Event handler for the 'select element' button. Toggles xray functionality.
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		toggleXRay: function (e) {
			e.preventDefault();

			if( this._xrayOn ){
				$( e.currentTarget ).removeClass('ipsButton_normal').addClass('ipsButton_primary');
				this._xrayOn = false;
				this.stopXRay();
			} else {
				$( e.currentTarget ).removeClass('ipsButton_primary').addClass('ipsButton_normal');
				this._xrayOn = true;
				this.startXRay();
			}
		},

		/**
		 * Sends command to frame to start XRay
		 *
		 * @returns 	{void}
		 */
		startXRay: function () {
			this.sendCommand('xrayStart');
		},

		/**
		 * Sends command to frame to stop XRay
		 *
		 * @returns 	{void}
		 */
		stopXRay: function () {
			this.sendCommand('xrayCancel');

			// Remove results if any
			this.scope
				.find('#vseClassList > ul')
					.find('> li[data-role="xrayResultsTitle"]')
						.remove()
					.end()
					.find('> li')
						.show();
		},

		/**
		 * Tells the window to update the custom CSS contents
		 *
		 * @returns 	{void}
		 */
		_updateCustomCSS: function () {
			this._unsaved = true;
			this._codeMirror.save();
			
			this.sendCommand('updateCustomCSS', {
				css: $('#vseCustomCSS_editor').val()
			});
		},

		/**
		 * Responds to a command from the frame indicating that it is ready
		 *
		 * @returns 	{void}
		 */
		commandWindowReady: function () {
			this._frameReady = true;
			this.sendCommand('varValues', {
				values: this._getVarValues()
			});
		},

		/**
		 * Responds to a command from the frame, sending a complete stylesheet object in response
		 *
		 * @returns 	{void}
		 */
		commandGetStylesheet: function () {
			this.sendCommand('createStylesheet', {
				stylesheet: this.scope.find('#vseCustomCSS_editor').val()
			});
		},

		/**
		 * When the xray has determined which css variables apply to the selected element, this
		 * method shows all the relevant rows and hides the others.
		 *
		 * @param 		{object} 	data 	Data from the main window, containing `vars` which is an array of settings that apply to the element
		 * @returns 	{void}
		 */
		commandVarsMatched: function (data) {
			this.scope.find('#vseClassList > ul > li').hide();

			// Find each of the rows that contains our settings
			var selector = _.map( data.vars, function (thisVar) {
				return "[data-key='" + thisVar + "']";
			}).join(',');

			this.scope.find('#vseClassList > ul').find( selector ).closest('li').show();
		},

		/**
		 * Returns an object containing every one of the current color values in rgb format
		 *
		 * @returns 	{array}  Array containing objects, each with `var` (variable name) and `color` (object with r, g, b keys)
		 */
		_getVarValues: function () {
			var swatches = this.scope.find('#vseClassList input.vseClass_swatch');
			var output = [];

			_.each( swatches, function (swatch) {
				output.push({
					var: $( swatch ).attr('data-key'),
					color: $( swatch ).spectrum('get').toRgb()
				});
			});

			return output;
		},

		/**
		 * Event handler for the window unloading.
		 * If we have unsaved changes, warn the user before leaving
		 *
		 * @returns 	{void}
		 */
		windowBeforeUnload: function (e) {
			if( this._unsaved ){
				return "You haven't saved this theme. By leaving this page, you will lose any changes you've made.";
			}
		},

		/**
		 * Builds this skin by sending data to the backend
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		buildSkin: function (e) {
			var self = this;
			
			if( !this._unsaved ){
				ips.ui.alert.show( {
					type: 'alert',
					icon: 'info',
					message: ips.getString('vseNoChanges'),
					callbacks: {}
				});

				return;
			}

			ips.getAjax()( ipsSettings['baseURL'] + '?app=core&module=system&controller=vse&do=build' + '&csrfKey=' + ipsSettings['csrfKey'], {
				type: 'post',
				data: this._buildFinalStyleData(),
				showLoading: true
			})
				.done( function (response) {
					self._unsaved = false;

					ips.ui.alert.show( {
						type: 'verify',
						icon: 'success',
						message: ips.getString('vseSkinBuilt'),
						buttons: { yes: ips.getString('yes'), no: ips.getString('no') },
						callbacks: {
							yes: function () {
								self._closeEditor( ipsSettings['baseURL'] + '?app=core&module=system&controller=vse&do=home&id=' + response.theme_set_id + '&csrfKey=' + ipsSettings['csrfKey'] );
							}
						}
					});
				})
				.fail( function (jqXHR, textStatus, errorThrown) {
					
					Debug.log("Error saving theme:");
					Debug.error( textStatus );

					ips.ui.alert.show( {
						type: 'alert',
						icon: 'warn',
						message: ips.getString('vseSkinBuilt_error'),
						callbacks: {}
					});
				});
		},

		/**
		 * Event handler for 'close editor' button
		 *
		 * @returns 	{void}
		 */
		cancelSkin: function (e) {
			e.preventDefault();

			var self = this;

			if( this._unsaved ){
				ips.ui.alert.show( {
					type: 'confirm',
					icon: 'question',
					message: ips.getString('vseUnsaved'),
					callbacks: {
						ok: function () {
							self._closeEditor( $( e.currentTarget ).attr('href') );
						}
					}
				});
			} else {
				this._closeEditor( $( e.currentTarget ).attr('href') );
			}
		},

		/**
		 * Reverts all changes, changing colors back to their original state when the page was loaded
		 *
		 * @returns 	{void}
		 */
		revertChanges: function () {
			var self = this;
			var swatches = this.scope.find('#vseClassList input.vseClass_swatch');

			_.each( swatches, function (swatch) {
				var $swatch = $( swatch );
				var setting = $swatch.attr('data-key');
				var originalColor = self._vseData.colors[ setting ];
				var updatedColor = $swatch.spectrum('set', 'rgb(' + originalColor + ')' ).spectrum('get');

				self._updateCssVar( setting, updatedColor );
			});

			this._unsaved = false;
		},

		/**
		 * Takes our data object and turns it into a stylesheet and an object representing settings to be updated
		 *
		 * @returns 	{object}
		 */
		_buildFinalStyleData: function () {
			var self = this;
			var settingsObj = {};
			var stylesObj = {};
			var styleBlock = '';
			var orig = this._originalData;

			// Get every swatch and build a settings object
			var swatches = this.scope.find('#vseClassList input.vseClass_swatch');
			var colors = {};

			_.each( swatches, function (swatch) {
				var $swatch = $( swatch );
				colors[ $swatch.attr('data-key') ] = $swatch.spectrum('get').toHex();
			});

			// Get other form fields
			this.scope.find('#ipsTabs_vseSection_vseSettingsTab_panel :input').each( function () {
				settingsObj[ $( this ).attr('name') ] = $( this ).val();
			});

			return {
				customcss: $('#vseCustomCSS_editor').val(),
				colors: colors,
				settings: settingsObj
			};
		},
		
		/**
		 * Close the editor by calling the close method, then redirecting.
		 *
		 * @returns 	{void}
		 */
		_closeEditor: function ( url ) {
			ips.getAjax()( ipsSettings['baseURL'] + '?app=core&module=system&controller=vse&do=close', {
				showLoading: true
			})
				.always( function () {
					window.location = url || ips.getSetting('baseURL');
				});
		},
	});

}(jQuery, _));