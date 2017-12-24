webpackJsonp([6,4],{

/***/ 13:
/***/ (function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ }),

/***/ 14:
/***/ (function(module, exports) {

	module.exports = function normalizeComponent (
	  rawScriptExports,
	  compiledTemplate,
	  scopeId,
	  cssModules
	) {
	  var esModule
	  var scriptExports = rawScriptExports = rawScriptExports || {}

	  // ES6 modules interop
	  var type = typeof rawScriptExports.default
	  if (type === 'object' || type === 'function') {
	    esModule = rawScriptExports
	    scriptExports = rawScriptExports.default
	  }

	  // Vue.extend constructor export interop
	  var options = typeof scriptExports === 'function'
	    ? scriptExports.options
	    : scriptExports

	  // render functions
	  if (compiledTemplate) {
	    options.render = compiledTemplate.render
	    options.staticRenderFns = compiledTemplate.staticRenderFns
	  }

	  // scopedId
	  if (scopeId) {
	    options._scopeId = scopeId
	  }

	  // inject cssModules
	  if (cssModules) {
	    var computed = options.computed || (options.computed = {})
	    Object.keys(cssModules).forEach(function (key) {
	      var module = cssModules[key]
	      computed[key] = function () { return module }
	    })
	  }

	  return {
	    esModule: esModule,
	    exports: scriptExports,
	    options: options
	  }
	}


/***/ }),

/***/ 15:
/***/ (function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if (media) {
			styleElement.setAttribute("media", media);
		}

		if (sourceMap) {
			// https://developer.chrome.com/devtools/docs/javascript-debugging
			// this makes source maps inside style tags work properly in Chrome
			css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */';
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}


/***/ }),

/***/ 148:
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, setImmediate) {/*!
	 * Vue.js v2.5.2
	 * (c) 2014-2017 Evan You
	 * Released under the MIT License.
	 */
	'use strict';

	/*  */

	// these helpers produces better vm code in JS engines due to their
	// explicitness and function inlining
	function isUndef (v) {
	  return v === undefined || v === null
	}

	function isDef (v) {
	  return v !== undefined && v !== null
	}

	function isTrue (v) {
	  return v === true
	}

	function isFalse (v) {
	  return v === false
	}

	/**
	 * Check if value is primitive
	 */
	function isPrimitive (value) {
	  return (
	    typeof value === 'string' ||
	    typeof value === 'number' ||
	    typeof value === 'boolean'
	  )
	}

	/**
	 * Quick object check - this is primarily used to tell
	 * Objects from primitive values when we know the value
	 * is a JSON-compliant type.
	 */
	function isObject (obj) {
	  return obj !== null && typeof obj === 'object'
	}

	/**
	 * Get the raw type string of a value e.g. [object Object]
	 */
	var _toString = Object.prototype.toString;

	function toRawType (value) {
	  return _toString.call(value).slice(8, -1)
	}

	/**
	 * Strict object type check. Only returns true
	 * for plain JavaScript objects.
	 */
	function isPlainObject (obj) {
	  return _toString.call(obj) === '[object Object]'
	}

	function isRegExp (v) {
	  return _toString.call(v) === '[object RegExp]'
	}

	/**
	 * Check if val is a valid array index.
	 */
	function isValidArrayIndex (val) {
	  var n = parseFloat(String(val));
	  return n >= 0 && Math.floor(n) === n && isFinite(val)
	}

	/**
	 * Convert a value to a string that is actually rendered.
	 */
	function toString (val) {
	  return val == null
	    ? ''
	    : typeof val === 'object'
	      ? JSON.stringify(val, null, 2)
	      : String(val)
	}

	/**
	 * Convert a input value to a number for persistence.
	 * If the conversion fails, return original string.
	 */
	function toNumber (val) {
	  var n = parseFloat(val);
	  return isNaN(n) ? val : n
	}

	/**
	 * Make a map and return a function for checking if a key
	 * is in that map.
	 */
	function makeMap (
	  str,
	  expectsLowerCase
	) {
	  var map = Object.create(null);
	  var list = str.split(',');
	  for (var i = 0; i < list.length; i++) {
	    map[list[i]] = true;
	  }
	  return expectsLowerCase
	    ? function (val) { return map[val.toLowerCase()]; }
	    : function (val) { return map[val]; }
	}

	/**
	 * Check if a tag is a built-in tag.
	 */
	var isBuiltInTag = makeMap('slot,component', true);

	/**
	 * Check if a attribute is a reserved attribute.
	 */
	var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

	/**
	 * Remove an item from an array
	 */
	function remove (arr, item) {
	  if (arr.length) {
	    var index = arr.indexOf(item);
	    if (index > -1) {
	      return arr.splice(index, 1)
	    }
	  }
	}

	/**
	 * Check whether the object has the property.
	 */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function hasOwn (obj, key) {
	  return hasOwnProperty.call(obj, key)
	}

	/**
	 * Create a cached version of a pure function.
	 */
	function cached (fn) {
	  var cache = Object.create(null);
	  return (function cachedFn (str) {
	    var hit = cache[str];
	    return hit || (cache[str] = fn(str))
	  })
	}

	/**
	 * Camelize a hyphen-delimited string.
	 */
	var camelizeRE = /-(\w)/g;
	var camelize = cached(function (str) {
	  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
	});

	/**
	 * Capitalize a string.
	 */
	var capitalize = cached(function (str) {
	  return str.charAt(0).toUpperCase() + str.slice(1)
	});

	/**
	 * Hyphenate a camelCase string.
	 */
	var hyphenateRE = /\B([A-Z])/g;
	var hyphenate = cached(function (str) {
	  return str.replace(hyphenateRE, '-$1').toLowerCase()
	});

	/**
	 * Simple bind, faster than native
	 */
	function bind (fn, ctx) {
	  function boundFn (a) {
	    var l = arguments.length;
	    return l
	      ? l > 1
	        ? fn.apply(ctx, arguments)
	        : fn.call(ctx, a)
	      : fn.call(ctx)
	  }
	  // record original fn length
	  boundFn._length = fn.length;
	  return boundFn
	}

	/**
	 * Convert an Array-like object to a real Array.
	 */
	function toArray (list, start) {
	  start = start || 0;
	  var i = list.length - start;
	  var ret = new Array(i);
	  while (i--) {
	    ret[i] = list[i + start];
	  }
	  return ret
	}

	/**
	 * Mix properties into target object.
	 */
	function extend (to, _from) {
	  for (var key in _from) {
	    to[key] = _from[key];
	  }
	  return to
	}

	/**
	 * Merge an Array of Objects into a single Object.
	 */
	function toObject (arr) {
	  var res = {};
	  for (var i = 0; i < arr.length; i++) {
	    if (arr[i]) {
	      extend(res, arr[i]);
	    }
	  }
	  return res
	}

	/**
	 * Perform no operation.
	 * Stubbing args to make Flow happy without leaving useless transpiled code
	 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
	 */
	function noop (a, b, c) {}

	/**
	 * Always return false.
	 */
	var no = function (a, b, c) { return false; };

	/**
	 * Return same value
	 */
	var identity = function (_) { return _; };

	/**
	 * Generate a static keys string from compiler modules.
	 */
	function genStaticKeys (modules) {
	  return modules.reduce(function (keys, m) {
	    return keys.concat(m.staticKeys || [])
	  }, []).join(',')
	}

	/**
	 * Check if two values are loosely equal - that is,
	 * if they are plain objects, do they have the same shape?
	 */
	function looseEqual (a, b) {
	  if (a === b) { return true }
	  var isObjectA = isObject(a);
	  var isObjectB = isObject(b);
	  if (isObjectA && isObjectB) {
	    try {
	      var isArrayA = Array.isArray(a);
	      var isArrayB = Array.isArray(b);
	      if (isArrayA && isArrayB) {
	        return a.length === b.length && a.every(function (e, i) {
	          return looseEqual(e, b[i])
	        })
	      } else if (!isArrayA && !isArrayB) {
	        var keysA = Object.keys(a);
	        var keysB = Object.keys(b);
	        return keysA.length === keysB.length && keysA.every(function (key) {
	          return looseEqual(a[key], b[key])
	        })
	      } else {
	        /* istanbul ignore next */
	        return false
	      }
	    } catch (e) {
	      /* istanbul ignore next */
	      return false
	    }
	  } else if (!isObjectA && !isObjectB) {
	    return String(a) === String(b)
	  } else {
	    return false
	  }
	}

	function looseIndexOf (arr, val) {
	  for (var i = 0; i < arr.length; i++) {
	    if (looseEqual(arr[i], val)) { return i }
	  }
	  return -1
	}

	/**
	 * Ensure a function is called only once.
	 */
	function once (fn) {
	  var called = false;
	  return function () {
	    if (!called) {
	      called = true;
	      fn.apply(this, arguments);
	    }
	  }
	}

	var SSR_ATTR = 'data-server-rendered';

	var ASSET_TYPES = [
	  'component',
	  'directive',
	  'filter'
	];

	var LIFECYCLE_HOOKS = [
	  'beforeCreate',
	  'created',
	  'beforeMount',
	  'mounted',
	  'beforeUpdate',
	  'updated',
	  'beforeDestroy',
	  'destroyed',
	  'activated',
	  'deactivated',
	  'errorCaptured'
	];

	/*  */

	var config = ({
	  /**
	   * Option merge strategies (used in core/util/options)
	   */
	  optionMergeStrategies: Object.create(null),

	  /**
	   * Whether to suppress warnings.
	   */
	  silent: false,

	  /**
	   * Show production mode tip message on boot?
	   */
	  productionTip: ("production") !== 'production',

	  /**
	   * Whether to enable devtools
	   */
	  devtools: ("production") !== 'production',

	  /**
	   * Whether to record perf
	   */
	  performance: false,

	  /**
	   * Error handler for watcher errors
	   */
	  errorHandler: null,

	  /**
	   * Warn handler for watcher warns
	   */
	  warnHandler: null,

	  /**
	   * Ignore certain custom elements
	   */
	  ignoredElements: [],

	  /**
	   * Custom user key aliases for v-on
	   */
	  keyCodes: Object.create(null),

	  /**
	   * Check if a tag is reserved so that it cannot be registered as a
	   * component. This is platform-dependent and may be overwritten.
	   */
	  isReservedTag: no,

	  /**
	   * Check if an attribute is reserved so that it cannot be used as a component
	   * prop. This is platform-dependent and may be overwritten.
	   */
	  isReservedAttr: no,

	  /**
	   * Check if a tag is an unknown element.
	   * Platform-dependent.
	   */
	  isUnknownElement: no,

	  /**
	   * Get the namespace of an element
	   */
	  getTagNamespace: noop,

	  /**
	   * Parse the real tag name for the specific platform.
	   */
	  parsePlatformTagName: identity,

	  /**
	   * Check if an attribute must be bound using property, e.g. value
	   * Platform-dependent.
	   */
	  mustUseProp: no,

	  /**
	   * Exposed for legacy reasons
	   */
	  _lifecycleHooks: LIFECYCLE_HOOKS
	});

	/*  */

	var emptyObject = Object.freeze({});

	/**
	 * Check if a string starts with $ or _
	 */
	function isReserved (str) {
	  var c = (str + '').charCodeAt(0);
	  return c === 0x24 || c === 0x5F
	}

	/**
	 * Define a property.
	 */
	function def (obj, key, val, enumerable) {
	  Object.defineProperty(obj, key, {
	    value: val,
	    enumerable: !!enumerable,
	    writable: true,
	    configurable: true
	  });
	}

	/**
	 * Parse simple path.
	 */
	var bailRE = /[^\w.$]/;
	function parsePath (path) {
	  if (bailRE.test(path)) {
	    return
	  }
	  var segments = path.split('.');
	  return function (obj) {
	    for (var i = 0; i < segments.length; i++) {
	      if (!obj) { return }
	      obj = obj[segments[i]];
	    }
	    return obj
	  }
	}

	/*  */

	// can we use __proto__?
	var hasProto = '__proto__' in {};

	// Browser environment sniffing
	var inBrowser = typeof window !== 'undefined';
	var UA = inBrowser && window.navigator.userAgent.toLowerCase();
	var isIE = UA && /msie|trident/.test(UA);
	var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
	var isEdge = UA && UA.indexOf('edge/') > 0;
	var isAndroid = UA && UA.indexOf('android') > 0;
	var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
	var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

	// Firefox has a "watch" function on Object.prototype...
	var nativeWatch = ({}).watch;

	var supportsPassive = false;
	if (inBrowser) {
	  try {
	    var opts = {};
	    Object.defineProperty(opts, 'passive', ({
	      get: function get () {
	        /* istanbul ignore next */
	        supportsPassive = true;
	      }
	    })); // https://github.com/facebook/flow/issues/285
	    window.addEventListener('test-passive', null, opts);
	  } catch (e) {}
	}

	// this needs to be lazy-evaled because vue may be required before
	// vue-server-renderer can set VUE_ENV
	var _isServer;
	var isServerRendering = function () {
	  if (_isServer === undefined) {
	    /* istanbul ignore if */
	    if (!inBrowser && typeof global !== 'undefined') {
	      // detect presence of vue-server-renderer and avoid
	      // Webpack shimming the process
	      _isServer = global['process'].env.VUE_ENV === 'server';
	    } else {
	      _isServer = false;
	    }
	  }
	  return _isServer
	};

	// detect devtools
	var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

	/* istanbul ignore next */
	function isNative (Ctor) {
	  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
	}

	var hasSymbol =
	  typeof Symbol !== 'undefined' && isNative(Symbol) &&
	  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

	var _Set;
	/* istanbul ignore if */ // $flow-disable-line
	if (typeof Set !== 'undefined' && isNative(Set)) {
	  // use native Set when available.
	  _Set = Set;
	} else {
	  // a non-standard Set polyfill that only works with primitive keys.
	  _Set = (function () {
	    function Set () {
	      this.set = Object.create(null);
	    }
	    Set.prototype.has = function has (key) {
	      return this.set[key] === true
	    };
	    Set.prototype.add = function add (key) {
	      this.set[key] = true;
	    };
	    Set.prototype.clear = function clear () {
	      this.set = Object.create(null);
	    };

	    return Set;
	  }());
	}

	/*  */

	var warn = noop;
	var tip = noop;
	var generateComponentTrace = (noop); // work around flow check
	var formatComponentName = (noop);

	if (false) {
	  var hasConsole = typeof console !== 'undefined';
	  var classifyRE = /(?:^|[-_])(\w)/g;
	  var classify = function (str) { return str
	    .replace(classifyRE, function (c) { return c.toUpperCase(); })
	    .replace(/[-_]/g, ''); };

	  warn = function (msg, vm) {
	    var trace = vm ? generateComponentTrace(vm) : '';

	    if (config.warnHandler) {
	      config.warnHandler.call(null, msg, vm, trace);
	    } else if (hasConsole && (!config.silent)) {
	      console.error(("[Vue warn]: " + msg + trace));
	    }
	  };

	  tip = function (msg, vm) {
	    if (hasConsole && (!config.silent)) {
	      console.warn("[Vue tip]: " + msg + (
	        vm ? generateComponentTrace(vm) : ''
	      ));
	    }
	  };

	  formatComponentName = function (vm, includeFile) {
	    if (vm.$root === vm) {
	      return '<Root>'
	    }
	    var options = typeof vm === 'function' && vm.cid != null
	      ? vm.options
	      : vm._isVue
	        ? vm.$options || vm.constructor.options
	        : vm || {};
	    var name = options.name || options._componentTag;
	    var file = options.__file;
	    if (!name && file) {
	      var match = file.match(/([^/\\]+)\.vue$/);
	      name = match && match[1];
	    }

	    return (
	      (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
	      (file && includeFile !== false ? (" at " + file) : '')
	    )
	  };

	  var repeat = function (str, n) {
	    var res = '';
	    while (n) {
	      if (n % 2 === 1) { res += str; }
	      if (n > 1) { str += str; }
	      n >>= 1;
	    }
	    return res
	  };

	  generateComponentTrace = function (vm) {
	    if (vm._isVue && vm.$parent) {
	      var tree = [];
	      var currentRecursiveSequence = 0;
	      while (vm) {
	        if (tree.length > 0) {
	          var last = tree[tree.length - 1];
	          if (last.constructor === vm.constructor) {
	            currentRecursiveSequence++;
	            vm = vm.$parent;
	            continue
	          } else if (currentRecursiveSequence > 0) {
	            tree[tree.length - 1] = [last, currentRecursiveSequence];
	            currentRecursiveSequence = 0;
	          }
	        }
	        tree.push(vm);
	        vm = vm.$parent;
	      }
	      return '\n\nfound in\n\n' + tree
	        .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
	            ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
	            : formatComponentName(vm))); })
	        .join('\n')
	    } else {
	      return ("\n\n(found in " + (formatComponentName(vm)) + ")")
	    }
	  };
	}

	/*  */


	var uid = 0;

	/**
	 * A dep is an observable that can have multiple
	 * directives subscribing to it.
	 */
	var Dep = function Dep () {
	  this.id = uid++;
	  this.subs = [];
	};

	Dep.prototype.addSub = function addSub (sub) {
	  this.subs.push(sub);
	};

	Dep.prototype.removeSub = function removeSub (sub) {
	  remove(this.subs, sub);
	};

	Dep.prototype.depend = function depend () {
	  if (Dep.target) {
	    Dep.target.addDep(this);
	  }
	};

	Dep.prototype.notify = function notify () {
	  // stabilize the subscriber list first
	  var subs = this.subs.slice();
	  for (var i = 0, l = subs.length; i < l; i++) {
	    subs[i].update();
	  }
	};

	// the current target watcher being evaluated.
	// this is globally unique because there could be only one
	// watcher being evaluated at any time.
	Dep.target = null;
	var targetStack = [];

	function pushTarget (_target) {
	  if (Dep.target) { targetStack.push(Dep.target); }
	  Dep.target = _target;
	}

	function popTarget () {
	  Dep.target = targetStack.pop();
	}

	/*  */

	var VNode = function VNode (
	  tag,
	  data,
	  children,
	  text,
	  elm,
	  context,
	  componentOptions,
	  asyncFactory
	) {
	  this.tag = tag;
	  this.data = data;
	  this.children = children;
	  this.text = text;
	  this.elm = elm;
	  this.ns = undefined;
	  this.context = context;
	  this.functionalContext = undefined;
	  this.functionalOptions = undefined;
	  this.functionalScopeId = undefined;
	  this.key = data && data.key;
	  this.componentOptions = componentOptions;
	  this.componentInstance = undefined;
	  this.parent = undefined;
	  this.raw = false;
	  this.isStatic = false;
	  this.isRootInsert = true;
	  this.isComment = false;
	  this.isCloned = false;
	  this.isOnce = false;
	  this.asyncFactory = asyncFactory;
	  this.asyncMeta = undefined;
	  this.isAsyncPlaceholder = false;
	};

	var prototypeAccessors = { child: { configurable: true } };

	// DEPRECATED: alias for componentInstance for backwards compat.
	/* istanbul ignore next */
	prototypeAccessors.child.get = function () {
	  return this.componentInstance
	};

	Object.defineProperties( VNode.prototype, prototypeAccessors );

	var createEmptyVNode = function (text) {
	  if ( text === void 0 ) text = '';

	  var node = new VNode();
	  node.text = text;
	  node.isComment = true;
	  return node
	};

	function createTextVNode (val) {
	  return new VNode(undefined, undefined, undefined, String(val))
	}

	// optimized shallow clone
	// used for static nodes and slot nodes because they may be reused across
	// multiple renders, cloning them avoids errors when DOM manipulations rely
	// on their elm reference.
	function cloneVNode (vnode, deep) {
	  var cloned = new VNode(
	    vnode.tag,
	    vnode.data,
	    vnode.children,
	    vnode.text,
	    vnode.elm,
	    vnode.context,
	    vnode.componentOptions,
	    vnode.asyncFactory
	  );
	  cloned.ns = vnode.ns;
	  cloned.isStatic = vnode.isStatic;
	  cloned.key = vnode.key;
	  cloned.isComment = vnode.isComment;
	  cloned.isCloned = true;
	  if (deep && vnode.children) {
	    cloned.children = cloneVNodes(vnode.children);
	  }
	  return cloned
	}

	function cloneVNodes (vnodes, deep) {
	  var len = vnodes.length;
	  var res = new Array(len);
	  for (var i = 0; i < len; i++) {
	    res[i] = cloneVNode(vnodes[i], deep);
	  }
	  return res
	}

	/*
	 * not type checking this file because flow doesn't play well with
	 * dynamically accessing methods on Array prototype
	 */

	var arrayProto = Array.prototype;
	var arrayMethods = Object.create(arrayProto);[
	  'push',
	  'pop',
	  'shift',
	  'unshift',
	  'splice',
	  'sort',
	  'reverse'
	]
	.forEach(function (method) {
	  // cache original method
	  var original = arrayProto[method];
	  def(arrayMethods, method, function mutator () {
	    var args = [], len = arguments.length;
	    while ( len-- ) args[ len ] = arguments[ len ];

	    var result = original.apply(this, args);
	    var ob = this.__ob__;
	    var inserted;
	    switch (method) {
	      case 'push':
	      case 'unshift':
	        inserted = args;
	        break
	      case 'splice':
	        inserted = args.slice(2);
	        break
	    }
	    if (inserted) { ob.observeArray(inserted); }
	    // notify change
	    ob.dep.notify();
	    return result
	  });
	});

	/*  */

	var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

	/**
	 * By default, when a reactive property is set, the new value is
	 * also converted to become reactive. However when passing down props,
	 * we don't want to force conversion because the value may be a nested value
	 * under a frozen data structure. Converting it would defeat the optimization.
	 */
	var observerState = {
	  shouldConvert: true
	};

	/**
	 * Observer class that are attached to each observed
	 * object. Once attached, the observer converts target
	 * object's property keys into getter/setters that
	 * collect dependencies and dispatches updates.
	 */
	var Observer = function Observer (value) {
	  this.value = value;
	  this.dep = new Dep();
	  this.vmCount = 0;
	  def(value, '__ob__', this);
	  if (Array.isArray(value)) {
	    var augment = hasProto
	      ? protoAugment
	      : copyAugment;
	    augment(value, arrayMethods, arrayKeys);
	    this.observeArray(value);
	  } else {
	    this.walk(value);
	  }
	};

	/**
	 * Walk through each property and convert them into
	 * getter/setters. This method should only be called when
	 * value type is Object.
	 */
	Observer.prototype.walk = function walk (obj) {
	  var keys = Object.keys(obj);
	  for (var i = 0; i < keys.length; i++) {
	    defineReactive(obj, keys[i], obj[keys[i]]);
	  }
	};

	/**
	 * Observe a list of Array items.
	 */
	Observer.prototype.observeArray = function observeArray (items) {
	  for (var i = 0, l = items.length; i < l; i++) {
	    observe(items[i]);
	  }
	};

	// helpers

	/**
	 * Augment an target Object or Array by intercepting
	 * the prototype chain using __proto__
	 */
	function protoAugment (target, src, keys) {
	  /* eslint-disable no-proto */
	  target.__proto__ = src;
	  /* eslint-enable no-proto */
	}

	/**
	 * Augment an target Object or Array by defining
	 * hidden properties.
	 */
	/* istanbul ignore next */
	function copyAugment (target, src, keys) {
	  for (var i = 0, l = keys.length; i < l; i++) {
	    var key = keys[i];
	    def(target, key, src[key]);
	  }
	}

	/**
	 * Attempt to create an observer instance for a value,
	 * returns the new observer if successfully observed,
	 * or the existing observer if the value already has one.
	 */
	function observe (value, asRootData) {
	  if (!isObject(value) || value instanceof VNode) {
	    return
	  }
	  var ob;
	  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
	    ob = value.__ob__;
	  } else if (
	    observerState.shouldConvert &&
	    !isServerRendering() &&
	    (Array.isArray(value) || isPlainObject(value)) &&
	    Object.isExtensible(value) &&
	    !value._isVue
	  ) {
	    ob = new Observer(value);
	  }
	  if (asRootData && ob) {
	    ob.vmCount++;
	  }
	  return ob
	}

	/**
	 * Define a reactive property on an Object.
	 */
	function defineReactive (
	  obj,
	  key,
	  val,
	  customSetter,
	  shallow
	) {
	  var dep = new Dep();

	  var property = Object.getOwnPropertyDescriptor(obj, key);
	  if (property && property.configurable === false) {
	    return
	  }

	  // cater for pre-defined getter/setters
	  var getter = property && property.get;
	  var setter = property && property.set;

	  var childOb = !shallow && observe(val);
	  Object.defineProperty(obj, key, {
	    enumerable: true,
	    configurable: true,
	    get: function reactiveGetter () {
	      var value = getter ? getter.call(obj) : val;
	      if (Dep.target) {
	        dep.depend();
	        if (childOb) {
	          childOb.dep.depend();
	          if (Array.isArray(value)) {
	            dependArray(value);
	          }
	        }
	      }
	      return value
	    },
	    set: function reactiveSetter (newVal) {
	      var value = getter ? getter.call(obj) : val;
	      /* eslint-disable no-self-compare */
	      if (newVal === value || (newVal !== newVal && value !== value)) {
	        return
	      }
	      /* eslint-enable no-self-compare */
	      if (false) {
	        customSetter();
	      }
	      if (setter) {
	        setter.call(obj, newVal);
	      } else {
	        val = newVal;
	      }
	      childOb = !shallow && observe(newVal);
	      dep.notify();
	    }
	  });
	}

	/**
	 * Set a property on an object. Adds the new property and
	 * triggers change notification if the property doesn't
	 * already exist.
	 */
	function set (target, key, val) {
	  if (Array.isArray(target) && isValidArrayIndex(key)) {
	    target.length = Math.max(target.length, key);
	    target.splice(key, 1, val);
	    return val
	  }
	  if (hasOwn(target, key)) {
	    target[key] = val;
	    return val
	  }
	  var ob = (target).__ob__;
	  if (target._isVue || (ob && ob.vmCount)) {
	    ("production") !== 'production' && warn(
	      'Avoid adding reactive properties to a Vue instance or its root $data ' +
	      'at runtime - declare it upfront in the data option.'
	    );
	    return val
	  }
	  if (!ob) {
	    target[key] = val;
	    return val
	  }
	  defineReactive(ob.value, key, val);
	  ob.dep.notify();
	  return val
	}

	/**
	 * Delete a property and trigger change if necessary.
	 */
	function del (target, key) {
	  if (Array.isArray(target) && isValidArrayIndex(key)) {
	    target.splice(key, 1);
	    return
	  }
	  var ob = (target).__ob__;
	  if (target._isVue || (ob && ob.vmCount)) {
	    ("production") !== 'production' && warn(
	      'Avoid deleting properties on a Vue instance or its root $data ' +
	      '- just set it to null.'
	    );
	    return
	  }
	  if (!hasOwn(target, key)) {
	    return
	  }
	  delete target[key];
	  if (!ob) {
	    return
	  }
	  ob.dep.notify();
	}

	/**
	 * Collect dependencies on array elements when the array is touched, since
	 * we cannot intercept array element access like property getters.
	 */
	function dependArray (value) {
	  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
	    e = value[i];
	    e && e.__ob__ && e.__ob__.dep.depend();
	    if (Array.isArray(e)) {
	      dependArray(e);
	    }
	  }
	}

	/*  */

	/**
	 * Option overwriting strategies are functions that handle
	 * how to merge a parent option value and a child option
	 * value into the final value.
	 */
	var strats = config.optionMergeStrategies;

	/**
	 * Options with restrictions
	 */
	if (false) {
	  strats.el = strats.propsData = function (parent, child, vm, key) {
	    if (!vm) {
	      warn(
	        "option \"" + key + "\" can only be used during instance " +
	        'creation with the `new` keyword.'
	      );
	    }
	    return defaultStrat(parent, child)
	  };
	}

	/**
	 * Helper that recursively merges two data objects together.
	 */
	function mergeData (to, from) {
	  if (!from) { return to }
	  var key, toVal, fromVal;
	  var keys = Object.keys(from);
	  for (var i = 0; i < keys.length; i++) {
	    key = keys[i];
	    toVal = to[key];
	    fromVal = from[key];
	    if (!hasOwn(to, key)) {
	      set(to, key, fromVal);
	    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
	      mergeData(toVal, fromVal);
	    }
	  }
	  return to
	}

	/**
	 * Data
	 */
	function mergeDataOrFn (
	  parentVal,
	  childVal,
	  vm
	) {
	  if (!vm) {
	    // in a Vue.extend merge, both should be functions
	    if (!childVal) {
	      return parentVal
	    }
	    if (!parentVal) {
	      return childVal
	    }
	    // when parentVal & childVal are both present,
	    // we need to return a function that returns the
	    // merged result of both functions... no need to
	    // check if parentVal is a function here because
	    // it has to be a function to pass previous merges.
	    return function mergedDataFn () {
	      return mergeData(
	        typeof childVal === 'function' ? childVal.call(this) : childVal,
	        typeof parentVal === 'function' ? parentVal.call(this) : parentVal
	      )
	    }
	  } else if (parentVal || childVal) {
	    return function mergedInstanceDataFn () {
	      // instance merge
	      var instanceData = typeof childVal === 'function'
	        ? childVal.call(vm)
	        : childVal;
	      var defaultData = typeof parentVal === 'function'
	        ? parentVal.call(vm)
	        : parentVal;
	      if (instanceData) {
	        return mergeData(instanceData, defaultData)
	      } else {
	        return defaultData
	      }
	    }
	  }
	}

	strats.data = function (
	  parentVal,
	  childVal,
	  vm
	) {
	  if (!vm) {
	    if (childVal && typeof childVal !== 'function') {
	      ("production") !== 'production' && warn(
	        'The "data" option should be a function ' +
	        'that returns a per-instance value in component ' +
	        'definitions.',
	        vm
	      );

	      return parentVal
	    }
	    return mergeDataOrFn.call(this, parentVal, childVal)
	  }

	  return mergeDataOrFn(parentVal, childVal, vm)
	};

	/**
	 * Hooks and props are merged as arrays.
	 */
	function mergeHook (
	  parentVal,
	  childVal
	) {
	  return childVal
	    ? parentVal
	      ? parentVal.concat(childVal)
	      : Array.isArray(childVal)
	        ? childVal
	        : [childVal]
	    : parentVal
	}

	LIFECYCLE_HOOKS.forEach(function (hook) {
	  strats[hook] = mergeHook;
	});

	/**
	 * Assets
	 *
	 * When a vm is present (instance creation), we need to do
	 * a three-way merge between constructor options, instance
	 * options and parent options.
	 */
	function mergeAssets (
	  parentVal,
	  childVal,
	  vm,
	  key
	) {
	  var res = Object.create(parentVal || null);
	  if (childVal) {
	    ("production") !== 'production' && assertObjectType(key, childVal, vm);
	    return extend(res, childVal)
	  } else {
	    return res
	  }
	}

	ASSET_TYPES.forEach(function (type) {
	  strats[type + 's'] = mergeAssets;
	});

	/**
	 * Watchers.
	 *
	 * Watchers hashes should not overwrite one
	 * another, so we merge them as arrays.
	 */
	strats.watch = function (
	  parentVal,
	  childVal,
	  vm,
	  key
	) {
	  // work around Firefox's Object.prototype.watch...
	  if (parentVal === nativeWatch) { parentVal = undefined; }
	  if (childVal === nativeWatch) { childVal = undefined; }
	  /* istanbul ignore if */
	  if (!childVal) { return Object.create(parentVal || null) }
	  if (false) {
	    assertObjectType(key, childVal, vm);
	  }
	  if (!parentVal) { return childVal }
	  var ret = {};
	  extend(ret, parentVal);
	  for (var key$1 in childVal) {
	    var parent = ret[key$1];
	    var child = childVal[key$1];
	    if (parent && !Array.isArray(parent)) {
	      parent = [parent];
	    }
	    ret[key$1] = parent
	      ? parent.concat(child)
	      : Array.isArray(child) ? child : [child];
	  }
	  return ret
	};

	/**
	 * Other object hashes.
	 */
	strats.props =
	strats.methods =
	strats.inject =
	strats.computed = function (
	  parentVal,
	  childVal,
	  vm,
	  key
	) {
	  if (childVal && ("production") !== 'production') {
	    assertObjectType(key, childVal, vm);
	  }
	  if (!parentVal) { return childVal }
	  var ret = Object.create(null);
	  extend(ret, parentVal);
	  if (childVal) { extend(ret, childVal); }
	  return ret
	};
	strats.provide = mergeDataOrFn;

	/**
	 * Default strategy.
	 */
	var defaultStrat = function (parentVal, childVal) {
	  return childVal === undefined
	    ? parentVal
	    : childVal
	};

	/**
	 * Validate component names
	 */
	function checkComponents (options) {
	  for (var key in options.components) {
	    var lower = key.toLowerCase();
	    if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
	      warn(
	        'Do not use built-in or reserved HTML elements as component ' +
	        'id: ' + key
	      );
	    }
	  }
	}

	/**
	 * Ensure all props option syntax are normalized into the
	 * Object-based format.
	 */
	function normalizeProps (options, vm) {
	  var props = options.props;
	  if (!props) { return }
	  var res = {};
	  var i, val, name;
	  if (Array.isArray(props)) {
	    i = props.length;
	    while (i--) {
	      val = props[i];
	      if (typeof val === 'string') {
	        name = camelize(val);
	        res[name] = { type: null };
	      } else if (false) {
	        warn('props must be strings when using array syntax.');
	      }
	    }
	  } else if (isPlainObject(props)) {
	    for (var key in props) {
	      val = props[key];
	      name = camelize(key);
	      res[name] = isPlainObject(val)
	        ? val
	        : { type: val };
	    }
	  } else if (false) {
	    warn(
	      "Invalid value for option \"props\": expected an Array or an Object, " +
	      "but got " + (toRawType(props)) + ".",
	      vm
	    );
	  }
	  options.props = res;
	}

	/**
	 * Normalize all injections into Object-based format
	 */
	function normalizeInject (options, vm) {
	  var inject = options.inject;
	  var normalized = options.inject = {};
	  if (Array.isArray(inject)) {
	    for (var i = 0; i < inject.length; i++) {
	      normalized[inject[i]] = { from: inject[i] };
	    }
	  } else if (isPlainObject(inject)) {
	    for (var key in inject) {
	      var val = inject[key];
	      normalized[key] = isPlainObject(val)
	        ? extend({ from: key }, val)
	        : { from: val };
	    }
	  } else if (false) {
	    warn(
	      "Invalid value for option \"inject\": expected an Array or an Object, " +
	      "but got " + (toRawType(inject)) + ".",
	      vm
	    );
	  }
	}

	/**
	 * Normalize raw function directives into object format.
	 */
	function normalizeDirectives (options) {
	  var dirs = options.directives;
	  if (dirs) {
	    for (var key in dirs) {
	      var def = dirs[key];
	      if (typeof def === 'function') {
	        dirs[key] = { bind: def, update: def };
	      }
	    }
	  }
	}

	function assertObjectType (name, value, vm) {
	  if (!isPlainObject(value)) {
	    warn(
	      "Invalid value for option \"" + name + "\": expected an Object, " +
	      "but got " + (toRawType(value)) + ".",
	      vm
	    );
	  }
	}

	/**
	 * Merge two option objects into a new one.
	 * Core utility used in both instantiation and inheritance.
	 */
	function mergeOptions (
	  parent,
	  child,
	  vm
	) {
	  if (false) {
	    checkComponents(child);
	  }

	  if (typeof child === 'function') {
	    child = child.options;
	  }

	  normalizeProps(child, vm);
	  normalizeInject(child, vm);
	  normalizeDirectives(child);
	  var extendsFrom = child.extends;
	  if (extendsFrom) {
	    parent = mergeOptions(parent, extendsFrom, vm);
	  }
	  if (child.mixins) {
	    for (var i = 0, l = child.mixins.length; i < l; i++) {
	      parent = mergeOptions(parent, child.mixins[i], vm);
	    }
	  }
	  var options = {};
	  var key;
	  for (key in parent) {
	    mergeField(key);
	  }
	  for (key in child) {
	    if (!hasOwn(parent, key)) {
	      mergeField(key);
	    }
	  }
	  function mergeField (key) {
	    var strat = strats[key] || defaultStrat;
	    options[key] = strat(parent[key], child[key], vm, key);
	  }
	  return options
	}

	/**
	 * Resolve an asset.
	 * This function is used because child instances need access
	 * to assets defined in its ancestor chain.
	 */
	function resolveAsset (
	  options,
	  type,
	  id,
	  warnMissing
	) {
	  /* istanbul ignore if */
	  if (typeof id !== 'string') {
	    return
	  }
	  var assets = options[type];
	  // check local registration variations first
	  if (hasOwn(assets, id)) { return assets[id] }
	  var camelizedId = camelize(id);
	  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
	  var PascalCaseId = capitalize(camelizedId);
	  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
	  // fallback to prototype chain
	  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
	  if (false) {
	    warn(
	      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
	      options
	    );
	  }
	  return res
	}

	/*  */

	function validateProp (
	  key,
	  propOptions,
	  propsData,
	  vm
	) {
	  var prop = propOptions[key];
	  var absent = !hasOwn(propsData, key);
	  var value = propsData[key];
	  // handle boolean props
	  if (isType(Boolean, prop.type)) {
	    if (absent && !hasOwn(prop, 'default')) {
	      value = false;
	    } else if (!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
	      value = true;
	    }
	  }
	  // check default value
	  if (value === undefined) {
	    value = getPropDefaultValue(vm, prop, key);
	    // since the default value is a fresh copy,
	    // make sure to observe it.
	    var prevShouldConvert = observerState.shouldConvert;
	    observerState.shouldConvert = true;
	    observe(value);
	    observerState.shouldConvert = prevShouldConvert;
	  }
	  if (false) {
	    assertProp(prop, key, value, vm, absent);
	  }
	  return value
	}

	/**
	 * Get the default value of a prop.
	 */
	function getPropDefaultValue (vm, prop, key) {
	  // no default, return undefined
	  if (!hasOwn(prop, 'default')) {
	    return undefined
	  }
	  var def = prop.default;
	  // warn against non-factory defaults for Object & Array
	  if (false) {
	    warn(
	      'Invalid default value for prop "' + key + '": ' +
	      'Props with type Object/Array must use a factory function ' +
	      'to return the default value.',
	      vm
	    );
	  }
	  // the raw prop value was also undefined from previous render,
	  // return previous default value to avoid unnecessary watcher trigger
	  if (vm && vm.$options.propsData &&
	    vm.$options.propsData[key] === undefined &&
	    vm._props[key] !== undefined
	  ) {
	    return vm._props[key]
	  }
	  // call factory function for non-Function types
	  // a value is Function if its prototype is function even across different execution context
	  return typeof def === 'function' && getType(prop.type) !== 'Function'
	    ? def.call(vm)
	    : def
	}

	/**
	 * Assert whether a prop is valid.
	 */
	function assertProp (
	  prop,
	  name,
	  value,
	  vm,
	  absent
	) {
	  if (prop.required && absent) {
	    warn(
	      'Missing required prop: "' + name + '"',
	      vm
	    );
	    return
	  }
	  if (value == null && !prop.required) {
	    return
	  }
	  var type = prop.type;
	  var valid = !type || type === true;
	  var expectedTypes = [];
	  if (type) {
	    if (!Array.isArray(type)) {
	      type = [type];
	    }
	    for (var i = 0; i < type.length && !valid; i++) {
	      var assertedType = assertType(value, type[i]);
	      expectedTypes.push(assertedType.expectedType || '');
	      valid = assertedType.valid;
	    }
	  }
	  if (!valid) {
	    warn(
	      "Invalid prop: type check failed for prop \"" + name + "\"." +
	      " Expected " + (expectedTypes.map(capitalize).join(', ')) +
	      ", got " + (toRawType(value)) + ".",
	      vm
	    );
	    return
	  }
	  var validator = prop.validator;
	  if (validator) {
	    if (!validator(value)) {
	      warn(
	        'Invalid prop: custom validator check failed for prop "' + name + '".',
	        vm
	      );
	    }
	  }
	}

	var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

	function assertType (value, type) {
	  var valid;
	  var expectedType = getType(type);
	  if (simpleCheckRE.test(expectedType)) {
	    var t = typeof value;
	    valid = t === expectedType.toLowerCase();
	    // for primitive wrapper objects
	    if (!valid && t === 'object') {
	      valid = value instanceof type;
	    }
	  } else if (expectedType === 'Object') {
	    valid = isPlainObject(value);
	  } else if (expectedType === 'Array') {
	    valid = Array.isArray(value);
	  } else {
	    valid = value instanceof type;
	  }
	  return {
	    valid: valid,
	    expectedType: expectedType
	  }
	}

	/**
	 * Use function string name to check built-in types,
	 * because a simple equality check will fail when running
	 * across different vms / iframes.
	 */
	function getType (fn) {
	  var match = fn && fn.toString().match(/^\s*function (\w+)/);
	  return match ? match[1] : ''
	}

	function isType (type, fn) {
	  if (!Array.isArray(fn)) {
	    return getType(fn) === getType(type)
	  }
	  for (var i = 0, len = fn.length; i < len; i++) {
	    if (getType(fn[i]) === getType(type)) {
	      return true
	    }
	  }
	  /* istanbul ignore next */
	  return false
	}

	/*  */

	function handleError (err, vm, info) {
	  if (vm) {
	    var cur = vm;
	    while ((cur = cur.$parent)) {
	      var hooks = cur.$options.errorCaptured;
	      if (hooks) {
	        for (var i = 0; i < hooks.length; i++) {
	          try {
	            var capture = hooks[i].call(cur, err, vm, info) === false;
	            if (capture) { return }
	          } catch (e) {
	            globalHandleError(e, cur, 'errorCaptured hook');
	          }
	        }
	      }
	    }
	  }
	  globalHandleError(err, vm, info);
	}

	function globalHandleError (err, vm, info) {
	  if (config.errorHandler) {
	    try {
	      return config.errorHandler.call(null, err, vm, info)
	    } catch (e) {
	      logError(e, null, 'config.errorHandler');
	    }
	  }
	  logError(err, vm, info);
	}

	function logError (err, vm, info) {
	  if (false) {
	    warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
	  }
	  /* istanbul ignore else */
	  if (inBrowser && typeof console !== 'undefined') {
	    console.error(err);
	  } else {
	    throw err
	  }
	}

	/*  */
	/* globals MessageChannel */

	var callbacks = [];
	var pending = false;

	function flushCallbacks () {
	  pending = false;
	  var copies = callbacks.slice(0);
	  callbacks.length = 0;
	  for (var i = 0; i < copies.length; i++) {
	    copies[i]();
	  }
	}

	// Here we have async deferring wrappers using both micro and macro tasks.
	// In < 2.4 we used micro tasks everywhere, but there are some scenarios where
	// micro tasks have too high a priority and fires in between supposedly
	// sequential events (e.g. #4521, #6690) or even between bubbling of the same
	// event (#6566). However, using macro tasks everywhere also has subtle problems
	// when state is changed right before repaint (e.g. #6813, out-in transitions).
	// Here we use micro task by default, but expose a way to force macro task when
	// needed (e.g. in event handlers attached by v-on).
	var microTimerFunc;
	var macroTimerFunc;
	var useMacroTask = false;

	// Determine (macro) Task defer implementation.
	// Technically setImmediate should be the ideal choice, but it's only available
	// in IE. The only polyfill that consistently queues the callback after all DOM
	// events triggered in the same loop is by using MessageChannel.
	/* istanbul ignore if */
	if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
	  macroTimerFunc = function () {
	    setImmediate(flushCallbacks);
	  };
	} else if (typeof MessageChannel !== 'undefined' && (
	  isNative(MessageChannel) ||
	  // PhantomJS
	  MessageChannel.toString() === '[object MessageChannelConstructor]'
	)) {
	  var channel = new MessageChannel();
	  var port = channel.port2;
	  channel.port1.onmessage = flushCallbacks;
	  macroTimerFunc = function () {
	    port.postMessage(1);
	  };
	} else {
	  /* istanbul ignore next */
	  macroTimerFunc = function () {
	    setTimeout(flushCallbacks, 0);
	  };
	}

	// Determine MicroTask defer implementation.
	/* istanbul ignore next, $flow-disable-line */
	if (typeof Promise !== 'undefined' && isNative(Promise)) {
	  var p = Promise.resolve();
	  microTimerFunc = function () {
	    p.then(flushCallbacks);
	    // in problematic UIWebViews, Promise.then doesn't completely break, but
	    // it can get stuck in a weird state where callbacks are pushed into the
	    // microtask queue but the queue isn't being flushed, until the browser
	    // needs to do some other work, e.g. handle a timer. Therefore we can
	    // "force" the microtask queue to be flushed by adding an empty timer.
	    if (isIOS) { setTimeout(noop); }
	  };
	} else {
	  // fallback to macro
	  microTimerFunc = macroTimerFunc;
	}

	/**
	 * Wrap a function so that if any code inside triggers state change,
	 * the changes are queued using a Task instead of a MicroTask.
	 */
	function withMacroTask (fn) {
	  return fn._withTask || (fn._withTask = function () {
	    useMacroTask = true;
	    var res = fn.apply(null, arguments);
	    useMacroTask = false;
	    return res
	  })
	}

	function nextTick (cb, ctx) {
	  var _resolve;
	  callbacks.push(function () {
	    if (cb) {
	      try {
	        cb.call(ctx);
	      } catch (e) {
	        handleError(e, ctx, 'nextTick');
	      }
	    } else if (_resolve) {
	      _resolve(ctx);
	    }
	  });
	  if (!pending) {
	    pending = true;
	    if (useMacroTask) {
	      macroTimerFunc();
	    } else {
	      microTimerFunc();
	    }
	  }
	  // $flow-disable-line
	  if (!cb && typeof Promise !== 'undefined') {
	    return new Promise(function (resolve) {
	      _resolve = resolve;
	    })
	  }
	}

	/*  */

	var mark;
	var measure;

	if (false) {
	  var perf = inBrowser && window.performance;
	  /* istanbul ignore if */
	  if (
	    perf &&
	    perf.mark &&
	    perf.measure &&
	    perf.clearMarks &&
	    perf.clearMeasures
	  ) {
	    mark = function (tag) { return perf.mark(tag); };
	    measure = function (name, startTag, endTag) {
	      perf.measure(name, startTag, endTag);
	      perf.clearMarks(startTag);
	      perf.clearMarks(endTag);
	      perf.clearMeasures(name);
	    };
	  }
	}

	/* not type checking this file because flow doesn't play well with Proxy */

	var initProxy;

	if (false) {
	  var allowedGlobals = makeMap(
	    'Infinity,undefined,NaN,isFinite,isNaN,' +
	    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
	    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
	    'require' // for Webpack/Browserify
	  );

	  var warnNonPresent = function (target, key) {
	    warn(
	      "Property or method \"" + key + "\" is not defined on the instance but " +
	      'referenced during render. Make sure that this property is reactive, ' +
	      'either in the data option, or for class-based components, by ' +
	      'initializing the property. ' +
	      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
	      target
	    );
	  };

	  var hasProxy =
	    typeof Proxy !== 'undefined' &&
	    Proxy.toString().match(/native code/);

	  if (hasProxy) {
	    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
	    config.keyCodes = new Proxy(config.keyCodes, {
	      set: function set (target, key, value) {
	        if (isBuiltInModifier(key)) {
	          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
	          return false
	        } else {
	          target[key] = value;
	          return true
	        }
	      }
	    });
	  }

	  var hasHandler = {
	    has: function has (target, key) {
	      var has = key in target;
	      var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
	      if (!has && !isAllowed) {
	        warnNonPresent(target, key);
	      }
	      return has || !isAllowed
	    }
	  };

	  var getHandler = {
	    get: function get (target, key) {
	      if (typeof key === 'string' && !(key in target)) {
	        warnNonPresent(target, key);
	      }
	      return target[key]
	    }
	  };

	  initProxy = function initProxy (vm) {
	    if (hasProxy) {
	      // determine which proxy handler to use
	      var options = vm.$options;
	      var handlers = options.render && options.render._withStripped
	        ? getHandler
	        : hasHandler;
	      vm._renderProxy = new Proxy(vm, handlers);
	    } else {
	      vm._renderProxy = vm;
	    }
	  };
	}

	/*  */

	var normalizeEvent = cached(function (name) {
	  var passive = name.charAt(0) === '&';
	  name = passive ? name.slice(1) : name;
	  var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
	  name = once$$1 ? name.slice(1) : name;
	  var capture = name.charAt(0) === '!';
	  name = capture ? name.slice(1) : name;
	  return {
	    name: name,
	    once: once$$1,
	    capture: capture,
	    passive: passive
	  }
	});

	function createFnInvoker (fns) {
	  function invoker () {
	    var arguments$1 = arguments;

	    var fns = invoker.fns;
	    if (Array.isArray(fns)) {
	      var cloned = fns.slice();
	      for (var i = 0; i < cloned.length; i++) {
	        cloned[i].apply(null, arguments$1);
	      }
	    } else {
	      // return handler return value for single handlers
	      return fns.apply(null, arguments)
	    }
	  }
	  invoker.fns = fns;
	  return invoker
	}

	function updateListeners (
	  on,
	  oldOn,
	  add,
	  remove$$1,
	  vm
	) {
	  var name, cur, old, event;
	  for (name in on) {
	    cur = on[name];
	    old = oldOn[name];
	    event = normalizeEvent(name);
	    if (isUndef(cur)) {
	      ("production") !== 'production' && warn(
	        "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
	        vm
	      );
	    } else if (isUndef(old)) {
	      if (isUndef(cur.fns)) {
	        cur = on[name] = createFnInvoker(cur);
	      }
	      add(event.name, cur, event.once, event.capture, event.passive);
	    } else if (cur !== old) {
	      old.fns = cur;
	      on[name] = old;
	    }
	  }
	  for (name in oldOn) {
	    if (isUndef(on[name])) {
	      event = normalizeEvent(name);
	      remove$$1(event.name, oldOn[name], event.capture);
	    }
	  }
	}

	/*  */

	function mergeVNodeHook (def, hookKey, hook) {
	  var invoker;
	  var oldHook = def[hookKey];

	  function wrappedHook () {
	    hook.apply(this, arguments);
	    // important: remove merged hook to ensure it's called only once
	    // and prevent memory leak
	    remove(invoker.fns, wrappedHook);
	  }

	  if (isUndef(oldHook)) {
	    // no existing hook
	    invoker = createFnInvoker([wrappedHook]);
	  } else {
	    /* istanbul ignore if */
	    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
	      // already a merged invoker
	      invoker = oldHook;
	      invoker.fns.push(wrappedHook);
	    } else {
	      // existing plain hook
	      invoker = createFnInvoker([oldHook, wrappedHook]);
	    }
	  }

	  invoker.merged = true;
	  def[hookKey] = invoker;
	}

	/*  */

	function extractPropsFromVNodeData (
	  data,
	  Ctor,
	  tag
	) {
	  // we are only extracting raw values here.
	  // validation and default values are handled in the child
	  // component itself.
	  var propOptions = Ctor.options.props;
	  if (isUndef(propOptions)) {
	    return
	  }
	  var res = {};
	  var attrs = data.attrs;
	  var props = data.props;
	  if (isDef(attrs) || isDef(props)) {
	    for (var key in propOptions) {
	      var altKey = hyphenate(key);
	      if (false) {
	        var keyInLowerCase = key.toLowerCase();
	        if (
	          key !== keyInLowerCase &&
	          attrs && hasOwn(attrs, keyInLowerCase)
	        ) {
	          tip(
	            "Prop \"" + keyInLowerCase + "\" is passed to component " +
	            (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
	            " \"" + key + "\". " +
	            "Note that HTML attributes are case-insensitive and camelCased " +
	            "props need to use their kebab-case equivalents when using in-DOM " +
	            "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
	          );
	        }
	      }
	      checkProp(res, props, key, altKey, true) ||
	      checkProp(res, attrs, key, altKey, false);
	    }
	  }
	  return res
	}

	function checkProp (
	  res,
	  hash,
	  key,
	  altKey,
	  preserve
	) {
	  if (isDef(hash)) {
	    if (hasOwn(hash, key)) {
	      res[key] = hash[key];
	      if (!preserve) {
	        delete hash[key];
	      }
	      return true
	    } else if (hasOwn(hash, altKey)) {
	      res[key] = hash[altKey];
	      if (!preserve) {
	        delete hash[altKey];
	      }
	      return true
	    }
	  }
	  return false
	}

	/*  */

	// The template compiler attempts to minimize the need for normalization by
	// statically analyzing the template at compile time.
	//
	// For plain HTML markup, normalization can be completely skipped because the
	// generated render function is guaranteed to return Array<VNode>. There are
	// two cases where extra normalization is needed:

	// 1. When the children contains components - because a functional component
	// may return an Array instead of a single root. In this case, just a simple
	// normalization is needed - if any child is an Array, we flatten the whole
	// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
	// because functional components already normalize their own children.
	function simpleNormalizeChildren (children) {
	  for (var i = 0; i < children.length; i++) {
	    if (Array.isArray(children[i])) {
	      return Array.prototype.concat.apply([], children)
	    }
	  }
	  return children
	}

	// 2. When the children contains constructs that always generated nested Arrays,
	// e.g. <template>, <slot>, v-for, or when the children is provided by user
	// with hand-written render functions / JSX. In such cases a full normalization
	// is needed to cater to all possible types of children values.
	function normalizeChildren (children) {
	  return isPrimitive(children)
	    ? [createTextVNode(children)]
	    : Array.isArray(children)
	      ? normalizeArrayChildren(children)
	      : undefined
	}

	function isTextNode (node) {
	  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
	}

	function normalizeArrayChildren (children, nestedIndex) {
	  var res = [];
	  var i, c, lastIndex, last;
	  for (i = 0; i < children.length; i++) {
	    c = children[i];
	    if (isUndef(c) || typeof c === 'boolean') { continue }
	    lastIndex = res.length - 1;
	    last = res[lastIndex];
	    //  nested
	    if (Array.isArray(c)) {
	      if (c.length > 0) {
	        c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
	        // merge adjacent text nodes
	        if (isTextNode(c[0]) && isTextNode(last)) {
	          res[lastIndex] = createTextVNode(last.text + (c[0]).text);
	          c.shift();
	        }
	        res.push.apply(res, c);
	      }
	    } else if (isPrimitive(c)) {
	      if (isTextNode(last)) {
	        // merge adjacent text nodes
	        // this is necessary for SSR hydration because text nodes are
	        // essentially merged when rendered to HTML strings
	        res[lastIndex] = createTextVNode(last.text + c);
	      } else if (c !== '') {
	        // convert primitive to vnode
	        res.push(createTextVNode(c));
	      }
	    } else {
	      if (isTextNode(c) && isTextNode(last)) {
	        // merge adjacent text nodes
	        res[lastIndex] = createTextVNode(last.text + c.text);
	      } else {
	        // default key for nested array children (likely generated by v-for)
	        if (isTrue(children._isVList) &&
	          isDef(c.tag) &&
	          isUndef(c.key) &&
	          isDef(nestedIndex)) {
	          c.key = "__vlist" + nestedIndex + "_" + i + "__";
	        }
	        res.push(c);
	      }
	    }
	  }
	  return res
	}

	/*  */

	function ensureCtor (comp, base) {
	  if (
	    comp.__esModule ||
	    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
	  ) {
	    comp = comp.default;
	  }
	  return isObject(comp)
	    ? base.extend(comp)
	    : comp
	}

	function createAsyncPlaceholder (
	  factory,
	  data,
	  context,
	  children,
	  tag
	) {
	  var node = createEmptyVNode();
	  node.asyncFactory = factory;
	  node.asyncMeta = { data: data, context: context, children: children, tag: tag };
	  return node
	}

	function resolveAsyncComponent (
	  factory,
	  baseCtor,
	  context
	) {
	  if (isTrue(factory.error) && isDef(factory.errorComp)) {
	    return factory.errorComp
	  }

	  if (isDef(factory.resolved)) {
	    return factory.resolved
	  }

	  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
	    return factory.loadingComp
	  }

	  if (isDef(factory.contexts)) {
	    // already pending
	    factory.contexts.push(context);
	  } else {
	    var contexts = factory.contexts = [context];
	    var sync = true;

	    var forceRender = function () {
	      for (var i = 0, l = contexts.length; i < l; i++) {
	        contexts[i].$forceUpdate();
	      }
	    };

	    var resolve = once(function (res) {
	      // cache resolved
	      factory.resolved = ensureCtor(res, baseCtor);
	      // invoke callbacks only if this is not a synchronous resolve
	      // (async resolves are shimmed as synchronous during SSR)
	      if (!sync) {
	        forceRender();
	      }
	    });

	    var reject = once(function (reason) {
	      ("production") !== 'production' && warn(
	        "Failed to resolve async component: " + (String(factory)) +
	        (reason ? ("\nReason: " + reason) : '')
	      );
	      if (isDef(factory.errorComp)) {
	        factory.error = true;
	        forceRender();
	      }
	    });

	    var res = factory(resolve, reject);

	    if (isObject(res)) {
	      if (typeof res.then === 'function') {
	        // () => Promise
	        if (isUndef(factory.resolved)) {
	          res.then(resolve, reject);
	        }
	      } else if (isDef(res.component) && typeof res.component.then === 'function') {
	        res.component.then(resolve, reject);

	        if (isDef(res.error)) {
	          factory.errorComp = ensureCtor(res.error, baseCtor);
	        }

	        if (isDef(res.loading)) {
	          factory.loadingComp = ensureCtor(res.loading, baseCtor);
	          if (res.delay === 0) {
	            factory.loading = true;
	          } else {
	            setTimeout(function () {
	              if (isUndef(factory.resolved) && isUndef(factory.error)) {
	                factory.loading = true;
	                forceRender();
	              }
	            }, res.delay || 200);
	          }
	        }

	        if (isDef(res.timeout)) {
	          setTimeout(function () {
	            if (isUndef(factory.resolved)) {
	              reject(
	                 false
	                  ? ("timeout (" + (res.timeout) + "ms)")
	                  : null
	              );
	            }
	          }, res.timeout);
	        }
	      }
	    }

	    sync = false;
	    // return in case resolved synchronously
	    return factory.loading
	      ? factory.loadingComp
	      : factory.resolved
	  }
	}

	/*  */

	function isAsyncPlaceholder (node) {
	  return node.isComment && node.asyncFactory
	}

	/*  */

	function getFirstComponentChild (children) {
	  if (Array.isArray(children)) {
	    for (var i = 0; i < children.length; i++) {
	      var c = children[i];
	      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
	        return c
	      }
	    }
	  }
	}

	/*  */

	/*  */

	function initEvents (vm) {
	  vm._events = Object.create(null);
	  vm._hasHookEvent = false;
	  // init parent attached events
	  var listeners = vm.$options._parentListeners;
	  if (listeners) {
	    updateComponentListeners(vm, listeners);
	  }
	}

	var target;

	function add (event, fn, once) {
	  if (once) {
	    target.$once(event, fn);
	  } else {
	    target.$on(event, fn);
	  }
	}

	function remove$1 (event, fn) {
	  target.$off(event, fn);
	}

	function updateComponentListeners (
	  vm,
	  listeners,
	  oldListeners
	) {
	  target = vm;
	  updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
	}

	function eventsMixin (Vue) {
	  var hookRE = /^hook:/;
	  Vue.prototype.$on = function (event, fn) {
	    var this$1 = this;

	    var vm = this;
	    if (Array.isArray(event)) {
	      for (var i = 0, l = event.length; i < l; i++) {
	        this$1.$on(event[i], fn);
	      }
	    } else {
	      (vm._events[event] || (vm._events[event] = [])).push(fn);
	      // optimize hook:event cost by using a boolean flag marked at registration
	      // instead of a hash lookup
	      if (hookRE.test(event)) {
	        vm._hasHookEvent = true;
	      }
	    }
	    return vm
	  };

	  Vue.prototype.$once = function (event, fn) {
	    var vm = this;
	    function on () {
	      vm.$off(event, on);
	      fn.apply(vm, arguments);
	    }
	    on.fn = fn;
	    vm.$on(event, on);
	    return vm
	  };

	  Vue.prototype.$off = function (event, fn) {
	    var this$1 = this;

	    var vm = this;
	    // all
	    if (!arguments.length) {
	      vm._events = Object.create(null);
	      return vm
	    }
	    // array of events
	    if (Array.isArray(event)) {
	      for (var i = 0, l = event.length; i < l; i++) {
	        this$1.$off(event[i], fn);
	      }
	      return vm
	    }
	    // specific event
	    var cbs = vm._events[event];
	    if (!cbs) {
	      return vm
	    }
	    if (arguments.length === 1) {
	      vm._events[event] = null;
	      return vm
	    }
	    if (fn) {
	      // specific handler
	      var cb;
	      var i$1 = cbs.length;
	      while (i$1--) {
	        cb = cbs[i$1];
	        if (cb === fn || cb.fn === fn) {
	          cbs.splice(i$1, 1);
	          break
	        }
	      }
	    }
	    return vm
	  };

	  Vue.prototype.$emit = function (event) {
	    var vm = this;
	    if (false) {
	      var lowerCaseEvent = event.toLowerCase();
	      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
	        tip(
	          "Event \"" + lowerCaseEvent + "\" is emitted in component " +
	          (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
	          "Note that HTML attributes are case-insensitive and you cannot use " +
	          "v-on to listen to camelCase events when using in-DOM templates. " +
	          "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
	        );
	      }
	    }
	    var cbs = vm._events[event];
	    if (cbs) {
	      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
	      var args = toArray(arguments, 1);
	      for (var i = 0, l = cbs.length; i < l; i++) {
	        try {
	          cbs[i].apply(vm, args);
	        } catch (e) {
	          handleError(e, vm, ("event handler for \"" + event + "\""));
	        }
	      }
	    }
	    return vm
	  };
	}

	/*  */

	/**
	 * Runtime helper for resolving raw children VNodes into a slot object.
	 */
	function resolveSlots (
	  children,
	  context
	) {
	  var slots = {};
	  if (!children) {
	    return slots
	  }
	  var defaultSlot = [];
	  for (var i = 0, l = children.length; i < l; i++) {
	    var child = children[i];
	    var data = child.data;
	    // remove slot attribute if the node is resolved as a Vue slot node
	    if (data && data.attrs && data.attrs.slot) {
	      delete data.attrs.slot;
	    }
	    // named slots should only be respected if the vnode was rendered in the
	    // same context.
	    if ((child.context === context || child.functionalContext === context) &&
	      data && data.slot != null
	    ) {
	      var name = child.data.slot;
	      var slot = (slots[name] || (slots[name] = []));
	      if (child.tag === 'template') {
	        slot.push.apply(slot, child.children);
	      } else {
	        slot.push(child);
	      }
	    } else {
	      defaultSlot.push(child);
	    }
	  }
	  // ignore whitespace
	  if (!defaultSlot.every(isWhitespace)) {
	    slots.default = defaultSlot;
	  }
	  return slots
	}

	function isWhitespace (node) {
	  return node.isComment || node.text === ' '
	}

	function resolveScopedSlots (
	  fns, // see flow/vnode
	  res
	) {
	  res = res || {};
	  for (var i = 0; i < fns.length; i++) {
	    if (Array.isArray(fns[i])) {
	      resolveScopedSlots(fns[i], res);
	    } else {
	      res[fns[i].key] = fns[i].fn;
	    }
	  }
	  return res
	}

	/*  */

	var activeInstance = null;
	var isUpdatingChildComponent = false;

	function initLifecycle (vm) {
	  var options = vm.$options;

	  // locate first non-abstract parent
	  var parent = options.parent;
	  if (parent && !options.abstract) {
	    while (parent.$options.abstract && parent.$parent) {
	      parent = parent.$parent;
	    }
	    parent.$children.push(vm);
	  }

	  vm.$parent = parent;
	  vm.$root = parent ? parent.$root : vm;

	  vm.$children = [];
	  vm.$refs = {};

	  vm._watcher = null;
	  vm._inactive = null;
	  vm._directInactive = false;
	  vm._isMounted = false;
	  vm._isDestroyed = false;
	  vm._isBeingDestroyed = false;
	}

	function lifecycleMixin (Vue) {
	  Vue.prototype._update = function (vnode, hydrating) {
	    var vm = this;
	    if (vm._isMounted) {
	      callHook(vm, 'beforeUpdate');
	    }
	    var prevEl = vm.$el;
	    var prevVnode = vm._vnode;
	    var prevActiveInstance = activeInstance;
	    activeInstance = vm;
	    vm._vnode = vnode;
	    // Vue.prototype.__patch__ is injected in entry points
	    // based on the rendering backend used.
	    if (!prevVnode) {
	      // initial render
	      vm.$el = vm.__patch__(
	        vm.$el, vnode, hydrating, false /* removeOnly */,
	        vm.$options._parentElm,
	        vm.$options._refElm
	      );
	      // no need for the ref nodes after initial patch
	      // this prevents keeping a detached DOM tree in memory (#5851)
	      vm.$options._parentElm = vm.$options._refElm = null;
	    } else {
	      // updates
	      vm.$el = vm.__patch__(prevVnode, vnode);
	    }
	    activeInstance = prevActiveInstance;
	    // update __vue__ reference
	    if (prevEl) {
	      prevEl.__vue__ = null;
	    }
	    if (vm.$el) {
	      vm.$el.__vue__ = vm;
	    }
	    // if parent is an HOC, update its $el as well
	    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
	      vm.$parent.$el = vm.$el;
	    }
	    // updated hook is called by the scheduler to ensure that children are
	    // updated in a parent's updated hook.
	  };

	  Vue.prototype.$forceUpdate = function () {
	    var vm = this;
	    if (vm._watcher) {
	      vm._watcher.update();
	    }
	  };

	  Vue.prototype.$destroy = function () {
	    var vm = this;
	    if (vm._isBeingDestroyed) {
	      return
	    }
	    callHook(vm, 'beforeDestroy');
	    vm._isBeingDestroyed = true;
	    // remove self from parent
	    var parent = vm.$parent;
	    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
	      remove(parent.$children, vm);
	    }
	    // teardown watchers
	    if (vm._watcher) {
	      vm._watcher.teardown();
	    }
	    var i = vm._watchers.length;
	    while (i--) {
	      vm._watchers[i].teardown();
	    }
	    // remove reference from data ob
	    // frozen object may not have observer.
	    if (vm._data.__ob__) {
	      vm._data.__ob__.vmCount--;
	    }
	    // call the last hook...
	    vm._isDestroyed = true;
	    // invoke destroy hooks on current rendered tree
	    vm.__patch__(vm._vnode, null);
	    // fire destroyed hook
	    callHook(vm, 'destroyed');
	    // turn off all instance listeners.
	    vm.$off();
	    // remove __vue__ reference
	    if (vm.$el) {
	      vm.$el.__vue__ = null;
	    }
	    // release circular reference (#6759)
	    if (vm.$vnode) {
	      vm.$vnode.parent = null;
	    }
	  };
	}

	function mountComponent (
	  vm,
	  el,
	  hydrating
	) {
	  vm.$el = el;
	  if (!vm.$options.render) {
	    vm.$options.render = createEmptyVNode;
	    if (false) {
	      /* istanbul ignore if */
	      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
	        vm.$options.el || el) {
	        warn(
	          'You are using the runtime-only build of Vue where the template ' +
	          'compiler is not available. Either pre-compile the templates into ' +
	          'render functions, or use the compiler-included build.',
	          vm
	        );
	      } else {
	        warn(
	          'Failed to mount component: template or render function not defined.',
	          vm
	        );
	      }
	    }
	  }
	  callHook(vm, 'beforeMount');

	  var updateComponent;
	  /* istanbul ignore if */
	  if (false) {
	    updateComponent = function () {
	      var name = vm._name;
	      var id = vm._uid;
	      var startTag = "vue-perf-start:" + id;
	      var endTag = "vue-perf-end:" + id;

	      mark(startTag);
	      var vnode = vm._render();
	      mark(endTag);
	      measure(("vue " + name + " render"), startTag, endTag);

	      mark(startTag);
	      vm._update(vnode, hydrating);
	      mark(endTag);
	      measure(("vue " + name + " patch"), startTag, endTag);
	    };
	  } else {
	    updateComponent = function () {
	      vm._update(vm._render(), hydrating);
	    };
	  }

	  vm._watcher = new Watcher(vm, updateComponent, noop);
	  hydrating = false;

	  // manually mounted instance, call mounted on self
	  // mounted is called for render-created child components in its inserted hook
	  if (vm.$vnode == null) {
	    vm._isMounted = true;
	    callHook(vm, 'mounted');
	  }
	  return vm
	}

	function updateChildComponent (
	  vm,
	  propsData,
	  listeners,
	  parentVnode,
	  renderChildren
	) {
	  if (false) {
	    isUpdatingChildComponent = true;
	  }

	  // determine whether component has slot children
	  // we need to do this before overwriting $options._renderChildren
	  var hasChildren = !!(
	    renderChildren ||               // has new static slots
	    vm.$options._renderChildren ||  // has old static slots
	    parentVnode.data.scopedSlots || // has new scoped slots
	    vm.$scopedSlots !== emptyObject // has old scoped slots
	  );

	  vm.$options._parentVnode = parentVnode;
	  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

	  if (vm._vnode) { // update child tree's parent
	    vm._vnode.parent = parentVnode;
	  }
	  vm.$options._renderChildren = renderChildren;

	  // update $attrs and $listeners hash
	  // these are also reactive so they may trigger child update if the child
	  // used them during render
	  vm.$attrs = (parentVnode.data && parentVnode.data.attrs) || emptyObject;
	  vm.$listeners = listeners || emptyObject;

	  // update props
	  if (propsData && vm.$options.props) {
	    observerState.shouldConvert = false;
	    var props = vm._props;
	    var propKeys = vm.$options._propKeys || [];
	    for (var i = 0; i < propKeys.length; i++) {
	      var key = propKeys[i];
	      props[key] = validateProp(key, vm.$options.props, propsData, vm);
	    }
	    observerState.shouldConvert = true;
	    // keep a copy of raw propsData
	    vm.$options.propsData = propsData;
	  }

	  // update listeners
	  if (listeners) {
	    var oldListeners = vm.$options._parentListeners;
	    vm.$options._parentListeners = listeners;
	    updateComponentListeners(vm, listeners, oldListeners);
	  }
	  // resolve slots + force update if has children
	  if (hasChildren) {
	    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
	    vm.$forceUpdate();
	  }

	  if (false) {
	    isUpdatingChildComponent = false;
	  }
	}

	function isInInactiveTree (vm) {
	  while (vm && (vm = vm.$parent)) {
	    if (vm._inactive) { return true }
	  }
	  return false
	}

	function activateChildComponent (vm, direct) {
	  if (direct) {
	    vm._directInactive = false;
	    if (isInInactiveTree(vm)) {
	      return
	    }
	  } else if (vm._directInactive) {
	    return
	  }
	  if (vm._inactive || vm._inactive === null) {
	    vm._inactive = false;
	    for (var i = 0; i < vm.$children.length; i++) {
	      activateChildComponent(vm.$children[i]);
	    }
	    callHook(vm, 'activated');
	  }
	}

	function deactivateChildComponent (vm, direct) {
	  if (direct) {
	    vm._directInactive = true;
	    if (isInInactiveTree(vm)) {
	      return
	    }
	  }
	  if (!vm._inactive) {
	    vm._inactive = true;
	    for (var i = 0; i < vm.$children.length; i++) {
	      deactivateChildComponent(vm.$children[i]);
	    }
	    callHook(vm, 'deactivated');
	  }
	}

	function callHook (vm, hook) {
	  var handlers = vm.$options[hook];
	  if (handlers) {
	    for (var i = 0, j = handlers.length; i < j; i++) {
	      try {
	        handlers[i].call(vm);
	      } catch (e) {
	        handleError(e, vm, (hook + " hook"));
	      }
	    }
	  }
	  if (vm._hasHookEvent) {
	    vm.$emit('hook:' + hook);
	  }
	}

	/*  */


	var MAX_UPDATE_COUNT = 100;

	var queue = [];
	var activatedChildren = [];
	var has = {};
	var circular = {};
	var waiting = false;
	var flushing = false;
	var index = 0;

	/**
	 * Reset the scheduler's state.
	 */
	function resetSchedulerState () {
	  index = queue.length = activatedChildren.length = 0;
	  has = {};
	  if (false) {
	    circular = {};
	  }
	  waiting = flushing = false;
	}

	/**
	 * Flush both queues and run the watchers.
	 */
	function flushSchedulerQueue () {
	  flushing = true;
	  var watcher, id;

	  // Sort queue before flush.
	  // This ensures that:
	  // 1. Components are updated from parent to child. (because parent is always
	  //    created before the child)
	  // 2. A component's user watchers are run before its render watcher (because
	  //    user watchers are created before the render watcher)
	  // 3. If a component is destroyed during a parent component's watcher run,
	  //    its watchers can be skipped.
	  queue.sort(function (a, b) { return a.id - b.id; });

	  // do not cache length because more watchers might be pushed
	  // as we run existing watchers
	  for (index = 0; index < queue.length; index++) {
	    watcher = queue[index];
	    id = watcher.id;
	    has[id] = null;
	    watcher.run();
	    // in dev build, check and stop circular updates.
	    if (false) {
	      circular[id] = (circular[id] || 0) + 1;
	      if (circular[id] > MAX_UPDATE_COUNT) {
	        warn(
	          'You may have an infinite update loop ' + (
	            watcher.user
	              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
	              : "in a component render function."
	          ),
	          watcher.vm
	        );
	        break
	      }
	    }
	  }

	  // keep copies of post queues before resetting state
	  var activatedQueue = activatedChildren.slice();
	  var updatedQueue = queue.slice();

	  resetSchedulerState();

	  // call component updated and activated hooks
	  callActivatedHooks(activatedQueue);
	  callUpdatedHooks(updatedQueue);

	  // devtool hook
	  /* istanbul ignore if */
	  if (devtools && config.devtools) {
	    devtools.emit('flush');
	  }
	}

	function callUpdatedHooks (queue) {
	  var i = queue.length;
	  while (i--) {
	    var watcher = queue[i];
	    var vm = watcher.vm;
	    if (vm._watcher === watcher && vm._isMounted) {
	      callHook(vm, 'updated');
	    }
	  }
	}

	/**
	 * Queue a kept-alive component that was activated during patch.
	 * The queue will be processed after the entire tree has been patched.
	 */
	function queueActivatedComponent (vm) {
	  // setting _inactive to false here so that a render function can
	  // rely on checking whether it's in an inactive tree (e.g. router-view)
	  vm._inactive = false;
	  activatedChildren.push(vm);
	}

	function callActivatedHooks (queue) {
	  for (var i = 0; i < queue.length; i++) {
	    queue[i]._inactive = true;
	    activateChildComponent(queue[i], true /* true */);
	  }
	}

	/**
	 * Push a watcher into the watcher queue.
	 * Jobs with duplicate IDs will be skipped unless it's
	 * pushed when the queue is being flushed.
	 */
	function queueWatcher (watcher) {
	  var id = watcher.id;
	  if (has[id] == null) {
	    has[id] = true;
	    if (!flushing) {
	      queue.push(watcher);
	    } else {
	      // if already flushing, splice the watcher based on its id
	      // if already past its id, it will be run next immediately.
	      var i = queue.length - 1;
	      while (i > index && queue[i].id > watcher.id) {
	        i--;
	      }
	      queue.splice(i + 1, 0, watcher);
	    }
	    // queue the flush
	    if (!waiting) {
	      waiting = true;
	      nextTick(flushSchedulerQueue);
	    }
	  }
	}

	/*  */

	var uid$2 = 0;

	/**
	 * A watcher parses an expression, collects dependencies,
	 * and fires callback when the expression value changes.
	 * This is used for both the $watch() api and directives.
	 */
	var Watcher = function Watcher (
	  vm,
	  expOrFn,
	  cb,
	  options
	) {
	  this.vm = vm;
	  vm._watchers.push(this);
	  // options
	  if (options) {
	    this.deep = !!options.deep;
	    this.user = !!options.user;
	    this.lazy = !!options.lazy;
	    this.sync = !!options.sync;
	  } else {
	    this.deep = this.user = this.lazy = this.sync = false;
	  }
	  this.cb = cb;
	  this.id = ++uid$2; // uid for batching
	  this.active = true;
	  this.dirty = this.lazy; // for lazy watchers
	  this.deps = [];
	  this.newDeps = [];
	  this.depIds = new _Set();
	  this.newDepIds = new _Set();
	  this.expression =  false
	    ? expOrFn.toString()
	    : '';
	  // parse expression for getter
	  if (typeof expOrFn === 'function') {
	    this.getter = expOrFn;
	  } else {
	    this.getter = parsePath(expOrFn);
	    if (!this.getter) {
	      this.getter = function () {};
	      ("production") !== 'production' && warn(
	        "Failed watching path: \"" + expOrFn + "\" " +
	        'Watcher only accepts simple dot-delimited paths. ' +
	        'For full control, use a function instead.',
	        vm
	      );
	    }
	  }
	  this.value = this.lazy
	    ? undefined
	    : this.get();
	};

	/**
	 * Evaluate the getter, and re-collect dependencies.
	 */
	Watcher.prototype.get = function get () {
	  pushTarget(this);
	  var value;
	  var vm = this.vm;
	  try {
	    value = this.getter.call(vm, vm);
	  } catch (e) {
	    if (this.user) {
	      handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
	    } else {
	      throw e
	    }
	  } finally {
	    // "touch" every property so they are all tracked as
	    // dependencies for deep watching
	    if (this.deep) {
	      traverse(value);
	    }
	    popTarget();
	    this.cleanupDeps();
	  }
	  return value
	};

	/**
	 * Add a dependency to this directive.
	 */
	Watcher.prototype.addDep = function addDep (dep) {
	  var id = dep.id;
	  if (!this.newDepIds.has(id)) {
	    this.newDepIds.add(id);
	    this.newDeps.push(dep);
	    if (!this.depIds.has(id)) {
	      dep.addSub(this);
	    }
	  }
	};

	/**
	 * Clean up for dependency collection.
	 */
	Watcher.prototype.cleanupDeps = function cleanupDeps () {
	    var this$1 = this;

	  var i = this.deps.length;
	  while (i--) {
	    var dep = this$1.deps[i];
	    if (!this$1.newDepIds.has(dep.id)) {
	      dep.removeSub(this$1);
	    }
	  }
	  var tmp = this.depIds;
	  this.depIds = this.newDepIds;
	  this.newDepIds = tmp;
	  this.newDepIds.clear();
	  tmp = this.deps;
	  this.deps = this.newDeps;
	  this.newDeps = tmp;
	  this.newDeps.length = 0;
	};

	/**
	 * Subscriber interface.
	 * Will be called when a dependency changes.
	 */
	Watcher.prototype.update = function update () {
	  /* istanbul ignore else */
	  if (this.lazy) {
	    this.dirty = true;
	  } else if (this.sync) {
	    this.run();
	  } else {
	    queueWatcher(this);
	  }
	};

	/**
	 * Scheduler job interface.
	 * Will be called by the scheduler.
	 */
	Watcher.prototype.run = function run () {
	  if (this.active) {
	    var value = this.get();
	    if (
	      value !== this.value ||
	      // Deep watchers and watchers on Object/Arrays should fire even
	      // when the value is the same, because the value may
	      // have mutated.
	      isObject(value) ||
	      this.deep
	    ) {
	      // set new value
	      var oldValue = this.value;
	      this.value = value;
	      if (this.user) {
	        try {
	          this.cb.call(this.vm, value, oldValue);
	        } catch (e) {
	          handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
	        }
	      } else {
	        this.cb.call(this.vm, value, oldValue);
	      }
	    }
	  }
	};

	/**
	 * Evaluate the value of the watcher.
	 * This only gets called for lazy watchers.
	 */
	Watcher.prototype.evaluate = function evaluate () {
	  this.value = this.get();
	  this.dirty = false;
	};

	/**
	 * Depend on all deps collected by this watcher.
	 */
	Watcher.prototype.depend = function depend () {
	    var this$1 = this;

	  var i = this.deps.length;
	  while (i--) {
	    this$1.deps[i].depend();
	  }
	};

	/**
	 * Remove self from all dependencies' subscriber list.
	 */
	Watcher.prototype.teardown = function teardown () {
	    var this$1 = this;

	  if (this.active) {
	    // remove self from vm's watcher list
	    // this is a somewhat expensive operation so we skip it
	    // if the vm is being destroyed.
	    if (!this.vm._isBeingDestroyed) {
	      remove(this.vm._watchers, this);
	    }
	    var i = this.deps.length;
	    while (i--) {
	      this$1.deps[i].removeSub(this$1);
	    }
	    this.active = false;
	  }
	};

	/**
	 * Recursively traverse an object to evoke all converted
	 * getters, so that every nested property inside the object
	 * is collected as a "deep" dependency.
	 */
	var seenObjects = new _Set();
	function traverse (val) {
	  seenObjects.clear();
	  _traverse(val, seenObjects);
	}

	function _traverse (val, seen) {
	  var i, keys;
	  var isA = Array.isArray(val);
	  if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
	    return
	  }
	  if (val.__ob__) {
	    var depId = val.__ob__.dep.id;
	    if (seen.has(depId)) {
	      return
	    }
	    seen.add(depId);
	  }
	  if (isA) {
	    i = val.length;
	    while (i--) { _traverse(val[i], seen); }
	  } else {
	    keys = Object.keys(val);
	    i = keys.length;
	    while (i--) { _traverse(val[keys[i]], seen); }
	  }
	}

	/*  */

	var sharedPropertyDefinition = {
	  enumerable: true,
	  configurable: true,
	  get: noop,
	  set: noop
	};

	function proxy (target, sourceKey, key) {
	  sharedPropertyDefinition.get = function proxyGetter () {
	    return this[sourceKey][key]
	  };
	  sharedPropertyDefinition.set = function proxySetter (val) {
	    this[sourceKey][key] = val;
	  };
	  Object.defineProperty(target, key, sharedPropertyDefinition);
	}

	function initState (vm) {
	  vm._watchers = [];
	  var opts = vm.$options;
	  if (opts.props) { initProps(vm, opts.props); }
	  if (opts.methods) { initMethods(vm, opts.methods); }
	  if (opts.data) {
	    initData(vm);
	  } else {
	    observe(vm._data = {}, true /* asRootData */);
	  }
	  if (opts.computed) { initComputed(vm, opts.computed); }
	  if (opts.watch && opts.watch !== nativeWatch) {
	    initWatch(vm, opts.watch);
	  }
	}

	function initProps (vm, propsOptions) {
	  var propsData = vm.$options.propsData || {};
	  var props = vm._props = {};
	  // cache prop keys so that future props updates can iterate using Array
	  // instead of dynamic object key enumeration.
	  var keys = vm.$options._propKeys = [];
	  var isRoot = !vm.$parent;
	  // root instance props should be converted
	  observerState.shouldConvert = isRoot;
	  var loop = function ( key ) {
	    keys.push(key);
	    var value = validateProp(key, propsOptions, propsData, vm);
	    /* istanbul ignore else */
	    if (false) {
	      var hyphenatedKey = hyphenate(key);
	      if (isReservedAttribute(hyphenatedKey) ||
	          config.isReservedAttr(hyphenatedKey)) {
	        warn(
	          ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
	          vm
	        );
	      }
	      defineReactive(props, key, value, function () {
	        if (vm.$parent && !isUpdatingChildComponent) {
	          warn(
	            "Avoid mutating a prop directly since the value will be " +
	            "overwritten whenever the parent component re-renders. " +
	            "Instead, use a data or computed property based on the prop's " +
	            "value. Prop being mutated: \"" + key + "\"",
	            vm
	          );
	        }
	      });
	    } else {
	      defineReactive(props, key, value);
	    }
	    // static props are already proxied on the component's prototype
	    // during Vue.extend(). We only need to proxy props defined at
	    // instantiation here.
	    if (!(key in vm)) {
	      proxy(vm, "_props", key);
	    }
	  };

	  for (var key in propsOptions) loop( key );
	  observerState.shouldConvert = true;
	}

	function initData (vm) {
	  var data = vm.$options.data;
	  data = vm._data = typeof data === 'function'
	    ? getData(data, vm)
	    : data || {};
	  if (!isPlainObject(data)) {
	    data = {};
	    ("production") !== 'production' && warn(
	      'data functions should return an object:\n' +
	      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
	      vm
	    );
	  }
	  // proxy data on instance
	  var keys = Object.keys(data);
	  var props = vm.$options.props;
	  var methods = vm.$options.methods;
	  var i = keys.length;
	  while (i--) {
	    var key = keys[i];
	    if (false) {
	      if (methods && hasOwn(methods, key)) {
	        warn(
	          ("Method \"" + key + "\" has already been defined as a data property."),
	          vm
	        );
	      }
	    }
	    if (props && hasOwn(props, key)) {
	      ("production") !== 'production' && warn(
	        "The data property \"" + key + "\" is already declared as a prop. " +
	        "Use prop default value instead.",
	        vm
	      );
	    } else if (!isReserved(key)) {
	      proxy(vm, "_data", key);
	    }
	  }
	  // observe data
	  observe(data, true /* asRootData */);
	}

	function getData (data, vm) {
	  try {
	    return data.call(vm, vm)
	  } catch (e) {
	    handleError(e, vm, "data()");
	    return {}
	  }
	}

	var computedWatcherOptions = { lazy: true };

	function initComputed (vm, computed) {
	  var watchers = vm._computedWatchers = Object.create(null);
	  // computed properties are just getters during SSR
	  var isSSR = isServerRendering();

	  for (var key in computed) {
	    var userDef = computed[key];
	    var getter = typeof userDef === 'function' ? userDef : userDef.get;
	    if (false) {
	      warn(
	        ("Getter is missing for computed property \"" + key + "\"."),
	        vm
	      );
	    }

	    if (!isSSR) {
	      // create internal watcher for the computed property.
	      watchers[key] = new Watcher(
	        vm,
	        getter || noop,
	        noop,
	        computedWatcherOptions
	      );
	    }

	    // component-defined computed properties are already defined on the
	    // component prototype. We only need to define computed properties defined
	    // at instantiation here.
	    if (!(key in vm)) {
	      defineComputed(vm, key, userDef);
	    } else if (false) {
	      if (key in vm.$data) {
	        warn(("The computed property \"" + key + "\" is already defined in data."), vm);
	      } else if (vm.$options.props && key in vm.$options.props) {
	        warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
	      }
	    }
	  }
	}

	function defineComputed (
	  target,
	  key,
	  userDef
	) {
	  var shouldCache = !isServerRendering();
	  if (typeof userDef === 'function') {
	    sharedPropertyDefinition.get = shouldCache
	      ? createComputedGetter(key)
	      : userDef;
	    sharedPropertyDefinition.set = noop;
	  } else {
	    sharedPropertyDefinition.get = userDef.get
	      ? shouldCache && userDef.cache !== false
	        ? createComputedGetter(key)
	        : userDef.get
	      : noop;
	    sharedPropertyDefinition.set = userDef.set
	      ? userDef.set
	      : noop;
	  }
	  if (false) {
	    sharedPropertyDefinition.set = function () {
	      warn(
	        ("Computed property \"" + key + "\" was assigned to but it has no setter."),
	        this
	      );
	    };
	  }
	  Object.defineProperty(target, key, sharedPropertyDefinition);
	}

	function createComputedGetter (key) {
	  return function computedGetter () {
	    var watcher = this._computedWatchers && this._computedWatchers[key];
	    if (watcher) {
	      if (watcher.dirty) {
	        watcher.evaluate();
	      }
	      if (Dep.target) {
	        watcher.depend();
	      }
	      return watcher.value
	    }
	  }
	}

	function initMethods (vm, methods) {
	  var props = vm.$options.props;
	  for (var key in methods) {
	    if (false) {
	      if (methods[key] == null) {
	        warn(
	          "Method \"" + key + "\" has an undefined value in the component definition. " +
	          "Did you reference the function correctly?",
	          vm
	        );
	      }
	      if (props && hasOwn(props, key)) {
	        warn(
	          ("Method \"" + key + "\" has already been defined as a prop."),
	          vm
	        );
	      }
	      if ((key in vm) && isReserved(key)) {
	        warn(
	          "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
	          "Avoid defining component methods that start with _ or $."
	        );
	      }
	    }
	    vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
	  }
	}

	function initWatch (vm, watch) {
	  for (var key in watch) {
	    var handler = watch[key];
	    if (Array.isArray(handler)) {
	      for (var i = 0; i < handler.length; i++) {
	        createWatcher(vm, key, handler[i]);
	      }
	    } else {
	      createWatcher(vm, key, handler);
	    }
	  }
	}

	function createWatcher (
	  vm,
	  keyOrFn,
	  handler,
	  options
	) {
	  if (isPlainObject(handler)) {
	    options = handler;
	    handler = handler.handler;
	  }
	  if (typeof handler === 'string') {
	    handler = vm[handler];
	  }
	  return vm.$watch(keyOrFn, handler, options)
	}

	function stateMixin (Vue) {
	  // flow somehow has problems with directly declared definition object
	  // when using Object.defineProperty, so we have to procedurally build up
	  // the object here.
	  var dataDef = {};
	  dataDef.get = function () { return this._data };
	  var propsDef = {};
	  propsDef.get = function () { return this._props };
	  if (false) {
	    dataDef.set = function (newData) {
	      warn(
	        'Avoid replacing instance root $data. ' +
	        'Use nested data properties instead.',
	        this
	      );
	    };
	    propsDef.set = function () {
	      warn("$props is readonly.", this);
	    };
	  }
	  Object.defineProperty(Vue.prototype, '$data', dataDef);
	  Object.defineProperty(Vue.prototype, '$props', propsDef);

	  Vue.prototype.$set = set;
	  Vue.prototype.$delete = del;

	  Vue.prototype.$watch = function (
	    expOrFn,
	    cb,
	    options
	  ) {
	    var vm = this;
	    if (isPlainObject(cb)) {
	      return createWatcher(vm, expOrFn, cb, options)
	    }
	    options = options || {};
	    options.user = true;
	    var watcher = new Watcher(vm, expOrFn, cb, options);
	    if (options.immediate) {
	      cb.call(vm, watcher.value);
	    }
	    return function unwatchFn () {
	      watcher.teardown();
	    }
	  };
	}

	/*  */

	function initProvide (vm) {
	  var provide = vm.$options.provide;
	  if (provide) {
	    vm._provided = typeof provide === 'function'
	      ? provide.call(vm)
	      : provide;
	  }
	}

	function initInjections (vm) {
	  var result = resolveInject(vm.$options.inject, vm);
	  if (result) {
	    observerState.shouldConvert = false;
	    Object.keys(result).forEach(function (key) {
	      /* istanbul ignore else */
	      if (false) {
	        defineReactive(vm, key, result[key], function () {
	          warn(
	            "Avoid mutating an injected value directly since the changes will be " +
	            "overwritten whenever the provided component re-renders. " +
	            "injection being mutated: \"" + key + "\"",
	            vm
	          );
	        });
	      } else {
	        defineReactive(vm, key, result[key]);
	      }
	    });
	    observerState.shouldConvert = true;
	  }
	}

	function resolveInject (inject, vm) {
	  if (inject) {
	    // inject is :any because flow is not smart enough to figure out cached
	    var result = Object.create(null);
	    var keys = hasSymbol
	        ? Reflect.ownKeys(inject).filter(function (key) {
	          /* istanbul ignore next */
	          return Object.getOwnPropertyDescriptor(inject, key).enumerable
	        })
	        : Object.keys(inject);

	    for (var i = 0; i < keys.length; i++) {
	      var key = keys[i];
	      var provideKey = inject[key].from;
	      var source = vm;
	      while (source) {
	        if (source._provided && provideKey in source._provided) {
	          result[key] = source._provided[provideKey];
	          break
	        }
	        source = source.$parent;
	      }
	      if (!source) {
	        if ('default' in inject[key]) {
	          var provideDefault = inject[key].default;
	          result[key] = typeof provideDefault === 'function'
	            ? provideDefault.call(vm)
	            : provideDefault;
	        } else if (false) {
	          warn(("Injection \"" + key + "\" not found"), vm);
	        }
	      }
	    }
	    return result
	  }
	}

	/*  */

	/**
	 * Runtime helper for rendering v-for lists.
	 */
	function renderList (
	  val,
	  render
	) {
	  var ret, i, l, keys, key;
	  if (Array.isArray(val) || typeof val === 'string') {
	    ret = new Array(val.length);
	    for (i = 0, l = val.length; i < l; i++) {
	      ret[i] = render(val[i], i);
	    }
	  } else if (typeof val === 'number') {
	    ret = new Array(val);
	    for (i = 0; i < val; i++) {
	      ret[i] = render(i + 1, i);
	    }
	  } else if (isObject(val)) {
	    keys = Object.keys(val);
	    ret = new Array(keys.length);
	    for (i = 0, l = keys.length; i < l; i++) {
	      key = keys[i];
	      ret[i] = render(val[key], key, i);
	    }
	  }
	  if (isDef(ret)) {
	    (ret)._isVList = true;
	  }
	  return ret
	}

	/*  */

	/**
	 * Runtime helper for rendering <slot>
	 */
	function renderSlot (
	  name,
	  fallback,
	  props,
	  bindObject
	) {
	  var scopedSlotFn = this.$scopedSlots[name];
	  if (scopedSlotFn) { // scoped slot
	    props = props || {};
	    if (bindObject) {
	      if (false) {
	        warn(
	          'slot v-bind without argument expects an Object',
	          this
	        );
	      }
	      props = extend(extend({}, bindObject), props);
	    }
	    return scopedSlotFn(props) || fallback
	  } else {
	    var slotNodes = this.$slots[name];
	    // warn duplicate slot usage
	    if (slotNodes && ("production") !== 'production') {
	      slotNodes._rendered && warn(
	        "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
	        "- this will likely cause render errors.",
	        this
	      );
	      slotNodes._rendered = true;
	    }
	    return slotNodes || fallback
	  }
	}

	/*  */

	/**
	 * Runtime helper for resolving filters
	 */
	function resolveFilter (id) {
	  return resolveAsset(this.$options, 'filters', id, true) || identity
	}

	/*  */

	/**
	 * Runtime helper for checking keyCodes from config.
	 * exposed as Vue.prototype._k
	 * passing in eventKeyName as last argument separately for backwards compat
	 */
	function checkKeyCodes (
	  eventKeyCode,
	  key,
	  builtInAlias,
	  eventKeyName
	) {
	  var keyCodes = config.keyCodes[key] || builtInAlias;
	  if (keyCodes) {
	    if (Array.isArray(keyCodes)) {
	      return keyCodes.indexOf(eventKeyCode) === -1
	    } else {
	      return keyCodes !== eventKeyCode
	    }
	  } else if (eventKeyName) {
	    return hyphenate(eventKeyName) !== key
	  }
	}

	/*  */

	/**
	 * Runtime helper for merging v-bind="object" into a VNode's data.
	 */
	function bindObjectProps (
	  data,
	  tag,
	  value,
	  asProp,
	  isSync
	) {
	  if (value) {
	    if (!isObject(value)) {
	      ("production") !== 'production' && warn(
	        'v-bind without argument expects an Object or Array value',
	        this
	      );
	    } else {
	      if (Array.isArray(value)) {
	        value = toObject(value);
	      }
	      var hash;
	      var loop = function ( key ) {
	        if (
	          key === 'class' ||
	          key === 'style' ||
	          isReservedAttribute(key)
	        ) {
	          hash = data;
	        } else {
	          var type = data.attrs && data.attrs.type;
	          hash = asProp || config.mustUseProp(tag, type, key)
	            ? data.domProps || (data.domProps = {})
	            : data.attrs || (data.attrs = {});
	        }
	        if (!(key in hash)) {
	          hash[key] = value[key];

	          if (isSync) {
	            var on = data.on || (data.on = {});
	            on[("update:" + key)] = function ($event) {
	              value[key] = $event;
	            };
	          }
	        }
	      };

	      for (var key in value) loop( key );
	    }
	  }
	  return data
	}

	/*  */

	/**
	 * Runtime helper for rendering static trees.
	 */
	function renderStatic (
	  index,
	  isInFor
	) {
	  // static trees can be rendered once and cached on the contructor options
	  // so every instance shares the same cached trees
	  var renderFns = this.$options.staticRenderFns;
	  var cached = renderFns.cached || (renderFns.cached = []);
	  var tree = cached[index];
	  // if has already-rendered static tree and not inside v-for,
	  // we can reuse the same tree by doing a shallow clone.
	  if (tree && !isInFor) {
	    return Array.isArray(tree)
	      ? cloneVNodes(tree)
	      : cloneVNode(tree)
	  }
	  // otherwise, render a fresh tree.
	  tree = cached[index] = renderFns[index].call(this._renderProxy, null, this);
	  markStatic(tree, ("__static__" + index), false);
	  return tree
	}

	/**
	 * Runtime helper for v-once.
	 * Effectively it means marking the node as static with a unique key.
	 */
	function markOnce (
	  tree,
	  index,
	  key
	) {
	  markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
	  return tree
	}

	function markStatic (
	  tree,
	  key,
	  isOnce
	) {
	  if (Array.isArray(tree)) {
	    for (var i = 0; i < tree.length; i++) {
	      if (tree[i] && typeof tree[i] !== 'string') {
	        markStaticNode(tree[i], (key + "_" + i), isOnce);
	      }
	    }
	  } else {
	    markStaticNode(tree, key, isOnce);
	  }
	}

	function markStaticNode (node, key, isOnce) {
	  node.isStatic = true;
	  node.key = key;
	  node.isOnce = isOnce;
	}

	/*  */

	function bindObjectListeners (data, value) {
	  if (value) {
	    if (!isPlainObject(value)) {
	      ("production") !== 'production' && warn(
	        'v-on without argument expects an Object value',
	        this
	      );
	    } else {
	      var on = data.on = data.on ? extend({}, data.on) : {};
	      for (var key in value) {
	        var existing = on[key];
	        var ours = value[key];
	        on[key] = existing ? [].concat(existing, ours) : ours;
	      }
	    }
	  }
	  return data
	}

	/*  */

	function installRenderHelpers (target) {
	  target._o = markOnce;
	  target._n = toNumber;
	  target._s = toString;
	  target._l = renderList;
	  target._t = renderSlot;
	  target._q = looseEqual;
	  target._i = looseIndexOf;
	  target._m = renderStatic;
	  target._f = resolveFilter;
	  target._k = checkKeyCodes;
	  target._b = bindObjectProps;
	  target._v = createTextVNode;
	  target._e = createEmptyVNode;
	  target._u = resolveScopedSlots;
	  target._g = bindObjectListeners;
	}

	/*  */

	function FunctionalRenderContext (
	  data,
	  props,
	  children,
	  parent,
	  Ctor
	) {
	  var options = Ctor.options;
	  this.data = data;
	  this.props = props;
	  this.children = children;
	  this.parent = parent;
	  this.listeners = data.on || emptyObject;
	  this.injections = resolveInject(options.inject, parent);
	  this.slots = function () { return resolveSlots(children, parent); };

	  // ensure the createElement function in functional components
	  // gets a unique context - this is necessary for correct named slot check
	  var contextVm = Object.create(parent);
	  var isCompiled = isTrue(options._compiled);
	  var needNormalization = !isCompiled;

	  // support for compiled functional template
	  if (isCompiled) {
	    // exposing $options for renderStatic()
	    this.$options = options;
	    // pre-resolve slots for renderSlot()
	    this.$slots = this.slots();
	    this.$scopedSlots = data.scopedSlots || emptyObject;
	  }

	  if (options._scopeId) {
	    this._c = function (a, b, c, d) {
	      var vnode = createElement(contextVm, a, b, c, d, needNormalization);
	      if (vnode) {
	        vnode.functionalScopeId = options._scopeId;
	        vnode.functionalContext = parent;
	      }
	      return vnode
	    };
	  } else {
	    this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
	  }
	}

	installRenderHelpers(FunctionalRenderContext.prototype);

	function createFunctionalComponent (
	  Ctor,
	  propsData,
	  data,
	  contextVm,
	  children
	) {
	  var options = Ctor.options;
	  var props = {};
	  var propOptions = options.props;
	  if (isDef(propOptions)) {
	    for (var key in propOptions) {
	      props[key] = validateProp(key, propOptions, propsData || emptyObject);
	    }
	  } else {
	    if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
	    if (isDef(data.props)) { mergeProps(props, data.props); }
	  }

	  var renderContext = new FunctionalRenderContext(
	    data,
	    props,
	    children,
	    contextVm,
	    Ctor
	  );

	  var vnode = options.render.call(null, renderContext._c, renderContext);

	  if (vnode instanceof VNode) {
	    vnode.functionalContext = contextVm;
	    vnode.functionalOptions = options;
	    if (data.slot) {
	      (vnode.data || (vnode.data = {})).slot = data.slot;
	    }
	  }

	  return vnode
	}

	function mergeProps (to, from) {
	  for (var key in from) {
	    to[camelize(key)] = from[key];
	  }
	}

	/*  */

	// hooks to be invoked on component VNodes during patch
	var componentVNodeHooks = {
	  init: function init (
	    vnode,
	    hydrating,
	    parentElm,
	    refElm
	  ) {
	    if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
	      var child = vnode.componentInstance = createComponentInstanceForVnode(
	        vnode,
	        activeInstance,
	        parentElm,
	        refElm
	      );
	      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
	    } else if (vnode.data.keepAlive) {
	      // kept-alive components, treat as a patch
	      var mountedNode = vnode; // work around flow
	      componentVNodeHooks.prepatch(mountedNode, mountedNode);
	    }
	  },

	  prepatch: function prepatch (oldVnode, vnode) {
	    var options = vnode.componentOptions;
	    var child = vnode.componentInstance = oldVnode.componentInstance;
	    updateChildComponent(
	      child,
	      options.propsData, // updated props
	      options.listeners, // updated listeners
	      vnode, // new parent vnode
	      options.children // new children
	    );
	  },

	  insert: function insert (vnode) {
	    var context = vnode.context;
	    var componentInstance = vnode.componentInstance;
	    if (!componentInstance._isMounted) {
	      componentInstance._isMounted = true;
	      callHook(componentInstance, 'mounted');
	    }
	    if (vnode.data.keepAlive) {
	      if (context._isMounted) {
	        // vue-router#1212
	        // During updates, a kept-alive component's child components may
	        // change, so directly walking the tree here may call activated hooks
	        // on incorrect children. Instead we push them into a queue which will
	        // be processed after the whole patch process ended.
	        queueActivatedComponent(componentInstance);
	      } else {
	        activateChildComponent(componentInstance, true /* direct */);
	      }
	    }
	  },

	  destroy: function destroy (vnode) {
	    var componentInstance = vnode.componentInstance;
	    if (!componentInstance._isDestroyed) {
	      if (!vnode.data.keepAlive) {
	        componentInstance.$destroy();
	      } else {
	        deactivateChildComponent(componentInstance, true /* direct */);
	      }
	    }
	  }
	};

	var hooksToMerge = Object.keys(componentVNodeHooks);

	function createComponent (
	  Ctor,
	  data,
	  context,
	  children,
	  tag
	) {
	  if (isUndef(Ctor)) {
	    return
	  }

	  var baseCtor = context.$options._base;

	  // plain options object: turn it into a constructor
	  if (isObject(Ctor)) {
	    Ctor = baseCtor.extend(Ctor);
	  }

	  // if at this stage it's not a constructor or an async component factory,
	  // reject.
	  if (typeof Ctor !== 'function') {
	    if (false) {
	      warn(("Invalid Component definition: " + (String(Ctor))), context);
	    }
	    return
	  }

	  // async component
	  var asyncFactory;
	  if (isUndef(Ctor.cid)) {
	    asyncFactory = Ctor;
	    Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
	    if (Ctor === undefined) {
	      // return a placeholder node for async component, which is rendered
	      // as a comment node but preserves all the raw information for the node.
	      // the information will be used for async server-rendering and hydration.
	      return createAsyncPlaceholder(
	        asyncFactory,
	        data,
	        context,
	        children,
	        tag
	      )
	    }
	  }

	  data = data || {};

	  // resolve constructor options in case global mixins are applied after
	  // component constructor creation
	  resolveConstructorOptions(Ctor);

	  // transform component v-model data into props & events
	  if (isDef(data.model)) {
	    transformModel(Ctor.options, data);
	  }

	  // extract props
	  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

	  // functional component
	  if (isTrue(Ctor.options.functional)) {
	    return createFunctionalComponent(Ctor, propsData, data, context, children)
	  }

	  // extract listeners, since these needs to be treated as
	  // child component listeners instead of DOM listeners
	  var listeners = data.on;
	  // replace with listeners with .native modifier
	  // so it gets processed during parent component patch.
	  data.on = data.nativeOn;

	  if (isTrue(Ctor.options.abstract)) {
	    // abstract components do not keep anything
	    // other than props & listeners & slot

	    // work around flow
	    var slot = data.slot;
	    data = {};
	    if (slot) {
	      data.slot = slot;
	    }
	  }

	  // merge component management hooks onto the placeholder node
	  mergeHooks(data);

	  // return a placeholder vnode
	  var name = Ctor.options.name || tag;
	  var vnode = new VNode(
	    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
	    data, undefined, undefined, undefined, context,
	    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
	    asyncFactory
	  );
	  return vnode
	}

	function createComponentInstanceForVnode (
	  vnode, // we know it's MountedComponentVNode but flow doesn't
	  parent, // activeInstance in lifecycle state
	  parentElm,
	  refElm
	) {
	  var vnodeComponentOptions = vnode.componentOptions;
	  var options = {
	    _isComponent: true,
	    parent: parent,
	    propsData: vnodeComponentOptions.propsData,
	    _componentTag: vnodeComponentOptions.tag,
	    _parentVnode: vnode,
	    _parentListeners: vnodeComponentOptions.listeners,
	    _renderChildren: vnodeComponentOptions.children,
	    _parentElm: parentElm || null,
	    _refElm: refElm || null
	  };
	  // check inline-template render functions
	  var inlineTemplate = vnode.data.inlineTemplate;
	  if (isDef(inlineTemplate)) {
	    options.render = inlineTemplate.render;
	    options.staticRenderFns = inlineTemplate.staticRenderFns;
	  }
	  return new vnodeComponentOptions.Ctor(options)
	}

	function mergeHooks (data) {
	  if (!data.hook) {
	    data.hook = {};
	  }
	  for (var i = 0; i < hooksToMerge.length; i++) {
	    var key = hooksToMerge[i];
	    var fromParent = data.hook[key];
	    var ours = componentVNodeHooks[key];
	    data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
	  }
	}

	function mergeHook$1 (one, two) {
	  return function (a, b, c, d) {
	    one(a, b, c, d);
	    two(a, b, c, d);
	  }
	}

	// transform component v-model info (value and callback) into
	// prop and event handler respectively.
	function transformModel (options, data) {
	  var prop = (options.model && options.model.prop) || 'value';
	  var event = (options.model && options.model.event) || 'input';(data.props || (data.props = {}))[prop] = data.model.value;
	  var on = data.on || (data.on = {});
	  if (isDef(on[event])) {
	    on[event] = [data.model.callback].concat(on[event]);
	  } else {
	    on[event] = data.model.callback;
	  }
	}

	/*  */

	var SIMPLE_NORMALIZE = 1;
	var ALWAYS_NORMALIZE = 2;

	// wrapper function for providing a more flexible interface
	// without getting yelled at by flow
	function createElement (
	  context,
	  tag,
	  data,
	  children,
	  normalizationType,
	  alwaysNormalize
	) {
	  if (Array.isArray(data) || isPrimitive(data)) {
	    normalizationType = children;
	    children = data;
	    data = undefined;
	  }
	  if (isTrue(alwaysNormalize)) {
	    normalizationType = ALWAYS_NORMALIZE;
	  }
	  return _createElement(context, tag, data, children, normalizationType)
	}

	function _createElement (
	  context,
	  tag,
	  data,
	  children,
	  normalizationType
	) {
	  if (isDef(data) && isDef((data).__ob__)) {
	    ("production") !== 'production' && warn(
	      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
	      'Always create fresh vnode data objects in each render!',
	      context
	    );
	    return createEmptyVNode()
	  }
	  // object syntax in v-bind
	  if (isDef(data) && isDef(data.is)) {
	    tag = data.is;
	  }
	  if (!tag) {
	    // in case of component :is set to falsy value
	    return createEmptyVNode()
	  }
	  // warn against non-primitive key
	  if (false
	  ) {
	    warn(
	      'Avoid using non-primitive value as key, ' +
	      'use string/number value instead.',
	      context
	    );
	  }
	  // support single function children as default scoped slot
	  if (Array.isArray(children) &&
	    typeof children[0] === 'function'
	  ) {
	    data = data || {};
	    data.scopedSlots = { default: children[0] };
	    children.length = 0;
	  }
	  if (normalizationType === ALWAYS_NORMALIZE) {
	    children = normalizeChildren(children);
	  } else if (normalizationType === SIMPLE_NORMALIZE) {
	    children = simpleNormalizeChildren(children);
	  }
	  var vnode, ns;
	  if (typeof tag === 'string') {
	    var Ctor;
	    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
	    if (config.isReservedTag(tag)) {
	      // platform built-in elements
	      vnode = new VNode(
	        config.parsePlatformTagName(tag), data, children,
	        undefined, undefined, context
	      );
	    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
	      // component
	      vnode = createComponent(Ctor, data, context, children, tag);
	    } else {
	      // unknown or unlisted namespaced elements
	      // check at runtime because it may get assigned a namespace when its
	      // parent normalizes children
	      vnode = new VNode(
	        tag, data, children,
	        undefined, undefined, context
	      );
	    }
	  } else {
	    // direct component options / constructor
	    vnode = createComponent(tag, data, context, children);
	  }
	  if (isDef(vnode)) {
	    if (ns) { applyNS(vnode, ns); }
	    return vnode
	  } else {
	    return createEmptyVNode()
	  }
	}

	function applyNS (vnode, ns, force) {
	  vnode.ns = ns;
	  if (vnode.tag === 'foreignObject') {
	    // use default namespace inside foreignObject
	    ns = undefined;
	    force = true;
	  }
	  if (isDef(vnode.children)) {
	    for (var i = 0, l = vnode.children.length; i < l; i++) {
	      var child = vnode.children[i];
	      if (isDef(child.tag) && (isUndef(child.ns) || isTrue(force))) {
	        applyNS(child, ns, force);
	      }
	    }
	  }
	}

	/*  */

	function initRender (vm) {
	  vm._vnode = null; // the root of the child tree
	  var options = vm.$options;
	  var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
	  var renderContext = parentVnode && parentVnode.context;
	  vm.$slots = resolveSlots(options._renderChildren, renderContext);
	  vm.$scopedSlots = emptyObject;
	  // bind the createElement fn to this instance
	  // so that we get proper render context inside it.
	  // args order: tag, data, children, normalizationType, alwaysNormalize
	  // internal version is used by render functions compiled from templates
	  vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
	  // normalization is always applied for the public version, used in
	  // user-written render functions.
	  vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

	  // $attrs & $listeners are exposed for easier HOC creation.
	  // they need to be reactive so that HOCs using them are always updated
	  var parentData = parentVnode && parentVnode.data;

	  /* istanbul ignore else */
	  if (false) {
	    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
	      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
	    }, true);
	    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, function () {
	      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
	    }, true);
	  } else {
	    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true);
	    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true);
	  }
	}

	function renderMixin (Vue) {
	  // install runtime convenience helpers
	  installRenderHelpers(Vue.prototype);

	  Vue.prototype.$nextTick = function (fn) {
	    return nextTick(fn, this)
	  };

	  Vue.prototype._render = function () {
	    var vm = this;
	    var ref = vm.$options;
	    var render = ref.render;
	    var _parentVnode = ref._parentVnode;

	    if (vm._isMounted) {
	      // if the parent didn't update, the slot nodes will be the ones from
	      // last render. They need to be cloned to ensure "freshness" for this render.
	      for (var key in vm.$slots) {
	        var slot = vm.$slots[key];
	        if (slot._rendered) {
	          vm.$slots[key] = cloneVNodes(slot, true /* deep */);
	        }
	      }
	    }

	    vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject;

	    // set parent vnode. this allows render functions to have access
	    // to the data on the placeholder node.
	    vm.$vnode = _parentVnode;
	    // render self
	    var vnode;
	    try {
	      vnode = render.call(vm._renderProxy, vm.$createElement);
	    } catch (e) {
	      handleError(e, vm, "render");
	      // return error render result,
	      // or previous vnode to prevent render error causing blank component
	      /* istanbul ignore else */
	      if (false) {
	        if (vm.$options.renderError) {
	          try {
	            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
	          } catch (e) {
	            handleError(e, vm, "renderError");
	            vnode = vm._vnode;
	          }
	        } else {
	          vnode = vm._vnode;
	        }
	      } else {
	        vnode = vm._vnode;
	      }
	    }
	    // return empty vnode in case the render function errored out
	    if (!(vnode instanceof VNode)) {
	      if (false) {
	        warn(
	          'Multiple root nodes returned from render function. Render function ' +
	          'should return a single root node.',
	          vm
	        );
	      }
	      vnode = createEmptyVNode();
	    }
	    // set parent
	    vnode.parent = _parentVnode;
	    return vnode
	  };
	}

	/*  */

	var uid$1 = 0;

	function initMixin (Vue) {
	  Vue.prototype._init = function (options) {
	    var vm = this;
	    // a uid
	    vm._uid = uid$1++;

	    var startTag, endTag;
	    /* istanbul ignore if */
	    if (false) {
	      startTag = "vue-perf-start:" + (vm._uid);
	      endTag = "vue-perf-end:" + (vm._uid);
	      mark(startTag);
	    }

	    // a flag to avoid this being observed
	    vm._isVue = true;
	    // merge options
	    if (options && options._isComponent) {
	      // optimize internal component instantiation
	      // since dynamic options merging is pretty slow, and none of the
	      // internal component options needs special treatment.
	      initInternalComponent(vm, options);
	    } else {
	      vm.$options = mergeOptions(
	        resolveConstructorOptions(vm.constructor),
	        options || {},
	        vm
	      );
	    }
	    /* istanbul ignore else */
	    if (false) {
	      initProxy(vm);
	    } else {
	      vm._renderProxy = vm;
	    }
	    // expose real self
	    vm._self = vm;
	    initLifecycle(vm);
	    initEvents(vm);
	    initRender(vm);
	    callHook(vm, 'beforeCreate');
	    initInjections(vm); // resolve injections before data/props
	    initState(vm);
	    initProvide(vm); // resolve provide after data/props
	    callHook(vm, 'created');

	    /* istanbul ignore if */
	    if (false) {
	      vm._name = formatComponentName(vm, false);
	      mark(endTag);
	      measure(("vue " + (vm._name) + " init"), startTag, endTag);
	    }

	    if (vm.$options.el) {
	      vm.$mount(vm.$options.el);
	    }
	  };
	}

	function initInternalComponent (vm, options) {
	  var opts = vm.$options = Object.create(vm.constructor.options);
	  // doing this because it's faster than dynamic enumeration.
	  opts.parent = options.parent;
	  opts.propsData = options.propsData;
	  opts._parentVnode = options._parentVnode;
	  opts._parentListeners = options._parentListeners;
	  opts._renderChildren = options._renderChildren;
	  opts._componentTag = options._componentTag;
	  opts._parentElm = options._parentElm;
	  opts._refElm = options._refElm;
	  if (options.render) {
	    opts.render = options.render;
	    opts.staticRenderFns = options.staticRenderFns;
	  }
	}

	function resolveConstructorOptions (Ctor) {
	  var options = Ctor.options;
	  if (Ctor.super) {
	    var superOptions = resolveConstructorOptions(Ctor.super);
	    var cachedSuperOptions = Ctor.superOptions;
	    if (superOptions !== cachedSuperOptions) {
	      // super option changed,
	      // need to resolve new options.
	      Ctor.superOptions = superOptions;
	      // check if there are any late-modified/attached options (#4976)
	      var modifiedOptions = resolveModifiedOptions(Ctor);
	      // update base extend options
	      if (modifiedOptions) {
	        extend(Ctor.extendOptions, modifiedOptions);
	      }
	      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
	      if (options.name) {
	        options.components[options.name] = Ctor;
	      }
	    }
	  }
	  return options
	}

	function resolveModifiedOptions (Ctor) {
	  var modified;
	  var latest = Ctor.options;
	  var extended = Ctor.extendOptions;
	  var sealed = Ctor.sealedOptions;
	  for (var key in latest) {
	    if (latest[key] !== sealed[key]) {
	      if (!modified) { modified = {}; }
	      modified[key] = dedupe(latest[key], extended[key], sealed[key]);
	    }
	  }
	  return modified
	}

	function dedupe (latest, extended, sealed) {
	  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
	  // between merges
	  if (Array.isArray(latest)) {
	    var res = [];
	    sealed = Array.isArray(sealed) ? sealed : [sealed];
	    extended = Array.isArray(extended) ? extended : [extended];
	    for (var i = 0; i < latest.length; i++) {
	      // push original options and not sealed options to exclude duplicated options
	      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
	        res.push(latest[i]);
	      }
	    }
	    return res
	  } else {
	    return latest
	  }
	}

	function Vue$3 (options) {
	  if (false
	  ) {
	    warn('Vue is a constructor and should be called with the `new` keyword');
	  }
	  this._init(options);
	}

	initMixin(Vue$3);
	stateMixin(Vue$3);
	eventsMixin(Vue$3);
	lifecycleMixin(Vue$3);
	renderMixin(Vue$3);

	/*  */

	function initUse (Vue) {
	  Vue.use = function (plugin) {
	    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
	    if (installedPlugins.indexOf(plugin) > -1) {
	      return this
	    }

	    // additional parameters
	    var args = toArray(arguments, 1);
	    args.unshift(this);
	    if (typeof plugin.install === 'function') {
	      plugin.install.apply(plugin, args);
	    } else if (typeof plugin === 'function') {
	      plugin.apply(null, args);
	    }
	    installedPlugins.push(plugin);
	    return this
	  };
	}

	/*  */

	function initMixin$1 (Vue) {
	  Vue.mixin = function (mixin) {
	    this.options = mergeOptions(this.options, mixin);
	    return this
	  };
	}

	/*  */

	function initExtend (Vue) {
	  /**
	   * Each instance constructor, including Vue, has a unique
	   * cid. This enables us to create wrapped "child
	   * constructors" for prototypal inheritance and cache them.
	   */
	  Vue.cid = 0;
	  var cid = 1;

	  /**
	   * Class inheritance
	   */
	  Vue.extend = function (extendOptions) {
	    extendOptions = extendOptions || {};
	    var Super = this;
	    var SuperId = Super.cid;
	    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
	    if (cachedCtors[SuperId]) {
	      return cachedCtors[SuperId]
	    }

	    var name = extendOptions.name || Super.options.name;
	    if (false) {
	      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
	        warn(
	          'Invalid component name: "' + name + '". Component names ' +
	          'can only contain alphanumeric characters and the hyphen, ' +
	          'and must start with a letter.'
	        );
	      }
	    }

	    var Sub = function VueComponent (options) {
	      this._init(options);
	    };
	    Sub.prototype = Object.create(Super.prototype);
	    Sub.prototype.constructor = Sub;
	    Sub.cid = cid++;
	    Sub.options = mergeOptions(
	      Super.options,
	      extendOptions
	    );
	    Sub['super'] = Super;

	    // For props and computed properties, we define the proxy getters on
	    // the Vue instances at extension time, on the extended prototype. This
	    // avoids Object.defineProperty calls for each instance created.
	    if (Sub.options.props) {
	      initProps$1(Sub);
	    }
	    if (Sub.options.computed) {
	      initComputed$1(Sub);
	    }

	    // allow further extension/mixin/plugin usage
	    Sub.extend = Super.extend;
	    Sub.mixin = Super.mixin;
	    Sub.use = Super.use;

	    // create asset registers, so extended classes
	    // can have their private assets too.
	    ASSET_TYPES.forEach(function (type) {
	      Sub[type] = Super[type];
	    });
	    // enable recursive self-lookup
	    if (name) {
	      Sub.options.components[name] = Sub;
	    }

	    // keep a reference to the super options at extension time.
	    // later at instantiation we can check if Super's options have
	    // been updated.
	    Sub.superOptions = Super.options;
	    Sub.extendOptions = extendOptions;
	    Sub.sealedOptions = extend({}, Sub.options);

	    // cache constructor
	    cachedCtors[SuperId] = Sub;
	    return Sub
	  };
	}

	function initProps$1 (Comp) {
	  var props = Comp.options.props;
	  for (var key in props) {
	    proxy(Comp.prototype, "_props", key);
	  }
	}

	function initComputed$1 (Comp) {
	  var computed = Comp.options.computed;
	  for (var key in computed) {
	    defineComputed(Comp.prototype, key, computed[key]);
	  }
	}

	/*  */

	function initAssetRegisters (Vue) {
	  /**
	   * Create asset registration methods.
	   */
	  ASSET_TYPES.forEach(function (type) {
	    Vue[type] = function (
	      id,
	      definition
	    ) {
	      if (!definition) {
	        return this.options[type + 's'][id]
	      } else {
	        /* istanbul ignore if */
	        if (false) {
	          if (type === 'component' && config.isReservedTag(id)) {
	            warn(
	              'Do not use built-in or reserved HTML elements as component ' +
	              'id: ' + id
	            );
	          }
	        }
	        if (type === 'component' && isPlainObject(definition)) {
	          definition.name = definition.name || id;
	          definition = this.options._base.extend(definition);
	        }
	        if (type === 'directive' && typeof definition === 'function') {
	          definition = { bind: definition, update: definition };
	        }
	        this.options[type + 's'][id] = definition;
	        return definition
	      }
	    };
	  });
	}

	/*  */

	function getComponentName (opts) {
	  return opts && (opts.Ctor.options.name || opts.tag)
	}

	function matches (pattern, name) {
	  if (Array.isArray(pattern)) {
	    return pattern.indexOf(name) > -1
	  } else if (typeof pattern === 'string') {
	    return pattern.split(',').indexOf(name) > -1
	  } else if (isRegExp(pattern)) {
	    return pattern.test(name)
	  }
	  /* istanbul ignore next */
	  return false
	}

	function pruneCache (keepAliveInstance, filter) {
	  var cache = keepAliveInstance.cache;
	  var keys = keepAliveInstance.keys;
	  var _vnode = keepAliveInstance._vnode;
	  for (var key in cache) {
	    var cachedNode = cache[key];
	    if (cachedNode) {
	      var name = getComponentName(cachedNode.componentOptions);
	      if (name && !filter(name)) {
	        pruneCacheEntry(cache, key, keys, _vnode);
	      }
	    }
	  }
	}

	function pruneCacheEntry (
	  cache,
	  key,
	  keys,
	  current
	) {
	  var cached$$1 = cache[key];
	  if (cached$$1 && cached$$1 !== current) {
	    cached$$1.componentInstance.$destroy();
	  }
	  cache[key] = null;
	  remove(keys, key);
	}

	var patternTypes = [String, RegExp, Array];

	var KeepAlive = {
	  name: 'keep-alive',
	  abstract: true,

	  props: {
	    include: patternTypes,
	    exclude: patternTypes,
	    max: [String, Number]
	  },

	  created: function created () {
	    this.cache = Object.create(null);
	    this.keys = [];
	  },

	  destroyed: function destroyed () {
	    var this$1 = this;

	    for (var key in this$1.cache) {
	      pruneCacheEntry(this$1.cache, key, this$1.keys);
	    }
	  },

	  watch: {
	    include: function include (val) {
	      pruneCache(this, function (name) { return matches(val, name); });
	    },
	    exclude: function exclude (val) {
	      pruneCache(this, function (name) { return !matches(val, name); });
	    }
	  },

	  render: function render () {
	    var vnode = getFirstComponentChild(this.$slots.default);
	    var componentOptions = vnode && vnode.componentOptions;
	    if (componentOptions) {
	      // check pattern
	      var name = getComponentName(componentOptions);
	      if (name && (
	        (this.include && !matches(this.include, name)) ||
	        (this.exclude && matches(this.exclude, name))
	      )) {
	        return vnode
	      }

	      var ref = this;
	      var cache = ref.cache;
	      var keys = ref.keys;
	      var key = vnode.key == null
	        // same constructor may get registered as different local components
	        // so cid alone is not enough (#3269)
	        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
	        : vnode.key;
	      if (cache[key]) {
	        vnode.componentInstance = cache[key].componentInstance;
	        // make current key freshest
	        remove(keys, key);
	        keys.push(key);
	      } else {
	        cache[key] = vnode;
	        keys.push(key);
	        // prune oldest entry
	        if (this.max && keys.length > parseInt(this.max)) {
	          pruneCacheEntry(cache, keys[0], keys, this._vnode);
	        }
	      }

	      vnode.data.keepAlive = true;
	    }
	    return vnode
	  }
	};

	var builtInComponents = {
	  KeepAlive: KeepAlive
	};

	/*  */

	function initGlobalAPI (Vue) {
	  // config
	  var configDef = {};
	  configDef.get = function () { return config; };
	  if (false) {
	    configDef.set = function () {
	      warn(
	        'Do not replace the Vue.config object, set individual fields instead.'
	      );
	    };
	  }
	  Object.defineProperty(Vue, 'config', configDef);

	  // exposed util methods.
	  // NOTE: these are not considered part of the public API - avoid relying on
	  // them unless you are aware of the risk.
	  Vue.util = {
	    warn: warn,
	    extend: extend,
	    mergeOptions: mergeOptions,
	    defineReactive: defineReactive
	  };

	  Vue.set = set;
	  Vue.delete = del;
	  Vue.nextTick = nextTick;

	  Vue.options = Object.create(null);
	  ASSET_TYPES.forEach(function (type) {
	    Vue.options[type + 's'] = Object.create(null);
	  });

	  // this is used to identify the "base" constructor to extend all plain-object
	  // components with in Weex's multi-instance scenarios.
	  Vue.options._base = Vue;

	  extend(Vue.options.components, builtInComponents);

	  initUse(Vue);
	  initMixin$1(Vue);
	  initExtend(Vue);
	  initAssetRegisters(Vue);
	}

	initGlobalAPI(Vue$3);

	Object.defineProperty(Vue$3.prototype, '$isServer', {
	  get: isServerRendering
	});

	Object.defineProperty(Vue$3.prototype, '$ssrContext', {
	  get: function get () {
	    /* istanbul ignore next */
	    return this.$vnode && this.$vnode.ssrContext
	  }
	});

	Vue$3.version = '2.5.2';

	/*  */

	// these are reserved for web because they are directly compiled away
	// during template compilation
	var isReservedAttr = makeMap('style,class');

	// attributes that should be using props for binding
	var acceptValue = makeMap('input,textarea,option,select,progress');
	var mustUseProp = function (tag, type, attr) {
	  return (
	    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
	    (attr === 'selected' && tag === 'option') ||
	    (attr === 'checked' && tag === 'input') ||
	    (attr === 'muted' && tag === 'video')
	  )
	};

	var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

	var isBooleanAttr = makeMap(
	  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
	  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
	  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
	  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
	  'required,reversed,scoped,seamless,selected,sortable,translate,' +
	  'truespeed,typemustmatch,visible'
	);

	var xlinkNS = 'http://www.w3.org/1999/xlink';

	var isXlink = function (name) {
	  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
	};

	var getXlinkProp = function (name) {
	  return isXlink(name) ? name.slice(6, name.length) : ''
	};

	var isFalsyAttrValue = function (val) {
	  return val == null || val === false
	};

	/*  */

	function genClassForVnode (vnode) {
	  var data = vnode.data;
	  var parentNode = vnode;
	  var childNode = vnode;
	  while (isDef(childNode.componentInstance)) {
	    childNode = childNode.componentInstance._vnode;
	    if (childNode.data) {
	      data = mergeClassData(childNode.data, data);
	    }
	  }
	  while (isDef(parentNode = parentNode.parent)) {
	    if (parentNode.data) {
	      data = mergeClassData(data, parentNode.data);
	    }
	  }
	  return renderClass(data.staticClass, data.class)
	}

	function mergeClassData (child, parent) {
	  return {
	    staticClass: concat(child.staticClass, parent.staticClass),
	    class: isDef(child.class)
	      ? [child.class, parent.class]
	      : parent.class
	  }
	}

	function renderClass (
	  staticClass,
	  dynamicClass
	) {
	  if (isDef(staticClass) || isDef(dynamicClass)) {
	    return concat(staticClass, stringifyClass(dynamicClass))
	  }
	  /* istanbul ignore next */
	  return ''
	}

	function concat (a, b) {
	  return a ? b ? (a + ' ' + b) : a : (b || '')
	}

	function stringifyClass (value) {
	  if (Array.isArray(value)) {
	    return stringifyArray(value)
	  }
	  if (isObject(value)) {
	    return stringifyObject(value)
	  }
	  if (typeof value === 'string') {
	    return value
	  }
	  /* istanbul ignore next */
	  return ''
	}

	function stringifyArray (value) {
	  var res = '';
	  var stringified;
	  for (var i = 0, l = value.length; i < l; i++) {
	    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
	      if (res) { res += ' '; }
	      res += stringified;
	    }
	  }
	  return res
	}

	function stringifyObject (value) {
	  var res = '';
	  for (var key in value) {
	    if (value[key]) {
	      if (res) { res += ' '; }
	      res += key;
	    }
	  }
	  return res
	}

	/*  */

	var namespaceMap = {
	  svg: 'http://www.w3.org/2000/svg',
	  math: 'http://www.w3.org/1998/Math/MathML'
	};

	var isHTMLTag = makeMap(
	  'html,body,base,head,link,meta,style,title,' +
	  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
	  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
	  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
	  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
	  'embed,object,param,source,canvas,script,noscript,del,ins,' +
	  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
	  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
	  'output,progress,select,textarea,' +
	  'details,dialog,menu,menuitem,summary,' +
	  'content,element,shadow,template,blockquote,iframe,tfoot'
	);

	// this map is intentionally selective, only covering SVG elements that may
	// contain child elements.
	var isSVG = makeMap(
	  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
	  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
	  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
	  true
	);

	var isPreTag = function (tag) { return tag === 'pre'; };

	var isReservedTag = function (tag) {
	  return isHTMLTag(tag) || isSVG(tag)
	};

	function getTagNamespace (tag) {
	  if (isSVG(tag)) {
	    return 'svg'
	  }
	  // basic support for MathML
	  // note it doesn't support other MathML elements being component roots
	  if (tag === 'math') {
	    return 'math'
	  }
	}

	var unknownElementCache = Object.create(null);
	function isUnknownElement (tag) {
	  /* istanbul ignore if */
	  if (!inBrowser) {
	    return true
	  }
	  if (isReservedTag(tag)) {
	    return false
	  }
	  tag = tag.toLowerCase();
	  /* istanbul ignore if */
	  if (unknownElementCache[tag] != null) {
	    return unknownElementCache[tag]
	  }
	  var el = document.createElement(tag);
	  if (tag.indexOf('-') > -1) {
	    // http://stackoverflow.com/a/28210364/1070244
	    return (unknownElementCache[tag] = (
	      el.constructor === window.HTMLUnknownElement ||
	      el.constructor === window.HTMLElement
	    ))
	  } else {
	    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
	  }
	}

	var isTextInputType = makeMap('text,number,password,search,email,tel,url');

	/*  */

	/**
	 * Query an element selector if it's not an element already.
	 */
	function query (el) {
	  if (typeof el === 'string') {
	    var selected = document.querySelector(el);
	    if (!selected) {
	      ("production") !== 'production' && warn(
	        'Cannot find element: ' + el
	      );
	      return document.createElement('div')
	    }
	    return selected
	  } else {
	    return el
	  }
	}

	/*  */

	function createElement$1 (tagName, vnode) {
	  var elm = document.createElement(tagName);
	  if (tagName !== 'select') {
	    return elm
	  }
	  // false or null will remove the attribute but undefined will not
	  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
	    elm.setAttribute('multiple', 'multiple');
	  }
	  return elm
	}

	function createElementNS (namespace, tagName) {
	  return document.createElementNS(namespaceMap[namespace], tagName)
	}

	function createTextNode (text) {
	  return document.createTextNode(text)
	}

	function createComment (text) {
	  return document.createComment(text)
	}

	function insertBefore (parentNode, newNode, referenceNode) {
	  parentNode.insertBefore(newNode, referenceNode);
	}

	function removeChild (node, child) {
	  node.removeChild(child);
	}

	function appendChild (node, child) {
	  node.appendChild(child);
	}

	function parentNode (node) {
	  return node.parentNode
	}

	function nextSibling (node) {
	  return node.nextSibling
	}

	function tagName (node) {
	  return node.tagName
	}

	function setTextContent (node, text) {
	  node.textContent = text;
	}

	function setAttribute (node, key, val) {
	  node.setAttribute(key, val);
	}


	var nodeOps = Object.freeze({
		createElement: createElement$1,
		createElementNS: createElementNS,
		createTextNode: createTextNode,
		createComment: createComment,
		insertBefore: insertBefore,
		removeChild: removeChild,
		appendChild: appendChild,
		parentNode: parentNode,
		nextSibling: nextSibling,
		tagName: tagName,
		setTextContent: setTextContent,
		setAttribute: setAttribute
	});

	/*  */

	var ref = {
	  create: function create (_, vnode) {
	    registerRef(vnode);
	  },
	  update: function update (oldVnode, vnode) {
	    if (oldVnode.data.ref !== vnode.data.ref) {
	      registerRef(oldVnode, true);
	      registerRef(vnode);
	    }
	  },
	  destroy: function destroy (vnode) {
	    registerRef(vnode, true);
	  }
	};

	function registerRef (vnode, isRemoval) {
	  var key = vnode.data.ref;
	  if (!key) { return }

	  var vm = vnode.context;
	  var ref = vnode.componentInstance || vnode.elm;
	  var refs = vm.$refs;
	  if (isRemoval) {
	    if (Array.isArray(refs[key])) {
	      remove(refs[key], ref);
	    } else if (refs[key] === ref) {
	      refs[key] = undefined;
	    }
	  } else {
	    if (vnode.data.refInFor) {
	      if (!Array.isArray(refs[key])) {
	        refs[key] = [ref];
	      } else if (refs[key].indexOf(ref) < 0) {
	        // $flow-disable-line
	        refs[key].push(ref);
	      }
	    } else {
	      refs[key] = ref;
	    }
	  }
	}

	/**
	 * Virtual DOM patching algorithm based on Snabbdom by
	 * Simon Friis Vindum (@paldepind)
	 * Licensed under the MIT License
	 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
	 *
	 * modified by Evan You (@yyx990803)
	 *
	 * Not type-checking this because this file is perf-critical and the cost
	 * of making flow understand it is not worth it.
	 */

	var emptyNode = new VNode('', {}, []);

	var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

	function sameVnode (a, b) {
	  return (
	    a.key === b.key && (
	      (
	        a.tag === b.tag &&
	        a.isComment === b.isComment &&
	        isDef(a.data) === isDef(b.data) &&
	        sameInputType(a, b)
	      ) || (
	        isTrue(a.isAsyncPlaceholder) &&
	        a.asyncFactory === b.asyncFactory &&
	        isUndef(b.asyncFactory.error)
	      )
	    )
	  )
	}

	function sameInputType (a, b) {
	  if (a.tag !== 'input') { return true }
	  var i;
	  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
	  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
	  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
	}

	function createKeyToOldIdx (children, beginIdx, endIdx) {
	  var i, key;
	  var map = {};
	  for (i = beginIdx; i <= endIdx; ++i) {
	    key = children[i].key;
	    if (isDef(key)) { map[key] = i; }
	  }
	  return map
	}

	function createPatchFunction (backend) {
	  var i, j;
	  var cbs = {};

	  var modules = backend.modules;
	  var nodeOps = backend.nodeOps;

	  for (i = 0; i < hooks.length; ++i) {
	    cbs[hooks[i]] = [];
	    for (j = 0; j < modules.length; ++j) {
	      if (isDef(modules[j][hooks[i]])) {
	        cbs[hooks[i]].push(modules[j][hooks[i]]);
	      }
	    }
	  }

	  function emptyNodeAt (elm) {
	    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
	  }

	  function createRmCb (childElm, listeners) {
	    function remove () {
	      if (--remove.listeners === 0) {
	        removeNode(childElm);
	      }
	    }
	    remove.listeners = listeners;
	    return remove
	  }

	  function removeNode (el) {
	    var parent = nodeOps.parentNode(el);
	    // element may have already been removed due to v-html / v-text
	    if (isDef(parent)) {
	      nodeOps.removeChild(parent, el);
	    }
	  }

	  var inPre = 0;
	  function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
	    vnode.isRootInsert = !nested; // for transition enter check
	    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
	      return
	    }

	    var data = vnode.data;
	    var children = vnode.children;
	    var tag = vnode.tag;
	    if (isDef(tag)) {
	      if (false) {
	        if (data && data.pre) {
	          inPre++;
	        }
	        if (
	          !inPre &&
	          !vnode.ns &&
	          !(
	            config.ignoredElements.length &&
	            config.ignoredElements.some(function (ignore) {
	              return isRegExp(ignore)
	                ? ignore.test(tag)
	                : ignore === tag
	            })
	          ) &&
	          config.isUnknownElement(tag)
	        ) {
	          warn(
	            'Unknown custom element: <' + tag + '> - did you ' +
	            'register the component correctly? For recursive components, ' +
	            'make sure to provide the "name" option.',
	            vnode.context
	          );
	        }
	      }
	      vnode.elm = vnode.ns
	        ? nodeOps.createElementNS(vnode.ns, tag)
	        : nodeOps.createElement(tag, vnode);
	      setScope(vnode);

	      /* istanbul ignore if */
	      {
	        createChildren(vnode, children, insertedVnodeQueue);
	        if (isDef(data)) {
	          invokeCreateHooks(vnode, insertedVnodeQueue);
	        }
	        insert(parentElm, vnode.elm, refElm);
	      }

	      if (false) {
	        inPre--;
	      }
	    } else if (isTrue(vnode.isComment)) {
	      vnode.elm = nodeOps.createComment(vnode.text);
	      insert(parentElm, vnode.elm, refElm);
	    } else {
	      vnode.elm = nodeOps.createTextNode(vnode.text);
	      insert(parentElm, vnode.elm, refElm);
	    }
	  }

	  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
	    var i = vnode.data;
	    if (isDef(i)) {
	      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
	      if (isDef(i = i.hook) && isDef(i = i.init)) {
	        i(vnode, false /* hydrating */, parentElm, refElm);
	      }
	      // after calling the init hook, if the vnode is a child component
	      // it should've created a child instance and mounted it. the child
	      // component also has set the placeholder vnode's elm.
	      // in that case we can just return the element and be done.
	      if (isDef(vnode.componentInstance)) {
	        initComponent(vnode, insertedVnodeQueue);
	        if (isTrue(isReactivated)) {
	          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
	        }
	        return true
	      }
	    }
	  }

	  function initComponent (vnode, insertedVnodeQueue) {
	    if (isDef(vnode.data.pendingInsert)) {
	      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
	      vnode.data.pendingInsert = null;
	    }
	    vnode.elm = vnode.componentInstance.$el;
	    if (isPatchable(vnode)) {
	      invokeCreateHooks(vnode, insertedVnodeQueue);
	      setScope(vnode);
	    } else {
	      // empty component root.
	      // skip all element-related modules except for ref (#3455)
	      registerRef(vnode);
	      // make sure to invoke the insert hook
	      insertedVnodeQueue.push(vnode);
	    }
	  }

	  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
	    var i;
	    // hack for #4339: a reactivated component with inner transition
	    // does not trigger because the inner node's created hooks are not called
	    // again. It's not ideal to involve module-specific logic in here but
	    // there doesn't seem to be a better way to do it.
	    var innerNode = vnode;
	    while (innerNode.componentInstance) {
	      innerNode = innerNode.componentInstance._vnode;
	      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
	        for (i = 0; i < cbs.activate.length; ++i) {
	          cbs.activate[i](emptyNode, innerNode);
	        }
	        insertedVnodeQueue.push(innerNode);
	        break
	      }
	    }
	    // unlike a newly created component,
	    // a reactivated keep-alive component doesn't insert itself
	    insert(parentElm, vnode.elm, refElm);
	  }

	  function insert (parent, elm, ref$$1) {
	    if (isDef(parent)) {
	      if (isDef(ref$$1)) {
	        if (ref$$1.parentNode === parent) {
	          nodeOps.insertBefore(parent, elm, ref$$1);
	        }
	      } else {
	        nodeOps.appendChild(parent, elm);
	      }
	    }
	  }

	  function createChildren (vnode, children, insertedVnodeQueue) {
	    if (Array.isArray(children)) {
	      for (var i = 0; i < children.length; ++i) {
	        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
	      }
	    } else if (isPrimitive(vnode.text)) {
	      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
	    }
	  }

	  function isPatchable (vnode) {
	    while (vnode.componentInstance) {
	      vnode = vnode.componentInstance._vnode;
	    }
	    return isDef(vnode.tag)
	  }

	  function invokeCreateHooks (vnode, insertedVnodeQueue) {
	    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
	      cbs.create[i$1](emptyNode, vnode);
	    }
	    i = vnode.data.hook; // Reuse variable
	    if (isDef(i)) {
	      if (isDef(i.create)) { i.create(emptyNode, vnode); }
	      if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
	    }
	  }

	  // set scope id attribute for scoped CSS.
	  // this is implemented as a special case to avoid the overhead
	  // of going through the normal attribute patching process.
	  function setScope (vnode) {
	    var i;
	    if (isDef(i = vnode.functionalScopeId)) {
	      nodeOps.setAttribute(vnode.elm, i, '');
	    } else {
	      var ancestor = vnode;
	      while (ancestor) {
	        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
	          nodeOps.setAttribute(vnode.elm, i, '');
	        }
	        ancestor = ancestor.parent;
	      }
	    }
	    // for slot content they should also get the scopeId from the host instance.
	    if (isDef(i = activeInstance) &&
	      i !== vnode.context &&
	      i !== vnode.functionalContext &&
	      isDef(i = i.$options._scopeId)
	    ) {
	      nodeOps.setAttribute(vnode.elm, i, '');
	    }
	  }

	  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
	    for (; startIdx <= endIdx; ++startIdx) {
	      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
	    }
	  }

	  function invokeDestroyHook (vnode) {
	    var i, j;
	    var data = vnode.data;
	    if (isDef(data)) {
	      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
	      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
	    }
	    if (isDef(i = vnode.children)) {
	      for (j = 0; j < vnode.children.length; ++j) {
	        invokeDestroyHook(vnode.children[j]);
	      }
	    }
	  }

	  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
	    for (; startIdx <= endIdx; ++startIdx) {
	      var ch = vnodes[startIdx];
	      if (isDef(ch)) {
	        if (isDef(ch.tag)) {
	          removeAndInvokeRemoveHook(ch);
	          invokeDestroyHook(ch);
	        } else { // Text node
	          removeNode(ch.elm);
	        }
	      }
	    }
	  }

	  function removeAndInvokeRemoveHook (vnode, rm) {
	    if (isDef(rm) || isDef(vnode.data)) {
	      var i;
	      var listeners = cbs.remove.length + 1;
	      if (isDef(rm)) {
	        // we have a recursively passed down rm callback
	        // increase the listeners count
	        rm.listeners += listeners;
	      } else {
	        // directly removing
	        rm = createRmCb(vnode.elm, listeners);
	      }
	      // recursively invoke hooks on child component root node
	      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
	        removeAndInvokeRemoveHook(i, rm);
	      }
	      for (i = 0; i < cbs.remove.length; ++i) {
	        cbs.remove[i](vnode, rm);
	      }
	      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
	        i(vnode, rm);
	      } else {
	        rm();
	      }
	    } else {
	      removeNode(vnode.elm);
	    }
	  }

	  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
	    var oldStartIdx = 0;
	    var newStartIdx = 0;
	    var oldEndIdx = oldCh.length - 1;
	    var oldStartVnode = oldCh[0];
	    var oldEndVnode = oldCh[oldEndIdx];
	    var newEndIdx = newCh.length - 1;
	    var newStartVnode = newCh[0];
	    var newEndVnode = newCh[newEndIdx];
	    var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

	    // removeOnly is a special flag used only by <transition-group>
	    // to ensure removed elements stay in correct relative positions
	    // during leaving transitions
	    var canMove = !removeOnly;

	    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
	      if (isUndef(oldStartVnode)) {
	        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
	      } else if (isUndef(oldEndVnode)) {
	        oldEndVnode = oldCh[--oldEndIdx];
	      } else if (sameVnode(oldStartVnode, newStartVnode)) {
	        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
	        oldStartVnode = oldCh[++oldStartIdx];
	        newStartVnode = newCh[++newStartIdx];
	      } else if (sameVnode(oldEndVnode, newEndVnode)) {
	        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
	        oldEndVnode = oldCh[--oldEndIdx];
	        newEndVnode = newCh[--newEndIdx];
	      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
	        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
	        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
	        oldStartVnode = oldCh[++oldStartIdx];
	        newEndVnode = newCh[--newEndIdx];
	      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
	        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
	        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
	        oldEndVnode = oldCh[--oldEndIdx];
	        newStartVnode = newCh[++newStartIdx];
	      } else {
	        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
	        idxInOld = isDef(newStartVnode.key)
	          ? oldKeyToIdx[newStartVnode.key]
	          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
	        if (isUndef(idxInOld)) { // New element
	          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
	        } else {
	          vnodeToMove = oldCh[idxInOld];
	          /* istanbul ignore if */
	          if (false) {
	            warn(
	              'It seems there are duplicate keys that is causing an update error. ' +
	              'Make sure each v-for item has a unique key.'
	            );
	          }
	          if (sameVnode(vnodeToMove, newStartVnode)) {
	            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue);
	            oldCh[idxInOld] = undefined;
	            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
	          } else {
	            // same key but different element. treat as new element
	            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
	          }
	        }
	        newStartVnode = newCh[++newStartIdx];
	      }
	    }
	    if (oldStartIdx > oldEndIdx) {
	      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
	      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
	    } else if (newStartIdx > newEndIdx) {
	      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
	    }
	  }

	  function findIdxInOld (node, oldCh, start, end) {
	    for (var i = start; i < end; i++) {
	      var c = oldCh[i];
	      if (isDef(c) && sameVnode(node, c)) { return i }
	    }
	  }

	  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
	    if (oldVnode === vnode) {
	      return
	    }

	    var elm = vnode.elm = oldVnode.elm;

	    if (isTrue(oldVnode.isAsyncPlaceholder)) {
	      if (isDef(vnode.asyncFactory.resolved)) {
	        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
	      } else {
	        vnode.isAsyncPlaceholder = true;
	      }
	      return
	    }

	    // reuse element for static trees.
	    // note we only do this if the vnode is cloned -
	    // if the new node is not cloned it means the render functions have been
	    // reset by the hot-reload-api and we need to do a proper re-render.
	    if (isTrue(vnode.isStatic) &&
	      isTrue(oldVnode.isStatic) &&
	      vnode.key === oldVnode.key &&
	      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
	    ) {
	      vnode.componentInstance = oldVnode.componentInstance;
	      return
	    }

	    var i;
	    var data = vnode.data;
	    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
	      i(oldVnode, vnode);
	    }

	    var oldCh = oldVnode.children;
	    var ch = vnode.children;
	    if (isDef(data) && isPatchable(vnode)) {
	      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
	      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
	    }
	    if (isUndef(vnode.text)) {
	      if (isDef(oldCh) && isDef(ch)) {
	        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
	      } else if (isDef(ch)) {
	        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
	        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
	      } else if (isDef(oldCh)) {
	        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
	      } else if (isDef(oldVnode.text)) {
	        nodeOps.setTextContent(elm, '');
	      }
	    } else if (oldVnode.text !== vnode.text) {
	      nodeOps.setTextContent(elm, vnode.text);
	    }
	    if (isDef(data)) {
	      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
	    }
	  }

	  function invokeInsertHook (vnode, queue, initial) {
	    // delay insert hooks for component root nodes, invoke them after the
	    // element is really inserted
	    if (isTrue(initial) && isDef(vnode.parent)) {
	      vnode.parent.data.pendingInsert = queue;
	    } else {
	      for (var i = 0; i < queue.length; ++i) {
	        queue[i].data.hook.insert(queue[i]);
	      }
	    }
	  }

	  var bailed = false;
	  // list of modules that can skip create hook during hydration because they
	  // are already rendered on the client or has no need for initialization
	  var isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

	  // Note: this is a browser-only function so we can assume elms are DOM nodes.
	  function hydrate (elm, vnode, insertedVnodeQueue) {
	    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
	      vnode.elm = elm;
	      vnode.isAsyncPlaceholder = true;
	      return true
	    }
	    if (false) {
	      if (!assertNodeMatch(elm, vnode)) {
	        return false
	      }
	    }
	    vnode.elm = elm;
	    var tag = vnode.tag;
	    var data = vnode.data;
	    var children = vnode.children;
	    if (isDef(data)) {
	      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
	      if (isDef(i = vnode.componentInstance)) {
	        // child component. it should have hydrated its own tree.
	        initComponent(vnode, insertedVnodeQueue);
	        return true
	      }
	    }
	    if (isDef(tag)) {
	      if (isDef(children)) {
	        // empty element, allow client to pick up and populate children
	        if (!elm.hasChildNodes()) {
	          createChildren(vnode, children, insertedVnodeQueue);
	        } else {
	          // v-html and domProps: innerHTML
	          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
	            if (i !== elm.innerHTML) {
	              /* istanbul ignore if */
	              if (false
	              ) {
	                bailed = true;
	                console.warn('Parent: ', elm);
	                console.warn('server innerHTML: ', i);
	                console.warn('client innerHTML: ', elm.innerHTML);
	              }
	              return false
	            }
	          } else {
	            // iterate and compare children lists
	            var childrenMatch = true;
	            var childNode = elm.firstChild;
	            for (var i$1 = 0; i$1 < children.length; i$1++) {
	              if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
	                childrenMatch = false;
	                break
	              }
	              childNode = childNode.nextSibling;
	            }
	            // if childNode is not null, it means the actual childNodes list is
	            // longer than the virtual children list.
	            if (!childrenMatch || childNode) {
	              /* istanbul ignore if */
	              if (false
	              ) {
	                bailed = true;
	                console.warn('Parent: ', elm);
	                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
	              }
	              return false
	            }
	          }
	        }
	      }
	      if (isDef(data)) {
	        for (var key in data) {
	          if (!isRenderedModule(key)) {
	            invokeCreateHooks(vnode, insertedVnodeQueue);
	            break
	          }
	        }
	      }
	    } else if (elm.data !== vnode.text) {
	      elm.data = vnode.text;
	    }
	    return true
	  }

	  function assertNodeMatch (node, vnode) {
	    if (isDef(vnode.tag)) {
	      return (
	        vnode.tag.indexOf('vue-component') === 0 ||
	        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
	      )
	    } else {
	      return node.nodeType === (vnode.isComment ? 8 : 3)
	    }
	  }

	  return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
	    if (isUndef(vnode)) {
	      if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
	      return
	    }

	    var isInitialPatch = false;
	    var insertedVnodeQueue = [];

	    if (isUndef(oldVnode)) {
	      // empty mount (likely as component), create new root element
	      isInitialPatch = true;
	      createElm(vnode, insertedVnodeQueue, parentElm, refElm);
	    } else {
	      var isRealElement = isDef(oldVnode.nodeType);
	      if (!isRealElement && sameVnode(oldVnode, vnode)) {
	        // patch existing root node
	        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
	      } else {
	        if (isRealElement) {
	          // mounting to a real element
	          // check if this is server-rendered content and if we can perform
	          // a successful hydration.
	          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
	            oldVnode.removeAttribute(SSR_ATTR);
	            hydrating = true;
	          }
	          if (isTrue(hydrating)) {
	            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
	              invokeInsertHook(vnode, insertedVnodeQueue, true);
	              return oldVnode
	            } else if (false) {
	              warn(
	                'The client-side rendered virtual DOM tree is not matching ' +
	                'server-rendered content. This is likely caused by incorrect ' +
	                'HTML markup, for example nesting block-level elements inside ' +
	                '<p>, or missing <tbody>. Bailing hydration and performing ' +
	                'full client-side render.'
	              );
	            }
	          }
	          // either not server-rendered, or hydration failed.
	          // create an empty node and replace it
	          oldVnode = emptyNodeAt(oldVnode);
	        }
	        // replacing existing element
	        var oldElm = oldVnode.elm;
	        var parentElm$1 = nodeOps.parentNode(oldElm);
	        createElm(
	          vnode,
	          insertedVnodeQueue,
	          // extremely rare edge case: do not insert if old element is in a
	          // leaving transition. Only happens when combining transition +
	          // keep-alive + HOCs. (#4590)
	          oldElm._leaveCb ? null : parentElm$1,
	          nodeOps.nextSibling(oldElm)
	        );

	        if (isDef(vnode.parent)) {
	          // component root element replaced.
	          // update parent placeholder node element, recursively
	          var ancestor = vnode.parent;
	          var patchable = isPatchable(vnode);
	          while (ancestor) {
	            for (var i = 0; i < cbs.destroy.length; ++i) {
	              cbs.destroy[i](ancestor);
	            }
	            ancestor.elm = vnode.elm;
	            if (patchable) {
	              for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
	                cbs.create[i$1](emptyNode, ancestor);
	              }
	              // #6513
	              // invoke insert hooks that may have been merged by create hooks.
	              // e.g. for directives that uses the "inserted" hook.
	              var insert = ancestor.data.hook.insert;
	              if (insert.merged) {
	                // start at index 1 to avoid re-invoking component mounted hook
	                for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
	                  insert.fns[i$2]();
	                }
	              }
	            } else {
	              registerRef(ancestor);
	            }
	            ancestor = ancestor.parent;
	          }
	        }

	        if (isDef(parentElm$1)) {
	          removeVnodes(parentElm$1, [oldVnode], 0, 0);
	        } else if (isDef(oldVnode.tag)) {
	          invokeDestroyHook(oldVnode);
	        }
	      }
	    }

	    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
	    return vnode.elm
	  }
	}

	/*  */

	var directives = {
	  create: updateDirectives,
	  update: updateDirectives,
	  destroy: function unbindDirectives (vnode) {
	    updateDirectives(vnode, emptyNode);
	  }
	};

	function updateDirectives (oldVnode, vnode) {
	  if (oldVnode.data.directives || vnode.data.directives) {
	    _update(oldVnode, vnode);
	  }
	}

	function _update (oldVnode, vnode) {
	  var isCreate = oldVnode === emptyNode;
	  var isDestroy = vnode === emptyNode;
	  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
	  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

	  var dirsWithInsert = [];
	  var dirsWithPostpatch = [];

	  var key, oldDir, dir;
	  for (key in newDirs) {
	    oldDir = oldDirs[key];
	    dir = newDirs[key];
	    if (!oldDir) {
	      // new directive, bind
	      callHook$1(dir, 'bind', vnode, oldVnode);
	      if (dir.def && dir.def.inserted) {
	        dirsWithInsert.push(dir);
	      }
	    } else {
	      // existing directive, update
	      dir.oldValue = oldDir.value;
	      callHook$1(dir, 'update', vnode, oldVnode);
	      if (dir.def && dir.def.componentUpdated) {
	        dirsWithPostpatch.push(dir);
	      }
	    }
	  }

	  if (dirsWithInsert.length) {
	    var callInsert = function () {
	      for (var i = 0; i < dirsWithInsert.length; i++) {
	        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
	      }
	    };
	    if (isCreate) {
	      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert);
	    } else {
	      callInsert();
	    }
	  }

	  if (dirsWithPostpatch.length) {
	    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function () {
	      for (var i = 0; i < dirsWithPostpatch.length; i++) {
	        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
	      }
	    });
	  }

	  if (!isCreate) {
	    for (key in oldDirs) {
	      if (!newDirs[key]) {
	        // no longer present, unbind
	        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
	      }
	    }
	  }
	}

	var emptyModifiers = Object.create(null);

	function normalizeDirectives$1 (
	  dirs,
	  vm
	) {
	  var res = Object.create(null);
	  if (!dirs) {
	    return res
	  }
	  var i, dir;
	  for (i = 0; i < dirs.length; i++) {
	    dir = dirs[i];
	    if (!dir.modifiers) {
	      dir.modifiers = emptyModifiers;
	    }
	    res[getRawDirName(dir)] = dir;
	    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
	  }
	  return res
	}

	function getRawDirName (dir) {
	  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
	}

	function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
	  var fn = dir.def && dir.def[hook];
	  if (fn) {
	    try {
	      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
	    } catch (e) {
	      handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
	    }
	  }
	}

	var baseModules = [
	  ref,
	  directives
	];

	/*  */

	function updateAttrs (oldVnode, vnode) {
	  var opts = vnode.componentOptions;
	  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
	    return
	  }
	  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
	    return
	  }
	  var key, cur, old;
	  var elm = vnode.elm;
	  var oldAttrs = oldVnode.data.attrs || {};
	  var attrs = vnode.data.attrs || {};
	  // clone observed objects, as the user probably wants to mutate it
	  if (isDef(attrs.__ob__)) {
	    attrs = vnode.data.attrs = extend({}, attrs);
	  }

	  for (key in attrs) {
	    cur = attrs[key];
	    old = oldAttrs[key];
	    if (old !== cur) {
	      setAttr(elm, key, cur);
	    }
	  }
	  // #4391: in IE9, setting type can reset value for input[type=radio]
	  // #6666: IE/Edge forces progress value down to 1 before setting a max
	  /* istanbul ignore if */
	  if ((isIE9 || isEdge) && attrs.value !== oldAttrs.value) {
	    setAttr(elm, 'value', attrs.value);
	  }
	  for (key in oldAttrs) {
	    if (isUndef(attrs[key])) {
	      if (isXlink(key)) {
	        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
	      } else if (!isEnumeratedAttr(key)) {
	        elm.removeAttribute(key);
	      }
	    }
	  }
	}

	function setAttr (el, key, value) {
	  if (isBooleanAttr(key)) {
	    // set attribute for blank value
	    // e.g. <option disabled>Select one</option>
	    if (isFalsyAttrValue(value)) {
	      el.removeAttribute(key);
	    } else {
	      // technically allowfullscreen is a boolean attribute for <iframe>,
	      // but Flash expects a value of "true" when used on <embed> tag
	      value = key === 'allowfullscreen' && el.tagName === 'EMBED'
	        ? 'true'
	        : key;
	      el.setAttribute(key, value);
	    }
	  } else if (isEnumeratedAttr(key)) {
	    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
	  } else if (isXlink(key)) {
	    if (isFalsyAttrValue(value)) {
	      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
	    } else {
	      el.setAttributeNS(xlinkNS, key, value);
	    }
	  } else {
	    if (isFalsyAttrValue(value)) {
	      el.removeAttribute(key);
	    } else {
	      el.setAttribute(key, value);
	    }
	  }
	}

	var attrs = {
	  create: updateAttrs,
	  update: updateAttrs
	};

	/*  */

	function updateClass (oldVnode, vnode) {
	  var el = vnode.elm;
	  var data = vnode.data;
	  var oldData = oldVnode.data;
	  if (
	    isUndef(data.staticClass) &&
	    isUndef(data.class) && (
	      isUndef(oldData) || (
	        isUndef(oldData.staticClass) &&
	        isUndef(oldData.class)
	      )
	    )
	  ) {
	    return
	  }

	  var cls = genClassForVnode(vnode);

	  // handle transition classes
	  var transitionClass = el._transitionClasses;
	  if (isDef(transitionClass)) {
	    cls = concat(cls, stringifyClass(transitionClass));
	  }

	  // set the class
	  if (cls !== el._prevClass) {
	    el.setAttribute('class', cls);
	    el._prevClass = cls;
	  }
	}

	var klass = {
	  create: updateClass,
	  update: updateClass
	};

	/*  */

	var validDivisionCharRE = /[\w).+\-_$\]]/;

	function parseFilters (exp) {
	  var inSingle = false;
	  var inDouble = false;
	  var inTemplateString = false;
	  var inRegex = false;
	  var curly = 0;
	  var square = 0;
	  var paren = 0;
	  var lastFilterIndex = 0;
	  var c, prev, i, expression, filters;

	  for (i = 0; i < exp.length; i++) {
	    prev = c;
	    c = exp.charCodeAt(i);
	    if (inSingle) {
	      if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
	    } else if (inDouble) {
	      if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
	    } else if (inTemplateString) {
	      if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
	    } else if (inRegex) {
	      if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
	    } else if (
	      c === 0x7C && // pipe
	      exp.charCodeAt(i + 1) !== 0x7C &&
	      exp.charCodeAt(i - 1) !== 0x7C &&
	      !curly && !square && !paren
	    ) {
	      if (expression === undefined) {
	        // first filter, end of expression
	        lastFilterIndex = i + 1;
	        expression = exp.slice(0, i).trim();
	      } else {
	        pushFilter();
	      }
	    } else {
	      switch (c) {
	        case 0x22: inDouble = true; break         // "
	        case 0x27: inSingle = true; break         // '
	        case 0x60: inTemplateString = true; break // `
	        case 0x28: paren++; break                 // (
	        case 0x29: paren--; break                 // )
	        case 0x5B: square++; break                // [
	        case 0x5D: square--; break                // ]
	        case 0x7B: curly++; break                 // {
	        case 0x7D: curly--; break                 // }
	      }
	      if (c === 0x2f) { // /
	        var j = i - 1;
	        var p = (void 0);
	        // find first non-whitespace prev char
	        for (; j >= 0; j--) {
	          p = exp.charAt(j);
	          if (p !== ' ') { break }
	        }
	        if (!p || !validDivisionCharRE.test(p)) {
	          inRegex = true;
	        }
	      }
	    }
	  }

	  if (expression === undefined) {
	    expression = exp.slice(0, i).trim();
	  } else if (lastFilterIndex !== 0) {
	    pushFilter();
	  }

	  function pushFilter () {
	    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
	    lastFilterIndex = i + 1;
	  }

	  if (filters) {
	    for (i = 0; i < filters.length; i++) {
	      expression = wrapFilter(expression, filters[i]);
	    }
	  }

	  return expression
	}

	function wrapFilter (exp, filter) {
	  var i = filter.indexOf('(');
	  if (i < 0) {
	    // _f: resolveFilter
	    return ("_f(\"" + filter + "\")(" + exp + ")")
	  } else {
	    var name = filter.slice(0, i);
	    var args = filter.slice(i + 1);
	    return ("_f(\"" + name + "\")(" + exp + "," + args)
	  }
	}

	/*  */

	function baseWarn (msg) {
	  console.error(("[Vue compiler]: " + msg));
	}

	function pluckModuleFunction (
	  modules,
	  key
	) {
	  return modules
	    ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
	    : []
	}

	function addProp (el, name, value) {
	  (el.props || (el.props = [])).push({ name: name, value: value });
	}

	function addAttr (el, name, value) {
	  (el.attrs || (el.attrs = [])).push({ name: name, value: value });
	}

	function addDirective (
	  el,
	  name,
	  rawName,
	  value,
	  arg,
	  modifiers
	) {
	  (el.directives || (el.directives = [])).push({ name: name, rawName: rawName, value: value, arg: arg, modifiers: modifiers });
	}

	function addHandler (
	  el,
	  name,
	  value,
	  modifiers,
	  important,
	  warn
	) {
	  // warn prevent and passive modifier
	  /* istanbul ignore if */
	  if (
	    false
	  ) {
	    warn(
	      'passive and prevent can\'t be used together. ' +
	      'Passive handler can\'t prevent default event.'
	    );
	  }
	  // check capture modifier
	  if (modifiers && modifiers.capture) {
	    delete modifiers.capture;
	    name = '!' + name; // mark the event as captured
	  }
	  if (modifiers && modifiers.once) {
	    delete modifiers.once;
	    name = '~' + name; // mark the event as once
	  }
	  /* istanbul ignore if */
	  if (modifiers && modifiers.passive) {
	    delete modifiers.passive;
	    name = '&' + name; // mark the event as passive
	  }
	  var events;
	  if (modifiers && modifiers.native) {
	    delete modifiers.native;
	    events = el.nativeEvents || (el.nativeEvents = {});
	  } else {
	    events = el.events || (el.events = {});
	  }
	  var newHandler = { value: value, modifiers: modifiers };
	  var handlers = events[name];
	  /* istanbul ignore if */
	  if (Array.isArray(handlers)) {
	    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
	  } else if (handlers) {
	    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
	  } else {
	    events[name] = newHandler;
	  }
	}

	function getBindingAttr (
	  el,
	  name,
	  getStatic
	) {
	  var dynamicValue =
	    getAndRemoveAttr(el, ':' + name) ||
	    getAndRemoveAttr(el, 'v-bind:' + name);
	  if (dynamicValue != null) {
	    return parseFilters(dynamicValue)
	  } else if (getStatic !== false) {
	    var staticValue = getAndRemoveAttr(el, name);
	    if (staticValue != null) {
	      return JSON.stringify(staticValue)
	    }
	  }
	}

	// note: this only removes the attr from the Array (attrsList) so that it
	// doesn't get processed by processAttrs.
	// By default it does NOT remove it from the map (attrsMap) because the map is
	// needed during codegen.
	function getAndRemoveAttr (
	  el,
	  name,
	  removeFromMap
	) {
	  var val;
	  if ((val = el.attrsMap[name]) != null) {
	    var list = el.attrsList;
	    for (var i = 0, l = list.length; i < l; i++) {
	      if (list[i].name === name) {
	        list.splice(i, 1);
	        break
	      }
	    }
	  }
	  if (removeFromMap) {
	    delete el.attrsMap[name];
	  }
	  return val
	}

	/*  */

	/**
	 * Cross-platform code generation for component v-model
	 */
	function genComponentModel (
	  el,
	  value,
	  modifiers
	) {
	  var ref = modifiers || {};
	  var number = ref.number;
	  var trim = ref.trim;

	  var baseValueExpression = '$$v';
	  var valueExpression = baseValueExpression;
	  if (trim) {
	    valueExpression =
	      "(typeof " + baseValueExpression + " === 'string'" +
	        "? " + baseValueExpression + ".trim()" +
	        ": " + baseValueExpression + ")";
	  }
	  if (number) {
	    valueExpression = "_n(" + valueExpression + ")";
	  }
	  var assignment = genAssignmentCode(value, valueExpression);

	  el.model = {
	    value: ("(" + value + ")"),
	    expression: ("\"" + value + "\""),
	    callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
	  };
	}

	/**
	 * Cross-platform codegen helper for generating v-model value assignment code.
	 */
	function genAssignmentCode (
	  value,
	  assignment
	) {
	  var res = parseModel(value);
	  if (res.key === null) {
	    return (value + "=" + assignment)
	  } else {
	    return ("$set(" + (res.exp) + ", " + (res.key) + ", " + assignment + ")")
	  }
	}

	/**
	 * Parse a v-model expression into a base path and a final key segment.
	 * Handles both dot-path and possible square brackets.
	 *
	 * Possible cases:
	 *
	 * - test
	 * - test[key]
	 * - test[test1[key]]
	 * - test["a"][key]
	 * - xxx.test[a[a].test1[key]]
	 * - test.xxx.a["asa"][test1[key]]
	 *
	 */

	var len;
	var str;
	var chr;
	var index$1;
	var expressionPos;
	var expressionEndPos;



	function parseModel (val) {
	  len = val.length;

	  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
	    index$1 = val.lastIndexOf('.');
	    if (index$1 > -1) {
	      return {
	        exp: val.slice(0, index$1),
	        key: '"' + val.slice(index$1 + 1) + '"'
	      }
	    } else {
	      return {
	        exp: val,
	        key: null
	      }
	    }
	  }

	  str = val;
	  index$1 = expressionPos = expressionEndPos = 0;

	  while (!eof()) {
	    chr = next();
	    /* istanbul ignore if */
	    if (isStringStart(chr)) {
	      parseString(chr);
	    } else if (chr === 0x5B) {
	      parseBracket(chr);
	    }
	  }

	  return {
	    exp: val.slice(0, expressionPos),
	    key: val.slice(expressionPos + 1, expressionEndPos)
	  }
	}

	function next () {
	  return str.charCodeAt(++index$1)
	}

	function eof () {
	  return index$1 >= len
	}

	function isStringStart (chr) {
	  return chr === 0x22 || chr === 0x27
	}

	function parseBracket (chr) {
	  var inBracket = 1;
	  expressionPos = index$1;
	  while (!eof()) {
	    chr = next();
	    if (isStringStart(chr)) {
	      parseString(chr);
	      continue
	    }
	    if (chr === 0x5B) { inBracket++; }
	    if (chr === 0x5D) { inBracket--; }
	    if (inBracket === 0) {
	      expressionEndPos = index$1;
	      break
	    }
	  }
	}

	function parseString (chr) {
	  var stringQuote = chr;
	  while (!eof()) {
	    chr = next();
	    if (chr === stringQuote) {
	      break
	    }
	  }
	}

	/*  */

	var warn$1;

	// in some cases, the event used has to be determined at runtime
	// so we used some reserved tokens during compile.
	var RANGE_TOKEN = '__r';
	var CHECKBOX_RADIO_TOKEN = '__c';

	function model (
	  el,
	  dir,
	  _warn
	) {
	  warn$1 = _warn;
	  var value = dir.value;
	  var modifiers = dir.modifiers;
	  var tag = el.tag;
	  var type = el.attrsMap.type;

	  if (false) {
	    // inputs with type="file" are read only and setting the input's
	    // value will throw an error.
	    if (tag === 'input' && type === 'file') {
	      warn$1(
	        "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
	        "File inputs are read only. Use a v-on:change listener instead."
	      );
	    }
	  }

	  if (el.component) {
	    genComponentModel(el, value, modifiers);
	    // component v-model doesn't need extra runtime
	    return false
	  } else if (tag === 'select') {
	    genSelect(el, value, modifiers);
	  } else if (tag === 'input' && type === 'checkbox') {
	    genCheckboxModel(el, value, modifiers);
	  } else if (tag === 'input' && type === 'radio') {
	    genRadioModel(el, value, modifiers);
	  } else if (tag === 'input' || tag === 'textarea') {
	    genDefaultModel(el, value, modifiers);
	  } else if (!config.isReservedTag(tag)) {
	    genComponentModel(el, value, modifiers);
	    // component v-model doesn't need extra runtime
	    return false
	  } else if (false) {
	    warn$1(
	      "<" + (el.tag) + " v-model=\"" + value + "\">: " +
	      "v-model is not supported on this element type. " +
	      'If you are working with contenteditable, it\'s recommended to ' +
	      'wrap a library dedicated for that purpose inside a custom component.'
	    );
	  }

	  // ensure runtime directive metadata
	  return true
	}

	function genCheckboxModel (
	  el,
	  value,
	  modifiers
	) {
	  var number = modifiers && modifiers.number;
	  var valueBinding = getBindingAttr(el, 'value') || 'null';
	  var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
	  var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
	  addProp(el, 'checked',
	    "Array.isArray(" + value + ")" +
	      "?_i(" + value + "," + valueBinding + ")>-1" + (
	        trueValueBinding === 'true'
	          ? (":(" + value + ")")
	          : (":_q(" + value + "," + trueValueBinding + ")")
	      )
	  );
	  addHandler(el, 'change',
	    "var $$a=" + value + "," +
	        '$$el=$event.target,' +
	        "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
	    'if(Array.isArray($$a)){' +
	      "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
	          '$$i=_i($$a,$$v);' +
	      "if($$el.checked){$$i<0&&(" + value + "=$$a.concat([$$v]))}" +
	      "else{$$i>-1&&(" + value + "=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}" +
	    "}else{" + (genAssignmentCode(value, '$$c')) + "}",
	    null, true
	  );
	}

	function genRadioModel (
	    el,
	    value,
	    modifiers
	) {
	  var number = modifiers && modifiers.number;
	  var valueBinding = getBindingAttr(el, 'value') || 'null';
	  valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
	  addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
	  addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
	}

	function genSelect (
	    el,
	    value,
	    modifiers
	) {
	  var number = modifiers && modifiers.number;
	  var selectedVal = "Array.prototype.filter" +
	    ".call($event.target.options,function(o){return o.selected})" +
	    ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
	    "return " + (number ? '_n(val)' : 'val') + "})";

	  var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
	  var code = "var $$selectedVal = " + selectedVal + ";";
	  code = code + " " + (genAssignmentCode(value, assignment));
	  addHandler(el, 'change', code, null, true);
	}

	function genDefaultModel (
	  el,
	  value,
	  modifiers
	) {
	  var type = el.attrsMap.type;
	  var ref = modifiers || {};
	  var lazy = ref.lazy;
	  var number = ref.number;
	  var trim = ref.trim;
	  var needCompositionGuard = !lazy && type !== 'range';
	  var event = lazy
	    ? 'change'
	    : type === 'range'
	      ? RANGE_TOKEN
	      : 'input';

	  var valueExpression = '$event.target.value';
	  if (trim) {
	    valueExpression = "$event.target.value.trim()";
	  }
	  if (number) {
	    valueExpression = "_n(" + valueExpression + ")";
	  }

	  var code = genAssignmentCode(value, valueExpression);
	  if (needCompositionGuard) {
	    code = "if($event.target.composing)return;" + code;
	  }

	  addProp(el, 'value', ("(" + value + ")"));
	  addHandler(el, event, code, null, true);
	  if (trim || number) {
	    addHandler(el, 'blur', '$forceUpdate()');
	  }
	}

	/*  */

	// normalize v-model event tokens that can only be determined at runtime.
	// it's important to place the event as the first in the array because
	// the whole point is ensuring the v-model callback gets called before
	// user-attached handlers.
	function normalizeEvents (on) {
	  /* istanbul ignore if */
	  if (isDef(on[RANGE_TOKEN])) {
	    // IE input[type=range] only supports `change` event
	    var event = isIE ? 'change' : 'input';
	    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
	    delete on[RANGE_TOKEN];
	  }
	  // This was originally intended to fix #4521 but no longer necessary
	  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
	  /* istanbul ignore if */
	  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
	    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
	    delete on[CHECKBOX_RADIO_TOKEN];
	  }
	}

	var target$1;

	function createOnceHandler (handler, event, capture) {
	  var _target = target$1; // save current target element in closure
	  return function onceHandler () {
	    var res = handler.apply(null, arguments);
	    if (res !== null) {
	      remove$2(event, onceHandler, capture, _target);
	    }
	  }
	}

	function add$1 (
	  event,
	  handler,
	  once$$1,
	  capture,
	  passive
	) {
	  handler = withMacroTask(handler);
	  if (once$$1) { handler = createOnceHandler(handler, event, capture); }
	  target$1.addEventListener(
	    event,
	    handler,
	    supportsPassive
	      ? { capture: capture, passive: passive }
	      : capture
	  );
	}

	function remove$2 (
	  event,
	  handler,
	  capture,
	  _target
	) {
	  (_target || target$1).removeEventListener(
	    event,
	    handler._withTask || handler,
	    capture
	  );
	}

	function updateDOMListeners (oldVnode, vnode) {
	  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
	    return
	  }
	  var on = vnode.data.on || {};
	  var oldOn = oldVnode.data.on || {};
	  target$1 = vnode.elm;
	  normalizeEvents(on);
	  updateListeners(on, oldOn, add$1, remove$2, vnode.context);
	}

	var events = {
	  create: updateDOMListeners,
	  update: updateDOMListeners
	};

	/*  */

	function updateDOMProps (oldVnode, vnode) {
	  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
	    return
	  }
	  var key, cur;
	  var elm = vnode.elm;
	  var oldProps = oldVnode.data.domProps || {};
	  var props = vnode.data.domProps || {};
	  // clone observed objects, as the user probably wants to mutate it
	  if (isDef(props.__ob__)) {
	    props = vnode.data.domProps = extend({}, props);
	  }

	  for (key in oldProps) {
	    if (isUndef(props[key])) {
	      elm[key] = '';
	    }
	  }
	  for (key in props) {
	    cur = props[key];
	    // ignore children if the node has textContent or innerHTML,
	    // as these will throw away existing DOM nodes and cause removal errors
	    // on subsequent patches (#3360)
	    if (key === 'textContent' || key === 'innerHTML') {
	      if (vnode.children) { vnode.children.length = 0; }
	      if (cur === oldProps[key]) { continue }
	      // #6601 work around Chrome version <= 55 bug where single textNode
	      // replaced by innerHTML/textContent retains its parentNode property
	      if (elm.childNodes.length === 1) {
	        elm.removeChild(elm.childNodes[0]);
	      }
	    }

	    if (key === 'value') {
	      // store value as _value as well since
	      // non-string values will be stringified
	      elm._value = cur;
	      // avoid resetting cursor position when value is the same
	      var strCur = isUndef(cur) ? '' : String(cur);
	      if (shouldUpdateValue(elm, strCur)) {
	        elm.value = strCur;
	      }
	    } else {
	      elm[key] = cur;
	    }
	  }
	}

	// check platforms/web/util/attrs.js acceptValue


	function shouldUpdateValue (elm, checkVal) {
	  return (!elm.composing && (
	    elm.tagName === 'OPTION' ||
	    isDirty(elm, checkVal) ||
	    isInputChanged(elm, checkVal)
	  ))
	}

	function isDirty (elm, checkVal) {
	  // return true when textbox (.number and .trim) loses focus and its value is
	  // not equal to the updated value
	  var notInFocus = true;
	  // #6157
	  // work around IE bug when accessing document.activeElement in an iframe
	  try { notInFocus = document.activeElement !== elm; } catch (e) {}
	  return notInFocus && elm.value !== checkVal
	}

	function isInputChanged (elm, newVal) {
	  var value = elm.value;
	  var modifiers = elm._vModifiers; // injected by v-model runtime
	  if (isDef(modifiers) && modifiers.number) {
	    return toNumber(value) !== toNumber(newVal)
	  }
	  if (isDef(modifiers) && modifiers.trim) {
	    return value.trim() !== newVal.trim()
	  }
	  return value !== newVal
	}

	var domProps = {
	  create: updateDOMProps,
	  update: updateDOMProps
	};

	/*  */

	var parseStyleText = cached(function (cssText) {
	  var res = {};
	  var listDelimiter = /;(?![^(]*\))/g;
	  var propertyDelimiter = /:(.+)/;
	  cssText.split(listDelimiter).forEach(function (item) {
	    if (item) {
	      var tmp = item.split(propertyDelimiter);
	      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
	    }
	  });
	  return res
	});

	// merge static and dynamic style data on the same vnode
	function normalizeStyleData (data) {
	  var style = normalizeStyleBinding(data.style);
	  // static style is pre-processed into an object during compilation
	  // and is always a fresh object, so it's safe to merge into it
	  return data.staticStyle
	    ? extend(data.staticStyle, style)
	    : style
	}

	// normalize possible array / string values into Object
	function normalizeStyleBinding (bindingStyle) {
	  if (Array.isArray(bindingStyle)) {
	    return toObject(bindingStyle)
	  }
	  if (typeof bindingStyle === 'string') {
	    return parseStyleText(bindingStyle)
	  }
	  return bindingStyle
	}

	/**
	 * parent component style should be after child's
	 * so that parent component's style could override it
	 */
	function getStyle (vnode, checkChild) {
	  var res = {};
	  var styleData;

	  if (checkChild) {
	    var childNode = vnode;
	    while (childNode.componentInstance) {
	      childNode = childNode.componentInstance._vnode;
	      if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
	        extend(res, styleData);
	      }
	    }
	  }

	  if ((styleData = normalizeStyleData(vnode.data))) {
	    extend(res, styleData);
	  }

	  var parentNode = vnode;
	  while ((parentNode = parentNode.parent)) {
	    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
	      extend(res, styleData);
	    }
	  }
	  return res
	}

	/*  */

	var cssVarRE = /^--/;
	var importantRE = /\s*!important$/;
	var setProp = function (el, name, val) {
	  /* istanbul ignore if */
	  if (cssVarRE.test(name)) {
	    el.style.setProperty(name, val);
	  } else if (importantRE.test(val)) {
	    el.style.setProperty(name, val.replace(importantRE, ''), 'important');
	  } else {
	    var normalizedName = normalize(name);
	    if (Array.isArray(val)) {
	      // Support values array created by autoprefixer, e.g.
	      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
	      // Set them one by one, and the browser will only set those it can recognize
	      for (var i = 0, len = val.length; i < len; i++) {
	        el.style[normalizedName] = val[i];
	      }
	    } else {
	      el.style[normalizedName] = val;
	    }
	  }
	};

	var vendorNames = ['Webkit', 'Moz', 'ms'];

	var emptyStyle;
	var normalize = cached(function (prop) {
	  emptyStyle = emptyStyle || document.createElement('div').style;
	  prop = camelize(prop);
	  if (prop !== 'filter' && (prop in emptyStyle)) {
	    return prop
	  }
	  var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
	  for (var i = 0; i < vendorNames.length; i++) {
	    var name = vendorNames[i] + capName;
	    if (name in emptyStyle) {
	      return name
	    }
	  }
	});

	function updateStyle (oldVnode, vnode) {
	  var data = vnode.data;
	  var oldData = oldVnode.data;

	  if (isUndef(data.staticStyle) && isUndef(data.style) &&
	    isUndef(oldData.staticStyle) && isUndef(oldData.style)
	  ) {
	    return
	  }

	  var cur, name;
	  var el = vnode.elm;
	  var oldStaticStyle = oldData.staticStyle;
	  var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

	  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
	  var oldStyle = oldStaticStyle || oldStyleBinding;

	  var style = normalizeStyleBinding(vnode.data.style) || {};

	  // store normalized style under a different key for next diff
	  // make sure to clone it if it's reactive, since the user likely wants
	  // to mutate it.
	  vnode.data.normalizedStyle = isDef(style.__ob__)
	    ? extend({}, style)
	    : style;

	  var newStyle = getStyle(vnode, true);

	  for (name in oldStyle) {
	    if (isUndef(newStyle[name])) {
	      setProp(el, name, '');
	    }
	  }
	  for (name in newStyle) {
	    cur = newStyle[name];
	    if (cur !== oldStyle[name]) {
	      // ie9 setting to null has no effect, must use empty string
	      setProp(el, name, cur == null ? '' : cur);
	    }
	  }
	}

	var style = {
	  create: updateStyle,
	  update: updateStyle
	};

	/*  */

	/**
	 * Add class with compatibility for SVG since classList is not supported on
	 * SVG elements in IE
	 */
	function addClass (el, cls) {
	  /* istanbul ignore if */
	  if (!cls || !(cls = cls.trim())) {
	    return
	  }

	  /* istanbul ignore else */
	  if (el.classList) {
	    if (cls.indexOf(' ') > -1) {
	      cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
	    } else {
	      el.classList.add(cls);
	    }
	  } else {
	    var cur = " " + (el.getAttribute('class') || '') + " ";
	    if (cur.indexOf(' ' + cls + ' ') < 0) {
	      el.setAttribute('class', (cur + cls).trim());
	    }
	  }
	}

	/**
	 * Remove class with compatibility for SVG since classList is not supported on
	 * SVG elements in IE
	 */
	function removeClass (el, cls) {
	  /* istanbul ignore if */
	  if (!cls || !(cls = cls.trim())) {
	    return
	  }

	  /* istanbul ignore else */
	  if (el.classList) {
	    if (cls.indexOf(' ') > -1) {
	      cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
	    } else {
	      el.classList.remove(cls);
	    }
	    if (!el.classList.length) {
	      el.removeAttribute('class');
	    }
	  } else {
	    var cur = " " + (el.getAttribute('class') || '') + " ";
	    var tar = ' ' + cls + ' ';
	    while (cur.indexOf(tar) >= 0) {
	      cur = cur.replace(tar, ' ');
	    }
	    cur = cur.trim();
	    if (cur) {
	      el.setAttribute('class', cur);
	    } else {
	      el.removeAttribute('class');
	    }
	  }
	}

	/*  */

	function resolveTransition (def) {
	  if (!def) {
	    return
	  }
	  /* istanbul ignore else */
	  if (typeof def === 'object') {
	    var res = {};
	    if (def.css !== false) {
	      extend(res, autoCssTransition(def.name || 'v'));
	    }
	    extend(res, def);
	    return res
	  } else if (typeof def === 'string') {
	    return autoCssTransition(def)
	  }
	}

	var autoCssTransition = cached(function (name) {
	  return {
	    enterClass: (name + "-enter"),
	    enterToClass: (name + "-enter-to"),
	    enterActiveClass: (name + "-enter-active"),
	    leaveClass: (name + "-leave"),
	    leaveToClass: (name + "-leave-to"),
	    leaveActiveClass: (name + "-leave-active")
	  }
	});

	var hasTransition = inBrowser && !isIE9;
	var TRANSITION = 'transition';
	var ANIMATION = 'animation';

	// Transition property/event sniffing
	var transitionProp = 'transition';
	var transitionEndEvent = 'transitionend';
	var animationProp = 'animation';
	var animationEndEvent = 'animationend';
	if (hasTransition) {
	  /* istanbul ignore if */
	  if (window.ontransitionend === undefined &&
	    window.onwebkittransitionend !== undefined
	  ) {
	    transitionProp = 'WebkitTransition';
	    transitionEndEvent = 'webkitTransitionEnd';
	  }
	  if (window.onanimationend === undefined &&
	    window.onwebkitanimationend !== undefined
	  ) {
	    animationProp = 'WebkitAnimation';
	    animationEndEvent = 'webkitAnimationEnd';
	  }
	}

	// binding to window is necessary to make hot reload work in IE in strict mode
	var raf = inBrowser
	  ? window.requestAnimationFrame
	    ? window.requestAnimationFrame.bind(window)
	    : setTimeout
	  : /* istanbul ignore next */ function (fn) { return fn(); };

	function nextFrame (fn) {
	  raf(function () {
	    raf(fn);
	  });
	}

	function addTransitionClass (el, cls) {
	  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
	  if (transitionClasses.indexOf(cls) < 0) {
	    transitionClasses.push(cls);
	    addClass(el, cls);
	  }
	}

	function removeTransitionClass (el, cls) {
	  if (el._transitionClasses) {
	    remove(el._transitionClasses, cls);
	  }
	  removeClass(el, cls);
	}

	function whenTransitionEnds (
	  el,
	  expectedType,
	  cb
	) {
	  var ref = getTransitionInfo(el, expectedType);
	  var type = ref.type;
	  var timeout = ref.timeout;
	  var propCount = ref.propCount;
	  if (!type) { return cb() }
	  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
	  var ended = 0;
	  var end = function () {
	    el.removeEventListener(event, onEnd);
	    cb();
	  };
	  var onEnd = function (e) {
	    if (e.target === el) {
	      if (++ended >= propCount) {
	        end();
	      }
	    }
	  };
	  setTimeout(function () {
	    if (ended < propCount) {
	      end();
	    }
	  }, timeout + 1);
	  el.addEventListener(event, onEnd);
	}

	var transformRE = /\b(transform|all)(,|$)/;

	function getTransitionInfo (el, expectedType) {
	  var styles = window.getComputedStyle(el);
	  var transitionDelays = styles[transitionProp + 'Delay'].split(', ');
	  var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
	  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
	  var animationDelays = styles[animationProp + 'Delay'].split(', ');
	  var animationDurations = styles[animationProp + 'Duration'].split(', ');
	  var animationTimeout = getTimeout(animationDelays, animationDurations);

	  var type;
	  var timeout = 0;
	  var propCount = 0;
	  /* istanbul ignore if */
	  if (expectedType === TRANSITION) {
	    if (transitionTimeout > 0) {
	      type = TRANSITION;
	      timeout = transitionTimeout;
	      propCount = transitionDurations.length;
	    }
	  } else if (expectedType === ANIMATION) {
	    if (animationTimeout > 0) {
	      type = ANIMATION;
	      timeout = animationTimeout;
	      propCount = animationDurations.length;
	    }
	  } else {
	    timeout = Math.max(transitionTimeout, animationTimeout);
	    type = timeout > 0
	      ? transitionTimeout > animationTimeout
	        ? TRANSITION
	        : ANIMATION
	      : null;
	    propCount = type
	      ? type === TRANSITION
	        ? transitionDurations.length
	        : animationDurations.length
	      : 0;
	  }
	  var hasTransform =
	    type === TRANSITION &&
	    transformRE.test(styles[transitionProp + 'Property']);
	  return {
	    type: type,
	    timeout: timeout,
	    propCount: propCount,
	    hasTransform: hasTransform
	  }
	}

	function getTimeout (delays, durations) {
	  /* istanbul ignore next */
	  while (delays.length < durations.length) {
	    delays = delays.concat(delays);
	  }

	  return Math.max.apply(null, durations.map(function (d, i) {
	    return toMs(d) + toMs(delays[i])
	  }))
	}

	function toMs (s) {
	  return Number(s.slice(0, -1)) * 1000
	}

	/*  */

	function enter (vnode, toggleDisplay) {
	  var el = vnode.elm;

	  // call leave callback now
	  if (isDef(el._leaveCb)) {
	    el._leaveCb.cancelled = true;
	    el._leaveCb();
	  }

	  var data = resolveTransition(vnode.data.transition);
	  if (isUndef(data)) {
	    return
	  }

	  /* istanbul ignore if */
	  if (isDef(el._enterCb) || el.nodeType !== 1) {
	    return
	  }

	  var css = data.css;
	  var type = data.type;
	  var enterClass = data.enterClass;
	  var enterToClass = data.enterToClass;
	  var enterActiveClass = data.enterActiveClass;
	  var appearClass = data.appearClass;
	  var appearToClass = data.appearToClass;
	  var appearActiveClass = data.appearActiveClass;
	  var beforeEnter = data.beforeEnter;
	  var enter = data.enter;
	  var afterEnter = data.afterEnter;
	  var enterCancelled = data.enterCancelled;
	  var beforeAppear = data.beforeAppear;
	  var appear = data.appear;
	  var afterAppear = data.afterAppear;
	  var appearCancelled = data.appearCancelled;
	  var duration = data.duration;

	  // activeInstance will always be the <transition> component managing this
	  // transition. One edge case to check is when the <transition> is placed
	  // as the root node of a child component. In that case we need to check
	  // <transition>'s parent for appear check.
	  var context = activeInstance;
	  var transitionNode = activeInstance.$vnode;
	  while (transitionNode && transitionNode.parent) {
	    transitionNode = transitionNode.parent;
	    context = transitionNode.context;
	  }

	  var isAppear = !context._isMounted || !vnode.isRootInsert;

	  if (isAppear && !appear && appear !== '') {
	    return
	  }

	  var startClass = isAppear && appearClass
	    ? appearClass
	    : enterClass;
	  var activeClass = isAppear && appearActiveClass
	    ? appearActiveClass
	    : enterActiveClass;
	  var toClass = isAppear && appearToClass
	    ? appearToClass
	    : enterToClass;

	  var beforeEnterHook = isAppear
	    ? (beforeAppear || beforeEnter)
	    : beforeEnter;
	  var enterHook = isAppear
	    ? (typeof appear === 'function' ? appear : enter)
	    : enter;
	  var afterEnterHook = isAppear
	    ? (afterAppear || afterEnter)
	    : afterEnter;
	  var enterCancelledHook = isAppear
	    ? (appearCancelled || enterCancelled)
	    : enterCancelled;

	  var explicitEnterDuration = toNumber(
	    isObject(duration)
	      ? duration.enter
	      : duration
	  );

	  if (false) {
	    checkDuration(explicitEnterDuration, 'enter', vnode);
	  }

	  var expectsCSS = css !== false && !isIE9;
	  var userWantsControl = getHookArgumentsLength(enterHook);

	  var cb = el._enterCb = once(function () {
	    if (expectsCSS) {
	      removeTransitionClass(el, toClass);
	      removeTransitionClass(el, activeClass);
	    }
	    if (cb.cancelled) {
	      if (expectsCSS) {
	        removeTransitionClass(el, startClass);
	      }
	      enterCancelledHook && enterCancelledHook(el);
	    } else {
	      afterEnterHook && afterEnterHook(el);
	    }
	    el._enterCb = null;
	  });

	  if (!vnode.data.show) {
	    // remove pending leave element on enter by injecting an insert hook
	    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
	      var parent = el.parentNode;
	      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
	      if (pendingNode &&
	        pendingNode.tag === vnode.tag &&
	        pendingNode.elm._leaveCb
	      ) {
	        pendingNode.elm._leaveCb();
	      }
	      enterHook && enterHook(el, cb);
	    });
	  }

	  // start enter transition
	  beforeEnterHook && beforeEnterHook(el);
	  if (expectsCSS) {
	    addTransitionClass(el, startClass);
	    addTransitionClass(el, activeClass);
	    nextFrame(function () {
	      addTransitionClass(el, toClass);
	      removeTransitionClass(el, startClass);
	      if (!cb.cancelled && !userWantsControl) {
	        if (isValidDuration(explicitEnterDuration)) {
	          setTimeout(cb, explicitEnterDuration);
	        } else {
	          whenTransitionEnds(el, type, cb);
	        }
	      }
	    });
	  }

	  if (vnode.data.show) {
	    toggleDisplay && toggleDisplay();
	    enterHook && enterHook(el, cb);
	  }

	  if (!expectsCSS && !userWantsControl) {
	    cb();
	  }
	}

	function leave (vnode, rm) {
	  var el = vnode.elm;

	  // call enter callback now
	  if (isDef(el._enterCb)) {
	    el._enterCb.cancelled = true;
	    el._enterCb();
	  }

	  var data = resolveTransition(vnode.data.transition);
	  if (isUndef(data)) {
	    return rm()
	  }

	  /* istanbul ignore if */
	  if (isDef(el._leaveCb) || el.nodeType !== 1) {
	    return
	  }

	  var css = data.css;
	  var type = data.type;
	  var leaveClass = data.leaveClass;
	  var leaveToClass = data.leaveToClass;
	  var leaveActiveClass = data.leaveActiveClass;
	  var beforeLeave = data.beforeLeave;
	  var leave = data.leave;
	  var afterLeave = data.afterLeave;
	  var leaveCancelled = data.leaveCancelled;
	  var delayLeave = data.delayLeave;
	  var duration = data.duration;

	  var expectsCSS = css !== false && !isIE9;
	  var userWantsControl = getHookArgumentsLength(leave);

	  var explicitLeaveDuration = toNumber(
	    isObject(duration)
	      ? duration.leave
	      : duration
	  );

	  if (false) {
	    checkDuration(explicitLeaveDuration, 'leave', vnode);
	  }

	  var cb = el._leaveCb = once(function () {
	    if (el.parentNode && el.parentNode._pending) {
	      el.parentNode._pending[vnode.key] = null;
	    }
	    if (expectsCSS) {
	      removeTransitionClass(el, leaveToClass);
	      removeTransitionClass(el, leaveActiveClass);
	    }
	    if (cb.cancelled) {
	      if (expectsCSS) {
	        removeTransitionClass(el, leaveClass);
	      }
	      leaveCancelled && leaveCancelled(el);
	    } else {
	      rm();
	      afterLeave && afterLeave(el);
	    }
	    el._leaveCb = null;
	  });

	  if (delayLeave) {
	    delayLeave(performLeave);
	  } else {
	    performLeave();
	  }

	  function performLeave () {
	    // the delayed leave may have already been cancelled
	    if (cb.cancelled) {
	      return
	    }
	    // record leaving element
	    if (!vnode.data.show) {
	      (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
	    }
	    beforeLeave && beforeLeave(el);
	    if (expectsCSS) {
	      addTransitionClass(el, leaveClass);
	      addTransitionClass(el, leaveActiveClass);
	      nextFrame(function () {
	        addTransitionClass(el, leaveToClass);
	        removeTransitionClass(el, leaveClass);
	        if (!cb.cancelled && !userWantsControl) {
	          if (isValidDuration(explicitLeaveDuration)) {
	            setTimeout(cb, explicitLeaveDuration);
	          } else {
	            whenTransitionEnds(el, type, cb);
	          }
	        }
	      });
	    }
	    leave && leave(el, cb);
	    if (!expectsCSS && !userWantsControl) {
	      cb();
	    }
	  }
	}

	// only used in dev mode
	function checkDuration (val, name, vnode) {
	  if (typeof val !== 'number') {
	    warn(
	      "<transition> explicit " + name + " duration is not a valid number - " +
	      "got " + (JSON.stringify(val)) + ".",
	      vnode.context
	    );
	  } else if (isNaN(val)) {
	    warn(
	      "<transition> explicit " + name + " duration is NaN - " +
	      'the duration expression might be incorrect.',
	      vnode.context
	    );
	  }
	}

	function isValidDuration (val) {
	  return typeof val === 'number' && !isNaN(val)
	}

	/**
	 * Normalize a transition hook's argument length. The hook may be:
	 * - a merged hook (invoker) with the original in .fns
	 * - a wrapped component method (check ._length)
	 * - a plain function (.length)
	 */
	function getHookArgumentsLength (fn) {
	  if (isUndef(fn)) {
	    return false
	  }
	  var invokerFns = fn.fns;
	  if (isDef(invokerFns)) {
	    // invoker
	    return getHookArgumentsLength(
	      Array.isArray(invokerFns)
	        ? invokerFns[0]
	        : invokerFns
	    )
	  } else {
	    return (fn._length || fn.length) > 1
	  }
	}

	function _enter (_, vnode) {
	  if (vnode.data.show !== true) {
	    enter(vnode);
	  }
	}

	var transition = inBrowser ? {
	  create: _enter,
	  activate: _enter,
	  remove: function remove$$1 (vnode, rm) {
	    /* istanbul ignore else */
	    if (vnode.data.show !== true) {
	      leave(vnode, rm);
	    } else {
	      rm();
	    }
	  }
	} : {};

	var platformModules = [
	  attrs,
	  klass,
	  events,
	  domProps,
	  style,
	  transition
	];

	/*  */

	// the directive module should be applied last, after all
	// built-in modules have been applied.
	var modules = platformModules.concat(baseModules);

	var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

	/**
	 * Not type checking this file because flow doesn't like attaching
	 * properties to Elements.
	 */

	/* istanbul ignore if */
	if (isIE9) {
	  // http://www.matts411.com/post/internet-explorer-9-oninput/
	  document.addEventListener('selectionchange', function () {
	    var el = document.activeElement;
	    if (el && el.vmodel) {
	      trigger(el, 'input');
	    }
	  });
	}

	var model$1 = {
	  inserted: function inserted (el, binding, vnode) {
	    if (vnode.tag === 'select') {
	      setSelected(el, binding, vnode.context);
	      el._vOptions = [].map.call(el.options, getValue);
	    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
	      el._vModifiers = binding.modifiers;
	      if (!binding.modifiers.lazy) {
	        // Safari < 10.2 & UIWebView doesn't fire compositionend when
	        // switching focus before confirming composition choice
	        // this also fixes the issue where some browsers e.g. iOS Chrome
	        // fires "change" instead of "input" on autocomplete.
	        el.addEventListener('change', onCompositionEnd);
	        if (!isAndroid) {
	          el.addEventListener('compositionstart', onCompositionStart);
	          el.addEventListener('compositionend', onCompositionEnd);
	        }
	        /* istanbul ignore if */
	        if (isIE9) {
	          el.vmodel = true;
	        }
	      }
	    }
	  },
	  componentUpdated: function componentUpdated (el, binding, vnode) {
	    if (vnode.tag === 'select') {
	      setSelected(el, binding, vnode.context);
	      // in case the options rendered by v-for have changed,
	      // it's possible that the value is out-of-sync with the rendered options.
	      // detect such cases and filter out values that no longer has a matching
	      // option in the DOM.
	      var prevOptions = el._vOptions;
	      var curOptions = el._vOptions = [].map.call(el.options, getValue);
	      if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
	        // trigger change event if
	        // no matching option found for at least one value
	        var needReset = el.multiple
	          ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
	          : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
	        if (needReset) {
	          trigger(el, 'change');
	        }
	      }
	    }
	  }
	};

	function setSelected (el, binding, vm) {
	  actuallySetSelected(el, binding, vm);
	  /* istanbul ignore if */
	  if (isIE || isEdge) {
	    setTimeout(function () {
	      actuallySetSelected(el, binding, vm);
	    }, 0);
	  }
	}

	function actuallySetSelected (el, binding, vm) {
	  var value = binding.value;
	  var isMultiple = el.multiple;
	  if (isMultiple && !Array.isArray(value)) {
	    ("production") !== 'production' && warn(
	      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
	      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
	      vm
	    );
	    return
	  }
	  var selected, option;
	  for (var i = 0, l = el.options.length; i < l; i++) {
	    option = el.options[i];
	    if (isMultiple) {
	      selected = looseIndexOf(value, getValue(option)) > -1;
	      if (option.selected !== selected) {
	        option.selected = selected;
	      }
	    } else {
	      if (looseEqual(getValue(option), value)) {
	        if (el.selectedIndex !== i) {
	          el.selectedIndex = i;
	        }
	        return
	      }
	    }
	  }
	  if (!isMultiple) {
	    el.selectedIndex = -1;
	  }
	}

	function hasNoMatchingOption (value, options) {
	  return options.every(function (o) { return !looseEqual(o, value); })
	}

	function getValue (option) {
	  return '_value' in option
	    ? option._value
	    : option.value
	}

	function onCompositionStart (e) {
	  e.target.composing = true;
	}

	function onCompositionEnd (e) {
	  // prevent triggering an input event for no reason
	  if (!e.target.composing) { return }
	  e.target.composing = false;
	  trigger(e.target, 'input');
	}

	function trigger (el, type) {
	  var e = document.createEvent('HTMLEvents');
	  e.initEvent(type, true, true);
	  el.dispatchEvent(e);
	}

	/*  */

	// recursively search for possible transition defined inside the component root
	function locateNode (vnode) {
	  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
	    ? locateNode(vnode.componentInstance._vnode)
	    : vnode
	}

	var show = {
	  bind: function bind (el, ref, vnode) {
	    var value = ref.value;

	    vnode = locateNode(vnode);
	    var transition$$1 = vnode.data && vnode.data.transition;
	    var originalDisplay = el.__vOriginalDisplay =
	      el.style.display === 'none' ? '' : el.style.display;
	    if (value && transition$$1) {
	      vnode.data.show = true;
	      enter(vnode, function () {
	        el.style.display = originalDisplay;
	      });
	    } else {
	      el.style.display = value ? originalDisplay : 'none';
	    }
	  },

	  update: function update (el, ref, vnode) {
	    var value = ref.value;
	    var oldValue = ref.oldValue;

	    /* istanbul ignore if */
	    if (value === oldValue) { return }
	    vnode = locateNode(vnode);
	    var transition$$1 = vnode.data && vnode.data.transition;
	    if (transition$$1) {
	      vnode.data.show = true;
	      if (value) {
	        enter(vnode, function () {
	          el.style.display = el.__vOriginalDisplay;
	        });
	      } else {
	        leave(vnode, function () {
	          el.style.display = 'none';
	        });
	      }
	    } else {
	      el.style.display = value ? el.__vOriginalDisplay : 'none';
	    }
	  },

	  unbind: function unbind (
	    el,
	    binding,
	    vnode,
	    oldVnode,
	    isDestroy
	  ) {
	    if (!isDestroy) {
	      el.style.display = el.__vOriginalDisplay;
	    }
	  }
	};

	var platformDirectives = {
	  model: model$1,
	  show: show
	};

	/*  */

	// Provides transition support for a single element/component.
	// supports transition mode (out-in / in-out)

	var transitionProps = {
	  name: String,
	  appear: Boolean,
	  css: Boolean,
	  mode: String,
	  type: String,
	  enterClass: String,
	  leaveClass: String,
	  enterToClass: String,
	  leaveToClass: String,
	  enterActiveClass: String,
	  leaveActiveClass: String,
	  appearClass: String,
	  appearActiveClass: String,
	  appearToClass: String,
	  duration: [Number, String, Object]
	};

	// in case the child is also an abstract component, e.g. <keep-alive>
	// we want to recursively retrieve the real component to be rendered
	function getRealChild (vnode) {
	  var compOptions = vnode && vnode.componentOptions;
	  if (compOptions && compOptions.Ctor.options.abstract) {
	    return getRealChild(getFirstComponentChild(compOptions.children))
	  } else {
	    return vnode
	  }
	}

	function extractTransitionData (comp) {
	  var data = {};
	  var options = comp.$options;
	  // props
	  for (var key in options.propsData) {
	    data[key] = comp[key];
	  }
	  // events.
	  // extract listeners and pass them directly to the transition methods
	  var listeners = options._parentListeners;
	  for (var key$1 in listeners) {
	    data[camelize(key$1)] = listeners[key$1];
	  }
	  return data
	}

	function placeholder (h, rawChild) {
	  if (/\d-keep-alive$/.test(rawChild.tag)) {
	    return h('keep-alive', {
	      props: rawChild.componentOptions.propsData
	    })
	  }
	}

	function hasParentTransition (vnode) {
	  while ((vnode = vnode.parent)) {
	    if (vnode.data.transition) {
	      return true
	    }
	  }
	}

	function isSameChild (child, oldChild) {
	  return oldChild.key === child.key && oldChild.tag === child.tag
	}

	var Transition = {
	  name: 'transition',
	  props: transitionProps,
	  abstract: true,

	  render: function render (h) {
	    var this$1 = this;

	    var children = this.$options._renderChildren;
	    if (!children) {
	      return
	    }

	    // filter out text nodes (possible whitespaces)
	    children = children.filter(function (c) { return c.tag || isAsyncPlaceholder(c); });
	    /* istanbul ignore if */
	    if (!children.length) {
	      return
	    }

	    // warn multiple elements
	    if (false) {
	      warn(
	        '<transition> can only be used on a single element. Use ' +
	        '<transition-group> for lists.',
	        this.$parent
	      );
	    }

	    var mode = this.mode;

	    // warn invalid mode
	    if (false
	    ) {
	      warn(
	        'invalid <transition> mode: ' + mode,
	        this.$parent
	      );
	    }

	    var rawChild = children[0];

	    // if this is a component root node and the component's
	    // parent container node also has transition, skip.
	    if (hasParentTransition(this.$vnode)) {
	      return rawChild
	    }

	    // apply transition data to child
	    // use getRealChild() to ignore abstract components e.g. keep-alive
	    var child = getRealChild(rawChild);
	    /* istanbul ignore if */
	    if (!child) {
	      return rawChild
	    }

	    if (this._leaving) {
	      return placeholder(h, rawChild)
	    }

	    // ensure a key that is unique to the vnode type and to this transition
	    // component instance. This key will be used to remove pending leaving nodes
	    // during entering.
	    var id = "__transition-" + (this._uid) + "-";
	    child.key = child.key == null
	      ? child.isComment
	        ? id + 'comment'
	        : id + child.tag
	      : isPrimitive(child.key)
	        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
	        : child.key;

	    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
	    var oldRawChild = this._vnode;
	    var oldChild = getRealChild(oldRawChild);

	    // mark v-show
	    // so that the transition module can hand over the control to the directive
	    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
	      child.data.show = true;
	    }

	    if (
	      oldChild &&
	      oldChild.data &&
	      !isSameChild(child, oldChild) &&
	      !isAsyncPlaceholder(oldChild)
	    ) {
	      // replace old child transition data with fresh one
	      // important for dynamic transitions!
	      var oldData = oldChild.data.transition = extend({}, data);
	      // handle transition mode
	      if (mode === 'out-in') {
	        // return placeholder node and queue update when leave finishes
	        this._leaving = true;
	        mergeVNodeHook(oldData, 'afterLeave', function () {
	          this$1._leaving = false;
	          this$1.$forceUpdate();
	        });
	        return placeholder(h, rawChild)
	      } else if (mode === 'in-out') {
	        if (isAsyncPlaceholder(child)) {
	          return oldRawChild
	        }
	        var delayedLeave;
	        var performLeave = function () { delayedLeave(); };
	        mergeVNodeHook(data, 'afterEnter', performLeave);
	        mergeVNodeHook(data, 'enterCancelled', performLeave);
	        mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
	      }
	    }

	    return rawChild
	  }
	};

	/*  */

	// Provides transition support for list items.
	// supports move transitions using the FLIP technique.

	// Because the vdom's children update algorithm is "unstable" - i.e.
	// it doesn't guarantee the relative positioning of removed elements,
	// we force transition-group to update its children into two passes:
	// in the first pass, we remove all nodes that need to be removed,
	// triggering their leaving transition; in the second pass, we insert/move
	// into the final desired state. This way in the second pass removed
	// nodes will remain where they should be.

	var props = extend({
	  tag: String,
	  moveClass: String
	}, transitionProps);

	delete props.mode;

	var TransitionGroup = {
	  props: props,

	  render: function render (h) {
	    var tag = this.tag || this.$vnode.data.tag || 'span';
	    var map = Object.create(null);
	    var prevChildren = this.prevChildren = this.children;
	    var rawChildren = this.$slots.default || [];
	    var children = this.children = [];
	    var transitionData = extractTransitionData(this);

	    for (var i = 0; i < rawChildren.length; i++) {
	      var c = rawChildren[i];
	      if (c.tag) {
	        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
	          children.push(c);
	          map[c.key] = c
	          ;(c.data || (c.data = {})).transition = transitionData;
	        } else if (false) {
	          var opts = c.componentOptions;
	          var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
	          warn(("<transition-group> children must be keyed: <" + name + ">"));
	        }
	      }
	    }

	    if (prevChildren) {
	      var kept = [];
	      var removed = [];
	      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
	        var c$1 = prevChildren[i$1];
	        c$1.data.transition = transitionData;
	        c$1.data.pos = c$1.elm.getBoundingClientRect();
	        if (map[c$1.key]) {
	          kept.push(c$1);
	        } else {
	          removed.push(c$1);
	        }
	      }
	      this.kept = h(tag, null, kept);
	      this.removed = removed;
	    }

	    return h(tag, null, children)
	  },

	  beforeUpdate: function beforeUpdate () {
	    // force removing pass
	    this.__patch__(
	      this._vnode,
	      this.kept,
	      false, // hydrating
	      true // removeOnly (!important, avoids unnecessary moves)
	    );
	    this._vnode = this.kept;
	  },

	  updated: function updated () {
	    var children = this.prevChildren;
	    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
	    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
	      return
	    }

	    // we divide the work into three loops to avoid mixing DOM reads and writes
	    // in each iteration - which helps prevent layout thrashing.
	    children.forEach(callPendingCbs);
	    children.forEach(recordPosition);
	    children.forEach(applyTranslation);

	    // force reflow to put everything in position
	    // assign to this to avoid being removed in tree-shaking
	    // $flow-disable-line
	    this._reflow = document.body.offsetHeight;

	    children.forEach(function (c) {
	      if (c.data.moved) {
	        var el = c.elm;
	        var s = el.style;
	        addTransitionClass(el, moveClass);
	        s.transform = s.WebkitTransform = s.transitionDuration = '';
	        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
	          if (!e || /transform$/.test(e.propertyName)) {
	            el.removeEventListener(transitionEndEvent, cb);
	            el._moveCb = null;
	            removeTransitionClass(el, moveClass);
	          }
	        });
	      }
	    });
	  },

	  methods: {
	    hasMove: function hasMove (el, moveClass) {
	      /* istanbul ignore if */
	      if (!hasTransition) {
	        return false
	      }
	      /* istanbul ignore if */
	      if (this._hasMove) {
	        return this._hasMove
	      }
	      // Detect whether an element with the move class applied has
	      // CSS transitions. Since the element may be inside an entering
	      // transition at this very moment, we make a clone of it and remove
	      // all other transition classes applied to ensure only the move class
	      // is applied.
	      var clone = el.cloneNode();
	      if (el._transitionClasses) {
	        el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
	      }
	      addClass(clone, moveClass);
	      clone.style.display = 'none';
	      this.$el.appendChild(clone);
	      var info = getTransitionInfo(clone);
	      this.$el.removeChild(clone);
	      return (this._hasMove = info.hasTransform)
	    }
	  }
	};

	function callPendingCbs (c) {
	  /* istanbul ignore if */
	  if (c.elm._moveCb) {
	    c.elm._moveCb();
	  }
	  /* istanbul ignore if */
	  if (c.elm._enterCb) {
	    c.elm._enterCb();
	  }
	}

	function recordPosition (c) {
	  c.data.newPos = c.elm.getBoundingClientRect();
	}

	function applyTranslation (c) {
	  var oldPos = c.data.pos;
	  var newPos = c.data.newPos;
	  var dx = oldPos.left - newPos.left;
	  var dy = oldPos.top - newPos.top;
	  if (dx || dy) {
	    c.data.moved = true;
	    var s = c.elm.style;
	    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
	    s.transitionDuration = '0s';
	  }
	}

	var platformComponents = {
	  Transition: Transition,
	  TransitionGroup: TransitionGroup
	};

	/*  */

	// install platform specific utils
	Vue$3.config.mustUseProp = mustUseProp;
	Vue$3.config.isReservedTag = isReservedTag;
	Vue$3.config.isReservedAttr = isReservedAttr;
	Vue$3.config.getTagNamespace = getTagNamespace;
	Vue$3.config.isUnknownElement = isUnknownElement;

	// install platform runtime directives & components
	extend(Vue$3.options.directives, platformDirectives);
	extend(Vue$3.options.components, platformComponents);

	// install platform patch function
	Vue$3.prototype.__patch__ = inBrowser ? patch : noop;

	// public mount method
	Vue$3.prototype.$mount = function (
	  el,
	  hydrating
	) {
	  el = el && inBrowser ? query(el) : undefined;
	  return mountComponent(this, el, hydrating)
	};

	// devtools global hook
	/* istanbul ignore next */
	Vue$3.nextTick(function () {
	  if (config.devtools) {
	    if (devtools) {
	      devtools.emit('init', Vue$3);
	    } else if (false) {
	      console[console.info ? 'info' : 'log'](
	        'Download the Vue Devtools extension for a better development experience:\n' +
	        'https://github.com/vuejs/vue-devtools'
	      );
	    }
	  }
	  if (false
	  ) {
	    console[console.info ? 'info' : 'log'](
	      "You are running Vue in development mode.\n" +
	      "Make sure to turn on production mode when deploying for production.\n" +
	      "See more tips at https://vuejs.org/guide/deployment.html"
	    );
	  }
	}, 0);

	/*  */

	// check whether current browser encodes a char inside attribute values
	function shouldDecode (content, encoded) {
	  var div = document.createElement('div');
	  div.innerHTML = "<div a=\"" + content + "\"/>";
	  return div.innerHTML.indexOf(encoded) > 0
	}

	// #3663
	// IE encodes newlines inside attribute values while other browsers don't
	var shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false;

	/*  */

	var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
	var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

	var buildRegex = cached(function (delimiters) {
	  var open = delimiters[0].replace(regexEscapeRE, '\\$&');
	  var close = delimiters[1].replace(regexEscapeRE, '\\$&');
	  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
	});

	function parseText (
	  text,
	  delimiters
	) {
	  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
	  if (!tagRE.test(text)) {
	    return
	  }
	  var tokens = [];
	  var lastIndex = tagRE.lastIndex = 0;
	  var match, index;
	  while ((match = tagRE.exec(text))) {
	    index = match.index;
	    // push text token
	    if (index > lastIndex) {
	      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
	    }
	    // tag token
	    var exp = parseFilters(match[1].trim());
	    tokens.push(("_s(" + exp + ")"));
	    lastIndex = index + match[0].length;
	  }
	  if (lastIndex < text.length) {
	    tokens.push(JSON.stringify(text.slice(lastIndex)));
	  }
	  return tokens.join('+')
	}

	/*  */

	function transformNode (el, options) {
	  var warn = options.warn || baseWarn;
	  var staticClass = getAndRemoveAttr(el, 'class');
	  if (false) {
	    var expression = parseText(staticClass, options.delimiters);
	    if (expression) {
	      warn(
	        "class=\"" + staticClass + "\": " +
	        'Interpolation inside attributes has been removed. ' +
	        'Use v-bind or the colon shorthand instead. For example, ' +
	        'instead of <div class="{{ val }}">, use <div :class="val">.'
	      );
	    }
	  }
	  if (staticClass) {
	    el.staticClass = JSON.stringify(staticClass);
	  }
	  var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
	  if (classBinding) {
	    el.classBinding = classBinding;
	  }
	}

	function genData (el) {
	  var data = '';
	  if (el.staticClass) {
	    data += "staticClass:" + (el.staticClass) + ",";
	  }
	  if (el.classBinding) {
	    data += "class:" + (el.classBinding) + ",";
	  }
	  return data
	}

	var klass$1 = {
	  staticKeys: ['staticClass'],
	  transformNode: transformNode,
	  genData: genData
	};

	/*  */

	function transformNode$1 (el, options) {
	  var warn = options.warn || baseWarn;
	  var staticStyle = getAndRemoveAttr(el, 'style');
	  if (staticStyle) {
	    /* istanbul ignore if */
	    if (false) {
	      var expression = parseText(staticStyle, options.delimiters);
	      if (expression) {
	        warn(
	          "style=\"" + staticStyle + "\": " +
	          'Interpolation inside attributes has been removed. ' +
	          'Use v-bind or the colon shorthand instead. For example, ' +
	          'instead of <div style="{{ val }}">, use <div :style="val">.'
	        );
	      }
	    }
	    el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
	  }

	  var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
	  if (styleBinding) {
	    el.styleBinding = styleBinding;
	  }
	}

	function genData$1 (el) {
	  var data = '';
	  if (el.staticStyle) {
	    data += "staticStyle:" + (el.staticStyle) + ",";
	  }
	  if (el.styleBinding) {
	    data += "style:(" + (el.styleBinding) + "),";
	  }
	  return data
	}

	var style$1 = {
	  staticKeys: ['staticStyle'],
	  transformNode: transformNode$1,
	  genData: genData$1
	};

	/*  */

	var decoder;

	var he = {
	  decode: function decode (html) {
	    decoder = decoder || document.createElement('div');
	    decoder.innerHTML = html;
	    return decoder.textContent
	  }
	};

	/*  */

	var isUnaryTag = makeMap(
	  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
	  'link,meta,param,source,track,wbr'
	);

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var canBeLeftOpenTag = makeMap(
	  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
	);

	// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
	// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
	var isNonPhrasingTag = makeMap(
	  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
	  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
	  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
	  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
	  'title,tr,track'
	);

	/**
	 * Not type-checking this file because it's mostly vendor code.
	 */

	/*!
	 * HTML Parser By John Resig (ejohn.org)
	 * Modified by Juriy "kangax" Zaytsev
	 * Original code by Erik Arvidsson, Mozilla Public License
	 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
	 */

	// Regular Expressions for parsing tags and attributes
	var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
	// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
	// but for Vue templates we can enforce a simple charset
	var ncname = '[a-zA-Z_][\\w\\-\\.]*';
	var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
	var startTagOpen = new RegExp(("^<" + qnameCapture));
	var startTagClose = /^\s*(\/?)>/;
	var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
	var doctype = /^<!DOCTYPE [^>]+>/i;
	var comment = /^<!--/;
	var conditionalComment = /^<!\[/;

	var IS_REGEX_CAPTURING_BROKEN = false;
	'x'.replace(/x(.)?/g, function (m, g) {
	  IS_REGEX_CAPTURING_BROKEN = g === '';
	});

	// Special Elements (can contain anything)
	var isPlainTextElement = makeMap('script,style,textarea', true);
	var reCache = {};

	var decodingMap = {
	  '&lt;': '<',
	  '&gt;': '>',
	  '&quot;': '"',
	  '&amp;': '&',
	  '&#10;': '\n'
	};
	var encodedAttr = /&(?:lt|gt|quot|amp);/g;
	var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10);/g;

	// #5992
	var isIgnoreNewlineTag = makeMap('pre,textarea', true);
	var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };

	function decodeAttr (value, shouldDecodeNewlines) {
	  var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
	  return value.replace(re, function (match) { return decodingMap[match]; })
	}

	function parseHTML (html, options) {
	  var stack = [];
	  var expectHTML = options.expectHTML;
	  var isUnaryTag$$1 = options.isUnaryTag || no;
	  var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
	  var index = 0;
	  var last, lastTag;
	  while (html) {
	    last = html;
	    // Make sure we're not in a plaintext content element like script/style
	    if (!lastTag || !isPlainTextElement(lastTag)) {
	      var textEnd = html.indexOf('<');
	      if (textEnd === 0) {
	        // Comment:
	        if (comment.test(html)) {
	          var commentEnd = html.indexOf('-->');

	          if (commentEnd >= 0) {
	            if (options.shouldKeepComment) {
	              options.comment(html.substring(4, commentEnd));
	            }
	            advance(commentEnd + 3);
	            continue
	          }
	        }

	        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
	        if (conditionalComment.test(html)) {
	          var conditionalEnd = html.indexOf(']>');

	          if (conditionalEnd >= 0) {
	            advance(conditionalEnd + 2);
	            continue
	          }
	        }

	        // Doctype:
	        var doctypeMatch = html.match(doctype);
	        if (doctypeMatch) {
	          advance(doctypeMatch[0].length);
	          continue
	        }

	        // End tag:
	        var endTagMatch = html.match(endTag);
	        if (endTagMatch) {
	          var curIndex = index;
	          advance(endTagMatch[0].length);
	          parseEndTag(endTagMatch[1], curIndex, index);
	          continue
	        }

	        // Start tag:
	        var startTagMatch = parseStartTag();
	        if (startTagMatch) {
	          handleStartTag(startTagMatch);
	          if (shouldIgnoreFirstNewline(lastTag, html)) {
	            advance(1);
	          }
	          continue
	        }
	      }

	      var text = (void 0), rest = (void 0), next = (void 0);
	      if (textEnd >= 0) {
	        rest = html.slice(textEnd);
	        while (
	          !endTag.test(rest) &&
	          !startTagOpen.test(rest) &&
	          !comment.test(rest) &&
	          !conditionalComment.test(rest)
	        ) {
	          // < in plain text, be forgiving and treat it as text
	          next = rest.indexOf('<', 1);
	          if (next < 0) { break }
	          textEnd += next;
	          rest = html.slice(textEnd);
	        }
	        text = html.substring(0, textEnd);
	        advance(textEnd);
	      }

	      if (textEnd < 0) {
	        text = html;
	        html = '';
	      }

	      if (options.chars && text) {
	        options.chars(text);
	      }
	    } else {
	      var endTagLength = 0;
	      var stackedTag = lastTag.toLowerCase();
	      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
	      var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
	        endTagLength = endTag.length;
	        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
	          text = text
	            .replace(/<!--([\s\S]*?)-->/g, '$1')
	            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
	        }
	        if (shouldIgnoreFirstNewline(stackedTag, text)) {
	          text = text.slice(1);
	        }
	        if (options.chars) {
	          options.chars(text);
	        }
	        return ''
	      });
	      index += html.length - rest$1.length;
	      html = rest$1;
	      parseEndTag(stackedTag, index - endTagLength, index);
	    }

	    if (html === last) {
	      options.chars && options.chars(html);
	      if (false) {
	        options.warn(("Mal-formatted tag at end of template: \"" + html + "\""));
	      }
	      break
	    }
	  }

	  // Clean up any remaining tags
	  parseEndTag();

	  function advance (n) {
	    index += n;
	    html = html.substring(n);
	  }

	  function parseStartTag () {
	    var start = html.match(startTagOpen);
	    if (start) {
	      var match = {
	        tagName: start[1],
	        attrs: [],
	        start: index
	      };
	      advance(start[0].length);
	      var end, attr;
	      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
	        advance(attr[0].length);
	        match.attrs.push(attr);
	      }
	      if (end) {
	        match.unarySlash = end[1];
	        advance(end[0].length);
	        match.end = index;
	        return match
	      }
	    }
	  }

	  function handleStartTag (match) {
	    var tagName = match.tagName;
	    var unarySlash = match.unarySlash;

	    if (expectHTML) {
	      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
	        parseEndTag(lastTag);
	      }
	      if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
	        parseEndTag(tagName);
	      }
	    }

	    var unary = isUnaryTag$$1(tagName) || !!unarySlash;

	    var l = match.attrs.length;
	    var attrs = new Array(l);
	    for (var i = 0; i < l; i++) {
	      var args = match.attrs[i];
	      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
	      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
	        if (args[3] === '') { delete args[3]; }
	        if (args[4] === '') { delete args[4]; }
	        if (args[5] === '') { delete args[5]; }
	      }
	      var value = args[3] || args[4] || args[5] || '';
	      attrs[i] = {
	        name: args[1],
	        value: decodeAttr(
	          value,
	          options.shouldDecodeNewlines
	        )
	      };
	    }

	    if (!unary) {
	      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });
	      lastTag = tagName;
	    }

	    if (options.start) {
	      options.start(tagName, attrs, unary, match.start, match.end);
	    }
	  }

	  function parseEndTag (tagName, start, end) {
	    var pos, lowerCasedTagName;
	    if (start == null) { start = index; }
	    if (end == null) { end = index; }

	    if (tagName) {
	      lowerCasedTagName = tagName.toLowerCase();
	    }

	    // Find the closest opened tag of the same type
	    if (tagName) {
	      for (pos = stack.length - 1; pos >= 0; pos--) {
	        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
	          break
	        }
	      }
	    } else {
	      // If no tag name is provided, clean shop
	      pos = 0;
	    }

	    if (pos >= 0) {
	      // Close all the open elements, up the stack
	      for (var i = stack.length - 1; i >= pos; i--) {
	        if (false
	        ) {
	          options.warn(
	            ("tag <" + (stack[i].tag) + "> has no matching end tag.")
	          );
	        }
	        if (options.end) {
	          options.end(stack[i].tag, start, end);
	        }
	      }

	      // Remove the open elements from the stack
	      stack.length = pos;
	      lastTag = pos && stack[pos - 1].tag;
	    } else if (lowerCasedTagName === 'br') {
	      if (options.start) {
	        options.start(tagName, [], true, start, end);
	      }
	    } else if (lowerCasedTagName === 'p') {
	      if (options.start) {
	        options.start(tagName, [], false, start, end);
	      }
	      if (options.end) {
	        options.end(tagName, start, end);
	      }
	    }
	  }
	}

	/*  */

	var onRE = /^@|^v-on:/;
	var dirRE = /^v-|^@|^:/;
	var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
	var forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;

	var argRE = /:(.*)$/;
	var bindRE = /^:|^v-bind:/;
	var modifierRE = /\.[^.]+/g;

	var decodeHTMLCached = cached(he.decode);

	// configurable state
	var warn$2;
	var delimiters;
	var transforms;
	var preTransforms;
	var postTransforms;
	var platformIsPreTag;
	var platformMustUseProp;
	var platformGetTagNamespace;



	function createASTElement (
	  tag,
	  attrs,
	  parent
	) {
	  return {
	    type: 1,
	    tag: tag,
	    attrsList: attrs,
	    attrsMap: makeAttrsMap(attrs),
	    parent: parent,
	    children: []
	  }
	}

	/**
	 * Convert HTML string to AST.
	 */
	function parse (
	  template,
	  options
	) {
	  warn$2 = options.warn || baseWarn;

	  platformIsPreTag = options.isPreTag || no;
	  platformMustUseProp = options.mustUseProp || no;
	  platformGetTagNamespace = options.getTagNamespace || no;

	  transforms = pluckModuleFunction(options.modules, 'transformNode');
	  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
	  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

	  delimiters = options.delimiters;

	  var stack = [];
	  var preserveWhitespace = options.preserveWhitespace !== false;
	  var root;
	  var currentParent;
	  var inVPre = false;
	  var inPre = false;
	  var warned = false;

	  function warnOnce (msg) {
	    if (!warned) {
	      warned = true;
	      warn$2(msg);
	    }
	  }

	  function endPre (element) {
	    // check pre state
	    if (element.pre) {
	      inVPre = false;
	    }
	    if (platformIsPreTag(element.tag)) {
	      inPre = false;
	    }
	  }

	  parseHTML(template, {
	    warn: warn$2,
	    expectHTML: options.expectHTML,
	    isUnaryTag: options.isUnaryTag,
	    canBeLeftOpenTag: options.canBeLeftOpenTag,
	    shouldDecodeNewlines: options.shouldDecodeNewlines,
	    shouldKeepComment: options.comments,
	    start: function start (tag, attrs, unary) {
	      // check namespace.
	      // inherit parent ns if there is one
	      var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

	      // handle IE svg bug
	      /* istanbul ignore if */
	      if (isIE && ns === 'svg') {
	        attrs = guardIESVGBug(attrs);
	      }

	      var element = createASTElement(tag, attrs, currentParent);
	      if (ns) {
	        element.ns = ns;
	      }

	      if (isForbiddenTag(element) && !isServerRendering()) {
	        element.forbidden = true;
	        ("production") !== 'production' && warn$2(
	          'Templates should only be responsible for mapping the state to the ' +
	          'UI. Avoid placing tags with side-effects in your templates, such as ' +
	          "<" + tag + ">" + ', as they will not be parsed.'
	        );
	      }

	      // apply pre-transforms
	      for (var i = 0; i < preTransforms.length; i++) {
	        element = preTransforms[i](element, options) || element;
	      }

	      if (!inVPre) {
	        processPre(element);
	        if (element.pre) {
	          inVPre = true;
	        }
	      }
	      if (platformIsPreTag(element.tag)) {
	        inPre = true;
	      }
	      if (inVPre) {
	        processRawAttrs(element);
	      } else if (!element.processed) {
	        // structural directives
	        processFor(element);
	        processIf(element);
	        processOnce(element);
	        // element-scope stuff
	        processElement(element, options);
	      }

	      function checkRootConstraints (el) {
	        if (false) {
	          if (el.tag === 'slot' || el.tag === 'template') {
	            warnOnce(
	              "Cannot use <" + (el.tag) + "> as component root element because it may " +
	              'contain multiple nodes.'
	            );
	          }
	          if (el.attrsMap.hasOwnProperty('v-for')) {
	            warnOnce(
	              'Cannot use v-for on stateful component root element because ' +
	              'it renders multiple elements.'
	            );
	          }
	        }
	      }

	      // tree management
	      if (!root) {
	        root = element;
	        checkRootConstraints(root);
	      } else if (!stack.length) {
	        // allow root elements with v-if, v-else-if and v-else
	        if (root.if && (element.elseif || element.else)) {
	          checkRootConstraints(element);
	          addIfCondition(root, {
	            exp: element.elseif,
	            block: element
	          });
	        } else if (false) {
	          warnOnce(
	            "Component template should contain exactly one root element. " +
	            "If you are using v-if on multiple elements, " +
	            "use v-else-if to chain them instead."
	          );
	        }
	      }
	      if (currentParent && !element.forbidden) {
	        if (element.elseif || element.else) {
	          processIfConditions(element, currentParent);
	        } else if (element.slotScope) { // scoped slot
	          currentParent.plain = false;
	          var name = element.slotTarget || '"default"';(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
	        } else {
	          currentParent.children.push(element);
	          element.parent = currentParent;
	        }
	      }
	      if (!unary) {
	        currentParent = element;
	        stack.push(element);
	      } else {
	        endPre(element);
	      }
	      // apply post-transforms
	      for (var i$1 = 0; i$1 < postTransforms.length; i$1++) {
	        postTransforms[i$1](element, options);
	      }
	    },

	    end: function end () {
	      // remove trailing whitespace
	      var element = stack[stack.length - 1];
	      var lastNode = element.children[element.children.length - 1];
	      if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
	        element.children.pop();
	      }
	      // pop stack
	      stack.length -= 1;
	      currentParent = stack[stack.length - 1];
	      endPre(element);
	    },

	    chars: function chars (text) {
	      if (!currentParent) {
	        if (false) {
	          if (text === template) {
	            warnOnce(
	              'Component template requires a root element, rather than just text.'
	            );
	          } else if ((text = text.trim())) {
	            warnOnce(
	              ("text \"" + text + "\" outside root element will be ignored.")
	            );
	          }
	        }
	        return
	      }
	      // IE textarea placeholder bug
	      /* istanbul ignore if */
	      if (isIE &&
	        currentParent.tag === 'textarea' &&
	        currentParent.attrsMap.placeholder === text
	      ) {
	        return
	      }
	      var children = currentParent.children;
	      text = inPre || text.trim()
	        ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
	        // only preserve whitespace if its not right after a starting tag
	        : preserveWhitespace && children.length ? ' ' : '';
	      if (text) {
	        var expression;
	        if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
	          children.push({
	            type: 2,
	            expression: expression,
	            text: text
	          });
	        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
	          children.push({
	            type: 3,
	            text: text
	          });
	        }
	      }
	    },
	    comment: function comment (text) {
	      currentParent.children.push({
	        type: 3,
	        text: text,
	        isComment: true
	      });
	    }
	  });
	  return root
	}

	function processPre (el) {
	  if (getAndRemoveAttr(el, 'v-pre') != null) {
	    el.pre = true;
	  }
	}

	function processRawAttrs (el) {
	  var l = el.attrsList.length;
	  if (l) {
	    var attrs = el.attrs = new Array(l);
	    for (var i = 0; i < l; i++) {
	      attrs[i] = {
	        name: el.attrsList[i].name,
	        value: JSON.stringify(el.attrsList[i].value)
	      };
	    }
	  } else if (!el.pre) {
	    // non root node in pre blocks with no attributes
	    el.plain = true;
	  }
	}

	function processElement (element, options) {
	  processKey(element);

	  // determine whether this is a plain element after
	  // removing structural attributes
	  element.plain = !element.key && !element.attrsList.length;

	  processRef(element);
	  processSlot(element);
	  processComponent(element);
	  for (var i = 0; i < transforms.length; i++) {
	    element = transforms[i](element, options) || element;
	  }
	  processAttrs(element);
	}

	function processKey (el) {
	  var exp = getBindingAttr(el, 'key');
	  if (exp) {
	    if (false) {
	      warn$2("<template> cannot be keyed. Place the key on real elements instead.");
	    }
	    el.key = exp;
	  }
	}

	function processRef (el) {
	  var ref = getBindingAttr(el, 'ref');
	  if (ref) {
	    el.ref = ref;
	    el.refInFor = checkInFor(el);
	  }
	}

	function processFor (el) {
	  var exp;
	  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
	    var inMatch = exp.match(forAliasRE);
	    if (!inMatch) {
	      ("production") !== 'production' && warn$2(
	        ("Invalid v-for expression: " + exp)
	      );
	      return
	    }
	    el.for = inMatch[2].trim();
	    var alias = inMatch[1].trim();
	    var iteratorMatch = alias.match(forIteratorRE);
	    if (iteratorMatch) {
	      el.alias = iteratorMatch[1].trim();
	      el.iterator1 = iteratorMatch[2].trim();
	      if (iteratorMatch[3]) {
	        el.iterator2 = iteratorMatch[3].trim();
	      }
	    } else {
	      el.alias = alias;
	    }
	  }
	}

	function processIf (el) {
	  var exp = getAndRemoveAttr(el, 'v-if');
	  if (exp) {
	    el.if = exp;
	    addIfCondition(el, {
	      exp: exp,
	      block: el
	    });
	  } else {
	    if (getAndRemoveAttr(el, 'v-else') != null) {
	      el.else = true;
	    }
	    var elseif = getAndRemoveAttr(el, 'v-else-if');
	    if (elseif) {
	      el.elseif = elseif;
	    }
	  }
	}

	function processIfConditions (el, parent) {
	  var prev = findPrevElement(parent.children);
	  if (prev && prev.if) {
	    addIfCondition(prev, {
	      exp: el.elseif,
	      block: el
	    });
	  } else if (false) {
	    warn$2(
	      "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
	      "used on element <" + (el.tag) + "> without corresponding v-if."
	    );
	  }
	}

	function findPrevElement (children) {
	  var i = children.length;
	  while (i--) {
	    if (children[i].type === 1) {
	      return children[i]
	    } else {
	      if (false) {
	        warn$2(
	          "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
	          "will be ignored."
	        );
	      }
	      children.pop();
	    }
	  }
	}

	function addIfCondition (el, condition) {
	  if (!el.ifConditions) {
	    el.ifConditions = [];
	  }
	  el.ifConditions.push(condition);
	}

	function processOnce (el) {
	  var once$$1 = getAndRemoveAttr(el, 'v-once');
	  if (once$$1 != null) {
	    el.once = true;
	  }
	}

	function processSlot (el) {
	  if (el.tag === 'slot') {
	    el.slotName = getBindingAttr(el, 'name');
	    if (false) {
	      warn$2(
	        "`key` does not work on <slot> because slots are abstract outlets " +
	        "and can possibly expand into multiple elements. " +
	        "Use the key on a wrapping element instead."
	      );
	    }
	  } else {
	    var slotScope;
	    if (el.tag === 'template') {
	      slotScope = getAndRemoveAttr(el, 'scope');
	      /* istanbul ignore if */
	      if (false) {
	        warn$2(
	          "the \"scope\" attribute for scoped slots have been deprecated and " +
	          "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " +
	          "can also be used on plain elements in addition to <template> to " +
	          "denote scoped slots.",
	          true
	        );
	      }
	      el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
	    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
	      el.slotScope = slotScope;
	    }
	    var slotTarget = getBindingAttr(el, 'slot');
	    if (slotTarget) {
	      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
	      // preserve slot as an attribute for native shadow DOM compat
	      // only for non-scoped slots.
	      if (!el.slotScope) {
	        addAttr(el, 'slot', slotTarget);
	      }
	    }
	  }
	}

	function processComponent (el) {
	  var binding;
	  if ((binding = getBindingAttr(el, 'is'))) {
	    el.component = binding;
	  }
	  if (getAndRemoveAttr(el, 'inline-template') != null) {
	    el.inlineTemplate = true;
	  }
	}

	function processAttrs (el) {
	  var list = el.attrsList;
	  var i, l, name, rawName, value, modifiers, isProp;
	  for (i = 0, l = list.length; i < l; i++) {
	    name = rawName = list[i].name;
	    value = list[i].value;
	    if (dirRE.test(name)) {
	      // mark element as dynamic
	      el.hasBindings = true;
	      // modifiers
	      modifiers = parseModifiers(name);
	      if (modifiers) {
	        name = name.replace(modifierRE, '');
	      }
	      if (bindRE.test(name)) { // v-bind
	        name = name.replace(bindRE, '');
	        value = parseFilters(value);
	        isProp = false;
	        if (modifiers) {
	          if (modifiers.prop) {
	            isProp = true;
	            name = camelize(name);
	            if (name === 'innerHtml') { name = 'innerHTML'; }
	          }
	          if (modifiers.camel) {
	            name = camelize(name);
	          }
	          if (modifiers.sync) {
	            addHandler(
	              el,
	              ("update:" + (camelize(name))),
	              genAssignmentCode(value, "$event")
	            );
	          }
	        }
	        if (isProp || (
	          !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
	        )) {
	          addProp(el, name, value);
	        } else {
	          addAttr(el, name, value);
	        }
	      } else if (onRE.test(name)) { // v-on
	        name = name.replace(onRE, '');
	        addHandler(el, name, value, modifiers, false, warn$2);
	      } else { // normal directives
	        name = name.replace(dirRE, '');
	        // parse arg
	        var argMatch = name.match(argRE);
	        var arg = argMatch && argMatch[1];
	        if (arg) {
	          name = name.slice(0, -(arg.length + 1));
	        }
	        addDirective(el, name, rawName, value, arg, modifiers);
	        if (false) {
	          checkForAliasModel(el, value);
	        }
	      }
	    } else {
	      // literal attribute
	      if (false) {
	        var expression = parseText(value, delimiters);
	        if (expression) {
	          warn$2(
	            name + "=\"" + value + "\": " +
	            'Interpolation inside attributes has been removed. ' +
	            'Use v-bind or the colon shorthand instead. For example, ' +
	            'instead of <div id="{{ val }}">, use <div :id="val">.'
	          );
	        }
	      }
	      addAttr(el, name, JSON.stringify(value));
	    }
	  }
	}

	function checkInFor (el) {
	  var parent = el;
	  while (parent) {
	    if (parent.for !== undefined) {
	      return true
	    }
	    parent = parent.parent;
	  }
	  return false
	}

	function parseModifiers (name) {
	  var match = name.match(modifierRE);
	  if (match) {
	    var ret = {};
	    match.forEach(function (m) { ret[m.slice(1)] = true; });
	    return ret
	  }
	}

	function makeAttrsMap (attrs) {
	  var map = {};
	  for (var i = 0, l = attrs.length; i < l; i++) {
	    if (
	      false
	    ) {
	      warn$2('duplicate attribute: ' + attrs[i].name);
	    }
	    map[attrs[i].name] = attrs[i].value;
	  }
	  return map
	}

	// for script (e.g. type="x/template") or style, do not decode content
	function isTextTag (el) {
	  return el.tag === 'script' || el.tag === 'style'
	}

	function isForbiddenTag (el) {
	  return (
	    el.tag === 'style' ||
	    (el.tag === 'script' && (
	      !el.attrsMap.type ||
	      el.attrsMap.type === 'text/javascript'
	    ))
	  )
	}

	var ieNSBug = /^xmlns:NS\d+/;
	var ieNSPrefix = /^NS\d+:/;

	/* istanbul ignore next */
	function guardIESVGBug (attrs) {
	  var res = [];
	  for (var i = 0; i < attrs.length; i++) {
	    var attr = attrs[i];
	    if (!ieNSBug.test(attr.name)) {
	      attr.name = attr.name.replace(ieNSPrefix, '');
	      res.push(attr);
	    }
	  }
	  return res
	}

	function checkForAliasModel (el, value) {
	  var _el = el;
	  while (_el) {
	    if (_el.for && _el.alias === value) {
	      warn$2(
	        "<" + (el.tag) + " v-model=\"" + value + "\">: " +
	        "You are binding v-model directly to a v-for iteration alias. " +
	        "This will not be able to modify the v-for source array because " +
	        "writing to the alias is like modifying a function local variable. " +
	        "Consider using an array of objects and use v-model on an object property instead."
	      );
	    }
	    _el = _el.parent;
	  }
	}

	/*  */

	/**
	 * Expand input[v-model] with dyanmic type bindings into v-if-else chains
	 * Turn this:
	 *   <input v-model="data[type]" :type="type">
	 * into this:
	 *   <input v-if="type === 'checkbox'" type="checkbox" v-model="data[type]">
	 *   <input v-else-if="type === 'radio'" type="radio" v-model="data[type]">
	 *   <input v-else :type="type" v-model="data[type]">
	 */

	function preTransformNode (el, options) {
	  if (el.tag === 'input') {
	    var map = el.attrsMap;
	    if (map['v-model'] && (map['v-bind:type'] || map[':type'])) {
	      var typeBinding = getBindingAttr(el, 'type');
	      var ifCondition = getAndRemoveAttr(el, 'v-if', true);
	      var ifConditionExtra = ifCondition ? ("&&(" + ifCondition + ")") : "";
	      // 1. checkbox
	      var branch0 = cloneASTElement(el);
	      // process for on the main node
	      processFor(branch0);
	      addRawAttr(branch0, 'type', 'checkbox');
	      processElement(branch0, options);
	      branch0.processed = true; // prevent it from double-processed
	      branch0.if = "(" + typeBinding + ")==='checkbox'" + ifConditionExtra;
	      addIfCondition(branch0, {
	        exp: branch0.if,
	        block: branch0
	      });
	      // 2. add radio else-if condition
	      var branch1 = cloneASTElement(el);
	      getAndRemoveAttr(branch1, 'v-for', true);
	      addRawAttr(branch1, 'type', 'radio');
	      processElement(branch1, options);
	      addIfCondition(branch0, {
	        exp: "(" + typeBinding + ")==='radio'" + ifConditionExtra,
	        block: branch1
	      });
	      // 3. other
	      var branch2 = cloneASTElement(el);
	      getAndRemoveAttr(branch2, 'v-for', true);
	      addRawAttr(branch2, ':type', typeBinding);
	      processElement(branch2, options);
	      addIfCondition(branch0, {
	        exp: ifCondition,
	        block: branch2
	      });
	      return branch0
	    }
	  }
	}

	function cloneASTElement (el) {
	  return createASTElement(el.tag, el.attrsList.slice(), el.parent)
	}

	function addRawAttr (el, name, value) {
	  el.attrsMap[name] = value;
	  el.attrsList.push({ name: name, value: value });
	}

	var model$2 = {
	  preTransformNode: preTransformNode
	};

	var modules$1 = [
	  klass$1,
	  style$1,
	  model$2
	];

	/*  */

	function text (el, dir) {
	  if (dir.value) {
	    addProp(el, 'textContent', ("_s(" + (dir.value) + ")"));
	  }
	}

	/*  */

	function html (el, dir) {
	  if (dir.value) {
	    addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"));
	  }
	}

	var directives$1 = {
	  model: model,
	  text: text,
	  html: html
	};

	/*  */

	var baseOptions = {
	  expectHTML: true,
	  modules: modules$1,
	  directives: directives$1,
	  isPreTag: isPreTag,
	  isUnaryTag: isUnaryTag,
	  mustUseProp: mustUseProp,
	  canBeLeftOpenTag: canBeLeftOpenTag,
	  isReservedTag: isReservedTag,
	  getTagNamespace: getTagNamespace,
	  staticKeys: genStaticKeys(modules$1)
	};

	/*  */

	var isStaticKey;
	var isPlatformReservedTag;

	var genStaticKeysCached = cached(genStaticKeys$1);

	/**
	 * Goal of the optimizer: walk the generated template AST tree
	 * and detect sub-trees that are purely static, i.e. parts of
	 * the DOM that never needs to change.
	 *
	 * Once we detect these sub-trees, we can:
	 *
	 * 1. Hoist them into constants, so that we no longer need to
	 *    create fresh nodes for them on each re-render;
	 * 2. Completely skip them in the patching process.
	 */
	function optimize (root, options) {
	  if (!root) { return }
	  isStaticKey = genStaticKeysCached(options.staticKeys || '');
	  isPlatformReservedTag = options.isReservedTag || no;
	  // first pass: mark all non-static nodes.
	  markStatic$1(root);
	  // second pass: mark static roots.
	  markStaticRoots(root, false);
	}

	function genStaticKeys$1 (keys) {
	  return makeMap(
	    'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
	    (keys ? ',' + keys : '')
	  )
	}

	function markStatic$1 (node) {
	  node.static = isStatic(node);
	  if (node.type === 1) {
	    // do not make component slot content static. this avoids
	    // 1. components not able to mutate slot nodes
	    // 2. static slot content fails for hot-reloading
	    if (
	      !isPlatformReservedTag(node.tag) &&
	      node.tag !== 'slot' &&
	      node.attrsMap['inline-template'] == null
	    ) {
	      return
	    }
	    for (var i = 0, l = node.children.length; i < l; i++) {
	      var child = node.children[i];
	      markStatic$1(child);
	      if (!child.static) {
	        node.static = false;
	      }
	    }
	    if (node.ifConditions) {
	      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
	        var block = node.ifConditions[i$1].block;
	        markStatic$1(block);
	        if (!block.static) {
	          node.static = false;
	        }
	      }
	    }
	  }
	}

	function markStaticRoots (node, isInFor) {
	  if (node.type === 1) {
	    if (node.static || node.once) {
	      node.staticInFor = isInFor;
	    }
	    // For a node to qualify as a static root, it should have children that
	    // are not just static text. Otherwise the cost of hoisting out will
	    // outweigh the benefits and it's better off to just always render it fresh.
	    if (node.static && node.children.length && !(
	      node.children.length === 1 &&
	      node.children[0].type === 3
	    )) {
	      node.staticRoot = true;
	      return
	    } else {
	      node.staticRoot = false;
	    }
	    if (node.children) {
	      for (var i = 0, l = node.children.length; i < l; i++) {
	        markStaticRoots(node.children[i], isInFor || !!node.for);
	      }
	    }
	    if (node.ifConditions) {
	      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
	        markStaticRoots(node.ifConditions[i$1].block, isInFor);
	      }
	    }
	  }
	}

	function isStatic (node) {
	  if (node.type === 2) { // expression
	    return false
	  }
	  if (node.type === 3) { // text
	    return true
	  }
	  return !!(node.pre || (
	    !node.hasBindings && // no dynamic bindings
	    !node.if && !node.for && // not v-if or v-for or v-else
	    !isBuiltInTag(node.tag) && // not a built-in
	    isPlatformReservedTag(node.tag) && // not a component
	    !isDirectChildOfTemplateFor(node) &&
	    Object.keys(node).every(isStaticKey)
	  ))
	}

	function isDirectChildOfTemplateFor (node) {
	  while (node.parent) {
	    node = node.parent;
	    if (node.tag !== 'template') {
	      return false
	    }
	    if (node.for) {
	      return true
	    }
	  }
	  return false
	}

	/*  */

	var fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
	var simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/;

	// keyCode aliases
	var keyCodes = {
	  esc: 27,
	  tab: 9,
	  enter: 13,
	  space: 32,
	  up: 38,
	  left: 37,
	  right: 39,
	  down: 40,
	  'delete': [8, 46]
	};

	// #4868: modifiers that prevent the execution of the listener
	// need to explicitly return null so that we can determine whether to remove
	// the listener for .once
	var genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

	var modifierCode = {
	  stop: '$event.stopPropagation();',
	  prevent: '$event.preventDefault();',
	  self: genGuard("$event.target !== $event.currentTarget"),
	  ctrl: genGuard("!$event.ctrlKey"),
	  shift: genGuard("!$event.shiftKey"),
	  alt: genGuard("!$event.altKey"),
	  meta: genGuard("!$event.metaKey"),
	  left: genGuard("'button' in $event && $event.button !== 0"),
	  middle: genGuard("'button' in $event && $event.button !== 1"),
	  right: genGuard("'button' in $event && $event.button !== 2")
	};

	function genHandlers (
	  events,
	  isNative,
	  warn
	) {
	  var res = isNative ? 'nativeOn:{' : 'on:{';
	  for (var name in events) {
	    var handler = events[name];
	    // #5330: warn click.right, since right clicks do not actually fire click events.
	    if (false
	    ) {
	      warn(
	        "Use \"contextmenu\" instead of \"click.right\" since right clicks " +
	        "do not actually fire \"click\" events."
	      );
	    }
	    res += "\"" + name + "\":" + (genHandler(name, handler)) + ",";
	  }
	  return res.slice(0, -1) + '}'
	}

	function genHandler (
	  name,
	  handler
	) {
	  if (!handler) {
	    return 'function(){}'
	  }

	  if (Array.isArray(handler)) {
	    return ("[" + (handler.map(function (handler) { return genHandler(name, handler); }).join(',')) + "]")
	  }

	  var isMethodPath = simplePathRE.test(handler.value);
	  var isFunctionExpression = fnExpRE.test(handler.value);

	  if (!handler.modifiers) {
	    return isMethodPath || isFunctionExpression
	      ? handler.value
	      : ("function($event){" + (handler.value) + "}") // inline statement
	  } else {
	    var code = '';
	    var genModifierCode = '';
	    var keys = [];
	    for (var key in handler.modifiers) {
	      if (modifierCode[key]) {
	        genModifierCode += modifierCode[key];
	        // left/right
	        if (keyCodes[key]) {
	          keys.push(key);
	        }
	      } else if (key === 'exact') {
	        var modifiers = (handler.modifiers);
	        genModifierCode += genGuard(
	          ['ctrl', 'shift', 'alt', 'meta']
	            .filter(function (keyModifier) { return !modifiers[keyModifier]; })
	            .map(function (keyModifier) { return ("$event." + keyModifier + "Key"); })
	            .join('||')
	        );
	      } else {
	        keys.push(key);
	      }
	    }
	    if (keys.length) {
	      code += genKeyFilter(keys);
	    }
	    // Make sure modifiers like prevent and stop get executed after key filtering
	    if (genModifierCode) {
	      code += genModifierCode;
	    }
	    var handlerCode = isMethodPath
	      ? handler.value + '($event)'
	      : isFunctionExpression
	        ? ("(" + (handler.value) + ")($event)")
	        : handler.value;
	    return ("function($event){" + code + handlerCode + "}")
	  }
	}

	function genKeyFilter (keys) {
	  return ("if(!('button' in $event)&&" + (keys.map(genFilterCode).join('&&')) + ")return null;")
	}

	function genFilterCode (key) {
	  var keyVal = parseInt(key, 10);
	  if (keyVal) {
	    return ("$event.keyCode!==" + keyVal)
	  }
	  var code = keyCodes[key];
	  return (
	    "_k($event.keyCode," +
	    (JSON.stringify(key)) + "," +
	    (JSON.stringify(code)) + "," +
	    "$event.key)"
	  )
	}

	/*  */

	function on (el, dir) {
	  if (false) {
	    warn("v-on without argument does not support modifiers.");
	  }
	  el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); };
	}

	/*  */

	function bind$1 (el, dir) {
	  el.wrapData = function (code) {
	    return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
	  };
	}

	/*  */

	var baseDirectives = {
	  on: on,
	  bind: bind$1,
	  cloak: noop
	};

	/*  */

	var CodegenState = function CodegenState (options) {
	  this.options = options;
	  this.warn = options.warn || baseWarn;
	  this.transforms = pluckModuleFunction(options.modules, 'transformCode');
	  this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
	  this.directives = extend(extend({}, baseDirectives), options.directives);
	  var isReservedTag = options.isReservedTag || no;
	  this.maybeComponent = function (el) { return !isReservedTag(el.tag); };
	  this.onceId = 0;
	  this.staticRenderFns = [];
	};



	function generate (
	  ast,
	  options
	) {
	  var state = new CodegenState(options);
	  var code = ast ? genElement(ast, state) : '_c("div")';
	  return {
	    render: ("with(this){return " + code + "}"),
	    staticRenderFns: state.staticRenderFns
	  }
	}

	function genElement (el, state) {
	  if (el.staticRoot && !el.staticProcessed) {
	    return genStatic(el, state)
	  } else if (el.once && !el.onceProcessed) {
	    return genOnce(el, state)
	  } else if (el.for && !el.forProcessed) {
	    return genFor(el, state)
	  } else if (el.if && !el.ifProcessed) {
	    return genIf(el, state)
	  } else if (el.tag === 'template' && !el.slotTarget) {
	    return genChildren(el, state) || 'void 0'
	  } else if (el.tag === 'slot') {
	    return genSlot(el, state)
	  } else {
	    // component or element
	    var code;
	    if (el.component) {
	      code = genComponent(el.component, el, state);
	    } else {
	      var data = el.plain ? undefined : genData$2(el, state);

	      var children = el.inlineTemplate ? null : genChildren(el, state, true);
	      code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
	    }
	    // module transforms
	    for (var i = 0; i < state.transforms.length; i++) {
	      code = state.transforms[i](el, code);
	    }
	    return code
	  }
	}

	// hoist static sub-trees out
	function genStatic (el, state) {
	  el.staticProcessed = true;
	  state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
	  return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
	}

	// v-once
	function genOnce (el, state) {
	  el.onceProcessed = true;
	  if (el.if && !el.ifProcessed) {
	    return genIf(el, state)
	  } else if (el.staticInFor) {
	    var key = '';
	    var parent = el.parent;
	    while (parent) {
	      if (parent.for) {
	        key = parent.key;
	        break
	      }
	      parent = parent.parent;
	    }
	    if (!key) {
	      ("production") !== 'production' && state.warn(
	        "v-once can only be used inside v-for that is keyed. "
	      );
	      return genElement(el, state)
	    }
	    return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + "," + key + ")")
	  } else {
	    return genStatic(el, state)
	  }
	}

	function genIf (
	  el,
	  state,
	  altGen,
	  altEmpty
	) {
	  el.ifProcessed = true; // avoid recursion
	  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
	}

	function genIfConditions (
	  conditions,
	  state,
	  altGen,
	  altEmpty
	) {
	  if (!conditions.length) {
	    return altEmpty || '_e()'
	  }

	  var condition = conditions.shift();
	  if (condition.exp) {
	    return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
	  } else {
	    return ("" + (genTernaryExp(condition.block)))
	  }

	  // v-if with v-once should generate code like (a)?_m(0):_m(1)
	  function genTernaryExp (el) {
	    return altGen
	      ? altGen(el, state)
	      : el.once
	        ? genOnce(el, state)
	        : genElement(el, state)
	  }
	}

	function genFor (
	  el,
	  state,
	  altGen,
	  altHelper
	) {
	  var exp = el.for;
	  var alias = el.alias;
	  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
	  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

	  if (false
	  ) {
	    state.warn(
	      "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
	      "v-for should have explicit keys. " +
	      "See https://vuejs.org/guide/list.html#key for more info.",
	      true /* tip */
	    );
	  }

	  el.forProcessed = true; // avoid recursion
	  return (altHelper || '_l') + "((" + exp + ")," +
	    "function(" + alias + iterator1 + iterator2 + "){" +
	      "return " + ((altGen || genElement)(el, state)) +
	    '})'
	}

	function genData$2 (el, state) {
	  var data = '{';

	  // directives first.
	  // directives may mutate the el's other properties before they are generated.
	  var dirs = genDirectives(el, state);
	  if (dirs) { data += dirs + ','; }

	  // key
	  if (el.key) {
	    data += "key:" + (el.key) + ",";
	  }
	  // ref
	  if (el.ref) {
	    data += "ref:" + (el.ref) + ",";
	  }
	  if (el.refInFor) {
	    data += "refInFor:true,";
	  }
	  // pre
	  if (el.pre) {
	    data += "pre:true,";
	  }
	  // record original tag name for components using "is" attribute
	  if (el.component) {
	    data += "tag:\"" + (el.tag) + "\",";
	  }
	  // module data generation functions
	  for (var i = 0; i < state.dataGenFns.length; i++) {
	    data += state.dataGenFns[i](el);
	  }
	  // attributes
	  if (el.attrs) {
	    data += "attrs:{" + (genProps(el.attrs)) + "},";
	  }
	  // DOM props
	  if (el.props) {
	    data += "domProps:{" + (genProps(el.props)) + "},";
	  }
	  // event handlers
	  if (el.events) {
	    data += (genHandlers(el.events, false, state.warn)) + ",";
	  }
	  if (el.nativeEvents) {
	    data += (genHandlers(el.nativeEvents, true, state.warn)) + ",";
	  }
	  // slot target
	  // only for non-scoped slots
	  if (el.slotTarget && !el.slotScope) {
	    data += "slot:" + (el.slotTarget) + ",";
	  }
	  // scoped slots
	  if (el.scopedSlots) {
	    data += (genScopedSlots(el.scopedSlots, state)) + ",";
	  }
	  // component v-model
	  if (el.model) {
	    data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
	  }
	  // inline-template
	  if (el.inlineTemplate) {
	    var inlineTemplate = genInlineTemplate(el, state);
	    if (inlineTemplate) {
	      data += inlineTemplate + ",";
	    }
	  }
	  data = data.replace(/,$/, '') + '}';
	  // v-bind data wrap
	  if (el.wrapData) {
	    data = el.wrapData(data);
	  }
	  // v-on data wrap
	  if (el.wrapListeners) {
	    data = el.wrapListeners(data);
	  }
	  return data
	}

	function genDirectives (el, state) {
	  var dirs = el.directives;
	  if (!dirs) { return }
	  var res = 'directives:[';
	  var hasRuntime = false;
	  var i, l, dir, needRuntime;
	  for (i = 0, l = dirs.length; i < l; i++) {
	    dir = dirs[i];
	    needRuntime = true;
	    var gen = state.directives[dir.name];
	    if (gen) {
	      // compile-time directive that manipulates AST.
	      // returns true if it also needs a runtime counterpart.
	      needRuntime = !!gen(el, dir, state.warn);
	    }
	    if (needRuntime) {
	      hasRuntime = true;
	      res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:\"" + (dir.arg) + "\"") : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
	    }
	  }
	  if (hasRuntime) {
	    return res.slice(0, -1) + ']'
	  }
	}

	function genInlineTemplate (el, state) {
	  var ast = el.children[0];
	  if (false) {
	    state.warn('Inline-template components must have exactly one child element.');
	  }
	  if (ast.type === 1) {
	    var inlineRenderFns = generate(ast, state.options);
	    return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
	  }
	}

	function genScopedSlots (
	  slots,
	  state
	) {
	  return ("scopedSlots:_u([" + (Object.keys(slots).map(function (key) {
	      return genScopedSlot(key, slots[key], state)
	    }).join(',')) + "])")
	}

	function genScopedSlot (
	  key,
	  el,
	  state
	) {
	  if (el.for && !el.forProcessed) {
	    return genForScopedSlot(key, el, state)
	  }
	  var fn = "function(" + (String(el.slotScope)) + "){" +
	    "return " + (el.tag === 'template'
	      ? el.if
	        ? ((el.if) + "?" + (genChildren(el, state) || 'undefined') + ":undefined")
	        : genChildren(el, state) || 'undefined'
	      : genElement(el, state)) + "}";
	  return ("{key:" + key + ",fn:" + fn + "}")
	}

	function genForScopedSlot (
	  key,
	  el,
	  state
	) {
	  var exp = el.for;
	  var alias = el.alias;
	  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
	  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';
	  el.forProcessed = true; // avoid recursion
	  return "_l((" + exp + ")," +
	    "function(" + alias + iterator1 + iterator2 + "){" +
	      "return " + (genScopedSlot(key, el, state)) +
	    '})'
	}

	function genChildren (
	  el,
	  state,
	  checkSkip,
	  altGenElement,
	  altGenNode
	) {
	  var children = el.children;
	  if (children.length) {
	    var el$1 = children[0];
	    // optimize single v-for
	    if (children.length === 1 &&
	      el$1.for &&
	      el$1.tag !== 'template' &&
	      el$1.tag !== 'slot'
	    ) {
	      return (altGenElement || genElement)(el$1, state)
	    }
	    var normalizationType = checkSkip
	      ? getNormalizationType(children, state.maybeComponent)
	      : 0;
	    var gen = altGenNode || genNode;
	    return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType ? ("," + normalizationType) : ''))
	  }
	}

	// determine the normalization needed for the children array.
	// 0: no normalization needed
	// 1: simple normalization needed (possible 1-level deep nested array)
	// 2: full normalization needed
	function getNormalizationType (
	  children,
	  maybeComponent
	) {
	  var res = 0;
	  for (var i = 0; i < children.length; i++) {
	    var el = children[i];
	    if (el.type !== 1) {
	      continue
	    }
	    if (needsNormalization(el) ||
	        (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
	      res = 2;
	      break
	    }
	    if (maybeComponent(el) ||
	        (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
	      res = 1;
	    }
	  }
	  return res
	}

	function needsNormalization (el) {
	  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
	}

	function genNode (node, state) {
	  if (node.type === 1) {
	    return genElement(node, state)
	  } if (node.type === 3 && node.isComment) {
	    return genComment(node)
	  } else {
	    return genText(node)
	  }
	}

	function genText (text) {
	  return ("_v(" + (text.type === 2
	    ? text.expression // no need for () because already wrapped in _s()
	    : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
	}

	function genComment (comment) {
	  return ("_e(" + (JSON.stringify(comment.text)) + ")")
	}

	function genSlot (el, state) {
	  var slotName = el.slotName || '"default"';
	  var children = genChildren(el, state);
	  var res = "_t(" + slotName + (children ? ("," + children) : '');
	  var attrs = el.attrs && ("{" + (el.attrs.map(function (a) { return ((camelize(a.name)) + ":" + (a.value)); }).join(',')) + "}");
	  var bind$$1 = el.attrsMap['v-bind'];
	  if ((attrs || bind$$1) && !children) {
	    res += ",null";
	  }
	  if (attrs) {
	    res += "," + attrs;
	  }
	  if (bind$$1) {
	    res += (attrs ? '' : ',null') + "," + bind$$1;
	  }
	  return res + ')'
	}

	// componentName is el.component, take it as argument to shun flow's pessimistic refinement
	function genComponent (
	  componentName,
	  el,
	  state
	) {
	  var children = el.inlineTemplate ? null : genChildren(el, state, true);
	  return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
	}

	function genProps (props) {
	  var res = '';
	  for (var i = 0; i < props.length; i++) {
	    var prop = props[i];
	    res += "\"" + (prop.name) + "\":" + (transformSpecialNewlines(prop.value)) + ",";
	  }
	  return res.slice(0, -1)
	}

	// #3895, #4268
	function transformSpecialNewlines (text) {
	  return text
	    .replace(/\u2028/g, '\\u2028')
	    .replace(/\u2029/g, '\\u2029')
	}

	/*  */

	// these keywords should not appear inside expressions, but operators like
	// typeof, instanceof and in are allowed
	var prohibitedKeywordRE = new RegExp('\\b' + (
	  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
	  'super,throw,while,yield,delete,export,import,return,switch,default,' +
	  'extends,finally,continue,debugger,function,arguments'
	).split(',').join('\\b|\\b') + '\\b');

	// these unary operators should not be used as property/method names
	var unaryOperatorsRE = new RegExp('\\b' + (
	  'delete,typeof,void'
	).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

	// check valid identifier for v-for
	var identRE = /[A-Za-z_$][\w$]*/;

	// strip strings in expressions
	var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

	// detect problematic expressions in a template
	function detectErrors (ast) {
	  var errors = [];
	  if (ast) {
	    checkNode(ast, errors);
	  }
	  return errors
	}

	function checkNode (node, errors) {
	  if (node.type === 1) {
	    for (var name in node.attrsMap) {
	      if (dirRE.test(name)) {
	        var value = node.attrsMap[name];
	        if (value) {
	          if (name === 'v-for') {
	            checkFor(node, ("v-for=\"" + value + "\""), errors);
	          } else if (onRE.test(name)) {
	            checkEvent(value, (name + "=\"" + value + "\""), errors);
	          } else {
	            checkExpression(value, (name + "=\"" + value + "\""), errors);
	          }
	        }
	      }
	    }
	    if (node.children) {
	      for (var i = 0; i < node.children.length; i++) {
	        checkNode(node.children[i], errors);
	      }
	    }
	  } else if (node.type === 2) {
	    checkExpression(node.expression, node.text, errors);
	  }
	}

	function checkEvent (exp, text, errors) {
	  var stipped = exp.replace(stripStringRE, '');
	  var keywordMatch = stipped.match(unaryOperatorsRE);
	  if (keywordMatch && stipped.charAt(keywordMatch.index - 1) !== '$') {
	    errors.push(
	      "avoid using JavaScript unary operator as property name: " +
	      "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
	    );
	  }
	  checkExpression(exp, text, errors);
	}

	function checkFor (node, text, errors) {
	  checkExpression(node.for || '', text, errors);
	  checkIdentifier(node.alias, 'v-for alias', text, errors);
	  checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
	  checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
	}

	function checkIdentifier (ident, type, text, errors) {
	  if (typeof ident === 'string' && !identRE.test(ident)) {
	    errors.push(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())));
	  }
	}

	function checkExpression (exp, text, errors) {
	  try {
	    new Function(("return " + exp));
	  } catch (e) {
	    var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
	    if (keywordMatch) {
	      errors.push(
	        "avoid using JavaScript keyword as property name: " +
	        "\"" + (keywordMatch[0]) + "\"\n  Raw expression: " + (text.trim())
	      );
	    } else {
	      errors.push(
	        "invalid expression: " + (e.message) + " in\n\n" +
	        "    " + exp + "\n\n" +
	        "  Raw expression: " + (text.trim()) + "\n"
	      );
	    }
	  }
	}

	/*  */

	function createFunction (code, errors) {
	  try {
	    return new Function(code)
	  } catch (err) {
	    errors.push({ err: err, code: code });
	    return noop
	  }
	}

	function createCompileToFunctionFn (compile) {
	  var cache = Object.create(null);

	  return function compileToFunctions (
	    template,
	    options,
	    vm
	  ) {
	    options = extend({}, options);
	    var warn$$1 = options.warn || warn;
	    delete options.warn;

	    /* istanbul ignore if */
	    if (false) {
	      // detect possible CSP restriction
	      try {
	        new Function('return 1');
	      } catch (e) {
	        if (e.toString().match(/unsafe-eval|CSP/)) {
	          warn$$1(
	            'It seems you are using the standalone build of Vue.js in an ' +
	            'environment with Content Security Policy that prohibits unsafe-eval. ' +
	            'The template compiler cannot work in this environment. Consider ' +
	            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
	            'templates into render functions.'
	          );
	        }
	      }
	    }

	    // check cache
	    var key = options.delimiters
	      ? String(options.delimiters) + template
	      : template;
	    if (cache[key]) {
	      return cache[key]
	    }

	    // compile
	    var compiled = compile(template, options);

	    // check compilation errors/tips
	    if (false) {
	      if (compiled.errors && compiled.errors.length) {
	        warn$$1(
	          "Error compiling template:\n\n" + template + "\n\n" +
	          compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
	          vm
	        );
	      }
	      if (compiled.tips && compiled.tips.length) {
	        compiled.tips.forEach(function (msg) { return tip(msg, vm); });
	      }
	    }

	    // turn code into functions
	    var res = {};
	    var fnGenErrors = [];
	    res.render = createFunction(compiled.render, fnGenErrors);
	    res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
	      return createFunction(code, fnGenErrors)
	    });

	    // check function generation errors.
	    // this should only happen if there is a bug in the compiler itself.
	    // mostly for codegen development use
	    /* istanbul ignore if */
	    if (false) {
	      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
	        warn$$1(
	          "Failed to generate render function:\n\n" +
	          fnGenErrors.map(function (ref) {
	            var err = ref.err;
	            var code = ref.code;

	            return ((err.toString()) + " in\n\n" + code + "\n");
	        }).join('\n'),
	          vm
	        );
	      }
	    }

	    return (cache[key] = res)
	  }
	}

	/*  */

	function createCompilerCreator (baseCompile) {
	  return function createCompiler (baseOptions) {
	    function compile (
	      template,
	      options
	    ) {
	      var finalOptions = Object.create(baseOptions);
	      var errors = [];
	      var tips = [];
	      finalOptions.warn = function (msg, tip) {
	        (tip ? tips : errors).push(msg);
	      };

	      if (options) {
	        // merge custom modules
	        if (options.modules) {
	          finalOptions.modules =
	            (baseOptions.modules || []).concat(options.modules);
	        }
	        // merge custom directives
	        if (options.directives) {
	          finalOptions.directives = extend(
	            Object.create(baseOptions.directives),
	            options.directives
	          );
	        }
	        // copy other options
	        for (var key in options) {
	          if (key !== 'modules' && key !== 'directives') {
	            finalOptions[key] = options[key];
	          }
	        }
	      }

	      var compiled = baseCompile(template, finalOptions);
	      if (false) {
	        errors.push.apply(errors, detectErrors(compiled.ast));
	      }
	      compiled.errors = errors;
	      compiled.tips = tips;
	      return compiled
	    }

	    return {
	      compile: compile,
	      compileToFunctions: createCompileToFunctionFn(compile)
	    }
	  }
	}

	/*  */

	// `createCompilerCreator` allows creating compilers that use alternative
	// parser/optimizer/codegen, e.g the SSR optimizing compiler.
	// Here we just export a default compiler using the default parts.
	var createCompiler = createCompilerCreator(function baseCompile (
	  template,
	  options
	) {
	  var ast = parse(template.trim(), options);
	  optimize(ast, options);
	  var code = generate(ast, options);
	  return {
	    ast: ast,
	    render: code.render,
	    staticRenderFns: code.staticRenderFns
	  }
	});

	/*  */

	var ref$1 = createCompiler(baseOptions);
	var compileToFunctions = ref$1.compileToFunctions;

	/*  */

	var idToTemplate = cached(function (id) {
	  var el = query(id);
	  return el && el.innerHTML
	});

	var mount = Vue$3.prototype.$mount;
	Vue$3.prototype.$mount = function (
	  el,
	  hydrating
	) {
	  el = el && query(el);

	  /* istanbul ignore if */
	  if (el === document.body || el === document.documentElement) {
	    ("production") !== 'production' && warn(
	      "Do not mount Vue to <html> or <body> - mount to normal elements instead."
	    );
	    return this
	  }

	  var options = this.$options;
	  // resolve template/el and convert to render function
	  if (!options.render) {
	    var template = options.template;
	    if (template) {
	      if (typeof template === 'string') {
	        if (template.charAt(0) === '#') {
	          template = idToTemplate(template);
	          /* istanbul ignore if */
	          if (false) {
	            warn(
	              ("Template element not found or is empty: " + (options.template)),
	              this
	            );
	          }
	        }
	      } else if (template.nodeType) {
	        template = template.innerHTML;
	      } else {
	        if (false) {
	          warn('invalid template option:' + template, this);
	        }
	        return this
	      }
	    } else if (el) {
	      template = getOuterHTML(el);
	    }
	    if (template) {
	      /* istanbul ignore if */
	      if (false) {
	        mark('compile');
	      }

	      var ref = compileToFunctions(template, {
	        shouldDecodeNewlines: shouldDecodeNewlines,
	        delimiters: options.delimiters,
	        comments: options.comments
	      }, this);
	      var render = ref.render;
	      var staticRenderFns = ref.staticRenderFns;
	      options.render = render;
	      options.staticRenderFns = staticRenderFns;

	      /* istanbul ignore if */
	      if (false) {
	        mark('compile end');
	        measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
	      }
	    }
	  }
	  return mount.call(this, el, hydrating)
	};

	/**
	 * Get outerHTML of elements, taking care
	 * of SVG elements in IE as well.
	 */
	function getOuterHTML (el) {
	  if (el.outerHTML) {
	    return el.outerHTML
	  } else {
	    var container = document.createElement('div');
	    container.appendChild(el.cloneNode(true));
	    return container.innerHTML
	  }
	}

	Vue$3.compile = compileToFunctions;

	module.exports = Vue$3;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(171).setImmediate))

/***/ }),

/***/ 169:
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),

/***/ 170:
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(169)))

/***/ }),

/***/ 171:
/***/ (function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(170);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ }),

/***/ 186:
/***/ (function(module, exports, __webpack_require__) {

	/**
	  * vue-router v2.8.1
	  * (c) 2017 Evan You
	  * @license MIT
	  */
	'use strict';

	/*  */

	function assert (condition, message) {
	  if (!condition) {
	    throw new Error(("[vue-router] " + message))
	  }
	}

	function warn (condition, message) {
	  if (false) {
	    typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
	  }
	}

	function isError (err) {
	  return Object.prototype.toString.call(err).indexOf('Error') > -1
	}

	var View = {
	  name: 'router-view',
	  functional: true,
	  props: {
	    name: {
	      type: String,
	      default: 'default'
	    }
	  },
	  render: function render (_, ref) {
	    var props = ref.props;
	    var children = ref.children;
	    var parent = ref.parent;
	    var data = ref.data;

	    data.routerView = true;

	    // directly use parent context's createElement() function
	    // so that components rendered by router-view can resolve named slots
	    var h = parent.$createElement;
	    var name = props.name;
	    var route = parent.$route;
	    var cache = parent._routerViewCache || (parent._routerViewCache = {});

	    // determine current view depth, also check to see if the tree
	    // has been toggled inactive but kept-alive.
	    var depth = 0;
	    var inactive = false;
	    while (parent && parent._routerRoot !== parent) {
	      if (parent.$vnode && parent.$vnode.data.routerView) {
	        depth++;
	      }
	      if (parent._inactive) {
	        inactive = true;
	      }
	      parent = parent.$parent;
	    }
	    data.routerViewDepth = depth;

	    // render previous view if the tree is inactive and kept-alive
	    if (inactive) {
	      return h(cache[name], data, children)
	    }

	    var matched = route.matched[depth];
	    // render empty node if no matched route
	    if (!matched) {
	      cache[name] = null;
	      return h()
	    }

	    var component = cache[name] = matched.components[name];

	    // attach instance registration hook
	    // this will be called in the instance's injected lifecycle hooks
	    data.registerRouteInstance = function (vm, val) {
	      // val could be undefined for unregistration
	      var current = matched.instances[name];
	      if (
	        (val && current !== vm) ||
	        (!val && current === vm)
	      ) {
	        matched.instances[name] = val;
	      }
	    }

	    // also register instance in prepatch hook
	    // in case the same component instance is reused across different routes
	    ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
	      matched.instances[name] = vnode.componentInstance;
	    };

	    // resolve props
	    var propsToPass = data.props = resolveProps(route, matched.props && matched.props[name]);
	    if (propsToPass) {
	      // clone to prevent mutation
	      propsToPass = data.props = extend({}, propsToPass);
	      // pass non-declared props as attrs
	      var attrs = data.attrs = data.attrs || {};
	      for (var key in propsToPass) {
	        if (!component.props || !(key in component.props)) {
	          attrs[key] = propsToPass[key];
	          delete propsToPass[key];
	        }
	      }
	    }

	    return h(component, data, children)
	  }
	};

	function resolveProps (route, config) {
	  switch (typeof config) {
	    case 'undefined':
	      return
	    case 'object':
	      return config
	    case 'function':
	      return config(route)
	    case 'boolean':
	      return config ? route.params : undefined
	    default:
	      if (false) {
	        warn(
	          false,
	          "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
	          "expecting an object, function or boolean."
	        );
	      }
	  }
	}

	function extend (to, from) {
	  for (var key in from) {
	    to[key] = from[key];
	  }
	  return to
	}

	/*  */

	var encodeReserveRE = /[!'()*]/g;
	var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
	var commaRE = /%2C/g;

	// fixed encodeURIComponent which is more conformant to RFC3986:
	// - escapes [!'()*]
	// - preserve commas
	var encode = function (str) { return encodeURIComponent(str)
	  .replace(encodeReserveRE, encodeReserveReplacer)
	  .replace(commaRE, ','); };

	var decode = decodeURIComponent;

	function resolveQuery (
	  query,
	  extraQuery,
	  _parseQuery
	) {
	  if ( extraQuery === void 0 ) extraQuery = {};

	  var parse = _parseQuery || parseQuery;
	  var parsedQuery;
	  try {
	    parsedQuery = parse(query || '');
	  } catch (e) {
	    ("production") !== 'production' && warn(false, e.message);
	    parsedQuery = {};
	  }
	  for (var key in extraQuery) {
	    parsedQuery[key] = extraQuery[key];
	  }
	  return parsedQuery
	}

	function parseQuery (query) {
	  var res = {};

	  query = query.trim().replace(/^(\?|#|&)/, '');

	  if (!query) {
	    return res
	  }

	  query.split('&').forEach(function (param) {
	    var parts = param.replace(/\+/g, ' ').split('=');
	    var key = decode(parts.shift());
	    var val = parts.length > 0
	      ? decode(parts.join('='))
	      : null;

	    if (res[key] === undefined) {
	      res[key] = val;
	    } else if (Array.isArray(res[key])) {
	      res[key].push(val);
	    } else {
	      res[key] = [res[key], val];
	    }
	  });

	  return res
	}

	function stringifyQuery (obj) {
	  var res = obj ? Object.keys(obj).map(function (key) {
	    var val = obj[key];

	    if (val === undefined) {
	      return ''
	    }

	    if (val === null) {
	      return encode(key)
	    }

	    if (Array.isArray(val)) {
	      var result = [];
	      val.forEach(function (val2) {
	        if (val2 === undefined) {
	          return
	        }
	        if (val2 === null) {
	          result.push(encode(key));
	        } else {
	          result.push(encode(key) + '=' + encode(val2));
	        }
	      });
	      return result.join('&')
	    }

	    return encode(key) + '=' + encode(val)
	  }).filter(function (x) { return x.length > 0; }).join('&') : null;
	  return res ? ("?" + res) : ''
	}

	/*  */


	var trailingSlashRE = /\/?$/;

	function createRoute (
	  record,
	  location,
	  redirectedFrom,
	  router
	) {
	  var stringifyQuery$$1 = router && router.options.stringifyQuery;

	  var query = location.query || {};
	  try {
	    query = clone(query);
	  } catch (e) {}

	  var route = {
	    name: location.name || (record && record.name),
	    meta: (record && record.meta) || {},
	    path: location.path || '/',
	    hash: location.hash || '',
	    query: query,
	    params: location.params || {},
	    fullPath: getFullPath(location, stringifyQuery$$1),
	    matched: record ? formatMatch(record) : []
	  };
	  if (redirectedFrom) {
	    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery$$1);
	  }
	  return Object.freeze(route)
	}

	function clone (value) {
	  if (Array.isArray(value)) {
	    return value.map(clone)
	  } else if (value && typeof value === 'object') {
	    var res = {};
	    for (var key in value) {
	      res[key] = clone(value[key]);
	    }
	    return res
	  } else {
	    return value
	  }
	}

	// the starting route that represents the initial state
	var START = createRoute(null, {
	  path: '/'
	});

	function formatMatch (record) {
	  var res = [];
	  while (record) {
	    res.unshift(record);
	    record = record.parent;
	  }
	  return res
	}

	function getFullPath (
	  ref,
	  _stringifyQuery
	) {
	  var path = ref.path;
	  var query = ref.query; if ( query === void 0 ) query = {};
	  var hash = ref.hash; if ( hash === void 0 ) hash = '';

	  var stringify = _stringifyQuery || stringifyQuery;
	  return (path || '/') + stringify(query) + hash
	}

	function isSameRoute (a, b) {
	  if (b === START) {
	    return a === b
	  } else if (!b) {
	    return false
	  } else if (a.path && b.path) {
	    return (
	      a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
	      a.hash === b.hash &&
	      isObjectEqual(a.query, b.query)
	    )
	  } else if (a.name && b.name) {
	    return (
	      a.name === b.name &&
	      a.hash === b.hash &&
	      isObjectEqual(a.query, b.query) &&
	      isObjectEqual(a.params, b.params)
	    )
	  } else {
	    return false
	  }
	}

	function isObjectEqual (a, b) {
	  if ( a === void 0 ) a = {};
	  if ( b === void 0 ) b = {};

	  // handle null value #1566
	  if (!a || !b) { return a === b }
	  var aKeys = Object.keys(a);
	  var bKeys = Object.keys(b);
	  if (aKeys.length !== bKeys.length) {
	    return false
	  }
	  return aKeys.every(function (key) {
	    var aVal = a[key];
	    var bVal = b[key];
	    // check nested equality
	    if (typeof aVal === 'object' && typeof bVal === 'object') {
	      return isObjectEqual(aVal, bVal)
	    }
	    return String(aVal) === String(bVal)
	  })
	}

	function isIncludedRoute (current, target) {
	  return (
	    current.path.replace(trailingSlashRE, '/').indexOf(
	      target.path.replace(trailingSlashRE, '/')
	    ) === 0 &&
	    (!target.hash || current.hash === target.hash) &&
	    queryIncludes(current.query, target.query)
	  )
	}

	function queryIncludes (current, target) {
	  for (var key in target) {
	    if (!(key in current)) {
	      return false
	    }
	  }
	  return true
	}

	/*  */

	// work around weird flow bug
	var toTypes = [String, Object];
	var eventTypes = [String, Array];

	var Link = {
	  name: 'router-link',
	  props: {
	    to: {
	      type: toTypes,
	      required: true
	    },
	    tag: {
	      type: String,
	      default: 'a'
	    },
	    exact: Boolean,
	    append: Boolean,
	    replace: Boolean,
	    activeClass: String,
	    exactActiveClass: String,
	    event: {
	      type: eventTypes,
	      default: 'click'
	    }
	  },
	  render: function render (h) {
	    var this$1 = this;

	    var router = this.$router;
	    var current = this.$route;
	    var ref = router.resolve(this.to, current, this.append);
	    var location = ref.location;
	    var route = ref.route;
	    var href = ref.href;

	    var classes = {};
	    var globalActiveClass = router.options.linkActiveClass;
	    var globalExactActiveClass = router.options.linkExactActiveClass;
	    // Support global empty active class
	    var activeClassFallback = globalActiveClass == null
	            ? 'router-link-active'
	            : globalActiveClass;
	    var exactActiveClassFallback = globalExactActiveClass == null
	            ? 'router-link-exact-active'
	            : globalExactActiveClass;
	    var activeClass = this.activeClass == null
	            ? activeClassFallback
	            : this.activeClass;
	    var exactActiveClass = this.exactActiveClass == null
	            ? exactActiveClassFallback
	            : this.exactActiveClass;
	    var compareTarget = location.path
	      ? createRoute(null, location, null, router)
	      : route;

	    classes[exactActiveClass] = isSameRoute(current, compareTarget);
	    classes[activeClass] = this.exact
	      ? classes[exactActiveClass]
	      : isIncludedRoute(current, compareTarget);

	    var handler = function (e) {
	      if (guardEvent(e)) {
	        if (this$1.replace) {
	          router.replace(location);
	        } else {
	          router.push(location);
	        }
	      }
	    };

	    var on = { click: guardEvent };
	    if (Array.isArray(this.event)) {
	      this.event.forEach(function (e) { on[e] = handler; });
	    } else {
	      on[this.event] = handler;
	    }

	    var data = {
	      class: classes
	    };

	    if (this.tag === 'a') {
	      data.on = on;
	      data.attrs = { href: href };
	    } else {
	      // find the first <a> child and apply listener and href
	      var a = findAnchor(this.$slots.default);
	      if (a) {
	        // in case the <a> is a static node
	        a.isStatic = false;
	        var extend = _Vue.util.extend;
	        var aData = a.data = extend({}, a.data);
	        aData.on = on;
	        var aAttrs = a.data.attrs = extend({}, a.data.attrs);
	        aAttrs.href = href;
	      } else {
	        // doesn't have <a> child, apply listener to self
	        data.on = on;
	      }
	    }

	    return h(this.tag, data, this.$slots.default)
	  }
	};

	function guardEvent (e) {
	  // don't redirect with control keys
	  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
	  // don't redirect when preventDefault called
	  if (e.defaultPrevented) { return }
	  // don't redirect on right click
	  if (e.button !== undefined && e.button !== 0) { return }
	  // don't redirect if `target="_blank"`
	  if (e.currentTarget && e.currentTarget.getAttribute) {
	    var target = e.currentTarget.getAttribute('target');
	    if (/\b_blank\b/i.test(target)) { return }
	  }
	  // this may be a Weex event which doesn't have this method
	  if (e.preventDefault) {
	    e.preventDefault();
	  }
	  return true
	}

	function findAnchor (children) {
	  if (children) {
	    var child;
	    for (var i = 0; i < children.length; i++) {
	      child = children[i];
	      if (child.tag === 'a') {
	        return child
	      }
	      if (child.children && (child = findAnchor(child.children))) {
	        return child
	      }
	    }
	  }
	}

	var _Vue;

	function install (Vue) {
	  if (install.installed && _Vue === Vue) { return }
	  install.installed = true;

	  _Vue = Vue;

	  var isDef = function (v) { return v !== undefined; };

	  var registerInstance = function (vm, callVal) {
	    var i = vm.$options._parentVnode;
	    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
	      i(vm, callVal);
	    }
	  };

	  Vue.mixin({
	    beforeCreate: function beforeCreate () {
	      if (isDef(this.$options.router)) {
	        this._routerRoot = this;
	        this._router = this.$options.router;
	        this._router.init(this);
	        Vue.util.defineReactive(this, '_route', this._router.history.current);
	      } else {
	        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
	      }
	      registerInstance(this, this);
	    },
	    destroyed: function destroyed () {
	      registerInstance(this);
	    }
	  });

	  Object.defineProperty(Vue.prototype, '$router', {
	    get: function get () { return this._routerRoot._router }
	  });

	  Object.defineProperty(Vue.prototype, '$route', {
	    get: function get () { return this._routerRoot._route }
	  });

	  Vue.component('router-view', View);
	  Vue.component('router-link', Link);

	  var strats = Vue.config.optionMergeStrategies;
	  // use the same hook merging strategy for route hooks
	  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
	}

	/*  */

	var inBrowser = typeof window !== 'undefined';

	/*  */

	function resolvePath (
	  relative,
	  base,
	  append
	) {
	  var firstChar = relative.charAt(0);
	  if (firstChar === '/') {
	    return relative
	  }

	  if (firstChar === '?' || firstChar === '#') {
	    return base + relative
	  }

	  var stack = base.split('/');

	  // remove trailing segment if:
	  // - not appending
	  // - appending to trailing slash (last segment is empty)
	  if (!append || !stack[stack.length - 1]) {
	    stack.pop();
	  }

	  // resolve relative path
	  var segments = relative.replace(/^\//, '').split('/');
	  for (var i = 0; i < segments.length; i++) {
	    var segment = segments[i];
	    if (segment === '..') {
	      stack.pop();
	    } else if (segment !== '.') {
	      stack.push(segment);
	    }
	  }

	  // ensure leading slash
	  if (stack[0] !== '') {
	    stack.unshift('');
	  }

	  return stack.join('/')
	}

	function parsePath (path) {
	  var hash = '';
	  var query = '';

	  var hashIndex = path.indexOf('#');
	  if (hashIndex >= 0) {
	    hash = path.slice(hashIndex);
	    path = path.slice(0, hashIndex);
	  }

	  var queryIndex = path.indexOf('?');
	  if (queryIndex >= 0) {
	    query = path.slice(queryIndex + 1);
	    path = path.slice(0, queryIndex);
	  }

	  return {
	    path: path,
	    query: query,
	    hash: hash
	  }
	}

	function cleanPath (path) {
	  return path.replace(/\/\//g, '/')
	}

	var isarray = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};

	/**
	 * Expose `pathToRegexp`.
	 */
	var pathToRegexp_1 = pathToRegexp;
	var parse_1 = parse;
	var compile_1 = compile;
	var tokensToFunction_1 = tokensToFunction;
	var tokensToRegExp_1 = tokensToRegExp;

	/**
	 * The main path matching regexp utility.
	 *
	 * @type {RegExp}
	 */
	var PATH_REGEXP = new RegExp([
	  // Match escaped characters that would otherwise appear in future matches.
	  // This allows the user to escape special characters that won't transform.
	  '(\\\\.)',
	  // Match Express-style parameters and un-named parameters with a prefix
	  // and optional suffixes. Matches appear as:
	  //
	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
	  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
	  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
	  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
	].join('|'), 'g');

	/**
	 * Parse a string for the raw tokens.
	 *
	 * @param  {string}  str
	 * @param  {Object=} options
	 * @return {!Array}
	 */
	function parse (str, options) {
	  var tokens = [];
	  var key = 0;
	  var index = 0;
	  var path = '';
	  var defaultDelimiter = options && options.delimiter || '/';
	  var res;

	  while ((res = PATH_REGEXP.exec(str)) != null) {
	    var m = res[0];
	    var escaped = res[1];
	    var offset = res.index;
	    path += str.slice(index, offset);
	    index = offset + m.length;

	    // Ignore already escaped sequences.
	    if (escaped) {
	      path += escaped[1];
	      continue
	    }

	    var next = str[index];
	    var prefix = res[2];
	    var name = res[3];
	    var capture = res[4];
	    var group = res[5];
	    var modifier = res[6];
	    var asterisk = res[7];

	    // Push the current path onto the tokens.
	    if (path) {
	      tokens.push(path);
	      path = '';
	    }

	    var partial = prefix != null && next != null && next !== prefix;
	    var repeat = modifier === '+' || modifier === '*';
	    var optional = modifier === '?' || modifier === '*';
	    var delimiter = res[2] || defaultDelimiter;
	    var pattern = capture || group;

	    tokens.push({
	      name: name || key++,
	      prefix: prefix || '',
	      delimiter: delimiter,
	      optional: optional,
	      repeat: repeat,
	      partial: partial,
	      asterisk: !!asterisk,
	      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
	    });
	  }

	  // Match any characters still remaining.
	  if (index < str.length) {
	    path += str.substr(index);
	  }

	  // If the path exists, push it onto the end.
	  if (path) {
	    tokens.push(path);
	  }

	  return tokens
	}

	/**
	 * Compile a string to a template function for the path.
	 *
	 * @param  {string}             str
	 * @param  {Object=}            options
	 * @return {!function(Object=, Object=)}
	 */
	function compile (str, options) {
	  return tokensToFunction(parse(str, options))
	}

	/**
	 * Prettier encoding of URI path segments.
	 *
	 * @param  {string}
	 * @return {string}
	 */
	function encodeURIComponentPretty (str) {
	  return encodeURI(str).replace(/[\/?#]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
	  })
	}

	/**
	 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
	 *
	 * @param  {string}
	 * @return {string}
	 */
	function encodeAsterisk (str) {
	  return encodeURI(str).replace(/[?#]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
	  })
	}

	/**
	 * Expose a method for transforming tokens into the path function.
	 */
	function tokensToFunction (tokens) {
	  // Compile all the tokens into regexps.
	  var matches = new Array(tokens.length);

	  // Compile all the patterns before compilation.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] === 'object') {
	      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
	    }
	  }

	  return function (obj, opts) {
	    var path = '';
	    var data = obj || {};
	    var options = opts || {};
	    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

	    for (var i = 0; i < tokens.length; i++) {
	      var token = tokens[i];

	      if (typeof token === 'string') {
	        path += token;

	        continue
	      }

	      var value = data[token.name];
	      var segment;

	      if (value == null) {
	        if (token.optional) {
	          // Prepend partial segment prefixes.
	          if (token.partial) {
	            path += token.prefix;
	          }

	          continue
	        } else {
	          throw new TypeError('Expected "' + token.name + '" to be defined')
	        }
	      }

	      if (isarray(value)) {
	        if (!token.repeat) {
	          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
	        }

	        if (value.length === 0) {
	          if (token.optional) {
	            continue
	          } else {
	            throw new TypeError('Expected "' + token.name + '" to not be empty')
	          }
	        }

	        for (var j = 0; j < value.length; j++) {
	          segment = encode(value[j]);

	          if (!matches[i].test(segment)) {
	            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
	          }

	          path += (j === 0 ? token.prefix : token.delimiter) + segment;
	        }

	        continue
	      }

	      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

	      if (!matches[i].test(segment)) {
	        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	      }

	      path += token.prefix + segment;
	    }

	    return path
	  }
	}

	/**
	 * Escape a regular expression string.
	 *
	 * @param  {string} str
	 * @return {string}
	 */
	function escapeString (str) {
	  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
	}

	/**
	 * Escape the capturing group by escaping special characters and meaning.
	 *
	 * @param  {string} group
	 * @return {string}
	 */
	function escapeGroup (group) {
	  return group.replace(/([=!:$\/()])/g, '\\$1')
	}

	/**
	 * Attach the keys as a property of the regexp.
	 *
	 * @param  {!RegExp} re
	 * @param  {Array}   keys
	 * @return {!RegExp}
	 */
	function attachKeys (re, keys) {
	  re.keys = keys;
	  return re
	}

	/**
	 * Get the flags for a regexp from the options.
	 *
	 * @param  {Object} options
	 * @return {string}
	 */
	function flags (options) {
	  return options.sensitive ? '' : 'i'
	}

	/**
	 * Pull out keys from a regexp.
	 *
	 * @param  {!RegExp} path
	 * @param  {!Array}  keys
	 * @return {!RegExp}
	 */
	function regexpToRegexp (path, keys) {
	  // Use a negative lookahead to match only capturing groups.
	  var groups = path.source.match(/\((?!\?)/g);

	  if (groups) {
	    for (var i = 0; i < groups.length; i++) {
	      keys.push({
	        name: i,
	        prefix: null,
	        delimiter: null,
	        optional: false,
	        repeat: false,
	        partial: false,
	        asterisk: false,
	        pattern: null
	      });
	    }
	  }

	  return attachKeys(path, keys)
	}

	/**
	 * Transform an array into a regexp.
	 *
	 * @param  {!Array}  path
	 * @param  {Array}   keys
	 * @param  {!Object} options
	 * @return {!RegExp}
	 */
	function arrayToRegexp (path, keys, options) {
	  var parts = [];

	  for (var i = 0; i < path.length; i++) {
	    parts.push(pathToRegexp(path[i], keys, options).source);
	  }

	  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

	  return attachKeys(regexp, keys)
	}

	/**
	 * Create a path regexp from string input.
	 *
	 * @param  {string}  path
	 * @param  {!Array}  keys
	 * @param  {!Object} options
	 * @return {!RegExp}
	 */
	function stringToRegexp (path, keys, options) {
	  return tokensToRegExp(parse(path, options), keys, options)
	}

	/**
	 * Expose a function for taking tokens and returning a RegExp.
	 *
	 * @param  {!Array}          tokens
	 * @param  {(Array|Object)=} keys
	 * @param  {Object=}         options
	 * @return {!RegExp}
	 */
	function tokensToRegExp (tokens, keys, options) {
	  if (!isarray(keys)) {
	    options = /** @type {!Object} */ (keys || options);
	    keys = [];
	  }

	  options = options || {};

	  var strict = options.strict;
	  var end = options.end !== false;
	  var route = '';

	  // Iterate over the tokens and create our regexp string.
	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i];

	    if (typeof token === 'string') {
	      route += escapeString(token);
	    } else {
	      var prefix = escapeString(token.prefix);
	      var capture = '(?:' + token.pattern + ')';

	      keys.push(token);

	      if (token.repeat) {
	        capture += '(?:' + prefix + capture + ')*';
	      }

	      if (token.optional) {
	        if (!token.partial) {
	          capture = '(?:' + prefix + '(' + capture + '))?';
	        } else {
	          capture = prefix + '(' + capture + ')?';
	        }
	      } else {
	        capture = prefix + '(' + capture + ')';
	      }

	      route += capture;
	    }
	  }

	  var delimiter = escapeString(options.delimiter || '/');
	  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

	  // In non-strict mode we allow a slash at the end of match. If the path to
	  // match already ends with a slash, we remove it for consistency. The slash
	  // is valid at the end of a path match, not in the middle. This is important
	  // in non-ending mode, where "/test/" shouldn't match "/test//route".
	  if (!strict) {
	    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
	  }

	  if (end) {
	    route += '$';
	  } else {
	    // In non-ending mode, we need the capturing groups to match as much as
	    // possible by using a positive lookahead to the end or next path segment.
	    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
	  }

	  return attachKeys(new RegExp('^' + route, flags(options)), keys)
	}

	/**
	 * Normalize the given path string, returning a regular expression.
	 *
	 * An empty array can be passed in for the keys, which will hold the
	 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
	 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
	 *
	 * @param  {(string|RegExp|Array)} path
	 * @param  {(Array|Object)=}       keys
	 * @param  {Object=}               options
	 * @return {!RegExp}
	 */
	function pathToRegexp (path, keys, options) {
	  if (!isarray(keys)) {
	    options = /** @type {!Object} */ (keys || options);
	    keys = [];
	  }

	  options = options || {};

	  if (path instanceof RegExp) {
	    return regexpToRegexp(path, /** @type {!Array} */ (keys))
	  }

	  if (isarray(path)) {
	    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
	  }

	  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
	}

	pathToRegexp_1.parse = parse_1;
	pathToRegexp_1.compile = compile_1;
	pathToRegexp_1.tokensToFunction = tokensToFunction_1;
	pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

	/*  */

	// $flow-disable-line
	var regexpCompileCache = Object.create(null);

	function fillParams (
	  path,
	  params,
	  routeMsg
	) {
	  try {
	    var filler =
	      regexpCompileCache[path] ||
	      (regexpCompileCache[path] = pathToRegexp_1.compile(path));
	    return filler(params || {}, { pretty: true })
	  } catch (e) {
	    if (false) {
	      warn(false, ("missing param for " + routeMsg + ": " + (e.message)));
	    }
	    return ''
	  }
	}

	/*  */

	function createRouteMap (
	  routes,
	  oldPathList,
	  oldPathMap,
	  oldNameMap
	) {
	  // the path list is used to control path matching priority
	  var pathList = oldPathList || [];
	  // $flow-disable-line
	  var pathMap = oldPathMap || Object.create(null);
	  // $flow-disable-line
	  var nameMap = oldNameMap || Object.create(null);

	  routes.forEach(function (route) {
	    addRouteRecord(pathList, pathMap, nameMap, route);
	  });

	  // ensure wildcard routes are always at the end
	  for (var i = 0, l = pathList.length; i < l; i++) {
	    if (pathList[i] === '*') {
	      pathList.push(pathList.splice(i, 1)[0]);
	      l--;
	      i--;
	    }
	  }

	  return {
	    pathList: pathList,
	    pathMap: pathMap,
	    nameMap: nameMap
	  }
	}

	function addRouteRecord (
	  pathList,
	  pathMap,
	  nameMap,
	  route,
	  parent,
	  matchAs
	) {
	  var path = route.path;
	  var name = route.name;
	  if (false) {
	    assert(path != null, "\"path\" is required in a route configuration.");
	    assert(
	      typeof route.component !== 'string',
	      "route config \"component\" for path: " + (String(path || name)) + " cannot be a " +
	      "string id. Use an actual component instead."
	    );
	  }

	  var pathToRegexpOptions = route.pathToRegexpOptions || {};
	  var normalizedPath = normalizePath(
	    path,
	    parent,
	    pathToRegexpOptions.strict
	  );

	  if (typeof route.caseSensitive === 'boolean') {
	    pathToRegexpOptions.sensitive = route.caseSensitive;
	  }

	  var record = {
	    path: normalizedPath,
	    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
	    components: route.components || { default: route.component },
	    instances: {},
	    name: name,
	    parent: parent,
	    matchAs: matchAs,
	    redirect: route.redirect,
	    beforeEnter: route.beforeEnter,
	    meta: route.meta || {},
	    props: route.props == null
	      ? {}
	      : route.components
	        ? route.props
	        : { default: route.props }
	  };

	  if (route.children) {
	    // Warn if route is named, does not redirect and has a default child route.
	    // If users navigate to this route by name, the default child will
	    // not be rendered (GH Issue #629)
	    if (false) {
	      if (route.name && !route.redirect && route.children.some(function (child) { return /^\/?$/.test(child.path); })) {
	        warn(
	          false,
	          "Named Route '" + (route.name) + "' has a default child route. " +
	          "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
	          "the default child route will not be rendered. Remove the name from " +
	          "this route and use the name of the default child route for named " +
	          "links instead."
	        );
	      }
	    }
	    route.children.forEach(function (child) {
	      var childMatchAs = matchAs
	        ? cleanPath((matchAs + "/" + (child.path)))
	        : undefined;
	      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
	    });
	  }

	  if (route.alias !== undefined) {
	    var aliases = Array.isArray(route.alias)
	      ? route.alias
	      : [route.alias];

	    aliases.forEach(function (alias) {
	      var aliasRoute = {
	        path: alias,
	        children: route.children
	      };
	      addRouteRecord(
	        pathList,
	        pathMap,
	        nameMap,
	        aliasRoute,
	        parent,
	        record.path || '/' // matchAs
	      );
	    });
	  }

	  if (!pathMap[record.path]) {
	    pathList.push(record.path);
	    pathMap[record.path] = record;
	  }

	  if (name) {
	    if (!nameMap[name]) {
	      nameMap[name] = record;
	    } else if (false) {
	      warn(
	        false,
	        "Duplicate named routes definition: " +
	        "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
	      );
	    }
	  }
	}

	function compileRouteRegex (path, pathToRegexpOptions) {
	  var regex = pathToRegexp_1(path, [], pathToRegexpOptions);
	  if (false) {
	    var keys = Object.create(null);
	    regex.keys.forEach(function (key) {
	      warn(!keys[key.name], ("Duplicate param keys in route with path: \"" + path + "\""));
	      keys[key.name] = true;
	    });
	  }
	  return regex
	}

	function normalizePath (path, parent, strict) {
	  if (!strict) { path = path.replace(/\/$/, ''); }
	  if (path[0] === '/') { return path }
	  if (parent == null) { return path }
	  return cleanPath(((parent.path) + "/" + path))
	}

	/*  */


	function normalizeLocation (
	  raw,
	  current,
	  append,
	  router
	) {
	  var next = typeof raw === 'string' ? { path: raw } : raw;
	  // named target
	  if (next.name || next._normalized) {
	    return next
	  }

	  // relative params
	  if (!next.path && next.params && current) {
	    next = assign({}, next);
	    next._normalized = true;
	    var params = assign(assign({}, current.params), next.params);
	    if (current.name) {
	      next.name = current.name;
	      next.params = params;
	    } else if (current.matched.length) {
	      var rawPath = current.matched[current.matched.length - 1].path;
	      next.path = fillParams(rawPath, params, ("path " + (current.path)));
	    } else if (false) {
	      warn(false, "relative params navigation requires a current route.");
	    }
	    return next
	  }

	  var parsedPath = parsePath(next.path || '');
	  var basePath = (current && current.path) || '/';
	  var path = parsedPath.path
	    ? resolvePath(parsedPath.path, basePath, append || next.append)
	    : basePath;

	  var query = resolveQuery(
	    parsedPath.query,
	    next.query,
	    router && router.options.parseQuery
	  );

	  var hash = next.hash || parsedPath.hash;
	  if (hash && hash.charAt(0) !== '#') {
	    hash = "#" + hash;
	  }

	  return {
	    _normalized: true,
	    path: path,
	    query: query,
	    hash: hash
	  }
	}

	function assign (a, b) {
	  for (var key in b) {
	    a[key] = b[key];
	  }
	  return a
	}

	/*  */


	function createMatcher (
	  routes,
	  router
	) {
	  var ref = createRouteMap(routes);
	  var pathList = ref.pathList;
	  var pathMap = ref.pathMap;
	  var nameMap = ref.nameMap;

	  function addRoutes (routes) {
	    createRouteMap(routes, pathList, pathMap, nameMap);
	  }

	  function match (
	    raw,
	    currentRoute,
	    redirectedFrom
	  ) {
	    var location = normalizeLocation(raw, currentRoute, false, router);
	    var name = location.name;

	    if (name) {
	      var record = nameMap[name];
	      if (false) {
	        warn(record, ("Route with name '" + name + "' does not exist"));
	      }
	      if (!record) { return _createRoute(null, location) }
	      var paramNames = record.regex.keys
	        .filter(function (key) { return !key.optional; })
	        .map(function (key) { return key.name; });

	      if (typeof location.params !== 'object') {
	        location.params = {};
	      }

	      if (currentRoute && typeof currentRoute.params === 'object') {
	        for (var key in currentRoute.params) {
	          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
	            location.params[key] = currentRoute.params[key];
	          }
	        }
	      }

	      if (record) {
	        location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
	        return _createRoute(record, location, redirectedFrom)
	      }
	    } else if (location.path) {
	      location.params = {};
	      for (var i = 0; i < pathList.length; i++) {
	        var path = pathList[i];
	        var record$1 = pathMap[path];
	        if (matchRoute(record$1.regex, location.path, location.params)) {
	          return _createRoute(record$1, location, redirectedFrom)
	        }
	      }
	    }
	    // no match
	    return _createRoute(null, location)
	  }

	  function redirect (
	    record,
	    location
	  ) {
	    var originalRedirect = record.redirect;
	    var redirect = typeof originalRedirect === 'function'
	        ? originalRedirect(createRoute(record, location, null, router))
	        : originalRedirect;

	    if (typeof redirect === 'string') {
	      redirect = { path: redirect };
	    }

	    if (!redirect || typeof redirect !== 'object') {
	      if (false) {
	        warn(
	          false, ("invalid redirect option: " + (JSON.stringify(redirect)))
	        );
	      }
	      return _createRoute(null, location)
	    }

	    var re = redirect;
	    var name = re.name;
	    var path = re.path;
	    var query = location.query;
	    var hash = location.hash;
	    var params = location.params;
	    query = re.hasOwnProperty('query') ? re.query : query;
	    hash = re.hasOwnProperty('hash') ? re.hash : hash;
	    params = re.hasOwnProperty('params') ? re.params : params;

	    if (name) {
	      // resolved named direct
	      var targetRecord = nameMap[name];
	      if (false) {
	        assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
	      }
	      return match({
	        _normalized: true,
	        name: name,
	        query: query,
	        hash: hash,
	        params: params
	      }, undefined, location)
	    } else if (path) {
	      // 1. resolve relative redirect
	      var rawPath = resolveRecordPath(path, record);
	      // 2. resolve params
	      var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
	      // 3. rematch with existing query and hash
	      return match({
	        _normalized: true,
	        path: resolvedPath,
	        query: query,
	        hash: hash
	      }, undefined, location)
	    } else {
	      if (false) {
	        warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
	      }
	      return _createRoute(null, location)
	    }
	  }

	  function alias (
	    record,
	    location,
	    matchAs
	  ) {
	    var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
	    var aliasedMatch = match({
	      _normalized: true,
	      path: aliasedPath
	    });
	    if (aliasedMatch) {
	      var matched = aliasedMatch.matched;
	      var aliasedRecord = matched[matched.length - 1];
	      location.params = aliasedMatch.params;
	      return _createRoute(aliasedRecord, location)
	    }
	    return _createRoute(null, location)
	  }

	  function _createRoute (
	    record,
	    location,
	    redirectedFrom
	  ) {
	    if (record && record.redirect) {
	      return redirect(record, redirectedFrom || location)
	    }
	    if (record && record.matchAs) {
	      return alias(record, location, record.matchAs)
	    }
	    return createRoute(record, location, redirectedFrom, router)
	  }

	  return {
	    match: match,
	    addRoutes: addRoutes
	  }
	}

	function matchRoute (
	  regex,
	  path,
	  params
	) {
	  var m = path.match(regex);

	  if (!m) {
	    return false
	  } else if (!params) {
	    return true
	  }

	  for (var i = 1, len = m.length; i < len; ++i) {
	    var key = regex.keys[i - 1];
	    var val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];
	    if (key) {
	      params[key.name] = val;
	    }
	  }

	  return true
	}

	function resolveRecordPath (path, record) {
	  return resolvePath(path, record.parent ? record.parent.path : '/', true)
	}

	/*  */


	var positionStore = Object.create(null);

	function setupScroll () {
	  // Fix for #1585 for Firefox
	  window.history.replaceState({ key: getStateKey() }, '');
	  window.addEventListener('popstate', function (e) {
	    saveScrollPosition();
	    if (e.state && e.state.key) {
	      setStateKey(e.state.key);
	    }
	  });
	}

	function handleScroll (
	  router,
	  to,
	  from,
	  isPop
	) {
	  if (!router.app) {
	    return
	  }

	  var behavior = router.options.scrollBehavior;
	  if (!behavior) {
	    return
	  }

	  if (false) {
	    assert(typeof behavior === 'function', "scrollBehavior must be a function");
	  }

	  // wait until re-render finishes before scrolling
	  router.app.$nextTick(function () {
	    var position = getScrollPosition();
	    var shouldScroll = behavior(to, from, isPop ? position : null);

	    if (!shouldScroll) {
	      return
	    }

	    if (typeof shouldScroll.then === 'function') {
	      shouldScroll.then(function (shouldScroll) {
	        scrollToPosition((shouldScroll), position);
	      }).catch(function (err) {
	        if (false) {
	          assert(false, err.toString());
	        }
	      });
	    } else {
	      scrollToPosition(shouldScroll, position);
	    }
	  });
	}

	function saveScrollPosition () {
	  var key = getStateKey();
	  if (key) {
	    positionStore[key] = {
	      x: window.pageXOffset,
	      y: window.pageYOffset
	    };
	  }
	}

	function getScrollPosition () {
	  var key = getStateKey();
	  if (key) {
	    return positionStore[key]
	  }
	}

	function getElementPosition (el, offset) {
	  var docEl = document.documentElement;
	  var docRect = docEl.getBoundingClientRect();
	  var elRect = el.getBoundingClientRect();
	  return {
	    x: elRect.left - docRect.left - offset.x,
	    y: elRect.top - docRect.top - offset.y
	  }
	}

	function isValidPosition (obj) {
	  return isNumber(obj.x) || isNumber(obj.y)
	}

	function normalizePosition (obj) {
	  return {
	    x: isNumber(obj.x) ? obj.x : window.pageXOffset,
	    y: isNumber(obj.y) ? obj.y : window.pageYOffset
	  }
	}

	function normalizeOffset (obj) {
	  return {
	    x: isNumber(obj.x) ? obj.x : 0,
	    y: isNumber(obj.y) ? obj.y : 0
	  }
	}

	function isNumber (v) {
	  return typeof v === 'number'
	}

	function scrollToPosition (shouldScroll, position) {
	  var isObject = typeof shouldScroll === 'object';
	  if (isObject && typeof shouldScroll.selector === 'string') {
	    var el = document.querySelector(shouldScroll.selector);
	    if (el) {
	      var offset = shouldScroll.offset && typeof shouldScroll.offset === 'object' ? shouldScroll.offset : {};
	      offset = normalizeOffset(offset);
	      position = getElementPosition(el, offset);
	    } else if (isValidPosition(shouldScroll)) {
	      position = normalizePosition(shouldScroll);
	    }
	  } else if (isObject && isValidPosition(shouldScroll)) {
	    position = normalizePosition(shouldScroll);
	  }

	  if (position) {
	    window.scrollTo(position.x, position.y);
	  }
	}

	/*  */

	var supportsPushState = inBrowser && (function () {
	  var ua = window.navigator.userAgent;

	  if (
	    (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
	    ua.indexOf('Mobile Safari') !== -1 &&
	    ua.indexOf('Chrome') === -1 &&
	    ua.indexOf('Windows Phone') === -1
	  ) {
	    return false
	  }

	  return window.history && 'pushState' in window.history
	})();

	// use User Timing api (if present) for more accurate key precision
	var Time = inBrowser && window.performance && window.performance.now
	  ? window.performance
	  : Date;

	var _key = genKey();

	function genKey () {
	  return Time.now().toFixed(3)
	}

	function getStateKey () {
	  return _key
	}

	function setStateKey (key) {
	  _key = key;
	}

	function pushState (url, replace) {
	  saveScrollPosition();
	  // try...catch the pushState call to get around Safari
	  // DOM Exception 18 where it limits to 100 pushState calls
	  var history = window.history;
	  try {
	    if (replace) {
	      history.replaceState({ key: _key }, '', url);
	    } else {
	      _key = genKey();
	      history.pushState({ key: _key }, '', url);
	    }
	  } catch (e) {
	    window.location[replace ? 'replace' : 'assign'](url);
	  }
	}

	function replaceState (url) {
	  pushState(url, true);
	}

	/*  */

	function runQueue (queue, fn, cb) {
	  var step = function (index) {
	    if (index >= queue.length) {
	      cb();
	    } else {
	      if (queue[index]) {
	        fn(queue[index], function () {
	          step(index + 1);
	        });
	      } else {
	        step(index + 1);
	      }
	    }
	  };
	  step(0);
	}

	/*  */

	function resolveAsyncComponents (matched) {
	  return function (to, from, next) {
	    var hasAsync = false;
	    var pending = 0;
	    var error = null;

	    flatMapComponents(matched, function (def, _, match, key) {
	      // if it's a function and doesn't have cid attached,
	      // assume it's an async component resolve function.
	      // we are not using Vue's default async resolving mechanism because
	      // we want to halt the navigation until the incoming component has been
	      // resolved.
	      if (typeof def === 'function' && def.cid === undefined) {
	        hasAsync = true;
	        pending++;

	        var resolve = once(function (resolvedDef) {
	          if (isESModule(resolvedDef)) {
	            resolvedDef = resolvedDef.default;
	          }
	          // save resolved on async factory in case it's used elsewhere
	          def.resolved = typeof resolvedDef === 'function'
	            ? resolvedDef
	            : _Vue.extend(resolvedDef);
	          match.components[key] = resolvedDef;
	          pending--;
	          if (pending <= 0) {
	            next();
	          }
	        });

	        var reject = once(function (reason) {
	          var msg = "Failed to resolve async component " + key + ": " + reason;
	          ("production") !== 'production' && warn(false, msg);
	          if (!error) {
	            error = isError(reason)
	              ? reason
	              : new Error(msg);
	            next(error);
	          }
	        });

	        var res;
	        try {
	          res = def(resolve, reject);
	        } catch (e) {
	          reject(e);
	        }
	        if (res) {
	          if (typeof res.then === 'function') {
	            res.then(resolve, reject);
	          } else {
	            // new syntax in Vue 2.3
	            var comp = res.component;
	            if (comp && typeof comp.then === 'function') {
	              comp.then(resolve, reject);
	            }
	          }
	        }
	      }
	    });

	    if (!hasAsync) { next(); }
	  }
	}

	function flatMapComponents (
	  matched,
	  fn
	) {
	  return flatten(matched.map(function (m) {
	    return Object.keys(m.components).map(function (key) { return fn(
	      m.components[key],
	      m.instances[key],
	      m, key
	    ); })
	  }))
	}

	function flatten (arr) {
	  return Array.prototype.concat.apply([], arr)
	}

	var hasSymbol =
	  typeof Symbol === 'function' &&
	  typeof Symbol.toStringTag === 'symbol';

	function isESModule (obj) {
	  return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module')
	}

	// in Webpack 2, require.ensure now also returns a Promise
	// so the resolve/reject functions may get called an extra time
	// if the user uses an arrow function shorthand that happens to
	// return that Promise.
	function once (fn) {
	  var called = false;
	  return function () {
	    var args = [], len = arguments.length;
	    while ( len-- ) args[ len ] = arguments[ len ];

	    if (called) { return }
	    called = true;
	    return fn.apply(this, args)
	  }
	}

	/*  */

	var History = function History (router, base) {
	  this.router = router;
	  this.base = normalizeBase(base);
	  // start with a route object that stands for "nowhere"
	  this.current = START;
	  this.pending = null;
	  this.ready = false;
	  this.readyCbs = [];
	  this.readyErrorCbs = [];
	  this.errorCbs = [];
	};

	History.prototype.listen = function listen (cb) {
	  this.cb = cb;
	};

	History.prototype.onReady = function onReady (cb, errorCb) {
	  if (this.ready) {
	    cb();
	  } else {
	    this.readyCbs.push(cb);
	    if (errorCb) {
	      this.readyErrorCbs.push(errorCb);
	    }
	  }
	};

	History.prototype.onError = function onError (errorCb) {
	  this.errorCbs.push(errorCb);
	};

	History.prototype.transitionTo = function transitionTo (location, onComplete, onAbort) {
	    var this$1 = this;

	  var route = this.router.match(location, this.current);
	  this.confirmTransition(route, function () {
	    this$1.updateRoute(route);
	    onComplete && onComplete(route);
	    this$1.ensureURL();

	    // fire ready cbs once
	    if (!this$1.ready) {
	      this$1.ready = true;
	      this$1.readyCbs.forEach(function (cb) { cb(route); });
	    }
	  }, function (err) {
	    if (onAbort) {
	      onAbort(err);
	    }
	    if (err && !this$1.ready) {
	      this$1.ready = true;
	      this$1.readyErrorCbs.forEach(function (cb) { cb(err); });
	    }
	  });
	};

	History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
	    var this$1 = this;

	  var current = this.current;
	  var abort = function (err) {
	    if (isError(err)) {
	      if (this$1.errorCbs.length) {
	        this$1.errorCbs.forEach(function (cb) { cb(err); });
	      } else {
	        warn(false, 'uncaught error during route navigation:');
	        console.error(err);
	      }
	    }
	    onAbort && onAbort(err);
	  };
	  if (
	    isSameRoute(route, current) &&
	    // in the case the route map has been dynamically appended to
	    route.matched.length === current.matched.length
	  ) {
	    this.ensureURL();
	    return abort()
	  }

	  var ref = resolveQueue(this.current.matched, route.matched);
	    var updated = ref.updated;
	    var deactivated = ref.deactivated;
	    var activated = ref.activated;

	  var queue = [].concat(
	    // in-component leave guards
	    extractLeaveGuards(deactivated),
	    // global before hooks
	    this.router.beforeHooks,
	    // in-component update hooks
	    extractUpdateHooks(updated),
	    // in-config enter guards
	    activated.map(function (m) { return m.beforeEnter; }),
	    // async components
	    resolveAsyncComponents(activated)
	  );

	  this.pending = route;
	  var iterator = function (hook, next) {
	    if (this$1.pending !== route) {
	      return abort()
	    }
	    try {
	      hook(route, current, function (to) {
	        if (to === false || isError(to)) {
	          // next(false) -> abort navigation, ensure current URL
	          this$1.ensureURL(true);
	          abort(to);
	        } else if (
	          typeof to === 'string' ||
	          (typeof to === 'object' && (
	            typeof to.path === 'string' ||
	            typeof to.name === 'string'
	          ))
	        ) {
	          // next('/') or next({ path: '/' }) -> redirect
	          abort();
	          if (typeof to === 'object' && to.replace) {
	            this$1.replace(to);
	          } else {
	            this$1.push(to);
	          }
	        } else {
	          // confirm transition and pass on the value
	          next(to);
	        }
	      });
	    } catch (e) {
	      abort(e);
	    }
	  };

	  runQueue(queue, iterator, function () {
	    var postEnterCbs = [];
	    var isValid = function () { return this$1.current === route; };
	    // wait until async components are resolved before
	    // extracting in-component enter guards
	    var enterGuards = extractEnterGuards(activated, postEnterCbs, isValid);
	    var queue = enterGuards.concat(this$1.router.resolveHooks);
	    runQueue(queue, iterator, function () {
	      if (this$1.pending !== route) {
	        return abort()
	      }
	      this$1.pending = null;
	      onComplete(route);
	      if (this$1.router.app) {
	        this$1.router.app.$nextTick(function () {
	          postEnterCbs.forEach(function (cb) { cb(); });
	        });
	      }
	    });
	  });
	};

	History.prototype.updateRoute = function updateRoute (route) {
	  var prev = this.current;
	  this.current = route;
	  this.cb && this.cb(route);
	  this.router.afterHooks.forEach(function (hook) {
	    hook && hook(route, prev);
	  });
	};

	function normalizeBase (base) {
	  if (!base) {
	    if (inBrowser) {
	      // respect <base> tag
	      var baseEl = document.querySelector('base');
	      base = (baseEl && baseEl.getAttribute('href')) || '/';
	      // strip full URL origin
	      base = base.replace(/^https?:\/\/[^\/]+/, '');
	    } else {
	      base = '/';
	    }
	  }
	  // make sure there's the starting slash
	  if (base.charAt(0) !== '/') {
	    base = '/' + base;
	  }
	  // remove trailing slash
	  return base.replace(/\/$/, '')
	}

	function resolveQueue (
	  current,
	  next
	) {
	  var i;
	  var max = Math.max(current.length, next.length);
	  for (i = 0; i < max; i++) {
	    if (current[i] !== next[i]) {
	      break
	    }
	  }
	  return {
	    updated: next.slice(0, i),
	    activated: next.slice(i),
	    deactivated: current.slice(i)
	  }
	}

	function extractGuards (
	  records,
	  name,
	  bind,
	  reverse
	) {
	  var guards = flatMapComponents(records, function (def, instance, match, key) {
	    var guard = extractGuard(def, name);
	    if (guard) {
	      return Array.isArray(guard)
	        ? guard.map(function (guard) { return bind(guard, instance, match, key); })
	        : bind(guard, instance, match, key)
	    }
	  });
	  return flatten(reverse ? guards.reverse() : guards)
	}

	function extractGuard (
	  def,
	  key
	) {
	  if (typeof def !== 'function') {
	    // extend now so that global mixins are applied.
	    def = _Vue.extend(def);
	  }
	  return def.options[key]
	}

	function extractLeaveGuards (deactivated) {
	  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
	}

	function extractUpdateHooks (updated) {
	  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
	}

	function bindGuard (guard, instance) {
	  if (instance) {
	    return function boundRouteGuard () {
	      return guard.apply(instance, arguments)
	    }
	  }
	}

	function extractEnterGuards (
	  activated,
	  cbs,
	  isValid
	) {
	  return extractGuards(activated, 'beforeRouteEnter', function (guard, _, match, key) {
	    return bindEnterGuard(guard, match, key, cbs, isValid)
	  })
	}

	function bindEnterGuard (
	  guard,
	  match,
	  key,
	  cbs,
	  isValid
	) {
	  return function routeEnterGuard (to, from, next) {
	    return guard(to, from, function (cb) {
	      next(cb);
	      if (typeof cb === 'function') {
	        cbs.push(function () {
	          // #750
	          // if a router-view is wrapped with an out-in transition,
	          // the instance may not have been registered at this time.
	          // we will need to poll for registration until current route
	          // is no longer valid.
	          poll(cb, match.instances, key, isValid);
	        });
	      }
	    })
	  }
	}

	function poll (
	  cb, // somehow flow cannot infer this is a function
	  instances,
	  key,
	  isValid
	) {
	  if (instances[key]) {
	    cb(instances[key]);
	  } else if (isValid()) {
	    setTimeout(function () {
	      poll(cb, instances, key, isValid);
	    }, 16);
	  }
	}

	/*  */


	var HTML5History = (function (History$$1) {
	  function HTML5History (router, base) {
	    var this$1 = this;

	    History$$1.call(this, router, base);

	    var expectScroll = router.options.scrollBehavior;

	    if (expectScroll) {
	      setupScroll();
	    }

	    var initLocation = getLocation(this.base);
	    window.addEventListener('popstate', function (e) {
	      var current = this$1.current;

	      // Avoiding first `popstate` event dispatched in some browsers but first
	      // history route not updated since async guard at the same time.
	      var location = getLocation(this$1.base);
	      if (this$1.current === START && location === initLocation) {
	        return
	      }

	      this$1.transitionTo(location, function (route) {
	        if (expectScroll) {
	          handleScroll(router, route, current, true);
	        }
	      });
	    });
	  }

	  if ( History$$1 ) HTML5History.__proto__ = History$$1;
	  HTML5History.prototype = Object.create( History$$1 && History$$1.prototype );
	  HTML5History.prototype.constructor = HTML5History;

	  HTML5History.prototype.go = function go (n) {
	    window.history.go(n);
	  };

	  HTML5History.prototype.push = function push (location, onComplete, onAbort) {
	    var this$1 = this;

	    var ref = this;
	    var fromRoute = ref.current;
	    this.transitionTo(location, function (route) {
	      pushState(cleanPath(this$1.base + route.fullPath));
	      handleScroll(this$1.router, route, fromRoute, false);
	      onComplete && onComplete(route);
	    }, onAbort);
	  };

	  HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
	    var this$1 = this;

	    var ref = this;
	    var fromRoute = ref.current;
	    this.transitionTo(location, function (route) {
	      replaceState(cleanPath(this$1.base + route.fullPath));
	      handleScroll(this$1.router, route, fromRoute, false);
	      onComplete && onComplete(route);
	    }, onAbort);
	  };

	  HTML5History.prototype.ensureURL = function ensureURL (push) {
	    if (getLocation(this.base) !== this.current.fullPath) {
	      var current = cleanPath(this.base + this.current.fullPath);
	      push ? pushState(current) : replaceState(current);
	    }
	  };

	  HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
	    return getLocation(this.base)
	  };

	  return HTML5History;
	}(History));

	function getLocation (base) {
	  var path = window.location.pathname;
	  if (base && path.indexOf(base) === 0) {
	    path = path.slice(base.length);
	  }
	  return (path || '/') + window.location.search + window.location.hash
	}

	/*  */


	var HashHistory = (function (History$$1) {
	  function HashHistory (router, base, fallback) {
	    History$$1.call(this, router, base);
	    // check history fallback deeplinking
	    if (fallback && checkFallback(this.base)) {
	      return
	    }
	    ensureSlash();
	  }

	  if ( History$$1 ) HashHistory.__proto__ = History$$1;
	  HashHistory.prototype = Object.create( History$$1 && History$$1.prototype );
	  HashHistory.prototype.constructor = HashHistory;

	  // this is delayed until the app mounts
	  // to avoid the hashchange listener being fired too early
	  HashHistory.prototype.setupListeners = function setupListeners () {
	    var this$1 = this;

	    var router = this.router;
	    var expectScroll = router.options.scrollBehavior;
	    var supportsScroll = supportsPushState && expectScroll;

	    if (supportsScroll) {
	      setupScroll();
	    }

	    window.addEventListener(supportsPushState ? 'popstate' : 'hashchange', function () {
	      var current = this$1.current;
	      if (!ensureSlash()) {
	        return
	      }
	      this$1.transitionTo(getHash(), function (route) {
	        if (supportsScroll) {
	          handleScroll(this$1.router, route, current, true);
	        }
	        if (!supportsPushState) {
	          replaceHash(route.fullPath);
	        }
	      });
	    });
	  };

	  HashHistory.prototype.push = function push (location, onComplete, onAbort) {
	    var this$1 = this;

	    var ref = this;
	    var fromRoute = ref.current;
	    this.transitionTo(location, function (route) {
	      pushHash(route.fullPath);
	      handleScroll(this$1.router, route, fromRoute, false);
	      onComplete && onComplete(route);
	    }, onAbort);
	  };

	  HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
	    var this$1 = this;

	    var ref = this;
	    var fromRoute = ref.current;
	    this.transitionTo(location, function (route) {
	      replaceHash(route.fullPath);
	      handleScroll(this$1.router, route, fromRoute, false);
	      onComplete && onComplete(route);
	    }, onAbort);
	  };

	  HashHistory.prototype.go = function go (n) {
	    window.history.go(n);
	  };

	  HashHistory.prototype.ensureURL = function ensureURL (push) {
	    var current = this.current.fullPath;
	    if (getHash() !== current) {
	      push ? pushHash(current) : replaceHash(current);
	    }
	  };

	  HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
	    return getHash()
	  };

	  return HashHistory;
	}(History));

	function checkFallback (base) {
	  var location = getLocation(base);
	  if (!/^\/#/.test(location)) {
	    window.location.replace(
	      cleanPath(base + '/#' + location)
	    );
	    return true
	  }
	}

	function ensureSlash () {
	  var path = getHash();
	  if (path.charAt(0) === '/') {
	    return true
	  }
	  replaceHash('/' + path);
	  return false
	}

	function getHash () {
	  // We can't use window.location.hash here because it's not
	  // consistent across browsers - Firefox will pre-decode it!
	  var href = window.location.href;
	  var index = href.indexOf('#');
	  return index === -1 ? '' : href.slice(index + 1)
	}

	function getUrl (path) {
	  var href = window.location.href;
	  var i = href.indexOf('#');
	  var base = i >= 0 ? href.slice(0, i) : href;
	  return (base + "#" + path)
	}

	function pushHash (path) {
	  if (supportsPushState) {
	    pushState(getUrl(path));
	  } else {
	    window.location.hash = path;
	  }
	}

	function replaceHash (path) {
	  if (supportsPushState) {
	    replaceState(getUrl(path));
	  } else {
	    window.location.replace(getUrl(path));
	  }
	}

	/*  */


	var AbstractHistory = (function (History$$1) {
	  function AbstractHistory (router, base) {
	    History$$1.call(this, router, base);
	    this.stack = [];
	    this.index = -1;
	  }

	  if ( History$$1 ) AbstractHistory.__proto__ = History$$1;
	  AbstractHistory.prototype = Object.create( History$$1 && History$$1.prototype );
	  AbstractHistory.prototype.constructor = AbstractHistory;

	  AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
	    var this$1 = this;

	    this.transitionTo(location, function (route) {
	      this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
	      this$1.index++;
	      onComplete && onComplete(route);
	    }, onAbort);
	  };

	  AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
	    var this$1 = this;

	    this.transitionTo(location, function (route) {
	      this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
	      onComplete && onComplete(route);
	    }, onAbort);
	  };

	  AbstractHistory.prototype.go = function go (n) {
	    var this$1 = this;

	    var targetIndex = this.index + n;
	    if (targetIndex < 0 || targetIndex >= this.stack.length) {
	      return
	    }
	    var route = this.stack[targetIndex];
	    this.confirmTransition(route, function () {
	      this$1.index = targetIndex;
	      this$1.updateRoute(route);
	    });
	  };

	  AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
	    var current = this.stack[this.stack.length - 1];
	    return current ? current.fullPath : '/'
	  };

	  AbstractHistory.prototype.ensureURL = function ensureURL () {
	    // noop
	  };

	  return AbstractHistory;
	}(History));

	/*  */

	var VueRouter = function VueRouter (options) {
	  if ( options === void 0 ) options = {};

	  this.app = null;
	  this.apps = [];
	  this.options = options;
	  this.beforeHooks = [];
	  this.resolveHooks = [];
	  this.afterHooks = [];
	  this.matcher = createMatcher(options.routes || [], this);

	  var mode = options.mode || 'hash';
	  this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false;
	  if (this.fallback) {
	    mode = 'hash';
	  }
	  if (!inBrowser) {
	    mode = 'abstract';
	  }
	  this.mode = mode;

	  switch (mode) {
	    case 'history':
	      this.history = new HTML5History(this, options.base);
	      break
	    case 'hash':
	      this.history = new HashHistory(this, options.base, this.fallback);
	      break
	    case 'abstract':
	      this.history = new AbstractHistory(this, options.base);
	      break
	    default:
	      if (false) {
	        assert(false, ("invalid mode: " + mode));
	      }
	  }
	};

	var prototypeAccessors = { currentRoute: { configurable: true } };

	VueRouter.prototype.match = function match (
	  raw,
	  current,
	  redirectedFrom
	) {
	  return this.matcher.match(raw, current, redirectedFrom)
	};

	prototypeAccessors.currentRoute.get = function () {
	  return this.history && this.history.current
	};

	VueRouter.prototype.init = function init (app /* Vue component instance */) {
	    var this$1 = this;

	  ("production") !== 'production' && assert(
	    install.installed,
	    "not installed. Make sure to call `Vue.use(VueRouter)` " +
	    "before creating root instance."
	  );

	  this.apps.push(app);

	  // main app already initialized.
	  if (this.app) {
	    return
	  }

	  this.app = app;

	  var history = this.history;

	  if (history instanceof HTML5History) {
	    history.transitionTo(history.getCurrentLocation());
	  } else if (history instanceof HashHistory) {
	    var setupHashListener = function () {
	      history.setupListeners();
	    };
	    history.transitionTo(
	      history.getCurrentLocation(),
	      setupHashListener,
	      setupHashListener
	    );
	  }

	  history.listen(function (route) {
	    this$1.apps.forEach(function (app) {
	      app._route = route;
	    });
	  });
	};

	VueRouter.prototype.beforeEach = function beforeEach (fn) {
	  return registerHook(this.beforeHooks, fn)
	};

	VueRouter.prototype.beforeResolve = function beforeResolve (fn) {
	  return registerHook(this.resolveHooks, fn)
	};

	VueRouter.prototype.afterEach = function afterEach (fn) {
	  return registerHook(this.afterHooks, fn)
	};

	VueRouter.prototype.onReady = function onReady (cb, errorCb) {
	  this.history.onReady(cb, errorCb);
	};

	VueRouter.prototype.onError = function onError (errorCb) {
	  this.history.onError(errorCb);
	};

	VueRouter.prototype.push = function push (location, onComplete, onAbort) {
	  this.history.push(location, onComplete, onAbort);
	};

	VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
	  this.history.replace(location, onComplete, onAbort);
	};

	VueRouter.prototype.go = function go (n) {
	  this.history.go(n);
	};

	VueRouter.prototype.back = function back () {
	  this.go(-1);
	};

	VueRouter.prototype.forward = function forward () {
	  this.go(1);
	};

	VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
	  var route = to
	    ? to.matched
	      ? to
	      : this.resolve(to).route
	    : this.currentRoute;
	  if (!route) {
	    return []
	  }
	  return [].concat.apply([], route.matched.map(function (m) {
	    return Object.keys(m.components).map(function (key) {
	      return m.components[key]
	    })
	  }))
	};

	VueRouter.prototype.resolve = function resolve (
	  to,
	  current,
	  append
	) {
	  var location = normalizeLocation(
	    to,
	    current || this.history.current,
	    append,
	    this
	  );
	  var route = this.match(location, current);
	  var fullPath = route.redirectedFrom || route.fullPath;
	  var base = this.history.base;
	  var href = createHref(base, fullPath, this.mode);
	  return {
	    location: location,
	    route: route,
	    href: href,
	    // for backwards compat
	    normalizedTo: location,
	    resolved: route
	  }
	};

	VueRouter.prototype.addRoutes = function addRoutes (routes) {
	  this.matcher.addRoutes(routes);
	  if (this.history.current !== START) {
	    this.history.transitionTo(this.history.getCurrentLocation());
	  }
	};

	Object.defineProperties( VueRouter.prototype, prototypeAccessors );

	function registerHook (list, fn) {
	  list.push(fn);
	  return function () {
	    var i = list.indexOf(fn);
	    if (i > -1) { list.splice(i, 1); }
	  }
	}

	function createHref (base, fullPath, mode) {
	  var path = mode === 'hash' ? '#' + fullPath : fullPath;
	  return base ? cleanPath(base + '/' + path) : path
	}

	VueRouter.install = install;
	VueRouter.version = '2.8.1';

	if (inBrowser && window.Vue) {
	  window.Vue.use(VueRouter);
	}

	module.exports = VueRouter;


/***/ }),

/***/ 187:
/***/ (function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory(__webpack_require__(148));
		else if(typeof define === 'function' && define.amd)
			define("vant", ["vue"], factory);
		else if(typeof exports === 'object')
			exports["vant"] = factory(require("vue"));
		else
			root["vant"] = factory(root["Vue"]);
	})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_7__) {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId]) {
	/******/ 			return installedModules[moduleId].exports;
	/******/ 		}
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			i: moduleId,
	/******/ 			l: false,
	/******/ 			exports: {}
	/******/ 		};
	/******/
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	/******/
	/******/ 		// Flag the module as loaded
	/******/ 		module.l = true;
	/******/
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/
	/******/
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	/******/
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	/******/
	/******/ 	// define getter function for harmony exports
	/******/ 	__webpack_require__.d = function(exports, name, getter) {
	/******/ 		if(!__webpack_require__.o(exports, name)) {
	/******/ 			Object.defineProperty(exports, name, {
	/******/ 				configurable: false,
	/******/ 				enumerable: true,
	/******/ 				get: getter
	/******/ 			});
	/******/ 		}
	/******/ 	};
	/******/
	/******/ 	// getDefaultExport function for compatibility with non-harmony modules
	/******/ 	__webpack_require__.n = function(module) {
	/******/ 		var getter = module && module.__esModule ?
	/******/ 			function getDefault() { return module['default']; } :
	/******/ 			function getModuleExports() { return module; };
	/******/ 		__webpack_require__.d(getter, 'a', getter);
	/******/ 		return getter;
	/******/ 	};
	/******/
	/******/ 	// Object.prototype.hasOwnProperty.call
	/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
	/******/
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	/******/
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(__webpack_require__.s = 63);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ (function(module, exports) {

	/* globals __VUE_SSR_CONTEXT__ */

	// IMPORTANT: Do NOT use ES2015 features in this file.
	// This module is a runtime utility for cleaner component module output and will
	// be included in the final webpack user bundle.

	module.exports = function normalizeComponent (
	  rawScriptExports,
	  compiledTemplate,
	  functionalTemplate,
	  injectStyles,
	  scopeId,
	  moduleIdentifier /* server only */
	) {
	  var esModule
	  var scriptExports = rawScriptExports = rawScriptExports || {}

	  // ES6 modules interop
	  var type = typeof rawScriptExports.default
	  if (type === 'object' || type === 'function') {
	    esModule = rawScriptExports
	    scriptExports = rawScriptExports.default
	  }

	  // Vue.extend constructor export interop
	  var options = typeof scriptExports === 'function'
	    ? scriptExports.options
	    : scriptExports

	  // render functions
	  if (compiledTemplate) {
	    options.render = compiledTemplate.render
	    options.staticRenderFns = compiledTemplate.staticRenderFns
	    options._compiled = true
	  }

	  // functional template
	  if (functionalTemplate) {
	    options.functional = true
	  }

	  // scopedId
	  if (scopeId) {
	    options._scopeId = scopeId
	  }

	  var hook
	  if (moduleIdentifier) { // server build
	    hook = function (context) {
	      // 2.3 injection
	      context =
	        context || // cached call
	        (this.$vnode && this.$vnode.ssrContext) || // stateful
	        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
	      // 2.2 with runInNewContext: true
	      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
	        context = __VUE_SSR_CONTEXT__
	      }
	      // inject component styles
	      if (injectStyles) {
	        injectStyles.call(this, context)
	      }
	      // register component module identifier for async chunk inferrence
	      if (context && context._registeredComponents) {
	        context._registeredComponents.add(moduleIdentifier)
	      }
	    }
	    // used by ssr in case component is cached and beforeCreate
	    // never gets called
	    options._ssrRegister = hook
	  } else if (injectStyles) {
	    hook = injectStyles
	  }

	  if (hook) {
	    var functional = options.functional
	    var existing = functional
	      ? options.render
	      : options.beforeCreate

	    if (!functional) {
	      // inject component registration as beforeCreate hook
	      options.beforeCreate = existing
	        ? [].concat(existing, hook)
	        : [hook]
	    } else {
	      // for template-only hot-reload because in that case the render fn doesn't
	      // go through the normalizer
	      options._injectStyles = hook
	      // register for functioal component in vue file
	      options.render = function renderWithStyleInjection (h, context) {
	        hook.call(context)
	        return existing(h, context)
	      }
	    }
	  }

	  return {
	    esModule: esModule,
	    exports: scriptExports,
	    options: options
	  }
	}


	/***/ }),
	/* 1 */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {

	"use strict";

	// EXTERNAL MODULE: external {"root":"Vue","commonjs":"vue","commonjs2":"vue","amd":"vue"}
	var external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue__ = __webpack_require__(7);
	var external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default = /*#__PURE__*/__webpack_require__.n(external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue__);

	// EXTERNAL MODULE: ./packages/locale/index.js + 1 modules
	var locale = __webpack_require__(41);

	// EXTERNAL MODULE: ./packages/icon/index.vue + 2 modules
	var icon = __webpack_require__(55);

	// CONCATENATED MODULE: ./packages/mixins/i18n.js
	// component mixin


	/* harmony default export */ var i18n = ({
	  computed: {
	    $t: function $t() {
	      var name = this.$options.name;

	      var prefix = name ? camelize(name) + '.' : '';
	      var messages = this.$vantMessages[this.$vantLang];

	      return function (path) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	          args[_key - 1] = arguments[_key];
	        }

	        var message = get(messages, prefix + path) || get(messages, path);
	        return typeof message === 'function' ? message.apply(null, args) : message;
	      };
	    }
	  }
	});
	// EXTERNAL MODULE: ./packages/utils/install.js
	var install = __webpack_require__(39);

	// EXTERNAL MODULE: ./packages/loading/index.vue + 2 modules
	var loading = __webpack_require__(56);

	// CONCATENATED MODULE: ./packages/utils/create.js
	/**
	 * Create a component with common options
	 */






	/* harmony default export */ var create = (function (sfc) {
	  sfc.mixins = sfc.mixins || [];
	  sfc.components = sfc.components || {};
	  sfc.install = sfc.install || install["a" /* default */];
	  sfc.mixins.push(i18n);
	  sfc.components.icon = icon["a" /* default */];
	  sfc.components.loading = loading["a" /* default */];

	  return sfc;
	});;
	// CONCATENATED MODULE: ./packages/utils/index.js
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return get; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return isDef; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return isServer; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return camelize; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return isAndroid; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "b", function() { return create; });



	var isServer = external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.prototype.$isServer;

	function isDef(value) {
	  return value !== undefined && value !== null;
	}

	function get(object, path) {
	  var keys = path.split('.');
	  var result = object;

	  keys.forEach(function (key) {
	    result = isDef(result[key]) ? result[key] : '';
	  });

	  return result;
	}

	var camelizeRE = /-(\w)/g;
	function camelize(str) {
	  return str.replace(camelizeRE, function (_, c) {
	    return c.toUpperCase();
	  });
	}

	function isAndroid() {
	  /* istanbul ignore next */
	  return isServer ? false : /android/.test(navigator.userAgent.toLowerCase());
	}



	/***/ }),
	/* 2 */
	/***/ (function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


	/***/ }),
	/* 3 */
	/***/ (function(module, exports) {

	var core = module.exports = { version: '2.5.1' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


	/***/ }),
	/* 4 */
	/***/ (function(module, exports, __webpack_require__) {

	var store = __webpack_require__(33)('wks');
	var uid = __webpack_require__(25);
	var Symbol = __webpack_require__(2).Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;


	/***/ }),
	/* 5 */
	/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(2);
	var core = __webpack_require__(3);
	var ctx = __webpack_require__(22);
	var hide = __webpack_require__(8);
	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var IS_WRAP = type & $export.W;
	  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
	  var expProto = exports[PROTOTYPE];
	  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
	  var key, own, out;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if (own && key in exports) continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function (C) {
	      var F = function (a, b, c) {
	        if (this instanceof C) {
	          switch (arguments.length) {
	            case 0: return new C();
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if (IS_PROTO) {
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	module.exports = $export;


	/***/ }),
	/* 6 */
	/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(13);
	module.exports = function (it) {
	  if (!isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};


	/***/ }),
	/* 7 */
	/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

	/***/ }),
	/* 8 */
	/***/ (function(module, exports, __webpack_require__) {

	var dP = __webpack_require__(9);
	var createDesc = __webpack_require__(24);
	module.exports = __webpack_require__(10) ? function (object, key, value) {
	  return dP.f(object, key, createDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};


	/***/ }),
	/* 9 */
	/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(6);
	var IE8_DOM_DEFINE = __webpack_require__(45);
	var toPrimitive = __webpack_require__(31);
	var dP = Object.defineProperty;

	exports.f = __webpack_require__(10) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};


	/***/ }),
	/* 10 */
	/***/ (function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(14)(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});


	/***/ }),
	/* 11 */
	/***/ (function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};


	/***/ }),
	/* 12 */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(85), __esModule: true };

	/***/ }),
	/* 13 */
	/***/ (function(module, exports) {

	module.exports = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};


	/***/ }),
	/* 14 */
	/***/ (function(module, exports) {

	module.exports = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};


	/***/ }),
	/* 15 */
	/***/ (function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(49);
	var defined = __webpack_require__(29);
	module.exports = function (it) {
	  return IObject(defined(it));
	};


	/***/ }),
	/* 16 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";


	exports.__esModule = true;

	var _assign = __webpack_require__(12);

	var _assign2 = _interopRequireDefault(_assign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _assign2.default || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	/***/ }),
	/* 17 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";


	exports.__esModule = true;

	var _iterator = __webpack_require__(64);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(75);

	var _symbol2 = _interopRequireDefault(_symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

	/***/ }),
	/* 18 */
	/***/ (function(module, exports) {

	module.exports = {};


	/***/ }),
	/* 19 */
	/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys = __webpack_require__(48);
	var enumBugKeys = __webpack_require__(34);

	module.exports = Object.keys || function keys(O) {
	  return $keys(O, enumBugKeys);
	};


	/***/ }),
	/* 20 */
	/***/ (function(module, exports) {

	var toString = {}.toString;

	module.exports = function (it) {
	  return toString.call(it).slice(8, -1);
	};


	/***/ }),
	/* 21 */
	/***/ (function(module, exports) {

	module.exports = true;


	/***/ }),
	/* 22 */
	/***/ (function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(23);
	module.exports = function (fn, that, length) {
	  aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};


	/***/ }),
	/* 23 */
	/***/ (function(module, exports) {

	module.exports = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};


	/***/ }),
	/* 24 */
	/***/ (function(module, exports) {

	module.exports = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};


	/***/ }),
	/* 25 */
	/***/ (function(module, exports) {

	var id = 0;
	var px = Math.random();
	module.exports = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};


	/***/ }),
	/* 26 */
	/***/ (function(module, exports, __webpack_require__) {

	var def = __webpack_require__(9).f;
	var has = __webpack_require__(11);
	var TAG = __webpack_require__(4)('toStringTag');

	module.exports = function (it, tag, stat) {
	  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
	};


	/***/ }),
	/* 27 */
	/***/ (function(module, exports) {

	exports.f = {}.propertyIsEnumerable;


	/***/ }),
	/* 28 */
	/***/ (function(module, exports) {

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	module.exports = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};


	/***/ }),
	/* 29 */
	/***/ (function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};


	/***/ }),
	/* 30 */
	/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(13);
	var document = __webpack_require__(2).document;
	// typeof document.createElement is 'object' in old IE
	var is = isObject(document) && isObject(document.createElement);
	module.exports = function (it) {
	  return is ? document.createElement(it) : {};
	};


	/***/ }),
	/* 31 */
	/***/ (function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(13);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function (it, S) {
	  if (!isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};


	/***/ }),
	/* 32 */
	/***/ (function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(33)('keys');
	var uid = __webpack_require__(25);
	module.exports = function (key) {
	  return shared[key] || (shared[key] = uid(key));
	};


	/***/ }),
	/* 33 */
	/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(2);
	var SHARED = '__core-js_shared__';
	var store = global[SHARED] || (global[SHARED] = {});
	module.exports = function (key) {
	  return store[key] || (store[key] = {});
	};


	/***/ }),
	/* 34 */
	/***/ (function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');


	/***/ }),
	/* 35 */
	/***/ (function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(29);
	module.exports = function (it) {
	  return Object(defined(it));
	};


	/***/ }),
	/* 36 */
	/***/ (function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(4);


	/***/ }),
	/* 37 */
	/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(2);
	var core = __webpack_require__(3);
	var LIBRARY = __webpack_require__(21);
	var wksExt = __webpack_require__(36);
	var defineProperty = __webpack_require__(9).f;
	module.exports = function (name) {
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
	};


	/***/ }),
	/* 38 */
	/***/ (function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;


	/***/ }),
	/* 39 */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {

	"use strict";
	/**
	 * Install function to register a component
	 */
	/* harmony default export */ __webpack_exports__["a"] = (function (Vue) {
	  Vue.component(this.name, this);
	});

	/***/ }),
	/* 40 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	// 25.4.1.5 NewPromiseCapability(C)
	var aFunction = __webpack_require__(23);

	function PromiseCapability(C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject = aFunction(reject);
	}

	module.exports.f = function (C) {
	  return new PromiseCapability(C);
	};


	/***/ }),
	/* 41 */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {

	"use strict";

	// EXTERNAL MODULE: external {"root":"Vue","commonjs":"vue","commonjs2":"vue","amd":"vue"}
	var external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue__ = __webpack_require__(7);
	var external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default = /*#__PURE__*/__webpack_require__.n(external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue__);

	// EXTERNAL MODULE: ./packages/utils/deep-assign.js
	var deep_assign = __webpack_require__(42);

	// CONCATENATED MODULE: ./packages/locale/lang/zh-CN.js
	/* harmony default export */ var zh_CN = ({
	  confirm: '确认',
	  cancel: '取消',
	  save: '保存',
	  complete: '完成',
	  vanAddressEdit: {
	    areaTitle: '收件地区',
	    addressText: '收货',
	    areaWrong: '请选择正确的收件地区',
	    areaEmpty: '请选择收件地区',
	    nameEmpty: '请填写名字',
	    nameOverlimit: '名字过长，请重新输入',
	    telWrong: '请填写正确的手机号码或电话号码',
	    addressOverlimit: '详细地址不能超过200个字符',
	    addressEmpty: '请填写详细地址',
	    postalEmpty: '邮政编码格式不正确',
	    defaultAddress: function defaultAddress(text) {
	      return '\u8BBE\u4E3A\u9ED8\u8BA4' + text + '\u5730\u5740';
	    },
	    deleteAddress: function deleteAddress(text) {
	      return '\u5220\u9664' + text + '\u5730\u5740';
	    },
	    confirmDelete: function confirmDelete(text) {
	      return '\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A' + text + '\u5730\u5740\u4E48';
	    },
	    label: {
	      name: function name(text) {
	        return text + '\u4EBA';
	      },
	      tel: '联系电话',
	      postal: '邮政编码'
	    },
	    placeholder: {
	      name: '名字',
	      tel: '手机或固定电话',
	      postal: '邮政编码(选填)',
	      province: '选择省',
	      city: '选择市',
	      county: '选择区'
	    }
	  },
	  vanAddressEditDetail: {
	    label: {
	      address: '详细地址'
	    },
	    placeholder: {
	      address: '如街道、楼层、门牌号等'
	    }
	  },
	  vanContactCard: {
	    name: '联系人',
	    tel: '联系电话',
	    addText: '添加订单联系人信息'
	  },
	  vanContactList: {
	    name: '联系人',
	    tel: '联系电话',
	    addText: '新建联系人'
	  },
	  vanContactEdit: {
	    name: '联系人',
	    namePlaceholder: '名字',
	    nameEmpty: '请填写名字',
	    nameOverlimit: '名字过长，请重新输入',
	    tel: '联系电话',
	    telPlaceholder: '手机或固定电话',
	    telInvalid: '请填写正确的手机号码或电话号码',
	    save: '保存',
	    delete: '删除联系人',
	    confirmDelete: '确定要删除这个联系人么'
	  },
	  vanPicker: {
	    confirm: '完成'
	  },
	  vanPagination: {
	    prev: '上一页',
	    next: '下一页'
	  },
	  vanPullRefresh: {
	    pullingText: '下拉即可刷新...',
	    loosingText: '释放即可刷新...',
	    loadingText: '加载中...'
	  },
	  vanSubmitBar: {
	    label: '合计：'
	  }
	});
	// CONCATENATED MODULE: ./packages/locale/index.js




	var proto = external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.prototype;
	var defaultLang = 'zh-CN';
	var locale = {
	  init: function init() {
	    var _Vue$util$defineReact;

	    external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.util.defineReactive(proto, '$vantLang', defaultLang);
	    external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.util.defineReactive(proto, '$vantMessages', (_Vue$util$defineReact = {}, _Vue$util$defineReact[defaultLang] = zh_CN, _Vue$util$defineReact));
	  },
	  use: function use(lang, messages) {
	    var _add;

	    proto.$vantLang = lang;
	    this.add((_add = {}, _add[lang] = messages, _add));
	  },
	  add: function add() {
	    var messages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    Object(deep_assign["a" /* default */])(proto.$vantMessages, messages);
	  }
	};

	locale.init();
	/* harmony default export */ var packages_locale = __webpack_exports__["a"] = (locale);

	/***/ }),
	/* 42 */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {

	"use strict";
	/* harmony export (immutable) */ __webpack_exports__["a"] = assign;
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof__ = __webpack_require__(17);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof__);
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1____ = __webpack_require__(1);



	var hasOwnProperty = Object.prototype.hasOwnProperty;


	function isObj(x) {
	  var type = typeof x === 'undefined' ? 'undefined' : __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof___default()(x);
	  return x !== null && (type === 'object' || type === 'function');
	}

	function assignKey(to, from, key) {
	  var val = from[key];

	  if (!Object(__WEBPACK_IMPORTED_MODULE_1____["e" /* isDef */])(val) || hasOwnProperty.call(to, key) && !Object(__WEBPACK_IMPORTED_MODULE_1____["e" /* isDef */])(to[key])) {
	    return;
	  }

	  if (!hasOwnProperty.call(to, key) || !isObj(val)) {
	    to[key] = val;
	  } else {
	    to[key] = assign(Object(to[key]), from[key]);
	  }
	}

	function assign(to, from) {
	  for (var key in from) {
	    if (hasOwnProperty.call(from, key)) {
	      assignKey(to, from, key);
	    }
	  }
	  return to;
	}

	/***/ }),
	/* 43 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var $at = __webpack_require__(66)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(44)(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var index = this._i;
	  var point;
	  if (index >= O.length) return { value: undefined, done: true };
	  point = $at(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});


	/***/ }),
	/* 44 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var LIBRARY = __webpack_require__(21);
	var $export = __webpack_require__(5);
	var redefine = __webpack_require__(46);
	var hide = __webpack_require__(8);
	var has = __webpack_require__(11);
	var Iterators = __webpack_require__(18);
	var $iterCreate = __webpack_require__(67);
	var setToStringTag = __webpack_require__(26);
	var getPrototypeOf = __webpack_require__(71);
	var ITERATOR = __webpack_require__(4)('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};


	/***/ }),
	/* 45 */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(10) && !__webpack_require__(14)(function () {
	  return Object.defineProperty(__webpack_require__(30)('div'), 'a', { get: function () { return 7; } }).a != 7;
	});


	/***/ }),
	/* 46 */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(8);


	/***/ }),
	/* 47 */
	/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject = __webpack_require__(6);
	var dPs = __webpack_require__(68);
	var enumBugKeys = __webpack_require__(34);
	var IE_PROTO = __webpack_require__(32)('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(30)('iframe');
	  var i = enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(51).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


	/***/ }),
	/* 48 */
	/***/ (function(module, exports, __webpack_require__) {

	var has = __webpack_require__(11);
	var toIObject = __webpack_require__(15);
	var arrayIndexOf = __webpack_require__(69)(false);
	var IE_PROTO = __webpack_require__(32)('IE_PROTO');

	module.exports = function (object, names) {
	  var O = toIObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};


	/***/ }),
	/* 49 */
	/***/ (function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(20);
	// eslint-disable-next-line no-prototype-builtins
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};


	/***/ }),
	/* 50 */
	/***/ (function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(28);
	var min = Math.min;
	module.exports = function (it) {
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};


	/***/ }),
	/* 51 */
	/***/ (function(module, exports, __webpack_require__) {

	var document = __webpack_require__(2).document;
	module.exports = document && document.documentElement;


	/***/ }),
	/* 52 */
	/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(72);
	var global = __webpack_require__(2);
	var hide = __webpack_require__(8);
	var Iterators = __webpack_require__(18);
	var TO_STRING_TAG = __webpack_require__(4)('toStringTag');

	var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
	  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
	  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
	  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
	  'TextTrackList,TouchList').split(',');

	for (var i = 0; i < DOMIterables.length; i++) {
	  var NAME = DOMIterables[i];
	  var Collection = global[NAME];
	  var proto = Collection && Collection.prototype;
	  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}


	/***/ }),
	/* 53 */
	/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys = __webpack_require__(48);
	var hiddenKeys = __webpack_require__(34).concat('length', 'prototype');

	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return $keys(O, hiddenKeys);
	};


	/***/ }),
	/* 54 */
	/***/ (function(module, exports) {



	/***/ }),
	/* 55 */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {

	"use strict";

	// EXTERNAL MODULE: ./packages/utils/install.js
	var install = __webpack_require__(39);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/icon/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var icon = ({
	  install: install["a" /* default */],
	  name: 'van-icon',
	  props: {
	    name: String
	  }
	});
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-217f3bcc","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/icon/index.vue
	var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('i',_vm._g({staticClass:"van-icon",class:("van-icon-" + _vm.name)},_vm.$listeners),[_vm._t("default")],2)}
	var staticRenderFns = []
	var esExports = { render: render, staticRenderFns: staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_icon = (esExports);
	// CONCATENATED MODULE: ./packages/icon/index.vue
	var normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var __vue_template_functional__ = false
	/* styles */
	var __vue_styles__ = null
	/* scopeId */
	var __vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var __vue_module_identifier__ = null
	var Component = normalizeComponent(
	  icon,
	  selectortype_template_index_0_packages_icon,
	  __vue_template_functional__,
	  __vue_styles__,
	  __vue_scopeId__,
	  __vue_module_identifier__
	)

	/* harmony default export */ var packages_icon = __webpack_exports__["a"] = (Component.exports);


	/***/ }),
	/* 56 */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {

	"use strict";

	// EXTERNAL MODULE: ./packages/utils/install.js
	var install = __webpack_require__(39);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/loading/index.vue
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var loading = ({
	  install: install["a" /* default */],
	  name: 'van-loading',
	  props: {
	    type: {
	      type: String,
	      default: 'gradient-circle'
	    },
	    color: {
	      type: String,
	      default: 'black'
	    }
	  }
	});
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-d9c560b8","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/loading/index.vue
	var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-loading",class:['van-loading--' + _vm.type, 'van-loading--' + _vm.color]},[_c('span',{staticClass:"van-loading__spinner",class:['van-loading__spinner--' + _vm.type, 'van-loading__spinner--' + _vm.color]},_vm._l((12),function(item){return (_vm.type === 'spinner')?_c('i'):_vm._e()}))])}
	var staticRenderFns = []
	var esExports = { render: render, staticRenderFns: staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_loading = (esExports);
	// CONCATENATED MODULE: ./packages/loading/index.vue
	var normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var __vue_template_functional__ = false
	/* styles */
	var __vue_styles__ = null
	/* scopeId */
	var __vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var __vue_module_identifier__ = null
	var Component = normalizeComponent(
	  loading,
	  selectortype_template_index_0_packages_loading,
	  __vue_template_functional__,
	  __vue_styles__,
	  __vue_scopeId__,
	  __vue_module_identifier__
	)

	/* harmony default export */ var packages_loading = __webpack_exports__["a"] = (Component.exports);


	/***/ }),
	/* 57 */
	/***/ (function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(20);
	var TAG = __webpack_require__(4)('toStringTag');
	// ES3 wrong here
	var ARG = cof(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (e) { /* empty */ }
	};

	module.exports = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};


	/***/ }),
	/* 58 */
	/***/ (function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject = __webpack_require__(6);
	var aFunction = __webpack_require__(23);
	var SPECIES = __webpack_require__(4)('species');
	module.exports = function (O, D) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};


	/***/ }),
	/* 59 */
	/***/ (function(module, exports, __webpack_require__) {

	var ctx = __webpack_require__(22);
	var invoke = __webpack_require__(96);
	var html = __webpack_require__(51);
	var cel = __webpack_require__(30);
	var global = __webpack_require__(2);
	var process = global.process;
	var setTask = global.setImmediate;
	var clearTask = global.clearImmediate;
	var MessageChannel = global.MessageChannel;
	var Dispatch = global.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;
	var run = function () {
	  var id = +this;
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function (event) {
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!setTask || !clearTask) {
	  setTask = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (__webpack_require__(20)(process) == 'process') {
	    defer = function (id) {
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if (MessageChannel) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
	    defer = function (id) {
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in cel('script')) {
	    defer = function (id) {
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set: setTask,
	  clear: clearTask
	};


	/***/ }),
	/* 60 */
	/***/ (function(module, exports) {

	module.exports = function (exec) {
	  try {
	    return { e: false, v: exec() };
	  } catch (e) {
	    return { e: true, v: e };
	  }
	};


	/***/ }),
	/* 61 */
	/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(6);
	var isObject = __webpack_require__(13);
	var newPromiseCapability = __webpack_require__(40);

	module.exports = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};


	/***/ }),
	/* 62 */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(109), __esModule: true };

	/***/ }),
	/* 63 */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {

	"use strict";
	Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

	// EXTERNAL MODULE: ./packages/utils/index.js + 2 modules
	var utils = __webpack_require__(1);

	// EXTERNAL MODULE: ./node_modules/babel-runtime/helpers/extends.js
	var helpers_extends = __webpack_require__(16);
	var extends_default = /*#__PURE__*/__webpack_require__.n(helpers_extends);

	// EXTERNAL MODULE: ./node_modules/babel-runtime/core-js/object/assign.js
	var object_assign = __webpack_require__(12);
	var assign_default = /*#__PURE__*/__webpack_require__.n(object_assign);

	// EXTERNAL MODULE: external {"root":"Vue","commonjs":"vue","commonjs2":"vue","amd":"vue"}
	var external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue__ = __webpack_require__(7);
	var external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default = /*#__PURE__*/__webpack_require__.n(external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue__);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/mixins/popup/Modal.vue

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//

	/* harmony default export */ var Modal = ({
	  name: 'van-modal',

	  props: {
	    visible: Boolean,
	    zIndex: Number,
	    className: String,
	    customStyle: Object
	  },

	  computed: {
	    style: function style() {
	      return extends_default()({
	        zIndex: this.zIndex
	      }, this.customStyle);
	    }
	  }
	});
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-4183c5b2","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/mixins/popup/Modal.vue
	var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition',{attrs:{"name":"van-fade"}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.visible),expression:"visible"}],staticClass:"van-modal",class:_vm.className,style:(_vm.style),on:{"touchmove":function($event){$event.preventDefault();$event.stopPropagation();},"click":function($event){_vm.$emit('click', $event)}}})])}
	var staticRenderFns = []
	var esExports = { render: render, staticRenderFns: staticRenderFns }
	/* harmony default export */ var popup_Modal = (esExports);
	// CONCATENATED MODULE: ./packages/mixins/popup/Modal.vue
	var normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var __vue_template_functional__ = false
	/* styles */
	var __vue_styles__ = null
	/* scopeId */
	var __vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var __vue_module_identifier__ = null
	var Component = normalizeComponent(
	  Modal,
	  popup_Modal,
	  __vue_template_functional__,
	  __vue_styles__,
	  __vue_scopeId__,
	  __vue_module_identifier__
	)

	/* harmony default export */ var mixins_popup_Modal = (Component.exports);

	// CONCATENATED MODULE: ./packages/mixins/popup/popup-context.js
	var PopupContext = {
	  idSeed: 1,
	  zIndex: 2000,
	  instances: {},
	  stack: [],

	  plusKeyByOne: function plusKeyByOne(key) {
	    return this[key]++;
	  },


	  get top() {
	    return this.stack[this.stack.length - 1];
	  }
	};

	/* harmony default export */ var popup_context = (PopupContext);
	// CONCATENATED MODULE: ./packages/mixins/popup/popup-manager.js






	var modalDefaultConfig = {
	  className: '',
	  customStyle: {}
	};

	var PopupManager = {
	  getModal: function getModal() {
	    var modal = popup_context.modal;


	    if (!modal) {
	      var ModalConstructor = external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.extend(mixins_popup_Modal);
	      modal = new ModalConstructor({
	        el: document.createElement('div')
	      });
	      modal.$on('click', function () {
	        PopupManager.handleOverlayClick();
	      });

	      popup_context.modal = modal;
	    }

	    return modal;
	  },


	  // close popup when click modal && closeOnClickOverlay is true
	  handleOverlayClick: function handleOverlayClick() {
	    var top = popup_context.top;

	    if (top) {
	      var instance = popup_context.instances[top.id];
	      if (instance && instance.closeOnClickOverlay) {
	        instance.close();
	      }
	    }
	  },
	  openModal: function openModal(config) {
	    var id = config.id,
	        dom = config.dom;

	    var exist = popup_context.stack.some(function (item) {
	      return item.id === id;
	    });

	    if (!exist) {
	      var targetNode = dom && dom.parentNode && dom.parentNode.nodeType !== 11 ? dom.parentNode : document.body;
	      popup_context.stack.push({ id: id, config: config, targetNode: targetNode });
	      this.updateModal();
	    };
	  },
	  closeModal: function closeModal(id) {
	    var stack = popup_context.stack;


	    if (stack.length) {
	      if (popup_context.top.id === id) {
	        stack.pop();
	        this.updateModal();
	      } else {
	        popup_context.stack = stack.filter(function (item) {
	          return item.id !== id;
	        });
	      }
	    }
	  },
	  updateModal: function updateModal() {
	    var modal = this.getModal();
	    var el = modal.$el;

	    if (el.parentNode) {
	      modal.visible = false;
	    }

	    if (popup_context.top) {
	      var _context$top = popup_context.top,
	          targetNode = _context$top.targetNode,
	          config = _context$top.config;


	      targetNode.appendChild(el);
	      assign_default()(modal, extends_default()({}, modalDefaultConfig, config, {
	        visible: true
	      }));
	    }
	  }
	};

	/* harmony default export */ var popup_manager = (PopupManager);
	// CONCATENATED MODULE: ./packages/mixins/popup/index.js



	/* harmony default export */ var popup = ({
	  props: {
	    // whether to show popup
	    value: Boolean,
	    // whether to show overlay
	    overlay: Boolean,
	    // overlay custom style
	    overlayStyle: Object,
	    // overlay custom class name
	    overlayClass: String,
	    // whether to close popup when click overlay
	    closeOnClickOverlay: Boolean,
	    // z-index
	    zIndex: [String, Number],
	    // prevent touchmove scroll
	    preventScroll: Boolean,
	    // prevent body scroll
	    lockOnScroll: {
	      type: Boolean,
	      default: true
	    }
	  },

	  watch: {
	    value: function value(val) {
	      this[val ? 'open' : 'close']();
	    }
	  },

	  beforeMount: function beforeMount() {
	    this._popupId = 'popup-' + popup_context.plusKeyByOne('idSeed');
	    popup_context.instances[this._popupId] = this;
	  },
	  data: function data() {
	    return {
	      opened: false,
	      pos: {
	        x: 0,
	        y: 0
	      }
	    };
	  },


	  methods: {
	    recordPosition: function recordPosition(e) {
	      this.pos = {
	        x: e.touches[0].clientX,
	        y: e.touches[0].clientY
	      };
	    },
	    watchTouchMove: function watchTouchMove(e) {
	      var pos = this.pos;
	      var dx = e.touches[0].clientX - pos.x;
	      var dy = e.touches[0].clientY - pos.y;
	      var direction = dy > 0 ? '10' : '01';
	      var el = this.$el.querySelector('.scroller') || this.$el;
	      var scrollTop = el.scrollTop;
	      var scrollHeight = el.scrollHeight;
	      var offsetHeight = el.offsetHeight;
	      var isVertical = Math.abs(dx) < Math.abs(dy);

	      var status = '11';

	      if (scrollTop === 0) {
	        status = offsetHeight >= scrollHeight ? '00' : '01';
	      } else if (scrollTop + offsetHeight >= scrollHeight) {
	        status = '10';
	      }

	      if (status !== '11' && isVertical && !(parseInt(status, 2) & parseInt(direction, 2))) {
	        e.preventDefault();
	        e.stopPropagation();
	      }
	    },
	    open: function open() {
	      if (this.opened || this.$isServer) {
	        return;
	      }

	      this.$emit('input', true);

	      // 如果属性中传入了`zIndex`，则覆盖`context`中对应的`zIndex`
	      if (this.zIndex !== undefined) {
	        popup_context.zIndex = this.zIndex;
	      }

	      if (this.overlay) {
	        popup_manager.openModal({
	          id: this._popupId,
	          zIndex: popup_context.plusKeyByOne('zIndex'),
	          dom: this.$el,
	          className: this.overlayClass,
	          customStyle: this.overlayStyle
	        });

	        if (this.lockOnScroll) {
	          document.body.classList.add('van-overflow-hidden');
	        }
	      }

	      this.$el.style.zIndex = popup_context.plusKeyByOne('zIndex');
	      this.opened = true;

	      if (this.preventScroll) {
	        document.addEventListener('touchstart', this.recordPosition, false);
	        document.addEventListener('touchmove', this.watchTouchMove, false);
	      }
	    },
	    close: function close() {
	      if (!this.opened || this.$isServer) {
	        return;
	      }

	      this.$emit('input', false);

	      if (this.lockOnScroll) {
	        document.body.classList.remove('van-overflow-hidden');
	      }

	      this.opened = false;
	      this.doAfterClose();
	    },
	    doAfterClose: function doAfterClose() {
	      popup_manager.closeModal(this._popupId);

	      if (this.preventScroll) {
	        document.removeEventListener('touchstart', this.recordPosition, false);
	        document.removeEventListener('touchmove', this.watchTouchMove, false);
	      }
	    }
	  },

	  beforeDestroy: function beforeDestroy() {
	    popup_context.instances[this._popupId] = null;
	    popup_manager.closeModal(this._popupId);
	    if (this.lockOnScroll) {
	      document.body.classList.remove('van-overflow-hidden');
	    }
	  }
	});
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/actionsheet/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var actionsheet = (Object(utils["b" /* create */])({
	  name: 'van-actionsheet',

	  mixins: [popup],

	  props: {
	    value: Boolean,
	    title: String,
	    cancelText: String,
	    actions: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    },
	    overlay: {
	      default: true
	    },
	    closeOnClickOverlay: {
	      default: true
	    }
	  },

	  mounted: function mounted() {
	    this.value && this.open();
	  },


	  methods: {
	    onClickItem: function onClickItem(item) {
	      if (typeof item.callback === 'function') {
	        item.callback(item);
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-84086c58","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/actionsheet/index.vue
	var actionsheet_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition',{attrs:{"name":"van-actionsheet-float"}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.value),expression:"value"}],staticClass:"van-actionsheet",class:{ 'van-actionsheet--withtitle': _vm.title }},[(_vm.title)?_c('div',{staticClass:"van-actionsheet__header van-hairline--top-bottom"},[_c('div',{domProps:{"textContent":_vm._s(_vm.title)}}),_c('icon',{attrs:{"name":"close"},on:{"click":function($event){$event.stopPropagation();_vm.$emit('input', false)}}})],1):_vm._e(),(!_vm.title)?_c('ul',{staticClass:"van-actionsheet__list"},_vm._l((_vm.actions),function(item,index){return _c('li',{key:index,staticClass:"van-actionsheet__item van-hairline--top",class:[item.className, { 'van-actionsheet__item--loading': item.loading }],on:{"click":function($event){$event.stopPropagation();_vm.onClickItem(item)}}},[(!item.loading)?[_c('span',{staticClass:"van-actionsheet__name"},[_vm._v(_vm._s(item.name))]),(item.subname)?_c('span',{staticClass:"van-actionsheet__subname"},[_vm._v(_vm._s(item.subname))]):_vm._e()]:_c('loading',{staticClass:"van-actionsheet__loading",attrs:{"type":"circle"}})],2)})):_vm._e(),(_vm.cancelText)?_c('div',{staticClass:"van-actionsheet__item van-actionsheet__cancel van-hairline--top",domProps:{"textContent":_vm._s(_vm.cancelText)},on:{"click":function($event){$event.stopPropagation();_vm.$emit('input', false)}}}):_c('div',{staticClass:"van-actionsheet__content"},[_vm._t("default")],2)])])}
	var actionsheet_staticRenderFns = []
	var actionsheet_esExports = { render: actionsheet_render, staticRenderFns: actionsheet_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_actionsheet = (actionsheet_esExports);
	// CONCATENATED MODULE: ./packages/actionsheet/index.vue
	var actionsheet_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var actionsheet___vue_template_functional__ = false
	/* styles */
	var actionsheet___vue_styles__ = null
	/* scopeId */
	var actionsheet___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var actionsheet___vue_module_identifier__ = null
	var actionsheet_Component = actionsheet_normalizeComponent(
	  actionsheet,
	  selectortype_template_index_0_packages_actionsheet,
	  actionsheet___vue_template_functional__,
	  actionsheet___vue_styles__,
	  actionsheet___vue_scopeId__,
	  actionsheet___vue_module_identifier__
	)

	/* harmony default export */ var packages_actionsheet = (actionsheet_Component.exports);

	// CONCATENATED MODULE: ./packages/mixins/router-link.js
	/**
	 * add Vue-Router support
	 */

	/* harmony default export */ var router_link = ({
	  props: {
	    url: String,
	    replace: Boolean,
	    to: [String, Object]
	  },

	  methods: {
	    routerLink: function routerLink() {
	      var to = this.to,
	          url = this.url,
	          $router = this.$router,
	          replace = this.replace;

	      if (to && $router) {
	        $router[replace ? 'replace' : 'push'](to);
	      } else if (url) {
	        replace ? location.replace(url) : location.href = url;
	      }
	    }
	  }
	});
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/cell/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var cell = (Object(utils["b" /* create */])({
	  name: 'van-cell',

	  mixins: [router_link],

	  props: {
	    icon: String,
	    title: String,
	    label: String,
	    isLink: Boolean,
	    required: Boolean,
	    value: [String, Number]
	  },

	  methods: {
	    onClick: function onClick() {
	      this.$emit('click');
	      this.routerLink();
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-763e95a6","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/cell/index.vue
	var cell_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-cell van-hairline",class:{ 'van-cell--required': _vm.required },on:{"click":_vm.onClick}},[(_vm.$slots.title || _vm.title)?_c('div',{staticClass:"van-cell__title"},[_vm._t("icon",[(_vm.icon)?_c('icon',{attrs:{"name":_vm.icon}}):_vm._e()]),_vm._t("title",[_c('span',{staticClass:"van-cell__text",domProps:{"textContent":_vm._s(_vm.title)}}),(_vm.label)?_c('span',{staticClass:"van-cell__label",domProps:{"textContent":_vm._s(_vm.label)}}):_vm._e()])],2):_vm._e(),(_vm.value || _vm.$slots.default)?_c('div',{staticClass:"van-cell__value",class:{
	      'van-cell__value--link': _vm.isLink,
	      'van-cell__value--alone': !_vm.$slots.title && !_vm.title && !_vm.label
	    }},[_vm._t("default",[_c('span',{domProps:{"textContent":_vm._s(_vm.value)}})])],2):_vm._e(),_vm._t("right-icon",[(_vm.isLink)?_c('icon',{staticClass:"van-cell__right-icon",attrs:{"name":"arrow"}}):_vm._e()]),_vm._t("extra")],2)}
	var cell_staticRenderFns = []
	var cell_esExports = { render: cell_render, staticRenderFns: cell_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_cell = (cell_esExports);
	// CONCATENATED MODULE: ./packages/cell/index.vue
	var cell_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var cell___vue_template_functional__ = false
	/* styles */
	var cell___vue_styles__ = null
	/* scopeId */
	var cell___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var cell___vue_module_identifier__ = null
	var cell_Component = cell_normalizeComponent(
	  cell,
	  selectortype_template_index_0_packages_cell,
	  cell___vue_template_functional__,
	  cell___vue_styles__,
	  cell___vue_scopeId__,
	  cell___vue_module_identifier__
	)

	/* harmony default export */ var packages_cell = (cell_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/field/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var field = (Object(utils["b" /* create */])({
	  name: 'van-field',

	  components: {
	    Cell: packages_cell
	  },

	  props: {
	    type: {
	      type: String,
	      default: 'text'
	    },
	    value: {},
	    icon: String,
	    label: String,
	    error: Boolean,
	    border: Boolean,
	    required: Boolean,
	    autosize: Boolean,
	    onIconClick: {
	      type: Function,
	      default: function _default() {}
	    }
	  },

	  watch: {
	    value: function value() {
	      if (this.autosize && this.type === 'textarea') {
	        this.$nextTick(this.adjustSize);
	      }
	    }
	  },

	  mounted: function mounted() {
	    if (this.autosize && this.type === 'textarea') {
	      var el = this.$refs.textarea;
	      var scrollHeight = el.scrollHeight;
	      if (scrollHeight !== 0) {
	        el.style.height = scrollHeight + 'px';
	      }
	      el.style.overflowY = 'hidden';
	    }
	  },


	  computed: {
	    hasIcon: function hasIcon() {
	      return this.$slots.icon || this.icon;
	    }
	  },

	  methods: {
	    onInput: function onInput(event) {
	      this.$emit('input', event.target.value);
	    },
	    onClickIcon: function onClickIcon() {
	      this.$emit('click-icon');
	      this.onIconClick();
	    },
	    onKeypress: function onKeypress(event) {
	      if (this.type === 'number') {
	        var keyCode = event.keyCode;

	        var allowPoint = this.value.indexOf('.') === -1;
	        var isValidKey = keyCode >= 48 && keyCode <= 57 || keyCode === 46 && allowPoint;
	        if (!isValidKey) {
	          event.preventDefault();
	        }
	      }
	    },
	    adjustSize: function adjustSize() {
	      var el = this.$refs.textarea;
	      el.style.height = 'auto';
	      el.style.height = el.scrollHeight + 'px';
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-38383c47","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/field/index.vue
	var field_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('cell',{staticClass:"van-field",class:{
	    'van-field--has-textarea': _vm.type === 'textarea',
	    'van-field--nolabel': !_vm.label,
	    'van-field--disabled': _vm.$attrs.disabled,
	    'van-field--error': _vm.error,
	    'van-field--border': _vm.border,
	    'van-field--autosize': _vm.autosize,
	    'van-field--has-icon': _vm.hasIcon,
	    'van-hairline--surround': _vm.border
	  },attrs:{"title":_vm.label,"required":_vm.required}},[(_vm.type === 'textarea')?_c('textarea',_vm._b({ref:"textarea",staticClass:"van-field__control",domProps:{"value":_vm.value},on:{"input":_vm.onInput,"focus":function($event){_vm.$emit('focus')},"blur":function($event){_vm.$emit('blur')}}},'textarea',_vm.$attrs,false)):_c('input',_vm._b({staticClass:"van-field__control",attrs:{"type":_vm.type},domProps:{"value":_vm.value},on:{"keypress":_vm.onKeypress,"input":_vm.onInput,"focus":function($event){_vm.$emit('focus')},"blur":function($event){_vm.$emit('blur')}}},'input',_vm.$attrs,false)),(_vm.hasIcon)?_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.$slots.icon || _vm.value),expression:"$slots.icon || value"}],staticClass:"van-field__icon",on:{"touchstart":function($event){$event.preventDefault();_vm.onClickIcon($event)}}},[_vm._t("icon",[_c('icon',{attrs:{"name":_vm.icon}})])],2):_vm._e()])}
	var field_staticRenderFns = []
	var field_esExports = { render: field_render, staticRenderFns: field_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_field = (field_esExports);
	// CONCATENATED MODULE: ./packages/field/index.vue
	var field_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var field___vue_template_functional__ = false
	/* styles */
	var field___vue_styles__ = null
	/* scopeId */
	var field___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var field___vue_module_identifier__ = null
	var field_Component = field_normalizeComponent(
	  field,
	  selectortype_template_index_0_packages_field,
	  field___vue_template_functional__,
	  field___vue_styles__,
	  field___vue_scopeId__,
	  field___vue_module_identifier__
	)

	/* harmony default export */ var packages_field = (field_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/cell-group/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var cell_group = (Object(utils["b" /* create */])({
	  name: 'van-cell-group'
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-2ac1f84c","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/cell-group/index.vue
	var cell_group_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-cell-group van-hairline--top-bottom"},[_vm._t("default")],2)}
	var cell_group_staticRenderFns = []
	var cell_group_esExports = { render: cell_group_render, staticRenderFns: cell_group_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_cell_group = (cell_group_esExports);
	// CONCATENATED MODULE: ./packages/cell-group/index.vue
	var cell_group_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var cell_group___vue_template_functional__ = false
	/* styles */
	var cell_group___vue_styles__ = null
	/* scopeId */
	var cell_group___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var cell_group___vue_module_identifier__ = null
	var cell_group_Component = cell_group_normalizeComponent(
	  cell_group,
	  selectortype_template_index_0_packages_cell_group,
	  cell_group___vue_template_functional__,
	  cell_group___vue_styles__,
	  cell_group___vue_scopeId__,
	  cell_group___vue_module_identifier__
	)

	/* harmony default export */ var packages_cell_group = (cell_group_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/button/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var selectortype_script_index_0_packages_button = (Object(utils["b" /* create */])({
	  name: 'van-button',

	  props: {
	    block: Boolean,
	    loading: Boolean,
	    disabled: Boolean,
	    nativeType: String,
	    bottomAction: Boolean,
	    tag: {
	      type: String,
	      default: 'button'
	    },
	    type: {
	      type: String,
	      default: 'default'
	    },
	    size: {
	      type: String,
	      default: 'normal'
	    }
	  },

	  methods: {
	    onClick: function onClick(event) {
	      if (!this.loading && !this.disabled) {
	        this.$emit('click', event);
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-21ae6f60","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/button/index.vue
	var button_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.tag,{tag:"component",staticClass:"van-button",class:[
	    'van-button--' + _vm.type,
	    'van-button--' + _vm.size,
	    {
	      'van-button--disabled': _vm.disabled,
	      'van-button--loading': _vm.loading,
	      'van-button--block': _vm.block,
	      'van-button--bottom-action': _vm.bottomAction
	    }
	  ],attrs:{"type":_vm.nativeType,"disabled":_vm.disabled},on:{"click":_vm.onClick}},[(_vm.loading)?_c('loading',{staticClass:"van-button__icon-loading",attrs:{"type":"circle","color":_vm.type === 'default' ? 'black' : 'white'}}):_vm._e(),_c('span',{staticClass:"van-button__text"},[_vm._t("default")],2)],1)}
	var button_staticRenderFns = []
	var button_esExports = { render: button_render, staticRenderFns: button_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_button = (button_esExports);
	// CONCATENATED MODULE: ./packages/button/index.vue
	var button_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var button___vue_template_functional__ = false
	/* styles */
	var button___vue_styles__ = null
	/* scopeId */
	var button___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var button___vue_module_identifier__ = null
	var button_Component = button_normalizeComponent(
	  selectortype_script_index_0_packages_button,
	  selectortype_template_index_0_packages_button,
	  button___vue_template_functional__,
	  button___vue_styles__,
	  button___vue_scopeId__,
	  button___vue_module_identifier__
	)

	/* harmony default export */ var packages_button = (button_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/popup/index.vue
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var selectortype_script_index_0_packages_popup = (Object(utils["b" /* create */])({
	  name: 'van-popup',

	  mixins: [popup],

	  props: {
	    transition: String,
	    overlay: {
	      default: true
	    },
	    lockOnScroll: {
	      default: false
	    },
	    closeOnClickOverlay: {
	      default: true
	    },
	    position: {
	      type: String,
	      default: ''
	    }
	  },

	  data: function data() {
	    var transition = this.transition || (this.position === '' ? 'van-fade' : 'popup-slide-' + this.position);
	    return {
	      currentValue: false,
	      currentTransition: transition
	    };
	  },
	  mounted: function mounted() {
	    if (this.value) {
	      this.open();
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-3155265d","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/popup/index.vue
	var popup_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition',{attrs:{"name":_vm.currentTransition}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.value),expression:"value"}],staticClass:"van-popup",class:( _obj = {}, _obj[("van-popup--" + _vm.position)] = _vm.position, _obj )},[_vm._t("default")],2)])
	var _obj;}
	var popup_staticRenderFns = []
	var popup_esExports = { render: popup_render, staticRenderFns: popup_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_popup = (popup_esExports);
	// CONCATENATED MODULE: ./packages/popup/index.vue
	var popup_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var popup___vue_template_functional__ = false
	/* styles */
	var popup___vue_styles__ = null
	/* scopeId */
	var popup___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var popup___vue_module_identifier__ = null
	var popup_Component = popup_normalizeComponent(
	  selectortype_script_index_0_packages_popup,
	  selectortype_template_index_0_packages_popup,
	  popup___vue_template_functional__,
	  popup___vue_styles__,
	  popup___vue_scopeId__,
	  popup___vue_module_identifier__
	)

	/* harmony default export */ var packages_popup = (popup_Component.exports);

	// EXTERNAL MODULE: ./node_modules/babel-runtime/helpers/typeof.js
	var helpers_typeof = __webpack_require__(17);
	var typeof_default = /*#__PURE__*/__webpack_require__.n(helpers_typeof);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/toast/toast.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	var DEFAULT_STYLE_LIST = ['success', 'fail', 'loading'];

	/* harmony default export */ var toast = (Object(utils["b" /* create */])({
	  name: 'van-toast',

	  props: {
	    mask: Boolean,
	    message: [String, Number],
	    forbidClick: Boolean,
	    type: {
	      type: String,
	      default: 'text'
	    },
	    position: {
	      type: String,
	      default: 'middle'
	    }
	  },

	  data: function data() {
	    return {
	      visible: false
	    };
	  },


	  computed: {
	    displayStyle: function displayStyle() {
	      return DEFAULT_STYLE_LIST.indexOf(this.type) !== -1 ? 'default' : this.type;
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-6290fcf3","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/toast/toast.vue
	var toast_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition',{attrs:{"name":"van-fade"}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.visible),expression:"visible"}],staticClass:"van-toast-wrapper"},[_c('div',{staticClass:"van-toast",class:[("van-toast--" + _vm.displayStyle), ("van-toast--" + _vm.position)]},[(_vm.displayStyle === 'text')?_c('div',[_vm._v(_vm._s(_vm.message))]):_vm._e(),(_vm.displayStyle === 'html')?_c('div',{domProps:{"innerHTML":_vm._s(_vm.message)}}):_vm._e(),(_vm.displayStyle === 'default')?[(_vm.type === 'loading')?_c('loading',{attrs:{"color":"white"}}):_c('icon',{staticClass:"van-toast__icon",attrs:{"name":_vm.type}}),(_vm.message !== undefined)?_c('div',{staticClass:"van-toast__text"},[_vm._v(_vm._s(_vm.message))]):_vm._e()]:_vm._e()],2),(_vm.forbidClick || _vm.mask)?_c('div',{staticClass:"van-toast__overlay",class:{ 'van-toast__overlay--mask': _vm.mask }}):_vm._e()])])}
	var toast_staticRenderFns = []
	var toast_esExports = { render: toast_render, staticRenderFns: toast_staticRenderFns }
	/* harmony default export */ var toast_toast = (toast_esExports);
	// CONCATENATED MODULE: ./packages/toast/toast.vue
	var toast_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var toast___vue_template_functional__ = false
	/* styles */
	var toast___vue_styles__ = null
	/* scopeId */
	var toast___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var toast___vue_module_identifier__ = null
	var toast_Component = toast_normalizeComponent(
	  toast,
	  toast_toast,
	  toast___vue_template_functional__,
	  toast___vue_styles__,
	  toast___vue_scopeId__,
	  toast___vue_module_identifier__
	)

	/* harmony default export */ var packages_toast_toast = (toast_Component.exports);

	// CONCATENATED MODULE: ./packages/toast/index.js






	var toast_instance = void 0;

	var defaultOptions = {
	  type: 'text',
	  mask: false,
	  visible: true,
	  duration: 3000,
	  position: 'middle',
	  forbidClick: false,
	  clear: function clear() {
	    toast_instance.visible = false;
	  }
	};

	var toast_createInstance = function createInstance() {
	  if (!toast_instance) {
	    var ToastConstructor = external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.extend(packages_toast_toast);
	    toast_instance = new ToastConstructor({
	      el: document.createElement('div')
	    });
	    document.body.appendChild(toast_instance.$el);
	  }
	};

	var toast_Toast = function Toast() {
	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  toast_createInstance();

	  options = (typeof options === 'undefined' ? 'undefined' : typeof_default()(options)) === 'object' ? options : { message: options };
	  options = extends_default()({}, defaultOptions, options);
	  assign_default()(toast_instance, options);

	  clearTimeout(toast_instance.timer);

	  if (options.duration !== 0) {
	    toast_instance.timer = setTimeout(function () {
	      toast_instance.clear();
	    }, options.duration);
	  }

	  return toast_instance;
	};

	var toast_createMethod = function createMethod(type) {
	  return function () {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    return toast_Toast(extends_default()({
	      type: type,
	      message: (typeof options === 'undefined' ? 'undefined' : typeof_default()(options)) === 'object' ? options.message : options
	    }, options));
	  };
	};

	toast_Toast.loading = toast_createMethod('loading');
	toast_Toast.success = toast_createMethod('success');
	toast_Toast.fail = toast_createMethod('fail');
	toast_Toast.clear = function () {
	  toast_instance && toast_instance.clear();
	};

	external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.prototype.$toast = toast_Toast;

	/* harmony default export */ var packages_toast = (toast_Toast);
	// EXTERNAL MODULE: ./node_modules/babel-runtime/core-js/promise.js
	var promise = __webpack_require__(88);
	var promise_default = /*#__PURE__*/__webpack_require__.n(promise);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/dialog/dialog.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//





	/* harmony default export */ var dialog = (Object(utils["b" /* create */])({
	  name: 'van-dialog',

	  components: {
	    VanButton: packages_button
	  },

	  mixins: [popup],

	  props: {
	    title: String,
	    message: String,
	    callback: Function,
	    confirmButtonText: String,
	    cancelButtonText: String,
	    showConfirmButton: {
	      type: Boolean,
	      default: true
	    },
	    showCancelButton: {
	      type: Boolean,
	      default: false
	    },
	    overlay: {
	      default: true
	    },
	    closeOnClickOverlay: {
	      default: false
	    },
	    lockOnScroll: {
	      default: true
	    }
	  },

	  methods: {
	    handleAction: function handleAction(action) {
	      this.$emit('input', false);
	      this.$emit(action);
	      this.callback && this.callback(action);
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-3787f921","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/dialog/dialog.vue
	var dialog_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition',{attrs:{"name":"van-dialog-bounce"}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.value),expression:"value"}],staticClass:"van-dialog"},[(_vm.title)?_c('div',{staticClass:"van-dialog__header",domProps:{"textContent":_vm._s(_vm.title)}}):_vm._e(),_c('div',{staticClass:"van-dialog__content van-hairline"},[_vm._t("default",[(_vm.message)?_c('div',{staticClass:"van-dialog__message",class:{ 'van-dialog__message--withtitle': _vm.title },domProps:{"innerHTML":_vm._s(_vm.message)}}):_vm._e()])],2),_c('div',{staticClass:"van-dialog__footer",class:{ 'is-twobtn': _vm.showCancelButton && _vm.showConfirmButton }},[_c('van-button',{directives:[{name:"show",rawName:"v-show",value:(_vm.showCancelButton),expression:"showCancelButton"}],staticClass:"van-dialog__cancel",attrs:{"size":"large"},on:{"click":function($event){_vm.handleAction('cancel')}}},[_vm._v("\n        "+_vm._s(_vm.cancelButtonText || _vm.$t('cancel'))+"\n      ")]),_c('van-button',{directives:[{name:"show",rawName:"v-show",value:(_vm.showConfirmButton),expression:"showConfirmButton"}],staticClass:"van-dialog__confirm",class:{ 'van-hairline--left': _vm.showCancelButton && _vm.showConfirmButton },attrs:{"size":"large"},on:{"click":function($event){_vm.handleAction('confirm')}}},[_vm._v("\n        "+_vm._s(_vm.confirmButtonText || _vm.$t('confirm'))+"\n      ")])],1)])])}
	var dialog_staticRenderFns = []
	var dialog_esExports = { render: dialog_render, staticRenderFns: dialog_staticRenderFns }
	/* harmony default export */ var dialog_dialog = (dialog_esExports);
	// CONCATENATED MODULE: ./packages/dialog/dialog.vue
	var dialog_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var dialog___vue_template_functional__ = false
	/* styles */
	var dialog___vue_styles__ = null
	/* scopeId */
	var dialog___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var dialog___vue_module_identifier__ = null
	var dialog_Component = dialog_normalizeComponent(
	  dialog,
	  dialog_dialog,
	  dialog___vue_template_functional__,
	  dialog___vue_styles__,
	  dialog___vue_scopeId__,
	  dialog___vue_module_identifier__
	)

	/* harmony default export */ var packages_dialog_dialog = (dialog_Component.exports);

	// CONCATENATED MODULE: ./packages/dialog/index.js






	var dialog_instance = void 0;

	var defaultConfig = {
	  value: true,
	  title: '',
	  message: '',
	  overlay: true,
	  lockOnScroll: true,
	  confirmButtonText: '',
	  cancelButtonText: '',
	  showConfirmButton: true,
	  showCancelButton: false,
	  closeOnClickOverlay: false,
	  callback: function callback(action) {
	    dialog_instance[action === 'confirm' ? 'resolve' : 'reject'](action);
	  }
	};

	var dialog_initInstance = function initInstance() {
	  var DialogConstructor = external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.extend(packages_dialog_dialog);
	  dialog_instance = new DialogConstructor({
	    el: document.createElement('div')
	  });

	  dialog_instance.$on('input', function (value) {
	    dialog_instance.value = value;
	  });

	  document.body.appendChild(dialog_instance.$el);
	};

	var dialog_Dialog = function Dialog(options) {
	  return new promise_default.a(function (resolve, reject) {
	    if (!dialog_instance) {
	      dialog_initInstance();
	    }

	    assign_default()(dialog_instance, extends_default()({
	      resolve: resolve,
	      reject: reject
	    }, options));
	  });
	};

	dialog_Dialog.alert = function (options) {
	  return dialog_Dialog(extends_default()({}, defaultConfig, options));
	};

	dialog_Dialog.confirm = function (options) {
	  return dialog_Dialog(extends_default()({}, defaultConfig, {
	    showCancelButton: true
	  }, options));
	};

	dialog_Dialog.close = function () {
	  dialog_instance.value = false;
	};

	external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.prototype.$dialog = dialog_Dialog;

	/* harmony default export */ var packages_dialog = (dialog_Dialog);

	// EXTERNAL MODULE: ./node_modules/babel-runtime/core-js/json/stringify.js
	var stringify = __webpack_require__(103);
	var stringify_default = /*#__PURE__*/__webpack_require__.n(stringify);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/picker/PickerColumn.vue


	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	var DEFAULT_DURATION = 200;
	var range = function range(num, arr) {
	  return Math.min(Math.max(num, arr[0]), arr[1]);
	};

	/* harmony default export */ var PickerColumn = (Object(utils["b" /* create */])({
	  name: 'van-picker-column',

	  props: {
	    valueKey: String,
	    className: String,
	    options: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    },
	    itemHeight: {
	      type: Number,
	      default: 44
	    },
	    visibileColumnCount: {
	      type: Number,
	      default: 5
	    },
	    defaultIndex: {
	      type: Number,
	      default: 0
	    }
	  },

	  data: function data() {
	    return {
	      startY: 0,
	      offset: 0,
	      duration: 0,
	      startOffset: 0,
	      currentIndex: this.defaultIndex
	    };
	  },
	  created: function created() {
	    this.$parent && this.$parent.children.push(this);
	  },
	  mounted: function mounted() {
	    this.setIndex(this.currentIndex);
	  },
	  destroyed: function destroyed() {
	    this.$parent && this.$parent.children.splice(this.$parent.children.indexOf(this), 1);
	  },


	  watch: {
	    defaultIndex: function defaultIndex() {
	      this.setIndex(this.defaultIndex);
	    },
	    options: function options(next, prev) {
	      if (stringify_default()(next) !== stringify_default()(prev)) {
	        this.setIndex(this.defaultIndex);
	      }
	    },
	    currentIndex: function currentIndex(index) {
	      this.$emit('change', index);
	    }
	  },

	  computed: {
	    count: function count() {
	      return this.options.length;
	    },
	    wrapperStyle: function wrapperStyle() {
	      var itemHeight = this.itemHeight,
	          visibileColumnCount = this.visibileColumnCount;

	      return {
	        transition: this.duration + 'ms',
	        transform: 'translate3d(0, ' + this.offset + 'px, 0)',
	        lineHeight: itemHeight + 'px',
	        height: itemHeight * visibileColumnCount + 'px',
	        paddingTop: itemHeight * (visibileColumnCount - 1) / 2 + 'px'
	      };
	    },
	    frameStyle: function frameStyle() {
	      return {
	        height: this.itemHeight + 'px'
	      };
	    },
	    currentValue: function currentValue() {
	      return this.options[this.currentIndex];
	    }
	  },

	  methods: {
	    onTouchStart: function onTouchStart(event) {
	      this.startY = event.touches[0].clientY;
	      this.startOffset = this.offset;
	      this.duration = 0;
	    },
	    onTouchMove: function onTouchMove(event) {
	      var deltaY = event.touches[0].clientY - this.startY;
	      this.offset = range(this.startOffset + deltaY, [-(this.count * this.itemHeight), this.itemHeight]);
	    },
	    onTouchEnd: function onTouchEnd() {
	      if (this.offset !== this.startOffset) {
	        this.duration = DEFAULT_DURATION;
	        var index = range(Math.round(-this.offset / this.itemHeight), [0, this.count - 1]);
	        this.setIndex(index);
	      }
	    },
	    adjustIndex: function adjustIndex(index) {
	      index = range(index, [0, this.count]);
	      for (var i = index; i < this.count; i++) {
	        if (!this.isDisabled(this.options[i])) return i;
	      }
	      for (var _i = index - 1; _i >= 0; _i--) {
	        if (!this.isDisabled(this.options[_i])) return _i;
	      }
	    },
	    isDisabled: function isDisabled(option) {
	      return (typeof option === 'undefined' ? 'undefined' : typeof_default()(option)) === 'object' && option.disabled;
	    },
	    getOptionText: function getOptionText(option) {
	      return (typeof option === 'undefined' ? 'undefined' : typeof_default()(option)) === 'object' && this.valueKey in option ? option[this.valueKey] : option;
	    },
	    setIndex: function setIndex(index) {
	      index = this.adjustIndex(index);
	      this.offset = -index * this.itemHeight;
	      this.currentIndex = index;
	    },
	    setValue: function setValue(value) {
	      var options = this.options,
	          valueKey = this.valueKey;

	      for (var i = 0; i < options.length; i++) {
	        if (this.getOptionText(options[i]) === value) {
	          this.setIndex(i);
	          return;
	        }
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-ce7a0ed2","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/picker/PickerColumn.vue
	var PickerColumn_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-picker-column",class:_vm.className},[_c('div',{staticClass:"van-picker-column__frame van-hairline--top-bottom",style:(_vm.frameStyle)}),_c('ul',{style:(_vm.wrapperStyle),on:{"touchstart":_vm.onTouchStart,"touchmove":function($event){$event.preventDefault();_vm.onTouchMove($event)},"touchend":_vm.onTouchEnd,"touchcancel":_vm.onTouchEnd}},_vm._l((_vm.options),function(option,index){return _c('li',{class:{
	        'van-picker-column--disabled': _vm.isDisabled(option),
	        'van-picker-column--selected': index === _vm.currentIndex
	      },domProps:{"textContent":_vm._s(_vm.getOptionText(option))},on:{"click":function($event){_vm.setIndex(index)}}})}))])}
	var PickerColumn_staticRenderFns = []
	var PickerColumn_esExports = { render: PickerColumn_render, staticRenderFns: PickerColumn_staticRenderFns }
	/* harmony default export */ var picker_PickerColumn = (PickerColumn_esExports);
	// CONCATENATED MODULE: ./packages/picker/PickerColumn.vue
	var PickerColumn_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var PickerColumn___vue_template_functional__ = false
	/* styles */
	var PickerColumn___vue_styles__ = null
	/* scopeId */
	var PickerColumn___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var PickerColumn___vue_module_identifier__ = null
	var PickerColumn_Component = PickerColumn_normalizeComponent(
	  PickerColumn,
	  picker_PickerColumn,
	  PickerColumn___vue_template_functional__,
	  PickerColumn___vue_styles__,
	  PickerColumn___vue_scopeId__,
	  PickerColumn___vue_module_identifier__
	)

	/* harmony default export */ var packages_picker_PickerColumn = (PickerColumn_Component.exports);

	// EXTERNAL MODULE: ./packages/utils/deep-assign.js
	var deep_assign = __webpack_require__(42);

	// CONCATENATED MODULE: ./packages/utils/deep-clone.js



	function deepClone(obj) {
	  if (Array.isArray(obj)) {
	    return obj.map(function (item) {
	      return deepClone(item);
	    });
	  } else if ((typeof obj === 'undefined' ? 'undefined' : typeof_default()(obj)) === 'object') {
	    return Object(deep_assign["a" /* default */])({}, obj);
	  }
	  return obj;
	}
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/picker/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//





	/* harmony default export */ var picker = (Object(utils["b" /* create */])({
	  name: 'van-picker',

	  components: {
	    PickerColumn: packages_picker_PickerColumn
	  },

	  props: {
	    title: String,
	    valueKey: {
	      type: String,
	      default: 'text'
	    },
	    itemHeight: Number,
	    showToolbar: Boolean,
	    visibileColumnCount: Number,
	    columns: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    }
	  },

	  data: function data() {
	    return {
	      children: [],
	      currentColumns: []
	    };
	  },
	  created: function created() {
	    this.initColumns();
	  },


	  watch: {
	    columns: function columns() {
	      this.initColumns();
	    }
	  },

	  methods: {
	    initColumns: function initColumns() {
	      var columns = this.columns.map(deepClone);
	      this.isSimpleColumn = columns.length && !columns[0].values;
	      this.currentColumns = this.isSimpleColumn ? [{ values: columns }] : columns;
	    },
	    emit: function emit(event) {
	      if (this.isSimpleColumn) {
	        this.$emit(event, this.getColumnValue(0), this.getColumnIndex(0));
	      } else {
	        this.$emit(event, this.getValues(), this.getIndexes());
	      }
	    },
	    onChange: function onChange(columnIndex) {
	      if (this.isSimpleColumn) {
	        this.$emit('change', this, this.getColumnValue(0), this.getColumnIndex(0));
	      } else {
	        this.$emit('change', this, this.getValues(), columnIndex);
	      }
	    },


	    // get column instance by index
	    getColumn: function getColumn(index) {
	      return this.children[index];
	    },


	    // get column value by index
	    getColumnValue: function getColumnValue(index) {
	      return (this.getColumn(index) || {}).currentValue;
	    },


	    // set column value by index
	    setColumnValue: function setColumnValue(index, value) {
	      var column = this.getColumn(index);
	      column && column.setValue(value);
	    },


	    // get column option index by column index
	    getColumnIndex: function getColumnIndex(columnIndex) {
	      return (this.getColumn(columnIndex) || {}).currentIndex;
	    },


	    // set column option index by column index
	    setColumnIndex: function setColumnIndex(columnIndex, optionIndex) {
	      var column = this.getColumn(columnIndex);
	      column && column.setIndex(optionIndex);
	    },


	    // get options of column by index
	    getColumnValues: function getColumnValues(index) {
	      return (this.currentColumns[index] || {}).values;
	    },


	    // set options of column by index
	    setColumnValues: function setColumnValues(index, options) {
	      var column = this.currentColumns[index];
	      if (column) {
	        column.values = options;
	      }
	    },


	    // get values of all columns
	    getValues: function getValues() {
	      return this.children.map(function (child) {
	        return child.currentValue;
	      });
	    },


	    // set values of all columns
	    setValues: function setValues(values) {
	      var _this = this;

	      values.forEach(function (value, index) {
	        _this.setColumnValue(index, value);
	      });
	    },


	    // get indexes of all columns
	    getIndexes: function getIndexes() {
	      return this.children.map(function (child) {
	        return child.currentIndex;
	      });
	    },


	    // set indexes of all columns
	    setIndexes: function setIndexes(indexes) {
	      var _this2 = this;

	      indexes.forEach(function (optionIndex, columnIndex) {
	        _this2.setColumnIndex(columnIndex, optionIndex);
	      });
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-de7c3622","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/picker/index.vue
	var picker_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-picker"},[(_vm.showToolbar)?_c('div',{staticClass:"van-picker__toolbar van-hairline--top-bottom"},[_vm._t("default",[_c('div',{staticClass:"van-picker__cancel",on:{"click":function($event){_vm.emit('cancel')}}},[_vm._v(_vm._s(_vm.$t('cancel')))]),_c('div',{staticClass:"van-picker__confirm",on:{"click":function($event){_vm.emit('confirm')}}},[_vm._v(_vm._s(_vm.$t('confirm')))]),(_vm.title)?_c('div',{staticClass:"van-picker__title",domProps:{"textContent":_vm._s(_vm.title)}}):_vm._e()])],2):_vm._e(),_c('div',{staticClass:"van-picker__columns"},_vm._l((_vm.currentColumns),function(item,index){return _c('picker-column',{key:index,attrs:{"valueKey":_vm.valueKey,"options":item.values,"className":item.className,"defaultIndex":item.defaultIndex,"itemHeight":_vm.itemHeight,"visibileColumnCount":_vm.visibileColumnCount},on:{"change":function($event){_vm.onChange(index)}}})}))])}
	var picker_staticRenderFns = []
	var picker_esExports = { render: picker_render, staticRenderFns: picker_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_picker = (picker_esExports);
	// CONCATENATED MODULE: ./packages/picker/index.vue
	var picker_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var picker___vue_template_functional__ = false
	/* styles */
	var picker___vue_styles__ = null
	/* scopeId */
	var picker___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var picker___vue_module_identifier__ = null
	var picker_Component = picker_normalizeComponent(
	  picker,
	  selectortype_template_index_0_packages_picker,
	  picker___vue_template_functional__,
	  picker___vue_styles__,
	  picker___vue_scopeId__,
	  picker___vue_module_identifier__
	)

	/* harmony default export */ var packages_picker = (picker_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/area/index.vue

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	var DEFAULT_PROVINCE = {
	  code: '-1',
	  name: '选择省份'
	};

	var DEFAULT_CITY = {
	  code: '-1',
	  name: '选择城市'
	};

	var DEFAULT_COUNTY = {
	  code: '-1',
	  name: '选择地区'
	};

	var PROVINCE_TYPE = 'provice';
	var CITY_TYPE = 'city';
	var COUNTY_TYPE = 'county';

	/* harmony default export */ var selectortype_script_index_0_packages_area = (Object(utils["b" /* create */])({
	  name: 'van-area',

	  components: {
	    Picker: packages_picker
	  },

	  props: {
	    value: {},
	    areaList: Object,
	    // 省市县显示列数，3-省市县，2-省市，1-省
	    columnsNum: {
	      type: [String, Number],
	      default: 3
	    }
	  },

	  computed: {
	    areaColumns: function areaColumns() {
	      var areaList = this.areaList;

	      if (!areaList || areaList && typeof_default()(areaList.province_list) !== 'object') return [];

	      var columns = [];
	      var curValue = this.value || '';
	      var columnsNum = this.columnsNum;


	      columns.push({
	        values: [DEFAULT_PROVINCE].concat(this.computedAreaList(PROVINCE_TYPE)),
	        className: 'van-area__province',
	        defaultIndex: this.getAreaIndex(PROVINCE_TYPE, curValue)
	      });

	      if (+columnsNum > 1) {
	        columns.push({
	          values: [DEFAULT_CITY].concat(this.computedAreaList(CITY_TYPE, curValue.slice(0, 2))),
	          className: 'van-area__city',
	          defaultIndex: this.getAreaIndex(CITY_TYPE, curValue)
	        });
	      }

	      if (+columnsNum > 2) {
	        columns.push({
	          values: [DEFAULT_COUNTY].concat(this.computedAreaList(COUNTY_TYPE, curValue.slice(0, 4))),
	          className: 'van-area__county',
	          defaultIndex: this.getAreaIndex(COUNTY_TYPE, curValue)
	        });
	      }

	      return columns;
	    }
	  },

	  methods: {
	    // 根据省市县类型和对应的`code`获取对应列表
	    computedAreaList: function computedAreaList(type, code) {
	      var result = [];
	      var curAreaList = this.areaList;
	      var areaList = type === PROVINCE_TYPE ? curAreaList.province_list : type === CITY_TYPE ? curAreaList.city_list : curAreaList.county_list;

	      for (var i in areaList) {
	        // 如果为省类型直接插入，因为省那一列是全部显示的
	        // 其他类型需要找到前缀相同的
	        if (type === PROVINCE_TYPE || code && i.slice(0, code.length) === code) {
	          result.push({
	            code: i,
	            name: areaList[i]
	          });
	        }
	      }

	      return result;
	    },


	    // 获取对应省市县在列表中的索引
	    getAreaIndex: function getAreaIndex(type, code) {
	      var compareNum = type === PROVINCE_TYPE ? 2 : type === CITY_TYPE ? 4 : 6;
	      var areaList = this.computedAreaList(type, code.slice(0, compareNum - 2));

	      for (var i = 0; i < areaList.length; i++) {
	        if (+areaList[i].code.slice(0, compareNum) === +code.slice(0, compareNum)) {
	          return i + 1;
	        }
	      }

	      return 0;
	    },
	    onChange: function onChange(picker, values, index) {
	      var code = values[index].code;
	      // 处理省变化
	      if (index === 0) {
	        picker.setColumnValues(1, [DEFAULT_CITY].concat(this.computedAreaList(CITY_TYPE, code.slice(0, 2))));
	        picker.setColumnValues(2, [DEFAULT_COUNTY].concat(this.computedAreaList(COUNTY_TYPE, code.slice(0, 4))));
	      } else if (index === 1) {
	        picker.setColumnValues(2, [DEFAULT_COUNTY].concat(this.computedAreaList(COUNTY_TYPE, code.slice(0, 4))));
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-28477147","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/area/index.vue
	var area_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-area"},[_c('picker',{ref:"picker",attrs:{"showToolbar":"","valueKey":"name","columns":_vm.areaColumns},on:{"change":_vm.onChange,"confirm":function($event){_vm.$emit('confirm', $event)},"cancel":function($event){_vm.$emit('cancel')}}})],1)}
	var area_staticRenderFns = []
	var area_esExports = { render: area_render, staticRenderFns: area_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_area = (area_esExports);
	// CONCATENATED MODULE: ./packages/area/index.vue
	var area_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var area___vue_template_functional__ = false
	/* styles */
	var area___vue_styles__ = null
	/* scopeId */
	var area___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var area___vue_module_identifier__ = null
	var area_Component = area_normalizeComponent(
	  selectortype_script_index_0_packages_area,
	  selectortype_template_index_0_packages_area,
	  area___vue_template_functional__,
	  area___vue_styles__,
	  area___vue_scopeId__,
	  area___vue_module_identifier__
	)

	/* harmony default export */ var packages_area = (area_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/address-edit/Detail.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//







	/* harmony default export */ var Detail = (Object(utils["b" /* create */])({
	  name: 'van-address-edit-detail',

	  components: {
	    Field: packages_field,
	    Cell: packages_cell,
	    CellGroup: packages_cell_group
	  },

	  props: {
	    value: {},
	    isError: Boolean,
	    searchResult: Array,
	    showSearchResult: Boolean
	  },

	  data: function data() {
	    return {
	      isAndroid: Object(utils["d" /* isAndroid */])(),
	      isFocused: false
	    };
	  },


	  computed: {
	    showSearchList: function showSearchList() {
	      return this.showSearchResult && this.isFocused && this.searchResult.length > 0;
	    },
	    showIcon: function showIcon() {
	      return this.value && this.isFocused;
	    }
	  },

	  methods: {
	    handleFocus: function handleFocus(e) {
	      this.isFocused = true;
	      this.$emit('focus', e);
	      this.$refs.root.scrollIntoView();
	    },
	    handleBlur: function handleBlur(e) {
	      var _this = this;

	      // wait for click event finished
	      setTimeout(function () {
	        _this.isFocused = false;
	        _this.$emit('blur', e);
	      }, 100);
	    },
	    onIconClick: function onIconClick() {
	      if (this.isAndroid) {
	        this.$refs.root.querySelector('.van-field__control').blur();
	      } else {
	        this.$emit('input', '');
	      }
	    },
	    onSuggestSelect: function onSuggestSelect(express) {
	      this.$emit('input', ((express.address || '') + ' ' + (express.name || '')).trim());
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-a43eab5e","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/address-edit/Detail.vue
	var Detail_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"root"},[_c('field',{attrs:{"label":_vm.$t('label.address'),"placeholder":_vm.$t('placeholder.address'),"maxlength":"200","type":"textarea","autosize":"","rows":"1","value":_vm.value,"error":_vm.isError,"onIconClick":_vm.onIconClick},on:{"input":function($event){_vm.$emit('input', $event)},"focus":_vm.handleFocus,"blur":_vm.handleBlur}},[_c('div',{attrs:{"slot":"icon"},slot:"icon"},[(_vm.showIcon && _vm.isAndroid)?_c('span',{staticClass:"van-address-edit-detail__finish-edit"},[_vm._v(_vm._s(_vm.$t('complete')))]):(_vm.showIcon)?_c('icon',{attrs:{"name":"clear"}}):_vm._e()],1)]),(_vm.showSearchList)?_c('cell-group',{staticClass:"van-address-edit-detail__suggest-list"},_vm._l((_vm.searchResult),function(express){return _c('cell',{key:express.name + express.address,staticClass:"van-address-edit-detail__suggest-item",on:{"click":function($event){_vm.onSuggestSelect(express)}}},[_c('icon',{staticClass:"van-address-edit-detail__location",attrs:{"name":"location"}}),_c('div',{staticClass:"van-address-edit-detail__item-info"},[_c('p',{staticClass:"van-address-edit-detail__title"},[_vm._v(_vm._s(express.name))]),_c('p',{staticClass:"van-address-edit-detail__subtitle"},[_vm._v(_vm._s(express.address))])])],1)})):_vm._e()],1)}
	var Detail_staticRenderFns = []
	var Detail_esExports = { render: Detail_render, staticRenderFns: Detail_staticRenderFns }
	/* harmony default export */ var address_edit_Detail = (Detail_esExports);
	// CONCATENATED MODULE: ./packages/address-edit/Detail.vue
	var Detail_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var Detail___vue_template_functional__ = false
	/* styles */
	var Detail___vue_styles__ = null
	/* scopeId */
	var Detail___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var Detail___vue_module_identifier__ = null
	var Detail_Component = Detail_normalizeComponent(
	  Detail,
	  address_edit_Detail,
	  Detail___vue_template_functional__,
	  Detail___vue_styles__,
	  Detail___vue_scopeId__,
	  Detail___vue_module_identifier__
	)

	/* harmony default export */ var packages_address_edit_Detail = (Detail_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/switch/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var selectortype_script_index_0_packages_switch = (Object(utils["b" /* create */])({
	  name: 'van-switch',

	  props: {
	    value: Boolean,
	    loading: Boolean,
	    disabled: Boolean
	  },

	  methods: {
	    toggleState: function toggleState() {
	      if (!this.disabled && !this.loading) {
	        this.$emit('input', !this.value);
	        this.$emit('change', !this.value);
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-3a92adf2","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/switch/index.vue
	var switch_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-switch",class:[("van-switch--" + (_vm.value ? 'on' : 'off')), { 'van-switch--disabled': _vm.disabled }],on:{"click":_vm.toggleState}},[_c('div',{staticClass:"van-switch__node van-hairline-surround"},[(_vm.loading)?_c('loading',{staticClass:"van-switch__loading"}):_vm._e()],1),_c('div',{staticClass:"van-switch__bg"})])}
	var switch_staticRenderFns = []
	var switch_esExports = { render: switch_render, staticRenderFns: switch_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_switch = (switch_esExports);
	// CONCATENATED MODULE: ./packages/switch/index.vue
	var switch_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var switch___vue_template_functional__ = false
	/* styles */
	var switch___vue_styles__ = null
	/* scopeId */
	var switch___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var switch___vue_module_identifier__ = null
	var switch_Component = switch_normalizeComponent(
	  selectortype_script_index_0_packages_switch,
	  selectortype_template_index_0_packages_switch,
	  switch___vue_template_functional__,
	  switch___vue_styles__,
	  switch___vue_scopeId__,
	  switch___vue_module_identifier__
	)

	/* harmony default export */ var packages_switch = (switch_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/switch-cell/index.vue
	//
	//
	//
	//
	//
	//





	/* harmony default export */ var switch_cell = (Object(utils["b" /* create */])({
	  name: 'van-switch-cell',

	  components: {
	    Cell: packages_cell,
	    VanSwitch: packages_switch
	  },

	  props: {
	    title: String,
	    value: Boolean,
	    loading: Boolean,
	    disabled: Boolean
	  },

	  watch: {
	    value: function value() {
	      this.$emit('change', this.value);
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-26ef72f1","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/switch-cell/index.vue
	var switch_cell_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('cell',{staticClass:"van-switch-cell",attrs:{"title":_vm.title}},[_c('van-switch',_vm._b({on:{"input":function($event){_vm.$emit('input', $event)}}},'van-switch',_vm.$props,false))],1)}
	var switch_cell_staticRenderFns = []
	var switch_cell_esExports = { render: switch_cell_render, staticRenderFns: switch_cell_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_switch_cell = (switch_cell_esExports);
	// CONCATENATED MODULE: ./packages/switch-cell/index.vue
	var switch_cell_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var switch_cell___vue_template_functional__ = false
	/* styles */
	var switch_cell___vue_styles__ = null
	/* scopeId */
	var switch_cell___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var switch_cell___vue_module_identifier__ = null
	var switch_cell_Component = switch_cell_normalizeComponent(
	  switch_cell,
	  selectortype_template_index_0_packages_switch_cell,
	  switch_cell___vue_template_functional__,
	  switch_cell___vue_styles__,
	  switch_cell___vue_scopeId__,
	  switch_cell___vue_module_identifier__
	)

	/* harmony default export */ var packages_switch_cell = (switch_cell_Component.exports);

	// CONCATENATED MODULE: ./packages/utils/validate/mobile.js
	function mobile(value) {
	  return (/^((\+86)|(86))?(1)\d{10}$/.test(value) || /^\+?(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1|)-?\d{1,14}$/.test(String(value))
	  );
	}
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/address-edit/index.vue

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//














	/* harmony default export */ var address_edit = (Object(utils["b" /* create */])({
	  name: 'van-address-edit',

	  components: {
	    Field: packages_field,
	    Cell: packages_cell,
	    CellGroup: packages_cell_group,
	    SwitchCell: packages_switch_cell,
	    VanButton: packages_button,
	    Popup: packages_popup,
	    VanArea: packages_area,
	    AddressEditDetail: packages_address_edit_Detail
	  },

	  props: {
	    isSaving: Boolean,
	    isDeleting: Boolean,
	    areaList: Object,
	    showPostal: Boolean,
	    showSetDefault: Boolean,
	    showSearchResult: Boolean,
	    addressText: String,
	    addressInfo: {
	      type: Object,
	      default: function _default() {
	        return {
	          name: '',
	          tel: '',
	          province: '',
	          city: '',
	          county: '',
	          area_code: '',
	          postal_code: '',
	          address_detail: '',
	          is_default: false
	        };
	      }
	    },
	    searchResult: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    }
	  },

	  data: function data() {
	    return {
	      showAreaSelect: false,
	      currentInfo: this.addressInfo,
	      isEdit: !!this.addressInfo.id,
	      detailFocused: false,
	      errorInfo: {
	        name: false,
	        tel: false,
	        address_detail: false,
	        postal_code: false
	      }
	    };
	  },


	  watch: {
	    addressInfo: {
	      handler: function handler(val) {
	        this.currentInfo = val;
	        this.isEdit = !!val.id;
	      },

	      deep: true
	    }
	  },

	  computed: {
	    // hide bottom field when use search && detail get focused
	    hideBottomFields: function hideBottomFields() {
	      return this.searchResult.length && this.detailFocused;
	    },
	    computedAddressText: function computedAddressText() {
	      return this.addressText || this.$t('addressText');
	    }
	  },

	  methods: {
	    onFocus: function onFocus(key) {
	      this.errorInfo[key] = false;
	      this.detailFocused = key === 'address_detail';
	    },
	    onDetailBlur: function onDetailBlur() {
	      this.detailFocused = false;
	    },
	    onChangeDetail: function onChangeDetail(val) {
	      this.currentInfo.address_detail = val;
	      this.$emit('change-detail', val);
	    },
	    onAreaConfirm: function onAreaConfirm(values) {
	      if (values.length !== 3 || +values[0].code === -1 || +values[1].code === -1 || +values[2].code === -1) {
	        return packages_toast(this.$t('areaWrong'));
	      }
	      assign_default()(this.currentInfo, {
	        province: values[0].name,
	        city: values[1].name,
	        county: values[2].name,
	        area_code: values[2].code
	      });
	      this.showAreaSelect = false;
	    },
	    onSaveAddress: function onSaveAddress() {
	      var _this = this;

	      var items = ['name', 'tel', 'area_code', 'address_detail'];

	      if (this.showPostal) {
	        items.push('postal_code');
	      }

	      var isValid = items.every(function (item) {
	        var msg = _this.getErrorMessageByKey(item);
	        if (msg) {
	          _this.errorInfo[item] = true;
	          packages_toast(msg);
	        }
	        return !msg;
	      });

	      if (isValid && !this.isSaving) {
	        this.$emit('save', this.currentInfo);
	      }
	    },
	    getErrorMessageByKey: function getErrorMessageByKey(key) {
	      var value = this.currentInfo[key];
	      var $t = this.$t;


	      switch (key) {
	        case 'name':
	          return value ? value.length <= 15 ? '' : $t('nameOverlimit') : $t('nameEmpty');
	        case 'tel':
	          return mobile(value) ? '' : $t('telWrong');
	        case 'area_code':
	          return value ? +value !== -1 ? '' : $t('areaWrong') : $t('areaEmpty');
	        case 'address_detail':
	          return value ? value.length <= 200 ? '' : $t('addressOverlimit') : $t('addressEmpty');
	        case 'postal_code':
	          return value && !/^\d{6}$/.test(value) ? $t('postalEmpty') : '';
	      }
	    },
	    onDeleteAddress: function onDeleteAddress() {
	      var _this2 = this;

	      if (this.isDeleting) {
	        return;
	      }

	      packages_dialog.confirm({
	        message: this.$t('confirmDelete', this.computedAddressText)
	      }).then(function () {
	        _this2.$emit('delete', _this2.currentInfo);
	      });
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-721119fa","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/address-edit/index.vue
	var address_edit_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-address-edit"},[_c('cell-group',[_c('field',{attrs:{"maxlength":"15","placeholder":_vm.$t('placeholder.name'),"label":_vm.$t('label.name', _vm.computedAddressText),"error":_vm.errorInfo.name},on:{"focus":function($event){_vm.onFocus('name')}},model:{value:(_vm.currentInfo.name),callback:function ($$v) {_vm.$set(_vm.currentInfo, "name", $$v)},expression:"currentInfo.name"}}),_c('field',{attrs:{"type":"tel","label":_vm.$t('label.tel'),"placeholder":_vm.$t('placeholder.tel'),"error":_vm.errorInfo.tel},on:{"focus":function($event){_vm.onFocus('tel')}},model:{value:(_vm.currentInfo.tel),callback:function ($$v) {_vm.$set(_vm.currentInfo, "tel", $$v)},expression:"currentInfo.tel"}}),_c('cell',{staticClass:"van-address-edit__area",attrs:{"title":_vm.$t('areaTitle')},on:{"click":function($event){_vm.showAreaSelect = true}}},[_c('span',[_vm._v(_vm._s(_vm.currentInfo.province || _vm.$t('placeholder.province')))]),_c('span',[_vm._v(_vm._s(_vm.currentInfo.city || _vm.$t('placeholder.city')))]),_c('span',[_vm._v(_vm._s(_vm.currentInfo.county || _vm.$t('placeholder.county')))])]),_c('address-edit-detail',{attrs:{"value":_vm.currentInfo.address_detail,"isError":_vm.errorInfo.address_detail,"showSearchResult":_vm.showSearchResult,"searchResult":_vm.searchResult},on:{"focus":function($event){_vm.onFocus('address_detail')},"blur":_vm.onDetailBlur,"input":_vm.onChangeDetail}}),(_vm.showPostal)?_c('field',{directives:[{name:"show",rawName:"v-show",value:(!_vm.hideBottomFields),expression:"!hideBottomFields"}],staticClass:"van-hairline--top",attrs:{"type":"tel","label":_vm.$t('label.postal'),"placeholder":_vm.$t('placeholder.postal'),"maxlength":"6","error":_vm.errorInfo.postal_code},on:{"focus":function($event){_vm.onFocus('postal_code')}},model:{value:(_vm.currentInfo.postal_code),callback:function ($$v) {_vm.$set(_vm.currentInfo, "postal_code", $$v)},expression:"currentInfo.postal_code"}}):_vm._e(),(_vm.showSetDefault)?_c('switch-cell',{directives:[{name:"show",rawName:"v-show",value:(!_vm.hideBottomFields),expression:"!hideBottomFields"}],attrs:{"title":_vm.$t('defaultAddress', _vm.computedAddressText)},model:{value:(_vm.currentInfo.is_default),callback:function ($$v) {_vm.$set(_vm.currentInfo, "is_default", $$v)},expression:"currentInfo.is_default"}}):_vm._e()],1),_c('div',{directives:[{name:"show",rawName:"v-show",value:(!_vm.hideBottomFields),expression:"!hideBottomFields"}],staticClass:"van-address-edit__buttons"},[_c('van-button',{attrs:{"block":"","loading":_vm.isSaving,"type":"primary"},on:{"click":_vm.onSaveAddress}},[_vm._v("\n      "+_vm._s(_vm.$t('save'))+"\n    ")]),(_vm.isEdit)?_c('van-button',{attrs:{"block":"","loading":_vm.isDeleting},on:{"click":_vm.onDeleteAddress}},[_vm._v("\n      "+_vm._s(_vm.$t('deleteAddress', _vm.computedAddressText))+"\n    ")]):_vm._e()],1),_c('popup',{attrs:{"position":"bottom"},model:{value:(_vm.showAreaSelect),callback:function ($$v) {_vm.showAreaSelect=$$v},expression:"showAreaSelect"}},[_c('van-area',{attrs:{"value":_vm.currentInfo.area_code,"areaList":_vm.areaList},on:{"confirm":_vm.onAreaConfirm,"cancel":function($event){_vm.showAreaSelect = false}}})],1)],1)}
	var address_edit_staticRenderFns = []
	var address_edit_esExports = { render: address_edit_render, staticRenderFns: address_edit_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_address_edit = (address_edit_esExports);
	// CONCATENATED MODULE: ./packages/address-edit/index.vue
	var address_edit_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var address_edit___vue_template_functional__ = false
	/* styles */
	var address_edit___vue_styles__ = null
	/* scopeId */
	var address_edit___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var address_edit___vue_module_identifier__ = null
	var address_edit_Component = address_edit_normalizeComponent(
	  address_edit,
	  selectortype_template_index_0_packages_address_edit,
	  address_edit___vue_template_functional__,
	  address_edit___vue_styles__,
	  address_edit___vue_scopeId__,
	  address_edit___vue_module_identifier__
	)

	/* harmony default export */ var packages_address_edit = (address_edit_Component.exports);

	// CONCATENATED MODULE: ./packages/mixins/find-parent.js
	/**
	 * find parent component by name
	 */

	/* harmony default export */ var find_parent = ({
	  methods: {
	    findParentByName: function findParentByName(name) {
	      if (!this.parentGroup) {
	        var parent = this.$parent;
	        while (parent) {
	          if (parent.$options.name === name) {
	            this.parentGroup = parent;
	            break;
	          }
	          parent = parent.$parent;
	        }
	      }

	      return this.parentGroup;
	    }
	  }
	});
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/radio/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var selectortype_script_index_0_packages_radio = (Object(utils["b" /* create */])({
	  name: 'van-radio',

	  mixins: [find_parent],

	  props: {
	    value: {},
	    disabled: Boolean,
	    name: [String, Number]
	  },

	  computed: {
	    isGroup: function isGroup() {
	      return !!this.findParentByName('van-radio-group');
	    },


	    currentValue: {
	      get: function get() {
	        return this.isGroup && this.parentGroup ? this.parentGroup.value : this.value;
	      },
	      set: function set(val) {
	        if (this.isGroup && this.parentGroup) {
	          this.parentGroup.$emit('input', val);
	        } else {
	          this.$emit('input', val);
	        }
	      }
	    },

	    isDisabled: function isDisabled() {
	      return this.isGroup && this.parentGroup ? this.parentGroup.disabled || this.disabled : this.disabled;
	    }
	  },

	  methods: {
	    handleLabelClick: function handleLabelClick() {
	      if (this.isDisabled) {
	        return;
	      }
	      this.currentValue = this.name;
	    },
	    handleRadioClick: function handleRadioClick() {
	      this.$emit('click');
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-4247c9a2","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/radio/index.vue
	var radio_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-radio",class:{ 'van-radio--disabled': _vm.isDisabled },on:{"click":_vm.handleRadioClick}},[_c('span',{staticClass:"van-radio__input"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.currentValue),expression:"currentValue"}],staticClass:"van-radio__control",attrs:{"type":"radio","disabled":_vm.isDisabled},domProps:{"value":_vm.name,"checked":_vm._q(_vm.currentValue,_vm.name)},on:{"change":function($event){_vm.currentValue=_vm.name}}}),_c('icon',{attrs:{"name":_vm.currentValue === _vm.name ? 'checked' : 'check'}})],1),_c('span',{staticClass:"van-radio__label",on:{"click":_vm.handleLabelClick}},[_vm._t("default")],2)])}
	var radio_staticRenderFns = []
	var radio_esExports = { render: radio_render, staticRenderFns: radio_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_radio = (radio_esExports);
	// CONCATENATED MODULE: ./packages/radio/index.vue
	var radio_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var radio___vue_template_functional__ = false
	/* styles */
	var radio___vue_styles__ = null
	/* scopeId */
	var radio___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var radio___vue_module_identifier__ = null
	var radio_Component = radio_normalizeComponent(
	  selectortype_script_index_0_packages_radio,
	  selectortype_template_index_0_packages_radio,
	  radio___vue_template_functional__,
	  radio___vue_styles__,
	  radio___vue_scopeId__,
	  radio___vue_module_identifier__
	)

	/* harmony default export */ var packages_radio = (radio_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/radio-group/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var radio_group = (Object(utils["b" /* create */])({
	  name: 'van-radio-group',

	  props: {
	    value: {},
	    disabled: Boolean
	  },

	  watch: {
	    value: function value(_value) {
	      this.$emit('change', _value);
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-b8238e50","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/radio-group/index.vue
	var radio_group_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-radio-group"},[_vm._t("default")],2)}
	var radio_group_staticRenderFns = []
	var radio_group_esExports = { render: radio_group_render, staticRenderFns: radio_group_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_radio_group = (radio_group_esExports);
	// CONCATENATED MODULE: ./packages/radio-group/index.vue
	var radio_group_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var radio_group___vue_template_functional__ = false
	/* styles */
	var radio_group___vue_styles__ = null
	/* scopeId */
	var radio_group___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var radio_group___vue_module_identifier__ = null
	var radio_group_Component = radio_group_normalizeComponent(
	  radio_group,
	  selectortype_template_index_0_packages_radio_group,
	  radio_group___vue_template_functional__,
	  radio_group___vue_styles__,
	  radio_group___vue_scopeId__,
	  radio_group___vue_module_identifier__
	)

	/* harmony default export */ var packages_radio_group = (radio_group_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/address-list/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//







	/* harmony default export */ var address_list = (Object(utils["b" /* create */])({
	  name: 'van-address-list',

	  components: {
	    Cell: packages_cell,
	    Radio: packages_radio,
	    CellGroup: packages_cell_group,
	    RadioGroup: packages_radio_group
	  },

	  props: {
	    value: [String, Number],
	    list: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    },
	    addButtonText: {
	      type: String,
	      default: '新增收货地址'
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-4061e7bd","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/address-list/index.vue
	var address_list_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-address-list"},[_c('radio-group',{staticClass:"van-address-list__group",attrs:{"value":_vm.value},on:{"input":function($event){_vm.$emit('input', $event)}}},[_c('cell-group',_vm._l((_vm.list),function(item,index){return _c('cell',{key:item.id},[_c('radio',{attrs:{"name":item.id},on:{"click":function($event){_vm.$emit('select', item, index)}}},[_c('div',{staticClass:"van-address-list__name"},[_vm._v(_vm._s(item.name)+"，"+_vm._s(item.tel))]),_c('div',{staticClass:"van-address-list__address"},[_vm._v("收货地址："+_vm._s(item.address))])]),_c('icon',{staticClass:"van-address-list__edit",attrs:{"name":"edit"},on:{"click":function($event){_vm.$emit('edit', item, index)}}})],1)}))],1),_c('cell',{staticClass:"van-address-list__add van-hairline--top",attrs:{"icon":"add","title":_vm.addButtonText,"isLink":""},on:{"click":function($event){_vm.$emit('add')}}})],1)}
	var address_list_staticRenderFns = []
	var address_list_esExports = { render: address_list_render, staticRenderFns: address_list_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_address_list = (address_list_esExports);
	// CONCATENATED MODULE: ./packages/address-list/index.vue
	var address_list_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var address_list___vue_template_functional__ = false
	/* styles */
	var address_list___vue_styles__ = null
	/* scopeId */
	var address_list___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var address_list___vue_module_identifier__ = null
	var address_list_Component = address_list_normalizeComponent(
	  address_list,
	  selectortype_template_index_0_packages_address_list,
	  address_list___vue_template_functional__,
	  address_list___vue_styles__,
	  address_list___vue_scopeId__,
	  address_list___vue_module_identifier__
	)

	/* harmony default export */ var packages_address_list = (address_list_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/badge/index.vue
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var badge = (Object(utils["b" /* create */])({
	  name: 'van-badge',

	  props: {
	    url: String,
	    info: String,
	    title: String
	  },

	  beforeCreate: function beforeCreate() {
	    this.$parent.badges.push(this);
	  },


	  computed: {
	    isSelect: function isSelect() {
	      return this.$parent.badges.indexOf(this) === this.$parent.activeKey;
	    }
	  },

	  methods: {
	    onClick: function onClick() {
	      this.$emit('click', this.$parent.badges.indexOf(this));
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-c81d33e2","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/badge/index.vue
	var badge_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('a',{staticClass:"van-badge van-hairline",class:{ 'van-badge--select': _vm.isSelect },attrs:{"href":_vm.url},on:{"click":_vm.onClick}},[(_vm.info)?_c('div',{staticClass:"van-badge__info"},[_vm._v(_vm._s(_vm.info))]):_vm._e(),_vm._v("\n  "+_vm._s(_vm.title)+"\n")])}
	var badge_staticRenderFns = []
	var badge_esExports = { render: badge_render, staticRenderFns: badge_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_badge = (badge_esExports);
	// CONCATENATED MODULE: ./packages/badge/index.vue
	var badge_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var badge___vue_template_functional__ = false
	/* styles */
	var badge___vue_styles__ = null
	/* scopeId */
	var badge___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var badge___vue_module_identifier__ = null
	var badge_Component = badge_normalizeComponent(
	  badge,
	  selectortype_template_index_0_packages_badge,
	  badge___vue_template_functional__,
	  badge___vue_styles__,
	  badge___vue_scopeId__,
	  badge___vue_module_identifier__
	)

	/* harmony default export */ var packages_badge = (badge_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/badge-group/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var badge_group = (Object(utils["b" /* create */])({
	  name: 'van-badge-group',

	  props: {
	    activeKey: {
	      type: [Number, String],
	      default: 0
	    }
	  },

	  data: function data() {
	    return {
	      badges: []
	    };
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-9d0d7584","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/badge-group/index.vue
	var badge_group_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-badge-group van-hairline--top-bottom"},[_vm._t("default")],2)}
	var badge_group_staticRenderFns = []
	var badge_group_esExports = { render: badge_group_render, staticRenderFns: badge_group_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_badge_group = (badge_group_esExports);
	// CONCATENATED MODULE: ./packages/badge-group/index.vue
	var badge_group_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var badge_group___vue_template_functional__ = false
	/* styles */
	var badge_group___vue_styles__ = null
	/* scopeId */
	var badge_group___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var badge_group___vue_module_identifier__ = null
	var badge_group_Component = badge_group_normalizeComponent(
	  badge_group,
	  selectortype_template_index_0_packages_badge_group,
	  badge_group___vue_template_functional__,
	  badge_group___vue_styles__,
	  badge_group___vue_scopeId__,
	  badge_group___vue_module_identifier__
	)

	/* harmony default export */ var packages_badge_group = (badge_group_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/card/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var card = (Object(utils["b" /* create */])({
	  name: 'van-card',

	  props: {
	    thumb: String,
	    title: String,
	    desc: String,
	    centered: Boolean,
	    num: [Number, String],
	    price: [Number, String]
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-a9b38bb8","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/card/index.vue
	var card_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-card",class:{ 'van-card--center': _vm.centered }},[_c('div',{staticClass:"van-card__thumb"},[_vm._t("thumb",[_c('img',{staticClass:"van-card__img",attrs:{"src":_vm.thumb}})])],2),_c('div',{staticClass:"van-card__content"},[_vm._t("title",[(_vm.title || _vm.price !== undefined)?_c('div',{staticClass:"van-card__row"},[(_vm.title)?_c('div',{staticClass:"van-card__title"},[_vm._v(_vm._s(_vm.title))]):_vm._e(),(_vm.price !== undefined)?_c('div',{staticClass:"van-card__price"},[_vm._v("¥ "+_vm._s(_vm.price))]):_vm._e()]):_vm._e()]),_vm._t("desc",[(_vm.desc || _vm.num !== undefined)?_c('div',{staticClass:"van-card__row"},[(_vm.desc)?_c('div',{staticClass:"van-card__desc"},[_vm._v(_vm._s(_vm.desc))]):_vm._e(),(_vm.num !== undefined)?_c('div',{staticClass:"van-card__num"},[_vm._v("x "+_vm._s(_vm.num))]):_vm._e()]):_vm._e()]),_vm._t("tags")],2),(_vm.$slots.footer)?_c('div',{staticClass:"van-card__footer"},[_vm._t("footer")],2):_vm._e()])}
	var card_staticRenderFns = []
	var card_esExports = { render: card_render, staticRenderFns: card_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_card = (card_esExports);
	// CONCATENATED MODULE: ./packages/card/index.vue
	var card_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var card___vue_template_functional__ = false
	/* styles */
	var card___vue_styles__ = null
	/* scopeId */
	var card___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var card___vue_module_identifier__ = null
	var card_Component = card_normalizeComponent(
	  card,
	  selectortype_template_index_0_packages_card,
	  card___vue_template_functional__,
	  card___vue_styles__,
	  card___vue_scopeId__,
	  card___vue_module_identifier__
	)

	/* harmony default export */ var packages_card = (card_Component.exports);

	// CONCATENATED MODULE: ./packages/utils/clickoutside.js
	/**
	 * v-clickoutside
	 *
	 * ```vue
	 * <div v-clickoutside="onClose">
	 * ```
	 */



	var clickoutside_context = '@@clickoutsideContext';

	/* harmony default export */ var clickoutside = ({
	  bind: function bind(el, binding) {
	    var handler = function handler(event) {
	      if (!el.contains(event.target)) {
	        el[clickoutside_context].callback();
	      }
	    };

	    el[clickoutside_context] = {
	      handler: handler,
	      callback: binding.value,
	      arg: binding.arg || 'click'
	    };

	    !utils["f" /* isServer */] && document.addEventListener(el[clickoutside_context].arg, handler);
	  },
	  update: function update(el, binding) {
	    el[clickoutside_context].callback = binding.value;
	  },
	  unbind: function unbind(el) {
	    !utils["f" /* isServer */] && document.removeEventListener(el[clickoutside_context].arg, el[clickoutside_context].handler);
	  },
	  install: function install(Vue) {
	    Vue.directive('clickoutside', {
	      bind: this.bind,
	      unbind: this.unbind
	    });
	  }
	});
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/cell-swipe/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var cell_swipe = (Object(utils["b" /* create */])({
	  name: 'van-cell-swipe',

	  props: {
	    onClose: Function,
	    leftWidth: {
	      type: Number,
	      default: 0
	    },
	    rightWidth: {
	      type: Number,
	      default: 0
	    }
	  },

	  directives: {
	    Clickoutside: clickoutside
	  },

	  data: function data() {
	    return {
	      offset: 0
	    };
	  },


	  computed: {
	    wrapperStyle: function wrapperStyle() {
	      return {
	        transform: 'translate3d(' + this.offset + 'px, 0, 0)'
	      };
	    }
	  },

	  methods: {
	    close: function close() {
	      this.offset = 0;
	    },
	    resetSwipeStatus: function resetSwipeStatus() {
	      this.swiping = false;
	      this.opened = true;
	    },
	    swipeMove: function swipeMove() {
	      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

	      this.offset = offset;
	      offset && (this.swiping = true);
	    },
	    swipeLeaveTransition: function swipeLeaveTransition(direction) {
	      var offset = this.offset,
	          leftWidth = this.leftWidth,
	          rightWidth = this.rightWidth;
	      // right

	      if (direction > 0 && -offset > rightWidth * 0.4 && rightWidth > 0) {
	        this.swipeMove(-rightWidth);
	        this.resetSwipeStatus();
	        // left
	      } else if (direction < 0 && offset > leftWidth * 0.4 && leftWidth > 0) {
	        this.swipeMove(leftWidth);
	        this.resetSwipeStatus();
	      } else {
	        this.swipeMove();
	      }
	    },
	    startDrag: function startDrag(event) {
	      this.startX = event.touches[0].pageX;
	      this.startY = event.touches[0].pageY;
	    },
	    onDrag: function onDrag(event) {
	      if (this.opened) {
	        !this.swiping && this.swipeMove();
	        this.opened = false;
	        return;
	      }

	      var offsetTop = event.touches[0].pageY - this.startY;
	      var offsetLeft = event.touches[0].pageX - this.startX;
	      if (offsetLeft < 0 && -offsetLeft > this.rightWidth || offsetLeft > 0 && offsetLeft > this.leftWidth || offsetLeft > 0 && !this.leftWidth || offsetLeft < 0 && !this.rightWidth) {
	        return;
	      }

	      var y = Math.abs(offsetTop);
	      var x = Math.abs(offsetLeft);
	      var swiping = !(x < 5 || x >= 5 && y >= x * 1.73);
	      if (swiping) {
	        event.preventDefault();
	        this.swipeMove(offsetLeft);
	      };
	    },
	    endDrag: function endDrag() {
	      if (this.swiping) {
	        this.swipeLeaveTransition(this.offset > 0 ? -1 : 1);
	      };
	    },
	    onClick: function onClick() {
	      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'outside';

	      if (!this.offset) {
	        return;
	      }

	      if (this.onClose) {
	        this.onClose(position, this);
	      } else {
	        this.swipeMove(0);
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-15eee0e6","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/cell-swipe/index.vue
	var cell_swipe_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{directives:[{name:"clickoutside",rawName:"v-clickoutside:touchstart",value:(_vm.onClick),expression:"onClick",arg:"touchstart"}],staticClass:"van-cell-swipe",on:{"click":function($event){_vm.onClick('cell')},"touchstart":_vm.startDrag,"touchmove":_vm.onDrag,"touchend":_vm.endDrag,"touchcancel":_vm.endDrag}},[_c('div',{staticClass:"van-cell-swipe__wrapper",style:(_vm.wrapperStyle),on:{"transitionend":function($event){_vm.swipe = false}}},[(_vm.leftWidth)?_c('div',{staticClass:"van-cell-swipe__left",on:{"click":function($event){$event.stopPropagation();_vm.onClick('left')}}},[_vm._t("left")],2):_vm._e(),_vm._t("default"),(_vm.rightWidth)?_c('div',{staticClass:"van-cell-swipe__right",on:{"click":function($event){$event.stopPropagation();_vm.onClick('right')}}},[_vm._t("right")],2):_vm._e()],2)])}
	var cell_swipe_staticRenderFns = []
	var cell_swipe_esExports = { render: cell_swipe_render, staticRenderFns: cell_swipe_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_cell_swipe = (cell_swipe_esExports);
	// CONCATENATED MODULE: ./packages/cell-swipe/index.vue
	var cell_swipe_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var cell_swipe___vue_template_functional__ = false
	/* styles */
	var cell_swipe___vue_styles__ = null
	/* scopeId */
	var cell_swipe___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var cell_swipe___vue_module_identifier__ = null
	var cell_swipe_Component = cell_swipe_normalizeComponent(
	  cell_swipe,
	  selectortype_template_index_0_packages_cell_swipe,
	  cell_swipe___vue_template_functional__,
	  cell_swipe___vue_styles__,
	  cell_swipe___vue_scopeId__,
	  cell_swipe___vue_module_identifier__
	)

	/* harmony default export */ var packages_cell_swipe = (cell_swipe_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/checkbox/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var selectortype_script_index_0_packages_checkbox = (Object(utils["b" /* create */])({
	  name: 'van-checkbox',

	  mixins: [find_parent],

	  props: {
	    value: {},
	    disabled: Boolean,
	    name: [String, Number],
	    shape: {
	      type: String,
	      default: 'round'
	    }
	  },

	  watch: {
	    value: function value(val) {
	      this.$emit('change', val);
	    }
	  },

	  computed: {
	    // whether is in van-checkbox-group
	    isGroup: function isGroup() {
	      return !!this.findParentByName('van-checkbox-group');
	    },


	    currentValue: {
	      get: function get() {
	        return this.isGroup && this.parentGroup ? this.parentGroup.value.indexOf(this.name) !== -1 : this.value;
	      },
	      set: function set(val) {
	        if (this.isGroup && this.parentGroup) {
	          var parentValue = this.parentGroup.value.slice();
	          if (val) {
	            /* istanbul ignore else */
	            if (parentValue.indexOf(this.name) === -1) {
	              parentValue.push(this.name);
	              this.parentGroup.$emit('input', parentValue);
	            }
	          } else {
	            var index = parentValue.indexOf(this.name);
	            /* istanbul ignore else */
	            if (index !== -1) {
	              parentValue.splice(index, 1);
	              this.parentGroup.$emit('input', parentValue);
	            }
	          }
	        } else {
	          this.$emit('input', val);
	        }
	      }
	    },

	    isChecked: function isChecked() {
	      var currentValue = this.currentValue;

	      if ({}.toString.call(currentValue) === '[object Boolean]') {
	        return currentValue;
	      } else if (currentValue !== null && currentValue !== undefined) {
	        return currentValue === this.name;
	      }
	    },
	    isDisabled: function isDisabled() {
	      return this.isGroup && this.parentGroup ? this.parentGroup.disabled : this.disabled;
	    }
	  },

	  methods: {
	    onClickLabel: function onClickLabel() {
	      if (!this.isDisabled) {
	        this.currentValue = !this.currentValue;
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-aa796210","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/checkbox/index.vue
	var checkbox_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-checkbox",class:[
	    ("van-checkbox--" + _vm.shape), {
	    'van-checkbox--disabled': _vm.isDisabled
	  }]},[_c('span',{staticClass:"van-checkbox__input"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.currentValue),expression:"currentValue"}],staticClass:"van-checkbox__control",attrs:{"type":"checkbox","disabled":_vm.isDisabled},domProps:{"checked":Array.isArray(_vm.currentValue)?_vm._i(_vm.currentValue,null)>-1:(_vm.currentValue)},on:{"change":function($event){var $$a=_vm.currentValue,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.currentValue=$$a.concat([$$v]))}else{$$i>-1&&(_vm.currentValue=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}}else{_vm.currentValue=$$c}}}}),_c('icon',{attrs:{"name":"success"}})],1),_c('span',{staticClass:"van-checkbox__label",on:{"click":_vm.onClickLabel}},[_vm._t("default")],2)])}
	var checkbox_staticRenderFns = []
	var checkbox_esExports = { render: checkbox_render, staticRenderFns: checkbox_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_checkbox = (checkbox_esExports);
	// CONCATENATED MODULE: ./packages/checkbox/index.vue
	var checkbox_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var checkbox___vue_template_functional__ = false
	/* styles */
	var checkbox___vue_styles__ = null
	/* scopeId */
	var checkbox___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var checkbox___vue_module_identifier__ = null
	var checkbox_Component = checkbox_normalizeComponent(
	  selectortype_script_index_0_packages_checkbox,
	  selectortype_template_index_0_packages_checkbox,
	  checkbox___vue_template_functional__,
	  checkbox___vue_styles__,
	  checkbox___vue_scopeId__,
	  checkbox___vue_module_identifier__
	)

	/* harmony default export */ var packages_checkbox = (checkbox_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/checkbox-group/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var checkbox_group = (Object(utils["b" /* create */])({
	  name: 'van-checkbox-group',

	  props: {
	    value: {},
	    disabled: Boolean
	  },

	  watch: {
	    value: function value(val) {
	      this.$emit('change', val);
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-188d7df0","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/checkbox-group/index.vue
	var checkbox_group_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-checkbox-group"},[_vm._t("default")],2)}
	var checkbox_group_staticRenderFns = []
	var checkbox_group_esExports = { render: checkbox_group_render, staticRenderFns: checkbox_group_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_checkbox_group = (checkbox_group_esExports);
	// CONCATENATED MODULE: ./packages/checkbox-group/index.vue
	var checkbox_group_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var checkbox_group___vue_template_functional__ = false
	/* styles */
	var checkbox_group___vue_styles__ = null
	/* scopeId */
	var checkbox_group___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var checkbox_group___vue_module_identifier__ = null
	var checkbox_group_Component = checkbox_group_normalizeComponent(
	  checkbox_group,
	  selectortype_template_index_0_packages_checkbox_group,
	  checkbox_group___vue_template_functional__,
	  checkbox_group___vue_styles__,
	  checkbox_group___vue_scopeId__,
	  checkbox_group___vue_module_identifier__
	)

	/* harmony default export */ var packages_checkbox_group = (checkbox_group_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/col/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var col = (Object(utils["b" /* create */])({
	  name: 'van-col',

	  props: {
	    span: [Number, String],
	    offset: [Number, String]
	  },

	  computed: {
	    gutter: function gutter() {
	      return this.$parent && Number(this.$parent.gutter) || 0;
	    },
	    style: function style() {
	      var padding = this.gutter / 2 + 'px';
	      return this.gutter ? { paddingLeft: padding, paddingRight: padding } : {};
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-6cf8f374","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/col/index.vue
	var col_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-col",class:( _obj = {}, _obj[("van-col-" + _vm.span)] = _vm.span, _obj[("van-col-offset-" + _vm.offset)] = _vm.offset, _obj ),style:(_vm.style)},[_vm._t("default")],2)
	var _obj;}
	var col_staticRenderFns = []
	var col_esExports = { render: col_render, staticRenderFns: col_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_col = (col_esExports);
	// CONCATENATED MODULE: ./packages/col/index.vue
	var col_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var col___vue_template_functional__ = false
	/* styles */
	var col___vue_styles__ = null
	/* scopeId */
	var col___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var col___vue_module_identifier__ = null
	var col_Component = col_normalizeComponent(
	  col,
	  selectortype_template_index_0_packages_col,
	  col___vue_template_functional__,
	  col___vue_styles__,
	  col___vue_scopeId__,
	  col___vue_module_identifier__
	)

	/* harmony default export */ var packages_col = (col_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/contact-card/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var contact_card = (Object(utils["b" /* create */])({
	  name: 'van-contact-card',

	  props: {
	    tel: String,
	    name: String,
	    addText: String,
	    type: {
	      type: String,
	      default: 'add'
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-2ec578a7","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/contact-card/index.vue
	var contact_card_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',_vm._g({staticClass:"van-contact-card",class:("van-contact-card--" + _vm.type)},_vm.$listeners),[_c('div',{staticClass:"van-contact-card__content"},[(_vm.type === 'add')?[_c('icon',{staticClass:"van-contact-card__icon",attrs:{"name":"add2"}}),_c('div',{staticClass:"van-contact-card__text"},[_vm._v(_vm._s(_vm.addText || _vm.$t('addText')))])]:(_vm.type === 'edit')?[_c('icon',{staticClass:"van-contact-card__icon",attrs:{"name":"contact"}}),_c('div',{staticClass:"van-contact-card__text"},[_c('div',[_vm._v(_vm._s(_vm.$t('name'))+"："+_vm._s(_vm.name))]),_c('div',[_vm._v(_vm._s(_vm.$t('tel'))+"："+_vm._s(_vm.tel))])])]:_vm._e()],2),_c('icon',{staticClass:"van-contact-card__arrow",attrs:{"name":"arrow"}})],1)}
	var contact_card_staticRenderFns = []
	var contact_card_esExports = { render: contact_card_render, staticRenderFns: contact_card_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_contact_card = (contact_card_esExports);
	// CONCATENATED MODULE: ./packages/contact-card/index.vue
	var contact_card_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var contact_card___vue_template_functional__ = false
	/* styles */
	var contact_card___vue_styles__ = null
	/* scopeId */
	var contact_card___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var contact_card___vue_module_identifier__ = null
	var contact_card_Component = contact_card_normalizeComponent(
	  contact_card,
	  selectortype_template_index_0_packages_contact_card,
	  contact_card___vue_template_functional__,
	  contact_card___vue_styles__,
	  contact_card___vue_scopeId__,
	  contact_card___vue_module_identifier__
	)

	/* harmony default export */ var packages_contact_card = (contact_card_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/contact-edit/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//









	/* harmony default export */ var contact_edit = (Object(utils["b" /* create */])({
	  name: 'van-contact-edit',

	  components: {
	    Field: packages_field,
	    VanButton: packages_button,
	    CellGroup: packages_cell_group
	  },

	  props: {
	    isEdit: Boolean,
	    isSaving: Boolean,
	    isDeleting: Boolean,
	    contactInfo: {
	      type: Object,
	      default: function _default() {
	        return {
	          id: '',
	          tel: '',
	          name: ''
	        };
	      }
	    }
	  },

	  data: function data() {
	    return {
	      currentInfo: this.contactInfo,
	      errorInfo: {
	        name: false,
	        tel: false
	      }
	    };
	  },


	  watch: {
	    contactInfo: function contactInfo(val) {
	      this.currentInfo = val;
	    }
	  },

	  methods: {
	    onFocus: function onFocus(key) {
	      this.errorInfo[key] = false;
	    },
	    getErrorMessageByKey: function getErrorMessageByKey(key) {
	      var value = this.currentInfo[key];
	      switch (key) {
	        case 'name':
	          return value ? value.length <= 15 ? '' : this.$t('nameOverlimit') : this.$t('nameEmpty');
	        case 'tel':
	          return mobile(value) ? '' : this.$t('telInvalid');
	      }
	    },
	    onSaveContact: function onSaveContact() {
	      var _this = this;

	      var items = ['name', 'tel'];

	      var isValid = items.every(function (item) {
	        var msg = _this.getErrorMessageByKey(item);
	        if (msg) {
	          _this.errorInfo[item] = true;
	          packages_toast(msg);
	        }
	        return !msg;
	      });

	      if (isValid && !this.isSaving) {
	        this.$emit('save', this.currentInfo);
	      }
	    },
	    onDeleteContact: function onDeleteContact() {
	      var _this2 = this;

	      if (this.isDeleting) {
	        return;
	      }

	      packages_dialog.confirm({
	        message: this.$t('confirmDelete')
	      }).then(function () {
	        _this2.$emit('delete', _this2.currentInfo);
	      });
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-738980d4","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/contact-edit/index.vue
	var contact_edit_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-contact-edit"},[_c('cell-group',[_c('field',{attrs:{"maxlength":"30","label":_vm.$t('name'),"placeholder":_vm.$t('namePlaceholder'),"error":_vm.errorInfo.name},on:{"focus":function($event){_vm.onFocus('name')}},model:{value:(_vm.currentInfo.name),callback:function ($$v) {_vm.$set(_vm.currentInfo, "name", $$v)},expression:"currentInfo.name"}}),_c('field',{attrs:{"type":"tel","label":_vm.$t('tel'),"placeholder":_vm.$t('telPlaceholder'),"error":_vm.errorInfo.tel},on:{"focus":function($event){_vm.onFocus('tel')}},model:{value:(_vm.currentInfo.tel),callback:function ($$v) {_vm.$set(_vm.currentInfo, "tel", $$v)},expression:"currentInfo.tel"}})],1),_c('div',{staticClass:"van-contact-edit__buttons"},[_c('van-button',{attrs:{"block":"","loading":_vm.isSaving,"type":"primary"},on:{"click":_vm.onSaveContact}},[_vm._v(_vm._s(_vm.$t('save')))]),(_vm.isEdit)?_c('van-button',{attrs:{"block":"","loading":_vm.isDeleting},on:{"click":_vm.onDeleteContact}},[_vm._v(_vm._s(_vm.$t('delete')))]):_vm._e()],1)],1)}
	var contact_edit_staticRenderFns = []
	var contact_edit_esExports = { render: contact_edit_render, staticRenderFns: contact_edit_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_contact_edit = (contact_edit_esExports);
	// CONCATENATED MODULE: ./packages/contact-edit/index.vue
	var contact_edit_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var contact_edit___vue_template_functional__ = false
	/* styles */
	var contact_edit___vue_styles__ = null
	/* scopeId */
	var contact_edit___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var contact_edit___vue_module_identifier__ = null
	var contact_edit_Component = contact_edit_normalizeComponent(
	  contact_edit,
	  selectortype_template_index_0_packages_contact_edit,
	  contact_edit___vue_template_functional__,
	  contact_edit___vue_styles__,
	  contact_edit___vue_scopeId__,
	  contact_edit___vue_module_identifier__
	)

	/* harmony default export */ var packages_contact_edit = (contact_edit_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/contact-list/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//







	/* harmony default export */ var contact_list = (Object(utils["b" /* create */])({
	  name: 'van-contact-list',

	  components: {
	    Cell: packages_cell,
	    Radio: packages_radio,
	    CellGroup: packages_cell_group,
	    RadioGroup: packages_radio_group
	  },

	  props: {
	    value: {},
	    addText: String,
	    list: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-1f4ae53a","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/contact-list/index.vue
	var contact_list_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-contact-list"},[_c('radio-group',{attrs:{"value":_vm.value},on:{"input":function($event){_vm.$emit('input', $event)}}},[_c('cell-group',_vm._l((_vm.list),function(item,index){return _c('cell',{key:item.id},[_c('radio',{attrs:{"name":item.id},on:{"click":function($event){_vm.$emit('select', item, index)}}},[_c('p',{staticClass:"van-contact-list__text"},[_vm._v(_vm._s(_vm.$t('name'))+"："+_vm._s(item.name))]),_c('p',{staticClass:"van-contact-list__text"},[_vm._v(_vm._s(_vm.$t('tel'))+"："+_vm._s(item.tel))])]),_c('icon',{staticClass:"van-contact-list__edit",attrs:{"name":"edit"},on:{"click":function($event){_vm.$emit('edit', item, index)}}})],1)}))],1),_c('cell',{staticClass:"van-contact-list__add van-hairline--top",attrs:{"icon":"add","title":_vm.addText || _vm.$t('addText'),"isLink":""},on:{"click":function($event){_vm.$emit('add')}}})],1)}
	var contact_list_staticRenderFns = []
	var contact_list_esExports = { render: contact_list_render, staticRenderFns: contact_list_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_contact_list = (contact_list_esExports);
	// CONCATENATED MODULE: ./packages/contact-list/index.vue
	var contact_list_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var contact_list___vue_template_functional__ = false
	/* styles */
	var contact_list___vue_styles__ = null
	/* scopeId */
	var contact_list___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var contact_list___vue_module_identifier__ = null
	var contact_list_Component = contact_list_normalizeComponent(
	  contact_list,
	  selectortype_template_index_0_packages_contact_list,
	  contact_list___vue_template_functional__,
	  contact_list___vue_styles__,
	  contact_list___vue_scopeId__,
	  contact_list___vue_module_identifier__
	)

	/* harmony default export */ var packages_contact_list = (contact_list_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/coupon-cell/index.vue
	//
	//
	//
	//
	//
	//





	/* harmony default export */ var coupon_cell = (Object(utils["b" /* create */])({
	  name: 'van-coupon-cell',

	  components: {
	    Cell: packages_cell,
	    CellGroup: packages_cell_group
	  },

	  model: {
	    prop: 'chosenCoupon'
	  },

	  props: {
	    title: String,
	    coupons: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    },
	    chosenCoupon: {
	      type: Number,
	      default: -1
	    },
	    editable: {
	      type: Boolean,
	      default: true
	    }
	  },

	  computed: {
	    value: function value() {
	      var coupons = this.coupons;

	      var coupon = coupons[this.chosenCoupon];
	      if (coupon) {
	        return '\u7701\uFFE5' + (coupon.value / 100).toFixed(2);
	      }
	      return coupons.length === 0 ? '使用优惠' : '\u60A8\u6709 ' + coupons.length + ' \u4E2A\u53EF\u7528\u4F18\u60E0';
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-5ee25b9a","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/coupon-cell/index.vue
	var coupon_cell_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('cell-group',{staticClass:"van-coupon-cell"},[_c('cell',{attrs:{"title":_vm.title || '优惠券码',"value":_vm.value,"isLink":_vm.editable},on:{"click":function($event){_vm.$emit('click')}}})],1)}
	var coupon_cell_staticRenderFns = []
	var coupon_cell_esExports = { render: coupon_cell_render, staticRenderFns: coupon_cell_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_coupon_cell = (coupon_cell_esExports);
	// CONCATENATED MODULE: ./packages/coupon-cell/index.vue
	var coupon_cell_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var coupon_cell___vue_template_functional__ = false
	/* styles */
	var coupon_cell___vue_styles__ = null
	/* scopeId */
	var coupon_cell___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var coupon_cell___vue_module_identifier__ = null
	var coupon_cell_Component = coupon_cell_normalizeComponent(
	  coupon_cell,
	  selectortype_template_index_0_packages_coupon_cell,
	  coupon_cell___vue_template_functional__,
	  coupon_cell___vue_styles__,
	  coupon_cell___vue_scopeId__,
	  coupon_cell___vue_module_identifier__
	)

	/* harmony default export */ var packages_coupon_cell = (coupon_cell_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/coupon-list/Item.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var Item = (Object(utils["b" /* create */])({
	  name: 'van-coupon-item',

	  props: {
	    data: Object,
	    chosen: Boolean,
	    disabled: Boolean
	  },

	  computed: {
	    validPeriod: function validPeriod() {
	      return this.getDate(this.data.start_at) + '-' + this.getDate(this.data.end_at);
	    },
	    faceAmount: function faceAmount() {
	      return this.data.denominations !== 0 ? '<span>\xA5</span> ' + this.formatAmount(this.data.denominations) : this.data.discount !== 0 ? this.formatDiscount(this.data.discount) : '';
	    },
	    conditionMessage: function conditionMessage() {
	      var condition = this.data.origin_condition;
	      condition = condition % 100 === 0 ? Math.round(condition / 100) : (condition / 100).toFixed(2);
	      return this.data.origin_condition === 0 ? '无使用门槛' : '\u6EE1' + condition + '\u5143\u53EF\u7528';
	    }
	  },

	  methods: {
	    getDate: function getDate(timeStamp) {
	      var date = new Date(timeStamp * 1000);
	      return date.getFullYear() + '.' + this.padZero(date.getMonth() + 1) + '.' + this.padZero(date.getDate());
	    },
	    padZero: function padZero(num) {
	      return (num < 10 ? '0' : '') + num;
	    },
	    formatDiscount: function formatDiscount(discount) {
	      return (discount / 10).toFixed(discount % 10 === 0 ? 0 : 1) + '\u6298';
	    },
	    formatAmount: function formatAmount(amount) {
	      return (amount / 100).toFixed(amount % 100 === 0 ? 0 : amount % 10 === 0 ? 1 : 2);
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-23308d0f","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/coupon-list/Item.vue
	var Item_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-coupon-item",class:{ 'van-coupon-item--disabled': _vm.disabled }},[_c('div',{staticClass:"van-coupon-item__head"},[_c('div',{staticClass:"van-coupon-item__lines"}),_c('div',{staticClass:"van-coupon-item__gradient"},[_c('h2',{domProps:{"innerHTML":_vm._s(_vm.faceAmount)}}),_c('p',[_vm._v(_vm._s(_vm.conditionMessage))])])]),_c('div',{staticClass:"van-coupon-item__body"},[_c('h2',[_vm._v(_vm._s(_vm.data.name))]),_c('span',[_vm._v(_vm._s(_vm.validPeriod))]),(_vm.disabled && _vm.data.reason)?_c('p',[_vm._v(_vm._s(_vm.data.reason))]):_vm._e(),(_vm.chosen)?_c('div',{staticClass:"van-coupon-item__corner"},[_c('icon',{attrs:{"name":"success"}})],1):_vm._e()])])}
	var Item_staticRenderFns = []
	var Item_esExports = { render: Item_render, staticRenderFns: Item_staticRenderFns }
	/* harmony default export */ var coupon_list_Item = (Item_esExports);
	// CONCATENATED MODULE: ./packages/coupon-list/Item.vue
	var Item_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var Item___vue_template_functional__ = false
	/* styles */
	var Item___vue_styles__ = null
	/* scopeId */
	var Item___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var Item___vue_module_identifier__ = null
	var Item_Component = Item_normalizeComponent(
	  Item,
	  coupon_list_Item,
	  Item___vue_template_functional__,
	  Item___vue_styles__,
	  Item___vue_scopeId__,
	  Item___vue_module_identifier__
	)

	/* harmony default export */ var packages_coupon_list_Item = (Item_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/coupon-list/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//









	/* harmony default export */ var coupon_list = (Object(utils["b" /* create */])({
	  name: 'van-coupon-list',

	  components: {
	    VanButton: packages_button,
	    Cell: packages_cell,
	    CellGroup: packages_cell_group,
	    Field: packages_field,
	    Popup: packages_popup,
	    CouponItem: packages_coupon_list_Item
	  },

	  props: {
	    chosenCoupon: {
	      type: Number,
	      default: -1
	    },
	    coupons: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    },
	    disabledCoupons: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    },
	    exchangeButtonText: {
	      type: String,
	      default: '兑换'
	    },
	    exchangeButtonDisabled: {
	      type: Boolean,
	      default: false
	    },
	    displayedCouponIndex: {
	      type: Number,
	      default: -1
	    },
	    closeButtonText: {
	      type: String,
	      default: '不使用优惠'
	    },
	    disabledListTitle: {
	      type: String,
	      default: '不可用优惠'
	    },
	    inputPlaceholder: {
	      type: String,
	      default: '请输入优惠码'
	    },
	    showExchangeBar: {
	      type: Boolean,
	      default: true
	    },
	    showCloseButton: {
	      type: Boolean,
	      default: true
	    }
	  },

	  watch: {
	    displayedCouponIndex: function displayedCouponIndex(val) {
	      this.scrollToShowCoupon(val);
	    }
	  },

	  data: function data() {
	    return {
	      exchangeCode: ''
	    };
	  },
	  mounted: function mounted() {
	    this.scrollToShowCoupon(this.displayedCouponIndex);
	  },


	  methods: {
	    onClickNotUse: function onClickNotUse() {
	      this.$emit('change', -1);
	    },
	    onClickCoupon: function onClickCoupon(index) {
	      this.$emit('change', index);
	    },
	    onClickExchangeButton: function onClickExchangeButton() {
	      this.$emit('exchange', this.exchangeCode);
	      this.exchangeCode = '';
	    },

	    // 滚动到特定优惠券的位置
	    scrollToShowCoupon: function scrollToShowCoupon(index) {
	      var _this = this;

	      if (index === -1) {
	        return;
	      }

	      this.$nextTick(function () {
	        var _$refs = _this.$refs,
	            card = _$refs.card,
	            list = _$refs.list;


	        if (list && card && card[index]) {
	          list.scrollTop = card[index].$el.offsetTop - 100;
	        }
	      });
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-4e4a2fa6","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/coupon-list/index.vue
	var coupon_list_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-coupon-list"},[(_vm.showExchangeBar)?_c('cell-group',{staticClass:"van-coupon-list__top"},[_c('field',{staticClass:"van-coupon-list__filed van-hairline--surround",attrs:{"placeholder":_vm.inputPlaceholder,"maxlength":20},model:{value:(_vm.exchangeCode),callback:function ($$v) {_vm.exchangeCode=$$v},expression:"exchangeCode"}}),_c('van-button',{staticClass:"van-coupon-list__exchange",attrs:{"size":"small","type":"danger","disabled":_vm.exchangeButtonDisabled || !_vm.exchangeCode.length},on:{"click":_vm.onClickExchangeButton}},[_vm._v(_vm._s(_vm.exchangeButtonText))])],1):_vm._e(),_c('div',{ref:"list",staticClass:"van-coupon-list__list",class:{ 'van-coupon-list--with-exchange': _vm.showExchangeBar }},[_vm._l((_vm.coupons),function(item,index){return _c('coupon-item',{key:item.id || item.name,ref:"card",refInFor:true,attrs:{"data":item,"chosen":index === _vm.chosenCoupon},nativeOn:{"click":function($event){_vm.onClickCoupon(index)}}})}),(_vm.disabledCoupons.length)?_c('h3',[_vm._v(_vm._s(_vm.disabledListTitle))]):_vm._e(),_vm._l((_vm.disabledCoupons),function(item){return _c('coupon-item',{key:item.id || item.name,attrs:{"disabled":"","data":item}})}),(!_vm.coupons.length && !_vm.disabledCoupons.length)?_c('div',{staticClass:"van-coupon-list__empty"},[_c('img',{attrs:{"src":"https://b.yzcdn.cn/v2/image/wap/trade/new_order/empty@2x.png"}}),_c('p',[_vm._v("暂无优惠券")])]):_vm._e()],2),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.showCloseButton),expression:"showCloseButton"}],staticClass:"van-coupon-list__close van-hairline--top",on:{"click":_vm.onClickNotUse}},[_vm._v("\n    "+_vm._s(_vm.closeButtonText)+"\n  ")])],1)}
	var coupon_list_staticRenderFns = []
	var coupon_list_esExports = { render: coupon_list_render, staticRenderFns: coupon_list_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_coupon_list = (coupon_list_esExports);
	// CONCATENATED MODULE: ./packages/coupon-list/index.vue
	var coupon_list_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var coupon_list___vue_template_functional__ = false
	/* styles */
	var coupon_list___vue_styles__ = null
	/* scopeId */
	var coupon_list___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var coupon_list___vue_module_identifier__ = null
	var coupon_list_Component = coupon_list_normalizeComponent(
	  coupon_list,
	  selectortype_template_index_0_packages_coupon_list,
	  coupon_list___vue_template_functional__,
	  coupon_list___vue_styles__,
	  coupon_list___vue_scopeId__,
	  coupon_list___vue_module_identifier__
	)

	/* harmony default export */ var packages_coupon_list = (coupon_list_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/datetime-picker/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	var isValidDate = function isValidDate(date) {
	  return Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date.getTime());
	};

	/* harmony default export */ var datetime_picker = (Object(utils["b" /* create */])({
	  name: 'van-datetime-picker',

	  components: {
	    Picker: packages_picker
	  },

	  props: {
	    type: {
	      type: String,
	      default: 'datetime'
	    },
	    format: {
	      type: String,
	      default: 'YYYY.MM.DD HH时 mm分'
	    },
	    visibleItemCount: {
	      type: Number,
	      default: 5
	    },
	    minDate: {
	      type: Date,
	      default: function _default() {
	        return new Date(new Date().getFullYear() - 10, 0, 1);
	      },

	      validator: isValidDate
	    },
	    maxDate: {
	      type: Date,
	      default: function _default() {
	        return new Date(new Date().getFullYear() + 10, 11, 31);
	      },

	      validator: isValidDate
	    },
	    minHour: {
	      type: Number,
	      default: 0
	    },
	    maxHour: {
	      type: Number,
	      default: 23
	    },
	    value: {}
	  },

	  data: function data() {
	    return {
	      innerValue: this.correctValue(this.value)
	    };
	  },


	  watch: {
	    value: function value(val) {
	      val = this.correctValue(val);
	      var isEqual = this.type === 'time' ? val === this.innerValue : val.valueOf() === this.innerValue.valueOf();
	      if (!isEqual) this.innerValue = val;
	    },
	    innerValue: function innerValue(val) {
	      this.updateColumnValue(val);
	      this.$emit('input', val);
	    }
	  },

	  computed: {
	    ranges: function ranges() {
	      if (this.type === 'time') {
	        return [[this.minHour, this.maxHour], [0, 59]];
	      }

	      var _getBoundary = this.getBoundary('max', this.innerValue),
	          maxYear = _getBoundary.maxYear,
	          maxDate = _getBoundary.maxDate,
	          maxMonth = _getBoundary.maxMonth,
	          maxHour = _getBoundary.maxHour,
	          maxMinute = _getBoundary.maxMinute;

	      var _getBoundary2 = this.getBoundary('min', this.innerValue),
	          minYear = _getBoundary2.minYear,
	          minDate = _getBoundary2.minDate,
	          minMonth = _getBoundary2.minMonth,
	          minHour = _getBoundary2.minHour,
	          minMinute = _getBoundary2.minMinute;

	      var result = [[minYear, maxYear], [minMonth, maxMonth], [minDate, maxDate], [minHour, maxHour], [minMinute, maxMinute]];

	      if (this.type === 'date') result.splice(3, 2);
	      return result;
	    },
	    columns: function columns() {
	      var _this = this;

	      var results = this.ranges.map(function (range) {
	        var values = _this.times(range[1] - range[0] + 1, function (index) {
	          var value = range[0] + index;
	          return value < 10 ? '0' + value : '' + value;
	        });

	        return {
	          values: values
	        };
	      });
	      return results;
	    }
	  },

	  methods: {
	    correctValue: function correctValue(value) {
	      // validate value
	      var isDateType = this.type.indexOf('date') > -1;
	      if (isDateType && !isValidDate(value)) {
	        value = this.minDate;
	      } else if (!value) {
	        var _minHour = this.minHour;

	        value = (_minHour > 10 ? _minHour : '0' + _minHour) + ':00';
	      }

	      // time type
	      if (!isDateType) {
	        var _value$split = value.split(':'),
	            hour = _value$split[0],
	            minute = _value$split[1];

	        var correctedHour = Math.max(hour, this.minHour);
	        correctedHour = Math.min(correctedHour, this.maxHour);

	        return correctedHour + ':' + minute;
	      }

	      // date type

	      var _getBoundary3 = this.getBoundary('max', value),
	          maxYear = _getBoundary3.maxYear,
	          maxDate = _getBoundary3.maxDate,
	          maxMonth = _getBoundary3.maxMonth,
	          maxHour = _getBoundary3.maxHour,
	          maxMinute = _getBoundary3.maxMinute;

	      var _getBoundary4 = this.getBoundary('min', value),
	          minYear = _getBoundary4.minYear,
	          minDate = _getBoundary4.minDate,
	          minMonth = _getBoundary4.minMonth,
	          minHour = _getBoundary4.minHour,
	          minMinute = _getBoundary4.minMinute;

	      var minDay = new Date(minYear, minMonth - 1, minDate, minHour, minMinute);
	      var maxDay = new Date(maxYear, maxMonth - 1, maxDate, maxHour, maxMinute);
	      value = Math.max(value, minDay);
	      value = Math.min(value, maxDay);

	      return new Date(value);
	    },
	    times: function times(n, iteratee) {
	      var index = -1;
	      var result = Array(n);

	      while (++index < n) {
	        result[index] = iteratee(index);
	      }
	      return result;
	    },
	    getBoundary: function getBoundary(type, value) {
	      var _ref;

	      var boundary = this[type + 'Date'];
	      var year = boundary.getFullYear();
	      var month = 1;
	      var date = 1;
	      var hour = 0;
	      var minute = 0;

	      if (type === 'max') {
	        month = 12;
	        date = this.getMonthEndDay(value.getFullYear(), value.getMonth() + 1);
	        hour = 23;
	        minute = 59;
	      }

	      if (value.getFullYear() === year) {
	        month = boundary.getMonth() + 1;
	        if (value.getMonth() + 1 === month) {
	          date = boundary.getDate();
	          if (value.getDate() === date) {
	            hour = boundary.getHours();
	            if (value.getHours() === hour) {
	              minute = boundary.getMinutes();
	            }
	          }
	        }
	      }

	      return _ref = {}, _ref[type + 'Year'] = year, _ref[type + 'Month'] = month, _ref[type + 'Date'] = date, _ref[type + 'Hour'] = hour, _ref[type + 'Minute'] = minute, _ref;
	    },
	    getTrueValue: function getTrueValue(formattedValue) {
	      if (!formattedValue) return;
	      while (isNaN(parseInt(formattedValue, 10))) {
	        formattedValue = formattedValue.slice(1);
	      }
	      return parseInt(formattedValue, 10);
	    },
	    getMonthEndDay: function getMonthEndDay(year, month) {
	      if (this.isShortMonth(month)) {
	        return 30;
	      } else if (month === 2) {
	        return this.isLeapYear(year) ? 29 : 28;
	      } else {
	        return 31;
	      }
	    },
	    isLeapYear: function isLeapYear(year) {
	      return year % 400 === 0 || year % 100 !== 0 && year % 4 === 0;
	    },
	    isShortMonth: function isShortMonth(month) {
	      return [4, 6, 9, 11].indexOf(month) > -1;
	    },
	    onConfirm: function onConfirm() {
	      this.$emit('confirm', this.innerValue);
	    },
	    onChange: function onChange(picker) {
	      var values = picker.getValues();
	      var value = void 0;

	      if (this.type === 'time') {
	        value = values.join(':');
	      } else {
	        var year = this.getTrueValue(values[0]);
	        var month = this.getTrueValue(values[1]);
	        var maxDate = this.getMonthEndDay(year, month);
	        var date = this.getTrueValue(values[2]);
	        date = date > maxDate ? maxDate : date;
	        var hour = 0;
	        var minute = 0;
	        if (this.type === 'datetime') {
	          hour = this.getTrueValue(values[3]);
	          minute = this.getTrueValue(values[4]);
	        }
	        value = new Date(year, month - 1, date, hour, minute);
	      }
	      value = this.correctValue(value);
	      this.innerValue = value;
	      this.$emit('change', picker);
	    },
	    updateColumnValue: function updateColumnValue(value) {
	      var _this2 = this;

	      var values = [];
	      if (this.type === 'time') {
	        var currentValue = value.split(':');
	        values = [currentValue[0], currentValue[1]];
	      } else {
	        values = ['' + value.getFullYear(), ('0' + (value.getMonth() + 1)).slice(-2), ('0' + value.getDate()).slice(-2)];
	        if (this.type === 'datetime') {
	          values.push(('0' + value.getHours()).slice(-2), ('0' + value.getMinutes()).slice(-2));
	        }
	      }
	      this.$nextTick(function () {
	        _this2.setColumnByValues(values);
	      });
	    },
	    setColumnByValues: function setColumnByValues(values) {
	      if (!this.$refs.picker) {
	        return;
	      }
	      this.$refs.picker.setValues(values);
	    }
	  },

	  mounted: function mounted() {
	    this.updateColumnValue(this.innerValue);
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-64d98e5f","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/datetime-picker/index.vue
	var datetime_picker_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('picker',{ref:"picker",attrs:{"showToolbar":"","columns":_vm.columns,"visibleItemCount":_vm.visibleItemCount},on:{"change":_vm.onChange,"confirm":_vm.onConfirm,"cancel":function($event){_vm.$emit('cancel')}}})}
	var datetime_picker_staticRenderFns = []
	var datetime_picker_esExports = { render: datetime_picker_render, staticRenderFns: datetime_picker_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_datetime_picker = (datetime_picker_esExports);
	// CONCATENATED MODULE: ./packages/datetime-picker/index.vue
	var datetime_picker_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var datetime_picker___vue_template_functional__ = false
	/* styles */
	var datetime_picker___vue_styles__ = null
	/* scopeId */
	var datetime_picker___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var datetime_picker___vue_module_identifier__ = null
	var datetime_picker_Component = datetime_picker_normalizeComponent(
	  datetime_picker,
	  selectortype_template_index_0_packages_datetime_picker,
	  datetime_picker___vue_template_functional__,
	  datetime_picker___vue_styles__,
	  datetime_picker___vue_scopeId__,
	  datetime_picker___vue_module_identifier__
	)

	/* harmony default export */ var packages_datetime_picker = (datetime_picker_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/goods-action/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var goods_action = (Object(utils["b" /* create */])({
	  name: 'van-goods-action'
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-47437645","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/goods-action/index.vue
	var goods_action_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-goods-action"},[_vm._t("default")],2)}
	var goods_action_staticRenderFns = []
	var goods_action_esExports = { render: goods_action_render, staticRenderFns: goods_action_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_goods_action = (goods_action_esExports);
	// CONCATENATED MODULE: ./packages/goods-action/index.vue
	var goods_action_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var goods_action___vue_template_functional__ = false
	/* styles */
	var goods_action___vue_styles__ = null
	/* scopeId */
	var goods_action___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var goods_action___vue_module_identifier__ = null
	var goods_action_Component = goods_action_normalizeComponent(
	  goods_action,
	  selectortype_template_index_0_packages_goods_action,
	  goods_action___vue_template_functional__,
	  goods_action___vue_styles__,
	  goods_action___vue_scopeId__,
	  goods_action___vue_module_identifier__
	)

	/* harmony default export */ var packages_goods_action = (goods_action_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/goods-action-big-btn/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var goods_action_big_btn = (Object(utils["b" /* create */])({
	  name: 'van-goods-action-big-btn',

	  components: {
	    VanButton: packages_button
	  },

	  props: {
	    url: String,
	    primary: Boolean
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-b06722a6","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/goods-action-big-btn/index.vue
	var goods_action_big_btn_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('van-button',{staticClass:"van-goods-action__big-btn",attrs:{"tag":"a","href":_vm.url,"type":_vm.primary ? 'primary' : 'default',"bottomAction":""},on:{"click":function($event){_vm.$emit('click', $event)}}},[_vm._t("default")],2)}
	var goods_action_big_btn_staticRenderFns = []
	var goods_action_big_btn_esExports = { render: goods_action_big_btn_render, staticRenderFns: goods_action_big_btn_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_goods_action_big_btn = (goods_action_big_btn_esExports);
	// CONCATENATED MODULE: ./packages/goods-action-big-btn/index.vue
	var goods_action_big_btn_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var goods_action_big_btn___vue_template_functional__ = false
	/* styles */
	var goods_action_big_btn___vue_styles__ = null
	/* scopeId */
	var goods_action_big_btn___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var goods_action_big_btn___vue_module_identifier__ = null
	var goods_action_big_btn_Component = goods_action_big_btn_normalizeComponent(
	  goods_action_big_btn,
	  selectortype_template_index_0_packages_goods_action_big_btn,
	  goods_action_big_btn___vue_template_functional__,
	  goods_action_big_btn___vue_styles__,
	  goods_action_big_btn___vue_scopeId__,
	  goods_action_big_btn___vue_module_identifier__
	)

	/* harmony default export */ var packages_goods_action_big_btn = (goods_action_big_btn_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/goods-action-mini-btn/index.vue
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var goods_action_mini_btn = (Object(utils["b" /* create */])({
	  name: 'van-goods-action-mini-btn',

	  props: {
	    url: String,
	    icon: String,
	    iconClass: String
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-12482e98","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/goods-action-mini-btn/index.vue
	var goods_action_mini_btn_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('a',{staticClass:"van-goods-action__mini-btn van-hairline",attrs:{"href":_vm.url},on:{"click":function($event){_vm.$emit('click', $event);}}},[_c('icon',{staticClass:"van-goods-action__mini-btn-icon",class:_vm.iconClass,attrs:{"name":_vm.icon}}),_vm._t("default")],2)}
	var goods_action_mini_btn_staticRenderFns = []
	var goods_action_mini_btn_esExports = { render: goods_action_mini_btn_render, staticRenderFns: goods_action_mini_btn_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_goods_action_mini_btn = (goods_action_mini_btn_esExports);
	// CONCATENATED MODULE: ./packages/goods-action-mini-btn/index.vue
	var goods_action_mini_btn_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var goods_action_mini_btn___vue_template_functional__ = false
	/* styles */
	var goods_action_mini_btn___vue_styles__ = null
	/* scopeId */
	var goods_action_mini_btn___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var goods_action_mini_btn___vue_module_identifier__ = null
	var goods_action_mini_btn_Component = goods_action_mini_btn_normalizeComponent(
	  goods_action_mini_btn,
	  selectortype_template_index_0_packages_goods_action_mini_btn,
	  goods_action_mini_btn___vue_template_functional__,
	  goods_action_mini_btn___vue_styles__,
	  goods_action_mini_btn___vue_scopeId__,
	  goods_action_mini_btn___vue_module_identifier__
	)

	/* harmony default export */ var packages_goods_action_mini_btn = (goods_action_mini_btn_Component.exports);

	// EXTERNAL MODULE: ./packages/icon/index.vue + 2 modules
	var icon = __webpack_require__(55);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/swipe/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var swipe = (Object(utils["b" /* create */])({
	  name: 'van-swipe',

	  props: {
	    autoplay: Number,
	    initialSwipe: {
	      type: Number,
	      default: 0
	    },
	    showIndicators: {
	      type: Boolean,
	      default: true
	    },
	    duration: {
	      type: Number,
	      default: 500
	    }
	  },

	  data: function data() {
	    return {
	      width: 0,
	      offset: 0,
	      startX: 0,
	      startY: 0,
	      active: 0,
	      deltaX: 0,
	      swipes: [],
	      direction: '',
	      currentDuration: 0
	    };
	  },
	  mounted: function mounted() {
	    this.initialize();
	  },
	  destroyed: function destroyed() {
	    clearTimeout(this.timer);
	  },


	  watch: {
	    swipes: function swipes() {
	      this.initialize();
	    },
	    initialSwipe: function initialSwipe() {
	      this.initialize();
	    }
	  },

	  computed: {
	    count: function count() {
	      return this.swipes.length;
	    },
	    trackStyle: function trackStyle() {
	      return {
	        paddingLeft: this.width + 'px',
	        width: (this.count + 2) * this.width + 'px',
	        transitionDuration: this.currentDuration + 'ms',
	        transform: 'translate3d(' + this.offset + 'px, 0, 0)'
	      };
	    },
	    activeIndicator: function activeIndicator() {
	      return (this.active + this.count) % this.count;
	    }
	  },

	  methods: {
	    initialize: function initialize() {
	      // reset offset when children changes
	      clearTimeout(this.timer);
	      this.width = this.$el.getBoundingClientRect().width;
	      this.active = this.initialSwipe;
	      this.currentDuration = 0;
	      this.offset = this.count > 1 ? -this.width * (this.active + 1) : 0;
	      this.swipes.forEach(function (swipe) {
	        swipe.offset = 0;
	      });
	      this.autoPlay();
	    },
	    onTouchStart: function onTouchStart(event) {
	      clearTimeout(this.timer);

	      this.deltaX = 0;
	      this.direction = '';
	      this.currentDuration = 0;
	      this.startX = event.touches[0].clientX;
	      this.startY = event.touches[0].clientY;

	      if (this.active <= -1) {
	        this.move(this.count);
	      }
	      if (this.active >= this.count) {
	        this.move(-this.count);
	      }
	    },
	    onTouchMove: function onTouchMove(event) {
	      this.direction = this.direction || this.getDirection(event.touches[0]);

	      if (this.direction === 'horizontal') {
	        event.preventDefault();
	        this.deltaX = event.touches[0].clientX - this.startX;
	        this.move(0, this.range(this.deltaX, [-this.width, this.width]));
	      }
	    },
	    onTouchEnd: function onTouchEnd() {
	      if (this.deltaX) {
	        this.move(Math.abs(this.deltaX) > 50 ? this.deltaX > 0 ? -1 : 1 : 0);
	        this.currentDuration = this.duration;
	      }
	      this.autoPlay();
	    },
	    move: function move() {
	      var move = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	      var active = this.active,
	          count = this.count,
	          swipes = this.swipes,
	          deltaX = this.deltaX,
	          width = this.width;


	      if (move) {
	        if (active === -1) {
	          swipes[count - 1].offset = 0;
	        }
	        swipes[0].offset = active === count - 1 && move > 0 ? count * width : 0;

	        this.active += move;
	      } else {
	        if (active === 0) {
	          swipes[count - 1].offset = deltaX > 0 ? -count * width : 0;
	        } else if (active === count - 1) {
	          swipes[0].offset = deltaX < 0 ? count * width : 0;
	        }
	      }
	      this.offset = offset - (this.active + 1) * this.width;
	    },
	    autoPlay: function autoPlay() {
	      var _this = this;

	      var autoplay = this.autoplay;

	      if (autoplay && this.count > 1) {
	        clearTimeout(this.timer);
	        this.timer = setTimeout(function () {
	          _this.currentDuration = 0;

	          if (_this.active >= _this.count) {
	            _this.move(-_this.count);
	          }

	          setTimeout(function () {
	            _this.currentDuration = _this.duration;
	            _this.move(1);
	            _this.autoPlay();
	          }, 30);
	        }, autoplay);
	      }
	    },
	    getDirection: function getDirection(touch) {
	      var distanceX = Math.abs(touch.clientX - this.startX);
	      var distanceY = Math.abs(touch.clientY - this.startY);
	      return distanceX > distanceY ? 'horizontal' : distanceX < distanceY ? 'vertical' : '';
	    },
	    range: function range(num, arr) {
	      return Math.min(Math.max(num, arr[0]), arr[1]);
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-ea4689d8","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/swipe/index.vue
	var swipe_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-swipe"},[(_vm.count > 1)?_c('div',{staticClass:"van-swipe__track",style:(_vm.trackStyle),on:{"touchstart":_vm.onTouchStart,"touchmove":_vm.onTouchMove,"touchend":_vm.onTouchEnd,"touchcancel":_vm.onTouchEnd,"transitionend":function($event){_vm.$emit('change', _vm.activeIndicator)}}},[_vm._t("default")],2):_c('div',{staticClass:"van-swipe__track"},[_vm._t("default")],2),(_vm.showIndicators && _vm.count > 1)?_c('div',{staticClass:"van-swipe__indicators"},_vm._l((_vm.count),function(index){return _c('i',{class:{ 'van-swipe__indicator--active': index - 1 === _vm.activeIndicator }})})):_vm._e()])}
	var swipe_staticRenderFns = []
	var swipe_esExports = { render: swipe_render, staticRenderFns: swipe_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_swipe = (swipe_esExports);
	// CONCATENATED MODULE: ./packages/swipe/index.vue
	var swipe_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var swipe___vue_template_functional__ = false
	/* styles */
	var swipe___vue_styles__ = null
	/* scopeId */
	var swipe___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var swipe___vue_module_identifier__ = null
	var swipe_Component = swipe_normalizeComponent(
	  swipe,
	  selectortype_template_index_0_packages_swipe,
	  swipe___vue_template_functional__,
	  swipe___vue_styles__,
	  swipe___vue_scopeId__,
	  swipe___vue_module_identifier__
	)

	/* harmony default export */ var packages_swipe = (swipe_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/swipe-item/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var swipe_item = (Object(utils["b" /* create */])({
	  name: 'van-swipe-item',

	  data: function data() {
	    return {
	      offset: 0
	    };
	  },


	  computed: {
	    style: function style() {
	      return {
	        width: this.$parent.width + 'px',
	        transform: 'translate3d(' + this.offset + 'px, 0, 0)'
	      };
	    }
	  },

	  beforeCreate: function beforeCreate() {
	    this.$parent.swipes.push(this);
	  },
	  destroyed: function destroyed() {
	    this.$parent.swipes.splice(this.$parent.swipes.indexOf(this), 1);
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-21602dcd","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/swipe-item/index.vue
	var swipe_item_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-swipe-item",style:(_vm.style)},[_vm._t("default")],2)}
	var swipe_item_staticRenderFns = []
	var swipe_item_esExports = { render: swipe_item_render, staticRenderFns: swipe_item_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_swipe_item = (swipe_item_esExports);
	// CONCATENATED MODULE: ./packages/swipe-item/index.vue
	var swipe_item_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var swipe_item___vue_template_functional__ = false
	/* styles */
	var swipe_item___vue_styles__ = null
	/* scopeId */
	var swipe_item___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var swipe_item___vue_module_identifier__ = null
	var swipe_item_Component = swipe_item_normalizeComponent(
	  swipe_item,
	  selectortype_template_index_0_packages_swipe_item,
	  swipe_item___vue_template_functional__,
	  swipe_item___vue_styles__,
	  swipe_item___vue_scopeId__,
	  swipe_item___vue_module_identifier__
	)

	/* harmony default export */ var packages_swipe_item = (swipe_item_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/image-preview/image-preview.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//






	/* harmony default export */ var image_preview = (Object(utils["b" /* create */])({
	  name: 'van-image-preview',

	  mixins: [popup],

	  components: {
	    Swipe: packages_swipe,
	    SwipeItem: packages_swipe_item
	  },

	  props: {
	    overlay: {
	      default: true
	    },
	    closeOnClickOverlay: {
	      default: true
	    }
	  },

	  data: function data() {
	    return {
	      images: [],
	      startPosition: 0
	    };
	  },


	  methods: {
	    onTouchStart: function onTouchStart(event) {
	      this.touchStartTime = new Date();
	      this.touchStartX = event.touches[0].clientX;
	      this.touchStartY = event.touches[0].clientY;
	      this.deltaX = 0;
	      this.deltaY = 0;
	    },
	    onTouchMove: function onTouchMove(event) {
	      event.preventDefault();
	      this.deltaX = event.touches[0].clientX - this.touchStartX;
	      this.deltaY = event.touches[0].clientY - this.touchStartY;
	    },
	    onTouchEnd: function onTouchEnd(event) {
	      event.preventDefault();
	      // prevent long tap to close component
	      var deltaTime = new Date() - this.touchStartTime;
	      if (deltaTime < 100 && Math.abs(this.deltaX) < 20 && Math.abs(this.deltaY) < 20) {
	        this.close();
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-4e9eaf18","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/image-preview/image-preview.vue
	var image_preview_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.value),expression:"value"}],staticClass:"van-image-preview",on:{"touchstart":_vm.onTouchStart,"touchmove":_vm.onTouchMove,"touchend":_vm.onTouchEnd,"touchcancel":_vm.onTouchEnd}},[_c('swipe',{attrs:{"initialSwipe":_vm.startPosition}},_vm._l((_vm.images),function(item,index){return _c('swipe-item',{key:index},[_c('img',{staticClass:"van-image-preview__image",attrs:{"src":item}})])}))],1)}
	var image_preview_staticRenderFns = []
	var image_preview_esExports = { render: image_preview_render, staticRenderFns: image_preview_staticRenderFns }
	/* harmony default export */ var image_preview_image_preview = (image_preview_esExports);
	// CONCATENATED MODULE: ./packages/image-preview/image-preview.vue
	var image_preview_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var image_preview___vue_template_functional__ = false
	/* styles */
	var image_preview___vue_styles__ = null
	/* scopeId */
	var image_preview___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var image_preview___vue_module_identifier__ = null
	var image_preview_Component = image_preview_normalizeComponent(
	  image_preview,
	  image_preview_image_preview,
	  image_preview___vue_template_functional__,
	  image_preview___vue_styles__,
	  image_preview___vue_scopeId__,
	  image_preview___vue_module_identifier__
	)

	/* harmony default export */ var packages_image_preview_image_preview = (image_preview_Component.exports);

	// CONCATENATED MODULE: ./packages/image-preview/index.js



	var image_preview_instance = void 0;

	var ImagePreviewConstructor = external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a.extend(packages_image_preview_image_preview);

	var image_preview_initInstance = function initInstance() {
	  image_preview_instance = new ImagePreviewConstructor({
	    el: document.createElement('div')
	  });
	  document.body.appendChild(image_preview_instance.$el);
	};

	var ImagePreviewBox = function ImagePreviewBox(images) {
	  var startPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	  if (!image_preview_instance) {
	    image_preview_initInstance();
	  }

	  image_preview_instance.images = images;
	  image_preview_instance.startPosition = startPosition;
	  image_preview_instance.value = true;
	  image_preview_instance.$on('input', function (show) {
	    image_preview_instance.value = show;
	  });

	  return image_preview_instance;
	};

	/* harmony default export */ var packages_image_preview = (ImagePreviewBox);
	// EXTERNAL MODULE: ./node_modules/vue-lazyload/vue-lazyload.js
	var vue_lazyload = __webpack_require__(105);
	var vue_lazyload_default = /*#__PURE__*/__webpack_require__.n(vue_lazyload);

	// CONCATENATED MODULE: ./packages/lazyload/index.js


	/* harmony default export */ var lazyload = (vue_lazyload_default.a);
	// EXTERNAL MODULE: ./packages/loading/index.vue + 2 modules
	var loading = __webpack_require__(56);

	// EXTERNAL MODULE: ./packages/locale/index.js + 1 modules
	var locale = __webpack_require__(41);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/nav-bar/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var nav_bar = (Object(utils["b" /* create */])({
	  name: 'van-nav-bar',

	  props: {
	    title: String,
	    leftText: String,
	    rightText: String,
	    leftArrow: Boolean,
	    fixed: Boolean
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-4f22d0c3","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/nav-bar/index.vue
	var nav_bar_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-nav-bar van-hairline--top-bottom",class:{ 'van-nav-bar--fixed': _vm.fixed }},[_c('div',{staticClass:"van-nav-bar__left",on:{"click":function($event){_vm.$emit('click-left')}}},[_vm._t("left",[(_vm.leftArrow)?_c('icon',{staticClass:"van-nav-bar__arrow",attrs:{"name":"arrow"}}):_vm._e(),(_vm.leftText)?_c('span',{staticClass:"van-nav-bar__text",domProps:{"textContent":_vm._s(_vm.leftText)}}):_vm._e()])],2),_c('div',{staticClass:"van-nav-bar__title"},[_vm._t("title",[_vm._v(_vm._s(_vm.title))])],2),_c('div',{staticClass:"van-nav-bar__right",on:{"click":function($event){_vm.$emit('click-right')}}},[_vm._t("right",[(_vm.rightText)?_c('span',{staticClass:"van-nav-bar__text",domProps:{"textContent":_vm._s(_vm.rightText)}}):_vm._e()])],2)])}
	var nav_bar_staticRenderFns = []
	var nav_bar_esExports = { render: nav_bar_render, staticRenderFns: nav_bar_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_nav_bar = (nav_bar_esExports);
	// CONCATENATED MODULE: ./packages/nav-bar/index.vue
	var nav_bar_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var nav_bar___vue_template_functional__ = false
	/* styles */
	var nav_bar___vue_styles__ = null
	/* scopeId */
	var nav_bar___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var nav_bar___vue_module_identifier__ = null
	var nav_bar_Component = nav_bar_normalizeComponent(
	  nav_bar,
	  selectortype_template_index_0_packages_nav_bar,
	  nav_bar___vue_template_functional__,
	  nav_bar___vue_styles__,
	  nav_bar___vue_scopeId__,
	  nav_bar___vue_module_identifier__
	)

	/* harmony default export */ var packages_nav_bar = (nav_bar_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/notice-bar/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var notice_bar = (Object(utils["b" /* create */])({
	  name: 'van-notice-bar',

	  props: {
	    text: String,
	    mode: String,
	    color: String,
	    leftIcon: String,
	    background: String,
	    delay: {
	      type: [String, Number],
	      default: 1
	    },
	    scrollable: {
	      type: Boolean,
	      default: true
	    },
	    speed: {
	      type: Number,
	      default: 50
	    }
	  },

	  data: function data() {
	    return {
	      wrapWidth: 0,
	      firstRound: true,
	      duration: 0,
	      offsetWidth: 0,
	      showNoticeBar: true,
	      animationClass: ''
	    };
	  },


	  computed: {
	    iconName: function iconName() {
	      return this.mode === 'closeable' ? 'close' : this.mode === 'link' ? 'arrow' : '';
	    },
	    barStyle: function barStyle() {
	      return {
	        color: this.color,
	        background: this.background
	      };
	    },
	    contentStyle: function contentStyle() {
	      return {
	        paddingLeft: this.firstRound ? 0 : this.wrapWidth + 'px',
	        animationDelay: (this.firstRound ? this.delay : 0) + 's',
	        animationDuration: this.duration + 's'
	      };
	    }
	  },

	  mounted: function mounted() {
	    var offsetWidth = this.$refs.content.getBoundingClientRect().width;
	    var wrapWidth = this.$refs.contentWrap.getBoundingClientRect().width;
	    if (this.scrollable && offsetWidth > wrapWidth) {
	      this.wrapWidth = wrapWidth;
	      this.offsetWidth = offsetWidth;
	      this.duration = offsetWidth / this.speed;
	      this.animationClass = 'van-notice-bar__play';
	    }
	  },


	  methods: {
	    onClickIcon: function onClickIcon() {
	      this.showNoticeBar = this.mode !== 'closeable';
	    },
	    onAnimationEnd: function onAnimationEnd() {
	      var _this = this;

	      this.firstRound = false;
	      this.$nextTick(function () {
	        _this.duration = (_this.offsetWidth + _this.wrapWidth) / _this.speed;
	        _this.animationClass = 'van-notice-bar__play--infinite';
	      });
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-1d7b2340","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/notice-bar/index.vue
	var notice_bar_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.showNoticeBar),expression:"showNoticeBar"}],staticClass:"van-notice-bar",class:{ 'van-notice-bar--withicon': _vm.mode },style:(_vm.barStyle),on:{"click":function($event){_vm.$emit('click')}}},[(_vm.leftIcon)?_c('div',{staticClass:"van-notice-bar__left-icon"},[_c('img',{attrs:{"src":_vm.leftIcon}})]):_vm._e(),_c('div',{ref:"contentWrap",staticClass:"van-notice-bar__content-wrap"},[_c('div',{ref:"content",staticClass:"van-notice-bar__content",class:_vm.animationClass,style:(_vm.contentStyle),on:{"animationend":_vm.onAnimationEnd,"webkitAnimationEnd":_vm.onAnimationEnd}},[_vm._t("default",[_vm._v(_vm._s(_vm.text))])],2)]),(_vm.iconName)?_c('icon',{staticClass:"van-notice-bar__right-icon",attrs:{"name":_vm.iconName},on:{"click":_vm.onClickIcon}}):_vm._e()],1)}
	var notice_bar_staticRenderFns = []
	var notice_bar_esExports = { render: notice_bar_render, staticRenderFns: notice_bar_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_notice_bar = (notice_bar_esExports);
	// CONCATENATED MODULE: ./packages/notice-bar/index.vue
	var notice_bar_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var notice_bar___vue_template_functional__ = false
	/* styles */
	var notice_bar___vue_styles__ = null
	/* scopeId */
	var notice_bar___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var notice_bar___vue_module_identifier__ = null
	var notice_bar_Component = notice_bar_normalizeComponent(
	  notice_bar,
	  selectortype_template_index_0_packages_notice_bar,
	  notice_bar___vue_template_functional__,
	  notice_bar___vue_styles__,
	  notice_bar___vue_scopeId__,
	  notice_bar___vue_module_identifier__
	)

	/* harmony default export */ var packages_notice_bar = (notice_bar_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/number-keyboard/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var number_keyboard = (Object(utils["b" /* create */])({
	  name: 'van-number-keyboard',

	  props: {
	    show: Boolean,
	    extraKey: {
	      type: String,
	      default: ''
	    },
	    title: String,
	    zIndex: {
	      type: Number,
	      default: 100
	    },
	    transition: {
	      type: Boolean,
	      default: true
	    },
	    showDeleteKey: {
	      type: Boolean,
	      default: true
	    }
	  },

	  mounted: function mounted() {
	    this.handler(true);
	  },
	  destroyed: function destroyed() {
	    this.handler(false);
	  },
	  activated: function activated() {
	    this.handler(true);
	  },
	  deactivated: function deactivated() {
	    this.handler(false);
	  },
	  data: function data() {
	    return {
	      active: -1
	    };
	  },


	  watch: {
	    show: function show() {
	      if (!this.transition) {
	        this.$emit(this.show ? 'show' : 'hide');
	      }
	    }
	  },

	  computed: {
	    keys: function keys() {
	      var keys = [];
	      for (var i = 0; i < 12; i++) {
	        var key = i === 10 ? 0 : i < 9 ? i + 1 : i === 9 ? this.extraKey : '';
	        keys.push(key);
	      }
	      return keys;
	    },
	    style: function style() {
	      return {
	        zIndex: this.zIndex
	      };
	    }
	  },

	  methods: {
	    handler: function handler(action) {
	      if (action !== this.handlerStatus) {
	        this.handlerStatus = action;
	        document.body[(action ? 'add' : 'remove') + 'EventListener']('touchstart', this.blurKeyboard);
	      }
	    },
	    focus: function focus(event) {
	      this.active = parseInt(event.target.dataset.key);
	      if (this.active === 11) {
	        this.$emit('delete');
	      } else if (!isNaN(this.active)) {
	        var key = this.keys[this.active];
	        if (key !== '') {
	          this.$emit('input', key);
	        }
	      }
	    },
	    blurKey: function blurKey() {
	      this.active = -1;
	    },
	    blurKeyboard: function blurKeyboard() {
	      this.$emit('blur');
	    },
	    onAnimationEnd: function onAnimationEnd() {
	      this.$emit(this.show ? 'show' : 'hide');
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-0791132c","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/number-keyboard/index.vue
	var number_keyboard_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition',{attrs:{"name":_vm.transition ? 'van-slide-bottom' : ''}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.show),expression:"show"}],staticClass:"van-number-keyboard",style:(_vm.style),on:{"touchstart":function($event){$event.stopPropagation();$event.preventDefault();_vm.focus($event)},"touchmove":_vm.blurKey,"touchend":_vm.blurKey,"touchcancel":_vm.blurKey,"animationend":_vm.onAnimationEnd}},[(_vm.title)?_c('div',{staticClass:"van-number-keyboard__title van-hairline--top"},[_c('span',[_vm._v(_vm._s(_vm.title))])]):_vm._e(),_vm._l((_vm.keys),function(key,index){return _c('i',{staticClass:"van-hairline",class:{
	        'van-number-keyboard--active': index === _vm.active,
	        'van-number-keyboard__delete': index === 11 && _vm.showDeleteKey
	      },attrs:{"data-key":index},domProps:{"textContent":_vm._s(key)}})})],2)])}
	var number_keyboard_staticRenderFns = []
	var number_keyboard_esExports = { render: number_keyboard_render, staticRenderFns: number_keyboard_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_number_keyboard = (number_keyboard_esExports);
	// CONCATENATED MODULE: ./packages/number-keyboard/index.vue
	var number_keyboard_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var number_keyboard___vue_template_functional__ = false
	/* styles */
	var number_keyboard___vue_styles__ = null
	/* scopeId */
	var number_keyboard___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var number_keyboard___vue_module_identifier__ = null
	var number_keyboard_Component = number_keyboard_normalizeComponent(
	  number_keyboard,
	  selectortype_template_index_0_packages_number_keyboard,
	  number_keyboard___vue_template_functional__,
	  number_keyboard___vue_styles__,
	  number_keyboard___vue_scopeId__,
	  number_keyboard___vue_module_identifier__
	)

	/* harmony default export */ var packages_number_keyboard = (number_keyboard_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/pagination/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var pagination = (Object(utils["b" /* create */])({
	  name: 'van-pagination',

	  props: {
	    value: Number,
	    prevText: String,
	    nextText: String,
	    pageCount: Number,
	    forceEllipses: Boolean,
	    mode: {
	      type: String,
	      default: 'multi'
	    },
	    itemsPerPage: {
	      type: Number,
	      default: 10
	    },
	    showPageSize: {
	      type: Number,
	      default: 5
	    },
	    totalItems: {
	      type: Number,
	      default: 0
	    }
	  },

	  computed: {
	    isMultiMode: function isMultiMode() {
	      return this.mode === 'multi';
	    },
	    computedPageCount: function computedPageCount() {
	      var count = this.pageCount || Math.ceil(this.totalItems / this.itemsPerPage);
	      return Math.max(1, count);
	    },
	    pageDesc: function pageDesc() {
	      return this.value + '/' + this.computedPageCount;
	    },
	    pages: function pages() {
	      var pages = [];
	      var pageCount = this.computedPageCount;

	      // Default page limits
	      var startPage = 1,
	          endPage = pageCount;
	      var isMaxSized = this.showPageSize !== undefined && this.showPageSize < pageCount;

	      // recompute if showPageSize
	      if (isMaxSized) {
	        // Current page is displayed in the middle of the visible ones
	        startPage = Math.max(this.value - Math.floor(this.showPageSize / 2), 1);
	        endPage = startPage + this.showPageSize - 1;

	        // Adjust if limit is exceeded
	        if (endPage > pageCount) {
	          endPage = pageCount;
	          startPage = endPage - this.showPageSize + 1;
	        }
	      }

	      // Add page number links
	      for (var number = startPage; number <= endPage; number++) {
	        var page = this.makePage(number, number, number === this.value);
	        pages.push(page);
	      }

	      // Add links to move between page sets
	      if (isMaxSized && this.showPageSize > 0 && this.forceEllipses) {
	        if (startPage > 1) {
	          var previousPageSet = this.makePage(startPage - 1, '...', false);
	          pages.unshift(previousPageSet);
	        }

	        if (endPage < pageCount) {
	          var nextPageSet = this.makePage(endPage + 1, '...', false);
	          pages.push(nextPageSet);
	        }
	      }

	      return pages;
	    }
	  },

	  created: function created() {
	    this.selectPage(this.value);
	  },


	  watch: {
	    value: function value(page) {
	      this.selectPage(page);
	    }
	  },

	  methods: {
	    selectPage: function selectPage(page) {
	      page = Math.max(1, page);
	      page = Math.min(this.computedPageCount, page);
	      if (this.value !== page) {
	        this.$emit('input', page);
	        this.$emit('change', page);
	      }
	    },
	    makePage: function makePage(number, text, active) {
	      return { number: number, text: text, active: active };
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-1af8dc08","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/pagination/index.vue
	var pagination_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('ul',{staticClass:"van-pagination",class:{ 'van-pagination-simple': !_vm.isMultiMode }},[_c('li',{staticClass:"van-pagination__item van-pagination__prev van-hairline",class:{ 'van-pagination--disabled': _vm.value === 1 },on:{"click":function($event){_vm.selectPage(_vm.value - 1)}}},[_vm._v("\n    "+_vm._s(_vm.prevText || _vm.$t('prev'))+"\n  ")]),_vm._l((_vm.pages),function(page,index){return (_vm.isMultiMode)?_c('li',{key:index,staticClass:"van-pagination__item van-pagination__page van-hairline",class:{ 'van-pagination--active': page.active },on:{"click":function($event){_vm.selectPage(page.number)}}},[_vm._v("\n    "+_vm._s(page.text)+"\n  ")]):_vm._e()}),(!_vm.isMultiMode)?_c('li',{staticClass:"van-pagination__page-desc"},[_vm._t("pageDesc",[_vm._v(_vm._s(_vm.pageDesc))])],2):_vm._e(),_c('li',{staticClass:"van-pagination__item van-pagination__next van-hairline",class:{ 'van-pagination--disabled': _vm.value === _vm.computedPageCount },on:{"click":function($event){_vm.selectPage(_vm.value + 1)}}},[_vm._v("\n    "+_vm._s(_vm.nextText || _vm.$t('next'))+"\n  ")])],2)}
	var pagination_staticRenderFns = []
	var pagination_esExports = { render: pagination_render, staticRenderFns: pagination_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_pagination = (pagination_esExports);
	// CONCATENATED MODULE: ./packages/pagination/index.vue
	var pagination_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var pagination___vue_template_functional__ = false
	/* styles */
	var pagination___vue_styles__ = null
	/* scopeId */
	var pagination___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var pagination___vue_module_identifier__ = null
	var pagination_Component = pagination_normalizeComponent(
	  pagination,
	  selectortype_template_index_0_packages_pagination,
	  pagination___vue_template_functional__,
	  pagination___vue_styles__,
	  pagination___vue_scopeId__,
	  pagination___vue_module_identifier__
	)

	/* harmony default export */ var packages_pagination = (pagination_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/panel/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var panel = (Object(utils["b" /* create */])({
	  name: 'van-panel',
	  props: {
	    desc: String,
	    title: String,
	    status: String
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-43a6b599","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/panel/index.vue
	var panel_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-panel van-hairline--top-bottom"},[_c('div',{staticClass:"van-panel__header van-hairline--bottom"},[_vm._t("header",[_c('div',{staticClass:"van-panel__title",domProps:{"textContent":_vm._s(_vm.title)}}),(_vm.desc)?_c('span',{staticClass:"van-panel__desc",domProps:{"textContent":_vm._s(_vm.desc)}}):_vm._e(),(_vm.status)?_c('span',{staticClass:"van-panel__status",domProps:{"textContent":_vm._s(_vm.status)}}):_vm._e()])],2),_c('div',{staticClass:"van-panel__content"},[_vm._t("default")],2),(_vm.$slots.footer)?_c('div',{staticClass:"van-panel__footer van-hairline--top"},[_vm._t("footer")],2):_vm._e()])}
	var panel_staticRenderFns = []
	var panel_esExports = { render: panel_render, staticRenderFns: panel_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_panel = (panel_esExports);
	// CONCATENATED MODULE: ./packages/panel/index.vue
	var panel_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var panel___vue_template_functional__ = false
	/* styles */
	var panel___vue_styles__ = null
	/* scopeId */
	var panel___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var panel___vue_module_identifier__ = null
	var panel_Component = panel_normalizeComponent(
	  panel,
	  selectortype_template_index_0_packages_panel,
	  panel___vue_template_functional__,
	  panel___vue_styles__,
	  panel___vue_scopeId__,
	  panel___vue_module_identifier__
	)

	/* harmony default export */ var packages_panel = (panel_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/password-input/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var password_input = (Object(utils["b" /* create */])({
	  name: 'van-password-input',

	  props: {
	    info: String,
	    errorInfo: String,
	    value: {
	      type: String,
	      default: ''
	    },
	    length: {
	      type: Number,
	      default: 6
	    }
	  },

	  computed: {
	    points: function points() {
	      var arr = [];
	      for (var i = 0; i < this.length; i++) {
	        arr[i] = this.value[i] ? 'visible' : 'hidden';
	      }
	      return arr;
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-0df055c0","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/password-input/index.vue
	var password_input_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-password-input"},[_c('ul',{staticClass:"van-password-input__security van-hairline--surround",on:{"touchstart":function($event){$event.stopPropagation();_vm.$emit('focus')}}},_vm._l((_vm.points),function(visibility){return _c('li',{staticClass:"van-hairline"},[_c('i',{style:(("visibility: " + visibility))})])})),(_vm.errorInfo || _vm.info)?_c('div',{class:_vm.errorInfo ? 'van-password-input__error-info' : 'van-password-input__info',domProps:{"textContent":_vm._s(_vm.errorInfo || _vm.info)}}):_vm._e()])}
	var password_input_staticRenderFns = []
	var password_input_esExports = { render: password_input_render, staticRenderFns: password_input_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_password_input = (password_input_esExports);
	// CONCATENATED MODULE: ./packages/password-input/index.vue
	var password_input_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var password_input___vue_template_functional__ = false
	/* styles */
	var password_input___vue_styles__ = null
	/* scopeId */
	var password_input___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var password_input___vue_module_identifier__ = null
	var password_input_Component = password_input_normalizeComponent(
	  password_input,
	  selectortype_template_index_0_packages_password_input,
	  password_input___vue_template_functional__,
	  password_input___vue_styles__,
	  password_input___vue_scopeId__,
	  password_input___vue_module_identifier__
	)

	/* harmony default export */ var packages_password_input = (password_input_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/progress/index.vue
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var progress = (Object(utils["b" /* create */])({
	  name: 'van-progress',

	  props: {
	    inactive: Boolean,
	    percentage: {
	      type: Number,
	      required: true,
	      validator: function validator(value) {
	        return value >= 0 && value <= 100;
	      }
	    },
	    showPivot: {
	      type: Boolean,
	      default: true
	    },
	    pivotText: {
	      type: String,
	      default: function _default() {
	        return this.percentage + '%';
	      }
	    },
	    color: {
	      type: String,
	      default: '#38f'
	    },
	    textColor: {
	      type: String,
	      default: '#fff'
	    }
	  },

	  computed: {
	    componentColor: function componentColor() {
	      return this.inactive ? '#cacaca' : this.color;
	    },
	    pivotStyle: function pivotStyle() {
	      var percentage = this.percentage;

	      return {
	        color: this.textColor,
	        backgroundColor: this.componentColor,
	        left: percentage <= 5 ? '0%' : percentage >= 95 ? '100%' : percentage + '%',
	        marginLeft: percentage <= 5 ? '0' : percentage >= 95 ? '-28px' : '-14px'
	      };
	    },
	    portionStyle: function portionStyle() {
	      return {
	        width: this.percentage + '%',
	        backgroundColor: this.componentColor
	      };
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-abeca86c","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/progress/index.vue
	var progress_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-progress"},[_c('span',{staticClass:"van-progress__portion",style:(_vm.portionStyle)}),_c('span',{directives:[{name:"show",rawName:"v-show",value:(_vm.showPivot),expression:"showPivot"}],staticClass:"van-progress__pivot",style:(_vm.pivotStyle)},[_vm._v(_vm._s(_vm.pivotText))])])}
	var progress_staticRenderFns = []
	var progress_esExports = { render: progress_render, staticRenderFns: progress_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_progress = (progress_esExports);
	// CONCATENATED MODULE: ./packages/progress/index.vue
	var progress_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var progress___vue_template_functional__ = false
	/* styles */
	var progress___vue_styles__ = null
	/* scopeId */
	var progress___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var progress___vue_module_identifier__ = null
	var progress_Component = progress_normalizeComponent(
	  progress,
	  selectortype_template_index_0_packages_progress,
	  progress___vue_template_functional__,
	  progress___vue_styles__,
	  progress___vue_scopeId__,
	  progress___vue_module_identifier__
	)

	/* harmony default export */ var packages_progress = (progress_Component.exports);

	// CONCATENATED MODULE: ./packages/utils/scroll.js


	/* harmony default export */ var utils_scroll = ({
	  debounce: function debounce(func, wait, immediate) {
	    var timeout = void 0,
	        args = void 0,
	        context = void 0,
	        timestamp = void 0,
	        result = void 0;
	    return function () {
	      context = this;
	      args = arguments;
	      timestamp = new Date();
	      var later = function later() {
	        var last = new Date() - timestamp;
	        if (last < wait) {
	          timeout = setTimeout(later, wait - last);
	        } else {
	          timeout = null;
	          result = func.apply(context, args);
	        }
	      };
	      if (!timeout) {
	        timeout = setTimeout(later, wait);
	      }
	      return result;
	    };
	  },


	  // 找到最近的触发滚动事件的元素
	  getScrollEventTarget: function getScrollEventTarget(element) {
	    var currentNode = element;
	    // bugfix, see http://w3help.org/zh-cn/causes/SD9013 and http://stackoverflow.com/questions/17016740/onscroll-function-is-not-working-for-chrome
	    while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
	      var overflowY = this.getComputedStyle(currentNode).overflowY;
	      if (overflowY === 'scroll' || overflowY === 'auto') {
	        return currentNode;
	      }
	      currentNode = currentNode.parentNode;
	    }
	    return window;
	  },


	  // 判断元素是否被加入到页面节点内
	  isAttached: function isAttached(element) {
	    var currentNode = element.parentNode;
	    while (currentNode) {
	      if (currentNode.tagName === 'HTML') {
	        return true;
	      }
	      if (currentNode.nodeType === 11) {
	        return false;
	      }
	      currentNode = currentNode.parentNode;
	    }
	    return false;
	  },


	  // 获取滚动高度
	  getScrollTop: function getScrollTop(element) {
	    return 'scrollTop' in element ? element.scrollTop : element.pageYOffset;
	  },


	  // 设置滚动高度
	  setScrollTop: function setScrollTop(element, value) {
	    'scrollTop' in element ? element.scrollTop = value : element.scrollTo(element.scrollX, value);
	  },


	  // 获取元素距离顶部高度
	  getElementTop: function getElementTop(element) {
	    return (element === window ? 0 : element.getBoundingClientRect().top) + this.getScrollTop(window);
	  },
	  getVisibleHeight: function getVisibleHeight(element) {
	    return element === window ? element.innerHeight : element.getBoundingClientRect().height;
	  },


	  getComputedStyle: !utils["f" /* isServer */] && document.defaultView.getComputedStyle.bind(document.defaultView)
	});
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/pull-refresh/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var pull_refresh = (Object(utils["b" /* create */])({
	  name: 'van-pull-refresh',

	  props: {
	    pullingText: String,
	    loosingText: String,
	    loadingText: String,
	    value: {
	      type: Boolean,
	      required: true
	    },
	    animationDuration: {
	      type: Number,
	      default: 300
	    },
	    headHeight: {
	      type: Number,
	      default: 50
	    }
	  },

	  data: function data() {
	    return {
	      status: 'normal',
	      height: 0,
	      duration: 0
	    };
	  },


	  computed: {
	    style: function style() {
	      return {
	        transition: this.duration + 'ms',
	        transform: 'translate3d(0,' + this.height + 'px, 0)'
	      };
	    }
	  },

	  mounted: function mounted() {
	    this.scrollEl = utils_scroll.getScrollEventTarget(this.$el);
	  },


	  watch: {
	    value: function value(val) {
	      if (!val) {
	        this.duration = this.animationDuration;
	        this.getStatus(0);
	      }
	    }
	  },

	  methods: {
	    onTouchStart: function onTouchStart(event) {
	      if (this.status === 'loading') {
	        return;
	      }
	      if (this.getCeiling()) {
	        this.duration = 0;
	        this.startX = event.touches[0].clientX;
	        this.startY = event.touches[0].clientY;
	      }
	    },
	    onTouchMove: function onTouchMove(event) {
	      if (this.status === 'loading') {
	        return;
	      }

	      this.deltaY = event.touches[0].clientY - this.startY;
	      this.direction = this.getDirection(event.touches[0]);

	      if (!this.ceiling && this.getCeiling()) {
	        this.duration = 0;
	        this.startY = event.touches[0].clientY;
	        this.deltaY = 0;
	      }

	      if (this.ceiling && this.deltaY >= 0) {
	        if (this.direction === 'vertical') {
	          event.preventDefault();
	        }
	        this.getStatus(this.ease(this.deltaY));
	      }
	    },
	    onTouchEnd: function onTouchEnd() {
	      if (this.status === 'loading') {
	        return;
	      }

	      if (this.ceiling && this.deltaY) {
	        this.duration = this.animationDuration;
	        if (this.status === 'loosing') {
	          this.getStatus(this.headHeight, true);
	          this.$emit('input', true);
	        } else {
	          this.getStatus(0);
	        }
	      }
	    },
	    getCeiling: function getCeiling() {
	      this.ceiling = utils_scroll.getScrollTop(this.scrollEl) === 0;
	      return this.ceiling;
	    },
	    ease: function ease(height) {
	      var headHeight = this.headHeight;

	      return height < headHeight ? height : height < headHeight * 2 ? Math.round(headHeight + (height - headHeight) / 2) : Math.round(headHeight * 1.5 + (height - headHeight * 2) / 4);
	    },
	    getStatus: function getStatus(height, isLoading) {
	      this.height = height;

	      var status = isLoading ? 'loading' : height === 0 ? 'normal' : height < this.headHeight ? 'pulling' : 'loosing';

	      if (status !== this.status) {
	        this.status = status;
	      }
	    },
	    getDirection: function getDirection(touch) {
	      var distanceX = Math.abs(touch.clientX - this.startX);
	      var distanceY = Math.abs(touch.clientY - this.startY);
	      return distanceX > distanceY ? 'horizontal' : distanceX < distanceY ? 'vertical' : '';
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-1c25e2e7","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/pull-refresh/index.vue
	var pull_refresh_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-pull-refresh",style:(_vm.style),on:{"touchstart":_vm.onTouchStart,"touchmove":_vm.onTouchMove,"touchend":_vm.onTouchEnd,"touchcancel":_vm.onTouchEnd}},[_c('div',{staticClass:"van-pull-refresh__head"},[(_vm.status === 'normal')?_vm._t("normal"):_vm._e(),(_vm.status === 'pulling')?_vm._t("pulling",[_c('span',{staticClass:"van-pull-refresh__text"},[_vm._v(_vm._s(_vm.pullingText || _vm.$t('pullingText')))])]):_vm._e(),(_vm.status === 'loosing')?_vm._t("loosing",[_c('span',{staticClass:"van-pull-refresh__text"},[_vm._v(_vm._s(_vm.loosingText || _vm.$t('loosingText')))])]):_vm._e(),(_vm.status === 'loading')?_vm._t("loading",[_c('div',{staticClass:"van-pull-refresh__loading"},[_c('loading'),_c('span',[_vm._v(_vm._s(_vm.loadingText || _vm.$t('loadingText')))])],1)]):_vm._e()],2),_vm._t("default")],2)}
	var pull_refresh_staticRenderFns = []
	var pull_refresh_esExports = { render: pull_refresh_render, staticRenderFns: pull_refresh_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_pull_refresh = (pull_refresh_esExports);
	// CONCATENATED MODULE: ./packages/pull-refresh/index.vue
	var pull_refresh_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var pull_refresh___vue_template_functional__ = false
	/* styles */
	var pull_refresh___vue_styles__ = null
	/* scopeId */
	var pull_refresh___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var pull_refresh___vue_module_identifier__ = null
	var pull_refresh_Component = pull_refresh_normalizeComponent(
	  pull_refresh,
	  selectortype_template_index_0_packages_pull_refresh,
	  pull_refresh___vue_template_functional__,
	  pull_refresh___vue_styles__,
	  pull_refresh___vue_scopeId__,
	  pull_refresh___vue_module_identifier__
	)

	/* harmony default export */ var packages_pull_refresh = (pull_refresh_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/row/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var row = (Object(utils["b" /* create */])({
	  name: 'van-row',

	  props: {
	    gutter: {
	      type: [Number, String],
	      default: 0
	    }
	  },

	  computed: {
	    style: function style() {
	      var margin = '-' + Number(this.gutter) / 2 + 'px';
	      return this.gutter ? { marginLeft: margin, marginRight: margin } : {};
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-0078c433","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/row/index.vue
	var row_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-row",style:(_vm.style)},[_vm._t("default")],2)}
	var row_staticRenderFns = []
	var row_esExports = { render: row_render, staticRenderFns: row_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_row = (row_esExports);
	// CONCATENATED MODULE: ./packages/row/index.vue
	var row_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var row___vue_template_functional__ = false
	/* styles */
	var row___vue_styles__ = null
	/* scopeId */
	var row___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var row___vue_module_identifier__ = null
	var row_Component = row_normalizeComponent(
	  row,
	  selectortype_template_index_0_packages_row,
	  row___vue_template_functional__,
	  row___vue_styles__,
	  row___vue_scopeId__,
	  row___vue_module_identifier__
	)

	/* harmony default export */ var packages_row = (row_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/search/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var search = (Object(utils["b" /* create */])({
	  name: 'van-search',

	  props: {
	    value: String,
	    showAction: Boolean,
	    placeholder: String,
	    background: {
	      type: String,
	      default: '#f2f2f2'
	    }
	  },

	  data: function data() {
	    return {
	      isFocus: false,
	      focusStatus: false
	    };
	  },


	  directives: {
	    Clickoutside: clickoutside,
	    refocus: {
	      update: function update(el, state) {
	        if (state.value) {
	          el.focus();
	        }
	      }
	    }
	  },

	  methods: {
	    onFocus: function onFocus() {
	      this.isFocus = true;
	    },
	    onInput: function onInput(event) {
	      this.$emit('input', event.target.value);
	    },


	    // refocus after click close icon
	    onClean: function onClean() {
	      var _this = this;

	      this.$emit('input', '');
	      this.focusStatus = true;

	      // ensure refocus can work after click clean icon
	      this.$nextTick(function () {
	        _this.focusStatus = false;
	      });
	    },
	    onBack: function onBack() {
	      this.$emit('input', '');
	      this.$emit('cancel');
	    },
	    onSearch: function onSearch(e) {
	      e.preventDefault();
	      this.$emit('search', this.value);
	      return false;
	    },
	    onClickoutside: function onClickoutside() {
	      this.isFocus = false;
	      this.focusStatus = false;
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-611673ba","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/search/index.vue
	var search_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-search",class:{ 'van-search--show-action': _vm.showAction },style:({ 'background-color': _vm.background })},[_c('div',{directives:[{name:"clickoutside",rawName:"v-clickoutside",value:(_vm.onClickoutside),expression:"onClickoutside"}],staticClass:"van-search__input-wrap"},[_c('icon',{attrs:{"name":"search"}}),_c('input',{directives:[{name:"refocus",rawName:"v-refocus",value:(_vm.focusStatus),expression:"focusStatus"}],staticClass:"van-search__input",attrs:{"type":"search","placeholder":_vm.placeholder},domProps:{"value":_vm.value},on:{"input":_vm.onInput,"focus":_vm.onFocus,"keypress":function($event){if(!('button' in $event)&&_vm._k($event.keyCode,"enter",13,$event.key)){ return null; }$event.preventDefault();_vm.onSearch($event)}}}),_c('icon',{directives:[{name:"show",rawName:"v-show",value:(_vm.isFocus),expression:"isFocus"}],attrs:{"name":"clear"},on:{"click":_vm.onClean}})],1),(_vm.showAction)?_c('div',{staticClass:"van-search__action"},[_vm._t("action",[_c('div',{staticClass:"van-search__action-text",on:{"click":_vm.onBack}},[_vm._v(_vm._s(_vm.$t('cancel')))])])],2):_vm._e()])}
	var search_staticRenderFns = []
	var search_esExports = { render: search_render, staticRenderFns: search_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_search = (search_esExports);
	// CONCATENATED MODULE: ./packages/search/index.vue
	var search_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var search___vue_template_functional__ = false
	/* styles */
	var search___vue_styles__ = null
	/* scopeId */
	var search___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var search___vue_module_identifier__ = null
	var search_Component = search_normalizeComponent(
	  search,
	  selectortype_template_index_0_packages_search,
	  search___vue_template_functional__,
	  search___vue_styles__,
	  search___vue_scopeId__,
	  search___vue_module_identifier__
	)

	/* harmony default export */ var packages_search = (search_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/sku/components/SkuActions.vue
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var SkuActions = ({
	  name: 'van-sku-actions',

	  components: {
	    VanButton: packages_button
	  },

	  props: {
	    skuEventBus: Object,
	    showAddCartBtn: Boolean,
	    buyText: {
	      type: String,
	      default: '立即购买'
	    }
	  },

	  methods: {
	    onAddCartClicked: function onAddCartClicked() {
	      this.skuEventBus.$emit('sku:addCart');
	    },
	    onBuyClicked: function onBuyClicked() {
	      this.skuEventBus.$emit('sku:buy');
	    }
	  }
	});
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-010ecc6c","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/sku/components/SkuActions.vue
	var SkuActions_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-sku-actions"},[(_vm.showAddCartBtn)?_c('van-button',{attrs:{"bottomAction":""},on:{"click":_vm.onAddCartClicked}},[_vm._v("加入购物车")]):_vm._e(),_c('van-button',{attrs:{"type":"primary","bottomAction":""},on:{"click":_vm.onBuyClicked}},[_vm._v(_vm._s(_vm.buyText))])],1)}
	var SkuActions_staticRenderFns = []
	var SkuActions_esExports = { render: SkuActions_render, staticRenderFns: SkuActions_staticRenderFns }
	/* harmony default export */ var components_SkuActions = (SkuActions_esExports);
	// CONCATENATED MODULE: ./packages/sku/components/SkuActions.vue
	var SkuActions_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var SkuActions___vue_template_functional__ = false
	/* styles */
	var SkuActions___vue_styles__ = null
	/* scopeId */
	var SkuActions___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var SkuActions___vue_module_identifier__ = null
	var SkuActions_Component = SkuActions_normalizeComponent(
	  SkuActions,
	  components_SkuActions,
	  SkuActions___vue_template_functional__,
	  SkuActions___vue_styles__,
	  SkuActions___vue_scopeId__,
	  SkuActions___vue_module_identifier__
	)

	/* harmony default export */ var sku_components_SkuActions = (SkuActions_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/sku/components/SkuHeader.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//

	/* harmony default export */ var SkuHeader = ({
	  name: 'van-sku-header',

	  props: {
	    skuEventBus: Object,
	    sku: Object,
	    selectedSku: Object,
	    selectedSkuComb: Object,
	    goods: Object
	  },

	  computed: {
	    skuTree: function skuTree() {
	      return this.sku.tree;
	    },
	    goodsImg: function goodsImg() {
	      var s1Id = this.selectedSku.s1;
	      var skuImg = this.getSkuImg(s1Id);
	      // 优先使用选中sku的图片
	      return skuImg || this.goods.picture;
	    },
	    price: function price() {
	      if (this.selectedSkuComb) {
	        return (this.selectedSkuComb.price / 100).toFixed(2);
	      }
	      // sku.price是一个格式化好的价格区间
	      return this.sku.price;
	    }
	  },

	  methods: {
	    onCloseClicked: function onCloseClicked() {
	      this.skuEventBus.$emit('sku:close');
	    },
	    getSkuImg: function getSkuImg(id) {
	      if (!id) return;

	      // 目前skuImg都挂载在skuTree中s1那类sku上
	      var treeItem = this.skuTree.filter(function (treeItem) {
	        return treeItem.k_s === 's1';
	      })[0] || {};

	      if (!treeItem.v) {
	        return;
	      }

	      var matchedSku = treeItem.v.filter(function (skuValue) {
	        return skuValue.id === id;
	      })[0];
	      if (matchedSku && matchedSku.imgUrl) {
	        return matchedSku.imgUrl;
	      }
	    }
	  }
	});
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-1a2f1e45","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/sku/components/SkuHeader.vue
	var SkuHeader_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-sku-header van-hairline--bottom"},[_c('div',{staticClass:"van-sku-header__img-wrap"},[_c('img',{staticClass:"van-sku__goods-img",attrs:{"src":_vm.goodsImg}})]),_c('div',{staticClass:"van-sku-header__goods-info"},[_c('div',{staticClass:"van-sku__goods-name"},[_vm._v(_vm._s(_vm.goods.title))]),_c('div',{staticClass:"van-sku__goods-price"},[_c('span',{staticClass:"van-sku__price-symbol"},[_vm._v("￥")]),_c('span',{staticClass:"van-sku__price-num"},[_vm._v(_vm._s(_vm.price))])]),_c('span',{staticClass:"van-sku__close-icon",on:{"click":_vm.onCloseClicked}})])])}
	var SkuHeader_staticRenderFns = []
	var SkuHeader_esExports = { render: SkuHeader_render, staticRenderFns: SkuHeader_staticRenderFns }
	/* harmony default export */ var components_SkuHeader = (SkuHeader_esExports);
	// CONCATENATED MODULE: ./packages/sku/components/SkuHeader.vue
	var SkuHeader_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var SkuHeader___vue_template_functional__ = false
	/* styles */
	var SkuHeader___vue_styles__ = null
	/* scopeId */
	var SkuHeader___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var SkuHeader___vue_module_identifier__ = null
	var SkuHeader_Component = SkuHeader_normalizeComponent(
	  SkuHeader,
	  components_SkuHeader,
	  SkuHeader___vue_template_functional__,
	  SkuHeader___vue_styles__,
	  SkuHeader___vue_scopeId__,
	  SkuHeader___vue_module_identifier__
	)

	/* harmony default export */ var sku_components_SkuHeader = (SkuHeader_Component.exports);

	// CONCATENATED MODULE: ./packages/utils/validate/email.js
	function email(value) {
	  var reg = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
	  return reg.test(value);
	}
	// CONCATENATED MODULE: ./packages/utils/validate/number.js
	function number(value) {
	  return (/^\d+$/.test(value)
	  );
	}
	// CONCATENATED MODULE: ./packages/sku/constants.js
	var LIMIT_TYPE = {
	  QUOTA_LIMIT: 0,
	  STOCK_LIMIT: 1
	};

	var DEFAULT_BUY_TEXT = '立即购买';

	var DEFAULT_STEPPER_TITLE = '购买数量';

	var DEFAULT_PLACEHOLDER_MAP = {
	  'id_no': '输入18位身份证号码',
	  text: '输入文本',
	  tel: '输入数字',
	  email: '输入邮箱',
	  date: '点击选择日期',
	  time: '点击选择时间',
	  textarea: '点击填写段落文本'
	};
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/sku/components/SkuMessages.vue

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//







	/* harmony default export */ var SkuMessages = ({
	  name: 'van-sku-messages',

	  components: {
	    Field: packages_field,
	    CellGroup: packages_cell_group
	  },

	  props: {
	    messages: Array,
	    messagePlaceholderMap: Object,
	    goodsId: [Number, String]
	  },

	  data: function data() {
	    return {
	      placeholderMap: assign_default()({}, DEFAULT_PLACEHOLDER_MAP, this.messagePlaceholderMap)
	    };
	  },


	  // for debug
	  // watch: {
	  //   messageValues() {
	  //     console.log(this.messageValues);
	  //   }
	  // },

	  computed: {
	    internalMessages: function internalMessages() {
	      if (Object.prototype.toString.call(this.messages) === '[object Array]') {
	        return this.messages;
	      }
	      return [];
	    },
	    messageValues: function messageValues() {
	      var messageValues = [];
	      this.internalMessages.forEach(function (message, index) {
	        messageValues[index] = '';
	      });

	      return messageValues;
	    }
	  },

	  methods: {
	    getType: function getType(_ref) {
	      var type = _ref.type,
	          datetime = _ref.datetime;

	      if (type === 'id_no') return 'text';
	      return datetime > 0 ? 'datetime-local' : type;
	    },
	    getMessages: function getMessages() {
	      var _this = this;

	      var messages = {};

	      this.messageValues.forEach(function (value, index) {
	        if (_this.internalMessages[index].datetime > 0) {
	          value = value.replace(/T/g, ' ');
	        }
	        messages['message_' + index] = value;
	      });

	      return messages;
	    },
	    getCartMessages: function getCartMessages() {
	      var _this2 = this;

	      var messages = {};

	      this.messageValues.forEach(function (value, index) {
	        var message = _this2.internalMessages[index];
	        if (message.datetime > 0) {
	          value = value.replace(/T/g, ' ');
	        }
	        messages[message.name] = value;
	      });

	      return messages;
	    },
	    validateMessages: function validateMessages() {
	      var values = this.messageValues;

	      for (var i = 0; i < values.length; i++) {
	        var value = values[i];
	        var message = this.internalMessages[i];

	        if (value === '') {
	          // 必填字段的校验
	          if (message.required == '1') {
	            // eslint-disable-line
	            if (message.type === 'image') {
	              continue;
	              // return `请上传${message.name}`;
	            } else {
	              return '\u8BF7\u586B\u5199' + message.name;
	            }
	          }
	        } else {
	          if (message.type === 'tel' && !number(value)) {
	            return '请填写正确的数字格式留言';
	          }
	          if (message.type === 'email' && !email(value)) {
	            return '请填写正确的邮箱';
	          }
	          if (message.type === 'id_no' && (value.length < 15 || value.length > 18)) {
	            return '请填写正确的身份证号码';
	          }
	        }

	        if (value.length > 200) {
	          return message.name + ' \u5199\u7684\u592A\u591A\u4E86<br/>\u4E0D\u8981\u8D85\u8FC7200\u5B57';
	        }
	      }
	    }
	  }

	});
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-4e1919fa","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/sku/components/SkuMessages.vue
	var SkuMessages_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('cell-group',{staticClass:"van-sku-messages"},[_vm._l((_vm.internalMessages),function(message,index){return [(message.type === 'image')?void 0:(message.multiple == '1')?_c('field',{key:(_vm.goodsId + "-" + index),attrs:{"required":message.required == '1',"label":message.name,"placeholder":_vm.placeholderMap.textarea,"type":"textarea"},model:{value:(_vm.messageValues[index]),callback:function ($$v) {_vm.$set(_vm.messageValues, index, $$v)},expression:"messageValues[index]"}}):_c('field',{key:(_vm.goodsId + "-" + index),attrs:{"required":message.required == '1',"label":message.name,"placeholder":_vm.placeholderMap[message.type],"type":_vm.getType(message)},model:{value:(_vm.messageValues[index]),callback:function ($$v) {_vm.$set(_vm.messageValues, index, $$v)},expression:"messageValues[index]"}})]})],2)}
	var SkuMessages_staticRenderFns = []
	var SkuMessages_esExports = { render: SkuMessages_render, staticRenderFns: SkuMessages_staticRenderFns }
	/* harmony default export */ var components_SkuMessages = (SkuMessages_esExports);
	// CONCATENATED MODULE: ./packages/sku/components/SkuMessages.vue
	var SkuMessages_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var SkuMessages___vue_template_functional__ = false
	/* styles */
	var SkuMessages___vue_styles__ = null
	/* scopeId */
	var SkuMessages___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var SkuMessages___vue_module_identifier__ = null
	var SkuMessages_Component = SkuMessages_normalizeComponent(
	  SkuMessages,
	  components_SkuMessages,
	  SkuMessages___vue_template_functional__,
	  SkuMessages___vue_styles__,
	  SkuMessages___vue_scopeId__,
	  SkuMessages___vue_module_identifier__
	)

	/* harmony default export */ var sku_components_SkuMessages = (SkuMessages_Component.exports);

	// EXTERNAL MODULE: ./node_modules/babel-runtime/core-js/number/is-nan.js
	var is_nan = __webpack_require__(106);
	var is_nan_default = /*#__PURE__*/__webpack_require__.n(is_nan);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/stepper/index.vue

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var stepper = (Object(utils["b" /* create */])({
	  name: 'van-stepper',

	  props: {
	    value: {},
	    disabled: Boolean,
	    disableInput: Boolean,
	    min: {
	      type: [String, Number],
	      default: 1
	    },
	    max: {
	      type: [String, Number],
	      default: Infinity
	    },
	    step: {
	      type: [String, Number],
	      default: 1
	    },
	    defaultValue: {
	      type: [String, Number],
	      default: 1
	    }
	  },

	  data: function data() {
	    var value = this.value ? +this.value : +this.defaultValue;
	    var correctedValue = this.correctValue(value);
	    if (value !== correctedValue) {
	      value = correctedValue;
	      this.$emit('input', value);
	    }

	    return {
	      currentValue: value
	    };
	  },


	  computed: {
	    isMinusDisabled: function isMinusDisabled() {
	      var min = +this.min;
	      var step = +this.step;
	      var currentValue = +this.currentValue;
	      return min === currentValue || currentValue - step < min || this.disabled;
	    },
	    isPlusDisabled: function isPlusDisabled() {
	      var max = +this.max;
	      var step = +this.step;
	      var currentValue = +this.currentValue;
	      return max === currentValue || currentValue + step > max || this.disabled;
	    }
	  },

	  watch: {
	    currentValue: function currentValue(val) {
	      this.$emit('input', val);
	      this.$emit('change', val);
	    },
	    value: function value(val) {
	      val = this.correctValue(+val);
	      if (val !== this.currentValue) {
	        this.currentValue = val;
	      }
	    }
	  },

	  methods: {
	    correctValue: function correctValue(value) {
	      if (is_nan_default()(value)) {
	        value = this.min;
	      } else {
	        value = Math.max(this.min, value);
	        value = Math.min(this.max, value);
	      }

	      return value;
	    },
	    onInput: function onInput(event) {
	      var val = +event.target.value;
	      this.currentValue = this.correctValue(val);
	    },
	    onChange: function onChange(type) {
	      if (this.isMinusDisabled && type === 'minus' || this.isPlusDisabled && type === 'plus') {
	        this.$emit('overlimit', type);
	        return;
	      }

	      var step = +this.step;
	      var currentValue = +this.currentValue;
	      this.currentValue = type === 'minus' ? currentValue - step : currentValue + step;
	      this.$emit(type);
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-ef61e27c","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/stepper/index.vue
	var stepper_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-stepper",class:{ 'van-stepper--disabled': _vm.disabled }},[_c('button',{staticClass:"van-stepper__stepper van-stepper__minus",class:{ 'van-stepper__minus--disabled': _vm.isMinusDisabled },on:{"click":function($event){_vm.onChange('minus')}}}),_c('input',{staticClass:"van-stepper__input",attrs:{"type":"number","disabled":_vm.disabled || _vm.disableInput},domProps:{"value":_vm.currentValue},on:{"input":_vm.onInput}}),_c('button',{staticClass:"van-stepper__stepper van-stepper__plus",class:{ 'van-stepper__plus--disabled': _vm.isPlusDisabled },on:{"click":function($event){_vm.onChange('plus')}}})])}
	var stepper_staticRenderFns = []
	var stepper_esExports = { render: stepper_render, staticRenderFns: stepper_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_stepper = (stepper_esExports);
	// CONCATENATED MODULE: ./packages/stepper/index.vue
	var stepper_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var stepper___vue_template_functional__ = false
	/* styles */
	var stepper___vue_styles__ = null
	/* scopeId */
	var stepper___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var stepper___vue_module_identifier__ = null
	var stepper_Component = stepper_normalizeComponent(
	  stepper,
	  selectortype_template_index_0_packages_stepper,
	  stepper___vue_template_functional__,
	  stepper___vue_styles__,
	  stepper___vue_scopeId__,
	  stepper___vue_module_identifier__
	)

	/* harmony default export */ var packages_stepper = (stepper_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/sku/components/SkuStepper.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	var QUOTA_LIMIT = LIMIT_TYPE.QUOTA_LIMIT,
	    STOCK_LIMIT = LIMIT_TYPE.STOCK_LIMIT;


	/* harmony default export */ var SkuStepper = ({
	  name: 'van-sku-stepper',

	  components: {
	    Stepper: packages_stepper
	  },

	  props: {
	    skuEventBus: Object,
	    skuStockNum: Number,
	    selectedSku: Object,
	    selectedSkuComb: Object,
	    selectedNum: Number,
	    quota: Number,
	    quotaUsed: Number,
	    hideStock: {
	      type: Boolean,
	      default: false
	    },
	    disableStepperInput: {
	      type: Boolean,
	      default: false
	    },
	    stepperTitle: {
	      type: String,
	      default: DEFAULT_BUY_TEXT
	    }
	  },

	  data: function data() {
	    return {
	      currentNum: this.selectedNum,
	      // 购买限制类型: 限购/库存
	      limitType: STOCK_LIMIT
	    };
	  },


	  watch: {
	    currentNum: function currentNum(num) {
	      this.skuEventBus.$emit('sku:numChange', num);
	    },
	    stepperLimit: function stepperLimit(limit) {
	      if (limit < this.currentNum) {
	        this.currentNum = limit;
	      }
	    }
	  },

	  computed: {
	    stock: function stock() {
	      if (this.selectedSkuComb) {
	        return this.selectedSkuComb.stock_num;
	      }
	      return this.skuStockNum;
	    },
	    stepperLimit: function stepperLimit() {
	      var quotaLimit = this.quota - this.quotaUsed;
	      var limit = void 0;

	      // 无限购时直接取库存，有限购时取限购数和库存数中小的那个
	      if (this.quota > 0 && quotaLimit <= this.stock) {
	        // 修正负的limit
	        limit = quotaLimit < 0 ? 0 : quotaLimit;
	        this.limitType = QUOTA_LIMIT;
	      } else {
	        limit = this.stock;
	      }

	      return limit;
	    }
	  },

	  methods: {
	    setCurrentNum: function setCurrentNum(num) {
	      this.currentNum = num;
	    },
	    handleOverLimit: function handleOverLimit(action) {
	      this.skuEventBus.$emit('sku:overLimit', {
	        action: action,
	        limitType: this.limitType,
	        quota: this.quota,
	        quotaUsed: this.quotaUsed
	      });
	    }
	  }
	});
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-0910af40","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/sku/components/SkuStepper.vue
	var SkuStepper_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-sku-stepper-stock"},[_c('div',{staticClass:"van-sku-stepper-container"},[_c('div',{staticClass:"van-sku__stepper-title"},[_vm._v(_vm._s(_vm.stepperTitle)+"：")]),_c('stepper',{staticClass:"van-sku__stepper",attrs:{"min":1,"max":_vm.stepperLimit,"disableInput":_vm.disableStepperInput},on:{"overlimit":_vm.handleOverLimit},model:{value:(_vm.currentNum),callback:function ($$v) {_vm.currentNum=$$v},expression:"currentNum"}})],1),(!_vm.hideStock)?_c('div',{staticClass:"van-sku__stock"},[_vm._v("剩余"+_vm._s(_vm.stock)+"件")]):_vm._e(),(_vm.quota > 0)?_c('div',{staticClass:"van-sku__quota"},[_vm._v("每人限购"+_vm._s(_vm.quota)+"件")]):_vm._e()])}
	var SkuStepper_staticRenderFns = []
	var SkuStepper_esExports = { render: SkuStepper_render, staticRenderFns: SkuStepper_staticRenderFns }
	/* harmony default export */ var components_SkuStepper = (SkuStepper_esExports);
	// CONCATENATED MODULE: ./packages/sku/components/SkuStepper.vue
	var SkuStepper_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var SkuStepper___vue_template_functional__ = false
	/* styles */
	var SkuStepper___vue_styles__ = null
	/* scopeId */
	var SkuStepper___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var SkuStepper___vue_module_identifier__ = null
	var SkuStepper_Component = SkuStepper_normalizeComponent(
	  SkuStepper,
	  components_SkuStepper,
	  SkuStepper___vue_template_functional__,
	  SkuStepper___vue_styles__,
	  SkuStepper___vue_scopeId__,
	  SkuStepper___vue_module_identifier__
	)

	/* harmony default export */ var sku_components_SkuStepper = (SkuStepper_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/sku/components/SkuRow.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//

	/* harmony default export */ var SkuRow = ({
	  name: 'van-sku-row',

	  props: {
	    skuRow: Object
	  }
	});
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-a56870d8","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/sku/components/SkuRow.vue
	var SkuRow_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-sku-row"},[_c('div',{staticClass:"van-sku-row__title"},[_vm._v(_vm._s(_vm.skuRow.k)+"：")]),_c('div',{staticClass:"van-sku-row__items"},[_vm._t("default")],2)])}
	var SkuRow_staticRenderFns = []
	var SkuRow_esExports = { render: SkuRow_render, staticRenderFns: SkuRow_staticRenderFns }
	/* harmony default export */ var components_SkuRow = (SkuRow_esExports);
	// CONCATENATED MODULE: ./packages/sku/components/SkuRow.vue
	var SkuRow_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var SkuRow___vue_template_functional__ = false
	/* styles */
	var SkuRow___vue_styles__ = null
	/* scopeId */
	var SkuRow___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var SkuRow___vue_module_identifier__ = null
	var SkuRow_Component = SkuRow_normalizeComponent(
	  SkuRow,
	  components_SkuRow,
	  SkuRow___vue_template_functional__,
	  SkuRow___vue_styles__,
	  SkuRow___vue_scopeId__,
	  SkuRow___vue_module_identifier__
	)

	/* harmony default export */ var sku_components_SkuRow = (SkuRow_Component.exports);

	// EXTERNAL MODULE: ./node_modules/babel-runtime/core-js/object/keys.js
	var keys = __webpack_require__(62);
	var keys_default = /*#__PURE__*/__webpack_require__.n(keys);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/sku/components/SkuRowItem.vue


	//
	//
	//
	//
	//
	//
	//
	//
	//
	//

	/* harmony default export */ var SkuRowItem = ({
	  name: 'van-sku-row-item',

	  props: {
	    skuEventBus: Object,
	    skuValue: Object,
	    skuList: Array,
	    selectedSku: Object,
	    skuKeyStr: String
	  },

	  computed: {
	    isChoosed: function isChoosed() {
	      return this.skuValue.id === this.selectedSku[this.skuKeyStr];
	    },
	    isChoosable: function isChoosable() {
	      var _Object$assign2;

	      var matchedSku = assign_default()({}, this.selectedSku, (_Object$assign2 = {}, _Object$assign2[this.skuKeyStr] = this.skuValue.id, _Object$assign2));
	      var skusToCheck = keys_default()(matchedSku).filter(function (skuKey) {
	        return matchedSku[skuKey] !== '';
	      });
	      var filteredSku = this.skuList.filter(function (sku) {
	        return skusToCheck.every(function (skuKey) {
	          // 后端给的skuValue.id有时候是数字有时候是字符串，全等会匹配不上
	          return matchedSku[skuKey] == sku[skuKey]; // eslint-disable-line
	        });
	      });
	      var stock = filteredSku.reduce(function (total, sku) {
	        return total += sku.stock_num;
	      }, 0);

	      return stock > 0;
	    }
	  },

	  methods: {
	    onSkuSelected: function onSkuSelected() {
	      this.skuEventBus.$emit('sku:select', assign_default()({}, this.skuValue, { skuKeyStr: this.skuKeyStr }));
	    }
	  }
	});
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-e3ce9f3c","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/sku/components/SkuRowItem.vue
	var SkuRowItem_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.isChoosable)?_c('span',{staticClass:"van-sku-row__item",class:{ 'van-sku-row__item--active': _vm.isChoosed },on:{"click":_vm.onSkuSelected}},[_vm._v("\n  "+_vm._s(_vm.skuValue.name)+"\n")]):_c('span',{staticClass:"van-sku-row__item van-sku-row__item--disabled"},[_vm._v(_vm._s(_vm.skuValue.name))])}
	var SkuRowItem_staticRenderFns = []
	var SkuRowItem_esExports = { render: SkuRowItem_render, staticRenderFns: SkuRowItem_staticRenderFns }
	/* harmony default export */ var components_SkuRowItem = (SkuRowItem_esExports);
	// CONCATENATED MODULE: ./packages/sku/components/SkuRowItem.vue
	var SkuRowItem_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var SkuRowItem___vue_template_functional__ = false
	/* styles */
	var SkuRowItem___vue_styles__ = null
	/* scopeId */
	var SkuRowItem___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var SkuRowItem___vue_module_identifier__ = null
	var SkuRowItem_Component = SkuRowItem_normalizeComponent(
	  SkuRowItem,
	  components_SkuRowItem,
	  SkuRowItem___vue_template_functional__,
	  SkuRowItem___vue_styles__,
	  SkuRowItem___vue_scopeId__,
	  SkuRowItem___vue_module_identifier__
	)

	/* harmony default export */ var sku_components_SkuRowItem = (SkuRowItem_Component.exports);

	// CONCATENATED MODULE: ./packages/sku/utils/skuHelper.js

	/*
	  normalize sku tree

	  [
	    {
	      count: 2,
	      k: "品种", // 规格名称 skuKeyName
	      k_id: "1200", // skuKeyId
	      k_s: "s1" // skuKeyStr
	      v: [ // skuValues
	        { // skuValue
	          id: "1201", // skuValueId
	          name: "萌" // 具体的规格值 skuValueName
	        }, {
	          id: "973",
	          name: "帅"
	        }
	      ]
	    },
	    ...
	  ]
	                |
	                v
	  {
	    s1: [{
	      id: "1201",
	      name: "萌"
	    }, {
	      id: "973",
	      name: "帅"
	    }],
	    ...
	  }
	 */
	var normalizeSkuTree = function normalizeSkuTree(skuTree) {
	  var normalizedTree = {};
	  skuTree.forEach(function (treeItem) {
	    normalizedTree[treeItem.k_s] = treeItem.v;
	  });
	  return normalizedTree;
	};

	// 判断是否所有的sku都已经选中
	var skuHelper_isAllSelected = function isAllSelected(skuTree, selectedSku) {
	  // 筛选selectedSku对象中key值不为空的值
	  var selected = keys_default()(selectedSku).filter(function (skuKeyStr) {
	    return selectedSku[skuKeyStr] !== '';
	  });
	  return skuTree.length === selected.length;
	};

	// 根据已选择的sku获取skuComb
	var skuHelper_getSkuComb = function getSkuComb(skuList, selectedSku) {
	  var skuComb = skuList.filter(function (skuComb) {
	    return keys_default()(selectedSku).every(function (skuKeyStr) {
	      return String(skuComb[skuKeyStr]) === String(selectedSku[skuKeyStr]); // eslint-disable-line
	    });
	  })[0];
	  return skuComb;
	};

	// 获取已选择的sku名称
	var skuHelper_getSelectedSkuValues = function getSelectedSkuValues(skuTree, selectedSku) {
	  var normalizedTree = normalizeSkuTree(skuTree);
	  return keys_default()(selectedSku).reduce(function (selectedValues, skuKeyStr) {
	    var skuValues = normalizedTree[skuKeyStr];
	    var skuValueId = selectedSku[skuKeyStr];

	    if (skuValueId) {
	      var skuValue = skuValues.filter(function (skuValue) {
	        return skuValue.id === skuValueId;
	      })[0];
	      skuValue && selectedValues.push(skuValue);
	    }
	    return selectedValues;
	  }, []);
	};

	var SkuHelper = {
	  normalizeSkuTree: normalizeSkuTree,
	  isAllSelected: skuHelper_isAllSelected,
	  getSkuComb: skuHelper_getSkuComb,
	  getSelectedSkuValues: skuHelper_getSelectedSkuValues
	};
	/* harmony default export */ var skuHelper = (SkuHelper);
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/sku/containers/SkuContainer.vue

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//














	var SkuContainer_QUOTA_LIMIT = LIMIT_TYPE.QUOTA_LIMIT;


	/* harmony default export */ var SkuContainer = (Object(utils["b" /* create */])({
	  name: 'van-sku',

	  components: {
	    Popup: packages_popup,
	    SkuHeader: sku_components_SkuHeader,
	    SkuRow: sku_components_SkuRow,
	    SkuRowItem: sku_components_SkuRowItem,
	    SkuStepper: sku_components_SkuStepper,
	    SkuMessages: sku_components_SkuMessages,
	    SkuActions: sku_components_SkuActions
	  },

	  props: {
	    goods: Object,
	    goodsId: [Number, String],
	    initialSku: {
	      type: Object,
	      default: function _default() {
	        return {};
	      }
	    },
	    sku: Object,
	    quota: {
	      type: Number,
	      default: 0
	    },
	    quotaUsed: {
	      type: Number,
	      default: 0
	    },
	    hideStock: Boolean,
	    showAddCartBtn: {
	      type: Boolean,
	      default: true
	    },
	    buyText: String,
	    stepperTitle: {
	      type: String,
	      default: DEFAULT_STEPPER_TITLE
	    },
	    bodyOffsetTop: {
	      type: Number,
	      default: 200
	    },
	    resetStepperOnHide: Boolean,
	    disableStepperInput: Boolean,
	    messagePlaceholderMap: {
	      type: Object,
	      default: function _default() {
	        return {};
	      }
	    },
	    value: Boolean
	  },

	  data: function data() {
	    return {
	      selectedSku: {},
	      selectedNum: 1,
	      show: this.value
	    };
	  },


	  watch: {
	    show: function show(val) {
	      this.$emit('input', val);
	      if (!val) {
	        var selectedSkuValues = skuHelper_getSelectedSkuValues(this.sku.tree, this.selectedSku);

	        this.$emit('sku-close', {
	          selectedSkuValues: selectedSkuValues,
	          selectedNum: this.selectedNum,
	          selectedSkuComb: this.selectedSkuComb
	        });

	        if (this.resetStepperOnHide) {
	          this.$refs.skuStepper && this.$refs.skuStepper.setCurrentNum(1);
	        }
	      }
	    },
	    value: function value(val) {
	      this.show = val;
	    },
	    skuTree: function skuTree(val) {
	      this.resetSelectedSku(val);
	    }
	  },

	  computed: {
	    bodyStyle: function bodyStyle() {
	      if (this.$isServer) {
	        return;
	      }

	      var windowHeight = window.innerHeight;
	      // header高度82px, sku actions高度50px，如果改动了样式自己传下bodyOffsetTop调整下
	      var maxHeight = windowHeight - this.bodyOffsetTop;

	      return {
	        maxHeight: maxHeight + 'px'
	      };
	    },
	    isSkuCombSelected: function isSkuCombSelected() {
	      return skuHelper_isAllSelected(this.sku.tree, this.selectedSku);
	    },

	    // sku数据不存在时不渲染模板
	    isSkuEmpty: function isSkuEmpty() {
	      for (var key in this.sku) {
	        if (Object.prototype.hasOwnProperty.call(this.sku, key)) return false;
	      }
	      return true;
	    },
	    hasSku: function hasSku() {
	      return !this.sku.none_sku;
	    },
	    selectedSkuComb: function selectedSkuComb() {
	      if (!this.hasSku) {
	        return {
	          id: this.sku.collection_id,
	          price: Math.round(this.sku.price * 100),
	          'stock_num': this.sku.stock_num
	        };
	      } else if (this.isSkuCombSelected) {
	        return skuHelper_getSkuComb(this.sku.list, this.selectedSku);
	      }
	      return null;
	    },
	    skuTree: function skuTree() {
	      return this.sku.tree || [];
	    }
	  },

	  created: function created() {
	    var skuEventBus = new external___root___Vue___commonjs___vue___commonjs2___vue___amd___vue___default.a();
	    this.skuEventBus = skuEventBus;

	    skuEventBus.$on('sku:close', this.handleCloseClicked);
	    skuEventBus.$on('sku:select', this.handleSkuSelected);
	    skuEventBus.$on('sku:numChange', this.handleNumChange);
	    skuEventBus.$on('sku:overLimit', this.handleOverLimit);
	    skuEventBus.$on('sku:addCart', this.handleAddCartClicked);
	    skuEventBus.$on('sku:buy', this.handleBuyClicked);

	    this.resetSelectedSku(this.skuTree);
	    // 组件初始化后的钩子，抛出skuEventBus
	    this.$emit('after-sku-create', skuEventBus);
	  },


	  methods: {
	    resetSelectedSku: function resetSelectedSku(skuTree) {
	      var _this = this;

	      this.selectedSku = {};
	      skuTree.forEach(function (item) {
	        // 只有一个sku规格值时默认选中
	        if (item.v.length === 1) {
	          _this.selectedSku[item.k_s] = item.v[0].id;
	        } else {
	          _this.selectedSku[item.k_s] = _this.initialSku[item.k_s] || '';
	        }
	      });
	    },
	    getSkuMessages: function getSkuMessages() {
	      return this.$refs.skuMessages ? this.$refs.skuMessages.getMessages() : {};
	    },
	    getSkuCartMessages: function getSkuCartMessages() {
	      return this.$refs.skuMessages ? this.$refs.skuMessages.getCartMessages() : {};
	    },
	    validateSkuMessages: function validateSkuMessages() {
	      return this.$refs.skuMessages ? this.$refs.skuMessages.validateMessages() : '';
	    },
	    validateSku: function validateSku() {
	      if (this.selectedNum === 0) {
	        return '商品已经无法购买啦';
	      }

	      if (this.isSkuCombSelected) {
	        var error = this.validateSkuMessages();
	        // sku留言没有错误则校验通过
	        return error;
	      } else {
	        return '请选择完整的规格';
	      }
	    },
	    handleCloseClicked: function handleCloseClicked() {
	      this.show = false;
	    },
	    handleSkuSelected: function handleSkuSelected(skuValue) {
	      var _extends2, _extends3;

	      // 点击已选中的sku时则取消选中
	      this.selectedSku = this.selectedSku[skuValue.skuKeyStr] === skuValue.id ? extends_default()({}, this.selectedSku, (_extends2 = {}, _extends2[skuValue.skuKeyStr] = '', _extends2)) : extends_default()({}, this.selectedSku, (_extends3 = {}, _extends3[skuValue.skuKeyStr] = skuValue.id, _extends3));

	      this.$emit('sku-selected', {
	        skuValue: skuValue,
	        selectedSku: this.selectedSku,
	        selectedSkuComb: this.selectedSkuComb
	      });
	    },
	    handleNumChange: function handleNumChange(num) {
	      this.selectedNum = num;
	    },
	    handleOverLimit: function handleOverLimit(_ref) {
	      var action = _ref.action,
	          limitType = _ref.limitType,
	          quota = _ref.quota,
	          quotaUsed = _ref.quotaUsed;

	      if (action === 'minus') {
	        packages_toast('至少选择一件');
	      } else if (action === 'plus') {
	        if (limitType === SkuContainer_QUOTA_LIMIT) {
	          var msg = '\u9650\u8D2D' + quota + '\u4EF6';
	          if (quotaUsed > 0) msg += '\uFF0C\u60A8\u5DF2\u8D2D\u4E70' + quotaUsed + '\u4EF6';
	          packages_toast(msg);
	        } else {
	          packages_toast('库存不足');
	        }
	      }
	    },
	    handleAddCartClicked: function handleAddCartClicked() {
	      this.handleBuyOrAddCart('add-cart');
	    },
	    handleBuyClicked: function handleBuyClicked() {
	      this.handleBuyOrAddCart('buy-clicked');
	    },
	    handleBuyOrAddCart: function handleBuyOrAddCart(type) {
	      var error = this.validateSku();
	      if (error) {
	        packages_toast(error);
	        return;
	      }
	      this.$emit(type, {
	        goodsId: this.goodsId,
	        selectedNum: this.selectedNum,
	        selectedSkuComb: this.selectedSkuComb,
	        messages: this.getSkuMessages(),
	        cartMessages: this.getSkuCartMessages()
	      });
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-d8b44ef8","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/sku/containers/SkuContainer.vue
	var SkuContainer_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (!_vm.isSkuEmpty)?_c('popup',{attrs:{"position":"bottom","lockOnScroll":"","preventScroll":""},model:{value:(_vm.show),callback:function ($$v) {_vm.show=$$v},expression:"show"}},[_c('div',{staticClass:"van-sku-container"},[_c('div',{staticClass:"van-sku-layout"},[_vm._t("sku-header",[_c('sku-header',{attrs:{"skuEventBus":_vm.skuEventBus,"selectedSku":_vm.selectedSku,"selectedSkuComb":_vm.selectedSkuComb,"goods":_vm.goods,"sku":_vm.sku}})],{skuEventBus:_vm.skuEventBus,selectedSku:_vm.selectedSku,selectedSkuComb:_vm.selectedSkuComb}),_c('div',{staticClass:"van-sku-body scroller",style:(_vm.bodyStyle)},[_vm._t("sku-group",[(_vm.hasSku)?_c('div',{staticClass:"van-sku-group-container van-hairline--bottom"},_vm._l((_vm.skuTree),function(skuTreeItem,index){return _c('div',{key:index,staticClass:"van-sku-row-group"},[_c('sku-row',{attrs:{"skuEventBus":_vm.skuEventBus,"skuRow":skuTreeItem}},_vm._l((skuTreeItem.v),function(skuValue,index){return _c('sku-row-item',{key:index,attrs:{"skuKeyStr":skuTreeItem.k_s,"skuValue":skuValue,"skuEventBus":_vm.skuEventBus,"selectedSku":_vm.selectedSku,"skuList":_vm.sku.list}})}))],1)})):_vm._e()],{selectedSku:_vm.selectedSku,skuEventBus:_vm.skuEventBus}),_vm._t("extra-sku-group",null,{skuEventBus:_vm.skuEventBus}),_vm._t("sku-stepper",[_c('sku-stepper',{ref:"skuStepper",attrs:{"skuEventBus":_vm.skuEventBus,"selectedSku":_vm.selectedSku,"selectedSkuComb":_vm.selectedSkuComb,"selectedNum":_vm.selectedNum,"stepperTitle":_vm.stepperTitle,"skuStockNum":_vm.sku.stock_num,"quota":_vm.quota,"quotaUsed":_vm.quotaUsed,"disableStepperInput":_vm.disableStepperInput,"hideStock":_vm.hideStock}})],{skuEventBus:_vm.skuEventBus,selectedSku:_vm.selectedSku,selectedSkuComb:_vm.selectedSkuComb,selectedNum:_vm.selectedNum}),_vm._t("sku-messages",[_c('sku-messages',{ref:"skuMessages",attrs:{"goodsId":_vm.goodsId,"messagePlaceholderMap":_vm.messagePlaceholderMap,"messages":_vm.sku.messages}})])],2),_vm._t("sku-actions",[_c('sku-actions',{attrs:{"skuEventBus":_vm.skuEventBus,"buyText":_vm.buyText,"showAddCartBtn":_vm.showAddCartBtn}})],{skuEventBus:_vm.skuEventBus})],2)])]):_vm._e()}
	var SkuContainer_staticRenderFns = []
	var SkuContainer_esExports = { render: SkuContainer_render, staticRenderFns: SkuContainer_staticRenderFns }
	/* harmony default export */ var containers_SkuContainer = (SkuContainer_esExports);
	// CONCATENATED MODULE: ./packages/sku/containers/SkuContainer.vue
	var SkuContainer_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var SkuContainer___vue_template_functional__ = false
	/* styles */
	var SkuContainer___vue_styles__ = null
	/* scopeId */
	var SkuContainer___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var SkuContainer___vue_module_identifier__ = null
	var SkuContainer_Component = SkuContainer_normalizeComponent(
	  SkuContainer,
	  containers_SkuContainer,
	  SkuContainer___vue_template_functional__,
	  SkuContainer___vue_styles__,
	  SkuContainer___vue_scopeId__,
	  SkuContainer___vue_module_identifier__
	)

	/* harmony default export */ var sku_containers_SkuContainer = (SkuContainer_Component.exports);

	// CONCATENATED MODULE: ./packages/sku/index.js









	sku_containers_SkuContainer.SkuActions = sku_components_SkuActions;
	sku_containers_SkuContainer.SkuHeader = sku_components_SkuHeader;
	sku_containers_SkuContainer.SkuMessages = sku_components_SkuMessages;
	sku_containers_SkuContainer.SkuStepper = sku_components_SkuStepper;
	sku_containers_SkuContainer.SkuRow = sku_components_SkuRow;
	sku_containers_SkuContainer.SkuRowItem = sku_components_SkuRowItem;
	sku_containers_SkuContainer.skuHelper = skuHelper;

	/* harmony default export */ var sku = (sku_containers_SkuContainer);
	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/step/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var step = (Object(utils["b" /* create */])({
	  name: 'van-step',

	  beforeCreate: function beforeCreate() {
	    this.$parent.steps.push(this);
	  },


	  computed: {
	    status: function status() {
	      var index = this.$parent.steps.indexOf(this);
	      var active = this.$parent.active;

	      if (index < active) {
	        return 'finish';
	      } else if (index === active) {
	        return 'process';
	      }
	    },
	    titleStyle: function titleStyle() {
	      return this.status === 'process' ? {
	        color: this.$parent.activeColor
	      } : {};
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-52046364","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/step/index.vue
	var step_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-step van-hairline",class:[("van-step--" + (_vm.$parent.direction)), ( _obj = {}, _obj[("van-step--" + _vm.status)] = _vm.status, _obj )]},[_c('div',{staticClass:"van-step__circle-container"},[(_vm.status !== 'process')?_c('i',{staticClass:"van-step__circle"}):_c('icon',{style:({ color: _vm.$parent.activeColor }),attrs:{"name":"checked"}})],1),_c('div',{staticClass:"van-step__title",style:(_vm.titleStyle)},[_vm._t("default")],2),_c('div',{staticClass:"van-step__line"})])
	var _obj;}
	var step_staticRenderFns = []
	var step_esExports = { render: step_render, staticRenderFns: step_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_step = (step_esExports);
	// CONCATENATED MODULE: ./packages/step/index.vue
	var step_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var step___vue_template_functional__ = false
	/* styles */
	var step___vue_styles__ = null
	/* scopeId */
	var step___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var step___vue_module_identifier__ = null
	var step_Component = step_normalizeComponent(
	  step,
	  selectortype_template_index_0_packages_step,
	  step___vue_template_functional__,
	  step___vue_styles__,
	  step___vue_scopeId__,
	  step___vue_module_identifier__
	)

	/* harmony default export */ var packages_step = (step_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/steps/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var steps = (Object(utils["b" /* create */])({
	  name: 'van-steps',

	  props: {
	    icon: String,
	    title: String,
	    active: Number,
	    iconClass: String,
	    description: String,
	    direction: {
	      type: String,
	      default: 'horizontal'
	    },
	    activeColor: {
	      type: String,
	      default: '#06bf04'
	    }
	  },

	  data: function data() {
	    return {
	      steps: []
	    };
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-4a45b938","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/steps/index.vue
	var steps_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-steps",class:("van-steps--" + _vm.direction)},[(_vm.title || _vm.description)?_c('div',{staticClass:"van-steps__status"},[(_vm.icon || _vm.$slots.icon)?_c('div',{staticClass:"van-steps__icon"},[_vm._t("icon",[_c('icon',{class:_vm.iconClass,attrs:{"name":_vm.icon}})])],2):_vm._e(),_c('div',{staticClass:"van-steps__message"},[_c('div',{staticClass:"van-steps__title",domProps:{"textContent":_vm._s(_vm.title)}}),_c('div',{staticClass:"van-steps__desc",domProps:{"textContent":_vm._s(_vm.description)}})]),_vm._t("message-extra")],2):_vm._e(),_c('div',{staticClass:"van-steps__items",class:{ 'van-steps__items--alone': !_vm.title && !_vm.description }},[_vm._t("default")],2)])}
	var steps_staticRenderFns = []
	var steps_esExports = { render: steps_render, staticRenderFns: steps_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_steps = (steps_esExports);
	// CONCATENATED MODULE: ./packages/steps/index.vue
	var steps_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var steps___vue_template_functional__ = false
	/* styles */
	var steps___vue_styles__ = null
	/* scopeId */
	var steps___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var steps___vue_module_identifier__ = null
	var steps_Component = steps_normalizeComponent(
	  steps,
	  selectortype_template_index_0_packages_steps,
	  steps___vue_template_functional__,
	  steps___vue_styles__,
	  steps___vue_scopeId__,
	  steps___vue_module_identifier__
	)

	/* harmony default export */ var packages_steps = (steps_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/submit-bar/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var submit_bar = (Object(utils["b" /* create */])({
	  name: 'van-submit-bar',

	  components: {
	    VanButton: packages_button
	  },

	  props: {
	    tip: String,
	    type: Number,
	    price: Number,
	    label: String,
	    loading: Boolean,
	    disabled: Boolean,
	    buttonText: String,
	    buttonType: {
	      type: String,
	      default: 'danger'
	    }
	  },

	  computed: {
	    hasPrice: function hasPrice() {
	      return typeof this.price === 'number';
	    },
	    priceInterger: function priceInterger() {
	      return Math.floor(this.price / 100);
	    },
	    priceDecimal: function priceDecimal() {
	      var decimal = this.price % 100;
	      return (decimal < 10 ? '0' : '') + decimal;
	    }
	  },

	  methods: {
	    onSubmit: function onSubmit() {
	      if (!this.disabled && !this.loading) {
	        this.$emit('submit');
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-e8099a78","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/submit-bar/index.vue
	var submit_bar_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-submit-bar"},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.tip || _vm.$slots.tip),expression:"tip || $slots.tip"}],staticClass:"van-submit-bar__tip"},[_vm._v("\n    "+_vm._s(_vm.tip)),_vm._t("tip")],2),_c('div',{staticClass:"van-submit-bar__bar"},[_vm._t("default"),_c('div',{staticClass:"van-submit-bar__price"},[(_vm.hasPrice)?[_c('span',{staticClass:"van-submit-bar__price-text"},[_vm._v(_vm._s(_vm.label || _vm.$t('label')))]),_c('span',{staticClass:"van-submit-bar__price-interger"},[_vm._v("¥"+_vm._s(_vm.priceInterger)+".")]),_c('span',{staticClass:"van-submit-bar__price-decimal"},[_vm._v(_vm._s(_vm.priceDecimal))])]:_vm._e()],2),_c('van-button',{attrs:{"type":_vm.buttonType,"disabled":_vm.disabled,"loading":_vm.loading},on:{"click":_vm.onSubmit}},[_vm._v("\n      "+_vm._s(_vm.loading ? '' : _vm.buttonText)+"\n    ")])],2)])}
	var submit_bar_staticRenderFns = []
	var submit_bar_esExports = { render: submit_bar_render, staticRenderFns: submit_bar_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_submit_bar = (submit_bar_esExports);
	// CONCATENATED MODULE: ./packages/submit-bar/index.vue
	var submit_bar_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var submit_bar___vue_template_functional__ = false
	/* styles */
	var submit_bar___vue_styles__ = null
	/* scopeId */
	var submit_bar___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var submit_bar___vue_module_identifier__ = null
	var submit_bar_Component = submit_bar_normalizeComponent(
	  submit_bar,
	  selectortype_template_index_0_packages_submit_bar,
	  submit_bar___vue_template_functional__,
	  submit_bar___vue_styles__,
	  submit_bar___vue_scopeId__,
	  submit_bar___vue_module_identifier__
	)

	/* harmony default export */ var packages_submit_bar = (submit_bar_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/tab/index.vue
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var tab = (Object(utils["b" /* create */])({
	  name: 'van-tab',

	  mixins: [find_parent],

	  props: {
	    title: {
	      type: String,
	      required: true
	    },
	    disabled: Boolean
	  },

	  computed: {
	    index: function index() {
	      return this.parentGroup.tabs.indexOf(this);
	    }
	  },

	  created: function created() {
	    this.findParentByName('van-tabs');
	    this.parentGroup.tabs.push(this);
	  },
	  destroyed: function destroyed() {
	    this.parentGroup.tabs.splice(this.index, 1);
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-9b213be8","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/tab/index.vue
	var tab_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-tab__pane",class:{ 'van-tab__pane--select': _vm.index === _vm.parentGroup.curActive }},[_vm._t("default")],2)}
	var tab_staticRenderFns = []
	var tab_esExports = { render: tab_render, staticRenderFns: tab_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_tab = (tab_esExports);
	// CONCATENATED MODULE: ./packages/tab/index.vue
	var tab_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var tab___vue_template_functional__ = false
	/* styles */
	var tab___vue_styles__ = null
	/* scopeId */
	var tab___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var tab___vue_module_identifier__ = null
	var tab_Component = tab_normalizeComponent(
	  tab,
	  selectortype_template_index_0_packages_tab,
	  tab___vue_template_functional__,
	  tab___vue_styles__,
	  tab___vue_scopeId__,
	  tab___vue_module_identifier__
	)

	/* harmony default export */ var packages_tab = (tab_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/tabbar/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var tabbar = (Object(utils["b" /* create */])({
	  name: 'van-tabbar',

	  data: function data() {
	    return {
	      items: []
	    };
	  },


	  props: {
	    value: Number,
	    fixed: {
	      type: Boolean,
	      default: true
	    }
	  },

	  watch: {
	    items: function items() {
	      this.setActiveItem();
	    },
	    value: function value() {
	      this.setActiveItem();
	    }
	  },

	  methods: {
	    setActiveItem: function setActiveItem() {
	      var _this = this;

	      this.items.forEach(function (item, index) {
	        item.active = index === _this.value;
	      });
	    },
	    onChange: function onChange(active) {
	      this.$emit('input', active);
	      this.$emit('change', active);
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-6fead1d8","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/tabbar/index.vue
	var tabbar_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-tabbar van-hairline--top-bottom",class:{ 'van-tabbar--fixed': _vm.fixed }},[_vm._t("default")],2)}
	var tabbar_staticRenderFns = []
	var tabbar_esExports = { render: tabbar_render, staticRenderFns: tabbar_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_tabbar = (tabbar_esExports);
	// CONCATENATED MODULE: ./packages/tabbar/index.vue
	var tabbar_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var tabbar___vue_template_functional__ = false
	/* styles */
	var tabbar___vue_styles__ = null
	/* scopeId */
	var tabbar___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var tabbar___vue_module_identifier__ = null
	var tabbar_Component = tabbar_normalizeComponent(
	  tabbar,
	  selectortype_template_index_0_packages_tabbar,
	  tabbar___vue_template_functional__,
	  tabbar___vue_styles__,
	  tabbar___vue_scopeId__,
	  tabbar___vue_module_identifier__
	)

	/* harmony default export */ var packages_tabbar = (tabbar_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/tabbar-item/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//




	/* harmony default export */ var tabbar_item = (Object(utils["b" /* create */])({
	  name: 'van-tabbar-item',

	  mixins: [router_link],

	  props: {
	    icon: String,
	    dot: Boolean,
	    info: String
	  },

	  data: function data() {
	    return {
	      active: false
	    };
	  },
	  beforeCreate: function beforeCreate() {
	    this.$parent.items.push(this);
	  },
	  destroyed: function destroyed() {
	    this.$parent.items.splice(this.$parent.items.indexOf(this), 1);
	  },


	  methods: {
	    onClick: function onClick() {
	      this.$parent.onChange(this.$parent.items.indexOf(this));
	      this.routerLink();
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-8669ad42","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/tabbar-item/index.vue
	var tabbar_item_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-tabbar-item",class:{ 'van-tabbar-item--active': _vm.active },on:{"click":_vm.onClick}},[_c('div',{staticClass:"van-tabbar-item__icon",class:{ 'van-tabbar-item__icon-dot': _vm.dot }},[_vm._t("icon",[(_vm.icon)?_c('icon',{attrs:{"name":_vm.icon}}):_vm._e()],{active:_vm.active}),(_vm.info)?_c('div',{staticClass:"van-tabbar-item__info"},[_vm._v(_vm._s(_vm.info))]):_vm._e()],2),_c('div',{staticClass:"van-tabbar-item__text"},[_vm._t("default",null,{active:_vm.active})],2)])}
	var tabbar_item_staticRenderFns = []
	var tabbar_item_esExports = { render: tabbar_item_render, staticRenderFns: tabbar_item_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_tabbar_item = (tabbar_item_esExports);
	// CONCATENATED MODULE: ./packages/tabbar-item/index.vue
	var tabbar_item_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var tabbar_item___vue_template_functional__ = false
	/* styles */
	var tabbar_item___vue_styles__ = null
	/* scopeId */
	var tabbar_item___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var tabbar_item___vue_module_identifier__ = null
	var tabbar_item_Component = tabbar_item_normalizeComponent(
	  tabbar_item,
	  selectortype_template_index_0_packages_tabbar_item,
	  tabbar_item___vue_template_functional__,
	  tabbar_item___vue_styles__,
	  tabbar_item___vue_scopeId__,
	  tabbar_item___vue_module_identifier__
	)

	/* harmony default export */ var packages_tabbar_item = (tabbar_item_Component.exports);

	// EXTERNAL MODULE: ./packages/utils/raf.js
	var raf = __webpack_require__(112);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/tabs/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//





	/* harmony default export */ var tabs = (Object(utils["b" /* create */])({
	  name: 'van-tabs',

	  props: {
	    sticky: Boolean,
	    active: {
	      type: [Number, String],
	      default: 0
	    },
	    type: {
	      type: String,
	      default: 'line'
	    },
	    duration: {
	      type: Number,
	      default: 0.2
	    },
	    swipeThreshold: {
	      type: Number,
	      default: 4
	    }
	  },

	  data: function data() {
	    return {
	      tabs: [],
	      position: 'content-top',
	      curActive: 0,
	      navBarStyle: {}
	    };
	  },


	  watch: {
	    active: function active(val) {
	      this.correctActive(val);
	    },
	    tabs: function tabs(_tabs) {
	      this.correctActive(this.curActive);
	      this.setNavBar();
	    },
	    curActive: function curActive() {
	      this.scrollIntoView();
	      this.setNavBar();

	      // scroll to correct position
	      if (this.position === 'page-top' || this.position === 'content-bottom') {
	        utils_scroll.setScrollTop(this.scrollEl, utils_scroll.getElementTop(this.$el));
	      }
	    },
	    sticky: function sticky(isSticky) {
	      this.scrollHandler(isSticky);
	    }
	  },

	  mounted: function mounted() {
	    var _this = this;

	    this.correctActive(this.active);
	    this.setNavBar();

	    this.$nextTick(function () {
	      if (_this.sticky) {
	        _this.scrollHandler(true);
	      }
	      _this.scrollIntoView();
	    });
	  },
	  beforeDestroy: function beforeDestroy() {
	    /* istanbul ignore next */
	    if (this.sticky) {
	      this.scrollHandler(false);
	    }
	  },


	  computed: {
	    // whether the nav is scrollable
	    scrollable: function scrollable() {
	      return this.tabs.length > this.swipeThreshold;
	    }
	  },

	  methods: {
	    // whether to bind sticky listener
	    scrollHandler: function scrollHandler(init) {
	      this.scrollEl = this.scrollEl || utils_scroll.getScrollEventTarget(this.$el);
	      this.scrollEl[init ? 'addEventListener' : 'removeEventListener']('scroll', this.onScroll);
	      if (init) {
	        this.onScroll();
	      }
	    },


	    // adjust tab position
	    onScroll: function onScroll() {
	      var scrollTop = utils_scroll.getScrollTop(this.scrollEl);
	      var elTopToPageTop = utils_scroll.getElementTop(this.$el);
	      var elBottomToPageTop = elTopToPageTop + this.$el.offsetHeight - this.$refs.nav.offsetHeight;
	      if (scrollTop > elBottomToPageTop) {
	        this.position = 'content-bottom';
	      } else if (scrollTop > elTopToPageTop) {
	        this.position = 'page-top';
	      } else {
	        this.position = 'content-top';
	      }
	    },


	    // update nav bar style
	    setNavBar: function setNavBar() {
	      var _this2 = this;

	      this.$nextTick(function () {
	        if (!_this2.$refs.tabs) {
	          return;
	        }

	        var tab = _this2.$refs.tabs[_this2.curActive];
	        _this2.navBarStyle = {
	          width: (tab.offsetWidth || 0) + 'px',
	          transform: 'translate3d(' + (tab.offsetLeft || 0) + 'px, 0, 0)',
	          transitionDuration: _this2.duration + 's'
	        };
	      });
	    },


	    // correct the value of active
	    correctActive: function correctActive(active) {
	      active = +active;
	      var exist = this.tabs.some(function (tab) {
	        return tab.index === active;
	      });
	      var defaultActive = (this.tabs[0] || {}).index || 0;
	      this.curActive = exist ? active : defaultActive;
	    },


	    // emit event when clicked
	    onClick: function onClick(index) {
	      if (this.tabs[index].disabled) {
	        this.$emit('disabled', index);
	      } else {
	        this.$emit('click', index);
	        this.curActive = index;
	      }
	    },


	    // scroll active tab into view
	    scrollIntoView: function scrollIntoView() {
	      if (!this.scrollable || !this.$refs.tabs) {
	        return;
	      }

	      var tab = this.$refs.tabs[this.curActive];
	      var nav = this.$refs.nav;
	      var scrollLeft = nav.scrollLeft,
	          navWidth = nav.offsetWidth;
	      var offsetLeft = tab.offsetLeft,
	          tabWidth = tab.offsetWidth;


	      this.scrollTo(nav, scrollLeft, offsetLeft - (navWidth - tabWidth) / 2);
	    },


	    // animate the scrollLeft of nav
	    scrollTo: function scrollTo(el, from, to) {
	      var count = 0;
	      var frames = Math.round(this.duration * 1000 / 16);
	      var animate = function animate() {
	        el.scrollLeft += (to - from) / frames;
	        /* istanbul ignore next */
	        if (++count < frames) {
	          Object(raf["a" /* raf */])(animate);
	        }
	      };
	      animate();
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-5f126ae8","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/tabs/index.vue
	var tabs_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-tabs",class:[("van-tabs--" + _vm.type)]},[_c('div',{staticClass:"van-tabs__wrap",class:[("van-tabs__wrap--" + _vm.position), {
	    'van-tabs--scrollable': _vm.scrollable,
	    'van-hairline--top-bottom': _vm.type === 'line'
	  }]},[_c('div',{ref:"nav",staticClass:"van-tabs__nav",class:("van-tabs__nav--" + _vm.type)},[(_vm.type === 'line')?_c('div',{staticClass:"van-tabs__nav-bar",style:(_vm.navBarStyle)}):_vm._e(),_vm._l((_vm.tabs),function(tab,index){return _c('div',{key:index,ref:"tabs",refInFor:true,staticClass:"van-tab",class:{
	          'van-tab--active': index === _vm.curActive,
	          'van-tab--disabled': tab.disabled
	        },on:{"click":function($event){_vm.onClick(index)}}},[_c('span',[_vm._v(_vm._s(tab.title))])])})],2)]),_c('div',{staticClass:"van-tabs__content"},[_vm._t("default")],2)])}
	var tabs_staticRenderFns = []
	var tabs_esExports = { render: tabs_render, staticRenderFns: tabs_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_tabs = (tabs_esExports);
	// CONCATENATED MODULE: ./packages/tabs/index.vue
	var tabs_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var tabs___vue_template_functional__ = false
	/* styles */
	var tabs___vue_styles__ = null
	/* scopeId */
	var tabs___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var tabs___vue_module_identifier__ = null
	var tabs_Component = tabs_normalizeComponent(
	  tabs,
	  selectortype_template_index_0_packages_tabs,
	  tabs___vue_template_functional__,
	  tabs___vue_styles__,
	  tabs___vue_scopeId__,
	  tabs___vue_module_identifier__
	)

	/* harmony default export */ var packages_tabs = (tabs_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/tag/index.vue
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var tag = (Object(utils["b" /* create */])({
	  name: 'van-tag',
	  props: {
	    type: String,
	    mark: Boolean,
	    plain: Boolean
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-320d7ee6","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/tag/index.vue
	var tag_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{staticClass:"van-tag van-hairline--surround",class:( _obj = { 'van-tag--plain': _vm.plain, 'van-tag--mark': _vm.mark }, _obj[("van-tag--" + _vm.type)] = _vm.type, _obj )},[_vm._t("default")],2)
	var _obj;}
	var tag_staticRenderFns = []
	var tag_esExports = { render: tag_render, staticRenderFns: tag_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_tag = (tag_esExports);
	// CONCATENATED MODULE: ./packages/tag/index.vue
	var tag_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var tag___vue_template_functional__ = false
	/* styles */
	var tag___vue_styles__ = null
	/* scopeId */
	var tag___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var tag___vue_module_identifier__ = null
	var tag_Component = tag_normalizeComponent(
	  tag,
	  selectortype_template_index_0_packages_tag,
	  tag___vue_template_functional__,
	  tag___vue_styles__,
	  tag___vue_scopeId__,
	  tag___vue_module_identifier__
	)

	/* harmony default export */ var packages_tag = (tag_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/tree-select/index.vue

	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var tree_select = (Object(utils["b" /* create */])({
	  name: 'van-tree-select',

	  props: {
	    items: {
	      type: Array,
	      default: function _default() {
	        return [];
	      }
	    },
	    mainActiveIndex: {
	      type: Number,
	      default: 0
	    },
	    activeId: {
	      type: Number,
	      default: 0
	    },
	    maxHeight: {
	      type: Number,
	      default: 300
	    }
	  },

	  computed: {
	    subItems: function subItems() {
	      var selectedItem = this.items[this.mainActiveIndex] || {};
	      return selectedItem.children || [];
	    },
	    mainHeight: function mainHeight() {
	      var maxHeight = Math.max(this.items.length * 44, this.subItems.length * 44);
	      return Math.min(maxHeight, this.maxHeight);
	    },
	    itemHeight: function itemHeight() {
	      return Math.min(this.subItems.length * 44, this.maxHeight);
	    }
	  },

	  methods: {
	    onItemSelect: function onItemSelect(data) {
	      this.$emit('itemclick', extends_default()({}, data));
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-0dab91f0","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/tree-select/index.vue
	var tree_select_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-tree-select",style:({ height: _vm.mainHeight + 'px' })},[_c('div',{staticClass:"van-tree-select__nav"},_vm._l((_vm.items),function(item,index){return _c('div',{staticClass:"van-tree-select__nitem",class:{ 'van-tree-select__nitem--active': _vm.mainActiveIndex === index },on:{"click":function($event){_vm.$emit('navclick', index)}}},[_vm._v("\n      "+_vm._s(item.text)+"\n    ")])})),_c('div',{staticClass:"van-tree-select__content",style:({ height: _vm.itemHeight + 'px' })},_vm._l((_vm.subItems),function(item){return _c('div',{key:item.id,staticClass:"van-tree-select__item",class:{ 'van-tree-select__item--active': _vm.activeId === item.id },on:{"click":function($event){_vm.onItemSelect(item)}}},[_vm._v("\n      "+_vm._s(item.text)+"\n      "),(_vm.activeId === item.id)?_c('icon',{staticClass:"van-tree-select__selected",attrs:{"name":"success"}}):_vm._e()],1)}))])}
	var tree_select_staticRenderFns = []
	var tree_select_esExports = { render: tree_select_render, staticRenderFns: tree_select_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_tree_select = (tree_select_esExports);
	// CONCATENATED MODULE: ./packages/tree-select/index.vue
	var tree_select_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var tree_select___vue_template_functional__ = false
	/* styles */
	var tree_select___vue_styles__ = null
	/* scopeId */
	var tree_select___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var tree_select___vue_module_identifier__ = null
	var tree_select_Component = tree_select_normalizeComponent(
	  tree_select,
	  selectortype_template_index_0_packages_tree_select,
	  tree_select___vue_template_functional__,
	  tree_select___vue_styles__,
	  tree_select___vue_scopeId__,
	  tree_select___vue_module_identifier__
	)

	/* harmony default export */ var packages_tree_select = (tree_select_Component.exports);

	// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./packages/uploader/index.vue
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//



	/* harmony default export */ var uploader = (Object(utils["b" /* create */])({
	  name: 'van-uploader',

	  props: {
	    disabled: Boolean,
	    beforeRead: Function,
	    afterRead: Function,
	    resultType: {
	      type: String,
	      default: 'dataUrl'
	    }
	  },

	  methods: {
	    onValueChange: function onValueChange(event) {
	      var _this = this;

	      if (this.disabled) {
	        return;
	      }

	      var file = event.target.files[0];
	      if (!file || this.beforeRead && !this.beforeRead(file)) {
	        return;
	      }

	      var reader = new FileReader();
	      reader.onload = function (e) {
	        _this.afterRead && _this.afterRead({
	          file: file,
	          content: e.target.result
	        });
	        _this.$refs.input && (_this.$refs.input.value = '');
	      };

	      if (this.resultType === 'dataUrl') {
	        reader.readAsDataURL(file);
	      } else if (this.resultType === 'text') {
	        reader.readAsText(file);
	      }
	    }
	  }
	}));
	// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-7f398b34","hasScoped":false,"preserveWhitespace":false,"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./packages/uploader/index.vue
	var uploader_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"van-uploader"},[_vm._t("default"),_c('input',_vm._b({ref:"input",staticClass:"van-uploader__input",attrs:{"type":"file","disabled":_vm.disabled},on:{"change":_vm.onValueChange}},'input',_vm.$attrs,false))],2)}
	var uploader_staticRenderFns = []
	var uploader_esExports = { render: uploader_render, staticRenderFns: uploader_staticRenderFns }
	/* harmony default export */ var selectortype_template_index_0_packages_uploader = (uploader_esExports);
	// CONCATENATED MODULE: ./packages/uploader/index.vue
	var uploader_normalizeComponent = __webpack_require__(0)
	/* script */

	/* template */

	/* template functional */
	var uploader___vue_template_functional__ = false
	/* styles */
	var uploader___vue_styles__ = null
	/* scopeId */
	var uploader___vue_scopeId__ = null
	/* moduleIdentifier (server only) */
	var uploader___vue_module_identifier__ = null
	var uploader_Component = uploader_normalizeComponent(
	  uploader,
	  selectortype_template_index_0_packages_uploader,
	  uploader___vue_template_functional__,
	  uploader___vue_styles__,
	  uploader___vue_scopeId__,
	  uploader___vue_module_identifier__
	)

	/* harmony default export */ var packages_uploader = (uploader_Component.exports);

	// CONCATENATED MODULE: ./packages/waterfall/directive.js


	var CONTEXT = '@@Waterfall';
	var OFFSET = 300;

	// 绑定事件到元素上
	// 读取基本的控制变量
	function doBindEvent() {
	  var _this = this;

	  if (this.el[CONTEXT].binded) {
	    return;
	  }
	  this.el[CONTEXT].binded = true;

	  this.scrollEventListener = utils_scroll.debounce(handleScrollEvent.bind(this), 200);
	  this.scrollEventTarget = utils_scroll.getScrollEventTarget(this.el);

	  var disabledExpr = this.el.getAttribute('waterfall-disabled');
	  var disabled = false;
	  if (disabledExpr) {
	    this.vm.$watch(disabledExpr, function (value) {
	      _this.disabled = value;
	      _this.scrollEventListener();
	    });
	    disabled = Boolean(this.vm[disabledExpr]);
	  }
	  this.disabled = disabled;

	  var offset = this.el.getAttribute('waterfall-offset');
	  this.offset = Number(offset) || OFFSET;

	  this.scrollEventTarget.addEventListener('scroll', this.scrollEventListener);

	  this.scrollEventListener();
	}

	// 处理滚动函数
	function handleScrollEvent() {
	  var element = this.el;
	  var scrollEventTarget = this.scrollEventTarget;
	  // 已被禁止的滚动处理
	  if (this.disabled) return;

	  var targetScrollTop = utils_scroll.getScrollTop(scrollEventTarget);
	  var targetVisibleHeight = utils_scroll.getVisibleHeight(scrollEventTarget);
	  // 滚动元素可视区域下边沿到滚动元素元素最顶上 距离
	  var targetBottom = targetScrollTop + targetVisibleHeight;

	  // 如果无元素高度，考虑为元素隐藏，直接返回
	  if (!targetVisibleHeight) return;

	  // 判断是否到了底
	  var needLoadMoreToLower = false;
	  if (element === scrollEventTarget) {
	    needLoadMoreToLower = scrollEventTarget.scrollHeight - targetBottom < this.offset;
	  } else {
	    var elementBottom = utils_scroll.getElementTop(element) - utils_scroll.getElementTop(scrollEventTarget) + utils_scroll.getVisibleHeight(element);
	    needLoadMoreToLower = elementBottom - targetVisibleHeight < this.offset;
	  }
	  if (needLoadMoreToLower) {
	    this.cb.lower && this.cb.lower({ target: scrollEventTarget, top: targetScrollTop });
	  }

	  // 判断是否到了顶
	  var needLoadMoreToUpper = false;
	  if (element === scrollEventTarget) {
	    needLoadMoreToUpper = targetScrollTop < this.offset;
	  } else {
	    var elementTop = utils_scroll.getElementTop(element) - utils_scroll.getElementTop(scrollEventTarget);
	    needLoadMoreToUpper = elementTop + this.offset > 0;
	  }
	  if (needLoadMoreToUpper) {
	    this.cb.upper && this.cb.upper({ target: scrollEventTarget, top: targetScrollTop });
	  }
	}

	// 绑定事件
	function startBind(el) {
	  var context = el[CONTEXT];

	  context.vm.$nextTick(function () {
	    if (utils_scroll.isAttached(el)) {
	      doBindEvent.call(el[CONTEXT]);
	    }
	  });
	}

	// 确认何时绑事件监听函数
	function doCheckStartBind(el) {
	  var context = el[CONTEXT];

	  if (context.vm._isMounted) {
	    startBind(el);
	  } else {
	    context.vm.$on('hook:mounted', function () {
	      startBind(el);
	    });
	  }
	}

	/* harmony default export */ var directive = (function (type) {
	  return {
	    bind: function bind(el, binding, vnode) {
	      if (!el[CONTEXT]) {
	        el[CONTEXT] = {
	          el: el,
	          vm: vnode.context,
	          cb: {}
	        };
	      }
	      el[CONTEXT].cb[type] = binding.value;

	      doCheckStartBind(el);
	    },
	    update: function update(el) {
	      var context = el[CONTEXT];
	      context.scrollEventListener && context.scrollEventListener();
	    },
	    unbind: function unbind(el) {
	      var context = el[CONTEXT];
	      context.scrollEventTarget && context.scrollEventTarget.removeEventListener('scroll', context.scrollEventListener);
	    }
	  };
	});;
	// CONCATENATED MODULE: ./packages/waterfall/index.js


	var waterfall_install = function install(Vue) {
	  Vue.directive('WaterfallLower', directive('lower'));
	  Vue.directive('WaterfallUpper', directive('upper'));
	};

	directive.install = waterfall_install;
	/* harmony default export */ var waterfall = (directive);
	// CONCATENATED MODULE: ./packages/index.js
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "install", function() { return packages_install; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "version", function() { return version; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Actionsheet", function() { return packages_actionsheet; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "AddressEdit", function() { return packages_address_edit; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "AddressList", function() { return packages_address_list; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Area", function() { return packages_area; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Badge", function() { return packages_badge; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "BadgeGroup", function() { return packages_badge_group; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Button", function() { return packages_button; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Card", function() { return packages_card; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Cell", function() { return packages_cell; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "CellGroup", function() { return packages_cell_group; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "CellSwipe", function() { return packages_cell_swipe; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Checkbox", function() { return packages_checkbox; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "CheckboxGroup", function() { return packages_checkbox_group; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Col", function() { return packages_col; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "ContactCard", function() { return packages_contact_card; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "ContactEdit", function() { return packages_contact_edit; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "ContactList", function() { return packages_contact_list; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "CouponCell", function() { return packages_coupon_cell; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "CouponList", function() { return packages_coupon_list; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "DatetimePicker", function() { return packages_datetime_picker; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Dialog", function() { return packages_dialog; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Field", function() { return packages_field; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "GoodsAction", function() { return packages_goods_action; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "GoodsActionBigBtn", function() { return packages_goods_action_big_btn; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "GoodsActionMiniBtn", function() { return packages_goods_action_mini_btn; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Icon", function() { return icon["a" /* default */]; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "ImagePreview", function() { return packages_image_preview; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Lazyload", function() { return lazyload; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Loading", function() { return loading["a" /* default */]; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Locale", function() { return locale["a" /* default */]; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "NavBar", function() { return packages_nav_bar; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "NoticeBar", function() { return packages_notice_bar; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "NumberKeyboard", function() { return packages_number_keyboard; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Pagination", function() { return packages_pagination; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Panel", function() { return packages_panel; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "PasswordInput", function() { return packages_password_input; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Picker", function() { return packages_picker; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Popup", function() { return packages_popup; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Progress", function() { return packages_progress; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "PullRefresh", function() { return packages_pull_refresh; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Radio", function() { return packages_radio; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "RadioGroup", function() { return packages_radio_group; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Row", function() { return packages_row; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Search", function() { return packages_search; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Sku", function() { return sku; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Step", function() { return packages_step; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Stepper", function() { return packages_stepper; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Steps", function() { return packages_steps; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "SubmitBar", function() { return packages_submit_bar; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Swipe", function() { return packages_swipe; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "SwipeItem", function() { return packages_swipe_item; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Switch", function() { return packages_switch; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "SwitchCell", function() { return packages_switch_cell; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Tab", function() { return packages_tab; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Tabbar", function() { return packages_tabbar; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TabbarItem", function() { return packages_tabbar_item; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Tabs", function() { return packages_tabs; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Tag", function() { return packages_tag; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Toast", function() { return packages_toast; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TreeSelect", function() { return packages_tree_select; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Uploader", function() { return packages_uploader; });
	/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Waterfall", function() { return waterfall; });
	// This file is auto gererated by build/bin/build-entry.js































































	var version = '0.11.10';
	var components = [packages_actionsheet, packages_address_edit, packages_address_list, packages_area, packages_badge, packages_badge_group, packages_button, packages_card, packages_cell, packages_cell_group, packages_cell_swipe, packages_checkbox, packages_checkbox_group, packages_col, packages_contact_card, packages_contact_edit, packages_contact_list, packages_coupon_cell, packages_coupon_list, packages_datetime_picker, packages_field, packages_goods_action, packages_goods_action_big_btn, packages_goods_action_mini_btn, icon["a" /* default */], loading["a" /* default */], packages_nav_bar, packages_notice_bar, packages_number_keyboard, packages_pagination, packages_panel, packages_password_input, packages_picker, packages_popup, packages_progress, packages_pull_refresh, packages_radio, packages_radio_group, packages_row, packages_search, sku, packages_step, packages_stepper, packages_steps, packages_submit_bar, packages_swipe, packages_swipe_item, packages_switch, packages_switch_cell, packages_tab, packages_tabbar, packages_tabbar_item, packages_tabs, packages_tag, packages_tree_select, packages_uploader];

	var packages_install = function install(Vue) {
	  components.forEach(function (Component) {
	    Vue.use(Component);
	  });
	};

	if (typeof window !== 'undefined' && window.Vue) {
	  packages_install(window.Vue);
	}



	/* harmony default export */ var packages_0 = __webpack_exports__["default"] = ({
	  install: packages_install,
	  version: version
	});

	/***/ }),
	/* 64 */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(65), __esModule: true };

	/***/ }),
	/* 65 */
	/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(43);
	__webpack_require__(52);
	module.exports = __webpack_require__(36).f('iterator');


	/***/ }),
	/* 66 */
	/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(28);
	var defined = __webpack_require__(29);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(defined(that));
	    var i = toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};


	/***/ }),
	/* 67 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var create = __webpack_require__(47);
	var descriptor = __webpack_require__(24);
	var setToStringTag = __webpack_require__(26);
	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(8)(IteratorPrototype, __webpack_require__(4)('iterator'), function () { return this; });

	module.exports = function (Constructor, NAME, next) {
	  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
	  setToStringTag(Constructor, NAME + ' Iterator');
	};


	/***/ }),
	/* 68 */
	/***/ (function(module, exports, __webpack_require__) {

	var dP = __webpack_require__(9);
	var anObject = __webpack_require__(6);
	var getKeys = __webpack_require__(19);

	module.exports = __webpack_require__(10) ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = getKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};


	/***/ }),
	/* 69 */
	/***/ (function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(15);
	var toLength = __webpack_require__(50);
	var toAbsoluteIndex = __webpack_require__(70);
	module.exports = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};


	/***/ }),
	/* 70 */
	/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(28);
	var max = Math.max;
	var min = Math.min;
	module.exports = function (index, length) {
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};


	/***/ }),
	/* 71 */
	/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has = __webpack_require__(11);
	var toObject = __webpack_require__(35);
	var IE_PROTO = __webpack_require__(32)('IE_PROTO');
	var ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO)) return O[IE_PROTO];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};


	/***/ }),
	/* 72 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var addToUnscopables = __webpack_require__(73);
	var step = __webpack_require__(74);
	var Iterators = __webpack_require__(18);
	var toIObject = __webpack_require__(15);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(44)(Array, 'Array', function (iterated, kind) {
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return step(1);
	  }
	  if (kind == 'keys') return step(0, index);
	  if (kind == 'values') return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');


	/***/ }),
	/* 73 */
	/***/ (function(module, exports) {

	module.exports = function () { /* empty */ };


	/***/ }),
	/* 74 */
	/***/ (function(module, exports) {

	module.exports = function (done, value) {
	  return { value: value, done: !!done };
	};


	/***/ }),
	/* 75 */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(76), __esModule: true };

	/***/ }),
	/* 76 */
	/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(77);
	__webpack_require__(54);
	__webpack_require__(83);
	__webpack_require__(84);
	module.exports = __webpack_require__(3).Symbol;


	/***/ }),
	/* 77 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	// ECMAScript 6 symbols shim
	var global = __webpack_require__(2);
	var has = __webpack_require__(11);
	var DESCRIPTORS = __webpack_require__(10);
	var $export = __webpack_require__(5);
	var redefine = __webpack_require__(46);
	var META = __webpack_require__(78).KEY;
	var $fails = __webpack_require__(14);
	var shared = __webpack_require__(33);
	var setToStringTag = __webpack_require__(26);
	var uid = __webpack_require__(25);
	var wks = __webpack_require__(4);
	var wksExt = __webpack_require__(36);
	var wksDefine = __webpack_require__(37);
	var enumKeys = __webpack_require__(79);
	var isArray = __webpack_require__(80);
	var anObject = __webpack_require__(6);
	var toIObject = __webpack_require__(15);
	var toPrimitive = __webpack_require__(31);
	var createDesc = __webpack_require__(24);
	var _create = __webpack_require__(47);
	var gOPNExt = __webpack_require__(81);
	var $GOPD = __webpack_require__(82);
	var $DP = __webpack_require__(9);
	var $keys = __webpack_require__(19);
	var gOPD = $GOPD.f;
	var dP = $DP.f;
	var gOPN = gOPNExt.f;
	var $Symbol = global.Symbol;
	var $JSON = global.JSON;
	var _stringify = $JSON && $JSON.stringify;
	var PROTOTYPE = 'prototype';
	var HIDDEN = wks('_hidden');
	var TO_PRIMITIVE = wks('toPrimitive');
	var isEnum = {}.propertyIsEnumerable;
	var SymbolRegistry = shared('symbol-registry');
	var AllSymbols = shared('symbols');
	var OPSymbols = shared('op-symbols');
	var ObjectProto = Object[PROTOTYPE];
	var USE_NATIVE = typeof $Symbol == 'function';
	var QObject = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function () {
	  return _create(dP({}, 'a', {
	    get: function () { return dP(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (it, key, D) {
	  var protoDesc = gOPD(ObjectProto, key);
	  if (protoDesc) delete ObjectProto[key];
	  dP(it, key, D);
	  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
	} : dP;

	var wrap = function (tag) {
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D) {
	  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if (has(AllSymbols, key)) {
	    if (!D.enumerable) {
	      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
	      D = _create(D, { enumerable: createDesc(0, false) });
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P));
	  var i = 0;
	  var l = keys.length;
	  var key;
	  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P) {
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
	  it = toIObject(it);
	  key = toPrimitive(key, true);
	  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
	  var D = gOPD(it, key);
	  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
	  var names = gOPN(toIObject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
	  var IS_OP = it === ObjectProto;
	  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function (value) {
	      if (this === ObjectProto) $set.call(OPSymbols, value);
	      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
	    return this._k;
	  });

	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f = $defineProperty;
	  __webpack_require__(53).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(27).f = $propertyIsEnumerable;
	  __webpack_require__(38).f = $getOwnPropertySymbols;

	  if (DESCRIPTORS && !__webpack_require__(21)) {
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  wksExt.f = function (name) {
	    return wrap(wks(name));
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

	for (var es6Symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

	for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function (key) {
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
	    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
	  },
	  useSetter: function () { setter = true; },
	  useSimple: function () { setter = false; }
	});

	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it) {
	    if (it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	    var args = [it];
	    var i = 1;
	    var replacer, $replacer;
	    while (arguments.length > i) args.push(arguments[i++]);
	    replacer = args[1];
	    if (typeof replacer == 'function') $replacer = replacer;
	    if ($replacer || !isArray(replacer)) replacer = function (key, value) {
	      if ($replacer) value = $replacer.call(this, key, value);
	      if (!isSymbol(value)) return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(8)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);


	/***/ }),
	/* 78 */
	/***/ (function(module, exports, __webpack_require__) {

	var META = __webpack_require__(25)('meta');
	var isObject = __webpack_require__(13);
	var has = __webpack_require__(11);
	var setDesc = __webpack_require__(9).f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !__webpack_require__(14)(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
	  setDesc(it, META, { value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  } });
	};
	var fastKey = function (it, create) {
	  // return primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function (it, create) {
	  if (!has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};


	/***/ }),
	/* 79 */
	/***/ (function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(19);
	var gOPS = __webpack_require__(38);
	var pIE = __webpack_require__(27);
	module.exports = function (it) {
	  var result = getKeys(it);
	  var getSymbols = gOPS.f;
	  if (getSymbols) {
	    var symbols = getSymbols(it);
	    var isEnum = pIE.f;
	    var i = 0;
	    var key;
	    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
	  } return result;
	};


	/***/ }),
	/* 80 */
	/***/ (function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(20);
	module.exports = Array.isArray || function isArray(arg) {
	  return cof(arg) == 'Array';
	};


	/***/ }),
	/* 81 */
	/***/ (function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(15);
	var gOPN = __webpack_require__(53).f;
	var toString = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return gOPN(it);
	  } catch (e) {
	    return windowNames.slice();
	  }
	};

	module.exports.f = function getOwnPropertyNames(it) {
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


	/***/ }),
	/* 82 */
	/***/ (function(module, exports, __webpack_require__) {

	var pIE = __webpack_require__(27);
	var createDesc = __webpack_require__(24);
	var toIObject = __webpack_require__(15);
	var toPrimitive = __webpack_require__(31);
	var has = __webpack_require__(11);
	var IE8_DOM_DEFINE = __webpack_require__(45);
	var gOPD = Object.getOwnPropertyDescriptor;

	exports.f = __webpack_require__(10) ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if (IE8_DOM_DEFINE) try {
	    return gOPD(O, P);
	  } catch (e) { /* empty */ }
	  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
	};


	/***/ }),
	/* 83 */
	/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(37)('asyncIterator');


	/***/ }),
	/* 84 */
	/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(37)('observable');


	/***/ }),
	/* 85 */
	/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(86);
	module.exports = __webpack_require__(3).Object.assign;


	/***/ }),
	/* 86 */
	/***/ (function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(5);

	$export($export.S + $export.F, 'Object', { assign: __webpack_require__(87) });


	/***/ }),
	/* 87 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys = __webpack_require__(19);
	var gOPS = __webpack_require__(38);
	var pIE = __webpack_require__(27);
	var toObject = __webpack_require__(35);
	var IObject = __webpack_require__(49);
	var $assign = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(14)(function () {
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var S = Symbol();
	  var K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function (k) { B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var aLen = arguments.length;
	  var index = 1;
	  var getSymbols = gOPS.f;
	  var isEnum = pIE.f;
	  while (aLen > index) {
	    var S = IObject(arguments[index++]);
	    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
	  } return T;
	} : $assign;


	/***/ }),
	/* 88 */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(89), __esModule: true };

	/***/ }),
	/* 89 */
	/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(54);
	__webpack_require__(43);
	__webpack_require__(52);
	__webpack_require__(90);
	__webpack_require__(101);
	__webpack_require__(102);
	module.exports = __webpack_require__(3).Promise;


	/***/ }),
	/* 90 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var LIBRARY = __webpack_require__(21);
	var global = __webpack_require__(2);
	var ctx = __webpack_require__(22);
	var classof = __webpack_require__(57);
	var $export = __webpack_require__(5);
	var isObject = __webpack_require__(13);
	var aFunction = __webpack_require__(23);
	var anInstance = __webpack_require__(91);
	var forOf = __webpack_require__(92);
	var speciesConstructor = __webpack_require__(58);
	var task = __webpack_require__(59).set;
	var microtask = __webpack_require__(97)();
	var newPromiseCapabilityModule = __webpack_require__(40);
	var perform = __webpack_require__(60);
	var promiseResolve = __webpack_require__(61);
	var PROMISE = 'Promise';
	var TypeError = global.TypeError;
	var process = global.process;
	var $Promise = global[PROMISE];
	var isNode = classof(process) == 'process';
	var empty = function () { /* empty */ };
	var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
	var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

	var USE_NATIVE = !!function () {
	  try {
	    // correct subclassing with @@species support
	    var promise = $Promise.resolve(1);
	    var FakePromise = (promise.constructor = {})[__webpack_require__(4)('species')] = function (exec) {
	      exec(empty, empty);
	    };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch (e) { /* empty */ }
	}();

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify = function (promise, isReject) {
	  if (promise._n) return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function () {
	    var value = promise._v;
	    var ok = promise._s == 1;
	    var i = 0;
	    var run = function (reaction) {
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (promise._h == 2) onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value);
	            if (domain) domain.exit();
	          }
	          if (result === reaction.promise) {
	            reject(TypeError('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (e) {
	        reject(e);
	      }
	    };
	    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if (isReject && !promise._h) onUnhandled(promise);
	  });
	};
	var onUnhandled = function (promise) {
	  task.call(global, function () {
	    var value = promise._v;
	    var unhandled = isUnhandled(promise);
	    var result, handler, console;
	    if (unhandled) {
	      result = perform(function () {
	        if (isNode) {
	          process.emit('unhandledRejection', value, promise);
	        } else if (handler = global.onunhandledrejection) {
	          handler({ promise: promise, reason: value });
	        } else if ((console = global.console) && console.error) {
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if (unhandled && result.e) throw result.v;
	  });
	};
	var isUnhandled = function (promise) {
	  if (promise._h == 1) return false;
	  var chain = promise._a || promise._c;
	  var i = 0;
	  var reaction;
	  while (chain.length > i) {
	    reaction = chain[i++];
	    if (reaction.fail || !isUnhandled(reaction.promise)) return false;
	  } return true;
	};
	var onHandleUnhandled = function (promise) {
	  task.call(global, function () {
	    var handler;
	    if (isNode) {
	      process.emit('rejectionHandled', promise);
	    } else if (handler = global.onrejectionhandled) {
	      handler({ promise: promise, reason: promise._v });
	    }
	  });
	};
	var $reject = function (value) {
	  var promise = this;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if (!promise._a) promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function (value) {
	  var promise = this;
	  var then;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if (promise === value) throw TypeError("Promise can't be resolved itself");
	    if (then = isThenable(value)) {
	      microtask(function () {
	        var wrapper = { _w: promise, _d: false }; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch (e) {
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch (e) {
	    $reject.call({ _w: promise, _d: false }, e); // wrap
	  }
	};

	// constructor polyfill
	if (!USE_NATIVE) {
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor) {
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch (err) {
	      $reject.call(this, err);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(98)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected) {
	      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if (this._a) this._a.push(reaction);
	      if (this._s) notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject = ctx($reject, promise, 1);
	  };
	  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
	    return C === $Promise || C === Wrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
	__webpack_require__(26)($Promise, PROMISE);
	__webpack_require__(99)(PROMISE);
	Wrapper = __webpack_require__(3)[PROMISE];

	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r) {
	    var capability = newPromiseCapability(this);
	    var $$reject = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x) {
	    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(100)(function (iter) {
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var values = [];
	      var index = 0;
	      var remaining = 1;
	      forOf(iterable, false, function (promise) {
	        var $index = index++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      forOf(iterable, false, function (promise) {
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  }
	});


	/***/ }),
	/* 91 */
	/***/ (function(module, exports) {

	module.exports = function (it, Constructor, name, forbiddenField) {
	  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};


	/***/ }),
	/* 92 */
	/***/ (function(module, exports, __webpack_require__) {

	var ctx = __webpack_require__(22);
	var call = __webpack_require__(93);
	var isArrayIter = __webpack_require__(94);
	var anObject = __webpack_require__(6);
	var toLength = __webpack_require__(50);
	var getIterFn = __webpack_require__(95);
	var BREAK = {};
	var RETURN = {};
	var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
	  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
	  var f = ctx(fn, that, entries ? 2 : 1);
	  var index = 0;
	  var length, step, iterator, result;
	  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if (result === BREAK || result === RETURN) return result;
	  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
	    result = call(iterator, f, step.value, entries);
	    if (result === BREAK || result === RETURN) return result;
	  }
	};
	exports.BREAK = BREAK;
	exports.RETURN = RETURN;


	/***/ }),
	/* 93 */
	/***/ (function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(6);
	module.exports = function (iterator, fn, value, entries) {
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (e) {
	    var ret = iterator['return'];
	    if (ret !== undefined) anObject(ret.call(iterator));
	    throw e;
	  }
	};


	/***/ }),
	/* 94 */
	/***/ (function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators = __webpack_require__(18);
	var ITERATOR = __webpack_require__(4)('iterator');
	var ArrayProto = Array.prototype;

	module.exports = function (it) {
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};


	/***/ }),
	/* 95 */
	/***/ (function(module, exports, __webpack_require__) {

	var classof = __webpack_require__(57);
	var ITERATOR = __webpack_require__(4)('iterator');
	var Iterators = __webpack_require__(18);
	module.exports = __webpack_require__(3).getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};


	/***/ }),
	/* 96 */
	/***/ (function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function (fn, args, that) {
	  var un = that === undefined;
	  switch (args.length) {
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return fn.apply(that, args);
	};


	/***/ }),
	/* 97 */
	/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(2);
	var macrotask = __webpack_require__(59).set;
	var Observer = global.MutationObserver || global.WebKitMutationObserver;
	var process = global.process;
	var Promise = global.Promise;
	var isNode = __webpack_require__(20)(process) == 'process';

	module.exports = function () {
	  var head, last, notify;

	  var flush = function () {
	    var parent, fn;
	    if (isNode && (parent = process.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (e) {
	        if (head) notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // Node.js
	  if (isNode) {
	    notify = function () {
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver
	  } else if (Observer) {
	    var toggle = true;
	    var node = document.createTextNode('');
	    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise && Promise.resolve) {
	    var promise = Promise.resolve();
	    notify = function () {
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }

	  return function (fn) {
	    var task = { fn: fn, next: undefined };
	    if (last) last.next = task;
	    if (!head) {
	      head = task;
	      notify();
	    } last = task;
	  };
	};


	/***/ }),
	/* 98 */
	/***/ (function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(8);
	module.exports = function (target, src, safe) {
	  for (var key in src) {
	    if (safe && target[key]) target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};


	/***/ }),
	/* 99 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var global = __webpack_require__(2);
	var core = __webpack_require__(3);
	var dP = __webpack_require__(9);
	var DESCRIPTORS = __webpack_require__(10);
	var SPECIES = __webpack_require__(4)('species');

	module.exports = function (KEY) {
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
	    configurable: true,
	    get: function () { return this; }
	  });
	};


	/***/ }),
	/* 100 */
	/***/ (function(module, exports, __webpack_require__) {

	var ITERATOR = __webpack_require__(4)('iterator');
	var SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function () { SAFE_CLOSING = true; };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(riter, function () { throw 2; });
	} catch (e) { /* empty */ }

	module.exports = function (exec, skipClosing) {
	  if (!skipClosing && !SAFE_CLOSING) return false;
	  var safe = false;
	  try {
	    var arr = [7];
	    var iter = arr[ITERATOR]();
	    iter.next = function () { return { done: safe = true }; };
	    arr[ITERATOR] = function () { return iter; };
	    exec(arr);
	  } catch (e) { /* empty */ }
	  return safe;
	};


	/***/ }),
	/* 101 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	// https://github.com/tc39/proposal-promise-finally

	var $export = __webpack_require__(5);
	var core = __webpack_require__(3);
	var global = __webpack_require__(2);
	var speciesConstructor = __webpack_require__(58);
	var promiseResolve = __webpack_require__(61);

	$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
	  var C = speciesConstructor(this, core.Promise || global.Promise);
	  var isFunction = typeof onFinally == 'function';
	  return this.then(
	    isFunction ? function (x) {
	      return promiseResolve(C, onFinally()).then(function () { return x; });
	    } : onFinally,
	    isFunction ? function (e) {
	      return promiseResolve(C, onFinally()).then(function () { throw e; });
	    } : onFinally
	  );
	} });


	/***/ }),
	/* 102 */
	/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	// https://github.com/tc39/proposal-promise-try
	var $export = __webpack_require__(5);
	var newPromiseCapability = __webpack_require__(40);
	var perform = __webpack_require__(60);

	$export($export.S, 'Promise', { 'try': function (callbackfn) {
	  var promiseCapability = newPromiseCapability.f(this);
	  var result = perform(callbackfn);
	  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
	  return promiseCapability.promise;
	} });


	/***/ }),
	/* 103 */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(104), __esModule: true };

	/***/ }),
	/* 104 */
	/***/ (function(module, exports, __webpack_require__) {

	var core = __webpack_require__(3);
	var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
	module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};


	/***/ }),
	/* 105 */
	/***/ (function(module, exports, __webpack_require__) {

	/*!
	 * Vue-Lazyload.js v1.1.4
	 * (c) 2017 Awe <hilongjw@gmail.com>
	 * Released under the MIT License.
	 */
	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define(t):e.VueLazyload=t()}(this,function(){"use strict";function e(e,t){if(e.length){var n=e.indexOf(t);return n>-1?e.splice(n,1):void 0}}function t(e,t){if(!e||!t)return e||{};if(e instanceof Object)for(var n in t)e[n]=t[n];return e}function n(e,t){for(var n=!1,r=0,i=e.length;r<i;r++)if(t(e[r])){n=!0;break}return n}function r(e,t){if("IMG"===e.tagName&&e.getAttribute("data-srcset")){var n=e.getAttribute("data-srcset"),r=[],i=e.parentNode,o=i.offsetWidth*t,s=void 0,a=void 0,u=void 0;n=n.trim().split(","),n.map(function(e){e=e.trim(),s=e.lastIndexOf(" "),-1===s?(a=e,u=999998):(a=e.substr(0,s),u=parseInt(e.substr(s+1,e.length-s-2),10)),r.push([u,a])}),r.sort(function(e,t){if(e[0]<t[0])return-1;if(e[0]>t[0])return 1;if(e[0]===t[0]){if(-1!==t[1].indexOf(".webp",t[1].length-5))return 1;if(-1!==e[1].indexOf(".webp",e[1].length-5))return-1}return 0});for(var l="",d=void 0,c=r.length,h=0;h<c;h++)if(d=r[h],d[0]>=o){l=d[1];break}return l}}function i(e,t){for(var n=void 0,r=0,i=e.length;r<i;r++)if(t(e[r])){n=e[r];break}return n}function o(){if(!h)return!1;var e=!0,t=document;try{var n=t.createElement("object");n.type="image/webp",n.style.visibility="hidden",n.innerHTML="!",t.body.appendChild(n),e=!n.offsetWidth,t.body.removeChild(n)}catch(t){e=!1}return e}function s(e,t){var n=null,r=0;return function(){if(!n){var i=Date.now()-r,o=this,s=arguments,a=function(){r=Date.now(),n=!1,e.apply(o,s)};i>=t?a():n=setTimeout(a,t)}}}function a(e){return null!==e&&"object"===(void 0===e?"undefined":c(e))}function u(e){if(!(e instanceof Object))return[];if(Object.keys)return Object.keys(e);var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t}function l(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function d(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},h="undefined"!=typeof window,f=h&&"IntersectionObserver"in window,v={event:"event",observer:"observer"},p=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1;return h&&window.devicePixelRatio||e},g=function(){if(h){var e=!1;try{var t=Object.defineProperty({},"passive",{get:function(){e=!0}});window.addEventListener("test",null,t)}catch(e){}return e}}(),y={on:function(e,t,n){var r=arguments.length>3&&void 0!==arguments[3]&&arguments[3];g?e.addEventListener(t,n,{capture:r,passive:!0}):e.addEventListener(t,n,r)},off:function(e,t,n){var r=arguments.length>3&&void 0!==arguments[3]&&arguments[3];e.removeEventListener(t,n,r)}},b=function(e,t,n){var r=new Image;r.src=e.src,r.onload=function(){t({naturalHeight:r.naturalHeight,naturalWidth:r.naturalWidth,src:r.src})},r.onerror=function(e){n(e)}},m=function(e,t){return"undefined"!=typeof getComputedStyle?getComputedStyle(e,null).getPropertyValue(t):e.style[t]},L=function(e){return m(e,"overflow")+m(e,"overflow-y")+m(e,"overflow-x")},w=function(e){if(h){if(!(e instanceof HTMLElement))return window;for(var t=e;t&&t!==document.body&&t!==document.documentElement&&t.parentNode;){if(/(scroll|auto)/.test(L(t)))return t;t=t.parentNode}return window}},_=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),k={},E=function(){function e(t){var n=t.el,r=t.src,i=t.error,o=t.loading,s=t.bindType,a=t.$parent,u=t.options,d=t.elRenderer;l(this,e),this.el=n,this.src=r,this.error=i,this.loading=o,this.bindType=s,this.attempt=0,this.naturalHeight=0,this.naturalWidth=0,this.options=u,this.filter(),this.initState(),this.performanceData={init:Date.now(),loadStart:null,loadEnd:null},this.rect=n.getBoundingClientRect(),this.$parent=a,this.elRenderer=d,this.render("loading",!1)}return _(e,[{key:"initState",value:function(){this.state={error:!1,loaded:!1,rendered:!1}}},{key:"record",value:function(e){this.performanceData[e]=Date.now()}},{key:"update",value:function(e){var t=e.src,n=e.loading,r=e.error,i=this.src;this.src=t,this.loading=n,this.error=r,this.filter(),i!==this.src&&(this.attempt=0,this.initState())}},{key:"getRect",value:function(){this.rect=this.el.getBoundingClientRect()}},{key:"checkInView",value:function(){return this.getRect(),this.rect.top<window.innerHeight*this.options.preLoad&&this.rect.bottom>this.options.preLoadTop&&this.rect.left<window.innerWidth*this.options.preLoad&&this.rect.right>0}},{key:"filter",value:function(){var e=this;u(this.options.filter).map(function(t){e.options.filter[t](e,e.options)})}},{key:"renderLoading",value:function(e){var t=this;b({src:this.loading},function(n){t.render("loading",!1),e()},function(n){e(),t.options.silent||console.warn("VueLazyload log: load failed with loading image("+t.loading+")")})}},{key:"load",value:function(){var e=this;return this.attempt>this.options.attempt-1&&this.state.error?void(this.options.silent||console.log("VueLazyload log: "+this.src+" tried too more than "+this.options.attempt+" times")):this.state.loaded||k[this.src]?this.render("loaded",!0):void this.renderLoading(function(){e.attempt++,e.record("loadStart"),b({src:e.src},function(t){e.naturalHeight=t.naturalHeight,e.naturalWidth=t.naturalWidth,e.state.loaded=!0,e.state.error=!1,e.record("loadEnd"),e.render("loaded",!1),k[e.src]=1},function(t){e.state.error=!0,e.state.loaded=!1,e.render("error",!1)})})}},{key:"render",value:function(e,t){this.elRenderer(this,e,t)}},{key:"performance",value:function(){var e="loading",t=0;return this.state.loaded&&(e="loaded",t=(this.performanceData.loadEnd-this.performanceData.loadStart)/1e3),this.state.error&&(e="error"),{src:this.src,state:e,time:t}}},{key:"destroy",value:function(){this.el=null,this.src=null,this.error=null,this.loading=null,this.bindType=null,this.attempt=0}}]),e}(),T=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),A="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",$=["scroll","wheel","mousewheel","resize","animationend","transitionend","touchmove"],z={rootMargin:"0px",threshold:0},H=function(u){return function(){function l(e){var t=e.preLoad,n=e.error,r=e.throttleWait,i=e.preLoadTop,a=e.dispatchEvent,u=e.loading,c=e.attempt,h=e.silent,f=e.scale,g=e.listenEvents,y=(e.hasbind,e.filter),b=e.adapter,m=e.observer,L=e.observerOptions;d(this,l),this.version="1.1.4",this.mode=v.event,this.ListenerQueue=[],this.TargetIndex=0,this.TargetQueue=[],this.options={silent:h||!0,dispatchEvent:!!a,throttleWait:r||200,preLoad:t||1.3,preLoadTop:i||0,error:n||A,loading:u||A,attempt:c||3,scale:f||p(f),ListenEvents:g||$,hasbind:!1,supportWebp:o(),filter:y||{},adapter:b||{},observer:!!m,observerOptions:L||z},this._initEvent(),this.lazyLoadHandler=s(this._lazyLoadHandler.bind(this),this.options.throttleWait),this.setMode(this.options.observer?v.observer:v.event)}return T(l,[{key:"config",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t(this.options,e)}},{key:"performance",value:function(){var e=[];return this.ListenerQueue.map(function(t){e.push(t.performance())}),e}},{key:"addLazyBox",value:function(e){this.ListenerQueue.push(e),h&&(this._addListenerTarget(window),this._observer&&this._observer.observe(e.el),e.$el&&e.$el.parentNode&&this._addListenerTarget(e.$el.parentNode))}},{key:"add",value:function(e,t,i){var o=this;if(n(this.ListenerQueue,function(t){return t.el===e}))return this.update(e,t),u.nextTick(this.lazyLoadHandler);var s=this._valueFormatter(t.value),a=s.src,l=s.loading,d=s.error;u.nextTick(function(){a=r(e,o.options.scale)||a,o._observer&&o._observer.observe(e);var n=Object.keys(t.modifiers)[0],s=void 0;n&&(s=i.context.$refs[n],s=s?s.$el||s:document.getElementById(n)),s||(s=w(e));var c=new E({bindType:t.arg,$parent:s,el:e,loading:l,error:d,src:a,elRenderer:o._elRenderer.bind(o),options:o.options});o.ListenerQueue.push(c),h&&(o._addListenerTarget(window),o._addListenerTarget(s)),o.lazyLoadHandler(),u.nextTick(function(){return o.lazyLoadHandler()})})}},{key:"update",value:function(e,t){var n=this,o=this._valueFormatter(t.value),s=o.src,a=o.loading,l=o.error;s=r(e,this.options.scale)||s;var d=i(this.ListenerQueue,function(t){return t.el===e});d&&d.update({src:s,loading:a,error:l}),this._observer&&this._observer.observe(e),this.lazyLoadHandler(),u.nextTick(function(){return n.lazyLoadHandler()})}},{key:"remove",value:function(t){if(t){this._observer&&this._observer.unobserve(t);var n=i(this.ListenerQueue,function(e){return e.el===t});n&&(this._removeListenerTarget(n.$parent),this._removeListenerTarget(window),e(this.ListenerQueue,n)&&n.destroy())}}},{key:"removeComponent",value:function(t){t&&(e(this.ListenerQueue,t),this._observer&&this._observer.unobserve(t.el),t.$parent&&t.$el.parentNode&&this._removeListenerTarget(t.$el.parentNode),this._removeListenerTarget(window))}},{key:"setMode",value:function(e){var t=this;f||e!==v.observer||(e=v.event),this.mode=e,e===v.event?(this._observer&&(this.ListenerQueue.forEach(function(e){t._observer.unobserve(e.el)}),this._observer=null),this.TargetQueue.forEach(function(e){t._initListen(e.el,!0)})):(this.TargetQueue.forEach(function(e){t._initListen(e.el,!1)}),this._initIntersectionObserver())}},{key:"_addListenerTarget",value:function(e){if(e){var t=i(this.TargetQueue,function(t){return t.el===e});return t?t.childrenCount++:(t={el:e,id:++this.TargetIndex,childrenCount:1,listened:!0},this.mode===v.event&&this._initListen(t.el,!0),this.TargetQueue.push(t)),this.TargetIndex}}},{key:"_removeListenerTarget",value:function(e){var t=this;this.TargetQueue.forEach(function(n,r){n.el===e&&(--n.childrenCount||(t._initListen(n.el,!1),t.TargetQueue.splice(r,1),n=null))})}},{key:"_initListen",value:function(e,t){var n=this;this.options.ListenEvents.forEach(function(r){return y[t?"on":"off"](e,r,n.lazyLoadHandler)})}},{key:"_initEvent",value:function(){var t=this;this.Event={listeners:{loading:[],loaded:[],error:[]}},this.$on=function(e,n){t.Event.listeners[e].push(n)},this.$once=function(e,n){function r(){i.$off(e,r),n.apply(i,arguments)}var i=t;t.$on(e,r)},this.$off=function(n,r){if(!r)return void(t.Event.listeners[n]=[]);e(t.Event.listeners[n],r)},this.$emit=function(e,n,r){t.Event.listeners[e].forEach(function(e){return e(n,r)})}}},{key:"_lazyLoadHandler",value:function(){var e=!1;this.ListenerQueue.forEach(function(t){t.state.loaded||(e=t.checkInView())&&t.load()})}},{key:"_initIntersectionObserver",value:function(){var e=this;f&&(this._observer=new IntersectionObserver(this._observerHandler.bind(this),this.options.observerOptions),this.ListenerQueue.length&&this.ListenerQueue.forEach(function(t){e._observer.observe(t.el)}))}},{key:"_observerHandler",value:function(e,t){var n=this;e.forEach(function(e){e.isIntersecting&&n.ListenerQueue.forEach(function(t){if(t.el===e.target){if(t.state.loaded)return n._observer.unobserve(t.el);t.load()}})})}},{key:"_elRenderer",value:function(e,t,n){if(e.el){var r=e.el,i=e.bindType,o=void 0;switch(t){case"loading":o=e.loading;break;case"error":o=e.error;break;default:o=e.src}if(i?r.style[i]="url("+o+")":r.getAttribute("src")!==o&&r.setAttribute("src",o),r.setAttribute("lazy",t),this.$emit(t,e,n),this.options.adapter[t]&&this.options.adapter[t](e,this.options),this.options.dispatchEvent){var s=new CustomEvent(t,{detail:e});r.dispatchEvent(s)}}}},{key:"_valueFormatter",value:function(e){var t=e,n=this.options.loading,r=this.options.error;return a(e)&&(e.src||this.options.silent||console.error("Vue Lazyload warning: miss src with "+e),t=e.src,n=e.loading||this.options.loading,r=e.error||this.options.error),{src:t,loading:n,error:r}}}]),l}()},O=function(e){return{props:{tag:{type:String,default:"div"}},render:function(e){return!1===this.show?e(this.tag):e(this.tag,null,this.$slots.default)},data:function(){return{el:null,state:{loaded:!1},rect:{},show:!1}},mounted:function(){this.el=this.$el,e.addLazyBox(this),e.lazyLoadHandler()},beforeDestroy:function(){e.removeComponent(this)},methods:{getRect:function(){this.rect=this.$el.getBoundingClientRect()},checkInView:function(){return this.getRect(),h&&this.rect.top<window.innerHeight*e.options.preLoad&&this.rect.bottom>0&&this.rect.left<window.innerWidth*e.options.preLoad&&this.rect.right>0},load:function(){this.show=!0,this.state.loaded=!0,this.$emit("show",this)}}}};return{install:function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=H(e),i=new r(n),o="2"===e.version.split(".")[0];e.prototype.$Lazyload=i,n.lazyComponent&&e.component("lazy-component",O(i)),o?e.directive("lazy",{bind:i.add.bind(i),update:i.update.bind(i),componentUpdated:i.lazyLoadHandler.bind(i),unbind:i.remove.bind(i)}):e.directive("lazy",{bind:i.lazyLoadHandler.bind(i),update:function(e,n){t(this.vm.$refs,this.vm.$els),i.add(this.el,{modifiers:this.modifiers||{},arg:this.arg,value:e,oldValue:n},{context:this.vm})},unbind:function(){i.remove(this.el)}})}}});


	/***/ }),
	/* 106 */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(107), __esModule: true };

	/***/ }),
	/* 107 */
	/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(108);
	module.exports = __webpack_require__(3).Number.isNaN;


	/***/ }),
	/* 108 */
	/***/ (function(module, exports, __webpack_require__) {

	// 20.1.2.4 Number.isNaN(number)
	var $export = __webpack_require__(5);

	$export($export.S, 'Number', {
	  isNaN: function isNaN(number) {
	    // eslint-disable-next-line no-self-compare
	    return number != number;
	  }
	});


	/***/ }),
	/* 109 */
	/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(110);
	module.exports = __webpack_require__(3).Object.keys;


	/***/ }),
	/* 110 */
	/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(35);
	var $keys = __webpack_require__(19);

	__webpack_require__(111)('keys', function () {
	  return function keys(it) {
	    return $keys(toObject(it));
	  };
	});


	/***/ }),
	/* 111 */
	/***/ (function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(5);
	var core = __webpack_require__(3);
	var fails = __webpack_require__(14);
	module.exports = function (KEY, exec) {
	  var fn = (core.Object || {})[KEY] || Object[KEY];
	  var exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
	};


	/***/ }),
	/* 112 */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {

	"use strict";
	/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (immutable) */ __webpack_exports__["a"] = raf;
	/* unused harmony export cancel */
	/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(1);
	/**
	 * requestAnimationFrame polyfill
	 */



	var prev = Date.now();

	/* istanbul ignore next */
	function fallback(fn) {
	  var curr = Date.now();
	  var ms = Math.max(0, 16 - (curr - prev));
	  var id = setTimeout(fn, ms);
	  prev = curr + ms;
	  return id;
	}

	/* istanbul ignore next */
	var root = __WEBPACK_IMPORTED_MODULE_0__index__["f" /* isServer */] ? global : window;

	/* istanbul ignore next */
	var iRaf = root.requestAnimationFrame || root.webkitRequestAnimationFrame || fallback;

	/* istanbul ignore next */
	var iCancel = root.cancelAnimationFrame || root.webkitCancelAnimationFrame || root.clearTimeout;

	function raf(fn) {
	  return iRaf.call(root, fn);
	}

	function cancel(id) {
	  iCancel.call(root, id);
	}
	/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(113)))

	/***/ }),
	/* 113 */
	/***/ (function(module, exports) {

	var g;

	// This works in non-strict mode
	g = (function() {
		return this;
	})();

	try {
		// This works if eval is allowed (see CSP)
		g = g || Function("return this")() || (1,eval)("this");
	} catch(e) {
		// This works if the window reference is available
		if(typeof window === "object")
			g = window;
	}

	// g can still be undefined, but nothing to do about it...
	// We return undefined, instead of nothing here, so it's
	// easier to handle this case. if(!global) { ...}

	module.exports = g;


	/***/ })
	/******/ ]);
	});

/***/ })

});