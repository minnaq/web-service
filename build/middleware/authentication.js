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

// Looks for JWT token, and if it is found, sets some variables.
var authenticate = function () {
	var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2) {
		var _this = this;

		var authentication = _ref2.authentication,
		    keys = _ref2.keys,
		    validate_token = _ref2.validate_token;

		var _get_jwt_token, token, error, payload, user_id, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, secret, jwt_id, is_valid;

		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						// Get JWT token from incoming HTTP request
						_get_jwt_token = get_jwt_token(this), token = _get_jwt_token.token, error = _get_jwt_token.error;

						// Little helpers which can be called from routes to ensure
						// a logged in user or a specific user role

						this.authenticate = function () {
							throw new _errors2.default.Unauthenticated();
						};
						this.role = function () {
							throw new _errors2.default.Unauthenticated();
						};

						payload = void 0, user_id = void 0;

						if (!token) {
							_context.next = 56;
							break;
						}

						// If no JWT token was found, then done
						// if (!token)
						// {
						// 	this.authentication_error = new errors.Unauthenticated(error)
						// 	return
						// }

						// JWT token (is now accessible from Koa's `ctx`)
						this.jwt = token;

						// Verify JWT token integrity
						// by checking its signature using the supplied `keys`

						// let payload

						_iteratorNormalCompletion = true;
						_didIteratorError = false;
						_iteratorError = undefined;
						_context.prev = 9;
						_iterator = (0, _getIterator3.default)(keys);

					case 11:
						if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
							_context.next = 29;
							break;
						}

						secret = _step.value;
						_context.prev = 13;

						payload = _jsonwebtoken2.default.verify(token, secret);
						return _context.abrupt('break', 29);

					case 18:
						_context.prev = 18;
						_context.t0 = _context['catch'](13);

						if (!(_context.t0.name === 'TokenExpiredError')) {
							_context.next = 23;
							break;
						}

						this.authentication_error = new _errors2.default.Unauthenticated('Token expired');
						return _context.abrupt('return');

					case 23:
						if (!(_context.t0.name === 'JsonWebTokenError')) {
							_context.next = 25;
							break;
						}

						return _context.abrupt('continue', 26);

					case 25:
						throw _context.t0;

					case 26:
						_iteratorNormalCompletion = true;
						_context.next = 11;
						break;

					case 29:
						_context.next = 35;
						break;

					case 31:
						_context.prev = 31;
						_context.t1 = _context['catch'](9);
						_didIteratorError = true;
						_iteratorError = _context.t1;

					case 35:
						_context.prev = 35;
						_context.prev = 36;

						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}

					case 38:
						_context.prev = 38;

						if (!_didIteratorError) {
							_context.next = 41;
							break;
						}

						throw _iteratorError;

					case 41:
						return _context.finish(38);

					case 42:
						return _context.finish(35);

					case 43:
						if (payload) {
							_context.next = 46;
							break;
						}

						this.authentication_error = new _errors2.default.Unauthenticated('Corrupt token');
						return _context.abrupt('return');

					case 46:

						// JWT token ID
						jwt_id = payload.jti;

						// `subject`
						// (which is a user id)
						// const user_id = payload.sub

						user_id = payload.sub;

						// Optional JWT token validation (by id)
						// (for example, that it has not been revoked)

						if (!validate_token) {
							_context.next = 55;
							break;
						}

						_context.next = 51;
						return validate_token(token, this);

					case 51:
						is_valid = _context.sent.valid;

						if (is_valid) {
							_context.next = 55;
							break;
						}

						this.authentication_error = new _errors2.default.Unauthenticated('Token revoked');
						return _context.abrupt('return');

					case 55:

						// JWT token ID is now accessible via Koa's `ctx`
						this.jwt_id = jwt_id;

					case 56:
						if (!authentication) {
							_context.next = 62;
							break;
						}

						_context.next = 59;
						return authentication(payload, this);

					case 59:
						_context.t2 = _context.sent;
						_context.next = 63;
						break;

					case 62:
						_context.t2 = {};

					case 63:
						this.user = _context.t2;


						// Sets user id
						this.user.id = user_id;

						// Extra payload fields:
						//
						// 'iss' // Issuer
						// 'sub' // Subject
						// 'aud' // Audience
						// 'exp' // Expiration time
						// 'nbf' // Not before
						// 'iat' // Issued at
						// 'jti' // JWT ID

						// JWT token payload is accessible via Koa's `ctx`
						this.token_data = payload;

						// The user is assumed authenticated now,
						// so `this.authenticate()` helper won't throw an exception.
						// (and will return the `user`)
						this.authenticate = function () {
							return _this.user;
						};

						// A little helper which can be called from routes
						// as `this.role('administrator')`
						// which will throw if the user isn't administrator
						// (`authentication` function needs to get
						//  `role` from JWT payload for this to work)
						this.role = function () {
							for (var _len = arguments.length, roles = Array(_len), _key = 0; _key < _len; _key++) {
								roles[_key] = arguments[_key];
							}

							var _iteratorNormalCompletion2 = true;
							var _didIteratorError2 = false;
							var _iteratorError2 = undefined;

							try {
								for (var _iterator2 = (0, _getIterator3.default)(roles), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
									var role = _step2.value;

									if (_this.user.role === role) {
										return true;
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

							throw new _errors2.default.Unauthorized('One of the following roles is required: ' + roles);
						};

						// tim huang 修改于 2017-03-03
						return _context.abrupt('return', this.user.isValid !== false);

					case 69:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this, [[9, 31, 35, 43], [13, 18], [36,, 38, 42]]);
	}));

	return function authenticate(_x) {
		return _ref.apply(this, arguments);
	};
}();

// Koa middleware creator


exports.default = function (options) {
	// Koa middleware
	return function () {
		var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
			var isAuth;
			return _regenerator2.default.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_context2.next = 2;
							return authenticate.call(ctx, options);

						case 2:
							isAuth = _context2.sent;

							if (!isAuth) {
								_context2.next = 6;
								break;
							}

							_context2.next = 6;
							return next();

						case 6:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, this);
		}));

		return function (_x2, _x3) {
			return _ref3.apply(this, arguments);
		};
	}();
};

exports.issue_jwt_token = issue_jwt_token;

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _errors = require('../errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Looks for JWT token inside HTTP Authorization header
function get_jwt_token(context) {
	// Parses "Authorization: Bearer ${token}"
	if (context.header.authorization) {
		var match = context.header.authorization.match(/^Bearer (.+)$/i);

		if (match) {
			return { token: match[1] };
		}

		// return { error: 'Bad Authorization header format. Format is "Authorization: Bearer <token>"' }
	}

	// (doesn't read cookies anymore to protect users from CSRF attacks)
	// // Tries the "authentication" cookie
	// if (context.cookies.get('authentication'))
	// {
	// 	return { token: context.cookies.get('authentication') }
	// }

	// No JWT token was found
	return { error: 'JWT token not found: no "Authorization: Bearer {token}" HTTP header specified.' };
}

// Generates and signs a JWT token
function issue_jwt_token(_ref4) {
	var payload = _ref4.payload,
	    keys = _ref4.keys,
	    user_id = _ref4.user_id,
	    jwt_id = _ref4.jwt_id;

	if (arguments.length !== 1) {
		throw new Error("`jwt` function must take a single argument: an object { payload, keys, user_id, jwt_id }");
	}

	if (!keys) {
		throw new Error('JWT encryption "keys" weren\'t supplied');
	}

	var token = _jsonwebtoken2.default.sign(payload, keys[0], {
		subject: user_id,
		jwtid: jwt_id
	});

	return token;
}
//# sourceMappingURL=authentication.js.map