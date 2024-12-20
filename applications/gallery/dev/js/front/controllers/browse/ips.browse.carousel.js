/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.browse.carousel.js - Controller for Gallery carousel
 *
 * Author: Ehren Harber
 */
;( function(){
	"use strict";

	ips.controller.register('gallery.front.browse.carousel', {
		
		initialize () {

			this.carouselControls = this.scope[0].closest('[data-carousel-controls]');
			this.carousel = document.getElementById(this.carouselControls.dataset.carouselControls);

			if(this.carouselControls && this.carousel.scrollWidth > this.carousel.clientWidth){
				this.showArrows();
			} else {
				return;
			}

			this.buttons = this.scope[0].querySelectorAll('[data-carousel-arrow]');
			this.buttons.forEach(button => {
				button.addEventListener('click', this.scrollPanels);
			});

		},

		showArrows: function(){

			this.carouselControls.hidden = false;

		},

		scrollPanels: function(ev) {

			let carouselControls = this.closest('[data-carousel-controls]'),
				carousel = document.getElementById(carouselControls.dataset.carouselControls),
				direction = this.dataset.carouselArrow,
				currentScroll = carousel.scrollLeft,
			 	scrollByVar = getComputedStyle(carousel).getPropertyValue('--carousel--scroll'),
			 	carouselChildWidth = carousel.firstElementChild.offsetWidth,
			 	scrollBy = scrollByVar * (carouselChildWidth);

			if (direction == 'prev'){
			 	scrollBy = -scrollBy;
			}
			if (currentScroll == '0' && direction == 'prev'){
				carousel.scrollLeft = carousel.scrollWidth;
			} else if ((currentScroll == carousel.scrollWidth - carousel.clientWidth) && (direction == 'next')){
				carousel.scrollLeft = 0;
			} else {
				carousel.scrollLeft = currentScroll + scrollBy;
			}
		},

	});
}());