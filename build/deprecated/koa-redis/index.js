/**!
 * koa-redis - index.js
 * Copyright(c) 2015
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

'use strict';

/**
 * Module dependencies.
 */

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('koa-redis');
var redis = require('redis');
var redisWrapper = require('co-redis');
var util = require('util');

/**
 * Initialize redis session middleware with `opts` (see the README for more info):
 *
 * @param {Object} options
 *   - {Object} client       redis client (overides all other options except db and duplicate)
 *   - {String} socket       redis connect socket (DEPRECATED: use 'path' instead)
 *   - {String} db           redis db
 *   - {Boolean} duplicate   if own client object, will use node redis's duplicate function and pass other options
 *   - {String} pass         redis password (DEPRECATED: use 'auth_pass' instead)
 *   - {Any} [any]           all other options inclduing above are passed to node_redis
 */
var RedisStore = module.exports = function (options) {
  if (!(this instanceof RedisStore)) {
    return new RedisStore(options);
  }
  EventEmitter.call(this);
  options = options || {};

  var client;
  options.auth_pass = options.auth_pass || options.pass || null; // For backwards compatibility
  options.path = options.path || options.socket || null; // For backwards compatibility
  if (!options.client) {
    debug('Init redis new client');
    client = redis.createClient(options);
  } else {
    if (options.duplicate) {
      // Duplicate client and update with options provided
      debug('Duplicating provided client with new options (if provided)');
      var dupClient = options.client;
      delete options.client;
      delete options.duplicate;
      client = dupClient.duplicate(options); // Useful if you want to use the DB option without adjusting the client DB outside koa-redis
    } else {
      debug('Using provided client');
      client = options.client;
    }
  }

  if (options.db) {
    debug('selecting db %s', options.db);
    client.select(options.db);
    client.on('connect', function () {
      client.send_anyways = true;
      client.select(options.db);
      client.send_anyways = false;
    });
  }

  client.on('error', this.emit.bind(this, 'error'));
  client.on('end', this.emit.bind(this, 'end'));
  client.on('end', this.emit.bind(this, 'disconnect')); // For backwards compatibility
  client.on('connect', this.emit.bind(this, 'connect'));
  client.on('reconnecting', this.emit.bind(this, 'reconnecting'));
  client.on('ready', this.emit.bind(this, 'ready'));
  client.on('drain', this.emit.bind(this, 'drain'));
  client.on('idle', this.emit.bind(this, 'idle'));
  this.on('connect', function () {
    debug('connected to redis');
    this.connected = client.connected;
  });
  this.on('ready', function () {
    debug('redis ready');
  });
  this.on('end', function () {
    debug('redis ended');
    this.connected = client.connected;
  });
  // No good way to test error
  /* istanbul ignore next */
  this.on('error', function () {
    debug('redis error');
    this.connected = client.connected;
  });
  // No good way to test reconnect
  /* istanbul ignore next */
  this.on('reconnecting', function () {
    debug('redis reconnecting');
    this.connected = client.connected;
  });
  this.on('drain', function () {
    debug('redis drain');
    this.connected = client.connected;
  });
  this.on('idle', function () {
    debug('redis idle');
    this.connected = client.connected;
  });

  //wrap redis
  this._redisClient = client;
  this.client = redisWrapper(client);
  this.connected = client.connected;
};

util.inherits(RedisStore, EventEmitter);

RedisStore.prototype.get = _regenerator2.default.mark(function _callee(sid) {
  var data;
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return this.client.get(sid);

        case 2:
          data = _context.sent;

          debug('get session: %s', data || 'none');

          if (data) {
            _context.next = 6;
            break;
          }

          return _context.abrupt('return', null);

        case 6:
          _context.prev = 6;
          return _context.abrupt('return', JSON.parse(data.toString()));

        case 10:
          _context.prev = 10;
          _context.t0 = _context['catch'](6);

          // ignore err
          debug('parse session error: %s', _context.t0.message);

        case 13:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this, [[6, 10]]);
});

RedisStore.prototype.set = _regenerator2.default.mark(function _callee2(sid, sess, ttl) {
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (typeof ttl === 'number') {
            ttl = Math.ceil(ttl / 1000);
          }
          sess = (0, _stringify2.default)(sess);

          if (!ttl) {
            _context2.next = 8;
            break;
          }

          debug('SETEX %s %s %s', sid, ttl, sess);
          _context2.next = 6;
          return this.client.setex(sid, ttl, sess);

        case 6:
          _context2.next = 11;
          break;

        case 8:
          debug('SET %s %s', sid, sess);
          _context2.next = 11;
          return this.client.set(sid, sess);

        case 11:
          debug('SET %s complete', sid);

        case 12:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, this);
});

RedisStore.prototype.destroy = _regenerator2.default.mark(function _callee3(sid) {
  return _regenerator2.default.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          debug('DEL %s', sid);
          _context3.next = 3;
          return this.client.del(sid);

        case 3:
          debug('DEL %s complete', sid);

        case 4:
        case 'end':
          return _context3.stop();
      }
    }
  }, _callee3, this);
});

RedisStore.prototype.bump = _regenerator2.default.mark(function _callee4(sid, ttl) {
  return _regenerator2.default.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (typeof ttl === 'number') {
            ttl = Math.ceil(ttl / 1000);
          }
          debug('EXPIRE %s %s', sid, ttl);
          _context4.next = 4;
          return this.client.expire(sid, ttl);

        case 4:
          debug('EXPIRE %s %s complete', sid, ttl);

        case 5:
        case 'end':
          return _context4.stop();
      }
    }
  }, _callee4, this);
});

RedisStore.prototype.quit = _regenerator2.default.mark(function _callee5() {
  return _regenerator2.default.wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // End connection SAFELY
          debug('quitting redis client');
          _context5.next = 3;
          return this.client.quit();

        case 3:
        case 'end':
          return _context5.stop();
      }
    }
  }, _callee5, this);
});

RedisStore.prototype.end = RedisStore.prototype.quit; // End connection SAFELY. The real end() command should never be used, as it cuts off to queue.
//# sourceMappingURL=index.js.map