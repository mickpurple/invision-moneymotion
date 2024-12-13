/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.stats.overviewBlock.js - Overview statistics block controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.stats.overviewBlock', {

		initialize: function () {
			Debug.log('init bloc');
			this.on('stats.loadBlock', this.loadBlock);
			$(document).on( 'stats.nodeFilters', _.bind( this.loadBlock, this ) );
			this.setup();
		},
		
		setup: function () {
			this.refresh = null;
			this.loaded = false;
			this.currentCounts = [];
			this.url = null;
			this.block = this.scope.attr('data-block');
			this.subblock = this.scope.attr('data-subblock');
			this.refreshInterval = this.scope.attr('data-refresh') ? parseInt( this.scope.attr('data-refresh') ) : false;
			this.trigger('stats.ready');
		},

		/**
		 * Return a normalized array of counts this block has shown, used to compare prev/next values
		 *
		 * @param	{element} 	elem	  Element to check for values 
		 * @returns {void}
		 */
		getCounts: function (elem) {
			return _.map( elem.find('[data-number]'), function (thisElem) { return parseInt( $( thisElem ).attr('data-number') ) } );
		},

		startInterval: function () {
			if( !this.refreshInterval || !this.url ){
				return;
			}

			clearInterval( this.refresh );
			this.refresh = setInterval( _.bind( this.fetchUpdate, this ), this.refreshInterval * 1000 );
		},

		fetchUpdate: function () {
			var self = this;

			ips.getAjax()( this.url, {
				type: 'get'
			} )
				.done( function (response) {
					var newContent = $("<div>" + response + "</div>");
					var counts = self.getCounts( newContent );
					var hasDifference = false;

					// Is there a difference?					
					if( counts.length !== self.currentCounts.length ){
						hasDifference = true;
					} else {
						for( var i = 0; i < counts.length; i++ ){
							if( counts[ i ] !== self.currentCounts[ i ] ){
								hasDifference = true;
								break;
							} 
						}
					}

					if( hasDifference ){
						self.scope.addClass('cStatTile--updated').find('[data-role="statBlockContent"]').html( response );
						self.currentCounts = counts;

						setTimeout( function () {
							self.scope.removeClass('cStatTile--updated');
						}, 2200);

						$( document ).trigger( 'contentChange', [ self.scope ] );
					} else {
						Debug.log("No change in values in " + self.block);
					}
				});
		},

		/**
		 * Load the block
		 *
		 * @param	{event} 	e	    Event
		 * @param   {object}    data    Event data
		 * @returns {void}
		 */
		loadBlock: function (e, data) {
			// We might only want to refresh one block, in which case we can skip this
			if( !_.isUndefined( data.blockToRefresh ) && ( data.blockToRefresh != this.block || data.subblockToRefresh != this.subblock ) )
			{
				Debug.log( "Skipping because " + data.blockToRefresh + " does not match " + this.block + " or " + data.subblockToRefresh + " does not match " + this.subblock );
				return;
			}

			var self = this;
			this.url = data.url + '&blockKey=' + this.block;

			clearInterval( this.refresh );
			
			if( this.loaded ){
				this.loaded = false;
				
				this.scope
					.removeClass('cStatTile--loaded')
					.find('.cStatTile__body')
						.addClass('ipsLoading')
					.end()
					.find('[data-role="statBlockContent"]')
						.hide()
						.html('');
			}

			if( !_.isUndefined( this.subblock ) ){
				this.url = this.url + '&subblock=' + this.subblock;
			}

			if( data.dateFilters.range != '-1' && data.dateFilters.range != '0' ) {
				this.url = this.url + '&range=' + data.dateFilters.range;
			} else if ( data.dateFilters.range == '-1' && !_.isNull( data.dateFilters.start ) ) {
				this.url = this.url + '&start=' + data.dateFilters.start + '&end=' + data.dateFilters.end;
			}

			if( this.scope.attr('data-nodeFilter') )
			{
				this.url = this.url + '&nodes=' + this.scope.attr('data-nodeFilter');
			}

			ips.getAjax()( this.url, {
				type: 'get'
			} )
				.done( function (response) {
					self.scope
						.addClass( 'cStatTile--loaded' )
						.find('.cStatTile__body')
							.removeClass('ipsLoading')
						.end()
						.find('[data-role="statBlockContent"]')
							.hide()
							.html( response );

					self.scope.find('[data-role="statBlockContent"]').fadeIn('fast');
					self.loaded = true;
					self.currentCounts = self.getCounts( self.scope );
					self.startInterval();

					$( document ).trigger( 'contentChange', [ self.scope ] );
				});
		}
	});
}(jQuery, _));