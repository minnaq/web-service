'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Access_list = function () {
	function Access_list() {
		var access_list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
		(0, _classCallCheck3.default)(this, Access_list);
		this.allowed_subnets = [];
		this.blocked_subnets = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = (0, _getIterator3.default)(access_list), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var statement = _step.value;

				// Just in case
				statement = statement.trim();

				// Exclusion pattern
				if (statement[0] === '!') {
					var subnet = statement.substring(1);

					if (!is_valid_ipv4_cidr_subnet(subnet)) {
						throw new Error('Invalid IPv4 CIDR subnet "' + subnet + '"');
					}

					this.blocked_subnets.push(_ip2.default.cidrSubnet(subnet));
				}
				// Inclusion pattern
				else {
						var _subnet = statement;

						if (!is_valid_ipv4_cidr_subnet(_subnet)) {
							throw new Error('Invalid IPv4 CIDR subnet "' + _subnet + '"');
						}

						this.allowed_subnets.push(_ip2.default.cidrSubnet(_subnet));
					}
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
	}

	(0, _createClass3.default)(Access_list, [{
		key: 'test',
		value: function test(ip) {
			if ((0, _helpers.is_empty)(this.allowed_subnets) && (0, _helpers.is_empty)(this.blocked_subnets)) {
				return true;
			}

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (0, _getIterator3.default)(this.blocked_subnets), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var subnet = _step2.value;

					if (subnet.contains(ip)) {
						return false;
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

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = (0, _getIterator3.default)(this.allowed_subnets), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var _subnet2 = _step3.value;

					if (_subnet2.contains(ip)) {
						return true;
					}
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

			return false;
		}
	}]);
	return Access_list;
}();

// http://blog.markhatton.co.uk/2011/03/15/regular-expressions-for-ip-addresses-cidr-ranges-and-hostnames/


exports.default = Access_list;
var ipv4_cidr_subnet_regexp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;

function is_valid_ipv4_cidr_subnet(subnet) {
	return ipv4_cidr_subnet_regexp.test(subnet);
}
module.exports = exports['default'];
//# sourceMappingURL=acl.js.map