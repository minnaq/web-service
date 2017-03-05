'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _helpers = require('./helpers');

var _dateParser = require('./date parser');

var _dateParser2 = _interopRequireDefault(_dateParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// HTTP request methods
var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

var http_client = {};

// Define HTTP methods on `http_client` object
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
	var _loop = function _loop() {
		var method = _step.value;

		http_client[method] = function (destination, data) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			var url = format_url(destination);

			return new _promise2.default(function (resolve, reject) {
				// Create Http request
				var request = _superagent2.default[method](url);

				// Attach data to the outgoing HTTP request
				if (data) {
					switch (method) {
						case 'get':
							request.query(data);
							break;

						case 'post':
						case 'put':
						case 'patch':
						case 'head':
						case 'options':
							request.send(data);
							break;

						case 'delete':
							throw new Error('"data" supplied for HTTP DELETE request: ' + (0, _stringify2.default)(data));

						default:
							throw new Error('Unknown HTTP method: ' + method);
					}
				}

				// Apply this HTTP request specific HTTP headers
				if (options.headers) {
					request.set(options.headers);
				}

				// Send HTTP request
				request.end(function (error, response) {
					// If there was an error, then reject the Promise
					if (error) {
						// `superagent` would have already output the error to console
						// console.error(error.stack)

						// console.log('[react-isomorphic-render] (http request error)')

						// Populate error from the HTTP response
						if (response) {
							// Set `error` `status` to HTTP response status code
							error.status = response.statusCode;

							switch (response.type) {
								// Set error `data` from response body,
								case 'application/json':
									// if (!is_object(error.data))
									error.data = (0, _dateParser2.default)(response.body);

									// Set the more meaningful message for the error (if available)
									if (error.data.message) {
										error.message = error.data.message;
									}

									break;

								// If the HTTP response was not a JSON object,
								// but rather a text or an HTML page,
								// then include that information in the `error`
								// for future reference (e.g. easier debugging).

								case 'text/plain':
									error.message = response.text;
									break;

								case 'text/html':
									error.html = response.text;

									// Recover the original error message (if any)
									if (response.headers['x-error-message']) {
										error.message = response.headers['x-error-message'];
									}

									// Recover the original error stack trace (if any)
									if (response.headers['x-error-stack-trace']) {
										error.stack = JSON.parse(response.headers['x-error-stack-trace']);
									}

									break;
							}
						}

						// HTTP request failed with an `error`
						return reject(error);
					}

					// HTTP request completed without errors,
					// so return the HTTP response data.

					// If HTTP response status is "204 - No content"
					// (e.g. PUT, DELETE)
					// then resolve with an empty result
					if (response.statusCode === 204) {
						return resolve();
					}

					// Else, the result is HTTP response body
					resolve((0, _dateParser2.default)(response.body));
				});
			});
		};
	};

	for (var _iterator = (0, _getIterator3.default)(methods), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
		_loop();
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

function format_url(destination) {
	if ((0, _helpers.is_object)(destination)) {
		// Prepend host and port of the API server to the path.
		return 'http://' + destination.host + ':' + destination.port + destination.path;
	}

	// Prepend prefix to relative URL, to proxy to API server.
	return destination;
}

exports.default = http_client;
module.exports = exports['default'];
//# sourceMappingURL=http.js.map