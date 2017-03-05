'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.exists = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.is_object = is_object;
exports.extend = extend;
exports.starts_with = starts_with;
exports.ends_with = ends_with;
exports.is_empty = is_empty;
exports.not_empty = not_empty;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// // if the variable is defined
var exists = exports.exists = function exists(what) {
	return typeof what !== 'undefined';
};

// used for JSON object type checking
var object_constructor = {}.constructor;

// detects a JSON object
function is_object(object) {
	return exists(object) && object !== null && object.constructor === object_constructor;
}

// extends the first object with 
/* istanbul ignore next: some weird transpiled code, not testable */
function extend() {
	for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
		objects[_key] = arguments[_key];
	}

	objects = objects.filter(function (x) {
		return exists(x);
	});

	if (objects.length === 0) {
		return;
	}

	if (objects.length === 1) {
		return objects[0];
	}

	var to = objects[0];
	var from = objects[1];

	if (objects.length > 2) {
		var last = objects.pop();
		var intermediary_result = extend.apply(this, objects);
		return extend(intermediary_result, last);
	}

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(from)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var key = _step.value;

			if (is_object(from[key])) {
				if (!is_object(to[key])) {
					to[key] = {};
				}

				extend(to[key], from[key]);
			} else if (Array.isArray(from[key])) {
				if (!Array.isArray(to[key])) {
					to[key] = [];
				}

				to[key] = to[key].concat(clone(from[key]));
			} else {
				to[key] = from[key];
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

	return to;
}

function starts_with(string, substring) {
	var j = substring.length;

	if (j > string.length) {
		return false;
	}

	while (j > 0) {
		j--;

		if (string[j] !== substring[j]) {
			return false;
		}
	}

	return true;
}

function ends_with(string, substring) {
	var i = string.length;
	var j = substring.length;

	if (j > i) {
		return false;
	}

	while (j > 0) {
		i--;
		j--;

		if (string[i] !== substring[j]) {
			return false;
		}
	}

	return true;
}

function is_empty(array) {
	return array.length === 0;
}

function not_empty(array) {
	return array.length > 0;
}
//# sourceMappingURL=helpers.js.map