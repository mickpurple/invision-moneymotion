/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.forum.flow.js - Flow filter controller
 *
 * Author: Matt Mecham, certainly not Rikki Tissier (yet)
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('forums.front.forum.flow', {
	
		_ids: [],
		_button: null,
		
		initialize: function () {
			this.on( 'click', '[data-node-id]', this.toggleFilters );
			
			this.setup();
		},
		
		/**
		 * Um, set up...
		 */
		setup: function () {
			/* Populate forum IDs */
			var _ids = ips.utils.url.getParam( 'forumId' );
			
			var self = this;

			if ( ! _.isUndefined( _ids ) ) {
				/* Check URL */
				this._ids = decodeURIComponent( _ids ).split(',');
			} else if( ! _.isUndefined( ips.utils.cookie.get('forums_flowIds') ) ) {
				/* Check local storage */
				this._ids = ips.utils.cookie.get('forums_flowIds').split(',');
			}

			if( _.isObject( this._ids ) && _.size( this._ids ) ){
				_.each( this._ids, function (val, key) {
					if ( val ) {
						self.childSelect( val, true );
					}
				});
			}

			this._button = $('body').find('[data-role="fluidForumMobileDesc"]');
			this._updateButtonText();
		},
		
		/**
		 * Event handler for toggling a filter
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		toggleFilters: function (e) {
			e.preventDefault();
			var link = $( e.currentTarget );
			var id = link.attr('data-node-id');
			var parentId = link.attr('data-parent-id');
			var hasChildren = link.attr('data-has-children');
			
			if ( _.indexOf( this._ids, id ) == -1 ) {
				/* Does not exist, so add it */
				this.childSelect( id, false );
				
			} else {
				/* Exists, so remove it */
				this.childUnselect( id );
			}

			this._updateButtonText();
			
			$( document ).trigger( 'updateTableURL', { forumId: _.uniq( _.values( this._ids ) ).join(',') } );
		},
		
		/**
		 * Is item selected
		 *
		 */
		isSelected: function(id) {
			return this.scope.find('[data-node-id="' + id + '"]').hasClass('cForumMiniList_selected') ? true : false;
		},
		
		/**
		 * Select a child
		 *
		 */
		childSelect: function(id, skipChildren) {
			Debug.log("Select child: " + id );
			this._ids.push( id );
			var node = this.scope.find('[data-node-id="' + id + '"]');
			node.addClass('cForumMiniList_selected');
			var parentId = node.attr('data-parent-id');
			
			/* Mark any children, but we do not need to keep individual row markings */
			if ( skipChildren === false && ( node.attr('data-has-children') || id == parentId ) ) {
				var self = this;
				_.each( this.scope.find('[data-parent-id="' + id + '"]'), function( v, k ) {
					var _cId = $(v).attr('data-node-id');
					if ( _cId != id ) {
						self.childSelect( _cId, false );
					}
				} );
			}

			this.updateCookie();
		},
		
		/**
		 * Unselect a child
		 *
		 */
		childUnselect: function(id) {
			Debug.log("UNselect child: " + id );
			/* Remove marking */
			this.scope.find('[data-node-id="' + id + '"]').removeClass('cForumMiniList_selected');
			
			/* Remove from local storage and id stack */
			this._ids = _.without( this._ids, id );
			this.updateCookie();
			
			/* Check for children of this and unselect those too */
			var self = this;
			_.each( this.scope.find('[data-parent-id="' + id + '"]'), function( v, k ) {
				var _cId = $(v).attr('data-node-id');
				if ( _cId != id ) {
					self.childUnselect( _cId );
				}
			} );

			/* And we always need to unselect the category */
			this.parentUnselect( this.scope.find('[data-node-id="' + id + '"]').closest('[data-category]').find('[data-node-id]').first().attr('data-node-id') );
		},

		/**
		 * Select a parent
		 *
		 */
		parentSelect: function(parentId) {
			Debug.log("Select parent: " + parentId );
			/* Mark category and children as selected */
			this.scope.find('[data-node-id="' + parentId + '"]').addClass('cForumMiniList_selected');
			
			/* Remove children from the arrays as PHP handles this */
			var self = this;
			_.each( this.scope.find('[data-parent-id="' + parentId + '"]'), function( v, k ) {
				var _cId = $(v).attr('data-node-id');
			
				if ( _cId != parentId ) {
					self.childUnselect( _cId );
				}
			} );
		},
		
		/**
		 * Unselect a parent
		 *
		 */
		parentUnselect: function(parentId) {
			Debug.log("UNselect parent: " + parentId );
			/* Unselect parent as marked */
			var node = this.scope.find('[data-node-id="' + parentId + '"]');
			node.removeClass('cForumMiniList_selected');
			
			this._ids = _.without( this._ids, parentId );
			this.updateCookie();
			
			/* Off up the tree we go */
			Debug.log( "Looking for parent ID " + node.attr('data-parent-id') );
			var self = this;
			_.each( this.scope.find('[data-node-id="' + node.attr('data-parent-id') + '"]'), function( v, k ) {
				var _cId = $(v).attr('data-node-id');
				if ( _cId != parentId ) {
					Debug.log( "Found " + _cId );
					self.parentUnselect( _cId );
				}
			} );
		},
		
		/**
		 * Update the cookie
		 */
		updateCookie: function(id) {
			var cookie = _.uniq( _.values( this._ids ) ).join(',');
			Debug.log("Updating cookie: " + cookie );
			
			ips.utils.cookie.set('forums_flowIds', cookie, true);
		},

		/**
		 * Updates the mobile button text based on selected forums
		 *
		 * @param		{event}		e			The submit event
		 * @param		{element} 	elem 		The element this widget is being created on
		 * @returns		{void}
		 */
		_updateButtonText: function () {
			var blobs = this.scope.find('.cForumMiniList_blob');
			var selectedBlobRows = blobs.filter( function () {
				if( $( this ).closest('.cForumMiniList_selected').length ){
					return true;
				}
				return false;
			});
			var text = '';

			// If the counts are the same, we know we've selected all of them
			if( blobs.length == selectedBlobRows.length || selectedBlobRows.length === 0 ){
				text = ips.getString('topicsFromAllForums');
			} else {
				text = ips.pluralize( ips.getString( 'topicsFromXForums' ), selectedBlobRows.length );
			}

			this._button.text( text );
		}
	});
}(jQuery, _));