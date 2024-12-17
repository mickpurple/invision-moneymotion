CKEDITOR.plugins.add( 'ipsstockreplies', {
	requires: 'widget',
	icons: 'ipsstockreplies',
	hidpi: true,
	init: function( editor ) {

		editor.widgets.add( 'ipsstockreplies', {
			template: "<div class='ipsstockreplies'></div>",

		} );
		/* The command when the button is pressed */
		editor.addCommand( 'ipsstockreplies', {
			exec: function( editor ) {
				var current = '';
				var url = '?app=core&module=system&controller=editor&do=templates&editorId=' + editor.name;
				var data = null;

				var button = $( '.' + editor.id ).find( '.cke_button__ipsstockreplies' );

				if( !$( '#' + button.attr('id') + '_menu' ).length ){

					$('body').append( ips.templates.render( 'core.editor.stockReplies', {
						id: button.attr('id'),
						editor: editor.name,
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
		editor.ui.addButton( 'ipsstockreplies', {
			label: ips.getString( 'editorStoredReplies' ),
			command: 'ipsstockreplies',
			toolbar: 'insert'
		});
	}
});