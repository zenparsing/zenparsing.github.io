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


_esdown.global._esdown = _esdown;

(function() {

// === Polyfill Utilities ===

function eachKey(obj, fn) {

    var keys = Object.getOwnPropertyNames(obj);

    for (var i$4 = 0; i$4 < keys.length; ++i$4)
        fn(keys[i$4]);

    if (!Object.getOwnPropertySymbols)
        return;

    keys = Object.getOwnPropertySymbols(obj);

    for (var i$5 = 0; i$5 < keys.length; ++i$5)
        fn(keys[i$5]);
}

function polyfill(obj, methods) {

    eachKey(methods, function(key) {

        if (key in obj)
            return;

        Object.defineProperty(obj, key, {

            value: methods[key],
            configurable: true,
            enumerable: false,
            writable: true
        });

    });
}


// === Spec Helpers ===

var sign = Math.sign || function(val) {

    var n = +val;

    if (n === 0 || Number.isNaN(n))
        return n;

    return n < 0 ? -1 : 1;
};

function toInteger(val) {

    var n = +val;

    return n !== n /* n is NaN */ ? 0 :
        (n === 0 || !isFinite(n)) ? n :
        sign(n) * Math.floor(Math.abs(n));
}

function toLength(val) {

    var n = toInteger(val);
    return n < 0 ? 0 : Math.min(n, Number.MAX_SAFE_INTEGER);
}

function sameValue(left, right) {

    if (left === right)
        return left !== 0 || 1 / left === 1 / right;

    return left !== left && right !== right;
}

function isRegExp(val) {

    return Object.prototype.toString.call(val) == "[object RegExp]";
}

function toObject(val) {

    if (val == null)
        throw new TypeError(val + " is not an object");

    return Object(val);
}

function assertThis(val, name) {

    if (val == null)
        throw new TypeError(name + " called on null or undefined");
}

// === Symbols ===

var symbolCounter = 0,
    global = _esdown.global;

function fakeSymbol() {

    return "__$" + Math.floor(Math.random() * 1e9) + "$" + (++symbolCounter) + "$__";
}

if (!global.Symbol)
    global.Symbol = fakeSymbol;

polyfill(Symbol, {

    iterator: Symbol("iterator"),

    species: Symbol("species"),

    // Experimental async iterator support
    asyncIterator: Symbol("asyncIterator"),

});

// === Object ===

polyfill(Object, {

    is: sameValue,

    assign: function(target, source) {

        target = toObject(target);

        for (var i$6 = 1; i$6 < arguments.length; ++i$6) {

            source = arguments[i$6];

            if (source != null) // null or undefined
                Object.keys(source).forEach(function(key) { return target[key] = source[key]; });
        }

        return target;
    },

    setPrototypeOf: function(object, proto) {

        // Least effort attempt
        object.__proto__ = proto;
    },

    getOwnPropertySymbols: function() {

        return [];
    }

});

// === Number ===

function isInteger(val) {

    return typeof val === "number" && isFinite(val) && toInteger(val) === val;
}

function epsilon() {

    // Calculate the difference between 1 and the smallest value greater than 1 that
    // is representable as a Number value

    var result;

    for (var next$0 = 1; 1 + next$0 !== 1; next$0 = next$0 / 2)
        result = next$0;

    return result;
}

polyfill(Number, {

    EPSILON: epsilon(),
    MAX_SAFE_INTEGER: 9007199254740991,
    MIN_SAFE_INTEGER: -9007199254740991,

    parseInt: parseInt,
    parseFloat: parseFloat,
    isInteger: isInteger,
    isFinite: function(val) { return typeof val === "number" && isFinite(val) },
    isNaN: function(val) { return val !== val },
    isSafeInteger: function(val) { return isInteger(val) && Math.abs(val) <= Number.MAX_SAFE_INTEGER }

});

// === String ===

polyfill(String, {

    raw: function(callsite) { for (var args = [], __$0 = 1; __$0 < arguments.length; ++__$0) args.push(arguments[__$0]); 

        var raw = callsite.raw,
            len = toLength(raw.length);

        if (len === 0)
            return "";

        var s = "", i = 0;

        while (true) {

            s += raw[i];
            if (i + 1 === len || i >= args.length) break;
            s += args[i++];
        }

        return s;
    },

    fromCodePoint: function() { for (var points = [], __$0 = 0; __$0 < arguments.length; ++__$0) points.push(arguments[__$0]); 

        var out = [];

        points.forEach(function(next) {

            next = Number(next);

            if (!sameValue(next, toInteger(next)) || next < 0 || next > 0x10ffff)
                throw new RangeError("Invalid code point " + next);

            if (next < 0x10000) {

                out.push(String.fromCharCode(next));

            } else {

                next -= 0x10000;
                out.push(String.fromCharCode((next >> 10) + 0xD800));
                out.push(String.fromCharCode((next % 0x400) + 0xDC00));
            }
        });

        return out.join("");
    }

});

// Repeat a string by "squaring"
function repeat(s, n) {

    if (n < 1) return "";
    if (n % 2) return repeat(s, n - 1) + s;
    var half = repeat(s, n / 2);
    return half + half;
}

var StringIterator = _esdown.class(function(__) { var StringIterator;

    __({ constructor: StringIterator = function(string) {

        this.string = string;
        this.current = 0;
    },

    next: function() {

        var s = this.string,
            i = this.current,
            len = s.length;

        if (i >= len) {

            this.current = Infinity;
            return { value: void 0, done: true };
        }

        var c = s.charCodeAt(i),
            chars = 1;

        if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) {

            c = s.charCodeAt(i + 1);
            chars = (c < 0xDC00 || c > 0xDFFF) ? 1 : 2;
        }

        this.current += chars;

        return { value: s.slice(i, this.current), done: false };
    }});

    __(_esdown.computed({}, Symbol.iterator, { _: function() { return this } }));

 });

polyfill(String.prototype, _esdown.computed({

    repeat: function(count) {

        assertThis(this, "String.prototype.repeat");

        var string = String(this);

        count = toInteger(count);

        if (count < 0 || count === Infinity)
            throw new RangeError("Invalid count value");

        return repeat(string, count);
    },

    startsWith: function(search) {

        assertThis(this, "String.prototype.startsWith");

        if (isRegExp(search))
            throw new TypeError("First argument to String.prototype.startsWith must not be a regular expression");

        var string = String(this);

        search = String(search);

        var pos = arguments.length > 1 ? arguments[1] : undefined,
            start = Math.max(toInteger(pos), 0);

        return string.slice(start, start + search.length) === search;
    },

    endsWith: function(search) {

        assertThis(this, "String.prototype.endsWith");

        if (isRegExp(search))
            throw new TypeError("First argument to String.prototype.endsWith must not be a regular expression");

        var string = String(this);

        search = String(search);

        var len = string.length,
            arg = arguments.length > 1 ? arguments[1] : undefined,
            pos = arg === undefined ? len : toInteger(arg),
            end = Math.min(Math.max(pos, 0), len);

        return string.slice(end - search.length, end) === search;
    },

    contains: function(search) {

        assertThis(this, "String.prototype.contains");

        var string = String(this),
            pos = arguments.length > 1 ? arguments[1] : undefined;

        // Somehow this trick makes method 100% compat with the spec
        return string.indexOf(search, pos) !== -1;
    },

    codePointAt: function(pos) {

        assertThis(this, "String.prototype.codePointAt");

        var string = String(this),
            len = string.length;

        pos = toInteger(pos);

        if (pos < 0 || pos >= len)
            return undefined;

        var a = string.charCodeAt(pos);

        if (a < 0xD800 || a > 0xDBFF || pos + 1 === len)
            return a;

        var b = string.charCodeAt(pos + 1);

        if (b < 0xDC00 || b > 0xDFFF)
            return a;

        return ((a - 0xD800) * 1024) + (b - 0xDC00) + 0x10000;
    },

    }, Symbol.iterator, { _: function() {

        assertThis(this, "String.prototype[Symbol.iterator]");
        return new StringIterator(this);
    }

}));

// === Array ===

var ArrayIterator = _esdown.class(function(__) { var ArrayIterator;

    __({ constructor: ArrayIterator = function(array, kind) {

        this.array = array;
        this.current = 0;
        this.kind = kind;
    },

    next: function() {

        var length = toLength(this.array.length),
            index = this.current;

        if (index >= length) {

            this.current = Infinity;
            return { value: void 0, done: true };
        }

        this.current += 1;

        switch (this.kind) {

            case "values":
                return { value: this.array[index], done: false };

            case "entries":
                return { value: [ index, this.array[index] ], done: false };

            default:
                return { value: index, done: false };
        }
    }});

    __(_esdown.computed({}, Symbol.iterator, { _: function() { return this } }));

 });

polyfill(Array, {

    from: function(list) {

        list = toObject(list);

        var ctor = typeof this === "function" ? this : Array, // TODO: Always use "this"?
            map = arguments[1],
            thisArg = arguments[2],
            i = 0,
            out;

        if (map !== void 0 && typeof map !== "function")
            throw new TypeError(map + " is not a function");

        var getIter = list[Symbol.iterator];

        if (getIter) {

            var iter$0 = getIter.call(list),
                result$2;

            out = new ctor;

            while (result$2 = iter$0.next(), !result$2.done) {

                out[i++] = map ? map.call(thisArg, result$2.value, i) : result$2.value;
                out.length = i;
            }

        } else {

            var len$0 = toLength(list.length);

            out = new ctor(len$0);

            for (; i < len$0; ++i)
                out[i] = map ? map.call(thisArg, list[i], i) : list[i];

            out.length = len$0;
        }

        return out;
    },

    of: function() { for (var items = [], __$0 = 0; __$0 < arguments.length; ++__$0) items.push(arguments[__$0]); 

        var ctor = typeof this === "function" ? this : Array;

        if (ctor === Array)
            return items;

        var len = items.length,
            out = new ctor(len);

        for (var i$7 = 0; i$7 < len; ++i$7)
            out[i$7] = items[i$7];

        out.length = len;

        return out;
    }

});

function arrayFind(obj, pred, thisArg, type) {

    var len = toLength(obj.length),
        val;

    if (typeof pred !== "function")
        throw new TypeError(pred + " is not a function");

    for (var i$8 = 0; i$8 < len; ++i$8) {

        val = obj[i$8];

        if (pred.call(thisArg, val, i$8, obj))
            return type === "value" ? val : i$8;
    }

    return type === "value" ? void 0 : -1;
}

polyfill(Array.prototype, _esdown.computed({

    copyWithin: function(target, start) {

        var obj = toObject(this),
            len = toLength(obj.length),
            end = arguments[2];

        target = toInteger(target);
        start = toInteger(start);

        var to = target < 0 ? Math.max(len + target, 0) : Math.min(target, len),
            from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);

        end = end !== void 0 ? toInteger(end) : len;
        end = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);

        var count = Math.min(end - from, len - to),
            dir = 1;

        if (from < to && to < from + count) {

            dir = -1;
            from += count - 1;
            to += count - 1;
        }

        for (; count > 0; --count) {

            if (from in obj) obj[to] = obj[from];
            else delete obj[to];

            from += dir;
            to += dir;
        }

        return obj;
    },

    fill: function(value) {

        var obj = toObject(this),
            len = toLength(obj.length),
            start = toInteger(arguments[1]),
            pos = start < 0 ? Math.max(len + start, 0) : Math.min(start, len),
            end = arguments.length > 2 ? toInteger(arguments[2]) : len;

        end = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);

        for (; pos < end; ++pos)
            obj[pos] = value;

        return obj;
    },

    find: function(pred) {

        return arrayFind(toObject(this), pred, arguments[1], "value");
    },

    findIndex: function(pred) {

        return arrayFind(toObject(this), pred, arguments[1], "index");
    },

    values: function() { return new ArrayIterator(this, "values") },

    entries: function() { return new ArrayIterator(this, "entries") },

    keys: function() { return new ArrayIterator(this, "keys") },

    }, Symbol.iterator, { _: function() { return this.values() }

}));


}).call(this);

(function() {

var global = _esdown.global,
    ORIGIN = {},
    REMOVED = {};

var MapNode = _esdown.class(function(__) { var MapNode;

    __({ constructor: MapNode = function(key, val) {

        this.key = key;
        this.value = val;
        this.prev = this;
        this.next = this;
    },

    insert: function(next) {

        this.next = next;
        this.prev = next.prev;
        this.prev.next = this;
        this.next.prev = this;
    },

    remove: function() {

        this.prev.next = this.next;
        this.next.prev = this.prev;
        this.key = REMOVED;
    }});

 });

var MapIterator = _esdown.class(function(__) { var MapIterator;

    __({ constructor: MapIterator = function(node, kind) {

        this.current = node;
        this.kind = kind;
    },

    next: function() {

        var node = this.current;

        while (node.key === REMOVED)
            node = this.current = this.current.next;

        if (node.key === ORIGIN)
            return { value: void 0, done: true };

        this.current = this.current.next;

        switch (this.kind) {

            case "values":
                return { value: node.value, done: false };

            case "entries":
                return { value: [ node.key, node.value ], done: false };

            default:
                return { value: node.key, done: false };
        }
    }});

    __(_esdown.computed({}, Symbol.iterator, { _: function() { return this } }));
 });

function hashKey(key) {

    switch (typeof key) {

        case "string": return "$" + key;
        case "number": return String(key);
    }

    throw new TypeError("Map and Set keys must be strings or numbers in esdown");
}

var Map = _esdown.class(function(__) { var Map;

    __({ constructor: Map = function() {

        if (arguments.length > 0)
            throw new Error("Arguments to Map constructor are not supported in esdown");

        this._index = {};
        this._origin = new MapNode(ORIGIN);
    },

    clear: function() {

        for (var node$0 = this._origin.next; node$0 !== this._origin; node$0 = node$0.next)
            node$0.key = REMOVED;

        this._index = {};
        this._origin = new MapNode(ORIGIN);
    },

    delete: function(key) {

        var h = hashKey(key),
            node = this._index[h];

        if (node) {

            node.remove();
            delete this._index[h];
            return true;
        }

        return false;
    },

    forEach: function(fn) {

        var thisArg = arguments[1];

        if (typeof fn !== "function")
            throw new TypeError(fn + " is not a function");

        for (var node$1 = this._origin.next; node$1.key !== ORIGIN; node$1 = node$1.next)
            if (node$1.key !== REMOVED)
                fn.call(thisArg, node$1.value, node$1.key, this);
    },

    get: function(key) {

        var h = hashKey(key),
            node = this._index[h];

        return node ? node.value : void 0;
    },

    has: function(key) {

        return hashKey(key) in this._index;
    },

    set: function(key, val) {

        var h = hashKey(key),
            node = this._index[h];

        if (node) {

            node.value = val;
            return;
        }

        node = new MapNode(key, val);

        this._index[h] = node;
        node.insert(this._origin);
    },

    get size() {

        return Object.keys(this._index).length;
    },

    keys: function() { return new MapIterator(this._origin.next, "keys") },
    values: function() { return new MapIterator(this._origin.next, "values") },
    entries: function() { return new MapIterator(this._origin.next, "entries") }});

    __(_esdown.computed({}, Symbol.iterator, { _: function() { return new MapIterator(this._origin.next, "entries") } }));

 });

var mapSet = Map.prototype.set;

var Set = _esdown.class(function(__) { var Set;

    __({ constructor: Set = function() {

        if (arguments.length > 0)
            throw new Error("Arguments to Set constructor are not supported in esdown");

        this._index = {};
        this._origin = new MapNode(ORIGIN);
    },

    add: function(key) { return mapSet.call(this, key, key) }});

    __(_esdown.computed({}, Symbol.iterator, { _: function() { return new MapIterator(this._origin.next, "entries") } }));

 });

// Copy shared prototype members to Set
["clear", "delete", "forEach", "has", "size", "keys", "values", "entries"].forEach(function(k) {

    var d = Object.getOwnPropertyDescriptor(Map.prototype, k);
    Object.defineProperty(Set.prototype, k, d);
});

if (!global.Map || !global.Map.prototype.entries) {

    global.Map = Map;
    global.Set = Set;
}


}).call(this);

(function() {

(function() { "use strict";

// Find global variable and exit if Promise is defined on it

var Global = (function() {
    try { return self.self } catch (x) {}
    try { return global.global } catch (x) {}
    return null;
})();

if (!Global || typeof Global.Promise === "function")
    return;

// Create an efficient microtask queueing mechanism

var runLater = (function() {
    // Node
    if (Global.process && typeof process.version === "string") {
        return Global.setImmediate ?
            function(fn) { setImmediate(fn); } :
            function(fn) { process.nextTick(fn); };
    }

    // Newish Browsers
    var Observer = Global.MutationObserver || Global.WebKitMutationObserver;

    if (Observer) {
        var div = document.createElement("div"),
            queuedFn = void 0;

        var observer = new Observer(function() {
            var fn = queuedFn;
            queuedFn = void 0;
            fn();
        });

        observer.observe(div, { attributes: true });

        return function(fn) {
            if (queuedFn !== void 0)
                throw new Error("Only one function can be queued at a time");
            queuedFn = fn;
            div.classList.toggle("x");
        };
    }

    // Fallback
    return function(fn) { setTimeout(fn, 0); };
})();

var EnqueueMicrotask = (function() {
    var queue = null;

    function flush() {
        var q = queue;
        queue = null;
        for (var i = 0; i < q.length; ++i)
            q[i]();
    }

    return function PromiseEnqueueMicrotask(fn) {
        // fn must not throw
        if (!queue) {
            queue = [];
            runLater(flush);
        }
        queue.push(fn);
    };
})();

// Mock V8 internal functions and vars

function SET_PRIVATE(obj, prop, val) { obj[prop] = val; }
function GET_PRIVATE(obj, prop) { return obj[prop]; }
function IS_SPEC_FUNCTION(obj) { return typeof obj === "function"; }
function IS_SPEC_OBJECT(obj) { return obj === Object(obj); }
function HAS_DEFINED_PRIVATE(obj, prop) { return prop in obj; }
function IS_UNDEFINED(x) { return x === void 0; }
function MakeTypeError(msg) { return new TypeError(msg); }

// In IE8 Object.defineProperty only works on DOM nodes, and defineProperties does not exist
var _defineProperty = Object.defineProperties && Object.defineProperty;

function AddNamedProperty(target, name, value) {
    if (!_defineProperty) {
        target[name] = value;
        return;
    }

    _defineProperty(target, name, {
        configurable: true,
        writable: true,
        enumerable: false,
        value: value
    });
}

function InstallFunctions(target, attr, list) {
    for (var i = 0; i < list.length; i += 2)
        AddNamedProperty(target, list[i], list[i + 1]);
}

var IsArray = Array.isArray || (function(obj) {
    var str = Object.prototype.toString;
    return function(obj) { return str.call(obj) === "[object Array]" };
})();

var UNDEFINED, DONT_ENUM, InternalArray = Array;

// V8 Implementation

var IsPromise;
var PromiseCreate;
var PromiseResolve;
var PromiseReject;
var PromiseChain;
var PromiseCatch;
var PromiseThen;

// Status values: 0 = pending, +1 = resolved, -1 = rejected
var promiseStatus = "Promise#status";
var promiseValue = "Promise#value";
var promiseOnResolve = "Promise#onResolve";
var promiseOnReject = "Promise#onReject";
var promiseRaw = {};
var promiseHasHandler = "Promise#hasHandler";
var lastMicrotaskId = 0;

var $Promise = function Promise(resolver) {
    if (resolver === promiseRaw) return;
    if (!IS_SPEC_FUNCTION(resolver))
      throw MakeTypeError('resolver_not_a_function', [resolver]);
    var promise = PromiseInit(this);
    try {
        resolver(function(x) { PromiseResolve(promise, x) },
                 function(r) { PromiseReject(promise, r) });
    } catch (e) {
        PromiseReject(promise, e);
    }
}

// Core functionality.

function PromiseSet(promise, status, value, onResolve, onReject) {
    SET_PRIVATE(promise, promiseStatus, status);
    SET_PRIVATE(promise, promiseValue, value);
    SET_PRIVATE(promise, promiseOnResolve, onResolve);
    SET_PRIVATE(promise, promiseOnReject, onReject);
    return promise;
}

function PromiseInit(promise) {
    return PromiseSet(promise, 0, UNDEFINED, new InternalArray, new InternalArray);
}

function PromiseDone(promise, status, value, promiseQueue) {
    if (GET_PRIVATE(promise, promiseStatus) === 0) {
        PromiseEnqueue(value, GET_PRIVATE(promise, promiseQueue), status);
        PromiseSet(promise, status, value);
    }
}

function PromiseCoerce(constructor, x) {
    if (!IsPromise(x) && IS_SPEC_OBJECT(x)) {
        var then;
        try {
            then = x.then;
        } catch(r) {
            return PromiseRejected.call(constructor, r);
        }
        if (IS_SPEC_FUNCTION(then)) {
            var deferred = PromiseDeferred.call(constructor);
            try {
                then.call(x, deferred.resolve, deferred.reject);
            } catch(r) {
                deferred.reject(r);
            }
            return deferred.promise;
        }
    }
    return x;
}

function PromiseHandle(value, handler, deferred) {
    try {
        var result = handler(value);
        if (result === deferred.promise)
            throw MakeTypeError('promise_cyclic', [result]);
        else if (IsPromise(result))
            PromiseChain.call(result, deferred.resolve, deferred.reject);
        else
            deferred.resolve(result);
    } catch (exception) {
        try { deferred.reject(exception) } catch (e) { }
    }
}

function PromiseEnqueue(value, tasks, status) {
    EnqueueMicrotask(function() {
        for (var i = 0; i < tasks.length; i += 2)
            PromiseHandle(value, tasks[i], tasks[i + 1]);
    });
}

function PromiseIdResolveHandler(x) { return x }
function PromiseIdRejectHandler(r) { throw r }

function PromiseNopResolver() {}

// -------------------------------------------------------------------
// Define exported functions.

// For bootstrapper.

IsPromise = function IsPromise(x) {
    return IS_SPEC_OBJECT(x) && HAS_DEFINED_PRIVATE(x, promiseStatus);
};

PromiseCreate = function PromiseCreate() {
    return new $Promise(PromiseNopResolver);
};

PromiseResolve = function PromiseResolve(promise, x) {
    PromiseDone(promise, +1, x, promiseOnResolve);
};

PromiseReject = function PromiseReject(promise, r) {
    PromiseDone(promise, -1, r, promiseOnReject);
};

// Convenience.

function PromiseDeferred() {
    if (this === $Promise) {
        // Optimized case, avoid extra closure.
        var promise = PromiseInit(new $Promise(promiseRaw));
        return {
            promise: promise,
            resolve: function(x) { PromiseResolve(promise, x) },
            reject: function(r) { PromiseReject(promise, r) }
        };
    } else {
        var result = {};
        result.promise = new this(function(resolve, reject) {
            result.resolve = resolve;
            result.reject = reject;
        });
        return result;
    }
}

function PromiseResolved(x) {
    if (this === $Promise) {
        // Optimized case, avoid extra closure.
        return PromiseSet(new $Promise(promiseRaw), +1, x);
    } else {
        return new this(function(resolve, reject) { resolve(x) });
    }
}

function PromiseRejected(r) {
    var promise;
    if (this === $Promise) {
        // Optimized case, avoid extra closure.
        promise = PromiseSet(new $Promise(promiseRaw), -1, r);
    } else {
        promise = new this(function(resolve, reject) { reject(r) });
    }
    return promise;
}

// Simple chaining.

PromiseChain = function PromiseChain(onResolve, onReject) {
    onResolve = IS_UNDEFINED(onResolve) ? PromiseIdResolveHandler : onResolve;
    onReject = IS_UNDEFINED(onReject) ? PromiseIdRejectHandler : onReject;
    var deferred = PromiseDeferred.call(this.constructor);
    switch (GET_PRIVATE(this, promiseStatus)) {
        case UNDEFINED:
            throw MakeTypeError('not_a_promise', [this]);
        case 0:  // Pending
            GET_PRIVATE(this, promiseOnResolve).push(onResolve, deferred);
            GET_PRIVATE(this, promiseOnReject).push(onReject, deferred);
            break;
        case +1:  // Resolved
            PromiseEnqueue(GET_PRIVATE(this, promiseValue), [onResolve, deferred], +1);
            break;
        case -1:  // Rejected
            PromiseEnqueue(GET_PRIVATE(this, promiseValue), [onReject, deferred], -1);
            break;
    }
    // Mark this promise as having handler.
    SET_PRIVATE(this, promiseHasHandler, true);
    return deferred.promise;
}

PromiseCatch = function PromiseCatch(onReject) {
    return this.then(UNDEFINED, onReject);
}

// Multi-unwrapped chaining with thenable coercion.

PromiseThen = function PromiseThen(onResolve, onReject) {
    onResolve = IS_SPEC_FUNCTION(onResolve) ? onResolve : PromiseIdResolveHandler;
    onReject = IS_SPEC_FUNCTION(onReject) ? onReject : PromiseIdRejectHandler;
    var that = this;
    var constructor = this.constructor;
    return PromiseChain.call(
        this,
        function(x) {
            x = PromiseCoerce(constructor, x);
            return x === that ? onReject(MakeTypeError('promise_cyclic', [x])) :
                IsPromise(x) ? x.then(onResolve, onReject) :
                onResolve(x);
        },
        onReject);
}

// Combinators.

function PromiseCast(x) {
    return IsPromise(x) ? x : new this(function(resolve) { resolve(x) });
}

function PromiseAll(values) {
    var deferred = PromiseDeferred.call(this);
    var resolutions = [];
    if (!IsArray(values)) {
        deferred.reject(MakeTypeError('invalid_argument'));
        return deferred.promise;
    }
    try {
        var count = values.length;
        if (count === 0) {
            deferred.resolve(resolutions);
        } else {
            for (var i = 0; i < values.length; ++i) {
                this.resolve(values[i]).then(
                    (function() {
                        // Nested scope to get closure over current i (and avoid .bind).
                        var i_captured = i;
                        return function(x) {
                            resolutions[i_captured] = x;
                            if (--count === 0) deferred.resolve(resolutions);
                        };
                    })(),
                    function(r) { deferred.reject(r) });
            }
        }
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
}

function PromiseOne(values) {
    var deferred = PromiseDeferred.call(this);
    if (!IsArray(values)) {
        deferred.reject(MakeTypeError('invalid_argument'));
        return deferred.promise;
    }
    try {
        for (var i = 0; i < values.length; ++i) {
            this.resolve(values[i]).then(
                function(x) { deferred.resolve(x) },
                function(r) { deferred.reject(r) });
        }
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
}

// -------------------------------------------------------------------
// Install exported functions.

AddNamedProperty(Global, 'Promise', $Promise, DONT_ENUM);

InstallFunctions($Promise, DONT_ENUM, [
    "defer", PromiseDeferred,
    "accept", PromiseResolved,
    "reject", PromiseRejected,
    "all", PromiseAll,
    "race", PromiseOne,
    "resolve", PromiseCast
]);

InstallFunctions($Promise.prototype, DONT_ENUM, [
    "chain", PromiseChain,
    "then", PromiseThen,
    "catch", PromiseCatch
]);

})();


}).call(this);




}, [], "");