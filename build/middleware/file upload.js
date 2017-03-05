'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.generate_unique_filename = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// Generates a unique temporary file name inside the `folder` path.
// Returns a Promise resolving to the randomly generated filename.
var generate_unique_filename = exports.generate_unique_filename = function () {
	var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(folder, options) {
		var file_name, exists;
		return _regenerator2.default.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						// 24 bytes for UUID filename
						file_name = _uidSafe2.default.sync(24);

						// Check if a file with such a name exists

						_context3.next = 3;
						return fs_exists(_path2.default.join(folder, file_name));

					case 3:
						exists = _context3.sent;

						if (exists) {
							_context3.next = 6;
							break;
						}

						return _context3.abrupt('return', file_name);

					case 6:

						// If a file with this name already exists, then retry

						if (options.on_collision) {
							options.on_collision(file_name);
						}

						_context3.next = 9;
						return generate_unique_filename(folder, options);

					case 9:
						return _context3.abrupt('return', _context3.sent);

					case 10:
					case 'end':
						return _context3.stop();
				}
			}
		}, _callee3, this);
	}));

	return function generate_unique_filename(_x3, _x4) {
		return _ref3.apply(this, arguments);
	};
}();

// Handles file upload.
// Takes a `file` busboy file object
// along with `upload_folder` option.
// Writes the `file` stream to `upload_folder`
// naming it with a randomly generated filename.
//
// Returns a Promise resolving to the randomly generated filename.
//


var upload_file = function () {
	var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(file, _ref5) {
		var upload_folder = _ref5.upload_folder,
		    log = _ref5.log;
		var file_name, output_file;
		return _regenerator2.default.wrap(function _callee4$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						if (log) {
							log.debug('Uploading: ' + file.filename);
						}

						// Generate random unique filename
						_context4.next = 3;
						return generate_unique_filename(upload_folder, {
							on_collision: function on_collision(file_name) {
								log.info('Generate unique file name: collision for "' + file_name + '". Taking another try.');
							}
						});

					case 3:
						file_name = _context4.sent;


						// dot_extension: path.extname(file.filename)

						output_file = _path2.default.join(upload_folder, file_name);

						// Write the file to disk

						_context4.next = 7;
						return new _promise2.default(function (resolve, reject) {
							// Ensure the `upload_folder` exists
							// (just an extra precaution)
							_fsExtra2.default.ensureDir(upload_folder, function (error) {
								if (error) {
									return reject(error);
								}

								// Open output file stream
								var stream = _fsExtra2.default.createWriteStream(output_file);

								// Pipe file contents to disk
								file.pipe(stream).on('finish', function () {
									return resolve(_path2.default.relative(upload_folder, output_file));
								}).on('error', function (error) {
									return reject(error);
								});
							});
						});

					case 7:
						return _context4.abrupt('return', _context4.sent);

					case 8:
					case 'end':
						return _context4.stop();
				}
			}
		}, _callee4, this);
	}));

	return function upload_file(_x5, _x6) {
		return _ref4.apply(this, arguments);
	};
}();

exports.default = function () {
	for (var _len = arguments.length, parameters = Array(_len), _key = 0; _key < _len; _key++) {
		parameters[_key] = arguments[_key];
	}

	var mount_path = void 0;
	var upload_folder = void 0;
	var options = void 0;
	var log = void 0;

	// New API
	if (typeof parameters[0] === 'string') {
		mount_path = parameters[0];
		upload_folder = parameters[1];
		options = parameters[2];
		log = parameters[3];
	}
	// Old API
	else {
			options = parameters[0];
			log = parameters[1];
			mount_path = options.path || options.mount_path || options.at || '/';
			upload_folder = options.to || options.upload_folder;
		}

	var _options = options,
	    _options$requires_aut = _options.requires_authentication,
	    requires_authentication = _options$requires_aut === undefined ? false : _options$requires_aut,
	    on_file_uploaded = _options.on_file_uploaded,
	    process = _options.process,
	    stream = _options.stream,
	    respond = _options.respond;


	var multiple_files = options.multiple_files || options.multiple;
	var file_size_limit = options.file_size_limit || options.limit;

	return (0, _koaMount2.default)(mount_path, function () {
		var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx) {
			var _this = this;

			var form_data, files, fields, parameters, file_upload_promises, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, file_upload_results, response;

			return _regenerator2.default.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							if (ctx.is('multipart/form-data')) {
								_context2.next = 2;
								break;
							}

							throw new _errors2.default.Unsupported_input_type('This is supposed to be a "multipart/form-data" http request');

						case 2:
							if (!(requires_authentication !== false && !ctx.user)) {
								_context2.next = 4;
								break;
							}

							throw new _errors2.default.Unauthenticated();

						case 4:
							_context2.next = 6;
							return (0, _asyncBusboy2.default)(ctx.req, {
								limits: {
									fileSize: file_size_limit ? (0, _filesizeParser2.default)(file_size_limit) : undefined
								}
							});

						case 6:
							form_data = _context2.sent;


							// This is a non-channel approach, since `chan` package
							// currently doesn't support `async/await`.
							//
							// The consequence is that files are written to disk twice.
							// First, `async-busboy` writes them to disk
							// and waits for that to finish.
							// Second, `upload_file` reads those file streams
							// and writes them to the `upload_folder`.
							//
							// This bug will be fixed once they release
							// a `co-busboy` alternative for Koa 2 (`async/await`).
							// In the meantime I'm using `async-busboy` just to get it working.
							//
							// See:
							// https://github.com/cojs/busboy/issues/30
							// https://github.com/brentburg/chan/pull/18
							//
							// `co-busboy` can be easily rewrote with async channels.
							//
							// Currently it just waits for all files to be written to disk,
							// and then get that `{ files, fields }` result object.
							//
							files = form_data.files, fields = form_data.fields;
							parameters = fields;
							file_upload_promises = [];

							// `co-busboy` asynchronous approach (old code)
							// let form_data_item
							// while (form_data_item = yield form_data) { ... }

							// Synchronous approach (after all files have been uploaded)

							_iteratorNormalCompletion = true;
							_didIteratorError = false;
							_iteratorError = undefined;
							_context2.prev = 13;

							_loop = function _loop() {
								var file = _step.value;

								// Checks if multiple file upload is allowed
								if (!multiple_files && file_upload_promises.not_empty()) {
									throw new Error('Multiple files are being uploaded to a single file upload endpoint');
								}

								// Old `co-busboy` code
								// if (Array.isArray(form_data_item))
								// {
								// 	parameters[form_data_item[0]] = form_data_item[1]
								// 	continue
								// }

								var file_upload_promise = void 0;

								// Custom low-level uploaded stream handling logic
								if (stream) {
									// `file` is a `ReadableStream`.
									//
									// If the resolved value should be later sent back in HTTP response,
									// then `stream` must return a Promise,
									// and also `respond` parameter must not be `false`.
									// The third parameter of the `stream` function is ignored in this case.
									//
									// If the user of this library wants to stream HTTP response instead
									// then the `respond` parameter should be set to `false`
									// and the response data should be streamed to the third parameter
									// of the `stream` function (which is a regular Node.js `http.ServerResponse`)
									// 
									file_upload_promise = stream(file, parameters, ctx.res);
								} else {
									// Upload each file and `process` it (if needed)
									file_upload_promise = upload_file(file, { upload_folder: upload_folder, log: log }).then(function () {
										var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(file_name) {
											var file_path, result;
											return _regenerator2.default.wrap(function _callee$(_context) {
												while (1) {
													switch (_context.prev = _context.next) {
														case 0:
															file_path = _path2.default.join(upload_folder, file_name);

															// Fire `on_file_uploaded` listener

															if (on_file_uploaded) {
																// `ctx.request.ip` trusts X-Forwarded-For HTTP Header
																on_file_uploaded({
																	original_file_name: file.filename,
																	uploaded_file_name: file_name,
																	path: file_path,
																	ip: ctx.request.ip
																}, parameters);
															}

															// `process` the file (if needed), returning a result

															if (!process) {
																_context.next = 6;
																break;
															}

															_context.next = 5;
															return process({
																original_file_name: file.filename,
																uploaded_file_name: file_name,
																path: file_path,
																ip: ctx.request.ip
															}, parameters);

														case 5:
															return _context.abrupt('return', _context.sent);

														case 6:

															// Default result
															result = {
																original_file_name: file.filename,
																uploaded_file_name: file_name
															};
															return _context.abrupt('return', result);

														case 8:
														case 'end':
															return _context.stop();
													}
												}
											}, _callee, _this);
										}));

										return function (_x2) {
											return _ref2.apply(this, arguments);
										};
									}());
								}

								file_upload_promises.push(file_upload_promise);
							};

							for (_iterator = (0, _getIterator3.default)(files); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								_loop();
							}

							// If the `respond` parameter was set to `false`
							// then it means that the user of the library
							// chose to stream HTTP response manually,
							// so write nothing to `ctx.body`
							_context2.next = 22;
							break;

						case 18:
							_context2.prev = 18;
							_context2.t0 = _context2['catch'](13);
							_didIteratorError = true;
							_iteratorError = _context2.t0;

						case 22:
							_context2.prev = 22;
							_context2.prev = 23;

							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}

						case 25:
							_context2.prev = 25;

							if (!_didIteratorError) {
								_context2.next = 28;
								break;
							}

							throw _iteratorError;

						case 28:
							return _context2.finish(25);

						case 29:
							return _context2.finish(22);

						case 30:
							if (!(respond === false)) {
								_context2.next = 32;
								break;
							}

							return _context2.abrupt('return');

						case 32:
							_context2.next = 34;
							return _promise2.default.all(file_upload_promises);

						case 34:
							file_upload_results = _context2.sent;


							// Default HTTP response

							response = void 0;


							if (process) {
								if (multiple_files) {
									response = file_upload_results;
								} else {
									response = file_upload_results[0];
								}
							} else {
								if (multiple_files) {
									response = { files: file_upload_results, parameters: parameters };
								} else {
									response = { file: file_upload_results[0], parameters: parameters };
								}
							}

							// Optionally modify the HTTP response
							if (respond) {
								response = respond.call(this, response);
							}

							// HTTP response
							ctx.body = response;

						case 39:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, this, [[13, 18, 22, 30], [23,, 25, 29]]);
		}));

		return function (_x) {
			return _ref.apply(this, arguments);
		};
	}());
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _asyncBusboy = require('async-busboy');

var _asyncBusboy2 = _interopRequireDefault(_asyncBusboy);

var _filesizeParser = require('filesize-parser');

var _filesizeParser2 = _interopRequireDefault(_filesizeParser);

var _koaMount = require('koa-mount');

var _koaMount2 = _interopRequireDefault(_koaMount);

var _uidSafe = require('uid-safe');

var _uidSafe2 = _interopRequireDefault(_uidSafe);

var _promisify = require('../promisify');

var _promisify2 = _interopRequireDefault(_promisify);

var _errors = require('../errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Checks if the filesystem `path` exists.
// Returns a Promise resolving to either `true` or `false`.
function fs_exists(path) {
	return new _promise2.default(function (resolve, reject) {
		_fsExtra2.default.exists(path, function (exists) {
			return resolve(exists);
		});
	});
}

// https://github.com/cojs/busboy/issues/30
// https://github.com/brentburg/chan/pull/18
//# sourceMappingURL=file upload.js.map