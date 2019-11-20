const FLCurry = function(obj, fn, reqd, xcs) {
	this.obj = obj;
	this.fn = fn;
	this.args = [null];
	this.reqd = reqd;
	this.missing = [];
	for (var i=1;i<=reqd;i++) {
		if (xcs[i])
			this.args.push(xcs[i]);
		else {
			this.args.push(null);
			this.missing.push(i);
		}
	}
}

// TODO: I think this trashes the current curry; instead it should do things locally and create a new curry if needed.
FLCurry.prototype.apply = function(_, args) {
	this.args[0] = args[0];
	for (var i=1;i<args.length;i++) {
		var m = this.missing.pop();
		this.args[m] = args[i];
	}
	if (this.missing.length == 0) {
		return this.fn.apply(this.obj, this.args);
	} else {
		return this;
	}
}

FLCurry.prototype.nfargs = function() {
	return this.reqd;
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