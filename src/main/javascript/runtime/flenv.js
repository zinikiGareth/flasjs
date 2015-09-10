function FLError(s) {
	this.message = s;
	console.log("FLAS Error encountered:", s);
}

FLError.prototype.toString = function() {
	return "ERROR: " + this.message;
}

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
		while (x instanceof FLClosure) {
	//		console.log("evaluating " + x.fn);
			if (x.fn instanceof FLClosure)
			  x.fn = FLEval.head(x.fn);
			if (!x.fn || !x.fn.apply)
			  return x.fn;
			x = x.fn.apply(x.obj, x.args);
	//		console.log("head saw " + x);
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
	if (typeof x === 'object' && x['_ctor']) {
//		console.log("ctor = " + x['_ctor']);
		for (var p in x) {
			if (p !== '_ctor' && x.hasOwnProperty(p)) {
//				console.log("fully evaluating " + p, x[p], x[p].constructor == Array);
				if (!x[p])
					continue;
				else if (x[p] instanceof FLClosure)
					x[p] = FLEval.full(x[p]);
				else if (x[p].constructor == Array) {
					var y = x[p];
					for (var i=0;i<y.length;i++) {
					    if (y[i] instanceof FLClosure)
					    	y[i] = FLEval.full(y[i]);
					}
				}
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
	return from[fieldName];
}

FLEval.tuple = function() { // need to use arguments because it's varargs
	return new _Tuple(arguments); // defined in builtin
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

// This may or may not be valuable
// The idea behind this is to try and track where something came from when we want to save it
FLEval.fromWireService = function(service, obj) {
	var ret = FLEval.fromWire(obj);
	if (ret instanceof Object && ret._ctor)
		ret._fromService = service;
	return ret;
}

// Something coming in off the wire must be one of the following things:
// A primitive (number, string, etc)
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
			return FLEval.makeCrokeys(obj.keys); 
		} else { // a flat-ish object
			for (var x in obj)
				if (obj.hasOwnProperty(x) && obj instanceof Object)
					throw new Error("I claim " + x + " is in violation of the wire protocol: " + obj[x]);
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

FLEval.makeCrokeys = function(keys) {
	var ret = [];
	for (var i=0;i<keys.length;i++)
		ret.push(new Crokey(keys[i].key, keys[i].id));
	
	return new Crokeys(ret);
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
	
	return function() {
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
		console.log("cannot convert event", ev.type);
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