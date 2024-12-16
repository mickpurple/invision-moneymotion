/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.dashboard.js
 *
 * Author: Brandon Farber
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.support.dashboard', {
		// Counters
		blocksToLoad: 0,
		blocksLoaded: 0,

		criticalIssuesCount: 0,
		recommendedIssuesCount: 0,

		// AJAX guide searching
		results: {},
		_ajax: {},
		_timers: {},
		_lastValue: '',
		_input : null,

		/**
		 * Initialization method
		 *
		 * @returns {void}
		 */
		initialize: function () {
			this.on( 'click', '[data-role="checkAgain"]', this.checkAgain );
			this.on( 'click', '[data-role="clearCaches"]', this.clearCaches );
			this.on( 'click', '[data-role="disableCustomizations"]', this.disableCustomizations );
			this.on( 'click', '[data-role="enableCustomizations"]', this.enableCustomizations );
			this.on( 'click', '[data-action="enableThirdPartyPart"]', this.enableSingleCustomizations );
			this.on( document, 'customizationsEnabled', this.setCustomizationsButton );

			this._input = $('#elInput_support_advice_search');
			this.on( 'focus', '#elInput_support_advice_search', this.fieldFocus );
			this.on( 'blur', '#elInput_support_advice_search', this.fieldBlur );
			this.on( 'submit', '#guidesForm form', this.guideFormSubmit );

			this.initializeBlocks();
		},

		/**
		 * Stop guide search form submissions
		 *
		 * @param	{event}		e	Event object
		 * @returns	{void}
		 */
		guideFormSubmit: function (e) {
			e.preventDefault();
		},

		/**
		 * Event handler for focusing in the search box
		 * Set a timer going that will watch for value changes. If there's already a value,
		 * we'll show the results immediately
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		fieldFocus: function (e) {
			// Set the timer going
			this._timers.focus = setInterval( _.bind( this.guideSearch, this ), 700 );
		},

		/**
		 * Event handler for field blur
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		fieldBlur: function (e) {
			clearInterval( this._timers );
		},

		/**
		 * Guides live search
		 *
		 * @param	{event}	e	Event
		 * @returns	void
		 */
		 guideSearch: function( e ) {
			var searchTerm = this._input.val().trim();

			if( searchTerm == this._lastValue ) {
				return;
			}

			if( searchTerm.length < 3 ) {
				if( !$('#featuredGuides').is(':visible') && searchTerm.length == 0 ) {
					ips.utils.anim.go( 'fadeIn fast', $('#featuredGuides') );
					ips.utils.anim.go( 'fadeOut fast', $('#guideSearchResults') );
				}
				return;
			}

			this._lastValue = searchTerm;

		 	$('#guideSearchResults > ul').html('').parent().addClass('ipsLoading');

		 	if( $('#featuredGuides').is(':visible') ) {
				ips.utils.anim.go( 'fadeOut fast', $('#featuredGuides') );
				ips.utils.anim.go( 'fadeIn fast', $('#guideSearchResults') );
		 	}

			var self = this;

			// Abort any requests running now
			if( _.size( this._ajax ) ){
				_.each( this._ajax, function (ajax) {
					try {
						if( _.isFunction( ajax.abort ) ) {
							ajax.abort();
							Debug.log('aborted ajax');
						}
					} catch (err) { }
				});
			}

			// Check caches
		 	if( !_.isUndefined( this.results[ searchTerm ] ) )
		 	{
		 		this.showResults( this.results[ searchTerm ] );
		 		return;
		 	}

			ips.getAjax()('?app=core&module=support&controller=support&do=guideSearch', {
				dataType: 'json',
				data: {
					search_term: encodeURIComponent( searchTerm )
				}
			}).done( function (response) {
				
				self.results[ searchTerm ] = response;
				
				self.showResults( response );
			}).fail( function (err) {
				// fail gets called when it's aborted, so deliberately do nothing here
			});
		},

		/**
		 * Process the guide search results and display
		 *
		 * @param	{object}	results		Search results
		 * @returns	{void}
		 */
		showResults: function( results ) {
			$('#guideSearchResults').removeClass('ipsLoading');

			var html = '';
			if( results.length )
			{
				_.each( results, function( result ) {
					html += ips.templates.render('support.guideSearch', result );
				});
			}
			else
			{
				html = ips.templates.render('support.guideSearch.noResults' );
			}

			if( html ) {
				$('#guideSearchResults > ul').html( html );
			} else {
				// Show "no results"
			}
		},

		/**
		 * Initializes all blocks
		 *
		 * @returns {void}
		 */
		initializeBlocks: function() {
			var self = this;

			self.blocksToLoad	= 0;
			self.blocksLoaded	= 0;
			self.criticalIssuesCount	= 0;
			self.recommendedIssuesCount	= 0;

			_.each( $(this.scope).find('[data-role="patchworkItem"]'), function( elem ) {
				$(elem).find('[data-role="supportBlock"]').html('').addClass( 'ipsLoading' );
				$(elem).find('[data-iconType]').hide();
				$(elem).removeClass( 'elCritical' );
				self.loadBlock( $(elem).attr('data-blockid') );
				self.blocksToLoad++;
			});
		},

		/**
		 * Callback when we click the "check again" button. Resets our counters and reinitializes.
		 *
		 * @returns {void}
		 */
		checkAgain: function() {
			this.blocksToLoad = 0;
			this.blocksLoaded = 0;

			this.scope.find('[data-role="summary"]').hide();

			this.initializeBlocks();
		},

		/**
		 * Callback when we click the "disable customizations" button.
		 *
		 * @param	{event} 	e 	Click event
		 * @returns {void}
		 */
		disableCustomizations: function( e ) {
			e.preventDefault();

			$(e.target).prop( 'disabled', true ).attr( 'data-oldText', $(e.target).text() ).text( ips.getString('supportDisablingCustomizations') );

			var self = this;
			ips.getAjax()( $(e.target).attr('href') )
				.done( function( response ) {
					self.scope.find('[data-role="customizationsWrapper"]').html( response );

					self.scope.find('[data-role="disableCustomizations"]')
						.text( $(e.target).attr('data-oldText') )
						.prop( 'disabled', false )
						.hide();
					self.scope.find('[data-role="enableCustomizations"]').show();

					$( document ).trigger( 'contentChange', [ self.scope ] );
				});
		},

		/**
		 * Callback when we click the "re-enable customizations" button.
		 *
		 * @param	{event} 	e 	Click event
		 * @returns {void}
		 */
		enableCustomizations: function( e ) {
			e.preventDefault();

			$(e.target).prop( 'disabled', true ).attr( 'data-oldText', $(e.target).text() ).text( ips.getString('supportEnablingCustomizations') );
			
			var self = this;
			ips.getAjax()( $(e.target).attr('href') )
				.done( function( response ) {
					self.scope.find('[data-role="disableCustomizations"]').show();
					self.scope.find('[data-role="enableCustomizations"]').prop( 'disabled', false ).text( $(e.target).attr('data-oldText') ).hide();

					var container = self.scope.find('[data-role="disabledInformation"]');
					container.find('.ipsType_warning').removeClass('ipsType_warning').addClass('ipsType_neutral');
					container.find('.fa-exclamation-triangle').removeClass('fa-exclamation-triangle').addClass('fa-info-circle');
					container.find('.ipsButton_negative').removeClass('ipsButton_negative').addClass('ipsButton_light');
					container.find('[data-role="disabledMessage"]').hide();
					container.find('[data-role="enabledMessage"]').show();
					container.find('[data-action="enableThirdPartyPart"]').remove();

					$( document ).trigger( 'contentChange', [ self.scope ] );
				});
		},

		/**
		 * Callback when we click the "re-enable customizations" button.
		 *
		 * @param	{event} 	e 	Click event
		 * @returns {void}
		 */
		enableSingleCustomizations: function( e ) {
			e.preventDefault();

			$(e.target).prop('disabled', true).text( ips.getString('supportEnablingCustomizations') );
			
			var self = this;
			ips.getAjax()( $(e.target).attr('href') + '&enable=1&type=' + $(e.target).attr('data-type') )
				.done( function( response ) {
					var container = $(e.target).closest('li');
					container.find('.ipsType_warning').removeClass('ipsType_warning').addClass('ipsType_neutral');
					container.find('.fa-exclamation-triangle').removeClass('fa-exclamation-triangle').addClass('fa-info-circle');
					container.find('.ipsButton_negative').removeClass('ipsButton_negative').addClass('ipsButton_light');
					container.find('[data-role="disabledMessage"]').hide();
					container.find('[data-role="enabledMessage"]').show();

					if( self.scope.find('.ipsButton_negative').length < 1 )
					{
						self.scope.find('[data-role="disableCustomizations"]').show();
						self.scope.find('[data-role="enableCustomizations"]').hide();

						$( document ).trigger( 'customizationsEnabled' );
					}
					
					$(e.target).remove();

					$( document ).trigger( 'contentChange', [ self.scope ] );
				});
		},

		/**
		 * Callback when we click the "clear caches" button.
		 *
		 * @returns {void}
		 */
		clearCaches: function( e ) {
			e.preventDefault();
			var button = this.scope.find('[data-role="clearCaches"]');

			if( button.hasClass( 'ipsButton_disabled' ) ) {
				return;
			}

			var self = this;
			ips.getAjax()( '?app=core&module=support&controller=support&do=clearCaches' )
				.done( function( response ) {
					ips.ui.flashMsg.show( ips.getString( 'health_caches_cleared' ) );
				})
				.always( function() {
					self.scope.find('[data-role="clearCaches"]').removeClass( 'ipsButton_disabled' );
				});
		},

		/**
		 * Load an individual block
		 *
		 * @param	{string} 	blockid 	The block id to load
		 * @returns {void}
		 */
		loadBlock: function( blockid ) {
			var loadBlockUrl = '?app=core&module=support&controller=support&do=getBlock&block=' + blockid;
			var self = this;

			ips.getAjax()( loadBlockUrl )
				.done( function( response ) {
					self.scope.find('[data-blockid="' + blockid + '"] [data-role="supportBlock"]').html( response.html ).removeClass( 'ipsLoading' );
				
					$( document ).trigger( 'contentChange', [ self.scope.find('[data-blockid="' + blockid + '"]') ] );

					self.blocksLoaded++;
					self.criticalIssuesCount = self.criticalIssuesCount + parseInt( response.criticalIssues );
					self.recommendedIssuesCount = self.recommendedIssuesCount + parseInt( response.recommendedIssues );

					self.scope.find('[data-blockid="' + blockid + '"] [data-iconType]').hide();

					if( parseInt( response.criticalIssues ) )
					{
						ips.utils.anim.go( 'fadeIn slow', self.scope.find('[data-blockid="' + blockid + '"] [data-iconType="critical"]') );
						self.scope.find('[data-blockid="' + blockid + '"]').addClass( 'elCritical' );
					}
					else if( parseInt( response.recommendedIssues ) )
					{
						ips.utils.anim.go( 'fadeIn slow', self.scope.find('[data-blockid="' + blockid + '"] [data-iconType="recommended"]') );
					}

					if( self.blocksLoaded == self.blocksToLoad )
					{
						self.finishSetup();
					}
				})
				.fail( function(response)
					{
						self.scope.find('[data-blockid="' + blockid + '"] [data-role="supportBlock"]').html( ips.getString("hookscanner_error") ).removeClass( "ipsLoading" );
						self.scope.find('[data-blockid="' + blockid + '"]').addClass( 'elCritical' );
						$( document ).trigger( 'contentChange', [ self.scope.find('[data-blockid="' + blockid + '"]') ] );

						self.blocksLoaded++;
					});
		},

		/**
		 * Callback once all blocks have loaded
		 *
		 * @returns {void}
		 */
		finishSetup: function() {
			this.scope.find('[data-role="summaryText"]').html( ips.pluralize( ips.getString( 'health_check_summary' ), [ this.criticalIssuesCount, this.recommendedIssuesCount ] ) );

			ips.utils.anim.go( 'fadeIn slow', this.scope.find('[data-role="summary"]') );

			$(document).trigger('refreshSupportSummary');
		}
	});
}(jQuery, _));