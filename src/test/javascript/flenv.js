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

FLEval.inflate = function(list) {
	list = FLEval.head(list);
	if (list instanceof Array) {
		var ret = Nil;
		for (var k=list.length-1;k>=0;k--)
			ret = Cons(FLEval.inflate(list[k]), ret);
		return ret;
	} else if (list instanceof Object) {
		if (!list._ctor && list.id) {
			if (list.key) // probably this case should already be handled
				return { _ctor: 'org.ziniki.Crokey', key: list.key, id: list.id };
			// TODO: really only if it JUST has "id"
			return { _ctor: 'org.ziniki.ID', id: list.id };
		}
		for (var k in list) {
			var obj = list[k];
			list[k] = FLEval.inflate(obj);
		}
//		console.log("may want to inflate obj if it has some identifying marks", list);
		return list;
	} else {
//		console.log("just returning", list);
		return list;
	}
}

FLEval.deflate = function(wrapper, obj) {
	"use strict"
	if (obj instanceof FLClosure)
		obj = FLEval.full(obj);
	if (obj._ctor === 'Nil' || obj._ctor === 'Cons') {
		return FLEval.deflate(wrapper, FLEval.flattenList(obj));
	} else if (obj instanceof Array) {
		var ret = [];
		for (var i=0;i<obj.length;i++)
			ret[i] = FLEval.deflate(wrapper, obj[i]);
		return ret;
	} else if (typeof obj == 'object') {
		if (obj._special) {
			return wrapper.convertSpecial(obj);
		} else {
			var ret = {};
			for (var x in obj) {
				if (obj.hasOwnProperty(x))
					ret[x] = FLEval.deflate(postbox, obj[x]);
			}
			return ret;
		}
	} else
		return obj; // presumably something simple
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