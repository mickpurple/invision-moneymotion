/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.dashboard.main.js - Admin dashboard controller
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.core.newFeatures', {

		_modal: null,
		_container: null,
		_cards: null,
		_dots: null,
		_next: null,
		_prev: null,
		_data: [],
		_active: null,
		_popupActive: false,

		initialize: function () {
			this.on(document, 'click', '[data-action="nextFeature"]', this.next);
			this.on(document, 'click', '[data-action="prevFeature"]', this.prev);
			this.on(document, 'click', '[data-role="dotFeature"]', this.dot);
			this.on(document, 'click', '[data-action="closeNewFeature"]', this.close);
			this.on(document, 'keydown', this.keydown);
			this.setup();
		},

		/**
		 * Setup method
		 *
		 * @returns {void}
		 */
		setup: function () {
			if( !this.scope.attr('data-newFeatures') ){
				// No new features; controller shouldn't be called in that situation, but just in case.
				return;
			}

			try {
				var data = $.parseJSON( this.scope.attr('data-newFeatures') );
				this._data = data.slice(0,9); // Take 10 items
			} catch (err) {
				Debug.error( err );
			}

			this._buildPopup();
			this._showPopup();
		},

		/**
		 * Keydown handler
		 *
		 * @returns {void}
		 */
		keydown: function (e) {
			if( !this._popupActive ){
				return;
			}

			switch( event.which ){
				case 27: // Esc
					this.close();
					break;
				case 39: // ->
					this.next();
					break;
				case 37: // <-
					this.prev();
					break;
			}
		},

		/**
		 * Close the popup
		 *
		 * @returns {void}
		 */
		close: function (e) {
			if( e ){
				e.preventDefault();
			}

			this._popupActive = false;

			this._container.animate({
				transform: "scale(0.7)",
				opacity: "0"
			}, 'fast');

			ips.utils.anim.go('fadeOut', this._modal);
		},

		/**
		 * Handles animating from one card to another in a given direction
		 *
		 * @returns {void}
		 */
		_animate: function (from, to, dir) {
			// Set up position of next, and show it (invisible though)
			to.css({
				transform: dir == 'forward' ? "translateX(100px)" : "translateX(-100px)",
				opacity: "0"
			}).show();

			// Is there another next card available? If not, we need to hide the next button now
			this._next.toggle( !!to.next().length );
			this._prev.toggle( !!to.prev().length );

			// Move current card out
			from.stop(true, true).animate({
				transform: dir == 'forward' ? "translateX(-100px)" : "translateX(100px)",
				opacity: "0"
			}, function () {
				from.hide()
			});

			// Move new card in
			to.stop(true, true).animate({
				transform: "translateX(0)",
				opacity: "1"
			});

			this._active = this._cards.index( to );
			
			// Highlight dot
			this._dots.removeClass('acpNewFeature_active');
			this._dots.eq( this._active ).addClass('acpNewFeature_active');
		},

		/**
		 * Event handler for clicking on one of the dots
		 *
		 * @returns {void}
		 */
		dot: function (e) {
			if( e ){
				e.preventDefault();
			}

			var dot = $( e.currentTarget ).parent();
			var idx = this._dots.index( dot );

			Debug.log( 'idx: ' + idx );

			var current = this._cards.eq( this._active );
			var next = this._cards.eq( idx );
			var dir = 'forward';

			if( idx < this._active ){
				dir = 'backward';
			}

			if( idx == this._active ){
				return;
			}

			this._animate( current, next, dir );
		},

		/**
		 * Event handler for clicking Next
		 *
		 * @returns {void}
		 */
		next: function (e) {
			if( e ){
				e.preventDefault();
			}

			var current = this._cards.eq( this._active );
			var next = current.next();

			if( !next.length ){
				Debug.log('no next');
				return;
			}

			this._animate( current, next, 'forward' );			
		},

		/**
		 * Event handler for clicking Prev
		 *
		 * @returns {void}
		 */
		prev: function (e) {
			if( e ){
				e.preventDefault();
			}

			var current = this._cards.eq( this._active );
			var prev = current.prev();

			if( !prev.length ){
				Debug.log('no prev');
				return;
			}

			this._animate( current, prev, 'backward' );
		},

		/**
		 * Builds the popup
		 *
		 * @returns {void}
		 */
		_buildPopup: function () {
			var cards = [];
			var dots = [];

			this._modal = ips.ui.getModal();

			_.each( this._data, function (item) {
				cards.push( ips.templates.render('newFeatures.card', {
					title: item.title,
					image: item.image,
					description: item.description,
					moreInfo: item.more_info || false
				}));
			});

			for( var i = 0; i < cards.length; i++ ){
				dots.push( ips.templates.render('newFeatures.dot', {
					i: i
				}));
			}

			var container = ips.templates.render('newFeatures.wrapper', {
				cards: cards.join(''),
				dots: dots.join('')
			});

			$('body').append( container );
			this._container = $('body').find('[data-role="newFeatures"]').css({ opacity: "0.001", transform: "scale(0.8)" });
			this._cards = this._container.find('[data-role="card"]');
			this._dots = this._container.find('[data-role="dots"] [data-role="dot"]');
			this._next = this._container.find('[data-action="nextFeature"]').hide();
			this._prev = this._container.find('[data-action="prevFeature"]').hide();

			$( document ).trigger('contentChange', [this._container]);
			this._modal.on( 'click', this._closeModal.bind( this ) );
		},

		/**
		 * Close the modal upon clicking
		 *
		 * @returns {void}
		 */
		_closeModal: function (e) {
			e.preventDefault();

			this.close();
		},

		/**
		 * Shows the popup
		 *
		 * @returns {void}
		 */
		_showPopup: function () {
			var self = this;

			// Hide all except the first item
			this._cards.not(':first').hide();
			this._active = 0;

			// Mark the first dot
			this._dots.first().addClass('acpNewFeature_active');

			if( this._data.length > 1 ){
				this._next.show();
			}

			this._modal.css( { zIndex: ips.ui.zIndex() } );
			ips.utils.anim.go('fadeIn', this._modal);

			// Style the title so we can animate it in momentarily
			var title = self._container.find('[data-role="mainTitle"]');
			title.css({
				transform: "scale(1.2)",
				opacity: "0"
			});

			this._popupActive = true;

			// Animate the card in
			setTimeout( function () {
				self._container.css( { zIndex: ips.ui.zIndex() } );
				self._container.animate({ 
					opacity: "1",
					transform: "scale(1)"
				}, 'fast');
			}, 500);

			// Now animate the title in
			setTimeout( function () {
				title.animate({
					opacity: "1",
					transform: "scale(1)"
				}, 'fast');
			}, 800);

		}
	});
}(jQuery, _));


