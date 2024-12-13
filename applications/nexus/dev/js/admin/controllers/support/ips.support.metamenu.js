/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.support.metamenu.js - Makes the page print
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.admin.support.metamenu', {
				
		/**
		 * Init
		 */
		initialize: function () {
			var scope = this.scope;
			this.scope.parent().find('li a').on( 'click', function(e){
				e.preventDefault();
				var target = $( e.currentTarget );
				
				if ( !target.parent().attr('data-noSet') ) {
					scope.find('[data-role="title"]').text( target.find('[data-role="title"]').text() );
				}
				
				if ( target.parent().attr('data-group') ) {
					var siblings = target.parent().parent().find( 'li[data-group="'+target.parent().attr('data-group')+'"]' );
				} else {
					var siblings = target.parent().parent().find( 'li' );
				}
				
				siblings.removeClass( 'ipsMenu_itemChecked' );
				target.parent().addClass( 'ipsMenu_itemChecked' );

				ips.getAjax()( target.attr('href') )	
					.done(function(response){
						console.log(response);
						var i;
						for ( i in response ) {
							if ( i == 'alert' ) {
								ips.ui.alert.show( {
									type: 'alert',
									icon: 'warn',
									message: response[i],
								});
							} else if ( i == 'staff' ) {
								var staffMenu = $('[data-role="staffMenu"]');
								staffMenu.find('[data-role="title"]').text( response[i].name );
								$( 'li[data-group="staff"]' ).removeClass('ipsMenu_itemChecked');								
								$( 'li[data-group="staff"][data-id="'+response[i].id+'"]' ).addClass('ipsMenu_itemChecked');
							} else if ( i == 'staffBadge' ) {
								if ( response[i] ) {
									$('[data-role="requestAssignedToBadge"]').css( 'display', 'inline-block' );
								} else {
									$('[data-role="requestAssignedToBadge"]').hide();
								}
								$('[data-role="requestAssignedToText"]').text( response[i] );
							} else if ( i == 'severityBadge' ) {
								if ( response[i] ) {
									$('[data-role="requestSeverityBadge"]').css( 'display', 'inline-block' ).html( response[i] );
								} else {
									$('[data-role="requestSeverityBadge"]').hide();
								}
							} else if ( i == 'statusBadge' ) {
								$('[data-role="requestStatusBadge"]').html( response[i] );
							} else if ( i == 'stockActions' ) {
								$('#elSelect_stock_action').children().remove();
								var j;
								for ( j in response[i] ) {
									$('#elSelect_stock_action').append( $('<option>').attr( 'value', j ).text( response[i][j] ) );
								}
							} else if ( i == 'purchaseWarning' ) {
								$('[data-role="purchaseWarning"]').hide();								
								if ( response[i] ) {
									$('[data-purchaseWarning="' + response[i] + '"]').show();
								}
							} else if ( i.substr( 0, 5 ) == 'note_' ) {
								$('#elNoteForm_form [name="' + i.substr( 5 ) + '"]').val( response[i] ); 
							} else {
								$('#elSupportReplyForm [name="' + i + '"]').val( response[i] ); 
							}
						}
					})
					.fail(function(){
						ips.ui.alert.show( {
							type: 'alert',
							icon: 'info',
							message: ips.getString('support_ajax_error')
						});
					})
			} );
			this.on( 'menuOpened', this.startListeningForKeyPress );
			this.on( 'menuClosed', this.stopListeningForKeyPress );
		},
		
		/**
		 * Start listening for key presses
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		startListeningForKeyPress: function (e) {
			$( '#' + $(this.scope).attr('id') + '_menu ul' ).find('.ipsMenu_hover').removeClass('ipsMenu_hover');
			this._boundKeyPress = _.bind( this.keyPress, this );
			$( document ).on( 'keydown', this._boundKeyPress );
		},
		
		/**
		 * Stop listening for key presses
		 *
		 * @param 	{event} 	e 	Event object
		 * @returns {void}
		 */
		stopListeningForKeyPress: function (e) {
			$( '#' + $(this.scope).attr('id') + '_menu ul' ).removeClass('ipsMenu_keyNav');
			$( '#' + $(this.scope).attr('id') + '_menu ul' ).find('.ipsMenu_hover').removeClass('ipsMenu_hover');
			$( document ).off( 'keydown', this._boundKeyPress );
		},
				
		/**
		 * Handles key press
		 *
		 * @param 	{event} 	e 		Event object
		 * @param 	{obj} 		data 	Data object
		 * @returns {void}
		 */
		keyPress: function (e, data) {
			e.preventDefault();
			
			var menuList = $( '#' + $(this.scope).attr('id') + '_menu ul' );
			menuList.addClass('ipsMenu_keyNav');
			var active = menuList.find('.ipsMenu_hover');
						
			switch ( e.which ) {
				case 38: // up
					if ( active.length ) {
						active.removeClass('ipsMenu_hover');
						var prev = active.prev();
						if ( prev.length ) {
							prev.addClass('ipsMenu_hover');
						} else {
							menuList.children().last().addClass('ipsMenu_hover');
						}
					} else {
						menuList.children().last().addClass('ipsMenu_hover');
					}
					break;
				case 40: // down
					if ( active.length ) {
						active.removeClass('ipsMenu_hover');
						var next = active.next();
						if ( next.length ) {
							next.addClass('ipsMenu_hover');
						} else {
							menuList.children().first().addClass('ipsMenu_hover');
						}
					} else {
						menuList.children().first().addClass('ipsMenu_hover');
					}
					break;
				case 13: // enter
					if ( active.length ) {
						active.find('a').click();
					}
					break;
				case 27: // esc
					$(this.scope).click();
					break;
			}
		}
				
	});
}(jQuery, _));