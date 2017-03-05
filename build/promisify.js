"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

exports.default = promisify;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function promisify(action, bind) {
	return function () {
		for (var _len = arguments.length, parameters = Array(_len), _key = 0; _key < _len; _key++) {
			parameters[_key] = arguments[_key];
		}

		return new _promise2.default(function (resolve, reject) {
			parameters.push(function (error, result) {
				error ? reject(error) : resolve(result);
			});

			action.apply(bind, parameters);
		});
	};
}
module.exports = exports['default'];
//# sourceMappingURL=promisify.js.map