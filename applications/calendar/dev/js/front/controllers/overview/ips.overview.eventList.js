/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.overview.eventList.js - Controller for event listing
 *
 * Author: Rikki Tissier
 */
var PER_PAGE = 16;

;( function($, _, undefined){
    "use strict";

    ips.controller.register('calendar.front.overview.eventList', {
        initialize: function () {
            this.on( 'click', '[data-action="loadMore"]', this.loadMore );
            this.on( 'click', '[data-action="changeMonth"]', this.changeMonth );
            this.setup();
        },

        /**
         * Setup method
         * Hides categories the user has already hidden
         *
         * @returns {void}
         */
        setup: function () {
            this._eventList = this.scope.find('[data-role="eventList"]');
            this._loadMore = this.scope.find('[data-action="loadMore"]');
            this._monthNav = this.scope.find('[data-role="monthNav"]');
        },

        loadMore: function (e) {
            e.preventDefault();

            var placeholders = this.getPlaceholders();
            this._eventList.append( placeholders );
            this._loadMore.prop('disabled', true);

            // Get the current month/year
            var self = this;
            var current = this.getCurrentDate();
            var total = this.scope.find('[data-eventID]').length;
            var url = ips.getSetting('baseURL') + '?app=calendar&module=calendar&controller=view&view=overview&get=byMonth&m=' + current.month + '&y=' + current.year + '&offset=' + total;

            ips.getAjax()( url )
                .done( function (response) {
                    self._eventList.append( response.html );
                    self.removePlaceholders();
                    self.checkMoreButton( response.count );
                    self._loadMore.prop('disabled', false);
                    $( document ).trigger('contentChange', [ self.scope ]);
                });
        },

        changeMonth: function (e) {
            e.preventDefault();

            var placeholders = this.getPlaceholders(4);
            this._eventList.html( placeholders );
            this._loadMore.prop('disabled', true);

            // Toggle the correct month
            this._monthNav.find('[data-action="changeMonth"]').removeClass('cEvents__monthNav__monthItem--active');
            $( e.currentTarget ).addClass('cEvents__monthNav__monthItem--active');

            // Now fetch results
            var self = this;
            var current = this.getCurrentDate();
            var url = ips.getSetting('baseURL') + '?app=calendar&module=calendar&controller=view&view=overview&get=byMonth&m=' + current.month + '&y=' + current.year + '&offset=0';

            ips.getAjax()( url )
                .done( function (response) {
                    self._eventList.html( response.html );
                    self.checkMoreButton( response.count );
                    self._loadMore.prop('disabled', false);
                    $( document ).trigger('contentChange', [ self.scope ]);
                });
        },

        getPlaceholders: function (count) { //@todo get actual count
            var events = [];

            if( _.isUndefined( count ) ){
                count = 4;
            }

            for( var i = 0; i < count; i++ ){
                events.push( ips.templates.render('eventLoading') );
            }

            return events.join('');
        },

        removePlaceholders: function () {
            this.scope.find('.event--loading').remove();
        },

        checkMoreButton: function (count) {
            if( _.isNumber( count ) && count < PER_PAGE ){
                this.scope.find('[data-action="loadMore"]').hide();
                this.scope.find('[data-role="noMoreResults"]').show();
            } else {
                this.scope.find('[data-action="loadMore"]').show();
                this.scope.find('[data-role="noMoreResults"]').hide();
            }
        },

        getCurrentDate: function () {
            var current = this.scope.find('[data-role="monthNav"] .cEvents__monthNav__monthItem--active');

            return {
                month: current.attr('data-month'),
                year: current.attr('data-year')
            };
        }
    });
}(jQuery, _));