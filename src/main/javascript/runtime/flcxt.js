if (require) {
	const FLClosure = require('./closure');
}

var FLContext = function(env) {
}

FLContext.prototype.closure = function(fn, ...args) {
	return new FLClosure(fn, args);
}

FLContext.prototype.head = function(obj) {
	if (obj instanceof FLClosure)
		obj = obj.eval();
	return obj;
}

FLContext.prototype.full = function(obj) {
	return obj;
}

if (module)
	module.exports = FLContext;
else
	window.FLContext = FLContext;