import { FLError } from './error.js';
import { FLCurry } from './curry.js';
import { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay } from './messages.js';

var closNum = 1;
const FLClosure = function(obj, fn, args) {
	/* istanbul ignore if */
	if (!fn)
		throw new Error("must define a function");
	this.label = "Clos#" + (++closNum);
	this.obj = obj;
	this.fn = fn;
	args.splice(0,0, null);
	this.args = args;
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
	if (this.args.length < cnt+1) {
		var xcs = {};
		for (var i=1;i<this.args.length;i++) {
			xcs[i] = this.args[i];
		}
		return new FLCurry(this.obj, this.fn, cnt, xcs);
	}
	this.val = this.fn.apply(this.obj, this.args.slice(0, cnt+1)); // +1 for cxt
	var ret = this.val;
	if (this.val instanceof ResponseWithMessages) {
		this.val = ResponseWithMessages.response(_cxt, this.val);
	}
	// handle the case where there are arguments left over
	if (cnt+1 < this.args.length) {
		ret = this.val = new FLClosure(this.obj, this.val, this.args.slice(cnt+1));
	}
	return ret;
}

FLClosure.prototype.apply = function(_, args) {
	const asfn = this.eval(args[0]);
	if (asfn instanceof FLError)
		return asfn;
	return asfn.apply(null, args);
}

FLClosure.prototype.nfargs = function() { return 0; }

FLClosure.prototype.toString = function() {
	return "FLClosure[]";
}

export { FLClosure };
