/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.utils.url.js - A module for getting query params from the URL
 *
 * Author: Rikki Tissier
 */

;( function($, _, undefined){
	"use strict";
	
	ips.createModule('ips.utils.url', function () {

		var _skipped = ['s'],
			_store = {},
			_origin;

		var init = function (queryString) {

		},
		
		/**
		 * Returns the requested parameter from the URL
		 *
		 * @param 	{string} 	name 	Parameter to return
		 * @param 	{string} 	[url] 	Url to parse (uses current url if none specified)
		 * @returns {string}
		 */
		getParam = function (name, url) {
			/*Debug.log( 'getParam:' + parseUri( url || window.location.href ).queryKey[ name ] );
			Debug.log( 'getParam params: ');
			Debug.log( parseUri( url || window.location.href ) );
			Debug.log( 'href: ' + window.location.href );*/
			return parseUri( url || window.location.href ).queryKey[ name ];
		},
		
		/**
		 * Returns the page number from the URL
		 *
		 * @param 	{string} 	name 	Parameter to return
		 * @param 	{string} 	[url] 	Url to parse (uses current url if none specified)
		 * @returns {string}
		 */
		getPageNumber = function (param, url) {
			if ( param == 'page' ) {
				var parsedurl = parseUri( url || window.location.href );
				
				if ( parsedurl.path.match( /\/index\.php/ ) ) {
					// Query string based FURL
					var pageNum = null;
					$.each( parsedurl.queryKey, function (key, value) {
						if ( pageNum === null && key.match( /\/page\/\d+?(\/|$)/ ) && ! value ) {
							var match = key.match( /\/page\/(\d+?)(\/|$)/ );

							if ( match !== null && ! _.isUndefined(match[1]) ) {
								pageNum = parseInt( match[1] );
							}
						}
					} );
					
					if ( pageNum !== null ) {
					 	return pageNum;
					}
				}
				else {
					var matches = parsedurl.path.match( /\/page\/(\d+?)\// );
					
					if ( matches !== null && ! _.isUndefined( matches ) ) {
						return parseInt( matches[1] );
					}
				}
			}
			
			var paramPage = this.getParam( param, url || window.location.href );
			return ! _.isUndefined( paramPage ) ? parseInt( paramPage ) : 1;
		},

		/**
		 * Moves site.com/forums/topic/123-foo/?page=4&sort=foo to site.com/forums/topic/123-foo/page/4/?sort=foo
		 *
		 * @param 	{string} 	url 		URL
		 * @param 	{string} 	param 		Page param to use
		 * @param 	{string} 	number 		Page number
		 * @returns {string}	new URL
		 */
		pageParamToPath = function (url, name, number) {
			var uriObject = getURIObject( url );
	
			uriObject.queryKey = _.pick( uriObject.queryKey, function( value, key ) {
				return ( key != name );
			} );
			
			if ( uriObject.path.match( /\/index\.php/ ) ) {
				// Query string based FURL
				var f = null;
				$.each( uriObject.queryKey, function (key, value) {
					if ( f === null && key.match( /^\// ) && ! value ) {
						f = key;
					}
				} );
				
				if ( f !== null ) {
					uriObject.queryKey = _.omit( uriObject.queryKey, f );
					
					var match = f.match( new RegExp( '/' + name + '/\\d+?/$' ) );
				
					if ( match !== null && ! _.isUndefined(match[0]) ) {
						f = f.replace( new RegExp( match[0] ), '/' );
					}

					var newKey = {};
					newKey[ ( number > 1 ) ? decodeURI( f ) + name + '/' + number + '/' : f ] = '';
					uriObject.queryKey = _.extend( newKey, uriObject.queryKey );
				}
			}
			else {
				// .htaccess based FURL		
				var match = uriObject.path.match( new RegExp( '/' + name + '/\\d+?/$' ) );
				
				if ( match !== null && ! _.isUndefined(match[0]) ) {
					uriObject.path = uriObject.path.replace( new RegExp( match[0] ), '/' );
				}
				
				/* now add on the new path */
				if ( number > 1 ) {
					uriObject.path += name + '/' + number + '/';
				}
			}			

			return rebuildUriObject( uriObject );
		},

		/**
		 * Strips the requested parameter from the URL and returns the URL
		 *
		 * @param 	{string} 	name 	Parameters to strip
		 * @param 	{string} 	[url] 	Url to parse (uses current url if none specified)
		 * @returns {string}
		 * @note This is just a shortcut to removeParams
		 */
		removeParam = function (name, url) {
			return this.removeParams( [ name ], url );
		},

		/**
		 * Strips the requested parameters from the URL and returns the URL
		 *
		 * @param 	{array} 	name 	Parameters to strip
		 * @param 	{string} 	[url] 	Url to parse (uses current url if none specified)
		 * @returns {string}
		 */
		removeParams = function (name, url) {
			var uriObject = parseUri( url || window.location.href );

			uriObject.queryKey = _.pick( uriObject.queryKey, function( value, key ) { 
				return ( jQuery.inArray( key, name ) == -1 );
			} );

			return this.rebuildUriObject( uriObject );
		},
		
		/**
		 * Rebuilds a parseUri object back into a URL string
		 *
		 * @param 	{object} 	[uriObject] 	Result of parseUri
		 * @returns {string}
		 */
		rebuildUriObject = function( uriObject ) {
			var returnUrl = uriObject.protocol + '://' + uriObject.host + ( ( uriObject.port !== '' ) ? ':' + uriObject.port : '' ) + uriObject.path;

			if( _.keys( uriObject.queryKey ).length )
			{
				var qsParam = '?';

				_.each( uriObject.queryKey, function( value, key ) {
					if( value )
					{
						returnUrl = returnUrl + qsParam + key + '=' + value;
					}
					else
					{
						// This is here for older style furls, e.g. /index.php?/app/path/ so that we don't end up with /index.php?/app/path/=
						returnUrl = returnUrl + qsParam + key;
					}
					qsParam = '&';
				})
			}

			return returnUrl;
		},

		/**
		 * Returns the parsed URL object from parseUri
		 *
		 * @param 	{string} 	[url] 	Url to parse (uses current url if none specified)
		 * @returns {string}
		 */
		getURIObject = function (url) {
			return parseUri( url || window.location.href );
		},

		/**
		 * Returns an origin for use in window.postMessage
		 *
		 * @returns {string}
		 */
		getOrigin = function () {
			if( !_origin ){
				var url = getURIObject();
				_origin = url.protocol + '://' + url.host + ( ( url.port !== '' ) ? ':' + url.port : '' );
			}
			
			return _origin;
		};

		// parseUri 1.2.2
		// (c) Steven Levithan <stevenlevithan.com>
		// MIT License

		function parseUri (str) {
			// If we have the modern 'URL' API, use that definitely
			if( 'URL' in window ) {
				try {
					// Fix protocol-relative URLs as the URL API does not like them
					if( str.indexOf('//') === 0 )
					{
						str = location.protocol + str;
					}

					var o = new URL( str );

					// We need to reformat the returned URL object keys
					var uri = {
						'source': o.href,
						'protocol': o.protocol.substring( 0, ( o.protocol.length - 1 ) ),
						'userInfo': ( o.username ? o.username : '' ) + ( ( o.username && o.password ) ? ':' : '' ) + ( o.password ? o.password : '' ),
						'user': o.username,
						'password': o.password,
						'host': o.hostname,
						'port': o.port,
						'relative': o.pathname + ( o.search ? o.search : '' ),
						'path': o.pathname,
						'directory': '',  // The URL class does not give us just the path
						'file': '',  // The URL class does not give us just the filename
						'query': o.search.substring(1),
						'anchor': o.hash,
						'queryKey': {}
					};

					// Set the authority using shortcuts we just set
					uri.authority = uri.userInfo + ( uri.userInfo ? '@' : '' ) + uri.host;

					// Set the queryKey object
					o.searchParams.forEach( function( v, k ) {
						uri.queryKey[ k ] = v;
					});

					// Figure out the path and file
					var urlBits		= uri.path.split('/');
					uri.file		= urlBits.pop();
					uri.directory	= urlBits.join('/');

					return uri;
				} catch( err ) {
					// If it failed, likely due to a bad URL, we can let the older polyfill take a stab at it - but log to console so we know.
					Debug.log( "Failed to parse URL: " + str + " ; " + err );
				}
			}

			var	o   = parseUri.options,
				m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
				uri = {},
				i   = 14;

			while (i--) uri[o.key[i]] = m[i] || "";

			uri[o.q.name] = {};
			uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
				if ($1) uri[o.q.name][$1] = $2;
			});

			return uri;
		};

		parseUri.options = {
			strictMode: false,
			key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
			q:   {
				name:   "queryKey",
				parser: /(?:^|&)([^&=]*)=?([^&]*)/g
			},
			parser: {
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
			}
		};
	
		return {
			getPageNumber: getPageNumber,
			getParam: getParam,
			removeParam: removeParam,
			removeParams: removeParams,
			getURIObject: getURIObject,
			getOrigin: getOrigin,
			rebuildUriObject: rebuildUriObject,
			pageParamToPath: pageParamToPath
		};
	});
}(jQuery, _));