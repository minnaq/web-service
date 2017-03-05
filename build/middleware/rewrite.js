'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = rewrite;

var _redirect = require('./redirect');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Koa URL rewrite
function rewrite(from) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	return function () {
		var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
			var destination;
			return _regenerator2.default.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							destination = (0, _redirect.match)(ctx, from, options);

							// If there was a match, then rewrite URL

							if (!destination) {
								_context.next = 5;
								break;
							}

							if ((0, _helpers.starts_with)(destination, '/')) {
								_context.next = 4;
								break;
							}

							throw new Error('The rewritten URL must start with a slash');

						case 4:

							ctx.url = destination;

						case 5:

							// Proceed
							next();

						case 6:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		}));

		return function (_x2, _x3) {
			return _ref.apply(this, arguments);
		};
	}();
}
module.exports = exports['default'];
//# sourceMappingURL=rewrite.js.map