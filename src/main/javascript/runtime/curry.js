const FLCurry = function(reqd, fn, args) {
	this.fn = fn;
	this.reqd = reqd;
	args.splice(0,0, null);
	this.args = args;
}

FLCurry.prototype.apply = function(_, args) {
	this.args[0] = args[0];
	for (var i=1;i<args.length;i++) {
		this.args.push(args[i]);
	}
	if (this.args.length == this.reqd+1) { // because we have the context
		return this.fn.apply(null, this.args);
	} else {
		return this;
	}
}

FLCurry.prototype.toString = function() {
	return "FLCurry[" + this.reqd + "]";
}

//--EXPORT
if (typeof(module) !== 'undefined') {
	module.exports = FLCurry;
} else {
	window.FLCurry = FLCurry;
}