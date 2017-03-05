'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

exports.default = redirect;
exports.match = match;

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Redirection helper
function redirect(from) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var status = options.status,
	    rest_options = (0, _objectWithoutProperties3.default)(options, ['status']);


	return function () {
		var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
			var destination;
			return _regenerator2.default.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							destination = match(ctx, from, rest_options);

							// If no match, then don't redirect

							if (destination) {
								_context.next = 3;
								break;
							}

							return _context.abrupt('return', next());

						case 3:

							// Perform the redirect
							ctx.status = status || 301;
							ctx.redirect(destination);

						case 5:
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

// Checks if HTTP request URL matches the conditions.
// Returns a new URL (or path)
function match(ctx, from, options) {
	// Validate `from`
	if (!(0, _helpers.starts_with)(from, '/')) {
		throw new Error('Invalid "from" path: "' + from + '". Must start with a slash.');
	}

	var match = options.match,
	    to = options.to,
	    exact = options.exact;

	// In case of user supplied custom matching function

	if (match) {
		return match(ctx);
	}

	// Validate `to`
	if (!to) {
		throw new Error('"to" was not passed for redirect/rewrite');
	}

	// If HTTP request URL doesn't match `from`, then no match
	if (!(0, _helpers.starts_with)(ctx.url, from)) {
		return;
	}

	// HTTP request URL matches `from`

	// In case of exact path match
	if (exact) {
		// Check for an exact match
		if (ctx.url === from) {
			return to;
		}

		// In case of no exact match, no match
		return;
	}

	return to + ctx.url.substring(from.length);
}
//# sourceMappingURL=redirect.js.map