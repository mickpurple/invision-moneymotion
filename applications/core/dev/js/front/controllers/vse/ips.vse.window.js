/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.vse.observer.js - Observing VSE controller. Initialized globally and listens for messages from the VSE interface
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.vse.window', {

		_stylesheet: null,
		_variables: [],
		_events: {},
		_exclude: null,
		_xrayElem: null,
		_url: '',

		initialize: function () {
			this.on( window, 'message', this.handleCommand );
			this.setup();
		},

		/**
		 * Setup method - adds our injected stylesheet for later, and sends commands to let the main window know we're ready
		 *
		 * @returns 	{void}
		 */
		setup: function () {
			// Build the initial stylesheet elements
			$('head')
				.append( $('<style/>').attr('type', 'text/css').attr('id', 'elInjectedStyles') )
				.append( $('<style/>').attr('type', 'text/css').attr('id', 'elCustomCSS') );

			this._stylesheet = $('#elInjectedStyles');
			this._custom = $('#elCustomCSS');
			this._root = document.documentElement;

			// Build URL
			var url = ips.utils.url.getURIObject( window.location.href );
			this._url = url.protocol + '://' + url.host;
			if ( url.port && url.port != 80 ) {
				this._url = this._url + ':' + url.port;
			}

			this.sendCommand('windowReady');
			this.sendCommand('getStylesheet'); // Ask the window for the initial stylesheet
		},

		/**
		 * Handles commands from the main window, executing the appropriate method here.
		 *
		 * @param		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		handleCommand: function (e) {
			if( e.originalEvent.origin != this._url ){
				Debug.error("Invalid origin");
				return;
			}

			var pieces = e.originalEvent.data.command.split('.');
			var obj = this;

			for( var i = 0; i < pieces.length - 1; i++ ){
				if( !_.isUndefined( obj[ pieces[ i ] ] ) ){
					obj = obj[ pieces[ i ] ];
				} else {
					Debug.error( "Couldn't run vse.window." + e.originalEvent.data.command );
					return;
				}
			}

			if( obj[ pieces[ pieces.length - 1 ] ] ){
				obj[ pieces[ pieces.length - 1 ] ]( e.originalEvent.data );
			} else {
				Debug.error( "Couldn't run vse.window." + e.originalEvent.data.command );
				return;
			}
		},

		/**
		 * Sends a command to the main window
		 *
		 * @param		{string} 	command 	Command name
		 * @param 		{object} 	data 		Data object
		 * @returns 	{void}
		 */
		sendCommand: function (command, data) {
			top.postMessage( _.extend( data || {}, { command: command } ), this._url );
		},
		
		/**
		 * Command from the main controller letting us know a variable has been updated
		 *
		 * @param 		{object} 	data 		Data object
		 * @returns 	{void}
		 */
		updateVar: function (data) {
			this._root.style.setProperty('--theme-' + data.var, data.color.r + ", " + data.color.g + ", " + data.color.b);
		},

		varValues: function (data) {
			var self = this;

			_.each( data.values, function (value) {
				self.updateVar(value);
			});
		},

		/**
		 * Updates the freeform style tag with custom css
		 *
		 * @param 		{object} 	data 		Data object
		 * @returns 	{void}
		 */
		updateCustomCSS: function (data) {
			this._custom.html( data.css );
		},
		

		/**
		 * The main window has sent us selector data, which the xRay will use to find elements
		 *
		 * @param 		{object} 	data 		Data object
		 * @returns 	{void}
		 */
		selectorData: function (data) {
			//this._selectors = data.selectors;
			this._variables = data.variables;
		},

		/**
		 * Replaces the injected stylesheet contents with new content, built from the data object
		 *
		 * <code>
		 * {
		 *		classes: {
		 *			'body': {
		 *				'background-color': 'red'
		 *			},
		 *			'.ipsButton': {
		 *				'color': 'blue'
		 *			}
		 *		}
		 * 	}
		 * </code>
		 * @param		{object} 	data 	Object of style data
		 * @returns 	{void}
		 */
		createStylesheet: function (data) {
			this._custom.html( data.stylesheet || '' );
		},			

		/**
		 * Starts the xray
		 *
		 * @returns 	{void}
		 */
		xrayStart: function () {
			this._createXRayElem();

			this._events['down'] = $( document ).on( 'mousedown.xray', _.bind( this._doDown, this ) );
			this._events['move'] = $( document ).on( 'mousemove.xray', _.bind( this._doFalse, this ) );
			this._events['over'] = $( document ).on( 'mouseover.xray', _.bind( this._doOver, this ) );
		},

		/**
		 * Cancels the xray
		 *
		 * @returns 	{void}
		 */
		xrayCancel: function () {
			if( this._xrayElem && this._xrayElem.length ){
				this._xrayElem.remove();
			}

			this._stop();
		},

		/**
		 * Stops the xray
		 *
		 * @returns 	{void}
		 */
		_stop: function () {
			$( document ).off('.xray');
		},

		/**
		 * Initializes the xray function by resizing/positioning the xray element to fit the currently-hovered element
		 *
		 * @param		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		_doXray: function (e) {
			e.preventDefault();

			var elem = $( e.target );

			if( elem.is( this._exclude ) ){
				return;
			}

			var elemPosition = ips.utils.position.getElemPosition( elem );
			var elemDims = { width: elem.outerWidth(), height: elem.outerHeight() };

			this._xrayElem.css({
				width: elemDims.width + 'px',
				height: elemDims.height + 'px',
				left: elemPosition.absPos.left + 'px',
				top: elemPosition.absPos.top + 'px',
				zIndex: ips.ui.zIndex()
			});
		},

		/**
		 * Event handler for mousedown
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		_doDown: function (e) {
			e.preventDefault();
			this._doXray(e);
			this._stop();

			this._findMatchingSelectors( $( e.target ) );
		},

		/**
		 * Event handler for mouseover
		 * Highlight the hovered element
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		_doOver: function (e) {
			this._doXray(e);
		},

		/**
		 * Called to prevent xray events from bubbling
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		_doFalse: function (e) {
			e.preventDefault();
		},

		/**
		 * Creates the xray element and attaches it to body ready for this._doXray
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		_createXRayElem: function () {
			if( $('#vseXRay').length ){
				$('#vseXRay').remove();
			}

			$('body').append( $('<div/>').attr( 'id', 'vseXRay' ) );

			this._xrayElem = $('#vseXRay');
		},

		/**
		 * Finds the ancestors of the clicked elemented, and matches selectors from our list
		 * Sends command to the main controller with our results
		 *
		 * @param 		{element} 	elem 		Clicked element
		 * @returns 	{void}
		 */
		_findMatchingSelectors: function (elem) {
			
			var self = this;
			var toReturn = [];
			
			var loopSheets = function (thisElem) {
				var rules = self._cssRules( thisElem );
				// If we got rules, loop through them and see if we find any vars
				if( rules.length ){
					for( var i = 0; i < rules.length; i++ ){
						var matches = rules[ i ].match(/\-\-theme\-(\w+)/i);

						if( matches && matches.length ){
							toReturn.push( matches[1] ); 
						}
					}
				}

				if( thisElem.parentNode ){
					loopSheets( thisElem.parentNode );
				}

				return;
			};

			loopSheets( elem.get(0) );

			this.sendCommand( 'varsMatched', {
				vars: toReturn
			});
		},
		
		/**
		 * Fetches all the css rules applying to the given element (but not inherited rules)
		 *
		 * @param 		{element} 	el 		Element
		 * @returns 	{array}
		 */
		_cssRules(el) {
			var sheets = document.styleSheets, ret = [];
			el.matches = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector 
				|| el.msMatchesSelector || el.oMatchesSelector;
			for (var i in sheets) {
				try {
					var rules = sheets[i].rules || sheets[i].cssRules;
					for (var r in rules) {
						if (el.matches(rules[r].selectorText)) {
							ret.push(rules[r].cssText);
						}
					}
				} catch (err) {
					//console.log("Stylesheet not available");
				}
			}
			return ret;
		}
	});
}(jQuery, _));