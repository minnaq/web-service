'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = function (path, to) {
	var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	// Normalize arguments

	if ((0, _helpers.is_object)(to)) {
		options = to;
		to = undefined;
	}

	if (!(0, _helpers.exists)(to)) {
		to = path;
		path = undefined;
	}

	// Create proxy server
	var proxy = _httpProxy2.default.createProxyServer(options);

	// Koa middleware
	function proxy_middleware(to) {
		return function () {
			var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx) {
				var from_name, to_name, promise;
				return _regenerator2.default.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								// These two variables are used for generating error messages
								from_name = ctx.path; // .substring(path.length)

								to_name = options.name || to;
								promise = new _promise2.default(function (resolve, reject) {
									// Abrupt closing of HTTP response from the remote server
									// (e.g. due to an error)
									ctx.res.on('close', function () {
										reject(new Error('Http response closed while proxying "' + from_name + '" to ' + to_name));
									});

									// When proxying finishes without errors
									ctx.res.on('finish', function () {
										resolve();
									});

									// Do the proxying.
									//
									// promisify(proxy.web, proxy) won't work here,
									// because the last parameter is not a "callback",
									// it's just an error handler.
									// https://github.com/nodejitsu/node-http-proxy/issues/951
									//
									proxy.web(ctx.req, ctx.res, { target: to }, function (error) {
										// Give meaningful description to "Connection refused" error
										if (error.code === 'ECONNREFUSED') {
											error = new Error('Couldn\'t proxy "' + from_name + '" to ' + to_name + '. No connection');
										}

										// Give meaningful description to "Socket hang up"
										// (probably it's caught here)
										if (error.code === 'ECONNRESET') {
											error = new Error('Lost connection while proxying "' + from_name + '" to ' + to_name);
										}

										console.error('Proxy error');
										reject(error);

										// response.writeHead(502)
										// response.end("There was an error proxying your request")
									});
								});
								_context.next = 5;
								return promise;

							case 5:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this);
			}));

			return function (_x2) {
				return _ref.apply(this, arguments);
			};
		}();
	}

	// The result to be returned
	var result = { proxy: proxy };

	// Proxy only HTTP requests for a certain path
	if (path) {
		result.middleware = (0, _koaMount2.default)(path, proxy_middleware(to));
	}
	// Or just proxy all incoming HTTP requests
	else {
			result.middleware = proxy_middleware(to);
		}

	return result;
};

var _httpProxy = require('http-proxy');

var _httpProxy2 = _interopRequireDefault(_httpProxy);

var _koaMount = require('koa-mount');

var _koaMount2 = _interopRequireDefault(_koaMount);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
//# sourceMappingURL=proxy.js.map