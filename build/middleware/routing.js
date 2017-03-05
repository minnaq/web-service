'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = function (options) {
	var router = new _koaRouter2.default();

	// These extesion methods will be added
	// to the webservice object later (not in this function)
	var extensions = {};

	// Define handlers for HTTP requests for these HTTP methods
	var _arr = ['get', 'put', 'patch', 'post', 'delete'];

	var _loop = function _loop() {
		var method = _arr[_i];
		extensions[method] = function (path, action) {
			// All errors thrown from this middleware will get caught 
			// by the error-catching middleware up the middleware chain
			router[method](path, function (ctx, next) {
				// Sessions aren't currently used
				var session = ctx.session;
				var session_id = ctx.sessionId;
				var destroy_session = function destroy_session() {
					return ctx.session = null;
				};

				// Cookie helpers

				var get_cookie = function get_cookie(name) {
					return ctx.cookies.get(name);
				};

				// https://github.com/pillarjs/cookies#cookiesset-name--value---options--
				// `path` is "/" by default
				// `httpOnly` is `true` by default
				var set_cookie = function set_cookie(name, value) {
					var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

					// Set the cookie to expire in January 2038 (the fartherst it can get)
					// http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
					options.expires = options.expires || new Date(2147483647000);

					ctx.cookies.set(name, value, options);
				};

				var destroy_cookie = function destroy_cookie(name) {
					// Clear the coookie itself (raw value)
					ctx.cookies.set(name, null);
					// The ".sig" counterpart contains the hash of the cookie,
					// so clear it too (used for Koa "signed cookies").
					ctx.cookies.set(name + '.sig', null);
				};

				// This route handler parameters,
				// which are extracted from POST body, GET query, and route parameters.
				var parameters = (0, _extends3.default)({}, ctx.request.body, ctx.query, ctx.params);

				// Parse JSON dates (for convenience)
				(0, _dateParser2.default)(parameters);

				// Treat empty string parameters as `undefined`s
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(parameters)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var _key = _step.value;

						if (parameters[_key] === '') {
							delete parameters[_key];
						}
					}

					// By default, use the standard `http` utility
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				var http_client = _http2.default;

				// If Json Web Tokens are used for authentication,
				// then add JWT Authorization header to internal HTTP requests.
				if (ctx.jwt) {
					(function () {
						// Customize all methods of `http` utility
						http_client = {};

						// HTTP Authorization header value for a JWT token
						var jwt_header = 'Bearer ' + ctx.jwt;

						// For each HTTP method
						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;

						try {
							var _loop2 = function _loop2() {
								var key = _step2.value;

								// Add JWT Header to an internal HTTP request
								http_client[key] = function (destination, data) {
									var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

									// Send JWT token in `Authorization` HTTP header
									options.headers = options.headers || {};
									options.headers.Authorization = options.headers.Authorization || jwt_header;

									// Perform HTTP request
									return _http2.default[key](destination, data, options);
								};
							};

							for (var _iterator2 = (0, _getIterator3.default)((0, _keys2.default)(_http2.default)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								_loop2();
							}
						} catch (err) {
							_didIteratorError2 = true;
							_iteratorError2 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion2 && _iterator2.return) {
									_iterator2.return();
								}
							} finally {
								if (_didIteratorError2) {
									throw _iteratorError2;
								}
							}
						}
					})();
				}

				// Сall the route handler with `parameters` and a utility object
				var result = action.bind(ctx)(parameters, {
					// Client's IP address.
					// Trusts 'X-Forwarded-For' HTTP header.
					ip: ctx.ip,

					// Cookie utilities
					get_cookie: get_cookie,
					set_cookie: set_cookie,
					destroy_cookie: destroy_cookie,

					// Sessions aren't used currently
					session: session,
					session_id: session_id,
					destroy_session: destroy_session,

					// JWT stuff
					user: ctx.user,
					authentication_error: ctx.authentication_error,
					authentication_token_id: ctx.jwt_id,
					authentication_token: ctx.jwt,

					// Applicaton's secret signing keys
					keys: options.keys,

					// internal `http` utility
					// (only use it for internal HTTP requests,
					//  because it will send cookies and JWT tokens too)
					internal_http: http_client
				});

				// Responds to this HTTP request
				// with a route handler result
				var respond = function respond(result) {
					// If it's a redirect, then do the redirect
					if (is_redirect(result)) {
						return ctx.redirect(result.redirect);
					}

					// Return some special 2xx statuses for some special HTTP methods
					// http://goinbigdata.com/how-to-design-practical-restful-api/
					// http://habrahabr.ru/company/yandex/blog/265569/
					switch (method) {
						case 'put':
						case 'delete':
							if ((0, _helpers.exists)(result)) {
								throw new Error('PUT and DELETE HTTP queries must not return any content.\nRequested ' + method.toUpperCase() + ' ' + ctx.originalUrl + ' and got:\n' + _util2.default.inspect(result));
							}
							ctx.status = 204; // No Content
							// No need for setting response body in this case
							return;
					}

					// Default HTTP status: 200
					ctx.status = 200;

					// Send result JSON object as HTTP response body.
					//
					// `result` may not only be just a JSON object or an array:
					// it may also be a primitive like a string.
					// Hence the manual JSON stringifying and specifying content type explicitly.
					//
					ctx.body = (0, _stringify2.default)(result);
					ctx.type = 'application/json';
				};

				// If route handler result is a Promise,
				// then wait for it to finish, and then respond.
				// Otherwise respond immediately.
				if (result && typeof result.then === 'function') {
					// All errors thrown here will be caught
					// by the error-catching middleware up the middleware chain
					return result.then(respond, function (error) {
						throw error;
					});
				} else {
					respond(result);
				}
			});
		};
	};

	for (var _i = 0; _i < _arr.length; _i++) {
		_loop();
	}

	// Routing requires parsing HTTP POST requests body
	// to be able to parse HTTP POST parameters
	// and pass them in `parameters` to HTTP POST route handlers.
	//
	// So if routing is enabled for all paths,
	// then HTTP POST request body parsing
	// should also be enabled globally.
	//
	// This is not a strict requirement
	// because one may simply opt out of using POST handlers
	// while still using GET handlers, for example.
	//
	// But still it's a useful simple check
	// to make sure a developer didn't mess up the settings.
	//
	if (typeof options.routing !== 'string') {
		if (!options.parse_body) {
			throw new Error('"parse_body" was set to false and "routing" was set to true. Set "routing" to a path then.');
		}

		var result = {
			extensions: extensions,
			middleware: [router.routes(), router.allowedMethods()]
		};

		return result;
	} else {
		var _result = {
			extensions: extensions,
			middleware: [(0, _koaMount2.default)(options.routing, (0, _koaBodyparser2.default)({ formLimit: '100mb' })), (0, _koaMount2.default)(options.routing, router.routes()), (0, _koaMount2.default)(options.routing, router.allowedMethods())]
		};

		return _result;
	}
};

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _koaMount = require('koa-mount');

var _koaMount2 = _interopRequireDefault(_koaMount);

var _koaBodyparser = require('koa-bodyparser');

var _koaBodyparser2 = _interopRequireDefault(_koaBodyparser);

var _helpers = require('../helpers');

var _http = require('../http');

var _http2 = _interopRequireDefault(_http);

var _dateParser = require('../date parser');

var _dateParser2 = _interopRequireDefault(_dateParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Checks if a route handler requests a redirect to a URL
// (then `result` must have a form of `{ redirect: "/url" }`)
function is_redirect(result) {
	return (0, _helpers.is_object)(result) && result.redirect && (0, _keys2.default)(result).length === 1;
}

// `http` utility
module.exports = exports['default'];
//# sourceMappingURL=routing.js.map