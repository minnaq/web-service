"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
//
// takes a string
// returns an object { protocol, host, port, path, query, anchor, ... }
function parse_uri() {
	var uri = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.location;

	var options = {
		strictMode: false,
		key: ["source", // protocol:
		"protocol", "authority", // //user:password@
		"userInfo", // user:password
		"user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
		query: {
			name: "parameters",
			parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser: {
			//            protocol  :     //      user        :password    @  host          :port      path (relative,directory,file) ? query       #anchor
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};

	var matches = options.parser[options.strictMode ? "strict" : "loose"].exec(uri);

	var result = {};

	var i = 14;
	while (i--) {
		result[options.key[i]] = matches[i] || "";
	}

	result[options.query.name] = {};

	// options.key[12] === "query"
	result[options.key[12]].replace(options.query.parser, function ($0, $1, $2) {
		if ($1) {
			result[options.query.name][$1] = $2;
		}
	});

	return result;
}

var Uri = function () {
	function Uri(uri) {
		(0, _classCallCheck3.default)(this, Uri);

		if ((0, _helpers.is_object)(uri)) {
			uri = uri.pathname + (uri.search ? "?" + uri.search : '');
		}

		var parsed = parse_uri(uri);

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(parsed)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var key = _step.value;

				this[key] = parsed[key];
			}

			// this.protocol = this.protocol || 'http'
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

		this.path = decodeURI(this.path);

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = (0, _getIterator3.default)((0, _keys2.default)(this.parameters)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var _key = _step2.value;

				var decoded_key = decodeURIComponent(_key);
				var decoded_value = decodeURIComponent(this.parameters[_key]);

				this.parameters[decoded_key] = decoded_value;

				if (decoded_key !== _key) {
					delete this.parameters[_key];
				}

				if (!(0, _helpers.exists)(this[_key])) {
					this[_key] = decoded_value;
				}
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

	(0, _createClass3.default)(Uri, [{
		key: "to_relative_url",
		value: function to_relative_url() {
			this.protocol = '';
			this.host = '';
			this.port = '';

			return this.print();
		}
	}, {
		key: "no_parameters",
		value: function no_parameters() {
			this.parameters = {};

			return this;
		}
	}, {
		key: "set_parameters",
		value: function set_parameters(map) {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = (0, _getIterator3.default)((0, _keys2.default)(map)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var key = _step3.value;

					this.parameter(key, map[key]);
				}
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

			return this;
		}
	}, {
		key: "parameter",
		value: function parameter(_parameter, value) {
			if (value === undefined) {
				return;
			}

			if (Array.isArray(value)) {
				throw new Error("URL parameter \"" + _parameter + "\" was attempted to be set as an array: [" + value + "]");
			}

			this.parameters[_parameter] = value;

			return this;
		}
	}, {
		key: "remove_parameter",
		value: function remove_parameter(parameter) {
			delete this.parameters[parameter];

			return this;
		}
	}, {
		key: "path",
		value: function path(_path) {
			if (!(0, _helpers.starts_with)(_path, '/')) {
				_path = '/' + _path;
			}

			this.path = _path;

			return this;
		}
	}, {
		key: "print",
		value: function print(options) {
			options = (0, _helpers.extend)({ machine: true }, options);

			var uri = '';

			if (this.protocol) {
				var omit_protocol = false;

				if (options.omit_common_protocols) {
					if (this.protocol === 'http' || this.protocol === 'https') {
						omit_protocol = true;
					}
				}

				if (!omit_protocol) {
					uri += this.protocol + '://';
				}
			}

			if (this.host) {
				uri += this.host + (this.port ? ':' + this.port : '');
			}

			uri += this.path; //encodeURI(this.path)

			var first_parameter = true;
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = (0, _getIterator3.default)((0, _keys2.default)(this.parameters)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var key = _step4.value;

					uri += first_parameter ? '?' : '&';
					uri += options.machine ? encodeURIComponent(key) : key;
					uri += '=';
					uri += options.machine ? encodeURIComponent(this.parameters[key]) : this.parameters[key];

					first_parameter = false;
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			if (this.anchor) {
				uri += '#';
				uri += options.machine ? encodeURIComponent(this.anchor) : this.anchor;
			}

			return uri;
		}
	}, {
		key: "toString",
		value: function toString() {
			return this.print();
		}
	}]);
	return Uri;
}();

// self testing


exports.default = Uri;
;(function () {
	function assert(left, right) {
		if (left !== right) {
			throw new Error("Assertion failed: got \"" + left + "\", expected \"" + right + "\"");
		}
	}

	assert(new Uri('http://гугл.рф?раз=два#три').print(), 'http://гугл.рф?%D1%80%D0%B0%D0%B7=%D0%B4%D0%B2%D0%B0#%D1%82%D1%80%D0%B8');
	assert(new Uri('http://гугл.рф?раз=два#три').print({ machine: false }), 'http://гугл.рф?раз=два#три');
	assert(new Uri('google.ru').print(), 'google.ru');

	assert(parse_uri('http://google.ru/root/path/test?parameters').path, '/root/path/test');
})();
module.exports = exports['default'];
//# sourceMappingURL=url.js.map