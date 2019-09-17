FLClosure = function(fn, args) {
	this.fn = fn;
	this.args = args;
}

FLClosure.prototype.eval = function() {
	this.val = this.fn(this.args);
	return this.val;
}

FLClosure.prototype.toString = function() {
	return "FLClosure[]";
}
