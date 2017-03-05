'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = function () {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	var web = (0, _webService2.default)((0, _extends3.default)({}, options, {
		compress: true,
		routing: true
	}));

	var log = web.log;

	var api = {};
	api.legacy = {};

	var _arr = ['get', 'put', 'patch', 'post', 'delete'];

	var _loop = function _loop() {
		var method = _arr[_i];
		// Web 2.0 Api (Ajax)
		api[method] = web[method];

		// Web 1.0 Api (no Ajax)
		api.legacy[method] = function (route, handler, error_handler) {
			web[method](route, function () {
				var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(parameters) {
					var url,
					    redirect,
					    _args = arguments;
					return _regenerator2.default.wrap(function _callee$(_context) {
						while (1) {
							switch (_context.prev = _context.next) {
								case 0:
									_context.prev = 0;
									_context.next = 3;
									return handler.apply(this, _args);

								case 3:
									_context.t0 = _context.sent;
									return _context.abrupt('return', {
										redirect: _context.t0
									});

								case 7:
									_context.prev = 7;
									_context.t1 = _context['catch'](0);

									// Log the error, if it's not a normal Api error
									// (prevents log pollution with things like 
									//  `404 User not found` or `401 Not authenticated`)
									if (!(0, _helpers.exists)(_context.t1.status)) {
										log.error(_context.t1);
									}

									// Call the `error_handler` to get a URL
									// to which the user will be redirected
									url = error_handler.call(this, _context.t1);

									// Add error info to the URL
									// to which the user is going to be redirected

									redirect = new _url2.default(url).set_parameters((0, _extends3.default)({}, parameters, {
										error_field: _context.t1.field,
										error_status: _context.t1.status,
										error: _context.t1.message
									})).print();

									// Perform the redirect

									return _context.abrupt('return', { redirect: redirect });

								case 13:
								case 'end':
									return _context.stop();
							}
						}
					}, _callee, this, [[0, 7]]);
				}));

				return function (_x2) {
					return _ref.apply(this, arguments);
				};
			}());
		};
	};

	for (var _i = 0; _i < _arr.length; _i++) {
		_loop();
	}

	if (!options.api) {
		throw new Error('Api service "api" array is required');
	}

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = (0, _getIterator3.default)(options.api), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var api_module = _step.value;

			// log.info('loading api module', file)
			api_module(api);
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

	var result = {
		listen: function listen(port, host) {
			return web.listen(port, host);
		}
	};

	return result;
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _webService = require('./web service');

var _webService2 = _interopRequireDefault(_webService);

var _url = require('./url');

var _url2 = _interopRequireDefault(_url);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
//# sourceMappingURL=api.js.map