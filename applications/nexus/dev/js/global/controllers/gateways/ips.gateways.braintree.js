/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.gateways.braintree.js - Braintree controller
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('nexus.global.gateways.braintree', {
		
		hostedFieldsInstance: null,
		threeDSecureInstance: null,
		
		/**
		 * Init
		 */
		initialize: function () {
			this.on( $(this.scope).closest('form')[0], 'submit', this.submitForm );
			
			var filesToGet = [
				'https://js.braintreegateway.com/web/3.40.0/js/client.min.js',
				'https://js.braintreegateway.com/web/3.40.0/js/data-collector.min.js'
			];

			if ( this.scope.attr('data-method') === 'paypal' ) {
				filesToGet.push('https://www.paypalobjects.com/api/checkout.js')
				filesToGet.push('https://js.braintreegateway.com/web/3.40.0/js/paypal-checkout.min.js');
			} else if ( this.scope.attr('data-method') === 'card' ) {
				filesToGet.push('https://js.braintreegateway.com/web/3.40.0/js/hosted-fields.min.js');
				if ( this.scope.attr('data-3dsecure') === 'true' ){
					filesToGet.push('https://js.braintreegateway.com/web/3.40.0/js/three-d-secure.min.js');
				}
			} else if ( this.scope.attr('data-method') === 'venmo' ) {
				filesToGet.push('https://js.braintreegateway.com/web/3.40.0/js/venmo.min.js');
			} else if ( this.scope.attr('data-method') === 'applepay' ) {
				filesToGet.push('https://js.braintreegateway.com/web/3.40.0/js/apple-pay.min.js');
			} else if ( this.scope.attr('data-method') === 'googlepay' ) {
				filesToGet.push('https://pay.google.com/gp/p/js/pay.js');
				filesToGet.push('https://js.braintreegateway.com/web/3.40.0/js/google-payment.min.js');
			}
			
			ips.loader.get(filesToGet).then( function () {
				this.setup();
			}.bind(this));
		},
		
		/**
		 * Init
		 */
		setup: function(){
			braintree.client.create({
				authorization: this.scope.attr('data-clientToken')
			}, this._initClientCallBack.bind(this) );
		},
		
		/**
		 * Callback after Braintree client has been initiated
		 *
		 * @param		{object} 	err						An error, if the Braintree Client instance could not be created
		 * @param		{object} 	clientInstance			The Client object (from the Braintree API) if it could
		 * @returns 	{void}
		 */
		_initClientCallBack: function(err, clientInstance) {
									
			/* If it failed, show an error */
			if ( err ) {
				console.error('Braintree Error', err); // Deliberately using console
				this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
				this.scope.find('[data-role="error"]').show();
				this.scope.find('[data-role="paymentMethodForm"]').hide();
				return;
			}
			
			/* If using advanced fraud OR PayPal OR Venmo we need device data */
			if ( this.scope.attr('data-method') === 'paypal' || this.scope.attr('data-method') === 'venmo' || this.scope.attr('data-advanced-fraud') === 'true' ) {
				var dataCollectorData = { client: clientInstance };
				if ( this.scope.attr('data-method') === 'paypal' || this.scope.attr('data-method') === 'venmo' ) {
					dataCollectorData.paypal = true; // Yes, even for Venmo
				} else if ( this.scope.attr('data-advanced-fraud') === 'true' ) {
					dataCollectorData.kount = true;
				}
				braintree.dataCollector.create( dataCollectorData, function (err, dataCollectorInstance) {
					if ( err ) {
						console.error('Braintree Device Data Error', err ); // Deliberately using console
					}
					if ( dataCollectorInstance && dataCollectorInstance.deviceData ) {
						this.scope.closest('form').append( $('<input type="hidden" />').attr( 'name', this.scope.attr('data-id') + '_card[device]' ).val( dataCollectorInstance.deviceData ) );
					}
				}.bind(this) );
			}
						
			/* PayPal */
			if ( this.scope.attr('data-method') === 'paypal' ) {	
				braintree.paypalCheckout.create({
					client: clientInstance
				}, this._initPayPalCheckoutCallback.bind(this) );
			}
			/* Credit cards */
			else if ( this.scope.attr('data-method') === 'card' ) {
				
				if ( this.scope.attr('data-3dsecure') === 'true' && this.scope.attr('data-amount') > 0 ) {
					braintree.threeDSecure.create({
						client: clientInstance
					}, function (threeDSecureErr, threeDSecureInstance) {
						if (threeDSecureErr) {
							console.error('Braintree Error', err); // Deliberately using console
							this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
							this.scope.find('[data-role="error"]').show();
							this.scope.find('[data-role="paymentMethodForm"]').hide();
							return;
						}
						this.threeDSecureInstance = threeDSecureInstance;
					}.bind(this) );
				}
				
				braintree.hostedFields.create({
					client: clientInstance,
					styles: {
						'input': {
							'font-size': '14px'
						}
					},
					fields: {
						number: {
							selector: '#elInput_' + this.scope.attr('data-id') + '-' + this.scope.attr('data-id') + '_card-number'
						},
						cvv: {
							selector: '#elInput_' + this.scope.attr('data-id') + '-' + this.scope.attr('data-id') + '_card-ccv'
						},
						expirationDate: {
							selector: '#elInput_' + this.scope.attr('data-id') + '-' + this.scope.attr('data-id') + '_card-exp',
							placeholder: 'MM/YYYY'
						}
						
					}
				}, this._initCardFormCallback.bind(this) );
			}
			/* Venmo */
			else if ( this.scope.attr('data-method') === 'venmo' ) {	
				var options = {
					client: clientInstance
				};
				if ( this.scope.attr('data-venmo-profile') ) {
					options.profileId = this.scope.attr('data-venmo-profile');
				}
				braintree.venmo.create(options, this._initVenmoCallback.bind(this) );
			}
			/* Apple Pay */
			else if ( this.scope.attr('data-method') === 'applepay' ) {
				if ( window.ApplePaySession && ApplePaySession.canMakePayments() ) {
					braintree.applePay.create({
						client: clientInstance
					}, this._initApplePayCallback.bind(this) );
				} else {					
					ips.utils.cookie.set( 'ApplePaySupported', 0 );
					
					var paymentMethodRadio = $( '#elRadio_payment_method_' + this.scope.attr('data-id') );
					if ( paymentMethodRadio.length ) {
						if ( paymentMethodRadio.is(':checked') ) {
							paymentMethodRadio.closest('li').next('li').find('input[type="radio"]').click();
						}
						paymentMethodRadio.closest('li').remove();
					} else {
						window.location = window.location;
					}
					
					return;
				}
			}
			/* Google Pay */
			else if ( this.scope.attr('data-method') === 'googlepay' ) {
				braintree.googlePayment.create({
					client: clientInstance,
					googlePayVersion: 2,
					googleMerchantId: this.scope.attr('data-googlepay-merchant')
				}, this._initGooglePayCallback.bind(this) );
			}
		},
		
		/**
		 * Callback after PayPal checkout has been initiated
		 *
		 * @param		{object} 	paypalCheckoutErr		An error, if the PayPal Checkout instance could not be created
		 * @param		{object} 	paypalCheckoutInstance	The PayPalCheckout object (from the Braintree API) if it could
		 * @returns 	{void}
		 */
		_initPayPalCheckoutCallback: function (paypalCheckoutErr, paypalCheckoutInstance) {
						
			/* If it failed, show an error */
			if ( paypalCheckoutErr ) {
				console.error('Braintree Error', paypalCheckoutErr); // Deliberately using console
				this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
				this.scope.find('[data-role="error"]').show();
				this.scope.find('[data-role="paymentMethodForm"]').hide();
				return;
			}
			
			/* Hide the loading indicator */
			this.scope.find('[data-role="newAccountContainer"]').removeClass('ipsLoading ipsLoading_small');
			
			/* Work out the locale */
			var paypalLocale = null;
			switch ( $('html').attr('lang') ) {
				case 'en-AL': case 'en-DZ': case 'en-AD': case 'en-AO': case 'en-AI': case 'en-AG': case 'en-AR': case 'en-AM': case 'en-AW': case 'en-AT': case 'en-AZ': case 'en-BS': case 'en-BH': case 'en-BB': case 'en-BY': case 'en-BE': case 'en-BZ': case 'en-BJ': case 'en-BM': case 'en-BT': case 'en-BO': case 'en-BA': case 'en-BW': case 'en-BR': case 'en-VG': case 'en-BN': case 'en-BG': case 'en-BF': case 'en-BI': case 'en-KH': case 'en-CM': case 'en-CA': case 'en-CV': case 'en-KY': case 'en-TD': case 'en-CL': case 'en-CN': case 'en-CO': case 'en-KM': case 'en-CG': case 'en-CD': case 'en-CK': case 'en-CR': case 'en-CI': case 'en-HR': case 'en-CY': case 'en-CZ': case 'en-DK': case 'en-DJ': case 'en-DM': case 'en-DO': case 'en-EC': case 'en-EG': case 'en-SV': case 'en-ER': case 'en-EE': case 'en-ET': case 'en-FK': case 'en-FO': case 'en-FJ': case 'en-FI': case 'en-FR': case 'en-GF': case 'en-PF': case 'en-GA': case 'en-GM': case 'en-GE': case 'en-DE': case 'en-GI': case 'en-GR': case 'en-GL': case 'en-GD': case 'en-GP': case 'en-GT': case 'en-GN': case 'en-GW': case 'en-GY': case 'en-HN': case 'en-HU': case 'en-IS': case 'en-ID': case 'en-IE': case 'en-IL': case 'en-IT': case 'en-JM': case 'en-JP': case 'en-JO': case 'en-KZ': case 'en-KE': case 'en-KI': case 'en-KW': case 'en-KG': case 'en-LA': case 'en-LV': case 'en-LS': case 'en-LI': case 'en-LT': case 'en-LU': case 'en-MK': case 'en-MG': case 'en-MW': case 'en-MY': case 'en-MV': case 'en-ML': case 'en-MT': case 'en-MH': case 'en-MQ': case 'en-MR': case 'en-MU': case 'en-YT': case 'en-MX': case 'en-FM': case 'en-MD': case 'en-MC': case 'en-MN': case 'en-ME': case 'en-MS': case 'en-MA': case 'en-MZ': case 'en-NA': case 'en-NR': case 'en-NP': case 'en-NL': case 'en-NC': case 'en-NZ': case 'en-NI': case 'en-NE': case 'en-NG': case 'en-NU': case 'en-NF': case 'en-NO': case 'en-OM': case 'en-PW': case 'en-PA': case 'en-PG': case 'en-PY': case 'en-PE': case 'en-PH': case 'en-PN': case 'en-PL': case 'en-PT': case 'en-QA': case 'en-RE': case 'en-RO': case 'en-RU': case 'en-RW': case 'en-WS': case 'en-SM': case 'en-ST': case 'en-SA': case 'en-SN': case 'en-RS': case 'en-SC': case 'en-SL': case 'en-SK': case 'en-SI': case 'en-SB': case 'en-SO': case 'en-ZA': case 'en-KR': case 'en-ES': case 'en-LK': case 'en-SH': case 'en-KN': case 'en-LC': case 'en-PM': case 'en-VC': case 'en-SR': case 'en-SJ': case 'en-SZ': case 'en-SE': case 'en-CH': case 'en-TW': case 'en-TJ': case 'en-TZ': case 'en-TG': case 'en-TO': case 'en-TT': case 'en-TN': case 'en-TM': case 'en-TC': case 'en-TV': case 'en-UG': case 'en-UA': case 'en-AE': case 'en-US': case 'en-UY': case 'en-VU': case 'en-VA': case 'en-VE': case 'en-VN': case 'en-WF': case 'en-YE': case 'en-ZM': case 'en-ZW': 
					var paypalLocale = 'en_US';
					break;
				case 'ar-DZ': case 'ar-BH': case 'ar-EG': case 'ar-JO': case 'ar-KW': case 'ar-MA': case 'ar-OM': case 'ar-QA': case 'ar-SA': case 'ar-TN': case 'ar-AE': case 'ar-YE': 
					var paypalLocale = 'ar_EG';
					break;
				case 'fr-DZ': case 'fr-AD': case 'fr-AO': case 'fr-AI': case 'fr-AG': case 'fr-AM': case 'fr-AW': case 'fr-AZ': case 'fr-BS': case 'fr-BH': case 'fr-BB': case 'fr-BZ': case 'fr-BJ': case 'fr-BM': case 'fr-BO': case 'fr-BW': case 'fr-VG': case 'fr-BF': case 'fr-BI': case 'fr-CM': case 'fr-CV': case 'fr-KY': case 'fr-TD': case 'fr-CL': case 'fr-CO': case 'fr-KM': case 'fr-CG': case 'fr-CD': case 'fr-CK': case 'fr-CR': case 'fr-CI': case 'fr-CZ': case 'fr-DJ': case 'fr-DM': case 'fr-DO': case 'fr-EC': case 'fr-EG': case 'fr-SV': case 'fr-ER': case 'fr-EE': case 'fr-ET': case 'fr-FK': case 'fr-FO': case 'fr-FJ': case 'fr-FI': case 'fr-GF': case 'fr-PF': case 'fr-GA': case 'fr-GM': case 'fr-GE': case 'fr-GI': case 'fr-GR': case 'fr-GL': case 'fr-GD': case 'fr-GP': case 'fr-GT': case 'fr-GN': case 'fr-GW': case 'fr-GY': case 'fr-HN': case 'fr-HU': case 'fr-IE': case 'fr-JM': case 'fr-JO': case 'fr-KZ': case 'fr-KE': case 'fr-KI': case 'fr-KW': case 'fr-KG': case 'fr-LV': case 'fr-LS': case 'fr-LI': case 'fr-LT': case 'fr-LU': case 'fr-MG': case 'fr-MW': case 'fr-ML': case 'fr-MH': case 'fr-MQ': case 'fr-MR': case 'fr-MU': case 'fr-YT': case 'fr-MC': case 'fr-MS': case 'fr-MA': case 'fr-MZ': case 'fr-NA': case 'fr-NR': case 'fr-NC': case 'fr-NZ': case 'fr-NI': case 'fr-NE': case 'fr-NU': case 'fr-NF': case 'fr-OM': case 'fr-PW': case 'fr-PA': case 'fr-PG': case 'fr-PE': case 'fr-PN': case 'fr-QA': case 'fr-RE': case 'fr-RO': case 'fr-RW': case 'fr-SM': case 'fr-ST': case 'fr-SA': case 'fr-SN': case 'fr-RS': case 'fr-SC': case 'fr-SL': case 'fr-SK': case 'fr-SI': case 'fr-SB': case 'fr-SO': case 'fr-ZA': case 'fr-SH': case 'fr-KN': case 'fr-LC': case 'fr-PM': case 'fr-VC': case 'fr-SR': case 'fr-SJ': case 'fr-SZ': case 'fr-TJ': case 'fr-TZ': case 'fr-TG': case 'fr-TT': case 'fr-TN': case 'fr-TM': case 'fr-TC': case 'fr-TV': case 'fr-UG': case 'fr-UA': case 'fr-AE': case 'fr-US': case 'fr-UY': case 'fr-VU': case 'fr-VA': case 'fr-VE': case 'fr-WF': case 'fr-YE': case 'fr-ZM': 
					var paypalLocale = 'fr_XC';
					break;
				case 'es-DZ': case 'es-AD': case 'es-AO': case 'es-AI': case 'es-AG': case 'es-AR': case 'es-AM': case 'es-AW': case 'es-AZ': case 'es-BS': case 'es-BH': case 'es-BB': case 'es-BZ': case 'es-BJ': case 'es-BM': case 'es-BO': case 'es-BW': case 'es-VG': case 'es-BF': case 'es-BI': case 'es-CV': case 'es-KY': case 'es-TD': case 'es-CL': case 'es-CO': case 'es-KM': case 'es-CG': case 'es-CD': case 'es-CK': case 'es-CR': case 'es-CZ': case 'es-DJ': case 'es-DM': case 'es-DO': case 'es-EC': case 'es-EG': case 'es-SV': case 'es-ER': case 'es-EE': case 'es-ET': case 'es-FK': case 'es-FO': case 'es-FJ': case 'es-FI': case 'es-GF': case 'es-PF': case 'es-GA': case 'es-GM': case 'es-GE': case 'es-GI': case 'es-GR': case 'es-GL': case 'es-GD': case 'es-GP': case 'es-GT': case 'es-GN': case 'es-GW': case 'es-GY': case 'es-HN': case 'es-HU': case 'es-IE': case 'es-JM': case 'es-JO': case 'es-KZ': case 'es-KE': case 'es-KI': case 'es-KW': case 'es-KG': case 'es-LV': case 'es-LS': case 'es-LI': case 'es-LT': case 'es-LU': case 'es-MG': case 'es-MW': case 'es-ML': case 'es-MH': case 'es-MQ': case 'es-MR': case 'es-MU': case 'es-YT': case 'es-MX': case 'es-MS': case 'es-MA': case 'es-MZ': case 'es-NA': case 'es-NR': case 'es-NC': case 'es-NZ': case 'es-NI': case 'es-NE': case 'es-NU': case 'es-NF': case 'es-OM': case 'es-PW': case 'es-PA': case 'es-PG': case 'es-PY': case 'es-PE': case 'es-PN': case 'es-QA': case 'es-RE': case 'es-RO': case 'es-RW': case 'es-SM': case 'es-ST': case 'es-SA': case 'es-SN': case 'es-RS': case 'es-SC': case 'es-SL': case 'es-SK': case 'es-SI': case 'es-SB': case 'es-SO': case 'es-ZA': case 'es-SH': case 'es-KN': case 'es-LC': case 'es-PM': case 'es-VC': case 'es-SR': case 'es-SJ': case 'es-SZ': case 'es-TJ': case 'es-TZ': case 'es-TG': case 'es-TT': case 'es-TN': case 'es-TM': case 'es-TC': case 'es-TV': case 'es-UG': case 'es-UA': case 'es-AE': case 'es-US': case 'es-UY': case 'es-VU': case 'es-VA': case 'es-VE': case 'es-WF': case 'es-YE': case 'es-ZM': 
					var paypalLocale = 'es_XC';
					break;
				case 'zh-DZ': case 'zh-AD': case 'zh-AO': case 'zh-AI': case 'zh-AG': case 'zh-AM': case 'zh-AW': case 'zh-AZ': case 'zh-BS': case 'zh-BH': case 'zh-BB': case 'zh-BZ': case 'zh-BJ': case 'zh-BM': case 'zh-BO': case 'zh-BW': case 'zh-VG': case 'zh-BF': case 'zh-BI': case 'zh-CV': case 'zh-KY': case 'zh-TD': case 'zh-CL': case 'zh-CN': case 'zh-CO': case 'zh-KM': case 'zh-CG': case 'zh-CD': case 'zh-CK': case 'zh-CR': case 'zh-CZ': case 'zh-DJ': case 'zh-DM': case 'zh-DO': case 'zh-EC': case 'zh-EG': case 'zh-SV': case 'zh-ER': case 'zh-EE': case 'zh-ET': case 'zh-FK': case 'zh-FO': case 'zh-FJ': case 'zh-FI': case 'zh-GF': case 'zh-PF': case 'zh-GA': case 'zh-GM': case 'zh-GE': case 'zh-GI': case 'zh-GR': case 'zh-GL': case 'zh-GD': case 'zh-GP': case 'zh-GT': case 'zh-GN': case 'zh-GW': case 'zh-GY': case 'zh-HN': case 'zh-HU': case 'zh-IE': case 'zh-JM': case 'zh-JO': case 'zh-KZ': case 'zh-KE': case 'zh-KI': case 'zh-KW': case 'zh-KG': case 'zh-LV': case 'zh-LS': case 'zh-LI': case 'zh-LT': case 'zh-LU': case 'zh-MG': case 'zh-MW': case 'zh-ML': case 'zh-MH': case 'zh-MQ': case 'zh-MR': case 'zh-MU': case 'zh-YT': case 'zh-MS': case 'zh-MA': case 'zh-MZ': case 'zh-NA': case 'zh-NR': case 'zh-NC': case 'zh-NZ': case 'zh-NI': case 'zh-NE': case 'zh-NU': case 'zh-NF': case 'zh-OM': case 'zh-PW': case 'zh-PA': case 'zh-PG': case 'zh-PE': case 'zh-PN': case 'zh-QA': case 'zh-RE': case 'zh-RO': case 'zh-RW': case 'zh-SM': case 'zh-ST': case 'zh-SA': case 'zh-SN': case 'zh-RS': case 'zh-SC': case 'zh-SL': case 'zh-SK': case 'zh-SI': case 'zh-SB': case 'zh-SO': case 'zh-ZA': case 'zh-SH': case 'zh-KN': case 'zh-LC': case 'zh-PM': case 'zh-VC': case 'zh-SR': case 'zh-SJ': case 'zh-SZ': case 'zh-TJ': case 'zh-TZ': case 'zh-TG': case 'zh-TT': case 'zh-TN': case 'zh-TM': case 'zh-TC': case 'zh-TV': case 'zh-UG': case 'zh-UA': case 'zh-AE': case 'zh-US': case 'zh-UY': case 'zh-VU': case 'zh-VA': case 'zh-VE': case 'zh-WF': case 'zh-YE': case 'zh-ZM': 
					var paypalLocale = 'zh_XC';
					break;
				case 'en-AU': 
					var paypalLocale = 'en_AU';
					break;
				case 'de-AT': case 'de-DE': case 'de-LU': case 'de-CH': 
					var paypalLocale = 'de_DE';
					break;
				case 'nl-BE': case 'nl-NL': 
					var paypalLocale = 'nl_NL';
					break;
				case 'fr-BE': case 'fr-FR': case 'fr-CH': 
					var paypalLocale = 'fr_FR';
					break;
				case 'pt-BR': 
					var paypalLocale = 'pt_BR';
					break;
				case 'fr-CA': 
					var paypalLocale = 'fr_CA';
					break;
				case 'zh-CN': 
					var paypalLocale = 'zh_CN';
					break;
				case 'cs-CZ': 
					var paypalLocale = 'cs_CZ';
					break;
				case 'da-DK': case 'da-FO': case 'da-GL': 
					var paypalLocale = 'da_DK';
					break;
				case 'ru-EE': case 'ru-LV': case 'ru-LT': case 'ru-RU': case 'ru-UA': 
					var paypalLocale = 'ru_RU';
					break;
				case 'fi-FI': 
					var paypalLocale = 'fi_FI';
					break;
				case 'el-GR': 
					var paypalLocale = 'el_GR';
					break;
				case 'en-HK': case 'en-IN': case 'en-SG': case 'en-TH': case 'en-GB': 
					var paypalLocale = 'en_GB';
					break;
				case 'zh-HK': 
					var paypalLocale = 'zh_HK';
					break;
				case 'hu-HU': 
					var paypalLocale = 'hu_HU';
					break;
				case 'id-ID': 
					var paypalLocale = 'id_ID';
					break;
				case 'he-IL': 
					var paypalLocale = 'he_IL';
					break;
				case 'it-IT': 
					var paypalLocale = 'it_IT';
					break;
				case 'ja-JP': 
					var paypalLocale = 'ja_JP';
					break;
				case 'no-NO': 
					var paypalLocale = 'no_NO';
					break;
				case 'pl-PL': 
					var paypalLocale = 'pl_PL';
					break;
				case 'pt-PT': 
					var paypalLocale = 'pt_PT';
					break;
				case 'sk-SK': 
					var paypalLocale = 'sk_SK';
					break;
				case 'ko-KR': 
					var paypalLocale = 'ko_KR';
					break;
				case 'es-ES': 
					var paypalLocale = 'es_ES';
					break;
				case 'sv-SE': 
					var paypalLocale = 'sv_SE';
					break;
				case 'zh-TW': 
					var paypalLocale = 'zh_TW';
					break;
				case 'th-TH': 
					var paypalLocale = 'th_TH';
					break;
			}
			
			/* Basic PayPal options */
			var dataForPayPal = {
				intent: 'authorize',
				amount: this.scope.attr('data-amount'),
				currency: this.scope.attr('data-currency'),
				locale: $('html').attr('lang').replace( '-', '_' ),
			};
			if ( this.scope.attr('data-shipping') ) {
				dataForPayPal.enableShippingAddress = true;
				dataForPayPal.shippingAddressOverride = $.parseJSON( this.scope.attr('data-shipping') );
				dataForPayPal.shippingAddressEditable = false;
			}
			var paypalButtonOptions = {
				/* Options */
				env: this.scope.attr('data-env'),
				/* Callback when user clicks to pay */
				payment: function () {
					dataForPayPal.flow = ( this.scope.attr('data-forceVault') === 'true' || this.scope.find('[data-role="braintreeVault"]').is(':checked') ) ? 'vault' : 'checkout';
					return paypalCheckoutInstance.createPayment( dataForPayPal );
				}.bind(this),
				/* Callback when user finishes paying */
				onAuthorize: function (data, actions) {
					return paypalCheckoutInstance.tokenizePayment(data).then(function(payload) {
						this._newAccountAuthorized( payload.details.email, payload.nonce );
					}.bind(this) );
				}.bind(this),
				/* Callback when user cancels */
				onCancel: function (data) {
					/* Don't need to do anything here */
				},
				/* Callback for errors */
				onError: function (err) {
					console.error('Braintree Error', err); // Deliberately using console
					this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
					this.scope.find('[data-role="error"]').show();
					this.scope.find('[data-role="paymentMethodForm"]').hide();
					return;
				}.bind(this)
			};
			if ( paypalLocale ) {
				paypalButtonOptions.locale = paypalLocale;
			}
			
			/* Make the PayPal button */
			paypal.Button.render( paypalButtonOptions, '#' + this.scope.find('[data-role="paypalButton"]').attr('id') );
			
			/* And the PayPal Credit button, if we want that */
			if( this.scope.find('[data-role="paypalCreditButton"]').length ) {
				var dataForPayPalCredit = _.clone(dataForPayPal);
				dataForPayPalCredit.offerCredit = true;
				
				var paypalCreditButtonOptions = _.clone(paypalButtonOptions);
				paypalCreditButtonOptions.style = {label: 'credit'};
				paypalCreditButtonOptions.payment = function () {
					dataForPayPalCredit.flow = ( this.scope.attr('data-forceVault') === 'true' || this.scope.find('[data-role="braintreeVault"]').is(':checked') ) ? 'vault' : 'checkout';
					return paypalCheckoutInstance.createPayment( dataForPayPalCredit );
				}.bind(this);
				
				paypal.Button.render( paypalCreditButtonOptions, '#' + this.scope.find('[data-role="paypalCreditButton"]').attr('id') );
			}
		},
		
		/**
		 * Add a new account to the account selection list (for PayPal or Venmo)
		 *
		 * @param		{string} 	label	The account username / email
		 * @param		{string} 	nonce	The nonce
		 * @returns 	{void}
		 */
		_newAccountAuthorized: function( label, nonce ) {
			if ( this.scope.attr('data-forceVault') === 'true' ) {
				this.scope.closest('form').append( $('<input type="hidden" />').attr( 'name', this.scope.attr('data-id') + '_card[token]' ).val( nonce ) );
				this.scope.closest('form').submit();
				return;
			}
			
			this.scope.find('[data-role="showWhenVaultAccountAdded"]').show();
			this.scope.find('[data-role="newVaultOption"] input').attr( 'data-toggles', this.scope.attr('data-fieldName') + '_new' );
			var random = Math.random().toString(36).substring(7);
			this.scope.find('[data-role="newVaultOption"]').before( ips.templates.render('nexus.gateway.vaultAccount', {
				fieldName: this.scope.attr('data-fieldName'),
				random: random,
				label: label,
				value: 'NONCE:' + ( this.scope.find('[data-role="braintreeVault"]').is(':checked') ? '1' : '0' ) + ':' + nonce
			}) );
			$( '#' + this.scope.attr('data-fieldName') + '_stored' + random ).prop('checked', true);
			$( document ).trigger( 'contentChange', [ this.scope ] );
		},
		
		/**
		 * Callback after Hosted Fields instance (for taking card payments) has been created
		 *
		 * @param		{object} 	hostedFieldsErr			An error, if the Hosted Fields instance could not be created
		 * @param		{object} 	hostedFieldsInstance	The HostedFields object (from the Braintree API) if it could
		 * @returns 	{void}
		 */
		_initCardFormCallback: function (hostedFieldsErr, hostedFieldsInstance) {
						
			/* If it failed, show an error */
			if ( hostedFieldsErr ) {
				console.error('Braintree Error', hostedFieldsErr); // Deliberately using console
				this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
				this.scope.find('[data-role="error"]').show();
				this.scope.find('[data-role="paymentMethodForm"]').hide();
				return;
			}
			
			/* Remove the loading filter */
			this.scope.find('.ipsLoading').removeClass('ipsLoading ipsFaded ipsFaded_more');
			
			/* Save the instance */
			this.hostedFieldsInstance = hostedFieldsInstance;
			
			/* Set up some events */
			hostedFieldsInstance.on('cardTypeChange', function (event) {
				if (event.cards.length === 1) {
					this.scope.find('.cPayment').css( 'opacity', 0.3 );
					switch ( event.cards[0].type ) {
						case 'visa':
							this.scope.find('.cPayment_visa').css( 'opacity', 1 );
							break;
						case 'master-card':
							this.scope.find('.cPayment_mastercard').css( 'opacity', 1 );
							break;
						case 'american-express':
							this.scope.find('.cPayment_american_express').css( 'opacity', 1 );
							break;
						case 'discover':
							this.scope.find('.cPayment_discover').css( 'opacity', 1 );
							break;
						case 'diners-club':
							this.scope.find('.cPayment_diners_club').css( 'opacity', 1 );
							break;
						case 'jcb':
							this.scope.find('.cPayment_jcb').css( 'opacity', 1 );
							break;
					}
				} else {
					this.scope.find('.cPayment').css( 'opacity', 1 );
				}
			}.bind(this) );
			hostedFieldsInstance.on('validityChange', function (event) {
				var i;
				for ( i in event.fields ) {
					switch ( i ) {
						case 'number':
							if ( !event.fields[i].isPotentiallyValid ) {
								this.scope.find('[data-role="dummyCard"]').addClass('ipsFieldRow_error');
								this.scope.find('[data-warning="number"]').text( ips.getString('cardNumberInvalid') );
							} else {
								this.scope.find('[data-role="dummyCard"]').removeClass('ipsFieldRow_error');
								this.scope.find('[data-warning="number"]').text('');
							}
							break;
						case 'expirationDate':
							if ( !event.fields[i].isPotentiallyValid ) {
								this.scope.find('[data-role="dummyExp"]').addClass('ipsFieldRow_error');
								this.scope.find('[data-warning="exp"]').text( ips.getString('expiryDateInvalid') );
							} else {
								this.scope.find('[data-role="dummyExp"]').removeClass('ipsFieldRow_error');
								this.scope.find('[data-warning="exp"]').text('');
							}
							break;
						case 'cvv':
							if ( !event.fields[i].isPotentiallyValid ) {
								this.scope.find('[data-role="dummyCcv"]').addClass('ipsFieldRow_error');
								this.scope.find('[data-warning="ccv"]').text( ips.getString('securityCodeInvalid') );
							} else {
								this.scope.find('[data-role="dummyCcv"]').removeClass('ipsFieldRow_error');
								this.scope.find('[data-warning="ccv"]').text('');
							}
							break;
					}
				}
			}.bind(this) );
		},
		
		/**
		 * Callback after Venmo has been initiated
		 *
		 * @param		{object} 	venmoErr				An error, if the Venmo instance could not be created
		 * @param		{object} 	venmoInstance			The Vemmo object (from the Braintree API) if it could
		 * @returns 	{void}
		 */
		_initVenmoCallback: function (venmoErr, venmoInstance) {
						
			/* If it failed, show an error */
			if ( venmoErr ) {
				console.error('Braintree Error', venmoErr); // Deliberately using console
				this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
				this.scope.find('[data-role="error"]').show();
				this.scope.find('[data-role="paymentMethodForm"]').hide();
				return;
			}
			
			/* Hide the loading indicator */
			this.scope.find('[data-role="newAccountContainer"]').removeClass('ipsLoading ipsLoading_small');
			
			/* Check browser support */
			var browserSupported = venmoInstance.isBrowserSupported();
			if ( !browserSupported ) {
				ips.utils.cookie.set( 'VenmoSupported', 0 );
				
				if ( this.scope.find('[data-role="vaultAccountList"]').length ) {
					this.scope.find('[data-role="newVaultOption"]').hide();
				} else {					
					var paymentMethodRadio = $( '#elRadio_payment_method_' + this.scope.attr('data-id') );
					if ( paymentMethodRadio.length ) {
						if ( paymentMethodRadio.is(':checked') ) {
							paymentMethodRadio.closest('li').next('li').find('input[type="radio"]').click();
						}
						paymentMethodRadio.closest('li').remove();
					} else {
						window.location = window.location;
					}
				}
				
				return;
			}
			
			/* Check if the user has already been redirected back by Venmo */
			if ( venmoInstance.hasTokenizationResult() ) {
				venmoInstance.tokenize( this._venmoTokenizeCallback.bind(this) );
			}
			
			/* Show the button and set the click listener */
			this.scope.find('[data-role="venmoButton"]').removeClass('ipsHide').on('click', function() {
				this.scope.find('[data-role="venmoButton"]').addClass('ipsButton_disabled');
				venmoInstance.tokenize( this._venmoTokenizeCallback.bind(this) );
			}.bind(this) );
			
		},
		
		/**
		 * Callback after Venmo has been tokenized
		 *
		 * @param		{object} 	tokenizeErr				An error, if token could not be generated
		 * @param		{object} 	payload					The payload with the nonce if it could
		 * @returns 	{void}
		 */
		_venmoTokenizeCallback: function (tokenizeErr, payload) {
			if (tokenizeErr) {
				this.scope.find('[data-role="venmoButton"]').removeClass('ipsButton_disabled');
				console.error(tokenizeErr); // Deliberately using console
				if ( tokenizeErr.code !== 'VENMO_CANCELED' && tokenizeErr.code !== 'VENMO_APP_CANCELED' ) { // This just means the user didn't have Venmo installed
					ips.ui.alert.show({
						type: 'alert',
						icon: 'warn',
						message: ips.getString('payment_error')
					});
				}
			} else {
				this._newAccountAuthorized( payload.details.username, payload.nonce );
			}
			return;
		},
		
		/**
		 * Callback after Apple Pay has been initiated
		 *
		 * @param		{object} 	applePayErr				An error, if the Apple Pay instance could not be created
		 * @param		{object} 	applePayInstance		The ApplePay object (from the Braintree API) if it could
		 * @returns 	{void}
		 */
		_initApplePayCallback: function (applePayErr, applePayInstance) {
						
			/* If it failed, show an error */
			if ( applePayErr ) {
				console.error('Braintree Error', applePayErr); // Deliberately using console
				this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
				this.scope.find('[data-role="error"]').show();
				this.scope.find('[data-role="paymentMethodForm"]').hide();
				return;
			}
			
			/* Otherwise go ahead and see if there is an active card */
			ApplePaySession.canMakePaymentsWithActiveCard( applePayInstance.merchantIdentifier ).then(function( canMakePaymentsWithActiveCard ){
				
				/* If Apple Pay IS supported... */
				if ( canMakePaymentsWithActiveCard ) {
					
					/* Hide the loading indicator */
					this.scope.find('[data-role="newAccountContainer"]').removeClass('ipsLoading ipsLoading_small');
		
					/* Show the button and set the click listener */
					this.scope.find('[data-role="applePayButton"]').removeClass('ipsHide').on('click', function() {
						var paymentRequest = applePayInstance.createPaymentRequest({
							total: {
								label: $('meta[property="og:site_name"]').attr('content'),
								amount: this.scope.attr('data-amount')
							}
						});
						var session = new ApplePaySession( 2, paymentRequest );
						session.onvalidatemerchant = function (event) {
							applePayInstance.performValidation({
								validationURL: event.validationURL,
								displayName: $('meta[property="og:site_name"]').attr('content')
							}, function (err, merchantSession) {
								if (err) {
									console.error('Braintree Error', err); // Deliberately using console
									ips.ui.alert.show({
										type: 'alert',
										icon: 'warn',
										message: ips.getString('payment_error')
									});
									return;
								}
								session.completeMerchantValidation(merchantSession);
							});
						}.bind(this);
						session.onpaymentauthorized = function (event) {
							applePayInstance.tokenize({
								token: event.payment.token
							}, function (tokenizeErr, payload) {
								if (tokenizeErr) {
									console.error('Error tokenizing Apple Pay:', tokenizeErr);
									session.completePayment(ApplePaySession.STATUS_FAILURE);
									return;
								}
								session.completePayment(ApplePaySession.STATUS_SUCCESS);
							
								this.scope.closest('form').append( $('<input type="hidden" />').attr( 'name', this.scope.attr('data-id') + '_card[token]' ).val( payload.nonce ) );
								this.scope.closest('form').submit();
							}.bind(this));
  						}.bind(this);
						session.begin();
					}.bind(this));
					
				}
				
				/* If it isn't, just hide it as an option */
				else {
					ips.utils.cookie.set( 'ApplePaySupported', 0 );
					
					var paymentMethodRadio = $( '#elRadio_payment_method_' + this.scope.attr('data-id') );
					if ( paymentMethodRadio.length ) {
						if ( paymentMethodRadio.is(':checked') ) {
							paymentMethodRadio.closest('li').next('li').find('input[type="radio"]').click();
						}
						paymentMethodRadio.closest('li').remove();
					} else {
						window.location = window.location;
					}
				}
				
			}.bind(this));
		},
		
		/**
		 * Callback after Google Pay has been initiated
		 *
		 * @param		{object} 	googlePaymentErr		An error, if the Google Pay instance could not be created
		 * @param		{object} 	googlePaymentInstance	The GooglePay object (from the Braintree API) if it could
		 * @returns 	{void}
		 */
		_initGooglePayCallback: function (googlePaymentErr, googlePaymentInstance) {
			
			/* If it failed, show an error */
			if ( googlePaymentErr ) {
				console.error('Braintree Error', googlePaymentErr); // Deliberately using console
				this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
				this.scope.find('[data-role="error"]').show();
				this.scope.find('[data-role="paymentMethodForm"]').hide();
				return;
			}
			
			/* Check we can pay */
			var paymentsClient = new google.payments.api.PaymentsClient({
				environment: this.scope.attr('data-env') === 'sandbox' ? 'TEST' : 'PRODUCTION'
			});
			paymentsClient.isReadyToPay({
				apiVersion: 2,
				apiVersionMinor: 0,
				allowedPaymentMethods: googlePaymentInstance.createPaymentDataRequest().allowedPaymentMethods
			}).then(function(response) {
				if (response.result) {
					var button = paymentsClient.createButton({
						onClick: function(e) {
							e.preventDefault();
							var paymentDataRequest = googlePaymentInstance.createPaymentDataRequest({
								transactionInfo: {
									currencyCode: this.scope.attr('data-currency'),
									totalPriceStatus: 'FINAL',
									totalPrice: this.scope.attr('data-amount'),
								}
							});
							paymentsClient.loadPaymentData(paymentDataRequest).then(function(paymentData) {
								googlePaymentInstance.parseResponse(paymentData, function (err, result) {
									if (err) {
										console.error('Braintree Error', err); // Deliberately using console
										ips.ui.alert.show({
											type: 'alert',
											icon: 'warn',
											message: ips.getString('payment_error')
										});
										return;
									}
																		
									this.scope.closest('form').append( $('<input type="hidden" />').attr( 'name', this.scope.attr('data-id') + '_card[token]' ).val( result.nonce ) );
									this.scope.closest('form').submit();
								}.bind(this));
							}.bind(this)).catch(function (err) {
								console.error('Braintree Error', err); // Deliberately using console
								ips.ui.alert.show({
									type: 'alert',
									icon: 'warn',
									message: ips.getString('payment_error')
								});
							}.bind(this));
							
						}.bind(this)
					});
					this.scope.find('[data-role="newAccountContainer"]').removeClass('ipsLoading ipsLoading_small').append( button );
				} else {
					console.error('Braintree Error', err); // Deliberately using console
					this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
					this.scope.find('[data-role="error"]').show();
					this.scope.find('[data-role="paymentMethodForm"]').hide();
					return;
				}
			}.bind(this)).catch(function (err) {
				console.error('Braintree Error', err); // Deliberately using console
				this.scope.find('[data-role="errorMessage"]').text( ips.getString('payment_error') );
				this.scope.find('[data-role="error"]').show();
				this.scope.find('[data-role="paymentMethodForm"]').hide();
				return;
		    }.bind(this));
		},
				
		/**
		 * Submit form action
		 *
		 * @param		{event} 	e 		Event object
		 * @returns 	{void}
		 */
		submitForm: function(e) {
			if ( !$(e.currentTarget).find( 'input[type="radio"][name="payment_method"]' ).length || $(e.currentTarget).find( 'input[name="payment_method"][value="' + this.scope.attr('data-id') + '"]' ).is(':checked') ) {

				/* Cards */
				if ( this.scope.attr('data-method') === 'card' ) {

					/* Already submitted */
					if ( $(e.currentTarget).find('input[name="'+this.scope.attr('data-id')+'_card[token]"]').length ) {
						return;
					}
					
					/* Prepare the loading icon */
					var loading = this.scope.closest('[data-ipswizard]').find('[data-role="loading"]');
					var wizardContainer = this.scope.closest('[data-ipswizard]').find('[data-role="wizardContent"]');
					if( !loading.length ){
						loading = $('<div/>').attr('data-role', 'loading').addClass('ipsLoading').hide();
						this.scope.closest('[data-ipswizard]').append( loading );
					}
					var dims = {
						width: wizardContainer.outerWidth(),
						height: wizardContainer.outerHeight()
					};
					loading.css({
						width: dims.width + 'px',
						height: dims.height + 'px',
					});
									
					/* If we're using a stored card... */
					if ( $(this.scope).find('input[name="'+this.scope.attr('data-id')+'_card[stored]"]:checked').val() > 0 ) {
						
						/* ... and we require 3DSecure, do that */
						if ( this.threeDSecureInstance ) {
							
							e.preventDefault();
							e.stopPropagation();
							loading.show();
							wizardContainer.hide().after( loading.show() );
							
							$(this.scope).find('#el'+this.scope.attr('data-id')+'_cardSave').prop('checked', false); // Prevents it from trying to be saved twice
							
 							ips.getAjax()( $(e.currentTarget).attr('action'), {
	 							method: 'post',
	 							data: {
		 							convertTokenToNonce: $(this.scope).find('input[name="'+this.scope.attr('data-id')+'_card[stored]"]:checked').val()
	 							}
 							} ).done(function(response){
	 							this._verify3DSecure( response.nonce, loading, wizardContainer );
 							}.bind(this));
 							
 							return;
						}
						/* ... and we don't require 3DSecure, just allow the form to submit */
						else {
							return;
						}
						
					}
													
					/* Stop the form from actually submitting */
					e.preventDefault();
					e.stopPropagation();
					
					/* Check the form is valid */
					var state = this.hostedFieldsInstance.getState();
					var formValid = Object.keys(state.fields).every(function (key) {
						return state.fields[key].isValid;
					});
					if ( !formValid ) {
						ips.ui.alert.show({
							type: 'alert',
							icon: 'warn',
							message: ips.getString('cardDetailsInvalid')
						});
						return;
					}
					
					/* Hide any previous errors */
					this.scope.find('[data-warning]').text('');
														
					/* Show the loading icon */
					loading.show();
					wizardContainer.hide().after( loading.show() );
					
					/* Send to Braintree */
					this.hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
						if (tokenizeErr) {
							console.error(tokenizeErr); // Deliberately using console
							ips.ui.alert.show({
								type: 'alert',
								icon: 'warn',
								message: ips.getString('payment_error')
							});
							loading.remove();
							wizardContainer.show();
							return;
						}
						
						if ( this.threeDSecureInstance ) {
							this._verify3DSecure( payload.nonce, loading, wizardContainer );
							return;
						} else {
							this.scope.closest('form').append( $('<input type="hidden" />').attr( 'name', this.scope.attr('data-id') + '_card[token]' ).val( payload.nonce ) );
							this.scope.closest('form').submit();
						}
						
					}.bind(this));
				}
			}
		},
		
		/**
		 * Verify 3DSecure and then submit the form
		 *
		 * @param		{string} 	nonce			The payment method nonce
		 * @param		{object}	loading			The loading element
		 * @param		{object}	wizardContainer	The wizard container element
		 * @returns 	{void}
		 */
		_verify3DSecure: function( nonce, loading, wizardContainer ){
			this.threeDSecureInstance.verifyCard({
				amount: this.scope.attr('data-amount'),
				nonce: nonce,
				customer: {
					email: this.scope.attr('data-email'), 
					billingAddress: $.parseJSON( this.scope.attr('data-billingAddress') )
				},
				addFrame: function (err, iframe) {
					loading.removeClass('ipsLoading').css({'text-align':'center'}).html(iframe);
				}.bind(this),
				removeFrame: function () {
					loading.html('').addClass('ipsLoading');
				}.bind(this)
			}, function (err, response) {
				if ( err ) {
					console.error('Braintree Error', err); // Deliberately using console
					ips.ui.alert.show({
						type: 'alert',
						icon: 'warn',
						message: ips.getString('payment_error')
					});
					loading.remove();
					wizardContainer.show();
					return;
				}
				
				if ( response.liabilityShifted || !response.liabilityShiftPossible ) {
					this.scope.closest('form').append( $('<input type="hidden" />').attr( 'name', this.scope.attr('data-id') + '_card[token]' ).val( response.nonce ) );
					this.scope.closest('form').submit();
				} else {
					ips.ui.alert.show({
						type: 'alert',
						icon: 'warn',
						message: ips.getString('payment_error')
					});
					loading.remove();
					wizardContainer.show();
					
				}
			}.bind(this) );
		},
		
		
	});
}(jQuery, _));