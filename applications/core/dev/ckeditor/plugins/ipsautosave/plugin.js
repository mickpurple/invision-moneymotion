CKEDITOR.plugins.add( 'ipsautosave', {
    init: function( editor ) {
		if ( editor.config.ipsAutoSaveKey && ips.utils.db.enabled ) {
			
			var autoSaveInterval;

			editor.on('instanceReady', function(){

				setTimeout( function () {
					/* Restore content on initial load */
					var autoSaveValue = ips.utils.db.get( 'editorSave', editor.config.ipsAutoSaveKey );
					var time = parseInt( new Date().getTime().toString().substring( 0, 10 ) );
					var defaultValue = editor.config.ipsDefaultIfNoAutoSave ? editor.getData() : '';

					/* Maintain backwards compatibility with data created before auto save expiration was introduced */
					if( !_.isArray( autoSaveValue ) ){
						autoSaveValue = [ autoSaveValue, time ];
					}

					/* Set the expiry date to 2 days from now */
					var expiry = parseInt( autoSaveValue[1] ) + parseInt( time ) + ( 2 * 86400 );

					var autoSaveInUse = false;
					var autoSaveRestoreMessage = $('.' + editor.id).closest('[data-ipsEditor]').find('[data-role="autoSaveRestoreMessage"]');
					if( ( !editor.getData() || editor.config.ipsDefaultIfNoAutoSave ) && autoSaveValue[0] && time < expiry ) {
						// Set the content, and swap any lazy-loaded elements
						editor.setData(autoSaveValue[0], function () {
							ips.utils.lazyLoad.loadContent(editor.container.$);
						});
						autoSaveInUse = true;

						/* Show notification */
						autoSaveRestoreMessage.slideDown({
							queue: false
						});
					}

					if( $( autoSaveRestoreMessage ).is( ':visible' ) || autoSaveInUse ){

						/* Function to handle cancels */
						var hideAutoSaveRestoreMessage = function(){
							autoSaveRestoreMessage.slideUp();
							autoSaveRestoreMessage.find('[data-action="keepRestoredContents"]').off( 'click.ipsAutoSave' );
							autoSaveRestoreMessage.find('[data-action="clearEditorContents"]').off( 'click.ipsAutoSave' );
						};

						/* Event for "Keep editor contents" button */
						autoSaveRestoreMessage.find('[data-action="keepRestoredContents"]').on( 'click.ipsAutoSave', function(){
							/* Select editor again */
							editor.focus();

							/* And hide the message */
							hideAutoSaveRestoreMessage();
						});

						/* Event for "Clear editor contents" button */
						autoSaveRestoreMessage.find('[data-action="clearEditorContents"]').on( 'click.ipsAutoSave', function(){

							editor.setData( '' );

							/* Select editor again */
							editor.focus();

							/* Clear local db so the same autosaved content you "cleared" doesn't show back up if you refresh the page */
							ips.utils.db.remove( 'editorSave', editor.config.ipsAutoSaveKey );

							/* And hide the message */
							hideAutoSaveRestoreMessage();
						});

						/* Event for whenever anything happens to the editor */
						editor.once( 'key', function() {
							hideAutoSaveRestoreMessage();
						});
						editor.once( 'setData', function() {
							hideAutoSaveRestoreMessage();
						});
					}

					/* Save content every 2 seconds */
					autoSaveInterval = setInterval( function(){
						if ( editor.getData() != defaultValue ){
							ips.utils.db.set( 'editorSave', editor.config.ipsAutoSaveKey, [ editor.getData(), time ], true );
						}
						else if( !editor.getData() && ips.utils.db.get( 'editorSave', editor.config.ipsAutoSaveKey ) ) {
							ips.utils.db.remove( 'editorSave', editor.config.ipsAutoSaveKey );
						}
					}, 2000 );

					/* Clear content on submission */
					$( '.' + editor.id ).closest('form').on('submit', function (e) {
						window.clearInterval( autoSaveInterval );
					});
				}, 100 );
			});

			editor.on( 'destroy', function() {
				if( autoSaveInterval ){
					window.clearInterval( autoSaveInterval );	
				}				
			});
		}
	}
});