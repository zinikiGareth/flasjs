const { Send } = require('./messages');
//--REQUIRE

const FLMakeSend = function(meth, obj, nargs, handler, subscriptionName) {
	this.meth = meth;
	this.obj = obj;
	this.nargs = nargs;
	this.current = [];
	this.handler = handler;
	this.subscriptionName = subscriptionName;
}

FLMakeSend.prototype.apply = function(obj, args) {
	var cx = args[0];
	var all = this.current.slice();
	for (var i=1;i<args.length;i++)
		all.push(args[i]);
	if (all.length == this.nargs) {
		return Send.eval(cx, this.obj, this.meth, all, this.handler, this.subscriptionName);
	} else {
		var ret = new FLMakeSend(this.meth, this.obj, this.nargs, this.handler, this.subscriptionName);
		ret.current = all;
		return ret;
	}
}

FLMakeSend.prototype.nfargs = function() { return this.nargs; }

FLMakeSend.prototype.toString = function() {
	return "MakeSend[" + this.nargs + "]";
}

//--EXPORT
/* istanbul ignore next */
if (typeof(module) !== 'undefined') {
	module.exports = FLMakeSend;
} else {
	window.FLMakeSend = FLMakeSend;
}