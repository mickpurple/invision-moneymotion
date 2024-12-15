/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.overview.search.js - Controller for event search
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
    "use strict";

    ips.controller.register('calendar.front.overview.search', {
        initialize: function () {
            this.on('click', '[data-action="useMyLocation"]', this.useMyLocation);
            this.on('click', '[data-action="cancelLocation"]', this.cancelLocation);
            this.on('submit', this.doSearch);
            this.on( document, 'click', '[data-action="backToOverview"]', this.backToOverview);
            this.on( document, 'click', '[data-action="loadMoreSearch"]', this.loadMore);
            this.on( document, 'menuItemSelected', '#elSortMenu', this.changeSort);
            this.on( document, 'click', '[data-action="moreNearMe"]', this.moreNearMe);
            this.on( document, 'click', '[data-action="moreExhibitions"]', this.moreExhibitions);
            this.on( window, 'historychange:calendarSearch', this.stateChange );
            this.setup();
        },

        /**
         * Setup method
         *
         * @returns {void}
         */
        setup: function () {

            // Other setup
            this._gotCoords = false;
            this._offset = 0;
            this._limit = 20;
            this._currentSort = $('body').find('#elSortMenu_menu .ipsMenu_itemChecked').attr('data-ipsMenuValue');
            this._baseURL = this.scope.attr('action');
            this._initialURL = window.location.href;
            this._cancelledLookup = false;
            this._searchBox = this.scope.find('input[name="location"]');
            this._previousValue = this._searchBox.val();
            this._originalPlaceholder = this.scope.attr('data-placeholder');
            this._locationLink = this.scope.find('[data-action="useMyLocation"]');
            this._cancelLocationLink = this.scope.find('[data-action="cancelLocation"]');
            this._page = this.scope.closest('[data-role="eventsPage"]');
            this._resultsContainer = $('body').find('[data-role="searchResults"]');
            this._noResults = $('body').find('[data-role="noSearchResults"]');
            this._loadMore = $('body').find('[data-action="loadMoreSearch"]');
            this._noMore = $('body').find('[data-role="noMoreSearchResults"]');
            this._map = null;
            this._mapContainer = $('body').find('[data-role="searchResultsMap"]');
            this._markers = {};

           
            this.getInitialLocation();
        

            // Get map ready to show
            if( ips.getSetting( 'mapProvider' ) === 'google' ){
                this.setupGoogle();
            } else if( ips.getSetting( 'mapProvider' ) === 'mapbox' ){
                this.setupMapbox();
            } else {
				this._mapContainer.hide(); // hide map container if no map
			}
        },

        setupGoogle: function(){
            var self = this;
            self._mapReady = true;
            Debug.log( self._resultsContainer.find('[data-eventid]') );
            Debug.log( self._mapContainer.attr('data-markers') );

            if( self._resultsContainer.find('[data-eventid]').length && self._mapContainer.attr('data-markers') ){
                Debug.log('here');
                try {
                    var markers = JSON.parse( self._mapContainer.attr('data-markers') );
                    Debug.log( markers );
                    self._updateGoogleMap( markers );
                } catch (err) {
                    Debug.log("Invalid marker JSON");
                    Debug.log(err);
                }
            }
        },

        setupMapbox: function(){
            var self = this;
            $('head').append( "<link rel='stylesheet' type='text/css' media='all' href='https://api.mapbox.com/mapbox.js/v3.3.1/mapbox.css'><link href='https://api.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v1.0.0/MarkerCluster.css' rel='stylesheet' /><link href='https://api.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v1.0.0/MarkerCluster.Default.css' rel='stylesheet' /><link rel='stylesheet' type='text/css' media='all' href='https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/leaflet.fullscreen.css' />" );

            ips.loader.get( [ 'https://api.mapbox.com/mapbox.js/v3.3.1/mapbox.js' ] ).then( function () {
                ips.loader.get( [ 'https://api.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v1.0.0/leaflet.markercluster.js',
                    'https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/Leaflet.fullscreen.min.js' ] ).then( function () {

                    self._mapReady = true;
                    
                    if( self._resultsContainer.find('[data-eventid]').length && self._mapContainer.attr('data-markers') ){

                        try {
                            var markers = JSON.parse( self._mapContainer.attr('data-markers') );
                            self._updateMapboxMap( markers );
                        } catch (err) {
                            Debug.log("Invalid marker JSON");
                            Debug.log(err);
                        }
                    }
                });
            });
        },

        getInitialLocation: function () {
            if ( ips.utils.geolocation.getGeolocationIsAllowed() ) {
                
                ips.utils.geolocation.getCurrentPosition().then( coords => {
                    this.setCoords( coords.latitude, coords.longitude );
                })

                // Update useMyLocation link
                this.setSearchToLocation();
                this._locationLink.hide();
                this._cancelLocationLink.show();
            }
        },

        setCoords: function (lat, long) {
            this.scope.prepend("<input type='hidden' name='lat' value='" + lat + "'>");
            this.scope.prepend("<input type='hidden' name='lon' value='" + long + "'>");
            this._gotCoords = true;
        },

        clearCoords: function () {
            this.scope.find( 'input[name="lat"]' ).remove();
            this.scope.find( 'input[name="lon"]' ).remove();
            this._gotCoords = false;
        },

        moreNearMe: function (e) {
            e.preventDefault();

            // Get the lat/long from the link
            var lat = $( e.currentTarget ).attr('data-lat');
            var long = $( e.currentTarget ).attr('data-long');
            var self = this;

            this.setSearchToLocation();
            this.scope.find('[name="date[start]"]').val('');
            this.scope.find('[name="date[end]"]').val('');
            this.scope.find('[name="show"]').val('regular');

            $("html, body").animate({ scrollTop: "300px" }, function () {
                self.doSearch();
            });
        },

        moreExhibitions: function (e) {
            e.preventDefault();

            var self = this;

            this.cancelLocation();
            this.scope.find('[name="date[start]"]').val('');
            this.scope.find('[name="date[end]"]').val('');
            this.scope.find('[name="show"]').val('exhibitions');

            $("html, body").animate({ scrollTop: "300px" }, function () {
                self.doSearch();
            });
        },

        /**
         * Submit handler for the search form
         *
         * @param 		{Event} 	[e] 		Event object
         * @returns 	{void}
         */
        doSearch: function (e) {
            e?.preventDefault()
            const url = this._getUrlFromData();

            ips.utils.history.replaceState( {
                controller: 'calendar.front.overview.search',
                url
            }, 'calendarSearch', url );
        },

        /**
         * Build placeholder elements from a template
         *
         * @param 		{number} 	count 		Number to build (10 default)
         * @returns 	{string}
         */
        getPlaceholders: function (count) {
            var events = [];

            if( _.isUndefined( count ) ){
                count = 10;
            }

            for( var i = 0; i < count; i++ ){
                events.push( ips.templates.render('eventLoading') );
            }

            return events.join('');
        },

        /**
         * Main state change event handler that responds to URL changes
         *
         * @returns 	{void}
         */
        stateChange: function () {
            if (!('calendarSearch' in ips.utils.history.getState()) && this._initialURL !== window.location.href) {
                return;
            }

            const state = ips.utils.history.getState('calendarSearch')

            if (this._initialURL === state?.url) {
                // If our URLs match but we have no state data, we can assume we've gone back to the initial search form, so let's reset
                this.hideResults();
            } else if (this._initialURL === window.location.href && state?.url === undefined) {
                // If we don't have a URL, get it from our initial data
                this._loadResults( this._getUrlFromData( this._initialData ) );
            } else {
                // Otherwise use the state url
                this._loadResults( state?.url );
            }
        },

        /**
         * Builds a search URL based on on the form values
         *
         * @param 		{event} 	e 		Event object
         * @param 		{object} 	data 	Event data object
         * @returns 	{string}
         */
        changeSort: function (e, data) {
            e.preventDefault();
            this._currentSort = data.selectedItemID;
            var title = data.menuElem.find('[data-ipsMenuValue="' + this._currentSort + '"]').text();
            $('body').find('[data-role="searchOrder"]').text( title );
            this.doSearch();
        },

        /**
         * Builds a search URL based on on the form values
         *
         * @param 		{event} 	e 		Event object
         * @param 		{object} 	data 	Event data object
         * @returns 	{string}
         */
        _getUrlFromData: function () {
            var formData = this.scope.serializeArray();
            var params = [];

            _.each( formData, function (item){
                if( $.trim( item.value ) !== '' ){
                    params.push( item.name + "=" + encodeURIComponent( item.value ) );
                }
            });

            // @todo sort
            params.push("sortBy=" + this._currentSort);

			if( this._baseURL.match(/\?/) ) {
				if( this._baseURL.slice(-1) != '?' ){
					this._baseURL += '&';
				}
			} else {
				this._baseURL += '?';
			}

            return this._baseURL + params.join('&');
        },

        /**
         * Handles performing a new search
         *
         * @param 		{string} 	url 		URL to request
         * @returns 	{void}
         */
        _loadResults: function (url) {
            var self = this;

            // Do we need to hide the overview stuff?
            if( this._page.length ){
                this._page.find('[data-role="eventsOverview"]').hide();
                this._page.find('[data-role="searchResultsWrapper"]').show();
            }

            this._resultsContainer.removeClass('ipsHide').html( this.getPlaceholders(6) );
			if( ips.getSetting('mapProvider') !== 'none') {
				this._mapContainer.addClass('cEvents__searchMap--loading').show();
			}
            this._currentUrl = url;

            ips.getAjax()( url )
                .done( function (response){
                    if( response.count ){
                        self._resultsContainer.html( response.content );
                        self._noResults.addClass('ipsHide');
                        self._updateMap( _.extend( {}, self._markers, response.markers ) );

                        if( response.totalCount > ( response.count + self._offset ) ){
                            self._loadMore.show();
                            self._noMore.hide();
                        } else {
                            self._loadMore.hide();
                            self._noMore.hide();
                        }
                    } else {
                        self._resultsContainer.html('').addClass('ipsHide');
                        self._noResults.removeClass('ipsHide');
                        self._loadMore.hide();
                        self._noMore.hide();
                        self._mapContainer.hide();
                    }

                    if( response.virtual ){
                        self._mapContainer.hide();
                    }

                    $( document ).trigger('contentChange', [ self._resultsContainer ]);
                });
        },

        _updateMap: function ( markers ){
            if( ips.getSetting( 'mapProvider' ) === 'google' ){
                this._updateGoogleMap( markers );
            } else if( ips.getSetting( 'mapProvider' ) === 'mapbox' ) {
                this._updateMapboxMap( markers );
            } else {
				this._mapContainer.hide(); // we really don't need it.
			}
        },

        _updateGoogleMap: function (markers){

            if( !this._map ){
                this._map = new window.google.maps.Map( document.querySelector( '[data-role="searchResultsMap"]' ) );
                this._mapMarkers = [];
            }

            this._mapContainer.removeClass('cEvents__searchMap--loading');

            /* Clear existing markers before we rebuild */
            if( this._mapMarkers.length ){
                for ( let marker of Object.values(this._mapMarkers) ) {
                    marker.setMap(null);
                }
                this._mapMarkers = [];
            }

            var bounds = new google.maps.LatLngBounds();
            for ( let marker of Object.values(markers) ) {
                let mapMarker = new window.google.maps.Marker({
                    position: {lat: marker.lat, lng: marker.long},
                    map: this._map,
                    title: marker.title
                });
                this._mapMarkers.push( mapMarker );

                var coords = new google.maps.LatLng( marker.lat, marker.long );
                if( !( bounds.contains( coords ) ) ){
                    bounds.extend( coords );
                }
            }

            /* If we have only one marker in here, fitting to the bounds zooms in way too much */
            if( this._mapMarkers.length === 1 ){
                this._map.setZoom(15);
                this._map.setCenter(bounds.getCenter());
            } else {
                this._map.fitBounds(  bounds );
            }
            this._mapContainer.show();
        },

        _updateMapboxMap: function (markers) {
            if( !this._map ){
                L.mapbox.accessToken = ips.getSetting('mapApiKey');
                this._map = L.mapbox
                    .map( this._mapContainer.get(0) )
                    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));

                // Map prefs
                this._map.zoomControl = false;
                this._map.minZoom = 2;
                this._map.dragging = false;
                this._map.zoomControl = false;

                // Reposition zoom control
                /*L.control.zoom({
                    position: 'bottomright'
                }).addTo(this._map);

                // Add and position fullscreen control
                this._map.addControl(new L.Control.Fullscreen({
                    position: 'bottomleft'
                }));*/

                this._markersGroup = new L.featureGroup([]);
                this._markersGroup.addTo( this._map );
            }

            this._mapContainer.removeClass('cEvents__searchMap--loading');
            this._markersGroup.clearLayers(); // Remove all existing markers

            for( var id in markers ){
                var marker = L.marker([markers[id].lat, markers[id].long], {
                    title: markers[id].title,
                    draggable: false,
                    eventId: parseInt(id)
                });

                //self._map.addLayer( marker );
                this._markersGroup.addLayer( marker );

                // Build info popup for this marker
                marker.on('click', _.bind( this._markerClick, this ) );
            }

            this._mapContainer.show();
            this._map.fitBounds(this._markersGroup.getBounds(), { maxZoom: 5 });
        },

        _markerClick: function (e, data) {
            var targetEvent = e.target.options.eventId;

            // Find that event in our listing
            var eventBlock = this._resultsContainer.find('[data-eventId="' + targetEvent + '"]');

            // Get position
            var topPos = eventBlock.offset().top;

            // Scroll to it
            $('html, body').animate({ scrollTop: topPos }, function () {
                eventBlock.css({ transform: 'scale(1.1)' });

                setTimeout( function () {
                    eventBlock.css({ transform: 'scale(1)' });
                }, 2000);
            });
        },

        /**
         * Handles loading more results into the current search
         *
         * @param 		{event} 	e 		Event object
         * @returns 	{void}
         */
        loadMore: function (e) {
            e.preventDefault();

            var placeholders = this.getPlaceholders(2);
            this._resultsContainer.append( placeholders );
            this._loadMore.prop('disabled', true);

            var self = this;
            var currentCount = this._resultsContainer.find('[data-eventid]').length;

            ips.getAjax()( this._currentUrl + "&offset=" + currentCount + "&limit=" + this._limit)
                .done( function (response) {
                    self._resultsContainer.find('.event--loading').remove();
                    self._resultsContainer.append( response.content );
                    self._updateMap( response.markers );
                    self._loadMore.prop('disabled', false);

                    if( self._resultsContainer.find('[data-eventid]').length >= response.totalCount ){
                        self._loadMore.hide();
                        self._noMore.show();
                    } else {
                        self._loadMore.show();
                        self._noMore.hide();
                    }

                    $( document ).trigger('contentChange', [ self._resultsContainer ]);
                });
        },

        /**
         * Remove current location as the search term
         *
         * @param 		{event} 	e 		Event object
         * @returns 	{void}
         */
        cancelLocation: function (e) {
            if( e ){
                e.preventDefault();
            }

            let geolocation = ips.utils.geolocation.setGeolocationIsAllowed( ips.utils.geolocation.permissions.DENIED );

            this._cancelledLookup = true;
            this._searchBox.val( this._previousValue ).attr('placeholder', this._originalPlaceholder).prop('disabled', false).removeClass('ipsField_loading');
            this._locationLink.show();
            this._cancelLocationLink.hide();

            this.scope.find('[name="searchNearLocation"]').remove();
        },

        /**
         * Fetch current location and use it as the current search param
         *
         * @param 		{event} 	e 		Event object
         * @returns 	{void}
         */
        useMyLocation: function (e) {
            e.preventDefault();

            var self = this;

            self._cancelledLookup = false;
            self._searchBox.val('').attr('placeholder', ips.getString('event_finding_location')).prop('disabled', true).addClass('ipsField_loading');
            self._locationLink.hide();
            self._cancelLocationLink.show();

            var afterCoords = function () {
                if( self._cancelledLookup ){
                    self._cancelledLookup = false;
                    return;
                }

                self.setSearchToLocation();
                self._cancelledLookup = false;
            };

            if( self._gotCoords ){
                afterCoords()
            } else {
                ips.utils.geolocation.getCurrentPosition().then( coords  => {
                    self.setCoords(coords.latitude, coords.longitude);
                    this.setSearchToLocation();
                });
            }
        },
        
        setSearchToLocation: function () {
            this._searchBox.val('').attr('placeholder', ips.getString('event_your_current_location')).prop('disabled', true).removeClass('ipsField_loading');
            this.scope.prepend("<input type='hidden' name='searchNearLocation' value='1'>");
        },

        /**
         * Cancal searching and show the overview page again
         *
         * @param 		{Event} 	e 		Event object
         * @returns 	{void}
         */
        backToOverview: function (e) {
            if( !this._page.length ){
                return;
            }

            e.preventDefault();

            ips.utils.history.replaceState( {
                controller: 'calendar.front.overview.search',
                url: this._initialURL
            }, 'calendarSearch', this._initialURL );
        },

        /**
         * Hide the search results panel
         *
         * @param 		{event} 	e 		Event object
         * @returns 	{void}
         */
        hideResults: function (e) {
            this._page.find('[data-role="eventsOverview"]').show();
            this._page.find('[data-role="searchResultsWrapper"]').hide();
        }
    });
}(jQuery, _));
