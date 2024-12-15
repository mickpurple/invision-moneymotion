/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.core.commentFeed.js - Controller for a stream of comments (e.g. a topic, conversation, etc.)
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.core.commentFeed', {

		_overlay: null,
		_commentFeedID: 0,
		_newRepliesFlash: null,
		_maximumMultiQuote: 50, // Maximum number of items that can be multiquoted
		_pageParam: 'page',
		_seoPagination: false,
		_urlParams: {},
		_baseURL: '',
		_doneInitialState: false,
		_initialURL: '',

		// Polling vars
		_pollingEnabled: true, // Is polling enabled at all?
		_pollingActive: false, // Is polling running right now?
		_pollingPaused: false, // Have we paused polling?
		_initialPoll: 60000, // Our base polling frequency (1 minute)
		_currentPoll: 60000, // The current interval
		_decay: 20000, // Decay (amount added to interval on each false response)
		_maxInterval: ( 30 * 60 ) * 1000, // Maximum interval possible (30 mins)
		_pollingTimeout: null, // timeout obj
		_pollAjax: null, // ajax obj
		_pollOnUnpaused: false, // If true, when window is focused a poll will fire immediately
		_notification: null,
		_lastSeenTotal: 0,

		initialize: function () {
			this._containerID = this.scope.closest('[data-commentsContainer]').length ? this.scope.closest('[data-commentsContainer]').attr('data-commentsContainer') : this.scope.identify().attr('id');

			this.on( 'submit', '[data-role="replyArea"]', this.quickReply );
			this.on( 'quoteComment.comment', this.quoteComment );
			this.on( 'addMultiQuote.comment', this.addMultiQuote );
			this.on( 'removeMultiQuote.comment deleteComment.comment', this.removeMultiQuote );
			this.on( 'click', '[data-action="filterClick"]', this.filterClick );
			this.on( 'menuItemSelected', '[data-role="signatureOptions"]', this.signatureOptions );
			//this.on( 'change', '[data-role="moderation"]', this.selectRow );
			this.on( 'editorCompatibility', this.editorCompatibility );
			this.on( 'checkedComment.comment', this.checkedComment );

			this._boundMQ = _.bind( this.doMultiQuote, this );
			this._boundCMQ = _.bind( this.clearMultiQuote, this );
			
			$( document ).on( 'click', '[data-role="multiQuote_' + this._containerID + '"]', this._boundMQ );
			$( document ).on( 'click', '[data-action="clearQuoted_' + this._containerID + '"]', this._boundCMQ );
			$( document ).on( 'moderationSubmitted', this.clearLocalStorage );

			this.on( 'paginationClicked paginationJump', this.paginationClick );

			// Watch events on the document that are actually triggered from within this.quickReply
			this.on( document, 'addToCommentFeed', this.addToCommentFeed );
			this.on( 'deletedComment.comment', this.deletedComment );

			// Window events for polling purposes
			//$( window ).on( 'blur', _.bind( this.windowBlur, this ) );
			//$( window ).on( 'focus', _.bind( this.windowFocus, this ) );

			// Event we watch for on flash messages
			this.on( document, 'click', '[data-action="loadNewPosts"]', this.loadNewPosts );

			// Watch for state updates
			this.on(window, 'historychange', this.stateChange);

			// Socket events
			this.on(document, "socket.new_comment", this.handleSocketCommentTrigger);

			this.setup();
		},

		/**
		 * Setup method for comment feeds
		 *
		 * @returns {void}
		 */
		setup: function () {
			var self = this;
			var replyForm = this.scope.find('[data-role="replyArea"] form');
			
			this._commentFeedID = this.scope.attr('data-feedID');
			this._urlParams = this._getUrlParams();
			this._baseURL = this.scope.attr('data-baseURL');
			this._initialURL = window.location.href;
			this._currentPage = ips.utils.url.getPageNumber( this._pageParam );
			this._urlParams[ this._pageParam ] = this._currentPage;

			if( this._baseURL.match(/\?/) ) {
				if( this._baseURL.slice(-1) != '?' ){
					this._baseURL += '&';	
				}				
			} else {
				this._baseURL += '?';
			}

			if( replyForm.attr('data-noAjax') ){
				this._pollingEnabled = false;
			}

			if( !_.isUndefined( this.scope.attr('data-lastPage') ) && this._pollingEnabled ){
				this._startPolling();
			}

			$( document ).ready( function () {
				self._setUpMultiQuote();
				self._findCheckedComments();
			});
		},

        /**
         * Clear local storage after form is submitted
         *
         * @returns {void}
         */
        clearLocalStorage: function () {
            ips.utils.db.remove( 'moderation', $( document ).find("[data-feedID]").attr('data-feedID') );
        },

		/**
		 * Destroy method
		 *
		 * @returns {void}
		 */
		destroy: function () {
			$( document ).off( 'click', '[data-role="multiQuote_' + this._containerID + '"]', this._boundMQ );
			$( document ).off( 'click', '[data-action="clearQuoted_' + this._containerID + '"]', this._boundCMQ );
			this._stopPolling();
		},

		/**
		 * Returns an object containing URL parameters
		 *
		 * @returns {object}
		 */
		_getUrlParams: function () {
			var sort = this._getSortValue();
			var obj = {	
				sortby: sort.by || '',
				sortdirection: sort.order || '',
			};

			obj[ this._pageParam ] = ips.utils.url.getPageNumber( this._pageParam ) || 1;

			return obj;
		},

		/**
		 * Returns the current sort by and sort order value
		 *
		 * @returns {object}	Object containing by and order keys
		 */
		_getSortValue: function () {
			return { by: '', order: '' };
		},

		/**
		 * Responds to window history changes
		 *
		 * @returns {void}
		 */
		stateChange: function () {
			const lastChange = ips.utils.history.getLastChangeType()
			if (lastChange && lastChange !== 'commentFeed') {
				return
			}

			const state = {
				data: ips.utils.history.getState('commentFeed'),
				url: window.location.href
			}

			// Make sure the state we're working with belongs to this controller/feed.
			if ((state.data.controller !== this.controllerID || state.data.feedID !== this._commentFeedID)) {
				if (state.data.controller === undefined && state.url === this._initialURL) {
					// If there's no controller info in the state, but the state URL matches our initial URL, we'll reload that initial page content
					Debug.log("No controller state, but state URL matched initial URL");
				} else {
					return;
				}
			}

			// Update data
			this._urlParams = state.data;

			// Register page view
			ips.utils.analytics.trackPageView( state.url );

			// Get le new results
			// If the initial URL matches the URL for this state, then we'll load results by URL instead 
			// of by object (since we don't have an object for the URL on page load)
			if (this._initialURL === state.url) {
				this._getResults( state.url );
			} else {
				this._getResults();
			}
		},

		/**
		 * Fetches new results from the server, then calls this._updateTable to update the
		 * content and pagination. Simply redirects to URL on error.
		 *
		 * @param 	{string} 	[url] 	Optional URL to fetch the results from. If omitted
		 								 the URL will be built based on the current params object
		 * @returns {void}
		 */
		_getResults: function (url) {
			const fetchURL = url || this._baseURL + this._getURL();

			this._setLoading( true );

			ips.getAjax()(fetchURL, {
				showLoading: true
			})
				.done( _.bind( this._getResultsDone, this ) )
				.fail( _.bind( this._getResultsFail, this ) )
				.always( _.bind( this._getResultsAlways, this ) );
		},

		/**
		 * New results have finished loading
		 *
		 * @param 	{string}	Results HTML from ajax request
		 * @returns {void}		
		 */
		_getResultsDone: function (response) {
			var tmpElement = $( '<div>' + response + '</div>' ).find( '[data-feedID="' + this.scope.attr('data-feedID') + '"]' );
			var newContents = tmpElement.html();
			tmpElement.remove();

			this.cleanContents();
			//ips.ui.destructAllWidgets( this.scope );

			this.scope.hide().html( newContents );

			// Show content and hide loading
			ips.utils.anim.go( 'fadeIn', this.scope );
			this._overlay.hide();

			// Last page check:
			// Check whether we're on the last page, because if we are we need to start polling (or stop if not last page)
			var currentPageNo	= ips.utils.url.getPageNumber( this._pageParam, window.location.href );
			var lastPageNo		= this.scope.find('li.ipsPagination_last > a').first().attr('data-page');

			if( currentPageNo != lastPageNo ){
				this.scope.removeAttr( 'data-lastPage' );
				this._stopPolling();
			} else {
				this.scope.attr( 'data-lastPage', true );

				if( this._pollingEnabled ){
					this._currentPoll = this._initialPoll;
					this._startPolling();
				}
			}

			// Update multiquote, let document know, then highlight checked comments
			this._setUpMultiQuote();
			$( document ).trigger( 'contentChange', [ this.scope ] );
			this._findCheckedComments();
		},

		/**
		 * Callback when the results ajax fails
		 *
		 * @param 	{object} 	jqXHR			jQuery XHR object
		 * @param	{string} 	textStatus		Error message
		 * @param 	{string}	errorThrown
		 * @returns {void}
		 */
		_getResultsFail: function (jqXHR, textStatus, errorThrown) {
			if( Debug.isEnabled() ){
				Debug.error( "Ajax request failed (" + textStatus + "): " + errorThrown );
				Debug.error( jqXHR.responseText );
			} else {
				// rut-roh, we'll just do a manual redirect
				window.location = this._baseURL + this._getURL();
			}
		},

		/**
		 * Callback always called after ajax request to load results
		 *
		 * @returns {void}
		 */
		_getResultsAlways: function () {
			//
		},

		/**
		 * Callback always called after ajax request to load results
		 *
		 * @returns {void}
		 */
		_setLoading: function (status) {
			var scope = this.scope;
			var self = this;
			var commentFeed = this.scope.find('[data-role="commentFeed"]');

			if( status ){
				if( !this._overlay ){
					this._overlay = $('<div/>').addClass('ipsLoading').hide();
					ips.getContainer().append( this._overlay );
				}

				// Get dims & position			
				var dims = ips.utils.position.getElemDims( commentFeed );
				var position = ips.utils.position.getElemPosition( commentFeed );

				this._overlay.show().css({
					left: position.viewportOffset.left + 'px',
					top: position.viewportOffset.top + $( document ).scrollTop() + 'px',
					width: dims.width + 'px',
					height: dims.height + 'px',
					position: 'absolute',
					zIndex: ips.ui.zIndex()
				});

				commentFeed.animate({
					opacity: "0.5"
				});

				// Get top postition of feed
				var elemPosition = ips.utils.position.getElemPosition( this.scope );
				$('html, body').animate( { scrollTop: elemPosition.absPos.top + 'px' } );
			} else {
				// Stop loading
			}
		},

		/**
		 * Responds to a pagination click
		 *	
		 * @param 		{Event} 	e 		Event object
		 * @param 		{object} 	data 	Event data object
		 * @returns 	{void}
		 */
		paginationClick: function (e, data) {
			data.originalEvent.preventDefault();

			if( data.pageNo !== this._urlParams[ this._pageParam ] ) {
				//var newObj = {};
				//newObj[ this._pageParam ] = data.pageNo;
				var urlObj = ips.utils.url.getURIObject( data.href );
				var queryKey = urlObj.queryKey;

				// If this is coming from a page jump, the page number may not be in the href passed
				// through. So check whether it exists, and manually add it to the object if needed.
				if( _.isUndefined( queryKey[ this._pageParam ] ) ){
					queryKey[ this._pageParam ] = data.pageNo;
				}
				
				this._seoPagination = data.seoPagination;

				this._updateURL( queryKey );
			}
		},

		/**
		 * Pushes a new URL state to the browser
		 *	
		 * @param 		{object} 	newParams 	Object to be added to the state
		 * @returns 	{void}
		 */
		_updateURL: function (newParams) {

			_.extend( this._urlParams, newParams );

			var tmpStateData	= _.extend( _.clone( this._urlParams ), { controller: this.controllerID, feedID: this._commentFeedID } );
			var newUrl			= this._baseURL + this._getURL();

			if( newUrl.slice(-1) === '?' ){
				newUrl = newUrl.substring( 0, newUrl.length - 1 );
			}

			if ( this._seoPagination === true ) {
				newUrl = ips.utils.url.pageParamToPath( newUrl, this._pageParam, newParams[ this._pageParam ] );
			}

			ips.utils.history.pushState(tmpStateData, 'commentFeed', newUrl);
		},

		/**
		 * Builds a param string from values in this._urlParams, excluding empty values
		 *
		 * @returns {string}	Param string
		 */
		_getURL: function () {
			var tmpUrlParams = {};

			for( var i in this._urlParams ){
				if( this._urlParams[ i ] != '' && i != 'controller' && i != 'feedID' && i != 'bypassState' && ( i != 'page' || ( i == 'page' && this._urlParams[ i ] > 1 ) ) ){
					tmpUrlParams[ i ] = this._urlParams[ i ];
				}
			}

			return $.param( tmpUrlParams );
		},

		/**
		 * An editor in this feed has indicated its compatibility
		 *
		 * @param	{event} 	e 		Event object
		 * @param 	{object} 	data 	Event data object
		 * @returns {void}
		 */
		editorCompatibility: function (e, data) {
			if( !data.compatible ){
				this.triggerOn( 'core.front.core.comment', 'disableQuoting.comment' );
			}
		},

		/**
		 * A comment controller triggered an event indicating it was selected
		 * Adds the comment ID and actions to localStorage so it can be tracked across
		 * pages of the feed
		 *
		 * @param	{event} 	e 		Event object
		 * @param 	{object} 	data 	Event data object
		 * @returns {void}
		 */
		checkedComment: function (e, data) {
			var dataStore = ips.utils.db.get( 'moderation', this._commentFeedID ) || {};

			if( data.checked ){
				if( _.isUndefined( dataStore[ data.commentID ] ) ){
					dataStore[ data.commentID ] = data.actions;
				}
			} else {
				delete dataStore[ data.commentID ];
			}

			// Store the updated value, or delete if it's empty  now
			if( _.size( dataStore ) ){
				ips.utils.db.set( 'moderation', this._commentFeedID, dataStore );	
			} else {
				ips.utils.db.remove( 'moderation', this._commentFeedID );
			}			
		},

		/**
		 * Called on setup, loops through the selected comments for this feedID from localstorage,
		 * and checks any that are present on this page. For others, instructs the pageAction
		 * widget to add the ID to its store manually so that they can still be worked with.
		 *
		 * @returns {void}
		 */
		_findCheckedComments: function () {
			// Bail if there's no checkboxes anyway
			if( !this.scope.find('input[type="checkbox"]').length ){
				return;
			}

			// Fetch the checked comments for this feedID
			var dataStore = ips.utils.db.get( 'moderation', this._commentFeedID ) || {};
			var self = this;
			var pageAction = this.scope.find('[data-ipsPageAction]');

			if( _.size( dataStore ) ){
				var sizeOtherPage = 0;

				_.each( dataStore, function (val, key) {
					if( self.scope.find('[data-commentID="' + key + '"]').length ){
						self.scope
							.find('[data-commentID="' + key + '"] input[type="checkbox"][data-role="moderation"]')
							.attr( 'checked', true )
							.trigger('change');
					} else {
						sizeOtherPage++;

						pageAction.trigger('addManualItem.pageAction', {
							id: 'multimod[' + key + ']',
							actions: val
						});
					}
				});

				if( this.scope.find('[data-ipsAutoCheck]') )
				{
					this.scope.find('[data-ipsAutoCheck]').trigger( 'setInitialCount.autoCheck', { count: sizeOtherPage } );
				}
			}
		},
	
		/**
		 * Options 
		 *	
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data 	Event data object
		 * @returns 	{void}
		 */		
		signatureOptions: function (e, data) {
			data.originalEvent.preventDefault();

			if( data.selectedItemID == 'oneSignature' ){
				this._ignoreSingleSignature( $( e.currentTarget ).attr('data-memberID') );
			} else {
				this._ignoreAllSignatures();
			}
		},

		/**
		 * Fires a request to hide all signatures in the feed
		 *
		 * @returns 	{void}
		 */	
		_ignoreAllSignatures: function () {
			var self = this;
			var url = ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=settings&do=toggleSigs';
			var signatures = this.scope.find('[data-role="memberSignature"]');

			// Hide all signatures on the page
			signatures.slideUp();

			ips.getAjax()( url )
				.done( function (response) {
					ips.ui.flashMsg.show( ips.getString('signatures_hidden') );
					signatures.remove();
				})
				.fail( function () {
					signatures.show();

					ips.ui.alert.show( {
						type: 'alert',
						icon: 'warn',
						message: ips.getString('signatures_error'),
						callbacks: {}
					});
				});
		},

		/**
		 * Fires a request to hide a single signature (i.e. a single member's signature)
		 *	
		 * @param 		{number} 	memberID 	Member ID's signature to hide
		 * @returns 	{void}
		 */	
		_ignoreSingleSignature: function (memberID) {
			var self = this;
			var url = ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=ignore&do=ignoreType&type=signatures';
			var signatures = this.scope.find('[data-role="memberSignature"]').find('[data-memberID="' + memberID + '"]').closest('[data-role="memberSignature"]');

			signatures.slideUp();

			ips.getAjax()( url, {
				data: {
					member_id: parseInt( memberID )
				}
			})
				.done( function (response) {
					ips.ui.flashMsg.show( ips.getString('single_signature_hidden') );
					signatures.remove();
				})
				.fail( function () {
					signatures.show();

					ips.ui.alert.show( {
						type: 'alert',
						icon: 'warn',
						message: ips.getString('single_signature_error'),
						callbacks: {}
					});
				});
		},

		/**
		 * Filter click
		 *	
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data 	Event data object
		 * @returns 	{void}
		 */
		filterClick: function(e) {
			e.preventDefault();

			var urlObj = ips.utils.url.getURIObject( $( e.target ).attr('href') );
			var queryKey = urlObj.queryKey;

			this._updateURL( queryKey );
		},

		/**
		 * Responds to a quote event from a comment controller
		 * Finds the reply box for this feed, and triggers a new event instructing the 
		 * editor to insert the quote
		 *	
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data 	Event data object (which should contain all of the properties necessary for a quote)
		 * @returns 	{void}
		 */
		quoteComment: function (e, data) {
			ips.ui.editor.getObjWithInit( this.scope.find('[data-role="replyArea"] [data-ipsEditor]'), function(editor){
				editor.insertQuotes( [ data ] );
			} );
		},

		/**
		 * If the window blurs, we will pause polling, but if a poll is skipped, we'll immediately poll on window focus
		 *	
		 * @returns 	{void}
		 */
		windowBlur: function (e) {
			if( this._pollingEnabled ){
				Debug.log( 'Window blurred, pausing polling...' );
				this._pollingPaused = true;
			}
		},

		/**
		 * Window focus - if polling was paused and a poll was skipped, trigger it immediately now
		 *	
		 * @returns 	{void}
		 */
		windowFocus: function (e) {
			if( this._pollingEnabled && this._pollingPaused ){
				Debug.log( 'Window focused...' );

				this._pollingPaused = false;

				if( this._pollOnUnpaused ){
					this._pollOnUnpaused = false;
					this.pollForNewReplies();
				}
			}
		},

		/**
		 * Socket has told us there may be new replies, so we'll trigger a manual check here
		 */
		handleSocketCommentTrigger: function () {
			if( !_.isUndefined( this.scope.attr('data-lastPage') ) && this._pollingEnabled ){
				this.pollForNewReplies();
			}
		},

		/**
		 * Set a timeout for the new post polling process
		 *	
		 * @returns 	{void}
		 */
		_startPolling: function () {
			var self = this;
			this._pollingActive = true;

			Debug.log('Starting polling with interval ' + ( this._currentPoll / 1000 ) + 's' );

			this._pollingTimeout = setTimeout( function (){
				self.pollForNewReplies();
			}, this._currentPoll );
		},

		/**
		 * Clear the new post poll timeout
		 *	
		 * @returns 	{void}
		 */
		_stopPolling: function () {
			this._pollingActive = false;

			if( this._pollingTimeout ){
				clearTimeout( this._pollingTimeout );
			}

			Debug.log("Stopped polling for new replies in comment feed.");
		},
		
		/**
		 * Checks for new replies since we opened the page
		 *	
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		pollForNewReplies: function () {					
			var self = this;
			var replyForm = this.scope.find('[data-role="replyArea"] form');
			var commentsOnThisPage = this.scope.find('[data-commentid]');

			if( !commentsOnThisPage.length ) {
				return;
			}

			var lastSeenId = this._getLastSeenID( commentsOnThisPage );
			var type = $( commentsOnThisPage[ commentsOnThisPage.length - 1 ] ).attr('data-commentType');

			if ( type.match( /-review$/ ) ) {
				Debug.log("Polling disabled for reviews");
				this._stopPolling();
				return;
			}
			
			if( this._pollingPaused ){
				Debug.log('Window blurred, delaying poll until focused...');
				this._pollOnUnpaused = true;
				return;
			}
			// Abort any running ajax
			if( this._pollAjax && !_.isUndefined( this._pollAjax.abort ) ){
				this._pollAjax.abort();
			}

			this._pollAjax = ips.getAjax();
			this._pollAjax( replyForm.attr('action'), {
				dataType: 'json',
				data: 'do=checkForNewReplies&type=count&lastSeenID=' + lastSeenId + '&csrfKey=' + ips.getSetting('csrfKey'),
				type: 'post'
			})
				.done( function (response) {

					// If auto-polling is now disabled, stop everything
					if( response.error && response.error == 'auto_polling_disabled' ){
						self._stopPolling();
						return;
					}

					if( parseInt( response.count ) > 0 ) {
						// Reset the poll interval
						self._currentPoll = self._initialPoll;
						self._buildFlashMsg( response );

						if( parseInt( response.totalCount ) > parseInt( self._lastSeenTotal ) ){
							self._buildNotifications( response );
							self._lastSeenTotal = parseInt( response.totalCount );
						}				
					} else {
						// Add 20 seconds to the poll interval, up to a max of 5 minutes
						if( ( self._currentPoll + self._decay ) < self._maxInterval ){
							self._currentPoll += self._decay;
						} else {
							self._currentPoll = self._maxInterval;
						}
					}

					// Start again if we're on the last page
					if( !_.isUndefined( self.scope.attr('data-lastPage') ) ){
						self._startPolling();
					}
				});
		},

		/**
		 * Builds a flash message to alert user of new posts
		 *	
		 * @param 		{object} 	response 		Information object
		 * @returns 	{void}
		 */
		_buildFlashMsg: function (response) {
			var html = '';
			var self = this;
			var itemsInFeed = this.scope.find('[data-commentid]').length;
			var spaceForMore = ( parseInt( response.perPage ) - itemsInFeed );

			// Build our flash message HTML
			if( parseInt( response.count ) > spaceForMore ) {
				html = ips.templates.render( 'core.postNotify.multipleSpillOver', {
					text: ips.pluralize( ips.getString( 'newPostMultipleSpillOver' ), [ response.totalNewCount ] ),
					canLoadNew: ( spaceForMore > 0 ),
					showFirstX: ips.pluralize( ips.getString( 'showFirstX' ), [ spaceForMore ] ),
					spillOverUrl: response.spillOverUrl
				});
			} else if( parseInt( response.count ) === 1 && !_.isUndefined( response.photo ) && !_.isUndefined( response.name ) ){
				html = ips.templates.render( 'core.postNotify.single', {
					photo: response.photo,
					text: ips.getString( 'newPostSingle', { name: response.name } )
				});
			} else {
				html = ips.templates.render( 'core.postNotify.multiple', {
					text: ips.pluralize( ips.getString( 'newPostMultiple' ), [ response.count ] )
				});
			}

			if( $('#elFlashMessage').is(':visible') && $('#elFlashMessage').find('[data-role="newPostNotification"]').length ){
				$('#elFlashMessage').find('[data-role="newPostNotification"]').replaceWith( html );
			} else {
				ips.ui.flashMsg.show( 
					html,
					{ 
						sticky: true, 
						position: 'bottom', 
						extraClasses: 'cPostFlash ipsPadding:half',
						dismissable: function () {
							self._stopPolling();
						},
						escape: false
					}
				);
			}
		},

		/**
		 * Builds browser notifications to alert users of new posts
		 *	
		 * @param 		{object} 	response 		Information object
		 * @returns 	{void}
		 */
		_buildNotifications: function (response) {
			var self = this;
			var hiddenProp = ips.utils.events.getVisibilityProp();

			// Build our browser notification if the window isn't in focus *and* we support them
			if( _.isUndefined( hiddenProp ) || !document[ hiddenProp ] || !ips.utils.notification.hasPermission() ){
				return;
			}

			var notifyData = {
				onClick: function (e) {

					// Try and focus the window (security settings may prevent it, though)
					try {
						window.focus();
					} catch (err) {}

					// And load in those posts
					self.loadNewPosts( e );
				}
			};		

			// If we already have a notification, then hide it
			if( self._notification ){
				self._notification.hide();
			}

			if( parseInt( response.count ) === 1 && !_.isUndefined( response.photo ) && !_.isUndefined( response.name ) ){
				notifyData = _.extend( notifyData, {
					title: ips.getString('notificationNewPostSingleTitle', {
						name: response.name
					}),
					body: ips.getString('notificationNewPostSingleBody', {
						name: response.name,
						title: response.title
					}),
					icon: response.photo
				});
			} else {
				notifyData = _.extend( notifyData, {
					title: ips.pluralize( ips.getString('notificationNewPostMultipleTitle'), [ response.count ] ),
					body: ips.pluralize( ips.getString('notificationNewPostMultipleBody', {
						title: response.title
					}), [ response.count ] )
				});
			}

			// Create the new one
			self._notification = ips.utils.notification.create( notifyData );
			self._notification.show();
		},

		/**
		 * Adds new replies to the display
		 *	
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		_importNewReplies: function () {
			var form = this.scope.find('[data-role="replyArea"] form');
			var commentsOnThisPage = this.scope.find('[data-commentid]');
			var _lastSeenID = this._getLastSeenID( commentsOnThisPage );
			var self = this;

			ips.getAjax()( form.attr('action'), {
				data: 'do=checkForNewReplies&type=fetch&lastSeenID=' + _lastSeenID + '&showing=' + commentsOnThisPage.length + '&csrfKey=' + ips.getSetting('csrfKey'),
				type: 'post'
			}).done( function (response) {
				// If we have more comments to load than we allow per page, then reload the page to show them plus the pagination
				if( commentsOnThisPage.length + parseInt( response.totalNewCount ) > response.perPage ){
					if( response.spillOverUrl ){
						window.location = response.spillOverUrl;
					} else {
						window.location.reload();
					}
				} else {
					if( _.isArray( response.content ) ) {
						_.each( response.content, function (item) {
							self.trigger( 'addToCommentFeed', {
								content: item,
								feedID: self._commentFeedID,
								resetEditor: false,
								totalItems: response.totalCount
							});
						});
					} else {
						self.trigger( 'addToCommentFeed', {
							content: response.content,
							feedID: self._commentFeedID,
							resetEditor: false,
							totalItems: response.totalCount
						});
					}
				}

				self._clearNotifications();
			});
		},

		/**
		 * Close the flash message for new post notifications
		 *
		 * @returns 	{void}
		 */
		_clearNotifications: function () {
			if( this._notification && _.isFunction( this._notification.hide() ) ){
				this._notification.hide();
			}

			if( $('#elFlashMessage').find('[data-role="newPostNotification"]').length ){
				$('#elFlashMessage').find('[data-role="newPostNotification"]').trigger('closeFlashMsg.flashMsg');
			}
		},

		/**
		 * Handles quick-reply functionality for this comment feed. Post the content via ajax,
		 * and trigger events to handle showing the new post (or redirecting to a new page)
		 *	
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		quickReply: function (e) {
		
			var form = this.scope.find('[data-role="replyArea"] form');
			if ( form.attr('data-noAjax') ) {
				return;
			}
			
			e.preventDefault();
			e.stopPropagation();

			var self = this;
			var replyArea = this.scope.find('[data-role="replyArea"]');
			var submit = form.find('[type="submit"]');
			var autoFollow = this.scope.find('input[name$="auto_follow_checkbox"]');
			var commentsOnThisPage = this.scope.find('[data-commentid]');
			var _lastSeenID = this._getLastSeenID( commentsOnThisPage );

			// Set the form to loading
			var initialText = submit.text();
			submit
				.prop( 'disabled', true )
				.text( ips.getString('saving') );

			var page = ips.utils.url.getPageNumber( this._pageParam );

			if( !page ){
				page = 1;
			}
			
			this._clearNotifications();

			ips.getAjax()( form.attr('action'), {
				data: form.serialize() + '&currentPage=' + page + '&_lastSeenID=' + _lastSeenID,
				type: 'post'
			})
				.done( function (response) {
					if ( response.type == 'error' ) {
						if ( response.form ) {
							ips.ui.editor.getObj( replyArea.find('[data-ipsEditor]') ).destruct();
							form.replaceWith( $(response.form) );
							$( document ).trigger( 'contentChange', [ self.scope ] );
						} else {
							ips.ui.alert.show( {
								type: 'alert',
								icon: 'warn',
								message: response.message,
								callbacks: {}
							});
						}
					}
					else if( response.type == 'redirect' ) {
						self.paginationClick( e, {
							href: response.url,
							originalEvent: e
						});
					} else if( response.type == 'merge' ) {
						var comment = self.scope.find('[data-commentid="' + response.id + '"]');
						comment.find('[data-role="commentContent"]').html( response.content );
												
						if( comment.find('pre.prettyprint').length ){
							comment.find('pre.prettyprint').each( function () {
								$( this ).html( window.PR.prettyPrintOne( _.escape( $( this ).text() ) ) );
							});
						}
						
						ips.ui.editor.getObj( self.scope.find('[data-role="replyArea"] [data-ipsEditor]') ).reset();

						if( self.scope.find('[data-role="replyArea"] input[name="guest_name"]').length )
						{
							self.scope.find('[data-role="replyArea"] input[name="guest_name"]').val('');
						}
						form.find("[data-role='commentFormError']").each(function() {
						  $( this ).remove();
						});
						
						var container = comment.closest('.ipsComment');
						if ( container.length ) {
							ips.utils.anim.go( 'pulseOnce', container );
						} else {
							ips.utils.anim.go( 'pulseOnce', comment );
						}
						ips.ui.flashMsg.show( ips.getString('mergedConncurrentPosts') );
						
						$( document ).trigger( 'contentChange', [ self.scope ] );
					} else {

						/* add the datalayer event if we posted it */
						if ( response.postedByLoggedInMember ) {
							self.trigger( 'ipsDataLayer', { _key: 'content_comment', _properties: response.dataLayer } );
						}

						self.trigger( 'addToCommentFeed', {
							content: response.content,
							totalItems: response.total,
							feedID: self._commentFeedID,
							scrollToItem: true
						});
						
						if ( response.message ) {
							ips.ui.flashMsg.show( response.message );
						}
						
						ips.ui.editor.getObj( self.scope.find('[data-role="replyArea"] [data-ipsEditor]') ).reset();

						if( self.scope.find('[data-role="replyArea"] input[name="guest_name"]').length )
						{
							self.scope.find('[data-role="replyArea"] input[name="guest_name"]').val('');
							self.scope.find('[data-role="replyArea"] [data-ipsEditor]')
								.find('.ipsComposeArea_dummy')
									.hide()
								.end()
								.find('[data-role="mainEditorArea"]')
									.show()
								.end()
								.closest('.ipsComposeArea')
									.removeClass('ipsComposeArea_minimized')
									.find('[data-ipsEditor-toolList]')
										.show();
						}
						form.find("[data-role='commentFormError']").each(function() {
						  $( this ).remove();
						});

						// If the user is following this item, we can update the follow button too
						if( autoFollow.length ){
							self.trigger( 'followingItem', {
								feedID: self.scope.attr('data-feedID'),
								following: autoFollow.is(':checked')
							});
						}
					}
					
					self._clearNotifications();
				})
				.fail( function (jqXHR, textStatus, errorThrown) {
					if( Debug.isEnabled() ){
						Debug.error("Posting new reply failed: " + textStatus);
						Debug.log( jqXHR );
						Debug.log( errorThrown );
					} else {
						form.attr('data-noAjax', 'true');
						form.attr('action', form.attr('action') + ( ( ! form.attr('action').match( /\?/ ) ) ? '?failedReply=1' : '&failedReply=1' ) );
						form.submit();
					}
				})
				.always( function () {
					submit
						.prop( 'disabled', false )
						.text( initialText ? initialText : ips.getString('submit_reply') );
				});
		},

		/**
		 * Event handler for the 'load new posts' link in flash messages
		 *	
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		loadNewPosts: function (e) {
			e.preventDefault();
			this._importNewReplies();
		},

		/**
		 * Responds to an event (trigger within this controller) indicating a new comment has been added
		 * Show it, and reset the contents of ckeditor
		 *	
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data 	Event data object
		 * @returns 	{void}
		 */
		addToCommentFeed: function (e, data) {
			if( !data.content || data.feedID != this._commentFeedID ){
				return;
			}
			
			var textarea = this.scope.find('[data-role="replyArea"] textarea');
			var content = $('<div/>').append( data.content );
			var comment = content.find('.ipsComment');

			var commentFeed = this.scope.find('[data-role="commentFeed"]');

			if( commentFeed.find('[data-role="moderationTools"]').length ){
				commentFeed = commentFeed.find('[data-role="moderationTools"]');
			}

			// Hide the 'no comment' text
			this.scope.find('[data-role="noComments"]').remove();

			// Add comment content
			commentFeed.append( comment.css({ opacity: "0.001" }) );

			var newItemTop = comment.offset().top;
			var windowScroll = $( window ).scrollTop();
			var viewHeight = $( window ).height();

			var _showComment = function () {
				comment.css({ opacity: "1" });
				ips.utils.anim.go( 'fadeInDown', comment.filter(':not(.ipsHide)') );
			};

			// If needed, scroll to the correct location before showing the comment
			if( !_.isUndefined( data.scrollToItem ) && data.scrollToItem && ( newItemTop < windowScroll || newItemTop > ( windowScroll + viewHeight ) ) ){
				$('html, body').animate( { scrollTop: newItemTop + 'px' }, 'fast', function () {
					setTimeout( _showComment, 100 ); // Short delay before fading in comment for pleasantness
				} );
			} else {
				_showComment();
			}			

			if( _.isUndefined( data.resetEditor ) || data.resetEditor !== false ){
				ips.ui.editor.getObj( this.scope.find('[data-role="replyArea"] [data-ipsEditor]') ).reset();
			}			

			if( ips.utils.db.isEnabled() ){
				var buttons = comment.find('[data-action="multiQuoteComment"]');

				buttons.hide().removeClass('ipsHide');
				ips.utils.anim.go('fadeIn', buttons);
			}
						
			this._updateCount(data.totalItems);

			$( document ).trigger( 'contentChange', [ this.scope ] );
		},
		
		/**
		 * Responds to an event indicating thay a comment has been deleted
		 * Show it, and reset the contents of ckeditor
		 *	
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data 	Event data object
		 * @returns 	{void}
		 */
		deletedComment: function( e, data ) {
			data = $.parseJSON( data.response );
			var self = this;

			if( data.type == 'redirect' ) {
				window.location = data.url;
			}
			else {
				this._updateCount( data.total );
			}

		},
		
		/**
		 * Update comment count
		 *
		 * @param	{int}	newTotal	The new total
		 * @returns 	{void}
		 */
		_updateCount: function(newTotal) {
			if ( this.scope.find('[data-role="comment_count"]') ) {
				var langString = 'js_num_comments';
				if ( this.scope.find('[data-role="comment_count"]').attr('data-commentCountString') ) {
					langString = this.scope.find('[data-role="comment_count"]').attr('data-commentCountString');
				}
				this.scope.find('[data-role="comment_count"]').text( ips.pluralize( ips.getString( langString ), newTotal ) );
			}
		},

		/**
		 * Event handler for the 'Quote x posts' button in multiquote popup
		 *	
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		doMultiQuote: function (e) {

			var mqData = this._getMultiQuoteData();
			var replyArea = this.scope.find('[data-role="replyArea"]');
			var output = [];
			var self = this;

			if( !_.size( mqData ) || !replyArea.is(':visible') ){
				return;
			}

			// Build quote array and trigger event for the editor widget to deal with
			_.each( mqData, function (value){
				output.push( value );
			});

			ips.ui.editor.getObjWithInit( this.scope.find('[data-role="replyArea"] [data-ipsEditor]'), function(editor) {
				editor.insertQuotes( output );
			});

			this._removeAllMultiQuoted();
		},

		/**
		 * Event handler for the 'clear' button in the multiquote popup
		 * Simply calls _removeAllMultiQuoted to do the clear
		 *	
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		clearMultiQuote: function (e) {
			e.preventDefault();
			this._removeAllMultiQuoted();
		},

		/**
		 * Removes all quoted posts
		 *	
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		_removeAllMultiQuoted: function () {
			var mqData = this._getMultiQuoteData();
			var self = this;
			
			// Delete all the multi-quoted posts from DB
			ips.utils.db.set( 'mq', 'data', {} );

			// Hide popup
			this._buildMultiQuote(0);

			if( !_.size( mqData ) ){
				return;
			}

			// Loop through each quoted posts and see if it exists on this page by building a selector,
			// then updating classnames on elements that match it
			_.each( mqData, function (value) {
				self.triggerOn( 'core.front.core.comment', 'setMultiQuoteDisabled.comment', {
					contentapp: value.contentapp,
					contenttype: value.contenttype,
					contentcommentid: value.contentcommentid
				});
			});
		},

		/**
		 * Responds to an addMultiQuote event
		 * Adds the provided post data to the multiquote DB entry and updates the popup
		 *	
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		addMultiQuote: function (e, data) {
			var mqData = this._getMultiQuoteData();
			var key = data.contentapp + '-' + data.contenttype + '-' + data.contentcommentid;
			
			// Have we hit a limit?
			if( _.size( mqData ) == this._maximumMultiQuote )
			{
				ips.ui.alert.show( {
					type: 'alert',
					icon: 'warn',
					message: ips.pluralize( ips.getString( 'maxmultiquote' ), this._maximumMultiQuote ),
					callbacks: {
						ok: function () {
							$("button[data-mqId='" + data.button + "']").removeClass('ipsButton_alternate')
								.addClass('ipsButton_simple')
								.removeAttr('data-mqActive')
								.html( ips.templates.render('core.posts.multiQuoteOff') );
						}
					}
				});
				return false;
			}

			mqData[ key ] = data;

			ips.utils.db.set( 'mq', 'data', mqData );

			this._buildMultiQuote( _.size( mqData ) );
		},

		/**
		 * Responds to a removeMultiQuote event
		 * Removes the provided post data from the multiquote DB entry and updates the popup
		 *	
		 * @param 		{event} 	e 		Event object
		 * @param 		{object} 	data	Event data object
		 * @returns 	{void}
		 */
		removeMultiQuote: function (e, data) {
			var mqData = this._getMultiQuoteData();
			var key = data.contentapp + '-' + data.contenttype + '-' + data.contentcommentid;

			if( !_.isUndefined( mqData[ key ] ) ){
				mqData = _.omit( mqData, key );

				ips.utils.db.set( 'mq', 'data', mqData );

				this._buildMultiQuote( _.size( mqData ) );
			}
		},

		/**
		 * Returns the current multiquote data from the localStorage
		 *	
		 * @returns 	{object} 	Multiquote data from localStorage
		 */
		_getMultiQuoteData: function () {
			// Get the IDs we already have saved
			var mqData = ips.utils.db.get('mq', 'data');

			if( _.isUndefined( mqData ) || !_.isObject( mqData ) ){
				return {};
			}

			return mqData;
		},

		/**
		 * Called when the controller is initialized
		 * Checks whether there's any mq data, and shows the popup if so
		 *	
		 * @returns 	{void}
		 */
		_setUpMultiQuote: function () {

			if( !ips.utils.db.isEnabled() ){
				return;
			}

			var buttons = this.scope.find('[data-action="multiQuoteComment"]');
			var self = this;
			var mqData = this._getMultiQuoteData();

			buttons.show();

			if( _.size( mqData ) ){
				this._buildMultiQuote( _.size( mqData ) );

				// Loop through each quoted posts and see if it exists on this page by building a selector,
				// then updating classnames on elements that match it
				_.each( mqData, function (value) {
					self.triggerOn( 'core.front.core.comment', 'setMultiQuoteEnabled.comment', {
						contentapp: value.contentapp,
						contenttype: value.contenttype,
						contentcommentid: value.contentcommentid
					});
				});
			}			
		},

		/**
		 * Builds the multiquote popup, either from a template if this is the first time,
		 * or updates the value if it already exists.
		 *	
		 * @param 		{number} 	count 		Count of quoted posts
		 * @returns 	{void}
		 */
		_buildMultiQuote: function (count) {
			var quoterElem = $('#ipsMultiQuoter');

			if( !quoterElem.length && count ){
				ips.getContainer().append( ips.templates.render('core.posts.multiQuoter', {
					count: ips.getString('multiquote_count', {
						count: ips.pluralize( ips.getString( 'multiquote_count_plural' ), [ count ] )
					}),
					commentFeedId: this._containerID
				}));

				ips.utils.anim.go( 'zoomIn fast', $('#ipsMultiQuoter') );
			} else {

				// Since we only show one global multiquote button (not per-feed), the existing button
				// might have been created/shown by another feed on the same page. We'll assume the latest 
				// comment feed to show is the one the user cares about, and update the button attributes 
				// so that this controller properly handles clicks on it.
				if( quoterElem.attr('data-commentsContainer') !== this._containerID ){
					quoterElem
						.attr('data-commentsContainer', this._containerID )
						.find('[data-role^="multiQuote_"]')
							.attr('data-role', 'multiQuote_' + this._containerID)
						.end()
						.find('[data-action^="clearQuoted_"]')
							.attr('data-action', 'clearQuoted_' + this._containerID);
				}

				quoterElem.find('[data-role="quotingTotal"]').text( 
					ips.pluralize( ips.getString( 'multiquote_count_plural' ), [ count ] )
				);

				if( count && quoterElem.is(':visible') ){
					ips.utils.anim.go( 'pulseOnce fast', quoterElem );	
				} else if( count && !quoterElem.is(':visible') ){
					ips.utils.anim.go( 'zoomIn fast', quoterElem );
				} else {
					ips.utils.anim.go( 'zoomOut fast', quoterElem );
				}
				
			}
		},

		/**
		 * Returns the largest ID number on the page, taking into account the fact that the topic
		 * wrapper may specify a higher ID (in cases where a question's answer is on a different page)
		 *	
		 * @param 		{array} 	commentsOnThisPage 		Array of comments on this page, based on having the [data-commentid] attribute
		 * @returns 	{number}
		 */
		_getLastSeenID: function (commentsOnThisPage) {
			var commentFeed = this.scope.find('[data-role="commentFeed"]');
			var maxComment = _.max( commentsOnThisPage, function (comment) {
				return parseInt( $( comment ).attr('data-commentid') );
			});
			var max = $( maxComment ).attr('data-commentid');

			// If the topic feed 
			if( commentFeed.attr('data-topicAnswerID') && parseInt( commentFeed.attr('data-topicAnswerID') ) > max ){
				max = parseInt( commentFeed.attr('data-topicAnswerID') );
			}

			Debug.log("Max comment ID is " + max);
			return max;
		}
	});
}(jQuery, _));