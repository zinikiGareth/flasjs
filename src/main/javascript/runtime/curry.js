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
	var _cxt = args[0];
	this.args[0] = _cxt;
	var miss = this.missing.slice(0);
	var as = this.args.slice(0);
	for (var i=1;i<args.length;i++) {
		var m = miss.pop();
		as[m] = args[i];
	}
	if (miss.length == 0) {
		var obj = _cxt.full(this.obj);
		return this.fn.apply(obj, as);
	} else {
		return new FLCurry(this.obj, this.fn, this.reqd, as);
	}
}

FLCurry.prototype.nfargs = function() {
	return this.reqd;
}

FLCurry.prototype.toString = function() {
	return "FLCurry[" + this.reqd + "]";
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined') {
	module.exports = FLCurry;
} else {
	window.FLCurry = FLCurry;
}