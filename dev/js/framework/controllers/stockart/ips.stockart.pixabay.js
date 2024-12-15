/**
 * IPS Social Suite 4
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.stockart.pixabay.js - Controller for Pixabay Actions
 *
 * Author: Daniel Fatkic
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.stockart.pixabay', {

		initialize: function () {
			this.on( 'click', '.ipsPixabayImage', this.selectImage );
			this.on( 'focus', '[data-role="pixabaySearch"]', this.searchPixabay );
			this.on( 'blur', '[data-role="pixabaySearch"]', this.stopSearchPixabay );
			$('[data-role="pixabayResults"]').on( 'scroll', this.scrollEvent.bind(this) );
			this.setup();
		},
		_typeTimer: null,
		_lastVal: '',
		_perPage: 20,
		_status: 'init',
		
		setup: function () {
			this.uploader = $(document).find('[data-ipsUploader-name="'+ this.scope.attr('data-uploader') + '"]');
			this._doSearch(null);
		},


		searchPixabay: function (e) {
			this._typeTimer = setInterval( _.bind( this._typing, this ), 1500 );
		},
		
		/**
		 * Event handler for scrolling
		 * 
		 * @param 		{event}	 	e 		Event object
		 * @returns 	{void}
		 */
		scrollEvent: function (e) {
			
			var scrollScope = $('[data-role="pixabayResults"]');
			var scrollHeight = scrollScope[0].scrollHeight;
			var distanceFromBottom = scrollHeight - scrollScope.height() - scrollScope.scrollTop();
			
			if ( this._status != 'ready' ) {
				return;
			}
			
			if( distanceFromBottom <= 150 ){
				this._status = 'loading';
				
				var offset = parseInt( this.scope.find('[data-role="pixabayMore"]').attr('data-offset') );
				this.scope.find('[data-role="pixabayMore"]').attr('data-offset', offset + this._perPage );
				
				this.scope.find('[data-role="pixabayMoreLoading"]').removeClass('ipsHide');
				
				this._doSearch( this._lastVal );
			}
		},
		
		/**
		 * The search box has blurred
		 *
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		stopSearchPixabay: function (e) {
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
			var textElem = this.scope.find('[data-role="pixabaySearch"]');

			if( this._lastVal == textElem.val() ){
				return;
			}
			
			this.scope.find('[data-role="pixabayMore"]').attr('data-offset', 0);
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
			var resultsbox = this.scope.find('[data-role="pixabayLoading"]');
			var offset = parseInt( this.scope.find('[data-role="pixabayMore"]').attr('data-offset') );
			
			Debug.log( offset + ',' + this._perPage );
			
			resultsbox.addClass('ipsLoading');
			var _self = this;
									
			this._status = 'loading';
			ips.getAjax()( ips.getSetting('baseURL') + '?app=core&module=system&controller=pixabay&do=search&offset=' + offset + '&limit=' + this._perPage, {
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
						gifsForThisRow += ips.templates.render('core.editor.pixabayThumb', {
							thumb: term.thumb,
							url: term.url,
							imgid: term.imgid
						} );

						/* Once we've reached the limit per line, add the line */
						pos++;
						if( pos == 3 ) {
							result += ips.templates.render('core.editor.pixabayRow', { images: gifsForThisRow } );
							pos = 0;
							gifsForThisRow = '';
						}
					} );
					Debug.log( data.pagination.total_count );
					Debug.log( offset + _self._perPage );
					if ( offset > 0 || data.pagination.total_count > offset + _self._perPage ) {
						_self.scope.find('[data-role="pixabayMoreLoading"]').addClass('ipsHide');
						_self._status = 'ready';
					}

					// No more available
					if ( data.pagination.total_count <= offset + _self._perPage ) {
						_self.scope.find('[data-role="pixabayMoreLoading"]').addClass('ipsHide');
						_self._status = 'done';
					}
				}
								
				resultsbox.removeClass('ipsLoading').html( result );
			} );
		},
		
		selectImage: function(e)
		{
			var image = $( e.target );

			var pluploadObj = this.uploader;
			

			pluploadObj.find('.ipsAttachment_loading').show();
			pluploadObj.find('.ipsAttachment_dropZoneSmall_info').hide();
			
			ips.getAjax()( ips.getSetting('baseURL') + '?app=core&module=system&controller=pixabay&do=getById&id=' + image.attr('data-id') ).done( function (response) {
				var randomId = Math.random().toString(36).substring(7);
				var bstr = atob( response.content );
				var n = bstr.length;
				var u8arr = new Uint8Array(n);
				while(n--) {
					u8arr[n] = bstr.charCodeAt(n);
				}
				var file = new File( [u8arr], response.filename, { type: response.type } );

				pluploadObj.trigger( 'injectFile', { file: file } );
			} );
			
			
			/* Now clear search and close the menu */
			this._status = 'init';
			this.scope.find('[data-role="pixabaySearch"]').val('');
			this.scope.find('[data-role="pixabayLoading"]').addClass('ipsLoading').html('');
			this.scope.trigger( 'closeDialog' );
		}
	});
}(jQuery, _));