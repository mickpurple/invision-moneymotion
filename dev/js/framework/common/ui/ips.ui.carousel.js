/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.ui.carousel.js - Carousel widget
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.createModule('ips.ui.carousel', function(){

		var defaults = {
			item: ".ipsCarousel_item",
			shadows: true
		};

		/**
		 * Responder for carousel widget
		 *
		 * @param	{element} 	elem 		The element this widget is being created on
		 * @param	{object} 	options 	The options passed into this instance
		 * @returns {void}
		 */
		var respond = function (elem, options) {
			if( !$( elem ).data('_carousel') ){
				$( elem ).data('_carousel', carouselObj(elem, _.defaults( options, defaults ) ) );
			}
		},

		/**
		 * Destruct this widget on this element
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
		 * Retrieve the carousel instance (if any) on the given element
		 *
		 * @param	{element} 	elem 		The element to check
		 * @returns {mixed} 	The carousel instance or undefined
		 */
		getObj = function (elem) {
			if( $( elem ).data('_carousel') ){
				return $( elem ).data('_carousel');
			}

			return undefined;
		};

		/**
		 * Carousel instance
		 *
		 * @param	{element} 	elem 		The element this widget is being created on
		 * @param	{object} 	options 	The options passed into this instance
		 * @returns {void}
		 */
		var carouselObj = function (elem, options) {

			var rtlMode = ( $('html').attr('dir') == 'rtl' );
			var currentItemCount = 0;
			var currentStartPos = 0; // Right edge for RTL, left edge for LTR
			var currentFirstItem = null;
			var ui = {};
			var slideshowTimer = null;
			var slideshowTimeout = 4000;
			var animating = false;

			/**
			 * Sets up this instance
			 *
			 * @returns 	{void}
			 */
			var init = function () {
				currentItemCount = elem.find( options.item );

				ui = {
					itemList: elem.find('[data-role="carouselItems"]'),
					next: elem.find('[data-action="next"]'),
					prev: elem.find('[data-action="prev"]'),
					nextShadow: elem.find('.ipsCarousel_shadowRight'),
					prevShadow: elem.find('.ipsCarousel_shadowLeft')
				};

				if( !options.shadows ){
					ui.nextShadow.hide();
					ui.prevShadow.hide();
				}

				var startPos = rtlMode ? parseInt( ui.itemList.css('right') ) : parseInt( ui.itemList.css('left') );

				if( !_.isNaN( startPos ) ){
					currentStartPos = startPos;
				}
				
				_build();
				
				/* Rebuild after all the images have been loaded in case we need to adjust the height */
				var images = elem.find('img[src]').length;
				elem.find('img[src]').load( function(){
					images--;
					if ( !images ) {
						_build();
					}
				} );
				_checkNav();

				elem.on( 'click', "[data-action='next']", _navNext );
				elem.on( 'click', "[data-action='prev']", _navPrev );
				elem.on( 'contentTruncated', _updateHeight );
				elem.on( 'gridRedraw.grid', _updateHeight );

				// Add touch controls
				var mc = new Hammer( elem[0] );
				mc.on( 'panleft', function( e ) {
					if( !animating ){
						if( rtlMode ){
							_navPrev();
						} else {
							_navNext();
						}
					}
				} );
				mc.on( 'panright', function( e ) {
					if( !animating ){
						if( rtlMode ){
							_navNext();
						} else {
							_navPrev();
						}
					}
				} );

				if( options.slideshow ){
					// Start the timer for the slideshow
					slideshowTimer = setTimeout( _slideshowNext, slideshowTimeout );
					
					elem
						.on( 'mouseenter', function () {
							clearTimeout( slideshowTimer );
						})
						.on( 'mouseleave', function () {
							clearTimeout( slideshowTimer );
							slideshowTimer = setTimeout( _slideshowNext, slideshowTimeout );
						});
				}

				$( window ).on( 'resize', _resize );

				//elem.find('.ipsCarousel_inner').on( 'scroll', _checkNav );
			},

			/**
			 * Destruct this instance, unregistering event handlers
			 *
			 * @returns 	{void}
			 */
			destruct = function () {
				$( window ).off( 'resize', _resize );
				elem.off( 'click', "[data-action='next']", _navNext );
				elem.off( 'click', "[data-action='prev']", _navPrev );
				elem.off( 'contentTruncated', _updateHeight );
				elem.off( 'gridRedraw.grid', _updateHeight );
				elem.find('.ipsCarousel_inner').off( 'scroll', _checkNav );
				clearTimeout( slideshowTimer );
			},

			/**
			 * Build the carousel ui
			 *
			 * @returns 	{void}
			 */
			_build = function () {
				var maxHeight = _getMaxHeight();
				var elemWidth = 0;

				// Set the height of the carousel to be as high as the highest item
				elem.find('.ipsCarousel_inner').css({
					height: maxHeight + ( parseInt( elem.find('.ipsCarousel_inner').css('padding-top') ) + parseInt( elem.find('.ipsCarousel_inner').css('padding-bottom') ) ) + 'px'
				});

				// Are we making the items full width?
				if( options.fullSizeItems ){
					elemWidth = elem.find('.ipsCarousel_inner').outerWidth( true );
				}

				// Now align all the other items vertically
				elem.find( options.item ).each( function (item) {
					var height = $( this ).outerHeight();
					var diff = maxHeight - height;

					if( options.fullSizeItems ){
						$( this ).css({
							width: elemWidth + 'px'
						});
					}
				});

				elem.find( '[data-role="carouselItems"]' ).css({
					width: _getCurrentWidth() + 'px'
				})

				currentFirstItem = elem.find( options.item ).first();

				_buildNav();
			},

			/**
			 * When content is truncated, the max height of the items may change, so that
			 * event triggers this method to recalculate the height.
			 *
			 * @returns 	{void}
			 */
			_updateHeight = function () {
				var maxHeight = _getMaxHeight();

				// Set the height of the carousel to be as high as the highest item
				elem.find('.ipsCarousel_inner').css({
					height: maxHeight + 'px'
				});
			},

			/**
			 * Moves to the next item automatically as part of the slideshow
			 *
			 * @returns 	{void}
			 */
			_slideshowNext = function () {
				// If there's a next or prev button, we know we can call navNext or navPrev. They return a promise
				// so that we can re-set our timer after the animation is finished.
				if( ui.next.not('[data-disabled]').length ){
					_navNext().done( function () {
						slideshowTimer = setTimeout( _slideshowNext, slideshowTimeout );
					});
				} else if( ui.prev.not('[data-disabled]').length ){
					_navPrev( null, true ).done( function () {
						slideshowTimer = setTimeout( _slideshowNext, slideshowTimeout );
					});
				}
			},

			/**
			 * Event handler for the Next button
			 *
			 * @returns 	{object}	Returns promise, resolved after animation finishes
			 */
			_navNext = function (e) {
				if( e ){
					e.preventDefault();
				}

				// Get the first item which isn't completely shown; that will be our next first item
				var items = elem.find( options.item );
				var wrapperWidth = elem.outerWidth();
				var listWidth = _getCurrentWidth();
				var forceNext = false;
				var deferred = $.Deferred();

				var nextFirst = _.find( items, function (item, idx) {
					// If our previous iteration forced this one to be the current item, return now.
					if( forceNext ){
						return true;
					}

					var width = $( item ).outerWidth();
					var adjustedStartPos = currentStartPos;
					var stayOnScreen = adjustedStartPos + wrapperWidth;

					if( rtlMode ){
						// These values are all relative to the right-hand side of the carousel frame
						var margin = parseInt( $( item ).css('marginLeft') );
						var startEdge = ui.itemList.outerWidth() - ( $( item ).position().left + width ) - margin; // right edge
						var endEdge = startEdge + width;  // left edge

						// If this is off to the right of the screen, just cancel
						if( startEdge < adjustedStartPos ){
							return false;
						}

						// If the left edge is the exact same pixel as the end of the viewable area, or this item is
						// wider than the viewable area (e.g. on mobile), then force the next item to be the one we show
						if ( ( endEdge == stayOnScreen || startEdge == stayOnScreen && endEdge > adjustedStartPos ) ){
							forceNext = true;
						}

						// Otherwise, if the right edge is visible but the left edge isn't, this is the item to show
						if( startEdge < stayOnScreen && endEdge > stayOnScreen ){
							return true;
						}

						// Lastly if we haven't found one yet, get the next image that's off screen
						if( startEdge > stayOnScreen ){
							return true;
						}
					} else {
						var margin = parseInt( $( item ).css('marginRight') );
						var startEdge = $( item ).position().left; // left edge
						var endEdge = startEdge + width; // right edge
						
						// If this is off to the left of the screen, just cancel
						if( startEdge < adjustedStartPos ){
							return false;
						}

						// If the right edge is the exact same pixel as the end of the viewable area, or this item is
						// wider than the viewable area (e.g. on mobile), then force the next item to be the one we show
						if ( ( endEdge == stayOnScreen || startEdge == currentStartPos && endEdge > stayOnScreen ) ){
							forceNext = true;
						}

						// Otherwise, if the left edge is visible but the right edge isn't, this is the item to show
						if( startEdge < stayOnScreen && endEdge > stayOnScreen ){
							return true;
						}

						// Lastly if we haven't found one yet, get the next image that's off screen
						if( startEdge > stayOnScreen ){
							return true;
						}
					}

					// If the other conditions don't match, this isn't the item we're looking for
					return false;
				});

				var nextFirst = $( nextFirst );

				if( !nextFirst.length ){
					//Debug.error("nextFirst didn't exist");
					deferred.resolve();
					return deferred.promise();
				}

				// Get the position we'll need to scroll to
				if( rtlMode ){
					var nextFirstMargin = parseInt( $( nextFirst ).css('marginLeft') );
					var nextFirstPos = ui.itemList.outerWidth() - ( nextFirst.position().left + nextFirst.outerWidth() ) - nextFirstMargin; // Right hand edge
				} else {
					var nextFirstMargin = parseInt( $( nextFirst ).css('marginRight') );
					var nextFirstPos = nextFirst.position().left;
				}

				// If this would leave space at the end of the list, then we'll simply scroll to the end of the list
				// ( listWidth - nextFirstPos ) = What's left of the list to show
				if( ( listWidth - nextFirstPos ) < wrapperWidth ){
					nextFirstPos = listWidth - wrapperWidth;
				}

				currentStartPos = nextFirstPos;

				// Now animate the list to the new position
				animating = true;
				ui.itemList.animate(
					( rtlMode ) ? { right: ( nextFirstPos * -1 ) + 'px' } : { left: ( nextFirstPos * -1 ) + 'px' }
					, 'slow', function () {
						_checkNav();
						animating = false;
						deferred.resolve();
					}
				);

				return deferred.promise();
			},

			/**
			 * Event handler for the Prev button
			 *
			 * @returns 	{object} 	Returns promise, resolved after animation finishes
			 */
			_navPrev = function (e, backToBeginning) {
				if( e ){
					e.preventDefault();
				}

				// Get the first item which isn't completely shown; that will be our next first item
				var items = elem.find( options.item ).toArray();
				var wrapperWidth = elem.find('.ipsCarousel_inner').outerWidth();
				var listWidth = _getCurrentWidth();
				var stayOnScreen = currentStartPos + wrapperWidth;
				var forcePrev = false;
				var deferred = $.Deferred();

				// We ideal want to scroll back the width of the widget, but not so much that
				// our current left item goes off screen
				var idealStartPos = ( currentStartPos * -1 ) + wrapperWidth;

				// If we need to go back to the bottom, we can shortcut
				if( idealStartPos >= 0 || backToBeginning ){
					currentStartPos = 0;

					animating = true;
					ui.itemList.animate(
						( rtlMode ) ? { right: '0px' } : { left: '0px' }
						, 'slow', function () {
						_checkNav();
						animating = false;
					});

					deferred.resolve();
					return deferred.promise();
				}

				// We'll go through them from last to first, since we're scrolling backwards
				items.reverse();

				idealStartPos = ( idealStartPos * -1 ) + wrapperWidth;

				// Now we can find the first item that's fully on screen
				var prevFirst = _.find( items, function (item) {

					if( forcePrev ){
						return true;
					}

					var width = $( item ).outerWidth();

					if( rtlMode ){
						var margin = parseInt( $( item ).css('marginLeft') );
						var leftPos = $( item ).position().left;

						// These values are all relative to the right-hand side of the carousel frame
						var startEdge = ui.itemList.outerWidth() - ( leftPos + width ) - margin; // right edge
						var endEdge = startEdge + width;  // left edge
						
					} else {
						var startEdge = $( item ).position().left; // left edge
						var endEdge = startEdge + width; // right edge
						var margin = parseInt( $( item ).css('marginRight') );	
					}

					if( startEdge > idealStartPos ){
						return false;
					}

					// If left + width of this item perfectly equals the width of the wrapper, then the next item
					// to be shown is actually the first one that's offscreen. This also applies if the fullSizeItems
					// option is applied. Set forceNext to true so that on the next iteration we can return the item.
					if( stayOnScreen <= ( endEdge + margin ) || ( startEdge < idealStartPos && endEdge > idealStartPos ) ){
						forcePrev = true;
						return false;
					}

					if( endEdge > idealStartPos && startEdge <= idealStartPos ){
						return true;
					}

					return false;
				});

				prevFirst = $( prevFirst );				

				// The method above has given us the first that is *partially* on screen
				// We actually want the next one though so we know it's fully on screen,
				// except on mobile
				if( !ips.utils.responsive.currentIs('phone') && !options.fullSizeItems ){
					prevFirst = $( prevFirst ).next( options.item );	
				}

				currentFirstItem = prevFirst;

				// Set the left position so that prevFirst is still on-screen as the last item
				// E.g.
				// 
				//	Before									After
				//	|5  ][  6  ][  7  ][  8  ][  9  ]|		|[  1  ][  2  ][  3  ][  4  ][  5  ]|
				//
                if( prevFirst.position() != null ) {
                    currentStartPos = prevFirst.position().left + prevFirst.outerWidth() - wrapperWidth;

                    if( rtlMode ){
                    	var prevFirstMargin = parseInt( $( prevFirst ).css('marginLeft') );
						currentStartPos = ui.itemList.outerWidth() - ( prevFirst.position().left ) - prevFirstMargin - wrapperWidth; // right edge
					}
                } else {
                    currentStartPos = prevFirst.outerWidth() + wrapperWidth;
                }
				
				animating = true;
				ui.itemList.animate(
					( rtlMode ) ? { right: ( currentStartPos * -1 ) + 'px' } : { left: ( currentStartPos * -1 ) + 'px' }
				, 'slow', function () {
					_checkNav();
					animating = false;
					deferred.resolve();
				});

				return deferred.promise();
			},

			/**
			 * Returns the height of the tallest item in the carousel currently
			 *
			 * @returns 	{number}
			 */
			_getMaxHeight = function () {
				var items = elem.find( options.item );

				if( !items.length ){
					return 0;
				}

				var max = _.max( items, function (item) {
					var item = $( item );
					return item.outerHeight();
				});

				return $( max ).outerHeight();
			},

			/**
			 * Shows or hides the navigation elements, depending on current position of the carousel
			 *
			 * @returns 	{void}
			 */
			_checkNav = function () {
				var container	= elem.find('.ipsCarousel_inner')[0].getBoundingClientRect();
				var list		= ui.itemList[0].getBoundingClientRect();

				if( ( !rtlMode && Math.floor(list.right) <= Math.floor(container.right) ) || (rtlMode && Math.floor(list.left) >= Math.floor(container.left)) ){
					ui.next.hide().attr('data-disabled', true);
					if( ui.nextShadow.is(':visible') && options.shadows ){
						ips.utils.anim.go('fadeOut fast', ui.nextShadow );
					}
				} else {
					ui.next.show().removeAttr('data-disabled');
					if( !ui.nextShadow.is(':visible') && options.shadows ){
						ips.utils.anim.go('fadeIn fast', ui.nextShadow );
					}
				}

				if( (!rtlMode && Math.floor(list.left) >= Math.floor(container.left) ) || (rtlMode && Math.floor(list.right) <= Math.floor(container.right)) ){
					ui.prev.hide().attr('data-disabled', true);
					if( ui.prevShadow.is(':visible') && options.shadows ){
						ips.utils.anim.go('fadeOut fast', ui.prevShadow );
					}
				} else {
					ui.prev.show().removeAttr('data-disabled');
					if( !ui.prevShadow.is(':visible') && options.shadows ){
						ips.utils.anim.go('fadeIn fast', ui.prevShadow );
					}
				}
			},

			/**
			 * Returns the current width of all items, including margins
			 *
			 * @returns 	{number}
			 */
			_getCurrentWidth = function () {
				var items = elem.find( options.item );
				var width = 0;

				items.each( function (item) {
					width += $( this ).outerWidth();
					width += parseInt( $( this ).css('margin-left') );
					width += parseInt( $( this ).css('margin-right') );
				});

				return width;
			},

			/** 
			 * Shows the nav items
			 *
			 * @returns {void}
			 */
			_buildNav = function () {
				elem.find('.ipsCarousel_nav').removeClass('ipsHide');
			},

			/** 
			 * Event handler for window resizing
			 *
			 * @returns {void}
			 */
			_resize = function () {
				// Are we making the items full width?
				if( options.fullSizeItems ){
					var elemWidth = elem.find('.ipsCarousel_inner').outerWidth( true );

					elem.find( options.item ).each( function (item) {
						$( this ).css({
							width: elemWidth + 'px'
						});
					});
				}
			};

			init();

			return {
				destruct: destruct
			};
		};

		ips.ui.registerWidget( 'carousel', ips.ui.carousel, [ 'showDots', 'fullSizeItems', 'slideshow', 'shadows' ] );

		return {
			respond: respond,
			destruct: destruct
		};
	});
}(jQuery, _));