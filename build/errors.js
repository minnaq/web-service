'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// httpstatuses.com
exports.default = {
	// 400 Bad Request
	//
	// Syntax error in HTTP Request payload.
	//
	// The server cannot or will not process the request due to something 
	// that is perceived to be a client error (e.g., malformed request syntax, 
	// invalid request message framing, or deceptive request routing).
	//
	Malformed_input: custom_error('Malformed input', { status: 400 }),

	// 401 Unauthorized
	//
	// Non-authenticated users are not allowed to perform this action.
	//
	// The request has not been executed because it lacks 
	// valid authentication credentials for the target resource.
	//
	Unauthenticated: custom_error('Unauthenticated', { status: 401 }),

	// 403 Forbidden
	//
	// The user has not enough privileges to perform this action.
	//
	// The server understood the request but refuses to authorize it.
	//
	Unauthorized: custom_error('Unauthorized', { status: 403 }),

	// Just an alias for `Unathorized`
	Access_denied: custom_error('Access denied', { status: 403 }),

	// 404 Not found
	//
	// The requested resource was not found.
	//
	Not_found: custom_error('Not found', { status: 404 }),

	// 409 Conflict
	//
	// The request could not be completed due to a conflict
	// with the current state of the target resource.
	//
	// This code is used in situations where the user might be able
	// to resolve the conflict and resubmit the request.
	//
	Conflict: custom_error('Conflict', { status: 409 }),

	// 415 Unsupported media type
	//
	// Unsupported HTTP Request content-type
	//
	Unsupported_input_type: custom_error('Unsupported input type', { status: 415 }),

	// 422 Unprocessable Entity
	//
	// The service supports the content type of the HTTP Request,
	// and the syntax of the HTTP Request entity is correct,
	// but was unable to process the contained instructions.
	// (e.g. missing a required JSON field)
	//
	Input_rejected: custom_error('Input rejected', { status: 422 }),

	// 429 Too Many Requests
	//
	// The user has sent too many requests in a given amount of time.
	// Intended for use with rate-limiting schemes.
	//
	Too_many_requests: custom_error('Too many requests', { status: 429 }),

	// 500 Internal Server Error
	//
	// HTTP Request input is valid, but the service encountered
	// an unexpected condition which prevented it from fulfilling the request.
	//
	Error: custom_error('Server error', { status: 500 })
};


function custom_error(name) {
	var default_properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	return function (_Error) {
		(0, _inherits3.default)(Custom_error, _Error);

		function Custom_error(message) {
			var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			(0, _classCallCheck3.default)(this, Custom_error);

			// Normalize arguments
			var _this = (0, _possibleConstructorReturn3.default)(this, (Custom_error.__proto__ || (0, _getPrototypeOf2.default)(Custom_error)).call(this));

			_this.data = {};
			if ((0, _helpers.is_object)(message)) {
				properties = message;
				message = undefined;
			}

			// Set default properties
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(default_properties)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var key = _step.value;

					// Set the property
					_this.data[key] = default_properties[key];
					// Set the property shortcut
					_this[key] = default_properties[key];
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

			_this.name = name;
			_this.message = name;

			if (message) {
				_this.message = message;
			}

			// Set error instance properties
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (0, _getIterator3.default)((0, _keys2.default)(properties)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var _key = _step2.value;

					// Set the property
					_this.data[_key] = properties[_key];
					// Set the property shortcut
					_this[_key] = properties[_key];
				}

				// Capture stack trace (if available)
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

			if (Error.captureStackTrace) {
				Error.captureStackTrace(_this, Custom_error);
			}
			return _this;
		}

		return Custom_error;
	}(Error);
}
module.exports = exports['default'];
//# sourceMappingURL=errors.js.map