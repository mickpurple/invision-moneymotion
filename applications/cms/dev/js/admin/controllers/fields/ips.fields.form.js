/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.fields.form.js
 *
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('cms.admin.fields.form', {
		currentValue: null,
		initialize: function () {
			$('#elTextarea_field_default_value').on( 'keypress', this.checkChange );
			
			if ( $('#field_default_update_existing').length )
			{
				this.currentValue = $('#elTextarea_field_default_value').val();
				$('#field_default_update_existing').hide();
			}

			this.on( 'change', '#check_field_display_listing', this.updateListingFields );
			this.on( 'change', '#check_field_display_display', this.updateDisplayFields );
			this.on( 'change', 'select[name="field_type"]', this.setup );
			this.setup();
		},

		setup: function(){
			this.updateListingFields();
			this.updateDisplayFields();
		},
		
		/**
		 * checkChange handler
		 *
		 * @param	{event} 	e 	Event object
		 * @returns {void}
		 */
		checkChange: function (e) {
			
			if ( $('#elTextarea_field_default_value').val() != this.currentValue )
			{
				$('#field_default_update_existing').show();
			}
		},

		updateListingFields: function(){
			let fieldType = $( 'select[name="field_type"]' ).val();
			if( $( '#check_field_display_listing' ).is( ':checked' ) ){
				if( fieldType !== 'Text' && fieldType !== 'TextArea' ){
					$( '#field_truncate' ).hide();
				} else {
					$( '#field_truncate' ).show();
				}
				if( fieldType !== 'Address' ){
					$( '#field_show_map_listing' ).hide();
				} else {
					$( '#field_show_map_listing' ).show();
				}
				if( fieldType === 'Youtube' || fieldType === 'Spotify' || fieldType === 'Soundcloud' ){
					$( '#field_display_listing_json_badge' ).hide();
					$( '#media_display_listing_method' ).show();
				}
			} else {
				$( '#field_truncate' ).hide();
				$( '#field_show_map_listing' ).hide();
				$( '#media_display_listing_method' ).hide();
			}
		},

		updateDisplayFields: function(){
			let fieldType = $( 'select[name="field_type"]' ).val();
			if( $( '#check_field_display_display' ).is( ':checked' ) ){
				if( fieldType !== 'Address' ){
					$( '#field_show_map_display' ).hide();
				} else {
					$( '#field_show_map_display' ).show();
				}
				if( fieldType === 'Youtube' || fieldType === 'Spotify' || fieldType === 'Soundcloud' ){
					$( '#field_display_display_json_badge' ).hide();
					$( '#media_display_display_method' ).show();
				}
			} else {
				$( '#field_show_map_display' ).hide();
				$( '#media_display_display_method' ).hide();
			}
		}
	});
}(jQuery, _));