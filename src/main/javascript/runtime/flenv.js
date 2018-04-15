var closureCount = 0;

function FLClosure(obj, fn, args) {
//	console.log("new closure for ", fn);
	this._closure = ++closureCount;
	this.obj = obj;
	this.fn = fn;
	this.args = args;
}

FLClosure.prototype.toString = function() {
	return "Closure[" + this._closure +"]";
}

function FLEval() {
}

FLEval.head = function(x) {
//	console.log("head(" + x + ")");
	try {
		while (true) {
			if (x instanceof FLClosure) {
	//			console.log("evaluating " + x.fn);
				if (x.hasOwnProperty('value'))
					return x.value;
				var clos = x;
				if (x.fn instanceof FLClosure)
				  x.fn = FLEval.head(x.fn);
				if (!x.fn || !x.fn.apply)
				  return x.fn;
				x = clos.value = x.fn.apply(x.obj, x.args);
	//			console.log("head saw " + x);
			} else if (typeof x === "function" && x.length == 0 && !x.iscurry) {
				x = x();
			} else
				break;
		}
	} catch (ex) {
		return new FLError(ex);
	}
	return x;
}

FLEval.full = function(x) {
	// head evaluate me
	x = FLEval.head(x);
//	console.log("full(" + x + ")");
	// fully evaluate all my props
	if (x !== null && typeof x === 'object' && x['_ctor']) {
//		console.log("ctor = " + x['_ctor']);
		for (var p in x) {
			if (p[0] !== '_' && x.hasOwnProperty(p)) {
//				console.log("fully evaluating " + p, x[p], x[p].constructor == Array);
				if (!x[p])
					continue;
				else if (x[p] instanceof Array) {
					var y = x[p];
					for (var i=0;i<y.length;i++) {
					    if (y[i] instanceof FLClosure)
					    	y[i] = FLEval.full(y[i]);
					}
				} else
					x[p] = FLEval.full(x[p]);
			}
		}
	}
	return x;
}

FLEval.closure = function() {
	var args = [];
	for (var i=1;i<arguments.length;i++)
		args[i-1] = arguments[i];
	return new FLClosure(null, arguments[0], args);
}

FLEval.oclosure = function() {
	var args = [];
	for (var i=2;i<arguments.length;i++)
		args[i-2] = arguments[i];
	return new FLClosure(arguments[0], arguments[1], args);
}

FLEval.field = function(from, fieldName) {
//	console.log("get field " + fieldName +" from ", from);
	from = FLEval.head(from);
	if (from === null || from === undefined)
		return null;
	return from[fieldName];
}

FLEval.method = function(obj, methodName) {
//	console.log("call method", methodName, "on", obj, "with", arguments.length-2, "arguments");
	var method = obj[methodName];
	var args = [];
	for (var i=2;i<arguments.length;i++)
		args[i-2] = arguments[i];
	return new FLClosure(obj, method, args);
}

FLEval.tuple = function() { // need to use arguments because it's varargs
  "use strict";
  return new _Tuple(arguments); // defined in builtin
}

FLEval.octor = function(obj, meth) {
  "use strict";
  var args = [];
  for (var i=2;i<arguments.length;i++)
	args[i-2] = arguments[i];
  return obj[meth].apply(obj, args);  
}

FLEval.flattenList = function(list) {
	list = FLEval.full(list);
	if (list instanceof Array)
		return list;
	var ret = [];
	while (list && list._ctor == 'Cons') {
		ret.push(list.head);
		list = list.tail;
	}
	return ret;
}

FLEval.isA = function(obj, type) {
	if (!obj) return false;
	if (obj._ctor === type) return true;
	if (obj._special === 'contract' && obj._contract === type) return true;
	return false;
}

FLEval.flattenMap = function(obj) {
	var ret = {};
	while (obj && obj._ctor === 'Assoc') {
		ret[obj.key] = obj.value;
		obj = obj.rest;
	}
	return ret;
}

// This may or may not be valuable
// The idea behind this is to try and track where something came from when we want to save it
FLEval.fromWireService = function(addr, obj) {
	var ret = FLEval.fromWire(obj);
	if (ret instanceof Object && ret._ctor)
		ret._fromService = addr;
	return ret;
}

// Something coming in off the wire must be one of the following things:
// A primitive (number, string, etc)
// An array of strings
// A flat-ish object (must have _ctor; fields must be primitives; references are via ID - go fetch)
// [Note: it may also be possible to pass 'handlers' and other specials in a similar way; but this doesn't happen in this direction YET]
// A crokeys definition
// A hash (from string to any of the above) 
// An array of (any of the above including hash)

FLEval.fromWire = function(obj, denyOthers) {
	"use strict"
	if (!(obj instanceof Object))
		return obj; // it's a primitive
	if (obj._ctor) {
		if (obj._ctor === 'Crokeys') { // an array of crokey hashes - map to a Crokeys object of Crokey objects
			return FLEval.makeCrokeys(obj.id, obj.keytype, obj.keys); 
		} else { // a flat-ish object
			var ret = { _ctor: obj._ctor };
			for (var x in obj) {
				if (x[0] === '_')
					continue;
				if (obj.hasOwnProperty(x) && obj[x] instanceof Object) {
					if (obj[x] instanceof Array) {
						// This is OK if they are all strings
						var tmp = Nil;
						var list = obj[x];
						for (var k=list.length-1;k>=0;k--) {
							var s = list[k];
							if (typeof s !== 'string')
								throw new Error("Field " + x + " is an array that should only contain strings, not " + s);
							tmp = Cons(s, tmp);
						}
						ret[x] = tmp;
					} else
						throw new Error("I claim " + x + " is in violation of the wire protocol: " + obj[x]);
				} else
					ret[x] = obj[x];
			}
			return obj;
		}
	}
	if (denyOthers)
		throw new Error("Wire protocol violation - nested complex objects at " + obj);
	if (obj instanceof Array) {
		var ret = Nil;
		for (var k=list.length-1;k>=0;k--)
			ret = Cons(FLEval.fromWire(obj[k], true), ret);
		return ret;
	} else {
		for (var k in obj)
			obj = FLEval.fromWire(obj[k]);
		return obj;
	}
}

FLEval.makeCrokeys = function(id, keytype, keys) {
	var ret = [];
	for (var i=0;i<keys.length;i++) {
		if (keytype === 'natural')
			ret.push(new NaturalCrokey(keys[i].key, keys[i].id));
		else
			ret.push(new Crokey(keys[i].key, keys[i].id));
	}
	
	return new Crokeys(id, keytype, ret);
}

FLEval.toWire = function(wrapper, obj, dontLoop) {
	"use strict"
	if (obj instanceof FLClosure)
		obj = FLEval.full(obj);
	if (!(obj instanceof Object))
		return obj; // a primitive
	if (obj instanceof Array)
		throw new Error("We should not have loose arrays internally");
	if (obj._ctor === 'Nil' || obj._ctor === 'Cons') {
		if (dontLoop)
			throw new Error("Found list in a field and don't know what to do");
		var ret = [];
		while (obj && obj._ctor === 'Cons') {
			ret.push(FLEval.toWire(wrapper, obj.head, true));
			obj = obj.tail;
		}
		return ret;
	}
	if (obj._ctor === 'Crokeys')
		throw new Error("Crokeys is special and we should handle it");
	if (obj._ctor === 'Assoc' || obj._ctor === 'NilMap') {
		if (dontLoop)
			throw new Error("Found map in a field and don't know what to do");
		var ret = {};
		while (obj && obj._ctor === 'Assoc') {
			var val = FLEval.toWire(wrapper, obj.value, true);
			ret[obj.key] = val;
			obj = obj.rest;
		}
		return ret;
	}
	if (obj._special)
		return wrapper.convertSpecial(obj);

	// pack a shallow copy
	var ret = {};
	for (var x in obj) {
		if (obj.hasOwnProperty(x)) {
		 	if (typeof x === 'string' && x[0] === '_' && x !== '_ctor')
		 		; // delete it
		 	else
				ret[x] = FLEval.toWire(wrapper, obj[x], true);
		}
	}
	return ret;
}		

// curry a function (which can include a previous curried function)
// args are:
//   the function - a javascript function
//   arity - the expected number of arguments (needs type checking)
//   args - the remaining (insufficient) arguments
FLEval.curry = function() {
	"use strict";
	var self = this;
	var actual = arguments[0];
	var arity = arguments[1];
	var have = [];
	for (var i=2;i<arguments.length;i++)
		have[i-2] = arguments[i];
	
	var ret = function() {
		// When we get called, "more" arguments will be provided.  This may or may not be enough.
		// Copy the "already have" arguments and the new arguments into a single array
		var current = [];
		for (var i=0;i<have.length;i++)
			current[i] = have[i];
		for (var i=0;i<arguments.length;i++)
			current[have.length+i] = arguments[i];

		// If it's enough, call the method, otherwise reapply "curry" to the new set of arguments
		if (current.length >= arity)
			return FLEval.full(actual).apply(self, current);
		else
			return FLEval.curry.call(
				self,
				actual,
				arity,
				current
			);
	};
	
	ret.iscurry = true;
	
	return ret;
}

FLEval.isInteger = function(x) {
	return (typeof(x) === 'number' && Math.floor(x) === x);
}

FLEval.plus = function(a, b) {
	a = FLEval.head(a);
	if (a instanceof FLError)
		return a;
	b = FLEval.head(b);
	if (b instanceof FLError)
		return b;
	if (typeof(a) === 'number' && typeof(b) === 'number')
		return a+b;
	else
		return FLEval.error("plus: case not handled");
}

FLEval.minus = function(a, b) {
	a = FLEval.head(a);
	if (a instanceof FLError)
		return a;
	b = FLEval.head(b);
	if (b instanceof FLError)
		return b;
	if (typeof(a) === 'number' && typeof(b) === 'number')
		return a-b;
	else
		return FLEval.error("plus: case not handled");
}

FLEval.mul = function(a, b) {
	a = FLEval.head(a);
	if (a instanceof FLError)
		return a;
	b = FLEval.head(b);
	if (b instanceof FLError)
		return b;
	if (typeof(a) === 'number' && typeof(b) === 'number')
		return a*b;
	else
		return FLEval.error("plus: case not handled");
}

FLEval.mathNE = function(a, b) {
	a = FLEval.head(a);
	if (a instanceof FLError)
		return a;
	b = FLEval.head(b);
	if (b instanceof FLError)
		return b;
	if (typeof(a) === 'number' && typeof(b) === 'number')
		return a != b;
	else
		return FLEval.error("!=: case not handled");
}

FLEval.mathMod = function(a, b) {
	a = FLEval.head(a);
	if (a instanceof FLError)
		return a;
	b = FLEval.head(b);
	if (b instanceof FLError)
		return b;
	if (FLEval.isInteger(a) && FLEval.isInteger(b))
		return a % b;
	else
		return FLEval.error("%: case not handled");
}

FLEval.compeq = function(a, b) {
	a = FLEval.full(a);
	b = FLEval.full(b);
	return a == b;
}

FLEval.error = function(s) {
	return new FLError(s);
}

FLEval.makeEvent = function(ev) {
	if (ev._ctor) // if it's already an event we created
		return ev;
	switch (ev.type) {
	case "change": {
		switch (ev.target.type) {
		case "select-one":
			var opt = ev.target.selectedOptions[0];
			return new org.flasck.ChangeEvent(ev.target.selectedIndex, opt.id, opt.value);
		default: {
			console.log("cannot handle", ev.type, "for", ev.target.type);
			break;
		}
		}
	}
	default:
//		console.log("cannot convert event", ev.type);
		break;
	}
	return null;
}

// should this be in Stdlib?

StdLib = {}
StdLib.concat = function(l) {
	var ret = "";
	while (true) {
		l = FLEval.head(l);
		if (l._ctor == 'Cons') {
			var head = FLEval.full(l.head);
			ret += head;
			l = l.tail;
		} else
			break;
	}
	return ret;
}

asString = function(any) {
	if (!any) return "";
	return any.toString();
}

append = function(s1, s2) {
	return FLEval.full(s1) + FLEval.full(s2);
}

join = function(l, isep) {
	var ret = "";
	var sep = "";
	while (true) {
		l = FLEval.head(l);
		if (l._ctor == 'Cons') {
			var head = FLEval.full(l.head);
			if (head) {
				ret += sep + head;
				sep = isep;
			}
			l = l.tail;
		} else
			break;
	}
	return ret;
}

FLEval;