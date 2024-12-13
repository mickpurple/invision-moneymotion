/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.system.register.js - Registration controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.system.register', {

		usernameField: null,
		timers: { 'username': null, 'email': null },
		ajax: { 'username': ips.getAjax(), 'email': ips.getAjax() },
		popup: null,
		passwordBlurred: true,
		dirty: false,
		initialize: function () {
			this.on( 'keyup', '#elInput_username', this.changeUsername );
			this.on( 'keyup', '#elInput_email_address', this.changeEmail );
			this.on( 'blur', '#elInput_username', this.changeUsername );
			this.on( 'blur', '#elInput_email_address', this.changeEmail );
			this.on( 'keyup', '#elInput_password_confirm', this.confirmPassword );
			this.on( 'blur', '#elInput_password_confirm', this.confirmPassword );
			this.on( 'click', 'a[data-ipsPbrCancel]', this.cancelPbr );
			this.setup();
		},

		/**
		 * Setup method
		 * Loads the template file for registration, and adds an empty element after the username field
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		setup: function () {
			this.usernameField = this.scope.find('#elInput_username');
			this.emailField = this.scope.find('#elInput_email_address');
			this.passwordField = this.scope.find('#elInput_password');
			this.confirmPasswordField = this.scope.find('#elInput_password_confirm');

			// Build extra element after username
			this.usernameField.after( $('<span/>').attr( 'data-role', 'validationCheck' ) );
			this.emailField.after( $('<span/>').attr( 'data-role', 'validationCheck' ) );
			this.confirmPasswordField.after( $('<span/>').attr( 'data-role', 'validationCheck' ) );

			this.convertExistingErrors();
		},

		/**
		 * Looks for any validation errors present when the page was loaded (i.e. errors added by the backend)
		 * and converts them into the dynamic errors we use here.
		 *
		 * @returns 	{void}
		 */
		convertExistingErrors: function () {
			var fields = this.scope.find('#elInput_username, #elInput_email_address, #elInput_password, #elInput_password_confirm');
			var self = this;

			fields.each( function () {
				var elem = $(this);
				var wrapper = elem.closest('.ipsFieldRow');

				// Bail if no errors found
				if( !wrapper.hasClass('ipsFieldRow_error') ){
					return;
				}

				var message = wrapper.find('.ipsType_warning').html();
				self._clearResult( elem );

				wrapper.find('[data-role="validationCheck"]').show().html( ips.templates.render( 'core.forms.validateFailText', { message: message } ) );
				elem.removeClass('ipsField_success').addClass('ipsField_error');
			});
		},

		/**
		 * Cancel the post before register submission
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		cancelPbr: function (e) {
			var url = $(e.target).closest('[data-ipsPbrCancel]').attr('href');
			
			e.preventDefault();
			e.stopPropagation();
			
			/* Show confirmation Prompt */
			ips.ui.alert.show({
				type: 'confirm',
				message: ips.getString('pbr_confirm_title'),
				subText: ips.getString('pbr_confirm_text'),
				icon: 'warn',
				buttons: {
					ok: ips.getString('pbr_confirm_ok'),
					cancel: ips.getString('pbr_confirm_cancel')
				},
				callbacks: {
					ok: function(){
						window.location = url;
					},
					cancel: function(){
						return false;
					}
				}
			});
		},
		
		/**
		 * Event handler for a change on the username field
		 * Waits 700ms, then calls this._doCheck
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		changeUsername: function (e) {
			if( this.timers['username'] ){
				clearTimeout( this.timers['username'] );
			}

			if( this.usernameField.val().length > 4 || e.type != "keyup" ){
				this.timers['username'] = setTimeout( _.bind( this._doCheck, this, 'username', this.usernameField ), 700 );
			} else {
				this._clearResult( this.usernameField );
			}
		},

		/**
		 * Event handler for a change on the email field
		 * Waits 700ms, then calls this._doCheck
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		changeEmail: function (e) {
			if( this.timers['email'] ){
				clearTimeout( this.timers['email'] );
			}
			
			if( ( this.emailField.val().length > 5 && ips.utils.validate.isEmail(this.emailField.val()) ) || e.type != "keyup" ){
				this.timers['email'] = setTimeout( _.bind( this._doCheck, this, 'email', this.emailField ), 700 );
			} else {
				this._clearResult( this.emailField );
			}
		},

		/**
		 * Event handler for a change on the password field
		 * Waits 700ms, then calls this._doCheck
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		changePassword: function (e) {
			if( this.timers['password'] ){
				clearTimeout( this.timers['password'] );
			}

			if( this.passwordField.val().length > 2 || e.type != "keyup" ){
				this.timers['password'] = setTimeout( _.bind( this._doPasswordCheck, this, this.passwordField ), 200 );
			} else {
				this._clearResult( this.passwordField );
			}

			this.confirmPassword();
		},

		/**
		 * Event handler for a change on the confirm password field
		 *
		 * @param 		{event} 	e 	Event object
		 * @returns 	{void}
		 */
		confirmPassword: function (e) {
			var resultElem = this.confirmPasswordField.next('[data-role="validationCheck"]');

			if( this.passwordField.val() && this.passwordField.val() === this.confirmPasswordField.val() ){
				resultElem.hide().html('');
				this.confirmPasswordField.removeClass('ipsField_error').addClass('ipsField_success');
			} else {
				this._clearResult( this.confirmPasswordField );
			}
		},

		/**
		 * Clears a previous validation result
		 *
		 * @returns 	{void}
		 */
		_clearResult: function (field) {
			field
				.removeClass('ipsField_error')
				.removeClass('ipsField_success')
				.next('[data-role="validationCheck"]')
					.html('');

			field
				.closest('.ipsFieldRow')
					.removeClass('ipsFieldRow_error')
					.find('.ipsType_warning, .ipsFieldRow_content br:last')
						.remove();
		},

		/**
		 * Fires an ajax request to check whether the username is already in use
		 * Updates the result element depending on the result
		 *
		 * @returns 	{void}
		 */
		_doCheck: function (type, field) {
			var value = field.val();
			var resultElem = field.next('[data-role="validationCheck"]');
			var self = this;

			if( this.ajax[ type ] && this.ajax[ type ].abort ){
				this.ajax[ type ].abort();
			}

			// Set loading
			field.addClass('ipsField_loading');

			// Do ajax
			this.ajax[ type ]( ips.getSetting('baseURL') + '?app=core&module=system&controller=ajax&do=' + type + 'Exists', {
				dataType: 'json',
				data: {
					input: encodeURIComponent( value )
				}
			})
				.done( function (response) {
					if( response.result == 'ok' ){
						resultElem.hide().html('');
						field.removeClass('ipsField_error').addClass('ipsField_success');
					} else {
						resultElem.show().html( ips.templates.render( 'core.forms.validateFailText', { message: response.message } ) );
						field.removeClass('ipsField_success').addClass('ipsField_error');
					}
				})
				.fail( function () {} )
				.always( function () {
					field.removeClass('ipsField_loading');
				});
		}
	});
}(jQuery, _));