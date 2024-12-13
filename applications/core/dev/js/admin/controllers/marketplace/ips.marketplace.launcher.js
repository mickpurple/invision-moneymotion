/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.marketplace.authentication.js - Handles signing in to the marketplace
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.marketplace.launcher', {

		_termsAndConditions: false,
		_termsFromPurchase: false,
		_install: false,
		_dialog: null,

		initialize: function () {
			this._termsAndConditions = $('#downloadTerms').length ? true : false;

			this.on('click', '[data-action="signIn"]', this.signIn );
			this.on('click', '[data-role="update"], [data-role="install"], [data-action="launchWindow"]', this.termsAndConditions );
			$(document).on('click', '[data-action="acceptDisclaimer"]', _.bind( this.acceptTermsAndConditions, this ) );
			$(document).on( 'searchResultSelected', function(e,data) {
				window.location = data.url;
			});

			this.on( 'click', '[data-action="showError"]', this.showError );
			window.addEventListener( 'message', this.receivedMessage );
		},

		signIn: function(e) {
			window.open( this.scope.data('url'), '_blank', 'height=' + this.scope.attr('data-height') + ',width=575,menubar=0,status=0,titlebar=0' );
		},

		termsAndConditions: function(e) {
			e.preventDefault();
			var disclaimer = this.scope.data('disclaimer-location');
			this._termsFromPurchase = $( e.target ).data('role') == 'purchase' ? true : false;
			this._install = $( e.target ).data('role') == 'install' ? true : false;

			if ( this._termsAndConditions && ( disclaimer == 'both' || this._termsFromPurchase == false && disclaimer == 'download' || this._termsFromPurchase == true && disclaimer == 'purchase' ) ) {
				this._dialog = ips.ui.dialog.create({
					content: '#downloadTerms',
					title: $('#downloadTerms').data('title')
				});

				this._dialog.show();
			}
			else {
				// Continue, we'll just call the next step for them.
				this.acceptTermsAndConditions( new Event('tAndCs'), this );
			}
		},

		acceptTermsAndConditions: function(e) {
			e.preventDefault();

			if( this._termsFromPurchase ) {
				window.open( $('[data-purchase-url]').attr('data-purchase-url') + "&confirm=1", '_blank', 'height=' + $('[data-purchase-url]').attr('data-height') + ',width=575,menubar=0,status=0,titlebar=0');
			}
			else {
				if( !_.isNull( this._dialog ) ) {
					this._dialog.hide();
					this._dialog.destruct();
				}

				var dialogRef = ips.ui.dialog.create({
					url: $('[data-role="install"],[data-role="update"]').attr('href') + "&confirm=1",
					remoteVerify: true,
					extraClass: 'elMarketplaceInstallerDialog',
					size: 'narrow',
					close: false,
					title: ips.getString( this._install ? 'marketplace_installing' : 'marketplace_updating' )
				});

				dialogRef.show();
				return;
			}
		},

		showError: function (e) {
			ips.ui.alert.show( {
				type: 'alert',
				icon: 'warn',
				message: this.scope.attr('data-error'),
			});
		},
		
		receivedMessage: function (e) {
			if ( e.data === 'OK' ) {
				$('button[data-action="signIn"]').attr('disabled', true ); // Disable so it doesn't get clicked again
				window.location = window.location;
			}
			else if ( e.data.error ) {
				switch ( e.data.error ) {
					case 'access_denied':
						// User cancelled the authentication flow, we don't need to do anything.
						break;
					case '_not_account_holder':
						ips.ui.alert.show( {
							type: 'alert',
							icon: 'warn',
							message: ips.getString('marketplace_authentication_bad_account'),
						});
						break;
					default:
						ips.ui.alert.show( {
							type: 'alert',
							icon: 'warn',
							message: ips.getString('marketplace_communication_error_js'),
							subText: e.data.error_description ? ( e.data.error_description + " (" + e.data.error + ")" ) : e.data.error
						});
				}
			}
		}
	});
}(jQuery, _));