const FLClosure = function(obj, fn, args) {
	this.obj = obj;
	this.fn = fn;
	args.splice(0,0, null);
	this.args = args;
}

FLClosure.prototype.eval = function(_cxt) {
	this.args[0] = _cxt;
	this.obj = _cxt.full(this.obj);
	this.val = this.fn.apply(this.obj, this.args);
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
