/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.ui.map.js - Interactive Map
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){

	ips.createModule('ips.ui.map', function(){
		
		var defaults = {
			zoom: 2,
			markers: '[]',
			contentUrl: null
		};

		/**
		 * Respond to a map widget
		 *
		 * @param	{element} 	elem 		The element this widget is being created on
		 * @param	{object} 	options 	The options passed into this instance
		 * @param	{event} 	e 		 	The event object
		 * @returns {void}
		 */
		var respond = function (elem, options, e) {
			options = _.defaults( options, defaults );
			
			var callback = function () {
				if( ips.getSetting('mapProvider') == 'google' ){
					_google( elem, options );
				} else if( ips.getSetting('mapProvider') == 'mapbox' ){
					_mapbox( elem, options );
				}
			};

			if( ips.getSetting('lazyLoadEnabled') ){
				ips.utils.lazyLoad.observe( elem, {
					loadCallback: callback
				});
			} else {
				callback();
			}
		};

		/**
		 * Handle Mapbox
		 *
		 * @returns {void}
		 */
		var _mapbox = function (elem, options) {
			$('head').append( "<link rel='stylesheet' type='text/css' media='all' href='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css'><link href='https://api.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v1.0.0/MarkerCluster.css' rel='stylesheet' /><link href='https://api.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v1.0.0/MarkerCluster.Default.css' rel='stylesheet' />" );

			var handlePopup = function (e) {
				var popup = e.target.getPopup();
				var clubID = e.target.options.clubID;

				ips.getAjax()( options.contentUrl + clubID ).done( function (response) {
					popup.setContent( response );
					popup.update();
				});
			};

			ips.loader.get( [ 'https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.js' ] ).then( function () {
				ips.loader.get( [ 'https://api.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v1.0.0/leaflet.markercluster.js' ] ).then( function () {
					L.mapbox.accessToken = ips.getSetting('mapApiKey');
					var map = L.mapbox.map( elem.get(0), 'mapbox.streets').setView([45, 0], options.zoom);

					var cluster = new L.MarkerClusterGroup();
					map.addLayer( cluster );

					var markers = $.parseJSON( options.markers );
					for ( var id in markers ) {
						var marker = L.marker([markers[id].lat, markers[id].long], {
							icon: L.mapbox.marker.icon({
								'marker-color': '#0000ff'
							}),
							clubID: id,
							title: markers[id].title,
							draggable: false
						}).addTo(map);

						cluster.addLayer( marker );

						// Build info popup for this marker
						if( options.contentUrl ){
							marker.bindPopup( ips.getString('loading') );
							marker.on('click', handlePopup );
						}
					}

					// Center on markers
					map.fitBounds(cluster.getBounds().pad(0.5));
				});
			});
		};

		/**
		 * Handle google maps
		 *
		 * @returns {void}
		 */
		var _google = function (elem, options) {
			
			if ( typeof google === 'undefined' || typeof google.maps === 'undefined' ) {
				ips.loader.get( [ 'https://maps.googleapis.com/maps/api/js?key=' + ips.getSetting('mapApiKey') + '&libraries=places&sensor=false&callback=ips.ui.map.googleCallback' ] );
			} else {
				ips.ui.map.googleCallback();
			}
						
			$( window ).on( 'googleApiLoaded', function(){
				
				var mapOptions = {
					zoom: options.zoom,
					scrollwheel: false
				};
				if ( options.zoom ) {
					mapOptions.center = { lat: 45, lng: 0 };
				} else {
					mapOptions.center = { lat: 30, lng: 0 };
				}
				
				var map = new google.maps.Map( elem.get(0), mapOptions);
				var bounds = new google.maps.LatLngBounds();
				
				var infowindow = new google.maps.InfoWindow({
					content: ips.getString('loading')
				});
				
				var markers = $.parseJSON( options.markers );
				for ( var id in markers ) {
															
					var marker = new google.maps.Marker({
					  position: { lat: markers[id].lat, lng: markers[id].long },
					  map: map,
					  title: markers[id].title,
					  id: id
					});
					
					if ( options.contentUrl ) {
						marker.addListener('click', function() {	
							
							infowindow.setContent( ips.getString('loading') )					
							infowindow.open(map,this);
							
							ips.getAjax()( options.contentUrl + this.id ).done(function(response){
								infowindow.setContent( response );
							});

						});
					}

					// Increase bounds to include this marker
					bounds.extend(marker.position);
				}

				//Center on markers
				map.fitBounds(bounds);
			});
		};
		
		/**
		 * Provides a callback for Google Maps API
		 *
		 * @returns {void}
		 */
		var googleCallback = function(){
			$( window ).trigger( 'googleApiLoaded' );
		};
		
		ips.ui.registerWidget('map', ips.ui.map, [ 'zoom', 'markers', 'contentUrl' ] );

		return {
			respond: respond,
			googleCallback: googleCallback
		};
	});
}(jQuery, _));