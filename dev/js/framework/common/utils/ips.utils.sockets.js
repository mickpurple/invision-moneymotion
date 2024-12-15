/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.utils.sockets.js - A module for working with sockets
 *
 * Author: Rikki Tissier
 */

 (function ($, _, undefined) {
	"use strict";

	ips.createModule("ips.utils.sockets", function () {
		let socketIo;
		let pingInterval;
		let refreshToken;
		let refreshInterval;
		let refreshTokenUsed = false;
		let connected = false;

		const init = function () {
			if( !enabled() ){
				return;
			}

			ips.loader.get( [`${ips.getSetting('socketUrl')}/socket.io/socket.io.min.js`] ).then( function () {
				initializeSocketIo();
			});
		},

		/**
		 *
		 * Is realtime interaction enabled?
		 */
		enabled = function () {
			let res = !!(ips.getSetting('memberID') && ips.getSetting('socketEnabled') && ips.getSetting('page_token'));
			return res;
		},

		/**
		 * Set up socket io connection and event handlers
		 */
		initializeSocketIo = function () {
			if (connected) {
				return;
			}
			socketIo = io(`${ips.getSetting('socketUrl')}/site-${ips.getSetting('siteId')}`, {
				transports: ['websocket'],
				forceNew: true,
				multiplex: false,
				query: {
					token: ips.getSetting('page_token'),
					ipsVersion: 'v4'
				}
			});
		
			socketIo.on('connect', _eventConnect(socketIo));
			socketIo.on('message', _eventMessage);
			socketIo.on('ping', function () {
				socketIo.emit('pong');
			});
			socketIo.on('ping_interval', interval => {
				interval = Number(interval);
				if (interval && Number.isInteger(interval) && interval > 0) {
					clearInterval(pingInterval);
					pingInterval = setInterval(() => {
						socketIo.emit('ping');
					}, interval * 0.98); // we reduce by a factor of 2% for latency
				}
			})
			socketIo.on('connect_error', _eventConnectError);
			socketIo.on('disconnect', _eventDisconnect);

			socketIo.on('refresh_token', token => {
				// we'll do some LIGHT checking to make sure this is a JWT
				let isJwt = true;
				if (typeof token !== "string") {
					isJwt = false;
				} else {
					let components = token.split('.');
					if (components.length < 3) {
						isJwt = false;
					} else {
						for (let component of components.slice(0,2)) {
							if (typeof JSON.parse(atob(component)) !== 'object') {
								isJwt = false;
								break;
							}
						}
					}
				}

				if (isJwt) {
					refreshToken = token;
					refreshTokenUsed = false;
					Debug.log(`Got a refresh token from Node Services`)
				} else {
					Debug.warn(`Got a refresh token that is not a valid JWT from Node Services`)
				}
			})
		},

		useRefreshToken  = function() {
			// keep trying to get an access token for 10 minutes

			let attempts = 120;
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
			refreshInterval = setInterval(() => {
				if (!attempts-- || refreshTokenUsed || typeof refreshToken !== 'string' || typeof ips.getSetting('page_token') !== 'string' || connected) {
					clearInterval(refreshInterval);
					refreshInterval = undefined;
				}

				ips.getAjax()(ips.getSetting('baseURL') + '?app=core&module=system&controller=ajax&do=refreshRealtimeToken', {
					data: {
						page_token: ips.getSetting('page_token'),
						refresh_token: refreshToken
					},
					method: "POST"
				})
					.done( function(response) {
						if (response.page_token) {
							refreshTokenUsed = true;
							ips.setSetting('page_token', response.page_token);
							socketIo.off();
							socketIo.disconnect();
							refreshToken = undefined;
							initializeSocketIo();
						}
					} ).fail(() => Debug.log('Failed to exchange IPS Node Services\' refresh token for access token'));

			}, 5000);
		},
		
		/**
		 * Emit an event to the socket server
		 * Note: events are whitelisted on the server
		 */
		send = function (event, data = {}) {
			if( !enabled() || !socketIo ){
				return;
			}

			socketIo.emit(event, data);
		},

		/**
		 * Event handlers
		 */

		/**
		 * Handle a 'message' event. This handler is a simple broker that re-emits the event
		 * on the document for interested controllers to listen to
		 */
		_eventMessage = function (data = {}) {
			if( typeof data !== 'object' || data.event === undefined ){
				Debug.log('Invalid message data');
				return;
			}

			const { event, type = null, ...rest } = data;
			let eventType = '';

			if( type !== null ){
				eventType = `:${type}`;
			}

			$(document).trigger(`socket.${event}${eventType}`, rest);
		},
		_eventConnect = socket => function () {
			connected = true;
			clearInterval(refreshInterval);
			refreshInterval = undefined;
			Debug.log("Connected to socket server");
			$(document).trigger('socket.connected');
			window.ips.socket = socket;
		},
		_eventConnectError = function () {
			connected = false;
			Debug.log("Error connecting to socket server");
			$(document).trigger('socket.error');

			// let's try refreshing the access token
			useRefreshToken()
		},
		_eventDisconnect = function () {
			connected = false;
			Debug.log("Disconnected from socket server");
			$(document).trigger('socket.disconnected');

			if (!refreshInterval) {
				useRefreshToken();
			}
		};

		return {
			init,
			enabled,
			send
		};
	});
})(jQuery, _);
