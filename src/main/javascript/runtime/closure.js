const FLError = require('./error');
const { ResponseWithMessages } = require('./messages');
//--REQUIRE

const FLClosure = function(obj, fn, args) {
	/* istanbul ignore if */
	if (!fn)
		throw new Error("must define a function");
	this.obj = obj;
	this.fn = fn;
	args.splice(0,0, null);
	this.args = args;
}

FLClosure.prototype.splitRWM = function(msgsTo) {
	this.msgsTo = msgsTo;
}

FLClosure.prototype.eval = function(_cxt) {
	if (this.val)
		return this.val;
	this.args[0] = _cxt;
	this.obj = _cxt.full(this.obj);
	if (this.obj instanceof FLError)
		return this.obj;
	if (this.fn instanceof FLError)
		return this.fn;
	var cnt = this.fn.nfargs();
	this.val = this.fn.apply(this.obj, this.args.slice(0, cnt+1)); // +1 for cxt
	if (typeof(this.msgsTo) !== 'undefined') {
		if (this.val instanceof ResponseWithMessages) {
			_cxt.addAll(this.msgsTo, ResponseWithMessages.messages(_cxt, this.val));
			this.val = ResponseWithMessages.response(_cxt, this.val);
		} else if (this.val instanceof FLClosure) {
			this.val.splitRWM(this.msgsTo);
		}
	}
	// handle the case where there are arguments left over
	if (cnt+1 < this.args.length) {
		this.val = new FLClosure(this.obj, this.val, this.args.slice(cnt+1));
	}
	return this.val;
}

FLClosure.prototype.apply = function(_, args) {
	const asfn = this.eval(args[0]);
	return asfn.apply(null, args);
}

FLClosure.prototype.nfargs = function() { return 0; }

FLClosure.prototype.toString = function() {
	return "FLClosure[]";
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined') {
	module.exports = FLClosure;
} else {
	window.FLClosure = FLClosure;
}
