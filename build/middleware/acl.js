'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = function (access_list) {
	// If an Access Control List is set,
	// then allow only IPs from the list of subnets.
	var ip_access_list = new _acl2.default(access_list);

	return function () {
		var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
			var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ip_address;

			return _regenerator2.default.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							// Check the entire `X-Forwarded-For` IP address chain
							// along with the HTTP request originator IP address.
							_iteratorNormalCompletion = true;
							_didIteratorError = false;
							_iteratorError = undefined;
							_context.prev = 3;
							_iterator = (0, _getIterator3.default)(ctx.request.ips.concat(ctx.req.connection.remoteAddress));

						case 5:
							if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
								_context.next = 12;
								break;
							}

							ip_address = _step.value;

							if (ip_access_list.test(ip_address)) {
								_context.next = 9;
								break;
							}

							throw new Error('Access denied for ip ' + ip_address);

						case 9:
							_iteratorNormalCompletion = true;
							_context.next = 5;
							break;

						case 12:
							_context.next = 18;
							break;

						case 14:
							_context.prev = 14;
							_context.t0 = _context['catch'](3);
							_didIteratorError = true;
							_iteratorError = _context.t0;

						case 18:
							_context.prev = 18;
							_context.prev = 19;

							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}

						case 21:
							_context.prev = 21;

							if (!_didIteratorError) {
								_context.next = 24;
								break;
							}

							throw _iteratorError;

						case 24:
							return _context.finish(21);

						case 25:
							return _context.finish(18);

						case 26:
							_context.next = 28;
							return next();

						case 28:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this, [[3, 14, 18, 26], [19,, 21, 25]]);
		}));

		return function (_x, _x2) {
			return _ref.apply(this, arguments);
		};
	}();
};

var _acl = require('../acl');

var _acl2 = _interopRequireDefault(_acl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
//# sourceMappingURL=acl.js.map