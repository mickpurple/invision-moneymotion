/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.templates.simple.js - Templates: controller for the simple editor
 *
 * Author: Matt "Oops I did it again" Mecham
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.templates.simple', {
		
		_cmInstances: {},
		
		initialize: function () {
			this.on( 'click', 'button[type="submit"]', this.save );
			this.on( 'tabChanged', this.changedTab );
			var debounce = _.debounce( _.bind( this._recalculatePanelWrapper, this ), 100 );
			this.on( window, 'resize', debounce );

			// Other setup
			this.setup();
		},

		/**
		 * Setup method
		 *
		 * @returns {void}
		 */
		setup: function () {
			var self = this;
			
			ips.loader.get( ['core/interface/codemirror/diff_match_patch.js','core/interface/codemirror/codemirror.js'] ).then( function () {
				self._initCodeMirror( 'theme_simple_header', 'htmlmixed' );
				self._initCodeMirror( 'theme_simple_footer', 'htmlmixed' );
				self._initCodeMirror( 'theme_simple_css', 'css' );
			});
		},
		
		/**
		 * Initializes CodeMirror on a textarea with the provided key
		 *
		 * @param 	{string}	key 	Key of the textarea to be turned into codemirrior
		 * @param	{string} 	type 	'templates' or 'css'
		 * @returns {void}
		 */
		_initCodeMirror: function (key, type) {
			var self = this;
			this._cmInstances[ key ] = CodeMirror.fromTextArea( document.getElementById( 'elTextarea_' + key ), { 
				mode: type,
				lineNumbers: false
			} );
			this._cmInstances[ key ].setSize( null, this._getContentHeight() );

			this.scope.find('#elTextarea_' + key ).parent().addClass('ipsAreaBackground ipsPad_half ipsClearfix');
		},
		
		/**
		 * Tab widget has indicated that the user has changed tab
		 * If there's a file ID, trigger a new event with it, to enable the file listing to highlight it
		 *
		 * @param	{event} 	e 		Event object
		 * @param	{object} 	data 	Event data object
		 * @returns {void}
		 */
		changedTab: function (e, data) {
			this._recalculatePanelWrapper();
		},
		
		/**
		 * Saves the contents of the editor
		 *
		 * @param	{event} 	e 		Event object
		 * @returns {void}
		 */
		save: function (e) {
			e.preventDefault();
			var self = this;
			var form = this.scope.find('form[data-formid="form"]');
			var save = {};
			
			// We call .save() on the CodeMirror instance, which will cause it to update the
			// contents of the original textbox.
			_.each( this._cmInstances, function(key, cm)
			{
				key.save();
			});

			// Get the fields
			form.find('input').each( function() {
				save[ $(this).attr('name') ] = $(this).val();
			} );
			
			form.find('textarea').each( function() {
				save[ $(this).attr('name') ] = $(this).val();
			} );
			
			Debug.log( save );
			
			self.scope.find('button[type="submit"]').addClass('ipsButton_disabled').removeClass('ipsButton_primary');
			
			// Send it
			ips.getAjax()( form.attr('action'), {
				dataType: 'json',
				data: save,
				type: 'post'
			})
				.done( function (response) {
					ips.ui.flashMsg.show( ips.getString('saved') );
				})
				.fail( function ( jqXHR ) {
					var message = ips.getString('saveThemeError');
					try
					{
						message = $.parseJSON( jqXHR.responseText );
					}
					catch (e) {}

					ips.ui.alert.show( {
						type: 'alert',
						message: message,
						icon: 'warn'
					});
				})
				.always( function () {
					self.scope.find('button[type="submit"]').removeClass('ipsButton_disabled').addClass('ipsButton_primary');
				});
		},
		
		/**
		 * Returns the current height of the tab panel wrapper
		 *
		 * @returns {number}
		 */
		_getContentHeight: function () {
			return $( window ).height() - this.scope.find('#tabs_form').offset().top - 250;
		},
		
		/**
		 * Calculates whether the tab bar has wrapped, and if so, resizes the panel wrapper and updates
		 * CodeMirror instances with the new height
		 *
		 * @returns {void}
		 */
		_recalculatePanelWrapper: function () {
			// Get the height of it
			var self = this;

			_.each( this._cmInstances, function(key, cm)
			{
				key.setSize( null, self._getContentHeight() );
			});
		}
	});
}(jQuery, _));