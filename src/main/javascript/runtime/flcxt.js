if (typeof(require) !== 'undefined') {
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
	if (obj instanceof FLClosure)
		obj = obj.eval();
	return obj;
}

if (typeof(module) !== 'undefined')
	module.exports = FLContext;
else
	window.FLContext = FLContext;