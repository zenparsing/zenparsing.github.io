/*=esdown=*/(function(fn, deps, name) { function obj() { return {} } if (typeof exports !== 'undefined') fn(require, exports, module); else if (typeof define === 'function' && define.amd) define(['require', 'exports', 'module'].concat(deps), fn); else if (typeof window !== 'undefined' && name) fn(obj, window[name] = {}, {}); else fn(obj, {}, {}); })(function(require, exports, module) { 'use strict'; function __load(p, l) { module.__es6 = !l; var e = require(p); if (e && e.constructor !== Object) e.default = e; return e; } 
var _esdown; (function() {

var VERSION = "0.9.11";

var Global = (function() {

    try { return global.global } catch (x) {}
    try { return self.self } catch (x) {}
    return null;
})();

function toObject(val) {

    if (val == null)
        throw new TypeError(val + " is not an object");

    return Object(val);
}

// Iterates over the descriptors for each own property of an object
function forEachDesc(obj, fn) {

    var names = Object.getOwnPropertyNames(obj);

    for (var i$0 = 0; i$0 < names.length; ++i$0)
        fn(names[i$0], Object.getOwnPropertyDescriptor(obj, names[i$0]));

    names = Object.getOwnPropertySymbols(obj);

    for (var i$1 = 0; i$1 < names.length; ++i$1)
        fn(names[i$1], Object.getOwnPropertyDescriptor(obj, names[i$1]));

    return obj;
}

// Installs a property into an object, merging "get" and "set" functions
function mergeProperty(target, name, desc, enumerable) {

    if (desc.get || desc.set) {

        var d$0 = { configurable: true };
        if (desc.get) d$0.get = desc.get;
        if (desc.set) d$0.set = desc.set;
        desc = d$0;
    }

    desc.enumerable = enumerable;
    Object.defineProperty(target, name, desc);
}

// Installs properties on an object, merging "get" and "set" functions
function mergeProperties(target, source, enumerable) {

    forEachDesc(source, function(name, desc) { return mergeProperty(target, name, desc, enumerable); });
}

// Builds a class
function buildClass(base, def) {

    var parent;

    if (def === void 0) {

        // If no base class is specified, then Object.prototype
        // is the parent prototype
        def = base;
        base = null;
        parent = Object.prototype;

    } else if (base === null) {

        // If the base is null, then then then the parent prototype is null
        parent = null;

    } else if (typeof base === "function") {

        parent = base.prototype;

        // Prototype must be null or an object
        if (parent !== null && Object(parent) !== parent)
            parent = void 0;
    }

    if (parent === void 0)
        throw new TypeError;

    // Create the prototype object
    var proto = Object.create(parent),
        statics = {};

    function __(target, obj) {

        if (!obj) mergeProperties(proto, target, false);
        else mergeProperties(target, obj, false);
    }

    __.static = function(obj) { return mergeProperties(statics, obj, false); };
    __.super = parent;
    __.csuper = base || Function.prototype;

    // Generate method collections, closing over super bindings
    def(__);

    var ctor = proto.constructor;

    // Set constructor's prototype
    ctor.prototype = proto;

    // Set class "static" methods
    forEachDesc(statics, function(name, desc) { return Object.defineProperty(ctor, name, desc); });

    // Inherit from base constructor
    if (base && ctor.__proto__)
        Object.setPrototypeOf(ctor, base);

    return ctor;
}

// The "_esdown" must be defined in the outer scope
_esdown = {

    version: VERSION,

    global: Global,

    class: buildClass,

    // Support for computed property names
    computed: function(target) {

        for (var i$2 = 1; i$2 < arguments.length; i$2 += 3) {

            var desc$0 = Object.getOwnPropertyDescriptor(arguments[i$2 + 1], "_");
            mergeProperty(target, arguments[i$2], desc$0, true);

            if (i$2 + 2 < arguments.length)
                mergeProperties(target, arguments[i$2 + 2], true);
        }

        return target;
    },

    // Support for tagged templates
    callSite: function(values, raw) {

        values.raw = raw || values;
        return values;
    },

    // Support for async functions
    async: function(iter) {

        return new Promise(function(resolve, reject) {

            resume("next", void 0);

            function resume(type, value) {

                try {

                    var result$0 = iter[type](value);

                    if (result$0.done) {

                        resolve(result$0.value);

                    } else {

                        Promise.resolve(result$0.value).then(
                            function(x) { return resume("next", x); },
                            function(x) { return resume("throw", x); });
                    }

                } catch (x) { reject(x) }
            }
        });
    },

    // Support for async generators
    asyncGen: function(iter) {

        var front = null, back = null;

        return _esdown.computed({

            next: function(val) { return send("next", val) },
            throw: function(val) { return send("throw", val) },
            return: function(val) { return send("return", val) },
            }, Symbol.asyncIterator, { _: function() { return this },
        });

        function send(type, value) {

            return new Promise(function(resolve, reject) {

                var x = { type: type, value: value, resolve: resolve, reject: reject, next: null };

                if (back) {

                    // If list is not empty, then push onto the end
                    back = back.next = x;

                } else {

                    // Create new list and resume generator
                    front = back = x;
                    resume(type, value);
                }
            });
        }

        function fulfill(type, value) {

            switch (type) {

                case "return":
                    front.resolve({ value: value, done: true });
                    break;

                case "throw":
                    front.reject(value);
                    break;

                default:
                    front.resolve({ value: value, done: false });
                    break;
            }

            front = front.next;

            if (front) resume(front.type, front.value);
            else back = null;
        }

        function awaitValue(result) {

            var value = result.value;

            if (typeof value === "object" && "_esdown_await" in value) {

                if (result.done)
                    throw new Error("Invalid async generator return");

                return value._esdown_await;
            }

            return null;
        }

        function resume(type, value) {

            // HACK: If the generator does not support the "return" method, then
            // emulate it (poorly) using throw.  (V8 circa 2015-02-13 does not support
            // generator.return.)
            if (type === "return" && !(type in iter)) {

                type = "throw";
                value = { value: value, __return: true };
            }

            try {

                var result$1 = iter[type](value),
                    awaited$0 = awaitValue(result$1);

                if (awaited$0) {

                    Promise.resolve(awaited$0).then(
                        function(x) { return resume("next", x); },
                        function(x) { return resume("throw", x); });

                } else {

                    Promise.resolve(result$1.value).then(
                        function(x) { return fulfill(result$1.done ? "return" : "normal", x); },
                        function(x) { return fulfill("throw", x); });
                }

            } catch (x) {

                // HACK: Return-as-throw
                if (x && x.__return === true)
                    return fulfill("return", x.value);

                fulfill("throw", x);
            }
        }
    },

    // Support for spread operations
    spread: function(initial) {

        return {

            a: initial || [],

            // Add items
            s: function() {

                for (var i$3 = 0; i$3 < arguments.length; ++i$3)
                    this.a.push(arguments[i$3]);

                return this;
            },

            // Add the contents of iterables
            i: function(list) {

                if (Array.isArray(list)) {

                    this.a.push.apply(this.a, list);

                } else {

                    for (var __$0 = (list)[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;)
                        { var item$0 = __$1.value; this.a.push(item$0); }
                }

                return this;
            }

        };
    },

    // Support for object destructuring
    objd: function(obj) {

        return toObject(obj);
    },

    // Support for array destructuring
    arrayd: function(obj) {

        if (Array.isArray(obj)) {

            return {

                at: function(skip, pos) { return obj[pos] },
                rest: function(skip, pos) { return obj.slice(pos) }
            };
        }

        var iter = toObject(obj)[Symbol.iterator]();

        return {

            at: function(skip) {

                var r;

                while (skip--)
                    r = iter.next();

                return r.value;
            },

            rest: function(skip) {

                var a = [], r;

                while (--skip)
                    r = iter.next();

                while (r = iter.next(), !r.done)
                    a.push(r.value);

                return a;
            }
        };
    },

    // Support for private fields
    getPrivate: function(obj, map, name) {

        var entry = map.get(Object(obj));

        if (!entry)
            throw new TypeError;

        return entry[name];
    },

    setPrivate: function(obj, map, name, value) {

        var entry = map.get(Object(obj));

        if (!entry)
            throw new TypeError;

        return entry[name] = value;
    }

};


}).call(this);



var _M23 = {}, _M21 = {}, _M22 = {}, _M20 = {}, _M19 = {}, _M17 = {}, _M2 = {}, _M3 = {}, _M18 = {}, _M4 = {}, _M5 = {}, _M6 = {}, _M7 = {}, _M8 = {}, _M9 = {}, _M10 = {}, _M11 = {}, _M12 = {}, _M13 = {}, _M14 = {}, _M15 = {}, _M16 = {}, _M1 = exports;

(function(exports) {

var OP_toString = Object.prototype.toString,
    OP_hasOwnProperty = Object.prototype.hasOwnProperty;

// Returns the internal class of an object
function getClass(o) {

	if (o === null || o === undefined) return "Object";
	return OP_toString.call(o).slice("[object ".length, -1);
}

// Returns true if the argument is a Date object
function isDate(obj) {

    return getClass(obj) === "Date";
}

// Returns true if the argument is an object
function isObject(obj) {

    return obj && typeof obj === "object";
}

// Returns true if the arguments are "equal"
function equal(a, b) {

    if (Object.is(a, b))
        return true;

	// Dates must have equal time values
	if (isDate(a) && isDate(b))
		return a.getTime() === b.getTime();

	// Non-objects must be strictly equal (types must be equal)
	if (!isObject(a) || !isObject(b))
		return a === b;

	// Prototypes must be identical.  getPrototypeOf may throw on
	// ES3 engines that don't provide access to the prototype.
	try {

	    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
		    return false;

	} catch (err) {}

	var aKeys = Object.keys(a),
		bKeys = Object.keys(b);

	// Number of own properties must be identical
	if (aKeys.length !== bKeys.length)
		return false;

	for (var i$0 = 0; i$0 < aKeys.length; ++i$0) {

		// Names of own properties must be identical
		if (!OP_hasOwnProperty.call(b, aKeys[i$0]))
			return false;

		// Values of own properties must be equal
		if (!equal(a[aKeys[i$0]], b[aKeys[i$0]]))
			return false;
	}

	return true;
}

var Test = _esdown.class(function(__) { var Test;

	__({ constructor: Test = function(logger) {

		this._name = "";
		this._not = false;
		this._logger = logger;
	},

	_: function(name) {

	    this._name = name;
	    return this;
	},

	name: function(name) {

		this._name = name;
		return this;
	},

	not: function() {

		this._not = !this._not;
		return this;
	},

	assert: function(val) {

		return this._assert(val, {
			method: "assert",
            actual: val,
            expected: true,
		});
	},

	equals: function(actual, expected) {

		return this._assert(equal(actual, expected), {
			actual: actual,
			expected: expected,
			method: "equal"
		});
	},

	throws: function(fn, error) {

		var threw = false,
            actual;

		try { fn() }
		catch (x) {
            actual = x;
            threw = (error === undefined || x === error || x instanceof error);
        }

		return this._assert(threw, {
			method: "throws",
            actual: actual,
            expected: error,
		});
	},

	comment: function(msg) {

	    this._logger.comment(msg);
	},

	_assert: function(pred, data) {

		var pass = !!pred,
			method = data.method || "";

		if (this._not) {
			pass = !pass;
			method = "not " + method;
		}

		var obj = { name: this._name, pass: pass, method: method };
		Object.keys(data).forEach(function(k) { return obj[k] || (obj[k] = data[k]); });

		this._logger.log(obj);
		this._not = false;

		return this;
	}});

 });

exports.Test = Test;


}).call(this, _M23);

(function(exports) {

var ELEMENT_ID = "moon-unit";

function findTarget() {

    var e;

    for (var w$0 = window; w$0; w$0 = w$0.parent) {

        e = w$0.document.getElementById(ELEMENT_ID);

        if (e)
            return e;

        if (w$0.parent === w$0)
            break;
    }

    return null;
}

var HtmlLogger = _esdown.class(function(__) { var HtmlLogger;

    __({ constructor: HtmlLogger = function() {

        this.target = findTarget();
        this.clear();
    },

    clear: function() {

        this.depth = 0;
        this.passed = 0;
        this.failed = 0;
        this.html = "";

        if (this.target)
            this.target.innerHTML = "";
    },

    end: function() {

        this._flush();
    },

    pushGroup: function(name) {

        this.depth += 1;
        this._writeHeader(name, this.depth);
    },

    popGroup: function() {

        this.depth -= 1;
        this._flush();
    },

    log: function(result) {

        var passed = !!result.pass;

        if (passed) this.passed++;
        else this.failed++;

        this.html +=
        "<div class='" + (result.pass ? "pass" : "fail") + "'>\n\
            " + (result.name) + " <span class=\"status\">[" + (passed ? "OK" : "FAIL") + "]</span>\n\
        </div>";
    },

    comment: function(msg) {

        this.html += "<p class=\"comment\">" + (msg) + "</p>";
    },

    error: function(e) {

        if (e)
            this.html += "<p class=\"error\">" + (e.stack) + "</p>";
    },

    _writeHeader: function(name) {

        var level = Math.min(Math.max(2, this.depth + 1), 6);
        this.html += "<h" + (level) + ">" + (name) + "</h" + (level) + ">";
    },

    _flush: function() {

        if (!this.target)
            return;

        var document = this.target.ownerDocument,
            div = document.createElement("div"),
            frag = document.createDocumentFragment(),
            child;

        div.innerHTML = this.html;
        this.html = "";

        while (child = div.firstChild)
            frag.appendChild(child);

        this.target.appendChild(frag);
        div = null;
    }});
 });

exports.HtmlLogger = HtmlLogger;


}).call(this, _M21);

(function(exports) {

var Style = {

    green: function(msg) { return "\x1B[32m" + (msg) + "\x1B[39m" },
    red: function(msg) { return "\x1B[31m" + (msg) + "\x1B[39m" },
    gray: function(msg) { return "\x1B[90m" + (msg) + "\x1B[39m" },
    bold: function(msg) { return "\x1B[1m" + (msg) + "\x1B[22m" }
}

var NodeLogger = _esdown.class(function(__) { var NodeLogger;

    __({ constructor: NodeLogger = function() {

        this.clear();
    },

    clear: function() {

        this.passed = 0;
        this.failed = 0;
        this.failList = [];
        this.path = [];
        this.margin = false;
    },

    get indent() {

        return " ".repeat(Math.max(this.path.length, 0) * 2);
    },

    end: function() { var __$2; 

        for (var __$0 = (this.failList)[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;) { var path$0 = (__$2 = _esdown.objd(__$1.value), __$2.path), result$0 = __$2.result; 

            this._write(Style.bold(path$0 + " > " + result$0.name));
            this._write("  Actual: " + result$0.actual);
            this._write("  Expected: " + result$0.expected);
            this._newline();
        }
    },

    pushGroup: function(name) {

        this._newline();
        this._write(Style.bold("" + (this.indent) + "" + (name) + ""));
        this.path.push(name);
    },

    popGroup: function() {

        this.path.pop();
    },

    log: function(result) {

        var passed = !!result.pass;

        if (passed) this.passed++;
        else this.failed++;

        if (!passed)
            this.failList.push({ path: this.path.join(" > "), result: result });

        this._write("" + (this.indent) + "" + (result.name) + " " +
            "" + (Style.bold(passed ? Style.green("OK") : Style.red("FAIL"))) + "");
    },

    error: function(e) {

        if (e)
            this._write("\n" + Style.red(e.stack) + "\n");
    },

    comment: function(msg) {

        this._newline();
        this._write(this.indent + Style.gray(msg));
        this._newline();
    },

    _write: function(text) {

        console.log(text);
        this.margin = false;
    },

    _newline: function() {

        if (!this.margin)
            console.log("");

        this.margin = true;
    }});
 });

exports.NodeLogger = NodeLogger;


}).call(this, _M22);

(function(exports) {

var HtmlLogger = _M21.HtmlLogger;
var NodeLogger = _M22.NodeLogger;

var Logger = (typeof global === "object" && global.process) ?
    NodeLogger :
    HtmlLogger;

exports.Logger = Logger;


}).call(this, _M20);

(function(exports) {

var Test = _M23.Test;
var Logger = _M20.Logger;

var TestRunner = _esdown.class(function(__) { var TestRunner;

    __({ constructor: TestRunner = function() {

        this.logger = new Logger;
        this.injections = {};
    },

    inject: function(obj) { var __this = this; 

        Object.keys(obj || {}).forEach(function(k) { return __this.injections[k] = obj[k]; });
        return this;
    },

    run: function(tests) { var __this = this; 

        this.logger.clear();
        this.logger.comment("Starting tests...");

        return this._visit(tests).then(function(val) {

            __this.logger.comment("Passed " + (__this.logger.passed) + " tests and failed " + (__this.logger.failed) + " tests.");
            __this.logger.end();
            return __this;
        });
    },

    _exec: function(fn) { var __this = this; 

        return new Promise(function(resolve) {

            resolve(fn(new Test(__this.logger), __this.injections));

        }).catch(function(error) {

            __this.logger.error(error);
            throw error;
        });
    },

    _visit: function(node) { var __this = this; 

        return new Promise(function(resolve) {

            var list = Object.keys(node);

            var next = function($) {

                if (list.length === 0)
                    return;

                var k = list.shift();

                __this.logger.pushGroup(k);

                var p = typeof node[k] === "function" ?
                    __this._exec(node[k]) :
                    __this._visit(node[k]);

                return p.then(function($) { return __this.logger.popGroup(); }).then(next);
            };

            resolve(next());
        });
    }});
 });

exports.TestRunner = TestRunner;


}).call(this, _M19);

(function(exports) {

var TestRunner = _M19.TestRunner;
var Logger = _M20.Logger;

function runTests(tests) {

    return new TestRunner().run(tests);
}



exports.runTests = runTests;
exports.TestRunner = TestRunner;


}).call(this, _M17);

(function(exports) {

Object.keys(_M17).forEach(function(k) { exports[k] = _M17[k]; });


}).call(this, _M2);

(function(exports) {

exports["default"] = {

    "Argument types": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        test
        ._("The first argument cannot be a non-callable object")
        .throws(function(_) { return new Observable({}); }, TypeError)
        ._("The first argument cannot be a primative value")
        .throws(function(_) { return new Observable(false); }, TypeError)
        .throws(function(_) { return new Observable(null); }, TypeError)
        .throws(function(_) { return new Observable(undefined); }, TypeError)
        .throws(function(_) { return new Observable(1); }, TypeError)
        ._("The first argument can be a function")
        .not().throws(function(_) { return new Observable(function() {}); })
        ;
    },

    "Subscriber function is not called by constructor": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var called = 0;
        new Observable(function(_) { return called++; });

        test
        ._("The constructor does not call the subscriber function")
        .equals(called, 0)
        ;
    },

};


}).call(this, _M3);

(function(exports) {

function testLength(test, value, length) {

    if (typeof value !== "function" || typeof length !== "number")
        return;

    test._("Function length is " + length)
    .equals(value.length, length);
}

function testMethodProperty(test, object, key, options) {

    var desc = Object.getOwnPropertyDescriptor(object, key);

    if (options.get || options.set) {

        test._("Property " + (options.get ? "has" : "does not have") + " a getter")
        .equals(typeof desc.get, options.get ? "function" : "undefined");

        testLength(test, desc.get, 0);

        test._("Property " + (options.set ? "has" : "does not have") + " a setter")
        .equals(typeof desc.set, options.set ? "function" : "undefined");

        testLength(test, desc.set, 1);

    } else {

        test._("Property has a function value")
        .equals(typeof desc.value, "function");

        testLength(test, desc.value, options.length);

        test._("Property is " + (options.writable ? "" : "non-") + "writable")
        .equals(desc.writable, Boolean(options.writable));
    }


    test
    ._("Property is " + (options.enumerable ? "" : "non-") + "enumerable")
    .equals(desc.enumerable, Boolean(options.enumerable))
    ._("Property is " + (options.configurable ? "" : "non-") + "configurable")
    .equals(desc.configurable, Boolean(options.configurable))
    ;

}

exports.testMethodProperty = testMethodProperty;


}).call(this, _M18);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "Observable.prototype has a subscribe property": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        testMethodProperty(test, Observable.prototype, "subscribe", {
            configurable: true,
            writable: true,
            length: 1,
        });
    },

    "Argument type": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var x = new Observable(function(sink) { return null; });

        test
        ._("Throws if observer is not an object")
        .throws(function(_) { return x.subscribe(null); }, TypeError)
        .throws(function(_) { return x.subscribe(undefined); }, TypeError)
        .throws(function(_) { return x.subscribe(1); }, TypeError)
        .throws(function(_) { return x.subscribe(true); }, TypeError)
        .throws(function(_) { return x.subscribe("string"); }, TypeError)
        .throws(function(_) { return x.subscribe(Symbol("test")); }, TypeError)

        ._("Any object may be an observer")
        .not().throws(function(_) { return x.subscribe({}); })
        .not().throws(function(_) { return x.subscribe(Object(1)); })
        .not().throws(function(_) { return x.subscribe(function() {}); })
        ;
    },

    "Subscriber arguments": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer = null;
        new Observable(function(x) { observer = x }).subscribe({});

        test._("Subscriber is called with an observer")
        .equals(typeof observer, "object")
        .equals(typeof observer.next, "function")
        .equals(typeof observer.error, "function")
        .equals(typeof observer.complete, "function")
        ;

        test._("Subscription observer's constructor property is Object")
        .equals(observer.constructor, Object);
    },

    "Subscriber return types": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var type = "", sink = {};

        test
        ._("Undefined can be returned")
        .not().throws(function(_) { return new Observable(function(sink) { return undefined; }).subscribe(sink); })
        ._("Null can be returned")
        .not().throws(function(_) { return new Observable(function(sink) { return null; }).subscribe(sink); })
        ._("Functions can be returned")
        .not().throws(function(_) { return new Observable(function(sink) { return function() {}; }).subscribe(sink); })
        ._("Objects cannot be returned")
        .throws(function(_) { return new Observable(function(sink) { return ({}); }).subscribe(sink); }, TypeError)
        ._("Non-functions can be returned")
        .throws(function(_) { return new Observable(function(sink) { return 0; }).subscribe(sink); }, TypeError)
        .throws(function(_) { return new Observable(function(sink) { return false; }).subscribe(sink); }, TypeError)
        ;
    },

    "Returns a cancel function": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var called = 0;
        var cancel = new Observable(function(observer) {
            return function(_) { return called++; };
        }).subscribe({});

        test
        ._("Subscribe returns a function")
        .equals(typeof cancel, "function")
        ._("Cancel returns undefined")
        .equals(cancel(), undefined)
        ._("Cancel calls the cleanup function")
        .equals(called, 1)
        ;
    },

    "Cleanup function": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var called = 0,
            returned = 0;

        var unsubscribe = new Observable(function(sink) {
            return function(_) { called++ };
        }).subscribe({
            complete: function(v) { returned++ },
        });

        unsubscribe();

        test._("The cleanup function is called when unsubscribing")
        .equals(called, 1);

        unsubscribe();

        test._("The cleanup function is not called again when unsubscribe is called again")
        .equals(called, 1);

        called = 0;

        new Observable(function(sink) {
            sink.error(1);
            return function(_) { called++ };
        }).subscribe({
            error: function(v) {},
        });

        test._("The cleanup function is called when an error is sent to the sink")
        .equals(called, 1);

        called = 0;

        new Observable(function(sink) {
            sink.complete(1);
            return function(_) { called++ };
        }).subscribe({
            complete: function(v) {},
        });

        test._("The cleanup function is called when a complete is sent to the sink")
        .equals(called, 1);

    },

    "Exceptions thrown from the subscriber": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var error = new Error(),
            observable = new Observable(function(_) { throw error });

        test._("Subscribe throws if the observer does not handle errors")
        .throws(function(_) { return observable.subscribe({}); }, error);

        var thrown = null;
        observable.subscribe({ error: function(e) { thrown = e } });

        test._("Subscribe sends an error to the observer")
        .equals(thrown, error);
    },

};


}).call(this, _M4);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "Observable.prototype has a forEach property": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        testMethodProperty(test, Observable.prototype, "forEach", {
            configurable: true,
            writable: true,
            length: 1,
        });
    },

    "Argument must be a function": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var result = Observable.prototype.forEach.call({}, {});

        test._("If the first argument is not a function, a promise is returned")
        .assert(result instanceof Promise);

        return result.then(function(_) { return null; }, function(e) { return e; }).then(function(error) {

            test._("The promise is rejected with a TypeError")
            .assert(Boolean(error))
            .assert(error instanceof TypeError);
        });
    },

    "Subscribe is called on the 'this' value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var called = 0,
            observer = null;

        Observable.prototype.forEach.call({

            subscribe: function(x) {
                called++;
                observer = x;
            }

        }, function(_) { return null; });

        test._("The subscribe method is called with an observer")
        .equals(called, 1)
        .equals(typeof observer, "object")
        .equals(typeof observer.next, "function")
        ;
    },

    "Error rejects the promise": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var error = new Error();

        return new Observable(function(observer) { observer.error(error) })
            .forEach(function(_) { return null; })
            .then(function(_) { return null; }, function(e) { return e; })
            .then(function(value) {
                test._("Sending error rejects the promise with the supplied value")
                .equals(value, error);
            });
    },

    "Complete resolves the promise": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var token = {};

        return new Observable(function(observer) { observer.complete(token) })
            .forEach(function(_) { return null; })
            .then(function(x) { return x; }, function(e) { return null; })
            .then(function(value) {
                test._("Sending complete resolves the promise with the supplied value")
                .equals(value, token);
            });
    },

    "The callback is called with the next value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var values = [];

        return new Observable(function(observer) {

            observer.next(1);
            observer.next(2);
            observer.next(3);
            observer.complete();

        }).forEach(function(x) {

            values.push(x);

        }).then(function(_) {

            test._("The callback receives each next value")
            .equals(values, [1, 2, 3]);

        });
    },

    "If the callback throws an error, the promise is rejected": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var error = new Error();

        return new Observable(function(observer) { observer.next(1) })
            .forEach(function(_) { throw error })
            .then(function(_) { return null; }, function(e) { return e; })
            .then(function(value) {
                test._("The promise is rejected with the thrown value")
                .equals(value, error);
            });
    },

};


}).call(this, _M5);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "Observable.prototype has a map property": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        testMethodProperty(test, Observable.prototype, "map", {
            configurable: true,
            writable: true,
            length: 1,
        });
    },

    "Allowed arguments": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observable = new Observable(function(_) { return null; });

        test._("Argument must be a function")
        .throws(function(_) { return observable.map(); }, TypeError)
        .throws(function(_) { return observable.map(null); }, TypeError)
        .throws(function(_) { return observable.map({}); }, TypeError)
        ;
    },

    "Species is used to determine the constructor": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observable = new Observable(function(_) { return null; }),
            token = {};

        function species() {
            this.token = token;
        }

        observable.constructor = function() {};
        observable.constructor[Symbol.species] = species;

        test._("Constructor species is used as the new constructor")
        .equals(observable.map(function(_) {}).token, token);

        observable.constructor[Symbol.species] = null;
        test._("An error is thrown if instance does not have a constructor species")
        .throws(function(_) { return observable.map(function(_) {}); }, TypeError);

        observable.constructor = null;
        test._("An error is thrown if the instance does not have a constructor")
        .throws(function(_) { return observable.map(function(_) {}); }, TypeError);
    },

    "The callback is used to map next values": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var values = [],
            returns = [];

        new Observable(function(observer) {
            returns.push(observer.next(1));
            returns.push(observer.next(2));
            observer.complete();
        }).map(function(x) { return x * 2; }).subscribe({
            next: function(v) { values.push(v); return -v; }
        });

        test
        ._("Mapped values are sent to the observer")
        .equals(values, [2, 4])
        ._("Return values from the observer are returned to the caller")
        .equals(returns, [-2, -4])
        ;
    },

    "Errors thrown from the callback are sent to the observer": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var error = new Error(),
            thrown = null,
            returned = null,
            token = {};

        new Observable(function(observer) {
            returned = observer.next(1);
        }).map(function(x) { throw error }).subscribe({
            error: function(e) { thrown = e; return token; }
        });

        test
        ._("Exceptions from callback are sent to the observer")
        .equals(thrown, error)
        ._("The result of calling error is returned to the caller")
        .equals(returned, token)
        ;
    },

    "Errors are forwarded to the observer": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var error = new Error(),
            thrown = null,
            returned = null,
            token = {};

        new Observable(function(observer) {
            returned = observer.error(error);
        }).map(function(x) { return x; }).subscribe({
            error: function(e) { thrown = e; return token; }
        });

        test
        ._("Error values are forwarded")
        .equals(thrown, error)
        ._("The return value of the error method is returned to the caller")
        .equals(returned, token)
        ;
    },

    "Complete is forwarded to the observer": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var arg = {},
            passed = null,
            returned = null,
            token = {};

        new Observable(function(observer) {
            returned = observer.complete(arg);
        }).map(function(x) { return x; }).subscribe({
            complete: function(v) { passed = v; return token; }
        });

        test
        ._("Complete values are forwarded")
        .equals(passed, arg)
        ._("The return value of the complete method is returned to the caller")
        .equals(returned, token)
        ;
    },

};


}).call(this, _M6);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "Observable.prototype has a filter property": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        testMethodProperty(test, Observable.prototype, "filter", {
            configurable: true,
            writable: true,
            length: 1,
        });
    },

    "Allowed arguments": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observable = new Observable(function(_) { return null; });

        test._("Argument must be a function")
        .throws(function(_) { return observable.filter(); }, TypeError)
        .throws(function(_) { return observable.filter(null); }, TypeError)
        .throws(function(_) { return observable.filter({}); }, TypeError)
        ;
    },

    "Species is used to determine the constructor": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observable = new Observable(function(_) { return null; }),
            token = {};

        function species() {
            this.token = token;
        }

        observable.constructor = function() {};
        observable.constructor[Symbol.species] = species;

        test._("Constructor species is used as the new constructor")
        .equals(observable.filter(function(_) {}).token, token);

        observable.constructor[Symbol.species] = null;
        test._("An error is thrown if instance does not have a constructor species")
        .throws(function(_) { return observable.filter(function(_) {}); }, TypeError);

        observable.constructor = null;
        test._("An error is thrown if the instance does not have a constructor")
        .throws(function(_) { return observable.filter(function(_) {}); }, TypeError);
    },

    "The callback is used to filter next values": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var values = [],
            returns = [];

        new Observable(function(observer) {
            returns.push(observer.next(1));
            returns.push(observer.next(2));
            returns.push(observer.next(3));
            returns.push(observer.next(4));
            observer.complete();
        }).filter(function(x) { return x % 2; }).subscribe({
            next: function(v) { values.push(v); return -v; }
        });

        test
        ._("Filtered values are sent to the observer")
        .equals(values, [1, 3])
        ._("Return values from the observer are returned to the caller")
        .equals(returns, [-1, undefined, -3, undefined])
        ;
    },

    "Errors thrown from the callback are sent to the observer": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var error = new Error(),
            thrown = null,
            returned = null,
            token = {};

        new Observable(function(observer) {
            returned = observer.next(1);
        }).filter(function(x) { throw error }).subscribe({
            error: function(e) { thrown = e; return token; }
        });

        test
        ._("Exceptions from callback are sent to the observer")
        .equals(thrown, error)
        ._("The result of calling error is returned to the caller")
        .equals(returned, token)
        ;
    },

    "Errors are forwarded to the observer": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var error = new Error(),
            thrown = null,
            returned = null,
            token = {};

        new Observable(function(observer) {
            returned = observer.error(error);
        }).filter(function(x) { return true; }).subscribe({
            error: function(e) { thrown = e; return token; }
        });

        test
        ._("Error values are forwarded")
        .equals(thrown, error)
        ._("The return value of the error method is returned to the caller")
        .equals(returned, token)
        ;
    },

    "Complete is forwarded to the observer": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var arg = {},
            passed = null,
            returned = null,
            token = {};

        new Observable(function(observer) {
            returned = observer.complete(arg);
        }).filter(function(x) { return true; }).subscribe({
            complete: function(v) { passed = v; return token; }
        });

        test
        ._("Complete values are forwarded")
        .equals(passed, arg)
        ._("The return value of the complete method is returned to the caller")
        .equals(returned, token)
        ;
    },

};


}).call(this, _M7);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "Observable.prototype has a Symbol.observable method": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        test._("Symbol.observable exists").assert(Symbol.observable);

        testMethodProperty(test, Observable.prototype, Symbol.observable, {
            configurable: true,
            writable: true,
            length: 0
        });
    },

    "Return value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var desc = Object.getOwnPropertyDescriptor(Observable.prototype, Symbol.observable),
            thisVal = {};

        test._("Returns the 'this' value").equals(desc.value.call(thisVal), thisVal);
    }

};


}).call(this, _M8);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "Observable has a species method": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        testMethodProperty(test, Observable, Symbol.species, {
            get: true,
            configurable: true
        });
    },

    "Return value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var desc = Object.getOwnPropertyDescriptor(Observable, Symbol.species),
            thisVal = {};

        test._("Returns the 'this' value").equals(desc.get.call(thisVal), thisVal);
    }

};


}).call(this, _M9);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "Observable has an of property": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        testMethodProperty(test, Observable, "of", {
            configurable: true,
            writable: true,
            length: 0,
        });
    },

    "Uses the this value if it's a function": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var usesThis = false;

        Observable.of.call(function(_) { return usesThis = true; });
        test._("Observable.of will use the 'this' value if it is callable")
        .equals(usesThis, true);
    },

    "Uses 'Observable' if the 'this' value is not a function": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var result = Observable.of.call({}, 1, 2, 3, 4);

        test._("Observable.of will use 'Observable' if the this value is not callable")
        .assert(result instanceof Observable);
    },

    "Arguments are delivered to next": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        return new Promise(function(resolve) {

            var values = [],
                turns = 0;

            Observable.of(1, 2, 3, 4).subscribe({

                next: function(v) {
                    values.push(v);
                    Promise.resolve().then(function(_) { return turns++; });
                },

                complete: function() {
                    test._("All items are delivered and complete is called")
                    .equals(values, [1, 2, 3, 4]);
                    test._("Items are delivered in a single future turn")
                    .equals(turns, 1);

                    resolve();
                },
            });

            turns++;

        });
    },

    "Responds to cancellation from next": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        return new Promise(function(resolve) {

            var values = [];

            var cancel = Observable.of(1, 2, 3, 4).subscribe({

                next: function(v) {

                    values.push(v);
                    cancel();
                    Promise.resolve().then(function(_) {
                        test._("Cancelling from next stops observation")
                        .equals(values, [1]);
                        resolve();
                    });
                }
            });
        });
    },

    "Responds to cancellation before next is called": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        return new Promise(function(resolve) {

            var values = [];

            var cancel = Observable.of(1, 2, 3, 4).subscribe({
                next: function(v) { values.push(v) }
            });

            cancel();

            Promise.resolve().then(function(_) {
                test._("Cancelling before next is called stops observation")
                .equals(values, []);
                resolve();
            });
        });
    },

};


}).call(this, _M10);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "Observable has a from property": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        testMethodProperty(test, Observable, "from", {
            configurable: true,
            writable: true,
            length: 1
        });
    },

    "Allowed argument types": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        test
        ._("Null is not allowed")
        .throws(function(_) { return Observable.from(null); }, TypeError)
        ._("Undefined is not allowed")
        .throws(function(_) { return Observable.from(undefined); }, TypeError)
        .throws(function(_) { return Observable.from(); }, TypeError);
    },

    "Uses the this value if it's a function": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var usesThis = false;

        Observable.from.call(function(_) { return usesThis = true; }, []);
        test._("Observable.from will use the 'this' value if it is callable")
        .equals(usesThis, true);
    },

    "Uses 'Observable' if the 'this' value is not a function": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var result = Observable.from.call({}, []);

        test._("Observable.from will use 'Observable' if the this value is not callable")
        .assert(result instanceof Observable);
    },

    "Symbol.observable method is accessed": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var called = 0;

        Observable.from(_esdown.computed({
            }, Symbol.observable, { get _() {
                called++;
                return function(_) { return ({}); };
            }
        }));

        test._("Symbol.observable property is accessed once")
        .equals(called, 1);

        test
        ._("Symbol.observable must be a function")
        .throws(function(_) { return Observable.from(_esdown.computed({ }, Symbol.observable, { _: {} })); }, TypeError)
        .throws(function(_) { return Observable.from(_esdown.computed({ }, Symbol.observable, { _: 0 })); }, TypeError)
        ._("Null is allowed")
        .not().throws(function(_) { return Observable.from(_esdown.computed({ }, Symbol.observable, { _: null })); })
        ._("Undefined is allowed")
        .not().throws(function(_) { return Observable.from(_esdown.computed({ }, Symbol.observable, { _: undefined })); })
        ;

        called = 0;
        Observable.from(_esdown.computed({
            }, Symbol.observable, { _: function() {
                called++;
                return {};
            }
        }));

        test._("Calls the Symbol.observable method")
        .equals(called, 1);
    },

    "Return value of Symbol.observable": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        test._("Throws if the return value of Symbol.observable is not an object")
        .throws(function(_) { return Observable.from(_esdown.computed({ }, Symbol.observable, { _: function() { return 0 } })); }, TypeError)
        .throws(function(_) { return Observable.from(_esdown.computed({ }, Symbol.observable, { _: function() { return null } })); }, TypeError)
        .throws(function(_) { return Observable.from(_esdown.computed({ }, Symbol.observable, { _: function() {} })); }, TypeError)
        .not().throws(function(_) { return Observable.from(_esdown.computed({ }, Symbol.observable, { _: function() { return {} } })); })
        .not().throws(function(_) { return Observable.from(_esdown.computed({ }, Symbol.observable, { _: function() { return function(_) {} } })); })
        ;

        var target = function() {},
            returnValue = { constructor: target };

        var result = Observable.from.call(target, _esdown.computed({
            }, Symbol.observable, { _: function() { return returnValue }
        }));

        test._("Returns the result of Symbol.observable if the object's constructor property " +
            "is the target")
        .equals(result, returnValue);

        var input = null,
            token = {};

        target = function(fn) {
            this.fn = fn;
            this.token = token;
        };

        result = Observable.from.call(target, _esdown.computed({
            }, Symbol.observable, { _: function() {
                return {
                    subscribe: function(x) {
                        input = x;
                        return token;
                    },
                };
            }
        }));

        test._("Calls the constructor if returned object does not have matching constructor " +
            "property")
        .equals(result.token, token)
        ._("Constructor is called with a function")
        .equals(typeof result.fn, "function")
        ._("Calling the function calls subscribe on the object and returns the result")
        .equals(result.fn(123), token)
        ._("The subscriber argument is supplied to the subscribe method")
        .equals(input, 123)
        ;

    },

    "Iterables: arguments are delivered to next": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        return new Promise(function(resolve) {

            var values = [],
                turns = 0;

            var iterable = _esdown.computed({
                }, Symbol.iterator, { _: function() { return [1, 2, 3, 4][Symbol.iterator]() }
            });

            Observable.from(iterable).subscribe({

                next: function(v) {
                    values.push(v);
                    Promise.resolve().then(function(_) { return turns++; });
                },

                complete: function() {
                    test._("All items are delivered and complete is called")
                    .equals(values, [1, 2, 3, 4]);
                    test._("Items are delivered in a single future turn")
                    .equals(turns, 1);

                    resolve();
                },
            });

            turns++;

        });
    },

    "Iterables: responds to cancellation from next": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        return new Promise(function(resolve) {

            var values = [];

            var cancel = Observable.from([1, 2, 3, 4]).subscribe({

                next: function(v) {

                    values.push(v);
                    cancel();
                    Promise.resolve().then(function(_) {
                        test._("Cancelling from next stops observation")
                        .equals(values, [1]);
                        resolve();
                    });
                }
            });
        });
    },

    "Iterables: responds to cancellation before next is called": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        return new Promise(function(resolve) {

            var values = [];

            var cancel = Observable.from([1, 2, 3, 4]).subscribe({
                next: function(v) { values.push(v) }
            });

            cancel();

            Promise.resolve().then(function(_) {
                test._("Cancelling before next is called stops observation")
                .equals(values, []);
                resolve();
            });
        });
    },

    "Non-iterables result in a catchable error": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var error = null;
        Observable.from({}).subscribe({ error: function(e) { error = e } });

        return new Promise(function(resolve) {

            setTimeout(function(_) {

                test._("If argument is not iterable, then error method is called")
                .assert(error instanceof Error);

                resolve();

            }, 10);
        });

    },

};


}).call(this, _M11);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "SubscriptionObserver.prototype has an next method": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer;
        new Observable(function(x) { observer = x }).subscribe({});

        testMethodProperty(test, Object.getPrototypeOf(observer), "next", {
            configurable: true,
            writable: true,
            length: 1
        });
    },

    "Input value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var token = {};

        new Observable(function(observer) {

            observer.next(token, 1, 2);

        }).subscribe({

            next: function(value) { for (var args = [], __$0 = 1; __$0 < arguments.length; ++__$0) args.push(arguments[__$0]); 
                test._("Input value is forwarded to the observer")
                .equals(value, token)
                ._("Additional arguments are not forwarded")
                .equals(args.length, 0);
            }

        });
    },

    "Return value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var token = {};

        new Observable(function(observer) {

            test._("Returns the value returned from the observer")
            .equals(observer.next(), token);

            observer.complete();

            test._("Returns undefined when closed")
            .equals(observer.next(), undefined);

        }).subscribe({
            next: function() { return token }
        });
    },

    "Method lookup": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer,
            observable = new Observable(function(x) { observer = x });

        observable.subscribe({});
        test._("If property does not exist, then next returns undefined")
        .equals(observer.next(), undefined);

        observable.subscribe({ next: undefined });
        test._("If property is undefined, then next returns undefined")
        .equals(observer.next(), undefined);

        observable.subscribe({ next: null });
        test._("If property is null, then next returns undefined")
        .equals(observer.next(), undefined);

        observable.subscribe({ next: {} });
        test._("If property is not a function, then an error is thrown")
        .throws(function(_) { return observer.next(); }, TypeError);

        var actual = {};
        observable.subscribe(actual);
        actual.next = (function(_) { return 1; });
        test._("Method is not accessed until complete is called")
        .equals(observer.next(), 1);

        var called = 0;
        observable.subscribe({
            get next() {
                called++;
                return function() {};
            }
        });
        observer.complete();
        observer.next();
        test._("Method is not accessed when subscription is closed")
        .equals(called, 0);

        called = 0;
        observable.subscribe({
            get next() {
                called++;
                return function() {};
            }
        });
        observer.next();
        test._("Property is only accessed once during a lookup")
        .equals(called, 1);

    },

    "Cleanup functions": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var called, observer;

        var observable = new Observable(function(x) {
            observer = x;
            return function(_) { called++ };
        });

        called = 0;
        observable.subscribe({ next: function() { throw new Error() } });
        try { observer.next() }
        catch (x) {}
        test._("Cleanup function is called when next throws an error")
        .equals(called, 1);

        var error = new Error(), caught = null;

        new Observable(function(x) {
            observer = x;
            return function(_) { throw new Error() };
        }).subscribe({ next: function() { throw error } });

        try { observer.next() }
        catch (x) { caught = x }

        test._("If both next and the cleanup function throw, then the error " +
            "from the next method is thrown")
        .assert(caught === error);

    },

};


}).call(this, _M12);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "SubscriptionObserver.prototype has an error method": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer;
        new Observable(function(x) { observer = x }).subscribe({});

        testMethodProperty(test, Object.getPrototypeOf(observer), "error", {
            configurable: true,
            writable: true,
            length: 1
        });
    },

    "Input value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var token = {};

        new Observable(function(observer) {

            observer.error(token, 1, 2);

        }).subscribe({

            error: function(value) { for (var args = [], __$0 = 1; __$0 < arguments.length; ++__$0) args.push(arguments[__$0]); 
                test._("Input value is forwarded to the observer")
                .equals(value, token)
                ._("Additional arguments are not forwarded")
                .equals(args.length, 0);
            }

        });
    },

    "Return value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var token = {};

        new Observable(function(observer) {

            test._("Returns the value returned from the observer")
            .equals(observer.error(), token);

            test._("Throws the input when closed")
            .throws(function(_) { observer.error(token) }, token);

        }).subscribe({
            error: function() { return token }
        });
    },

    "Method lookup": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer,
            error = new Error(),
            observable = new Observable(function(x) { observer = x });

        observable.subscribe({});
        test._("If property does not exist, then error throws the input")
        .throws(function(_) { return observer.error(error); }, error);

        observable.subscribe({ error: undefined });
        test._("If property is undefined, then error throws the input")
        .throws(function(_) { return observer.error(error); }, error);

        observable.subscribe({ error: null });
        test._("If property is null, then error throws the input")
        .throws(function(_) { return observer.error(error); }, error);

        observable.subscribe({ error: {} });
        test._("If property is not a function, then an error is thrown")
        .throws(function(_) { return observer.error(); }, TypeError);

        var actual = {};
        observable.subscribe(actual);
        actual.error = (function(_) { return 1; });
        test._("Method is not accessed until error is called")
        .equals(observer.error(error), 1);

        var called = 0;
        observable.subscribe({
            get error() {
                called++;
                return function() {};
            }
        });
        observer.complete();
        try { observer.error(error) }
        catch (x) {}
        test._("Method is not accessed when subscription is closed")
        .equals(called, 0);

        called = 0;
        observable.subscribe({
            get error() {
                called++;
                return function() {};
            }
        });
        observer.error();
        test._("Property is only accessed once during a lookup")
        .equals(called, 1);

        called = 0;
        observable.subscribe({
            next: function() { called++ },
            get error() {
                called++;
                observer.next();
                return function() {};
            }
        });
        observer.error();
        test._("When method lookup occurs, subscription is closed")
        .equals(called, 1);

    },

    "Cleanup functions": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var called, observer;

        var observable = new Observable(function(x) {
            observer = x;
            return function(_) { called++ };
        });

        called = 0;
        observable.subscribe({});
        try { observer.error() }
        catch (x) {}
        test._("Cleanup function is called when observer does not have an error method")
        .equals(called, 1);

        called = 0;
        observable.subscribe({ error: function() { return 1 } });
        observer.error();
        test._("Cleanup function is called when observer has an error method")
        .equals(called, 1);

        called = 0;
        observable.subscribe({ get error() { throw new Error() } });
        try { observer.error() }
        catch (x) {}
        test._("Cleanup function is called when method lookup throws")
        .equals(called, 1);

        called = 0;
        observable.subscribe({ error: function() { throw new Error() } });
        try { observer.error() }
        catch (x) {}
        test._("Cleanup function is called when method throws")
        .equals(called, 1);

        var error = new Error(), caught = null;

        new Observable(function(x) {
            observer = x;
            return function(_) { throw new Error() };
        }).subscribe({ error: function() { throw error } });

        try { observer.error() }
        catch (x) { caught = x }

        test._("If both error and the cleanup function throw, then the error " +
            "from the error method is thrown")
        .assert(caught === error);

    },

};


}).call(this, _M13);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "SubscriptionObserver.prototype has a complete method": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer;
        new Observable(function(x) { observer = x }).subscribe({});

        testMethodProperty(test, Object.getPrototypeOf(observer), "complete", {
            configurable: true,
            writable: true,
            length: 1
        });
    },

    "Input value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var token = {};

        new Observable(function(observer) {

            observer.complete(token, 1, 2);

        }).subscribe({

            complete: function(value) { for (var args = [], __$0 = 1; __$0 < arguments.length; ++__$0) args.push(arguments[__$0]); 
                test._("Input value is forwarded to the observer")
                .equals(value, token)
                ._("Additional arguments are not forwarded")
                .equals(args.length, 0);
            }

        });
    },

    "Return value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var token = {};

        new Observable(function(observer) {

            test._("Returns the value returned from the observer")
            .equals(observer.complete(), token);

            test._("Returns undefined when closed")
            .equals(observer.complete(), undefined);

        }).subscribe({
            complete: function() { return token }
        });
    },

    "Method lookup": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer,
            observable = new Observable(function(x) { observer = x });

        observable.subscribe({});
        test._("If property does not exist, then complete returns undefined")
        .equals(observer.complete(), undefined);

        observable.subscribe({ complete: undefined });
        test._("If property is undefined, then complete returns undefined")
        .equals(observer.complete(), undefined);

        observable.subscribe({ complete: null });
        test._("If property is null, then complete returns undefined")
        .equals(observer.complete(), undefined);

        observable.subscribe({ complete: {} });
        test._("If property is not a function, then an error is thrown")
        .throws(function(_) { return observer.complete(); }, TypeError);

        var actual = {};
        observable.subscribe(actual);
        actual.complete = (function(_) { return 1; });
        test._("Method is not accessed until complete is called")
        .equals(observer.complete(), 1);

        var called = 0;
        observable.subscribe({
            get complete() {
                called++;
                return function() {};
            },
            error: function() {},
        });
        observer.error(new Error());
        observer.complete();
        test._("Method is not accessed when subscription is closed")
        .equals(called, 0);

        called = 0;
        observable.subscribe({
            get complete() {
                called++;
                return function() {};
            }
        });
        observer.complete();
        test._("Property is only accessed once during a lookup")
        .equals(called, 1);

        called = 0;
        observable.subscribe({
            next: function() { called++ },
            get complete() {
                called++;
                observer.next();
                return function() { return 1 };
            }
        });
        observer.complete();
        test._("When method lookup occurs, subscription is closed")
        .equals(called, 1);

    },

    "Cleanup functions": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var called, observer;

        var observable = new Observable(function(x) {
            observer = x;
            return function(_) { called++ };
        });

        called = 0;
        observable.subscribe({});
        observer.complete();
        test._("Cleanup function is called when observer does not have a complete method")
        .equals(called, 1);

        called = 0;
        observable.subscribe({ complete: function() { return 1 } });
        observer.complete();
        test._("Cleanup function is called when observer has a complete method")
        .equals(called, 1);

        called = 0;
        observable.subscribe({ get complete() { throw new Error() } });
        try { observer.complete() }
        catch (x) {}
        test._("Cleanup function is called when method lookup throws")
        .equals(called, 1);

        called = 0;
        observable.subscribe({ complete: function() { throw new Error() } });
        try { observer.complete() }
        catch (x) {}
        test._("Cleanup function is called when method throws")
        .equals(called, 1);

        var error = new Error(), caught = null;

        new Observable(function(x) {
            observer = x;
            return function(_) { throw new Error() };
        }).subscribe({ complete: function() { throw error } });

        try { observer.complete() }
        catch (x) { caught = x }

        test._("If both complete and the cleanup function throw, then the error " +
            "from the complete method is thrown")
        .assert(caught === error);

    },

};


}).call(this, _M14);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "SubscriptionObserver.prototype has a cancel method": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer;
        new Observable(function(x) { observer = x }).subscribe({});

        testMethodProperty(test, Object.getPrototypeOf(observer), "cancel", {
            configurable: true,
            writable: true,
            length: 0
        });
    },

    "Return value": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        new Observable(function(observer) {

            test._("Cancel returns undefined").equals(observer.cancel(), undefined);

        }).subscribe({});
    },

    "Cleanup functions": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer, called = 0;

        var observable = new Observable(function(x) {
            observer = x;
            return function(_) { called++ };
        });

        observable.subscribe({});
        observer.cancel();

        test._("Cleanup function is called by cancel")
        .equals(called, 1);

        observer.cancel();

        test._("Cleanup function is not called if cancel is called again")
        .equals(called, 1);

        called = 0;
        observable.subscribe({});
        observer.complete();
        observer.cancel();

        test._("Cleanup function is not called if cancel is called after complete")
        .equals(called, 1);

        called = 0;
        observable.subscribe({ error: function() {} });
        observer.error();
        observer.cancel();

        test._("Cleanup function is not called if cancel is called after error")
        .equals(called, 1);

        called = 0;
        new Observable(function(x) {
            observer = x;
            return function(_) { called++; observer.cancel(); };
        }).subscribe({});

        observer.cancel();

        test._("Cleanup function is not called again if cancel is called during cleanup")
        .equals(called, 1);
    },

    "Stream is closed after calling cancel": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer, called = 0;

        new Observable(function(x) { observer = x }).subscribe({
            next: function() { called++ },
            error: function() { called++ },
            complete: function() { called++ },
        });

        observer.cancel();

        observer.next();
        test._("Next does not forward after cancel").equals(called, 0);

        test
        ._("Error throws after cancel")
        .throws(function(_) { return observer.error(new Error()); });

        observer.complete();
        test._("Complete does not forward after cancel").equals(called, 0);

        test._("Closed property is true after cancel").equals(observer.closed, true);
    },

};


}).call(this, _M15);

(function(exports) {

var testMethodProperty = _M18.testMethodProperty;

exports["default"] = {

    "SubscriptionObserver.prototype has a closed property": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer;
        new Observable(function(x) { observer = x }).subscribe({});

        testMethodProperty(test, Object.getPrototypeOf(observer), "closed", {
            get: true,
            configurable: true,
        });
    },

    "Closed property is false when subscription is active": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var observer;
        new Observable(function(x) {

            observer = x;

            test._("Closed is false during subscription")
            .equals(observer.closed, false);

            observer.next();

            test._("Closed is false after sending next")
            .equals(observer.closed, false);

        }).subscribe({});

        test._("Closed is false after subscription")
        .equals(observer.closed, false);
    },

    "Closed property is true when subscription is closed": function(test, __$0) { var __$1; var Observable = (__$1 = _esdown.objd(__$0), __$1.Observable); 

        var sink = { error: function() {} };

        new Observable(function(observer) {

            observer.complete();
            test._("Closed is true after calling complete")
            .equals(observer.closed, true);

        }).subscribe(sink);

        new Observable(function(observer) {

            observer.error(null);
            test._("Closed is true after calling error")
            .equals(observer.closed, true);

        }).subscribe(sink);
    },

};


}).call(this, _M16);

(function(exports) {

var TestRunner = _M2.TestRunner;

var constructor = _M3['default'];
var subscribe = _M4['default'];
var forEach = _M5['default'];
var map = _M6['default'];
var filter = _M7['default'];
var observable = _M8['default'];
var species = _M9['default'];
var ofTests = _M10['default'];
var fromTests = _M11['default'];

var observerNext = _M12['default'];
var observerError = _M13['default'];
var observerComplete = _M14['default'];
var observerCancel = _M15['default'];
var observerClosed = _M16['default'];

function runTests(C) {

    return new TestRunner().inject({ Observable: C }).run({

        "Observable constructor": constructor,

        "Observable.prototype.subscribe": subscribe,
        "Observable.prototype.forEach": forEach,
        "Observable.prototype.filter": filter,
        "Observable.prototype.map": map,
        "Observable.prototype[Symbol.observable]": observable,

        "Observable.of": ofTests,
        "Observable.from": fromTests,
        "Observable[Symbol.species]": species,

        "SubscriptionObserver.prototype.next": observerNext,
        "SubscriptionObserver.prototype.error": observerError,
        "SubscriptionObserver.prototype.complete": observerComplete,
        "SubscriptionObserver.prototype.cancel": observerCancel,
        "SubscriptionObserver.prototype.closed": observerClosed,

    });
}

exports.runTests = runTests;


}).call(this, _M1);


}, [], "ObservableTests");