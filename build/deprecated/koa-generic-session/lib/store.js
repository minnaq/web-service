/**!
 * koa-generic-session - lib/store.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

'use strict';

/**
 * Module dependencies.
 */

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('koa-generic-session:store');
var copy = require('copy-to');

var defaultOptions = {
  prefix: 'koa:sess:'
};

function Store(client, options) {
  this.client = client;
  this.options = {};
  copy(options).and(defaultOptions).to(this.options);
  EventEmitter.call(this);

  // delegate client connect / disconnect event
  if (typeof client.on === 'function') {
    client.on('disconnect', this.emit.bind(this, 'disconnect'));
    client.on('connect', this.emit.bind(this, 'connect'));
  }
}

util.inherits(Store, EventEmitter);

Store.prototype.get = _regenerator2.default.mark(function _callee(sid) {
  var data;
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          sid = this.options.prefix + sid;
          debug('GET %s', sid);
          _context.next = 4;
          return this.client.get(sid);

        case 4:
          data = _context.sent;

          if (data) {
            _context.next = 8;
            break;
          }

          debug('GET empty');
          return _context.abrupt('return', null);

        case 8:
          if (data && data.cookie && typeof data.cookie.expires === 'string') {
            // make sure data.cookie.expires is a Date
            data.cookie.expires = new Date(data.cookie.expires);
          }
          debug('GOT %j', data);
          return _context.abrupt('return', data);

        case 11:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this);
});

Store.prototype.set = _regenerator2.default.mark(function _callee2(sid, sess) {
  var ttl;
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          sid = this.options.prefix + sid;
          ttl = this.ttl();

          debug('SET key: %s, value: %s, ttl: %d', sid, sess, ttl);
          _context2.next = 5;
          return this.client.set(sid, sess, ttl);

        case 5:
          debug('SET complete');

        case 6:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, this);
});

Store.prototype.destroy = _regenerator2.default.mark(function _callee3(sid) {
  return _regenerator2.default.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          sid = this.options.prefix + sid;
          debug('DEL %s', sid);
          _context3.next = 4;
          return this.client.destroy(sid);

        case 4:
          debug('DEL %s complete', sid);

        case 5:
        case 'end':
          return _context3.stop();
      }
    }
  }, _callee3, this);
});

Store.prototype.bump = _regenerator2.default.mark(function _callee4(sid) {
  var ttl;
  return _regenerator2.default.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (this.client.bump) {
            _context4.next = 2;
            break;
          }

          return _context4.abrupt('return', debug('BUMP not implemented'));

        case 2:
          sid = this.options.prefix + sid;
          ttl = this.ttl();

          debug('BUMP %s, ttl: %d', sid, ttl);
          _context4.next = 7;
          return this.client.bump(sid, ttl);

        case 7:
          debug('BUMP complete');

        case 8:
        case 'end':
          return _context4.stop();
      }
    }
  }, _callee4, this);
});

Store.prototype.ttl = function () {
  var ttl = this.options.ttl;
  if (!ttl) {
    var maxage = this.options.cookie && this.options.cookie.maxage;
    if (typeof maxage === 'number') {
      ttl = maxage;
    }
    // if has cookie.expires, ignore cookie.maxage
    if (this.options.cookie && this.options.cookie.expires) {
      ttl = Math.ceil(this.options.cookie.expires.getTime() - Date.now());
    }
  }
  return ttl;
};

module.exports = Store;
//# sourceMappingURL=store.js.map