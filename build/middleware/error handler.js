'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = function (_ref) {
	var development = _ref.development,
	    log = _ref.log,
	    markup_settings = _ref.markup_settings;

	return function () {
		var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
			var http_status_code, error_data, _render_stack_trace, response_status, response_body;

			return _regenerator2.default.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_context.prev = 0;
							_context.next = 3;
							return next();

						case 3:
							_context.next = 11;
							break;

						case 5:
							_context.prev = 5;
							_context.t0 = _context['catch'](0);

							// HTTP response status code
							http_status_code = void 0;

							// If this error has an HTTP status code set,
							// then this status code will be used when sending HTTP response.
							// (this also works for `superagent` errors because they too have the `status` property)

							if (typeof _context.t0.status === 'number') {
								http_status_code = _context.t0.status;
							}

							// If HTTP response status code has been obtained, then use it.
							if (http_status_code) {
								// Set Http Response status code according to the error's `code`
								ctx.status = http_status_code;

								// Set Http Response according to the error thrown
								if ((0, _helpers.is_object)(_context.t0.data)) {
									error_data = _context.t0.data;


									if (!(0, _helpers.exists)(error_data.message)) {
										error_data.message = _context.t0.message;
									}

									if (!(0, _helpers.exists)(error_data.status)) {
										error_data.status = _context.t0.status;
									}

									ctx.body = error_data;
								} else {
									ctx.body = _context.t0.message || 'Internal error';
								}
							}
							// Else, if no HTTP response status code was specified,
							// default to 500 and a generic error message.
							else {
									// log the error, if it's not a normal Api error
									// (prevents log pollution with things like 
									//  `404 User not found` or `401 Not authenticated`)

									// if (error.proxy_error 
									// 	&& options.show_proxy_errors 
									// 	&& options.show_proxy_errors[error.proxy_to] === false)
									// {
									// 	// don't output error to the log
									// }
									// else
									// {
									// 	// for easier debugging
									// 	console.log('(http request failed)')
									// 	log.error(error)
									// }

									log.error(_context.t0);

									ctx.status = 500;
									ctx.body = 'Internal error';
								}

							// (in development mode)
							// Show stack trace for generic errors for easier debugging
							if (development) {
								// If it was a generic (unspecific) error,
								// then render its stack trace.
								if (!http_status_code) {
									_render_stack_trace = render_stack_trace(_context.t0, { markup_settings: markup_settings, log: log }), response_status = _render_stack_trace.response_status, response_body = _render_stack_trace.response_body;


									if (response_body) {
										ctx.status = response_status || 500;
										ctx.body = response_body;
										ctx.type = 'html';

										// Can be used to reconstruct the original error message
										ctx.set('X-Error-Message', _context.t0.message);
										// Can be used to reconstruct the original error stack trace
										ctx.set('X-Error-Stack-Trace', (0, _stringify2.default)(_context.t0.stack));
									}
								}
							}

						case 11:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this, [[0, 5]]);
		}));

		return function (_x, _x2) {
			return _ref2.apply(this, arguments);
		};
	}();
};

var _printError = require('print-error');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renders the stack trace of an error as HTML markup
function render_stack_trace(error, _ref3) {
	var markup_settings = _ref3.markup_settings,
	    log = _ref3.log;

	// Supports custom `html` for an error
	if (error.html) {
		return { response_status: error.status, response_body: error.html };
	}

	// Handle `superagent` errors
	// https://github.com/visionmedia/superagent/blob/29ca1fc938b974c6623d9040a044e39dfb272fed/lib/node/response.js#L106
	if (error.response && typeof error.status === 'number') {
		// If the `superagent` http request returned an HTML response 
		// (possibly an error stack trace),
		// then just output that stack trace.
		if (error.response.headers['content-type'] && error.response.headers['content-type'].split(';')[0].trim() === 'text/html') {
			return { response_status: error.status, response_body: error.message };
		}
	}

	// If this error has a stack trace then it can be shown

	var stack_trace = void 0;

	if (error.stack) {
		stack_trace = error.stack;
	}
	// `superagent` errors have the `original` property 
	// for storing the initial error
	else if (error.original && error.original.stack) {
			stack_trace = error.original.stack;
		}

	// If this error doesn't have a stack trace - do nothing
	if (!stack_trace) {
		return {};
	}

	// Render the error's stack trace as HTML markup
	try {
		return { response_body: (0, _printError.html)({ stack: stack_trace }, markup_settings) };
	} catch (error) {
		log.error(error);

		// If error stack trace couldn't be rendered as HTML markup,
		// then just output it as plain text.
		return { response_body: error.stack };
	}
}
module.exports = exports['default'];
//# sourceMappingURL=error handler.js.map