'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = function (redis_options) {
	throw new Error('Session support is currently turned off. Try using JSON Web Tokens to store session data instead.');

	var ttl = 15 * 60 * 1000; // 15 minutes // session timeout, in seconds

	if (redis_options) {
		var generate_id = function generate_id() {
			return _uidSafe2.default.sync(24); // 24 is "byte length"; string length is 32 symbols
		};

		var is_unique = function () {
			var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(id) {
				return _regenerator2.default.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								_context.next = 2;
								return (0, _promisify2.default)(redis_client.exists, redis_client)(prefix + id);

							case 2:
								return _context.abrupt('return', !_context.sent);

							case 3:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this);
			}));

			return function is_unique(_x) {
				return _ref.apply(this, arguments);
			};
		}();

		var generate_unique_id = function () {
			var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
				var id;
				return _regenerator2.default.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								id = generate_id();
								_context2.next = 3;
								return is_unique(id);

							case 3:
								if (!_context2.sent) {
									_context2.next = 5;
									break;
								}

								return _context2.abrupt('return', id);

							case 5:
								return _context2.abrupt('return', generate_unique_id());

							case 6:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, this);
			}));

			return function generate_unique_id() {
				return _ref2.apply(this, arguments);
			};
		}();

		var redis_client = require('redis').createClient({
			host: redis_options.redis.host,
			port: redis_options.redis.port,
			auth_pass: redis_options.redis.password // auth_pass
		});

		var prefix = 'user:session:';

		return koa_convert(session({
			key: 'session:id',
			prefix: prefix,
			cookie: {
				maxAge: ttl
			},
			ttl: ttl,
			genSid: generate_unique_id,
			store: redis_store({
				client: redis_client
			})
		}));
	} else {
		return koa_convert(session({
			key: 'session:id',
			// ttl,
			cookie: {
				maxAge: ttl
			}
		}));
	}
};

var _uidSafe = require('uid-safe');

var _uidSafe2 = _interopRequireDefault(_uidSafe);

var _promisify = require('../promisify');

var _promisify2 = _interopRequireDefault(_promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default']; // import koa_convert   from 'koa-convert'
//
// import session       from 'koa-generic-session'
// import redis_store   from 'koa-redis'
//
// // forked from the original repo as of 25.01.2016
// // https://github.com/halt-hammerzeit/generic-session
// import session       from './koa-generic-session'
// // forked from the original repo as of 25.01.2016
// // https://github.com/halt-hammerzeit/koa-redis
// import redis_store   from './koa-redis'
//
// npm install koa-convert copy-to@2 crc@3 debug@2 parseurl@1 --save
//# sourceMappingURL=session.js.map