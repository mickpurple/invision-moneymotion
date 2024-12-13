CKEDITOR.plugins.add( 'ipsgiphy', {
    requires: 'widget',
    icons: 'ipsgiphy',
    hidpi: true,
    init: function( editor ) {

        editor.widgets.add( 'ipsgiphy', {
            template: "<div class='ipsgiphy'></div>",

        } );
        /* The command when the button is pressed */
        editor.addCommand( 'ipsgiphy', {
            exec: function( editor ) {
                var current = '';
                var url = '?app=core&module=system&controller=editor&do=giphy&editorId=' + editor.name;
                var data = null;


                var button = $( '.' + editor.id ).find( '.cke_button__ipsgiphy' );

                if( !$( '#' + button.attr('id') + '_menu' ).length ){

                    $('body').append( ips.templates.render( 'core.editor.giphy', {
                        id: button.attr('id'),
                        editor: editor.name,
                        attribution_image: ips.getSetting('baseURL') + '/applications/core/interface/giphy/logo.png'
                    }) );

                    $( document ).trigger('contentChange', [ $('#' + button.attr('id') + '_menu') ] );

                    button.ipsMenu({
                        alignCenter: true,
                        closeOnClick: false
                    });
                }
            }
        });

        /* Add the button */
        editor.ui.addButton( 'ipsgiphy', {
            label: ips.getString( 'giphy' ),
            command: 'ipsgiphy',
            toolbar: 'insert'
        });
    }
});