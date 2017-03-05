/**!
 * koa-generic-session - lib/memory_store.js
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

var debug = require('debug')('koa-generic-session:memory_store');

var MemoryStore = module.exports = function () {
  this.sessions = {};
};

MemoryStore.prototype.get = _regenerator2.default.mark(function _callee(sid) {
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          debug('get value %j with key %s', this.sessions[sid], sid);
          return _context.abrupt('return', this.sessions[sid]);

        case 2:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this);
});

MemoryStore.prototype.set = _regenerator2.default.mark(function _callee2(sid, val) {
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          debug('set value %j for key %s', val, sid);
          this.sessions[sid] = val;

        case 2:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, this);
});

MemoryStore.prototype.destroy = _regenerator2.default.mark(function _callee3(sid) {
  return _regenerator2.default.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          delete this.sessions[sid];

        case 1:
        case 'end':
          return _context3.stop();
      }
    }
  }, _callee3, this);
});
//# sourceMappingURL=memory_store.js.map