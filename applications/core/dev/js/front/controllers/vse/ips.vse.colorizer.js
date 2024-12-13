/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.vse.colorizer.js - VSE colorizer controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.vse.colorizer', {

		initialize: function () {
            //this.on( 'change', "input[type='text']", this.colorChanged );
            this.on( 'change.spectrum move.spectrum', this.colorChanged );
			this.on( 'click', '[data-action="revertColorizer"]', this.revertChanges );
			this.on( 'click', '[data-action="invertColors"]', this.invertColors );
			this.setup();
		},

		setup: function () {
            var colors = {};
            var self = this;


			Debug.log( this.scope.data('styleData') );

			_.each( colorizer.startColors, function (value, key) {
				colors[ key ] = '#' + value;
			});

			this.scope.html( ips.templates.render( 'vse.colorizer.panel', colors ) );

            // Set up jscolor on the items
            ips.loader.get( ['core/interface/spectrum/spectrum.js'] ).then( function () {
				
				var inputs = self.scope.find('input[type="text"].color');
				
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
					
					$( this ).attr('data-original', $( this ).val()).spectrum( options );	
				})
            } );
		},

		/**
		 * Event handler for a color value being changed
		 * Determines the hue/sat for the selected color, then loops through all styles and applies it to the relevant ones
		 *
		 * @param		{event}		e 	Event object
		 * @returns 	{void}
		 */
		colorChanged: function (e, color) {
			var self = this;
            var type = $( e.target ).attr('data-role');
            var hsl = color.toHsl();

			if( _.isUndefined( colorizer[ type ] ) ){
				Debug.error("Can't find data for " + type);
				return;
			}

            this.trigger( 'colorized', {
                color: color.toHsl(),
                type: type
			});

			// Enable button
			this.scope.find('[data-action="revertColorizer"]').attr('disabled', false);
		},

		/**
		 * Reverts colors back to their default state
		 *
		 * @param		{object}	e 		Event object
		 * @returns 	{void}
		 */
		revertChanges: function (e) {
			var self = this;

			// Confirm with the user this is OK
			ips.ui.alert.show( {
				type: 'confirm',
				icon: 'warn',
				message: ips.getString('vseRevert'),
				subText: ips.getString('vseRevert_subtext'),
				callbacks: {
					ok: function () {
						self.trigger('revertChanges');
						self.trigger('closeColorizer');

						// Revert the colors in our text boxes too
						self.scope.find('.vseColorizer_swatch').each( function () {
							$( this ).spectrum('set', $( this ).attr('data-original') );
						});
					}
				}
			});
		},

		invertColors: function (e) {
			e.preventDefault();

			this.trigger('invertColors');
		},

		/**
		 * Updates a style background (color & gradient)
		 *
		 * @param		{object}	styleData 		Data for this style
		 * @param 		{string}	styleKey		Key in the main object that identifies this style
		 * @param 		{number}	h 				New hew
		 * @param 		{number}	s 				New saturation
		 * @returns 	{void}
		 */
		_updatebackground: function (styleData, styleKey, h, s) {
			if( _.isUndefined( styleData.background ) ){
				return;
			}

			if( styleData.background.color ){
				styleData.background.color = ips.utils.color.convertHex( styleData.background.color, h, s );
			}

			if( styleData.background.gradient ){
				for( var i = 0; i < styleData.background.gradient.stops.length; i++ ){
					styleData.background.gradient.stops[ i ][0] = ips.utils.color.convertHex( styleData.background.gradient.stops[ i ][0], h, s );
				}
			}

			this.trigger( 'styleUpdated', {
				selector: styleData.selector
			});
		},

		/**
		 * Updates a style font (color)
		 *
		 * @param		{object}	styleData 		Data for this style
		 * @param 		{string}	styleKey		Key in the main object that identifies this style
		 * @param 		{number}	h 				New hew
		 * @param 		{number}	s 				New saturation
		 * @returns 	{void}
		 */
		_updatefont: function (styleData, styleKey, h, s) {
			if( _.isUndefined( styleData.font ) || _.isUndefined( styleData.font.color ) ){
				return;
			}

			styleData.font.color = ips.utils.color.convertHex( styleData.font.color, h, s );

			this.trigger( 'styleUpdated', {
				selector: styleData.selector
			});
		}		
	});
}(jQuery, _));