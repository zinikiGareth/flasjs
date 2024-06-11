const FLCurry = function(obj, fn, reqd, xcs) {
	if (fn == null)
		throw Error("fn cannot be null");
	this.obj = obj;
	this.fn = fn;
	this.xcs = xcs;
	this.reqd = reqd;
	this.missing = [];
	for (var i=1;i<=reqd;i++) {
		if (!(i in xcs))
			this.missing.push(i);
	}
}

FLCurry.prototype.apply = function(_, args) {
	var _cxt = args[0];
	if (args.length == 1)
		return this; // nothing actually applied
	if (args.length-1 == this.missing.length) {
		var as = [_cxt];
		var from = 1;
		for (var i=1;i<=this.reqd;i++) {
			if (i in this.xcs)
				as[i] = this.xcs[i];
			else
				as[i] = args[from++];
		}
		var obj = _cxt.full(this.obj);
		return this.fn.apply(obj, as);
	} else {
		var miss = this.missing.slice(0);
		var xcs = {};
		for (var i in this.xcs)
			xcs[i] = this.xcs[i];
		for (var i=1;i<args.length;i++) {
			var m = miss.pop();
			xcs[m] = args[i];
		}
		return new FLCurry(this.obj, this.fn, this.reqd, xcs);
	}
}

FLCurry.prototype.nfargs = function() {
	return this.missing.length;
}

FLCurry.prototype.toString = function() {
	return "FLCurry[" + this.missing.length + "]";
}

export { FLCurry };