;( function($, _, undefined){
    "use strict";

    ips.controller.register('gallery.front.global.nsfw', {

        initialize () {
            this.on( 'click', '.ipsImageBlock__nsfw button', this.removeOverlays );
        },

        removeOverlays( e ) {
            e.preventDefault();

            var expires = new Date();
            expires.setDate( expires.getDate() + 365 );
            ips.utils.cookie.set( 'nsfwImageOptIn', true, expires.toUTCString() );

            $('.ipsImageBlock__nsfw').fadeOut(500, function() { this.remove() });
        },

    });

}(jQuery, _));