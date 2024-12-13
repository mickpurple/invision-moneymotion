/**
 * IPS Social Suite 4
 * (c) 2017 Invision Power Services - http://www.invisionpower.com
 *
 * ips.core.login.js - Login form controller
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.global.core.login', {

		initialize: function () {
			this.on( 'click', 'button[type="submit"]', this.buttonClick );
		},

		buttonClick: function (e, data) {
			ips.utils.cookie.set('noCache', 1 );
			
			if ( $(e.currentTarget).attr('name') ) {
				$(e.currentTarget).closest('form').append(
                    $("<input type='hidden'>").attr({ 
                        name: $(e.currentTarget).attr('name'), 
                        value: $(e.currentTarget).attr('value')
					})
                );
			}
		}
	});
}(jQuery, _));