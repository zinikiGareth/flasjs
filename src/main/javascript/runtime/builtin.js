const FLError = require('./error');
//--REQUIRE

/* istanbul ignore next */
const True = function() {
}

True.eval = function(_cxt) {
	return true;
}

/* istanbul ignore next */
const False = function() {
}

False.eval = function(_cxt) {
	return false;
}

/* istanbul ignore next */
const Tuple = function() {
}

Tuple.eval = function(_cxt, args) {
	const ret = new Tuple();
	ret.args = args;
	return ret;
}

/* istanbul ignore next */
const TypeOf = function(ty) {
	this.ty = ty;
}
TypeOf.eval = function(_cxt, expr) {
	expr = _cxt.full(expr);
	if (typeof(expr) == 'object')
	  	return new TypeOf(expr.constructor.name);
	else
		return new TypeOf(typeof(expr));
}
TypeOf.prototype._compare = function(_cxt, other) {
	if (other instanceof TypeOf) {
		return this.ty == other.ty;
	} else
		return false;
}
TypeOf.prototype.toString = function() {
	if (this.ty._typename) {
		return this.ty._typename;
	}
	switch (this.ty) {
	case 'number':
		return "Number";
	case 'string':
		return "String";
	case 'TypeOf':
		return 'Type';
	default:
		return this.ty;
	}
}

TypeOf.prototype._towire = function(wf) {
	wf.type = this.toString();
	wf._wireable = 'org.flasck.jvm.builtin.TypeOf';
}



/* istanbul ignore next */
const FLBuiltin = function() {
}

FLBuiltin.arr_length = function(_cxt, arr) {
	arr = _cxt.head(arr);
	if (!Array.isArray(arr))
		return _cxt.error("not an array");
	return arr.length;
}

FLBuiltin.arr_length.nfargs = function() { return 1; }

FLBuiltin.plus = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a+b;
}

FLBuiltin.plus.nfargs = function() { return 2; }

FLBuiltin.minus = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a-b;
}

FLBuiltin.minus.nfargs = function() { return 2; }

FLBuiltin.unaryMinus = function(_cxt, a) {
	a = _cxt.full(a);
	return -a;
}

FLBuiltin.unaryMinus.nfargs = function() { return 1; }

FLBuiltin.mul = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a*b;
}

FLBuiltin.mul.nfargs = function() { return 2; }

FLBuiltin.div = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a/b;
}

FLBuiltin.div.nfargs = function() { return 2; }

FLBuiltin.mod = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a%b;
}

FLBuiltin.mod.nfargs = function() { return 2; }

FLBuiltin.not = function(_cxt, a) {
	a = _cxt.full(a);
	return !a;
}

FLBuiltin.not.nfargs = function() { return 1; }

FLBuiltin.boolAnd = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return _cxt.isTruthy(a) && _cxt.isTruthy(b);
}

FLBuiltin.boolAnd.nfargs = function() { return 2; }

FLBuiltin.boolOr = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return _cxt.isTruthy(a) || _cxt.isTruthy(b);
}

FLBuiltin.boolOr.nfargs = function() { return 2; }

FLBuiltin.concat = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a + b;
}

FLBuiltin.concat.nfargs = function() { return 2; }

FLBuiltin.nth = function(_cxt, n, list) {
	n = _cxt.full(n);
	if (typeof(n) != 'number')
		return new FLError("no matching case");
	list = _cxt.spine(list);
	if (!Array.isArray(list))
		return new FLError("no matching case");
	if (n < 0 || n >= list.length)
		return new FLError("out of bounds");
	return list[n];
}

FLBuiltin.nth.nfargs = function() { return 2; }

FLBuiltin.item = function(_cxt, n, list) {
	n = _cxt.full(n);
	if (typeof(n) != 'number')
		return new FLError("no matching case");
	list = _cxt.spine(list);
	if (!Array.isArray(list))
		return new FLError("no matching case");
	if (n < 0 || n >= list.length)
		return new FLError("out of bounds");
	return new AssignItem(list, n);
}

FLBuiltin.item.nfargs = function() { return 2; }

FLBuiltin.append = function(_cxt, list, elt) {
	list = _cxt.spine(list);
	if (!Array.isArray(list))
		return new FLError("no matching case");
	var cp = list.slice(0);
	cp.push(elt);
	return cp;
}

FLBuiltin.append.nfargs = function() { return 2; }

FLBuiltin.replace = function(_cxt, list, n, elt) {
	n = _cxt.full(n);
	if (typeof(n) != 'number')
		return new FLError("no matching case");
	list = _cxt.spine(list);
	if (!Array.isArray(list))
		return new FLError("no matching case");
	if (n < 0 || n >= list.length)
		return new FLError("out of bounds");
	var cp = list.slice(0);
	cp[n] = elt;
	return cp;
}

FLBuiltin.replace.nfargs = function() { return 3; }

FLBuiltin.concatLists = function(_cxt, list) {
	list = _cxt.spine(list);
	var ret = [];
	for (var i=0;i<list.length;i++) {
		var li = _cxt.spine(list[i]);
		for (var j=0;j<li.length;j++) {
			ret.push(li[j]);
		}
	}
	return ret;
}
FLBuiltin.concatLists.nfargs = function() { return 1; }

FLBuiltin.take = function(_cxt, quant, list) {
	list = _cxt.spine(list);
	if (list instanceof FLError)
		return list;
	quant = _cxt.full(quant);
	if (quant instanceof FLError)
		return quant;
	if (typeof quant !== 'number')
		return new FLError("no matching case");
	if (list.length <= quant)
		return list;
	return list.slice(0, quant);
}
FLBuiltin.take.nfargs = function() { return 2; }

FLBuiltin.drop = function(_cxt, quant, list) {
	list = _cxt.spine(list);
	if (list instanceof FLError)
		return list;
	quant = _cxt.full(quant);
	if (quant instanceof FLError)
		return quant;
	if (typeof quant !== 'number')
		return new FLError("no matching case");
	return list.slice(quant);
}
FLBuiltin.drop.nfargs = function() { return 2; }

FLBuiltin.concatMany = function(_cxt, rest) {
	var ret = "";
	for (var i=0;i<rest.length;i++) {
		var tmp = _cxt.full(rest[i]);
		if (!tmp)
			continue;
		if (ret.length > 0)
			ret += " ";
		ret += tmp;
	}
	return ret;
}
FLBuiltin.concatMany.nfargs = function() { return 1; }

FLBuiltin.strlen = function(_cxt, str) {
	str = _cxt.head(str);
	if (typeof(str) != "string")
		return _cxt.error("not a string");
	return str.length;
}

FLBuiltin.strlen.nfargs = function() { return 1; }

FLBuiltin.isEqual = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return _cxt.compare(a,b);
}

FLBuiltin.isEqual.nfargs = function() { return 2; }

FLBuiltin.greaterEqual = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a>=b;
}

FLBuiltin.greaterEqual.nfargs = function() { return 2; }

FLBuiltin.greaterThan = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a>b;
}

FLBuiltin.greaterThan.nfargs = function() { return 2; }

FLBuiltin.lessEqual = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a<=b;
}

FLBuiltin.lessEqual.nfargs = function() { return 2; }

FLBuiltin.lessThan = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a<b;
}

FLBuiltin.lessThan.nfargs = function() { return 2; }

FLBuiltin._probe_state = function(_cxt, mock, v) {
	// mock should be a MockCard or MockAgent (or MockObject or something?)
	var sh = mock;
	if (mock instanceof FLError)
		return mock;
	else if (mock.card) {
		sh = mock.card;
		sh._updateFromInputs();
	} else if (mock.agent)
		sh = mock.agent;
	if (sh.state.dict[v] === undefined)
		return new FLError("No field '" + v + "' in probe_state");
	return sh.state.dict[v];
}

FLBuiltin._probe_state.nfargs = function() { return 2; }

FLBuiltin._underlying = function(_cxt, mock) {
	return mock._underlying(_cxt);
}

FLBuiltin._underlying.nfargs = function() { return 1; }

// Only allowed in unit tests
// Note that this "breaks" functional programming
// given a list of messages, dispatch each of them *JUST ONCE* - don't keep on evaluating
FLBuiltin.dispatch = function(_cxt, msgs) {
	msgs = _cxt.full(msgs);
	if (msgs instanceof FLError)
		return msgs;
	return _cxt.env.handleMessages(_cxt, msgs);
}
FLBuiltin.dispatch.nfargs = function() { return 1; }

FLBuiltin.show = function(_cxt, val) {
	val = _cxt.full(val);
	return _cxt.show(val);
}
FLBuiltin.show.nfargs = function() { return 1; }

FLBuiltin.expr = function(_cxt, val) {
	return _cxt.show(val);
}
FLBuiltin.expr.nfargs = function() { return 1; }

const MakeHash = function() {
}
MakeHash.eval = function(_cxt, args) {
	throw Error("should not be called - optimize away");
}

const HashPair = function() {
}
HashPair.eval = function(_cxt, args) {
	var ret = new HashPair();
	ret.m = args[0];
	ret.o = args[1];
	return ret;
}

FLBuiltin.hashPair = function(_cxt, key, value) {
	return HashPair.eval(_cxt, [key, value]);
}
FLBuiltin.hashPair.nfargs = function() { return 2; }

FLBuiltin.assoc = function(_cxt, hash, member) {
	hash = _cxt.spine(hash);
	member = _cxt.full(member);
	if (hash[member])
		return hash[member];
	else
		return new FLError("no member " + member);
}
FLBuiltin.assoc.nfargs = function() { return 2; }

FLBuiltin.parseUri = function(_cxt, s) {
	s = _cxt.full(s);
	if (s instanceof FLError)
		return s;
	else if (typeof(s) !== 'string')
		return new FLError("not a string");
	try {
		return new URL(s);
	} catch (e) {
		_cxt.log("error in parsing", s);
		return new FLError(e);
	}
}
FLBuiltin.parseUri.nfargs = function() { return 1; }

FLBuiltin.parseJson = function(_cxt, s) {
	s = _cxt.full(s);
	if (s instanceof FLError)
		return s;
	return JSON.parse(s);
}
FLBuiltin.parseJson.nfargs = function() { return 1; }

//--EXPORT
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
	module.exports = { False, True, FLBuiltin };
} else {
	window.FLBuiltin = FLBuiltin;
	window.True = True;
	window.False = False;
}