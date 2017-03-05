'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = web_service;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaBodyparser = require('koa-bodyparser');

var _koaBodyparser2 = _interopRequireDefault(_koaBodyparser);

var _koaMount = require('koa-mount');

var _koaMount2 = _interopRequireDefault(_koaMount);

var _koaBunyan = require('koa-bunyan');

var _koaBunyan2 = _interopRequireDefault(_koaBunyan);

var _koaCompress = require('koa-compress');

var _koaCompress2 = _interopRequireDefault(_koaCompress);

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _koaLocale = require('koa-locale');

var _koaLocale2 = _interopRequireDefault(_koaLocale);

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

var _promisify = require('./promisify');

var _promisify2 = _interopRequireDefault(_promisify);

var _helpers = require('./helpers');

var _errorHandler = require('./middleware/error handler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _authentication = require('./middleware/authentication');

var _authentication2 = _interopRequireDefault(_authentication);

var _proxy = require('./middleware/proxy');

var _proxy2 = _interopRequireDefault(_proxy);

var _fileUpload = require('./middleware/file upload');

var _fileUpload2 = _interopRequireDefault(_fileUpload);

var _acl = require('./middleware/acl');

var _acl2 = _interopRequireDefault(_acl);

var _session = require('./middleware/session');

var _session2 = _interopRequireDefault(_session);

var _routing2 = require('./middleware/routing');

var _routing3 = _interopRequireDefault(_routing2);

var _redirect = require('./middleware/redirect');

var _redirect2 = _interopRequireDefault(_redirect);

var _rewrite = require('./middleware/rewrite');

var _rewrite2 = _interopRequireDefault(_rewrite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Sets up a Web Server instance (based on Koa)
//
// options:
//
// compress            - enables tar/gz compression of Http response data
//
// detect_locale       - extracts locale from Http Request headers 
//                       and places it into ctx.locale
//
// session             - tracks user session (ctx.session)
//
// authentication      - uses a JWT token as a means of user authentication
//                       (should be a function transforming token payload into user info)
//
// parse_body          - parse Http Post requests body (default: false; true when using routing)
//
// routing             - enables Rest Http routing
//                       (usage: web.get('/path', parameters => return 'Echo'))
//
// log                 - bunyan log instance
//
// returns an object with properties:
//
//   shut_down() - gracefully shuts down the server (not tested)
//
//   upload() - enables file upload functionality
//
//     parameters:
//
//       path           - the URL path to mount this middleware at (defaults to /)
//
//       upload_folder  - where to write the files
//
//       multiple_files - set this flag to true in case of multiple file upload
//
//   files() - enables serving static files
//
//     parameters:
//
//       url_path        - the URL path to mount this middleware at
//
//       filesystem_path - the corresponding filesystem path where the static files reside
//
//   listen() - starts listening for requests
//
//     parameters:
//
//       port - the TCP port to listen on
//       host - the TCP host to listen on (defaults to 0.0.0.0)
//
//     returns: a Promise
//
//   mount() - mounts a Koa middleware at a path
//
//     parameters:
//
//       path       - the URL path to mount the middleware at
//       middleware - the middleware to mount
//
//   use() - standard Koa .use() method
//
//   redirect() - HTTP redirect helper
//
//     parameters:
//
//       from       - the base URL path from which to redirect
//
//       options:
//
//         to       - the base URL (or path) to which the redirect will be performed
//
//         exact    - redirect to `to` only in case of exact URL path match (`url.path === from`)
//
//         match    - custom URL matching function match({ url, path, querystring, query });
//                    should return a URL (or a path) to which the redirect will be performed;
//                    if it returns nothing then the redirect won't be performed.
//
//         status   - HTTP redirection status (defaults to 301 (Moved Permanently))
//                    (e.g. can be set to 302 (Moved Temporarily))
//
//   rewrite() - Rewrites HTTP request URL (for further matching)
//
//     parameters:
//
//       from       - the base URL path on which to rewrite
//
//       options:
//
//         to       - the base URL (or path) to which to rewrite the HTTP request URL
//
//         exact    - rewrite to `to` only in case of exact URL path match (`url.path === from`)
//
//         match    - custom URL matching function match({ url, path, querystring, query });
//                    should return a URL (or a path) to which to rewrite the HTTP request URL;
//                    if it returns nothing then the URL won't be rewritten.
//
//   proxy() - proxies all requests for this path to another web server
//
//     parameters:
//
//       path        - the URL path to mount the requests for
//       destination - where to proxy these requests to
//
function web_service() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	// In development mode errors are printed as HTML
	var development = process.env.NODE_ENV !== 'production';

	// This object will be returned
	var result = {};

	// Create a Koa web application
	var web = new _koa2.default();

	// Trust `X-Forwarded-For` HTTP header
	// https://en.wikipedia.org/wiki/X-Forwarded-For
	web.proxy = true;

	// Compresses HTTP response with GZIP
	// (better delegate this task to NginX or HAProxy in production)
	if (options.compress) {
		// хз, нужно ли сжатие в node.js: мб лучше поставить впереди nginx'ы, 
		// и ими сжимать, чтобы не нагружать процесс node.js
		web.use((0, _koaCompress2.default)());
	}

	// Dummy log in case no `log` supplied
	var log = options.log || {
		debug: console.info.bind(console),
		info: console.info.bind(console),
		warn: console.warn.bind(console),
		error: console.error.bind(console)
	};

	// Is used in `api.js`
	result.log = log;

	// Handle all subsequent errors
	web.use((0, _errorHandler2.default)({ development: development, log: log, markup_settings: options.error_html }));

	// If an Access Control List is set,
	// then allow only IPs from the list of subnets.
	// (this is a "poor man"'s ACL, better use a real firewall)
	if (options.access_list) {
		web.use((0, _acl2.default)(options.access_list));
	}

	// Outputs Apache-style logs for incoming HTTP requests.
	// E.g. "GET /users?page=2 200 466ms 4.66kb"
	if (options.debug) {
		web.use((0, _koaBunyan2.default)(log, {
			// which level you want to use for logging.
			// default is info
			level: 'debug',
			// this is optional. Here you can provide request time in ms,
			// and all requests longer than specified time will have level 'warn'
			timeLimit: 100
		}));
	}

	if (options.detect_locale) {
		// Gets locale from HTTP request
		// (the second parameter is the HTTP GET query parameter name
		//  and also the cookie name)
		(0, _koaLocale2.default)(web, 'locale');

		// Sets `ctx.locale` variable for reference
		web.use(function () {
			var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx) {
				return _regenerator2.default.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								ctx.locale = ctx.getLocaleFromQuery() || ctx.getLocaleFromCookie() || ctx.getLocaleFromHeader();

							case 1:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this);
			}));

			return function (_x2) {
				return _ref.apply(this, arguments);
			};
		}());
	}

	// Secret keys (used for JWT token signing, for example)
	web.keys = options.keys;

	// Enable JWT authentication
	if (options.authentication) {
		web.use((0, _authentication2.default)({
			authentication: options.authentication,
			keys: options.keys,
			validate_token: options.validate_token
		}));
	}

	// Sessions aren't currently used
	if (options.session) {
		web.use((0, _session2.default)(options.redis));
	}

	// Checks if `parse_body` needs to be set to `true`
	// (that's the case for routing)
	if (options.parse_body !== false && options.routing === true) {
		options.parse_body = true;
	}

	// Enables HTTP POST body parsing
	if (options.parse_body) {
		// Set up http post request handling.
		// Usage: ctx.request.body
		web.use((0, _koaBodyparser2.default)({ formLimit: '100mb' }));
	}

	// Enables REST routing
	if (options.routing) {
		var _routing = (0, _routing3.default)({
			keys: options.keys,
			routing: options.routing,
			parse_body: options.parse_body
		}),
		    extensions = _routing.extensions,
		    middleware = _routing.middleware;

		// Injects REST routing methods to `result` object.


		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(extensions)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var key = _step.value;

				result[key] = extensions[key];
			}
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

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = (0, _getIterator3.default)(middleware), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var use = _step2.value;

				web.use(use);
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
	}

	// Active HTTP proxy servers
	var proxies = [];

	// HTTP server shutdown flag
	var shut_down = false;

	// In case of server shutdown, stop accepting new HTTP connections.
	// (this code wasn't tested)
	web.use(function () {
		var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
			return _regenerator2.default.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							if (!shut_down) {
								_context2.next = 5;
								break;
							}

							ctx.status = 503;
							ctx.message = 'The server is shutting down for maintenance';
							_context2.next = 7;
							break;

						case 5:
							_context2.next = 7;
							return next();

						case 7:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, this);
		}));

		return function (_x3, _x4) {
			return _ref2.apply(this, arguments);
		};
	}());

	// Shuts down the HTTP server.
	// Returns a Promise.
	// (this method wasn't tested)
	result.shut_down = function () {
		shut_down = true;

		// Pending promises
		var pending = [];

		// Shut down http proxies
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = (0, _getIterator3.default)(proxies), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var proxy = _step3.value;

				pending.push((0, _promisify2.default)(proxy.close, proxy)());
			}

			// Stops the server from accepting new connections and keeps existing connections. 
			//
			// The optional callback will be called once the 'close' event occurs. 
			// Unlike that event, it will be called with an Error as its only argument 
			// if the server was not open when it was closed.
			//
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		pending.push((0, _promisify2.default)(web.close, web)());

		return _promise2.default.all(pending);
	};

	// Returns the number of currently present HTTP connections.
	// (this method wasn't tested)
	result.connections = function () {
		// http_server.getConnections()
		return (0, _promisify2.default)(web.getConnections, web)();
	};

	// Enables handling file uploads.
	// Takes an object with parameters.
	result.file_upload = function () {
		// Check for misconfiguration
		if (options.parse_body) {
			throw new Error('.file_upload() was enabled but also "parse_body" wasn\'t set to false, therefore Http POST request bodies are parsed which creates a conflict. Set "parse_body" parameter to false.');
		}

		// Enable file uploading middleware
		web.use(_fileUpload2.default.apply(this, arguments));
	};

	// Shorter alias for file uploads
	result.upload = result.file_upload;

	// Serves static files
	// (better do it with NginX or HAProxy in production)
	result.serve_static_files = function (url_path, filesystem_path) {
		var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		// Cache them in the web browser for 1 year by default
		var maxAge = options.maxAge || 365 * 24 * 60 * 60;
		// https://github.com/koajs/static
		web.use((0, _koaMount2.default)(url_path, (0, _koaStatic2.default)(filesystem_path, { maxAge: maxAge })));
	};

	// Shorter alias for static files serving
	result.files = result.serve_static_files;

	// Mounts Koa middleware at path
	result.mount = function (path, handler) {
		web.use((0, _koaMount2.default)(path, handler));
	};

	// exposes Koa .use() function for custom middleware
	result.use = web.use.bind(web);

	// Proxies all URLs starting with 'from_path' to another server
	// (make sure you proxy only to your own servers
	//  so that you don't leak cookies or JWT tokens to the 3rd party)
	result.proxy = function (from_path, to, proxy_options) {
		var _proxier = (0, _proxy2.default)(from_path, to, proxy_options),
		    proxy = _proxier.proxy,
		    middleware = _proxier.middleware;

		proxies.push(proxy);
		web.use(middleware);
	};

	// Redirection helper
	result.redirect = function (from, options) {
		web.use((0, _redirect2.default)(from, options));
	};

	// URL rewrite
	result.rewrite = function (from, options) {
		web.use((0, _rewrite2.default)(from, options));
	};

	// Runs http server.
	// Returns a Promise resolving to an instance of HTTP server.
	result.listen = function (port, host) {
		if ((0, _helpers.is_object)(port)) {
			host = port.host;
			port = port.port;
		}

		host = host || '0.0.0.0';

		return new _promise2.default(function (resolve, reject) {
			// The last route - throws "Not found" error
			web.use(function () {
				var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx) {
					return _regenerator2.default.wrap(function _callee3$(_context3) {
						while (1) {
							switch (_context3.prev = _context3.next) {
								case 0:
									ctx.status = 404;
									ctx.message = 'The requested resource not found: ' + ctx.method + ' ' + ctx.url;

									// Reduces noise in the `log` in case of errors
									// (web browsers query '/favicon.ico' automatically)
									if (!(0, _helpers.ends_with)(ctx.path, '/favicon.ico')) {
										log.error(ctx.message, 'Web server error: Not found');
									}

								case 3:
								case 'end':
									return _context3.stop();
							}
						}
					}, _callee3, this);
				}));

				return function (_x6) {
					return _ref3.apply(this, arguments);
				};
			}());

			// Create HTTP server
			var http_web_server = _http2.default.createServer();

			// // Enable Koa for handling HTTP requests
			// http_web_server.on('request', web.callback())

			// Copy-pasted from 
			// https://github.com/koajs/koala/blob/master/lib/app.js
			//
			// "Expect: 100-continue" is something related to http request body parsing
			// http://crypto.pp.ua/2011/02/mexanizm-expectcontinue/
			//
			var koa_callback = web.callback();
			http_web_server.on('request', koa_callback);
			http_web_server.on('checkContinue', function (request, response) {
				// Requests with `Expect: 100-continue`
				request.checkContinue = true;
				koa_callback(request, response);
			});

			// Starts HTTP server
			http_web_server.listen(port, host, function (error) {
				if (error) {
					return reject(error);
				}

				resolve(http_web_server);
			});
			// .on('connection', () => connections++)
			// .on('close', () => connections--)
		});
	};

	// done
	return result;
}
module.exports = exports['default'];
//# sourceMappingURL=web service.js.map