/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.modcp.warnForm.js - Controller for the add warning form
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.modcp.warnForm', {
		pointsEdited: false,
		expirationEdited: false,
		editorSetTo: '',

		initialize: function () {
			var self = this;
			this.on( 'change', '[name="warn_reason"]', this.changeReason ); 
			this.on( 'change', '[name="warn_points"]', this.changePoints );
			this.on( 'change', '[name="warn_remove"],[name="warn_remove_time"]', function( e ) {
				self.expirationEdited = true;
			} );
			this.on( 'editorWidgetInitialized', this.editorInitialized );
		},

		editorInitialized: function (e, data) {
			if( data.id == 'warn_member_note' ){
				$('[name="warn_reason"]').change(); // Set for initial value	
			}
		},
		
		/**
		 * Change reason handler
		 *	
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		changeReason: function(e) {
			var scope = this.scope;
			var self  = this;

			ips.getAjax()( ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=warnings&do=reasonAjax&id=' + $( e.target ).val() ).done( function(response) {

				// If the points have been changed AND we can override the points, do not adjust
				if( self.pointsEdited == false || response.points_override == 0 )
				{
					var pointsNow = scope.find('[name="warn_points"]').val();
                	scope.find('[name="warn_points"]').val( response.points ).prop( 'disabled', response.points_override == 0 );

                	if( pointsNow != response.points )
                	{
                		scope.find('[name="warn_points"]').change();
                	}

                	// Flag that we're back to default
                	self.pointsEdited = false;
                }
                
                var removePointsUnlimited = scope.find('[name="warn_remove_unlimited"]');

                if ( response.remove.unlimited ) {
                	if( self.expirationEdited == false || response.remove_override == 0 )
                	{
						if( removePointsUnlimited.prop( 'checked' ) == false )
						{
							if( removePointsUnlimited.prop('disabled') == true ){
								removePointsUnlimited.prop('disabled', false).click().prop('disabled', true);
							} else {
								removePointsUnlimited.click();
							}
						}
					}
				} else if( self.expirationEdited == false || response.remove_override == 0 ) {
					removePointsUnlimited.prop( 'checked', false );
					scope.find('[name="warn_remove"]').val( response.remove.date ).prop( 'disabled', response.remove_override == 0 );
					scope.find('[name="warn_remove_time"]').val( response.remove.time ).prop( 'disabled', response.remove_override == 0 );
				}
				removePointsUnlimited.prop( 'disabled', response.remove_override == 0 );

				var editor = ips.ui.editor.getObj( $( 'textarea[name="warn_member_note"]' ).closest('[data-ipsEditor]') );

				if( response.notes ){
					var currentContents = editor.getInstance().getData();
					var previousContents = self.editorSetTo;
					editor.unminimize( function(){
						if ( currentContents == previousContents ) {
							editor.reset();
						} else {
							editor.insertHtml('<p></p>');
						}
						editor.insertHtml( response.notes );
						editor.resetDirty();
						self.editorSetTo = editor.getInstance().getData();
					});
				}
				
			} );
		},
		
		/**
		 * Change points handler
		 *	
		 * @param 		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		changePoints: function(e) {
			this.pointsEdited	= true;
			var scope = this.scope;

			ips.getAjax()( ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=warnings&do=actionAjax&points=' + $( e.target ).val() + '&member=' + scope.attr('data-member') ).done( function(response) {
				var types = [ 'mq', 'rpa', 'suspend' ];

				scope.find( 'ul#elWarningPenalties').remove();
				if( parseInt( response.override ) ) {
					scope.find( 'li#form_warn_punishment .ipsFieldRow_content' ).show();
				}
				else {
					scope.find( 'li#form_warn_punishment .ipsFieldRow_content' ).hide();
					var enforcedPenalties = [];
					for( var i = 0; i < 3; i++ ) {
						if( parseInt( response.actions[ types[i] ].unlimited ) ) {
							enforcedPenalties.push( ips.getString( 'warningPunishmentIndefinitely', { type: ips.getString( 'warningPunishment_' + types[i] ) } ) );
						}
						else if( response.actions[ types[i] ].date != "" ) {
							var date = new Date( response.actions[ types[i] ].date + ' ' + response.actions[ types[i] ].time );
							enforcedPenalties.push( ips.getString( 'warningPunishmentDate', { type: ips.getString( 'warningPunishment_' + types[i] ), date: ips.utils.time.localeDateString( date, { dateStyle: "long", timeStyle: "short" } ) } ) );
						}

						// uncheck checkbox to hide toggled on fields
						scope.find( '[name="warn_punishment[' + types[i] + ']"]' ).prop( 'checked', false ).change();
					}

					// Generate penalty list
					scope.find( 'li#form_warn_punishment').append( ips.templates.render('system.warningpenalty.nomodify', { penalties: enforcedPenalties } ) );
				}

				for( var i = 0; i < 3; i++ ) {
					// Only check this checkbox if it can be overridden
					if( parseInt( response.override ) )
					{
						scope.find( '[name="warn_punishment[' + types[i] + ']"]' ).prop( 'checked', ( response.actions[ types[i] ].date || response.actions[ types[i] ].unlimited ) ).change();
					}
					scope.find( '[name="warn_' + types[i] + '"]' ).val( response.actions[ types[i] ].date ).prop( 'disabled', !parseInt( response.override ) );
					scope.find( '[name="warn_' + types[i] + '_time"]' ).val( response.actions[ types[i] ].time ).prop( 'disabled', !parseInt( response.override ) );
					scope.find( '[name="warn_' + types[i] + '_unlimited"]' ).prop( 'checked', response.actions[ types[i] ].unlimited ).prop( 'disabled', !parseInt( response.override ) );
				}
			} );
		}
		

	});
}(jQuery, _));
