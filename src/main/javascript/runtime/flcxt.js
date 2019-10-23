if (typeof(require) !== 'undefined') {
	const FLClosure = require('./closure');
	const FLCurry = require('./curry');
}

var FLContext = function(env) {
}

FLContext.prototype.closure = function(fn, ...args) {
	return new FLClosure(fn, args);
}

FLContext.prototype.curry = function(fn, reqd, ...args) {
	return new FLCurry(fn, reqd, args);
}

FLContext.prototype.array = function(...args) {
	return args;
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

FLContext.prototype.isA = function(val, ty) {
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
	} else
		return false;
}

FLContext.prototype.field = function(obj, field) {
// TODO: this probably involves backing documents ...
	obj = this.full(obj);
	if (field == "head" && Array.isArray(obj) && obj.length > 0)
		return obj[0];
	else if (field == "tail" && Array.isArray(obj) && obj.length > 0)
		throw new Error("implement field(tail)");
	else
		return obj[field];
}

if (typeof(module) !== 'undefined')
	module.exports = FLContext;
else
	window.FLContext = FLContext;