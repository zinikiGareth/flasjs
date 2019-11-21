const FLClosure = require('./closure');
const FLCurry = require('./curry');
const FLMakeSend = require('./makesend');
//--REQUIRE

const FLContext = function(env) {
}

FLContext.prototype.closure = function(fn, ...args) {
	return new FLClosure(null, fn, args);
}

FLContext.prototype.oclosure = function(fn, obj, ...args) {
	return new FLClosure(obj, fn, args);
}

FLContext.prototype.curry = function(reqd, fn, ...args) {
	var xcs = {};
	for (var i=0;i<args.length;i++) {
		xcs[i+1] = args[i];
	}
	return new FLCurry(null, fn, reqd, xcs);
}

FLContext.prototype.xcurry = function(reqd, ...args) {
	var fn;
	var xcs = {};
	for (var i=0;i<args.length;i+=2) {
		if (args[i] == 0)
			fn = args[i+1];
		else
			xcs[args[i]] = args[i+1];
	}
	return new FLCurry(null, fn, reqd, xcs);
}

FLContext.prototype.array = function(...args) {
	return args;
}

FLContext.prototype.mksend = function(meth, obj, cnt) {
	if (cnt == 0)
		return Send.eval(this, obj, meth, []);
	else
		return new FLMakeSend(meth, obj, cnt);
}

FLContext.prototype.mkacor = function(meth, obj, cnt) {
	if (cnt == 0)
		return new FLClosure(obj, meth, []);
	else
		return new FLCurry(obj, meth, cnt, {});
}

FLContext.prototype.head = function(obj) {
	if (obj instanceof FLClosure)
		obj = obj.eval(this);
	return obj;
}

FLContext.prototype.full = function(obj) {
	while (obj instanceof FLClosure)
		obj = obj.eval(this);
	return obj;
}

FLContext.prototype.isTruthy = function(val) {
	val = this.full(val);
	return !!val;
}

FLContext.prototype.isA = function(val, ty) {
	if (val instanceof Object && 'areYouA' in val) {
		return val.areYouA(ty);
	}
	switch (ty) {
	case 'True':
		return val === true;
	case 'False':
		return val === false;
	case 'Number':
		return typeof(val) == 'number';
	case 'String':
		return typeof(val) == 'string';
	case 'Nil':
		return Array.isArray(val) && val.length == 0;
	case 'Cons':
		return Array.isArray(val) && val.length > 0;
	default:
		return false;
	}
}

FLContext.prototype.compare = function(left, right) {
	if (typeof(left) === 'number' || typeof(left) === 'string') {
		return left === right;
	} else if (Array.isArray(left) && Array.isArray(right)) {
		// not good enough
		return left.length === right.length;
	} else if (left instanceof _FLError && right instanceof _FLError) {
		return left.message === right.message;
	} else if (left._compare) {
		return left._compare(this, right);
	} else if (left.state && right.state && left.state instanceof FieldsContainer && right.state instanceof FieldsContainer) {
		return left.state._compare(this, right.state);
	} else
		return left == right;
}

FLContext.prototype.field = function(obj, field) {
	obj = this.full(obj);
	if (field == "head" && Array.isArray(obj) && obj.length > 0)
		return obj[0];
	else if (field == "tail" && Array.isArray(obj) && obj.length > 0)
		return obj.slice(1);
	else {
// TODO: this probably involves backing documents ...
		return obj[field];
	}
}

FLContext.prototype.mockContract = function(contract) {
	return new MockContract(contract);
}

//--EXPORT
if (typeof(module) !== 'undefined')
	module.exports = FLContext;
else
	window.FLContext = FLContext;