const FLClosure = function(fn, args) {
	this.fn = fn;
	args.splice(0,0, null);
	this.args = args;
}

FLClosure.prototype.eval = function(_cxt) {
	this.args[0] = _cxt;
	this.val = this.fn.apply(null, this.args);
	return this.val;
}

FLClosure.prototype.apply = function(_, args) {
	const asfn = this.eval(args[0]);
	return asfn.apply(null, args);
}

FLClosure.prototype.toString = function() {
	return "FLClosure[]";
}

//--EXPORT
if (typeof(module) !== 'undefined') {
	module.exports = FLClosure;
} else {
	window.FLClosure = FLClosure;
}
