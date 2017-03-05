/**!
 * koa-generic-session - lib/session.js
 * Copyright(c) 2013 - 2014
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

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('koa-generic-session:session');
var MemoryStore = require('./memory_store');
var crc32 = require('crc').crc32;
var parse = require('parseurl');
var Store = require('./store');
var copy = require('copy-to');
var uid = require('uid-safe');

/**
 * Warning message for `MemoryStore` usage in production.
 */

var warning = 'Warning: koa-generic-session\'s MemoryStore is not\n' + 'designed for a production environment, as it will leak\n' + 'memory, and will not scale past a single process.';

var defaultCookie = {
  httpOnly: true,
  path: '/',
  overwrite: true,
  signed: true,
  maxAge: 24 * 60 * 60 * 1000 //one day in ms
};

/**
 * setup session store with the given `options`
 * @param {Object} options
 *   - [`key`] cookie name, defaulting to `koa.sid`
 *   - [`store`] session store instance, default to MemoryStore
 *   - [`ttl`] store ttl in `ms`, default to oneday
 *   - [`prefix`] session prefix for store, defaulting to `koa:sess:`
 *   - [`cookie`] session cookie settings, defaulting to
 *     {path: '/', httpOnly: true, maxAge: null, rewrite: true, signed: true}
 *   - [`defer`] defer get session,
 *   - [`rolling`]  rolling session, always reset the cookie and sessions, default is false
 *     you should `yield this.session` to get the session if defer is true, default is false
 *   - [`genSid`] you can use your own generator for sid
 *   - [`errorHanlder`] handler for session store get or set error
 *   - [`valid`] valid(ctx, session), valid session value before use it
 *   - [`beforeSave`] beforeSave(ctx, session), hook before save session
 *   - [`sessionIdStore`] object with get, set, reset methods for passing session id throw requests.
 */

module.exports = function (options) {
  var _marked = [getSession, refreshSession, session, deferSession].map(_regenerator2.default.mark);

  options = options || {};
  var key = options.key || 'koa.sid';
  var client = options.store || new MemoryStore();
  var errorHandler = options.errorHandler || defaultErrorHanlder;
  var reconnectTimeout = options.reconnectTimeout || 10000;

  var cookie = options.cookie || {};
  copy(defaultCookie).to(cookie);
  compatMaxage(cookie);

  var store = new Store(client, {
    ttl: options.ttl,
    prefix: options.prefix,
    cookie: cookie
  });

  var genSid = options.genSid || uid.sync;
  var valid = options.valid || noop;
  var beforeSave = options.beforeSave || noop;

  var storeStatus = 'available';
  var waitStore = _promise2.default.resolve();

  // notify user that this store is not
  // meant for a production environment
  if ('production' === process.env.NODE_ENV && client instanceof MemoryStore) console.warn(warning);

  var sessionIdStore = options.sessionIdStore || {

    get: function get() {
      return this.cookies.get(key, cookie);
    },

    set: function set(sid, session) {
      this.cookies.set(key, sid, cookie);
    },

    reset: function reset() {
      this.cookies.set(key, null);
      this.cookies.set(key + '.sig', null);
    }
  };

  store.on('disconnect', function () {
    if (storeStatus !== 'available') return;
    storeStatus = 'pending';
    waitStore = new _promise2.default(function (resolve, reject) {
      setTimeout(function () {
        if (storeStatus === 'pending') storeStatus = 'unavailable';
        reject(new Error('session store is unavailable'));
      }, reconnectTimeout);
      store.once('connect', resolve);
    });
  });

  store.on('connect', function () {
    storeStatus = 'available';
    waitStore = _promise2.default.resolve();
  });

  // save empty session hash for compare
  var EMPTY_SESSION_HASH = hash(generateSession());

  return options.defer ? deferSession : session;

  /**
   * generate a new session
   */
  function generateSession() {
    var session = {};
    // //you can alter the cookie options in nexts
    // session.cookie = {};
    // for (let prop in cookie) {
    //   session.cookie[prop] = cookie[prop];
    // }
    // compatMaxage(session.cookie);
    return session;
  }

  /**
   * check url match cookie's path
   */
  function matchPath(ctx) {
    var pathname = parse(ctx).pathname;
    if (pathname.indexOf(cookie.path || '/') !== 0) {
      debug('cookie path not match');
      return false;
    }
    return true;
  }

  /**
   * get session from store
   *   get sessionId from cookie
   *   save sessionId into context
   *   get session from store
   */
  function getSession() {
    var session, isNew, originalHash;
    return _regenerator2.default.wrap(function getSession$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (matchPath(this)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return');

          case 2:
            if (!(storeStatus === 'pending')) {
              _context.next = 8;
              break;
            }

            debug('store is disconnect and pending');
            _context.next = 6;
            return waitStore;

          case 6:
            _context.next = 11;
            break;

          case 8:
            if (!(storeStatus === 'unavailable')) {
              _context.next = 11;
              break;
            }

            debug('store is unavailable');
            throw new Error('session store is unavailable');

          case 11:

            if (!this.sessionId) {
              this.sessionId = sessionIdStore.get.call(this);
            }

            session = void 0;
            isNew = false;

            if (this.sessionId) {
              _context.next = 23;
              break;
            }

            debug('session id not exist, generate a new one');
            session = generateSession();
            _context.next = 19;
            return _promise2.default.resolve(genSid.call(this, 24));

          case 19:
            this.sessionId = _context.sent;

            isNew = true;
            _context.next = 33;
            break;

          case 23:
            _context.prev = 23;
            _context.next = 26;
            return store.get(this.sessionId);

          case 26:
            session = _context.sent;

            debug('get session %j with key %s', session, this.sessionId);
            _context.next = 33;
            break;

          case 30:
            _context.prev = 30;
            _context.t0 = _context['catch'](23);

            if (_context.t0.code === 'ENOENT') {
              debug('get session error, code = ENOENT');
            } else {
              debug('get session error: ', _context.t0.message);
              errorHandler(_context.t0, 'get', this);
            }

          case 33:
            if (!(!session || !valid(this, session))) {
              _context.next = 41;
              break;
            }

            debug('session is empty or invalid');
            session = generateSession();
            _context.next = 38;
            return _promise2.default.resolve(genSid.call(this, 24));

          case 38:
            this.sessionId = _context.sent;

            sessionIdStore.reset.call(this);
            isNew = true;

          case 41:

            // get the originHash
            originalHash = !isNew && hash(session);
            return _context.abrupt('return', {
              originalHash: originalHash,
              session: session,
              isNew: isNew
            });

          case 43:
          case 'end':
            return _context.stop();
        }
      }
    }, _marked[0], this, [[23, 30]]);
  }

  /**
   * after everything done, refresh the session
   *   if session === null; delete it from store
   *   if session is modified, update cookie and store
   *   if session is not modified, update cookie maxAge and store TTL
   */
  function refreshSession(session, originalHash, isNew) {
    var newHash;
    return _regenerator2.default.wrap(function refreshSession$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (session) {
              _context2.next = 8;
              break;
            }

            if (isNew) {
              _context2.next = 7;
              break;
            }

            debug('session set to null, destroy session: %s', this.sessionId);
            sessionIdStore.reset.call(this);
            _context2.next = 6;
            return store.destroy(this.sessionId);

          case 6:
            return _context2.abrupt('return', _context2.sent);

          case 7:
            return _context2.abrupt('return', debug('a new session and set to null, ignore destroy'));

          case 8:
            newHash = hash(session);
            // if new session and not modified, just ignore

            if (!(!options.allowEmpty && isNew && newHash === EMPTY_SESSION_HASH)) {
              _context2.next = 11;
              break;
            }

            return _context2.abrupt('return', debug('new session and do not modified'));

          case 11:
            if (!options.rolling) {
              _context2.next = 13;
              break;
            }

            return _context2.abrupt('return');

          case 13:
            if (!(newHash === originalHash)) {
              _context2.next = 27;
              break;
            }

            debug('session not modified');

            // prolong session: update session TTL and session cookie maxAge
            _context2.prev = 15;
            _context2.next = 18;
            return store.bump(this.sessionId);

          case 18:
            sessionIdStore.set.call(this, this.sessionId, session);
            debug('session prolonged');
            _context2.next = 26;
            break;

          case 22:
            _context2.prev = 22;
            _context2.t0 = _context2['catch'](15);

            debug('prolong session error: ', _context2.t0.message);
            errorHandler(_context2.t0, 'prolong', this);

          case 26:
            return _context2.abrupt('return');

          case 27:

            debug('session modified');

            // custom before save hook
            beforeSave(this, session);

            //update session
            _context2.prev = 29;
            _context2.next = 32;
            return store.set(this.sessionId, session);

          case 32:
            sessionIdStore.set.call(this, this.sessionId, session);
            debug('saved');
            _context2.next = 40;
            break;

          case 36:
            _context2.prev = 36;
            _context2.t1 = _context2['catch'](29);

            debug('set session error: ', _context2.t1.message);
            errorHandler(_context2.t1, 'set', this);

          case 40:
          case 'end':
            return _context2.stop();
        }
      }
    }, _marked[1], this, [[15, 22], [29, 36]]);
  }

  /**
   * common session middleware
   * each request will generate a new session
   *
   * ```
   * let session = this.session;
   * ```
   */
  function session(next) {
    var result;
    return _regenerator2.default.wrap(function session$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            this.sessionStore = store;

            if (!this._session) {
              _context4.next = 5;
              break;
            }

            _context4.next = 4;
            return next;

          case 4:
            return _context4.abrupt('return', _context4.sent);

          case 5:
            _context4.next = 7;
            return getSession.call(this);

          case 7:
            result = _context4.sent;

            if (result) {
              _context4.next = 12;
              break;
            }

            _context4.next = 11;
            return next;

          case 11:
            return _context4.abrupt('return', _context4.sent);

          case 12:

            this._session = result.session;

            // more flexible
            this.__defineGetter__('session', function () {
              return this._session;
            });

            this.__defineSetter__('session', function (sess) {
              this._session = sess;
            });

            this.regenerateSession = _regenerator2.default.mark(function regenerateSession() {
              return _regenerator2.default.wrap(function regenerateSession$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      debug('regenerating session');

                      if (result.isNew) {
                        _context3.next = 5;
                        break;
                      }

                      // destroy the old session
                      debug('destroying previous session');
                      _context3.next = 5;
                      return store.destroy(this.sessionId);

                    case 5:

                      this.session = generateSession();
                      this.sessionId = genSid.call(this, 24);
                      sessionIdStore.reset.call(this);

                      debug('created new session: %s', this.sessionId);
                      result.isNew = true;

                    case 10:
                    case 'end':
                      return _context3.stop();
                  }
                }
              }, regenerateSession, this);
            });

            _context4.next = 18;
            return next;

          case 18:
            _context4.next = 20;
            return refreshSession.call(this, this.session, result.originalHash, result.isNew);

          case 20:
          case 'end':
            return _context4.stop();
        }
      }
    }, _marked[2], this);
  }

  /**
   * defer session middleware
   * only generate and get session when request use session
   *
   * ```
   * let session = yield this.session;
   * ```
   */
  function deferSession(next) {
    var isNew, originalHash, touchSession, getter;
    return _regenerator2.default.wrap(function deferSession$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            this.sessionStore = store;

            if (!this.session) {
              _context7.next = 5;
              break;
            }

            _context7.next = 4;
            return next;

          case 4:
            return _context7.abrupt('return', _context7.sent);

          case 5:
            isNew = false;
            originalHash = null;
            touchSession = false;
            getter = false;

            // if path not match

            if (matchPath(this)) {
              _context7.next = 13;
              break;
            }

            _context7.next = 12;
            return next;

          case 12:
            return _context7.abrupt('return', _context7.sent);

          case 13:

            this.__defineGetter__('session', _regenerator2.default.mark(function _callee() {
              var result;
              return _regenerator2.default.wrap(function _callee$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      if (!touchSession) {
                        _context5.next = 2;
                        break;
                      }

                      return _context5.abrupt('return', this._session);

                    case 2:
                      touchSession = true;
                      getter = true;

                      _context5.next = 6;
                      return getSession.call(this);

                    case 6:
                      result = _context5.sent;

                      if (result) {
                        _context5.next = 9;
                        break;
                      }

                      return _context5.abrupt('return');

                    case 9:

                      originalHash = result.originalHash;
                      isNew = result.isNew;
                      this._session = result.session;
                      return _context5.abrupt('return', this._session);

                    case 13:
                    case 'end':
                      return _context5.stop();
                  }
                }
              }, _callee, this);
            }));

            this.__defineSetter__('session', function (value) {
              touchSession = true;
              this._session = value;
            });

            this.regenerateSession = _regenerator2.default.mark(function regenerateSession() {
              return _regenerator2.default.wrap(function regenerateSession$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      debug('regenerating session');
                      // make sure that the session has been loaded
                      _context6.next = 3;
                      return this.session;

                    case 3:
                      if (isNew) {
                        _context6.next = 7;
                        break;
                      }

                      // destroy the old session
                      debug('destroying previous session');
                      _context6.next = 7;
                      return store.destroy(this.sessionId);

                    case 7:

                      this._session = generateSession();
                      this.sessionId = genSid.call(this, 24);
                      sessionIdStore.reset.call(this);
                      debug('created new session: %s', this.sessionId);
                      isNew = true;
                      return _context6.abrupt('return', this._session);

                    case 13:
                    case 'end':
                      return _context6.stop();
                  }
                }
              }, regenerateSession, this);
            });

            _context7.next = 18;
            return next;

          case 18:
            if (!touchSession) {
              _context7.next = 22;
              break;
            }

            // if only this.session=, need try to decode and get the sessionID
            if (!getter) {
              this.sessionId = sessionIdStore.get.call(this);
            }

            _context7.next = 22;
            return refreshSession.call(this, this._session, originalHash, isNew);

          case 22:
          case 'end':
            return _context7.stop();
        }
      }
    }, _marked[3], this);
  }
};

/**
 * get the hash of a session include cookie options.
 */
function hash(sess) {
  return crc32.signed((0, _stringify2.default)(sess));
}

/**
 * cookie use maxage, hack to compat connect type `maxAge`
 */
function compatMaxage(opts) {
  if (opts) {
    opts.maxage = opts.maxage === undefined ? opts.maxAge : opts.maxage;
    delete opts.maxAge;
  }
}

module.exports.MemoryStore = MemoryStore;

function defaultErrorHanlder(err, type, ctx) {
  err.name = 'koa-generic-session ' + type + ' error';
  throw err;
}

function noop() {
  return true;
}
//# sourceMappingURL=session.js.map