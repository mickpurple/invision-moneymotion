/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.marketplace.onboard.js - Handles looking up an existing app/plugin/theme
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.marketplace.onboardRow', {
		
		_searchDialogs: [],

		initialize: function () {
			this.on( 'click', '[data-action="searchMarketplace"]', this._searchMarketplace );
			this.on( 'click', '[data-action="confirmMatch"]', this._confirmMatch );
			this.on( 'menuItemSelected', this._menuItemSelected );
			this.on( document, 'searchResultSelected', this._searchResultSelected );
			this.setup();
		},
		
		setup: function (e) {
			if ( this.scope.attr('data-marketplaceId') ) {
				ips.getAjax()( '?app=core&module=marketplace&controller=marketplace&do=apiLookup&id=' + this.scope.attr('data-marketplaceId') )
					.done(function(response){
						this.scope.find('[data-role="onboardLoading"]').hide();
						if ( response ) {
							this.scope.find('[data-role="matchedFile"]').html(response).show();
						} else {
							this.scope.find('[data-role="matchedFile"]').hide();
							this.scope.find('[data-role="noMatchedFile"]').show();
							this.scope.find('[data-role="confirmed"]').hide();
							this.scope.find('[data-role="confirm_nomatch"]').show();
						}
					}.bind(this))
					.fail(function(){
						this.scope.find('[data-role="onboardLoading"]').hide();
						this.scope.find('[data-role="noMatchedFile"]').show();
						this.scope.find('[data-role="confirmed"]').hide();
						this.scope.find('[data-role="confirm_nomatch"]').show();
					}.bind(this));
			} else {
				ips.getAjax()( '?app=core&module=marketplace&controller=marketplace&do=apiSearch&title=' + encodeURIComponent( '"' + this.scope.attr('data-title') + '"' ) + "&category=" + this.scope.attr('data-category') + "&single=1" )
					.done(function(response){
						this.scope.find('[data-role="onboardLoading"]').hide();
						if ( response ) {
							$(this.scope).find('[data-role="id"]').val( response.id );
							this.scope.find('[data-role="matchedFile"]').html( response.html ).show();
							this.scope.find('[data-role="confirm_match"]').show();
						} else {
							this.scope.find('[data-role="noMatchedFile"]').show();
							this.scope.find('[data-role="confirm_nomatch"]').show();
						}
					}.bind(this))
					.fail(function(response){
						this.scope.find('[data-role="onboardLoading"]').hide();
						this.scope.find('[data-role="noMatchedFile"]').show();
						this.scope.find('[data-role="confirm_nomatch"]').show();
					}.bind(this));
			}
		},
		
		_searchMarketplace: function(e) {
			if ( e ) {
				e.preventDefault();
				e.stopPropagation();
			}
			
			this._searchDialogs[ this.scope.attr('data-id') ] = ips.ui.dialog.create( { title: ips.getString('marketplace_search'), url: '?app=core&module=marketplace&controller=marketplace&do=search&category=' + this.scope.attr('data-category') } );
			this._searchDialogs[ this.scope.attr('data-id') ].show();
		},
		
		_searchResultSelected: function(e,data){
			if ( this._searchDialogs[ this.scope.attr('data-id') ] && this._searchDialogs[ this.scope.attr('data-id') ].dialogID == data.dialogId ) {
				this._searchDialogs[ this.scope.attr('data-id') ].destruct();

				this.scope.find('[data-role="onboardLoading"]').show();
				this.scope.find('[data-role="confirm_match"]').hide();
				this.scope.find('[data-role="confirm_nomatch"]').hide();
				this.scope.find('[data-role="noMatchedFile"]').hide();
				this.scope.find('[data-role="matchedFile"]').hide();
				
				ips.getAjax()( '?app=core&module=marketplace&controller=marketplace&do=apiLookup&id=' + data.id )
					.done(function(response){
						this.scope.find('[data-role="onboardLoading"]').hide();
						if ( response ) {
								$(this.scope).find('[data-role="id"]').val( data.id );
								$(this.scope).find('[data-role="confirm"]').val('1');

							this.scope.find('[data-role="matchedFile"]').html(response).show();
							this.scope.find('[data-role="confirm_match"]').hide();
							this.scope.find('[data-role="confirmed"]').show();
							
							this.trigger('onboardMatch');
						} else {
							this.scope.find('[data-role="noMatchedFile"]').show();
							this.scope.find('[data-role="confirm_nomatch"]').show();
						}
					}.bind(this))
					.fail(function(){
						this.scope.find('[data-role="onboardLoading"]').hide();
						this.scope.find('[data-role="noMatchedFile"]').show();
						this.scope.find('[data-role="confirm_nomatch"]').show();
					}.bind(this));
			}
		},
		
		_confirmMatch: function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(this.scope).find('[data-role="confirm"]').val('1');
			this.scope.find('[data-role="confirm_match"]').hide();
			this.scope.find('[data-role="noMatchedFile"]').hide();
			this.scope.find('[data-role="confirmed"]').show();
			
			this.trigger('onboardMatch');
		},
		
		_menuItemSelected: function(e,data) {
			data.originalEvent.preventDefault();
			if ( data.selectedItemID == 'confirmCustom' ) {
				this._confirmCustom();
			} else if ( data.selectedItemID == 'searchMarketplace' ) {
				this._searchMarketplace();
			}
		},
		
		_confirmCustom: function() {
			$(this.scope).find('[data-role="id"]').val('0');
			$(this.scope).find('[data-role="confirm"]').val('1');
			this.scope.find('[data-role="confirm_match"]').hide();
			this.scope.find('[data-role="confirm_nomatch"]').hide();
			this.scope.find('[data-role="matchedFile"]').hide();
			this.scope.find('[data-role="noMatchedFile"]').show();
			this.scope.find('[data-role="confirmed"]').show();
			
			this.trigger('onboardMatch');
		}
	});
}(jQuery, _));