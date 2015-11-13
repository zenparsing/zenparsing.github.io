/*=esdown=*/(function(fn, name) { if (typeof exports !== 'undefined') fn(require, exports, module); else if (typeof self !== 'undefined') fn(function() { return {} }, name === '*' ? self : (name ? self[name] = {} : {})); })(function(require, exports, module) { 'use strict'; var _esdown = {}; (function() { var exports = _esdown;

var VERSION = "1.0.2";

var GLOBAL = (function() {

    try { return global.global } catch (x) {}
    try { return self.self } catch (x) {}
    return null;
})();

var ownNames = Object.getOwnPropertyNames,
      ownSymbols = Object.getOwnPropertySymbols,
      getDesc = Object.getOwnPropertyDescriptor,
      defineProp = Object.defineProperty;

function toObject(val) {

    if (val == null) // null or undefined
        throw new TypeError(val + " is not an object");

    return Object(val);
}

// Iterates over the descriptors for each own property of an object
function forEachDesc(obj, fn) {

    ownNames(obj).forEach(function(name) { return fn(name, getDesc(obj, name)); });
    if (ownSymbols) ownSymbols(obj).forEach(function(name) { return fn(name, getDesc(obj, name)); });
}

// Installs a property into an object, merging "get" and "set" functions
function mergeProp(target, name, desc, enumerable) {

    if (desc.get || desc.set) {

        var d$0 = { configurable: true };
        if (desc.get) d$0.get = desc.get;
        if (desc.set) d$0.set = desc.set;
        desc = d$0;
    }

    desc.enumerable = enumerable;
    defineProp(target, name, desc);
}

// Installs properties on an object, merging "get" and "set" functions
function mergeProps(target, source, enumerable) {

    forEachDesc(source, function(name, desc) { return mergeProp(target, name, desc, enumerable); });
}

// Builds a class
function makeClass(def) {

    var parent = Object.prototype,
        proto = Object.create(parent),
        statics = {};

    def(function(obj) { return mergeProps(proto, obj, false); },
        function(obj) { return mergeProps(statics, obj, false); });

    var ctor = proto.constructor;
    ctor.prototype = proto;

    // Set class "static" methods
    forEachDesc(statics, function(name, desc) { return defineProp(ctor, name, desc); });

    return ctor;
}

// Support for computed property names
function computed(target) {

    for (var i$0 = 1; i$0 < arguments.length; i$0 += 3) {

        var desc$0 = getDesc(arguments[i$0 + 1], "_");
        mergeProp(target, arguments[i$0], desc$0, true);

        if (i$0 + 2 < arguments.length)
            mergeProps(target, arguments[i$0 + 2], true);
    }

    return target;
}

// Support for async functions
function asyncFunction(iter) {

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
}

// Support for async generators
function asyncGenerator(iter) {

    var front = null, back = null;

    var aIter = {

        next: function(val) { return send("next", val) },
        throw: function(val) { return send("throw", val) },
        return: function(val) { return send("return", val) },
    };

    aIter[Symbol.asyncIterator] = function() { return this };
    return aIter;

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
}

// Support for spread operations
function spread(initial) {

    return {

        a: initial || [],

        // Add items
        s: function() {

            for (var i$1 = 0; i$1 < arguments.length; ++i$1)
                this.a.push(arguments[i$1]);

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
        },

    };
}

// Support for object destructuring
function objd(obj) {

    return toObject(obj);
}

// Support for array destructuring
function arrayd(obj) {

    if (Array.isArray(obj)) {

        return {

            at: function(skip, pos) { return obj[pos] },
            rest: function(skip, pos) { return obj.slice(pos) },
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
        },
    };
}









exports.makeClass = makeClass;
exports.computed = computed;
exports.asyncFunction = asyncFunction;
exports.asyncGenerator = asyncGenerator;
exports.spread = spread;
exports.objd = objd;
exports.arrayd = arrayd;
exports.class = makeClass;
exports.version = VERSION;
exports.global = GLOBAL;
exports.async = asyncFunction;
exports.asyncGen = asyncGenerator;


})();

(function() { var exports = {};

(function(fn, name) { if (typeof exports !== 'undefined') fn(require, exports, module); else if (typeof self !== 'undefined') fn(void 0, name === '*' ? self : (name ? self[name] = {} : {})); })(function(require, exports, module) { 'use strict'; var __M; (function(a) { var list = Array(a.length / 2); __M = function require(i) { var m = list[i], f, e; if (typeof m !== 'function') return m.exports; f = m; m = { exports: i ? {} : exports }; f(list[i] = m, e = m.exports); if (m.exports !== e && !('default' in m.exports)) m.exports['default'] = m.exports; return m.exports; }; for (var i = 0; i < a.length; i += 2) { var j = Math.abs(a[i]); list[j] = a[i + 1]; if (a[i] >= 0) __M(j); } })([
2, function(module, exports) {

var Global = (function() {

    try { return global.global } catch (x) {}
    try { return self.self } catch (x) {}
    return null;
})();



function transformKey(k) {

    if (k.slice(0, 2) === "@@")
        k = Symbol[k.slice(2)];

    return k;
}

function addProperties(target, methods) {

    Object.keys(methods).forEach(function(k) {

        var desc = Object.getOwnPropertyDescriptor(methods, k);
        desc.enumerable = false;

        k = transformKey(k);

        if (k in target)
            return;

        Object.defineProperty(target, k, desc);
    });
}

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

exports.global = Global;
exports.addProperties = addProperties;
exports.toInteger = toInteger;
exports.toLength = toLength;
exports.sameValue = sameValue;
exports.isRegExp = isRegExp;
exports.toObject = toObject;
exports.assertThis = assertThis;


},
3, function(module, exports) {

var addProperties = __M(2).addProperties;

var symbolCounter = 0;

function fakeSymbol() {

    return "__$" + Math.floor(Math.random() * 1e9) + "$" + (++symbolCounter) + "$__";
}

function polyfill(global) {

    if (!global.Symbol)
        global.Symbol = fakeSymbol;

    addProperties(Symbol, {

        iterator: Symbol("iterator"),

        species: Symbol("species"),

        // Experimental async iterator support
        asyncIterator: Symbol("asyncIterator"),

    });

}

exports.polyfill = polyfill;


},
4, function(module, exports) {

var addProperties = __M(2).addProperties, toObject = __M(2).toObject, toLength = __M(2).toLength, toInteger = __M(2).toInteger;

function arrayFind(obj, pred, thisArg, type) {

    var len = toLength(obj.length),
        val;

    if (typeof pred !== "function")
        throw new TypeError(pred + " is not a function");

    for (var i$0 = 0; i$0 < len; ++i$0) {

        val = obj[i$0];

        if (pred.call(thisArg, val, i$0, obj))
            return type === "value" ? val : i$0;
    }

    return type === "value" ? void 0 : -1;
}

function ArrayIterator(array, kind) {

    this.array = array;
    this.current = 0;
    this.kind = kind;
}

addProperties(ArrayIterator.prototype = {}, {

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
    },

    "@@iterator": function() { return this },
    
});

function polyfill() {

    addProperties(Array, {

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
                    result$0;

                out = new ctor;

                while (result$0 = iter$0.next(), !result$0.done) {

                    out[i++] = map ? map.call(thisArg, result$0.value, i) : result$0.value;
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

            for (var i$1 = 0; i$1 < len; ++i$1)
                out[i$1] = items[i$1];

            out.length = len;

            return out;
        }

    });

    addProperties(Array.prototype, {

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

        "@@iterator": function() { return this.values() },

    });

}

exports.polyfill = polyfill;


},
5, function(module, exports) {

var addProperties = __M(2).addProperties;

var ORIGIN = {}, REMOVED = {};

function MapNode(key, val) {

    this.key = key;
    this.value = val;
    this.prev = this;
    this.next = this;
}

addProperties(MapNode.prototype, {

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
    },

});

function MapIterator(node, kind) {

    this.current = node;
    this.kind = kind;
}

addProperties(MapIterator.prototype = {}, {

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
    },

    "@@iterator": function() { return this },

});

function hashKey(key) {

    switch (typeof key) {

        case "string": return "$" + key;
        case "number": return String(key);
    }

    throw new TypeError("Map and Set keys must be strings or numbers in esdown");
}

function Map() {

    if (arguments.length > 0)
        throw new Error("Arguments to Map constructor are not supported in esdown");

    this._index = {};
    this._origin = new MapNode(ORIGIN);
}

addProperties(Map.prototype, {

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
    entries: function() { return new MapIterator(this._origin.next, "entries") },

    "@@iterator": function() { return new MapIterator(this._origin.next, "entries") },

});

var mapSet = Map.prototype.set;

function Set() {

    if (arguments.length > 0)
        throw new Error("Arguments to Set constructor are not supported in esdown");

    this._index = {};
    this._origin = new MapNode(ORIGIN);
}

addProperties(Set.prototype, {

    add: function(key) { return mapSet.call(this, key, key) },
    "@@iterator": function() { return new MapIterator(this._origin.next, "entries") },

});

// Copy shared prototype members to Set
["clear", "delete", "forEach", "has", "size", "keys", "values", "entries"].forEach(function(k) {

    var d = Object.getOwnPropertyDescriptor(Map.prototype, k);
    Object.defineProperty(Set.prototype, k, d);
});

function polyfill(global) {

    if (!global.Map || !global.Map.prototype.entries) {

        global.Map = Map;
        global.Set = Set;
    }
}

exports.polyfill = polyfill;


},
6, function(module, exports) {

var toInteger = __M(2).toInteger, addProperties = __M(2).addProperties;

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

function polyfill() {

    addProperties(Number, {

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
}

exports.polyfill = polyfill;


},
7, function(module, exports) {

var addProperties = __M(2).addProperties, toObject = __M(2).toObject, sameValue = __M(2).sameValue;

function polyfill() {

    addProperties(Object, {

        is: sameValue,

        assign: function(target, source) {

            target = toObject(target);

            for (var i$0 = 1; i$0 < arguments.length; ++i$0) {

                source = arguments[i$0];

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
        },

    });

}

exports.polyfill = polyfill;


},
8, function(module, exports) {

var addProperties = __M(2).addProperties, global = __M(2).global;

var runLater = (function(_) {

    // Node
    if (global.process && typeof process.version === "string") {
        return global.setImmediate ?
            function(fn) { setImmediate(fn) } :
            function(fn) { process.nextTick(fn) };
    }

    // Newish Browsers
    var Observer = global.MutationObserver || global.WebKitMutationObserver;

    if (Observer) {

        var div$0 = document.createElement("div"),
            queuedFn$0 = null;

        var observer$0 = new Observer(function(_) {
            var fn = queuedFn$0;
            queuedFn$0 = null;
            fn();
        });

        observer$0.observe(div$0, { attributes: true });

        return function(fn) {

            if (queuedFn$0 !== null)
                throw new Error("Only one function can be queued at a time");

            queuedFn$0 = fn;
            div$0.classList.toggle("x");
        };
    }

    // Fallback
    return function(fn) { setTimeout(fn, 0) };

})();

var taskQueue = null;

function flushQueue() {

    var q = taskQueue;
    taskQueue = null;

    for (var i$0 = 0; i$0 < q.length; ++i$0)
        q[i$0]();
}

function enqueueMicrotask(fn) {

    // fn must not throw
    if (!taskQueue) {
        taskQueue = [];
        runLater(flushQueue);
    }

    taskQueue.push(fn);
}

var OPTIMIZED = {};
var PENDING = 0;
var RESOLVED = +1;
var REJECTED = -1;

function idResolveHandler(x) { return x }
function idRejectHandler(r) { throw r }
function noopResolver() { }

function Promise(resolver) { var __this = this; 

    this._status = PENDING;

    // Optimized case to avoid creating an uneccessary closure.  Creator assumes
    // responsibility for setting initial state.
    if (resolver === OPTIMIZED)
        return;

    if (typeof resolver !== "function")
        throw new TypeError("Resolver is not a function");

    this._onResolve = [];
    this._onReject = [];

    try { resolver(function(x) { resolvePromise(__this, x) }, function(r) { rejectPromise(__this, r) }) }
    catch (e) { rejectPromise(this, e) }
}

function chain(promise, onResolve, onReject) { if (onResolve === void 0) onResolve = idResolveHandler; if (onReject === void 0) onReject = idRejectHandler; 

    var deferred = makeDeferred(promise.constructor);

    switch (promise._status) {

        case PENDING:
            promise._onResolve.push(onResolve, deferred);
            promise._onReject.push(onReject, deferred);
            break;

        case RESOLVED:
            enqueueHandlers(promise._value, [onResolve, deferred], RESOLVED);
            break;

        case REJECTED:
            enqueueHandlers(promise._value, [onReject, deferred], REJECTED);
            break;
    }

    return deferred.promise;
}

function resolvePromise(promise, x) {

    completePromise(promise, RESOLVED, x, promise._onResolve);
}

function rejectPromise(promise, r) {

    completePromise(promise, REJECTED, r, promise._onReject);
}

function completePromise(promise, status, value, queue) {

    if (promise._status === PENDING) {

        promise._status = status;
        promise._value = value;

        enqueueHandlers(value, queue, status);
    }
}

function coerce(constructor, x) {

    if (!isPromise(x) && Object(x) === x) {

        var then$0;

        try { then$0 = x.then }
        catch(r) { return makeRejected(constructor, r) }

        if (typeof then$0 === "function") {

            var deferred$0 = makeDeferred(constructor);

            try { then$0.call(x, deferred$0.resolve, deferred$0.reject) }
            catch(r) { deferred$0.reject(r) }

            return deferred$0.promise;
        }
    }

    return x;
}

function enqueueHandlers(value, tasks, status) {

    enqueueMicrotask(function(_) {

        for (var i$1 = 0; i$1 < tasks.length; i$1 += 2)
            runHandler(value, tasks[i$1], tasks[i$1 + 1]);
    });
}

function runHandler(value, handler, deferred) {

    try {

        var result$0 = handler(value);

        if (result$0 === deferred.promise)
            throw new TypeError("Promise cycle");
        else if (isPromise(result$0))
            chain(result$0, deferred.resolve, deferred.reject);
        else
            deferred.resolve(result$0);

    } catch (e) {

        try { deferred.reject(e) }
        catch (e) { }
    }
}

function isPromise(x) {

    try { return x._status !== void 0 }
    catch (e) { return false }
}

function makeDeferred(constructor) {

    if (constructor === Promise) {

        var promise$0 = new Promise(OPTIMIZED);

        promise$0._onResolve = [];
        promise$0._onReject = [];

        return {

            promise: promise$0,
            resolve: function(x) { resolvePromise(promise$0, x) },
            reject: function(r) { rejectPromise(promise$0, r) },
        };

    } else {

        var result$1 = {};

        result$1.promise = new constructor(function(resolve, reject) {

            result$1.resolve = resolve;
            result$1.reject = reject;
        });

        return result$1;
    }
}

function makeRejected(constructor, r) {

    if (constructor === Promise) {

        var promise$1 = new Promise(OPTIMIZED);
        promise$1._status = REJECTED;
        promise$1._value = r;
        return promise$1;
    }

    return new constructor(function(resolve, reject) { return reject(r); });
}

function iterate(values, fn) {

    if (typeof Symbol !== "function" || !Symbol.iterator) {

        if (!Array.isArray(values))
            throw new TypeError("Invalid argument");

        values.forEach(fn);
    }

    var i = 0;

    for (var __$0 = (values)[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;)
        { var x$0 = __$1.value; fn(x$0, i++); }
}

addProperties(Promise.prototype, {

    then: function(onResolve, onReject) { var __this = this; 

        onResolve = typeof onResolve === "function" ? onResolve : idResolveHandler;
        onReject = typeof onReject === "function" ? onReject : idRejectHandler;

        var constructor = this.constructor;

        return chain(this, function(x) {

            x = coerce(constructor, x);

            return x === __this ? onReject(new TypeError("Promise cycle")) :
                isPromise(x) ? x.then(onResolve, onReject) :
                onResolve(x);

        }, onReject);
    },

    catch: function(onReject) {

        return this.then(void 0, onReject);
    },

});

addProperties(Promise, {

    reject: function(e) {

        return makeRejected(this, e);
    },

    resolve: function(x) {

        return isPromise(x) ? x : new this(function(resolve) { return resolve(x); });
    },

    all: function(values) { var __this = this; 

        var deferred = makeDeferred(this),
            resolutions = [],
            count = 0;

        try {

            iterate(values, function(x, i) {

                count++;

                __this.resolve(x).then(function(value) {

                    resolutions[i] = value;

                    if (--count === 0)
                        deferred.resolve(resolutions);

                }, deferred.reject);

            });

            if (count === 0)
                deferred.resolve(resolutions);

        } catch (e) {

            deferred.reject(e);
        }

        return deferred.promise;
    },

    race: function(values) { var __this = this; 

        var deferred = makeDeferred(this);

        try {

            iterate(values, function(x) { return __this.resolve(x).then(
                deferred.resolve,
                deferred.reject); });

        } catch (e) {

            deferred.reject(e);
        }

        return deferred.promise;
    },

});

function polyfill() {

    if (!global.Promise)
        global.Promise = Promise;
}

exports.polyfill = polyfill;


},
9, function(module, exports) {

var addProperties = __M(2).addProperties,
    toLength = __M(2).toLength,
    toInteger = __M(2).toInteger,
    sameValue = __M(2).sameValue,
    assertThis = __M(2).assertThis,
    isRegExp = __M(2).isRegExp;





// Repeat a string by "squaring"
function repeat(s, n) {

    if (n < 1) return "";
    if (n % 2) return repeat(s, n - 1) + s;
    var half = repeat(s, n / 2);
    return half + half;
}

function StringIterator(string) {

    this.string = string;
    this.current = 0;
}

addProperties(StringIterator.prototype = {}, {

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
    },

    "@@iterator": function() { return this },

});

function polyfill() {

    addProperties(String, {

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

    addProperties(String.prototype, {

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

        includes: function(search) {

            assertThis(this, "String.prototype.includes");

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

        "@@iterator": function() {

            assertThis(this, "String.prototype[Symbol.iterator]");
            return new StringIterator(this);
        },

    });

}

exports.polyfill = polyfill;


},
1, function(module, exports) {

var global = __M(2).global;

var symbols = __M(3);
var array = __M(4);
var mapset = __M(5);
var number = __M(6);
var object = __M(7);
var promise = __M(8);
var string = __M(9);



function polyfill() {

    [symbols, array, mapset, number, object, promise, string]
        .forEach(function(m) { return m.polyfill(global); });
}

exports.global = global;
exports.polyfill = polyfill;


},
0, function(module, exports) {

var polyfill = __M(1).polyfill;

polyfill();


}]);


}, "");

})();

var __M; (function(a) { var list = Array(a.length / 2); __M = function(i) { var m = list[i], f, e, ee; if (typeof m !== 'function') return m.exports; f = m; m = { exports: i ? {} : exports }; f(list[i] = m, e = m.exports); ee = m.exports; if (ee && ee !== e && !('default' in ee)) ee['default'] = ee; return ee; }; for (var i = 0; i < a.length; i += 2) { var j = Math.abs(a[i]); list[j] = a[i + 1]; if (a[i] >= 0) __M(j); } })([
1, function(m) { m.exports = require("fs") },
2, function(m) { m.exports = require("path") },
18, function(module, exports) {

var HAS = Object.prototype.hasOwnProperty;

function raise(x) {

    x.name = "CommandError";
    throw x;
}

function has(obj, name) {

    return HAS.call(obj, name);
}

function parse(argv, params) {

    if (!params)
        return argv.slice(0);

    var pos = Object.keys(params),
        values = {},
        shorts = {},
        required = [],
        list = [values];

    // Create short-to-long mapping
    pos.forEach(function(name) {

        var p = params[name];

        if (p.short)
            shorts[p.short] = name;

        if (p.required)
            required.push(name);
    });

    // For each command line arg...
    for (var i$0 = 0; i$0 < argv.length; ++i$0) {

        var a$0 = argv[i$0],
            param$0 = null,
            value$0 = null,
            name$0 = "";

        if (a$0[0] === "-") {

            if (a$0.slice(0, 2) === "--") {

                // Long named parameter
                name$0 = a$0.slice(2);
                param$0 = has(params, name$0) ? params[name$0] : null;

            } else {

                // Short named parameter
                name$0 = a$0.slice(1);
                name$0 = has(shorts, name$0) ? shorts[name$0] : "";
                param$0 = has(params, name$0) ? params[name$0] : null;
            }

            // Verify parameter exists
            if (!param$0)
                raise(new Error("Invalid command line option: " + a$0));

            if (param$0.flag) {

                value$0 = true;

            } else {

                // Get parameter value
                value$0 = argv[++i$0] || "";

                if (typeof value$0 !== "string" || value$0[0] === "-")
                    raise(new Error("No value provided for option " + a$0));
            }

        } else {

            // Positional parameter
            do {

                name$0 = pos.length > 0 ? pos.shift() : "";
                param$0 = name$0 ? params[name$0] : null;

            } while (param$0 && !param$0.positional);;

            value$0 = a$0;
        }

        if (param$0)
            values[name$0] = value$0;
        else
            list.push(value$0);
    }

    required.forEach(function(name) {

        if (values[name] === void 0)
            raise(new Error("Missing required option: --" + name));
    });

    return list;
}

var ConsoleCommand = _esdown.class(function(__) { var ConsoleCommand;

    __({ constructor: ConsoleCommand = function(cmd) {

        this.fallback = cmd;
        this.commands = {};
    },

    add: function(name, cmd) {

        this.commands[name] = cmd;
        return this;
    },

    run: function(args) {

        // Peel off the "node" and main module args
        args || (args = process.argv.slice(2));

        var name = args[0] || "",
            cmd = this.fallback;

        if (name && has(this.commands, name)) {

            cmd = this.commands[name];
            args = args.slice(1);
        }

        if (!cmd)
            raise(new Error("Invalid command"));

        return cmd.execute.apply(cmd, parse(args, cmd.params));
    }});

 });

exports.ConsoleCommand = ConsoleCommand;


},
19, function(module, exports) {


var ConsoleIO = _esdown.class(function(__) { var ConsoleIO;

    __({ constructor: ConsoleIO = function() {

        this._inStream = process.stdin;
        this._outStream = process.stdout;

        this._outEnc = "utf8";
        this._inEnc = "utf8";

        this.inputEncoding = "utf8";
        this.outputEncoding = "utf8";
    },

    get inputEncoding() {

        return this._inEnc;
    },

    set inputEncoding(enc) {

        this._inStream.setEncoding(this._inEnc = enc);
    },

    get outputEncoding() {

        return this._outEnc;
    },

    set outputEncoding(enc) {

        this._outStream.setEncoding(this._outEnc = enc);
    },

    readLine: function() { var __this = this; 

        return new Promise(function(resolve) {

            var listener;

            listener = function(data) {

                resolve(data);
                __this._inStream.removeListener("data", listener);
                __this._inStream.pause();
            };

            __this._inStream.resume();
            __this._inStream.on("data", listener);
        });
    },

    writeLine: function(msg) {

        console.log(msg);
    },

    write: function(msg) {

        process.stdout.write(msg);
    }});

 });

exports.ConsoleIO = ConsoleIO;


},
20, function(module, exports) {

var ConsoleStyle = {

    green: function(msg) { return "\x1B[32m" + (msg) + "\x1B[39m" },

    red: function(msg) { return "\x1B[31m" + (msg) + "\x1B[39m" },

    gray: function(msg) { return "\x1B[90m" + (msg) + "\x1B[39m" },

    bold: function(msg) { return "\x1B[1m" + (msg) + "\x1B[22m" },

};

exports.ConsoleStyle = ConsoleStyle;


},
9, function(module, exports) {

Object.keys(__M(18)).forEach(function(k) { exports[k] = __M(18)[k]; });
Object.keys(__M(19)).forEach(function(k) { exports[k] = __M(19)[k]; });
Object.keys(__M(20)).forEach(function(k) { exports[k] = __M(20)[k]; });


},
3, function(module, exports) {

Object.keys(__M(9)).forEach(function(k) { exports[k] = __M(9)[k]; });


},
4, function(module, exports) {

var FS = __M(1);

// Wraps a standard Node async function with a promise
// generating function
function wrap(fn) {

	return function() { for (var args = [], __$0 = 0; __$0 < arguments.length; ++__$0) args.push(arguments[__$0]); 

		return new Promise(function(resolve, reject) {

            args.push(function(err, data) {

                if (err) reject(err);
                else resolve(data);
            });

            fn.apply(null, args);
        });
	};
}

function exists(path) {

    return new Promise(function(resolve) {

        FS.exists(path, function(result) { return resolve(result); });
    });
}

var
    readFile = wrap(FS.readFile),
    close = wrap(FS.close),
    open = wrap(FS.open),
    read = wrap(FS.read),
    write = wrap(FS.write),
    rename = wrap(FS.rename),
    truncate = wrap(FS.truncate),
    rmdir = wrap(FS.rmdir),
    fsync = wrap(FS.fsync),
    mkdir = wrap(FS.mkdir),
    sendfile = wrap(FS.sendfile),
    readdir = wrap(FS.readdir),
    fstat = wrap(FS.fstat),
    lstat = wrap(FS.lstat),
    stat = wrap(FS.stat),
    readlink = wrap(FS.readlink),
    symlink = wrap(FS.symlink),
    link = wrap(FS.link),
    unlink = wrap(FS.unlink),
    fchmod = wrap(FS.fchmod),
    lchmod = wrap(FS.lchmod),
    chmod = wrap(FS.chmod),
    lchown = wrap(FS.lchown),
    fchown = wrap(FS.fchown),
    chown = wrap(FS.chown),
    utimes = wrap(FS.utimes),
    futimes = wrap(FS.futimes),
    writeFile = wrap(FS.writeFile),
    appendFile = wrap(FS.appendFile),
    realpath = wrap(FS.realpath)
;

exports.exists = exists;
exports.readFile = readFile;
exports.close = close;
exports.open = open;
exports.read = read;
exports.write = write;
exports.rename = rename;
exports.truncate = truncate;
exports.rmdir = rmdir;
exports.fsync = fsync;
exports.mkdir = mkdir;
exports.sendfile = sendfile;
exports.readdir = readdir;
exports.fstat = fstat;
exports.lstat = lstat;
exports.stat = stat;
exports.readlink = readlink;
exports.symlink = symlink;
exports.link = link;
exports.unlink = unlink;
exports.fchmod = fchmod;
exports.lchmod = lchmod;
exports.chmod = chmod;
exports.lchown = lchown;
exports.fchown = fchown;
exports.chown = chown;
exports.utimes = utimes;
exports.futimes = futimes;
exports.writeFile = writeFile;
exports.appendFile = appendFile;
exports.realpath = realpath;


},
10, function(m) { m.exports = require("repl") },
11, function(m) { m.exports = require("vm") },
12, function(m) { m.exports = require("util") },
27, function(module, exports) {

function Node(type, start, end) {

    this.type = type;
    this.start = start;
    this.end = end;
}

function Identifier(value, context, start, end) {

    this.type = "Identifier";
    this.start = start;
    this.end = end;
    this.value = value;
    this.context = context;
}

function AtName(value, start, end) {

    this.type = "AtName";
    this.start = start;
    this.end = end;
    this.value = value;
}

function NumberLiteral(value, start, end) {

    this.type = "NumberLiteral";
    this.start = start;
    this.end = end;
    this.value = value;
}

function StringLiteral(value, start, end) {

    this.type = "StringLiteral";
    this.start = start;
    this.end = end;
    this.value = value;
}

function TemplatePart(value, raw, isEnd, start, end) {

    this.type = "TemplatePart";
    this.start = start;
    this.end = end;
    this.value = value;
    this.raw = raw;
    this.templateEnd = isEnd;
}

function RegularExpression(value, flags, start, end) {

    this.type = "RegularExpression";
    this.start = start;
    this.end = end;
    this.value = value;
    this.flags = flags;
}

function BooleanLiteral(value, start, end) {

    this.type = "BooleanLiteral";
    this.start = start;
    this.end = end;
    this.value = value;
}

function NullLiteral(start, end) {

    this.type = "NullLiteral";
    this.start = start;
    this.end = end;
}

function Script(statements, start, end) {

    this.type = "Script";
    this.start = start;
    this.end = end;
    this.statements = statements;
}

function Module(statements, start, end) {

    this.type = "Module";
    this.start = start;
    this.end = end;
    this.statements = statements;
}

function ThisExpression(start, end) {

    this.type = "ThisExpression";
    this.start = start;
    this.end = end;
}

function SuperKeyword(start, end) {

    this.type = "SuperKeyword";
    this.start = start;
    this.end = end;
}

function SequenceExpression(list, start, end) {

    this.type = "SequenceExpression";
    this.start = start;
    this.end = end;
    this.expressions = list;
}

function AssignmentExpression(op, left, right, start, end) {

    this.type = "AssignmentExpression";
    this.start = start;
    this.end = end;
    this.operator = op;
    this.left = left;
    this.right = right;
}

function SpreadExpression(expr, start, end) {

    this.type = "SpreadExpression";
    this.start = start;
    this.end = end;
    this.expression = expr;
}

function YieldExpression(expr, delegate, start, end) {

    this.type = "YieldExpression";
    this.start = start;
    this.end = end;
    this.delegate = delegate;
    this.expression = expr;
}

function ConditionalExpression(test, cons, alt, start, end) {

    this.type = "ConditionalExpression";
    this.start = start;
    this.end = end;
    this.test = test;
    this.consequent = cons;
    this.alternate = alt;
}

function BinaryExpression(op, left, right, start, end) {

    this.type = "BinaryExpression";
    this.start = start;
    this.end = end;
    this.operator = op;
    this.left = left;
    this.right = right;
}

function UpdateExpression(op, expr, prefix, start, end) {

    this.type = "UpdateExpression";
    this.start = start;
    this.end = end;
    this.operator = op;
    this.expression = expr;
    this.prefix = prefix;
}

function UnaryExpression(op, expr, start, end) {

    this.type = "UnaryExpression";
    this.start = start;
    this.end = end;
    this.operator = op;
    this.expression = expr;
}

function MemberExpression(obj, prop, computed, start, end) {

    this.type = "MemberExpression";
    this.start = start;
    this.end = end;
    this.object = obj;
    this.property = prop;
    this.computed = computed;
}

function MetaProperty(left, right, start, end) {

    this.type = "MetaProperty";
    this.start = start;
    this.end = end;
    this.left = left;
    this.right = right;
}

function PipeExpression(left, right, args, start, end) {

    this.type = "PipeExpression";
    this.start = start;
    this.end = end;
    this.left = left;
    this.right = right;
    this.arguments = args;
}

function CallExpression(callee, args, start, end) {

    this.type = "CallExpression";
    this.start = start;
    this.end = end;
    this.callee = callee;
    this.arguments = args;
}

function TaggedTemplateExpression(tag, template, start, end) {

    this.type = "TaggedTemplateExpression";
    this.start = start;
    this.end = end;
    this.tag = tag;
    this.template = template;
}

function NewExpression(callee, args, start, end) {

    this.type = "NewExpression";
    this.start = start;
    this.end = end;
    this.callee = callee;
    this.arguments = args;
}

function ParenExpression(expr, start, end) {

    this.type = "ParenExpression";
    this.start = start;
    this.end = end;
    this.expression = expr;
}

function ObjectLiteral(props, comma, start, end) {

    this.type = "ObjectLiteral";
    this.start = start;
    this.end = end;
    this.properties = props;
    this.trailingComma = comma;
}

function ComputedPropertyName(expr, start, end) {

    this.type = "ComputedPropertyName";
    this.start = start;
    this.end = end;
    this.expression = expr;
}

function PropertyDefinition(name, expr, start, end) {

    this.type = "PropertyDefinition";
    this.start = start;
    this.end = end;
    this.name = name;
    this.expression = expr;
}

function ObjectPattern(props, comma, start, end) {

    this.type = "ObjectPattern";
    this.start = start;
    this.end = end;
    this.properties = props;
    this.trailingComma = comma;
}

function PatternProperty(name, pattern, initializer, start, end) {

    this.type = "PatternProperty";
    this.start = start;
    this.end = end;
    this.name = name;
    this.pattern = pattern;
    this.initializer = initializer;
}

function ArrayPattern(elements, comma, start, end) {

    this.type = "ArrayPattern";
    this.start = start;
    this.end = end;
    this.elements = elements;
    this.trailingComma = comma;
}

function PatternElement(pattern, initializer, start, end) {

    this.type = "PatternElement";
    this.start = start;
    this.end = end;
    this.pattern = pattern;
    this.initializer = initializer;
}

function PatternRestElement(pattern, start, end) {

    this.type = "PatternRestElement";
    this.start = start;
    this.end = end;
    this.pattern = pattern;
}

function MethodDefinition(isStatic, kind, name, params, body, start, end) {

    this.type = "MethodDefinition";
    this.start = start;
    this.end = end;
    this.static = isStatic;
    this.kind = kind;
    this.name = name;
    this.params = params;
    this.body = body;
}

function ArrayLiteral(elements, comma, start, end) {

    this.type = "ArrayLiteral";
    this.start = start;
    this.end = end;
    this.elements = elements;
    this.trailingComma = comma;
}

function TemplateExpression(lits, subs, start, end) {

    this.type = "TemplateExpression";
    this.start = start;
    this.end = end;
    this.literals = lits;
    this.substitutions = subs;
}

function Block(statements, start, end) {

    this.type = "Block";
    this.start = start;
    this.end = end;
    this.statements = statements;
}

function LabelledStatement(label, statement, start, end) {

    this.type = "LabelledStatement";
    this.start = start;
    this.end = end;
    this.label = label;
    this.statement = statement;
}

function ExpressionStatement(expr, start, end) {

    this.type = "ExpressionStatement";
    this.start = start;
    this.end = end;
    this.expression = expr;
}

function Directive(value, expr, start, end) {

    this.type = "Directive";
    this.start = start;
    this.end = end;
    this.value = value;
    this.expression = expr;
}

function EmptyStatement(start, end) {

    this.type = "EmptyStatement";
    this.start = start;
    this.end = end;
}

function VariableDeclaration(kind, list, start, end) {

    this.type = "VariableDeclaration";
    this.start = start;
    this.end = end;
    this.kind = kind;
    this.declarations = list;
}

function VariableDeclarator(pattern, initializer, start, end) {

    this.type = "VariableDeclarator";
    this.start = start;
    this.end = end;
    this.pattern = pattern;
    this.initializer = initializer;
}

function ReturnStatement(arg, start, end) {

    this.type = "ReturnStatement";
    this.start = start;
    this.end = end;
    this.argument = arg;
}

function BreakStatement(label, start, end) {

    this.type = "BreakStatement";
    this.start = start;
    this.end = end;
    this.label = label;
}

function ContinueStatement(label, start, end) {

    this.type = "ContinueStatement";
    this.start = start;
    this.end = end;
    this.label = label;
}

function ThrowStatement(expr, start, end) {

    this.type = "ThrowStatement";
    this.start = start;
    this.end = end;
    this.expression = expr;
}

function DebuggerStatement(start, end) {

    this.type = "DebuggerStatement";
    this.start = start;
    this.end = end;
}

function IfStatement(test, cons, alt, start, end) {

    this.type = "IfStatement";
    this.start = start;
    this.end = end;
    this.test = test;
    this.consequent = cons;
    this.alternate = alt;
}

function DoWhileStatement(body, test, start, end) {

    this.type = "DoWhileStatement";
    this.start = start;
    this.end = end;
    this.body = body;
    this.test = test;
}

function WhileStatement(test, body, start, end) {

    this.type = "WhileStatement";
    this.start = start;
    this.end = end;
    this.test = test;
    this.body = body;
}

function ForStatement(initializer, test, update, body, start, end) {

    this.type = "ForStatement";
    this.start = start;
    this.end = end;
    this.initializer = initializer;
    this.test = test;
    this.update = update;
    this.body = body;
}

function ForInStatement(left, right, body, start, end) {

    this.type = "ForInStatement";
    this.start = start;
    this.end = end;
    this.left = left;
    this.right = right;
    this.body = body;
}

function ForOfStatement(async, left, right, body, start, end) {

    this.type = "ForOfStatement";
    this.async = async;
    this.start = start;
    this.end = end;
    this.left = left;
    this.right = right;
    this.body = body;
}

function WithStatement(object, body, start, end) {

    this.type = "WithStatement";
    this.start = start;
    this.end = end;
    this.object = object;
    this.body = body;
}

function SwitchStatement(desc, cases, start, end) {

    this.type = "SwitchStatement";
    this.start = start;
    this.end = end;
    this.descriminant = desc;
    this.cases = cases;
}

function SwitchCase(test, cons, start, end) {

    this.type = "SwitchCase";
    this.start = start;
    this.end = end;
    this.test = test;
    this.consequent = cons;
}

function TryStatement(block, handler, fin, start, end) {

    this.type = "TryStatement";
    this.start = start;
    this.end = end;
    this.block = block;
    this.handler = handler;
    this.finalizer = fin;
}

function CatchClause(param, body, start, end) {

    this.type = "CatchClause";
    this.start = start;
    this.end = end;
    this.param = param;
    this.body = body;
}

function FunctionDeclaration(kind, identifier, params, body, start, end) {

    this.type = "FunctionDeclaration";
    this.start = start;
    this.end = end;
    this.kind = kind;
    this.identifier = identifier;
    this.params = params;
    this.body = body;
}

function FunctionExpression(kind, identifier, params, body, start, end) {

    this.type = "FunctionExpression";
    this.start = start;
    this.end = end;
    this.kind = kind;
    this.identifier = identifier;
    this.params = params;
    this.body = body;
}

function FormalParameter(pattern, initializer, start, end) {

    this.type = "FormalParameter";
    this.start = start;
    this.end = end;
    this.pattern = pattern;
    this.initializer = initializer;
}

function RestParameter(identifier, start, end) {

    this.type = "RestParameter";
    this.start = start;
    this.end = end;
    this.identifier = identifier;
}

function FunctionBody(statements, start, end) {

    this.type = "FunctionBody";
    this.start = start;
    this.end = end;
    this.statements = statements;
}

function ArrowFunctionHead(params, start, end) {

    this.type = "ArrowFunctionHead";
    this.start = start;
    this.end = end;
    this.parameters = params;
}

function ArrowFunction(kind, params, body, start, end) {

    this.type = "ArrowFunction";
    this.start = start;
    this.end = end;
    this.kind = kind;
    this.params = params;
    this.body = body;
}

function ClassDeclaration(identifier, base, body, start, end) {

    this.type = "ClassDeclaration";
    this.start = start;
    this.end = end;
    this.identifier = identifier;
    this.base = base;
    this.body = body;
}

function ClassExpression(identifier, base, body, start, end) {

    this.type = "ClassExpression";
    this.start = start;
    this.end = end;
    this.identifier = identifier;
    this.base = base;
    this.body = body;
}

function ClassBody(elems, start, end) {

    this.type = "ClassBody";
    this.start = start;
    this.end = end;
    this.elements = elems;
}

function EmptyClassElement(start, end) {

    this.type = "EmptyClassElement";
    this.start = start;
    this.end = end;
}

function PrivateDeclaration(isStatic, name, initializer, start, end) {

    this.type = "PrivateDeclaration";
    this.start = start;
    this.end = end;
    this.static = isStatic;
    this.name = name;
    this.initializer = initializer;
}

function ImportDeclaration(imports, from, start, end) {

    this.type = "ImportDeclaration";
    this.start = start;
    this.end = end;
    this.imports = imports;
    this.from = from;
}

function NamespaceImport(identifier, start, end) {

    this.type = "NamespaceImport";
    this.start = start;
    this.end = end;
    this.identifier = identifier;
}

function NamedImports(specifiers, start, end) {

    this.type = "NamedImports";
    this.start = start;
    this.end = end;
    this.specifiers = specifiers;
}

function DefaultImport(identifier, imports, start, end) {

    this.type = "DefaultImport";
    this.start = start;
    this.end = end;
    this.identifier = identifier;
    this.imports = imports;
}

function ImportSpecifier(imported, local, start, end) {

    this.type = "ImportSpecifier";
    this.start = start;
    this.end = end;
    this.imported = imported;
    this.local = local;
}

function ExportDeclaration(declaration, start, end) {

    this.type = "ExportDeclaration";
    this.start = start;
    this.end = end;
    this.declaration = declaration;
}

function ExportDefault(binding, start, end) {

    this.type = "ExportDefault";
    this.binding = binding;
    this.start = start;
    this.end = end;
}

function ExportNameList(specifiers, from, start, end) {

    this.type = "ExportNameList";
    this.start = start;
    this.end = end;
    this.specifiers = specifiers;
    this.from = from;
}

function ExportNamespace(identifier, from, start, end) {

    this.type = "ExportNamespace";
    this.start = start;
    this.end = end;
    this.identifier = identifier;
    this.from = from;
}

function ExportDefaultFrom(identifier, from, start, end) {

    this.type = "ExportDefaultFrom";
    this.start = start;
    this.end = end;
    this.identifier = identifier;
    this.from = from;
}

function ExportSpecifier(local, exported, start, end) {

    this.type = "ExportSpecifier";
    this.start = start;
    this.end = end;
    this.local = local;
    this.exported = exported;
}

exports.Node = Node;
exports.Identifier = Identifier;
exports.AtName = AtName;
exports.NumberLiteral = NumberLiteral;
exports.StringLiteral = StringLiteral;
exports.TemplatePart = TemplatePart;
exports.RegularExpression = RegularExpression;
exports.BooleanLiteral = BooleanLiteral;
exports.NullLiteral = NullLiteral;
exports.Script = Script;
exports.Module = Module;
exports.ThisExpression = ThisExpression;
exports.SuperKeyword = SuperKeyword;
exports.SequenceExpression = SequenceExpression;
exports.AssignmentExpression = AssignmentExpression;
exports.SpreadExpression = SpreadExpression;
exports.YieldExpression = YieldExpression;
exports.ConditionalExpression = ConditionalExpression;
exports.BinaryExpression = BinaryExpression;
exports.UpdateExpression = UpdateExpression;
exports.UnaryExpression = UnaryExpression;
exports.MemberExpression = MemberExpression;
exports.MetaProperty = MetaProperty;
exports.PipeExpression = PipeExpression;
exports.CallExpression = CallExpression;
exports.TaggedTemplateExpression = TaggedTemplateExpression;
exports.NewExpression = NewExpression;
exports.ParenExpression = ParenExpression;
exports.ObjectLiteral = ObjectLiteral;
exports.ComputedPropertyName = ComputedPropertyName;
exports.PropertyDefinition = PropertyDefinition;
exports.ObjectPattern = ObjectPattern;
exports.PatternProperty = PatternProperty;
exports.ArrayPattern = ArrayPattern;
exports.PatternElement = PatternElement;
exports.PatternRestElement = PatternRestElement;
exports.MethodDefinition = MethodDefinition;
exports.ArrayLiteral = ArrayLiteral;
exports.TemplateExpression = TemplateExpression;
exports.Block = Block;
exports.LabelledStatement = LabelledStatement;
exports.ExpressionStatement = ExpressionStatement;
exports.Directive = Directive;
exports.EmptyStatement = EmptyStatement;
exports.VariableDeclaration = VariableDeclaration;
exports.VariableDeclarator = VariableDeclarator;
exports.ReturnStatement = ReturnStatement;
exports.BreakStatement = BreakStatement;
exports.ContinueStatement = ContinueStatement;
exports.ThrowStatement = ThrowStatement;
exports.DebuggerStatement = DebuggerStatement;
exports.IfStatement = IfStatement;
exports.DoWhileStatement = DoWhileStatement;
exports.WhileStatement = WhileStatement;
exports.ForStatement = ForStatement;
exports.ForInStatement = ForInStatement;
exports.ForOfStatement = ForOfStatement;
exports.WithStatement = WithStatement;
exports.SwitchStatement = SwitchStatement;
exports.SwitchCase = SwitchCase;
exports.TryStatement = TryStatement;
exports.CatchClause = CatchClause;
exports.FunctionDeclaration = FunctionDeclaration;
exports.FunctionExpression = FunctionExpression;
exports.FormalParameter = FormalParameter;
exports.RestParameter = RestParameter;
exports.FunctionBody = FunctionBody;
exports.ArrowFunctionHead = ArrowFunctionHead;
exports.ArrowFunction = ArrowFunction;
exports.ClassDeclaration = ClassDeclaration;
exports.ClassExpression = ClassExpression;
exports.ClassBody = ClassBody;
exports.EmptyClassElement = EmptyClassElement;
exports.PrivateDeclaration = PrivateDeclaration;
exports.ImportDeclaration = ImportDeclaration;
exports.NamespaceImport = NamespaceImport;
exports.NamedImports = NamedImports;
exports.DefaultImport = DefaultImport;
exports.ImportSpecifier = ImportSpecifier;
exports.ExportDeclaration = ExportDeclaration;
exports.ExportDefault = ExportDefault;
exports.ExportNameList = ExportNameList;
exports.ExportNamespace = ExportNamespace;
exports.ExportDefaultFrom = ExportDefaultFrom;
exports.ExportSpecifier = ExportSpecifier;


},
23, function(module, exports) {

/*

NOTE: We forego using classes and class-based inheritance because at this time
super() tends to be slow in transpiled code.  Instead, we use regular constructor
functions and give them a common prototype property.

*/

var Nodes = __M(27);
Object.keys(__M(27)).forEach(function(k) { exports[k] = __M(27)[k]; });

function isNode(x) {

    return x !== null && typeof x === "object" && typeof x.type === "string";
}

var NodeBase = _esdown.class(function(__) { var NodeBase; __({ constructor: NodeBase = function() {} });

    __({ children: function() {

        var keys = Object.keys(this),
            list = [];

        for (var i$0 = 0; i$0 < keys.length; ++i$0) {

            if (keys[i$0] === "parent")
                break;

            var value$0 = this[keys[i$0]];

            if (Array.isArray(value$0)) {

                for (var j = 0; j < value$0.length; ++j)
                    if (isNode(value$0[j]))
                        list.push(value$0[j]);

            } else if (isNode(value$0)) {

                list.push(value$0);
            }
        }

        return list;
    }});

 });

Object.keys(Nodes).forEach(function(k) { return Nodes[k].prototype = NodeBase.prototype; });


},
30, function(module, exports) {

// Unicode 6.3.0 | 2013-09-25, 18:58:50 GMT [MD]

var IDENTIFIER = [
    36,0,2,
    48,9,3,
    65,25,2,
    95,0,2,
    97,25,2,
    170,0,2,
    181,0,2,
    183,0,3,
    186,0,2,
    192,22,2,
    216,30,2,
    248,457,2,
    710,11,2,
    736,4,2,
    748,0,2,
    750,0,2,
    768,111,3,
    880,4,2,
    886,1,2,
    890,3,2,
    902,0,2,
    903,0,3,
    904,2,2,
    908,0,2,
    910,19,2,
    931,82,2,
    1015,138,2,
    1155,4,3,
    1162,157,2,
    1329,37,2,
    1369,0,2,
    1377,38,2,
    1425,44,3,
    1471,0,3,
    1473,1,3,
    1476,1,3,
    1479,0,3,
    1488,26,2,
    1520,2,2,
    1552,10,3,
    1568,42,2,
    1611,30,3,
    1646,1,2,
    1648,0,3,
    1649,98,2,
    1749,0,2,
    1750,6,3,
    1759,5,3,
    1765,1,2,
    1767,1,3,
    1770,3,3,
    1774,1,2,
    1776,9,3,
    1786,2,2,
    1791,0,2,
    1808,0,2,
    1809,0,3,
    1810,29,2,
    1840,26,3,
    1869,88,2,
    1958,10,3,
    1969,0,2,
    1984,9,3,
    1994,32,2,
    2027,8,3,
    2036,1,2,
    2042,0,2,
    2048,21,2,
    2070,3,3,
    2074,0,2,
    2075,8,3,
    2084,0,2,
    2085,2,3,
    2088,0,2,
    2089,4,3,
    2112,24,2,
    2137,2,3,
    2208,0,2,
    2210,10,2,
    2276,26,3,
    2304,3,3,
    2308,53,2,
    2362,2,3,
    2365,0,2,
    2366,17,3,
    2384,0,2,
    2385,6,3,
    2392,9,2,
    2402,1,3,
    2406,9,3,
    2417,6,2,
    2425,6,2,
    2433,2,3,
    2437,7,2,
    2447,1,2,
    2451,21,2,
    2474,6,2,
    2482,0,2,
    2486,3,2,
    2492,0,3,
    2493,0,2,
    2494,6,3,
    2503,1,3,
    2507,2,3,
    2510,0,2,
    2519,0,3,
    2524,1,2,
    2527,2,2,
    2530,1,3,
    2534,9,3,
    2544,1,2,
    2561,2,3,
    2565,5,2,
    2575,1,2,
    2579,21,2,
    2602,6,2,
    2610,1,2,
    2613,1,2,
    2616,1,2,
    2620,0,3,
    2622,4,3,
    2631,1,3,
    2635,2,3,
    2641,0,3,
    2649,3,2,
    2654,0,2,
    2662,11,3,
    2674,2,2,
    2677,0,3,
    2689,2,3,
    2693,8,2,
    2703,2,2,
    2707,21,2,
    2730,6,2,
    2738,1,2,
    2741,4,2,
    2748,0,3,
    2749,0,2,
    2750,7,3,
    2759,2,3,
    2763,2,3,
    2768,0,2,
    2784,1,2,
    2786,1,3,
    2790,9,3,
    2817,2,3,
    2821,7,2,
    2831,1,2,
    2835,21,2,
    2858,6,2,
    2866,1,2,
    2869,4,2,
    2876,0,3,
    2877,0,2,
    2878,6,3,
    2887,1,3,
    2891,2,3,
    2902,1,3,
    2908,1,2,
    2911,2,2,
    2914,1,3,
    2918,9,3,
    2929,0,2,
    2946,0,3,
    2947,0,2,
    2949,5,2,
    2958,2,2,
    2962,3,2,
    2969,1,2,
    2972,0,2,
    2974,1,2,
    2979,1,2,
    2984,2,2,
    2990,11,2,
    3006,4,3,
    3014,2,3,
    3018,3,3,
    3024,0,2,
    3031,0,3,
    3046,9,3,
    3073,2,3,
    3077,7,2,
    3086,2,2,
    3090,22,2,
    3114,9,2,
    3125,4,2,
    3133,0,2,
    3134,6,3,
    3142,2,3,
    3146,3,3,
    3157,1,3,
    3160,1,2,
    3168,1,2,
    3170,1,3,
    3174,9,3,
    3202,1,3,
    3205,7,2,
    3214,2,2,
    3218,22,2,
    3242,9,2,
    3253,4,2,
    3260,0,3,
    3261,0,2,
    3262,6,3,
    3270,2,3,
    3274,3,3,
    3285,1,3,
    3294,0,2,
    3296,1,2,
    3298,1,3,
    3302,9,3,
    3313,1,2,
    3330,1,3,
    3333,7,2,
    3342,2,2,
    3346,40,2,
    3389,0,2,
    3390,6,3,
    3398,2,3,
    3402,3,3,
    3406,0,2,
    3415,0,3,
    3424,1,2,
    3426,1,3,
    3430,9,3,
    3450,5,2,
    3458,1,3,
    3461,17,2,
    3482,23,2,
    3507,8,2,
    3517,0,2,
    3520,6,2,
    3530,0,3,
    3535,5,3,
    3542,0,3,
    3544,7,3,
    3570,1,3,
    3585,47,2,
    3633,0,3,
    3634,1,2,
    3636,6,3,
    3648,6,2,
    3655,7,3,
    3664,9,3,
    3713,1,2,
    3716,0,2,
    3719,1,2,
    3722,0,2,
    3725,0,2,
    3732,3,2,
    3737,6,2,
    3745,2,2,
    3749,0,2,
    3751,0,2,
    3754,1,2,
    3757,3,2,
    3761,0,3,
    3762,1,2,
    3764,5,3,
    3771,1,3,
    3773,0,2,
    3776,4,2,
    3782,0,2,
    3784,5,3,
    3792,9,3,
    3804,3,2,
    3840,0,2,
    3864,1,3,
    3872,9,3,
    3893,0,3,
    3895,0,3,
    3897,0,3,
    3902,1,3,
    3904,7,2,
    3913,35,2,
    3953,19,3,
    3974,1,3,
    3976,4,2,
    3981,10,3,
    3993,35,3,
    4038,0,3,
    4096,42,2,
    4139,19,3,
    4159,0,2,
    4160,9,3,
    4176,5,2,
    4182,3,3,
    4186,3,2,
    4190,2,3,
    4193,0,2,
    4194,2,3,
    4197,1,2,
    4199,6,3,
    4206,2,2,
    4209,3,3,
    4213,12,2,
    4226,11,3,
    4238,0,2,
    4239,14,3,
    4256,37,2,
    4295,0,2,
    4301,0,2,
    4304,42,2,
    4348,332,2,
    4682,3,2,
    4688,6,2,
    4696,0,2,
    4698,3,2,
    4704,40,2,
    4746,3,2,
    4752,32,2,
    4786,3,2,
    4792,6,2,
    4800,0,2,
    4802,3,2,
    4808,14,2,
    4824,56,2,
    4882,3,2,
    4888,66,2,
    4957,2,3,
    4969,8,3,
    4992,15,2,
    5024,84,2,
    5121,619,2,
    5743,16,2,
    5761,25,2,
    5792,74,2,
    5870,2,2,
    5888,12,2,
    5902,3,2,
    5906,2,3,
    5920,17,2,
    5938,2,3,
    5952,17,2,
    5970,1,3,
    5984,12,2,
    5998,2,2,
    6002,1,3,
    6016,51,2,
    6068,31,3,
    6103,0,2,
    6108,0,2,
    6109,0,3,
    6112,9,3,
    6155,2,3,
    6160,9,3,
    6176,87,2,
    6272,40,2,
    6313,0,3,
    6314,0,2,
    6320,69,2,
    6400,28,2,
    6432,11,3,
    6448,11,3,
    6470,9,3,
    6480,29,2,
    6512,4,2,
    6528,43,2,
    6576,16,3,
    6593,6,2,
    6600,1,3,
    6608,10,3,
    6656,22,2,
    6679,4,3,
    6688,52,2,
    6741,9,3,
    6752,28,3,
    6783,10,3,
    6800,9,3,
    6823,0,2,
    6912,4,3,
    6917,46,2,
    6964,16,3,
    6981,6,2,
    6992,9,3,
    7019,8,3,
    7040,2,3,
    7043,29,2,
    7073,12,3,
    7086,1,2,
    7088,9,3,
    7098,43,2,
    7142,13,3,
    7168,35,2,
    7204,19,3,
    7232,9,3,
    7245,2,2,
    7248,9,3,
    7258,35,2,
    7376,2,3,
    7380,20,3,
    7401,3,2,
    7405,0,3,
    7406,3,2,
    7410,2,3,
    7413,1,2,
    7424,191,2,
    7616,38,3,
    7676,3,3,
    7680,277,2,
    7960,5,2,
    7968,37,2,
    8008,5,2,
    8016,7,2,
    8025,0,2,
    8027,0,2,
    8029,0,2,
    8031,30,2,
    8064,52,2,
    8118,6,2,
    8126,0,2,
    8130,2,2,
    8134,6,2,
    8144,3,2,
    8150,5,2,
    8160,12,2,
    8178,2,2,
    8182,6,2,
    8204,1,3,
    8255,1,3,
    8276,0,3,
    8305,0,2,
    8319,0,2,
    8336,12,2,
    8400,12,3,
    8417,0,3,
    8421,11,3,
    8450,0,2,
    8455,0,2,
    8458,9,2,
    8469,0,2,
    8472,5,2,
    8484,0,2,
    8486,0,2,
    8488,0,2,
    8490,15,2,
    8508,3,2,
    8517,4,2,
    8526,0,2,
    8544,40,2,
    11264,46,2,
    11312,46,2,
    11360,132,2,
    11499,3,2,
    11503,2,3,
    11506,1,2,
    11520,37,2,
    11559,0,2,
    11565,0,2,
    11568,55,2,
    11631,0,2,
    11647,0,3,
    11648,22,2,
    11680,6,2,
    11688,6,2,
    11696,6,2,
    11704,6,2,
    11712,6,2,
    11720,6,2,
    11728,6,2,
    11736,6,2,
    11744,31,3,
    12293,2,2,
    12321,8,2,
    12330,5,3,
    12337,4,2,
    12344,4,2,
    12353,85,2,
    12441,1,3,
    12443,4,2,
    12449,89,2,
    12540,3,2,
    12549,40,2,
    12593,93,2,
    12704,26,2,
    12784,15,2,
    13312,6581,2,
    19968,20940,2,
    40960,1164,2,
    42192,45,2,
    42240,268,2,
    42512,15,2,
    42528,9,3,
    42538,1,2,
    42560,46,2,
    42607,0,3,
    42612,9,3,
    42623,24,2,
    42655,0,3,
    42656,79,2,
    42736,1,3,
    42775,8,2,
    42786,102,2,
    42891,3,2,
    42896,3,2,
    42912,10,2,
    43000,9,2,
    43010,0,3,
    43011,2,2,
    43014,0,3,
    43015,3,2,
    43019,0,3,
    43020,22,2,
    43043,4,3,
    43072,51,2,
    43136,1,3,
    43138,49,2,
    43188,16,3,
    43216,9,3,
    43232,17,3,
    43250,5,2,
    43259,0,2,
    43264,9,3,
    43274,27,2,
    43302,7,3,
    43312,22,2,
    43335,12,3,
    43360,28,2,
    43392,3,3,
    43396,46,2,
    43443,13,3,
    43471,0,2,
    43472,9,3,
    43520,40,2,
    43561,13,3,
    43584,2,2,
    43587,0,3,
    43588,7,2,
    43596,1,3,
    43600,9,3,
    43616,22,2,
    43642,0,2,
    43643,0,3,
    43648,47,2,
    43696,0,3,
    43697,0,2,
    43698,2,3,
    43701,1,2,
    43703,1,3,
    43705,4,2,
    43710,1,3,
    43712,0,2,
    43713,0,3,
    43714,0,2,
    43739,2,2,
    43744,10,2,
    43755,4,3,
    43762,2,2,
    43765,1,3,
    43777,5,2,
    43785,5,2,
    43793,5,2,
    43808,6,2,
    43816,6,2,
    43968,34,2,
    44003,7,3,
    44012,1,3,
    44016,9,3,
    44032,11171,2,
    55216,22,2,
    55243,48,2,
    63744,365,2,
    64112,105,2,
    64256,6,2,
    64275,4,2,
    64285,0,2,
    64286,0,3,
    64287,9,2,
    64298,12,2,
    64312,4,2,
    64318,0,2,
    64320,1,2,
    64323,1,2,
    64326,107,2,
    64467,362,2,
    64848,63,2,
    64914,53,2,
    65008,11,2,
    65024,15,3,
    65056,6,3,
    65075,1,3,
    65101,2,3,
    65136,4,2,
    65142,134,2,
    65296,9,3,
    65313,25,2,
    65343,0,3,
    65345,25,2,
    65382,88,2,
    65474,5,2,
    65482,5,2,
    65490,5,2,
    65498,2,2,
    65536,11,2,
    65549,25,2,
    65576,18,2,
    65596,1,2,
    65599,14,2,
    65616,13,2,
    65664,122,2,
    65856,52,2,
    66045,0,3,
    66176,28,2,
    66208,48,2,
    66304,30,2,
    66352,26,2,
    66432,29,2,
    66464,35,2,
    66504,7,2,
    66513,4,2,
    66560,157,2,
    66720,9,3,
    67584,5,2,
    67592,0,2,
    67594,43,2,
    67639,1,2,
    67644,0,2,
    67647,22,2,
    67840,21,2,
    67872,25,2,
    67968,55,2,
    68030,1,2,
    68096,0,2,
    68097,2,3,
    68101,1,3,
    68108,3,3,
    68112,3,2,
    68117,2,2,
    68121,26,2,
    68152,2,3,
    68159,0,3,
    68192,28,2,
    68352,53,2,
    68416,21,2,
    68448,18,2,
    68608,72,2,
    69632,2,3,
    69635,52,2,
    69688,14,3,
    69734,9,3,
    69760,2,3,
    69763,44,2,
    69808,10,3,
    69840,24,2,
    69872,9,3,
    69888,2,3,
    69891,35,2,
    69927,13,3,
    69942,9,3,
    70016,2,3,
    70019,47,2,
    70067,13,3,
    70081,3,2,
    70096,9,3,
    71296,42,2,
    71339,12,3,
    71360,9,3,
    73728,878,2,
    74752,98,2,
    77824,1070,2,
    92160,568,2,
    93952,68,2,
    94032,0,2,
    94033,45,3,
    94095,3,3,
    94099,12,2,
    110592,1,2,
    119141,4,3,
    119149,5,3,
    119163,7,3,
    119173,6,3,
    119210,3,3,
    119362,2,3,
    119808,84,2,
    119894,70,2,
    119966,1,2,
    119970,0,2,
    119973,1,2,
    119977,3,2,
    119982,11,2,
    119995,0,2,
    119997,6,2,
    120005,64,2,
    120071,3,2,
    120077,7,2,
    120086,6,2,
    120094,27,2,
    120123,3,2,
    120128,4,2,
    120134,0,2,
    120138,6,2,
    120146,339,2,
    120488,24,2,
    120514,24,2,
    120540,30,2,
    120572,24,2,
    120598,30,2,
    120630,24,2,
    120656,30,2,
    120688,24,2,
    120714,30,2,
    120746,24,2,
    120772,7,2,
    120782,49,3,
    126464,3,2,
    126469,26,2,
    126497,1,2,
    126500,0,2,
    126503,0,2,
    126505,9,2,
    126516,3,2,
    126521,0,2,
    126523,0,2,
    126530,0,2,
    126535,0,2,
    126537,0,2,
    126539,0,2,
    126541,2,2,
    126545,1,2,
    126548,0,2,
    126551,0,2,
    126553,0,2,
    126555,0,2,
    126557,0,2,
    126559,0,2,
    126561,1,2,
    126564,0,2,
    126567,3,2,
    126572,6,2,
    126580,3,2,
    126585,3,2,
    126590,0,2,
    126592,9,2,
    126603,16,2,
    126625,2,2,
    126629,4,2,
    126635,16,2,
    131072,42710,2,
    173824,4148,2,
    177984,221,2,
    194560,541,2,
    917760,239,3
];

var WHITESPACE = [
    9,0,1,
    11,1,1,
    32,0,1,
    160,0,1,
    5760,0,1,
    8192,10,1,
    8239,0,1,
    8287,0,1,
    12288,0,1,
    65279,0,1
];


exports.IDENTIFIER = IDENTIFIER;
exports.WHITESPACE = WHITESPACE;


},
28, function(module, exports) {

var IDENTIFIER = __M(30).IDENTIFIER, WHITESPACE = __M(30).WHITESPACE;

function binarySearch(table, val) {

    var right = (table.length / 3) - 1,
        left = 0,
        mid = 0,
        test = 0,
        offset = 0;

    while (left <= right) {

        mid = (left + right) >> 1;
        offset = mid * 3;
        test = table[offset];

        if (val < test) {

            right = mid - 1;

        } else if (val === test || val <= test + table[offset + 1]) {

            return table[offset + 2];

        } else {

            left = mid + 1;
        }
    }

    return 0;
}

function isIdentifierStart(code) {

    return binarySearch(IDENTIFIER, code) === 2;
}

function isIdentifierPart(code) {

    return binarySearch(IDENTIFIER, code) >= 2;
}

function isWhitespace(code) {

    return binarySearch(WHITESPACE, code) === 1;
}

function codePointLength(code) {

    return code > 0xffff ? 2 : 1;
}

function codePointAt(str, offset) {

    var a = str.charCodeAt(offset);

    if (a >= 0xd800 &&
        a <= 0xdbff &&
        str.length > offset + 1) {

        var b$0 = str.charCodeAt(offset + 1);

        if (b$0 >= 0xdc00 && b$0 <= 0xdfff)
            return (a - 0xd800) * 0x400 + b$0 - 0xdc00 + 0x10000;
    }

    return a;
}

function codePointString(code) {

    if (code > 0x10ffff)
        return "";

    if (code <= 0xffff)
        return String.fromCharCode(code);

    // If value is greater than 0xffff, then it must be encoded
    // as 2 UTF-16 code units in a surrogate pair.

    code -= 0x10000;

    return String.fromCharCode(
        (code >> 10) + 0xd800,
        (code % 0x400) + 0xdc00);
}


exports.isIdentifierStart = isIdentifierStart;
exports.isIdentifierPart = isIdentifierPart;
exports.isWhitespace = isWhitespace;
exports.codePointLength = codePointLength;
exports.codePointAt = codePointAt;
exports.codePointString = codePointString;


},
29, function(module, exports) {

// Performs a binary search on an array
function binarySearch(array, val) {

    var right = array.length - 1,
        left = 0;

    while (left <= right) {

        var mid$0 = (left + right) >> 1,
            test$0 = array[mid$0];

        if (val === test$0)
            return mid$0;

        if (val < test$0) right = mid$0 - 1;
        else left = mid$0 + 1;
    }

    return left;
}

var LineMap = _esdown.class(function(__) { var LineMap;

    __({ constructor: LineMap = function() {

        this.lines = [-1];
        this.lastLineBreak = -1;
    },

    addBreak: function(offset) {

        if (offset > this.lastLineBreak)
            this.lines.push(this.lastLineBreak = offset);
    },

    locate: function(offset) {

        var line = binarySearch(this.lines, offset),
            pos = this.lines[line - 1],
            column = offset - pos;

        return { line: line, column: column, lineOffset: pos + 1 };
    }});
 });

exports.LineMap = LineMap;


},
24, function(module, exports) {

var isIdentifierStart = __M(28).isIdentifierStart,
    isIdentifierPart = __M(28).isIdentifierPart,
    isWhitespace = __M(28).isWhitespace,
    codePointLength = __M(28).codePointLength,
    codePointAt = __M(28).codePointAt,
    codePointString = __M(28).codePointString;





var LineMap = __M(29).LineMap;

var identifierEscape = /\\u([0-9a-fA-F]{4})/g,
      newlineSequence = /\r\n?|[\n\u2028\u2029]/g,
      crNewline = /\r\n?/g;

// === Reserved Words ===
var reservedWord = new RegExp("^(?:" +
    "break|case|catch|class|const|continue|debugger|default|delete|do|" +
    "else|enum|export|extends|false|finally|for|function|if|import|in|" +
    "instanceof|new|null|return|super|switch|this|throw|true|try|typeof|" +
    "var|void|while|with" +
")$");

var strictReservedWord = new RegExp("^(?:" +
    "implements|private|public|interface|package|let|protected|static|yield" +
")$");

// === Punctuators ===
var multiCharPunctuator = new RegExp("^(?:" +
    "--|[+]{2}|" +
    "&&|[|]{2}|" +
    "<<=?|" +
    ">>>?=?|" +
    "[!=]==|" +
    "[=-]>|" +
    "[\.]{2,3}|" +
    "[-+&|<>!=*&\^%\/]=" +
")$");

// === Miscellaneous Patterns ===
var octalEscape = /^(?:[0-3][0-7]{0,2}|[4-7][0-7]?)/,
      blockCommentPattern = /\r\n?|[\n\u2028\u2029]|\*\//g,
      hexChar = /[0-9a-f]/i;

// === Character type lookup table ===
function makeCharTable() {

    var table = [];

    for (var i$0 = 0; i$0 < 128; ++i$0) table[i$0] = "";
    for (var i$1 = 65; i$1 <= 90; ++i$1) table[i$1] = "identifier";
    for (var i$2 = 97; i$2 <= 122; ++i$2) table[i$2] = "identifier";

    add("whitespace", "\t\v\f ");
    add("newline", "\r\n");
    add("decimal-digit", "123456789");
    add("punctuator-char", "{[]();,?");
    add("punctuator", "<>+-*%&|^!~=:");
    add("dot", ".");
    add("slash", "/");
    add("rbrace", "}");
    add("zero", "0");
    add("string", "'\"");
    add("template", "`");
    add("identifier", "$_\\");
    add("at", "@");

    return table;

    function add(type, string) {

        string.split("").forEach(function(c) { return table[c.charCodeAt(0)] = type; });
    }
}

var charTable = makeCharTable();

// Returns true if the character is a valid identifier part
function isIdentifierPartAscii(c) {

    return  c > 64 && c < 91 ||
            c > 96 && c < 123 ||
            c > 47 && c < 58 ||
            c === 36 ||
            c === 95;
}

// Returns true if the specified character is a newline
function isNewlineChar(c) {

    switch (c) {

        case "\r":
        case "\n":
        case "\u2028":
        case "\u2029":
            return true;
    }

    return false;
}

// Returns true if the specified character can exist in a non-starting position
function isPunctuatorNext(c) {

    switch (c) {

        case "+":
        case "-":
        case "&":
        case "|":
        case "<":
        case ">":
        case "=":
        case ".":
        case ":":
            return true;
    }

    return false;
}

// Returns true if the specified string is a reserved word
function isReservedWord(word) {

    return reservedWord.test(word);
}

// Returns true if the specified string is a strict mode reserved word
function isStrictReservedWord(word) {

    return strictReservedWord.test(word);
}

var Scanner = _esdown.class(function(__) { var Scanner;

    __({ constructor: Scanner = function(input) {

        this.input = input || "";
        this.offset = 0;
        this.length = this.input.length;
        this.lineMap = new LineMap;

        this.value = "";
        this.number = 0;
        this.regexFlags = "";
        this.templateEnd = false;
        this.newlineBefore = false;
        this.strictError = "";
        this.start = 0;
        this.end = 0;
    },

    skip: function() {

        return this.next("skip");
    },

    next: function(context) {

        if (this.type !== "COMMENT")
            this.newlineBefore = false;

        this.strictError = "";

        do {

            this.start = this.offset;

            this.type =
                this.start >= this.length ? this.EOF() :
                context === "skip" ? this.Skip() :
                this.Start(context);

        } while (!this.type);

        this.end = this.offset;

        return this.type;
    },

    // TODO:  Should this be put on ParseResult instead?
    rawValue: function(start, end) {

        // Line endings are normalized to <LF>
        return this.input.slice(start, end).replace(crNewline, "\n");
    },

    peekChar: function() {

        return this.input.charAt(this.offset);
    },

    peekCharAt: function(n) {

        return this.input.charAt(this.offset + n);
    },

    peekCodePoint: function() {

        return codePointAt(this.input, this.offset);
    },

    peekCode: function() {

        return this.input.charCodeAt(this.offset) | 0;
    },

    peekCodeAt: function(n) {

        return this.input.charCodeAt(this.offset + n) | 0;
    },

    readChar: function() {

        return this.input.charAt(this.offset++);
    },

    readUnicodeEscapeValue: function() {

        var hex = "";

        if (this.peekChar() === "{") {

            this.offset++;
            hex = this.readHex(0);

            if (hex.length < 1 || this.readChar() !== "}")
                return null;

        } else {

            hex = this.readHex(4);

            if (hex.length < 4)
                return null;
        }

        return parseInt(hex, 16);
    },

    readUnicodeEscape: function() {

        var cp = this.readUnicodeEscapeValue(),
            val = codePointString(cp);

        return val === "" ? null : val;
    },

    readIdentifierEscape: function(startChar) {

        this.offset++;

        if (this.readChar() !== "u")
            return null;

        var cp = this.readUnicodeEscapeValue();

        if (startChar) {

            if (!isIdentifierStart(cp))
                return null;

        } else {

            if (!isIdentifierPart(cp))
                return null;
        }

        return codePointString(cp);
    },

    readOctalEscape: function() {

        var m = octalEscape.exec(this.input.slice(this.offset, this.offset + 3)),
            val = m ? m[0] : "";

        this.offset += val.length;

        return val;
    },

    readStringEscape: function(continuationChar) {

        this.offset++;

        var chr = "",
            esc = "";

        switch (chr = this.readChar()) {

            case "t": return "\t";
            case "b": return "\b";
            case "v": return "\v";
            case "f": return "\f";
            case "r": return "\r";
            case "n": return "\n";

            case "\r":

                this.lineMap.addBreak(this.offset - 1);

                if (this.peekChar() === "\n")
                    this.offset++;

                return continuationChar;

            case "\n":
            case "\u2028":
            case "\u2029":

                this.lineMap.addBreak(this.offset - 1);
                return continuationChar;

            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":

                this.offset--;
                esc = this.readOctalEscape();

                if (esc === "0") {

                    return String.fromCharCode(0);

                } else {

                    this.strictError = "Octal literals are not allowed in strict mode";
                    return String.fromCharCode(parseInt(esc, 8));
                }

            case "x":

                esc = this.readHex(2);
                return (esc.length < 2) ? null : String.fromCharCode(parseInt(esc, 16));

            case "u":

                return this.readUnicodeEscape();

            default:

                return chr;
        }
    },

    readRange: function(low, high) {

        var start = this.offset,
            code = 0;

        while (code = this.peekCode()) {

            if (code >= low && code <= high) this.offset++;
            else break;
        }

        return this.input.slice(start, this.offset);
    },

    readInteger: function() {

        var start = this.offset,
            code = 0;

        while (code = this.peekCode()) {

            if (code >= 48 && code <= 57) this.offset++;
            else break;
        }

        return this.input.slice(start, this.offset);
    },

    readHex: function(maxLen) {

        var str = "",
            chr = "";

        while (chr = this.peekChar()) {

            if (!hexChar.test(chr))
                break;

            str += chr;
            this.offset++;

            if (str.length === maxLen)
                break;
        }

        return str;
    },

    peekNumberFollow: function() {

        var c = this.peekCode();

        if (c > 127)
            return !isIdentifierStart(this.peekCodePoint());

        return !(
            c > 64 && c < 91 ||
            c > 96 && c < 123 ||
            c > 47 && c < 58 ||
            c === 36 ||
            c === 95 ||
            c === 92
        );
    },

    Skip: function() {

        var code = this.peekCode();

        if (code < 128) {

            switch (charTable[code]) {

                case "whitespace": return this.Whitespace();

                case "newline": return this.Newline(code);

                case "slash":

                    var next$0 = this.peekCodeAt(1);

                    if (next$0 === 47) return this.LineComment();       // /
                    else if (next$0 === 42) return this.BlockComment(); // *
            }

        } else {

            // Unicode newlines
            if (isNewlineChar(this.peekChar()))
                return this.Newline(code);

            var cp$0 = this.peekCodePoint();

            // Unicode whitespace
            if (isWhitespace(cp$0))
                return this.UnicodeWhitespace(cp$0);
        }

        return "UNKNOWN";
    },

    Start: function(context) {

        var code = this.peekCode(),
            next = 0;

        switch (charTable[code]) {

            case "punctuator-char": return this.PunctuatorChar();

            case "whitespace": return this.Whitespace();

            case "identifier": return this.Identifier(context, code);

            case "rbrace":

                if (context === "template") return this.Template();
                else return this.PunctuatorChar();

            case "punctuator": return this.Punctuator();

            case "newline": return this.Newline(code);

            case "decimal-digit": return this.Number();

            case "template": return this.Template();

            case "string": return this.String();

            case "at": return this.AtName();

            case "zero":

                switch (next = this.peekCodeAt(1)) {

                    case 88: case 120: return this.HexNumber();   // x
                    case 66: case 98: return this.BinaryNumber(); // b
                    case 79: case 111: return this.OctalNumber(); // o
                }

                return next >= 48 && next <= 55 ?
                    this.LegacyOctalNumber() :
                    this.Number();

            case "dot":

                next = this.peekCodeAt(1);

                if (next >= 48 && next <= 57) return this.Number();
                else return this.Punctuator();

            case "slash":

                next = this.peekCodeAt(1);

                if (next === 47) return this.LineComment();       // /
                else if (next === 42) return this.BlockComment(); // *
                else if (context === "div") return this.Punctuator();
                else return this.RegularExpression();

        }

        // Unicode newlines
        if (isNewlineChar(this.peekChar()))
            return this.Newline(code);

        var cp = this.peekCodePoint();

        // Unicode whitespace
        if (isWhitespace(cp))
            return this.UnicodeWhitespace(cp);

        // Unicode identifier chars
        if (isIdentifierStart(cp))
            return this.Identifier(context, cp);

        return this.Error();
    },

    Whitespace: function() {

        this.offset++;

        var code = 0;

        while (code = this.peekCode()) {

            // ASCII Whitespace:  [\t] [\v] [\f] [ ]
            if (code === 9 || code === 11 || code === 12 || code === 32)
                this.offset++;
            else
                break;
        }

        return "";
    },

    UnicodeWhitespace: function(cp) {

        this.offset += codePointLength(cp);

        // General unicode whitespace
        while (isWhitespace(cp = this.peekCodePoint()))
            this.offset += codePointLength(cp);

        return "";
    },

    Newline: function(code) {

        this.lineMap.addBreak(this.offset++);

        // Treat /r/n as a single newline
        if (code === 13 && this.peekCode() === 10)
            this.offset++;

        this.newlineBefore = true;

        return "";
    },

    PunctuatorChar: function() {

        return this.readChar();
    },

    Punctuator: function() {

        var op = this.readChar(),
            chr = "",
            next = "";

        while (
            isPunctuatorNext(chr = this.peekChar()) &&
            multiCharPunctuator.test(next = op + chr)) {

            this.offset++;
            op = next;
        }

        // ".." is not a valid token
        if (op === "..") {

            this.offset--;
            op = ".";
        }

        return op;
    },

    Template: function() {

        var first = this.readChar(),
            end = false,
            val = "",
            esc = "",
            chr = "";

        while (chr = this.peekChar()) {

            if (chr === "`") {

                end = true;
                break;
            }

            if (chr === "$" && this.peekCharAt(1) === "{") {

                this.offset++;
                break;
            }

            if (chr === "\\") {

                esc = this.readStringEscape("\n");

                if (esc === null)
                    return this.Error();

                val += esc;

            } else {

                val += chr;
                this.offset++;
            }
        }

        if (!chr)
            return this.Error();

        this.offset++;
        this.value = val;
        this.templateEnd = end;

        return "TEMPLATE";
    },

    String: function() {

        var delim = this.readChar(),
            val = "",
            esc = "",
            chr = "";

        while (chr = this.input[this.offset]) {

            if (chr === delim)
                break;

            if (isNewlineChar(chr))
                return this.Error();

            if (chr === "\\") {

                esc = this.readStringEscape("");

                if (esc === null)
                    return this.Error();

                val += esc;

            } else {

                val += chr;
                this.offset++;
            }
        }

        if (!chr)
            return this.Error();

        this.offset++;
        this.value = val;

        return "STRING";
    },

    RegularExpression: function() {

        this.offset++;

        var backslash = false,
            inClass = false,
            val = "",
            chr = "",
            code = 0,
            flagStart = 0;

        while (chr = this.readChar()) {

            if (isNewlineChar(chr))
                return this.Error();

            if (backslash) {

                val += "\\" + chr;
                backslash = false;

            } else if (chr === "[") {

                inClass = true;
                val += chr;

            } else if (chr === "]" && inClass) {

                inClass = false;
                val += chr;

            } else if (chr === "/" && !inClass) {

                break;

            } else if (chr === "\\") {

                backslash = true;

            } else {

                val += chr;
            }
        }

        if (!chr)
            return this.Error();

        flagStart = this.offset;

        while (true) {

            code = this.peekCode();

            if (code === 92) {

                return this.Error();

            } else if (code > 127) {

                if (isIdentifierPart(code = this.peekCodePoint()))
                    this.offset += codePointLength(code);
                else
                    break;

            } else if (isIdentifierPartAscii(code)) {

                this.offset++;

            } else {

                break;
            }
        }

        this.value = val;
        this.regexFlags = this.input.slice(flagStart, this.offset);

        return "REGEX";
    },

    LegacyOctalNumber: function() {

        this.offset++;

        var start = this.offset,
            code = 0;

        while (code = this.peekCode()) {

            if (code >= 48 && code <= 55)
                this.offset++;
            else
                break;
        }

        this.strictError = "Octal literals are not allowed in strict mode";

        var val = parseInt(this.input.slice(start, this.offset), 8);

        if (!this.peekNumberFollow())
            return this.Error();

        this.number = val;

        return "NUMBER";
    },

    Number: function() {

        var start = this.offset,
            next = "";

        this.readInteger();

        if ((next = this.peekChar()) === ".") {

            this.offset++;
            this.readInteger();
            next = this.peekChar();
        }

        if (next === "e" || next === "E") {

            this.offset++;

            next = this.peekChar();

            if (next === "+" || next === "-")
                this.offset++;

            if (!this.readInteger())
                return this.Error();
        }

        var val = parseFloat(this.input.slice(start, this.offset));

        if (!this.peekNumberFollow())
            return this.Error();

        this.number = val;

        return "NUMBER";
    },

    BinaryNumber: function() {

        this.offset += 2;

        var val = parseInt(this.readRange(48, 49), 2);

        if (!this.peekNumberFollow())
            return this.Error();

        this.number = val;

        return "NUMBER";
    },

    OctalNumber: function() {

        this.offset += 2;

        var val = parseInt(this.readRange(48, 55), 8);

        if (!this.peekNumberFollow())
            return this.Error();

        this.number = val;

        return "NUMBER";
    },

    HexNumber: function() {

        this.offset += 2;

        var val = parseInt(this.readHex(0), 16);

        if (!this.peekNumberFollow())
            return this.Error();

        this.number = val;

        return "NUMBER";
    },

    Identifier: function(context, code) {

        var start = this.offset,
            val = "",
            esc = "";

        // Identifier Start

        if (code === 92) {

            esc = this.readIdentifierEscape(true);

            if (esc === null)
                return this.Error();

            val = esc;
            start = this.offset;

        } else if (code > 127) {

            this.offset += codePointLength(code);

        } else {

            this.offset++;
        }

        // Identifier Part

        while (true) {

            code = this.peekCode();

            if (code === 92) {

                val += this.input.slice(start, this.offset);
                esc = this.readIdentifierEscape(false);

                if (esc === null)
                    return this.Error();

                val += esc;
                start = this.offset;

            } else if (code > 127) {

                if (isIdentifierPart(code = this.peekCodePoint()))
                    this.offset += codePointLength(code);
                else
                    break;

            } else if (isIdentifierPartAscii(code)) {

                this.offset++;

            } else {

                break;
            }
        }

        val += this.input.slice(start, this.offset);

        this.value = val;

        if (context !== "name" && isReservedWord(val))
            return esc ? this.Error() : val;

        return "IDENTIFIER";
    },

    AtName: function() {

        this.offset += 1;

        if (this.Start("name") !== "IDENTIFIER")
            return this.Error();

        // TODO: This is a bit of a hack
        this.value = "@" + this.value;

        return "ATNAME";
    },

    LineComment: function() {

        this.offset += 2;

        var start = this.offset,
            chr = "";

        while (chr = this.peekChar()) {

            if (isNewlineChar(chr))
                break;

            this.offset++;
        }

        this.value = this.input.slice(start, this.offset);

        return "COMMENT";
    },

    BlockComment: function() {

        this.offset += 2;

        var pattern = blockCommentPattern,
            start = this.offset;

        while (true) {

            pattern.lastIndex = this.offset;

            var m$0 = pattern.exec(this.input);
            if (!m$0) return this.Error();

            this.offset = m$0.index + m$0[0].length;

            if (m$0[0] === "*/")
                break;

            this.newlineBefore = true;
            this.lineMap.addBreak(m$0.index);
        }

        this.value = this.input.slice(start, this.offset - 2);

        return "COMMENT";
    },

    EOF: function() {

        return "EOF";
    },

    Error: function(msg) {

        if (this.start === this.offset)
            this.offset++;

        return "ILLEGAL";
    }});

 });

exports.isReservedWord = isReservedWord;
exports.isStrictReservedWord = isStrictReservedWord;
exports.Scanner = Scanner;


},
25, function(module, exports) {

var AST = __M(23);
var isReservedWord = __M(24).isReservedWord;


var Transform = _esdown.class(function(__) { var Transform; __({ constructor: Transform = function() {} });

    // Transform an expression into a formal parameter list
    __({ transformFormals: function(expr) {

        if (!expr)
            return [];

        var list;

        switch (expr.type) {

            case "SequenceExpression": list = expr.expressions; break;
            case "CallExpression": list = expr.arguments; break;
            default: list = [expr]; break;
        }

        for (var i$0 = 0; i$0 < list.length; ++i$0) {

            var node$0 = list[i$0],
                param$0;

            if (i$0 === list.length - 1 && node$0.type === "SpreadExpression") {

                expr = node$0.expression;

                // Rest parameters can only be identifiers
                if (expr.type !== "Identifier")
                    this.fail("Invalid rest parameter", expr);

                this.checkBindingTarget(expr);

                // Clear parser error for invalid spread expression
                node$0.error = "";

                param$0 = new AST.RestParameter(expr, node$0.start, node$0.end);

            } else {

                param$0 = new AST.FormalParameter(node$0, null, node$0.start, node$0.end);
                this.transformPatternElement(param$0, true);
            }

            list[i$0] = param$0;
        }

        return list;
    },

    transformArrayPattern: function(node, binding) {

        // NOTE: ArrayPattern and ArrayLiteral are isomorphic
        node.type = "ArrayPattern";

        var elems = node.elements;

        for (var i$1 = 0; i$1 < elems.length; ++i$1) {

            var elem$0 = elems[i$1],
                expr$0;

            // Skip holes in pattern
            if (!elem$0)
                continue;

            switch (elem$0.type) {

                case "SpreadExpression":

                    // Rest element must be in the last position and cannot be followed
                    // by a comma
                    if (i$1 < elems.length - 1 || node.trailingComma)
                        this.fail("Invalid destructuring pattern", elem$0);

                    expr$0 = elem$0.expression;

                    // Rest target cannot be a destructuring pattern
                    switch (expr$0.type) {

                        case "ObjectLiteral":
                        case "ObjectPattern":
                        case "ArrayLiteral":
                        case "ArrayPattern":
                            this.fail("Invalid rest pattern", expr$0);
                    }

                    elem$0 = new AST.PatternRestElement(expr$0, elem$0.start, elem$0.end);
                    this.checkPatternTarget(elem$0.pattern, binding);
                    break;

                case "PatternRestElement":
                    this.checkPatternTarget(elem$0.pattern, binding);
                    break;

                case "PatternElement":
                    this.transformPatternElement(elem$0, binding);
                    break;

                default:
                    elem$0 = new AST.PatternElement(elem$0, null, elem$0.start, elem$0.end);
                    this.transformPatternElement(elem$0, binding);
                    break;

            }

            elems[i$1] = elem$0;
        }

    },

    transformObjectPattern: function(node, binding) {

        // NOTE: ObjectPattern and ObjectLiteral are isomorphic
        node.type = "ObjectPattern";

        var props = node.properties;

        for (var i$2 = 0; i$2 < props.length; ++i$2) {

            var prop$0 = props[i$2];

            // Clear the error flag
            prop$0.error = "";

            switch (prop$0.type) {

                case "PropertyDefinition":

                    // Replace node
                    props[i$2] = prop$0 = new AST.PatternProperty(
                        prop$0.name,
                        prop$0.expression,
                        null,
                        prop$0.start,
                        prop$0.end);

                    break;

                case "PatternProperty":
                    break;

                default:
                    this.fail("Invalid pattern", prop$0);
            }

            if (prop$0.pattern) this.transformPatternElement(prop$0, binding);
            else this.checkPatternTarget(prop$0.name, binding);
        }
    },

    transformPatternElement: function(elem, binding) {

        var node = elem.pattern;

        // Split assignment into pattern and initializer
        if (node && node.type === "AssignmentExpression" && node.operator === "=") {

            elem.initializer = node.right;
            elem.pattern = node = node.left;
        }

        this.checkPatternTarget(node, binding);
    },

    transformIdentifier: function(node) {

        var value = node.value;

        if (isReservedWord(value))
            this.fail("Unexpected token " + value, node);

        this.checkIdentifier(node);
    },

    transformDefaultExport: function(node) {

        var toType = null;

        switch (node.type) {

            case "ClassExpression":
                if (node.identifier) toType = "ClassDeclaration";
                break;

            case "FunctionExpression":
                if (node.identifier) toType = "FunctionDeclaration";
                break;
        }

        if (toType) {

            node.type = toType;
            return true;
        }

        return false;
    }});

 });


exports.Transform = Transform;


},
26, function(module, exports) {

var isStrictReservedWord = __M(24).isStrictReservedWord;


// Returns true if the specified name is a restricted identifier in strict mode
function isPoisonIdent(name) {

    return name === "eval" || name === "arguments";
}

// Unwraps parens surrounding an expression
function unwrapParens(node) {

    // Remove any parenthesis surrounding the target
    for (; node.type === "ParenExpression"; node = node.expression);
    return node;
}

var Validate = _esdown.class(function(__) { var Validate; __({ constructor: Validate = function() {} });

    // Validates an assignment target
    __({ checkAssignmentTarget: function(node, simple) {

        switch (node.type) {

            case "Identifier":

                if (isPoisonIdent(node.value))
                    this.addStrictError("Cannot modify " + node.value + " in strict mode", node);

                return;

            case "MemberExpression":
            case "AtName":
                return;

            case "ObjectPattern":
            case "ArrayPattern":
                if (!simple) return;
                break;

            case "ObjectLiteral":
                if (!simple) { this.transformObjectPattern(node, false); return }
                break;

            case "ArrayLiteral":
                if (!simple) { this.transformArrayPattern(node, false); return }
                break;

        }

        this.fail("Invalid left-hand side in assignment", node);
    },

    // Validates a binding target
    checkBindingTarget: function(node) {

        switch (node.type) {

            case "Identifier":

                // Perform basic identifier validation
                this.checkIdentifier(node);

                // Mark identifier node as a declaration
                node.context = "declaration";

                var name$0 = node.value;

                if (isPoisonIdent(name$0))
                    this.addStrictError("Binding cannot be created for '" + name$0 + "' in strict mode", node);

                return;

            case "ArrayLiteral":
            case "ArrayPattern":
                this.transformArrayPattern(node, true);
                return;

            case "ObjectLiteral":
            case "ObjectPattern":
                this.transformObjectPattern(node, true);
                return;

        }

        this.fail("Invalid binding target", node);
    },

    // Validates a target in a binding or assignment pattern
    checkPatternTarget: function(node, binding) {

        return binding ? this.checkBindingTarget(node) : this.checkAssignmentTarget(node, false);
    },

    // Checks an identifier for strict mode reserved words
    checkIdentifier: function(node) {

        var ident = node.value;

        if (ident === "yield" && this.context.isGenerator)
            this.fail("yield cannot be an identifier inside of a generator function", node);
        else if (ident === "await" && this.context.isAsync)
            this.fail("await cannot be an identifier inside of an async function", node);
        else if (isStrictReservedWord(ident))
            this.addStrictError(ident + " cannot be used as an identifier in strict mode", node);
    },

    // Checks function formal parameters for strict mode restrictions
    checkParameters: function(params, kind) {

        for (var i$0 = 0; i$0 < params.length; ++i$0) {

            var node$0 = params[i$0];

            if (node$0.type !== "FormalParameter" || node$0.pattern.type !== "Identifier")
                continue;

            var name$1 = node$0.pattern.value;

            if (isPoisonIdent(name$1))
                this.addStrictError("Parameter name " + name$1 + " is not allowed in strict mode", node$0);
        }
    },

    // Performs validation on transformed arrow formal parameters
    checkArrowParameters: function(params) {

        params = this.transformFormals(params);
        // TODO: Check that formal parameters do not contain yield expressions or
        // await expressions
        this.checkParameters(params);
        return params;
    },

    // Performs validation on the init portion of a for-in or for-of statement
    checkForInit: function(init, type) {

        if (init.type === "VariableDeclaration") {

            // For-in/of may only have one variable declaration
            if (init.declarations.length !== 1)
                this.fail("for-" + type + " statement may not have more than one variable declaration", init);

            var decl$0 = init.declarations[0];

            // Initializers are not allowed in for in and for of
            if (decl$0.initializer)
                this.fail("Invalid initializer in for-" + type + " statement", init);

        } else {

            this.checkAssignmentTarget(this.unwrapParens(init));
        }
    },

    checkInvalidNodes: function() {

        var context = this.context,
            parent = context.parent,
            list = context.invalidNodes;

        for (var i$1 = 0; i$1 < list.length; ++i$1) {

            var item$0 = list[i$1],
                node$1 = item$0.node,
                error$0 = node$1.error;

            // Skip if error has been resolved
            if (!error$0)
                continue;

            // Throw if item is not a strict-mode-only error, or if the current
            // context is strict
            if (!item$0.strict || context.mode === "strict")
                this.fail(error$0, node$1);

            // Skip strict errors in sloppy mode
            if (context.mode === "sloppy")
                continue;

            // If the parent context is sloppy, then we ignore. If the parent context
            // is strict, then this context would also be known to be strict and
            // therefore handled above.

            // If parent mode has not been determined, add error to
            // parent context
            if (!parent.mode)
                parent.invalidNodes.push(item$0);
        }

    },

    checkDelete: function(node) {

        node = this.unwrapParens(node);

        if (node.type === "Identifier")
            this.addStrictError("Cannot delete unqualified property in strict mode", node);
    }});

 });

exports.Validate = Validate;


},
21, function(module, exports) {

var AST = __M(23);
var Scanner = __M(24).Scanner;
var Transform = __M(25).Transform;
var Validate = __M(26).Validate;

// Returns true if the specified operator is an increment operator
function isIncrement(op) {

    return op === "++" || op === "--";
}

// Returns a binary operator precedence level
function getPrecedence(op) {

    switch (op) {

        case "||": return 1;
        case "&&": return 2;
        case "|": return 3;
        case "^": return 4;
        case "&": return 5;
        case "==":
        case "!=":
        case "===":
        case "!==": return 6;
        case "<=":
        case ">=":
        case ">":
        case "<":
        case "instanceof":
        case "in": return 7;
        case ">>>":
        case ">>":
        case "<<": return 8;
        case "+":
        case "-": return 9;
        case "*":
        case "/":
        case "%": return 10;
    }

    return 0;
}

// Returns true if the specified operator is an assignment operator
function isAssignment(op) {

    if (op === "=")
        return true;

    switch (op) {

        case "*=":
        case "&=":
        case "^=":
        case "|=":
        case "<<=":
        case ">>=":
        case ">>>=":
        case "%=":
        case "+=":
        case "-=":
        case "/=":
            return true;
    }

    return false;
}

// Returns true if the specified operator is a unary operator
function isUnary(op) {

    switch (op) {

        case "await":
        case "delete":
        case "void":
        case "typeof":
        case "!":
        case "~":
        case "+":
        case "-":
            return true;
    }

    return false;
}

// Returns true if the value is a method definition keyword
function isMethodKeyword(value) {

    switch (value) {

        case "get":
        case "set":
        case "static":
            return true;
    }

    return false;
}

// Returns true if the supplied meta property pair is valid
function isValidMeta(left, right) {

    switch (left) {

        case "new":
            return right === "target";
    }

    return false;
}

// Returns true if the value is a known directive
function isDirective(value) {

    return value === "use strict";
}

// Returns the value of the specified token, if it is an identifier and does not
// contain any unicode escapes
function keywordFromToken(token) {

    if (token.type === "IDENTIFIER" && token.end - token.start === token.value.length)
        return token.value;

    return "";
}

// Returns the value of the specified node, if it is an Identifier and does not
// contain any unicode escapes
function keywordFromNode(node) {

    if (node.type === "Identifier" && node.end - node.start === node.value.length)
        return node.value;

    return "";
}

// Copies token data
function copyToken(from, to) {

    to.type = from.type;
    to.value = from.value;
    to.number = from.number;
    to.regexFlags = from.regexFlags;
    to.templateEnd = from.templateEnd;
    to.newlineBefore = from.newlineBefore;
    to.strictError = from.strictError;
    to.start = from.start;
    to.end = from.end;

    return to;
}

var Context = _esdown.class(function(__) { var Context;

    __({ constructor: Context = function(parent) {

        this.parent = parent;
        this.mode = "";
        this.isFunction = false;
        this.functionBody = false;
        this.isGenerator = false;
        this.isAsync = false;
        this.isMethod = false;
        this.isConstructor = false;
        this.hasYieldAwait = false;
        this.labelMap = null;
        this.switchDepth = 0;
        this.loopDepth = 0;
        this.invalidNodes = [];
    }});
 });

var ParseResult = _esdown.class(function(__) { var ParseResult;

    __({ constructor: ParseResult = function(input, lineMap, ast) {

        this.input = input;
        this.lineMap = lineMap;
        this.ast = ast;
        this.scopeTree = null;
    },

    locate: function(offset) {

        return this.lineMap.locate(offset);
    },

    createSyntaxError: function(message, node) {

        var loc = this.lineMap.locate(node.start),
            err = new SyntaxError(message);

        err.line = loc.line;
        err.column = loc.column;
        err.lineOffset = loc.lineOffset;
        err.startOffset = node.start;
        err.endOffset = node.end;
        err.sourceText = this.input;

        return err;
    }});

 });

var AtNameSet = _esdown.class(function(__) { var AtNameSet;

    __({ constructor: AtNameSet = function(parser) {

        this.parser = parser;
        this.names = {};
    },

    add: function(node, kind) {

        if (node.type !== "AtName")
            return true;

        var name = node.value,
            code = 3;

        switch (kind) {

            case "get": code = 1; break;
            case "set": code = 2; break;
        }

        var current = this.names[name];

        if (current & code)
            this.parser.fail("Duplicate private name definition", node);

        this.names[name] = current | code;
    }});
 });

var Parser = _esdown.class(function(__) { var Parser; __({ constructor: Parser = function() {} });

    __({ parse: function(input, options) {

        options = options || {};

        this.onASI = options.onASI || null;

        var scanner = new Scanner(input);

        this.scanner = scanner;
        this.input = input;

        this.peek0 = null;
        this.peek1 = null;
        this.tokenStash = new Scanner;
        this.tokenEnd = scanner.offset;

        this.context = new Context(null, false);
        this.setStrict(false);

        var ast = options.module ? this.Module() : this.Script();

        return new ParseResult(this.input, this.scanner.lineMap, ast);
    },

    nextToken: function(context) {

        var scanner = this.scanner,
            type = "";

        context = context || "";

        do { type = scanner.next(context); }
        while (type === "COMMENT");

        return scanner;
    },

    nodeStart: function() {

        if (this.peek0)
            return this.peek0.start;

        // Skip over whitespace and comments
        this.scanner.skip();

        return this.scanner.offset;
    },

    nodeEnd: function() {

        return this.tokenEnd;
    },

    readToken: function(type, context) {

        var token = this.peek0 || this.nextToken(context);

        this.peek0 = this.peek1;
        this.peek1 = null;
        this.tokenEnd = token.end;

        if (type && token.type !== type)
            this.unexpected(token);

        return token;
    },

    read: function(type, context) {

        return this.readToken(type, context).type;
    },

    peekToken: function(context) {

        if (!this.peek0)
            this.peek0 = this.nextToken(context);

        return this.peek0;
    },

    peek: function(context) {

        return this.peekToken(context).type;
    },

    peekTokenAt: function(context, index) {

        if (index !== 1 || this.peek0 === null)
            throw new Error("Invalid lookahead")

        if (this.peek1 === null) {

            this.peek0 = copyToken(this.peek0, this.tokenStash);
            this.peek1 = this.nextToken(context);
        }

        return this.peek1;
    },

    peekAt: function(context, index) {

        return this.peekTokenAt(context, index).type;
    },

    unpeek: function() {

        if (this.peek0) {

            this.scanner.offset = this.peek0.start;
            this.peek0 = null;
            this.peek1 = null;
        }
    },

    peekUntil: function(type, context) {

        var tok = this.peek(context);
        return tok !== "EOF" && tok !== type ? tok : null;
    },

    readKeyword: function(word) {

        var token = this.readToken();

        if (token.type === word || keywordFromToken(token) === word)
            return token;

        this.unexpected(token);
    },

    peekKeyword: function(word) {

        var token = this.peekToken();
        return token.type === word || keywordFromToken(token) === word;
    },

    peekLet: function() {

        if (this.peekKeyword("let")) {

            switch (this.peekAt("div", 1)) {

                case "{":
                case "[":
                case "IDENTIFIER": return true;
            }
        }

        return false;
    },

    peekYield: function() {

        return this.context.functionBody &&
            this.context.isGenerator &&
            this.peekKeyword("yield");
    },

    peekAwait: function() {

        if (this.peekKeyword("await")) {

            if (this.context.functionBody && this.context.isAsync)
                return true;

            if (this.isModule)
                this.fail("Await is reserved within modules");
        }

        return false;
    },

    peekAsync: function() {

        var token = this.peekToken();

        if (keywordFromToken(token) !== "async")
            return "";

        token = this.peekTokenAt("div", 1);

        if (token.newlineBefore)
            return "";

        var type = token.type;

        return type === "function" ? type : "";
    },

    peekEnd: function() {

        var token = this.peekToken();

        if (!token.newlineBefore) {

            switch (token.type) {

                case "EOF":
                case "}":
                case ";":
                case ")":
                    break;

                default:
                    return false;
            }
        }

        return true;
    },

    unexpected: function(token) {

        var type = token.type, msg;

        msg = type === "EOF" ?
            "Unexpected end of input" :
            "Unexpected token " + token.type;

        this.fail(msg, token);
    },

    fail: function(msg, node) {

        if (!node)
            node = this.peekToken();

        var result = new ParseResult(this.input, this.scanner.lineMap, null);
        throw result.createSyntaxError(msg, node);
    },

    unwrapParens: function(node) {

        // Remove any parenthesis surrounding the target
        for (; node.type === "ParenExpression"; node = node.expression);
        return node;
    },


    // == Context Management ==

    pushContext: function(isArrow) {

        var parent = this.context,
            c = new Context(parent);

        this.context = c;

        if (parent.mode === "strict")
            c.mode = "strict";

        if (isArrow) {

            c.isMethod = parent.isMethod;
            c.isConstructor = parent.isConstructor;
        }

        return c;
    },

    pushMaybeContext: function() {

        var parent = this.context,
            c = this.pushContext();

        c.isFunction = parent.isFunction;
        c.isGenerator = parent.isGenerator;
        c.isAsync = parent.isAsync;
        c.isMethod = parent.isMethod;
        c.isConstructor = parent.isConstructor;
        c.functionBody = parent.functionBody;
    },

    popContext: function(collapse) {

        var context = this.context,
            parent = context.parent;

        // If collapsing into parent context, copy invalid nodes into parent
        if (collapse)
            context.invalidNodes.forEach(function(node) { return parent.invalidNodes.push(node); });
        else
            this.checkInvalidNodes();

        this.context = this.context.parent;
    },

    setStrict: function(strict) {

        this.context.mode = strict ? "strict" : "sloppy";
    },

    addStrictError: function(error, node) {

        this.addInvalidNode(error, node, true);
    },

    addInvalidNode: function(error, node, strict) {

        node.error = error;
        this.context.invalidNodes.push({ node: node, strict: !!strict });
    },

    setLabel: function(label, value) {

        var m = this.context.labelMap;

        if (!m)
            m = this.context.labelMap = Object.create(null);

        m[label] = value;
    },

    getLabel: function(label) {

        var m = this.context.labelMap;
        return (m && m[label]) | 0;
    },

    setFunctionType: function(kind) {

        var c = this.context,
            a = false,
            g = false;

        switch (kind) {

            case "async": a = true; break;
            case "generator": g = true; break;
            case "async-generator": a = g = true; break;
        }

        c.isFunction = true;
        c.isAsync = a;
        c.isGenerator = g;
    },

    // === Top Level ===

    Script: function() {

        this.isModule = false;
        this.pushContext();

        var start = this.nodeStart(),
            statements = this.StatementList(true, false);

        this.popContext();

        return new AST.Script(statements, start, this.nodeEnd());
    },

    Module: function() {

        this.isModule = true;
        this.pushContext();
        this.setStrict(true);

        var start = this.nodeStart(),
            statements = this.StatementList(true, true);

        this.popContext();

        return new AST.Module(statements, start, this.nodeEnd());
    },

    // === Expressions ===

    Expression: function(noIn) {

        var expr = this.AssignmentExpression(noIn),
            list = null;

        while (this.peek("div") === ",") {

            this.read();

            if (list === null)
                expr = new AST.SequenceExpression(list = [expr], expr.start, -1);

            list.push(this.AssignmentExpression(noIn));
        }

        if (list)
            expr.end = this.nodeEnd();

        return expr;
    },

    AssignmentExpression: function(noIn, allowSpread) {

        var start = this.nodeStart(),
            node;

        if (this.peek() === "...") {

            this.read();

            node = new AST.SpreadExpression(
                this.AssignmentExpression(noIn),
                start,
                this.nodeEnd());

            if (!allowSpread)
                this.addInvalidNode("Invalid spread expression", node);

            return node;
        }

        if (this.peekYield())
            return this.YieldExpression(noIn);

        node = this.ConditionalExpression(noIn);

        if (node.type === "ArrowFunctionHead")
            return this.ArrowFunctionBody(node, noIn);

        // Check for assignment operator
        if (!isAssignment(this.peek("div")))
            return node;

        this.checkAssignmentTarget(this.unwrapParens(node), false);

        return new AST.AssignmentExpression(
            this.read(),
            node,
            this.AssignmentExpression(noIn),
            start,
            this.nodeEnd());
    },

    YieldExpression: function(noIn) {

        var start = this.nodeStart(),
            delegate = false,
            expr = null;

        this.readKeyword("yield");

        if (!this.peekEnd() && this.peek() !== ",") {

            if (this.peek() === "*") {

                this.read();
                delegate = true;
            }

            expr = this.AssignmentExpression(noIn);
        }

        this.context.hasYieldAwait = true;

        return new AST.YieldExpression(
            expr,
            delegate,
            start,
            this.nodeEnd());
    },

    ConditionalExpression: function(noIn) {

        var start = this.nodeStart(),
            left = this.BinaryExpression(noIn),
            middle,
            right;

        if (this.peek("div") !== "?")
            return left;

        this.read("?");
        middle = this.AssignmentExpression();
        this.read(":");
        right = this.AssignmentExpression(noIn);

        return new AST.ConditionalExpression(left, middle, right, start, this.nodeEnd());
    },

    BinaryExpression: function(noIn) {

        return this.PartialBinaryExpression(this.UnaryExpression(), 0, noIn);
    },

    PartialBinaryExpression: function(lhs, minPrec, noIn) {

        var prec = 0,
            next = "",
            max = 0,
            op = "",
            rhs;

        while (next = this.peek("div")) {

            // Exit if operator is "in" and in is not allowed
            if (next === "in" && noIn)
                break;

            prec = getPrecedence(next);

            // Exit if not a binary operator or lower precendence
            if (prec === 0 || prec < minPrec)
                break;

            this.read();

            op = next;
            max = prec;
            rhs = this.UnaryExpression();

            while (next = this.peek("div")) {

                prec = getPrecedence(next);

                // Exit if not a binary operator or equal or higher precendence
                if (prec === 0 || prec <= max)
                    break;

                rhs = this.PartialBinaryExpression(rhs, prec, noIn);
            }

            lhs = new AST.BinaryExpression(op, lhs, rhs, lhs.start, rhs.end);
        }

        return lhs;
    },

    UnaryExpression: function() {

        var start = this.nodeStart(),
            type = this.peek(),
            token,
            expr;

        if (isIncrement(type)) {

            this.read();
            expr = this.MemberExpression(true);
            this.checkAssignmentTarget(this.unwrapParens(expr), true);

            return new AST.UpdateExpression(type, expr, true, start, this.nodeEnd());
        }

        if (this.peekAwait()) {

            type = "await";
            this.context.hasYieldAwait = true;
        }

        if (isUnary(type)) {

            this.read();
            expr = this.UnaryExpression();

            if (type === "delete")
                this.checkDelete(expr);

            return new AST.UnaryExpression(type, expr, start, this.nodeEnd());
        }

        expr = this.MemberExpression(true);
        token = this.peekToken("div");
        type = token.type;

        // Check for postfix operator
        if (isIncrement(type) && !token.newlineBefore) {

            this.read();
            this.checkAssignmentTarget(this.unwrapParens(expr), true);

            return new AST.UpdateExpression(type, expr, false, start, this.nodeEnd());
        }

        return expr;
    },

    MemberExpression: function(allowCall) {

        var token = this.peekToken(),
            start = token.start,
            arrowType = "",
            isSuper = false,
            exit = false,
            expr,
            prop;

        switch (token.type) {

            case "super":

                expr = this.SuperKeyword();
                isSuper = true;
                break;

            case "new":

                expr = this.peekAt("", 1) === "." ?
                    this.MetaProperty() :
                    this.NewExpression();

                break;

            default:

                expr = this.PrimaryExpression();
                break;
        }

        while (!exit) {

            token = this.peekToken("div");

            switch (token.type) {

                case ".":

                    this.read();

                    prop = this.peek("name") === "ATNAME" && !isSuper ?
                        this.AtName() :
                        this.IdentifierName();

                    expr = new AST.MemberExpression(
                        expr,
                        prop,
                        false,
                        start,
                        this.nodeEnd());

                    break;

                case "[":

                    this.read();
                    prop = this.Expression();
                    this.read("]");

                    expr = new AST.MemberExpression(
                        expr,
                        prop,
                        true,
                        start,
                        this.nodeEnd());

                    break;

                case "(":

                    if (isSuper) {

                        if (!allowCall || !this.context.isConstructor)
                            this.fail("Invalid super call");
                    }

                    if (!allowCall) {

                        exit = true;
                        break;
                    }

                    if (keywordFromNode(expr) === "async" && !token.newlineBefore) {

                        arrowType = "async";
                        this.pushMaybeContext();
                    }

                    expr = new AST.CallExpression(
                        expr,
                        this.ArgumentList(),
                        start,
                        this.nodeEnd());

                    if (arrowType) {

                        token = this.peekToken("div");

                        if (token.type === "=>" && !token.newlineBefore) {

                            expr = this.ArrowFunctionHead(arrowType, expr, start);
                            exit = true;

                        } else {

                            arrowType = "";
                            this.popContext(true);
                        }
                    }

                    break;

                case "TEMPLATE":

                    if (isSuper)
                        this.fail();

                    expr = new AST.TaggedTemplateExpression(
                        expr,
                        this.TemplateExpression(),
                        start,
                        this.nodeEnd());

                    break;

                case "->":

                    if (isSuper)
                        this.fail();

                    if (!allowCall) {

                        exit = true;
                        break;
                    }

                    this.read();

                    expr = new AST.PipeExpression(
                        expr,
                        this.Identifier(true),
                        this.ArgumentList(),
                        start,
                        this.nodeEnd());

                    break;

                default:

                    if (isSuper)
                        this.fail();

                    exit = true;
                    break;
            }

            isSuper = false;
        }

        return expr;
    },

    NewExpression: function() {

        var start = this.nodeStart();

        this.read("new");

        var expr = this.MemberExpression(false),
            args = this.peek("div") === "(" ? this.ArgumentList() : null;

        return new AST.NewExpression(expr, args, start, this.nodeEnd());
    },

    MetaProperty: function() {

        var token = this.readToken(),
            start = token.start,
            left = token.type === "IDENTIFIER" ? token.value : token.type,
            right;

        this.read(".");

        token = this.readToken("IDENTIFIER", "name");
        right = token.value;

        if (!isValidMeta(left, right))
            this.fail("Invalid meta property", token);

        return new AST.MetaProperty(left, right, start, this.nodeEnd());
    },

    SuperKeyword: function() {

        var token = this.readToken("super"),
            node = new AST.SuperKeyword(token.start, token.end);

        if (!this.context.isMethod)
            this.fail("Super keyword outside of method", node);

        return node;
    },

    ArgumentList: function() {

        var list = [];

        this.read("(");

        while (this.peekUntil(")")) {

            if (list.length > 0)
                this.read(",");

            list.push(this.AssignmentExpression(false, true));
        }

        this.read(")");

        return list;
    },

    PrimaryExpression: function() {

        var token = this.peekToken(),
            type = token.type,
            start = this.nodeStart(),
            next,
            value;

        switch (type) {

            case "function": return this.FunctionExpression();
            case "class": return this.ClassExpression();
            case "TEMPLATE": return this.TemplateExpression();
            case "NUMBER": return this.NumberLiteral();
            case "STRING": return this.StringLiteral();
            case "{": return this.ObjectLiteral();
            case "(": return this.ParenExpression();
            case "[": return this.ArrayLiteral();

            case "IDENTIFIER":

                value = keywordFromToken(token);
                next = this.peekTokenAt("div", 1);

                if (!next.newlineBefore) {

                    if (next.type === "=>") {

                        this.pushContext(true);
                        return this.ArrowFunctionHead("", this.BindingIdentifier(), start);

                    } else if (next.type === "function") {

                        return this.FunctionExpression();

                    } else if (next.type === "IDENTIFIER" && value === "async") {

                        this.read();
                        this.pushContext(true);

                        var ident$0 = this.BindingIdentifier();

                        next = this.peekToken();

                        if (next.type !== "=>" || next.newlineBefore)
                            this.fail();

                        return this.ArrowFunctionHead(value, ident$0, start);
                    }
                }

                return this.Identifier(true);

            case "REGEX": return this.RegularExpression();

            case "null":
                this.read();
                return new AST.NullLiteral(token.start, token.end);

            case "true":
            case "false":
                this.read();
                return new AST.BooleanLiteral(type === "true", token.start, token.end);

            case "this":
                this.read();
                return new AST.ThisExpression(token.start, token.end);
        }

        this.unexpected(token);
    },

    Identifier: function(isVar) {

        var token = this.readToken("IDENTIFIER"),
            node = new AST.Identifier(token.value, isVar ? "variable" : "", token.start, token.end);

        this.checkIdentifier(node);
        return node;
    },

    IdentifierName: function() {

        var token = this.readToken("IDENTIFIER", "name");
        return new AST.Identifier(token.value, "", token.start, token.end);
    },

    AtName: function() {

        // TODO:  Only allow within class?  What about nested classes?

        var token = this.readToken("ATNAME");
        return new AST.AtName(token.value, token.start, token.end);
    },

    StringLiteral: function() {

        var token = this.readToken("STRING"),
            node = new AST.StringLiteral(token.value, token.start, token.end);

        if (token.strictError)
            this.addStrictError(token.strictError, node);

        return node;
    },

    NumberLiteral: function() {

        var token = this.readToken("NUMBER"),
            node = new AST.NumberLiteral(token.number, token.start, token.end);

        if (token.strictError)
            this.addStrictError(token.strictError, node);

        return node;
    },

    TemplatePart: function() {

        var token = this.readToken("TEMPLATE", "template"),
            end = token.templateEnd,
            node;

        node = new AST.TemplatePart(
            token.value,
            this.scanner.rawValue(token.start + 1, token.end - (end ? 1 : 2)),
            end,
            token.start,
            token.end);

        if (token.strictError)
            this.addStrictError(token.strictError, node);

        return node;
    },

    RegularExpression: function() {

        // TODO:  Validate regular expression against RegExp grammar (21.2.1)
        var token = this.readToken("REGEX");

        return new AST.RegularExpression(
            token.value,
            token.regexFlags,
            token.start,
            token.end);
    },

    BindingIdentifier: function() {

        var token = this.readToken("IDENTIFIER"),
            node = new AST.Identifier(token.value, "", token.start, token.end);

        this.checkBindingTarget(node);
        return node;
    },

    BindingPattern: function() {

        var node;

        switch (this.peek()) {

            case "{":
                node = this.ObjectLiteral();
                break;

            case "[":
                node = this.ArrayLiteral();
                break;

            default:
                return this.BindingIdentifier();
        }

        this.checkBindingTarget(node);
        return node;
    },

    ParenExpression: function() {

        var start = this.nodeStart(),
            next = null,
            rest = null;

        // Push a new context in case we are parsing an arrow function
        this.pushMaybeContext();

        this.read("(");

        if (this.peek() === ")") {

            next = this.peekTokenAt("", 1);

            if (next.newlineBefore || next.type !== "=>")
                this.fail();

            this.read(")");

            return this.ArrowFunctionHead("", null, start);
        }

        var expr = this.Expression();

        this.read(")");
        next = this.peekToken("div");

        if (!next.newlineBefore && next.type === "=>")
            return this.ArrowFunctionHead("", expr, start);

        // Collapse this context into its parent
        this.popContext(true);

        return new AST.ParenExpression(expr, start, this.nodeEnd());
    },

    ObjectLiteral: function() {

        var start = this.nodeStart(),
            comma = false,
            list = [],
            node;

        this.read("{");

        while (this.peekUntil("}", "name")) {

            if (!comma && node) {

                this.read(",");
                comma = true;

            } else {

                comma = false;
                list.push(node = this.PropertyDefinition());
            }
        }

        this.read("}");

        return new AST.ObjectLiteral(list, comma, start, this.nodeEnd());
    },

    PropertyDefinition: function() {

        if (this.peek("name") === "*")
            return this.MethodDefinition(null, "");

        var start = this.nodeStart(),
            node,
            name;

        switch (this.peekAt("name", 1)) {

            case "=":

                // Re-read token as an identifier
                this.unpeek();

                node = new AST.PatternProperty(
                    this.Identifier(true),
                    null,
                    (this.read(), this.AssignmentExpression()),
                    start,
                    this.nodeEnd());

                this.addInvalidNode("Invalid property definition in object literal", node);
                return node;

            case ",":
            case "}":

                // Re-read token as an identifier
                this.unpeek();

                return new AST.PropertyDefinition(
                    this.Identifier(true),
                    null,
                    start,
                    this.nodeEnd());
        }

        name = this.PropertyName();

        if (this.peek("name") === ":") {

            return new AST.PropertyDefinition(
                name,
                (this.read(), this.AssignmentExpression()),
                start,
                this.nodeEnd());
        }

        return this.MethodDefinition(name, "");
    },

    PropertyName: function(allowAtNames) {

        var token = this.peekToken("name");

        switch (token.type) {

            case "IDENTIFIER": return this.IdentifierName();
            case "STRING": return this.StringLiteral();
            case "NUMBER": return this.NumberLiteral();
            case "[": return this.ComputedPropertyName();
            case "ATNAME":
                if (allowAtNames) return this.AtName();
                else break;
        }

        this.unexpected(token);
    },

    ComputedPropertyName: function() {

        var start = this.nodeStart();

        this.read("[");
        var expr = this.AssignmentExpression();
        this.read("]");

        return new AST.ComputedPropertyName(expr, start, this.nodeEnd());
    },

    ArrayLiteral: function() {

        var start = this.nodeStart(),
            comma = false,
            list = [],
            type;

        this.read("[");

        while (type = this.peekUntil("]")) {

            if (type === ",") {

                this.read();
                comma = true;
                list.push(null);

            } else {

                list.push(this.AssignmentExpression(false, true));
                comma = false;

                if (this.peek() !== "]") {

                    this.read(",");
                    comma = true;
                }
            }
        }

        this.read("]");

        return new AST.ArrayLiteral(list, comma, start, this.nodeEnd());
    },

    TemplateExpression: function() {

        var atom = this.TemplatePart(),
            start = atom.start,
            lit = [atom],
            sub = [];

        while (!atom.templateEnd) {

            sub.push(this.Expression());

            // Discard any tokens that have been scanned using a different context
            this.unpeek();

            lit.push(atom = this.TemplatePart());
        }

        return new AST.TemplateExpression(lit, sub, start, this.nodeEnd());
    },

    // === Statements ===

    Statement: function(label) {

        var next;

        switch (this.peek()) {

            case "IDENTIFIER":

                if (this.peekAt("div", 1) === ":")
                    return this.LabelledStatement();

                return this.ExpressionStatement();

            case "{": return this.Block();
            case ";": return this.EmptyStatement();
            case "var": return this.VariableStatement();
            case "return": return this.ReturnStatement();
            case "break": return this.BreakStatement();
            case "continue": return this.ContinueStatement();
            case "throw": return this.ThrowStatement();
            case "debugger": return this.DebuggerStatement();
            case "if": return this.IfStatement();
            case "do": return this.DoWhileStatement(label);
            case "while": return this.WhileStatement(label);
            case "for": return this.ForStatement(label);
            case "with": return this.WithStatement();
            case "switch": return this.SwitchStatement();
            case "try": return this.TryStatement();

            default: return this.ExpressionStatement();
        }
    },

    Block: function() {

        var start = this.nodeStart();

        this.read("{");
        var list = this.StatementList(false, false);
        this.read("}");

        return new AST.Block(list, start, this.nodeEnd());
    },

    Semicolon: function() {

        var token = this.peekToken(),
            type = token.type;

        if (type === ";") {

            this.read();

        } else if (type === "}" || type === "EOF" || token.newlineBefore) {

            if (this.onASI && !this.onASI(token))
                this.unexpected(token);

        } else {

            this.unexpected(token);
        }
    },

    LabelledStatement: function() {

        var start = this.nodeStart(),
            label = this.Identifier(),
            name = label.value;

        if (this.getLabel(name) > 0)
            this.fail("Invalid label", label);

        this.read(":");

        this.setLabel(name, 1);
        var statement = this.Statement(name);
        this.setLabel(name, 0);

        return new AST.LabelledStatement(
            label,
            statement,
            start,
            this.nodeEnd());
    },

    ExpressionStatement: function() {

        var start = this.nodeStart(),
            expr = this.Expression();

        this.Semicolon();

        return new AST.ExpressionStatement(expr, start, this.nodeEnd());
    },

    EmptyStatement: function() {

        var start = this.nodeStart();

        this.Semicolon();

        return new AST.EmptyStatement(start, this.nodeEnd());
    },

    VariableStatement: function() {

        var node = this.VariableDeclaration(false);

        this.Semicolon();
        node.end = this.nodeEnd();

        return node;
    },

    VariableDeclaration: function(noIn) {

        var start = this.nodeStart(),
            token = this.peekToken(),
            kind = token.type,
            list = [];

        switch (kind) {

            case "var":
            case "const":
                break;

            case "IDENTIFIER":

                if (token.value === "let") {

                    kind = "let";
                    break;
                }

            default:
                this.fail("Expected var, const, or let");
        }

        this.read();

        while (true) {

            list.push(this.VariableDeclarator(noIn, kind));

            if (this.peek() === ",") this.read();
            else break;
        }

        return new AST.VariableDeclaration(kind, list, start, this.nodeEnd());
    },

    VariableDeclarator: function(noIn, kind) {

        var start = this.nodeStart(),
            pattern = this.BindingPattern(),
            init = null;

        if ((!noIn && pattern.type !== "Identifier") || this.peek() === "=") {

            // NOTE: Patterns must have initializers when not in declaration
            // section of a for statement

            this.read();
            init = this.AssignmentExpression(noIn);

        } else if (kind === "const") {

            this.fail("Missing const initializer", pattern);
        }

        return new AST.VariableDeclarator(pattern, init, start, this.nodeEnd());
    },

    ReturnStatement: function() {

        if (!this.context.isFunction)
            this.fail("Return statement outside of function");

        var start = this.nodeStart();

        this.read("return");
        var value = this.peekEnd() ? null : this.Expression();

        this.Semicolon();

        return new AST.ReturnStatement(value, start, this.nodeEnd());
    },

    BreakStatement: function() {

        var start = this.nodeStart(),
            context = this.context;

        this.read("break");
        var label = this.peekEnd() ? null : this.Identifier();
        this.Semicolon();

        var node = new AST.BreakStatement(label, start, this.nodeEnd());

        if (label) {

            if (this.getLabel(label.value) === 0)
                this.fail("Invalid label", label);

        } else if (context.loopDepth === 0 && context.switchDepth === 0) {

            this.fail("Break not contained within a switch or loop", node);
        }

        return node;
    },

    ContinueStatement: function() {

        var start = this.nodeStart(),
            context = this.context;

        this.read("continue");
        var label = this.peekEnd() ? null : this.Identifier();
        this.Semicolon();

        var node = new AST.ContinueStatement(label, start, this.nodeEnd());

        if (label) {

            if (this.getLabel(label.value) !== 2)
                this.fail("Invalid label", label);

        } else if (context.loopDepth === 0) {

            this.fail("Continue not contained within a loop", node);
        }

        return node;
    },

    ThrowStatement: function() {

        var start = this.nodeStart();

        this.read("throw");

        var expr = this.peekEnd() ? null : this.Expression();

        if (expr === null)
            this.fail("Missing throw expression");

        this.Semicolon();

        return new AST.ThrowStatement(expr, start, this.nodeEnd());
    },

    DebuggerStatement: function() {

        var start = this.nodeStart();

        this.read("debugger");
        this.Semicolon();

        return new AST.DebuggerStatement(start, this.nodeEnd());
    },

    IfStatement: function() {

        var start = this.nodeStart();

        this.read("if");
        this.read("(");

        var test = this.Expression(),
            body = null,
            elseBody = null;

        this.read(")");
        body = this.Statement();

        if (this.peek() === "else") {

            this.read();
            elseBody = this.Statement();
        }

        return new AST.IfStatement(test, body, elseBody, start, this.nodeEnd());
    },

    DoWhileStatement: function(label) {

        var start = this.nodeStart(),
            body,
            test;

        if (label)
            this.setLabel(label, 2);

        this.read("do");

        this.context.loopDepth += 1;
        body = this.Statement();
        this.context.loopDepth -= 1;

        this.read("while");
        this.read("(");

        test = this.Expression();

        this.read(")");

        return new AST.DoWhileStatement(body, test, start, this.nodeEnd());
    },

    WhileStatement: function(label) {

        var start = this.nodeStart();

        if (label)
            this.setLabel(label, 2);

        this.read("while");
        this.read("(");
        var expr = this.Expression();
        this.read(")");

        this.context.loopDepth += 1;
        var statement = this.Statement();
        this.context.loopDepth -= 1;

        return new AST.WhileStatement(
            expr,
            statement,
            start,
            this.nodeEnd());
    },

    ForStatement: function(label) {

        var start = this.nodeStart(),
            init = null,
            async = false,
            test,
            step;

        if (label)
            this.setLabel(label, 2);

        this.read("for");

        if (this.peekAwait()) {

            this.read();
            async = true;
        }

        this.read("(");

        // Get loop initializer
        switch (this.peek()) {

            case ";":
                break;

            case "var":
            case "const":
                init = this.VariableDeclaration(true);
                break;

            case "IDENTIFIER":

                if (this.peekLet()) {

                    init = this.VariableDeclaration(true);
                    break;
                }

            default:
                init = this.Expression(true);
                break;
        }

        if (async || init && this.peekKeyword("of"))
            return this.ForOfStatement(async, init, start);

        if (init && this.peek() === "in")
            return this.ForInStatement(init, start);

        this.read(";");
        test = this.peek() === ";" ? null : this.Expression();

        this.read(";");
        step = this.peek() === ")" ? null : this.Expression();

        this.read(")");

        this.context.loopDepth += 1;
        var statement = this.Statement();
        this.context.loopDepth -= 1;

        return new AST.ForStatement(
            init,
            test,
            step,
            statement,
            start,
            this.nodeEnd());
    },

    ForInStatement: function(init, start) {

        this.checkForInit(init, "in");

        this.read("in");
        var expr = this.Expression();
        this.read(")");

        this.context.loopDepth += 1;
        var statement = this.Statement();
        this.context.loopDepth -= 1;

        return new AST.ForInStatement(
            init,
            expr,
            statement,
            start,
            this.nodeEnd());
    },

    ForOfStatement: function(async, init, start) {

        this.checkForInit(init, "of");

        this.readKeyword("of");
        var expr = this.AssignmentExpression();
        this.read(")");

        this.context.loopDepth += 1;
        var statement = this.Statement();
        this.context.loopDepth -= 1;

        return new AST.ForOfStatement(
            async,
            init,
            expr,
            statement,
            start,
            this.nodeEnd());
    },

    WithStatement: function() {

        var start = this.nodeStart();

        this.read("with");
        this.read("(");

        var node = new AST.WithStatement(
            this.Expression(),
            (this.read(")"), this.Statement()),
            start,
            this.nodeEnd());

        this.addStrictError("With statement is not allowed in strict mode", node);

        return node;
    },

    SwitchStatement: function() {

        var start = this.nodeStart();

        this.read("switch");
        this.read("(");

        var head = this.Expression(),
            hasDefault = false,
            cases = [],
            node;

        this.read(")");
        this.read("{");
        this.context.switchDepth += 1;

        while (this.peekUntil("}")) {

            node = this.SwitchCase();

            if (node.test === null) {

                if (hasDefault)
                    this.fail("Switch statement cannot have more than one default", node);

                hasDefault = true;
            }

            cases.push(node);
        }

        this.context.switchDepth -= 1;
        this.read("}");

        return new AST.SwitchStatement(head, cases, start, this.nodeEnd());
    },

    SwitchCase: function() {

        var start = this.nodeStart(),
            expr = null,
            list = [],
            type;

        if (this.peek() === "default") {

            this.read();

        } else {

            this.read("case");
            expr = this.Expression();
        }

        this.read(":");

        while (type = this.peekUntil("}")) {

            if (type === "case" || type === "default")
                break;

            list.push(this.Declaration(false));
        }

        return new AST.SwitchCase(expr, list, start, this.nodeEnd());
    },

    TryStatement: function() {

        var start = this.nodeStart();

        this.read("try");

        var tryBlock = this.Block(),
            handler = null,
            fin = null;

        if (this.peek() === "catch")
            handler = this.CatchClause();

        if (this.peek() === "finally") {

            this.read("finally");
            fin = this.Block();
        }

        return new AST.TryStatement(tryBlock, handler, fin, start, this.nodeEnd());
    },

    CatchClause: function() {

        var start = this.nodeStart();

        this.read("catch");
        this.read("(");
        var param = this.BindingPattern();
        this.read(")");

        return new AST.CatchClause(param, this.Block(), start, this.nodeEnd());
    },

    // === Declarations ===

    StatementList: function(prologue, isModule) {

        var list = [],
            node,
            expr,
            dir;

        // TODO: is this wrong for braceless statement lists?
        while (this.peekUntil("}")) {

            node = this.Declaration(isModule);

            // Check for directives
            if (prologue) {

                if (node.type === "ExpressionStatement" &&
                    node.expression.type === "StringLiteral") {

                    // Get the non-escaped literal text of the string
                    expr = node.expression;
                    dir = this.input.slice(expr.start + 1, expr.end - 1);

                    if (isDirective(dir)) {

                        node = new AST.Directive(dir, expr, node.start, node.end);

                        // Check for strict mode
                        if (dir === "use strict")
                            this.setStrict(true);
                    }

                } else {

                    prologue = false;
                }
            }

            list.push(node);
        }

        return list;
    },

    Declaration: function(isModule) {

        switch (this.peek()) {

            case "function": return this.FunctionDeclaration();
            case "class": return this.ClassDeclaration();
            case "const": return this.LexicalDeclaration();

            case "import":

                if (isModule)
                    return this.ImportDeclaration();

            case "export":

                if (isModule)
                    return this.ExportDeclaration();

                break;

            case "IDENTIFIER":

                if (this.peekLet())
                    return this.LexicalDeclaration();

                if (this.peekAsync() === "function")
                    return this.FunctionDeclaration();

                break;
        }

        return this.Statement();
    },

    LexicalDeclaration: function() {

        var node = this.VariableDeclaration(false);

        this.Semicolon();
        node.end = this.nodeEnd();

        return node;
    },

    // === Functions ===

    FunctionDeclaration: function() {

        var start = this.nodeStart(),
            kind = "",
            token;

        token = this.peekToken();

        if (keywordFromToken(token) === "async") {

            this.read();
            kind = "async";
        }

        this.read("function");

        if (this.peek() === "*") {

            this.read();
            kind = kind ? kind + "-generator" : "generator";
        }

        this.pushContext();
        this.setFunctionType(kind);

        var ident = this.BindingIdentifier(),
            params = this.FormalParameters(),
            body = this.FunctionBody();

        this.checkParameters(params);
        this.popContext();

        return new AST.FunctionDeclaration(
            kind,
            ident,
            params,
            body,
            start,
            this.nodeEnd());
    },

    FunctionExpression: function() {

        var start = this.nodeStart(),
            ident = null,
            kind = "",
            token;

        token = this.peekToken();

        if (keywordFromToken(token) === "async") {

            this.read();
            kind = "async";
        }

        this.read("function");

        if (this.peek() === "*") {

            this.read();
            kind = kind ? kind + "-generator" : "generator";
        }

        this.pushContext();
        this.setFunctionType(kind);

        if (this.peek() !== "(")
            ident = this.BindingIdentifier();

        var params = this.FormalParameters(),
            body = this.FunctionBody();

        this.checkParameters(params);
        this.popContext();

        return new AST.FunctionExpression(
            kind,
            ident,
            params,
            body,
            start,
            this.nodeEnd());
    },

    MethodDefinition: function(name, kind, isClass) {

        var start = name ? name.start : this.nodeStart();

        if (!name && this.peek("name") === "*") {

            this.read();

            kind = "generator";
            name = this.PropertyName(isClass);

        } else {

            if (!name)
                name = this.PropertyName(isClass);

            var val$0 = keywordFromNode(name);

            if (this.peek("name") !== "(") {

                if (val$0 === "get" || val$0 === "set" || val$0 === "async") {

                    kind = name.value;

                    if (kind === "async" && this.peek("name") === "*") {

                        this.read();
                        kind += "-generator";
                    }

                    name = this.PropertyName();
                }
            }
        }

        this.pushContext();
        this.setFunctionType(kind);
        this.context.isMethod = true;
        this.context.isConstructor = kind === "constructor";

        var params = kind === "get" || kind === "set" ?
            this.AccessorParameters(kind) :
            this.FormalParameters();

        var body = this.FunctionBody();

        this.checkParameters(params);
        this.popContext();

        return new AST.MethodDefinition(
            false,
            kind,
            name,
            params,
            body,
            start,
            this.nodeEnd());
    },

    AccessorParameters: function(kind) {

        var list = [];

        this.read("(");

        if (kind === "set")
            list.push(this.FormalParameter(false));

        this.read(")");

        return list;
    },

    FormalParameters: function() {

        var list = [];

        this.read("(");

        while (this.peekUntil(")")) {

            if (list.length > 0)
                this.read(",");

            // Parameter list may have a trailing rest parameter
            if (this.peek() === "...") {

                list.push(this.RestParameter());
                break;
            }

            list.push(this.FormalParameter(true));
        }

        this.read(")");

        return list;
    },

    FormalParameter: function(allowDefault) {

        var start = this.nodeStart(),
            pattern = this.BindingPattern(),
            init = null;

        if (allowDefault && this.peek() === "=") {

            this.read();
            init = this.AssignmentExpression();
        }

        return new AST.FormalParameter(pattern, init, start, this.nodeEnd());
    },

    RestParameter: function() {

        var start = this.nodeStart();

        this.read("...");

        return new AST.RestParameter(this.BindingIdentifier(), start, this.nodeEnd());
    },

    FunctionBody: function() {

        this.context.functionBody = true;

        var start = this.nodeStart();

        this.read("{");
        var statements = this.StatementList(true, false);
        this.read("}");

        return new AST.FunctionBody(statements, start, this.nodeEnd());
    },

    ArrowFunctionHead: function(kind, formals, start) {

        // Context must have been pushed by caller
        this.setFunctionType(kind);

        if (this.context.hasYieldAwait)
            this.fail("Invalid yield or await within arrow function head");

        // Transform and validate formal parameters
        var params = this.checkArrowParameters(formals);

        return new AST.ArrowFunctionHead(params, start, this.nodeEnd());
    },

    ArrowFunctionBody: function(head, noIn) {

        this.read("=>");

        var params = head.parameters,
            start = head.start,
            kind = this.context.isAsync ? "async" : "";

        // Use function body context even if parsing expression body form
        this.context.functionBody = true;

        var body = this.peek() === "{" ?
            this.FunctionBody() :
            this.AssignmentExpression(noIn);

        this.popContext();

        return new AST.ArrowFunction(kind, params, body, start, this.nodeEnd());
    },

    // === Classes ===

    ClassDeclaration: function() {

        var start = this.nodeStart(),
            ident = null,
            base = null;

        this.read("class");

        ident = this.BindingIdentifier();

        if (this.peek() === "extends") {

            this.read();
            base = this.MemberExpression(true);
        }

        return new AST.ClassDeclaration(
            ident,
            base,
            this.ClassBody(),
            start,
            this.nodeEnd());
    },

    ClassExpression: function() {

        var start = this.nodeStart(),
            ident = null,
            base = null;

        this.read("class");

        if (this.peek() === "IDENTIFIER")
            ident = this.BindingIdentifier();

        if (this.peek() === "extends") {

            this.read();
            base = this.MemberExpression(true);
        }

        return new AST.ClassExpression(
            ident,
            base,
            this.ClassBody(),
            start,
            this.nodeEnd());
    },

    ClassBody: function() {

        var start = this.nodeStart(),
            hasConstructor = false,
            hasBlock = false,
            atNames = new AtNameSet(this),
            list = [];

        this.pushContext();
        this.setStrict(true);
        this.read("{");

        while (this.peekUntil("}", "name")) {

            var elem$0 = this.ClassElement();

            switch (elem$0.type) {

                case "MethodDefinition":

                    if (elem$0.kind === "constructor") {

                        if (hasConstructor)
                            this.fail("Duplicate constructor definitions", elem$0.name);

                        hasConstructor = true;
                    }

                    atNames.add(elem$0.name, elem$0.kind);
                    break;

                case "PrivateDeclaration":
                    atNames.add(elem$0.name, "");
                    break;
            }

            list.push(elem$0);
        }

        this.read("}");
        this.popContext();

        return new AST.ClassBody(list, start, this.nodeEnd());
    },

    PrivateDeclaration: function(start, isStatic) {

        var name = this.AtName(),
            init = null;

        if (this.peek() === "=") {

            this.read();
            init = this.AssignmentExpression();
        }

        this.Semicolon();

        return new AST.PrivateDeclaration(isStatic, name, init, start, this.nodeEnd());
    },

    EmptyClassElement: function() {

        var start = this.nodeStart();

        this.read(";");

        return new AST.EmptyClassElement(start, this.nodeEnd());
    },

    ClassElement: function() {

        var token = this.peekToken("name"),
            start = token.start,
            isStatic = false;

        if (token.type === ";")
            return this.EmptyClassElement();

        if (token.type === "IDENTIFIER" &&
            token.value === "static") {

            switch (this.peekAt("name", 1)) {

                case "(":
                    break;

                default:
                    this.read();
                    isStatic = true;
            }
        }

        if (this.peek("name") === "ATNAME" && this.peekAt("name", 1) !== "(")
            return this.PrivateDeclaration(start, isStatic);

        token = this.peekToken("name");

        var kind = "";

        if (!isStatic && token.type === "IDENTIFIER" && token.value === "constructor")
            kind = "constructor";

        var method = this.MethodDefinition(null, kind, true),
            name = method.name;

        if (isStatic) {

            if (name.type === "Identifier" && name.value === "prototype")
                this.fail("Invalid prototype property in class definition", name);

        } else if (name.type === "Identifier" && name.value === "constructor") {

            if (method.kind !== "constructor")
                this.fail("Invalid constructor property in class definition", name);
        }

        method.start = start;
        method.static = isStatic;

        return method;
    },

    // === Modules ===

    ImportDeclaration: function() {

        var start = this.nodeStart(),
            imports = null,
            from;

        this.read("import");

        switch (this.peek()) {

            case "*":
                imports = this.NamespaceImport();
                break;

            case "{":
                imports = this.NamedImports();
                break;

            case "STRING":
                from = this.StringLiteral();
                break;

            default:
                imports = this.DefaultImport();
                break;
        }

        if (!from) {

            this.readKeyword("from");
            from = this.StringLiteral();
        }

        this.Semicolon();

        return new AST.ImportDeclaration(imports, from, start, this.nodeEnd());
    },

    DefaultImport: function() {

        var start = this.nodeStart(),
            ident = this.BindingIdentifier(),
            extra = null;

        if (this.peek() === ",") {

            this.read();

            switch (this.peek()) {

                case "*":
                    extra = this.NamespaceImport();
                    break;

                case "{":
                    extra = this.NamedImports();
                    break;

                default:
                    this.fail();
            }
        }

        return new AST.DefaultImport(ident, extra, start, this.nodeEnd());
    },

    NamespaceImport: function() {

        var start = this.nodeStart(),
            ident;

        this.read("*");
        this.readKeyword("as");
        ident = this.BindingIdentifier();

        return new AST.NamespaceImport(ident, start, this.nodeEnd());
    },

    NamedImports: function() {

        var start = this.nodeStart(),
            list = [];

        this.read("{");

        while (this.peekUntil("}")) {

            list.push(this.ImportSpecifier());

            if (this.peek() === ",")
                this.read();
        }

        this.read("}");

        return new AST.NamedImports(list, start, this.nodeEnd());
    },

    ImportSpecifier: function() {

        var start = this.nodeStart(),
            hasLocal = false,
            local = null,
            remote;

        if (this.peek() !== "IDENTIFIER") {

            // Re-scan token as an identifier name
            this.unpeek();
            remote = this.IdentifierName();
            hasLocal = true;

        } else {

            remote = this.Identifier();
            hasLocal = this.peekKeyword("as");
        }

        if (hasLocal) {

            this.readKeyword("as");
            local = this.BindingIdentifier();

        } else {

            this.checkBindingTarget(remote);
        }

        return new AST.ImportSpecifier(remote, local, start, this.nodeEnd());
    },

    ExportDeclaration: function() {

        var start = this.nodeStart(),
            decl;

        this.read("export");

        switch (this.peek()) {

            case "default":
                return this.ExportDefault(start);

            case "*":
                return this.ExportNamespace(start);

            case "{":
                return this.ExportNameList(start);

            case "var":
            case "const":
                decl = this.LexicalDeclaration();
                break;

            case "function":
                decl = this.FunctionDeclaration();
                break;

            case "class":
                decl = this.ClassDeclaration();
                break;

            case "IDENTIFIER":

                if (this.peekLet())
                    decl = this.LexicalDeclaration();
                else if (this.peekAsync() === "function")
                    decl = this.FunctionDeclaration();
                else
                    return this.ExportDefaultFrom(start);

                break;

            default:
                this.fail();
        }

        return new AST.ExportDeclaration(decl, start, this.nodeEnd());
    },

    ExportDefault: function(start) {

        var binding;

        this.read("default");

        switch (this.peek()) {

            case "class":
                binding = this.ClassExpression();
                break;

            case "function":
                binding = this.FunctionExpression();
                break;

            case "IDENTIFIER":

                if (this.peekAsync() === "function") {

                    binding = this.FunctionExpression();
                    break;
                }

            default:
                binding = this.AssignmentExpression();
                break;
        }

        var isDecl = this.transformDefaultExport(binding);

        if (!isDecl)
            this.Semicolon();

        return new AST.ExportDefault(binding, start, this.nodeEnd());
    },

    ExportNameList: function(start) { var __this = this; 

        var list = [],
            from = null;

        this.read("{");

        while (this.peekUntil("}", "name")) {

            list.push(this.ExportSpecifier());

            if (this.peek() === ",")
                this.read();
        }

        this.read("}");

        if (this.peekKeyword("from")) {

            this.read();
            from = this.StringLiteral();

        } else {

            // Transform identifier names to identifiers
            list.forEach(function(node) { return __this.transformIdentifier(node.local); });
        }

        this.Semicolon();

        return new AST.ExportNameList(list, from, start, this.nodeEnd());
    },

    ExportDefaultFrom: function(start) {

        var name = this.Identifier();

        this.readKeyword("from");
        var from = this.StringLiteral();
        this.Semicolon();

        return new AST.ExportDefaultFrom(name, from, start, this.nodeEnd());
    },

    ExportNamespace: function(start) {

        var ident = null;

        this.read("*");

        if (this.peekKeyword("as")) {

            this.read();
            ident = this.BindingIdentifier();
        }

        this.readKeyword("from");
        var from = this.StringLiteral();
        this.Semicolon();

        return new AST.ExportNamespace(ident, from, start, this.nodeEnd());
    },

    ExportSpecifier: function() {

        var start = this.nodeStart(),
            local = this.IdentifierName(),
            remote = null;

        if (this.peekKeyword("as")) {

            this.read();
            remote = this.IdentifierName();
        }

        return new AST.ExportSpecifier(local, remote, start, this.nodeEnd());
    }});

 });

function mixin(target) { var __$0, __$1; for (var sources = [], __$2 = 1; __$2 < arguments.length; ++__$2) sources.push(arguments[__$2]); 

    target = target.prototype;

    var ownNames = (__$0 = _esdown.objd(Object), __$0.getOwnPropertyNames), ownSymbols = __$0.getOwnPropertySymbols, ownDesc = __$0.getOwnPropertyDescriptor, hasOwn = (__$1 = _esdown.objd(__$0.prototype), __$1.hasOwnProperty)



;

    sources
    .map(function(source) { return source.prototype; })
    .forEach(function(source) { return ownNames(source)
        .concat(ownSymbols(source))
        .filter(function(key) { return !hasOwn.call(target, key); })
        .forEach(function(key) { return Object.defineProperty(target, key, ownDesc(source, key)); }); }
);
}

// Add externally defined methods
mixin(Parser, Transform, Validate);

exports.Parser = Parser;


},
22, function(module, exports) {

// TODO:  How we deal with the insanity that is with statements?
// TODO:  Param scopes have empty free lists, which is strange

var Scope = _esdown.class(function(__) { var Scope;

    __({ constructor: Scope = function(type) {

        this.type = type || "block";
        this.names = Object.create(null);
        this.free = [];
        this.strict = false;
        this.parent = null;
        this.children = [];
        this.varNames = [];
    },

    resolveName: function(name) {

        if (this.names[name])
            return this.names[name];

        if (this.parent)
            return this.parent.resolveName(name);

        return null;
    }});
 });

var ScopeResolver = _esdown.class(function(__) { var ScopeResolver; __({ constructor: ScopeResolver = function() {} });

    __({ resolve: function(parseResult) {

        this.parseResult = parseResult;
        this.stack = [];
        this.top = new Scope("var");

        this.visit(parseResult.ast);
        this.flushFree();

        parseResult.scopeTree = this.top;
    },

   fail: function(msg, node) {

        throw this.parseResult.createSyntaxError(msg, node);
    },

    pushScope: function(type) {

        var strict = this.top.strict;
        this.stack.push(this.top);
        this.top = new Scope(type);
        this.top.strict = strict;

        return this.top;
    },

    flushFree: function() {

        var map = this.top.names,
            free = this.top.free,
            next = null,
            freeList = [];

        if (this.stack.length > 0)
            next = this.stack[this.stack.length - 1];

        this.top.free = freeList;

        free.forEach(function(r) {

            var name = r.value;

            if (map[name]) {

                map[name].references.push(r);

            } else {

                freeList.push(r);

                if (next)
                    next.free.push(r);
            }
        });
    },

    linkScope: function(child) {

        var p = this.top;
        child.parent = p;
        p.children.push(child);
    },

    popScope: function() { var __this = this; 

        var scope = this.top,
            varNames = scope.varNames,
            free = scope.free;

        scope.varNames = null;

        this.flushFree();
        this.top = this.stack.pop();
        this.linkScope(scope);

        varNames.forEach(function(n) {

            if (scope.names[n.value])
                __this.fail("Cannot shadow lexical declaration with var", n);
            else if (__this.top.type === "var")
                __this.addName(n, "var");
            else
                __this.top.varNames.push(n);
        });
    },

    visit: function(node, kind) { var __this = this; 

        if (!node)
            return;

        var f = this[node.type];

        if (typeof f === "function")
            f.call(this, node, kind);
        else
            node.children().forEach(function(n) { return __this.visit(n, kind); });
    },

    hasStrictDirective: function(statements) {

        for (var i$0 = 0; i$0 < statements.length; ++i$0) {

            var n$0 = statements[i$0];

            if (n$0.type !== "Directive")
                break;

            if (n$0.value === "use strict")
                return true;
        }

        return false;
    },

    visitFunction: function(params, body, strictParams) { var __this = this; 

        var paramScope = this.pushScope("param");

        if (!this.top.strict &&
            body.statements &&
            this.hasStrictDirective(body.statements)) {

            this.top.strict = true;
        }

        strictParams = strictParams || this.top.strict;

        params.forEach(function(n) {

            if (!strictParams && (
                n.type !== "FormalParameter" ||
                n.initializer ||
                n.pattern.type !== "Identifier")) {

                strictParams = true;
            }

            __this.visit(n, "param");
            __this.flushFree();
            __this.top.free.length = 0;
        });

        this.pushScope("var");
        var blockScope = this.pushScope("block");
        this.visit(body, "var");
        this.popScope();
        this.popScope();

        this.popScope();

        Object.keys(paramScope.names).forEach(function(name) {

            if (blockScope.names[name])
                __this.fail("Duplicate block declaration", blockScope.names[name].declarations[0]);

            if (strictParams && paramScope.names[name].declarations.length > 1)
                __this.fail("Duplicate parameter names", paramScope.names[name].declarations[1]);
        });
    },

    addReference: function(node) {

        var name = node.value,
            map = this.top.names,
            next = this.stack[this.stack.length - 1];

        if (map[name]) map[name].references.push(node);
        else top.free.push(node);
    },

    addName: function(node, kind) {

        var name = node.value,
            map = this.top.names,
            record = map[name];

        if (record) {

            if (kind !== "var" && kind !== "param")
                this.fail("Duplicate variable declaration", node);

        } else {

            if (name === "let" && (kind === "let" || kind === "const"))
                this.fail("Invalid binding identifier", node);

            map[name] = record = {

                declarations: [],
                references: [],
                const: kind === "const"
            };
        }

        record.declarations.push(node);
    },

    Script: function(node) { var __this = this; 

        this.pushScope("block");

        if (this.hasStrictDirective(node.statements))
            this.top.strict = true;

        node.children().forEach(function(n) { return __this.visit(n, "var"); });

        this.popScope();
    },

    Module: function(node) { var __this = this; 

        this.pushScope("block");
        this.top.strict = true;
        node.children().forEach(function(n) { return __this.visit(n, "var"); });
        this.popScope();
    },

    Block: function(node) { var __this = this; 

        this.pushScope("block");
        node.children().forEach(function(n) { return __this.visit(n); });
        this.popScope();
    },

    SwitchStatement: function(node) {

        this.Block(node);
    },

    ForOfStatement: function(node) {

        this.ForStatement(node);
    },

    ForInStatement: function(node) {

        this.ForStatement(node);
    },

    ForStatement: function(node) { var __this = this; 

        this.pushScope("for");
        node.children().forEach(function(n) { return __this.visit(n); });
        this.popScope();
    },

    CatchClause: function(node) { var __this = this; 

        this.pushScope("catch");
        this.visit(node.param);
        node.body.children().forEach(function(n) { return __this.visit(n); });
        this.popScope();
    },

    VariableDeclaration: function(node) { var __this = this; 

        node.children().forEach(function(n) { return __this.visit(n, node.kind); });
    },

    FunctionDeclaration: function(node, kind) {

        this.visit(node.identifier, kind);
        this.pushScope("function");
        this.visitFunction(node.params, node.body, false);
        this.popScope();
    },

    FunctionExpression: function(node) {

        this.pushScope("function");
        this.visit(node.identifier);
        this.visitFunction(node.params, node.body, false);
        this.popScope();
    },

    MethodDefinition: function(node) {

        this.pushScope("function");
        this.visitFunction(node.params, node.body, true);
        this.popScope();
    },

    ArrowFunction: function(node) {

        this.pushScope("function");
        this.visitFunction(node.params, node.body, true);
        this.popScope();
    },

    ClassDeclaration: function(node) {

        this.visit(node.identifier, "let");
        this.pushScope("class");
        this.top.strict = true;
        this.visit(node.base);
        this.visit(node.body);
        this.popScope();
    },

    ClassExpression: function(node) {

        this.pushScope("class");
        this.top.strict = true;
        this.visit(node.identifier);
        this.visit(node.base);
        this.visit(node.body);
        this.popScope();
    },

    Identifier: function(node, kind) {

        switch (node.context) {

            case "variable":
                this.top.free.push(node);
                break;

            case "declaration":
                if (kind === "var" && this.top.type !== "var")
                    this.top.varNames.push(node);
                else
                    this.addName(node, kind);
                break;
        }
    }});

 });

exports.ScopeResolver = ScopeResolver;


},
17, function(module, exports) {

var Parser = __M(21).Parser;
var ScopeResolver = __M(22).ScopeResolver;
var AST = __M(23);

function addParentLinks(node) {

    node.children().forEach(function(child) {

        child.parent = node;
        addParentLinks(child);
    });
}

function parse(input, options) {

    options = options || {};

    var result = new Parser().parse(input, options);

    if (options.resolveScopes)
        new ScopeResolver().resolve(result);

    if (options.addParentLinks)
        addParentLinks(result.ast);

    return result;
}







exports.AST = AST;
exports.parse = parse;


},
8, function(module, exports) {

Object.keys(__M(17)).forEach(function(k) { exports[k] = __M(17)[k]; });


},
15, function(module, exports) {

var Runtime = {};

Runtime.API = 

"var VERSION = \"1.0.2\";\n\
\n\
var GLOBAL = (function() {\n\
\n\
    try { return global.global } catch (x) {}\n\
    try { return self.self } catch (x) {}\n\
    return null;\n\
})();\n\
\n\
var ownNames = Object.getOwnPropertyNames,\n\
      ownSymbols = Object.getOwnPropertySymbols,\n\
      getDesc = Object.getOwnPropertyDescriptor,\n\
      defineProp = Object.defineProperty;\n\
\n\
function toObject(val) {\n\
\n\
    if (val == null) // null or undefined\n\
        throw new TypeError(val + \" is not an object\");\n\
\n\
    return Object(val);\n\
}\n\
\n\
// Iterates over the descriptors for each own property of an object\n\
function forEachDesc(obj, fn) {\n\
\n\
    ownNames(obj).forEach(function(name) { return fn(name, getDesc(obj, name)); });\n\
    if (ownSymbols) ownSymbols(obj).forEach(function(name) { return fn(name, getDesc(obj, name)); });\n\
}\n\
\n\
// Installs a property into an object, merging \"get\" and \"set\" functions\n\
function mergeProp(target, name, desc, enumerable) {\n\
\n\
    if (desc.get || desc.set) {\n\
\n\
        var d$0 = { configurable: true };\n\
        if (desc.get) d$0.get = desc.get;\n\
        if (desc.set) d$0.set = desc.set;\n\
        desc = d$0;\n\
    }\n\
\n\
    desc.enumerable = enumerable;\n\
    defineProp(target, name, desc);\n\
}\n\
\n\
// Installs properties on an object, merging \"get\" and \"set\" functions\n\
function mergeProps(target, source, enumerable) {\n\
\n\
    forEachDesc(source, function(name, desc) { return mergeProp(target, name, desc, enumerable); });\n\
}\n\
\n\
// Builds a class\n\
function makeClass(def) {\n\
\n\
    var parent = Object.prototype,\n\
        proto = Object.create(parent),\n\
        statics = {};\n\
\n\
    def(function(obj) { return mergeProps(proto, obj, false); },\n\
        function(obj) { return mergeProps(statics, obj, false); });\n\
\n\
    var ctor = proto.constructor;\n\
    ctor.prototype = proto;\n\
\n\
    // Set class \"static\" methods\n\
    forEachDesc(statics, function(name, desc) { return defineProp(ctor, name, desc); });\n\
\n\
    return ctor;\n\
}\n\
\n\
// Support for computed property names\n\
function computed(target) {\n\
\n\
    for (var i$0 = 1; i$0 < arguments.length; i$0 += 3) {\n\
\n\
        var desc$0 = getDesc(arguments[i$0 + 1], \"_\");\n\
        mergeProp(target, arguments[i$0], desc$0, true);\n\
\n\
        if (i$0 + 2 < arguments.length)\n\
            mergeProps(target, arguments[i$0 + 2], true);\n\
    }\n\
\n\
    return target;\n\
}\n\
\n\
// Support for async functions\n\
function asyncFunction(iter) {\n\
\n\
    return new Promise(function(resolve, reject) {\n\
\n\
        resume(\"next\", void 0);\n\
\n\
        function resume(type, value) {\n\
\n\
            try {\n\
\n\
                var result$0 = iter[type](value);\n\
\n\
                if (result$0.done) {\n\
\n\
                    resolve(result$0.value);\n\
\n\
                } else {\n\
\n\
                    Promise.resolve(result$0.value).then(\n\
                        function(x) { return resume(\"next\", x); },\n\
                        function(x) { return resume(\"throw\", x); });\n\
                }\n\
\n\
            } catch (x) { reject(x) }\n\
        }\n\
    });\n\
}\n\
\n\
// Support for async generators\n\
function asyncGenerator(iter) {\n\
\n\
    var front = null, back = null;\n\
\n\
    var aIter = {\n\
\n\
        next: function(val) { return send(\"next\", val) },\n\
        throw: function(val) { return send(\"throw\", val) },\n\
        return: function(val) { return send(\"return\", val) },\n\
    };\n\
\n\
    aIter[Symbol.asyncIterator] = function() { return this };\n\
    return aIter;\n\
\n\
    function send(type, value) {\n\
\n\
        return new Promise(function(resolve, reject) {\n\
\n\
            var x = { type: type, value: value, resolve: resolve, reject: reject, next: null };\n\
\n\
            if (back) {\n\
\n\
                // If list is not empty, then push onto the end\n\
                back = back.next = x;\n\
\n\
            } else {\n\
\n\
                // Create new list and resume generator\n\
                front = back = x;\n\
                resume(type, value);\n\
            }\n\
        });\n\
    }\n\
\n\
    function fulfill(type, value) {\n\
\n\
        switch (type) {\n\
\n\
            case \"return\":\n\
                front.resolve({ value: value, done: true });\n\
                break;\n\
\n\
            case \"throw\":\n\
                front.reject(value);\n\
                break;\n\
\n\
            default:\n\
                front.resolve({ value: value, done: false });\n\
                break;\n\
        }\n\
\n\
        front = front.next;\n\
\n\
        if (front) resume(front.type, front.value);\n\
        else back = null;\n\
    }\n\
\n\
    function awaitValue(result) {\n\
\n\
        var value = result.value;\n\
\n\
        if (typeof value === \"object\" && \"_esdown_await\" in value) {\n\
\n\
            if (result.done)\n\
                throw new Error(\"Invalid async generator return\");\n\
\n\
            return value._esdown_await;\n\
        }\n\
\n\
        return null;\n\
    }\n\
\n\
    function resume(type, value) {\n\
\n\
        // HACK: If the generator does not support the \"return\" method, then\n\
        // emulate it (poorly) using throw.  (V8 circa 2015-02-13 does not support\n\
        // generator.return.)\n\
        if (type === \"return\" && !(type in iter)) {\n\
\n\
            type = \"throw\";\n\
            value = { value: value, __return: true };\n\
        }\n\
\n\
        try {\n\
\n\
            var result$1 = iter[type](value),\n\
                awaited$0 = awaitValue(result$1);\n\
\n\
            if (awaited$0) {\n\
\n\
                Promise.resolve(awaited$0).then(\n\
                    function(x) { return resume(\"next\", x); },\n\
                    function(x) { return resume(\"throw\", x); });\n\
\n\
            } else {\n\
\n\
                Promise.resolve(result$1.value).then(\n\
                    function(x) { return fulfill(result$1.done ? \"return\" : \"normal\", x); },\n\
                    function(x) { return fulfill(\"throw\", x); });\n\
            }\n\
\n\
        } catch (x) {\n\
\n\
            // HACK: Return-as-throw\n\
            if (x && x.__return === true)\n\
                return fulfill(\"return\", x.value);\n\
\n\
            fulfill(\"throw\", x);\n\
        }\n\
    }\n\
}\n\
\n\
// Support for spread operations\n\
function spread(initial) {\n\
\n\
    return {\n\
\n\
        a: initial || [],\n\
\n\
        // Add items\n\
        s: function() {\n\
\n\
            for (var i$1 = 0; i$1 < arguments.length; ++i$1)\n\
                this.a.push(arguments[i$1]);\n\
\n\
            return this;\n\
        },\n\
\n\
        // Add the contents of iterables\n\
        i: function(list) {\n\
\n\
            if (Array.isArray(list)) {\n\
\n\
                this.a.push.apply(this.a, list);\n\
\n\
            } else {\n\
\n\
                for (var __$0 = (list)[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;)\n\
                    { var item$0 = __$1.value; this.a.push(item$0); }\n\
            }\n\
\n\
            return this;\n\
        },\n\
\n\
    };\n\
}\n\
\n\
// Support for object destructuring\n\
function objd(obj) {\n\
\n\
    return toObject(obj);\n\
}\n\
\n\
// Support for array destructuring\n\
function arrayd(obj) {\n\
\n\
    if (Array.isArray(obj)) {\n\
\n\
        return {\n\
\n\
            at: function(skip, pos) { return obj[pos] },\n\
            rest: function(skip, pos) { return obj.slice(pos) },\n\
        };\n\
    }\n\
\n\
    var iter = toObject(obj)[Symbol.iterator]();\n\
\n\
    return {\n\
\n\
        at: function(skip) {\n\
\n\
            var r;\n\
\n\
            while (skip--)\n\
                r = iter.next();\n\
\n\
            return r.value;\n\
        },\n\
\n\
        rest: function(skip) {\n\
\n\
            var a = [], r;\n\
\n\
            while (--skip)\n\
                r = iter.next();\n\
\n\
            while (r = iter.next(), !r.done)\n\
                a.push(r.value);\n\
\n\
            return a;\n\
        },\n\
    };\n\
}\n\
\n\
\n\
\n\
\n\
\n\
\n\
\n\
\n\
\n\
exports.makeClass = makeClass;\n\
exports.computed = computed;\n\
exports.asyncFunction = asyncFunction;\n\
exports.asyncGenerator = asyncGenerator;\n\
exports.spread = spread;\n\
exports.objd = objd;\n\
exports.arrayd = arrayd;\n\
exports.class = makeClass;\n\
exports.version = VERSION;\n\
exports.global = GLOBAL;\n\
exports.async = asyncFunction;\n\
exports.asyncGen = asyncGenerator;\n\
";

Runtime.Polyfill = 

"(function(fn, name) { if (typeof exports !== 'undefined') fn(require, exports, module); else if (typeof self !== 'undefined') fn(void 0, name === '*' ? self : (name ? self[name] = {} : {})); })(function(require, exports, module) { 'use strict'; var __M; (function(a) { var list = Array(a.length / 2); __M = function require(i) { var m = list[i], f, e; if (typeof m !== 'function') return m.exports; f = m; m = { exports: i ? {} : exports }; f(list[i] = m, e = m.exports); if (m.exports !== e && !('default' in m.exports)) m.exports['default'] = m.exports; return m.exports; }; for (var i = 0; i < a.length; i += 2) { var j = Math.abs(a[i]); list[j] = a[i + 1]; if (a[i] >= 0) __M(j); } })([\n\
2, function(module, exports) {\n\
\n\
var Global = (function() {\n\
\n\
    try { return global.global } catch (x) {}\n\
    try { return self.self } catch (x) {}\n\
    return null;\n\
})();\n\
\n\
\n\
\n\
function transformKey(k) {\n\
\n\
    if (k.slice(0, 2) === \"@@\")\n\
        k = Symbol[k.slice(2)];\n\
\n\
    return k;\n\
}\n\
\n\
function addProperties(target, methods) {\n\
\n\
    Object.keys(methods).forEach(function(k) {\n\
\n\
        var desc = Object.getOwnPropertyDescriptor(methods, k);\n\
        desc.enumerable = false;\n\
\n\
        k = transformKey(k);\n\
\n\
        if (k in target)\n\
            return;\n\
\n\
        Object.defineProperty(target, k, desc);\n\
    });\n\
}\n\
\n\
var sign = Math.sign || function(val) {\n\
\n\
    var n = +val;\n\
\n\
    if (n === 0 || Number.isNaN(n))\n\
        return n;\n\
\n\
    return n < 0 ? -1 : 1;\n\
};\n\
\n\
function toInteger(val) {\n\
\n\
    var n = +val;\n\
\n\
    return n !== n /* n is NaN */ ? 0 :\n\
        (n === 0 || !isFinite(n)) ? n :\n\
        sign(n) * Math.floor(Math.abs(n));\n\
}\n\
\n\
function toLength(val) {\n\
\n\
    var n = toInteger(val);\n\
    return n < 0 ? 0 : Math.min(n, Number.MAX_SAFE_INTEGER);\n\
}\n\
\n\
function sameValue(left, right) {\n\
\n\
    if (left === right)\n\
        return left !== 0 || 1 / left === 1 / right;\n\
\n\
    return left !== left && right !== right;\n\
}\n\
\n\
function isRegExp(val) {\n\
\n\
    return Object.prototype.toString.call(val) == \"[object RegExp]\";\n\
}\n\
\n\
function toObject(val) {\n\
\n\
    if (val == null)\n\
        throw new TypeError(val + \" is not an object\");\n\
\n\
    return Object(val);\n\
}\n\
\n\
function assertThis(val, name) {\n\
\n\
    if (val == null)\n\
        throw new TypeError(name + \" called on null or undefined\");\n\
}\n\
\n\
exports.global = Global;\n\
exports.addProperties = addProperties;\n\
exports.toInteger = toInteger;\n\
exports.toLength = toLength;\n\
exports.sameValue = sameValue;\n\
exports.isRegExp = isRegExp;\n\
exports.toObject = toObject;\n\
exports.assertThis = assertThis;\n\
\n\
\n\
},\n\
3, function(module, exports) {\n\
\n\
var addProperties = __M(2).addProperties;\n\
\n\
var symbolCounter = 0;\n\
\n\
function fakeSymbol() {\n\
\n\
    return \"__$\" + Math.floor(Math.random() * 1e9) + \"$\" + (++symbolCounter) + \"$__\";\n\
}\n\
\n\
function polyfill(global) {\n\
\n\
    if (!global.Symbol)\n\
        global.Symbol = fakeSymbol;\n\
\n\
    addProperties(Symbol, {\n\
\n\
        iterator: Symbol(\"iterator\"),\n\
\n\
        species: Symbol(\"species\"),\n\
\n\
        // Experimental async iterator support\n\
        asyncIterator: Symbol(\"asyncIterator\"),\n\
\n\
    });\n\
\n\
}\n\
\n\
exports.polyfill = polyfill;\n\
\n\
\n\
},\n\
4, function(module, exports) {\n\
\n\
var addProperties = __M(2).addProperties, toObject = __M(2).toObject, toLength = __M(2).toLength, toInteger = __M(2).toInteger;\n\
\n\
function arrayFind(obj, pred, thisArg, type) {\n\
\n\
    var len = toLength(obj.length),\n\
        val;\n\
\n\
    if (typeof pred !== \"function\")\n\
        throw new TypeError(pred + \" is not a function\");\n\
\n\
    for (var i$0 = 0; i$0 < len; ++i$0) {\n\
\n\
        val = obj[i$0];\n\
\n\
        if (pred.call(thisArg, val, i$0, obj))\n\
            return type === \"value\" ? val : i$0;\n\
    }\n\
\n\
    return type === \"value\" ? void 0 : -1;\n\
}\n\
\n\
function ArrayIterator(array, kind) {\n\
\n\
    this.array = array;\n\
    this.current = 0;\n\
    this.kind = kind;\n\
}\n\
\n\
addProperties(ArrayIterator.prototype = {}, {\n\
\n\
    next: function() {\n\
\n\
        var length = toLength(this.array.length),\n\
            index = this.current;\n\
\n\
        if (index >= length) {\n\
\n\
            this.current = Infinity;\n\
            return { value: void 0, done: true };\n\
        }\n\
\n\
        this.current += 1;\n\
\n\
        switch (this.kind) {\n\
\n\
            case \"values\":\n\
                return { value: this.array[index], done: false };\n\
\n\
            case \"entries\":\n\
                return { value: [ index, this.array[index] ], done: false };\n\
\n\
            default:\n\
                return { value: index, done: false };\n\
        }\n\
    },\n\
\n\
    \"@@iterator\": function() { return this },\n\
    \n\
});\n\
\n\
function polyfill() {\n\
\n\
    addProperties(Array, {\n\
\n\
        from: function(list) {\n\
\n\
            list = toObject(list);\n\
\n\
            var ctor = typeof this === \"function\" ? this : Array, // TODO: Always use \"this\"?\n\
                map = arguments[1],\n\
                thisArg = arguments[2],\n\
                i = 0,\n\
                out;\n\
\n\
            if (map !== void 0 && typeof map !== \"function\")\n\
                throw new TypeError(map + \" is not a function\");\n\
\n\
            var getIter = list[Symbol.iterator];\n\
\n\
            if (getIter) {\n\
\n\
                var iter$0 = getIter.call(list),\n\
                    result$0;\n\
\n\
                out = new ctor;\n\
\n\
                while (result$0 = iter$0.next(), !result$0.done) {\n\
\n\
                    out[i++] = map ? map.call(thisArg, result$0.value, i) : result$0.value;\n\
                    out.length = i;\n\
                }\n\
\n\
            } else {\n\
\n\
                var len$0 = toLength(list.length);\n\
\n\
                out = new ctor(len$0);\n\
\n\
                for (; i < len$0; ++i)\n\
                    out[i] = map ? map.call(thisArg, list[i], i) : list[i];\n\
\n\
                out.length = len$0;\n\
            }\n\
\n\
            return out;\n\
        },\n\
\n\
        of: function() { for (var items = [], __$0 = 0; __$0 < arguments.length; ++__$0) items.push(arguments[__$0]); \n\
\n\
            var ctor = typeof this === \"function\" ? this : Array;\n\
\n\
            if (ctor === Array)\n\
                return items;\n\
\n\
            var len = items.length,\n\
                out = new ctor(len);\n\
\n\
            for (var i$1 = 0; i$1 < len; ++i$1)\n\
                out[i$1] = items[i$1];\n\
\n\
            out.length = len;\n\
\n\
            return out;\n\
        }\n\
\n\
    });\n\
\n\
    addProperties(Array.prototype, {\n\
\n\
        copyWithin: function(target, start) {\n\
\n\
            var obj = toObject(this),\n\
                len = toLength(obj.length),\n\
                end = arguments[2];\n\
\n\
            target = toInteger(target);\n\
            start = toInteger(start);\n\
\n\
            var to = target < 0 ? Math.max(len + target, 0) : Math.min(target, len),\n\
                from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);\n\
\n\
            end = end !== void 0 ? toInteger(end) : len;\n\
            end = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);\n\
\n\
            var count = Math.min(end - from, len - to),\n\
                dir = 1;\n\
\n\
            if (from < to && to < from + count) {\n\
\n\
                dir = -1;\n\
                from += count - 1;\n\
                to += count - 1;\n\
            }\n\
\n\
            for (; count > 0; --count) {\n\
\n\
                if (from in obj) obj[to] = obj[from];\n\
                else delete obj[to];\n\
\n\
                from += dir;\n\
                to += dir;\n\
            }\n\
\n\
            return obj;\n\
        },\n\
\n\
        fill: function(value) {\n\
\n\
            var obj = toObject(this),\n\
                len = toLength(obj.length),\n\
                start = toInteger(arguments[1]),\n\
                pos = start < 0 ? Math.max(len + start, 0) : Math.min(start, len),\n\
                end = arguments.length > 2 ? toInteger(arguments[2]) : len;\n\
\n\
            end = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);\n\
\n\
            for (; pos < end; ++pos)\n\
                obj[pos] = value;\n\
\n\
            return obj;\n\
        },\n\
\n\
        find: function(pred) {\n\
\n\
            return arrayFind(toObject(this), pred, arguments[1], \"value\");\n\
        },\n\
\n\
        findIndex: function(pred) {\n\
\n\
            return arrayFind(toObject(this), pred, arguments[1], \"index\");\n\
        },\n\
\n\
        values: function() { return new ArrayIterator(this, \"values\") },\n\
\n\
        entries: function() { return new ArrayIterator(this, \"entries\") },\n\
\n\
        keys: function() { return new ArrayIterator(this, \"keys\") },\n\
\n\
        \"@@iterator\": function() { return this.values() },\n\
\n\
    });\n\
\n\
}\n\
\n\
exports.polyfill = polyfill;\n\
\n\
\n\
},\n\
5, function(module, exports) {\n\
\n\
var addProperties = __M(2).addProperties;\n\
\n\
var ORIGIN = {}, REMOVED = {};\n\
\n\
function MapNode(key, val) {\n\
\n\
    this.key = key;\n\
    this.value = val;\n\
    this.prev = this;\n\
    this.next = this;\n\
}\n\
\n\
addProperties(MapNode.prototype, {\n\
\n\
    insert: function(next) {\n\
\n\
        this.next = next;\n\
        this.prev = next.prev;\n\
        this.prev.next = this;\n\
        this.next.prev = this;\n\
    },\n\
\n\
    remove: function() {\n\
\n\
        this.prev.next = this.next;\n\
        this.next.prev = this.prev;\n\
        this.key = REMOVED;\n\
    },\n\
\n\
});\n\
\n\
function MapIterator(node, kind) {\n\
\n\
    this.current = node;\n\
    this.kind = kind;\n\
}\n\
\n\
addProperties(MapIterator.prototype = {}, {\n\
\n\
    next: function() {\n\
\n\
        var node = this.current;\n\
\n\
        while (node.key === REMOVED)\n\
            node = this.current = this.current.next;\n\
\n\
        if (node.key === ORIGIN)\n\
            return { value: void 0, done: true };\n\
\n\
        this.current = this.current.next;\n\
\n\
        switch (this.kind) {\n\
\n\
            case \"values\":\n\
                return { value: node.value, done: false };\n\
\n\
            case \"entries\":\n\
                return { value: [ node.key, node.value ], done: false };\n\
\n\
            default:\n\
                return { value: node.key, done: false };\n\
        }\n\
    },\n\
\n\
    \"@@iterator\": function() { return this },\n\
\n\
});\n\
\n\
function hashKey(key) {\n\
\n\
    switch (typeof key) {\n\
\n\
        case \"string\": return \"$\" + key;\n\
        case \"number\": return String(key);\n\
    }\n\
\n\
    throw new TypeError(\"Map and Set keys must be strings or numbers in esdown\");\n\
}\n\
\n\
function Map() {\n\
\n\
    if (arguments.length > 0)\n\
        throw new Error(\"Arguments to Map constructor are not supported in esdown\");\n\
\n\
    this._index = {};\n\
    this._origin = new MapNode(ORIGIN);\n\
}\n\
\n\
addProperties(Map.prototype, {\n\
\n\
    clear: function() {\n\
\n\
        for (var node$0 = this._origin.next; node$0 !== this._origin; node$0 = node$0.next)\n\
            node$0.key = REMOVED;\n\
\n\
        this._index = {};\n\
        this._origin = new MapNode(ORIGIN);\n\
    },\n\
\n\
    delete: function(key) {\n\
\n\
        var h = hashKey(key),\n\
            node = this._index[h];\n\
\n\
        if (node) {\n\
\n\
            node.remove();\n\
            delete this._index[h];\n\
            return true;\n\
        }\n\
\n\
        return false;\n\
    },\n\
\n\
    forEach: function(fn) {\n\
\n\
        var thisArg = arguments[1];\n\
\n\
        if (typeof fn !== \"function\")\n\
            throw new TypeError(fn + \" is not a function\");\n\
\n\
        for (var node$1 = this._origin.next; node$1.key !== ORIGIN; node$1 = node$1.next)\n\
            if (node$1.key !== REMOVED)\n\
                fn.call(thisArg, node$1.value, node$1.key, this);\n\
    },\n\
\n\
    get: function(key) {\n\
\n\
        var h = hashKey(key),\n\
            node = this._index[h];\n\
\n\
        return node ? node.value : void 0;\n\
    },\n\
\n\
    has: function(key) {\n\
\n\
        return hashKey(key) in this._index;\n\
    },\n\
\n\
    set: function(key, val) {\n\
\n\
        var h = hashKey(key),\n\
            node = this._index[h];\n\
\n\
        if (node) {\n\
\n\
            node.value = val;\n\
            return;\n\
        }\n\
\n\
        node = new MapNode(key, val);\n\
\n\
        this._index[h] = node;\n\
        node.insert(this._origin);\n\
    },\n\
\n\
    get size() {\n\
\n\
        return Object.keys(this._index).length;\n\
    },\n\
\n\
    keys: function() { return new MapIterator(this._origin.next, \"keys\") },\n\
    values: function() { return new MapIterator(this._origin.next, \"values\") },\n\
    entries: function() { return new MapIterator(this._origin.next, \"entries\") },\n\
\n\
    \"@@iterator\": function() { return new MapIterator(this._origin.next, \"entries\") },\n\
\n\
});\n\
\n\
var mapSet = Map.prototype.set;\n\
\n\
function Set() {\n\
\n\
    if (arguments.length > 0)\n\
        throw new Error(\"Arguments to Set constructor are not supported in esdown\");\n\
\n\
    this._index = {};\n\
    this._origin = new MapNode(ORIGIN);\n\
}\n\
\n\
addProperties(Set.prototype, {\n\
\n\
    add: function(key) { return mapSet.call(this, key, key) },\n\
    \"@@iterator\": function() { return new MapIterator(this._origin.next, \"entries\") },\n\
\n\
});\n\
\n\
// Copy shared prototype members to Set\n\
[\"clear\", \"delete\", \"forEach\", \"has\", \"size\", \"keys\", \"values\", \"entries\"].forEach(function(k) {\n\
\n\
    var d = Object.getOwnPropertyDescriptor(Map.prototype, k);\n\
    Object.defineProperty(Set.prototype, k, d);\n\
});\n\
\n\
function polyfill(global) {\n\
\n\
    if (!global.Map || !global.Map.prototype.entries) {\n\
\n\
        global.Map = Map;\n\
        global.Set = Set;\n\
    }\n\
}\n\
\n\
exports.polyfill = polyfill;\n\
\n\
\n\
},\n\
6, function(module, exports) {\n\
\n\
var toInteger = __M(2).toInteger, addProperties = __M(2).addProperties;\n\
\n\
function isInteger(val) {\n\
\n\
    return typeof val === \"number\" && isFinite(val) && toInteger(val) === val;\n\
}\n\
\n\
function epsilon() {\n\
\n\
    // Calculate the difference between 1 and the smallest value greater than 1 that\n\
    // is representable as a Number value\n\
\n\
    var result;\n\
\n\
    for (var next$0 = 1; 1 + next$0 !== 1; next$0 = next$0 / 2)\n\
        result = next$0;\n\
\n\
    return result;\n\
}\n\
\n\
function polyfill() {\n\
\n\
    addProperties(Number, {\n\
\n\
        EPSILON: epsilon(),\n\
        MAX_SAFE_INTEGER: 9007199254740991,\n\
        MIN_SAFE_INTEGER: -9007199254740991,\n\
\n\
        parseInt: parseInt,\n\
        parseFloat: parseFloat,\n\
        isInteger: isInteger,\n\
        isFinite: function(val) { return typeof val === \"number\" && isFinite(val) },\n\
        isNaN: function(val) { return val !== val },\n\
        isSafeInteger: function(val) { return isInteger(val) && Math.abs(val) <= Number.MAX_SAFE_INTEGER }\n\
\n\
    });\n\
}\n\
\n\
exports.polyfill = polyfill;\n\
\n\
\n\
},\n\
7, function(module, exports) {\n\
\n\
var addProperties = __M(2).addProperties, toObject = __M(2).toObject, sameValue = __M(2).sameValue;\n\
\n\
function polyfill() {\n\
\n\
    addProperties(Object, {\n\
\n\
        is: sameValue,\n\
\n\
        assign: function(target, source) {\n\
\n\
            target = toObject(target);\n\
\n\
            for (var i$0 = 1; i$0 < arguments.length; ++i$0) {\n\
\n\
                source = arguments[i$0];\n\
\n\
                if (source != null) // null or undefined\n\
                    Object.keys(source).forEach(function(key) { return target[key] = source[key]; });\n\
            }\n\
\n\
            return target;\n\
        },\n\
\n\
        setPrototypeOf: function(object, proto) {\n\
\n\
            // Least effort attempt\n\
            object.__proto__ = proto;\n\
        },\n\
\n\
        getOwnPropertySymbols: function() {\n\
\n\
            return [];\n\
        },\n\
\n\
    });\n\
\n\
}\n\
\n\
exports.polyfill = polyfill;\n\
\n\
\n\
},\n\
8, function(module, exports) {\n\
\n\
var addProperties = __M(2).addProperties, global = __M(2).global;\n\
\n\
var runLater = (function(_) {\n\
\n\
    // Node\n\
    if (global.process && typeof process.version === \"string\") {\n\
        return global.setImmediate ?\n\
            function(fn) { setImmediate(fn) } :\n\
            function(fn) { process.nextTick(fn) };\n\
    }\n\
\n\
    // Newish Browsers\n\
    var Observer = global.MutationObserver || global.WebKitMutationObserver;\n\
\n\
    if (Observer) {\n\
\n\
        var div$0 = document.createElement(\"div\"),\n\
            queuedFn$0 = null;\n\
\n\
        var observer$0 = new Observer(function(_) {\n\
            var fn = queuedFn$0;\n\
            queuedFn$0 = null;\n\
            fn();\n\
        });\n\
\n\
        observer$0.observe(div$0, { attributes: true });\n\
\n\
        return function(fn) {\n\
\n\
            if (queuedFn$0 !== null)\n\
                throw new Error(\"Only one function can be queued at a time\");\n\
\n\
            queuedFn$0 = fn;\n\
            div$0.classList.toggle(\"x\");\n\
        };\n\
    }\n\
\n\
    // Fallback\n\
    return function(fn) { setTimeout(fn, 0) };\n\
\n\
})();\n\
\n\
var taskQueue = null;\n\
\n\
function flushQueue() {\n\
\n\
    var q = taskQueue;\n\
    taskQueue = null;\n\
\n\
    for (var i$0 = 0; i$0 < q.length; ++i$0)\n\
        q[i$0]();\n\
}\n\
\n\
function enqueueMicrotask(fn) {\n\
\n\
    // fn must not throw\n\
    if (!taskQueue) {\n\
        taskQueue = [];\n\
        runLater(flushQueue);\n\
    }\n\
\n\
    taskQueue.push(fn);\n\
}\n\
\n\
var OPTIMIZED = {};\n\
var PENDING = 0;\n\
var RESOLVED = +1;\n\
var REJECTED = -1;\n\
\n\
function idResolveHandler(x) { return x }\n\
function idRejectHandler(r) { throw r }\n\
function noopResolver() { }\n\
\n\
function Promise(resolver) { var __this = this; \n\
\n\
    this._status = PENDING;\n\
\n\
    // Optimized case to avoid creating an uneccessary closure.  Creator assumes\n\
    // responsibility for setting initial state.\n\
    if (resolver === OPTIMIZED)\n\
        return;\n\
\n\
    if (typeof resolver !== \"function\")\n\
        throw new TypeError(\"Resolver is not a function\");\n\
\n\
    this._onResolve = [];\n\
    this._onReject = [];\n\
\n\
    try { resolver(function(x) { resolvePromise(__this, x) }, function(r) { rejectPromise(__this, r) }) }\n\
    catch (e) { rejectPromise(this, e) }\n\
}\n\
\n\
function chain(promise, onResolve, onReject) { if (onResolve === void 0) onResolve = idResolveHandler; if (onReject === void 0) onReject = idRejectHandler; \n\
\n\
    var deferred = makeDeferred(promise.constructor);\n\
\n\
    switch (promise._status) {\n\
\n\
        case PENDING:\n\
            promise._onResolve.push(onResolve, deferred);\n\
            promise._onReject.push(onReject, deferred);\n\
            break;\n\
\n\
        case RESOLVED:\n\
            enqueueHandlers(promise._value, [onResolve, deferred], RESOLVED);\n\
            break;\n\
\n\
        case REJECTED:\n\
            enqueueHandlers(promise._value, [onReject, deferred], REJECTED);\n\
            break;\n\
    }\n\
\n\
    return deferred.promise;\n\
}\n\
\n\
function resolvePromise(promise, x) {\n\
\n\
    completePromise(promise, RESOLVED, x, promise._onResolve);\n\
}\n\
\n\
function rejectPromise(promise, r) {\n\
\n\
    completePromise(promise, REJECTED, r, promise._onReject);\n\
}\n\
\n\
function completePromise(promise, status, value, queue) {\n\
\n\
    if (promise._status === PENDING) {\n\
\n\
        promise._status = status;\n\
        promise._value = value;\n\
\n\
        enqueueHandlers(value, queue, status);\n\
    }\n\
}\n\
\n\
function coerce(constructor, x) {\n\
\n\
    if (!isPromise(x) && Object(x) === x) {\n\
\n\
        var then$0;\n\
\n\
        try { then$0 = x.then }\n\
        catch(r) { return makeRejected(constructor, r) }\n\
\n\
        if (typeof then$0 === \"function\") {\n\
\n\
            var deferred$0 = makeDeferred(constructor);\n\
\n\
            try { then$0.call(x, deferred$0.resolve, deferred$0.reject) }\n\
            catch(r) { deferred$0.reject(r) }\n\
\n\
            return deferred$0.promise;\n\
        }\n\
    }\n\
\n\
    return x;\n\
}\n\
\n\
function enqueueHandlers(value, tasks, status) {\n\
\n\
    enqueueMicrotask(function(_) {\n\
\n\
        for (var i$1 = 0; i$1 < tasks.length; i$1 += 2)\n\
            runHandler(value, tasks[i$1], tasks[i$1 + 1]);\n\
    });\n\
}\n\
\n\
function runHandler(value, handler, deferred) {\n\
\n\
    try {\n\
\n\
        var result$0 = handler(value);\n\
\n\
        if (result$0 === deferred.promise)\n\
            throw new TypeError(\"Promise cycle\");\n\
        else if (isPromise(result$0))\n\
            chain(result$0, deferred.resolve, deferred.reject);\n\
        else\n\
            deferred.resolve(result$0);\n\
\n\
    } catch (e) {\n\
\n\
        try { deferred.reject(e) }\n\
        catch (e) { }\n\
    }\n\
}\n\
\n\
function isPromise(x) {\n\
\n\
    try { return x._status !== void 0 }\n\
    catch (e) { return false }\n\
}\n\
\n\
function makeDeferred(constructor) {\n\
\n\
    if (constructor === Promise) {\n\
\n\
        var promise$0 = new Promise(OPTIMIZED);\n\
\n\
        promise$0._onResolve = [];\n\
        promise$0._onReject = [];\n\
\n\
        return {\n\
\n\
            promise: promise$0,\n\
            resolve: function(x) { resolvePromise(promise$0, x) },\n\
            reject: function(r) { rejectPromise(promise$0, r) },\n\
        };\n\
\n\
    } else {\n\
\n\
        var result$1 = {};\n\
\n\
        result$1.promise = new constructor(function(resolve, reject) {\n\
\n\
            result$1.resolve = resolve;\n\
            result$1.reject = reject;\n\
        });\n\
\n\
        return result$1;\n\
    }\n\
}\n\
\n\
function makeRejected(constructor, r) {\n\
\n\
    if (constructor === Promise) {\n\
\n\
        var promise$1 = new Promise(OPTIMIZED);\n\
        promise$1._status = REJECTED;\n\
        promise$1._value = r;\n\
        return promise$1;\n\
    }\n\
\n\
    return new constructor(function(resolve, reject) { return reject(r); });\n\
}\n\
\n\
function iterate(values, fn) {\n\
\n\
    if (typeof Symbol !== \"function\" || !Symbol.iterator) {\n\
\n\
        if (!Array.isArray(values))\n\
            throw new TypeError(\"Invalid argument\");\n\
\n\
        values.forEach(fn);\n\
    }\n\
\n\
    var i = 0;\n\
\n\
    for (var __$0 = (values)[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;)\n\
        { var x$0 = __$1.value; fn(x$0, i++); }\n\
}\n\
\n\
addProperties(Promise.prototype, {\n\
\n\
    then: function(onResolve, onReject) { var __this = this; \n\
\n\
        onResolve = typeof onResolve === \"function\" ? onResolve : idResolveHandler;\n\
        onReject = typeof onReject === \"function\" ? onReject : idRejectHandler;\n\
\n\
        var constructor = this.constructor;\n\
\n\
        return chain(this, function(x) {\n\
\n\
            x = coerce(constructor, x);\n\
\n\
            return x === __this ? onReject(new TypeError(\"Promise cycle\")) :\n\
                isPromise(x) ? x.then(onResolve, onReject) :\n\
                onResolve(x);\n\
\n\
        }, onReject);\n\
    },\n\
\n\
    catch: function(onReject) {\n\
\n\
        return this.then(void 0, onReject);\n\
    },\n\
\n\
});\n\
\n\
addProperties(Promise, {\n\
\n\
    reject: function(e) {\n\
\n\
        return makeRejected(this, e);\n\
    },\n\
\n\
    resolve: function(x) {\n\
\n\
        return isPromise(x) ? x : new this(function(resolve) { return resolve(x); });\n\
    },\n\
\n\
    all: function(values) { var __this = this; \n\
\n\
        var deferred = makeDeferred(this),\n\
            resolutions = [],\n\
            count = 0;\n\
\n\
        try {\n\
\n\
            iterate(values, function(x, i) {\n\
\n\
                count++;\n\
\n\
                __this.resolve(x).then(function(value) {\n\
\n\
                    resolutions[i] = value;\n\
\n\
                    if (--count === 0)\n\
                        deferred.resolve(resolutions);\n\
\n\
                }, deferred.reject);\n\
\n\
            });\n\
\n\
            if (count === 0)\n\
                deferred.resolve(resolutions);\n\
\n\
        } catch (e) {\n\
\n\
            deferred.reject(e);\n\
        }\n\
\n\
        return deferred.promise;\n\
    },\n\
\n\
    race: function(values) { var __this = this; \n\
\n\
        var deferred = makeDeferred(this);\n\
\n\
        try {\n\
\n\
            iterate(values, function(x) { return __this.resolve(x).then(\n\
                deferred.resolve,\n\
                deferred.reject); });\n\
\n\
        } catch (e) {\n\
\n\
            deferred.reject(e);\n\
        }\n\
\n\
        return deferred.promise;\n\
    },\n\
\n\
});\n\
\n\
function polyfill() {\n\
\n\
    if (!global.Promise)\n\
        global.Promise = Promise;\n\
}\n\
\n\
exports.polyfill = polyfill;\n\
\n\
\n\
},\n\
9, function(module, exports) {\n\
\n\
var addProperties = __M(2).addProperties,\n\
    toLength = __M(2).toLength,\n\
    toInteger = __M(2).toInteger,\n\
    sameValue = __M(2).sameValue,\n\
    assertThis = __M(2).assertThis,\n\
    isRegExp = __M(2).isRegExp;\n\
\n\
\n\
\n\
\n\
\n\
// Repeat a string by \"squaring\"\n\
function repeat(s, n) {\n\
\n\
    if (n < 1) return \"\";\n\
    if (n % 2) return repeat(s, n - 1) + s;\n\
    var half = repeat(s, n / 2);\n\
    return half + half;\n\
}\n\
\n\
function StringIterator(string) {\n\
\n\
    this.string = string;\n\
    this.current = 0;\n\
}\n\
\n\
addProperties(StringIterator.prototype = {}, {\n\
\n\
    next: function() {\n\
\n\
        var s = this.string,\n\
            i = this.current,\n\
            len = s.length;\n\
\n\
        if (i >= len) {\n\
\n\
            this.current = Infinity;\n\
            return { value: void 0, done: true };\n\
        }\n\
\n\
        var c = s.charCodeAt(i),\n\
            chars = 1;\n\
\n\
        if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) {\n\
\n\
            c = s.charCodeAt(i + 1);\n\
            chars = (c < 0xDC00 || c > 0xDFFF) ? 1 : 2;\n\
        }\n\
\n\
        this.current += chars;\n\
\n\
        return { value: s.slice(i, this.current), done: false };\n\
    },\n\
\n\
    \"@@iterator\": function() { return this },\n\
\n\
});\n\
\n\
function polyfill() {\n\
\n\
    addProperties(String, {\n\
\n\
        raw: function(callsite) { for (var args = [], __$0 = 1; __$0 < arguments.length; ++__$0) args.push(arguments[__$0]); \n\
\n\
            var raw = callsite.raw,\n\
                len = toLength(raw.length);\n\
\n\
            if (len === 0)\n\
                return \"\";\n\
\n\
            var s = \"\", i = 0;\n\
\n\
            while (true) {\n\
\n\
                s += raw[i];\n\
                if (i + 1 === len || i >= args.length) break;\n\
                s += args[i++];\n\
            }\n\
\n\
            return s;\n\
        },\n\
\n\
        fromCodePoint: function() { for (var points = [], __$0 = 0; __$0 < arguments.length; ++__$0) points.push(arguments[__$0]); \n\
\n\
            var out = [];\n\
\n\
            points.forEach(function(next) {\n\
\n\
                next = Number(next);\n\
\n\
                if (!sameValue(next, toInteger(next)) || next < 0 || next > 0x10ffff)\n\
                    throw new RangeError(\"Invalid code point \" + next);\n\
\n\
                if (next < 0x10000) {\n\
\n\
                    out.push(String.fromCharCode(next));\n\
\n\
                } else {\n\
\n\
                    next -= 0x10000;\n\
                    out.push(String.fromCharCode((next >> 10) + 0xD800));\n\
                    out.push(String.fromCharCode((next % 0x400) + 0xDC00));\n\
                }\n\
            });\n\
\n\
            return out.join(\"\");\n\
        }\n\
\n\
    });\n\
\n\
    addProperties(String.prototype, {\n\
\n\
        repeat: function(count) {\n\
\n\
            assertThis(this, \"String.prototype.repeat\");\n\
\n\
            var string = String(this);\n\
\n\
            count = toInteger(count);\n\
\n\
            if (count < 0 || count === Infinity)\n\
                throw new RangeError(\"Invalid count value\");\n\
\n\
            return repeat(string, count);\n\
        },\n\
\n\
        startsWith: function(search) {\n\
\n\
            assertThis(this, \"String.prototype.startsWith\");\n\
\n\
            if (isRegExp(search))\n\
                throw new TypeError(\"First argument to String.prototype.startsWith must not be a regular expression\");\n\
\n\
            var string = String(this);\n\
\n\
            search = String(search);\n\
\n\
            var pos = arguments.length > 1 ? arguments[1] : undefined,\n\
                start = Math.max(toInteger(pos), 0);\n\
\n\
            return string.slice(start, start + search.length) === search;\n\
        },\n\
\n\
        endsWith: function(search) {\n\
\n\
            assertThis(this, \"String.prototype.endsWith\");\n\
\n\
            if (isRegExp(search))\n\
                throw new TypeError(\"First argument to String.prototype.endsWith must not be a regular expression\");\n\
\n\
            var string = String(this);\n\
\n\
            search = String(search);\n\
\n\
            var len = string.length,\n\
                arg = arguments.length > 1 ? arguments[1] : undefined,\n\
                pos = arg === undefined ? len : toInteger(arg),\n\
                end = Math.min(Math.max(pos, 0), len);\n\
\n\
            return string.slice(end - search.length, end) === search;\n\
        },\n\
\n\
        includes: function(search) {\n\
\n\
            assertThis(this, \"String.prototype.includes\");\n\
\n\
            var string = String(this),\n\
                pos = arguments.length > 1 ? arguments[1] : undefined;\n\
\n\
            // Somehow this trick makes method 100% compat with the spec\n\
            return string.indexOf(search, pos) !== -1;\n\
        },\n\
\n\
        codePointAt: function(pos) {\n\
\n\
            assertThis(this, \"String.prototype.codePointAt\");\n\
\n\
            var string = String(this),\n\
                len = string.length;\n\
\n\
            pos = toInteger(pos);\n\
\n\
            if (pos < 0 || pos >= len)\n\
                return undefined;\n\
\n\
            var a = string.charCodeAt(pos);\n\
\n\
            if (a < 0xD800 || a > 0xDBFF || pos + 1 === len)\n\
                return a;\n\
\n\
            var b = string.charCodeAt(pos + 1);\n\
\n\
            if (b < 0xDC00 || b > 0xDFFF)\n\
                return a;\n\
\n\
            return ((a - 0xD800) * 1024) + (b - 0xDC00) + 0x10000;\n\
        },\n\
\n\
        \"@@iterator\": function() {\n\
\n\
            assertThis(this, \"String.prototype[Symbol.iterator]\");\n\
            return new StringIterator(this);\n\
        },\n\
\n\
    });\n\
\n\
}\n\
\n\
exports.polyfill = polyfill;\n\
\n\
\n\
},\n\
1, function(module, exports) {\n\
\n\
var global = __M(2).global;\n\
\n\
var symbols = __M(3);\n\
var array = __M(4);\n\
var mapset = __M(5);\n\
var number = __M(6);\n\
var object = __M(7);\n\
var promise = __M(8);\n\
var string = __M(9);\n\
\n\
\n\
\n\
function polyfill() {\n\
\n\
    [symbols, array, mapset, number, object, promise, string]\n\
        .forEach(function(m) { return m.polyfill(global); });\n\
}\n\
\n\
exports.global = global;\n\
exports.polyfill = polyfill;\n\
\n\
\n\
},\n\
0, function(module, exports) {\n\
\n\
var polyfill = __M(1).polyfill;\n\
\n\
polyfill();\n\
\n\
\n\
}]);\n\
\n\
\n\
}, \"\");";


exports.Runtime = Runtime;


},
16, function(module, exports) {

var parse = __M(8).parse, AST = __M(8).AST;

var RESERVED_WORD = new RegExp("^(?:" +
    "break|case|catch|class|const|continue|debugger|default|delete|do|" +
    "else|enum|export|extends|false|finally|for|function|if|import|in|" +
    "instanceof|new|null|return|super|switch|this|throw|true|try|typeof|" +
    "var|void|while|with|implements|private|public|interface|package|let|" +
    "protected|static|yield" +
")$");

function countNewlines(text) {

    var m = text.match(/\r\n?|\n/g);
    return m ? m.length : 0;
}

function preserveNewlines(text, height) {

    var n = countNewlines(text);

    if (height > 0 && n < height)
        text += "\n".repeat(height - n);

    return text;
}

function isAsyncType(type) {

    return type === "async" || type === "async-generator";
}

function isGeneratorType(type) {

    return type === "generator" || type === "async-generator";
}

var PatternTreeNode = _esdown.class(function(__) { var PatternTreeNode;

    __({ constructor: PatternTreeNode = function(name, init, skip) {

        this.name = name;
        this.initializer = init;
        this.children = [];
        this.target = "";
        this.skip = skip | 0;
        this.array = false;
        this.rest = false;
    }});
 });

var RootNode = _esdown.class(function(__) { var RootNode;

    __({ constructor: RootNode = function(root, end) {

        this.type = "Root";
        this.start = 0;
        this.end = end;
        this.root = root;
    }});
 });

RootNode.prototype = AST.Node.prototype;


function collapseScopes(parseResult) {

    var names = Object.create(null);

    visit(parseResult.scopeTree, null);

    function makeSuffix(name) {

        var count = names[name] | 0;
        names[name] = count + 1;
        return "$" + count;
    }

    function fail(msg, node) {

        throw parseResult.createSyntaxError("[esdown] " + msg, node);
    }

    function visit(scope, forScope) {

        switch (scope.type) {

            case "block":
                rename(scope);
                break;

            case "for":
                rename(scope);
                forScope = scope;
                break;

            case "function":

                if (forScope) {

                    var set$0 = Object.create(null);

                    forScope.free.forEach(function(r) { return set$0[r.value] = 1; });

                    scope.free.forEach(function(r) {

                        if (set$0[r.value] !== 1)
                            fail("Closure capturing per-iteration bindings", r);
                    });

                    forScope = null;
                }

                break;
        }

        scope.children.forEach(function(c) { return visit(c, forScope); });
    }

    function rename(node) {

        var varParent = node.parent.type === "var";

        Object.keys(node.names).forEach(function(name) {

            var record = node.names[name],
                suffix = "";

            if (!varParent)
                suffix = makeSuffix(name);

            record.declarations.forEach(function(decl) { return decl.suffix = suffix; });
            record.references.forEach(function(ref) { return ref.suffix = suffix; });

            if (record.const)
                record.references.forEach(checkConstRef);
        });
    }

    function checkConstRef(ref) {

        var node = ref;

        while (node.parent.type === "ParenExpression")
            node = node.parent;

        var target;

        switch (ref.parent.type) {
            case "UpdateExpression":
                target = ref.parent.expression;
                break;

            case "AssignmentExpression":
                target = ref.parent.left;
                break;
        }

        if (node === target)
            fail("Invalid assignment to constant variable", ref);
    }

}

function replaceText(input, options) {

    return new Replacer(options).replace(input);
}

var Replacer = _esdown.class(function(__) { var Replacer;

    __({ constructor: Replacer = function(options) { var __this = this; if (options === void 0) options = {}; 

        this.options = {
            identifyModule: function(_) { return "_M" + (__this.uid++); },
            replaceRequire: function(_) { return null; },
            module: false,
        };

        Object.keys(options).forEach(function(k) { return __this.options[k] = options[k]; });
    },

    replace: function(input) { var __this = this; 

        this.asi = {};

        this.parseResult = parse(input, {

            module: this.options.module,
            addParentLinks: true,
            resolveScopes: true,

            onASI: function(token) {

                if (token.type !== "}" && token.type !== "EOF")
                    __this.asi[token.start] = true;

                return true;
            }
        });

        var root = this.parseResult.ast;
        root.start = 0;

        this.input = input;
        this.exports = {};
        this.moduleNames = {};
        this.dependencies = [];
        this.runtime = {};
        this.isStrict = false;
        this.uid = 0;

        collapseScopes(this.parseResult);

        var visit = function(node) {

            node.text = null;

            var strict = __this.isStrict;

            // Set the strictness for implicitly strict nodes
            switch (node.type) {

                case "Module":
                case "ClassDeclaration":
                case "ClassExpresion":
                    __this.isStrict = true;
            }

            // Perform a depth-first traversal
            node.children().forEach(visit);

            // Restore strictness
            __this.isStrict = strict;

            var text = null;

            // Call replacer
            if (__this[node.type])
                text = __this[node.type](node);

            if (text === null || text === void 0)
                text = __this.stringify(node);

            return node.text = __this.syncNewlines(node.start, node.end, text);
        };

        var output = visit(new RootNode(root, input.length)),
            exports = Object.keys(this.exports);

        if (exports.length > 0) {

            output += "\n";
            output += exports.map(function(k) { return "exports." + (k) + " = " + (__this.exports[k]) + ";"; }).join("\n");
            output += "\n";
        }

        return {
            input: input,
            output: output,
            imports: this.dependencies,
            runtime: Object.keys(this.runtime),
        };
    },

    DoWhileStatement: function(node) {

        var text = this.stringify(node);

        if (text.slice(-1) !== ";")
            return text + ";";
    },

    ForOfStatement: function(node) {

        var iter = this.addTempVar(node, null, true),
            iterResult = this.addTempVar(node, null, true),
            context = this.parentFunction(node),
            decl = "",
            binding,
            head;

        if (node.async) {

            head = "for (var " + (iter) + " = (" + (node.right.text) + ")[Symbol.asyncIterator](), " + (iterResult) + "; ";
            head += "" + (iterResult) + " = " + (this.awaitYield(context, iter + ".next()")) + ", ";

        } else {

            head = "for (var " + (iter) + " = (" + (node.right.text) + ")[Symbol.iterator](), " + (iterResult) + "; ";
            head += "" + (iterResult) + " = " + (iter) + ".next(), ";
        }

        head += "!" + (iterResult) + ".done;";
        head = this.syncNewlines(node.left.start, node.right.end, head);
        head += this.input.slice(node.right.end, node.body.start);

        if (node.left.type === "VariableDeclaration") {

            decl = "var ";
            binding = node.left.declarations[0].pattern;

        } else {

            binding = this.unwrapParens(node.left);
        }

        var body = node.body.text;

        // Remove braces from block bodies
        if (node.body.type === "Block") body = this.removeBraces(body);
        else body += " ";

        var assign = this.isPattern(binding) ?
            this.translatePattern(binding, "" + (iterResult) + ".value").join(", ") :
            "" + (binding.text) + " = " + (iterResult) + ".value";

        var out = "" + (head) + "{ " + (decl) + "" + (assign) + "; " + (body) + "}";

        /*

        For-of loops are implicitly wrapped with try-finally, where the "return"
        is called upon the iterator (if it has such a method) when evaulation leaves
        the loop body.  For performance reasons, and because engines have not
        implemented "return" yet, we avoid this wrapper.

        out = `try { ${ out } } finally { ` +
            `if (${ iterResult } && !${ iterResult }.done && "return" in ${ iter }) ` +
                `${ iter }.return(); }`;

        */

        return out;
    },

    ExpressionStatement: function(node) {

        if (this.asi[node.start]) {

            var text$0 = this.stringify(node);

            switch (text$0.charAt(0)) {

                case "(":
                case "[":
                    text$0 = ";" + text$0;
                    break;
            }

            return text$0;
        }
    },

    Module: function(node) {

        // Strict directive is included with module wrapper

        var inserted = [],
            temps = this.tempVars(node);

        if (node.lexicalVars)
            inserted.push(this.lexicalVarNames(node));

        if (temps)
            inserted.push(temps);

        if (inserted.length > 0)
            return inserted.join(" ") + " " + this.stringify(node);
    },

    Script: function(node) {

        return this.Module(node);
    },

    FunctionBody: function(node) {

        var insert = this.functionInsert(node.parent);

        if (insert)
            return "{ " + insert + " " + this.removeBraces(this.stringify(node)) + "}";
    },

    FormalParameter: function(node) {

        if (this.isPattern(node.pattern))
            return this.addTempVar(node, null, true);

        return node.pattern.text;
    },

    RestParameter: function(node) {

        node.parent.createRestBinding = true;

        var p = node.parent.params;

        if (p.length > 1) {

            var prev$0 = p[p.length - 2];
            node.start = prev$0.end;
        }

        return "";
    },

    ComputedPropertyName: function(node) {

        search:
        for (var p$0 = node.parent; p$0; p$0 = p$0.parent) {

            switch (p$0.type) {

                case "ClassBody":
                case "ObjectLiteral":
                    p$0.hasComputed = true;
                    break search;
            }
        }

        return "_";
    },

    ObjectLiteral: function(node) {

        if (node.hasComputed) {

            var computed$0 = false;

            node.properties.forEach(function(c, index) {

                if (computed$0)
                    c.text = " }, { " + c.text;

                computed$0 = c.name.type === "ComputedPropertyName";

                if (computed$0)
                    c.text = "}, " + (c.name.expression.text) + ", { " + (c.text) + "";
            });

            this.markRuntime("computed");

            return "_esdown.computed(" + this.stringify(node) + ")";
        }
    },

    ArrayLiteral: function(node) {

        if (node.hasSpread)
            return this.spreadList(node.elements);
    },

    MethodDefinition: function(node) {

        var text;

        switch (node.kind) {

            case "":
            case "constructor":

                text = "function(" +
                    this.joinList(node.params) + ") " +
                    node.body.text;

                break;

            case "async":
            case "async-generator":

                text = this.asyncFunction(node);
                break;

            case "generator":

                text = "function*(" +
                    this.joinList(node.params) + ") " +
                    node.body.text;

                break;

        }

        if (text !== void 0)
            return node.name.text + ": " + text;
    },

    PropertyDefinition: function(node) {

        if (node.expression === null) {

            var rawName$0 = this.input.slice(node.name.start, node.name.end);
            return rawName$0 + ": " + node.name.text;
        }
    },

    VariableDeclaration: function(node) {

        return this.stringify(node).replace(/^(let|const)/, "var");
    },

    ImportDeclaration: function(node) {

        var moduleSpec = this.modulePath(node.from),
            imports = node.imports,
            out = this.importVars(imports, moduleSpec);

        if (imports && imports.type === "DefaultImport" && imports.imports)
            out += " " + this.importVars(imports.imports, moduleSpec);

        return out;
    },

    importVars: function(imports, moduleSpec) {

        if (!imports)
            return "";

        switch (imports.type) {

            case "NamespaceImport":
                return "var " + imports.identifier.text + " = " + moduleSpec + ";";

            case "DefaultImport":
                return "var " + imports.identifier.text + " = " + moduleSpec + "['default'];";
        }

        var list = [];

        if (imports.specifiers) {

            imports.specifiers.forEach(function(spec) {

                var imported = spec.imported,
                    local = spec.local || imported;

                list.push({
                    start: spec.start,
                    end: spec.end,
                    text: local.text + " = " + moduleSpec + "." + imported.text
                });
            });
        }

        if (list.length === 0)
            return "";

        return "var " + this.joinList(list) + ";";
    },

    ExportDeclaration: function(node) { var __this = this; 

        var target = node.declaration,
            exports = this.exports,
            ident;

        if (target.type === "VariableDeclaration") {

            target.declarations.forEach(function(decl) {

                if (__this.isPattern(decl.pattern)) {

                    decl.pattern.patternTargets.forEach(function(x) { return exports[x] = x; });

                } else {

                    ident = decl.pattern.text;

                    exports[ident] = ident;
                }
            });

        } else {

            ident = target.identifier.text;
            exports[ident] = ident;
        }

        return target.text;
    },

    ExportNameList: function(node) { var __this = this; 

        var from = node.from,
            fromPath = from ? this.modulePath(from) : "";

        node.specifiers.forEach(function(spec) {

            var local = spec.local.text,
                exported = spec.exported ? spec.exported.text : local;

            __this.exports[exported] = from ?
                fromPath + "." + local :
                local;
        });

        return "";
    },

    ExportDefaultFrom: function(node) {

        var from = node.from,
            fromPath = from ? this.modulePath(from) : "";

        this.exports[node.identifier.text] = fromPath + "['default']";

        return "";
    },

    ExportNamespace: function(node) {

        var from = node.from,
            fromPath = from ? this.modulePath(from) : "";

        if (from && node.identifier) {

            this.exports[node.identifier.text] = fromPath;
            return "";
        }

        return "Object.keys(" + fromPath + ").forEach(function(k) { exports[k] = " + fromPath + "[k]; });";
    },

    ExportDefault: function(node) {

        switch (node.binding.type) {

            case "ClassDeclaration":
            case "FunctionDeclaration":
                this.exports["default"] = node.binding.identifier.text;
                return node.binding.text;
        }

        return "exports[\"default\"] = " + (node.binding.text) + ";";
    },

    CallExpression: function(node) {

        var callee = node.callee,
            args = node.arguments,
            spread = null,
            calleeText,
            argText;

        if (callee.type === "SuperKeyword")
            throw new Error("Super call not supported");

        if (callee.text === "require" && args.length > 0 && args[0].type === "StringLiteral") {

            var ident$0 = this.options.replaceRequire(args[0].value);

            if (ident$0)
                return ident$0;
        }

        if (node.hasSpread)
            spread = this.spreadList(args);

        if (node.injectThisArg) {

            argText = node.injectThisArg;

            if (spread)
                argText = argText + ", " + spread;
            else if (args.length > 0)
                argText = argText + ", " + this.joinList(args);

            return callee.text + "." + (spread ? "apply" : "call") + "(" + argText + ")";
        }

        if (spread) {

            argText = "void 0";

            if (callee.type === "MemberExpression") {

                argText = this.addTempVar(node);

                callee.object.text = "(" + (argText) + " = " + (callee.object.text) + ")";
                callee.text = this.MemberExpression(callee) || this.stringify(callee);
            }

            return callee.text + ".apply(" + argText + ", " + spread + ")";
        }
    },

    NewExpression: function(node) {

        if (node.hasSpread) {

            var temp$0 = this.addTempVar(node),
                spread$0 = this.spreadList(node.arguments, "[null]");

            return "new (" + (temp$0) + " = " + (node.callee.text) + ", " + (temp$0) + ".bind.apply(" + (temp$0) + ", " + (spread$0) + "))";
        }
    },

    SpreadExpression: function(node) {

        node.parent.hasSpread = true;
    },

    SuperKeyword: function(node) {

        if (this.skip("classes"))
            return;

        var proto = "__.super",
            p = node.parent,
            elem = p;

        while (elem && elem.type !== "MethodDefinition")
            elem = elem.parent;

        if (elem && elem.static)
            proto = "__.csuper";

        if (p.type !== "CallExpression") {

            // super.foo...
            p.isSuperLookup = true;

            var pp$0 = this.parenParent(p);

            // super.foo(args);
            if (pp$0[0].type === "CallExpression" && pp$0[0].callee === pp$0[1])
                pp$0[0].injectThisArg = "this";
        }

        return proto;
    },

    MemberExpression: function(node) {

        if (node.isSuperLookup) {

            var prop$0 = node.property.text;

            prop$0 = node.computed ?
                "[" + prop$0 + "]" :
                "." + prop$0;

            return node.object.text + prop$0;
        }
    },

    // Experimental
    PipeExpression: function(node) {

        var left = node.left.text,
            temp = this.addTempVar(node),
            callee = "(" + (temp) + " = " + (left) + ", " + (node.right.text) + ")",
            args = temp;

        if (node.hasSpread) {

            args = this.spreadList(node.arguments, "[" + args + "]");
            return "" + (callee) + ".apply(void 0, " + (args) + ")";
        }

        if (node.arguments.length > 0)
            args += ", " + this.joinList(node.arguments);

        return "" + (callee) + "(" + (args) + ")";
    },

    ArrowFunction: function(node) {

        var body = node.body.text;

        if (node.body.type !== "FunctionBody") {

            var insert$0 = this.functionInsert(node);

            if (insert$0)
                insert$0 += " ";

            body = "{ " + insert$0 + "return " + body + "; }";
        }

        var text = node.kind === "async" ?
            this.asyncFunction(node, body) :
            "function(" + this.joinList(node.params) + ") " + body;

        return this.wrapFunctionExpression(text, node);
    },

    ThisExpression: function(node) {

        return this.renameLexicalVar(node, "this");
    },

    Identifier: function(node) {

        if (node.value === "arguments" && node.context === "variable")
            return this.renameLexicalVar(node, "arguments");

        if (node.suffix)
            return this.input.slice(node.start, node.end) + node.suffix;
    },

    UnaryExpression: function(node) {

        if (node.operator === "delete" && node.overrideDelete)
            return "!void " + node.expression.text;

        if (node.operator === "await")
            return this.awaitYield(this.parentFunction(node), node.expression.text);
    },

    YieldExpression: function(node) {

        // TODO:  Can we drop these?

        // V8 circa Node 0.11.x does not support yield without expression
        if (!node.expression)
            return "yield void 0";

        // V8 circa Node 0.11.x does not access Symbol.iterator correctly
        if (node.delegate) {

            var fn$0 = this.parentFunction(node),
                symbol$0 = isAsyncType(fn$0.kind) ? "asyncIterator" : "iterator";

            node.expression.text = "(" + (node.expression.text) + ")[Symbol." + (symbol$0) + "]()";
        }
    },

    FunctionDeclaration: function(node) {

        if (isAsyncType(node.kind))
            return this.asyncFunction(node);
    },

    FunctionExpression: function(node) {

        return this.FunctionDeclaration(node);
    },

    ClassDeclaration: function(node) {

        if (node.base)
            this.fail("Subclassing not supported", node.base);

        this.markRuntime("classes");

        return "var " + node.identifier.text + " = _esdown.class(" +
            "function(__" + (node.hasStatic ? ", __static" : "") + ") {" +
                this.strictDirective() +
                this.removeBraces(node.body.text) + " });";
    },

    ClassExpression: function(node) {

        var before = "",
            after = "";

        if (node.base)
            this.fail("Subclassing not supported", node.base);

        if (node.identifier) {

            before = "function() { var " + node.identifier.text + " = ";
            after = "; return " + node.identifier.text + "; }()";
        }

        this.markRuntime("classes");

        return "(" + before +
            "_esdown.class(" +
            "function(__" + (node.hasStatic ? ", __static" : "") + ") {" +
                this.strictDirective() +
                this.removeBraces(node.body.text) + " })" +
            after + ")";
    },

    ClassBody: function(node) { var __this = this; 

        var classIdent = node.parent.identifier,
            elems = node.elements,
            hasCtor = false,
            ctorName = classIdent ? classIdent.value : "",
            ctorHead = (ctorName ? ctorName + " = " : "") + "function",
            header = [],
            footer = [];

        elems.reduce(function(prev, e, index) {

            if (e.type !== "MethodDefinition")
                return "";

            var text = e.text,
                fn = "__";

            if (e.static) {

                node.parent.hasStatic = true;
                fn = "__static";
                text = text.replace(/^static\s*/, "");
            }

            if (e.kind === "constructor") {

                hasCtor = true;

                // Give the constructor function a name so that the class function's
                // name property will be correct and capture the constructor.
                text = text.replace(/:\s*function/, ": " + ctorHead);
            }

            var prefix = fn + "(";

            if (e.name.type === "ComputedPropertyName") {

                __this.markRuntime("computed");

                e.text = prefix + "_esdown.computed({}, " + e.name.expression.text + ", { " + text + " }));";
                prefix = "";

            } else if (prefix === prev) {

                var p$1 = elems[index - 1];
                p$1.text = p$1.text.replace(/\}\);$/, ",");
                e.text = text + "});"

            } else {

                e.text = prefix + "{ " + text + "});";
            }

            return e.static ? "" : prefix;

        }, "");

        if (ctorName)
            header.push("var " + ctorName + ";");

        // Add a default constructor if none was provided
        if (!hasCtor)
            header.push("__({ constructor: " + ctorHead + "() {} });");

        var text = this.stringify(node);

        if (header.length > 0)
            text = "{ " + header.join(" ") + text.slice(1);

        if (footer.length > 0)
            text = text.slice(1, -1) + " " + footer.join(" ") + " }";

        return text;
    },

    TaggedTemplateExpression: function(node) {

        return "(" + this.stringify(node) + ")";
    },

    TemplateExpression: function(node) { var __this = this; 

        var lit = node.literals,
            sub = node.substitutions,
            out = "";

        if (node.parent.type === "TaggedTemplateExpression") {

            this.markRuntime("templates");

            var temp$1 = this.addTempVar(node),
                raw$0 = temp$1;

            // Only output the raw array if it is different from the cooked array
            for (var i$0 = 0; i$0 < lit.length; ++i$0) {

                if (lit[i$0].raw !== lit[i$0].value) {

                    raw$0 = "[" + (lit.map(function(x) { return JSON.stringify(x.raw); }).join(", ")) + "]";
                    break;
                }
            }

            out = "((" + (temp$1) + " = [" + (lit.map(function(x) { return __this.rawToString(x.raw); }).join(", ")) + "]";
            out += ", " + (temp$1) + ".raw = " + (raw$0) + ", " + (temp$1) + ")";

            if (sub.length > 0)
                out += ", " + sub.map(function(x) { return x.text; }).join(", ");

            out += ")";

        } else {

            for (var i$1 = 0; i$1 < lit.length; ++i$1) {

                if (i$1 > 0)
                    out += " + (" + sub[i$1 - 1].text + ") + ";

                out += this.rawToString(lit[i$1].raw);
            }
        }

        return out;
    },

    CatchClause: function(node) {

        if (!this.isPattern(node.param))
            return;

        var temp = this.addTempVar(node, null, true),
            assign = this.translatePattern(node.param, temp).join(", "),
            body = this.removeBraces(node.body.text);

        return "catch (" + (temp) + ") { let " + (assign) + "; " + (body) + " }";
    },

    VariableDeclarator: function(node) {

        if (!node.initializer || !this.isPattern(node.pattern))
            return;

        var list = this.translatePattern(node.pattern, node.initializer.text);

        return list.join(", ") || "__$_";
    },

    AssignmentExpression: function(node) {

        if (node.assignWrap)
            return node.assignWrap[0] + node.right.text + node.assignWrap[1];

        var left = this.unwrapParens(node.left);

        if (!this.isPattern(left))
            return;

        var temp = this.addTempVar(node),
            list = this.translatePattern(left, temp);

        list.unshift(temp + " = " + node.right.text);
        list.push(temp);

        return "(" + list.join(", ") + ")";
    },

    isPattern: function(node) {

        switch (node.type) {

            case "ArrayPattern":
            case "ObjectPattern":
                return true;
        }

        return false;
    },

    parenParent: function(node) {

        var parent;

        for (; parent = node.parent; node = parent)
            if (parent.type !== "ParenExpression")
                break;

        return [parent, node];
    },

    unwrapParens: function(node) {

        while (node && node.type === "ParenExpression")
            node = node.expression;

        return node;
    },

    spreadList: function(elems, initial) {

        var list = [],
            last = -1;

        for (var i$2 = 0; i$2 < elems.length; ++i$2) {

            if (elems[i$2].type === "SpreadExpression") {

                if (last < i$2 - 1)
                    list.push({ type: "s", args: this.joinList(elems.slice(last + 1, i$2)) });

                list.push({ type: "i", args: elems[i$2].expression.text });

                last = i$2;
            }
        }

        if (last < elems.length - 1)
            list.push({ type: "s", args: this.joinList(elems.slice(last + 1)) });

        this.markRuntime("spread");

        var out = "(_esdown.spread(" + (initial || "") + ")";

        for (var i$3 = 0; i$3 < list.length; ++i$3)
            out += "." + (list[i$3].type) + "(" + (list[i$3].args) + ")";

        out += ".a)";

        return out;
    },

    translatePattern: function(node, base) { var __this = this; 

        function propGet(name) {

            return /^[\.\d'"]/.test(name) ? "[" + name + "]" : "." + name;
        }

        var outer = [],
            inner = [],
            targets = [];

        node.patternTargets = targets;

        this.markRuntime("destructuring");

        var visit = function(tree, base) {

            var target = tree.target,
                dType = tree.array ? "arrayd" : "objd",
                str = "",
                temp;

            var access =
                tree.rest ? "" + (base) + ".rest(" + (tree.skip) + ", " + (tree.name) + ")" :
                tree.skip ? "" + (base) + ".at(" + (tree.skip) + ", " + (tree.name) + ")" :
                tree.name ? base + propGet(tree.name) :
                base;

            if (tree.initializer) {

                temp = __this.addTempVar(node);
                inner.push("" + (temp) + " = " + (access) + "");

                str = "" + (temp) + " === void 0 ? " + (tree.initializer) + " : " + (temp) + "";

                if (!tree.target)
                    str = "" + (temp) + " = _esdown." + (dType) + "(" + (str) + ")";

                inner.push(str);

            } else if (tree.target) {

                inner.push("" + (access) + "");

            } else {

                temp = __this.addTempVar(node);
                inner.push("" + (temp) + " = _esdown." + (dType) + "(" + (access) + ")");
            }

            if (tree.target) {

                targets.push(target);

                outer.push(inner.length === 1 ?
                    "" + (target) + " = " + (inner[0]) + "" :
                    "" + (target) + " = (" + (inner.join(", ")) + ")");

                inner.length = 0;
            }

            if (temp)
                base = temp;

            tree.children.forEach(function(c) { return visit(c, base); });
        };

        visit(this.createPatternTree(node), base);

        return outer;
    },

    createPatternTree: function(ast, parent) { var __this = this; 

        if (!parent)
            parent = new PatternTreeNode("", null);

        var child, init, skip = 1;

        switch (ast.type) {

            case "ArrayPattern":

                parent.array = true;

                ast.elements.forEach(function(e, i) {

                    if (!e) {

                        ++skip;
                        return;
                    }

                    init = e.initializer ? e.initializer.text : "";

                    child = new PatternTreeNode(String(i), init, skip);

                    if (e.type === "PatternRestElement")
                        child.rest = true;

                    parent.children.push(child);
                    __this.createPatternTree(e.pattern, child);

                    skip = 1;
                });

                break;

            case "ObjectPattern":

                ast.properties.forEach(function(p) {

                    var node = p.name,
                        name = node.type === 'Identifier' ? node.value : node.text;

                    init = p.initializer ? p.initializer.text : "";
                    child = new PatternTreeNode(name, init);

                    parent.children.push(child);
                    __this.createPatternTree(p.pattern || p.name, child);
                });

                break;

            default:

                parent.target = ast.text;
                break;
        }

        return parent;
    },

    asyncFunction: function(node, body) {

        var head = "function";

        if (node.identifier)
            head += " " + node.identifier.text;

        var outerParams = node.params.map(function(x, i) {

            var p = x.pattern || x.identifier;
            return p.type === "Identifier" ? p.value : "__$" + i;

        }).join(", ");

        var wrapper = node.kind === "async-generator" ? "asyncGen" : "async";

        if (body === void 0)
            body = node.body.text;

        this.markRuntime(wrapper === "asyncGen" ? "async-generators" : "async-functions");

        return "" + (head) + "(" + (outerParams) + ") { " +
            "return _esdown." + (wrapper) + "(function*(" + (this.joinList(node.params)) + ") " +
            "" + (body) + ".apply(this, arguments)); }";
    },

    markRuntime: function(name) {

        this.runtime[name] = true;
    },

    rawToString: function(raw) {

        raw = raw.replace(/([^\n])?\n/g, function(m, m1) { return m1 === "\\" ? m : (m1 || "") + "\\n\\\n"; });
        raw = raw.replace(/([^"])?"/g, function(m, m1) { return m1 === "\\" ? m : (m1 || "") + '\\"'; });

        return '"' + raw + '"';
    },

    isVarScope: function(node) {

        switch (node.type) {

            case "ArrowFunction":
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "MethodDefinition":
            case "Script":
            case "Module":
                return true;
        }

        return false;
    },

    parentFunction: function(node) {

        for (var p$2 = node.parent; p$2; p$2 = p$2.parent)
            if (this.isVarScope(p$2))
                return p$2;

        return null;
    },

    renameLexicalVar: function(node, name) {

        var fn = this.parentFunction(node),
            varName = name;

        if (fn.type === "ArrowFunction") {

            while (fn = this.parentFunction(fn)) {

                if (fn.type !== "ArrowFunction") {

                    if (!fn.lexicalVars)
                        fn.lexicalVars = {};

                    fn.lexicalVars[name] = varName = "__" + name;
                    break;
                }
            }
        }

        return varName;
    },

    lexicalVarNames: function(node) {

        var names = node.lexicalVars;

        if (!names)
            return "";

        return "var " + Object.keys(names).map(function(key) {

            return names[key] + " = " + key;

        }).join(", ") + ";";
    },

    modulePath: function(node) {

        if (node.type !== "StringLiteral")
            return this.stringify(node);

        var url = node.value,
            legacy = false;

        url = url.trim();

        if (typeof this.moduleNames[url] !== "string") {

            var identifier$0 = this.options.identifyModule(url);
            this.moduleNames[url] = identifier$0;
            this.dependencies.push({ url: url, identifier: identifier$0 });
        }

        return this.moduleNames[url];
    },

    stringify: function(node) {

        var offset = node.start,
            input = this.input,
            text = "";

        // Build text from child nodes
        node.children().forEach(function(child) {

            if (offset < child.start)
                text += input.slice(offset, child.start);

            text += child.text;
            offset = child.end;
        });

        if (offset < node.end)
            text += input.slice(offset, node.end);

        return text;
    },

    restParamVar: function(node) {

        var name = node.params[node.params.length - 1].identifier.value,
            pos = node.params.length - 1,
            temp = this.addTempVar(node, null, true);

        return "for (var " + (name) + " = [], " + (temp) + " = " + (pos) + "; " +
            "" + (temp) + " < arguments.length; " +
            "++" + (temp) + ") " + (name) + ".push(arguments[" + (temp) + "]);";
    },

    functionInsert: function(node) { var __this = this; 

        var inserted = [];

        if (node.hasYieldInput)
            inserted.push("var __yieldin = yield;");

        if (node.lexicalVars)
            inserted.push(this.lexicalVarNames(node));

        if (node.createRestBinding)
            inserted.push(this.restParamVar(node));

        node.params.forEach(function(param) {

            if (!param.pattern)
                return;

            var name = param.text;

            if (param.initializer)
                inserted.push("if (" + (name) + " === void 0) " + (name) + " = " + (param.initializer.text) + ";");

            if (__this.isPattern(param.pattern))
                inserted.push("var " +  __this.translatePattern(param.pattern, name).join(", ") + ";");
        });

        var temps = this.tempVars(node);

        // Add temp var declarations to the top of the insert
        if (temps)
            inserted.unshift(temps);

        return inserted.join(" ");
    },

    addTempVar: function(node, value, noDeclare) {

        var p = this.isVarScope(node) ? node : this.parentFunction(node);

        if (!p.tempVars)
            p.tempVars = [];

        var name = "__$" + p.tempVars.length;

        p.tempVars.push({ name: name, value: value, noDeclare: noDeclare });

        return name;
    },

    tempVars: function(node) {

        if (!node.tempVars)
            return "";

        var list = node.tempVars.filter(function(item) { return !item.noDeclare; });

        if (list.length === 0)
            return "";

        return "var " + list.map(function(item) {

            var out = item.name;

            if (typeof item.value === "string")
                out += " = " + item.value;

            return out;

        }).join(", ") + ";";
    },

    strictDirective: function() {

        return this.isStrict ? "" : ' "use strict";';
    },

    lineNumber: function(offset) {

        return this.parseResult.locate(offset).line;
    },

    syncNewlines: function(start, end, text) {

        var height = this.lineNumber(end - 1) - this.lineNumber(start);
        return preserveNewlines(text, height);
    },

    awaitYield: function(context, text) {

        if (context.kind === "async-generator")
            text = "{ _esdown_await: (" + (text) + ") }";

        return "(yield " + (text) + ")";
    },

    wrapFunctionExpression: function(text, node) {

        for (var p$3 = node.parent; p$3; p$3 = p$3.parent) {

            if (this.isVarScope(p$3))
                break;

            if (p$3.type === "ExpressionStatement") {

                if (p$3.start === node.start)
                    return "(" + text + ")";

                break;
            }
        }

        return text;
    },

    removeBraces: function(text) {

        return text.replace(/^\s*\{|\}\s*$/g, "");
    },

    joinList: function(list) {

        var input = this.input,
            offset = -1,
            text = "";

        list.forEach(function(child) {

            if (offset >= 0 && offset < child.start)
                text += input.slice(offset, child.start);

            text += child.text;
            offset = child.end;
        });

        return text;
    },

    fail: function(msg, node) {

        throw this.parseResult.createSyntaxError("[esdown] " + msg, node);
    }});

 });

exports.replaceText = replaceText;


},
14, function(module, exports) {

var NODE_SCHEME = /^node:/i,
      URI_SCHEME = /^[a-z]+:/i;

function isLegacyScheme(spec) {

    return NODE_SCHEME.test(spec);
}

function removeScheme(uri) {

    return uri.replace(URI_SCHEME, "");
}

function hasScheme(uri) {

    return URI_SCHEME.test(uri);
}

function addLegacyScheme(uri) {

    return "node:" + uri;
}

exports.isLegacyScheme = isLegacyScheme;
exports.removeScheme = removeScheme;
exports.hasScheme = hasScheme;
exports.addLegacyScheme = addLegacyScheme;


},
7, function(module, exports) {

var Runtime = __M(15).Runtime;
var replaceText = __M(16).replaceText;
var isLegacyScheme = __M(14).isLegacyScheme, removeScheme = __M(14).removeScheme;

var SIGNATURE = "/*=esdown=*/";

var WRAP_CALLEE = "(function(fn, name) { " +

    // CommonJS:
    "if (typeof exports !== 'undefined') " +
        "fn(require, exports, module); " +

    // DOM global module:
    "else if (typeof self !== 'undefined') " +
        "fn(function() { return {} }, name === '*' ? self : (name ? self[name] = {} : {})); " +

"})";

var MODULE_IMPORT = "function __import(e) { " +
    "return !e || e.constructor === Object ? e : " +
        "Object.create(e, { 'default': { value: e } }); " +
"} ";

function sanitize(text) {

    // From node/lib/module.js/Module.prototype._compile
    text = text.replace(/^\#\!.*/, '');

    // From node/lib/module.js/stripBOM
    if (text.charCodeAt(0) === 0xFEFF)
        text = text.slice(1);

    return text;
}

function wrapRuntime() {

    // Wrap runtime library in an IIFE, exporting into the _esdown variable
    return "var _esdown = {}; (function() { var exports = _esdown;\n\n" + Runtime.API + "\n\n})();";
}

function wrapPolyfills() {

    return "(function() { var exports = {};\n\n" + Runtime.Polyfill + "\n\n})();";
}

function translate(input, options) { if (options === void 0) options = {}; 

    input = sanitize(input);

    // Node modules are wrapped inside of a function expression, which allows
    // return statements
    if (options.functionContext)
        input = "(function(){" + input + "})";

    var result = replaceText(input, options),
        output = result.output,
        imports = result.imports;

    // Remove function expression wrapper for node-modules
    if (options.functionContext)
        output = output.slice(12, -2);

    // Add esdown-runtime dependency if runtime features are used
    if (!options.runtimeImports && result.runtime.length > 0)
        imports.push({ url: "esdown-runtime", identifier: "_esdown" });

    if (options.wrap) {

        // It doesn't make sense to create a module wrapper for a non-module
        if (!options.module)
            throw new Error("Cannot wrap a non-module");

        output = wrapModule(output, imports, options);
    }

    if (options.result) {

        var r$0 = options.result;
        r$0.input = input;
        r$0.output = output;
        r$0.imports = imports;
        r$0.runtime = result.runtime;
    }

    return output;
}

function wrapModule(text, imports, options) { if (imports === void 0) imports = []; if (options === void 0) options = {}; 

    var header = "'use strict'; ";

    if (imports.length > 0)
        header += MODULE_IMPORT;

    var requires = imports.map(function(dep) {

        var url = dep.url,
            legacy = isLegacyScheme(url),
            ident = dep.identifier;

        if (legacy)
            url = removeScheme(url);

        if (options.runtimeImports && !legacy)
            url += "##ES6";

        return "" + (ident) + " = __import(require(" + (JSON.stringify(url)) + "))";
    });

    if (requires.length > 0)
        header += "var " + requires.join(", ") + "; ";

    if (options.runtime)
        header += wrapRuntime() + "\n\n";

    if (options.polyfill)
        header += wrapPolyfills() + "\n\n";

    if (!options.global)
        return SIGNATURE + header + text;

    if (typeof options.global !== "string")
        return SIGNATURE + header + text;

    var name = options.global;

    if (name === ".")
        name = "";

    return SIGNATURE + WRAP_CALLEE + "(" +
        "function(require, exports, module) { " + header + text + "\n\n}, " +
        JSON.stringify(name) +
    ");";
}

function isWrapped(text) {

    return text.indexOf(SIGNATURE) === 0;
}

exports.translate = translate;
exports.wrapModule = wrapModule;
exports.isWrapped = isWrapped;


},
13, function(module, exports) {

var Path = __M(2);
var FS = __M(1);


var NOT_PACKAGE = /^(?:\.{0,2}\/|[a-z]+:)/i,
    NODE_PATH = "",
    globalModulePaths = [],
    isWindows = false;

(function(_) {

    if (typeof process === "undefined")
        return;

    isWindows = process.platform === "win32";
    NODE_PATH = process.env["NODE_PATH"] || "";

    var home = isWindows ? process.env.USERPROFILE : process.env.HOME,
        paths = [Path.resolve(process.execPath, "..", "..", "lib", "node")];

    if (home) {

        paths.unshift(Path.resolve(home, ".node_libraries"));
        paths.unshift(Path.resolve(home, ".node_modules"));
    }

    var nodePath = process.env.NODE_PATH;

    if (nodePath)
        paths = nodePath.split(Path.delimiter).filter(Boolean).concat(paths);

    globalModulePaths = paths;

})();

function isFile(path) {

    var stat;

    try { stat = FS.statSync(path) }
    catch (x) {}

    return stat && stat.isFile();
}

function isDirectory(path) {

    var stat;

    try { stat = FS.statSync(path) }
    catch (x) {}

    return stat && stat.isDirectory();
}

function getFolderEntryPoint(dir, legacy) {

    var join = Path.join;

    // Look for an ES entry point first (default.js)
    if (!legacy) {

        var path$0 = join(dir, "default.js");

        if (isFile(path$0))
            return { path: path$0, legacy: false };
    }

    // == Legacy package lookup rules ==

    var tryPaths = [];

    // Look for a package.json manifest file
    var main = (readPackageManifest(dir) || {}).main;

    // If we have a manifest with a "main" path...
    if (typeof main === "string") {

        if (!main.endsWith("/"))
            tryPaths.push(join(dir, main), join(dir, main + ".js"));

        tryPaths.push(join(dir, main, "index.js"));
    }

    // Try "index"
    tryPaths.push(join(dir, "index.js"));

    for (var i$0 = 0; i$0 < tryPaths.length; ++i$0) {

        var path$1 = tryPaths[i$0];

        if (isFile(path$1))
            return { path: path$1, legacy: true };
    }

    return null;
}

function readPackageManifest(path) {

    path = Path.join(path, "package.json");

    if (!isFile(path))
        return null;

    var text = FS.readFileSync(path, "utf8");

    try {

        return JSON.parse(text);

    } catch (e) {

        e.message = "Error parsing " + path + ": " + e.message;
        throw e;
    }
}

function locateModule(path, base, legacy) {

    if (isPackageSpecifier(path))
        return locatePackage(path, base, legacy);

    // If the module specifier is neither a package path nor a "file" path,
    // then just return the specifier itself.  The locator does not have
    // enough information to locate it with any greater precision.
    if (!path.startsWith(".") && !path.startsWith("/"))
        throw new Error("Invalid module path");

    path = Path.resolve(base, path);

    if (isDirectory(path)) {

        // If the path is a directory, then attempt to find the entry point
        // using folder lookup rules
        var pathInfo$0 = getFolderEntryPoint(path, legacy);

        if (pathInfo$0)
            return pathInfo$0;
    }

    if (legacy) {

        // If we are performing legacy lookup and the path is not found, then
        // attempt to find the file by appending a ".js" file extension.
        // We currently don't look for ".json" files.
        if (!path.endsWith("/") && !isFile(path)) {

            if (isFile(path + ".js"))
                return { path: path + ".js", legacy: true };
        }
    }

    return { path: path, legacy: legacy };
}

function isRelativePath(spec) {

    return spec.startsWith(".") || spec.startsWith("/");
}

function isPackageSpecifier(spec) {

    return !NOT_PACKAGE.test(spec);
}

function locatePackage(name, base, legacy) {

    if (NOT_PACKAGE.test(name))
        throw new Error("Not a package specifier");

    var pathInfo;

    getPackagePaths(base).some(function(root) { return pathInfo = getFolderEntryPoint(Path.resolve(root, name), legacy); }
);

    if (!pathInfo)
        throw new Error("Package " + (name) + " could not be found.");

    return pathInfo;
}

function getPackagePaths(dir) {

    return nodeModulePaths(dir).concat(globalModulePaths);
}

function nodeModulePaths(path) {

    path = Path.resolve(path);

    var parts = path.split(isWindows ? /[\/\\]/ : /\//),
        paths = [];

    // Build a list of "node_modules" folder paths, starting from
    // the current directory and then under each parent directory
    for (var i$1 = parts.length - 1; i$1 >= 0; --i$1) {

        // If this folder is already a node_modules folder, then
        // skip it (we want to avoid "node_modules/node_modules")
        if (parts[i$1] === "node_modules")
            continue;

        paths.push(parts.slice(0, i$1 + 1).join(Path.sep) + Path.sep + "node_modules");
    }

    return paths;
}

exports.locateModule = locateModule;
exports.isRelativePath = isRelativePath;
exports.isPackageSpecifier = isPackageSpecifier;
exports.locatePackage = locatePackage;


},
5, function(module, exports) {

var FS = __M(1);
var REPL = __M(10);
var VM = __M(11);
var Path = __M(2);
var Util = __M(12);

var Style = __M(3).ConsoleStyle;
var parse = __M(8).parse;
var translate = __M(7).translate;
var isPackageSpecifier = __M(13).isPackageSpecifier, locateModule = __M(13).locateModule;

var Module = null;

try { Module = require.main.constructor }
catch (x) {}

function formatSyntaxError(e, filename) {

    var msg = e.message,
        text = e.sourceText;

    if (filename === void 0 && e.filename !== void 0)
        filename = e.filename;

    if (filename)
        msg += "\n    " + (filename) + ":" + (e.line) + "";

    if (e.lineOffset < text.length) {

        var code$0 = "\n\n" +
            text.slice(e.lineOffset, e.startOffset) +
            Style.bold(Style.red(text.slice(e.startOffset, e.endOffset))) +
            text.slice(e.endOffset, text.indexOf("\n", e.endOffset)) +
            "\n";

        msg += code$0.replace(/\n/g, "\n    ");
    }

    return msg;
}

function addExtension() {

    var moduleLoad = Module._load;

    // Create _esdown global variable so that it doesn't need to be bundled into
    // each module
    global._esdown = _esdown;

    Module.prototype.importSync = function(path) {

        if (/^node:/.test(path))
            path = path.slice(5);
        else
            path += "##ES6";

        var e = this.require(path);
        if (e && e.constructor !== Object) e.default = e;
        return e;
    };

    Module._load = function(request, parent, isMain) {

        if (request.endsWith("##ES6")) {

            var loc$0 = locateModule(request.slice(0, -5), Path.dirname(parent.filename));
            request = loc$0.path;

            parent.__es6 = !loc$0.legacy;
        }

        var m = moduleLoad(request, parent, isMain);
        parent.__es6 = false;
        return m;
    };

    // Compile ES6 js files
    require.extensions[".js"] = function(module, filename) {

        var text, source;

        try {

            text = source = FS.readFileSync(filename, "utf8");

            var m$0 = Boolean(module.parent.__es6);

            text = translate(text, {
                wrap: m$0,
                module: m$0,
                functionContext: !m$0,
                runtimeImports: true,
            });

        } catch (e) {

            if (e instanceof SyntaxError)
                e = new SyntaxError(formatSyntaxError(e, filename));

            throw e;
        }

        return module._compile(text, filename);
    };
}

function runModule(path) {

    addExtension();

    if (isPackageSpecifier(path))
        path = "./" + path;

    var loc = locateModule(path, process.cwd());

    if (!loc.legacy)
        loc.path += "##ES6";

    var m = require(loc.path);

    if (m && m.constructor !== Object)
        m = Object.create(m, { "default": { value: m } });

    if (m && typeof m.main === "function") {

        var result$0 = m.main();
        Promise.resolve(result$0).then(null, function(x) { return setTimeout(function($) { throw x }, 0); });
    }
}

function startREPL() {

    // Node 0.10.x pessimistically wraps all input in parens and then
    // re-evaluates function expressions as function declarations.  Since
    // Node is unaware of class declarations, this causes classes to
    // always be interpreted as expressions in the REPL.
    var removeParens = process.version.startsWith("v0.10.");

    addExtension();

    console.log("esdown " + (_esdown.version) + " (Node " + (process.version) + ")");

    var prompt = ">>> ", contPrompt = "... ";

    var repl = REPL.start({

        prompt: prompt,

        useGlobal: true,

        eval: function(input, context, filename, cb) { var __this = this; 

            var text, result, script, displayErrors = false;

            // Remove wrapping parens for function and class declaration forms
            if (removeParens && /^\((class|function\*?)\s[\s\S]*?\n\)$/.test(input))
                input = input.slice(1, -1);

            try {

                text = translate(input, { module: false });

            } catch (x) {

                // Regenerate syntax error to eliminate parser stack
                if (x instanceof SyntaxError) {

                    // Detect multiline input
                    if (/^(Unexpected end of input|Unexpected token)/.test(x.message)) {

                        this.bufferedCommand = input + "\n";
                        this.displayPrompt();
                        return;
                    }

                    x = new SyntaxError(x.message);
                }

                return cb(x);
            }

            try {

                script = VM.createScript(text, { filename: filename, displayErrors: displayErrors });

                result = repl.useGlobal ?
                    script.runInThisContext({ displayErrors: displayErrors }) :
                    script.runInContext(context, { displayErrors: displayErrors });

            } catch (x) {

                return cb(x);
            }

            if (result instanceof Promise) {

                // Without displayPrompt, asynchronously calling the "eval"
                // callback results in no text being displayed on the screen.

                var token$0 = {};

                Promise.race([

                    result,
                    new Promise(function(a) { return setTimeout(function($) { return a(token$0); }, 3000); }),
                ])
                .then(function(x) {

                    if (x === token$0)
                        return void cb(null, result);

                    __this.outputStream.write(Style.gray("(async) "));
                    cb(null, x);
                })
                .catch(function(err) { return cb(err, null); })
                .then(function($) { return __this.displayPrompt(); });

            } else {

                cb(null, result);
            }
        }
    });

    // Override displayPrompt so that ellipses are displayed for
    // cross-line continuations

    if (typeof repl.displayPrompt === "function" &&
        typeof repl._prompt === "string") {

        var displayPrompt$0 = repl.displayPrompt;

        repl.displayPrompt = function(preserveCursor) {

            this._prompt = this.bufferedCommand ? contPrompt : prompt;
            return displayPrompt$0.call(this, preserveCursor);
        };
    }

    function parseAction(input, module) {

        var text, ast;

        try {

            ast = parse(input, { module: module }).ast;
            text = Util.inspect(ast, { colors: true, depth: 20 });

        } catch (x) {

            text = x instanceof SyntaxError ?
                formatSyntaxError(x, "REPL") :
                x.toString();
        }

        console.log(text);
    }

    function translateAction(input, module) {

        var text;

        try {

            text = translate(input, { wrap: false, module: true });

        } catch (x) {

            text = x instanceof SyntaxError ?
                formatSyntaxError(x, "REPL") :
                x.toString();
        }

        console.log(text);
    }

    var commands = {

        "help": {

            help: "Show REPL commands",

            action: function() { var __this = this; 

                var list = Object.keys(this.commands).sort(),
                    len = list.reduce(function(n, key) { return Math.max(n, key.length); }, 0);

                list.forEach(function(key) {

                    var help = __this.commands[key].help || "",
                        pad = " ".repeat(4 + len - key.length);

                    __this.outputStream.write(key + pad + help + "\n");
                });

                this.displayPrompt();
            }

        },

        "translate": {

            help: "Translate an ES6 script to ES5 and show the result (esdown)",

            action: function(input) {

                translateAction(input, false);
                this.displayPrompt();
            }
        },

        "translateModule": {

            help: "Translate an ES6 module to ES5 and show the result (esdown)",

            action: function(input) {

                translateAction(input, true);
                this.displayPrompt();
            }
        },

        "parse": {

            help: "Parse a script and show the AST (esdown)",

            action: function(input) {

                parseAction(input, false);
                this.displayPrompt();
            }

        },

        "parseModule": {

            help: "Parse a module and show the AST (esdown)",

            action: function(input) {

                parseAction(input, true);
                this.displayPrompt();
            }

        },
    };

    if (typeof repl.defineCommand === "function")
        Object.keys(commands).forEach(function(key) { return repl.defineCommand(key, commands[key]); });
}

exports.formatSyntaxError = formatSyntaxError;
exports.runModule = runModule;
exports.startREPL = startREPL;


},
6, function(module, exports) {

var Path = __M(2);
var readFile = __M(4).readFile, writeFile = __M(4).writeFile;
var isPackageSpecifier = __M(13).isPackageSpecifier, locateModule = __M(13).locateModule;
var translate = __M(7).translate, wrapModule = __M(7).wrapModule;
var isLegacyScheme = __M(14).isLegacyScheme, addLegacyScheme = __M(14).addLegacyScheme, removeScheme = __M(14).removeScheme, hasScheme = __M(14).hasScheme;

var NODE_INTERNAL_MODULE = new RegExp("^(?:" + [

    "assert", "buffer", "child_process", "cluster", "console", "constants", "crypto",
    "dgram", "dns", "domain", "events", "freelist", "fs", "http", "https", "module",
    "net", "os", "path", "process", "punycode", "querystring", "readline", "repl",
    "smalloc", "stream", "string_decoder", "sys", "timers", "tls", "tty", "url", "util",
    "v8", "vm", "zlib",

].join("|") + ")$");

var BUNDLE_INIT =
"var __M; " +
"(function(a) { " +
    "var list = Array(a.length / 2); " +

    "__M = function(i) { " +
        "var m = list[i], f, e, ee; " +
        "if (typeof m !== 'function') return m.exports; " +
        "f = m; " +
        "m = { exports: i ? {} : exports }; " +
        "f(list[i] = m, e = m.exports); " +
        "ee = m.exports; " +
        "if (ee && ee !== e && !('default' in ee)) " +
            "ee['default'] = ee; " +
        "return ee; " +
    "}; " +

    "for (var i = 0; i < a.length; i += 2) { " +
        "var j = Math.abs(a[i]); " +
        "list[j] = a[i + 1]; " +
        "if (a[i] >= 0) __M(j); " +
    "} " +
"})";

var Node = _esdown.class(function(__) { var Node;

    __({ constructor: Node = function(path, id) {

        this.path = path;
        this.id = id;
        this.edges = new Map;
        this.output = null;
        this.runtime = false;
        this.legacy = false;
        this.importCount = 0;
        this.ignore = false;
    }});
 });

var GraphBuilder = _esdown.class(function(__) { var GraphBuilder;

    __({ constructor: GraphBuilder = function(root) {

        this.nodes = new Map;
        this.nextID = 0;
        this.root = this.add(root);
    },

    has: function(key) {

        return this.nodes.has(key);
    },

    get: function(key) {

        return this.nodes.get(key);
    },

    add: function(key) {

        if (this.nodes.has(key))
            return this.nodes.get(key);

        var node = new Node(key, this.nextID++);
        this.nodes.set(key, node);
        return node;
    },

    sort: function(key) { var __this = this; if (key === void 0) key = this.root.path; 

        var visited = new Set,
            list = [];

        var visit = function(key) {

            if (visited.has(key))
                return;

            visited.add(key);
            var node = __this.nodes.get(key);
            node.edges.forEach(function(node, key) { return visit(key); });
            list.push(node);
        };

        visit(key);

        return list;
    },

    addEdge: function(node, spec, fromRequire) {

        var key = spec,
            legacy = false,
            ignore = false;

        if (fromRequire) {

            legacy = true;

        } else if (isLegacyScheme(spec)) {

            legacy = true;
            key = removeScheme(spec);
        }

        if (legacy && NODE_INTERNAL_MODULE.test(key))
            ignore = true;

        if (ignore && fromRequire)
            return null;

        if (!ignore) {

            var pathInfo$0 = locateModule(key, node.base, legacy);
            key = pathInfo$0.path;
            legacy = pathInfo$0.legacy;
        }

        var target = this.nodes.get(key);

        if (target) {

            if (target.legacy !== legacy)
                throw new Error("Module '" + (key) + "' referenced as both legacy and non-legacy");

        } else {

            target = this.add(key);
            target.legacy = legacy;
            target.ignore = ignore;
        }

        if (!fromRequire)
            target.importCount++;

        node.edges.set(key, target);
        return target;
    },

    process: function(node, input) { var __this = this; 

        if (node.output !== null)
            throw new Error("Node already processed");

        var result = {};

        node.base = Path.dirname(node.path);

        node.output = translate(input, {

            identifyModule: function(path) { return "__M(" + (__this.addEdge(node, path, false).id) + ")"; },

            replaceRequire: function(path) {

                var n = __this.addEdge(node, path, true);
                return n ? "__M(" + (n.id) + ")" : null;
            },

            module: !node.legacy,

            result: result,

        });

        node.runtime = result.runtime.length > 0;
    }});

 });

function bundle(rootPath, options) { if (options === void 0) options = {}; 

    rootPath = Path.resolve(rootPath);

    var builder = new GraphBuilder(rootPath),
        visited = new Set,
        pending = 0,
        resolver,
        allFetched;

    allFetched = new Promise(function(resolve, reject) { return resolver = { resolve: resolve, reject: reject }; });

    function visit(node) {

        var path = node.path;

        // Exit if module has already been processed or should be ignored
        if (node.ignore || visited.has(path))
            return;

        visited.add(path);
        pending += 1;

        readFile(path, { encoding: "utf8" }).then(function(code) {

            builder.process(node, code);
            node.edges.forEach(visit);

            pending -= 1;

            if (pending === 0)
                resolver.resolve(null);

        }).then(null, function(err) {

            if (err instanceof SyntaxError && "sourceText" in err)
                err.filename = path;

            resolver.reject(err);
        });
    }

    visit(builder.root);

    return allFetched.then(function(_) {

        var needsRuntime = false;

        var output = builder.sort().map(function(node) {

            if (node.runtime)
                needsRuntime = true;

            var id = node.id;

            if (node.importCount === 0)
                id = -id;

            var init = node.output === null ?
                "function(m) { m.exports = require(" + (JSON.stringify(node.path)) + ") }" :
                "function(module, exports) {\n\n" + (node.output) + "\n\n}";

            return "" + (id) + ", " + (init) + "";

        }).join(",\n");

        output = BUNDLE_INIT + "([\n" + (output) + "]);\n";

        output = wrapModule(output, [], {

            global: options.global,
            runtime: needsRuntime,
            polyfill: options.polyfill,
        });

        if (options.output)
            return writeFile(Path.resolve(options.output), output, "utf8").then(function(_) { return ""; });

        return output;
    });
}

exports.bundle = bundle;


},
0, function(module, exports) {

var FS = __M(1);
var Path = __M(2);
var ConsoleCommand = __M(3).ConsoleCommand;
var readFile = __M(4).readFile, writeFile = __M(4).writeFile;
var runModule = __M(5).runModule, startREPL = __M(5).startREPL, formatSyntaxError = __M(5).formatSyntaxError;
var bundle = __M(6).bundle;
var translate = __M(7).translate;




var HELP = "\n\
Start a REPL by running it without any arguments:\n\
\n\
    esdown\n\
\n\
Execute a module by adding a path:\n\
\n\
    esdown main.js\n\
\n\
Translate a module by using a hyphen:\n\
\n\
    esdown - [input] [output] [options]\n\
\n\
    --input, -i  (1)    The file to translate.\n\
    --output, -o (2)    The file to write to. If not set, then the output\n\
                        will be written to the console.\n\
    --bundle, -b        If present, module dependencies will be bundled\n\
                        together in the output.\n\
    --runtime, -r       If present, the esdown runtime code will be bundled\n\
                        with the output.\n\
    --polyfill, -p      If present, ES6 polyfills will be bundled with the\n\
                        output.\n\
    -R                  If present, the esdown runtime and ES6 polyfills will\n\
                        be bundled with the output.  Equivalent to including\n\
                        both the -p and -r options.\n\
    --global, -g        If specified, the name of the global variable to\n\
                        dump this module's exports into, if the resulting\n\
                        script is not executed within any module system.\n\
";

function getOutPath(inPath, outPath) {

    var stat;

    outPath = Path.resolve(process.cwd(), outPath);

    try { stat = FS.statSync(outPath); } catch (e) {}

    if (stat && stat.isDirectory())
        return Path.resolve(outPath, Path.basename(inPath));

    return outPath;
}

function main(args) {

    new ConsoleCommand({

        execute: function(input) {

            process.argv.splice(1, 1);

            if (input) runModule(input);
            else startREPL();
        }

    }).add("?", {

        execute: function() {

            console.log(HELP);
        }

    }).add("-", {

        params: {

            "input": {

                short: "i",
                positional: true,
                required: true
            },

            "output": {

                short: "o",
                positional: true,
                required: false
            },

            "global": { short: "g" },

            "bundle": { short: "b", flag: true },

            "runtime": { short: "r", flag: true },

            "fullRuntime": { short: "R", flag: true },

            "polyfill": { short: "p", flag: true },

            "nowrap": { flag: true },
        },

        execute: function(params) {

            var promise = null;

            if (params.bundle) {

                promise = bundle(params.input, {

                    global: params.global,
                    polyfill: params.fullRuntime || params.polyfill,
                });

            } else {

                promise = params.input ?
                    readFile(params.input, { encoding: "utf8" }) :
                    Promise.resolve("");

                promise = promise.then(function(text) {

                    return translate(text, {

                        global: params.global,
                        runtime: params.fullRuntime || params.runtime,
                        polyfill: params.fullRuntime || params.polyfill,
                        wrap: !params.nowrap,
                        module: true,
                    });
                });
            }

            promise.then(function(text) {

                if (params.output) {

                    var outPath$0 = getOutPath(params.input, params.output);
                    return writeFile(outPath$0, text, "utf8");

                } else {

                    process.stdout.write(text + "\n");
                }

            }).then(null, function(x) {

                if (x instanceof SyntaxError) {

                    var filename$0;

                    if (!params.bundle)
                        filename$0 = Path.resolve(params.input);

                    process.stdout.write("\nSyntax Error: " + (formatSyntaxError(x, filename$0)) + "\n");
                    return;
                }

                setTimeout(function($) { throw x }, 0);
            });
        }

    }).run(args || process.argv.slice(2));
}

exports.translate = translate;
exports.bundle = bundle;
exports.parse = __M(8).parse;
exports.main = main;


}]);


}, "esdown");