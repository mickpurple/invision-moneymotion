/**
 * IPS Social Suite 4
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.editor.giphy.js - Controller for Giphy Actions
 *
 * Author: Daniel Fatkic
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.editor.giphy', {

		initialize: function () {
			this.on( 'click', '.ipsGiphyImage', this.insertImage );
			this.on( 'focus', '[data-role="giphySearch"]', this.searchGiphy );
			this.on( 'blur', '[data-role="giphySearch"]', this.stopSearchGiphy );
			$('[data-role="giphyResults"]').on( 'scroll', this.scrollEvent.bind(this) );

			this.on( document, 'menuOpened', this.menuOpened );
			this.setup();
		},
		_typeTimer: null,
		_lastVal: '',
		_perPage: 30,
		_status: 'init',
		
		setup: function () {
			this._editorId = $( this.scope ).data('editorid');
			this._editor = CKEDITOR.instances[ this._editorId ];
		},


		searchGiphy: function (e) {
			this._typeTimer = setInterval( _.bind( this._typing, this ), 1500 );
		},
		
		/**
		 * Event handler for scrolling
		 * 
		 * @param 		{event}	 	e 		Event object
		 * @returns 	{void}
		 */
		scrollEvent: function (e) {
			
			var scrollScope = $('[data-role="giphyResults"]');
			var scrollHeight = scrollScope[0].scrollHeight;
			var distanceFromBottom = scrollHeight - scrollScope.height() - scrollScope.scrollTop();
			
			if ( this._status != 'ready' ) {
				return;
			}
			
			if( distanceFromBottom <= 150 ){
				this._status = 'loading';
				
				var offset = parseInt( this.scope.find('[data-role="giphyMore"]').attr('data-offset') );
				this.scope.find('[data-role="giphyMore"]').attr('data-offset', offset + this._perPage );
				
				this.scope.find('[data-role="giphyMoreLoading"]').removeClass('ipsHide');
				
				this._doSearch( this._lastVal );
			}
		},
		
		/**
		 * The search box has blurred
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		stopSearchGiphy: function (e) {
			if( this._typeTimer ){
				clearInterval( this._typeTimer );
				this._typeTimer = null;
			}
			/* Clear Results */
		},

		/**
		 * Runs a continuous interval to check the current search value, and call the search function
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		_typing: function () {
			var textElem = this.scope.find('[data-role="giphySearch"]');

			if( this._lastVal == textElem.val() ){
				return;
			}
			
			this.scope.find('[data-role="giphyMore"]').attr('data-offset', 0);
			this.scope.find('.ipsMenu_innerContent').animate({
				scrollTop: "0"
			}, 250);
			
			this._doSearch( textElem.val() );
			
			this._lastVal = textElem.val();
		},

		/**
		 * AJAX call to fetch the images
		 *
		 * @param 		{string} 	value  		Search value
		 * @returns 	{void}
		 */
		_doSearch: function (value) {
			var resultsbox = this.scope.find('[data-role="giphyLoading"]');
			var offset = parseInt( this.scope.find('[data-role="giphyMore"]').attr('data-offset') );
			
			Debug.log( offset + ',' + this._perPage );
			
			resultsbox.addClass('ipsLoading');
			var _self = this;
									
			this._status = 'loading';
			ips.getAjax()( this._editor.config.controller + '&do=giphy&offset=' + offset + '&limit=' + this._perPage, {
				type: 'POST',
				data: {
					'search': value
				}
			} ).done( function (response) {
				var data = response;
				var result = ( offset > 0 ) ? resultsbox.html() : '';
				var pos = 0;
				var gifsForThisRow = '';

				if ( data.error )
				{
				   result = data.error;
				}
				else
				{
					_.each( data.images, function (term) {
						gifsForThisRow += ips.templates.render('core.editor.giphyThumb', {
							thumb: term.thumb,
							url: term.url,
							title: term.title
						} );

						/* Once we've reached the limit per line, add the line */
						pos++;
						if( pos == 3 ) {
							result += ips.templates.render('core.editor.giphyRow', { gifs: gifsForThisRow } );
							pos = 0;
							gifsForThisRow = '';
						}
					} );
					Debug.log( data.pagination.total_count );
					Debug.log( offset + _self._perPage );
					if ( offset > 0 || data.pagination.total_count > offset + _self._perPage ) {
						_self.scope.find('[data-role="giphyMoreLoading"]').addClass('ipsHide');
						_self._status = 'ready';
					}

					// No more available
					if ( data.pagination.total_count <= offset + _self._perPage ) {
						_self.scope.find('[data-role="giphyMoreLoading"]').addClass('ipsHide');
						_self._status = 'done';
					}
				}
								
				resultsbox.removeClass('ipsLoading').html( result );
			} );
		},
		
		insertImage: function(e)
		{
			var image = $( e.target );
			var element = CKEDITOR.dom.element.createFromHtml( '<img src="' + image.attr('data-url') + '">' );
			this._editor.insertElement( element );

			element.$.alt = image.attr('alt');
			element.$.title = image.attr('title');

			ips.utils.lazyLoad.applyLazyLoadAttributes( element.$ );
			ips.utils.lazyLoad.loadContent( element.$ );

			/* Now clear search and close the menu */
			this.scope.find('[data-role="giphySearch"]').val('');
			this.scope.find('[data-role="giphyLoading"]').addClass('ipsLoading').html('');
			this.scope.trigger( 'closeMenu' );
		},

		/**
		 * Event handler called when the emoticons menu is opened.
		 * Initializes the menu if it hasn't already been done
		 *
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		menuOpened: function (e, data) {
			if( data.menu.attr('data-controller') == 'core.global.editor.giphy' ){
				/* Submit an empty search when we open the menu, this will return the top trending gifs */
				this._doSearch("");
				setTimeout(function(){
					this.scope.find('[data-role="giphySearch"]').focus();
				}.bind(this),100);
			}
		},
	});
}(jQuery, _));