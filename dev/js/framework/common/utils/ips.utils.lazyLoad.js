/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.utils.lazyLoad.js - Content lazy loading manager
 *
 * Author: Rikki Tissier
 */

;( function($, _, undefined){
	"use strict";
	
	ips.createModule('ips.utils.lazyLoad', function () {

		var _observer;
		var _rootMargin = "150px";
		var _threshold = 0;
		var _supportsObserver = true;
		var _registry = {};
		var _document = $( document );
		var contentSelector = "img[data-src], [data-background-src], iframe[data-embed-src], video[data-video-embed]";

		/**
		 * Initialize module
		 *
		 * @returns 	{void}
		 */
		var init = function () {
			if( !window.IntersectionObserver || _.isUndefined( window ) ){
				_supportsObserver = false;
			}
		},

		/**
		 * Observe intersection on an element
		 * Sets up an IntersectionObserver if it doesn't already exist
		 *
		 * @param 		{element}		node			Node to watch for intersections
		 * @param 		{function} 		loadCallback 	Optional callback function to handle loading the element's content. Replaces default behavior.
		 * @param 		{function} 		loadedCallback 	Optional callback function called after the element has loaded its content
		 * @returns 	{void}
		 */
		observe = function (node, callbacks, config) {
			var rawNode = node;

			if( node instanceof $ ){
				rawNode = node.get(0);
			}

			// Set default values
			config = _.defaults( config || {}, {
				rootMargin: _rootMargin,
				threshold: _threshold
			});

			// Create our observer if it doesn't exist. Note that we create one observer 
			// for the whole page, not one per observed element.
			if( !_observer ){
				_observer = new IntersectionObserver( _intersection, {
					rootMargin: config.rootMargin,
					threshold: config.threshold
				} );
			}

			if( rawNode.hasAttribute('data-loaded') ){
				return;
			}

			// If we're already observing this node, unobserve and start again
			try {
				_observer.unobserve(rawNode);
			} catch (err) { }

			if( _.isUndefined( callbacks ) ){
				callbacks = {};
			}

			// If this browser doesn't support IntersectionObserver, just load the images up front
			if( !_supportsObserver ){
				if( !_.isUndefined( callbacks.loadCallback ) ){
					callbacks.loadCallback.call(null, rawNode)
				} else {
					_load(rawNode);
				}
				return;
			}			

			if( !_.isUndefined( callbacks.loadCallback ) || !_.isUndefined( callbacks.loadedCallback ) || !_.isUndefined( callbacks.imgLoadedCallback ) ){
				_registry[ $( rawNode ).identify().attr('id') ] = {
					loadCallback: callbacks.loadCallback || null,
					loadedCallback: callbacks.loadedCallback || null,
					imgLoadedCallback: callbacks.imgLoadedCallback || null
				};
			}

			if( !_.isUndefined( callbacks.preloadCallback ) ){
				callbacks.preloadCallback.call(null, rawNode);
			} else {
				preload(rawNode);
			}

			_observer.observe(rawNode);
		},

		/**
		 * Set up padding on images within this node, so as to make them take up the appropriate
		 * spacing within the content before the image loads
		 *
		 * @param 		{element}		node	The element in which to search for images
		 * @returns 	{void}
		 */
		preload = function (rawNode) {
			if( _isImg(rawNode) && !rawNode.hasAttribute('data-loaded') && !rawNode.hasAttribute('data-loading') ){
				var lazyLoaded = [ rawNode ];
			} else {
				var lazyLoaded = rawNode.querySelectorAll('img[data-src]:not([data-loaded]):not([data-loading])');
			}

			_.each( lazyLoaded, function (element) {
				if( !element.hasAttribute('data-ratio') ){
					return;
				}

				// If the element has a css width applied to it in style, or a width attribute, we'll use that to
				// fix the sizes because our padding-bottom trick for responsive styles won't work in this case.
				if( ( ( element.hasAttribute('style') && element.style.width ) || element.hasAttribute('width') ) ){
					if( element.style.height !== 'auto'){
						var width = element.hasAttribute('style') && element.style.width ? element.style.width : element.width;
						element.style.height = parseInt( ( parseInt( width ) / 100 ) * element.getAttribute('data-ratio') ) + 'px';
					}
				} else {
					// 0 height is ok here because the padding bottom will cause the element to be visible
					// and therefore IntersectionObserver will see it
					element.style.height = '0';
					element.style.paddingBottom = parseFloat( element.getAttribute('data-ratio') ) + '%';
				}
			});
		},

		/**
		 * Handles looping through intersected elements.
		 *
		 * @param 		{array}		entries		The watched intersect elements
		 * @returns 	{void}
		 */
		_intersection = function (entries) {
			for( var i = 0; i < entries.length; i++ ){
				if( entries[i].isIntersecting || entries[i].intersectionRatio > 0 ){
					_observer.unobserve( entries[i].target );

					// It's possible the node we were watching is now unattached from the document
					// If that's the case, we don't need to do anything with it here.
					if( !document.body.contains( entries[i].target ) ){
						continue;
					}
					
					if( entries[i].target.id && !_.isUndefined( _registry[ entries[i].target.id ] ) && _.isFunction( _registry[ entries[i].target.id ].loadCallback ) ){
						_registry[ entries[i].target.id ].loadCallback.call(null, entries[i].target);
					} else {
						_load(entries[i].target);
					}
				}
			}
		},

		/**
		 * Default load handler. Replaces data-src, data-background-src and data-embed-src
		 *
		 * @param 		{element}		node			Node in which to load content
		 * @returns 	{void}
		 */
		_load = function (rawNode, imgLoadedCallback) {
			// To avoid expensive jquery objects here, we'll use vanilla JS to swap attributes
			// Work inside an IntersectionObserver should be as fast as possible to avoid jank
			if( _isImg(rawNode) || _isEmbed(rawNode) || _isBackgroundImg(rawNode) || _isVideo(rawNode) ){
				var itemsToLoad = [ rawNode ];
			} else {		
				var itemsToLoad = rawNode.querySelectorAll( contentSelector );
			}

			Debug.log('Loading ' + itemsToLoad.length + ' items...');

			_.each( itemsToLoad, function (element) {
				if( _isImg(element) ){
					// Normal images
					// If we have an imgLoadedCallback we need to pass that through here
					if( ( ( rawNode.id && !_.isUndefined( _registry[ rawNode.id ] ) && _.isFunction( _registry[ rawNode.id ].imgLoadedCallback ) ) || _.isFunction(imgLoadedCallback) ) ){
						replaceImg(element, imgLoadedCallback ? imgLoadedCallback : _registry[ rawNode.id ].imgLoadedCallback);
					} else {
						replaceImg(element);
					}					
				} else if ( _isBackgroundImg(element) ) {
					// Background images
					replaceBackgroundImg(element);
				} else if ( _isEmbed(element) ){
					// Embeds (including external imbeds that are routed through our handler)
					replaceEmbed(element);
				} else if( _isVideo(element) ){
					// Videos
					// This section of code REPLACES core.front.core.embeddedVideo's functionality
					// But we keep that controller around for legacy videos and editor live preview
					replaceVideo(element);
				}
			});

			// If we have a loaded callback, call it now
			if( rawNode.id && !_.isUndefined( _registry[ rawNode.id ] ) && _.isFunction( _registry[ rawNode.id ].loadedCallback ) ){
				_registry[ rawNode.id ].loadedCallback.call(null, rawNode);
			}
		},

		/**
		 * Determine if this is a supported image
		 *
		 * @param 		{element}		rawNode		Node to check
		 * @returns 	{boolean}
		 */
		_isImg = function (rawNode) {
			return rawNode.tagName.toLowerCase() == 'img' && rawNode.hasAttribute('data-src');
		},

		/**
		 * Determine if this is a supported background image
		 *
		 * @param 		{element}		rawNode		Node to check
		 * @returns 	{boolean}
		 */
		_isBackgroundImg = function (rawNode) {
			return rawNode.hasAttribute('data-background-src');
		},

		/**
		 * Determine if this is a supported embed
		 *
		 * @param 		{element}		rawNode		Node to check
		 * @returns 	{boolean}
		 */
		_isEmbed = function (rawNode) {
			return rawNode.tagName.toLowerCase() == 'iframe' && rawNode.hasAttribute('data-embed-src');
		},

		/**
		 * Determine if this is a supported video
		 *
		 * @param 		{element}		rawNode		Node to check
		 * @returns 	{boolean}
		 */
		_isVideo = function (rawNode) {
			return rawNode.tagName.toLowerCase() == 'video' && rawNode.hasAttribute('data-video-embed');
		},

		/**
		 * Loads the provided img element
		 *
		 * @param 		{element}			element				The image to load
		 * @param 		{function|void} 	imgLoadedCallback	Optional callback for image onload
		 * @returns 	{void}
		 */
		replaceImg = function (element, imgLoadedCallback) {
			// Set fixed height to prevent page bouncing as images load in (we'll reset to auto later)
			// However if the height is already auto, leave it as it is to let the browser handle it
			if( element.hasAttribute('style') && element.style.height !== 'auto'){
				element.style.height = element.offsetHeight + 'px';
			}

			// Reset the bottom padding now that the image is loading
			element.style.paddingBottom = '';
			// Image loaded event handler. Needs to be set *before* the src is changed, for compatibility.
			// Once image has finished loading, remove the fixed height
			element.addEventListener('load', function () {
				// If a width/height have been manually specified on this image, and we have a ratio, then calculate height manually
				// For other situations, just set height to auto
				if( element.hasAttribute('data-ratio') && element.hasAttribute('style') && element.style.width && element.style.height && element.style.height !== 'auto' ){
					element.style.height = parseInt( ( parseInt( element.style.width ) / 100 ) * element.getAttribute('data-ratio') ) + 'px';
				} else {				
					element.style.height = 'auto';
				}
				element.removeAttribute('data-loading');
				element.setAttribute('data-loaded', true);

				if( _.isFunction( imgLoadedCallback ) ){
					// If we have an imgLoaded callback, call it now
					imgLoadedCallback.call(null, element);
				}
			});
			// Now load the image
			element.src = element.getAttribute('data-src');
			element.setAttribute('data-loading', true);
		},

		/**
		 * Loads the provided background img element
		 *
		 * @param 		{element}			element				The element to load
		 * @returns 	{void}
		 */
		replaceBackgroundImg = function (element) {
			element.style.backgroundImage = "url('" + element.getAttribute('data-background-src') + "')";
		},

		/**
		 * Loads the provided embed
		 *
		 * @param 		{element}			element				The image to load
		 * @returns 	{void}
		 */
		replaceEmbed = function (element) {
			// We can't just the src on an iframe, because most browsers will create a history
			// entry, which will break the back button. Instead we have to copy the node,
			// set the src outside of the dom, then replace the current one.
			var copy = element.cloneNode();
			var src = element.getAttribute('data-embed-src');

			copy.setAttribute('src', src);
			copy.removeAttribute('data-embed-src');

			// URL of frames will contain protocol, but JS baseURL might not. 
			// Remove protocol here before comparing, to be safe.
			var srcWithoutProtocol = src.replace(/(^\w+:|^)\/\//, '');
			var baseWithoutProtocol = ips.getSetting('baseURL').replace(/(^\w+:|^)\/\//, '');

			// Internal embeds need our autosizing JS applied
			if( srcWithoutProtocol.startsWith( baseWithoutProtocol ) ){
				copy.setAttribute('data-controller', 'core.front.core.autoSizeIframe');
			}

			// Now replace and reinit
			element.parentNode.replaceChild(copy, element);
			_document.trigger('contentChange', [ $( copy ) ]);			
		},

		/**
		 * Loads the provided video element
		 *
		 * @param 		{element}			element				The image to load
		 * @returns 	{void}
		 */
		replaceVideo = function (element) {
			// Update source element to add src
			var sources = element.querySelectorAll('[data-video-src]');
			var canPlay = false;

			if( sources.length ){
				for( var i = 0; i < sources.length; i++ ){
					if( element.canPlayType( sources[i].getAttribute('type') ) ){
						// We can play this type, so set the src,
						// add our controller to the video and trigger an init
						element.setAttribute('src', sources[i].getAttribute('data-video-src'));
						sources[i].setAttribute('src', sources[i].getAttribute('data-video-src'));
						_document.trigger('contentChange', [ $( element ) ]);
						canPlay = true;
						break;
					}
				}
			}

			// If we can't play this video in this browser, replace it with either an embed, or a link
			if( !canPlay ){
				var embed = element.querySelector("embed");
				var link = element.querySelector(".ipsAttachLink");

				if( embed && embed.length ){
					element.parentNode.replaceChild( embed, element );
				} else {
					element.parentNode.replaceChild( link, element );
				}
			}					
		},

		/**
		 * Public method to call _load, which can be used to allow controllers to manage the loading process
		 *
		 * @param 		{element}		node			Node in which to load content
		 * @returns 	{void}
		 */
		loadContent = function (rawNode, imgLoadedCallback) {
			if( rawNode instanceof $ ){
				rawNode = rawNode.get(0);
			}
			_load(rawNode, imgLoadedCallback);
		},

		/**
		 * Takes a node and adds the attributes necessary for lazy-loading to work
		 * This is designed for create-time use, i.e. when uploading or attaching images
		 *
		 * @param 		{element}		node			Node to work with
		 * @param 		{object} 		dims 			width/height to use (instead of natural<dim>)
		 * @param 		{boolean}		forceUpdate 	Update the element even if data-loaded is set?
		 * @returns 	{void}
		 */
		applyLazyLoadAttributes = function (rawNode, dims, forceUpdate) {
			if( rawNode.tagName.toLowerCase() !== 'img' || ( ( rawNode.hasAttribute('data-loaded') || rawNode.hasAttribute('data-emoticon') ) && !forceUpdate ) ){
				return;
			}

			var _loadHandler = function () {
				dims = dims || {};
				var height = dims.height || rawNode.naturalHeight;
				var width = dims.width || rawNode.naturalWidth;

				if( height == 'auto' ){
					width = rawNode.offsetWidth;
					height = rawNode.offsetHeight;
				}

				if( !_.isUndefined( ips.getSetting('maxImageDimensions') ) )
				{
					if( width > ips.getSetting('maxImageDimensions').width )
					{
						width = ips.getSetting('maxImageDimensions').width;

						if( height && height != 'auto' )
						{
							height = parseInt( ( parseInt( width ) / 100 ) * ( ( height / width ) * 100 ).toFixed(2) );
						}
					}

					if( height > ips.getSetting('maxImageDimensions').height )
					{
						height = ips.getSetting('maxImageDimensions').height;

						width = parseInt( ( parseInt( height ) / 100 ) * ( ( width / height ) * 100 ).toFixed(2) );
					}
				}

				if( !rawNode.hasAttribute('width') && width ){
					rawNode.setAttribute('width', width);
				}

				var ratio = ( ( height / width ) * 100 ).toFixed(2);

				if( ratio ){
					rawNode.setAttribute('data-ratio', ratio );
				}

				rawNode.setAttribute('data-loaded', true);
			};


			if( rawNode.hasAttribute('data-loaded') ){
				_loadHandler();
			} else {
				rawNode.addEventListener('load', _loadHandler);
			}
		};

		init();

		return {
			observe: observe,
			preload: preload,
			loadContent: loadContent,
			applyLazyLoadAttributes: applyLazyLoadAttributes,
			replaceImg: replaceImg,
			replaceBackgroundImg: replaceBackgroundImg,
			replaceEmbed: replaceEmbed,
			replaceVideo: replaceVideo,
			contentSelector: contentSelector
		};
	});

}(jQuery, _));