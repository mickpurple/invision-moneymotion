/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * Author: Ehren Harber
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('calendar.front.overview.carousel', {

		initialize: function () {
			this.on('mouseenter', this.stopTimer);
            this.on('mouseleave', this.startTimer);
			this.on('click', '.cFeaturedEvents__dots', this.dotClick);
			this.setup();
		},

		setup: function () {
			this._scroller = this.scope[0].querySelector('.cFeaturedEvents__scroller');
			this._dotContainer = this.scope[0].querySelector('.cFeaturedEvents__dots');
			this.scrollPercentage();
			this.startTimer();
		},

		scrollPercentage: function() {
			this._scroller.addEventListener('scroll', e => {
				let percentage = Math.floor(100 * this._scroller.scrollLeft / (this._scroller.scrollWidth-this._scroller.clientWidth));
				this._dotContainer.style.setProperty('--percentage', percentage);
			}, {
				passive: true,
			});
		},

		autoPlay: function(){
			let currentScroll = this._scroller.scrollLeft,
				carouselChildWidth = this._scroller.firstElementChild.offsetWidth;
			if ((currentScroll >= this._scroller.scrollWidth - this._scroller.clientWidth)){
				this._scroller.scrollLeft = 0;
			} else {
				this._scroller.scrollLeft = currentScroll + carouselChildWidth;
			}
			this.startTimer();
		},

		dotClick: function(ev){
			let slide = this.scope[0].querySelector(`.cFeaturedEvents__scroller [data-item='${ev.target.dataset.carouselDot}']`);
			slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
		},

        stopTimer: function () {
            clearInterval(this._timer);
        },

        startTimer: function () {
            this._timer = setTimeout(this.autoPlay.bind(this), 5000);
        }

	});
}(jQuery, _));